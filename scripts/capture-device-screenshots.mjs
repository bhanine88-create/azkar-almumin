#!/usr/bin/env node
/**
 * Captures Play Store screenshots from a real Android device or emulator over adb.
 *
 * This is the higher-fidelity counterpart to capture-screenshots.mjs, which
 * renders the same screens in a mobile-emulated Chrome. Both produce valid store
 * assets, but only this one exercises the shipped APK: the real WebView, the
 * real system font fallback, the device's own status bar, and the actual
 * rendering of the release build rather than of dist/ served over HTTP.
 *
 * Prerequisites:
 *   - the release APK installed on the device
 *   - exactly one device visible to `adb devices` (or pass its serial)
 *
 * Usage:
 *   node scripts/capture-device-screenshots.mjs [serial]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'play-store', 'screenshots');

const PACKAGE = 'com.azkar.almumin';
const ACTIVITY = `${PACKAGE}/.MainActivity`;

const ADB =
  process.env.ADB_PATH ||
  path.join(
    process.env.LOCALAPPDATA || '',
    'Android',
    'Sdk',
    'platform-tools',
    process.platform === 'win32' ? 'adb.exe' : 'adb'
  );

const serialArg = process.argv[2];

/**
 * Bottom-navigation tab positions as a fraction of the screen, right to left
 * because the app is RTL. Fractions rather than pixels so the same numbers work
 * across screen sizes — the bar is laid out proportionally.
 */
const NAV_Y = 0.965;
const TABS = [
  { name: '01-home', label: 'الرئيسية', x: 0.894 },
  { name: '02-adhkar', label: 'الأذكار', x: 0.731 },
  { name: '03-quran', label: 'القرآن', x: 0.589 },
  { name: '04-library', label: 'المكتبة', x: 0.444 },
  { name: '05-tasbih', label: 'المسبحة', x: 0.298 },
  { name: '06-settings', label: 'الإعدادات', x: 0.111 },
];

/** Extra screens worth having as alternates, reached from the home cards. */
const EXTRA = [
  { name: '07-prayer-times', label: 'مواقيت الصلاة', tapFrom: '01-home', x: 0.5, y: 0.649 },
  { name: '08-names', label: 'أسماء الله الحسنى', tapFrom: '01-home', x: 0.733, y: 0.77 },
];

/**
 * The tasbih counter reads 0 on a freshly opened screen, which photographs as a
 * large empty circle. Real taps are spaced far enough apart that each one lands
 * in its own frame, so the count actually advances — unlike synthetic clicks
 * fired in a burst, which collapse into one because handlePress derives the next
 * value from a captured `localCount`.
 */
const TASBIH_TAPS = 33;
const TASBIH_BEAD = { x: 0.53, y: 0.627 };

function adb(args, { timeout = 60000 } = {}) {
  const full = serialArg ? ['-s', serialArg, ...args] : args;
  return execFileSync(ADB, full, { timeout, encoding: 'utf8' });
}

function adbBinary(args, { timeout = 90000 } = {}) {
  const full = serialArg ? ['-s', serialArg, ...args] : args;
  return execFileSync(ADB, full, { timeout, maxBuffer: 64 * 1024 * 1024 });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function screenSize() {
  const out = adb(['shell', 'wm', 'size']);
  const match = out.match(/(\d+)x(\d+)/);
  if (!match) throw new Error(`Could not read screen size from: ${out.trim()}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function tap(size, xRatio, yRatio) {
  const x = Math.round(size.width * xRatio);
  const y = Math.round(size.height * yRatio);
  adb(['shell', 'input', 'tap', String(x), String(y)]);
}

function capture(file) {
  // exec-out streams the PNG over the adb socket, avoiding a write to /sdcard
  // and the permission questions that come with it.
  const png = adbBinary(['exec-out', 'screencap', '-p']);
  if (!png || png.length < 10_000) throw new Error('screencap returned no image');
  writeFileSync(file, png);
  return png.length;
}

if (!existsSync(ADB)) {
  console.error(`adb not found at ${ADB}. Set ADB_PATH.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const devices = adb(['devices'])
  .split('\n')
  .slice(1)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('*'))
  .map((l) => l.split(/\s+/));

const usable = devices.filter(([, state]) => state === 'device');
if (!usable.length) {
  console.error('No device in "device" state. Check `adb devices`.');
  console.error(devices.map((d) => `  ${d.join(' ')}`).join('\n'));
  process.exit(1);
}

const size = screenSize();
console.log(`\n▸ Device ${serialArg || usable[0][0]} — ${size.width}x${size.height}\n`);

// Cold start, so the first shot is not of a half-restored previous session.
adb(['shell', 'am', 'force-stop', PACKAGE]);
adb(['shell', 'am', 'start', '-n', ACTIVITY]);
await sleep(14000);

for (const tab of TABS) {
  tap(size, tab.x, NAV_Y);
  await sleep(3200);

  if (tab.name === '05-tasbih') {
    for (let i = 0; i < TASBIH_TAPS; i += 1) {
      tap(size, TASBIH_BEAD.x, TASBIH_BEAD.y);
      await sleep(90);
    }
    await sleep(1400);
  }

  const file = path.join(OUT, `${tab.name}.png`);
  const bytes = capture(file);
  console.log(`  ✓ ${tab.name}.png — ${tab.label} (${(bytes / 1024).toFixed(0)} KB)`);
}

for (const extra of EXTRA) {
  const source = TABS.find((t) => t.name === extra.tapFrom);
  if (source) {
    tap(size, source.x, NAV_Y);
    await sleep(2600);
  }
  tap(size, extra.x, extra.y);
  await sleep(5200);

  const file = path.join(OUT, `${extra.name}.png`);
  const bytes = capture(file);
  console.log(`  ✓ ${extra.name}.png — ${extra.label} (${(bytes / 1024).toFixed(0)} KB)`);
}

console.log(`\nWritten to ${path.relative(ROOT, OUT)}\n`);
