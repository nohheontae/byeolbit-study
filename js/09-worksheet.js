/* 별빛 학습지 — 학습지 문제 풀이 + 음성 힌트 */
'use strict';

/* =====================================================================
   8. 학습지 문제 풀이 + 선생님 음성 힌트
   ===================================================================== */
function pieSVG(n, d, size = 150) {
  const r = 60, cx = 70, cy = 70; let s = '';
  for (let i = 0; i < d; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / d, a1 = a0 + (2 * Math.PI) / d;
    s += `<path d="M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(2)} ${(cy + r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}Z" fill="${i < n ? '#FFC531' : '#FFF7E0'}" stroke="#E08A00" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 140 140" width="${size}" height="${size}" role="img" aria-label="${d}조각으로 나눈 원 그림">${s}</svg>`;
}
function qVisual(v) {
  if (!v) return '';
  if (v.t === 'dots') return `<div class="qv"><span class="grp">${v.e.repeat(v.a)}</span>${v.b != null ? `<span class="plus">+</span><span class="grp">${v.e.repeat(v.b)}</span>` : ''}</div>`;
  if (v.t === 'groups') return `<div class="qv">${Array.from({ length: v.count }, () => `<span class="grp">${v.e.repeat(v.size)}</span>`).join('')}</div>`;
  if (v.t === 'frac') return `<div class="qv">${pieSVG(v.n, v.d)}</div>`;
  if (v.t === 'big') return `<div class="qv big" role="img" aria-label="문제 그림">${esc(v.text)}</div>`;
  return '';
}
function renderWorksheet() {
  S.lesson.ws = { i: 0, stars: 0, tries: 0, locked: false };
  setScreen(`<div class="wrap">${lessonTop(1)}
    <div class="ws">
      <aside class="tpanel card">
        <div class="tav" id="teacherAv">${teacherSVG()}</div>
        <div class="bubble"><span id="bubbleText"></span></div>
        <button class="hintbtn" id="hintBtn">👩‍🏫 선생님 힌트 듣기</button>
        <button class="ibtn soft" id="readBtn">🔊 문제 다시 듣기</button>
      </aside>
      <section class="qcard card" id="qcard" aria-live="polite"></section>
    </div></div>`);
  $('#hintBtn').addEventListener('click', () => { const q = curQ(); if (q) { $('#hintBtn').classList.remove('wiggle'); S.lesson.ws.hinted = true; teacherSay(safeHint(q)); logHint(S.lesson.key); } });
  $('#readBtn').addEventListener('click', () => { const q = curQ(); if (q) teacherSay((q.p ? q.p + ' ' : '') + q.q); });
  showQ();
}
const curQ = () => { const L = S.lesson; return L && L.qs[L.ws.i]; };
const REMEDIAL_MAX = 3; // 한 수업에 끼워 넣는 '원리 다지기' 문제 최대 수
const DIFF_NAME = ['', '기초', '보통', '심화'];
// 문제 위에 표시: 개념 이름 · 난이도 · (원리 다지기 문제 표시)
const qMetaHTML = (q) => (q.conceptTag ? `<div class="qmeta">${q.review ? `<span class="qm-rev">🔁 복습 · ${esc(q.review)}</span>` : ''}${q.remedial ? '<span class="qm-rem">🧩 원리 다지기 문제</span>' : ''}<span class="qm-tag">${esc(conceptLabel(q.conceptTag))}</span><span class="qm-diff" aria-label="난이도 ${DIFF_NAME[q.difficulty]}">${'●'.repeat(q.difficulty)}${'○'.repeat(3 - q.difficulty)} ${DIFF_NAME[q.difficulty]}</span></div>` : '');
// 적응형 엔진이 '기초가 필요하다'고 판단하면 같은 개념의 기초·유사 문제를 at 위치에 끼워 넣음 (배열을 새로 만들어 교체)
function insertRemedial(ad, q, qs, at, owner) {
  if (!ad || !ad.needsBasics || (owner.remedials || 0) >= REMEDIAL_MAX) return;
  // 최대 문제 수(15)를 넘기지 않기: 이미 가득 찼으면 맨 뒤의 아직 안 푼 문제와 바꿔치기 (뒤에 남은 문제가 없으면 넣지 않음)
  const full = qs.length >= QUESTION_RANGE[1];
  if (full && at >= qs.length) return;
  const rem = Adaptive.remedial(q, new Set(qs.map(qid)));
  if (!rem) return;
  owner.remedials = (owner.remedials || 0) + 1;
  const rest = full ? qs.slice(at, -1) : qs.slice(at);
  owner.qs = [...qs.slice(0, at), rem, ...rest];
}
function showQ() {
  const L = S.lesson, W = L.ws, qs = L.qs, q = qs[W.i];
  W.tries = 0; W.locked = false; W.hinted = false; W.shownAt = performance.now();
  const choices = shuffle(q.ch.map(String));
  $('#qcard').innerHTML = `
    <div class="qhead"><span>문제 ${W.i + 1} / ${qs.length}</span><span>한 번에 맞힌 별 ⭐ ${W.stars}</span></div>
    ${qMetaHTML(q)}
    <div class="qprog"><i style="width:${(W.i / qs.length) * 100}%"></i></div>
    ${q.p ? `<div class="passage">${esc(q.p)}</div>` : ''}
    <h2 class="qtext">${esc(q.q)}</h2>
    ${qVisual(q.v)}
    <div class="choices">${choices.map((c) => `<button class="choice ${[...c].length > 10 ? 'long' : ''} ${isEmojiOnly(c) ? 'emo' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="fb" id="fb"></div>`;
  $('#qcard').querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => answer(b)));
  $('#hintBtn').classList.remove('wiggle');
  if (L.grade <= 2) teacherSay(`문제 ${W.i + 1}번! ${q.q}`);
  else teacherSay(`문제 ${W.i + 1}번이야! 천천히 읽고 골라 보자. 막히면 힌트 버튼을 눌러 줘.`);
}
function answer(btn) {
  const L = S.lesson, W = L.ws, qs = L.qs, q = qs[W.i];
  if (W.locked || btn.disabled) return;
  if (btn.dataset.c === String(q.a)) {
    W.locked = true; btn.classList.add('ok');
    $('#qcard').querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
    const first = W.tries === 0;
    if (first) { W.stars++; addStars(1); }
    const ad = logSolved(L.key, first, q, { hinted: W.hinted, ms: performance.now() - W.shownAt });
    insertRemedial(ad, q, qs, W.i + 1, L); // 필요하면 같은 개념의 기초 문제를 바로 다음에 끼워 넣기
    confetti(first ? 40 : 20);
    $('#fb').innerHTML = `<span class="good">${first ? '⭐ 한 번에 정답! 별 +1' : '🎉 끝까지 포기하지 않고 해냈어!'}</span>`;
    teacherSay(pick(PRAISE));
    later(() => { W.i++; if (W.i >= L.qs.length) worksheetDone(); else showQ(); }, 2000);
  } else {
    W.tries++; btn.classList.add('no'); btn.disabled = true;
    if (W.tries === 1) addWrongNote(L.key, q, btn.dataset.c); // 처음 틀린 문제는 오답노트에 저장
    const { coach, principle } = coachFor(q, btn.dataset.c);
    const lead = pick(ENCOURAGE_SHORT);
    $('#fb').innerHTML = coachBoxHTML(lead, coach, principle, W.tries === 1);
    teacherSay(`${lead} ${coach}`);
    if (W.tries >= 2) $('#hintBtn').classList.add('wiggle');
  }
}
function worksheetDone() {
  const L = S.lesson, W = L.ws;
  $('#qcard').innerHTML = `<div class="donebox"><div class="emo">📝✨</div>
    <b>학습지를 모두 풀었어요!</b><div>한 번에 맞힌 문제: <b>${W.stars}</b> / ${L.qs.length}개</div>
    <div>🎁 학습지 완료 보상: 몬스터 캡슐 ${capsuleSVG(22)} 1개!</div>
    <button class="bigbtn violet" id="toGame">🎮 몬스터 미니게임 하러 가기</button></div>`;
  earnBalls(1);
  $('#toGame').addEventListener('click', renderHunt);
  teacherSay('학습지 끝! 정말 수고했어. 선물로 몬스터 캡슐을 하나 줄게. 이제 숲속에 숨은 몬스터를 찾으러 가 볼까?');
}
