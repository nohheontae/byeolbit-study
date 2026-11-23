/* 별빛 학습지 — 용돈 저금통 */
'use strict';

/* =====================================================================
   18. 🐷 오늘의 미션 용돈 저금통
   - 오늘의 미션 1개 달성 → 💰 1,000원 적립 (같은 날 같은 미션은 한 번만: 날짜 + 미션 id로 내역 확인)
   - 목표(이름·금액)를 정하고 게이지로 확인, 날짜별 적립·정산 내역
   - 부모님 정산(출금): 비밀번호(기본 0000, 변경 가능) 확인 후 잔액만 차감 — 누적 획득액은 그대로
   ※ 비밀번호는 아이의 실수를 막는 '잠금'입니다. 이 기기 브라우저에 저장되므로 금융 보안 장치는 아닙니다.
   ===================================================================== */
const PIGGY_REWARD = 1000;       // 미션 1개당 용돈
const PIGGY_LEDGER_MAX = 500;    // 보관하는 내역 수
const PIGGY_GOAL_MAX = 1000000;
const won = (n) => `${Math.round(Number(n) || 0).toLocaleString('ko-KR')}원`;
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const timeOf = (ts) => { const t = new Date(ts); return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`; };
const piggyEarnedToday = (missionId) => S.save.piggy.ledger.some((x) => x.type === 'earn' && x.date === todayStr() && x.missionId === missionId);
// 연속 저금일: 용돈을 받은 날이 오늘(또는 어제)부터 며칠 이어졌는지
function piggyStreak() {
  const days = new Set(S.save.piggy.ledger.filter((x) => x.type === 'earn').map((x) => x.date));
  const d = new Date();
  if (!days.has(todayStr())) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function setPiggy(next) { S.save = { ...S.save, piggy: next }; persist(); refreshPiggyUI(); }
function piggyDeposit(missionId, title) {
  if (piggyEarnedToday(missionId)) return false; // 중복 적립 방지
  const p = S.save.piggy, now = Date.now();
  const entry = { id: `e${now}-${missionId}`, ts: now, date: todayStr(), type: 'earn', amount: PIGGY_REWARD, missionId, title };
  setPiggy({ ...p, balance: p.balance + PIGGY_REWARD, totalEarned: p.totalEarned + PIGGY_REWARD, ledger: [...p.ledger, entry].slice(-PIGGY_LEDGER_MAX) });
  return true;
}
function piggyPayout(amount, memo) {
  const p = S.save.piggy, now = Date.now();
  const entry = { id: `p${now}`, ts: now, date: todayStr(), type: 'payout', amount, title: '부모님 용돈 지급 (정산)', memo };
  setPiggy({ ...p, balance: p.balance - amount, totalPaid: p.totalPaid + amount, ledger: [...p.ledger, entry].slice(-PIGGY_LEDGER_MAX) });
}
function refreshPiggyUI() {
  const amt = $('#piggyAmt'); if (amt) { amt.textContent = won(S.save.piggy.balance); bump(amt.parentElement); }
  const card = $('#piggyCard'); if (card) card.innerHTML = piggyCardHTML();
  if ($('#piggyModal')) renderPiggy();
}

// 돼지저금통 그림: ratio(0~1)만큼 몸통 안이 금화로 차오름
let pigUid = 0;
function piggySVG(ratio, size = 120) {
  const r = clamp(ratio), id = `pigclip${++pigUid}`, top = 98 - 72 * r;
  return `<svg viewBox="0 0 140 120" width="${size}" height="${Math.round((size * 120) / 140)}" role="img" aria-label="저금통 ${Math.round(r * 100)}% 채워짐">
    <defs><clipPath id="${id}"><ellipse cx="66" cy="62" rx="50" ry="36"/></clipPath></defs>
    <rect x="30" y="86" width="13" height="22" rx="6" fill="#F48FB1"/><rect x="86" y="86" width="13" height="22" rx="6" fill="#F48FB1"/>
    <ellipse cx="66" cy="62" rx="50" ry="36" fill="#FFD1E3"/>
    <g clip-path="url(#${id})"><rect x="10" y="${top}" width="120" height="110" fill="#FFD54A"/><path d="M10 ${top} q15 -7 30 0 t30 0 t30 0 t30 0 v6 h-120z" fill="#FFE58A"/>
      <circle cx="46" cy="${top + 16}" r="6" fill="#F5B400"/><circle cx="76" cy="${top + 26}" r="6" fill="#F5B400"/><circle cx="60" cy="${top + 40}" r="6" fill="#F5B400"/></g>
    <ellipse cx="66" cy="62" rx="50" ry="36" fill="none" stroke="#E57399" stroke-width="3"/>
    <path d="M36 32 L42 12 L56 28Z" fill="#F48FB1" stroke="#E57399" stroke-width="2" stroke-linejoin="round"/>
    <rect x="54" y="23" width="26" height="6" rx="3" fill="#8A3C5C"/>
    <ellipse cx="114" cy="62" rx="12" ry="14" fill="#F8A5C2" stroke="#E57399" stroke-width="3"/>
    <circle cx="110" cy="58" r="2.4" fill="#8A3C5C"/><circle cx="117" cy="66" r="2.4" fill="#8A3C5C"/>
    <circle cx="94" cy="50" r="4" fill="#2B2F4A"/><circle cx="95.5" cy="48.5" r="1.4" fill="#fff"/>
    <ellipse cx="84" cy="70" rx="6" ry="3.5" fill="#FF8FAB" opacity=".7"/>
    <path d="M16 58 q-12 -4 -7 -15" stroke="#E57399" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}
function goalLine(p) {
  const r = clamp(p.balance / p.goalAmount), left = Math.max(0, p.goalAmount - p.balance);
  return r >= 1 ? '🎉 목표 금액을 모두 모았어요! 부모님께 말씀드려 보세요.' : `앞으로 ${won(left)} 더 모으면 목표 달성! (${Math.round(r * 100)}%)`;
}
function piggyCardHTML() {
  const p = S.save.piggy, r = clamp(p.balance / p.goalAmount);
  return `<div class="pig-art">${piggySVG(r, 120)}</div>
    <div class="pig-info"><div class="pig-title">🐷 용돈 저금통</div><div class="pig-bal">${won(p.balance)}</div>
      <div class="pig-goal">🎯 ${esc(p.goalName)} · 목표 ${won(p.goalAmount)}</div>
      <div class="pig-bar" role="progressbar" aria-label="목표까지 모인 정도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(r * 100)}"><i style="width:${r * 100}%"></i></div>
      <small>${goalLine(p)}</small></div>
    <button class="bigbtn sm" data-act="piggy" aria-haspopup="dialog">저금통 열기 ›</button>`;
}
// 💵 지폐와 동전이 버튼에서 저금통으로 '쏙' 날아 들어가는 애니메이션
function flyMoney(fromRect) {
  const target = $('#piggyCard .pig-art') || $('#piggyBtn');
  if (!fromRect || !target) return;
  const b = target.getBoundingClientRect();
  const sx = fromRect.left + fromRect.width / 2, sy = fromRect.top + fromRect.height / 2;
  const dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy;
  const jiggle = () => { target.classList.remove('pig-jiggle'); void target.offsetWidth; target.classList.add('pig-jiggle'); };
  if (REDUCED_MOTION) { jiggle(); return; }
  [['bill', `<span>💵</span><b>${won(PIGGY_REWARD)}</b>`, 0], ['coin', '🪙', 120], ['coin', '🪙', 240]].forEach(([cls, html, delay], i) => {
    const el = document.createElement('div');
    el.className = `fly${cls}`; el.innerHTML = html; el.style.left = `${sx}px`; el.style.top = `${sy}px`;
    document.body.appendChild(el);
    const lift = 140 + i * 30;
    const a = el.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx / 2}px), calc(-50% + ${dy / 2 - lift}px)) scale(1.25) rotate(-14deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.15) rotate(12deg)`, opacity: 0.3 },
    ], { duration: 950, delay, easing: 'ease-in-out', fill: 'forwards' });
    a.onfinish = () => { el.remove(); if (i === 0) jiggle(); };
  });
}

/* ---------- 저금통 상세 팝업 ---------- */
let piggyUI = { view: 'main', error: '' };
function openPiggy() {
  piggyUI = { view: 'main', error: '' };
  openOverlay('piggyModal', 'pgTitle');
  const m = $('#piggyModal');
  m.addEventListener('click', onPiggyClick);
  m.addEventListener('submit', onPiggySubmit);
  renderPiggy(); focusIn('piggyModal', '[data-pg="close"]');
}
function ledgerHTML(p) {
  if (!p.ledger.length) return '<p class="rp-empty">아직 내역이 없어요. 오늘의 미션을 달성하고 첫 용돈을 저금해 보세요! 💰</p>';
  const byDate = p.ledger.reduce((acc, x) => ({ ...acc, [x.date]: [...(acc[x.date] || []), x] }), {});
  return Object.keys(byDate).sort().reverse().map((date) => {
    const rows = [...byDate[date]].sort((a, b) => b.ts - a.ts);
    const net = rows.reduce((s, x) => s + (x.type === 'earn' ? x.amount : -x.amount), 0);
    return `<section class="pg-day"><h4>📅 ${date}${date === todayStr() ? ' (오늘)' : ''}<span class="${net >= 0 ? 'plus' : 'minus'}">${net >= 0 ? '+' : '-'}${won(Math.abs(net))}</span></h4>
      <ul class="pg-ledger">${rows.map((x) => `<li class="pg-row ${x.type}"><div><b>${x.type === 'earn' ? `🎯 ${esc(x.title)}` : '👨‍👩‍👧 부모님 용돈 지급 (정산)'}</b>
        <small>${timeOf(x.ts)}${x.memo ? ` · ${esc(x.memo)}` : ''}</small></div><span class="pg-amt">${x.type === 'earn' ? '+' : '-'}${won(x.amount)}</span></li>`).join('')}</ul></section>`;
  }).join('');
}
function renderPiggy() {
  const box = $('#piggyModal .mbox'); if (!box) return;
  const p = S.save.piggy, r = clamp(p.balance / p.goalAmount), err = piggyUI.error ? `<p class="pg-err" role="alert">⚠️ ${esc(piggyUI.error)}</p>` : '';
  const head = `<div class="dhead"><h2 id="pgTitle">🐷 용돈 저금통</h2><span class="pill">💰 ${won(p.balance)}</span><button class="ibtn" data-pg="close" aria-label="저금통 닫기">✕</button></div>`;
  const back = '<button type="button" class="ibtn soft" data-pg="back">취소</button>';
  let body;
  if (piggyUI.view === 'goal') {
    body = `<form class="pg-form" data-form="goal"><h3>🎯 목표 정하기</h3>
      <label>갖고 싶은 것<input id="pgGoalName" maxlength="20" value="${esc(p.goalName)}" required placeholder="예: 포켓몬 카드 사기"></label>
      <label>목표 금액 (1,000원 단위)<input id="pgGoalAmt" type="number" inputmode="numeric" min="1000" max="${PIGGY_GOAL_MAX}" step="1000" value="${p.goalAmount}" required></label>
      <div class="pg-presets">${[3000, 5000, 10000, 20000, 30000].map((v) => `<button type="button" class="fchip" data-pg="preset" data-v="${v}">${won(v)}</button>`).join('')}</div>
      ${err}<div class="pg-actions"><button class="bigbtn" type="submit">💾 목표 저장하기</button>${back}</div></form>`;
  } else if (piggyUI.view === 'payout') {
    const opts = Array.from({ length: Math.floor(p.balance / 1000) }, (_, i) => (i + 1) * 1000);
    if (p.balance % 1000) opts.push(p.balance);
    body = `<form class="pg-form" data-form="payout"><h3>👨‍👩‍👧 부모님 용돈 지급(정산)하기</h3>
      <p class="pg-warn">실제로 용돈(현금·계좌)을 준 뒤에 정산해 주세요. 아이가 실수로 잔액을 지우지 않도록 부모님 비밀번호가 필요해요.</p>
      <label>부모님 비밀번호 (숫자 4자리)<input id="pgPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required></label>
      <label>지급 금액 (현재 잔액 ${won(p.balance)})<select id="pgAmt">${opts.map((v) => `<option value="${v}" ${v === p.balance ? 'selected' : ''}>${won(v)}${v === p.balance ? ' (전액)' : ''}</option>`).join('')}</select></label>
      <div class="pg-presets"><button type="button" class="fchip" data-pg="all">전액 ${won(p.balance)}</button></div>
      <label>메모 (선택)<input id="pgMemo" maxlength="40" placeholder="예: 현금으로 전달 완료"></label>
      ${err}<div class="pg-actions"><button class="bigbtn violet" type="submit">💸 정산하기</button>${back}</div></form>`;
  } else if (piggyUI.view === 'pin') {
    body = `<form class="pg-form" data-form="pin"><h3>🔒 부모님 비밀번호 바꾸기</h3>
      <label>지금 비밀번호<input id="pgPinOld" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required></label>
      <label>새 비밀번호 (숫자 4자리)<input id="pgPinNew" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required></label>
      <label>새 비밀번호 한 번 더<input id="pgPinNew2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required></label>
      ${err}<div class="pg-actions"><button class="bigbtn" type="submit">🔒 바꾸기</button>${back}</div></form>`;
  } else {
    const streak = piggyStreak();
    body = `<div class="pg-top"><div class="pg-art pig-art">${piggySVG(r, 180)}</div>
      <div class="pg-sum"><div class="pg-label">현재 저금통 잔액</div><div class="pg-bal">${won(p.balance)}</div>
        <div class="pg-stats"><span>💰 누적 획득 <b>${won(p.totalEarned)}</b></span><span>👨‍👩‍👧 부모님 지급 <b>${won(p.totalPaid)}</b></span><span>🔥 연속 저금 <b>${streak}일</b></span></div>
        <div class="pg-goal"><div>🎯 목표: <b>${esc(p.goalName)}</b> · ${won(p.goalAmount)} <button class="linkbtn" data-pg="goal">목표 바꾸기</button></div>
          <div class="pig-bar big" role="progressbar" aria-label="목표까지 모인 정도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(r * 100)}"><i style="width:${r * 100}%"></i></div><small>${goalLine(p)}</small></div></div></div>
      <div class="pg-badges">${['piggy3', 'piggy7'].map((id) => { const b = BADGES.find((x) => x.id === id), got = S.save.badges[id]; return `<span class="pg-badge ${got ? 'on' : ''}" title="${esc(b.desc)}">${got ? b.icon : '🔒'} ${b.name}${got ? ` <small>${got} 달성</small>` : ''}</span>`; }).join('')}</div>
      <div class="pg-actions"><button class="bigbtn violet" data-pg="payout" ${p.balance > 0 ? '' : 'disabled'}>👨‍👩‍👧 부모님 용돈 지급(정산)하기</button><button class="ibtn soft" data-pg="pin">🔒 비밀번호 바꾸기</button></div>
      <h3 class="rp-h">🧾 날짜별 적립·정산 내역</h3>${ledgerHTML(p)}
      <p class="pg-note">오늘의 미션 3개를 모두 완료하면 💰 ${won(PIGGY_REWARD)}이 모여요. 하루에 한 번만 받을 수 있어요.</p>`;
  }
  box.innerHTML = head + body;
}
function onPiggyClick(e) {
  const b = e.target.closest('[data-pg]'); if (!b) return;
  const act = b.dataset.pg;
  if (act === 'close') { closeOverlay('piggyModal'); return; }
  if (act === 'preset') { $('#pgGoalAmt').value = b.dataset.v; return; }
  if (act === 'all') { $('#pgAmt').value = String(S.save.piggy.balance); return; }
  const views = { goal: 'goal', payout: 'payout', pin: 'pin', back: 'main' };
  if (views[act]) {
    piggyUI = { view: views[act], error: '' };
    renderPiggy();
    focusIn('piggyModal', piggyUI.view === 'main' ? '[data-pg="close"]' : 'input');
  }
}
function onPiggySubmit(e) {
  e.preventDefault();
  const form = e.target.dataset.form, p = S.save.piggy, fail = (msg, sel) => { piggyUI = { ...piggyUI, error: msg }; renderPiggy(); focusIn('piggyModal', sel || 'input'); };
  const done = (msg) => { piggyUI = { view: 'main', error: '' }; renderPiggy(); toast(msg); focusIn('piggyModal', '[data-pg="close"]'); };
  if (form === 'goal') {
    const name = $('#pgGoalName').value.trim(), amt = Math.round(Number($('#pgGoalAmt').value) / 1000) * 1000;
    if (!name) return fail('갖고 싶은 것의 이름을 적어 주세요.');
    if (!(amt >= 1000 && amt <= PIGGY_GOAL_MAX)) return fail(`목표 금액은 ${won(1000)}부터 ${won(PIGGY_GOAL_MAX)}까지 정할 수 있어요.`, '#pgGoalAmt');
    setPiggy({ ...p, goalName: name.slice(0, 20), goalAmount: amt });
    Voice.say(`좋아! ${name}${kj(name, '을', '를')} 위해 ${won(amt)}까지 모아 보자!`);
    return done(`🎯 목표를 '${name} · ${won(amt)}'(으)로 정했어요`);
  }
  if (form === 'payout') {
    const pin = $('#pgPin').value, amt = Number($('#pgAmt') ? $('#pgAmt').value : 0), memo = $('#pgMemo').value.trim().slice(0, 40);
    if (piggyPinHash(pin) !== p.pinHash) return fail('비밀번호가 맞지 않아요. 부모님께 확인해 주세요.', '#pgPin');
    if (!(amt > 0 && amt <= p.balance)) return fail('지급할 금액을 다시 골라 주세요.', '#pgAmt');
    piggyPayout(amt, memo);
    Voice.say(`부모님께 용돈 ${won(amt)}을 받았어요! 저금통에는 ${won(S.save.piggy.balance)}이 남아 있어요.`);
    return done(`👨‍👩‍👧 용돈 지급 완료 · -${won(amt)}`);
  }
  if (form === 'pin') {
    const oldPin = $('#pgPinOld').value, n1 = $('#pgPinNew').value, n2 = $('#pgPinNew2').value;
    if (piggyPinHash(oldPin) !== p.pinHash) return fail('지금 비밀번호가 맞지 않아요.', '#pgPinOld');
    if (!/^\d{4}$/.test(n1)) return fail('새 비밀번호는 숫자 4자리로 정해 주세요.', '#pgPinNew');
    if (n1 !== n2) return fail('새 비밀번호 두 개가 서로 달라요.', '#pgPinNew2');
    setPiggy({ ...p, pinHash: piggyPinHash(n1) });
    return done('🔒 부모님 비밀번호를 바꿨어요');
  }
  return undefined;
}
