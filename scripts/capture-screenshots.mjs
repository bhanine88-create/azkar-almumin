#!/usr/bin/env node
/**
 * Captures Google Play phone screenshots from the real built app.
 *
 * Play requires screenshots that show the actual app, so these are taken from
 * dist/ in a mobile-emulated Chrome rather than mocked up in an image editor.
 *
 * Drives Chrome over the DevTools Protocol using Node 22's built-in WebSocket,
 * so there is no Puppeteer dependency to install. Doing it over CDP rather than
 * with `chrome --screenshot` is what makes it possible to emulate a real phone
 * viewport, seed localStorage, and wait for fonts and data to settle before the
 * shutter — a plain `--screenshot` run captured a half-laid-out page.
 *
 * Usage:
 *   node scripts/build.mjs                       # dist/ must exist
 *   node scripts/capture-screenshots.mjs         # serves dist/ itself
 */
import { execFileSync, spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'play-store', 'screenshots');

const PORT = 8911;
const DEBUG_PORT = 9333;

/**
 * 360x640 CSS at DSF 3 gives exactly 1080x1920 — a 9:16 frame, which is the
 * tallest ratio Play accepts for phone screenshots.
 */
const VIEWPORT = { width: 360, height: 640, deviceScaleFactor: 3 };

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

/**
 * Candidates to capture. The first six are the app's bottom-navigation tabs in
 * their on-screen order, which is the set that ships to the store: it walks a
 * viewer through the whole app in the same order the app itself presents it.
 * The last two are alternates, kept so a weak shot can be swapped out.
 */
const SHOTS = [
  { name: '01-home', route: '#/', label: 'الرئيسية' },
  { name: '02-adhkar', route: '#/adhkar', label: 'الأذكار' },
  { name: '03-quran', route: '#/quran', label: 'القرآن' },
  { name: '04-library', route: '#/library', label: 'المكتبة' },
  {
    name: '05-tasbih',
    route: '#/tasbih',
    label: 'المسبحة',
    /*
     * Captured cold, this screen is a "0" over a large empty area — an accurate
     * but useless picture of a counter. Tapping the bead 33 times (a subhanallah
     * set) shows the count and a partly filled progress ring, i.e. the screen as
     * it looks in use.
     */
    /*
     * The taps have to be spaced out. handlePress computes the next count from
     * `localCount` captured in its closure, so a burst of synchronous clicks
     * all read the same value and the counter only ever advances by one. A gap
     * between clicks lets React commit and re-render in between.
     */
    /*
     * Seed the counter through the app's own storage rather than by clicking.
     *
     * Clicking is unreliable here: handlePress derives the next value from
     * `localCount` captured in its render closure, and React replaces the bead's
     * DOM node between taps, so a burst of synthetic clicks lands on detached
     * elements and the count barely moves. One tap is enough to create the
     * storage entry (keyed `${rosaryMode}_${dhikrText}`), after which the value
     * is written directly and the route reloaded to pick it up.
     */
    prepare: `(async () => {
      const findBead = () => Array.from(document.querySelectorAll('button')).find((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 180 && Math.abs(r.width - r.height) < 24;
      });
      const bead = findBead();
      if (bead) {
        bead.click();
        await new Promise((r) => setTimeout(r, 700));
      }

      const KEY = 'believer_dhikr_counts';
      let map = {};
      try { map = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { map = {}; }
      const keys = Object.keys(map);
      if (!keys.length) return 'no counter key to seed';
      for (const k of keys) map[k] = 33;
      localStorage.setItem(KEY, JSON.stringify(map));
      location.reload();
      return 'seeded 33 on: ' + keys.join(', ');
    })()`,
  },
  {
    name: '06-settings',
    route: '#/settings',
    label: 'الإعدادات',
    /*
     * The settings tab opens with every section collapsed, which photographs as
     * a list of empty rows. Opening the notifications tab and expanding the
     * prayer-alert section shows what the screen is actually for.
     */
   },
  // Alternates
  { name: '07-prayer-times', route: '#/prayer-times', label: 'مواقيت الصلاة' },
  { name: '08-names', route: '#/names', label: 'أسماء الله الحسنى' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
};

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error('Could not find Chrome or Edge. Set one of the paths in CHROME_CANDIDATES.');
}

function serveDist() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, ''));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (!existsSync(filePath)) filePath = path.join(DIST, 'index.html');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Chrome never opened its debugging port.');
}

/** Minimal CDP client over Node's built-in WebSocket. */
class CDP {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message} (${JSON.stringify(message.error)})`));
        else resolve(message.result);
      }
    });
  }

  static async connect(wsUrl) {
    const socket = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new CDP(socket);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || 'evaluate failed');
    }
    return result.result?.value;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build:web` first.');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const chromePath = findChrome();
const server = await serveDist();
console.log(`▸ Serving dist/ on http://127.0.0.1:${PORT}`);

const profileDir = path.join(ROOT, 'node_modules', '.cache', 'screenshot-profile');
mkdirSync(profileDir, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    // Keep the run offline-deterministic and quiet: no sync, no GCM, no
    // telemetry chatter competing with the page for time.
    '--disable-sync',
    '--disable-background-networking',
    '--disable-features=Translate,OptimizationHints',
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let exitCode = 0;
try {
  await waitForDebugger();

  const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('No page target available.');

  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
    mobile: true,
  });
  await cdp.send('Emulation.setUserAgentOverride', {
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    platform: 'Android',
  });
  // Prayer times and the qibla need a position; without one the screens sit on
  // a spinner. Makkah keeps the screenshots meaningful and neutral.
  await cdp.send('Emulation.setGeolocationOverride', {
    latitude: 21.4225,
    longitude: 39.8262,
    accuracy: 20,
  });
  // Geolocation makes the prayer-time screens show real data instead of a
  // spinner. Notifications matter for the settings screen: without the grant it
  // renders an amber "notifications are not enabled" warning, which is an
  // artefact of the capture environment, not something a real user sees.
  await cdp.send('Browser.grantPermissions', {
    origin: `http://127.0.0.1:${PORT}`,
    permissions: ['geolocation', 'notifications'],
  }).catch(() => {});

  const diagnostics = [];

  for (const shot of SHOTS) {
    const url = `http://127.0.0.1:${PORT}/${shot.route}`;
    await cdp.send('Page.navigate', { url });
    await sleep(1200);
    // A hash change after load does not remount on its own in every router
    // setup, so force the route and let React settle.
    await cdp.evaluate(`window.location.hash = ${JSON.stringify(shot.route.slice(1))}`);
    await sleep(2600);

    // Wait for webfonts, otherwise the Arabic text is captured in a fallback.
    await cdp.evaluate('document.fonts.ready.then(() => true)').catch(() => {});
    await sleep(900);

    if (shot.prepare) {
      const outcome = await cdp.evaluate(shot.prepare).catch((err) => `failed: ${err.message}`);
      console.log(`      ↳ ${outcome}`);
      // A prepare step may reload the page, so allow for a full remount.
      await sleep(3500);
      await cdp.evaluate('document.fonts.ready.then(() => true)').catch(() => {});
      await sleep(600);
    }
    if (shot.prepareLate) {
      const outcome = await cdp.evaluate(shot.prepareLate).catch((err) => `failed: ${err.message}`);
      console.log(`      ↳ ${outcome}`);
      await sleep(1100);
    }

    const layout = await cdp.evaluate(`(() => {
      const d = document.documentElement;
      return {
        scrollWidth: d.scrollWidth,
        clientWidth: d.clientWidth,
        dir: d.dir,
        title: document.title,
      };
    })()`);
    diagnostics.push({ name: shot.name, ...layout });

    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const file = path.join(OUT, `${shot.name}.png`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log(`  ✓ ${shot.name}.png — ${shot.label}`);
  }

  console.log('\n▸ Layout check (scrollWidth must equal clientWidth, or the shot is clipped)');
  for (const d of diagnostics) {
    const overflow = d.scrollWidth - d.clientWidth;
    console.log(
      `  ${d.name.padEnd(18)} ${d.clientWidth}px viewport, scrollWidth ${d.scrollWidth}px` +
        (overflow > 0 ? `  ← OVERFLOW +${overflow}px` : '  ok')
    );
  }
} catch (err) {
  console.error('\nCapture failed:', err.message);
  exitCode = 1;
} finally {
  chrome.kill();
  server.close();
}

if (exitCode === 0) {
  console.log(`\nScreenshots written to ${path.relative(ROOT, OUT)}`);
}
process.exit(exitCode);
