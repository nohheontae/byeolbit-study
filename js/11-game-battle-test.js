/* 별빛 학습지 — 미니게임 2 – 몬스터 퀴즈 배틀 · 종합 테스트 · 결과 */
'use strict';

/* =====================================================================
   10. 미니게임 2 – ⚔️ 몬스터 퀴즈 배틀
   - 정답 = 공격! 맞힐수록 콤보·크리티컬·번개 보너스로 야생 보스의 체력을 깎아요.
   - 틀리면 보스의 반격 + 맞춤 코칭(정답 비공개) → 다시 도전 (게임 오버 없음)
   - 보스 체력이 줄면 내 파트너가 진화, 보스를 쓰러뜨리면 캡슐로 포획 → 도감 등록
   ===================================================================== */
const BATTLE_LEVELS = {
  easy: { label: '쉬움', icon: '🌱', desc: '보스 체력 100 · 4~5문제면 승리!', hp: 100 },
  normal: { label: '보통', icon: '🔥', desc: '보스 체력 160 · 콤보로 더 강하게!', hp: 160 },
};
const BATTLE = { partnerHp: 100, baseDmg: 22, comboBonus: 6, speedBonus: 8, speedSec: 6, retryDmg: 10, bossHit: 18, revive: 60 };
const SKILLS = [['⚡', '번개 펀치'], ['🔥', '불꽃 슛'], ['💧', '물대포'], ['🌿', '나뭇잎 회오리']];
const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const PAIR_REL = {
  '1-math': '모으면 같은 수', '2-math': '식과 답이 짝꿍', '3-math': '식과 답이 짝꿍', '4-math': '크기가 같은 값', '5-math': '크기가 같은 수', '6-math': '같은 값',
  '1-kor': '그림과 낱말', '2-kor': '서로 반대말', '3-kor': '높임말 짝꿍', '4-kor': '관용 표현과 뜻', '5-kor': '표현과 그 뜻', '6-kor': '이어지는 말과 뜻',
  '1-eng': '그림과 영어 단어', '2-eng': '영어 단어와 그림', '3-eng': '영어 단어와 뜻', '4-eng': '영어와 우리말', '5-eng': '기본형과 바뀐 모양', '6-eng': '영어와 뜻',
};
const PAIR_GEN = {
  '1-math': () => { const a = R(1, 5), b = R(1, 9 - a); return [`${a}+${b}`, a + b]; },
  '2-math': () => { const a = R(2, 9), b = R(2, 9); return [`${a}×${b}`, a * b]; },
  '3-math': () => { const b = R(2, 9), q = R(2, 9); return [`${b * q}÷${b}`, q]; },
  '4-math': () => { const d = R(5, 9), a = R(1, d - 2), b = R(1, d - 1 - a); return [`${a}/${d}+${b}/${d}`, `${a + b}/${d}`]; },
  '5-math': () => { const [p, q] = pick(BASE_FRACS), k = R(2, 4); return [`${p * k}/${q * k}`, `${p}/${q}`]; },
  '6-math': () => { const pct = pick([10, 20, 25, 50]), tot = pick([20, 40, 80, 100, 200]); return [`${tot}의 ${pct}%`, (tot * pct) / 100]; },
  '1-kor': () => pick(T.pic1), '2-kor': () => pick(T.opposite).slice(0, 2), '3-kor': () => pick(T.honor),
  '4-kor': () => pick(T.idioms), '5-kor': () => pick(T.proverbs), '6-kor': () => pick(T.proverbs),
  '1-eng': () => pick(T.vocab1), '2-eng': () => pick([...T.animals, ...T.colors]), '3-eng': () => pick(T.vocab3),
  '4-eng': () => { const i = R(0, 6); return [T.days[i], T.daysKo[i]]; },
  '5-eng': () => pick(T.past).slice(0, 2), '6-eng': () => { const [a, , s] = pick(T.compare); return [a, s]; },
};
// 단원 짝 데이터 + 생성 짝을 섞되, 같은 글자가 두 번 나오지 않게 합니다 (헷갈리는 보기 방지)
function buildPairs(L, n) {
  const used = new Set(), out = [];
  const tryAdd = ([a, b]) => {
    const sa = String(a), sb = String(b);
    if (out.length >= n || sa === sb || used.has(sa) || used.has(sb)) return;
    used.add(sa); used.add(sb); out.push([sa, sb]);
  };
  const base = shuffle(L.unit.pairs), gen = PAIR_GEN[L.key] || L.unit.pairGen;
  base.slice(0, n - 2).forEach(tryAdd);
  for (let t = 0; gen && out.length < n && t < 300; t++) tryAdd(gen());
  base.forEach(tryAdd);
  return out;
}
// 짝 데이터를 배틀 문제로: "'7+5'의 짝꿍을 골라 공격!"
function pairQuestions(L, n) {
  const pairs = buildPairs(L, n), rel = PAIR_REL[L.key] || L.unit.pairRel || '짝꿍', bs = pairs.map((p) => p[1]);
  return pairs.map(([a, b]) => Q(`'${a}'의 짝꿍을 골라 공격! (${rel})`, withOthers(b, bs), b, `${rel}! '${a}'에 어울리는 짝을 떠올리고, 보기를 하나씩 맞춰 보자.`))
    .filter(isValidQ);
}
function battleQuestions(L, seen) {
  const fits = (q) => !q.p && q.ch.length === 4 && q.ch.every((c) => [...String(c)].length <= 18) && !seen.has(qid(q));
  return shuffle([...shuffle(L.qs).slice(0, 6), ...pairQuestions(L, 6), ...generatedPool(L.key, 12, seen)].filter(fits));
}
// 짧은 효과음 (Web Audio, 외부 파일 없음) — '소리 끔'이면 울리지 않음
const Sfx = {
  ctx: null,
  play(kind) {
    if (Voice.muted) return;
    const notes = { hit: [[660, 0], [880, 0.06]], crit: [[523, 0], [784, 0.06], [1046, 0.12]], miss: [[240, 0], [170, 0.1]], win: [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.36]], coin: [[988, 0], [1319, 0.08], [1568, 0.16], [2093, 0.26]] }[kind] || [];
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t = c.currentTime;
      notes.forEach(([f, d]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.16, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2);
        o.connect(g).connect(c.destination); o.start(t + d); o.stop(t + d + 0.22);
      });
    } catch (e) { /* 효과음을 지원하지 않는 브라우저: 게임은 그대로 진행 */ }
  },
};
function renderBattle() {
  const L = S.lesson;
  setScreen(`<div class="wrap">${lessonTop(2)}
    <div class="gtitle">⚔️ 미니게임 2 · 몬스터 퀴즈 배틀</div>
    <p class="gdesc">정답을 고르면 내 파트너가 기술을 날려요! 연속으로 맞히면 콤보, 3콤보부터 크리티컬, 빨리 맞히면 번개 보너스 ⚡</p>
    <div class="stage card" id="battleArea">${levelPickerHTML('battle', BATTLE_LEVELS, '🎚️ 배틀 난이도를 골라요')}</div></div>`);
  Voice.say('몬스터 퀴즈 배틀이야! 정답을 맞혀서 야생 몬스터를 쓰러뜨리고 포획해 보자. 먼저 난이도를 골라 줘.');
  bindLevelPicker($('#battleArea'), 'battle', (lv) => playBattle(L, lv));
}
function playBattle(L, level) {
  const cfg = BATTLE_LEVELS[level], caught = caughtIds();
  const pool = L.hunt.kinds.length ? L.hunt.kinds : caught;
  const partner = (pool.length && MONSTERS.find((m) => m.id === pick(pool))) || pick(MONSTERS);
  // 보스: 등급 확률대로 등장 (아직 못 만난 몬스터는 3배 더 잘 나와서 도감을 채울 수 있어요)
  const boss = pickMonster(MONSTERS.filter((m) => m.id !== partner.id), (m) => (caught.includes(m.id) ? 1 : 3));
  L.partnerId = partner.id; // 종합 테스트 보상(파트너 타입 캡슐)에 사용
  const baseStage = (S.save.dex[partner.id] || { stage: 1 }).stage; // 도감에서 진화한 모습 그대로 출전
  const B = { bossHp: cfg.hp, meHp: BATTLE.partnerHp, combo: 0, maxCombo: 0, stage: baseStage, baseStage, asked: 0, firstRight: 0, q: null, tries: 0, locked: false, shownAt: 0, seen: new Set(), queue: [], done: false, stars: 0, level };
  L.battle = B;
  $('#battleArea').outerHTML = `<div class="battle card">
    <div class="arena" id="arena">
      <div class="fighter boss"><div class="hpbox"><b>야생 ${boss.name} <small>${GRADES[gradeOf(boss)].icon} ${GRADES[gradeOf(boss)].name} · ${boss.type}</small></b><div class="hp"><i id="bossHp"></i></div><small id="bossHpTxt"></small></div><div class="fsprite" id="bossSprite">${monsterBig(boss, 2, 170)}</div></div>
      <div class="fighter me"><div class="fsprite" id="meSprite">${monsterBig(partner, baseStage, 150)}</div><div class="hpbox"><b id="meName">${STAGE_PREFIX[baseStage]}${partner.name}</b><div class="hp"><i id="meHp"></i></div><small id="meHpTxt"></small></div></div>
    </div>
    <div class="bpanel" id="bpanel">
      <div class="bq-head"><span class="bq-tag">⚔️ 정답을 골라 공격!</span><span class="combo" id="combo" aria-live="polite"></span><button class="ibtn soft" id="bHint">💡 힌트</button><button class="ibtn soft" id="bRead" aria-label="문제 듣기">🔊</button></div>
      <div class="bq-text" id="bqText"></div><div id="bqVis"></div>
      <div class="skills" id="skills"></div>
      <div class="fb center" id="bfb" aria-live="polite"></div>
    </div></div>`;

  const arenaPoint = (el) => { const a = $('#arena').getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - a.left + r.width / 2, r.top - a.top + r.height / 2]; };
  const floatText = (el, text, cls) => {
    const [x, y] = arenaPoint(el), s = document.createElement('span');
    s.className = `float ${cls}`; s.textContent = text; s.style.left = `${x}px`; s.style.top = `${y - 40}px`;
    $('#arena').appendChild(s); setTimeout(() => s.remove(), 1200);
  };
  const hit = (el) => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 520); };
  const shot = (icon, done) => {
    const [x0, y0] = arenaPoint($('#meSprite')), [x1, y1] = arenaPoint($('#bossSprite')), s = document.createElement('span');
    s.className = 'proj'; s.textContent = icon; $('#arena').appendChild(s);
    const a = s.animate([{ transform: `translate(${x0}px,${y0}px) scale(.6)` }, { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 60}px) scale(1.3)` }, { transform: `translate(${x1}px,${y1}px) scale(1)` }], { duration: REDUCED_MOTION ? 1 : 520, easing: 'ease-in' });
    a.onfinish = () => { s.remove(); if ($('#arena')) done(); };
  };
  const bossStrike = (done) => {
    const a = $('#bossSprite').animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-60px,40px) scale(1.08)' }, { transform: 'translate(0,0)' }], { duration: REDUCED_MOTION ? 1 : 420 });
    a.onfinish = () => { if ($('#arena')) done(); };
  };
  const bars = () => {
    const bh = $('#bossHp'), mh = $('#meHp');
    bh.style.width = `${(B.bossHp / cfg.hp) * 100}%`; bh.classList.toggle('low', B.bossHp / cfg.hp < 0.3);
    mh.style.width = `${(B.meHp / BATTLE.partnerHp) * 100}%`; mh.classList.toggle('low', B.meHp / BATTLE.partnerHp < 0.3);
    $('#bossHpTxt').textContent = `체력 ${B.bossHp} / ${cfg.hp}`;
    $('#meHpTxt').textContent = `체력 ${B.meHp} / ${BATTLE.partnerHp}`;
    $('#combo').textContent = B.combo >= 2 ? `🔥 ${B.combo} 콤보!` : '';
  };
  // 배틀 변신: 보스 체력이 줄면 파트너가 배틀 안에서만 한 단계씩 변신 (도감 진화는 타입 캡슐로만)
  const evolveCheck = () => {
    const ratio = B.bossHp / cfg.hp, boost = ratio <= 0.25 ? 2 : ratio <= 0.6 ? 1 : 0, ns = Math.min(MAX_STAGE, B.baseStage + boost);
    if (ns <= B.stage) return;
    B.stage = ns;
    const name = STAGE_PREFIX[ns] + partner.name, sp = $('#meSprite');
    sp.innerHTML = monsterBig(partner, ns, 150); sp.classList.remove('evo'); void sp.offsetWidth; sp.classList.add('evo');
    $('#meName').textContent = name;
    floatText(sp, '✨ 배틀 변신!', 'speed');
    toast(`✨ 배틀 동안 ${name}${josaRo(name)} 변신! 진짜 진화는 도감에서 타입 캡슐로 할 수 있어요`);
  };
  const show = () => {
    if (B.done) return;
    if (!B.queue.length) B.queue = battleQuestions(L, B.seen);
    if (!B.queue.length) { B.seen = new Set(); B.queue = battleQuestions(L, B.seen); } // 문제를 다 썼으면 처음부터
    B.q = B.queue.shift(); B.seen.add(qid(B.q)); B.tries = 0; B.locked = false; B.hinted = false; B.shownAt = performance.now();
    const q = B.q, ch = shuffle(q.ch.map(String));
    $('#bqText').textContent = q.q;
    $('#bqVis').innerHTML = q.v ? qVisual(q.v) : '';
    $('#skills').innerHTML = ch.map((c, i) => `<button class="skill sk${i}" data-c="${esc(c)}" aria-label="${i + 1}번 ${SKILLS[i][1]}: ${esc(c)}"><span class="sk-ico" aria-hidden="true">${SKILLS[i][0]}</span><span class="sk-txt ${isEmojiOnly(c) ? 'emo' : [...c].length > 8 ? 'long' : ''}">${esc(c)}</span><small aria-hidden="true">${i + 1}</small></button>`).join('');
    $('#bHint').classList.remove('wiggle');
    bars();
    Voice.say(q.q);
  };
  const attack = (btn) => {
    if (B.locked || B.done || btn.disabled) return;
    const q = B.q;
    if (btn.dataset.c !== String(q.a)) { counter(btn); return; }
    B.locked = true; btn.classList.add('ok');
    $('#skills').querySelectorAll('.skill').forEach((b) => { b.disabled = true; });
    const first = B.tries === 0, fast = first && (performance.now() - B.shownAt) / 1000 <= BATTLE.speedSec;
    B.asked++;
    const ad = logSolved(L.key, first, q, { hinted: B.hinted, ms: performance.now() - B.shownAt });
    if (ad && ad.needsBasics) { const rem = Adaptive.remedial(q, B.seen); if (rem) B.queue = [rem, ...B.queue]; } // 기초 다지기 문제를 다음 차례로
    let dmg = BATTLE.retryDmg, crit = false;
    if (first) {
      B.firstRight++; B.combo++; B.maxCombo = Math.max(B.maxCombo, B.combo);
      dmg = BATTLE.baseDmg + BATTLE.comboBonus * Math.min(B.combo - 1, 4) + (fast ? BATTLE.speedBonus : 0);
      crit = B.combo >= 3;
      if (crit) dmg = Math.round(dmg * 1.5);
    } else B.combo = 0;
    const icon = SKILLS[[...$('#skills').children].indexOf(btn)][0];
    Sfx.play(crit ? 'crit' : 'hit');
    shot(icon, () => {
      B.bossHp = Math.max(0, B.bossHp - dmg);
      hit($('#bossSprite'));
      floatText($('#bossSprite'), crit ? `크리티컬! -${dmg}` : first ? `-${dmg}` : `다시 공격! -${dmg}`, crit ? 'crit' : 'dmg');
      if (fast) floatText($('#meSprite'), '⚡ 번개처럼 빨라!', 'speed');
      bars(); evolveCheck();
      const praise = first ? pick(PRAISE) : '좋아, 스스로 고쳐서 공격 성공!';
      $('#bfb').innerHTML = `<span class="good">${praise}${crit ? ' 💥 크리티컬!' : ''}</span><div class="match-sum">✨ ${esc(q.q)} → <b>${esc(q.a)}</b></div>`;
      Voice.say(`${praise}${crit ? ' 크리티컬 공격!' : ''}`);
      if (B.bossHp <= 0) later(win, 1100); else later(show, 1800);
    });
  };
  const counter = (btn) => { // 오답: 보스 반격 + 맞춤 코칭 (정답 비공개), 같은 문제 다시 도전
    btn.classList.add('no'); btn.disabled = true;
    if (B.tries === 0) addWrongNote(L.key, B.q, btn.dataset.c);
    B.tries++; B.combo = 0; B.locked = true;
    const { coach, principle } = coachFor(B.q, btn.dataset.c), lead = pick(ENCOURAGE_SHORT);
    Sfx.play('miss');
    bossStrike(() => {
      B.meHp -= BATTLE.bossHit;
      let revived = '';
      if (B.meHp <= 0) { B.meHp = BATTLE.revive; revived = `<p class="revive">💖 ${partner.name}${kj(partner.name, '이', '가')} 지쳤지만 응원을 받고 다시 일어났어!</p>`; }
      hit($('#meSprite')); floatText($('#meSprite'), `-${BATTLE.bossHit}`, 'ouch'); bars();
      $('#bfb').innerHTML = coachBoxHTML(lead, coach, principle, B.tries === 1) + revived;
      Voice.say(`${lead} ${coach}`);
      B.locked = false;
      if (B.tries >= 2) $('#bHint').classList.add('wiggle');
    });
  };
  const win = () => {
    B.done = true;
    const acc = B.asked ? B.firstRight / B.asked : 0;
    B.stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1;
    Sfx.play('win');
    const bs = $('#bossSprite'), [x, y] = arenaPoint(bs), cap = document.createElement('span');
    cap.className = 'bcap'; cap.innerHTML = capsuleSVG(64); cap.style.left = `${x - 32}px`; cap.style.top = `${y - 32}px`;
    bs.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: REDUCED_MOTION ? 1 : 500, fill: 'forwards' });
    $('#arena').appendChild(cap);
    const firstMeet = !S.save.dex[boss.id];
    addCaught(boss.id); addStars(B.stars); earnBalls(1); bumpDay('memClears'); // memClears = '미니게임 2' 1판 완료 (미션 호환용 이름)
    confetti(70);
    $('#bpanel').innerHTML = `<div class="donebox"><div class="emo">🏆</div>
      <b>승리! 야생 ${boss.name}${josaEulReul(boss.name)} 몬스터 캡슐로 포획했어요!</b>${firstMeet ? '<div>📒 도감에 새 친구가 등록됐어요!</div>' : ''}
      <div>맞힌 문제 ✅ ${B.firstRight} / ${B.asked} · 최고 콤보 🔥 ${B.maxCombo} · ⭐ 별 ${B.stars}개 · 🎁 몬스터 캡슐 1개</div>
      <button class="bigbtn" id="toTest">📝 종합 테스트 보러 가기</button></div>`;
    $('#toTest').addEventListener('click', () => renderTest(false));
    $('#toTest').focus();
    Voice.say(`승리! ${boss.name}${josaEulReul(boss.name)} 포획했어! 최고 콤보는 ${B.maxCombo}! 이제 종합 테스트를 볼까?`);
  };

  $('#skills').addEventListener('click', (e) => { const b = e.target.closest('.skill'); if (b) attack(b); });
  $('#bHint').addEventListener('click', () => { if (B.q && !B.done) { $('#bHint').classList.remove('wiggle'); B.hinted = true; const h = safeHint(B.q); $('#bfb').innerHTML = `<span class="hint-line">👩‍🏫 ${esc(h)}</span>`; Voice.say(h); logHint(L.key); } });
  $('#bRead').addEventListener('click', () => { if (B.q && !B.done) Voice.say(B.q.q); });
  const onKey = (e) => { // 키보드 1~4로 공격
    if (B.done || isOverlayOpen() || $('#alertModal')) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) { const b = $('#skills').children[n - 1]; if (b) { e.preventDefault(); attack(b); } }
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => document.removeEventListener('keydown', onKey));
  show();
}

/* ---------- 10-B. 종합 테스트 (시험) ----------
   - 이번 단원에서 공부한 문제 위주로 20문제를 한 장의 학습지로 풉니다.
   - 숫자 답 → 빈칸 + 숫자 입력판, 그 밖의 답 → 카드 안에서 보기 고르기
   - 1~2학년 수학은 '앞의 수/뒤의 수 가르기' 받아내림 뺄셈 카드를 섞습니다. */
const TEST_SIZE = 20;
/* 종합 테스트 파트너 보상: 80점 1번 · 90점 이상 2번 · 100점 3번 기회.
   기회마다 파트너 등급의 확률(GRADES[등급].capRate)로 파트너 타입 캡슐 1개 — 귀한 몬스터일수록 캡슐도 귀해요 */
const testCapChances = (score) => (score === 100 ? 3 : score >= 90 ? 2 : score >= 80 ? 1 : 0);
function partnerCapReward(L, score) {
  const id = L.partnerId || L.hunt.kinds[L.hunt.kinds.length - 1];
  const partner = MONSTERS.find((m) => m.id === id), chances = testCapChances(score);
  if (!partner || !chances) return null;
  const rate = GRADES[gradeOf(partner)].capRate;
  const got = Array.from({ length: chances }, () => Math.random() < rate).filter(Boolean).length;
  if (got) addTypeCap(partner.type, got);
  return { partner, chances, got, rate };
}
function capRewardText(r) {
  if (!r) return '';
  const cap = typeCapName(r.partner.type), how = `기회 ${r.chances}번 · ${GRADES[gradeOf(r.partner)].name} 등급 확률 ${Math.round(r.rate * 100)}%`;
  return r.got ? ` 🎁 파트너 ${r.partner.name} 보상: ${cap} ${r.got}개! (${how})` : ` 🎁 파트너 ${r.partner.name} 보상: 이번엔 ${cap}이 안 나왔어요 (${how})`;
}
const SPLIT_COUNT = 6;
const NUM_ANS = /^(\d+)(cm²|cm|분|개|°)?$/;
const NEEDS_CHOICES = /가장|다음 중|어느|골라/; // 보기를 봐야만 풀 수 있는 문제
function toTestItem(q) {
  const m = String(q.a).match(NUM_ANS);
  if (m && !NEEDS_CHOICES.test(q.q)) return { kind: 'input', src: q, tag: '빈칸 채우기', blanks: [{ ans: m[1], val: '', label: '답 칸' }], unit: m[2] || '' };
  return { kind: 'choice', src: q, tag: '골라 보기', ch: shuffle(q.ch.map(String)), ans: String(q.a), val: null };
}
// 가르기 카드: 문제 은행의 slots 레코드(1학년 앞의 수/뒤의 수 가르기, 전체 계산 단계)로 만듭니다
function makeSplitItem(front, exclude) {
  const rec = generateDynamicQuestions({ unit: '1-math', conceptTag: front ? 'sub-split-front' : 'sub-split-back', difficulty: 3, count: 1, exclude })[0];
  if (!rec) return null;
  const { a, b, r } = rec.split;
  const blanks = rec.slots.map((s) => ({ ans: s.answer, val: '', label: s.label }));
  return { kind: 'split', rec, front, a, b, given: front ? 10 : b - r, blanks, tag: front ? '앞의 수 가르기' : '뒤의 수 가르기', h: rec.hintTeacher };
}
function buildTestItems(L, fresh) {
  // 가르기 카드(받아내림 뺄셈)는 그 내용을 배우는 단원에서만 (예전 1·2학년 수학 단원 포함)
  const splitCount = L.unit.splitCards || ['1-math', '2-math'].includes(L.key) ? SPLIT_COUNT : 0;
  const need = TEST_SIZE - splitCount;
  const studied = shuffle(L.qs);
  const seen = new Set();
  let qs = [];
  const fill = (arr) => arr.forEach((q) => { const id = qid(q); if (qs.length < need && !seen.has(id)) { seen.add(id); qs = [...qs, q]; } });
  // 첫 시험: 공부한 문제 위주 / 새 학습지: 공부한 문제 절반 + 새 문제
  fill(studied.slice(0, fresh ? Math.ceil(need / 2) : need));
  if (fresh) fill(generatedPool(L.key, need, seen));
  fill(studied); fill(shuffle(questionBank.byUnit(L.key)));
  if (qs.length < need) fill(generatedPool(L.key, need - qs.length, seen));
  const splits = [], used = new Set();
  for (let t = 0; splits.length < splitCount && t < 60; t++) {
    const s = makeSplitItem(splits.length % 2 === 0, used);
    if (s) { used.add(qid(s.rec)); splits.push(s); }
  }
  return shuffle([...qs.map(toTestItem), ...splits]);
}
const blankHTML = (i, b, it) => { const v = it.blanks[b].val; return `<button class="blank ${v ? 'filled' : ''}" data-t="blank" data-i="${i}" data-b="${b}" aria-label="${i + 1}번 ${it.blanks[b].label}">${v || '?'}</button>`; };
function splitBodyHTML(it, i) {
  const cx = it.front ? 74 : 166; // 가를 수(앞/뒤)의 가운데 x 좌표 (.eqrow 칸 너비와 맞춤)
  const given = `<span class="sbox">${it.given}</span>`, blank = blankHTML(i, 0, it);
  const [left, right] = it.front ? [given, blank] : [blank, given];
  return `<div class="split"><div class="eqrow"><span class="n ${it.front ? 'hl' : ''}">${it.a}</span><span class="op">-</span><span class="n ${it.front ? '' : 'hl'}">${it.b}</span><span class="op">=</span>${blankHTML(i, 1, it)}</div>
    <div class="tree"><svg width="292" height="56" aria-hidden="true"><path d="M${cx} 4 L${cx - 40} 50 M${cx} 4 L${cx + 40} 50" stroke="#64748B" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
    <div class="sb" style="left:${cx - 72}px">${left}</div><div class="sb" style="left:${cx + 8}px">${right}</div></div></div>`;
}
function testCardHTML(it, i) {
  const head = `<div class="tc-head"><span class="tc-no">${i + 1}</span><span class="tc-tag">${it.tag}</span>
    <button class="tc-hint" data-t="hint" data-i="${i}">💡 힌트</button><button class="tc-read" data-t="read" data-i="${i}" aria-label="${i + 1}번 문제 듣기">🔊</button></div>`;
  let body;
  if (it.kind === 'split') body = splitBodyHTML(it, i);
  else {
    const q = it.src;
    body = `${q.p ? `<div class="tc-p">${esc(q.p)}</div>` : ''}<div class="tc-q">${esc(q.q)}</div>${q.v ? qVisual(q.v) : ''}`;
    body += it.kind === 'input'
      ? `<div class="tc-ans">답: ${blankHTML(i, 0, it)}${it.unit ? `<span>${it.unit}</span>` : ''}</div>`
      : `<div class="tc-ch">${it.ch.map((c, k) => `<button class="tc-chip ${isEmojiOnly(c) ? 'emo' : ''}" data-t="pick" data-i="${i}" data-k="${k}">${esc(c)}</button>`).join('')}</div>`;
  }
  return `<article class="tcard" id="tc${i}">${head}<div class="tc-htext" hidden></div>${body}<div class="tc-mark"></div></article>`;
}
const numpadHTML = () => `<div class="numpad card"><div class="np-head"><b>🔢 숫자 입력판</b><span class="np-label" id="npLabel">칸을 눌러요</span></div>
  <div class="np-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button class="np" data-np="${d}">${d}</button>`).join('')}
  <button class="np del" data-np="del">지우기</button><button class="np" data-np="0">0</button><button class="np next" data-np="next">다음 칸 ➔</button></div>
  <p class="np-tip">💡 키보드 숫자키와 Enter / 화살표로도 입력할 수 있어요!</p></div>`;
const testItemText = (it) => (it.kind === 'split' ? `${it.a} - ${it.b} = ? ${it.front ? '앞의' : '뒤의'} 수를 갈라서 풀어 보자.` : `${it.src.p ? it.src.p + ' ' : ''}${it.src.q}`);
const testHint = (it) => (it.kind === 'split' ? (it.blanks.some((x) => containsAnswer(it.h, x.ans)) ? GENERIC_HINT : it.h) : safeHint(it.src));
const isAnsweredItem = (it) => (it.kind === 'choice' ? it.val !== null : it.blanks.every((x) => x.val !== ''));
const isCorrectItem = (it) => (it.kind === 'choice' ? it.ch[it.val] === it.ans : it.blanks.every((x) => String(Number(x.val)) === x.ans));
// 오답노트에 담을 수 있도록 시험 카드를 보통 문제 모양으로 바꿉니다
const testItemQ = (it) => (it.kind === 'split' ? it.rec : it.src);
const pickedText = (it) => (it.kind === 'choice' ? it.ch[it.val] : it.kind === 'input' ? it.blanks[0].val + it.unit : it.blanks[1].val);
function testCoach(it) {
  if (it.kind === 'split' && String(Number(it.blanks[0].val)) !== it.blanks[0].ans) return '가르기 칸부터 다시 보자! 어떤 수를 10과 몇으로, 또는 몇과 몇으로 갈라야 계산이 쉬워지는지 생각해 봐.';
  return coachFor(testItemQ(it), pickedText(it)).coach;
}

function renderTest(fresh) {
  const L = S.lesson;
  const items = buildTestItems(L, fresh);
  const st = { blanks: items.flatMap((it, i) => (it.blanks || []).map((_, b) => [i, b])), active: -1, graded: false };
  setScreen(`<div class="wrap">${lessonTop(3)}
    <div class="gtitle">📝 종합 테스트 <small>오늘 공부한 내용으로 ${items.length}문제!</small></div>
    <div class="test">
      <div class="tmain">
        <div id="tScore"></div>
        <div class="tgrid">${items.map(testCardHTML).join('')}</div>
        <div class="tactions card" id="tActions"><button class="bigbtn" id="gradeBtn">💯 채점하기</button><button class="ibtn newbtn" id="newBtn">✨ 새 학습지 받기</button></div>
      </div>
      <aside class="tside">
        <div class="tteach card"><div class="tav" id="teacherAv">${teacherSVG()}</div><div class="bubble"><span id="bubbleText"></span></div></div>
        ${st.blanks.length ? numpadHTML() : ''}
        <div class="tprog card">✏️ 푼 문제 <b id="tDone">0</b> / ${items.length}</div>
      </aside>
    </div></div>`);

  const card = (i) => $(`#tc${i}`);
  const blankEl = (i, b) => $(`#tc${i} [data-t="blank"][data-b="${b}"]`);
  const updateProgress = () => {
    $('#tDone').textContent = items.filter(isAnsweredItem).length;
    items.forEach((it, i) => card(i).classList.toggle('answered', isAnsweredItem(it)));
  };
  const setActive = (pos) => {
    if (!st.blanks.length || st.graded) return;
    if (st.active >= 0) { const e = blankEl(...st.blanks[st.active]); if (e) e.classList.remove('active'); }
    st.active = (pos + st.blanks.length) % st.blanks.length;
    const [i, b] = st.blanks[st.active], el = blankEl(i, b);
    el.classList.add('active'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('#npLabel').textContent = `${i + 1}번 (${items[i].blanks[b].label})`;
  };
  const writeBlank = (fn) => {
    if (st.graded || st.active < 0) return;
    const [i, b] = st.blanks[st.active], slot = items[i].blanks[b];
    slot.val = fn(slot.val);
    const el = blankEl(i, b); el.textContent = slot.val || '?'; el.classList.toggle('filled', !!slot.val);
    updateProgress();
  };
  const typeDigit = (d) => writeBlank((v) => (v.length >= 4 ? v : v === '0' ? d : v + d));
  const erase = () => writeBlank((v) => v.slice(0, -1));
  const goTo = (i) => {
    card(i).scrollIntoView({ block: 'center', behavior: 'smooth' });
    const pos = st.blanks.findIndex(([x, b]) => x === i && items[x].blanks[b].val === '');
    if (pos >= 0) setActive(pos); else { const chip = card(i).querySelector('.tc-chip'); if (chip) chip.focus({ preventScroll: true }); }
  };

  $('.test').addEventListener('click', (e) => {
    const np = e.target.closest('[data-np]');
    if (np) { const k = np.dataset.np; if (k === 'del') erase(); else if (k === 'next') setActive(st.active + 1); else typeDigit(k); return; }
    const t = e.target.closest('[data-t]'); if (!t) return;
    const i = Number(t.dataset.i), it = items[i];
    if (t.dataset.t === 'hint') {
      const h = testHint(it), box = card(i).querySelector('.tc-htext');
      box.textContent = `👩‍🏫 ${h}`; box.hidden = false; it.hinted = true; // 카드 안 자막 (모바일에서도 보이도록)
      teacherSay(h); logHint(L.key);
    }
    if (t.dataset.t === 'read') teacherSay(testItemText(it));
    if (t.dataset.t === 'blank') setActive(st.blanks.findIndex(([x, b]) => x === i && b === Number(t.dataset.b)));
    if (t.dataset.t === 'pick' && !st.graded) {
      it.val = Number(t.dataset.k);
      card(i).querySelectorAll('.tc-chip').forEach((c, k) => c.classList.toggle('sel', k === it.val));
      updateProgress();
    }
  });
  const onKey = (e) => {
    if (isOverlayOpen() || $('#alertModal') || st.graded || !st.blanks.length) return;
    const onOtherButton = document.activeElement && document.activeElement.tagName === 'BUTTON' && !document.activeElement.classList.contains('blank');
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); typeDigit(e.key); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); erase(); }
    else if ((e.key === 'Enter' && !onOtherButton) || e.key === 'ArrowRight') { e.preventDefault(); setActive(st.active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(st.active - 1); }
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => document.removeEventListener('keydown', onKey));

  const askNewSheet = () => {
    const touched = items.some(isAnsweredItem) || items.some((it) => (it.blanks || []).some((x) => x.val));
    if (st.graded || !touched) { renderTest(true); return; }
    showAlert({ icon: '✨', title: '새 학습지를 받을까요?', msg: '지금까지 쓴 답이 모두 지워지고 새 문제가 나와요.', buttons: [{ label: '새 학습지 받기', primary: true, onClick: () => renderTest(true) }, { label: '계속 풀기' }] });
  };
  const grade = () => {
    if (st.graded) return;
    const missing = items.map((it, i) => (isAnsweredItem(it) ? 0 : i + 1)).filter(Boolean);
    if (missing.length) {
      const msg = `아직 풀지 않은 문제가 ${missing.length}개 있어요. 문제를 모두 풀어야 채점할 수 있어요!`;
      showAlert({ icon: '✏️', title: '잠깐! 아직 다 풀지 않았어요', msg, detail: `풀지 않은 문제: ${missing.join(', ')}번`, buttons: [{ label: `${missing[0]}번 문제 풀러 가기`, primary: true, onClick: () => goTo(missing[0] - 1) }] });
      Voice.say(msg);
      return;
    }
    st.graded = true;
    if (st.active >= 0) { const e = blankEl(...st.blanks[st.active]); if (e) e.classList.remove('active'); }
    let correct = 0;
    items.forEach((it, i) => {
      const ok = isCorrectItem(it), c = card(i);
      if (ok) correct++;
      c.classList.add(ok ? 'right' : 'wrong');
      logSolved(L.key, ok, testItemQ(it), { hinted: !!it.hinted }); // 시험지는 한 장이라 문제별 시간은 재지 않음
      if (!ok) addWrongNote(L.key, testItemQ(it), pickedText(it));
      // 정답을 바로 알려 주지 않고, 아이의 답을 짚어 주는 코칭 + 오답노트 안내
      c.querySelector('.tc-mark').innerHTML = ok ? '<span class="stamp ok" aria-label="정답">⭕</span>'
        : `<span class="stamp no" aria-label="오답">❌</span><div class="tc-coach">👩‍🏫 ${esc(testCoach(it))}</div><div class="tc-saved">📕 오답노트에 담았어요. 원리를 떠올리며 다시 풀어 보자!</div>`;
      c.querySelectorAll('.tc-chip').forEach((ch) => { ch.disabled = true; });
      c.querySelectorAll('.blank').forEach((b) => { b.disabled = true; });
    });
    const score = Math.round((correct / items.length) * 100);
    bumpDay('tests');
    const firstTime = !L.test;
    L.bestTestScore = Math.max(L.bestTestScore || 0, score); // 단원 통과 판정용 (새 학습지로 다시 본 시험 포함)
    if (firstTime) {
      const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1, balls = score === 100 ? 2 : score >= 80 ? 1 : 0;
      addStars(stars); if (balls) earnBalls(balls);
      L.test = { correct, total: items.length, score, stars };
      L.capReward = partnerCapReward(L, score);
    }
    const reward = firstTime ? `보상: ⭐ 별 ${L.test.stars}개${score >= 80 ? ` · 몬스터 캡슐 ${score === 100 ? 2 : 1}개` : ''} 획득!${capRewardText(L.capReward)}` :'다시 도전한 점수는 연습 기록이에요. 보상은 첫 채점 때 받았어요.';
    $('#tScore').innerHTML = `<div class="tscore card"><div class="ts-big">${score}<small>점</small></div><div><b>${items.length}문제 중 ${correct}문제 정답!</b><div class="ts-sub">${reward}</div><div class="ts-sub">틀린 문제는 빨간 카드의 선생님 코칭을 읽고, 📕 오답노트에서 다시 풀어 보세요.</div></div></div>`;
    $('#tActions').innerHTML = `<button class="bigbtn" id="toResult">🏆 결과 보러 가기</button>${correct < items.length ? '<button class="ibtn soft" data-act="note">📕 오답 다시 풀기</button>' : ''}<button class="ibtn newbtn" id="newBtn">✨ 새 학습지로 다시 도전</button>`;
    $('#toResult').addEventListener('click', renderResult);
    $('#newBtn').addEventListener('click', askNewSheet);
    $('#tScore').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (score >= 80) confetti(60);
    teacherSay(score === 100 ? '와, 백 점이야! 오늘 배운 걸 완벽하게 익혔구나!' : score >= 70 ? `${score}점! 정말 잘했어. 틀린 문제는 힌트를 다시 들어 보고 확인해 보자!` : '끝까지 다 푼 것만으로도 멋져! 틀린 문제를 한 번 더 살펴보면 다음엔 더 잘할 수 있어!');
  };
  $('#gradeBtn').addEventListener('click', grade);
  $('#newBtn').addEventListener('click', askNewSheet);
  updateProgress();
  if (st.blanks.length) setActive(0);
  window.scrollTo({ top: 0 });
  teacherSay(`종합 테스트야! 오늘 공부한 내용으로 ${items.length}문제를 풀어 보자. 막히면 카드의 힌트 버튼을 눌러 줘. 다 풀면 채점하기!`);
}

/* ---------- 알림 팝업 (채점 확인 등) ---------- */
function showAlert({ icon = '📢', title, msg, detail = '', buttons = [{ label: '확인', primary: true }] }) {
  closeAlert();
  const el = document.createElement('div');
  el.id = 'alertModal'; el.className = 'modal';
  el.innerHTML = `<div class="mbox alertbox" role="alertdialog" aria-modal="true" aria-labelledby="alT" aria-describedby="alM">
    <div class="al-ico">${icon}</div><h2 id="alT">${esc(title)}</h2><p id="alM">${esc(msg)}</p>${detail ? `<p class="al-detail">${esc(detail)}</p>` : ''}
    <div class="al-btns">${buttons.map((b, k) => `<button class="${b.primary ? 'bigbtn' : 'ibtn soft'}" data-al="${k}">${esc(b.label)}</button>`).join('')}</div></div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    if (e.target === el) { closeAlert(); return; }
    const b = e.target.closest('[data-al]'); if (!b) return;
    const fn = buttons[Number(b.dataset.al)].onClick;
    closeAlert(); if (fn) fn();
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeAlert(); } });
  el.querySelector('[data-al]').focus();
}
function closeAlert() { const el = $('#alertModal'); if (el) el.remove(); }

function renderResult() {
  const L = S.lesson, ws = L.ws.stars, cap = L.hunt.captured, ms = L.battle.stars;
  const test = L.test || { correct: 0, total: TEST_SIZE, score: 0, stars: 0 };
  const total = ws + cap + ms + test.stars; // 이번 수업에서 받은 별
  const ratio = (ws + cap + ms + test.correct) / (L.qs.length + (L.hunt.total || HUNT_ROUNDS) + 3 + test.total);
  const rating = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
  S.save.best = { ...S.save.best, [L.key]: Math.max(S.save.best[L.key] || 0, rating) };
  persist();
  const unitRes = L.unitRes || applyUnitResult(L); // 결과 화면을 다시 열어도 한 번만 반영
  L.unitRes = unitRes;
  const passed = unitRes.kind === 'passed';
  const caught = L.hunt.kinds.map((id) => MONSTERS.find((m) => m.id === id));
  const order = ['kor', 'math', 'eng'], nextSubj = order[(order.indexOf(L.subj) + 1) % 3];
  const msg = rating === 3 ? '우와, 별 세 개! 오늘 정말 최고였어! 선생님이 꼭 안아 주고 싶어.' : rating === 2 ? '잘했어! 별 두 개야. 조금만 더 연습하면 별 세 개도 문제없어!' : '끝까지 해낸 것만으로도 정말 멋져! 다음엔 분명 더 잘할 수 있어!';
  setScreen(`<div class="wrap">${lessonTop(4)}
    <section class="result card">
      <div class="tav" id="teacherAv">${teacherSVG()}</div>
      <div>
        <div class="bubble"><span id="bubbleText">${msg}</span></div>
        <div class="bigstars" style="margin-top:14px" aria-label="별 ${rating}개">${[1, 2, 3].map((n, i) => `<span class="${n <= rating ? '' : 'off'}" style="animation-delay:${0.2 + i * 0.25}s">⭐</span>`).join('')}</div>
        <div class="rrows">
          <div class="rrow"><span>📝 학습지 (한 번에 정답)</span><span>⭐ ${ws} / ${L.qs.length}</span></div>
          <div class="rrow"><span>🔍 숨은 몬스터 포획</span><span>${capsuleSVG(20)} ${cap} / ${(L.hunt.total || HUNT_ROUNDS)}</span></div>
          <div class="rrow"><span>⚔️ 몬스터 퀴즈 배틀</span><span>⭐ ${ms} / 3</span></div>
          <div class="rrow"><span>📝 종합 테스트 (${test.score}점)</span><span>✅ ${test.correct} / ${test.total} · ⭐ ${test.stars}</span></div>
          ${L.capReward ? `<div class="rrow"><span>🎁 파트너 ${esc(L.capReward.partner.name)} 보상 (${GRADES[gradeOf(L.capReward.partner)].name})</span><span>${typeCapsuleSVG(L.capReward.partner.type, 20)} ${esc(typeCapName(L.capReward.partner.type))} ${L.capReward.got}개 / 기회 ${L.capReward.chances}번</span></div>` : ''}
          <div class="rrow"><span>이번에 모은 별 / 누적 별</span><span>⭐ ${total} / ${S.save.stars}</span></div>
          <div class="rrow"><span>🎁 이번에 받은 몬스터 캡슐</span><span>${capsuleSVG(20)} ${L.balls}개</span></div>
        </div>
        ${caught.length ? `<div class="caught-row" style="justify-content:flex-start">${caught.map((m) => `<div>${monsterBig(m, 1, 80)}${m.name}</div>`).join('')}</div>` : ''}
        ${unitResultHTML(unitRes)}
        <div class="res-diag">${diagnosisHTML({ unit: L.key, limit: 1, compact: true })}</div>
        <div class="rbtns">
          ${passed && unitRes.next ? `<button class="bigbtn" id="nextUnit">▶ 다음 단원 공부하기</button>` : ''}
          <button class="${passed && unitRes.next ? 'ibtn soft' : 'bigbtn'}" id="again">↺ ${L.review ? '복습 한 번 더' : passed ? '이 단원 복습하기' : '이 단원 다시 도전'}</button>
          <button class="ibtn soft" id="toCourse">🗺️ 진도표</button>
          <button class="bigbtn violet" id="nextSubj">${SUBJECTS[nextSubj].icon} ${SUBJECTS[nextSubj].name} 공부하기</button>
          ${pendingWrongs().length ? `<button class="ibtn soft" data-act="note">📕 오답 다시 풀기 (${pendingWrongs().length})</button>` : ''}
          <button class="ibtn soft" data-act="report">📊 학습 리포트</button>
          <button class="ibtn soft" data-act="dex" aria-haspopup="dialog">📒 도감 보기</button>
          <button class="ibtn soft" data-act="home">🏠 홈으로</button>
        </div>
      </div>
    </section></div>`);
  // 통과한 단원을 다시 하면 '복습'(진도 변화 없음), 아직 통과 전이면 같은 단원 재도전
  $('#again').addEventListener('click', () => startLesson(L.subj, { unitKey: L.key, review: L.review || passed }));
  const nextBtn = $('#nextUnit'); if (nextBtn) nextBtn.addEventListener('click', () => startLesson(L.subj));
  $('#toCourse').addEventListener('click', () => renderCourseMap(L.ck || courseOf(L.key)));
  $('#nextSubj').addEventListener('click', () => startLesson(nextSubj));
  confetti(70);
  const passSay = passed ? (unitRes.next ? ` 그리고 단원 통과! 다음에는 ${unitRes.next.title} 단원을 공부하자!` : ' 그리고 준비된 단원을 모두 통과했어!') : '';
  later(() => teacherSay(msg + passSay), 300);
}
