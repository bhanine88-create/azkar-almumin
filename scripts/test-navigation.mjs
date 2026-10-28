#!/usr/bin/env node
/**
 * Browser regression checks against the actual production bundle.
 * Build first: npm run build:web
 * Run: node scripts/test-navigation.mjs
 *
 * Uses the existing CDP helper and Node 22, with an isolated Chrome profile.
 * Screenshots and a JSON report are written under ignored .ai_temp_scripts/.
 * Native Android Back/exit still requires the APK/emulator check; this suite
 * deliberately exercises the real web UI without replacing Capacitor plugins.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CDP, launchChrome, serveDirs, sleep, waitForDebugger } from './lib/cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const RUN = new Date().toISOString().replace(/[:.]/g, '-');
const OUT = path.join(ROOT, '.ai_temp_scripts', 'navigation-tests', RUN);
const WIDTHS = [320, 360, 412, 768];
const ROUTES = ['/', '/adhkar', '/adhkar/morning', '/quran', '/settings', '/duas', '/quran/1'];
const results = [];
const exceptions = [];
let activeCase = 'startup';
let cdp;
let chrome;
let server;

async function freePort() {
  const reservation = createServer();
  await new Promise((resolve, reject) => {
    reservation.once('error', reject);
    reservation.listen(0, '127.0.0.1', resolve);
  });
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  return port;
}

async function waitFor(predicate, description, timeout = 45000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await cdp.evaluate(predicate)) return;
    } catch (error) {
      // Document replacement invalidates the old execution context briefly.
      lastError = error.message;
    }
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError}` : ''}`);
}

async function ready(route) {
  await waitFor(`(() => {
    const main = document.querySelector('main');
    return location.hash.split('?')[0] === ${JSON.stringify(`#${route}`)} &&
      main && main.querySelector('h1,h2,h3') && main.innerText.trim().length > 20 &&
      !document.documentElement.hasAttribute('data-booting') &&
      !document.getElementById('boot-splash');
  })()`, `rendered content for ${route}`);
  await cdp.evaluate('document.fonts.ready.then(() => true)');
  await sleep(500); // Allow route/header entrance transitions to finish.
}

async function coldOpen(baseUrl, route) {
  await cdp.send('Page.navigate', { url: 'about:blank' });
  await waitFor('location.href === "about:blank"', 'a fresh document');
  await cdp.send('Page.navigate', { url: `${baseUrl}/#${route}` });
  await ready(route);
}

async function layoutSnapshot() {
  return cdp.evaluate(`(() => {
    const main = document.querySelector('main');
    const nav = document.getElementById('bottom-nav');
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    return {
      route: location.hash, title: main.querySelector('h1,h2,h3')?.innerText,
      viewport: { width: innerWidth, height: innerHeight },
      navCount: document.querySelectorAll('#bottom-nav').length,
      nav: nav && rect(nav), main: rect(main),
      paddingBottom: parseFloat(getComputedStyle(main).paddingBottom),
      mainClientWidth: main.clientWidth, mainScrollWidth: main.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      text: main.innerText.slice(0, 180)
    };
  })()`);
}

function assertLayout(snapshot, route) {
  assert.equal(snapshot.navCount, route === '/' ? 1 : 0, `${route}: navigation must appear only at home`);
  assert(snapshot.main.width > 0 && snapshot.main.height > 100, `${route}: main content must have usable space`);
  assert(snapshot.main.left >= -1 && snapshot.main.right <= snapshot.viewport.width + 1, `${route}: content outside viewport`);
  assert(snapshot.main.bottom <= snapshot.viewport.height + 1, `${route}: content extends below viewport`);
  assert(snapshot.documentScrollWidth <= snapshot.documentClientWidth + 1, `${route}: document horizontal overflow`);
  assert(snapshot.bodyScrollWidth <= snapshot.documentClientWidth + 1, `${route}: body horizontal overflow`);
  assert(snapshot.mainScrollWidth <= snapshot.mainClientWidth + 1, `${route}: main horizontal overflow`);
  if (route === '/') {
    assert(snapshot.nav.height > 20, 'Home navigation must be visibly rendered');
    assert(snapshot.main.bottom <= snapshot.nav.top + 1, 'Home content must not overlap navigation');
  } else {
    assert(snapshot.paddingBottom >= 16, `${route}: missing minimum bottom padding`);
  }
  assert(!/حدث خطأ في هذا القسم|تعذر تحميل بعض المحتويات/.test(snapshot.text), `${route}: error boundary rendered`);
}

// Scroll actual containers, including full-height pages that own their scroller.
// Repeating lets the existing progressive-list observer append its remaining rows.
async function reachFinalContent(route) {
  await cdp.evaluate(`(async () => {
    for (let pass = 0; pass < 8; pass++) {
      const candidates = [document.querySelector('main'), ...document.querySelectorAll('main *')];
      for (const element of candidates) {
        if (/auto|scroll/.test(getComputedStyle(element).overflowY)) element.scrollTop = element.scrollHeight;
      }
      await new Promise(resolve => setTimeout(resolve, 120));
    }
    const selector = ${JSON.stringify(route === '/settings' ? 'main button[aria-label]' : 'main button,main a,main p')};
    const candidates = [...document.querySelectorAll(selector)].filter(element => {
      const r = element.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(element).visibility !== 'hidden';
    });
    const target = candidates.at(-1);
    if (!target) throw new Error('No final content target');
    target.setAttribute('data-navigation-test-target', 'true');
    target.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'instant' });
  })()`);
  await sleep(200);
  const result = await cdp.evaluate(`(() => {
    const target = document.querySelector('[data-navigation-test-target]');
    const r = target.getBoundingClientRect();
    let top = 0, bottom = innerHeight, left = 0, right = innerWidth;
    for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor), a = ancestor.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(style.overflowY)) {
        top = Math.max(top, a.top); bottom = Math.min(bottom, a.bottom);
      }
      if (/hidden|clip|auto|scroll/.test(style.overflowX)) {
        left = Math.max(left, a.left); right = Math.min(right, a.right);
      }
    }
    const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
    const hit = document.elementFromPoint(x, y);
    const result = {
      label: target.getAttribute('aria-label') || target.innerText.slice(0, 100),
      top: r.top, bottom: r.bottom, left: r.left, right: r.right,
      clip: { top, bottom, left, right },
      fullyVisible: r.top >= top - 1 && r.bottom <= bottom + 1 && r.left >= left - 1 && r.right <= right + 1,
      unobstructed: !!hit && (target.contains(hit) || hit.contains(target))
    };
    target.removeAttribute('data-navigation-test-target');
    return result;
  })()`);
  assert(result.fullyVisible, `${route}: final content is clipped: ${JSON.stringify(result)}`);
  assert(result.unobstructed, `${route}: final content is covered: ${JSON.stringify(result)}`);
  return result;
}

async function checkAdhkarSettings(width) {
  await cdp.evaluate(`document.querySelector('button[aria-haspopup="menu"]').click()`);
  await waitFor(`!!document.querySelector('[role="menu"]')`, 'Adhkar tools menu');
  await sleep(400);
  const menu = await cdp.evaluate(`(() => {
    const r = document.querySelector('[role="menu"]').getBoundingClientRect();
    return { left: r.left, right: r.right, bottom: r.bottom, width: innerWidth, height: innerHeight,
      items: document.querySelectorAll('[role="menuitem"]').length };
  })()`);
  assert.equal(menu.items, 4, 'Adhkar tools menu must offer four actions');
  assert(menu.left >= 0 && menu.right <= menu.width && menu.bottom <= menu.height, 'Adhkar tools menu must fit the screen');
  await cdp.evaluate(`[...document.querySelectorAll('[role="menuitem"]')].find(b => b.textContent.includes('إعدادات الأذكار الشاملة')).click()`);
  await waitFor(`Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('تخصيص مظهر الأذكار'))`, 'Adhkar settings panel');
  await sleep(700);
  const panel = await cdp.evaluate(`(() => {
    const heading = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('تخصيص مظهر الأذكار'));
    const panel = heading.parentElement.parentElement;
    const scroller = [...panel.querySelectorAll('div')].find(e => getComputedStyle(e).overflowY === 'auto');
    scroller.scrollTop = scroller.scrollHeight;
    const save = [...panel.querySelectorAll('button')].find(b => b.textContent.includes('حفظ وإغلاق'));
    const r = save.getBoundingClientRect();
    const hit = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
    return {
      navCount: document.querySelectorAll('#bottom-nav').length,
      panelBottom: panel.getBoundingClientRect().bottom,
      saveBottom: r.bottom, saveTop: r.top, height: innerHeight,
      finalSettingsVisible: !!panel.querySelector('#particles-toggle-chk') &&
        panel.querySelector('#particles-toggle-chk').parentElement.getBoundingClientRect().bottom <= scroller.getBoundingClientRect().bottom + 1,
      saveUnobstructed: !!hit && (save.contains(hit) || hit.contains(save))
    };
  })()`);
  assert.equal(panel.navCount, 0, 'Adhkar settings must not be covered by navigation');
  assert(panel.saveTop >= 0 && panel.saveBottom <= panel.height + 1, 'Save/close button must remain in viewport');
  assert(panel.saveUnobstructed, 'Save/close button must be reachable');
  assert(panel.finalSettingsVisible, 'Last Adhkar settings control must be reachable');
  await cdp.screenshotTo(path.join(OUT, `${width}-adhkar-settings.png`));
  await cdp.evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('حفظ وإغلاق')).click()`);
  await waitFor(`!Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('تخصيص مظهر الأذكار'))`, 'settings panel dismissal');
  return panel;
}

async function returnHome() {
  const visited = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const route = await cdp.evaluate('location.hash');
    visited.push(route);
    if (route === '#/') {
      await ready('/');
      assertLayout(await layoutSnapshot(), '/');
      return visited;
    }
    const clicked = await cdp.evaluate(`(() => {
      const buttons = [...document.querySelectorAll('main button')];
      const back = buttons.find(button => button.querySelector('svg.lucide-chevron-right'));
      if (!back) return false;
      back.scrollIntoView({ block: 'center', behavior: 'instant' });
      back.click(); return true;
    })()`);
    assert(clicked, `No visible section Back button on ${route}`);
    await waitFor(`location.hash !== ${JSON.stringify(route)} || [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'تأكيد الخروج')`, `Back navigation from ${route}`);
    // The existing Adhkar UI asks to confirm leaving after two seconds. Keep
    // that approved behavior and confirm it through its ordinary button.
    await cdp.evaluate(`(() => {
      const confirmation = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'تأكيد الخروج');
      confirmation?.click();
    })()`);
    await waitFor(`location.hash !== ${JSON.stringify(route)}`, `confirmed Back navigation from ${route}`);
    await sleep(500);
  }
  throw new Error(`Back did not restore home: ${visited.join(' -> ')}`);
}

try {
  assert(existsSync(path.join(DIST, 'index.html')), 'Missing dist/index.html. Build first with npm run build:web.');
  mkdirSync(OUT, { recursive: true });
  server = await serveDirs([DIST], 0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const debugPort = await freePort();
  chrome = launchChrome(path.join(OUT, 'chrome-profile'), debugPort);
  await waitForDebugger(debugPort);
  cdp = await CDP.attach(debugPort);
  cdp.socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push({ case: activeCase, text: message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text });
    }
  });
  await cdp.send('Network.enable');
  await cdp.send('Network.setBypassServiceWorker', { bypass: true });
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  for (const width of WIDTHS) {
    await cdp.setViewport({ width, height: width >= 768 ? 1024 : 800, deviceScaleFactor: 1, mobile: true });
    for (const route of ROUTES) {
      activeCase = `${width}px ${route}`;
      await coldOpen(baseUrl, route);
      const snapshot = await layoutSnapshot();
      assertLayout(snapshot, route);
      const result = { width, route, snapshot };
      if (route !== '/' && route !== '/quran/1') result.finalContent = await reachFinalContent(route);
      if (route === '/adhkar/morning') result.settings = await checkAdhkarSettings(width);
      if (route !== '/') result.backPath = await returnHome();
      results.push(result);
      console.log(`PASS ${activeCase}: ${route === '/' ? 'navigation visible' : 'navigation hidden, padding, content, home restored'}`);
    }

    // Traverse the real nav link and browser history without a document reload.
    activeCase = `${width}px home link/history`;
    await cdp.evaluate(`document.querySelector('#bottom-nav a[href="#/adhkar"]').click()`);
    await ready('/adhkar');
    assertLayout(await layoutSnapshot(), '/adhkar');
    await cdp.evaluate('history.back()');
    await ready('/');
    assertLayout(await layoutSnapshot(), '/');
    await cdp.screenshotTo(path.join(OUT, `${width}-home.png`));
    results.push({ width, route: 'home link/history', passed: true });

    // A synthetic safe inset verifies layout response independently of desktop
    // Chrome's zero env(safe-area-inset-bottom); it does not emulate native bars.
    await coldOpen(baseUrl, '/settings');
    const before = await layoutSnapshot();
    await cdp.evaluate(`document.documentElement.style.setProperty('--safe-area-bottom', '24px')`);
    const after = await layoutSnapshot();
    assert(after.paddingBottom >= before.paddingBottom + 23, 'Section padding must include the safe bottom inset');
    assertLayout(after, '/settings');
    const finalContent = await reachFinalContent('/settings');
    await cdp.screenshotTo(path.join(OUT, `${width}-settings-safe-bottom.png`));
    await cdp.evaluate(`document.documentElement.style.removeProperty('--safe-area-bottom')`);
    results.push({ width, route: 'settings safe inset', before: before.paddingBottom, after: after.paddingBottom, finalContent });
    console.log(`PASS ${width}px navigation/history and safe bottom inset`);
  }
  assert.equal(exceptions.length, 0, `Uncaught browser exceptions: ${JSON.stringify(exceptions)}`);
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ status: 'passed', results, exceptions }, null, 2));
  console.log(`Passed ${results.length} runtime scenarios. Evidence: ${OUT}`);
} catch (error) {
  mkdirSync(OUT, { recursive: true });
  let snapshot;
  try { snapshot = await layoutSnapshot(); } catch { /* No rendered page yet. */ }
  try { await cdp?.screenshotTo(path.join(OUT, 'failure.png')); } catch { /* Browser may have closed. */ }
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ status: 'failed', activeCase, error: error.stack, snapshot, results, exceptions }, null, 2));
  console.error(`FAIL ${activeCase}: ${error.message}\nEvidence: ${OUT}`);
  process.exitCode = 1;
} finally {
  if (cdp) {
    try { await Promise.race([cdp.send('Browser.close'), sleep(1500)]); } catch { /* Already closed. */ }
    cdp.socket.close();
  }
  chrome?.kill();
  server?.closeAllConnections();
  if (server) await new Promise(resolve => server.close(resolve));
}
