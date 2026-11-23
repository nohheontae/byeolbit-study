/* 별빛 학습지 — 오리지널 몬스터 & 몬스터 캡슐 SVG */
'use strict';

/* =====================================================================
   2. 오리지널 몬스터 & 몬스터 캡슐 (SVG)
   ===================================================================== */
const MONSTERS = [
  { id: 'banjjak', name: '반짝냥', c: '#FFD43B', c2: '#FFF3B0', ear: 'cat', tail: 'star', type: '별빛 타입', desc: '꼬리 끝의 별로 깜깜한 밤길을 밝혀 주는 고양이 몬스터예요. 칭찬을 들으면 별이 더 반짝여요.' },
  { id: 'pongdang', name: '퐁당이', c: '#5BC0F8', c2: '#D6F1FF', ear: 'drop', tail: 'none', type: '물방울 타입', desc: '머리 위 물방울로 목마른 꽃에게 물을 나눠 줘요. 비 오는 날을 제일 좋아해요.' },
  { id: 'bulkkot', name: '불꽃여우', c: '#FF8A3D', c2: '#FFE2C7', ear: 'cat', tail: 'flame', type: '불꽃 타입', desc: '꼬리 불꽃으로 추운 친구를 따뜻하게 해 줘요. 화가 나도 꾹 참는 의젓한 여우예요.' },
  { id: 'saessak', name: '새싹콩', c: '#7BD66B', c2: '#E3F9D9', ear: 'leaf', tail: 'none', type: '풀잎 타입', desc: '햇볕을 받으면 머리의 새싹이 쑥쑥 자라요. 책 읽는 소리를 들으면 잎이 춤을 춰요.' },
  { id: 'mongsil', name: '몽실양', c: '#F7C6E0', c2: '#FFF0F7', ear: 'wool', tail: 'none', type: '구름 타입', desc: '폭신한 털로 친구들의 낮잠 베개가 되어 줘요. 기분이 좋으면 몸이 둥실 떠올라요.' },
  { id: 'bawi', name: '바위곰', c: '#A3A8B8', c2: '#E3E5EC', ear: 'round', tail: 'none', type: '바위 타입', desc: '단단한 몸으로 친구들을 지켜 줘요. 느리지만 한 번 시작한 일은 끝까지 해내요.' },
  { id: 'eoreum', name: '얼음펭', c: '#8FD3FF', c2: '#FFFFFF', ear: 'horn', tail: 'none', type: '얼음 타입', desc: '얼음 뿔에서 시원한 바람이 나와요. 더운 여름에 친구들에게 인기 만점이에요.' },
  { id: 'borabu', name: '보라부엉', c: '#B18CFF', c2: '#EDE3FF', ear: 'tuft', tail: 'none', type: '지혜 타입', desc: '큰 눈으로 밤하늘의 별자리를 세어요. 어려운 문제를 만나면 고개를 갸웃하며 생각해요.' },
  { id: 'kkangchong', name: '깡총토', c: '#FFC2D4', c2: '#FFF0F5', ear: 'bunny', tail: 'none', type: '바람 타입', desc: '긴 귀로 멀리서 친구가 부르는 소리도 들어요. 한 번 뛰면 구름까지 닿을 듯 높이 뛰어요.' },
  { id: 'donggeul', name: '동글벌레', c: '#9CCB5B', c2: '#E6F6CF', ear: 'antenna', tail: 'none', pat: 'stripes', type: '곤충 타입', desc: '깜짝 놀라면 몸을 동그랗게 말아요. 더듬이로 맛있는 이슬을 찾아내요.' },
  { id: 'beoseot', name: '버섯돌이', c: '#F6E2C8', c2: '#FFF8EE', ear: 'mushroom', tail: 'none', type: '숲 타입', desc: '비가 온 다음 날 숲에서 쑥 자라나요. 모자 속에 작은 씨앗을 모아 둬요.' },
  { id: 'padofin', name: '파도핀', c: '#4FD1C5', c2: '#D7FBF6', ear: 'fin', tail: 'fish', type: '바다 타입', desc: '파도를 타며 노래하는 걸 좋아해요. 지느러미로 바닷속 길을 알려 줘요.' },
  { id: 'bosong', name: '보송도치', c: '#C8A27A', c2: '#F5E8D8', ear: 'spike', tail: 'none', type: '땅 타입', desc: '가시가 보송보송해서 안아도 하나도 안 아파요. 낙엽 이불을 덮고 낮잠을 자요.' },
  { id: 'jjiritkong', name: '찌릿콩', c: '#C6F04A', c2: '#F3FFD0', ear: 'none', tail: 'bolt', type: '번개 타입', desc: '신이 나면 꼬리에서 찌릿찌릿 작은 번개가 나와요. 깜깜한 밤에는 손전등 대신 길을 밝혀 줘요.' },
  { id: 'kkotnyang', name: '꽃잎냥', c: '#FF9EC7', c2: '#FFE6F1', ear: 'cat', tail: 'none', pat: 'spots', type: '꽃 타입', desc: '몸의 무늬가 꽃잎처럼 생겼어요. 봄이 오면 향기로운 냄새가 퐁퐁 나요.' },
  { id: 'moraegom', name: '모래곰', c: '#E9C46A', c2: '#FFF3D1', ear: 'round', tail: 'none', pat: 'spots', type: '모래 타입', desc: '사막에서 모래성을 쌓는 게 취미예요. 발바닥이 넓어서 모래에 빠지지 않아요.' },
  { id: 'byeolbam', name: '별밤부엉', c: '#5B6CFF', c2: '#DDE1FF', ear: 'tuft', tail: 'none', pat: 'spots', type: '밤 타입', desc: '밤하늘을 날며 길 잃은 별똥별을 찾아 줘요. 낮에는 나무 위에서 꾸벅꾸벅 졸아요.' },
  { id: 'mujigae', name: '무지개몽', c: '#C7B8FF', c2: '#F3EFFF', ear: 'wool', tail: 'none', pat: 'heart', type: '무지개 타입', desc: '비가 그치면 털 색깔이 무지갯빛으로 바뀌어요. 친구가 울면 꼭 안아 줘요.' },
  { id: 'danpung', name: '단풍여우', c: '#E85D3F', c2: '#FFE0D6', ear: 'cat', tail: 'leaf', type: '가을 타입', desc: '꼬리가 단풍잎을 닮았어요. 가을 숲에서 숨바꼭질을 하면 아무도 못 찾아요.' },
  { id: 'nunkkot', name: '눈꽃토', c: '#E6F4FF', c2: '#FFFFFF', ear: 'bunny', tail: 'none', pat: 'spots', type: '눈 타입', desc: '겨울이 되면 하얀 털이 반짝반짝 빛나요. 눈사람 만들기 대회 챔피언이에요.' },
  { id: 'bungbung', name: '붕붕이', c: '#FFC93C', c2: '#FFF4CF', ear: 'antenna', tail: 'none', pat: 'stripes', type: '꿀 타입', desc: '꽃밭을 붕붕 날아다니며 꿀을 모아요. 모은 꿀은 친구들과 나눠 먹어요.' },
  { id: 'banggeum', name: '방울금붕', c: '#FF9F43', c2: '#FFE8D1', ear: 'fin', tail: 'fish', pat: 'spots', type: '물고기 타입', desc: '입으로 동그란 물방울을 뽀글뽀글 만들어요. 어항 청소를 도와주는 착한 친구예요.' },
  { id: 'ikki', name: '이끼돌', c: '#5FB37A', c2: '#DDF3E3', ear: 'none', tail: 'none', pat: 'spots', type: '이끼 타입', desc: '등에 푹신한 이끼가 자라요. 작은 벌레 친구들이 등 위에서 쉬어 가요.' },
  { id: 'somsatang', name: '솜사탕토', c: '#FFD1E8', c2: '#FFF2F8', ear: 'bunny', tail: 'none', pat: 'heart', type: '달콤 타입', desc: '몸에서 달콤한 솜사탕 향기가 나요. 기분이 좋으면 볼이 더 분홍빛이 돼요.' },
  { id: 'hwasan', name: '화산곰', c: '#FF6B4A', c2: '#FFD9CF', ear: 'round', tail: 'none', pat: 'stripes', type: '용암 타입', desc: '몸이 늘 따끈따끈해서 겨울에 인기 만점이에요. 화가 나면 머리에서 김이 폴폴 나요.' },
  { id: 'chocopeng', name: '초코펭', c: '#8B5E3C', c2: '#F3E3D3', ear: 'horn', tail: 'none', type: '초코 타입', desc: '초콜릿을 너무 좋아해서 몸이 초코색이 되었대요. 얼음 위에서 미끄럼을 잘 타요.' },
  { id: 'sanho', name: '산호핀', c: '#FF8E8E', c2: '#FFE3E3', ear: 'fin', tail: 'none', pat: 'spots', type: '산호 타입', desc: '산호초 마을을 지키는 꼬마 수호대예요. 바다를 깨끗하게 하는 일을 좋아해요.' },
  { id: 'eunha', name: '은하냥', c: '#6C4AB6', c2: '#DCD0FF', ear: 'cat', tail: 'star', pat: 'spots', type: '우주 타입', desc: '몸에 작은 별들이 반짝반짝 박혀 있어요. 밤마다 달님과 이야기를 나눠요.' },
  { id: 'iseul', name: '이슬버섯', c: '#A0D8FF', c2: '#E8F6FF', ear: 'mushroom', hat: '#7A5CFF', tail: 'none', type: '이슬 타입', desc: '새벽이슬을 모자에 모아 목마른 친구에게 나눠 줘요. 아침 일찍 일어나는 부지런쟁이예요.' },
  { id: 'gangcheol', name: '강철도치', c: '#8395A7', c2: '#E2E8EF', ear: 'spike', tail: 'none', pat: 'stripes', type: '강철 타입', desc: '단단한 가시로 약한 친구를 지켜 줘요. 겉은 튼튼하지만 마음은 아주 여려요.' },
  { id: 'haessal', name: '햇살삐약', c: '#FFE066', c2: '#FFF8D6', ear: 'none', tail: 'none', beak: true, type: '햇살 타입', desc: '아침마다 삐약삐약 노래로 친구들을 깨워 줘요. 햇볕을 쬐면 힘이 쑥쑥 나요.' },
  { id: 'sallang', name: '살랑이', c: '#8EE3C8', c2: '#E3FBF3', ear: 'antenna', tail: 'leaf', type: '바람 타입', desc: '살랑살랑 바람을 타고 하늘을 날아요. 민들레 씨앗과 함께 여행하는 걸 좋아해요.' },
];
/* ---------- 몬스터 등급: 일반 15 · 고급 8 · 희귀 5 · 전설 3 · 신화 1 ----------
   rate    = 그 등급 몬스터가 등장할 확률(%) — 같은 등급 안에서는 똑같은 확률로 나눔
   capRate = 종합 테스트 보상 기회 1번마다 파트너 타입 캡슐을 받을 확률 (등급이 높을수록 귀해요)
   price   = 도감에서 아직 못 만난 몬스터를 몬스터 캡슐로 바로 포획하는 가격 */
const GRADES = {
  common: { name: '일반', rate: 60, capRate: 1, price: 3, icon: '⚪', color: '#94A3B8' },
  uncommon: { name: '고급', rate: 25, capRate: 0.7, price: 5, icon: '🟢', color: '#22C55E' },
  rare: { name: '희귀', rate: 10, capRate: 0.5, price: 8, icon: '🔵', color: '#3D8BFF' },
  legend: { name: '전설', rate: 4, capRate: 0.3, price: 12, icon: '🟣', color: '#7A5CFF' },
  myth: { name: '신화', rate: 1, capRate: 0.15, price: 20, icon: '🌈', color: '#FF6F91' },
};
const GRADE_ORDER = ['common', 'uncommon', 'rare', 'legend', 'myth'];
const MONSTER_GRADE = {
  eunha: 'myth',
  mujigae: 'legend', byeolbam: 'legend', hwasan: 'legend',
  banjjak: 'rare', jjiritkong: 'rare', gangcheol: 'rare', iseul: 'rare', nunkkot: 'rare',
  bulkkot: 'uncommon', eoreum: 'uncommon', borabu: 'uncommon', padofin: 'uncommon', danpung: 'uncommon', sanho: 'uncommon', kkotnyang: 'uncommon', moraegom: 'uncommon',
};
const gradeOf = (m) => MONSTER_GRADE[m.id] || 'common';
const gradeCount = (g) => MONSTERS.filter((m) => gradeOf(m) === g).length;
// 몬스터 한 마리의 등장 확률(%) = 등급 확률 ÷ 그 등급 몬스터 수
const monsterRate = (m) => GRADES[gradeOf(m)].rate / gradeCount(gradeOf(m));
const gradeBadge = (m) => { const g = GRADES[gradeOf(m)]; return `<span class="gbadge g-${gradeOf(m)}" style="--gc:${g.color}">${g.icon} ${g.name}</span>`; };
// 등급 확률대로 한 마리 뽑기 (bonus(m): 특정 몬스터 가중치 배수)
function pickMonster(list, bonus = () => 1) {
  const w = list.map((m) => monsterRate(m) * bonus(m));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}
// 서로 다른 몬스터 n마리를 등급 확률대로
function sampleMonsters(n, list = MONSTERS) {
  let rest = list.slice(), out = [];
  while (out.length < n && rest.length) { const m = pickMonster(rest); out = [...out, m]; rest = rest.filter((x) => x !== m); }
  return out;
}
/* ---------- 🔊 몬스터 고유 목소리 (인터넷·녹음 파일 없이 기기에서 합성) ----------
   ① 울음소리: Web Audio 로 몬스터마다 다른 음높이·멜로디·음색
   ② 말투: 같은 TTS 라도 몬스터마다 다른 높낮이(pitch)·빠르기(rate) — 진화할수록 조금 굵어져요
   ③ 의성어: 인사 앞에 붙는 그 몬스터만의 소리 */
const MONSTER_CRY_WORD = {
  banjjak: '반짝반짝 냐옹', pongdang: '퐁당퐁당', bulkkot: '화르륵', saessak: '쑥쑥', mongsil: '몽글몽글', bawi: '쿵쿵',
  eoreum: '뒤뚱뒤뚱', borabu: '부엉부엉', kkangchong: '깡총깡총', donggeul: '꼬물꼬물', beoseot: '뿅뿅', padofin: '철썩철썩',
  bosong: '콕콕', jjiritkong: '찌릿찌릿', kkotnyang: '살랑 냐옹', moraegom: '사르르 크앙', byeolbam: '부우엉', mujigae: '뭉게뭉게',
  danpung: '바스락', nunkkot: '사각사각', bungbung: '붕붕', banggeum: '뽀글뽀글', ikki: '촉촉', somsatang: '몽실몽실',
  hwasan: '부글부글', chocopeng: '미끌미끌', sanho: '찰랑찰랑', eunha: '반짝반짝 우주 냐옹', iseul: '똑똑', gangcheol: '철컹철컹',
  haessal: '삐약삐약', sallang: '살랑살랑',
};
// 몸집·생김새(귀 모양)로 정한 기본 목소리 높이: 곰은 낮게, 토끼·고양이는 높게
const VOICE_BASE = { round: 0.62, spike: 0.75, tuft: 0.85, none: 1.0, horn: 1.15, wool: 1.25, mushroom: 1.3, leaf: 1.35, fin: 1.4, antenna: 1.45, cat: 1.55, drop: 1.6, bunny: 1.75 };
const monsterHash = (id) => [...id].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
function monsterVoice(m, stage = 1) {
  const h = monsterHash(m.id), jitter = ((h % 21) - 10) / 100;
  const slow = ['round', 'spike'].includes(m.ear) ? 0.08 : 0;
  const pitch = clamp((VOICE_BASE[m.ear] || 1.1) + jitter + (m.beak ? 0.25 : 0) - (stage - 1) * 0.08, 0.5, 2);
  const rate = clamp(0.88 + ((h >>> 5) % 30) / 100 - slow, 0.75, 1.25);
  return { pitch: Math.round(pitch * 100) / 100, rate: Math.round(rate * 100) / 100 };
}
const CRY_MOTIFS = [[0, 4, 7], [0, 7, 4, 12], [7, 0, 7], [0, 2, 4, 7], [12, 7, 4, 0], [0, 5, 9, 12], [4, 0, 4, 7], [0, 12, 0], [0, 3, 7, 10], [9, 7, 4, 2]];
const cryWave = (type) => (/불꽃|용암|번개/.test(type) ? 'sawtooth' : /바위|강철|땅|모래/.test(type) ? 'square' : /물|바다|이슬|얼음|눈|산호|구름/.test(type) ? 'sine' : 'triangle');
const MonsterCry = {
  ctx: null,
  // 울음소리를 내고, 소리가 끝나는 데 걸리는 시간(ms)을 돌려줌 (소리 끔·미지원이면 0)
  play(m, stage = 1) {
    if (typeof Voice !== 'undefined' && Voice.muted) return 0;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t0 = c.currentTime + 0.02, v = monsterVoice(m, stage), h = monsterHash(m.id);
      const base = 180 + v.pitch * 230, step = 0.15 / v.rate, wave = cryWave(m.type);
      const motif = CRY_MOTIFS[h % CRY_MOTIFS.length];
      const rareIdx = GRADE_ORDER.indexOf(gradeOf(m));
      const notes = [...motif.map((semi, i) => [base * 2 ** (semi / 12), i * step, step * 0.9]),
        ...(rareIdx >= 3 ? [[base * 4, motif.length * step, step * 1.6]] : [])]; // 전설·신화는 반짝이는 끝음
      const vol = wave === 'sine' || wave === 'triangle' ? 0.16 : 0.07;
      notes.forEach(([f, d, len]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = wave; o.frequency.setValueAtTime(f, t0 + d);
        o.frequency.exponentialRampToValueAtTime(f * (wave === 'sine' ? 1.08 : 0.97), t0 + d + len); // 물 타입은 살짝 올라가는 소리
        g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(vol, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + len);
        o.connect(g).connect(c.destination); o.start(t0 + d); o.stop(t0 + d + len + 0.02);
      });
      const last = notes[notes.length - 1];
      return Math.round((last[1] + last[2]) * 1000);
    } catch (e) { return 0; } // 효과음을 지원하지 않는 환경: 인사말만 들려줌
  },
};
/* AI 목소리 파일(tools/gen-monster-voices.js 로 만든 WAV)이 있으면 그 목소리로 인사합니다.
   진화할수록 조금 낮고 느리게 재생해서 목소리가 굵어져요. */
const MonsterVoiceFile = {
  audio: null,
  stop() { if (this.audio) { this.audio.pause(); this.audio = null; } },
  has: (m) => typeof MONSTER_VOICE_FILES !== 'undefined' && !!MONSTER_VOICE_FILES[m.id],
  // 재생을 시작하면 true, 파일이 없거나 재생할 수 없으면 false
  play(m, stage = 1, onFail = () => {}) {
    this.stop();
    if (!this.has(m)) return false;
    const a = new Audio(MONSTER_VOICE_FILES[m.id]);
    a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
    a.playbackRate = 1 - (stage - 1) * 0.05;
    this.audio = a;
    a.play().catch(() => { if (this.audio === a) { this.audio = null; onFail(); } });
    a.addEventListener('error', () => { if (this.audio === a) { this.audio = null; onFail(); } });
    return true;
  },
};
// 몬스터 인사: AI 목소리 파일 → 없으면 울음소리 + 기기 합성 목소리 "의성어! 안녕! 나는 ○○야."
function monsterGreet(m, stage = 1, { withDesc = true, stillOpen = () => true } = {}) {
  if (typeof Voice === 'undefined') return;
  Voice.stop(); MonsterVoiceFile.stop();
  if (Voice.muted) return;
  const synth = () => synthGreet(m, stage, { withDesc, stillOpen });
  if (MonsterVoiceFile.play(m, stage, () => { if (stillOpen()) synth(); })) return;
  synth();
}
function synthGreet(m, stage, { withDesc, stillOpen }) {
  const wait = MonsterCry.play(m, stage), name = STAGE_PREFIX[stage] + m.name;
  const text = `${MONSTER_CRY_WORD[m.id] || m.name}! 안녕! 나는 ${name}${hasBatchim(name) ? '이야' : '야'}.${withDesc ? ` ${m.desc}` : ''}`;
  setTimeout(() => { if (stillOpen()) Voice.say(text, null, monsterVoice(m, stage)); }, wait + 150);
}
const STAGE_NAME = ['', '기본', '슈퍼', '킹', '레전드'];
const STAGE_PREFIX = ['', '', '슈퍼 ', '킹 ', '레전드 '];
const STAGE_STEP = ['', '', '1차 진화', '2차 진화', '최종 진화'];
/* ---------- 진화: 같은 몬스터를 또 잡으면 그 타입의 '타입 캡슐' 1개 → 모아서 진화 ----------
   EVOLVE_COST[지금 단계] = 다음 단계로 진화하는 데 드는 타입 캡슐 수 (1차 10개 · 2차 30개 · 최종 50개) */
const MAX_STAGE = 4;
const EVOLVE_COST = [0, 10, 30, 50];
const typeCapName = (type) => `${String(type).replace(/\s*타입$/, '')} 캡슐`;
const typeColor = (type) => (MONSTERS.find((m) => m.type === type) || { c: '#2EC4B6' }).c;
const MONSTER_TYPES = [...new Set(MONSTERS.map((m) => m.type))];
function typeCapsuleSVG(type, size = 24) {
  const c = typeColor(type);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#2B2F4A" stroke-width="6"/>
    <path d="M6 50 A44 44 0 0 1 94 50Z" fill="${c}" stroke="#2B2F4A" stroke-width="6"/><rect x="6" y="46" width="88" height="8" fill="#2B2F4A"/>
    <circle cx="50" cy="50" r="14" fill="#fff" stroke="#2B2F4A" stroke-width="6"/><circle cx="50" cy="50" r="6" fill="${c}"/></svg>`;
}

function monsterSVG(m, stage = 1) {
  const c = m.c, c2 = m.c2, dk = shade(c, 0.72);
  let back = '', ears = '';
  if (m.tail === 'star') back = `<path d="M90 84 Q106 78 104 64" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${starPath(104, 56, 15, 6.5)}" fill="#FFB800" stroke="#E69500" stroke-width="2"/>`;
  if (m.tail === 'flame') back = `<path d="M90 90 Q120 86 113 54 Q108 68 101 64 Q107 48 96 38 Q99 62 86 76Z" fill="#FFB347" stroke="#FF6B1A" stroke-width="2"/>`;
  if (m.tail === 'bolt') back = `<path d="M88 80 L104 70 L98 66 L114 50 L102 56 L106 44" stroke="#F5C400" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (m.tail === 'fish') back = `<path d="M94 72 L118 56 L112 72 L118 88Z" fill="${c}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (m.tail === 'leaf') back = `<path d="M90 86 Q120 82 115 50 Q96 56 90 86Z" fill="#E8833A" stroke="#B85A1F" stroke-width="2"/><path d="M92 84 L111 56" stroke="#B85A1F" stroke-width="1.5"/>`;
  let hat = '';
  switch (m.ear) {
    case 'bunny': ears = [44, 76].map((x) => `<ellipse cx="${x}" cy="20" rx="9" ry="22" fill="${c}" stroke="${dk}" stroke-width="2.5"/><ellipse cx="${x}" cy="22" rx="4" ry="14" fill="#FFB3C7"/>`).join(''); break;
    case 'antenna': ears = [[48, 36], [72, 84]].map(([x0, x1]) => `<path d="M${x0} 34 Q${(x0 + x1) / 2} 18 ${x1} 10" stroke="${dk}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="${x1}" cy="10" r="6" fill="${c2}" stroke="${dk}" stroke-width="2"/>`).join(''); break;
    case 'fin': ears = `<path d="M44 36 Q56 -2 78 34Z" fill="${c2}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/>`; break;
    case 'spike': ears = `<path d="M28 48 L34 18 L46 34 L60 6 L74 34 L86 18 L92 48Z" fill="${dk}" stroke="${dk}" stroke-width="2" stroke-linejoin="round"/>`; break;
    case 'mushroom': { const hc = m.hat || '#FF6B6B'; hat = `<path d="M16 50 Q16 4 60 4 Q104 4 104 50 Q60 40 16 50Z" fill="${hc}" stroke="${shade(hc, 0.7)}" stroke-width="2.5"/><circle cx="40" cy="24" r="6" fill="#fff"/><circle cx="64" cy="14" r="5" fill="#fff"/><circle cx="84" cy="30" r="6" fill="#fff"/>`; break; }
    case 'cat': ears = `<path d="M30 52 L25 14 L56 38Z" fill="${c}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 43 L31 24 L48 37Z" fill="#FFB3C7"/><path d="M90 52 L95 14 L64 38Z" fill="${c}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/><path d="M86 43 L89 24 L72 37Z" fill="#FFB3C7"/>`; break;
    case 'round': ears = `<circle cx="32" cy="38" r="15" fill="${c}" stroke="${dk}" stroke-width="2.5"/><circle cx="32" cy="38" r="7" fill="${c2}"/><circle cx="88" cy="38" r="15" fill="${c}" stroke="${dk}" stroke-width="2.5"/><circle cx="88" cy="38" r="7" fill="${c2}"/>`; break;
    case 'leaf': ears = `<path d="M60 34 Q57 22 62 10" stroke="#3E9B2F" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="49" cy="13" rx="13" ry="6.5" fill="#5CC14A" transform="rotate(-25 49 13)"/><ellipse cx="74" cy="11" rx="13" ry="6.5" fill="#5CC14A" transform="rotate(25 74 11)"/>`; break;
    case 'drop': ears = `<path d="M60 2 Q76 24 78 38 Q60 30 42 38 Q44 24 60 2Z" fill="${c}" stroke="${dk}" stroke-width="2.5"/><ellipse cx="55" cy="22" rx="3" ry="6" fill="#fff" opacity=".7"/>`; break;
    case 'wool': ears = [[28, 46], [40, 33], [60, 28], [80, 33], [92, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="#F0CFE0" stroke-width="2"/>`).join(''); break;
    case 'horn': ears = `<path d="M42 38 L38 14 L54 32Z" fill="#E0F4FF" stroke="#7CC4F0" stroke-width="2"/><path d="M78 38 L82 14 L66 32Z" fill="#E0F4FF" stroke="#7CC4F0" stroke-width="2"/>`; break;
    case 'tuft': ears = `<path d="M30 50 L22 16 L50 36Z" fill="${c}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/><path d="M90 50 L98 16 L70 36Z" fill="${c}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/>`; break;
    default: ears = '';
  }
  const wings = stage >= 3 ? `<path d="M24 66 Q-6 48 2 22 Q16 44 30 50Z" fill="#fff" stroke="#CBD5E1" stroke-width="2"/><path d="M96 66 Q126 48 118 22 Q104 44 90 50Z" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>` : '';
  // 최종 진화(레전드): 무지개 후광 + 큰 별 날개 + 보석 왕관
  const legend = stage >= 4 ? `<circle cx="60" cy="66" r="62" fill="none" stroke="#FF6F91" stroke-width="4" opacity=".55"/><circle cx="60" cy="66" r="58" fill="none" stroke="#FFC531" stroke-width="4" opacity=".6"/><circle cx="60" cy="66" r="54" fill="none" stroke="#5BC0F8" stroke-width="4" opacity=".55"/>
    <path d="${starPath(6, 50, 10, 4)}" fill="#FFE27A" stroke="#E0A800" stroke-width="1.5"/><path d="${starPath(114, 50, 10, 4)}" fill="#FFE27A" stroke="#E0A800" stroke-width="1.5"/>` : '';
  const aura = stage >= 3 ? `${legend}<circle cx="60" cy="66" r="56" fill="none" stroke="#FFE27A" stroke-width="3" stroke-dasharray="4 8" opacity=".9"/>` : '';
  const crown = stage >= 2 ? `<path d="M44 30 L47 15 L55 25 L60 10 L65 25 L73 15 L76 30Z" fill="#FFD43B" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="22" r="2.5" fill="#FF6F91"/>` : '';
  const gem = stage >= 4 ? '<path d="M60 4 L66 12 L60 20 L54 12Z" fill="#7CF7FF" stroke="#2B9FD8" stroke-width="1.5"/><circle cx="48" cy="20" r="2.5" fill="#B18CFF"/><circle cx="72" cy="20" r="2.5" fill="#B18CFF"/>' : '';
  const sparkle = stage >= 2 ? `<path d="${starPath(14, 22, 7, 2.5, 4)}" fill="#FFE27A"/><path d="${starPath(108, 96, 6, 2, 4)}" fill="#FFE27A"/>` : '';
  const owlEye = m.ear === 'tuft' ? `<circle cx="46" cy="62" r="13" fill="#fff"/><circle cx="74" cy="62" r="13" fill="#fff"/>` : '';
  const beak = m.beak || m.ear === 'horn' || m.ear === 'tuft';
  const pattern = {
    spots: `<g fill="${dk}" opacity=".28"><circle cx="34" cy="50" r="6"/><circle cx="86" cy="54" r="5"/><circle cx="28" cy="82" r="4"/><circle cx="92" cy="84" r="5"/></g>`,
    stripes: `<g stroke="${dk}" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"><path d="M48 36 Q60 42 72 36"/><path d="M24 62 Q30 58 34 66"/><path d="M96 62 Q90 58 86 66"/></g>`,
  }[m.pat] || '';
  const heart = m.pat === 'heart' ? '<path d="M60 94 C52 86 50 80 55 78 C58 77 60 80 60 82 C60 80 62 77 65 78 C70 80 68 86 60 94Z" fill="#FF6F91" opacity=".85"/>' : '';
  return `<g>${aura}${wings}${back}${ears}
    <ellipse cx="60" cy="68" rx="40" ry="38" fill="${c}" stroke="${dk}" stroke-width="2.5"/>${pattern}
    <ellipse cx="60" cy="82" rx="24" ry="19" fill="${c2}"/>${heart}
    <ellipse cx="44" cy="104" rx="10" ry="6" fill="${dk}"/><ellipse cx="76" cy="104" rx="10" ry="6" fill="${dk}"/>
    ${owlEye}
    <ellipse cx="46" cy="62" rx="7" ry="9" fill="#2B2F4A"/><circle cx="48.5" cy="58" r="3" fill="#fff"/>
    <ellipse cx="74" cy="62" rx="7" ry="9" fill="#2B2F4A"/><circle cx="76.5" cy="58" r="3" fill="#fff"/>
    <ellipse cx="34" cy="75" rx="7" ry="4" fill="#FF8FAB" opacity=".65"/><ellipse cx="86" cy="75" rx="7" ry="4" fill="#FF8FAB" opacity=".65"/>
    ${beak ? '<path d="M55 72 L65 72 L60 79Z" fill="#FFB020"/>' : '<path d="M53 73 Q60 80 67 73" stroke="#2B2F4A" stroke-width="2.5" fill="none" stroke-linecap="round"/>'}
    ${hat}${crown}${gem}${sparkle}</g>`;
}
const monsterBig = (m, stage, size = 160) => `<svg viewBox="-8 -8 136 136" width="${size}" height="${size}" role="img" aria-label="${esc(STAGE_PREFIX[stage] + m.name)}">${monsterSVG(m, stage)}</svg>`;

function capsuleInner() {
  return `<circle cx="50" cy="50" r="44" fill="#fff" stroke="#2B2F4A" stroke-width="5"/>
    <path d="M6 50 A44 44 0 0 1 94 50Z" fill="#2EC4B6" stroke="#2B2F4A" stroke-width="5"/>
    <path d="M22 30 Q30 18 44 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    <rect x="6" y="46" width="88" height="8" fill="#2B2F4A"/>
    <circle cx="50" cy="50" r="14" fill="#fff" stroke="#2B2F4A" stroke-width="5"/>
    <path d="${starPath(50, 50, 8, 3.5)}" fill="#FFC531"/>`;
}
const capsuleSVG = (size = 60) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${capsuleInner()}</svg>`;

function teacherSVG() {
  return `<svg viewBox="0 0 160 180" aria-label="별빛 선생님" role="img">
    <ellipse cx="80" cy="174" rx="52" ry="6" fill="rgba(0,0,0,.08)"/>
    <path d="M28 176 Q30 122 80 118 Q130 122 132 176Z" fill="#FF8FAB"/>
    <path d="M66 120 L80 140 L94 120Z" fill="#fff"/>
    <circle cx="80" cy="34" r="20" fill="#5B3A29"/>
    <circle cx="80" cy="78" r="44" fill="#FFE1C9"/>
    <path d="M36 76 Q38 32 80 32 Q122 32 124 76 Q108 50 80 54 Q52 50 36 76Z" fill="#5B3A29"/>
    <path d="${starPath(112, 44, 9, 4)}" fill="#FFC531"/>
    <g class="eyes"><ellipse cx="64" cy="80" rx="5" ry="6" fill="#2B2F4A"/><ellipse cx="96" cy="80" rx="5" ry="6" fill="#2B2F4A"/><circle cx="66" cy="78" r="1.8" fill="#fff"/><circle cx="98" cy="78" r="1.8" fill="#fff"/></g>
    <circle cx="64" cy="80" r="12" fill="none" stroke="#7A5CFF" stroke-width="3"/><circle cx="96" cy="80" r="12" fill="none" stroke="#7A5CFF" stroke-width="3"/><path d="M76 80 H84" stroke="#7A5CFF" stroke-width="3"/>
    <ellipse cx="50" cy="98" rx="7" ry="4" fill="#FF9DB0" opacity=".7"/><ellipse cx="110" cy="98" rx="7" ry="4" fill="#FF9DB0" opacity=".7"/>
    <path class="mouth-smile" d="M70 100 Q80 110 90 100" stroke="#C2410C" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse class="mouth-talk" cx="80" cy="104" rx="7" ry="6" fill="#C2410C"/>
  </svg>`;
}
