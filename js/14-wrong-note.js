/* 별빛 학습지 — 오답노트 */
'use strict';

/* =====================================================================
   14. 오답노트 (팝업) — 틀린 문제 다시 풀기 + '복습 완료' 도장
   ===================================================================== */
const NOTE_TABS = [['todo', '복습 전'], ['done', '복습 완료'], ['all', '전체']];
let noteState = { tab: 'todo', retry: null, order: [], solved: false };
const focusIn = (modalId, sel) => { const el = (sel && $(`#${modalId} ${sel}`)) || $(`#${modalId} [data-n="close"], #${modalId} [data-r="close"]`); if (el) el.focus(); };
const noteMeta = (w) => { const n = unitName(w.key); return `${n.label} · ${esc(n.title)} · ${w.date}`; };
function openNote() {
  noteState = { tab: 'todo', retry: null, order: [], solved: false };
  openOverlay('noteModal', 'noteTitle', refreshNoteBadge);
  $('#noteModal').addEventListener('click', onNoteClick);
  renderNote(); focusIn('noteModal');
}
function renderNote() {
  const box = $('#noteModal .mbox'); if (!box) return;
  if (noteState.retry) { renderNoteRetry(box); return; }
  const todo = pendingWrongs(), done = S.save.wrongs.filter((w) => w.done);
  const list = noteState.tab === 'todo' ? todo : noteState.tab === 'done' ? done : S.save.wrongs;
  box.innerHTML = `<div class="dhead"><h2 id="noteTitle">📕 오답노트 · 다시 풀기</h2><span class="pill">⏳ 복습 전 ${todo.length}</span><span class="pill">🏅 복습 완료 ${done.length}</span><button class="ibtn" data-n="close" aria-label="오답노트 닫기">✕</button></div>
    <div class="dtabs" role="tablist" aria-label="오답 보기">${NOTE_TABS.map(([k, t]) => `<button role="tab" aria-selected="${k === noteState.tab}" class="dtab ${k === noteState.tab ? 'on' : ''}" data-n="tab" data-tab="${k}">${t}</button>`).join('')}</div>
    <p class="dtip">틀렸던 문제를 다시 풀어 맞히면 ⭐ 별 1개와 '복습 완료' 도장을 받아요!</p>
    <div class="nlist">${list.length ? [...list].reverse().map((w) => `<div class="ncard ${w.done ? 'done' : ''}">
        <div class="nmeta">${noteMeta(w)}</div>
        <div class="nq">${w.q.p ? '<span class="ntag">지문</span> ' : ''}${esc(w.q.q)}</div>
        <div class="npick">내가 고른 답: <s>${esc(w.picked)}</s> · 틀린 횟수 ${w.count}번</div>
        <div class="nbtns">${w.done ? `<span class="nstamp">🏅 복습 완료</span><button class="ibtn soft" data-n="retry" data-id="${esc(w.id)}">한 번 더 풀기</button>` : `<button class="bigbtn sm" data-n="retry" data-id="${esc(w.id)}">✏️ 다시 풀기</button>`}</div>
      </div>`).join('') : `<p class="dempty">${noteState.tab === 'todo' ? '🎉 다시 풀 오답이 없어요! 정말 잘했어요.' : '아직 여기에 들어갈 문제가 없어요.'}</p>`}</div>`;
}
function renderNoteRetry(box) {
  const w = S.save.wrongs.find((x) => x.id === noteState.retry);
  if (!w) { noteState = { ...noteState, retry: null }; renderNote(); return; }
  const q = w.q;
  box.innerHTML = `<div class="dhead"><button class="ibtn soft" data-n="back">‹ 목록</button><h2 id="noteTitle">✏️ 오답 다시 풀기</h2><button class="ibtn" data-n="close" aria-label="오답노트 닫기">✕</button></div>
    <div class="nretry"><div class="nmeta">${noteMeta(w)} · 지난번 고른 답: <s>${esc(w.picked)}</s></div>
      ${q.p ? `<div class="passage">${esc(q.p)}</div>` : ''}<h3 class="qtext">${esc(q.q)}</h3>${qVisual(q.v)}
      <div class="choices">${noteState.order.map((c) => `<button class="choice ${[...c].length > 10 ? 'long' : ''} ${isEmojiOnly(c) ? 'emo' : ''}" data-n="pick" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="nactions"><button class="hintbtn" data-n="hint">👩‍🏫 선생님 힌트 듣기</button><button class="ibtn soft" data-n="read">🔊 문제 듣기</button></div>
      <div id="noteFb" aria-live="polite"></div></div>`;
}
function onNoteClick(e) {
  const b = e.target.closest('[data-n]'); if (!b) return;
  const act = b.dataset.n;
  if (act === 'close') { closeOverlay('noteModal'); return; }
  if (act === 'tab') { noteState = { ...noteState, tab: b.dataset.tab }; renderNote(); focusIn('noteModal', `[data-tab="${b.dataset.tab}"]`); return; }
  if (act === 'retry') {
    const w = S.save.wrongs.find((x) => x.id === b.dataset.id); if (!w) return;
    noteState = { ...noteState, retry: w.id, order: shuffle(w.q.ch.map(String)), solved: false, hinted: false };
    renderNote(); focusIn('noteModal', '.choice');
    Voice.say(`다시 풀어 보자! ${w.q.q}`);
    return;
  }
  if (act === 'back') { noteState = { ...noteState, retry: null }; renderNote(); focusIn('noteModal'); return; }
  const w = S.save.wrongs.find((x) => x.id === noteState.retry); if (!w) return;
  if (act === 'hint') {
    const h = safeHint(w.q);
    $('#noteFb').innerHTML = `<div class="coach"><div class="coach-h">👩‍🏫 선생님 힌트</div><p>${esc(h)}</p></div>`;
    Voice.say(h); logHint(w.key); noteState = { ...noteState, hinted: true };
  }
  if (act === 'read') Voice.say(`${w.q.p ? `${w.q.p} ` : ''}${w.q.q}`);
  if (act !== 'pick' || noteState.solved || b.disabled) return;
  const c = b.dataset.c;
  if (c !== String(w.q.a)) {
    b.classList.add('no'); b.disabled = true; bumpWrongCount(w.id, c);
    const { coach, principle } = coachFor(w.q, c), lead = pick(ENCOURAGE_SHORT);
    $('#noteFb').innerHTML = coachBoxHTML(lead, coach, principle, false);
    Voice.say(`${lead} ${coach}`);
    return;
  }
  noteState = { ...noteState, solved: true };
  b.classList.add('ok');
  $('#noteModal').querySelectorAll('.choice').forEach((x) => { x.disabled = true; });
  const first = !w.done;
  if (first) { markWrongDone(w.id); addStars(1); bumpDay('reviewed'); }
  logSolved(w.key, true, noteQuestion(w), { hinted: !!noteState.hinted }); confetti(40);
  const next = pendingWrongs().find((x) => x.id !== w.id);
  $('#noteFb').innerHTML = `<div class="nstampbig"><span class="nsb-ico">🏅</span><b>복습 완료!</b><span>${first ? '⭐ 별 +1' : '한 번 더 맞혔어요!'}</span></div>
    <div class="nnext">${next ? `<button class="bigbtn sm" data-n="retry" data-id="${esc(next.id)}">다음 오답 풀기 ›</button>` : '<span class="td-ok">🎉 모든 오답을 복습했어요!</span>'}<button class="ibtn soft" data-n="back">목록으로</button></div>`;
  Voice.say(first ? '정답! 스스로 고쳐 냈구나. 복습 완료 도장 쾅! 별 하나 줄게.' : '정답! 이제 완전히 내 것이 됐네!');
}
