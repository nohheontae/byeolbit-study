/* 별빛 학습지 — 저장(localStorage) & 상태 */
'use strict';

/* =====================================================================
   3. 저장 & 상태
   ===================================================================== */
const STORE_KEY = 'byeolbit-study-v1';
// 도감 기록: dex = { [몬스터id]: { count: 포획 횟수, first: 'YYYY-MM-DD' | null, stage: 1~3 } }
function parseDex(d) {
  const dex = {};
  if (d.dex && typeof d.dex === 'object') {
    MONSTERS.forEach((m) => {
      const v = d.dex[m.id];
      if (v && typeof v === 'object') dex[m.id] = { count: Math.max(1, Number(v.count) || 1), first: typeof v.first === 'string' ? v.first : null, stage: Number.isInteger(v.stage) && v.stage >= 1 && v.stage <= MAX_STAGE ? v.stage : 1 };
    });
  }
  // 1단계 저장 형식(caught 배열) 이전
  if (Array.isArray(d.caught)) d.caught.forEach((id) => { if (!dex[id] && MONSTERS.some((m) => m.id === id)) dex[id] = { count: 1, first: null, stage: 1 }; });
  return dex;
}
function loadSave() {
  const empty = { stars: 0, balls: 0, dex: {}, best: {}, muted: false, grade: 1, log: {}, wrongs: [], prefs: {}, gold: 0, badges: {}, missionDays: [], focusBest: {}, perfects: 0, mastery: {}, piggy: emptyPiggy(), course: {}, typeCaps: {} };
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!d || typeof d !== 'object') return empty;
    return {
      stars: Math.max(0, Number(d.stars) || 0), balls: Math.max(0, Number(d.balls) || 0),
      dex: parseDex(d),
      best: d.best && typeof d.best === 'object' ? d.best : {},
      muted: !!d.muted, grade: [1, 2, 3, 4, 5, 6].includes(d.grade) ? d.grade : 1,
      log: d.log && typeof d.log === 'object' ? d.log : {},
      wrongs: Array.isArray(d.wrongs) ? d.wrongs.filter((w) => w && w.id && w.q && w.q.q && Array.isArray(w.q.ch) && w.q.a != null) : [],
      prefs: d.prefs && typeof d.prefs === 'object' ? d.prefs : {},
      gold: Math.max(0, Number(d.gold) || 0),
      badges: d.badges && typeof d.badges === 'object' ? d.badges : {},
      missionDays: Array.isArray(d.missionDays) ? d.missionDays.filter((x) => typeof x === 'string') : [],
      focusBest: d.focusBest && typeof d.focusBest === 'object' ? d.focusBest : {},
      perfects: Math.max(0, Number(d.perfects) || 0),
      mastery: d.mastery && typeof d.mastery === 'object' ? d.mastery : {},
      piggy: parsePiggy(d.piggy),
      course: parseCourse(d.course),
      typeCaps: parseTypeCaps(d.typeCaps),
    };
  } catch (e) { return empty; }
}
/* ---------- 🐷 용돈 저금통 저장 형식 (loadSave보다 먼저 쓰이므로 함수 선언으로 둡니다) ----------
   piggy = { balance, totalEarned, totalPaid, goalName, goalAmount, pinHash,
             ledger: [{ id, ts(밀리초), date:'YYYY-MM-DD', type:'earn'|'payout', amount, missionId?, title, memo? }] } */
// 타입 캡슐: typeCaps = { '불꽃 타입': 개수, ... } (몬스터 타입 이름이 열쇠)
function parseTypeCaps(t) {
  if (!t || typeof t !== 'object') return {};
  return Object.fromEntries(Object.entries(t).filter(([type, n]) => MONSTER_TYPES.includes(type) && Number.isInteger(n) && n > 0));
}
/* ---------- 🗺️ 진도 기록 ----------
   course = { '1-math': { cur: 지금 공부할 단원 키, done: { 단원키: 통과한 날 }, assumed: { 단원키: true(이전 학기라 배운 것으로 인정) } } } */
function parseCourse(c) {
  if (!c || typeof c !== 'object') return {};
  const day = /^\d{4}-\d{2}-\d{2}$/;
  return Object.fromEntries(Object.entries(c).filter(([, v]) => v && typeof v === 'object').map(([ck, v]) => [ck, {
    cur: typeof v.cur === 'string' ? v.cur : null,
    done: Object.fromEntries(Object.entries(v.done || {}).filter(([, d]) => day.test(String(d)))),
    assumed: Object.fromEntries(Object.entries(v.assumed || {}).filter(([, a]) => a === true)),
  }]));
}
function piggyPinHash(pin) { return hashStr(`byeolbit-piggy:${pin}`); }
function emptyPiggy() { return { balance: 0, totalEarned: 0, totalPaid: 0, goalName: '갖고 싶은 선물', goalAmount: 5000, pinHash: piggyPinHash('0000'), ledger: [] }; }
function parsePiggy(p) {
  const e = emptyPiggy();
  if (!p || typeof p !== 'object') return e;
  const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.round(Number(v)) : d);
  return {
    balance: num(p.balance, 0), totalEarned: num(p.totalEarned, 0), totalPaid: num(p.totalPaid, 0),
    goalName: typeof p.goalName === 'string' && p.goalName.trim() ? p.goalName.trim().slice(0, 20) : e.goalName,
    goalAmount: num(p.goalAmount, 0) >= 1000 ? num(p.goalAmount, 5000) : e.goalAmount,
    pinHash: typeof p.pinHash === 'string' && p.pinHash ? p.pinHash : e.pinHash,
    ledger: Array.isArray(p.ledger) ? p.ledger.filter((x) => x && ['earn', 'payout'].includes(x.type) && Number(x.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(String(x.date))) : [],
  };
}
const S = { save: loadSave(), lesson: null, onMute: null };
S.grade = S.save.grade;
function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S.save)); } catch (e) { /* 저장소를 쓸 수 없는 환경: 진행은 계속됨 */ } }
function bump(el) { if (!el) return; el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 250); }
function addStars(n) {
  S.save = { ...S.save, stars: S.save.stars + n }; persist();
  if (n > 0) updateLog((l) => ({ ...l, stars: l.stars + n }));
  const el = $('#starCount'); if (el) { el.textContent = S.save.stars; bump(el.parentElement); }
}
function addBalls(n) {
  S.save = { ...S.save, balls: S.save.balls + n }; persist();
  if (n > 0) updateLog((l) => ({ ...l, balls: l.balls + n }));
  const el = $('#ballCount'); if (el) { el.textContent = S.save.balls; bump(el.parentElement); }
}

/* ---------- 날짜별 학습 기록 (리포트용, 최근 30일 보관) ----------
   log = { 'YYYY-MM-DD': { solved, correct, stars, balls, hints, caught:[id], units: { '3-math': { solved, correct, wrong, hints } } } } */
const LOG_KEEP_DAYS = 30;
const emptyDay = () => ({ solved: 0, correct: 0, stars: 0, balls: 0, hints: 0, caught: [], units: {}, huntClears: 0, memClears: 0, tests: 0, challenges: 0, reviewed: 0, missions: null, claimed: [], notified: [] });
const dayLog = (date) => ({ ...emptyDay(), ...(S.save.log[date] || {}) });
function updateLog(fn) {
  const d = todayStr();
  const days = Object.keys({ ...S.save.log, [d]: 1 }).sort().slice(-LOG_KEEP_DAYS);
  const next = Object.fromEntries(days.map((k) => [k, k === d ? fn(dayLog(d)) : S.save.log[k]]));
  S.save = { ...S.save, log: next };
  persist();
  checkMissions(); // 오늘의 미션 달성 · 배지 확인
}
const bumpDay = (field) => updateLog((l) => ({ ...l, [field]: (l[field] || 0) + 1 }));
const unitLog = (l, key) => ({ solved: 0, correct: 0, wrong: 0, hints: 0, ...(l.units[key] || {}) });
// 문제 하나의 결과 기록: 날짜별 리포트 + (문제 레코드가 있으면) 적응형 엔진의 개념별 기록
// 반환값: 적응형 판단 { change(난이도 변화 -1/0/1), needsBasics(기초 문제 필요), slow } 또는 null
function logSolved(key, ok, q = null, { hinted = false, ms = null } = {}) {
  updateLog((l) => {
    const u = unitLog(l, key);
    return { ...l, solved: l.solved + 1, correct: l.correct + (ok ? 1 : 0), units: { ...l.units, [key]: { ...u, solved: u.solved + 1, correct: u.correct + (ok ? 1 : 0), wrong: u.wrong + (ok ? 0 : 1) } } };
  });
  return q ? Adaptive.record(q, { ok, hinted, ms }) : null;
}
// 오답노트에 저장된 문제(평범한 객체)를 개념 정보가 있는 문제로 되살리기 (예전에 저장된 오답도 개념 자동 분류)
function noteQuestion(w) {
  const tag = w.q.tag || inferConcept(w.key, w.q).tag;
  return { ...w.q, conceptTag: tag, difficulty: w.q.diff || 2, unit: w.q.unit || w.key };
}
function logHint(key) {
  updateLog((l) => { const u = unitLog(l, key); return { ...l, hints: l.hints + 1, units: { ...l.units, [key]: { ...u, hints: u.hints + 1 } } }; });
}
function streakDays() {
  let n = 0;
  const d = new Date();
  if (!(dayLog(todayStr()).solved > 0)) d.setDate(d.getDate() - 1); // 오늘 아직 안 했으면 어제부터 셈
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!(dayLog(k).solved > 0)) return n;
    n++; d.setDate(d.getDate() - 1);
  }
}

/* ---------- 오답노트: 틀린 문제를 모아 두고 다시 풀기 ---------- */
const WRONG_MAX = 200;
const pendingWrongs = () => S.save.wrongs.filter((w) => !w.done);
function addWrongNote(key, q, picked) {
  const id = `${key}|${qid(q)}`;
  const prev = S.save.wrongs.find((w) => w.id === id);
  const entry = prev
    ? { ...prev, count: prev.count + 1, picked: String(picked), date: todayStr(), done: false, doneDate: null }
    : { id, key, q: { q: q.q, p: q.p || '', v: q.v || null, ch: q.ch.map(String), a: String(q.a), h: q.h, tag: q.conceptTag || inferConcept(key, q).tag, diff: q.difficulty || 2, unit: q.unit || key }, picked: String(picked), count: 1, date: todayStr(), done: false, doneDate: null };
  S.save = { ...S.save, wrongs: [...S.save.wrongs.filter((w) => w.id !== id), entry].slice(-WRONG_MAX) };
  persist(); refreshNoteBadge();
}
function markWrongDone(id) {
  S.save = { ...S.save, wrongs: S.save.wrongs.map((w) => (w.id === id ? { ...w, done: true, doneDate: todayStr() } : w)) };
  persist(); refreshNoteBadge();
}
function bumpWrongCount(id, picked) {
  S.save = { ...S.save, wrongs: S.save.wrongs.map((w) => (w.id === id ? { ...w, count: w.count + 1, picked: String(picked) } : w)) };
  persist();
}
function refreshNoteBadge() {
  const n = pendingWrongs().length;
  document.querySelectorAll('.note-badge').forEach((b) => { b.textContent = n; b.hidden = n === 0; });
}
function earnBalls(n) { addBalls(n); if (S.lesson) S.lesson.balls += n; }
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const caughtIds = () => MONSTERS.filter((m) => S.save.dex[m.id]).map((m) => m.id);
function addCaught(id) {
  const prev = S.save.dex[id];
  const next = { count: (prev ? prev.count : 0) + 1, first: prev && prev.first ? prev.first : todayStr(), stage: prev ? prev.stage : 1 };
  S.save = { ...S.save, dex: { ...S.save.dex, [id]: next } };
  persist();
  updateLog((l) => ({ ...l, caught: l.caught.includes(id) ? l.caught : [...l.caught, id] }));
  // 상단 📒 도감 버튼의 모은 수를 바로 갱신 (수업 중에는 머리글을 다시 그리지 않으므로)
  document.querySelectorAll('.dexcnt').forEach((el) => { el.textContent = `${caughtIds().length}/${MONSTERS.length}`; });
  // 이미 도감에 있는 몬스터를 또 잡으면 그 타입의 타입 캡슐 1개
  const m = MONSTERS.find((x) => x.id === id);
  if (prev && m) {
    const have = addTypeCap(m.type, 1);
    toast(`🎁 ${m.name}${josaEulReul(m.name)} 또 만났어요! ${typeCapName(m.type)} +1 (모두 ${have}개)`);
  }
}
const typeCapCount = (type) => S.save.typeCaps[type] || 0;
function addTypeCap(type, n) {
  const have = Math.max(0, typeCapCount(type) + n);
  S.save = { ...S.save, typeCaps: { ...S.save.typeCaps, [type]: have } };
  persist();
  return have;
}
// 진화 가능 여부: { ok, cost, have, next } — 최종 진화를 마쳤으면 next = null
function evolveInfo(id) {
  const info = S.save.dex[id], m = MONSTERS.find((x) => x.id === id);
  if (!info || !m) return { ok: false, cost: 0, have: 0, next: null };
  const next = info.stage < MAX_STAGE ? info.stage + 1 : null, cost = next ? EVOLVE_COST[info.stage] : 0, have = typeCapCount(m.type);
  return { ok: !!next && have >= cost, cost, have, next };
}
// 타입 캡슐을 내고 한 단계 진화 → 새 단계 (진화 못 하면 null)
function evolveMonster(id) {
  const ev = evolveInfo(id), m = MONSTERS.find((x) => x.id === id);
  if (!ev.ok) return null;
  addTypeCap(m.type, -ev.cost);
  setDexStage(id, ev.next);
  return ev.next;
}
function setDexStage(id, stage) {
  const prev = S.save.dex[id];
  if (!prev || prev.stage >= stage) return;
  S.save = { ...S.save, dex: { ...S.save.dex, [id]: { ...prev, stage } } };
  persist();
}
