#!/usr/bin/env node
/**
 * Generates every launcher / splash / store image from the one official logo.
 *
 * Run it whenever the official logo changes:
 *   node scripts/generate-brand-assets.mjs
 *   npx @capacitor/assets generate --android
 *   node scripts/fix-adaptive-icons.mjs
 *
 * For launcher-only adjustments (preserves splash and notification assets):
 *   node scripts/generate-brand-assets.mjs --icons-only
 *   node scripts/fix-adaptive-icons.mjs --icons-only
 *
 * Why the sources are built this way
 * ----------------------------------
 * An Android adaptive icon is two 108dp layers, but launchers mask them down to
 * roughly the central 72dp; only the central 66dp-diameter circle is guaranteed
 * across OEM masks. The official logo is a wordmark that
 * fills ~71% of its own artboard, so handing it to the launcher unchanged gets
 * the outer letters shaved off on round and squircle masks.
 *
 * So we rebuild it: the wordmark is trimmed to its true bounding box and then
 * placed on a fresh canvas at ARTWORK_SCALE. Do not enlarge the adaptive layer
 * along with the legacy tile: the corners of the calligraphy limit its size on
 * circular masks.
 *
 * Requires ImageMagick 7 (`magick`) on PATH.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ICONS_ONLY = process.argv.includes('--icons-only');

/** The supplied official logo, kept in the project for repeatable builds. */
const SOURCE_LOGO = path.join(ROOT, 'assets', 'brand-logo-source.png');

/** Flat background baked into the official logo, sampled from its corners. */
const BRAND_GREEN = '#083927';
/** App chrome colour used for the splash, status bar and manifest. */
const APP_BACKDROP = '#052418';

const MASTER = 1024;
/**
 * The client asked (2026-09-24) for the name to sit clear of the tile edges so
 * the logo reads as a composed mark rather than text pressed into a box.
 * At 0.43 of a 108dp adaptive canvas the wordmark box is 46.4dp square, so even
 * its corners (32.8dp from centre) sit inside the 66dp circle every OEM mask
 * guarantees, with a visible green margin on round and squircle launchers.
 * Keep this independent from the legacy tile; enlarging the adaptive layer
 * clips the calligraphy on round launchers.
 * https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
 */
const ARTWORK_SCALE = 0.43;
/**
 * The legacy square icon (`ic_launcher.png`) and the Play Store icon.
 * A number of OEM launchers use the PNG directly rather than the adaptive XML.
 * At 68% the wordmark keeps a clear margin inside the rounded-square mask.
 * The full-bleed tile is rasterised in fix-adaptive-icons.mjs without
 * Capacitor's extra inset.
 */
const LEGACY_SCALE = 0.68;
/**
 * The in-app logo (header, drawer, About) and the PWA / favicon-sized web icons.
 * The supplied source puts the wordmark at ~71% of the tile; 66% gives it the
 * same breathing room as the launcher icon.
 */
const WEB_LOGO_SCALE = 0.66;
const SPLASH_SIZE = 2732;
const SPLASH_SCALE = 0.24;

const assetsDir = path.join(ROOT, 'assets');
const playDir = path.join(ROOT, 'play-store');
const notifyDir = path.join(ROOT, 'assets', 'notification');

for (const dir of [assetsDir, playDir, notifyDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function magick(args) {
  execFileSync('magick', args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

function out(...parts) {
  return path.join(...parts);
}

if (!existsSync(SOURCE_LOGO)) {
  console.error(`Official logo not found:\n  ${SOURCE_LOGO}`);
  process.exit(1);
}

/**
 * The wordmark on a transparent canvas, trimmed to its bounding box.
 *
 * The logo's backdrop is a single flat colour, so keying it out gives clean
 * alpha. Anti-aliased letter edges keep a little of that green, which is
 * invisible here because every layer we composite it onto is the same green.
 */
const WORDMARK = out(assetsDir, '.wordmark-trimmed.png');
magick([
  SOURCE_LOGO,
  '-alpha',
  'set',
  '-fuzz',
  '10%',
  '-transparent',
  BRAND_GREEN,
  '-trim',
  '+repage',
  WORDMARK,
]);

/** Centres the wordmark on a square canvas at the given fill ratio. */
function composeSquare(size, scale, background, target) {
  const artwork = Math.round(size * scale);
  magick([
    '-size',
    `${size}x${size}`,
    `xc:${background}`,
    '(',
    WORDMARK,
    '-resize',
    `${artwork}x${artwork}`,
    '-filter',
    'Lanczos',
    ')',
    '-gravity',
    'center',
    '-composite',
    '-strip',
    target,
  ]);
}

console.log('· adaptive icon background (flat brand green)');
magick(['-size', `${MASTER}x${MASTER}`, `xc:${BRAND_GREEN}`, '-strip', out(assetsDir, 'icon-background.png')]);

console.log('· adaptive icon foreground (independent launcher-mask scale)');
const fgArtwork = Math.round(MASTER * ARTWORK_SCALE);
magick([
  '-size',
  `${MASTER}x${MASTER}`,
  'xc:none',
  '(',
  WORDMARK,
  '-filter',
  'Lanczos',
  '-resize',
  `${fgArtwork}x${fgArtwork}`,
  ')',
  '-gravity',
  'center',
  '-composite',
  '-strip',
  out(assetsDir, 'icon-foreground.png'),
]);

console.log('· legacy / round launcher icon + Play Store icon');
composeSquare(MASTER, LEGACY_SCALE, BRAND_GREEN, out(assetsDir, 'icon.png'));
composeSquare(MASTER, LEGACY_SCALE, BRAND_GREEN, out(assetsDir, 'icon-only.png'));
// Play requires a 512x512 32-bit PNG with no alpha channel.
magick([
  out(assetsDir, 'icon.png'),
  '-resize',
  '512x512',
  '-background',
  BRAND_GREEN,
  '-alpha',
  'remove',
  '-alpha',
  'off',
  '-define',
  'png:color-type=2',
  '-strip',
  out(playDir, 'play-icon-512.png'),
]);

console.log('· in-app / web logos (public/)');
/**
 * Every non-maskable square logo the web layer serves. The 16/32px favicons
 * are left alone: at that size a smaller wordmark is only illegible.
 * Maskable icons carry their own safe-zone padding and are not touched here.
 */
const publicDir = path.join(ROOT, 'public');
const WEB_LOGO_MASTER = out(assetsDir, '.web-logo-1024.png');
composeSquare(MASTER, WEB_LOGO_SCALE, BRAND_GREEN, WEB_LOGO_MASTER);
const WEB_LOGOS = [
  ['logo.png', 512],
  ['logo-official-512.png', 512],
  ['logo-official-192.png', 192],
  ['apple-touch-icon.png', 180],
  ['apple-touch-icon-180x180.png', 180],
  ['apple-touch-icon-152x152.png', 152],
  ['apple-touch-icon-120x120.png', 120],
  ...[48, 72, 96, 128, 144, 152, 180, 192, 384, 512].map((s) => [`logo-${s}.png`, s]),
];
for (const [name, size] of WEB_LOGOS) {
  magick([WEB_LOGO_MASTER, '-filter', 'Lanczos', '-resize', `${size}x${size}`, '-depth', '8', '-strip', out(publicDir, name)]);
}

if (!ICONS_ONLY) {
  console.log('· splash screens (square master so it crops cleanly either way)');
  composeSquare(SPLASH_SIZE, SPLASH_SCALE, APP_BACKDROP, out(assetsDir, 'splash.png'));
  composeSquare(SPLASH_SIZE, SPLASH_SCALE, APP_BACKDROP, out(assetsDir, 'splash-dark.png'));
}

/**
 * Notification small icon.
 *
 * Android 5+ draws the small icon as a silhouette: every non-transparent pixel
 * is repainted with the accent colour, so a full-colour logo turns into a solid
 * white blob. This flattens the wordmark to pure white alpha instead, sized to
 * the 24dp glyph with the 3dp padding the spec asks for.
 */
if (!ICONS_ONLY) console.log('· notification small icons (white silhouette)');
const NOTIFY_DENSITIES = [
  ['mdpi', 24],
  ['hdpi', 36],
  ['xhdpi', 48],
  ['xxhdpi', 72],
  ['xxxhdpi', 96],
];
for (const [density, size] of ICONS_ONLY ? [] : NOTIFY_DENSITIES) {
  const glyph = Math.round(size * 0.75);
  const dir = out(notifyDir, `drawable-${density}`);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  magick([
    '-size',
    `${size}x${size}`,
    'xc:none',
    '(',
    WORDMARK,
    '-filter',
    'Lanczos',
    '-resize',
    `${glyph}x${glyph}`,
    // Repaint every pixel white while leaving alpha untouched, so the glyph
    // keeps its anti-aliased edges instead of being thresholded to jaggies.
    '-fill',
    'white',
    '-colorize',
    '100',
    ')',
    '-gravity',
    'center',
    '-composite',
    '-strip',
    out(dir, 'ic_stat_notify.png'),
  ]);
}

/**
 * Monochrome layer for Android 13+ themed icons. The system tints it with the
 * user's wallpaper palette, so it must be a single-colour silhouette.
 */
console.log('· themed-icon monochrome layer');
magick([
  '-size',
  `${MASTER}x${MASTER}`,
  'xc:none',
  '(',
  WORDMARK,
  '-filter',
  'Lanczos',
  '-resize',
  `${fgArtwork}x${fgArtwork}`,
  '-fill',
  'white',
  '-colorize',
  '100',
  ')',
  '-gravity',
  'center',
  '-composite',
  '-strip',
  out(assetsDir, 'icon-monochrome.png'),
]);

console.log('\nDone. Sources written to assets/ and play-store/.');
console.log(ICONS_ONLY
  ? 'Next: node scripts/fix-adaptive-icons.mjs --icons-only'
  : 'Next: npx @capacitor/assets generate --android && node scripts/fix-adaptive-icons.mjs');
