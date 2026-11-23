/* 별빛 학습지 — 학습 리포트 (인쇄) */
'use strict';

/* =====================================================================
   15. 부모님·선생님 학습 리포트 (팝업 + 인쇄)
   ===================================================================== */
let reportDate = null;
const rpTile = (ico, label, value) => `<div class="rp-tile"><div class="rp-ico">${ico}</div><div class="rp-val">${value}</div><div class="rp-lab">${label}</div></div>`;
const rateBadge = (r) => (r >= 80 ? `<span class="rb good">🌟 잘함 ${r}%</span>` : r >= 60 ? `<span class="rb mid">🙂 보통 ${r}%</span>` : `<span class="rb low">💪 연습 필요 ${r}%</span>`);
function openReport() {
  reportDate = todayStr();
  openOverlay('reportModal', 'repTitle');
  const m = $('#reportModal');
  m.addEventListener('click', (e) => {
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'close') closeOverlay('reportModal');
    if (b.dataset.r === 'print') window.print();
    if (b.dataset.r === 'note') { closeOverlay('reportModal'); openNote(); }
  });
  m.addEventListener('change', (e) => { if (e.target.id === 'repDate') { reportDate = e.target.value; renderReport(); focusIn('reportModal', '#repDate'); } });
  renderReport(); focusIn('reportModal');
}
function renderReport() {
  const box = $('#reportModal .mbox'); if (!box) return;
  const today = todayStr(), d = reportDate || today;
  const dates = uniq([today, ...Object.keys(S.save.log).sort().reverse()]);
  const l = dayLog(d), rate = l.solved ? Math.round((l.correct / l.solved) * 100) : 0;
  const pend = pendingWrongs(), wrongsOfDay = S.save.wrongs.filter((w) => w.date === d), reviewed = S.save.wrongs.filter((w) => w.done && w.doneDate === d);
  const units = Object.entries(l.units).filter(([, u]) => u.solved || u.hints).sort((a, b) => b[1].solved - a[1].solved);
  const stuck = units.filter(([, u]) => u.solved && (u.correct / u.solved < 0.7 || u.wrong >= 3));
  const caught = l.caught.map((id) => MONSTERS.find((m) => m.id === id)).filter(Boolean);
  const comment = !l.solved ? '이 날은 아직 학습 기록이 없어요. 하루 10분이라도 꾸준히 해 보아요!'
    : rate >= 85 ? '배운 내용을 아주 잘 이해했어요. 칭찬을 듬뿍 해 주세요!'
    : rate >= 65 ? '대부분 잘 풀었어요. 막힌 단원의 오답노트를 함께 다시 풀어 보면 좋아요.'
    : '어려운 부분이 있었어요. 아래 "막힌 곳"의 문제를 아이와 함께 소리 내어 읽고 힌트를 들어 보세요.';
  const unitRows = units.map(([k, u]) => { const n = unitName(k), r = u.solved ? Math.round((u.correct / u.solved) * 100) : 0; return `<tr><td>${n.label}</td><td>${esc(n.title)}</td><td>${u.solved}</td><td>${u.correct}</td><td>${u.solved ? rateBadge(r) : '-'}</td><td>${u.hints}번</td></tr>`; }).join('');
  const wrongRows = wrongsOfDay.slice(-12).reverse().map((w) => { const n = unitName(w.key); return `<tr><td>${n.label}</td><td>${esc(w.q.q)}</td><td>${esc(w.picked)}</td><td>${w.count}번</td><td>${w.done ? '🏅 완료' : '⏳ 복습 전'}</td></tr>`; }).join('');
  box.innerHTML = `
    <div class="dhead"><h2 id="repTitle">📊 학습 리포트</h2>
      <label class="rp-date noprint">날짜 <select id="repDate">${dates.map((x) => `<option value="${x}" ${x === d ? 'selected' : ''}>${x}${x === today ? ' (오늘)' : ''}</option>`).join('')}</select></label>
      <button class="ibtn soft noprint" data-r="print">🖨️ 학습 요약 인쇄하기</button><button class="ibtn noprint" data-r="close" aria-label="리포트 닫기">✕</button></div>
    <p class="rp-sub">별빛 학습지 · ${d} 학습 요약 · 🔥 연속 학습 ${streakDays()}일 · 누적 ⭐ ${S.save.stars}개 · 도감 ${caughtIds().length}/${MONSTERS.length}${l.missions ? ` · 🎯 오늘의 미션 ${l.missions.filter((m) => MISSION_DEFS[m.id].metric(l) >= m.target).length}/${l.missions.length}` : ''} · 🏅 배지 ${Object.keys(S.save.badges).length}/${BADGES.length} · 🐷 저금통 ${won(S.save.piggy.balance)} (이 날 적립 ${won(S.save.piggy.ledger.filter((x) => x.type === 'earn' && x.date === d).reduce((s, x) => s + x.amount, 0))})</p>
    <div class="rp-tiles">${rpTile('✏️', '푼 문제', `${l.solved}개`)}${rpTile('🎯', '정답률', l.solved ? `${rate}%` : '-')}${rpTile('⭐', '받은 별', `${l.stars}개`)}${rpTile(capsuleSVG(26), '받은 몬스터 캡슐', `${l.balls}개`)}${rpTile('🐾', '포획한 몬스터', `${caught.length}마리`)}${rpTile('📕', '오답 복습 전 / 완료', `${pend.length} / ${S.save.wrongs.length - pend.length}`)}</div>
    <h3 class="rp-h">📚 과목·단원별 학습</h3>
    ${units.length ? `<div class="rp-tablewrap"><table class="rp-table"><thead><tr><th>학년·과목</th><th>단원</th><th>푼 문제</th><th>정답</th><th>정답률</th><th>힌트</th></tr></thead><tbody>${unitRows}</tbody></table></div>` : '<p class="rp-empty">이 날 푼 문제가 없어요.</p>'}
    <h3 class="rp-h">🧩 이런 곳에서 막혔어요</h3>
    ${stuck.length ? `<ul class="rp-stuck">${stuck.map(([k, u]) => { const n = unitName(k); return `<li><b>${n.label} · ${esc(n.title)}</b> — ${u.solved}문제 중 ${u.wrong}문제 틀림 · 힌트 ${u.hints}번</li>`; }).join('')}</ul>` : ''}
    ${wrongRows ? `<div class="rp-tablewrap"><table class="rp-table"><thead><tr><th>학년·과목</th><th>틀린 문제</th><th>아이가 고른 답</th><th>틀린 횟수</th><th>복습</th></tr></thead><tbody>${wrongRows}</tbody></table></div>` : ''}
    ${!stuck.length && !wrongRows ? '<p class="rp-empty">막힌 곳이 없어요! 👏</p>' : ''}
    ${reviewed.length ? `<p class="rp-sub">🏅 이 날 오답 ${reviewed.length}문제를 다시 풀어 복습을 완료했어요.</p>` : ''}
    <h3 class="rp-h">🩺 개념별 진단 <small class="rp-note">(지금까지 누적 · 적응형 난이도 단계 포함)</small></h3>
    ${diagnosisHTML({ limit: 3, compact: true })}
    ${conceptTableHTML()}
    <h3 class="rp-h">🐾 이 날 만난 몬스터</h3>
    ${caught.length ? `<div class="caught-row" style="justify-content:flex-start">${caught.map((m) => `<div>${monsterBig(m, 1, 64)}${m.name}</div>`).join('')}</div>` : '<p class="rp-empty">아직 만난 몬스터가 없어요.</p>'}
    <h3 class="rp-h">💬 방문 선생님 한마디</h3><p class="rp-comment">${comment}</p>
    ${pend.length ? `<div class="noprint rp-cta"><button class="bigbtn sm" data-r="note">📕 오답 다시 풀기 (${pend.length})</button></div>` : ''}`;
}
