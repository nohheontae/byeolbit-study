/* 별빛 학습지 — 시험 대비 집중 모드 */
'use strict';

/* =====================================================================
   17. 시험 대비 집중 모드
   - 학년·과목 안에서 유형을 골라 🧘 시간 제한 없이 차분히 연습하거나
     🔥 10문제 연속 도전(문제마다 기회 한 번)으로 실력 점검
   - 힌트·맞춤 코칭·오답노트·학습 기록은 수업과 똑같이 동작
   ===================================================================== */
const FOCUS_ALL = '전체 섞어서';
const CHALLENGE_SIZE = 10;
const FOCUS_MODES = {
  practice: { icon: '🧘', label: '차분히 연습', desc: '시간 제한 없이 원하는 만큼! 5문제를 한 번에 맞힐 때마다 ⭐ +1' },
  challenge: { icon: '🔥', label: `${CHALLENGE_SIZE}문제 연속 도전`, desc: '문제마다 기회는 한 번! 실력을 점검하고 최고 기록에 도전해요' },
};
let focusSel = null;
// 집중 모드에서 고를 수 있는 단원: 진도표에서 배운 단원 + 지금 단원 (없으면 준비된 첫 단원)
function focusUnits(grade, subj) {
  const ck = `${grade}-${subj}`, ready = readyUnits(ck);
  const learned = ready.filter((u) => ['done', 'assumed', 'cur'].includes(unitStatus(ck, u.key)));
  return learned.length ? learned : ready.slice(0, 1);
}
function focusKey(s) {
  const units = focusUnits(s.grade, s.subj);
  // 취약 개념 훈련은 그 개념이 나온 단원(예전 단원 포함)을 그대로 씀
  if (s.unit && UNITS[s.unit] && (s.concept || units.some((u) => u.key === s.unit))) return s.unit;
  const cur = currentUnitKey(`${s.grade}-${s.subj}`);
  return (units.find((u) => u.key === cur) || units[units.length - 1] || { key: `${s.grade}-${s.subj}` }).key;
}
const focusTypeName = (s) => (s.concept ? `🩺 ${conceptLabel(s.concept)}` : s.type < 0 ? FOCUS_ALL : FOCUS_TYPES[focusKey(s)][s.type][0]);
// [취약 개념 바로 훈련하기]: 그 개념만 나오는 '차분히 연습' (적응형 난이도·기초 다지기 문제 포함)
function trainConcept(tag) {
  const unit = Adaptive.stat(tag).unit || questionBank.byConcept(tag).map((q) => q.unit)[0];
  if (!unit) return;
  const [g, s] = unit.split('-');
  startFocus({ grade: Number(g), subj: s, unit, type: -1, mode: 'practice', concept: tag });
}
function renderFocusSetup() {
  S.lesson = null;
  const p = S.save.prefs.focus || {};
  focusSel = focusSel || { grade: S.grade, subj: p.subj || 'math', type: 0, mode: p.mode || 'practice' };
  setScreen(`<div class="wrap">${headerHTML(true)}
    <div class="lhead s-math"><span class="ltag">🎯 집중 모드</span><h1>시험 대비 집중 모드</h1></div>
    <p class="gdesc">연습하고 싶은 유형만 골라 집중해 보아요. 선생님 힌트와 맞춤 코칭, 오답노트는 그대로 함께해요!</p>
    <section class="fsetup card" id="fsetup"></section></div>`);
  drawFocusSetup();
  $('#fsetup').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    const f = b.dataset.f, v = b.dataset.v;
    if (f === 'start') { startFocus(focusSel); return; }
    if (f === 'grade') focusSel = { ...focusSel, grade: Number(v), unit: null, type: 0 };
    if (f === 'subj') focusSel = { ...focusSel, subj: v, unit: null, type: 0 };
    if (f === 'unit') focusSel = { ...focusSel, unit: v, type: 0 };
    if (f === 'type') focusSel = { ...focusSel, type: Number(v) };
    if (f === 'mode') focusSel = { ...focusSel, mode: v };
    drawFocusSetup();
    const again = $(`#fsetup [data-f="${f}"][data-v="${v}"]`); if (again) again.focus();
  });
  Voice.say('시험 대비 집중 모드야! 연습하고 싶은 유형과 방식을 골라 줘.');
}
function drawFocusSetup() {
  const s = focusSel, key = focusKey(s), unit = UNITS[key];
  const best = (t) => S.save.focusBest[`${key}|${t}`];
  const bestTag = (t) => (best(t) != null ? ` <em>최고 ${best(t)}/${CHALLENGE_SIZE}</em>` : '');
  const chip = (f, v, on, label) => `<button class="fchip ${on ? 'on' : ''}" data-f="${f}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  $('#fsetup').innerHTML = `
    <div class="fs-step"><h3>1. 학년</h3><div class="fs-row">${[1, 2, 3, 4, 5, 6].map((g) => chip('grade', g, g === s.grade, `${g}학년`)).join('')}</div></div>
    <div class="fs-step"><h3>2. 과목</h3><div class="fs-row">${['kor', 'math', 'eng'].map((k) => chip('subj', k, k === s.subj, `${SUBJECTS[k].icon} ${SUBJECTS[k].name}`)).join('')}</div></div>
    <div class="fs-step"><h3>3. 단원 <small>배운 단원과 지금 단원</small></h3><div class="fs-row">${focusUnits(s.grade, s.subj).map((u) => chip('unit', u.key, u.key === key, `${esc(semLabel(u))} ${esc(u.title)}`)).join('')}</div></div>
    <div class="fs-step"><h3>4. 연습할 유형 <small>${s.grade}학년 ${SUBJECTS[s.subj].name} · ${esc(unit.title)}</small></h3>
      <div class="fs-row">${FOCUS_TYPES[key].map(([name], i) => chip('type', i, i === s.type, `${esc(name)}${bestTag(name)}`)).join('')}${chip('type', -1, s.type === -1, `🔀 ${FOCUS_ALL}${bestTag(FOCUS_ALL)}`)}</div></div>
    <div class="fs-step"><h3>5. 연습 방식</h3><div class="fs-modes">${Object.entries(FOCUS_MODES).map(([k, m]) => `<button class="fmode ${k === s.mode ? 'on' : ''}" data-f="mode" data-v="${k}" aria-pressed="${k === s.mode}"><span class="lv-ico">${m.icon}</span><b>${m.label}</b><small>${m.desc}</small></button>`).join('')}</div></div>
    <div class="fs-go"><button class="bigbtn" data-f="start" data-v="go">🚀 ${esc(focusTypeName(s))} · ${FOCUS_MODES[s.mode].label} 시작!</button></div>`;
}
function startFocus(sel) {
  S.lesson = null; S.grade = sel.grade;
  S.save = { ...S.save, grade: sel.grade, prefs: { ...S.save.prefs, focus: { subj: sel.subj, mode: sel.mode } } };
  persist();
  const key = focusKey(sel), typeName = focusTypeName(sel), challenge = sel.mode === 'challenge', sj = SUBJECTS[sel.subj];
  // 출제할 개념: 취약 개념 훈련이면 그 개념 하나, 유형을 골랐으면 그 유형의 개념들, '전체'면 단원 전체
  const tags = sel.concept ? [sel.concept] : sel.type < 0 ? null : uniq(FOCUS_TYPES[key][sel.type][1].map((i) => GEN_META[key][i][0]));
  const bankPool = sel.concept ? questionBank.byUnit(key).filter((q) => q.conceptTag === sel.concept) : sel.type < 0 ? questionBank.byUnit(key) : [];
  const F = { seen: new Set(), queue: [], q: null, tries: 0, locked: false, done: false, idx: 0, solved: 0, firstRight: 0, streak: 0, bestStreak: 0, results: [], hinted: false, shownAt: 0 };
  const refill = () => {
    const fromBank = () => shuffle(bankPool.filter((q) => !F.seen.has(qid(q)))).slice(0, 3);
    // 적응형 난이도가 빨리 반영되도록 조금씩(5문제) 만들어 둡니다
    let fresh = [...fromBank(), ...generatedPool(key, 5, F.seen, tags)];
    if (!fresh.length) { F.seen = new Set(); fresh = [...fromBank(), ...generatedPool(key, 5, F.seen, tags)]; } // 다 풀었으면 처음부터 다시
    if (!fresh.length) fresh = generatedPool(key, 10, new Set()); // 그래도 없으면 같은 단원 문제로
    fresh.forEach((q) => F.seen.add(qid(q)));
    F.queue = [...F.queue, ...shuffle(fresh)];
  };
  setScreen(`<div class="wrap">${headerHTML(true)}
    <div class="lhead s-${sel.subj}"><span class="ltag">${sel.grade}학년 ${sj.icon} ${sj.name}</span><h1>🎯 ${esc(typeName)}</h1><span class="fbadge">${FOCUS_MODES[sel.mode].icon} ${FOCUS_MODES[sel.mode].label}</span></div>
    <div class="ws">
      <aside class="tpanel card">
        <div class="tav" id="teacherAv">${teacherSVG()}</div>
        <div class="bubble"><span id="bubbleText"></span></div>
        <button class="hintbtn" id="hintBtn">👩‍🏫 선생님 힌트 듣기</button>
        <button class="ibtn soft" id="readBtn">🔊 문제 다시 듣기</button>
        <button class="ibtn" id="stopBtn">${challenge ? '⏹ 도전 그만두기' : '⏹ 그만하고 결과 보기'}</button>
      </aside>
      <section class="qcard card" id="fq" aria-live="polite"></section>
    </div></div>`);

  const statsHTML = () => (challenge
    ? `<div class="qhead"><span>문제 ${Math.min(F.idx + 1, CHALLENGE_SIZE)} / ${CHALLENGE_SIZE}</span><span>맞힌 문제 ✅ ${F.firstRight} · 연속 🔥 ${F.streak}</span></div>
       <div class="qprog"><i style="width:${(F.idx / CHALLENGE_SIZE) * 100}%"></i></div>
       <div class="fdots" aria-hidden="true">${Array.from({ length: CHALLENGE_SIZE }, (_, i) => { const r = F.results[i]; return `<span class="fdot ${r === true ? 'ok' : r === false ? 'no' : i === F.idx ? 'now' : ''}">${r === true ? '⭕' : r === false ? '❌' : i + 1}</span>`; }).join('')}</div>`
    : `<div class="qhead"><span>푼 문제 ✏️ ${F.solved}</span><span>한 번에 맞힘 ✅ ${F.firstRight} · 연속 🔥 ${F.streak} (최고 ${F.bestStreak})</span></div>
       <div class="qprog"><i style="width:${((F.firstRight % 5) / 5) * 100}%"></i></div>
       <p class="fnote">5문제를 한 번에 맞힐 때마다 ⭐ +1 · 다음 별까지 ${5 - (F.firstRight % 5)}문제!</p>`);
  const show = () => {
    if (!F.queue.length) refill();
    F.q = F.queue.shift(); F.tries = 0; F.locked = false; F.hinted = false; F.shownAt = performance.now();
    const q = F.q, choices = shuffle(q.ch.map(String));
    $('#fq').innerHTML = `${statsHTML()}${qMetaHTML(q)}${q.p ? `<div class="passage">${esc(q.p)}</div>` : ''}<h2 class="qtext">${esc(q.q)}</h2>${qVisual(q.v)}
      <div class="choices">${choices.map((c) => `<button class="choice ${[...c].length > 10 ? 'long' : ''} ${isEmojiOnly(c) ? 'emo' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="fb" id="ffb"></div>`;
    $('#hintBtn').classList.remove('wiggle');
    teacherSay(sel.grade <= 2 ? q.q : `${challenge ? `${F.idx + 1}번 문제!` : '다음 문제!'} 천천히 읽고 골라 보자. 막히면 힌트를 들어 봐.`);
  };
  const next = () => {
    if (challenge) { F.idx++; if (F.idx >= CHALLENGE_SIZE) { finish(false); return; } }
    show();
  };
  const answer = (btn) => {
    const q = F.q;
    if (F.locked || F.done || btn.disabled) return;
    if (btn.dataset.c === String(q.a)) {
      F.locked = true; btn.classList.add('ok');
      $('#fq').querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
      const first = F.tries === 0;
      F.solved++;
      const ad = logSolved(key, first, q, { hinted: F.hinted, ms: performance.now() - F.shownAt });
      // 난이도가 바뀌면 미리 만들어 둔 같은 개념의 생성 문제를 버리고 새 난이도로 다시 생성
      if (ad && ad.change) F.queue = F.queue.filter((x) => x.conceptTag !== q.conceptTag || !String(x.id).startsWith('gen:'));
      if (!challenge && ad && ad.needsBasics) { const rem = Adaptive.remedial(q, F.seen); if (rem) { F.seen.add(qid(rem)); F.queue = [rem, ...F.queue]; } } // 연습 모드: 기초 다지기 문제를 바로 다음에
      if (first) { F.firstRight++; F.streak++; F.bestStreak = Math.max(F.bestStreak, F.streak); } else F.streak = 0;
      if (challenge) F.results = [...F.results, true];
      let extra = '';
      if (!challenge && first && F.firstRight % 5 === 0) { addStars(1); extra = ' 5문제 달성! ⭐ +1'; confetti(40); }
      $('#ffb').innerHTML = `<span class="good">${first ? `⭕ 정답! 연속 ${F.streak}개 🔥` : '🎉 끝까지 해냈어!'}${extra}</span>`;
      teacherSay(`${pick(PRAISE)}${extra}`);
      later(next, 1500);
      return;
    }
    btn.classList.add('no'); btn.disabled = true;
    if (F.tries === 0) addWrongNote(key, q, btn.dataset.c);
    F.tries++; F.streak = 0;
    const { coach, principle } = coachFor(q, btn.dataset.c), lead = pick(ENCOURAGE_SHORT);
    if (challenge) { // 도전 모드: 기회 한 번 → 코칭(정답 비공개) 후 다음 문제로
      F.locked = true; F.solved++; F.results = [...F.results, false];
      const ad = logSolved(key, false, q, { hinted: F.hinted, ms: performance.now() - F.shownAt });
      if (ad && ad.change) F.queue = F.queue.filter((x) => x.conceptTag !== q.conceptTag || !String(x.id).startsWith('gen:'));
      $('#fq').querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
      $('#ffb').innerHTML = `${coachBoxHTML(lead, coach, principle, true)}<button class="bigbtn sm fnext" data-fz="next">다음 문제 ›</button>`;
      $('#ffb [data-fz="next"]').focus();
    } else {
      $('#ffb').innerHTML = coachBoxHTML(lead, coach, principle, F.tries === 1);
      if (F.tries >= 2) $('#hintBtn').classList.add('wiggle');
    }
    teacherSay(`${lead} ${coach}`);
  };
  const finish = (stopped) => {
    F.done = true; F.locked = true;
    $('#stopBtn').hidden = true;
    const btns = `<div class="rbtns"><button class="bigbtn" data-fz="again">${challenge ? '🔥 다시 도전' : '🧘 계속 연습하기'}</button>
      <button class="ibtn soft" data-fz="setup">🎛️ 다른 유형 고르기</button>
      ${pendingWrongs().length ? '<button class="ibtn soft" data-act="note">📕 오답 다시 풀기</button>' : ''}<button class="ibtn soft" data-act="home">🏠 홈으로</button></div>`;
    if (challenge && !stopped) {
      const score = F.firstRight, stars = score >= 9 ? 3 : score >= 7 ? 2 : 1, bk = `${key}|${typeName}`, prev = S.save.focusBest[bk];
      const record = prev == null || score > prev;
      S.save = { ...S.save, focusBest: { ...S.save.focusBest, [bk]: record ? score : prev }, perfects: S.save.perfects + (score === CHALLENGE_SIZE ? 1 : 0) };
      persist();
      addStars(stars); bumpDay('challenges');
      $('#fq').innerHTML = `<div class="donebox"><div class="emo">${score === CHALLENGE_SIZE ? '🏆' : score >= 7 ? '🎉' : '💪'}</div>
        <b>${CHALLENGE_SIZE}문제 연속 도전 결과: ${score} / ${CHALLENGE_SIZE}</b>
        <div class="fdots">${F.results.map((r) => `<span class="fdot ${r ? 'ok' : 'no'}">${r ? '⭕' : '❌'}</span>`).join('')}</div>
        <div>⭐ 별 ${stars}개 · 최고 연속 정답 🔥 ${F.bestStreak} · ${record ? '🎊 새 최고 기록!' : `최고 기록 ${prev}/${CHALLENGE_SIZE}`}</div>
        ${score < CHALLENGE_SIZE ? '<div class="fnote">틀린 문제는 📕 오답노트에 담겼어요. 복습하고 다시 도전하면 기록이 올라가요!</div>' : ''}${btns}</div>`;
      if (score >= 7) confetti(60);
      teacherSay(score === CHALLENGE_SIZE ? '와, 열 문제 모두 한 번에 맞혔어! 만점이야, 정말 대단해!' : score >= 7 ? `${score}문제나 맞혔어! 실력이 쑥쑥 늘고 있어!` : '끝까지 도전한 것만으로도 멋져! 오답노트로 복습하고 다시 도전해 보자!');
    } else {
      $('#fq').innerHTML = `<div class="donebox"><div class="emo">🧘</div><b>${challenge ? '도전을 멈췄어요' : '오늘의 집중 연습 결과'}</b>
        <div>푼 문제 ✏️ ${F.solved}개 · 한 번에 맞힘 ✅ ${F.firstRight}개 · 최고 연속 🔥 ${F.bestStreak}</div>${btns}</div>`;
      teacherSay(F.solved ? `${F.solved}문제나 풀었어! 꾸준히 하는 게 최고의 비법이야.` : '언제든 다시 와서 연습하자!');
    }
  };
  $('#fq').addEventListener('click', (e) => {
    const c = e.target.closest('.choice'); if (c) { answer(c); return; }
    const z = e.target.closest('[data-fz]'); if (!z) return;
    if (z.dataset.fz === 'next') next();
    if (z.dataset.fz === 'again') startFocus(sel);
    if (z.dataset.fz === 'setup') renderFocusSetup();
  });
  $('#hintBtn').addEventListener('click', () => { if (F.q && !F.done) { $('#hintBtn').classList.remove('wiggle'); F.hinted = true; teacherSay(safeHint(F.q)); logHint(key); } });
  $('#readBtn').addEventListener('click', () => { if (F.q && !F.done) teacherSay(`${F.q.p ? `${F.q.p} ` : ''}${F.q.q}`); });
  $('#stopBtn').addEventListener('click', () => { if (!F.done) finish(true); });
  show();
}
