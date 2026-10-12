#!/usr/bin/env node
/**
 * Native Android navigation regression checks (Node 22+).
 *
 * Build and install the isolated debug APK first, then run:
 *   node scripts/test-navigation-android.mjs
 * Optional serial: node scripts/test-navigation-android.mjs emulator-5580
 *
 * Uses actual WebView UI clicks and Android KEYCODE_BACK, never a mocked App
 * plugin. Only com.azkar.almumin.debug is started/stopped. Existing app data,
 * settings, downloaded files, release installs, and device logs are preserved.
 * Evidence is written under ignored .ai_temp_scripts/android-navigation-tests/.
 */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { CDP, sleep } from './lib/cdp.mjs';

const exec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'com.azkar.almumin.debug';
const ACTIVITY = `${PACKAGE}/com.azkaralmumin.app.MainActivity`;
const SERIAL = process.argv[2] || 'emulator-5580';
const ADB = process.env.ADB_PATH || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const OUT = path.join(ROOT, '.ai_temp_scripts', 'android-navigation-tests', new Date().toISOString().replace(/[:.]/g, '-'));
const results = [];
const exceptions = [];
let activeCase = 'prerequisites';
let cdp;
let debugPort;
let device;

async function adb(args, binary = false) {
  const { stdout } = await exec(ADB, ['-s', SERIAL, ...args], {
    encoding: binary ? 'buffer' : 'utf8', timeout: 30000,
    maxBuffer: 32 * 1024 * 1024, windowsHide: true,
  });
  return binary ? stdout : stdout.trim();
}

async function deadline(promise, label, timeout = 8000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), timeout);
    })]);
  } finally { clearTimeout(timer); }
}

async function evaluate(expression) {
  return deadline(cdp.evaluate(expression), 'WebView evaluation');
}

async function waitFor(check, description, timeout = 30000) {
  const end = Date.now() + timeout;
  let lastError;
  while (Date.now() < end) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) { lastError = error.message; }
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError}` : ''}`);
}

async function ready(route) {
  await waitFor(() => evaluate(`(() => {
    const main = document.querySelector('main');
    const route = location.hash.split('?')[0] || '#/';
    return route === ${JSON.stringify(`#${route}`)} && main &&
      main.querySelector('h1,h2,h3') && main.innerText.trim().length > 20 &&
      !document.documentElement.hasAttribute('data-booting') &&
      !document.getElementById('boot-splash') &&
      window.Capacitor?.getPlatform() === 'android';
  })()`), `native content for ${route}`, 45000);
  await sleep(500);
}

async function disconnect() {
  cdp?.socket.close();
  cdp = undefined;
  if (debugPort) {
    try { await adb(['forward', '--remove', `tcp:${debugPort}`]); } catch { /* Already removed. */ }
    debugPort = undefined;
  }
}

async function launch() {
  await disconnect();
  const output = await adb(['shell', 'am', 'start', '-W', '-n', ACTIVITY]);
  assert(!/Error:|Exception/.test(output), `Android launch failed: ${output}`);
  const pid = await waitFor(async () => {
    const output = await adb(['shell', 'pidof', PACKAGE]);
    return /^\d+$/.test(output) ? output : false;
  }, 'debug app process');
  debugPort = Number(await adb(['forward', 'tcp:0', `localabstract:webview_devtools_remote_${pid}`]));
  assert(Number.isInteger(debugPort) && debugPort > 0, 'ADB did not allocate a debug port');
  await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`, { signal: AbortSignal.timeout(2000) });
    const targets = await response.json();
    return targets.some(target => target.type === 'page' && target.url.startsWith('https://localhost'));
  }, 'local app WebView debugger');
  cdp = await deadline(CDP.attach(debugPort), 'WebView attachment');
  cdp.socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push({ case: activeCase, text: message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text });
    }
  });
  await ready('/');
  await assertActive();
}

async function activityState() {
  const dump = await adb(['shell', 'dumpsys', 'activity', 'activities']);
  const lines = dump.split(/\r?\n/);
  const resumed = lines.filter(line => /(?:mResumedActivity|topResumedActivity|ResumedActivity):?/.test(line));
  const records = lines.filter(line => /\*\s*Hist\s+#\d+: ActivityRecord/.test(line) && line.includes(`${PACKAGE}/`));
  const focus = await adb(['shell', 'dumpsys', 'window', 'windows']);
  const focused = focus.split(/\r?\n/).filter(line => /mCurrentFocus=|mFocusedApp=/.test(line));
  return {
    resumed: resumed.map(line => line.trim()), records: records.map(line => line.trim()),
    focused: focused.map(line => line.trim()),
    isResumed: resumed.some(line => line.includes(`${PACKAGE}/`)),
    isFocused: focused.some(line => line.includes(`${PACKAGE}/`)),
  };
}

async function assertActive() {
  const state = await activityState();
  assert(state.isResumed, `Debug Activity is not resumed: ${JSON.stringify(state)}`);
  return state;
}

async function screenshot(name) {
  writeFileSync(path.join(OUT, `${name}.png`), await adb(['exec-out', 'screencap', '-p'], true));
}

async function layout(route) {
  const snapshot = await evaluate(`(() => {
    const main = document.querySelector('main');
    const nav = document.getElementById('bottom-nav');
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    return { route: location.hash || '#/', index: history.state?.idx, historyLength: history.length,
      navCount: document.querySelectorAll('#bottom-nav').length,
      nav: nav && rect(nav), main: rect(main), viewport: { width: innerWidth, height: innerHeight },
      paddingBottom: parseFloat(getComputedStyle(main).paddingBottom),
      text: main.innerText.slice(0, 150) };
  })()`);
  assert.equal(snapshot.route.split('?')[0], `#${route}`);
  assert.equal(snapshot.navCount, route === '/' ? 1 : 0, `${route}: bottom navigation visibility`);
  assert(snapshot.main.height > 100, `${route}: main content needs usable height`);
  assert(snapshot.main.bottom <= snapshot.viewport.height + 1, `${route}: main extends below viewport`);
  if (route === '/') {
    assert(snapshot.nav.height > 20, 'Home navigation is not visible');
    assert(snapshot.main.bottom <= snapshot.nav.top + 1, 'Home content overlaps bottom navigation');
  } else {
    assert(snapshot.paddingBottom >= 16, `${route}: missing bottom content padding`);
  }
  assert(!/حدث خطأ في هذا القسم|تعذر تحميل بعض المحتويات/.test(snapshot.text), `${route}: error boundary rendered`);
  return snapshot;
}

async function click(selector) {
  assert(await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    element.click(); return true;
  })()`), `UI element is missing: ${selector}`);
}

async function physicalBack(route) {
  await adb(['shell', 'input', 'keyevent', '4']);
  if (route) {
    await ready(route);
    await assertActive();
    return layout(route);
  }
}

async function expectExit(name) {
  await screenshot(`${name}-before-back`);
  await physicalBack();
  const state = await waitFor(async () => {
    const state = await activityState();
    // A process may legitimately remain cached. Require Activity removal, not
    // merely a launcher appearing above a minimized or backgrounded Activity.
    return !state.isResumed && !state.isFocused && state.records.length === 0 &&
      state.resumed.length > 0 ? state : false;
  }, 'Back finishing the Activity', 15000);
  await screenshot(`${name}-after-back`);
  await disconnect();
  return state;
}

async function record(name, check) {
  activeCase = name;
  const evidence = await check();
  results.push({ name, passed: true, evidence });
  console.log(`PASS ${name}`);
}

try {
  assert(Number(process.versions.node.split('.')[0]) >= 22, 'Node 22 or newer is required');
  assert(existsSync(ADB), `ADB not found: ${ADB}`);
  assert(/^[A-Za-z0-9._:-]+$/.test(SERIAL), 'Invalid device serial');
  mkdirSync(OUT, { recursive: true });
  assert.equal(await adb(['get-state']), 'device', 'Requested Android device is unavailable');
  const installed = await adb(['shell', 'pm', 'path', PACKAGE]);
  assert(installed.startsWith('package:'), `Install the isolated debug APK (${PACKAGE}) before running this script`);
  device = {
    serial: SERIAL, sdk: await adb(['shell', 'getprop', 'ro.build.version.sdk']),
    model: await adb(['shell', 'getprop', 'ro.product.model']),
    package: PACKAGE, activity: ACTIVITY,
  };
  // Stop only the isolated debug app to establish a cold launch. No pm clear,
  // uninstall, storage deletion, logcat clearing, or release app operation.
  await adb(['shell', 'am', 'force-stop', PACKAGE]);

  await record('cold home exits on hardware Back', async () => {
    await launch();
    const home = await layout('/');
    assert.equal(home.index, 0, 'Cold home must start with router index zero');
    return { home, exit: await expectExit('cold-home') };
  });

  await record('drawer and drawer settings consume Back before home exits', async () => {
    await launch();
    await click('header button[title="القائمة الرئيسية"]');
    await waitFor(() => evaluate(`!!document.querySelector('.main-menu-container')`), 'open drawer');
    await sleep(450);
    assert(await evaluate(`(() => {
      const icon = document.querySelector('.main-menu-container svg.lucide-settings');
      if (!icon) return false; icon.closest('button').click(); return true;
    })()`), 'Drawer settings button not found');
    await waitFor(() => evaluate(`!!document.querySelector('.main-menu-container svg.animate-spin-slow')`), 'drawer settings');
    await physicalBack('/');
    assert(await evaluate(`!!document.querySelector('.main-menu-container') && !document.querySelector('.main-menu-container svg.animate-spin-slow')`), 'Back must leave drawer open and close its settings');
    await physicalBack('/');
    await waitFor(() => evaluate(`!document.querySelector('.main-menu-container')`), 'drawer dismissal');
    const home = await layout('/');
    await screenshot('drawer-dismissed-home');
    return { home, activity: await assertActive() };
  });

  await record('nested Adhkar Back returns through hub and home', async () => {
    await click('#bottom-nav a[href="#/adhkar"]');
    await ready('/adhkar');
    const hub = await layout('/adhkar');
    await click('main a[href="#/adhkar/morning"]');
    await ready('/adhkar/morning');
    const detail = await layout('/adhkar/morning');
    await screenshot('adhkar-detail-no-bottom-nav');
    const returnedHub = await physicalBack('/adhkar');
    const returnedHome = await physicalBack('/');
    return { hub, detail, returnedHub, returnedHome, exit: await expectExit('returned-home') };
  });

  await record('Quran and Settings hide navigation and preserve bottom space', async () => {
    await launch();
    const sections = [];
    for (const route of ['/quran', '/settings']) {
      await click(`#bottom-nav a[href="#${route}"]`);
      await ready(route);
      sections.push(await layout(route));
      await screenshot(`${route.slice(1)}-no-bottom-nav`);
      await physicalBack('/');
    }
    return { sections };
  });

  await record('home reached by hash navigation exits despite earlier history', async () => {
    await click('#bottom-nav a[href="#/settings"]');
    await ready('/settings');
    const section = await layout('/settings');
    // Sections intentionally have no global header link. A real hash change
    // creates a new browser history entry and lets HashRouter process the
    // navigation normally, without guessing a UI control or editing its state.
    await evaluate(`location.hash = '#/'; true`);
    await ready('/');
    const home = await layout('/');
    assert(home.historyLength > section.historyLength, 'Hash navigation must append a history entry');
    return { navigation: 'location.hash', section, home, exit: await expectExit('pushed-home') };
  });

  await record('home replacing a section exits despite nonzero history index', async () => {
    await launch();
    await click('#bottom-nav a[href="#/adhkar"]');
    await ready('/adhkar');
    const prior = await layout('/adhkar');
    assert(await evaluate(`(() => {
      const back = [...document.querySelectorAll('main button')].find(button => button.querySelector('svg.lucide-chevron-right'));
      if (!back) return false; back.click(); return true;
    })()`), 'Adhkar hub Back button not found');
    await ready('/');
    const home = await layout('/');
    assert.equal(home.index, prior.index, 'Hub Back should replace its history entry');
    assert(home.index > 0, 'This scenario requires nonzero history');
    return { prior, home, exit: await expectExit('replaced-home') };
  });

  await record('direct section without router history falls back to home then exits', async () => {
    await launch();
    // A new document, rather than changing hash or history.state on the running
    // React app, establishes a real deep-link load with fresh router index 0.
    await deadline(cdp.send('Page.navigate', { url: 'about:blank' }), 'blank document navigation');
    await waitFor(() => evaluate('location.href === "about:blank"'), 'blank document');
    await deadline(cdp.send('Page.navigate', { url: 'https://localhost/#/settings' }), 'deep-link document navigation');
    await ready('/settings');
    const section = await layout('/settings');
    assert.equal(section.index, 0, 'Directly loaded section must have router index zero');
    const home = await physicalBack('/');
    assert.equal(home.index, 0, 'No-history Back must replace the section with home');
    return { section, home, exit: await expectExit('deep-link-home') };
  });

  assert.equal(exceptions.length, 0, `Uncaught WebView exceptions: ${JSON.stringify(exceptions)}`);
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ status: 'passed', device, results, exceptions }, null, 2));
  console.log(`Passed ${results.length} native scenarios. Evidence: ${OUT}`);
} catch (error) {
  mkdirSync(OUT, { recursive: true });
  let activity;
  try { activity = await activityState(); } catch { /* Device unavailable. */ }
  try { await screenshot('failure'); } catch { /* Device unavailable. */ }
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ status: 'failed', activeCase, error: error.stack, device, activity, results, exceptions }, null, 2));
  console.error(`FAIL ${activeCase}: ${error.message}\nEvidence: ${OUT}`);
  process.exitCode = 1;
} finally {
  await disconnect();
}
