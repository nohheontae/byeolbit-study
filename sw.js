/* 별빛 학습지 — Service Worker (오프라인 캐싱)
 *
 * 전략
 *  - 설치 시 앱 실행에 필요한 파일(APP_SHELL)을 전부 미리 저장 → 첫 실행 이후 완전 오프라인 동작
 *  - 화면 요청(navigate): 저장된 index.html 로 즉시 응답 (비행기 모드에서도 앱이 열림)
 *  - 그 밖의 같은 출처 GET: 캐시 우선, 없으면 네트워크에서 받아 저장
 *  - 학습 기록·도감·저금통은 localStorage 에 있으므로 캐시 교체와 무관하게 유지됨
 *
 * 업데이트 방법: 파일을 고친 뒤 아래 CACHE_VERSION 숫자를 올려서 다시 배포하세요.
 *  → 앱이 새 버전을 내려받고 "새 버전이 있어요" 안내를 띄웁니다 (js/pwa.js).
 */
'use strict';

const CACHE_VERSION = 'v1.6.0';
const CACHE_NAME = `byeolbit-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `byeolbit-runtime-${CACHE_VERSION}`;

// index.html 의 <script>/<link> 목록과 반드시 일치해야 합니다.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './css/mobile.css',
  './js/00-util.js',
  './js/01-curriculum.js',
  './js/02-question-bank.js',
  './js/02a-course-core.js',
  './js/02b-g1-math.js',
  './js/02c-g1-kor.js',
  './js/02d-g1-eng.js',
  './js/02z-course-map.js',
  './js/03-monsters.js',
  './js/03a-monster-voice-files.js',
  /*MONSTER-AUDIO-START*/
  './audio/monsters/banjjak.wav',
  './audio/monsters/pongdang.wav',
  './audio/monsters/bulkkot.wav',
  './audio/monsters/saessak.wav',
  './audio/monsters/mongsil.wav',
  './audio/monsters/bawi.wav',
  './audio/monsters/eoreum.wav',
  './audio/monsters/borabu.wav',
  './audio/monsters/kkangchong.wav',
  './audio/monsters/donggeul.wav',
  './audio/monsters/beoseot.wav',
  /*MONSTER-AUDIO-END*/
  './js/04-store.js',
  './js/05-voice.js',
  './js/06-screens.js',
  './js/07-home.js',
  './js/08-video.js',
  './js/09-worksheet.js',
  './js/10-game-hunt.js',
  './js/11-game-battle-test.js',
  './js/12-dex.js',
  './js/13-coaching.js',
  './js/14-wrong-note.js',
  './js/15-report.js',
  './js/16-missions.js',
  './js/17-focus.js',
  './js/18-piggy.js',
  './js/19-course.js',
  './js/99-main.js',
  './js/pwa.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon.svg',
];

// 캐시하면 안 되는 경로 (TWA 앱 인증 파일 등)
const NEVER_CACHE = [/\/\.well-known\//];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' → 브라우저 HTTP 캐시를 건너뛰고 서버의 최신 파일을 저장
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' }))))
  );
  // 새 버전은 바로 교체하지 않고 대기 → 학습 도중 화면이 바뀌지 않도록 사용자가 '업데이트'를 누를 때 교체
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([CACHE_NAME, RUNTIME_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('byeolbit-') && !keep.has(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION' && event.ports[0]) event.ports[0].postMessage(CACHE_VERSION);
});

async function fromShell(request) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request, { ignoreSearch: true });
}

async function handleNavigate(request) {
  // 화면 요청은 항상 저장된 index.html 로 (#piggy 같은 바로가기 해시도 그대로 유지됨)
  const cached = (await fromShell(request)) || (await fromShell('./index.html'));
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch (err) {
    return new Response('<meta charset="utf-8"><h1 style="font-family:sans-serif">인터넷 연결 후 한 번만 열어 주세요 🌟</h1>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function handleAsset(request) {
  const cached = (await fromShell(request)) || (await caches.match(request, { ignoreSearch: true }));
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => { /* 저장 공간 부족 시 캐시만 생략 */ });
    }
    return res;
  } catch (err) {
    return new Response('', { status: 504, statusText: 'offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;           // 외부 요청은 관여하지 않음
  if (NEVER_CACHE.some((re) => re.test(url.pathname))) return;
  if (request.mode === 'navigate') { event.respondWith(handleNavigate(request)); return; }
  event.respondWith(handleAsset(request));
});
