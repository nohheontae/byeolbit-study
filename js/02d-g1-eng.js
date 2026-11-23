/* 별빛 학습지 — 1학년 영어 진도 단원 (별빛 기초 영어 · 1학기 5단원 · 2학기 5단원) */
'use strict';

/* =====================================================================
   1학년 영어 공통 낱말표 (다른 파일과 이름이 겹치지 않도록 E1_ 접두어)
   - E1_W: 글자마다 [그림, 단어, 첫소리와 글자 이름이 달라 파닉스에서 뺄 단어면 1]
   ===================================================================== */
const E1_W = {
  A: [['🍎', 'Apple'], ['🐜', 'Ant'], ['🐊', 'Alligator']],
  B: [['🐻', 'Bear'], ['🍌', 'Banana'], ['🚌', 'Bus'], ['⚽', 'Ball']],
  C: [['🐱', 'Cat'], ['🚗', 'Car'], ['🥕', 'Carrot'], ['🍪', 'Cookie']],
  D: [['🐶', 'Dog'], ['🦆', 'Duck'], ['🍩', 'Donut'], ['🦌', 'Deer']],
  E: [['🥚', 'Egg'], ['🐘', 'Elephant'], ['🧝', 'Elf']],
  F: [['🐟', 'Fish'], ['🐸', 'Frog'], ['🦊', 'Fox'], ['🌸', 'Flower']],
  G: [['🍇', 'Grape'], ['🎁', 'Gift'], ['🐐', 'Goat'], ['🦍', 'Gorilla']],
  H: [['🎩', 'Hat'], ['🐴', 'Horse'], ['🏠', 'House'], ['✋', 'Hand']],
  I: [['🐛', 'Insect'], ['🦎', 'Iguana'], ['🍦', 'Ice cream', 1], ['🧊', 'Ice', 1]],
  J: [['🧃', 'Juice'], ['🧥', 'Jacket'], ['✈️', 'Jet'], ['🐆', 'Jaguar']],
  K: [['🪁', 'Kite'], ['🔑', 'Key'], ['🦘', 'Kangaroo'], ['🤴', 'King'], ['🐨', 'Koala']],
  L: [['🦁', 'Lion'], ['🍋', 'Lemon'], ['🍃', 'Leaf'], ['🦵', 'Leg']],
  M: [['🐵', 'Monkey'], ['🥛', 'Milk'], ['🌙', 'Moon'], ['🐭', 'Mouse']],
  N: [['👃', 'Nose'], ['🥜', 'Nut'], ['🌃', 'Night'], ['🍜', 'Noodle']],
  O: [['🐙', 'Octopus'], ['🍊', 'Orange'], ['🫒', 'Olive'], ['🦉', 'Owl', 1]],
  P: [['🐷', 'Pig'], ['🍕', 'Pizza'], ['🐼', 'Panda'], ['✏️', 'Pencil'], ['🍑', 'Peach']],
  Q: [['👸', 'Queen'], ['❓', 'Question'], ['🤫', 'Quiet']],
  R: [['🐰', 'Rabbit'], ['🌈', 'Rainbow'], ['🤖', 'Robot'], ['💍', 'Ring'], ['🌹', 'Rose']],
  S: [['☀️', 'Sun'], ['⭐', 'Star'], ['🐍', 'Snake'], ['🧦', 'Sock'], ['🦢', 'Swan']],
  T: [['🐯', 'Tiger'], ['🍅', 'Tomato'], ['🚂', 'Train'], ['🌳', 'Tree'], ['🐢', 'Turtle']],
  U: [['☂️', 'Umbrella'], ['⬆️', 'Up'], ['👨', 'Uncle']],
  V: [['🚐', 'Van'], ['🎻', 'Violin'], ['🌋', 'Volcano'], ['🏐', 'Volleyball']],
  W: [['🍉', 'Watermelon'], ['🐋', 'Whale'], ['⌚', 'Watch'], ['🐺', 'Wolf']],
  X: [['🩻', 'X-ray', 1]],
  Y: [['🪀', 'Yo-yo'], ['💛', 'Yellow'], ['🧶', 'Yarn']],
  Z: [['🦓', 'Zebra'], ['0️⃣', 'Zero']],
};
// 알파벳 이름 (한글 읽기)
const E1_NAME = { A: '에이', B: '비', C: '씨', D: '디', E: '이', F: '에프', G: '지', H: '에이치', I: '아이', J: '제이', K: '케이', L: '엘', M: '엠', N: '엔', O: '오', P: '피', Q: '큐', R: '알', S: '에스', T: '티', U: '유', V: '브이', W: '더블유', X: '엑스', Y: '와이', Z: '지' };
// 파닉스 첫소리 (I 는 짧은 '이' 소리로 가르침)
const E1_snd = (L) => (L === 'I' ? '이' : SOUND[L]);
// 글자 이름 받침에 맞춘 조사: 엘·알(ㄹ 받침)은 '로', 엠·엔은 '으로'
const E1_ro = (L) => ('MN'.includes(L) ? '으로' : '로');
const E1_eul = (L) => ('LMNR'.includes(L) ? '을' : '를');
const E1_letters = (from, to) => ABC.slice(ABC.indexOf(from), ABC.indexOf(to) + 1);
const E1_words = (letters, phonicsOnly) => letters.flatMap((L) => E1_W[L].filter((w) => !(phonicsOnly && w[2])).map(([e, w]) => ({ L, e, w })));
const E1_NOT_ABC = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ', '2', '3', '5', '7', '9', '★', '♥'];

/* ---------- 알파벳 단원 (A~I · J~R · S~Z) 생성기 ---------- */
function E1_alphaGens(key, letters) {
  const s = ABC.indexOf(letters[0]), e = ABC.indexOf(letters[letters.length - 1]);
  const near = (i) => ABC.slice(Math.max(0, i - 3), Math.min(26, i + 4));
  const words = E1_words(letters, false);
  const nameHint = '영상에서 배운 알파벳 이름을 떠올려 봐. 알파벳 노래를 부르면 쉽게 생각나!';
  return [
    { tag: `${key}.name-to-letter`, label: '알파벳 이름', diff: 1, make: () => { const L = pick(letters), n = E1_NAME[L]; return Q(`'${n}'${kj(n, '이라고', '라고')} 읽는 알파벳은 무엇일까요?`, withOthers(L, letters), L, nameHint); } },
    { tag: `${key}.letter-to-name`, label: '알파벳 이름', diff: 1, make: () => { const L = pick(letters); return Q(`알파벳 ${L}, 어떻게 읽을까요?`, withOthers(E1_NAME[L], letters.map((x) => E1_NAME[x])), E1_NAME[L], nameHint); } },
    { tag: `${key}.order-next`, label: '알파벳 순서', diff: 1, make: () => { const i = R(Math.max(0, s - 1), Math.min(24, e)); return Q(`알파벳 ${ABC[i]} 바로 다음에 오는 글자는 무엇일까요?`, withOthers(ABC[i + 1], near(i + 1)), ABC[i + 1], `알파벳 노래를 천천히 불러 보자. ${ABC[i]} 바로 뒤에 나오는 글자를 찾아봐!`); } },
    { tag: `${key}.order-prev`, label: '알파벳 순서', diff: 1, make: () => { const i = R(Math.max(1, s), Math.min(25, e + 1)); return Q(`알파벳 ${ABC[i]} 바로 앞에 오는 글자는 무엇일까요?`, withOthers(ABC[i - 1], near(i - 1)), ABC[i - 1], `알파벳 노래를 부르다가 ${ABC[i]} 나오기 직전에 멈춰 볼까? 그 바로 앞 글자를 떠올려 봐!`); } },
    { tag: `${key}.order-blank`, label: '알파벳 순서', diff: 2, make: () => {
      const j = R(s, Math.max(s, e - 3)), seq = ABC.slice(j, j + 4), k = R(1, 2), ans = seq[k];
      return Q(`알파벳 순서대로 쓸 때 물음표 자리에 들어갈 글자는 무엇일까요? ${seq.map((x, t) => (t === k ? '?' : x)).join(', ')}`, withOthers(ans, near(j + k)), ans, '물음표 앞 글자와 뒤 글자를 보고 알파벳 노래를 불러 봐. 그 사이에 오는 글자야!');
    } },
    { tag: `${key}.order-seq`, label: '알파벳 순서', diff: 2, make: () => {
      const j = R(s, e - 2), [a, b, c] = ABC.slice(j, j + 3), ans = `${a} ${b} ${c}`;
      return Q('알파벳 순서가 바르게 쓰인 것은 무엇일까요?', [ans, `${a} ${c} ${b}`, `${b} ${a} ${c}`, `${c} ${b} ${a}`, `${b} ${c} ${a}`], ans, '알파벳 노래를 부르면서 첫 글자부터 차례대로 맞는지 하나씩 확인해 봐!');
    } },
    { tag: `${key}.picture-letter`, label: '그림 단어 첫 글자', diff: 1, make: () => { const { L, e: em, w } = pick(words); return Q(`그림 단어 '${w}', 어떤 알파벳으로 시작할까요?`, withOthers(L, letters), L, '단어 맨 앞 글자를 손가락으로 짚어 봐. 그 글자의 모양을 보기에서 찾아보자!', { v: { t: 'big', text: em } }); } },
    { tag: `${key}.letter-word`, label: '그림 단어 첫 글자', diff: 1, make: () => {
      const L = pick(letters), ans = pick(E1_W[L])[1];
      return Q(`알파벳 ${L}${E1_ro(L)} 시작하는 단어는 무엇일까요?`, withOthers(ans, words.filter((x) => x.L !== L).map((x) => x.w)), ans, `보기 단어의 맨 앞 글자를 하나씩 살펴봐. '${E1_NAME[L]}' 글자 모양과 똑같은 걸 찾아보자!`);
    } },
    { tag: `${key}.not-abc`, label: '알파벳 모양 찾기', diff: 1, make: () => { const ans = pick(E1_NOT_ABC); return Q('다음 중 알파벳이 아닌 것은 무엇일까요?', [ans, ...shuffle(letters).slice(0, 3)], ans, '보기를 하나씩 보며 알파벳 노래에 나오는 글자인지 따져 봐. 한글이나 숫자, 기호는 알파벳이 아니야!'); } },
  ];
}

/* ---------- 파닉스 단원 (a~m · n~z) 생성기 ---------- */
function E1_phonicsGens(key, letters) {
  const words = E1_words(letters, true);
  const otherSound = (L) => (x) => E1_snd(x.L || x) !== E1_snd(L);
  const lowers = (L) => letters.filter(otherSound(L)).map((x) => x.toLowerCase());
  return [
    { tag: `${key}.blank-first`, label: '첫 글자 빈칸', diff: 1, make: () => {
      const { L, e, w } = pick(words.filter((x) => /^[A-Za-z]+$/.test(x.w)));
      return Q(`그림을 보고 빈칸에 들어갈 첫 글자를 골라요. _${w.slice(1).toLowerCase()}`, withOthers(L.toLowerCase(), lowers(L)), L.toLowerCase(), `그림 이름을 천천히 말해 봐. 처음에 '${E1_snd(L)}' 소리가 나지? 그 소리를 내는 글자를 찾아보자!`, { v: { t: 'big', text: e } });
    } },
    { tag: `${key}.sound-picture`, label: '소리로 그림 찾기', diff: 1, make: () => {
      const { L, e } = pick(words);
      return Q(`'${E1_snd(L)}' 소리로 시작하는 그림은 무엇일까요?`, withOthers(e, words.filter(otherSound(L)).map((x) => x.e)), e, '보기 그림의 영어 이름을 하나씩 소리 내어 말해 봐. 맨 처음 소리를 귀 기울여 들어 보자!');
    } },
    { tag: `${key}.word-sound`, label: '단어의 첫소리', diff: 1, make: () => {
      const { L, e, w } = pick(words);
      return Q(`그림 단어 '${w}', 첫소리는 무엇일까요?`, withOthers(E1_snd(L), letters.filter(otherSound(L)).map(E1_snd)), E1_snd(L), '단어를 천천히 소리 내어 읽어 보자. 맨 처음 입 모양과 소리를 느껴 봐!', { v: { t: 'big', text: e } });
    } },
    { tag: `${key}.same-sound`, label: '첫소리가 같은 단어', diff: 2, make: () => {
      const L = pick(letters.filter((x) => words.filter((y) => y.L === x).length >= 2));
      const [a, b] = shuffle(words.filter((y) => y.L === L));
      return Q(`'${a.w}', 이 단어와 같은 소리로 시작하는 단어는 무엇일까요?`, withOthers(b.w, words.filter(otherSound(L)).map((x) => x.w)), b.w, `'${a.w}' 첫소리를 먼저 소리 내 보자. 그다음 보기 단어도 하나씩 읽으며 맨 처음 소리를 비교해 봐!`);
    } },
  ];
}

/* ---------- 대문자와 소문자 생성기 ---------- */
// 모양이 닮아 헷갈리기 쉬운 작은 글자 (일부러 오답으로 섞어 눈여겨보게 함)
const E1_LOOK = { b: 'dpqh', d: 'bpq', p: 'qbd', q: 'pdg', m: 'nwu', n: 'mhu', u: 'nvw', h: 'nb', g: 'qj', i: 'jt', j: 'ig', w: 'vm', v: 'wu', a: 'eo', e: 'ac', o: 'ac', c: 'eo', f: 't', t: 'f' };
// l(엘)과 I(아이)는 글꼴에 따라 똑같이 보여서 한 문제에 함께 내지 않음
const E1_lI = (pool, shown) => pool.filter((x) => !((shown === 'I' && x === 'l') || (shown === 'l' && x === 'I')));
const E1_CASE_WORDS = E1_words(ABC, false).map((x) => x.w).filter((w) => /^[A-Za-z]{3,5}$/.test(w));
function E1_twist(w) {
  const swap = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'n', h: 'n', a: 'o', o: 'a', e: 'a', i: 'j' };
  const out = [];
  [...w].forEach((c, i) => { if (swap[c]) out.push(w.slice(0, i) + swap[c] + w.slice(i + 1)); });
  return out;
}
const E1_caseGens = (key) => [
  { tag: `${key}.upper-to-lower`, label: '작은 글자 찾기', diff: 1, make: () => {
    const U = pick(ABC), l = U.toLowerCase(), look = [...(E1_LOOK[l] || '')];
    const pool = E1_lI([...shuffle(look).slice(0, 2), ...shuffle(ABC.map((x) => x.toLowerCase()))], U);
    return Q(`큰 글자 ${U}, 짝꿍 작은 글자는 무엇일까요?`, [l, ...pool.filter((x) => x !== l)], l, '큰 글자와 작은 글자는 이름이 같은 짝꿍이야. 글자 이름을 소리 내어 불러 보고 모양을 비교해 봐!');
  } },
  { tag: `${key}.lower-to-upper`, label: '큰 글자 찾기', diff: 1, make: () => {
    const U = pick(ABC), l = U.toLowerCase();
    return Q(`작은 글자 ${l}, 짝꿍 큰 글자는 무엇일까요?`, withOthers(U, E1_lI(ABC, l)), U, '작은 글자의 이름을 먼저 떠올려 봐. 이름이 똑같은 큰 글자가 짝꿍이야!');
  } },
  { tag: `${key}.case-pair`, label: '큰 글자 작은 글자 짝', diff: 2, make: () => {
    const U = pick(ABC), ans = `${U} ${U.toLowerCase()}`;
    const wrong = () => { const X = pick(ABC), look = E1_LOOK[X.toLowerCase()]; const y = look && R(0, 1) ? pick([...look]) : pick(ABC).toLowerCase(); return y === X.toLowerCase() || 'IL'.includes(X) || y === 'l' ? null : `${X} ${y}`; };
    const ws = Array.from({ length: 12 }, wrong).filter(Boolean);
    return Q('큰 글자와 작은 글자가 바르게 짝지어진 것은 무엇일까요?', [ans, ...ws.filter((x) => x !== ans)], ans, '보기마다 두 글자의 이름을 소리 내어 불러 봐. 이름이 똑같은 짝을 찾아보자!');
  } },
  { tag: `${key}.word-lower`, label: '단어를 작은 글자로', diff: 2, make: () => {
    const w = pick(E1_CASE_WORDS), ans = w.toLowerCase(), up = w.toUpperCase();
    const pool = [...shuffle(E1_twist(ans)), ...shuffle(E1_CASE_WORDS.filter((x) => x[0] === w[0] || x.length === w.length).map((x) => x.toLowerCase()))];
    return Q(`'${up}', 이 단어를 작은 글자로 쓰면 어떻게 될까요?`, [ans, ...uniq(pool).filter((x) => x !== ans)], ans, '한 글자씩 차례대로 짝꿍 작은 글자로 바꿔 봐. 모양이 닮은 글자는 방향을 잘 살펴보자!');
  } },
  { tag: `${key}.word-upper`, label: '단어를 큰 글자로', diff: 2, make: () => {
    const w = pick(E1_CASE_WORDS), ans = w.toUpperCase();
    const pool = shuffle(E1_CASE_WORDS.filter((x) => x !== w && (x[0] === w[0] || x.length === w.length))).map((x) => x.toUpperCase());
    return Q(`'${w.toLowerCase()}', 이 단어를 큰 글자로 쓰면 어떻게 될까요?`, withOthers(ans, pool.length >= 3 ? pool : E1_CASE_WORDS.map((x) => x.toUpperCase())), ans, '첫 글자부터 하나씩 짝꿍 큰 글자로 바꿔 봐. 글자 수도 똑같은지 세어 보자!');
  } },
];

/* ---------- 숫자 · 색깔 · 동물 · 인사 낱말표 ---------- */
const E1_DOT_THINGS = [['🍎', '사과'], ['⭐', '별'], ['🐤', '병아리'], ['🎈', '풍선']];
const E1_COLORS = [['Red', '빨간색', ['🔴', '❤️']], ['Blue', '파란색', ['🔵', '💙']], ['Green', '초록색', ['🟢', '💚']], ['Yellow', '노란색', ['🟡', '💛']], ['Purple', '보라색', ['🟣', '💜']], ['Orange', '주황색', ['🟠', '🧡']], ['Black', '검은색', ['⚫', '🖤']], ['White', '하얀색', ['⚪', '🤍']], ['Brown', '갈색', ['🟤', '🤎']]];
const E1_COLOR_THINGS = [['🍌', 'Yellow'], ['🌻', 'Yellow'], ['🍓', 'Red'], ['🍅', 'Red'], ['🐸', 'Green'], ['🥦', 'Green'], ['🍆', 'Purple'], ['🍇', 'Purple'], ['🥕', 'Orange'], ['🎃', 'Orange'], ['⛄', 'White'], ['🍫', 'Brown'], ['🐻', 'Brown'], ['🎱', 'Black']];
// [그림, 영어, 우리말, 울음소리]
const E1_ANIMALS = [['🐶', 'Dog', '개', '멍멍'], ['🐱', 'Cat', '고양이', '야옹'], ['🐷', 'Pig', '돼지', '꿀꿀'], ['🐮', 'Cow', '소', '음매'], ['🦆', 'Duck', '오리', '꽥꽥'], ['🐴', 'Horse', '말', '히힝'], ['🐑', 'Sheep', '양', '매애'], ['🐰', 'Rabbit', '토끼', ''], ['🦁', 'Lion', '사자', '어흥'], ['🐯', 'Tiger', '호랑이', ''], ['🐻', 'Bear', '곰', ''], ['🐵', 'Monkey', '원숭이', ''], ['🐘', 'Elephant', '코끼리', ''], ['🐸', 'Frog', '개구리', '개굴개굴'], ['🐟', 'Fish', '물고기', ''], ['🐦', 'Bird', '새', '짹짹'], ['🐭', 'Mouse', '쥐', '찍찍'], ['🐔', 'Hen', '암탉', '꼬꼬댁']];
// [상황, 알맞은 인사]
const E1_SITUATIONS = [
  ['아침에 학교에서 친구를 만났어요.', 'Good morning'], ['아침에 일어나서 엄마를 만났어요.', 'Good morning'],
  ['놀이터에서 친구를 만났어요.', 'Hello'], ['처음 보는 친구에게 인사해요.', 'Hello'],
  ['학교가 끝나고 친구와 헤어져요.', 'Goodbye'], ['친구 집에서 놀다가 우리 집으로 가요.', 'Goodbye'],
  ['친구가 생일 선물을 주었어요.', 'Thank you'], ['선생님이 연필을 빌려주셨어요.', 'Thank you'],
  ['밤에 잠자리에 들며 가족에게 인사해요.', 'Good night'],
  ['친구의 기분이 궁금해요.', 'How are you?'], ['넘어진 친구에게 괜찮은지 물어봐요.', 'How are you?'],
  ['실수로 친구 발을 밟았어요.', "I'm sorry"],
];
const E1_GREET_CLASH = { Hello: 'Good morning', 'Good morning': 'Hello', Goodbye: 'Good night', 'Good night': 'Goodbye' };
const E1_FEELINGS = [["I'm happy", ['😊', '😄', '😀']], ["I'm sad", ['😢', '😭', '😞']], ["I'm angry", ['😠', '😡']], ["I'm sleepy", ['😴', '🥱']], ["I'm scared", ['😨', '😱']]];
const E1_MEANINGS = [['Hello', '안녕!'], ['Good morning', '좋은 아침이야!'], ['Goodbye', '잘 가!'], ['Good night', '잘 자!'], ['Thank you', '고마워!'], ['How are you?', '기분이 어때?'], ["I'm sorry", '미안해!'], ["I'm happy", '나는 기뻐.'], ["I'm sad", '나는 슬퍼.'], ["I'm angry", '나는 화가 나.'], ["I'm sleepy", '나는 졸려.'], ["I'm scared", '나는 무서워.']];

/* =====================================================================
   1학기
   ===================================================================== */
const E1_AI = E1_letters('A', 'I'), E1_JR = E1_letters('J', 'R'), E1_SZ = E1_letters('S', 'Z');

defineUnit('1-eng-1-1', {
  title: '알파벳 A~I',
  sc: [
    ['영어 글자를 알파벳이라고 해. 오늘은 처음 아홉 글자를 만나 보자!', { t: 'list', items: ['A B C', 'D E F', 'G H I'] }],
    ['이 글자 이름은 에이야. 사과는 Apple, 에이로 시작해!', { t: 'word', text: 'A a', sub: '🍎 Apple' }],
    ['이 글자는 비! 곰은 Bear, 비로 시작하지.', { t: 'word', text: 'B b', sub: '🐻 Bear' }],
    ['노래하듯 불러 볼까? 에이, 비, 씨, 디, 이, 에프, 지, 에이치, 아이!', { t: 'title', text: 'A B C D E F G H I' }],
  ],
  gens: E1_alphaGens('1-eng-1-1', E1_AI),
  hunt: [
    ["알파벳 'C'를 든 몬스터를 찾아라!", 'C', ['G', 'O', 'D', 'E']],
    ["'에이치'라고 읽는 알파벳을 든 몬스터를 찾아라!", 'H', ['A', 'E', 'F', 'B']],
    ['사과 그림 단어의 첫 글자를 든 몬스터를 찾아라!', 'A', ['B', 'C', 'D', 'G']],
  ],
  pairs: [['🍎', 'Apple'], ['🐻', 'Bear'], ['🐱', 'Cat'], ['🐶', 'Dog'], ['🥚', 'Egg'], ['🐟', 'Fish'], ['🍇', 'Grape'], ['🎩', 'Hat']], pairRel: '그림과 영어 단어',
});

defineUnit('1-eng-1-2', {
  title: '알파벳 J~R',
  sc: [
    ['이번에는 J부터 R까지 아홉 글자야. 하나씩 이름을 불러 보자!', { t: 'list', items: ['J K L', 'M N O', 'P Q R'] }],
    ['이 글자는 케이! 연은 Kite, 케이로 시작해.', { t: 'word', text: 'K k', sub: '🪁 Kite' }],
    ['이 글자는 엠! 원숭이는 Monkey야.', { t: 'word', text: 'M m', sub: '🐵 Monkey' }],
    ['제이, 케이, 엘, 엠, 엔, 오, 피, 큐, 알! 다 함께 불러 볼까?', { t: 'title', text: 'J K L M N O P Q R' }],
  ],
  gens: E1_alphaGens('1-eng-1-2', E1_JR),
  hunt: [
    ["알파벳 'K'를 든 몬스터를 찾아라!", 'K', ['X', 'R', 'H', 'N']],
    ["'엠'이라고 읽는 알파벳을 든 몬스터를 찾아라!", 'M', ['N', 'W', 'J', 'R']],
    ["알파벳 'P' 바로 다음 글자를 든 몬스터를 찾아라!", 'Q', ['O', 'R', 'D', 'B']],
  ],
  pairs: [['🧃', 'Juice'], ['🪁', 'Kite'], ['🦁', 'Lion'], ['🐵', 'Monkey'], ['👃', 'Nose'], ['🐙', 'Octopus'], ['🐷', 'Pig'], ['👸', 'Queen'], ['🐰', 'Rabbit']], pairRel: '그림과 영어 단어',
});

defineUnit('1-eng-1-3', {
  title: '알파벳 S~Z',
  sc: [
    ['마지막 여덟 글자야! S부터 Z까지 가 보자.', { t: 'list', items: ['S T U V', 'W X Y Z'] }],
    ['이 글자는 에스! 해님은 Sun이야.', { t: 'word', text: 'S s', sub: '☀️ Sun' }],
    ['이 글자는 지! 얼룩말은 Zebra, 알파벳 맨 마지막 글자로 시작해.', { t: 'word', text: 'Z z', sub: '🦓 Zebra' }],
    ['에스, 티, 유, 브이, 더블유, 엑스, 와이, 지! 이제 알파벳 스물여섯 글자를 다 만났어.', { t: 'title', text: 'S T U V W X Y Z' }],
  ],
  gens: E1_alphaGens('1-eng-1-3', E1_SZ),
  hunt: [
    ["알파벳 'W'를 든 몬스터를 찾아라!", 'W', ['M', 'V', 'N', 'Y']],
    ['얼룩말 그림 단어의 첫 글자를 든 몬스터를 찾아라!', 'Z', ['S', 'T', 'X', 'Y']],
    ["'티'라고 읽는 알파벳을 든 몬스터를 찾아라!", 'T', ['F', 'U', 'L', 'J']],
  ],
  pairs: [['☀️', 'Sun'], ['🐯', 'Tiger'], ['☂️', 'Umbrella'], ['🚐', 'Van'], ['🍉', 'Watermelon'], ['🪀', 'Yo-yo'], ['🦓', 'Zebra']], pairRel: '그림과 영어 단어',
});

defineUnit('1-eng-1-4', {
  title: '대문자와 소문자',
  sc: [
    ['알파벳에는 큰 글자와 작은 글자가 있어. 이름이 같은 둘은 짝꿍이야!', { t: 'pair', l: 'A', r: 'a' }],
    ['큰 글자 G의 짝꿍은 작은 글자 g. 모양이 조금 달라도 이름은 똑같이 지야.', { t: 'pair', l: 'G', r: 'g' }],
    ['작은 글자 b와 d는 쌍둥이처럼 닮았어. 배가 어느 쪽에 볼록한지 잘 봐!', { t: 'list', items: ['B b', 'D d', 'P p', 'Q q'] }],
    ['단어도 큰 글자나 작은 글자로 쓸 수 있어. CAT과 cat은 같은 고양이야!', { t: 'word', text: 'CAT  cat', sub: '🐱' }],
  ],
  gens: E1_caseGens('1-eng-1-4'),
  hunt: [
    ['큰 글자 B의 짝꿍 작은 글자를 든 몬스터를 찾아라!', 'b', ['d', 'p', 'q', 'h']],
    ['작은 글자 g의 짝꿍 큰 글자를 든 몬스터를 찾아라!', 'G', ['C', 'Q', 'O', 'J']],
    ['큰 글자 M의 짝꿍 작은 글자를 든 몬스터를 찾아라!', 'm', ['n', 'w', 'u', 'h']],
  ],
  pairs: [['A', 'a'], ['B', 'b'], ['D', 'd'], ['G', 'g'], ['Q', 'q'], ['R', 'r'], ['E', 'e'], ['N', 'n']], pairRel: '큰 글자와 작은 글자',
});

defineUnit('1-eng-1-5', {
  title: '첫소리 파닉스 a~m',
  sc: [
    ['글자는 이름도 있지만 소리도 있어. a는 단어 맨 앞에서 애 소리를 내!', { t: 'word', text: 'a', sub: '🍎 apple · 애' }],
    ['b는 브, c는 크 소리야. bear, cat! 입 모양을 따라 해 봐.', { t: 'list', items: ['b 브 🐻 bear', 'c 크 🐱 cat'] }],
    ['d는 드, f는 프, m은 음! dog, fish, moon.', { t: 'list', items: ['d 드 🐶 dog', 'f 프 🐟 fish', 'm 음 🌙 moon'] }],
    ['그림 이름을 천천히 말하고 맨 처음 소리를 들어 보면 첫 글자를 찾을 수 있어!', { t: 'title', text: 'a b c d e f g h i j k l m' }],
  ],
  gens: E1_phonicsGens('1-eng-1-5', E1_letters('A', 'M')),
  hunt: [
    ["'애' 소리로 시작하는 단어를 든 몬스터를 찾아라!", 'Apple', ['Bear', 'Cat', 'Dog', 'Egg']],
    ['고양이 그림 단어의 첫 글자를 든 몬스터를 찾아라!', 'c', ['g', 'd', 'b', 'm']],
    ["'흐' 소리로 시작하는 단어를 든 몬스터를 찾아라!", 'Hat', ['Cat', 'Fish', 'Milk', 'Leg']],
  ],
  pairs: [['🍎', 'a'], ['🐻', 'b'], ['🐱', 'c'], ['🐶', 'd'], ['🐟', 'f'], ['🍇', 'g'], ['🎩', 'h'], ['🦁', 'l'], ['🌙', 'm']], pairRel: '그림과 첫 글자',
});

/* =====================================================================
   2학기
   ===================================================================== */
defineUnit('1-eng-2-1', {
  title: '첫소리 파닉스 n~z',
  sc: [
    ['n은 느, p는 프 소리! nose, pig 하고 말해 볼까?', { t: 'list', items: ['n 느 👃 nose', 'p 프 🐷 pig'] }],
    ['s는 스, t는 트 소리야. sun, tiger!', { t: 'list', items: ['s 스 ☀️ sun', 't 트 🐯 tiger'] }],
    ['w는 워, z는 즈 소리! watermelon, zebra.', { t: 'list', items: ['w 워 🍉 watermelon', 'z 즈 🦓 zebra'] }],
    ['첫소리를 잘 들으면 처음 보는 단어도 첫 글자를 맞힐 수 있어!', { t: 'title', text: 'n o p q r s t u v w y z' }],
  ],
  gens: E1_phonicsGens('1-eng-2-1', E1_letters('N', 'Z').filter((L) => L !== 'X')),
  hunt: [
    ["'스' 소리로 시작하는 단어를 든 몬스터를 찾아라!", 'Sun', ['Pig', 'Nose', 'Tree', 'Van']],
    ['돼지 그림 단어의 첫 글자를 든 몬스터를 찾아라!', 'p', ['b', 'q', 'd', 'r']],
    ["'트' 소리로 시작하는 단어를 든 몬스터를 찾아라!", 'Tiger', ['Zebra', 'Robot', 'Queen', 'Watch']],
  ],
  pairs: [['👃', 'n'], ['🐙', 'o'], ['🐷', 'p'], ['👸', 'q'], ['🐰', 'r'], ['☀️', 's'], ['🐯', 't'], ['🚐', 'v'], ['🦓', 'z']], pairRel: '그림과 첫 글자',
});

defineUnit('1-eng-2-2', {
  title: '숫자 1~10',
  sc: [
    ['영어로 숫자를 세어 볼까? One, Two, Three, Four, Five!', { t: 'list', items: ['1 One', '2 Two', '3 Three', '4 Four', '5 Five'] }],
    ['계속 세어 보자. Six, Seven, Eight, Nine, Ten!', { t: 'list', items: ['6 Six', '7 Seven', '8 Eight', '9 Nine', '10 Ten'] }],
    ['사과 세 개는 영어로 Three apples! 하나씩 짚으면서 세면 쉬워.', { t: 'groups', size: 3, count: 1, e: '🍎' }],
  ],
  gens: [
    { tag: '1-eng-2-2.num-to-word', label: '숫자를 영어로', diff: 1, make: () => { const n = R(1, 10); return Q(`숫자 ${n}${nj(n, '을', '를')} 영어로 하면 무엇일까요?`, withOthers(T.numbers[n - 1], T.numbers), T.numbers[n - 1], '손가락을 하나씩 펴면서 처음부터 영어로 차례차례 세어 보자!'); } },
    { tag: '1-eng-2-2.word-to-num', label: '영어를 숫자로', diff: 1, make: () => { const n = R(1, 10); return Q(`영어 '${T.numbers[n - 1]}', 숫자로 나타내면 무엇일까요?`, choicesFrom(n, [n - 1, n + 1, n - 2, n + 2].filter((x) => x >= 1 && x <= 10)), n, '영어로 처음부터 세면서 손가락을 하나씩 펴 봐. 그 단어가 나올 때 펴진 손가락을 세어 보자!'); } },
    { tag: '1-eng-2-2.count-dots', label: '세어서 영어로', diff: 1, make: () => {
      const n = R(1, 10), [e, name] = pick(E1_DOT_THINGS), near = T.numbers.slice(Math.max(0, n - 3), n + 2);
      return Q(`${name}${kj(name, '은', '는')} 몇 개일까요? 영어로 골라요.`, withOthers(T.numbers[n - 1], near.length >= 4 ? near : T.numbers), T.numbers[n - 1], '그림을 하나씩 손가락으로 짚으며 영어로 세어 보자. 마지막에 말한 숫자가 답이야!', { v: { t: 'dots', a: n, e } });
    } },
    { tag: '1-eng-2-2.num-order', label: '영어 숫자 순서', diff: 2, make: () => {
      const next = R(0, 1), n = next ? R(1, 9) : R(2, 10), ans = T.numbers[next ? n : n - 2];
      return Q(`영어로 숫자를 셀 때 '${T.numbers[n - 1]}' 바로 ${next ? '다음' : '앞'}에 오는 숫자는 무엇일까요?`, withOthers(ans, T.numbers.filter((x) => x !== T.numbers[n - 1])), ans, `영어로 처음부터 차례대로 세어 보자. '${T.numbers[n - 1]}' 바로 ${next ? '뒤' : '앞'}에 나오는 숫자를 찾아봐!`);
    } },
  ],
  hunt: [
    ['숫자 3을 영어로 쓴 팻말을 든 몬스터를 찾아라!', 'Three', ['Tree', 'Two', 'Ten', 'Five']],
    ["영어 'Seven'에 맞는 숫자를 든 몬스터를 찾아라!", '7', ['1', '6', '8', '9']],
    ['숫자 10을 영어로 쓴 팻말을 든 몬스터를 찾아라!', 'Ten', ['One', 'Nine', 'Six', 'Two']],
  ],
  pairs: [['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'], ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine'], ['10', 'Ten']], pairRel: '숫자와 영어',
});

defineUnit('1-eng-2-3', {
  title: '색깔',
  sc: [
    ['빨간색은 Red, 파란색은 Blue, 초록색은 Green이야.', { t: 'list', items: ['🔴 Red', '🔵 Blue', '🟢 Green'] }],
    ['노란색은 Yellow, 보라색은 Purple, 주황색은 Orange!', { t: 'list', items: ['🟡 Yellow', '🟣 Purple', '🟠 Orange'] }],
    ['검은색은 Black, 하얀색은 White, 갈색은 Brown이야.', { t: 'list', items: ['⚫ Black', '⚪ White', '🟤 Brown'] }],
    ['바나나는 무슨 색일까? 맞아, Yellow! 주변 물건 색을 영어로 말해 봐.', { t: 'word', text: '🍌 Yellow' }],
  ],
  gens: [
    { tag: '1-eng-2-3.color-to-word', label: '색깔을 영어로', diff: 1, make: () => { const [w, , es] = pick(E1_COLORS); return Q('이 색깔의 영어 단어는 무엇일까요?', withOthers(w, E1_COLORS.map((x) => x[0])), w, '이 색깔을 우리말로 먼저 말해 봐. 그다음 영상에서 배운 영어 이름을 떠올려 보자!', { v: { t: 'big', text: pick(es) } }); } },
    { tag: '1-eng-2-3.word-to-color', label: '영어 보고 색깔 찾기', diff: 1, make: () => { const k = R(0, 1), [w, , es] = pick(E1_COLORS); return Q(`영어 '${w}', 어떤 색깔일까요?`, withOthers(es[k], E1_COLORS.map((x) => x[2][k])), es[k], '단어를 소리 내어 읽어 보고, 영상에서 배운 색깔 이름을 떠올려 봐!'); } },
    { tag: '1-eng-2-3.thing-color', label: '물건 색깔 말하기', diff: 1, make: () => { const [e, w] = pick(E1_COLOR_THINGS); return Q('그림 속 물건은 무슨 색일까요? 영어로 골라요.', withOthers(w, E1_COLORS.map((x) => x[0])), w, '그림을 잘 보고 색깔을 우리말로 먼저 말해 봐. 그다음 영어 이름을 떠올려 보자!', { v: { t: 'big', text: e } }); } },
    { tag: '1-eng-2-3.color-meaning', label: '색깔 단어 뜻', diff: 1, make: () => {
      const [w, ko] = pick(E1_COLORS);
      return R(0, 1)
        ? Q(`영어 '${w}', 우리말로 무슨 색일까요?`, withOthers(ko, E1_COLORS.map((x) => x[1])), ko, '그 색깔을 가진 물건을 떠올려 봐. 영상에서 본 그림도 생각해 보자!')
        : Q(`'${ko}', 영어로 무엇일까요?`, withOthers(w, E1_COLORS.map((x) => x[0])), w, '그 색깔을 가진 물건을 떠올리며 영상에서 배운 영어 이름을 생각해 봐!');
    } },
  ],
  hunt: [
    ['바나나 색깔 영어 팻말을 든 몬스터를 찾아라!', 'Yellow', ['Red', 'Blue', 'Green', 'Black']],
    ["'Red' 색깔 공을 든 몬스터를 찾아라!", '🔴', ['🔵', '🟢', '🟡', '🟣']],
    ['맑은 하늘 색깔 영어 팻말을 든 몬스터를 찾아라!', 'Blue', ['Red', 'Brown', 'Black', 'White']],
  ],
  pairs: E1_COLORS.map(([w, , es]) => [es[0], w]), pairRel: '색깔과 영어',
});

defineUnit('1-eng-2-4', {
  title: '동물',
  sc: [
    ['멍멍 강아지는 Dog, 야옹 고양이는 Cat이야.', { t: 'list', items: ['🐶 Dog', '🐱 Cat'] }],
    ['꿀꿀 돼지는 Pig, 음매 소는 Cow, 꽥꽥 오리는 Duck!', { t: 'list', items: ['🐷 Pig', '🐮 Cow', '🦆 Duck'] }],
    ['사자는 Lion, 호랑이는 Tiger, 코끼리는 Elephant야.', { t: 'list', items: ['🦁 Lion', '🐯 Tiger', '🐘 Elephant'] }],
    ['토끼는 Rabbit, 원숭이는 Monkey! 동물 친구 이름을 영어로 불러 봐.', { t: 'pair', l: '🐰 Rabbit', r: '🐵 Monkey' }],
  ],
  gens: [
    { tag: '1-eng-2-4.pic-to-word', label: '그림 보고 영어로', diff: 1, make: () => { const [e, w] = pick(E1_ANIMALS); return Q('그림 속 동물의 영어 이름은 무엇일까요?', withOthers(w, E1_ANIMALS.map((x) => x[1])), w, `동물 이름을 우리말로 먼저 말해 봐. 영어 이름은 '${SOUND[w[0]]}' 소리로 시작해!`, { v: { t: 'big', text: e } }); } },
    { tag: '1-eng-2-4.word-to-pic', label: '영어 보고 그림 찾기', diff: 1, make: () => { const [e, w] = pick(E1_ANIMALS); return Q(`영어 '${w}', 어떤 동물일까요?`, withOthers(e, E1_ANIMALS.map((x) => x[0])), e, '단어를 소리 내어 읽어 보고, 그 이름으로 불리는 동물을 떠올려 봐!'); } },
    { tag: '1-eng-2-4.cry', label: '울음소리 동물', diff: 1, make: () => {
      const crying = E1_ANIMALS.filter((x) => x[3]), [, w, , cry] = pick(crying);
      return Q(`'${cry}' 하고 우는 동물은 영어로 무엇일까요?`, withOthers(w, crying.map((x) => x[1])), w, '울음소리를 흉내 내 보며 어떤 동물인지 우리말로 먼저 떠올려 봐!');
    } },
    { tag: '1-eng-2-4.meaning', label: '동물 이름 뜻', diff: 1, make: () => { const [, w, ko] = pick(E1_ANIMALS); return Q(`영어 '${w}', 우리말로 무엇일까요?`, withOthers(ko, E1_ANIMALS.map((x) => x[2])), ko, '단어를 천천히 읽어 보고, 영상에서 본 동물 친구들을 떠올려 봐!'); } },
  ],
  hunt: [
    ['멍멍 짖는 동물의 영어 팻말을 든 몬스터를 찾아라!', 'Dog', ['Cat', 'Pig', 'Cow', 'Hen']],
    ["영어 'Lion'에 맞는 동물 그림을 든 몬스터를 찾아라!", '🦁', ['🐯', '🐻', '🐵', '🐰']],
    ['토끼의 영어 팻말을 든 몬스터를 찾아라!', 'Rabbit', ['Monkey', 'Tiger', 'Horse', 'Sheep']],
  ],
  pairs: E1_ANIMALS.slice(0, 8).map(([e, w]) => [e, w]), pairRel: '그림과 영어 단어',
});

defineUnit('1-eng-2-5', {
  title: '인사와 기분',
  sc: [
    ['친구를 만나면 Hello! 아침에는 Good morning! 하고 인사해.', { t: 'list', items: ['👋 Hello', '🌅 Good morning'] }],
    ['헤어질 때는 Goodbye, 고마울 때는 Thank you!', { t: 'list', items: ['🙋 Goodbye', '🎁 Thank you'] }],
    ['How are you? 하고 물으면 기분을 말해. 기쁘면 I am happy, 슬프면 I am sad!', { t: 'pair', l: "😊 I'm happy", r: "😢 I'm sad" }],
    ['밤에 잠자기 전에는 Good night! 가족에게 인사해 볼까?', { t: 'word', text: 'Good night', sub: '🌙 잘 자!' }],
  ],
  gens: [
    { tag: '1-eng-2-5.situation', label: '상황에 맞는 인사', diff: 1, make: () => {
      const [sit, ans] = pick(E1_SITUATIONS), pool = uniq(E1_SITUATIONS.map((x) => x[1])).filter((x) => x !== E1_GREET_CLASH[ans]);
      return Q(`${sit} 뭐라고 말할까요?`, withOthers(ans, pool), ans, '그때 우리말로는 뭐라고 말하는지 먼저 떠올려 봐. 그 말과 뜻이 같은 영어를 찾아보자!');
    } },
    { tag: '1-eng-2-5.face-to-feeling', label: '기분 말하기', diff: 1, make: () => {
      const [ans, faces] = pick(E1_FEELINGS);
      return Q("친구가 'How are you?' 하고 물었어요. 그림 얼굴에 알맞은 대답은 무엇일까요?", withOthers(ans, E1_FEELINGS.map((x) => x[0])), ans, '얼굴 표정을 잘 보고 지금 어떤 기분인지 우리말로 먼저 말해 봐!', { v: { t: 'big', text: pick(faces) } });
    } },
    { tag: '1-eng-2-5.feeling-to-face', label: '기분 말하기', diff: 1, make: () => {
      const k = R(0, 1), [s, faces] = pick(E1_FEELINGS), ans = faces[k];
      return Q(`친구가 '${s}' 하고 말했어요. 친구의 얼굴은 어떤 모습일까요?`, withOthers(ans, E1_FEELINGS.map((x) => x[1][k])), ans, '친구가 한 말의 뜻을 먼저 떠올려 봐. 그 기분일 때 짓는 표정을 찾아보자!');
    } },
    { tag: '1-eng-2-5.meaning', label: '인사말 뜻', diff: 1, make: () => {
      const [en, ko] = pick(E1_MEANINGS);
      return R(0, 1)
        ? Q(`영어 '${en}', 우리말 뜻은 무엇일까요?`, withOthers(ko, E1_MEANINGS.map((x) => x[1])), ko, '이 말을 언제 쓰는지 영상 장면을 떠올려 봐. 만날 때일까, 헤어질 때일까?')
        : Q(`'${ko}', 영어로 무엇일까요?`, withOthers(en, E1_MEANINGS.map((x) => x[0])), en, '이 말을 하는 장면을 떠올려 봐. 영상에서 친구들이 했던 인사를 생각해 보자!');
    } },
  ],
  hunt: [
    ["'I'm happy' 하고 말하는 얼굴을 든 몬스터를 찾아라!", '😊', ['😢', '😠', '😴', '😨']],
    ["'I'm sad' 하고 말하는 얼굴을 든 몬스터를 찾아라!", '😢', ['😄', '😴', '😠', '😀']],
    ["'Good night' 하고 인사하는 때를 나타낸 그림을 든 몬스터를 찾아라!", '🌙', ['☀️', '🍎', '🐶', '🏫']],
  ],
  pairs: [['안녕!', 'Hello'], ['좋은 아침이야!', 'Good morning'], ['잘 가!', 'Goodbye'], ['잘 자!', 'Good night'], ['고마워!', 'Thank you'], ['기분이 어때?', 'How are you?'], ['나는 기뻐.', "I'm happy"], ['나는 슬퍼.', "I'm sad"]], pairRel: '우리말과 영어 인사',
});
