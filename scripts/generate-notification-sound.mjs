#!/usr/bin/env node
/**
 * Generates android/app/src/main/res/raw/beep.wav — the notification tone.
 *
 * Why this exists
 * ---------------
 * capacitor.config.ts and src/services/localNotificationService.ts reference
 * `beep.wav` in 13 places: it is the sound of all three notification channels
 * (prayer times, adhkar, reminders) and of every scheduled notification. The
 * file was never actually in the repo, so Android resolved the channel sound to
 * a resource that does not exist — which leaves the channel silent. For an app
 * whose main job is to remind you of the adhan, a silent reminder is a broken
 * reminder.
 *
 * So the tone is synthesised here: a soft two-note chime (A5 -> D6) with an
 * exponential decay, which reads as a gentle notification rather than an alarm.
 *
 * Replacing it with a real recording
 * ----------------------------------
 * Drop any mono/stereo PCM WAV at the same path and rebuild. Keep it short —
 * a few seconds at most, since Android plays it in full for each notification.
 *
 * IMPORTANT: an Android notification channel is immutable once created. Changing
 * this file only affects devices that have not created the channels yet, i.e. a
 * fresh install. To change the sound for existing users you must also change the
 * channel IDs in localNotificationService.ts (CHANNELS), which makes Android
 * create new channels.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res', 'raw');
const OUT_FILE = path.join(OUT_DIR, 'beep.wav');

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const PEAK = 0.62; // leaves headroom so the mix never clips

/** Two notes, slightly overlapping: A5 then D6. */
const NOTES = [
  { freq: 880.0, start: 0.0, duration: 0.34 },
  { freq: 1174.66, start: 0.16, duration: 0.42 },
];

const totalSeconds = Math.max(...NOTES.map((n) => n.start + n.duration)) + 0.06;
const frameCount = Math.ceil(totalSeconds * SAMPLE_RATE);

const samples = new Float32Array(frameCount);

for (const note of NOTES) {
  const startFrame = Math.floor(note.start * SAMPLE_RATE);
  const noteFrames = Math.floor(note.duration * SAMPLE_RATE);

  for (let i = 0; i < noteFrames; i += 1) {
    const frame = startFrame + i;
    if (frame >= frameCount) break;

    const t = i / SAMPLE_RATE;
    // Exponential decay gives a struck-bell envelope rather than a flat buzz.
    const decay = Math.exp(-4.2 * t);
    // A short fade-in removes the click a hard start would produce.
    const attack = Math.min(1, t / 0.006);

    const fundamental = Math.sin(2 * Math.PI * note.freq * t);
    // A quiet octave harmonic keeps the tone from sounding like a test sine.
    const harmonic = 0.18 * Math.sin(2 * Math.PI * note.freq * 2 * t);

    samples[frame] += (fundamental + harmonic) * decay * attack * 0.5;
  }
}

// Normalise to the target peak so the two overlapping notes cannot clip.
let observedPeak = 0;
for (const sample of samples) observedPeak = Math.max(observedPeak, Math.abs(sample));
const gain = observedPeak > 0 ? PEAK / observedPeak : 1;

const bytesPerSample = BIT_DEPTH / 8;
const dataBytes = frameCount * bytesPerSample;
const buffer = Buffer.alloc(44 + dataBytes);

// RIFF header, 16-bit mono PCM.
buffer.write('RIFF', 0, 'ascii');
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write('WAVE', 8, 'ascii');
buffer.write('fmt ', 12, 'ascii');
buffer.writeUInt32LE(16, 16); // fmt chunk size
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(bytesPerSample, 32); // block align
buffer.writeUInt16LE(BIT_DEPTH, 34);
buffer.write('data', 36, 'ascii');
buffer.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < frameCount; i += 1) {
  const clamped = Math.max(-1, Math.min(1, samples[i] * gain));
  buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * bytesPerSample);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, buffer);

console.log(
  `Wrote ${path.relative(ROOT, OUT_FILE)} — ` +
    `${totalSeconds.toFixed(2)}s, ${SAMPLE_RATE} Hz, ${BIT_DEPTH}-bit mono, ${buffer.length} bytes`
);
