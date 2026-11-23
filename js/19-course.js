/* 별빛 학습지 — 진도 관리 (다음 단원으로 나아가기 · 지난 단원 복습 · 진도표 화면) */
'use strict';

/* =====================================================================
   19. 진도 관리
   - 과목 카드를 누르면 '지금 단원'을 공부합니다.
   - 종합 테스트 70점 이상이면 단원 통과 → 다음 단원이 '지금 단원'이 됩니다.
   - 지난 단원은 다시 진도로 나오지 않고, 새 수업에 복습 문제 2~3개로 섞여 나옵니다.
       우선순위: 약한 개념이 있는 단원 > 통과 후 1·3·7·14·30일째인 단원(간격 복습) > 나머지
   - 처음 시작할 때는 지금 학기의 첫 단원부터. 그 앞 단원은 '배운 것으로 인정'하고 복습 문제로 확인합니다.
   - 진도표에서 지난 단원 '복습하기'(진도에 영향 없음), 원하는 단원 '여기부터 시작'을 고를 수 있어요.
   ===================================================================== */
const PASS_SCORE = 70;
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
const REVIEW_COUNT = (n) => (n >= 14 ? 3 : 2);
const semesterNow = () => { const m = new Date().getMonth() + 1; return m >= 3 && m <= 8 ? 1 : 2; };
const readyUnits = (ck) => (COURSE[ck] || []).filter((u) => isUnitReady(u.key));
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function courseState(ck) {
  const saved = S.save.course[ck];
  if (saved) return saved;
  const list = readyUnits(ck);
  const start = list.find((u) => u.sem === semesterNow()) || list[0] || null;
  const idx = start ? list.indexOf(start) : 0;
  return { cur: start ? start.key : null, done: {}, assumed: Object.fromEntries(list.slice(0, idx).map((u) => [u.key, true])) };
}
function saveCourseState(ck, st) {
  S.save = { ...S.save, course: { ...S.save.course, [ck]: st } };
  persist();
}
// 지금 공부할 단원: 저장된 단원이 아직 통과 전이면 그 단원, 아니면 그 뒤의 첫 미통과 단원 (끝까지 다 했으면 null)
function currentUnitKey(ck) {
  const st = courseState(ck), list = readyUnits(ck);
  const open = (u) => !st.done[u.key] && (!st.assumed[u.key] || u.key === st.cur);
  const from = Math.max(0, list.findIndex((u) => u.key === st.cur));
  const next = list.slice(from).find(open) || list.find(open);
  return next ? next.key : null;
}
function unitStatus(ck, key) {
  const st = courseState(ck);
  if (!isUnitReady(key)) return 'soon';
  if (st.done[key]) return 'done';
  if (key === currentUnitKey(ck)) return 'cur';
  if (st.assumed[key]) return 'assumed';
  return 'next';
}
// 단원 통과 기록 → 다음 단원 키를 돌려줌
function markUnitPassed(key) {
  const ck = courseOf(key), st = courseState(ck);
  const passed = { ...st, cur: key, done: { ...st.done, [key]: st.done[key] || todayStr() } };
  saveCourseState(ck, passed);
  const nextKey = currentUnitKey(ck);
  saveCourseState(ck, { ...passed, cur: nextKey });
  return nextKey;
}
// '여기부터 시작': 고른 단원 앞은 배운 것으로 인정, 뒤는 다시 공부할 단원으로
function setCourseStart(key) {
  const ck = courseOf(key), st = courseState(ck), list = readyUnits(ck), idx = list.findIndex((u) => u.key === key);
  const assumed = Object.fromEntries(list.slice(0, idx).filter((u) => !st.done[u.key]).map((u) => [u.key, true]));
  const done = Object.fromEntries(Object.entries(st.done).filter(([k]) => list.findIndex((u) => u.key === k) < idx));
  saveCourseState(ck, { cur: key, done, assumed });
}

/* ---------- 지난 단원 복습 문제 섞기 ---------- */
function reviewWeight(st, key) {
  const weak = Adaptive.weakest({ unit: key, limit: 5 }).length;
  const days = st.done[key] ? daysBetween(st.done[key], todayStr()) : null;
  return 1 + 3 * weak + (days != null && REVIEW_INTERVALS.includes(days) ? 2 : 0);
}
function pickWeighted(items, weights) {
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}
function reviewQuestions(ck, curKey, n, seen) {
  const st = courseState(ck);
  const learned = readyUnits(ck).filter((u) => u.key !== curKey && (st.done[u.key] || st.assumed[u.key]));
  if (!learned.length) return [];
  const weights = learned.map((u) => reviewWeight(st, u.key));
  const ids = new Set(seen), out = [];
  for (let t = 0; out.length < n && t < n * 6; t++) {
    const u = pickWeighted(learned, weights);
    const q = generatedPool(u.key, 1, ids)[0];
    if (!q) continue;
    ids.add(qid(q));
    out.push({ ...q, review: `${semLabel(u)} ${u.title}` });
  }
  return out;
}
// 수업 문제: 이번 단원 문제 + (진도 수업이면) 지난 단원 복습 2~3문제
function lessonQuestionsFor(ck, key, review) {
  const qs = buildLessonQuestions(key);
  if (review) return qs;
  const rv = reviewQuestions(ck, key, REVIEW_COUNT(qs.length), new Set(qs.map(qid)));
  return shuffle([...qs.slice(0, qs.length - rv.length), ...rv]);
}

/* ---------- 수업 결과 → 진도 반영 ---------- */
function applyUnitResult(L) {
  if (L.review || !courseUnit(L.key)) return { kind: 'practice' };
  const score = L.bestTestScore || 0;
  if (score < PASS_SCORE) return { kind: 'retry', score };
  const nextKey = markUnitPassed(L.key);
  return { kind: 'passed', score, next: nextKey ? courseUnit(nextKey) : null };
}
function unitResultHTML(res) {
  if (res.kind === 'passed') {
    return `<div class="unit-pass">🎉 단원 통과! (종합 테스트 ${res.score}점)${res.next ? `<br>다음 단원: <b>${esc(semLabel(res.next))} · ${esc(res.next.title)}</b>` : '<br>지금 준비된 단원을 모두 마쳤어요! 진도표에서 복습할 수 있어요.'}</div>`;
  }
  if (res.kind === 'retry') return `<div class="unit-retry">📍 종합 테스트 ${PASS_SCORE}점 이상이면 다음 단원으로 넘어가요. 이번 최고 ${res.score}점 — 한 번 더 도전해 볼까?</div>`;
  return '<div class="unit-retry">🔁 복습 수업이에요. 진도는 그대로예요.</div>';
}

/* ---------- 🗺️ 진도표 화면 ---------- */
const COURSE_STATUS = {
  done: ['✅', '통과'], assumed: ['📘', '배운 단원'], cur: ['📍', '지금 공부'], next: ['🔒', '다음 단원'], soon: ['⏳', '준비 중'],
};
function courseProgress(ck) {
  const list = readyUnits(ck), st = courseState(ck);
  return { passed: list.filter((u) => st.done[u.key]).length, total: list.length };
}
function courseItemHTML(ck, u) {
  const status = unitStatus(ck, u.key), [icon, label] = COURSE_STATUS[status], st = courseState(ck);
  const actions = status === 'cur' ? `<button class="bigbtn sm" data-cm="go" data-k="${u.key}">공부하기 ▶</button>`
    : status === 'done' || status === 'assumed' ? `<button class="ibtn soft" data-cm="review" data-k="${u.key}">🔁 복습하기</button><button class="ibtn soft" data-cm="start" data-k="${u.key}">여기부터 다시</button>`
    : status === 'next' ? `<button class="ibtn soft" data-cm="start" data-k="${u.key}">여기부터 시작</button>` : '';
  const when = status === 'done' ? ` <small>${st.done[u.key]}</small>` : '';
  return `<li class="cm-item st-${status}"><span class="cm-no">${esc(semLabel(u))}</span><b class="cm-title">${esc(u.title)}</b>
    <span class="cm-st">${icon} ${label}${when}</span><span class="cm-act">${actions}</span></li>`;
}
function renderCourseMap(ck, notice = '') {
  S.lesson = null;
  const [g, subj] = ck.split('-'), sj = SUBJECTS[subj], list = COURSE[ck] || [];
  const { passed, total } = courseProgress(ck), curKey = currentUnitKey(ck), cur = curKey ? courseUnit(curKey) : null;
  const sems = [0, 1, 2].map((s) => [s, list.filter((u) => u.sem === s)]).filter(([, us]) => us.length);
  const semName = (s) => (s ? `${s}학기` : '핵심 개념');
  setScreen(`<div class="wrap">${headerHTML(true)}
    <div class="lhead s-${subj}"><span class="ltag">🗺️ 진도표</span><h1>${g}학년 ${sj.icon} ${sj.name}</h1></div>
    <div class="cm-tabs" role="group" aria-label="과목">${['kor', 'math', 'eng'].map((k) => `<button class="fchip ${k === subj ? 'on' : ''}" data-cm="tab" data-k="${g}-${k}" aria-pressed="${k === subj}">${SUBJECTS[k].icon} ${SUBJECTS[k].name}</button>`).join('')}</div>
    ${notice ? `<div class="unit-pass">${esc(notice)}</div>` : ''}
    <section class="card cm-sum"><b>통과 ${passed} / ${total}단원</b><span>${cur ? `📍 지금: ${esc(semLabel(cur))} · ${esc(cur.title)}` : '🎉 준비된 단원을 모두 마쳤어요'}</span>
      <small>${esc(COURSE_SOURCE[subj])} · 종합 테스트 ${PASS_SCORE}점 이상이면 통과 · 지난 단원은 수업마다 복습 문제로 섞여 나와요</small></section>
    ${sems.map(([s, us]) => `<section class="card cm-sem"><h2>${semName(s)}</h2><ol class="cm-list">${us.map((u) => courseItemHTML(ck, u)).join('')}</ol></section>`).join('')}
  </div>`);
  $('.wrap').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cm]'); if (!b) return;
    const k = b.dataset.k, act = b.dataset.cm;
    if (act === 'tab') { renderCourseMap(k); return; }
    const u = courseUnit(k);
    if (act === 'go') startLesson(subj);
    else if (act === 'review') startLesson(subj, { unitKey: k, review: true });
    else if (act === 'start') {
      showAlert({ icon: '🗺️', title: '여기부터 시작할까요?', msg: `'${semLabel(u)} ${u.title}'부터 공부해요.`, detail: '이 단원 앞은 배운 단원으로, 뒤는 다시 공부할 단원으로 바뀌어요.',
        buttons: [{ label: '네, 여기부터!', primary: true, onClick: () => { setCourseStart(k); renderCourseMap(ck); } }, { label: '취소' }] });
    }
  });
  S.view = 'course';
  if (cur) teacherSay(`${g}학년 ${sj.name} 진도표야. 지금은 ${semLabel(cur)}, ${cur.title} 단원을 공부할 차례야!`, { speak: !notice });
}
