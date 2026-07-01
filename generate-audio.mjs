import { writeFileSync, mkdirSync } from 'fs';

const SR = 44100;

function writeWav(path, samples) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const dv = new DataView(buf);
  const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) dv.setUint8(off + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  dv.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, SR, true);
  dv.setUint32(28, SR * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  writeStr(36, 'data');
  dv.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    dv.setInt16(44 + i * 2, v * 32767 | 0, true);
  }
  writeFileSync(path, Buffer.from(buf));
}

function noise(len, amp) {
  const s = new Float32Array(len);
  for (let i = 0; i < len; i++) s[i] = (Math.random() * 2 - 1) * amp;
  return s;
}

function tone(len, freq, amp) {
  const s = new Float32Array(len);
  for (let i = 0; i < len; i++) s[i] = Math.sin(2 * Math.PI * freq * i / SR) * amp;
  return s;
}

function sweep(len, f1, f2, amp) {
  const s = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    s[i] = Math.sin(2 * Math.PI * (f1 + (f2 - f1) * t) * i / SR) * amp * (1 - t);
  }
  return s;
}

function envelope(s, attack, release) {
  const n = s.length;
  const at = n * attack | 0;
  const rl = n * release | 0;
  for (let i = 0; i < at && i < n; i++) s[i] *= i / at;
  for (let i = Math.max(0, n - rl); i < n; i++) s[i] *= (n - i) / rl;
  return s;
}

['public/assets/audio/ambient', 'public/assets/audio/sfx'].forEach(d => mkdirSync(d, { recursive: true }));

function seamlessLoop(s, crossfadeMs = 50) {
  const n = s.length;
  const cf = SR * crossfadeMs / 1000 | 0;
  // Crossfade the end into the beginning for seamless looping
  for (let i = 0; i < cf && i < n; i++) {
    const t = i / cf;
    s[i] *= t;                              // fade in start
    s[n - 1 - i] *= t;                      // fade out end
    s[i] += s[n - 1 - i] * (1 - t);         // blend end into start
  }
  return s;
}

console.log('Generating ambient...');

// rain — seamless loop
const r = seamlessLoop(noise(SR * 4, 0.25));
for (let i = 1; i < r.length; i++) r[i] = r[i] * 0.3 + r[i - 1] * 0.7;
writeWav('public/assets/audio/ambient/rain.wav', r);

// room — barely-there air, no tonal drone
const roomN = seamlessLoop(noise(SR * 4, 0.015));
for (let i = 4; i < roomN.length; i++) roomN[i] = roomN[i] * 0.05 + roomN[i - 1] * 0.25 + roomN[i - 2] * 0.35 + roomN[i - 3] * 0.25 + roomN[i - 4] * 0.1;
for (let i = 0; i < roomN.length; i++) roomN[i] *= 0.5;
writeWav('public/assets/audio/ambient/room.wav', roomN);

// pc-fan — barely audible whir
const fanN = seamlessLoop(noise(SR * 3, 0.04));
for (let i = 3; i < fanN.length; i++) fanN[i] = fanN[i] * 0.05 + fanN[i - 1] * 0.2 + fanN[i - 2] * 0.4 + fanN[i - 3] * 0.35;
for (let i = 0; i < fanN.length; i++) fanN[i] *= 0.4;
writeWav('public/assets/audio/ambient/pc-fan.wav', fanN);

console.log('Generating SFX...');

writeWav('public/assets/audio/sfx/monitor-on.wav', envelope(sweep(SR * 0.4, 200, 800, 0.3), 0.1, 0.3));
writeWav('public/assets/audio/sfx/keyboard.wav', envelope(noise(SR * 0.04, 0.4), 0.01, 0.5));
writeWav('public/assets/audio/sfx/mouse-click.wav', envelope(noise(SR * 0.02, 0.35), 0.01, 0.3));
writeWav('public/assets/audio/sfx/mug.wav', envelope(tone(SR * 0.12, 3000, 0.2), 0.01, 0.5));
writeWav('public/assets/audio/sfx/book.wav', envelope(noise(SR * 0.1, 0.5), 0.01, 0.4));
writeWav('public/assets/audio/sfx/door.wav', envelope(sweep(SR * 0.5, 150, 80, 0.25), 0.05, 0.3));
writeWav('public/assets/audio/sfx/server.wav', envelope(tone(SR * 0.8, 100, 0.2), 0.05, 0.3));
writeWav('public/assets/audio/sfx/terminal.wav', envelope(tone(SR * 0.25, 1200, 0.3), 0.05, 0.3));
writeWav('public/assets/audio/sfx/open.wav', envelope(sweep(SR * 0.12, 300, 900, 0.25), 0.02, 0.3));
writeWav('public/assets/audio/sfx/close.wav', envelope(sweep(SR * 0.12, 900, 300, 0.2), 0.02, 0.3));
writeWav('public/assets/audio/sfx/ui-open.wav', envelope(tone(SR * 0.15, 660, 0.2), 0.02, 0.3));
writeWav('public/assets/audio/sfx/ui-close.wav', envelope(tone(SR * 0.12, 440, 0.15), 0.02, 0.3));

console.log('Done');
