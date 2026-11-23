/* 별빛 학습지 — 오답 맞춤 코칭 (정답 비노출) */
'use strict';

/* =====================================================================
   13. 방문 선생님 맞춤 코칭 — 아이가 고른 답을 짚어 주되 정답은 말하지 않음
   ===================================================================== */
const COACH_GENERIC = '문제를 한 번 더 천천히 읽고, 무엇을 묻는지 손가락으로 짚어 볼까? 네가 고른 답을 문제에 넣어 확인해 보자!';
const numOf = (s) => { const m = String(s).match(/^-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const fracOf = (s) => { const m = String(s).match(/^(\d+)\/(\d+)$/); return m ? [Number(m[1]), Number(m[2])] : null; };
const near = (x, y) => Math.abs(x - y) < 1e-9;
function coachMath(ans, p) {
  const fa = fracOf(ans), fp = fracOf(p);
  if (fa && fp) {
    if (fp[0] * fa[1] === fa[0] * fp[1]) return '크기는 같은 분수야! 그런데 아직 더 약분할 수 있어. 분모와 분자를 최대공약수로 끝까지 나누어 볼까?';
    if (fp[0] === fa[1] && fp[1] === fa[0]) return '분자와 분모의 자리가 바뀐 것 같아! 위에는 부분, 아래에는 전체가 와야 해.';
    if (fp[1] === fa[1] * 2) return '분모끼리도 계산한 것 같아. 분모가 같을 때는 분모를 그대로 두고 분자만 계산해!';
    if (fp[1] === fa[1]) return '분모는 잘 찾았어! 분자를 한 번 더 차근차근 계산해 볼까?';
    return '분모부터 다시 확인해 보자. 전체를 몇 조각으로 나누었는지, 약분은 끝까지 했는지 살펴봐!';
  }
  const a = numOf(ans), v = numOf(p);
  if (a === null || v === null || fa || fp) return null;
  const d = Math.abs(v - a);
  if (a !== 0 && [10, 100].some((k) => near(v, a * k) || near(v * k, a))) return '숫자는 맞는데 자리가 어긋났어! 소수점 위치나 0의 개수를 다시 세어 볼까?';
  if (d === 1) return '딱 하나 차이야! 셀 때 처음이나 끝을 빠뜨리거나 한 번 더 세지 않았는지 확인해 봐.';
  if (d % 10 === 0 && d < 1000) return '일의 자리는 맞았는데 윗자리가 달라. 받아올림이나 받아내림을 빠뜨리지 않았는지 살펴보자!';
  return `네가 고른 '${p}'${nj(p, '은', '는')} 정답보다 ${v > a ? '커' : '작아'}. 계산을 한 단계씩 다시 해 볼까?`;
}
function coachEnglish(q, p) {
  const text = q.q;
  if (/과거형/.test(text) && /ed$/.test(p)) return '이 동사는 -ed를 붙이는 규칙을 따르지 않을 수도 있어. 모양이 확 바뀌는 불규칙 동사인지 생각해 봐!';
  if (/과거형|yesterday/.test(text) && /(ing|s)$/.test(p)) return '-s나 -ing는 지금 하는 일을 말할 때 붙여. 지나간 일은 어떤 모양일까?';
  if (/^(more|most) /.test(p)) return '짧은 형용사는 more나 most 대신 끝에 꼬리를 붙여서 비교해!';
  if (/비교급|than/.test(text) && /est$/.test(p)) return "그건 셋 이상 중 '가장'을 말하는 최상급이야. 둘을 비교할 땐 어떤 꼬리였지?";
  if (/최상급|가장/.test(text) && /er$/.test(p)) return "그건 둘을 비교하는 비교급이야. '가장 ~한'은 어떤 꼬리를 붙일까?";
  if (/will/.test(text) && /(ed|s|ing)$/.test(p)) return 'will 뒤에는 꼬리를 붙이지 않은 원래 모양이 와야 해!';
  if (/\?/.test(text) && /[.!]$/.test(p)) return `네가 고른 대답을 우리말로 바꿔 읽어 봐. 질문이 무엇을 묻는지와 어울리는지 따져 보자!`;
  return `네가 고른 '${p}'의 소리와 뜻을 떠올려 봐. 문제에서 묻는 것과 딱 맞는지 따져 보자!`;
}
// 문제 레코드에 미리 만들어 둔 오답 코칭(coachingWrong)이 있으면 그것을, 없으면 즉석에서 계산
function coachFor(q, picked) {
  const pre = q.coachingWrong && q.coachingWrong.byOption[String(picked)];
  return pre ? { coach: pre, principle: safeHint(q) } : computeCoach(q, picked);
}
// questionBank 레코드의 coachingWrong 생성: 오답 보기마다 정답 없는 코칭
function buildCoaching(q) {
  const byOption = Object.fromEntries(q.options.filter((o) => o !== q.answer).map((o) => [o, computeCoach(q, o).coach]));
  return { default: COACH_GENERIC, byOption };
}
function computeCoach(q, picked) {
  const ans = String(q.a), p = String(picked);
  let tip = coachMath(ans, p);
  if (!tip && isEmojiOnly(p)) tip = '네가 고른 그림의 이름을 소리 내어 말해 봐. 문제의 낱말과 소리나 뜻이 같은지 비교해 보자!';
  if (!tip && /[A-Za-z]/.test(p) && !/[가-힣]/.test(p)) tip = coachEnglish(q, p);
  if (!tip) tip = `네가 고른 '${p}'${kj(p, '을', '를')} 문제 속에 넣어 소리 내어 읽어 봐. 문제에서 묻는 것과 딱 맞는지 따져 보자!`;
  if (containsAnswer(tip, ans)) tip = COACH_GENERIC; // 코칭에도 정답 노출 금지
  return { coach: tip, principle: safeHint(q) };
}
const coachBoxHTML = (lead, coach, principle, saved) => `<div class="coach"><div class="coach-h">👩‍🏫 방문 선생님 코칭</div>
  <p class="coach-l">${esc(lead)}</p><p>${esc(coach)}</p><p class="coach-p">💡 핵심 원리: ${esc(principle)}</p>
  ${saved ? '<p class="coach-s">📕 이 문제는 오답노트에 담아 두었어. 나중에 다시 풀어 보자!</p>' : ''}</div>`;

/* ---------- 취약 개념 진단 카드 (홈 · 결과 화면 · 리포트에서 함께 사용) ---------- */
const STATUS_INFO = { weak: ['💪', '집중 연습 필요'], practice: ['🙂', '연습 중'], stable: ['🌟', '안정'], new: ['🆕', '기록 없음'] };
function diagnosisHTML({ unit = null, limit = 3, compact = false } = {}) {
  const weak = Adaptive.weakest({ unit, limit });
  const tracked = Object.keys(Adaptive.all()).filter((t) => !unit || Adaptive.stat(t).unit === unit);
  if (!weak.length) {
    const msg = tracked.length ? '지금은 특별히 약한 개념이 없어요! 이대로 꾸준히 해 보아요. 🌟' : '문제를 풀면 개념별로 실력을 진단해 드려요. 학습지나 집중 모드로 시작해 보세요!';
    return `<div class="diag ${compact ? 'compact' : ''}"><div class="dg-head"><b>🩺 취약 개념 진단</b></div><p class="dg-empty">${msg}</p></div>`;
  }
  return `<div class="diag ${compact ? 'compact' : ''}"><div class="dg-head"><b>🩺 취약 개념 진단</b><small>최근 풀이 기록(정답·힌트·시간)으로 분석했어요</small></div>
    <ul class="dg-list">${weak.map((tag, i) => {
      const d = Adaptive.diagnose(tag), n = unitName(Adaptive.stat(tag).unit || '1-math');
      return `<li class="dg-item ${i === 0 ? 'top' : ''}"><div class="dg-body"><b>${i === 0 ? '🚨 ' : ''}${esc(d.title)}</b><small>${n.label} · ${esc(n.title)} · 지금 난이도 ${DIFF_NAME[d.level]}</small><span>${esc(d.detail)}</span></div>
        <button class="${i === 0 ? 'bigbtn sm' : 'ibtn soft'}" data-train="${esc(tag)}">🎯 취약 개념 바로 훈련하기</button></li>`;
    }).join('')}</ul></div>`;
}

// 리포트용 개념별 표: 약한 개념이 위로 (최대 12개)
function conceptTableHTML() {
  const tags = Object.keys(Adaptive.all()).sort((x, y) => (Adaptive.weakness(y) - Adaptive.weakness(x)) || (Adaptive.stat(y).tries - Adaptive.stat(x).tries)).slice(0, 12);
  if (!tags.length) return '<p class="rp-empty">아직 개념별 기록이 없어요.</p>';
  const cls = { weak: 'low', practice: 'mid', stable: 'good', new: '' };
  const rows = tags.map((t) => {
    const s = Adaptive.stat(t), st = Adaptive.status(t), n = unitName(s.unit || '1-math');
    const rate = s.tries ? Math.round((s.right / s.tries) * 100) : 0, avg = s.timed ? Math.round(s.timeMs / s.timed / 1000) : null;
    return `<tr><td><b>${esc(conceptLabel(t))}</b></td><td>${n.label}</td><td>${s.tries}</td><td>${rate}%</td><td>${s.hints}번</td><td>${avg != null ? `${avg}초` : '-'}</td><td>${DIFF_NAME[s.level]}</td><td><span class="rb ${cls[st]}">${STATUS_INFO[st][0]} ${STATUS_INFO[st][1]}</span></td></tr>`;
  }).join('');
  return `<div class="rp-tablewrap"><table class="rp-table"><thead><tr><th>개념</th><th>학년·과목</th><th>시도</th><th>한 번에 정답</th><th>힌트</th><th>평균 시간</th><th>지금 난이도</th><th>상태</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function unitName(key) {
  const [g, s] = key.split('-'), u = UNITS[key], sj = SUBJECTS[s] || { icon: '', name: s };
  return { label: `${g}학년 ${sj.icon} ${sj.name}`, title: u ? u.title : key };
}
function todayStripHTML() {
  const l = dayLog(todayStr()), rate = l.solved ? Math.round((l.correct / l.solved) * 100) : 0, pend = pendingWrongs().length;
  return `<section class="today card"><div class="td-title">📅 오늘의 학습</div>
    <div class="td-stats"><span>✏️ 푼 문제 <b>${l.solved}</b></span><span>🎯 정답률 <b>${l.solved ? `${rate}%` : '-'}</b></span><span>⭐ 오늘 별 <b>${l.stars}</b></span><span>🔥 연속 <b>${streakDays()}</b>일</span></div>
    <div class="td-btns">${pend ? `<button class="bigbtn sm" data-act="note">📕 오답 다시 풀기 (${pend})</button>` : '<span class="td-ok">🏅 다시 풀 오답이 없어요!</span>'}<button class="ibtn soft" data-act="report">📊 학습 리포트</button></div></section>`;
}
