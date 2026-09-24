/**
 * Startup regression checks without a browser or third-party dependencies.
 * Run: node scripts/test-startup.mjs
 *
 * Executes the actual inline controller from index.html with a virtual clock.
 * Native first-frame colours and real WebView rendering still need device QA.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\bsrc\s*=/i.test(attributes))
  .map(([, , source]) => source);
const controllers = inlineScripts.filter(source => source.includes("'boot-retry'") && source.includes("'appReady'"));
assert.equal(controllers.length, 1, 'index.html must contain one independent startup controller');
const controller = new vm.Script(controllers[0], { filename: 'index.html (startup controller)' });

class Events {
  listeners = new Map();

  addEventListener(type, callback, options = {}) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ callback, once: options.once === true });
    this.listeners.set(type, listeners);
  }

  emit(type) {
    for (const listener of [...(this.listeners.get(type) || [])]) {
      if (listener.once) {
        this.listeners.set(type, this.listeners.get(type).filter(item => item !== listener));
      }
      listener.callback({ type, target: this });
    }
  }
}

function createBoot() {
  let now = 0;
  let timerId = 0;
  let reloads = 0;
  const timers = new Map();
  const persistentData = new Map([['believer_settings_v20', '{"theme":"dark"}'], ['test_progress', '42']]);
  const originalData = [...persistentData];
  const storage = {
    getItem: key => persistentData.get(key) ?? null,
    setItem: (key, value) => persistentData.set(key, String(value)),
    removeItem: key => persistentData.delete(key),
    clear: () => assert.fail('Startup must never clear stored user data'),
  };
  const classes = new Set();
  const attributes = new Set(['data-booting']);
  const splash = Object.assign(new Events(), {
    isConnected: true,
    classList: { add: className => classes.add(className) },
    remove() { this.isConnected = false; },
  });
  const retry = new Events();
  const recovery = { hidden: true };
  const root = { innerText: '', querySelector: () => null };
  const elements = { 'boot-splash': splash, 'boot-retry': retry, 'boot-recovery': recovery, root };
  const window = Object.assign(new Events(), {
    location: { reload: () => { reloads++; } },
    localStorage: storage,
    sessionStorage: storage,
    dispatchEvent(event) { this.emit(event.type); },
  });

  const context = vm.createContext({
    window,
    Event: class { constructor(type) { this.type = type; } },
    localStorage: storage,
    sessionStorage: storage,
    navigator: {
      serviceWorker: {
        getRegistrations: () => assert.fail('A slow startup must not unregister service workers'),
      },
    },
    caches: { delete: () => assert.fail('A slow startup must not erase offline caches') },
    document: {
      getElementById: id => splash.isConnected ? elements[id] ?? null : null,
      documentElement: { removeAttribute: attribute => attributes.delete(attribute) },
    },
    setTimeout: (callback, delay, ...args) => {
      const id = ++timerId;
      timers.set(id, { at: now + delay, callback, args });
      return id;
    },
    clearTimeout: id => timers.delete(id),
  });
  controller.runInContext(context);

  return {
    splash, retry, recovery, root, window, classes, attributes,
    get reloads() { return reloads; },
    assertDataPreserved() { assert.deepEqual([...persistentData], originalData); },
    advance(milliseconds) {
      const target = now + milliseconds;
      let callbacks = 0;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= target)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        assert(++callbacks < 1000, 'Startup timer loop did not settle');
        const [id, timer] = next;
        timers.delete(id);
        now = timer.at;
        timer.callback(...timer.args);
      }
      now = target;
    },
  };
}

test('all inline scripts parse independently of the main JS bundle', () => {
  assert(inlineScripts.length > 0);
  inlineScripts.forEach((source, index) => new vm.Script(source, { filename: `index.html inline script ${index + 1}` }));
});

test('a slow first install stays branded beyond four seconds without reloading', () => {
  const boot = createBoot();
  boot.advance(4000);
  assert(boot.splash.isConnected);
  assert(boot.attributes.has('data-booting'));
  assert.equal(boot.recovery.hidden, true);
  assert.equal(boot.reloads, 0);
  boot.advance(10999);
  assert.equal(boot.recovery.hidden, true);
  boot.advance(1);
  assert.equal(boot.recovery.hidden, false, 'A failed bundle must leave an accessible retry path');
  boot.advance(60000);
  assert.equal(boot.reloads, 0, 'Waiting is never permission to reload');
  boot.assertDataPreserved();
});

test('retry reloads only after the user clicks and preserves stored data', () => {
  const boot = createBoot();
  boot.advance(15000);
  assert.equal(boot.reloads, 0);
  boot.retry.emit('click');
  assert.equal(boot.reloads, 1);
  boot.assertDataPreserved();
});

test('normal readiness fades once and cancels the failure watchdog', () => {
  const boot = createBoot();
  boot.advance(1200);
  boot.window.emit('appReady');
  assert.equal(boot.attributes.has('data-booting'), false);
  assert(boot.classes.has('is-hiding'));
  assert.equal(boot.recovery.hidden, true);
  boot.splash.emit('transitionend');
  assert.equal(boot.splash.isConnected, false);
  boot.window.emit('appReady');
  boot.advance(60000);
  assert.equal(boot.recovery.hidden, true);
  assert.equal(boot.reloads, 0);
  boot.assertDataPreserved();
});

test('the watchdog releases a rendered route when animation frames were paused', () => {
  const boot = createBoot();
  boot.root.innerText = 'الصفحة الرئيسية';
  boot.advance(15000);
  assert.equal(boot.recovery.hidden, true);
  assert(boot.classes.has('is-hiding'));
  boot.advance(240);
  assert.equal(boot.splash.isConnected, false);
  assert.equal(boot.reloads, 0);
});

test('reduced motion removes the splash even without transitionend', () => {
  const boot = createBoot();
  boot.window.emit('appReady');
  boot.advance(239);
  assert(boot.splash.isConnected);
  boot.advance(1);
  assert.equal(boot.splash.isConnected, false);
  boot.advance(60000);
  assert.equal(boot.reloads, 0);
});

test('late readiness dismisses the recovery screen without a reload', () => {
  const boot = createBoot();
  boot.advance(20000);
  assert.equal(boot.recovery.hidden, false);
  boot.window.emit('appReady');
  boot.advance(240);
  assert.equal(boot.splash.isConnected, false);
  assert.equal(boot.reloads, 0);
  boot.assertDataPreserved();
});
