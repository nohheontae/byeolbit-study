/* 별빛 학습지 — 공용 유틸리티 ($, esc, 조사, 셔플 등) */
'use strict';

/* =====================================================================
   0. 유틸리티
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - t, 3);
const backOut = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const isEmojiOnly = (s) => /^[\p{Extended_Pictographic}️‍\s]+$/u.test(String(s));
function hasBatchim(word) {
  const w = String(word), c = w.charCodeAt(w.length - 1);
  return c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 !== 0 : null;
}
const josaEulReul = (w) => { const b = hasBatchim(w); return b === null ? '을(를)' : b ? '을' : '를'; };
const josaRo = (w) => { const b = hasBatchim(w); return b === null ? '(으)로' : b ? '으로' : '로'; };
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function starPath(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R; const a = -Math.PI / 2 + i * Math.PI / n;
    d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}
