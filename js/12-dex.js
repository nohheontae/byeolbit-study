/* 별빛 학습지 — 나의 몬스터 도감 */
'use strict';

/* =====================================================================
   12. 나의 몬스터 도감 (팝업)
   - 미니게임 포획 + 몬스터 캡슐로 직접 포획한 몬스터를 모아 봅니다.
   - 열려 있는 동안 영상·타이머는 멈춥니다 (isOverlayOpen 확인).
   ===================================================================== */
// 몬스터 캡슐로 바로 포획하는 가격: 등급별 (일반 3 · 고급 5 · 희귀 8 · 전설 12 · 신화 20)
const dexCost = (m) => GRADES[gradeOf(m)].price;
const DEX_TABS = [['all', '전체'], ['got', '잡은 몬스터'], ['not', '아직 못 만난 몬스터']];
let dexState = { open: false, tab: 'all', sel: null, lastFocus: null };
const josaIya = (w) => (hasBatchim(w) ? '이야' : '야');
const josaIga = (w) => (hasBatchim(w) ? '이' : '가');

function openDex() {
  if (dexState.open) return;
  Voice.stop();
  const ids = caughtIds();
  dexState = { ...dexState, open: true, tab: 'all', lastFocus: document.activeElement, sel: ids.includes(dexState.sel) ? dexState.sel : ids[0] || null };
  const el = document.createElement('div');
  el.id = 'dexModal'; el.className = 'modal';
  el.innerHTML = '<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="dexTitle"></div>';
  document.body.appendChild(el);
  el.addEventListener('click', onDexClick);
  el.addEventListener('keydown', onDexKey);
  renderDex();
  $('#dexClose').focus();
}
function closeDex() {
  const el = $('#dexModal'); if (el) el.remove();
  Voice.stop(); // 몬스터 AI 목소리도 함께 멈춤
  const f = dexState.lastFocus;
  dexState = { ...dexState, open: false, lastFocus: null };
  if (S.view === 'home') { renderHome(); return; } // 홈 화면의 도감 미리보기·개수 갱신
  if (f && document.contains(f)) f.focus();
  if (S.onModalClose) S.onModalClose();
}
const dexNo = (m) => `No.${String(MONSTERS.indexOf(m) + 1).padStart(3, '0')}`;
function dexCard(m) {
  const info = S.save.dex[m.id];
  if (info) {
    return `<button class="dcard ${dexState.sel === m.id ? 'on' : ''}" data-dex="sel" data-id="${m.id}" aria-pressed="${dexState.sel === m.id}">
      <em class="dno">${dexNo(m)}</em>${monsterBig(m, info.stage, 96)}<b>${STAGE_PREFIX[info.stage]}${m.name}</b>${gradeBadge(m)}<small>×${info.count}</small></button>`;
  }
  const cost = dexCost(m), can = S.save.balls >= cost;
  return `<div class="dcard locked"><em class="dno">${dexNo(m)}</em><div class="sil"><svg viewBox="-8 -8 136 136" width="96" height="96" aria-hidden="true">${monsterSVG(m)}</svg></div><b>???</b>${gradeBadge(m)}
    <button class="cbtn" data-dex="buy" data-id="${m.id}" ${can ? '' : 'disabled'} aria-label="몬스터 캡슐 ${cost}개로 포획하기">${capsuleSVG(18)} ${cost}개로 포획</button>
    ${S.save.gold > 0 ? `<button class="cbtn gold" data-dex="gold" data-id="${m.id}" aria-label="황금 캡슐 1개로 포획하기">✨ 황금 캡슐로 포획</button>` : ''}</div>`;
}
function dexDetail(m) {
  const info = m && S.save.dex[m.id];
  if (!info) return '<aside class="ddetail empty">잡은 몬스터를 누르면<br>자세한 정보를 볼 수 있어요! 🔍</aside>';
  return `<aside class="ddetail" aria-live="polite">
    <div class="dbig">${monsterBig(m, info.stage, 150)}</div>
    <h3><small class="dno-d">${dexNo(m)}</small> ${STAGE_PREFIX[info.stage]}${m.name}</h3><span class="dtype">${m.type}</span> ${gradeBadge(m)}
    <p>${m.desc}</p>
    <p class="dtip">🎲 등장 확률 ${fmtRate(monsterRate(m))}% · 시험 보상 캡슐 확률 ${Math.round(GRADES[gradeOf(m)].capRate * 100)}%</p>
    <ul><li>🎯 포획 횟수: <b>${info.count}번</b></li><li>📅 처음 만난 날: <b>${info.first || '기록 없음'}</b></li><li>✨ 지금 모습: <b>${STAGE_NAME[info.stage]}</b> (${info.stage}/${MAX_STAGE}단계)</li></ul>
    ${evolveHTML(m)}
    <button class="ibtn soft" data-dex="hello" data-id="${m.id}">🔊 인사 듣기</button></aside>`;
}
// 진화 칸: 다음 모습 미리보기 + 타입 캡슐 모은 정도 + 진화 버튼
function evolveHTML(m) {
  const ev = evolveInfo(m.id), cap = typeCapName(m.type);
  if (!ev.next) return `<div class="evo-box max"><b>👑 최종 진화 완료!</b><small>${STAGE_PREFIX[MAX_STAGE]}${m.name}${josaIya(m.name)}. 가장 멋진 모습이에요!</small></div>`;
  const pct = Math.min(100, Math.round((ev.have / ev.cost) * 100));
  return `<div class="evo-box ${ev.ok ? 'ready' : ''}">
    <div class="evo-head"><b>✨ ${STAGE_STEP[ev.next]}</b><span>${STAGE_PREFIX[ev.next]}${m.name}</span></div>
    <div class="evo-next" aria-hidden="true">${monsterBig(m, ev.next, 84)}</div>
    <div class="evo-bar" role="img" aria-label="${cap} ${ev.have}개 / ${ev.cost}개"><i style="width:${pct}%"></i></div>
    <div class="evo-cap">${typeCapsuleSVG(m.type, 22)} ${cap} <b>${Math.min(ev.have, ev.cost)} / ${ev.cost}</b>${ev.have > ev.cost ? ` <small>(가진 캡슐 ${ev.have}개)</small>` : ''}</div>
    <button class="bigbtn sm" data-dex="evolve" data-id="${m.id}" ${ev.ok ? '' : 'disabled'}>${ev.ok ? `✨ ${cap} ${ev.cost}개로 진화하기` : `${cap}이 ${ev.cost - ev.have}개 더 필요해요`}</button>
    <small class="evo-tip">${m.name}처럼 ${m.type}인 몬스터를 또 잡으면 ${cap}을 1개씩 받아요.</small></div>`;
}
const fmtRate = (r) => (r >= 1 ? String(Math.round(r * 10) / 10) : String(Math.round(r * 100) / 100));
// 도감 위쪽: 등급별 등장 확률 안내
const gradeLegendHTML = () => `<div class="glegend" aria-label="등급별 등장 확률">🎲 ${GRADE_ORDER.map((g) => `<span class="gbadge g-${g}" style="--gc:${GRADES[g].color}">${GRADES[g].icon} ${GRADES[g].name} ${gradeCount(g)}종 · ${GRADES[g].rate}%</span>`).join('')}</div>`;
// 도감 위쪽: 가진 타입 캡슐 목록
function typeCapsRowHTML() {
  const owned = MONSTER_TYPES.filter((t) => typeCapCount(t) > 0);
  if (!owned.length) return '<p class="dtip">🎒 타입 캡슐: 이미 잡은 몬스터를 또 잡으면 그 타입의 캡슐을 받아요. 모아서 진화시켜 보세요!</p>';
  return `<div class="tcaps" aria-label="가진 타입 캡슐">🎒 ${owned.map((t) => `<span class="tcap" title="${esc(typeCapName(t))}">${typeCapsuleSVG(t, 20)} ${esc(typeCapName(t))} <b>${typeCapCount(t)}</b></span>`).join('')}</div>`;
}
function renderDex() {
  const box = $('#dexModal .mbox'); if (!box) return;
  const ids = caughtIds(), tab = dexState.tab;
  const list = MONSTERS.filter((m) => tab === 'all' || (tab === 'got') === ids.includes(m.id));
  const sel = MONSTERS.find((m) => m.id === dexState.sel) || null;
  box.innerHTML = `
    <div class="dhead"><h2 id="dexTitle">📒 나의 몬스터 도감</h2>
      <span class="pill">🐾 ${ids.length} / ${MONSTERS.length}</span><span class="pill">${capsuleSVG(22)} ${S.save.balls}</span><span class="pill gold" title="황금 캡슐 (오늘의 미션 보상)">✨ ${S.save.gold}</span>
      <button class="ibtn" id="dexClose" data-dex="close" aria-label="도감 닫기">✕</button></div>
    <div class="dtabs" role="tablist" aria-label="도감 보기 방식">${DEX_TABS.map(([k, t]) => `<button role="tab" aria-selected="${k === tab}" class="dtab ${k === tab ? 'on' : ''}" data-dex="tab" data-tab="${k}">${t}</button>`).join('')}</div>
    <p class="dtip">학습지·숨은 몬스터 찾기·퀴즈 배틀에서 받은 몬스터 캡슐로 아직 못 만난 몬스터를 포획할 수 있어요! 가격은 등급별로 ${GRADE_ORDER.map((g) => `${GRADES[g].name} ${GRADES[g].price}개`).join(' · ')}예요.</p>
    ${gradeLegendHTML()}
    ${typeCapsRowHTML()}
    <div class="dbody">
      <div class="dgrid">${list.length ? list.map(dexCard).join('') : `<p class="dempty">${tab === 'not' ? '🎉 우와! 모든 몬스터를 다 만났어요. 도감 완성!' : '아직 잡은 몬스터가 없어요. 숨은 몬스터 찾기에서 첫 친구를 만나 보자!'}</p>`}</div>
      ${dexDetail(sel)}
    </div>`;
}
function rerenderDexKeepFocus(selector) {
  renderDex();
  const el = (selector && $(`#dexModal ${selector}`)) || $('#dexClose');
  if (el) el.focus();
}
function onDexClick(e) {
  if (e.target.id === 'dexModal') { closeDex(); return; } // 바깥 어두운 영역 클릭
  const b = e.target.closest('[data-dex]'); if (!b) return;
  const act = b.dataset.dex, id = b.dataset.id, m = MONSTERS.find((x) => x.id === id);
  if (act === 'close') closeDex();
  if (act === 'tab') { dexState = { ...dexState, tab: b.dataset.tab }; rerenderDexKeepFocus(`[data-tab="${b.dataset.tab}"]`); }
  if (act === 'sel' && m) { dexState = { ...dexState, sel: id }; rerenderDexKeepFocus(`[data-dex="sel"][data-id="${id}"]`); }
  // 인사 듣기: 몬스터마다 고유 울음소리 + 고유 목소리 (도감을 닫으면 말하지 않음)
  if (act === 'hello' && m) monsterGreet(m, (S.save.dex[id] || { stage: 1 }).stage, { stillOpen: () => dexState.open && dexState.sel === id });
  if (act === 'evolve' && m) {
    const stage = evolveMonster(id);
    if (!stage) return;
    const name = STAGE_PREFIX[stage] + m.name;
    rerenderDexKeepFocus(`[data-dex="sel"][data-id="${id}"]`);
    const big = $('#dexModal .dbig'); if (big) big.classList.add('evo');
    confetti(60);
    Voice.say(`우와! ${m.name}${josaIga(m.name)} ${name}${josaRo(name)} ${STAGE_STEP[stage]}했어! 정말 멋지다!`);
  }
  const canBuy = act === 'buy' && !!m && S.save.balls >= dexCost(m), canGold = act === 'gold' && S.save.gold > 0;
  if (m && (canBuy || canGold) && !S.save.dex[id]) {
    if (canBuy) addBalls(-dexCost(m));
    else { S.save = { ...S.save, gold: S.save.gold - 1 }; persist(); }
    addCaught(id);
    dexState = { ...dexState, sel: id };
    rerenderDexKeepFocus(`[data-dex="sel"][data-id="${id}"]`);
    const card = $(`#dexModal [data-dex="sel"][data-id="${id}"]`); if (card) card.classList.add('caught');
    confetti(40);
    Voice.say(`와! 몬스터 캡슐로 ${m.name}${josaEulReul(m.name)} 포획했어! 도감에 새 친구가 생겼네!`);
  }
}
function onDexKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeDex(); return; }
  if (e.key !== 'Tab') return;
  const items = [...$('#dexModal .mbox').querySelectorAll('button:not([disabled])')];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
