#!/usr/bin/env node
/**
 * Copies the web build into the Android project, then removes the one thing
 * that must not travel inside the APK.
 *
 * `cap sync` copies all of `webDir`, and `dist/ota/` holds a zip of that very
 * same build — the payload the *installed* app downloads from Netlify when it
 * refreshes its web layer. Shipping it inside the APK would add its whole size
 * again for something the APK can never use: at install time the app already
 * *is* that build.
 *
 * `dist/version.json` goes too. On native, freshness comes from the copy on
 * Netlify, fetched with `cache: 'no-store'`; a stale local copy would only be
 * misleading.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_PUBLIC = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public');

function run(command, args) {
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
}

function dirBytes(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else total += statSync(abs).size;
    }
  }
  return total;
}

console.log('\n▸ cap sync android\n');
run('npx', ['cap', 'sync', 'android']);

const otaInApk = path.join(ASSET_PUBLIC, 'ota');
if (existsSync(otaInApk)) {
  const bytes = dirBytes(otaInApk);
  rmSync(otaInApk, { recursive: true, force: true });
  console.log(`\n▸ Removed the OTA payload from the APK assets (${(bytes / 1024 / 1024).toFixed(2)} MB saved)`);
}

const versionInApk = path.join(ASSET_PUBLIC, 'version.json');
if (existsSync(versionInApk)) {
  rmSync(versionInApk, { force: true });
  console.log('▸ Removed the bundled version.json (native reads the deployed one)');
}

console.log('\nAndroid project is in sync.\n');
