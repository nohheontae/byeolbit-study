/* 별빛 학습지 — 오늘의 미션 · 황금 캡슐 · 배지 */
'use strict';

/* =====================================================================
   16. 오늘의 미션 3가지 · 황금 캡슐 · 칭찬 배지
   - 날짜마다 같은 미션(날짜 시드) → 새로고침해도 바뀌지 않음
   - 미션 달성 → ✨ 황금 캡슐 (도감에서 새 몬스터 바로 포획)
   - 3개 모두 달성 → 🌈 완주 + 별 3개, 누적 기록으로 배지 획득
   ===================================================================== */
const MISSION_DEFS = {
  solve: { icon: '✏️', text: (t) => `문제 ${t}개 풀기 (학습지·테스트·집중 모드)`, metric: (l) => l.solved, targets: [10, 15], go: 'subjects', goLabel: '공부하러 가기' },
  hunt: { icon: '🔍', text: () => '숨은 몬스터 찾기 1판 클리어', metric: (l) => l.huntClears, targets: [1], go: 'subjects', goLabel: '수업에서 도전' },
  memory: { icon: '⚔️', text: () => '몬스터 퀴즈 배틀 1번 승리', // id 'memory'는 저장된 미션과의 호환을 위해 유지
    metric: (l) => l.memClears, targets: [1], go: 'subjects', goLabel: '수업에서 도전' },
  review: { icon: '📕', text: () => '오답 1개 이상 다시 풀기', metric: (l) => l.reviewed, targets: [1], go: 'note', goLabel: '오답노트 열기' },
  test: { icon: '📝', text: () => '종합 테스트 1번 채점받기', metric: (l) => l.tests, targets: [1], go: 'subjects', goLabel: '수업에서 도전' },
  challenge: { icon: '🔥', text: () => '집중 모드 10문제 연속 도전 완주', metric: (l) => l.challenges, targets: [1], go: 'focus', goLabel: '집중 모드 열기' },
  stars: { icon: '⭐', text: (t) => `별 ${t}개 모으기`, metric: (l) => l.stars, targets: [5, 8], go: 'subjects', goLabel: '공부하러 가기' },
};
const BADGES = [
  { id: 'firstMission', icon: '🌱', name: '첫 미션 완주', desc: '오늘의 미션 3개를 처음으로 모두 달성했어요', test: () => S.save.missionDays.length >= 1 },
  { id: 'mission3', icon: '🔥', name: '3일 완주', desc: '오늘의 미션을 3일 완주했어요', test: () => S.save.missionDays.length >= 3 },
  { id: 'mission7', icon: '👑', name: '7일 완주', desc: '오늘의 미션을 7일 완주했어요', test: () => S.save.missionDays.length >= 7 },
  { id: 'perfect', icon: '🏆', name: '10문제 만점', desc: '집중 모드 10문제 연속 도전에서 만점을 받았어요', test: () => S.save.perfects >= 1 },
  { id: 'review10', icon: '📕', name: '복습 박사', desc: '오답 10개를 다시 풀어 복습을 완료했어요', test: () => S.save.wrongs.filter((w) => w.done).length >= 10 },
  { id: 'dex10', icon: '🐾', name: '몬스터 친구 10', desc: '몬스터 10종을 도감에 모았어요', test: () => caughtIds().length >= 10 },
  { id: 'dexAll', icon: '🌈', name: '도감 완성', desc: `몬스터 ${MONSTERS.length}종을 모두 모았어요`, test: () => caughtIds().length >= MONSTERS.length },
  { id: 'piggy3', icon: '🐷', name: '성실 저금왕 (3일 연속)', desc: '3일 연속 오늘의 미션 용돈을 저금했어요', test: () => piggyStreak() >= 3 },
  { id: 'piggy7', icon: '👑', name: '성실 저금왕 (7일 연속)', desc: '7일 연속 오늘의 미션 용돈을 저금했어요', test: () => piggyStreak() >= 7 },
];
function seededRandom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
function ensureTodayMissions() {
  const l = dayLog(todayStr());
  if (l.missions) return;
  const rnd = seededRandom(todayStr()), pickR = (a) => a[Math.floor(rnd() * a.length)];
  // ① 문제 풀기 ② 게임 1판 ③ 오답 복습(오답이 없으면 다른 도전)
  const ids = ['solve', pickR(['hunt', 'memory']), pendingWrongs().length ? 'review' : pickR(['test', 'challenge', 'stars'])];
  const missions = ids.map((id) => ({ id, target: pickR(MISSION_DEFS[id].targets) }));
  updateLog((x) => ({ ...x, missions }));
}
const missionDone = (m, l) => MISSION_DEFS[m.id].metric(l) >= m.target;
const missionText = (m) => MISSION_DEFS[m.id].text(m.target);
// 알림은 같은 문구를 겹쳐 띄우지 않고, 한 번에 최대 3개까지만 (휴대폰에서 화면을 덮지 않게)
const TOAST_MAX = 3;
function toast(msg) {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const shown = [...box.querySelectorAll('.toast:not(.out)')];
  if (shown.some((x) => x.textContent === msg)) return;
  shown.slice(0, Math.max(0, shown.length - TOAST_MAX + 1)).forEach((x) => x.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 3800);
  setTimeout(() => t.remove(), 4300);
}
function checkBadges() {
  const fresh = BADGES.filter((b) => !S.save.badges[b.id] && b.test());
  if (!fresh.length) return;
  S.save = { ...S.save, badges: { ...S.save.badges, ...Object.fromEntries(fresh.map((b) => [b.id, todayStr()])) } };
  persist();
  fresh.forEach((b) => toast(`${b.icon} 새 칭찬 배지 획득: ${b.name}!`));
  confetti(50);
}
function checkMissions() {
  const d = todayStr(), l = dayLog(d);
  if (l.missions) {
    const fresh = l.missions.filter((m) => missionDone(m, l) && !l.notified.includes(m.id));
    if (fresh.length) {
      S.save = { ...S.save, log: { ...S.save.log, [d]: { ...l, notified: [...l.notified, ...fresh.map((m) => m.id)] } } };
      persist();
      fresh.forEach((m) => toast(`🎯 오늘의 미션 달성! ${missionText(m)} — 홈에서 보상을 받아요`));
    }
  }
  refreshMissionPanel();
  checkBadges();
}
function refreshMissionPanel() { const p = $('#missionPanel'); if (p) p.innerHTML = missionPanelHTML(); }
function missionPanelHTML() {
  const l = dayLog(todayStr()), ms = l.missions || [], doneN = ms.filter((m) => missionDone(m, l)).length;
  const items = ms.map((m, i) => {
    const def = MISSION_DEFS[m.id], v = Math.min(def.metric(l), m.target), done = v >= m.target, claimed = l.claimed.includes(m.id);
    const action = claimed ? '<span class="ms-claimed">✔ 캡슐 받음</span>'
      : done ? `<button class="bigbtn sm" data-ms="${m.id}">🎁 보상 받기</button>`
      : `<button class="ibtn soft ms-go" data-go="${def.go}">${def.goLabel}</button>`;
    return `<li class="ms-item ${done ? 'done' : ''}"><span class="ms-no">${done ? '✔' : i + 1}</span><span class="ms-ico">${def.icon}</span>
      <div class="ms-body"><b>${missionText(m)}</b><div class="ms-bar" role="progressbar" aria-label="${missionText(m)} 진행" aria-valuemin="0" aria-valuemax="${m.target}" aria-valuenow="${v}"><i style="width:${(v / m.target) * 100}%"></i></div><small>${v} / ${m.target}</small></div>${action}</li>`;
  }).join('');
  return `<div class="ms-head"><h2 class="ms-title">🎯 오늘의 미션</h2><span class="pill">${doneN} / ${ms.length} 달성</span><span class="pill gold" title="도감에서 아직 못 만난 몬스터를 바로 포획할 수 있어요">✨ 황금 캡슐 ${S.save.gold}</span></div>
    <ol class="ms-list">${items}</ol>
    ${missionAllHTML(l, doneN, ms.length)}
    <p class="ms-bonus">미션마다 ✨ 황금 캡슐(도감에서 새 몬스터 바로 포획)! 3개를 모두 완료하면 💰 ${won(PIGGY_REWARD)}이 🐷 용돈 저금통에 쏙 + ⭐ 별 3개!</p>
    <div class="badges"><b>🏅 내 칭찬 배지</b>${BADGES.map((b) => { const got = S.save.badges[b.id]; return `<span class="badge ${got ? '' : 'locked'}" title="${esc(b.desc)}${got ? ` (${got})` : ''}">${got ? b.icon : '🔒'} ${b.name}</span>`; }).join('')}</div>`;
}
// 미션 1개 달성 보상: ✨ 황금 캡슐 (용돈은 3개를 모두 완료했을 때 claimAllMissions에서)
// 미션 패널 아래 '3개 모두 완료' 용돈 보상 줄
function missionAllHTML(l, doneN, total) {
  if (!total) return '';
  if (piggyEarnedToday(PIGGY_DAILY_ID)) return '<div class="ms-all done"><b>🌈 오늘의 미션 완주! 💰 용돈 저금 완료</b><span class="ms-claimed">오늘 보상 받기 완료 ✅</span></div>';
  if (allMissionsDone(l)) return `<div class="ms-all ready"><b>🌈 오늘의 미션 ${total}개를 모두 완료했어요!</b><button class="bigbtn sm ms-cash" data-msall="1">💰 ${won(PIGGY_REWARD)} 보상받기</button></div>`;
  return `<div class="ms-all"><b>🐷 ${total}개를 모두 완료하면 💰 ${won(PIGGY_REWARD)}이 저금통에!</b><span class="ms-count">${doneN} / ${total} 완료</span></div>`;
}
function claimMission(id) {
  const d = todayStr(), l = dayLog(d), m = (l.missions || []).find((x) => x.id === id);
  if (!m || l.claimed.includes(id) || !missionDone(m, l)) return; // 같은 날 이미 받은 미션은 다시 받지 않음
  S.save = { ...S.save, gold: S.save.gold + 1, log: { ...S.save.log, [d]: { ...l, claimed: [...l.claimed, id] } } };
  persist(); confetti(40);
  teacherSay(`미션 달성! 황금 캡슐을 줄게. ${l.missions.every((x) => missionDone(x, l)) ? '세 개를 모두 해냈으니 아래에서 용돈 보상도 받아 봐!' : '세 개를 모두 완료하면 용돈 천 원이 저금통에 들어가!'}`);
  checkBadges(); refreshMissionPanel();
  const b = $('#ballCount'); if (b) bump(b.parentElement);
}
const PIGGY_DAILY_ID = 'daily-all'; // 저금통 내역에서 '오늘의 미션 3개 완료' 보상을 구분하는 id
const allMissionsDone = (l) => !!(l.missions && l.missions.length && l.missions.every((m) => missionDone(m, l)));
// 오늘의 미션 3개 모두 완료 보상: 💰 용돈 1,000원 + 🌈 완주 별 3개 (하루 한 번, 날짜 기준 중복 방지)
function claimAllMissions(fromEl) {
  const d = todayStr(), l = dayLog(d);
  if (!allMissionsDone(l) || piggyEarnedToday(PIGGY_DAILY_ID)) return;
  const fromRect = fromEl ? fromEl.getBoundingClientRect() : null; // 패널을 다시 그리기 전에 버튼 위치 기억 (애니메이션 출발점)
  piggyDeposit(PIGGY_DAILY_ID, '오늘의 미션 3개 모두 완료');
  S.save = { ...S.save, missionDays: uniq([...S.save.missionDays, d]) };
  persist(); addStars(3); confetti(60);
  toast('🌈 오늘의 미션 완주! 💰 용돈 +1,000원 · ⭐ 별 +3');
  teacherSay('오늘의 미션 3개를 모두 해냈어! 용돈이 저금통에 쏙 들어가고, 별 3개도 받았어. 정말 대단해!', { speak: false });
  Sfx.play('coin');
  Voice.say(`축하해요! 오늘의 미션 성공으로 ${PIGGY_REWARD === 1000 ? '천 원이' : `${won(PIGGY_REWARD)}이`} 저금통에 차곡차곡 쌓였어요!`);
  flyMoney(fromRect);
  checkBadges(); refreshMissionPanel();
  const b = $('#ballCount'); if (b) bump(b.parentElement);
}
