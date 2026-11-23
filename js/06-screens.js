/* 별빛 학습지 — 화면 관리 · 헤더 · 공통 이벤트 */
'use strict';

/* =====================================================================
   5. 화면 관리
   ===================================================================== */
let cleanups = [];
function onCleanup(fn) { cleanups.push(fn); }
function later(fn, ms) { const id = setTimeout(fn, ms); onCleanup(() => clearTimeout(id)); return id; }
function animate(dur, step, done) {
  const t0 = performance.now(); let raf = 0;
  const f = (now) => { const t = clamp((now - t0) / dur); step(t); if (t < 1) raf = requestAnimationFrame(f); else if (done) done(); };
  raf = requestAnimationFrame(f);
  onCleanup(() => cancelAnimationFrame(raf));
}
function setScreen(html) {
  cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  cleanups = []; S.onMute = null; S.onModalClose = null; S.view = null;
  closeAlert();
  Voice.stop();
  $('#app').innerHTML = html;
  window.scrollTo({ top: 0 });
}
function confetti(n = 36) {
  const box = document.createElement('div'); box.className = 'confetti';
  const colors = ['#FF6F91', '#FFC531', '#3D8BFF', '#1FB37A', '#B18CFF', '#FF8A3D'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw'; s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.4 + 's'; s.style.animationDuration = 1.1 + Math.random() * 0.9 + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2800);
}
document.addEventListener('click', (e) => {
  const tr = e.target.closest('[data-train]'); // [취약 개념 바로 훈련하기] — 어느 화면·팝업에서든 동작
  if (tr) {
    ['reportModal', 'noteModal'].forEach((id) => { const m = document.getElementById(id); if (m) m.remove(); });
    if (dexState.open) closeDex();
    trainConcept(tr.dataset.train);
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'mute') toggleMute();
  if (b.dataset.act === 'voice') cycleTeacherVoice();
  if (b.dataset.act === 'home') renderHome();
  if (b.dataset.act === 'dex') openDex();
  if (b.dataset.act === 'note') openNote();
  if (b.dataset.act === 'report') openReport();
  if (b.dataset.act === 'focus') renderFocusSetup();
  if (b.dataset.act === 'piggy') openPiggy();
});

/* ---------- 공통 팝업(오답노트·리포트) 도우미 ---------- */
const isOverlayOpen = () => dexState.open || !!document.querySelector('#noteModal, #reportModal, #piggyModal');
function trapTab(e, root) {
  const items = [...root.querySelectorAll('button:not([disabled]), select, input')];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function openOverlay(id, labelledBy, onClose) {
  const old = document.getElementById(id); if (old) old.remove();
  Voice.stop();
  const el = document.createElement('div');
  el.id = id; el.className = 'modal';
  el.innerHTML = `<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="${labelledBy}"></div>`;
  el.lastFocus = document.activeElement; el.onCloseFn = onClose;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => { if (e.target === el) closeOverlay(id); });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeOverlay(id); } else if (e.key === 'Tab') trapTab(e, el); });
  return el.querySelector('.mbox');
}
function closeOverlay(id) {
  const el = document.getElementById(id); if (!el) return;
  el.remove(); Voice.stop();
  if (el.onCloseFn) el.onCloseFn();
  if (S.view === 'home') { renderHome(); return; } // 홈 화면 숫자(오늘 기록·오답 수) 새로 고침
  if (el.lastFocus && document.contains(el.lastFocus)) el.lastFocus.focus();
  if (S.onModalClose) S.onModalClose();
}

function headerHTML(inLesson) {
  return `<header class="top">
    ${inLesson ? '<button class="ibtn" data-act="home" aria-label="홈으로">🏠 홈</button>' : ''}
    <div class="logo"><span class="dot">🌟</span>별빛 학습지</div>
    <div class="spacer"></div>
    <div class="pill" title="모은 별">⭐ <span id="starCount">${S.save.stars}</span></div>
    <div class="pill" title="모은 몬스터 캡슐">${capsuleSVG(24)} <span id="ballCount">${S.save.balls}</span></div>
    <button class="ibtn piggybtn" id="piggyBtn" data-act="piggy" aria-haspopup="dialog" title="용돈 저금통">🐷<span class="hl"> 용돈 저금통</span> <b id="piggyAmt">${won(S.save.piggy.balance)}</b></button>
    <button class="ibtn dexbtn" data-act="dex" aria-haspopup="dialog" title="나의 몬스터 도감" aria-label="나의 몬스터 도감 (${caughtIds().length}/${MONSTERS.length}마리)">📒<span class="hl"> 나의 몬스터 도감</span> <small class="dexcnt">${caughtIds().length}/${MONSTERS.length}</small></button>
    <button class="ibtn notebtn" data-act="note" aria-haspopup="dialog" title="오답노트">📕<span class="hl"> 오답노트</span><span class="note-badge" ${pendingWrongs().length ? '' : 'hidden'}>${pendingWrongs().length}</span></button>
    <button class="ibtn reportbtn" data-act="report" aria-haspopup="dialog" title="학습 리포트">📊<span class="hl"> 학습 리포트</span></button>
    <button class="ibtn" data-act="voice" title="선생님 목소리 바꾸기">🎙️<span class="hl"> 목소리</span></button>
    <button class="ibtn ${Voice.muted ? 'muted' : ''}" data-act="mute" id="muteBtn" aria-pressed="${Voice.muted}">${Voice.muted ? '🔇 소리 끔' : '🔊 소리 켬'}</button>
  </header>`;
}
function lessonTop(step) {
  const L = S.lesson, sj = SUBJECTS[L.subj];
  const steps = ['개념 영상', '학습지 풀기', '몬스터 미니게임', '종합 테스트', '결과 & 보상'];
  return headerHTML(true) + `
    <div class="lhead s-${L.subj}"><span class="ltag">${L.grade}학년 ${sj.icon} ${sj.name}${courseUnit(L.key) ? ` · ${semLabel(courseUnit(L.key))}` : ''}${L.review ? ' · 🔁 복습' : ''}</span><h1>${esc(L.unit.title)}</h1></div>
    <ol class="steps" aria-label="학습 단계">${steps.map((s, i) => `<li class="${i < step ? 'done' : ''} ${i === step ? 'on' : ''}" ${i === step ? 'aria-current="step"' : ''}><span>${i < step ? '✔' : i + 1}</span>${s}</li>`).join('')}</ol>`;
}
