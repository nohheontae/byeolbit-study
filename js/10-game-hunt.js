/* 별빛 학습지 — 미니게임 1 – 숨은 몬스터 찾기 */
'use strict';

/* =====================================================================
   9. 미니게임 1 – 숨은 몬스터 찾기
   - 난이도(쉬움/보통) 선택, 매 판 무작위 배치, 학년·과목별 동적 미션
   ===================================================================== */
const HUNT_ROUNDS = 3;
const HUNT_LEVELS = {
  easy: { label: '쉬움', icon: '🌱', desc: '몬스터 4마리 · 45초 · 조금만 숨어 있어요', count: 4, time: 45, scale: 0.66, lift: 0, decoys: 0 },
  normal: { label: '보통', icon: '🔥', desc: '몬스터 6마리 · 35초 · 빈 덤불 함정까지!', count: 6, time: 35, scale: 0.56, lift: 12, decoys: 2 },
};
const defaultLevel = (kind) => S.save.prefs[kind] || (S.lesson.grade <= 2 ? 'easy' : 'normal');
function levelPickerHTML(kind, levels, title) {
  const cur = defaultLevel(kind);
  return `<div class="lvpick"><div class="lv-title">${title}</div><div class="lv-btns">${Object.entries(levels).map(([k, v]) => `
    <button class="lvbtn ${k === cur ? 'rec' : ''}" data-lv="${k}"><span class="lv-ico">${v.icon}</span><b>${v.label}</b><small>${v.desc}</small>${k === cur ? '<em>추천</em>' : ''}</button>`).join('')}</div></div>`;
}
function bindLevelPicker(root, kind, onPick) {
  root.querySelectorAll('[data-lv]').forEach((b) => b.addEventListener('click', () => {
    const lv = b.dataset.lv;
    S.save = { ...S.save, prefs: { ...S.save.prefs, [kind]: lv } };
    persist(); onPick(lv);
  }));
  const rec = root.querySelector('.lvbtn.rec'); if (rec) rec.focus();
}

function forestBG() {
  const trees = [[60, 120], [250, 90], [450, 110], [620, 80], [770, 120]].map(([x, h]) => {
    const top = 250 - h + 60;
    return `<rect x="${x - 10}" y="${top}" width="20" height="${h}" fill="#8B5E34"/><circle cx="${x}" cy="${top - 10}" r="48" fill="#5DBB63"/><circle cx="${x - 30}" cy="${top + 15}" r="34" fill="#4CAF50"/><circle cx="${x + 30}" cy="${top + 15}" r="34" fill="#4CAF50"/>`;
  }).join('');
  const flowers = Array.from({ length: 14 }, (_, i) => `<circle cx="${30 + i * 56}" cy="${440 + ((i * 37) % 30)}" r="5" fill="${['#FF8FAB', '#FFD43B', '#fff'][i % 3]}"/>`).join('');
  return `<defs><linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE8FF"/><stop offset="1" stop-color="#F0FFE6"/></linearGradient></defs>
    <rect width="800" height="480" fill="url(#gF)"/><circle cx="730" cy="56" r="32" fill="#FFE27A"/>
    <g fill="#fff" opacity=".85"><ellipse cx="150" cy="54" rx="50" ry="17"/><ellipse cx="190" cy="44" rx="36" ry="15"/><ellipse cx="480" cy="36" rx="44" ry="14"/></g>
    <path d="M0 240 Q200 170 400 230 T800 210 V480 H0Z" fill="#A6E08B"/>${trees}
    <path d="M0 300 Q220 260 420 300 T800 285 V480 H0Z" fill="#79C95F"/>${flowers}`;
}
function seaBG() {
  const rays = [100, 300, 520, 700].map((x) => `<path d="M${x} 0 L${x + 60} 0 L${x + 140} 480 L${x + 40} 480Z" fill="#fff" opacity=".07"/>`).join('');
  const bubbles = Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 97) % 800}" cy="${60 + ((i * 53) % 260)}" r="${3 + (i % 4)}" fill="none" stroke="#E0FAFF" stroke-width="2" opacity=".7"/>`).join('');
  const weeds = [40, 250, 560, 760].map((x) => `<path d="M${x} 480 Q${x - 20} 420 ${x} 380 Q${x + 20} 340 ${x} 300" stroke="#2FBF71" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('');
  return `<defs><linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EDCFF"/><stop offset="1" stop-color="#1E6FB8"/></linearGradient></defs>
    <rect width="800" height="480" fill="url(#gS)"/>${rays}${bubbles}${weeds}
    <path d="M0 420 Q200 390 400 420 T800 410 V480 H0Z" fill="#F4D99B"/>
    <g fill="#FFB86B"><path d="${starPath(330, 450, 14, 6)}"/><path d="${starPath(700, 445, 12, 5)}"/></g>`;
}
function caveBG() {
  const stal = Array.from({ length: 12 }, (_, i) => { const x = i * 70 + 10; const h = 40 + ((i * 29) % 60); return `<path d="M${x} 0 L${x + 40} 0 L${x + 20} ${h}Z" fill="#2A1E45"/>`; }).join('');
  const crystals = [[90, 300], [380, 260], [720, 280], [560, 430]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="40" fill="#7CF7FF" opacity=".12"/><path d="M${x - 10} ${y + 20} L${x} ${y - 24} L${x + 10} ${y + 20}Z" fill="#7CF7FF" opacity=".85"/><path d="M${x + 6} ${y + 20} L${x + 18} ${y - 6} L${x + 24} ${y + 20}Z" fill="#C4A8FF" opacity=".85"/>`).join('');
  return `<defs><linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3570"/><stop offset="1" stop-color="#1A1230"/></linearGradient></defs>
    <rect width="800" height="480" fill="url(#gC)"/>${stal}
    <path d="M0 250 Q160 220 300 250 T600 240 T800 250 V480 H0Z" fill="#3A2B5C" opacity=".8"/>${crystals}
    <path d="M0 430 Q200 410 400 430 T800 425 V480 H0Z" fill="#2A1E45"/>`;
}
function bushCover(x, y) {
  return `<g class="cover"><circle cx="${x - 34}" cy="${y + 46}" r="28" fill="#3E9E4A"/><circle cx="${x + 34}" cy="${y + 46}" r="28" fill="#3E9E4A"/><circle cx="${x}" cy="${y + 34}" r="36" fill="#4DB65A"/><rect x="${x - 62}" y="${y + 44}" width="124" height="30" rx="15" fill="#3E9E4A"/><circle cx="${x - 12}" cy="${y + 20}" r="6" fill="#7EDB86" opacity=".7"/><circle cx="${x + 22}" cy="${y + 36}" r="4" fill="#FF8FAB"/></g>`;
}
function rockCover(x, y) {
  return `<g class="cover"><path d="M${x - 52} ${y + 40} Q${x - 62} ${y} ${x - 48} ${y - 8} M${x - 52} ${y + 14} Q${x - 70} ${y + 4} ${x - 74} ${y - 12}" stroke="#FF7FA8" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${y + 44}" rx="66" ry="38" fill="#6F7FA0"/><ellipse cx="${x - 16}" cy="${y + 30}" rx="28" ry="11" fill="#8D9BBA" opacity=".8"/></g>`;
}
function boulderCover(x, y) {
  return `<g class="cover"><path d="M${x - 66} ${y + 74} L${x - 58} ${y + 22} L${x - 20} ${y + 4} L${x + 30} ${y + 8} L${x + 64} ${y + 30} L${x + 68} ${y + 74}Z" fill="#4B3D6E" stroke="#2A1E45" stroke-width="3"/><path d="M${x + 36} ${y + 26} L${x + 46} ${y - 8} L${x + 56} ${y + 26}Z" fill="#7CF7FF" opacity=".9"/><path d="M${x - 30} ${y + 20} L${x - 10} ${y + 14}" stroke="#6A5A92" stroke-width="4" stroke-linecap="round"/></g>`;
}
const SCENES = [
  { name: '숲속 스테이지', emoji: '🌳', bg: forestBG, cover: bushCover },
  { name: '바닷속 스테이지', emoji: '🌊', bg: seaBG, cover: rockCover },
  { name: '수정 동굴 스테이지', emoji: '💎', bg: caveBG, cover: boulderCover },
];

// 매 판 다른 배치: 2줄 격자에 엇갈림(stagger)과 흔들림(jitter)을 더해 무작위로 자리를 고릅니다
function huntPositions(total) {
  const cols = total > 6 ? 4 : 3, x0 = 115, x1 = 685, ys = [R(165, 200), R(330, 372)], stagger = R(-28, 28);
  const cells = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x0 + (c * (x1 - x0)) / (cols - 1) + (r ? stagger : -stagger) + R(-16, 16);
      cells.push([Math.round(clamp(cx, 105, 695)), ys[r] + R(-12, 12)]);
    }
  }
  return shuffle(cells).slice(0, total);
}
// 미션: 단원의 고정 미션 1개 + 이번 수업 문제/문제 생성기에서 뽑은 동적 미션 2개
// 팻말은 그 문제의 보기만 씁니다. 다른 수·낱말을 지어내 끼우면 '가장 큰 수'처럼
// 보기 사이를 비교하는 문제에서 새 팻말이 정답이 되어 버리기 때문에, 모자란 자리는 빈 덤불로 채웁니다.
function buildHuntMissions(L, level) {
  const need = HUNT_LEVELS[level].count;
  const fixed = L.unit.hunt.map(([text, ans, wrongs]) => ({ text, ans, labels: [ans, ...wrongs], v: null, h: '미션을 소리 내어 천천히 읽어 보자. 그다음 팻말을 하나씩 살펴보며 미션에 맞는지 따져 봐!' }));
  const qs = [...L.qs, ...generatedPool(L.key, 30, new Set(L.qs.map(qid)))]
    .filter((q) => !q.p && [...String(q.a)].length <= 10 && q.ch.length === 4 && q.ch.every((c) => [...String(c)].length <= 12));
  // 고정 미션이 없는 단원은 3판 모두 문제에서 미션을 만듭니다
  const dynamic = shuffle(qs).slice(0, HUNT_ROUNDS - Math.min(1, fixed.length)).map((q) => ({ text: `${q.q} 정답 팻말을 든 몬스터를 찾아라!`, ans: String(q.a), labels: q.ch.map(String), v: q.v || null, h: safeHint(q) }));
  const picked = [...shuffle(fixed).slice(0, HUNT_ROUNDS - dynamic.length), ...dynamic];
  return shuffle(picked).map((m) => {
    const labels = [m.ans, ...shuffle(uniq(m.labels).filter((x) => x !== m.ans))].slice(0, need);
    return { ...m, labels: shuffle(labels) };
  });
}
function textWidth(s, fs) { return [...s].reduce((w, ch) => w + (/[\u0000-ɏ]/.test(ch) ? (ch === ' ' ? fs * 0.3 : fs * 0.6) : fs * 1.05), 0); }
function huntMonsterHTML(it, scale) {
  const [x, y] = it.slot, label = String(it.label), emo = isEmojiOnly(label);
  const fs = emo ? 28 : [...label].length > 7 ? 15 : 19;
  const w = Math.max(50, textWidth(label, fs) + 22);
  return `<g class="hm" data-i="${it.i}" transform="translate(${x},${y})" role="button" tabindex="0" aria-label="팻말 ${esc(label)}${josaEulReul(label)} 든 몬스터">
    <g class="hm-in"><g class="hm-sh"><g class="bob" style="animation-delay:${(it.i * 0.37).toFixed(2)}s">
      <rect x="-3" y="-62" width="6" height="26" fill="#8B5E34"/>
      <rect x="${-w / 2}" y="-86" width="${w}" height="38" rx="11" fill="#FFF8E1" stroke="#8B5E34" stroke-width="3"/>
      <text x="0" y="${emo ? -57 : -61}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="#2B2F4A" font-family="${esc(FONT)}">${esc(label)}</text>
      <g transform="translate(${(-60 * scale).toFixed(1)},${(-64 * scale).toFixed(1)}) scale(${scale})">${monsterSVG(it.kind)}</g>
    </g></g></g></g>`;
}
function renderHunt() {
  const L = S.lesson;
  setScreen(`<div class="wrap">${lessonTop(2)}
    <div class="gtitle">🔍 미니게임 1 · 숨은 몬스터 찾기</div>
    <div class="mission card" id="missionCard" hidden><div class="mbadge">미션 <b id="rNum">1</b>/${HUNT_ROUNDS}</div>
      <div class="mtext"><span id="mText"></span><div id="mVis"></div></div>
      <button class="ibtn soft" id="mHint">💡 힌트</button><button class="ibtn soft" id="mRead" aria-label="미션 듣기">🔊</button></div>
    <div class="timer" id="timerBar" hidden aria-hidden="true"><i id="tFill"></i><span id="tTxt"></span></div>
    <div class="stage card" id="stage">${levelPickerHTML('hunt', HUNT_LEVELS, '🎚️ 숨은 몬스터 찾기 난이도를 골라요')}</div>
    <div class="fb center" id="hfb" aria-live="polite"></div></div>`);
  Voice.say('숨은 몬스터 찾기야! 먼저 난이도를 골라 줘.');
  bindLevelPicker($('#stage'), 'hunt', (lv) => playHunt(L, lv));
}
function playHunt(L, level) {
  const cfg = HUNT_LEVELS[level], rounds = buildHuntMissions(L, level), sceneOrder = shuffle([0, 1, 2]);
  const H = { r: 0, captured: 0, kinds: [], total: rounds.length, level };
  L.hunt = H;
  $('#missionCard').hidden = false; $('#timerBar').hidden = false;
  let timerId = 0, left = cfg.time, busy = false, cur = null;
  onCleanup(() => clearInterval(timerId));
  $('#mRead').addEventListener('click', () => { if (cur) Voice.say(cur.text); });
  $('#mHint').addEventListener('click', () => {
    if (!cur) return;
    $('#hfb').innerHTML = `<span class="hint-line">👩‍🏫 ${esc(cur.h)}</span>`;
    Voice.say(cur.h); logHint(L.key);
  });

  const startRound = () => {
    const m = rounds[H.r], scene = SCENES[sceneOrder[H.r % 3]];
    // 정답 팻말을 든 몬스터(잡게 될 몬스터)는 등급 확률대로, 나머지 팻말 몬스터도 등급 확률대로
    const target = pickMonster(MONSTERS), ansAt = m.labels.indexOf(m.ans);
    const others = sampleMonsters(m.labels.length - 1, MONSTERS.filter((x) => x !== target));
    const kinds = [...others.slice(0, ansAt), target, ...others.slice(ansAt)];
    const pos = huntPositions(m.labels.length + cfg.decoys + Math.max(0, cfg.count - m.labels.length)); // 팻말이 모자란 만큼 빈 덤불 추가
    const slots = pos.slice(0, m.labels.length), decoys = pos.slice(m.labels.length);
    const layers = [
      ...m.labels.map((label, i) => ({ y: slots[i][1], html: huntMonsterHTML({ label, kind: kinds[i], slot: slots[i], i }, cfg.scale) + scene.cover(slots[i][0], slots[i][1] - cfg.lift) })),
      ...decoys.map(([x, y]) => ({ y, html: scene.cover(x, y - cfg.lift) })),
    ].sort((a, b) => a.y - b.y);
    cur = { ...m, kinds, slots };
    busy = false;
    $('#rNum').textContent = H.r + 1;
    $('#mText').textContent = `${scene.emoji} ${m.text}`;
    $('#mVis').innerHTML = m.v ? qVisual(m.v) : '';
    $('#hfb').textContent = `${cfg.icon} ${cfg.label} · 팻말을 잘 보고 몬스터를 눌러 몬스터 캡슐로 잡아 보자!`;
    $('#stage').innerHTML = `<svg viewBox="0 0 800 480" id="hsvg" role="group" aria-label="${scene.name}">${scene.bg()}${layers.map((l) => l.html).join('')}<g id="fx"></g></svg>`;
    const svg = $('#hsvg');
    const choose = (e) => { const g = e.target.closest('.hm'); if (g) onPick(g); };
    svg.addEventListener('click', choose);
    svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(e); } });
    Voice.say(m.text);
    left = cfg.time; clearInterval(timerId); timerId = setInterval(tick, 100); tick();
  };
  const tick = () => {
    if (isOverlayOpen()) return; // 팝업이 열려 있는 동안 시간 멈춤
    left = Math.max(0, left - 0.1);
    const f = $('#tFill'); if (!f) return;
    f.style.width = (left / cfg.time) * 100 + '%'; f.classList.toggle('low', left < 10);
    $('#tTxt').textContent = `⏰ ${Math.ceil(left)}초`;
    if (left <= 0 && !busy) timeUp();
  };
  const onPick = (g) => {
    if (busy) return;
    const i = Number(g.dataset.i);
    if (cur.labels[i] === cur.ans) { capture(g, i); return; }
    const sh = g.querySelector('.hm-sh'); sh.classList.remove('shake'); void sh.getBoundingClientRect(); sh.classList.add('shake');
    const msg = pick(['앗, 이 친구가 아니야! 미션을 다시 읽어 볼까?', '아쉬워! 다른 몬스터의 팻말도 살펴보자.', '괜찮아! 막히면 힌트 버튼을 눌러 봐.']);
    $('#hfb').innerHTML = `<span class="try">${msg}</span>`; Voice.say(msg);
  };
  const capture = (g, i) => {
    busy = true; clearInterval(timerId);
    const [x, y] = cur.slots[i], kind = cur.kinds[i], fx = $('#fx');
    fx.innerHTML = `<g id="cap"><g transform="translate(-22,-22) scale(.44)">${capsuleInner()}</g></g>`;
    const cap = $('#cap'), inG = g.querySelector('.hm-in');
    animate(650, (t) => {
      const e = ease(t);
      cap.setAttribute('transform', `translate(${lerp(400, x, e)},${lerp(520, y, e) - Math.sin(Math.PI * t) * 150}) rotate(${t * 720})`);
    }, () => {
      animate(380, (t) => { inG.setAttribute('transform', `scale(${1 - t})`); inG.setAttribute('opacity', String(1 - t)); }, () => {
        animate(1000, (t) => { cap.setAttribute('transform', `translate(${x},${y}) rotate(${Math.sin(t * Math.PI * 6) * (1 - t) * 24})`); }, () => {
          const sparks = Array.from({ length: 8 }, (_, k) => `<path class="spk" data-k="${k}" d="${starPath(0, 0, 10, 4)}" fill="#FFE27A"/>`).join('');
          fx.insertAdjacentHTML('beforeend', `<g id="sparks">${sparks}</g><text x="${x}" y="${y - 50}" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" stroke="#7A5CFF" stroke-width="6" paint-order="stroke" font-family="${esc(FONT)}">잡았다!</text>`);
          const spk = [...fx.querySelectorAll('.spk')];
          animate(700, (t) => spk.forEach((s, k) => { const a = (k / 8) * Math.PI * 2, d = 20 + 60 * ease(t); s.setAttribute('transform', `translate(${x + Math.cos(a) * d},${y + Math.sin(a) * d}) scale(${1 - t * 0.6})`); s.setAttribute('opacity', String(1 - t)); }));
          H.captured++; H.kinds = [...H.kinds, kind.id];
          earnBalls(1); addStars(1); addCaught(kind.id); confetti(30);
          const rareCatch = GRADE_ORDER.indexOf(gradeOf(kind)) >= GRADE_ORDER.indexOf('rare');
          $('#hfb').innerHTML = `<span class="good">🎉 ${gradeBadge(kind)} ${kind.name}${josaEulReul(kind.name)} 몬스터 캡슐로 잡았어! ⭐+1${rareCatch ? ` · 우와, ${GRADES[gradeOf(kind)].name} 몬스터야!` : ''}</span>`;
          Voice.say(`잡았다! ${kind.name}${josaEulReul(kind.name)} 포획했어! 정말 잘 찾았어!`);
          later(nextRound, 2400);
        });
      });
    });
  };
  const timeUp = () => {
    busy = true; clearInterval(timerId);
    const i = cur.labels.indexOf(cur.ans), [x, y] = cur.slots[i];
    $('#fx').innerHTML = `<circle class="reveal" cx="${x}" cy="${y - 20}" r="70" fill="none" stroke="#FFE27A" stroke-width="8"/>`;
    const msg = '시간이 다 됐어! 괜찮아, 반짝이는 동그라미 속 친구가 정답이었어. 다음 미션에서 다시 도전해 보자!';
    $('#hfb').innerHTML = `<span class="try">${msg}</span>`; Voice.say(msg);
    later(nextRound, 3600);
  };
  const nextRound = () => { H.r++; if (H.r >= rounds.length) huntDone(); else startRound(); };
  const huntDone = () => {
    cur = null;
    const caught = H.kinds.map((id) => MONSTERS.find((m) => m.id === id));
    $('#tTxt').textContent = '⏰ 끝!'; $('#tFill').style.width = '0%';
    $('#mText').textContent = '모든 미션 완료!'; $('#mVis').innerHTML = '';
    $('#stage').innerHTML = `<div class="hsum"><div style="font-size:52px">🏕️</div><b>숨은 몬스터 찾기 끝! ${H.captured} / ${rounds.length}마리 포획</b>
      <div class="caught-row">${caught.length ? caught.map((m) => `<div>${monsterBig(m, 1, 90)}${m.name}</div>`).join('') : '<div style="padding:12px">이번엔 못 잡았지만 다음엔 꼭 잡을 수 있어!</div>'}</div>
      <button class="bigbtn violet" id="toBattle">⚔️ 미니게임 2 · 몬스터 퀴즈 배틀 하러 가기</button></div>`;
    $('#hfb').textContent = H.captured > 0 ? '' : '한 마리 이상 잡으면 오늘의 미션 "1판 클리어"가 달성돼요!';
    if (H.captured > 0) bumpDay('huntClears');
    $('#toBattle').addEventListener('click', renderBattle);
    Voice.say(`숨은 몬스터 찾기 끝! ${H.captured}마리를 잡았어. 이제 잡은 친구와 함께 몬스터 퀴즈 배틀을 해 볼까?`);
  };
  startRound();
}
