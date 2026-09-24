#!/usr/bin/env node
/**
 * Production web build.
 *
 * Wraps `vite build` so that one build stamp is shared by everything that
 * answers "is there a newer build?":
 *
 *   - compiled into the bundle as __APP_BUILD_TIME__
 *   - published in dist/version.json, which the PWA and the native OTA
 *     updater both poll
 *
 * Vite must not choose the stamp itself, or the value baked into the JS would
 * differ from the value in version.json and the app would either never see an
 * update or see one on every single check.
 *
 * It then packs the finished dist into dist/ota/bundle-<stamp>.zip, which is
 * what the installed APK downloads to refresh its web layer without a new
 * release on Google Play.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OTA_DIR = path.join(DIST, 'ota');

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const BUILD_TIME = Date.now();
const VERSION = process.env.APP_VERSION || pkg.version;

/**
 * Service-worker plumbing is dead weight inside an OTA bundle: native builds
 * never register a worker, because one would keep serving its own cached copies
 * and pin the app to the bundle it was installed with.
 */
const OTA_EXCLUDE = [/^sw\.js$/, /^workbox-[^/]+\.js$/, /^registerSW\.js$/, /^ota\//, /^version\.json$/];

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, APP_BUILD_TIME: String(BUILD_TIME), APP_VERSION: VERSION },
    shell: process.platform === 'win32',
  });
}

async function walk(dir, base = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(abs, rel)));
    } else if (entry.isFile()) {
      out.push({ rel, abs });
    }
  }
  return out;
}

console.log(`\n▸ Building أذكار المؤمن v${VERSION} (build ${BUILD_TIME})\n`);

run('npx', ['vite', 'build']);

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('Build produced no dist/index.html — aborting.');
  process.exit(1);
}

// Drop any bundle from an earlier build so old zips are not redeployed.
if (existsSync(OTA_DIR)) rmSync(OTA_DIR, { recursive: true, force: true });
mkdirSync(OTA_DIR, { recursive: true });

console.log('\n▸ Packing the over-the-air bundle');
const files = (await walk(DIST)).filter((f) => !OTA_EXCLUDE.some((re) => re.test(f.rel)));

const zip = new JSZip();
for (const file of files) {
  zip.file(file.rel, readFileSync(file.abs));
}

const bundleName = `bundle-${BUILD_TIME}.zip`;
const bundlePath = path.join(OTA_DIR, bundleName);
const payload = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
});
writeFileSync(bundlePath, payload);

const sha256 = createHash('sha256').update(payload).digest('hex');
const bundleBytes = statSync(bundlePath).size;

// version.json is written last: the digest can only be computed once the
// bundle exists, and the installed app refuses a bundle whose hash disagrees.
const manifest = {
  version: VERSION,
  buildTime: BUILD_TIME,
  bundle: `/ota/${bundleName}`,
  bundleBytes,
  sha256,
  builtAt: new Date(BUILD_TIME).toISOString(),
};
writeFileSync(path.join(DIST, 'version.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const mb = (bundleBytes / 1024 / 1024).toFixed(2);
console.log(`\n  dist/version.json   build ${BUILD_TIME} (v${VERSION})`);
console.log(`  dist/ota/${bundleName}   ${mb} MB, ${files.length} files`);
console.log(`  sha256              ${sha256}\n`);
