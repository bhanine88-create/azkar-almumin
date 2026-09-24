#!/usr/bin/env node
/**
 * Builds the polished Google Play artwork from the raw screenshots.
 *
 * Inputs : play-store/screenshots/*.png   (real captures, 1080x1920)
 * Outputs: play-store/screenshots-framed/*.png  — captioned store screenshots
 *          play-store/feature-graphic.png       — 1024x500 header
 *
 * The raw captures stay in place and are perfectly valid to upload on their
 * own; these are the marketing-dressed versions.
 *
 * Composed in Chrome rather than ImageMagick because every caption is Arabic.
 * ImageMagick can shape Arabic through raqm, but a browser gets bidi, ligature
 * and font-fallback behaviour right for free, and gives real gradients,
 * blurs and shadows at the same time.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CDP, launchChrome, serveDirs, sleep, waitForDebugger } from './lib/cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAY = path.join(ROOT, 'play-store');
const RAW = path.join(PLAY, 'screenshots');
const FRAMED = path.join(PLAY, 'screenshots-framed');
const STAGE = path.join(ROOT, 'node_modules', '.cache', 'store-graphics');

const PORT = 8912;
const DEBUG_PORT = 9334;

const BRAND = {
  deep: '#04170F',
  mid: '#0A3326',
  backdrop: '#052418',
  teal: '#2DD4BF',
  gold: '#F5A623',
};

/**
 * The store set, in listing order: the app's six bottom-navigation tabs, so the
 * carousel walks a viewer through the app the same way the app itself does.
 * The last two are framed as ready alternates, not part of the six.
 */
const PANELS = [
  {
    file: '01-home.png',
    title: 'كل عبادتك في تطبيق واحد',
    subtitle: 'أذكار وقرآن ومواقيت ومسبحة بتصميم عصري',
  },
  {
    file: '02-adhkar.png',
    title: 'أذكار الصباح والمساء',
    subtitle: 'حصن المسلم وأذكار اليوم والليلة',
  },
  {
    file: '03-quran.png',
    title: 'المصحف الشريف كاملاً',
    subtitle: '١١٤ سورة مع التفسير والتلاوة الصوتية',
  },
  {
    file: '04-library.png',
    title: 'مكتبة إسلامية شاملة',
    subtitle: 'عقيدة وحديث وسيرة وقصص الأنبياء',
  },
  {
    file: '05-tasbih.png',
    title: 'مسبحة إلكترونية ذكية',
    subtitle: 'أنماط متعددة وأهداف يومية لأورادك',
  },
  {
    file: '06-settings.png',
    title: 'تحكّم كامل في تجربتك',
    subtitle: 'تنبيهات ومظهر وخطوط ولغات قابلة للتخصيص',
  },
  // Alternates, framed and ready to swap in.
  {
    file: '07-prayer-times.png',
    title: 'مواقيت الصلاة والأذان',
    subtitle: 'حساب دقيق حسب موقعك مع تنبيهات فورية',
  },
  {
    file: '08-names.png',
    title: 'أسماء الله الحسنى',
    subtitle: '٩٩ اسماً مع الشرح والمعاني والدعاء',
  },
];

/**
 * Google Fonts is fetched when reachable; Tahoma and Segoe UI are genuine
 * Arabic-capable fallbacks so the build still produces correct text offline.
 */
const FONT_STACK = "'Cairo','Tajawal','Segoe UI','Tahoma',sans-serif";
const FONT_LINK =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap">';

const sharedCss = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${FONT_STACK};
    direction: rtl;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .stage {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(120% 80% at 80% 0%, rgba(45,212,191,0.20) 0%, rgba(45,212,191,0) 55%),
      radial-gradient(100% 70% at 10% 100%, rgba(245,166,35,0.12) 0%, rgba(245,166,35,0) 60%),
      linear-gradient(170deg, ${BRAND.deep} 0%, ${BRAND.mid} 52%, ${BRAND.backdrop} 100%);
  }
  /* The app's own arabesque, kept faint so it reads as texture not decoration. */
  .pattern {
    position: absolute; inset: 0;
    background-image: url('/images/arabesque.png');
    background-size: 340px;
    opacity: 0.055;
  }
  .hairline {
    position: absolute; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(45,212,191,0.55), transparent);
  }
`;

function screenshotHtml(panel) {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">${FONT_LINK}
<style>
  ${sharedCss}
  html, body { width: 1080px; height: 1920px; }
  .stage { width: 1080px; height: 1920px; display: flex; flex-direction: column; align-items: center; }
  .caption { position: relative; padding: 104px 82px 0; text-align: center; width: 100%; }
  .accent {
    width: 96px; height: 7px; border-radius: 99px; margin: 0 auto 40px;
    background: linear-gradient(90deg, ${BRAND.gold}, ${BRAND.teal});
  }
  h1 {
    font-size: 74px; font-weight: 900; line-height: 1.22; color: #ffffff;
    letter-spacing: -0.5px;
    text-shadow: 0 4px 30px rgba(0,0,0,0.35);
  }
  p {
    margin-top: 28px; font-size: 37px; font-weight: 400; line-height: 1.5;
    color: rgba(255,255,255,0.66);
  }
  /* The device is intentionally taller than the space left for it: letting the
     bottom bleed off-canvas reads as a continuing screen rather than a
     floating thumbnail. */
  .device {
    position: relative;
    width: 816px;
    margin-top: 86px;
    border-radius: 46px;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,0.14);
    box-shadow: 0 50px 110px rgba(0,0,0,0.6), 0 0 0 10px rgba(255,255,255,0.03);
    flex: 1;
  }
  .device img { width: 100%; display: block; }
  .glare {
    position: absolute; inset: 0;
    background: linear-gradient(200deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%);
    pointer-events: none;
  }
</style></head>
<body><div class="stage">
  <div class="pattern"></div>
  <div class="caption">
    <div class="accent"></div>
    <h1>${panel.title}</h1>
    <p>${panel.subtitle}</p>
  </div>
  <div class="device"><img src="/${panel.file}" alt=""><div class="glare"></div></div>
</div></body></html>`;
}

function featureGraphicHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">${FONT_LINK}
<style>
  ${sharedCss}
  html, body { width: 1024px; height: 500px; }
  .stage {
    width: 1024px; height: 500px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 76px;
  }
  .text { position: relative; text-align: right; max-width: 560px; }
  h1 {
    font-size: 72px; font-weight: 900; color: #fff; line-height: 1.12;
    letter-spacing: -1px; text-shadow: 0 4px 28px rgba(0,0,0,0.4);
  }
  .rule {
    width: 120px; height: 7px; border-radius: 99px; margin: 26px 0 24px;
    background: linear-gradient(90deg, ${BRAND.gold}, ${BRAND.teal});
  }
  p { font-size: 31px; color: rgba(255,255,255,0.72); line-height: 1.45; font-weight: 400; }
  .mark {
    position: relative;
    width: 268px; height: 268px; flex: none;
    border-radius: 60px; overflow: hidden;
    border: 2px solid rgba(255,255,255,0.16);
    box-shadow: 0 34px 80px rgba(0,0,0,0.55);
  }
  .mark img { width: 100%; height: 100%; display: block; object-fit: cover; }
</style></head>
<body><div class="stage">
  <div class="pattern"></div>
  <div class="text">
    <h1>أذكار المؤمن</h1>
    <div class="rule"></div>
    <p>القرآن الكريم، الأذكار، مواقيت الصلاة والمسبحة — يعمل بدون إنترنت</p>
  </div>
  <div class="mark"><img src="/app-icon.png" alt=""></div>
</div></body></html>`;
}

// ---------------------------------------------------------------------------

for (const panel of PANELS) {
  if (!existsSync(path.join(RAW, panel.file))) {
    console.error(`Missing ${panel.file}. Run scripts/capture-screenshots.mjs first.`);
    process.exit(1);
  }
}

mkdirSync(FRAMED, { recursive: true });
mkdirSync(STAGE, { recursive: true });

// The icon is served alongside the captures so the feature graphic can use it.
const iconSource = path.join(PLAY, 'play-icon-512.png');
if (existsSync(iconSource)) {
  const { copyFileSync } = await import('node:fs');
  copyFileSync(iconSource, path.join(RAW, 'app-icon.png'));
}

for (const panel of PANELS) {
  writeFileSync(path.join(STAGE, `${panel.file.replace('.png', '')}.html`), screenshotHtml(panel));
}
writeFileSync(path.join(STAGE, 'feature-graphic.html'), featureGraphicHtml());

// Roots are searched in order: generated HTML, then the app's public assets
// (for the arabesque texture), then the raw captures.
const server = await serveDirs([STAGE, path.join(ROOT, 'public'), RAW], PORT);

const chrome = launchChrome(path.join(ROOT, 'node_modules', '.cache', 'store-chrome'), DEBUG_PORT);
let exitCode = 0;

try {
  await waitForDebugger(DEBUG_PORT);
  const cdp = await CDP.attach(DEBUG_PORT);

  console.log('▸ Framed store screenshots');
  await cdp.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  for (const panel of PANELS) {
    const name = panel.file.replace('.png', '');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${name}.html` });
    await sleep(900);
    await cdp.evaluate('document.fonts.ready.then(() => true)').catch(() => {});
    await cdp.evaluate(`(async () => {
      await Promise.all(Array.from(document.images).map((img) =>
        img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; })));
      return true;
    })()`);
    await sleep(500);
    await cdp.screenshotTo(path.join(FRAMED, `${name}.png`));
    console.log(`  ✓ ${name}.png — ${panel.title}`);
  }

  console.log('\n▸ Feature graphic');
  await cdp.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/feature-graphic.html` });
  await sleep(900);
  await cdp.evaluate('document.fonts.ready.then(() => true)').catch(() => {});
  await cdp.evaluate(`(async () => {
    await Promise.all(Array.from(document.images).map((img) =>
      img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; })));
    return true;
  })()`);
  await sleep(500);
  const featurePath = path.join(PLAY, 'feature-graphic.png');
  await cdp.screenshotTo(featurePath);

  // Play rejects a feature graphic that carries an alpha channel, and Chrome
  // always emits one. Flatten onto the brand backdrop and drop it.
  execFileSync('magick', [
    featurePath,
    '-background', BRAND.backdrop,
    '-alpha', 'remove',
    '-alpha', 'off',
    '-define', 'png:color-type=2',
    '-strip',
    featurePath,
  ]);
  console.log('  ✓ feature-graphic.png (1024x500, no alpha)');
} catch (err) {
  console.error('\nFailed:', err.message);
  exitCode = 1;
} finally {
  chrome.kill();
  server.close();
}

process.exit(exitCode);
