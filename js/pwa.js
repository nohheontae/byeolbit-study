/* 별빛 학습지 — PWA 연결부
 *  1) Service Worker 등록 + 새 버전 안내
 *  2) '앱으로 설치' 버튼 (Chrome 의 beforeinstallprompt)
 *  3) 안드로이드 뒤로가기: 팝업 닫기 → 홈으로 → (홈에서) 앱 종료
 *  4) 앱 아이콘 길게 누르기 바로가기(#piggy, #note) 처리
 *  5) 학습 기록이 지워지지 않도록 영구 저장소 요청
 */
'use strict';

(function pwaBootstrap() {
  const isNativeShell = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || isNativeShell;
  const canUseSW = 'serviceWorker' in navigator && window.isSecureContext && !isNativeShell; // 네이티브 APK 는 파일이 앱 안에 있으므로 불필요

  if (isStandalone()) document.documentElement.classList.add('is-standalone');

  /* ---------- 1) Service Worker ---------- */
  function showUpdateBar(worker) {
    if (document.getElementById('pwaUpdate')) return;
    const bar = document.createElement('div');
    bar.id = 'pwaUpdate'; bar.className = 'pwa-bar'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>✨ 새 버전이 준비됐어요!</span><button type="button" class="pwa-btn" data-pwa="update">지금 업데이트</button><button type="button" class="pwa-x" data-pwa="later" aria-label="나중에">✕</button>';
    bar.addEventListener('click', (e) => {
      const act = e.target.closest('[data-pwa]'); if (!act) return;
      if (act.dataset.pwa === 'update') worker.postMessage({ type: 'SKIP_WAITING' });
      bar.remove();
    });
    document.body.appendChild(bar);
  }

  if (canUseSW) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('sw.js', { scope: './' });
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateBar(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing; if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state !== 'installed') return;
            if (navigator.serviceWorker.controller) showUpdateBar(nw);
            else if (typeof toast === 'function') toast('📴 이제 인터넷이 없어도 별빛 학습지를 쓸 수 있어요!');
          });
        });
        // 앱을 다시 볼 때마다 새 버전 확인 (오프라인이면 조용히 실패)
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
      } catch (err) {
        console.warn('[PWA] Service Worker 등록 실패:', err);
      }
    });
    // '지금 업데이트'로 새 버전이 활성화되면 한 번만 새로고침 (첫 설치 때는 새로고침하지 않음)
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }

  /* ---------- 2) 앱으로 설치 버튼 ---------- */
  let deferredPrompt = null;
  function hideInstall() { const b = document.getElementById('pwaInstall'); if (b) b.remove(); }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (document.getElementById('pwaInstall')) return;
    const btn = document.createElement('button');
    btn.id = 'pwaInstall'; btn.type = 'button'; btn.className = 'pwa-install';
    btn.innerHTML = '📲 <b>앱으로 설치</b>';
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      if (choice && choice.outcome === 'accepted') hideInstall();
    });
    document.body.appendChild(btn);
  });
  window.addEventListener('appinstalled', () => {
    hideInstall();
    if (typeof toast === 'function') toast('🎉 홈 화면에 별빛 학습지가 설치됐어요!');
  });

  /* ---------- 3) 안드로이드 뒤로가기 ---------- */
  // 설치형 앱에서는 뒤로가기 = 앱 종료가 기본이라, 아이가 실수로 꺼 버리지 않도록 단계별로 처리
  function handleBack() {
    const modals = document.querySelectorAll('.modal');
    if (modals.length && typeof closeOverlay === 'function') { closeOverlay(modals[modals.length - 1].id); return true; }
    const home = document.querySelector('[data-act="home"]');
    if (home) { home.click(); return true; }
    return false; // 홈 화면 → 기본 동작(앱 닫기)
  }
  if (isStandalone()) {
    const GUARD = { byeolbit: 'guard' };
    history.replaceState({ byeolbit: 'root' }, '');
    history.pushState(GUARD, '');
    window.addEventListener('popstate', () => {
      if (handleBack()) history.pushState(GUARD, '');
      else history.back(); // 루트 상태에서 한 번 더 뒤로 → 앱 종료
    });
  }

  /* ---------- 4) 바로가기(manifest shortcuts) ---------- */
  function openFromHash() {
    const map = { '#piggy': 'piggy', '#note': 'note', '#report': 'report', '#dex': 'dex' };
    const act = map[window.location.hash];
    if (!act) return;
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
    const btn = document.querySelector(`[data-act="${act}"]`);
    if (btn) btn.click();
  }
  window.addEventListener('load', () => setTimeout(openFromHash, 300));

  /* ---------- 5) 영구 저장소 (학습 기록·저금통 보호) ---------- */
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then((ok) => (ok ? true : navigator.storage.persist())).catch(() => {});
  }
}());
