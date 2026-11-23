/* 별빛 학습지 — questionBank 스키마 · 개념 태그 · 문제 자동 생성기 · 적응형 엔진 */
'use strict';

/* =====================================================================
   1-B. questionBank 스키마 — 모든 문항을 같은 '문제 레코드'로 정규화
   QuestionRecord {
     id            'bank:2-math:add-carry-2d:k3x9' | 'gen:1-math:sub-split-back:…'
     grade         1~6
     subject       'korean' | 'math' | 'english'
     unit          단원 키('1-math'), unitTitle 단원명
     conceptTag    취약 개념 태그 ('sub-split-front', 'add-make-10', 'reading-main-idea' …)
     difficulty    1(기초) ~ 3(심화)
     questionType  'choice'(보기 고르기) | 'slots'(가르기처럼 칸 여러 개)
     prompt        문제 문장 · passage(지문) · visual(그림)
     options       보기 4개 · slots [{ label, answer }] (questionType이 slots일 때)
     answer        정답 (채점 전에는 화면·음성에 노출 금지)
     hintTeacher   정답이 없는 '생각하는 방법' 힌트
     coachingWrong { default, byOption: { 오답 보기: 정답 없는 맞춤 코칭 } } (처음 쓸 때 계산)
   }
   ※ 기존 화면 코드와의 호환을 위해 q/ch/a/h/v/p 별칭을 함께 둡니다 (prompt/options/answer/hintTeacher/visual/passage와 같은 값).
   ===================================================================== */
const SUBJECT_CODE = { kor: 'korean', math: 'math', eng: 'english' };
const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
// 손으로 쓴 문항의 개념 분류 규칙: [정규식(지문+문제), conceptTag, 난이도] — 위에서부터 처음 맞는 규칙 적용
const CONCEPT_RULES = {
  '1-math': [[/모으면/, 'add-gather', 1], [/가를 수|가르면/, 'split-number', 1], [/10을 만들려면/, 'make-10-pair', 1], [/보다 1 (큰|작은)/, 'num-next', 1]],
  '2-math': [[/가장 큰 수/, 'place-value', 1], [/cm|m는/, 'length-m-cm', 2], [/×|묶음/, 'times-table', 1], [/\+/, 'add-carry-2d', 2], [/ - /, 'sub-borrow-2d', 2]],
  '3-math': [[/반지름|원의 중심/, 'circle-parts', 1], [/÷|나누면/, 'div-basic', 2], [/분수|조각/, 'frac-read', 1], [/×/, 'mul-2d1d', 2], [/시간/, 'time-min', 2], [/\+/, 'add-3d', 2], [/ - /, 'sub-3d', 2]],
  '4-math': [[/사각형은/, 'quad-shapes', 1], [/억|만이/, 'large-number', 2], [/÷/, 'div-remainder', 2], [/×/, 'mul-3d2d', 2], [/각/, 'angle-triangle', 2], [/\+/, 'frac-add-like', 1], [/-/, 'frac-sub-like', 1]],
  '5-math': [[/비율/, 'ratio-basic', 2], [/약분/, 'frac-reduce', 2], [/최소공배수/, 'lcm', 2], [/최대공약수/, 'gcd', 2], [/직사각형/, 'area-rect', 1], [/삼각형/, 'area-tri', 2], [/평균/, 'average', 2], [/직육면체/, 'solid-figure', 1], [/\d\.\d/, 'dec-mul', 2], [/\+/, 'frac-add-unlike', 3]],
  '6-math': [[/나누면 적은/, 'ratio-distribute', 3], [/□/, 'ratio-proportion', 2], [/%/, 'percent', 2], [/원주/, 'circle-circum', 2], [/전개도/, 'solid-net', 1], [/넓이/, 'circle-area', 3], [/\d\.\d ÷/, 'dec-div', 2], [/÷/, 'frac-div', 2]],
  '1-kor': [[/받침/, 'batchim-find', 2], [/빈칸에 들어갈 글자/, 'syllable-build', 1], [/그림에 맞는 낱말/, 'word-picture', 1]],
  '2-kor': [[/반대말/, 'antonym', 1], [/흉내/, 'mimetic', 1], [/바르게 쓴|소리 나는 대로/, 'spelling-pron', 2], [/문장 부호/, 'punctuation', 1], [/꾸며 주는/, 'modifier', 1]],
  '3-kor': [[/중심 문장/, 'reading-main-idea', 2], [/높임/, 'honorific', 2], [/국어사전/, 'dictionary', 1], [/아닌 것은/, 'reading-detail', 2], [/비슷한/, 'synonym', 1], [/편지/, 'letter-form', 1], [/때|장소|움직임|흉내/, 'word-category', 1]],
  '4-kor': [[/의견|사실/, 'fact-opinion', 2], [/이어 주는 말/, 'conjunction', 2], [/회의/, 'discussion-manner', 1], [/차례/, 'reading-sequence', 2], [/국어사전/, 'dictionary', 1], [/뜻은/, 'idiom-meaning', 2]],
  '5-kor': [[/속담/, 'proverb-meaning', 2], [/주장은/, 'reading-claim', 2], [/근거/, 'argument-evidence', 2], [/토의/, 'discussion-manner', 1], [/./, 'figurative', 2]],
  '6-kor': [[/짜임/, 'essay-structure', 2], [/근거/, 'argument-evidence', 2], [/속담/, 'proverb-meaning', 2], [/뉴스/, 'media-literacy', 2], [/면담/, 'interview', 1], [/./, 'reading-detail', 2]],
  '1-eng': [[/다음에 오는/, 'abc-order', 1], [/큰 글자/, 'abc-case', 1], [/첫 글자/, 'phonics-initial', 1], [/뜻은/, 'vocab-meaning', 1], [/./, 'phonics-short', 2]],
  '2-eng': [[/숫자|Three/, 'number-word', 1], [/색/, 'color-word', 1], [/대답/, 'greeting', 1], [/./, 'animal-word', 1]],
  '3-eng': [[/뜻은/, 'vocab-meaning', 1], [/./, 'basic-sentence', 2]],
  '4-eng': [[/time/, 'time-oclock', 1], [/weather/, 'weather', 1], [/day/, 'day-word', 1], [/Where/, 'preposition', 2], [/want ___/, 'to-infinitive', 2], [/May I/, 'permission', 2], [/Whose/, 'possessive', 2], [/I'm ___/, 'feelings', 1]],
  '5-eng': [[/과거형|yesterday|did you/, 'past-tense', 2], [/than|비교/, 'comparative', 2], [/./, 'reading-detail-en', 2]],
  '6-eng': [[/will/, 'future-will', 2], [/the ___/, 'superlative', 2], [/want to be/, 'job-sentence', 3], [/should/, 'modal-should', 2], [/Which is/, 'comparative', 2], [/./, 'reading-detail-en', 2]],
};
function inferConcept(key, q) {
  const text = `${q.p || ''} ${q.q}`;
  const rule = (CONCEPT_RULES[key] || []).find(([re]) => re.test(text));
  return rule ? { tag: rule[1], difficulty: rule[2] } : { tag: `${key}-review`, difficulty: 2 };
}
// 원시 문항(Q 함수 결과 / 손으로 쓴 문항) → QuestionRecord
function toRecord(raw, { key, title, tag, difficulty, source }) {
  const { q, ch, a, h, v, p, difficulty: rawDiff, ...extra } = raw;
  const [g, s] = key.split('-');
  const options = ch.map(String), answer = String(a), diff = rawDiff || difficulty || 2;
  const rec = {
    ...extra,
    id: `${source}:${key}:${tag}:${hashStr(`${p || ''}|${q}|${answer}|${v ? JSON.stringify(v) : ''}`)}`,
    grade: Number(g), subject: SUBJECT_CODE[s], unit: key, unitTitle: title,
    conceptTag: tag, difficulty: diff, questionType: extra.slots ? 'slots' : 'choice',
    prompt: q, passage: p || '', visual: v || null, options, answer, hintTeacher: h,
    q, ch: options, a: answer, h, v: v || null, p: p || '', // 기존 화면 코드 호환 별칭
  };
  let coaching = null; // 오답 코칭은 처음 필요할 때 한 번만 계산 (코칭 엔진은 아래 13번 영역)
  Object.defineProperty(rec, 'coachingWrong', {
    enumerable: true,
    get() { if (!coaching) coaching = buildCoaching(rec); return coaching; },
  });
  return rec;
}
const UNITS = Object.fromEntries(Object.entries(BASE_UNITS).map(([k, u]) => [k, {
  ...u,
  qs: [...u.qs, ...(EXTRA_QS[k] || [])].map((q) => toRecord(q, { key: k, title: u.title, ...inferConcept(k, q), source: 'bank' })),
}]));
const QUESTION_RANGE = [10, 15]; // 한 수업에 내는 문제 수 (최소, 최대) — 매번 무작위. 아이가 지치지 않도록 최대 15문제

/*GEN-START*/
/* ---------- 문제 자동 생성기: 학년·과목별 교육과정 템플릿 ----------
   - 수학: 매번 새로운 숫자로 문제 생성
   - 국어·영어: 낱말표(반대말·높임말·관용 표현·속담·영어 단어 등)를 조합
   - 모든 생성 문제는 '힌트에 정답 노출 금지' 검사를 통과한 것만 사용 */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmtNum = (x) => String(Math.round(x * 100) / 100);
const nj = (n, withB, withoutB) => ('013678'.includes(String(n).slice(-1)) ? withB : withoutB); // 숫자 읽기 받침 조사
// '(으)로': 받침 없는 수와 ㄹ 받침 수(1·7·8 → 일·칠·팔)는 '로', 나머지 받침(0·3·6)은 '으로'
const njRo = (n) => ('036'.includes(String(n).slice(-1)) ? '으로' : '로');
const kj = (w, withB, withoutB) => (hasBatchim(w) ? withB : withoutB);
const uniq = (arr) => [...new Set(arr.map(String))];
const Q = (q, ch, a, h, extra = {}) => ({ q, ch: uniq(ch).slice(0, 4), a: String(a), h, ...extra });
function choicesFrom(ans, cands, unit = '') {
  const set = new Set([fmtNum(ans)]);
  shuffle(cands).forEach((c) => { if (set.size < 4 && c >= 0 && Number.isFinite(c)) set.add(fmtNum(c)); });
  for (let k = 1; set.size < 4; k++) set.add(fmtNum(ans + k));
  return [...set].map((c) => c + unit);
}
const withOthers = (ans, pool, n = 3) => [ans, ...shuffle(uniq(pool).filter((x) => x !== String(ans))).slice(0, n)];
const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const finalOf = (ch) => FINALS[(ch.charCodeAt(0) - 0xAC00) % 28];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SOUND = { A: '애', B: '브', C: '크', D: '드', E: '에', F: '프', G: '그', H: '흐', I: '아이', J: '쥐', K: '크', L: '르', M: '음', N: '느', O: '오', P: '프', Q: '쿠', R: '르', S: '스', T: '트', U: '어', V: '브', W: '워', Y: '이', Z: '즈' };

const T = {
  pic1: [['🐻', '곰'], ['⚽', '공'], ['🌙', '달'], ['👀', '눈'], ['🍎', '사과'], ['🐟', '물고기'], ['🍌', '바나나'], ['🚗', '자동차'], ['🌳', '나무'], ['🐶', '강아지'], ['🌸', '꽃'], ['🍞', '빵'], ['🎈', '풍선'], ['🦆', '오리'], ['🐍', '뱀'], ['🍇', '포도'], ['⭐', '별'], ['🏠', '집'], ['📚', '책'], ['🐘', '코끼리']],
  batchimWords: ['곰', '공', '달', '눈', '밤', '산', '물', '강', '책', '꽃', '밥', '집', '옷', '숲', '손', '발', '문', '빵', '별', '컵'],
  noBatchim: ['나비', '바다', '고래', '하마', '모자', '기차', '아기', '오이', '우유', '나무'],
  vocab1: [['🍎', 'Apple'], ['🐻', 'Bear'], ['🐱', 'Cat'], ['🐶', 'Dog'], ['🥚', 'Egg'], ['🐟', 'Fish'], ['🍇', 'Grape'], ['🎩', 'Hat'], ['🍦', 'Ice cream'], ['🧃', 'Juice'], ['🪁', 'Kite'], ['🦁', 'Lion'], ['🐵', 'Monkey'], ['👃', 'Nose'], ['🍊', 'Orange'], ['🐷', 'Pig'], ['👑', 'Queen'], ['🐰', 'Rabbit'], ['☀️', 'Sun'], ['🐯', 'Tiger'], ['☂️', 'Umbrella'], ['🚐', 'Van'], ['🍉', 'Watermelon'], ['🪀', 'Yo-yo'], ['🦓', 'Zebra']],
  opposite: [['크다', '작다', '코끼리와 개미를 나란히 떠올려 봐!'], ['길다', '짧다', '기차와 지우개의 길이를 견주어 볼까?'], ['높다', '낮다', '아주 높은 빌딩과 우리 집 담장을 떠올려 봐!'], ['많다', '적다', '사탕이 산더미처럼 쌓인 접시와 한 개뿐인 접시를 떠올려 봐!'], ['빠르다', '느리다', '토끼와 거북이의 달리기 경주를 떠올려 봐!'], ['밝다', '어둡다', '한낮의 운동장과 불 끈 방을 떠올려 볼까?'], ['뜨겁다', '차갑다', '끓는 국과 얼음물을 떠올려 봐!'], ['무겁다', '가볍다', '커다란 바위와 깃털을 들어 본다고 상상해 봐!'], ['넓다', '좁다', '운동장과 작은 골목길을 떠올려 볼까?'], ['깊다', '얕다', '바다 한가운데와 발목까지 오는 냇물을 떠올려 봐!'], ['굵다', '가늘다', '나무 기둥과 머리카락을 견주어 볼까?'], ['두껍다', '얇다', '두툼한 사전과 종이 한 장을 떠올려 봐!'], ['기쁘다', '슬프다', '선물을 받았을 때와 친구랑 헤어질 때 마음을 떠올려 봐!'], ['열다', '닫다', '문을 활짝 여는 모습과 반대 동작을 해 볼까?'], ['들어가다', '나오다', '방 안으로 걸어가는 모습과 반대 방향을 떠올려 봐!'], ['웃다', '울다', '재미있을 때와 속상할 때의 얼굴을 떠올려 봐!'], ['더럽다', '깨끗하다', '진흙 놀이를 한 뒤와 목욕한 뒤의 모습을 떠올려 봐!'], ['시작', '끝', '이야기의 처음과 반대되는 부분을 떠올려 봐!']],
  mimic: [['토끼가 뛰는 모양', '깡충깡충'], ['거북이가 기어가는 모양', '엉금엉금'], ['오리가 걷는 모양', '뒤뚱뒤뚱'], ['비가 많이 내리는 소리', '주룩주룩'], ['별이 빛나는 모양', '반짝반짝'], ['공이 굴러가는 모양', '데굴데굴'], ['병아리가 우는 소리', '삐악삐악'], ['시계가 가는 소리', '째깍째깍'], ['아기가 걷는 모양', '아장아장'], ['천둥이 치는 소리', '우르르 쾅쾅'], ['고양이가 몰래 다가가는 모양', '살금살금'], ['문을 두드리는 소리', '똑똑']],
  numbers: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
  colors: [['🔴', 'Red'], ['🔵', 'Blue'], ['🟢', 'Green'], ['🟡', 'Yellow'], ['🟣', 'Purple'], ['🟠', 'Orange'], ['⚫', 'Black'], ['⚪', 'White'], ['🟤', 'Brown']],
  animals: [['🐶', 'Dog'], ['🐱', 'Cat'], ['🐷', 'Pig'], ['🐮', 'Cow'], ['🐔', 'Hen'], ['🐴', 'Horse'], ['🐑', 'Sheep'], ['🐰', 'Rabbit'], ['🦁', 'Lion'], ['🐯', 'Tiger'], ['🐻', 'Bear'], ['🐵', 'Monkey'], ['🐘', 'Elephant'], ['🦒', 'Giraffe']],
  honor: [['밥', '진지'], ['집', '댁'], ['나이', '연세'], ['이름', '성함'], ['말', '말씀'], ['생일', '생신'], ['먹다', '드시다'], ['자다', '주무시다'], ['있다', '계시다'], ['아프다', '편찮으시다'], ['주다', '드리다'], ['묻다', '여쭙다']],
  category: {
    '때': [['어제', '오늘', '내일', '아침', '저녁', '작년', '방금'], "'언제?'라고 물었을 때 대답이 될 수 있는 말을 찾아보자!"],
    '장소': [['학교', '공원', '도서관', '시장', '놀이터', '병원', '바닷가'], "'어디에서?'라고 물었을 때 대답이 될 수 있는 말을 찾아보자!"],
    '움직임': [['달리다', '먹다', '읽다', '쓰다', '웃다', '춤추다', '헤엄치다'], '몸으로 직접 따라 할 수 있는 동작을 나타내는 말을 찾아보자!'],
    '모양': [['동그랗다', '네모나다', '길쭉하다', '뾰족하다', '납작하다'], '물건의 생김새를 설명할 때 쓰는 말을 찾아보자!'],
  },
  vocab3: [['happy', '행복한'], ['sad', '슬픈'], ['angry', '화난'], ['hungry', '배고픈'], ['sleepy', '졸린'], ['tired', '피곤한'], ['run', '달리다'], ['swim', '수영하다'], ['jump', '뛰어오르다'], ['dance', '춤추다'], ['sing', '노래하다'], ['read', '읽다'], ['pencil', '연필'], ['book', '책'], ['bag', '가방'], ['eraser', '지우개'], ['ruler', '자'], ['desk', '책상'], ['chair', '의자'], ['window', '창문']],
  can3: [['swim', '수영할'], ['run', '달릴'], ['jump', '높이 뛸'], ['dance', '춤출'], ['sing', '노래할'], ['read', '읽을'], ['cook', '요리할'], ['skate', '스케이트를 탈']],
  idioms: [['손이 크다', '씀씀이가 넉넉하다'], ['발이 넓다', '아는 사람이 많다'], ['귀가 얇다', '남의 말을 잘 믿는다'], ['입이 짧다', '음식을 가려 먹는다'], ['눈이 높다', '고르는 기준이 까다롭다'], ['코가 납작해지다', '기가 죽다'], ['시치미를 떼다', '알고도 모르는 척하다'], ['발 벗고 나서다', '적극적으로 돕다'], ['손을 떼다', '하던 일을 그만두다'], ['얼굴이 두껍다', '부끄러움을 모른다'], ['간이 크다', '겁이 없다'], ['입이 무겁다', '비밀을 잘 지킨다'], ['눈코 뜰 새 없다', '몹시 바쁘다'], ['배가 아프다', '남이 잘되어 샘이 나다']],
  facts: ['해는 동쪽에서 뜬다.', '물은 0도에서 언다.', '일주일은 7일이다.', '서울은 우리나라의 수도이다.', '고래는 바다에 산다.', '한 시간은 60분이다.', '개미는 다리가 6개이다.', '사과는 나무에서 열린다.'],
  opinions: ['여름이 가장 좋은 계절이다.', '수학은 정말 재미있다.', '고양이가 강아지보다 귀엽다.', '파란색이 제일 예쁘다.', '떡볶이가 최고의 간식이다.', '축구가 가장 신나는 운동이다.', '비 오는 날은 기분이 좋다.', '우리 반 급식이 제일 맛있다.'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysKo: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weather: [['☀️', 'sunny'], ['🌧️', 'rainy'], ['❄️', 'snowy'], ['☁️', 'cloudy'], ['🌬️', 'windy']],
  figures: [
    ...['별이 보석처럼 반짝인다.', '얼음처럼 차가운 손', '사과같이 빨간 볼', '솜사탕 같은 구름', '번개처럼 빠른 친구', '꿀처럼 달콤한 목소리'].map((s) => [s, '직유법']),
    ...['내 마음은 호수다.', '시간은 금이다.', '너는 나의 햇살이다.', '교실은 우리들의 놀이터다.', '책은 마음의 양식이다.'].map((s) => [s, '은유법']),
    ...['꽃이 방긋 웃는다.', '바람이 속삭인다.', '나무가 손을 흔든다.', '해님이 인사한다.', '시냇물이 노래한다.'].map((s) => [s, '의인법']),
    ...['배가 고파서 소 한 마리도 먹겠다.', '눈물이 바다를 이루었다.', '목이 빠지게 기다렸다.', '하늘만큼 땅만큼 사랑해.'].map((s) => [s, '과장법']),
  ],
  past: [['go', 'went', 1], ['eat', 'ate', 1], ['see', 'saw', 1], ['have', 'had', 1], ['come', 'came', 1], ['buy', 'bought', 1], ['make', 'made', 1], ['take', 'took', 1], ['get', 'got', 1], ['run', 'ran', 1], ['swim', 'swam', 1], ['write', 'wrote', 1], ['play', 'played', 0], ['jump', 'jumped', 0], ['walk', 'walked', 0], ['watch', 'watched', 0], ['cook', 'cooked', 0], ['visit', 'visited', 0], ['help', 'helped', 0], ['clean', 'cleaned', 0]],
  compare: [['big', 'bigger', 'biggest'], ['small', 'smaller', 'smallest'], ['tall', 'taller', 'tallest'], ['fast', 'faster', 'fastest'], ['heavy', 'heavier', 'heaviest'], ['long', 'longer', 'longest'], ['old', 'older', 'oldest'], ['young', 'younger', 'youngest'], ['happy', 'happier', 'happiest'], ['hot', 'hotter', 'hottest'], ['short', 'shorter', 'shortest'], ['strong', 'stronger', 'strongest']],
  proverbs: [['가는 말이 고와야 오는 말이 곱다', '내가 남에게 잘해야 남도 나에게 잘한다'], ['백지장도 맞들면 낫다', '쉬운 일도 함께하면 더 쉽다'], ['소 잃고 외양간 고친다', '일이 잘못된 뒤에 손을 써도 소용없다'], ['티끌 모아 태산', '작은 것도 모이면 큰 것이 된다'], ['낮말은 새가 듣고 밤말은 쥐가 듣는다', '말은 언제나 조심해서 해야 한다'], ['원숭이도 나무에서 떨어진다', '잘하는 사람도 실수할 때가 있다'], ['세 살 버릇 여든까지 간다', '어릴 때 습관은 고치기 어렵다'], ['우물 안 개구리', '넓은 세상을 모르는 사람'], ['콩 심은 데 콩 나고 팥 심은 데 팥 난다', '원인에 따라 결과가 생긴다'], ['돌다리도 두들겨 보고 건너라', '잘 아는 일도 조심해서 하라'], ['발 없는 말이 천 리 간다', '말은 순식간에 멀리 퍼진다'], ['고래 싸움에 새우 등 터진다', '강한 쪽 싸움에 약한 쪽이 피해를 본다']],
  will: [['visit', 'visited', 'visits', 'visiting', 'my grandma', '할머니를 방문할'], ['play', 'played', 'plays', 'playing', 'soccer', '축구를 할'], ['study', 'studied', 'studies', 'studying', 'English', '영어를 공부할'], ['clean', 'cleaned', 'cleans', 'cleaning', 'my room', '내 방을 청소할'], ['help', 'helped', 'helps', 'helping', 'my mom', '엄마를 도울'], ['watch', 'watched', 'watches', 'watching', 'a movie', '영화를 볼'], ['cook', 'cooked', 'cooks', 'cooking', 'dinner', '저녁을 요리할'], ['read', 'reads', 'reading', 'readed', 'a book', '책을 읽을']],
  jobs: [['doctor', '의사'], ['teacher', '선생님'], ['cook', '요리사'], ['singer', '가수'], ['pilot', '조종사'], ['scientist', '과학자'], ['farmer', '농부'], ['firefighter', '소방관'], ['writer', '작가'], ['dancer', '무용가']],
};
const BASE_FRACS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [2, 7], [3, 7], [3, 8], [5, 8]];

/* ---------- 1학년 핵심 개념 생성기 (난이도 1~3) ----------
   1: 가르기 단계만 묻기 · 2: 가르기를 보여 주고 중간 식 계산 · 3: 전체 계산 (가르기 힌트) */
function genAddMake10(diff) {
  let a, b;
  do { a = R(2, 9); b = R(2, 9); } while (a + b <= 10); // 받아올림이 있는 덧셈만
  const need = 10 - a, rest = b - need, s = a + b;
  if (diff === 1) {
    return Math.random() < 0.5
      ? Q(`${a} + ${b}에서 ${a}${nj(a, '이', '가')} 10이 되려면 얼마가 더 필요할까요?`, choicesFrom(need, [need + 1, need - 1, b, 10 - b]), need, '10칸 상자에 몇 칸이 채워져 있는지 보고, 빈칸이 몇 개인지 손가락으로 세어 보자!', { difficulty: 1, v: { t: 'dots', a, e: '🔵' } })
      : Q(`${a} + ${b}${nj(b, '을', '를')} 계산할 때, ${a}${nj(a, '을', '를')} 10으로 만들려면 ${b}${nj(b, '을', '를')} ${need}${nj(need, '과', '와')} 몇으로 가르면 될까요?`, choicesFrom(rest, [rest + 1, rest - 1, need, b]), rest, '가를 수에서 10을 만드는 데 쓴 만큼을 덜어 내면 남는 수가 보여!', { difficulty: 1 });
  }
  if (diff === 2) return Q(`${a} + ${b}${nj(b, '을', '를')} 10을 만들어 계산해요. ${b}${nj(b, '을', '를')} ${need}${nj(need, '과', '와')} ${rest}${njRo(rest)} 가르면 ${a} + ${need} = 10이에요. 그러면 10 + ${rest}${nj(rest, '은', '는')} 얼마일까요?`, choicesFrom(s, [s + 1, s - 1, 10 + need, s + 10]), s, '10을 먼저 만든 다음, 갈라 두었던 남은 수를 더해 보자!', { difficulty: 2 });
  return Q(`${a} + ${b} = ?`, choicesFrom(s, [s + 1, s - 1, s + 10, s - 10]), s, `${a}${nj(a, '이', '가')} 10이 되려면 얼마가 더 필요할까? 뒤의 수를 그만큼과 나머지로 갈라서 10을 먼저 만들어 보자!`, { difficulty: 3 });
}
// front=true: 앞의 수 가르기 (15-6 → 15를 10과 5로) · front=false: 뒤의 수 가르기 (11-7 → 7을 1과 6으로)
function genSubSplit(front, diff) {
  let a, b;
  do { a = R(11, 18); b = R(2, 9); } while (a % 10 >= b); // 받아내림이 있는 뺄셈만
  const r = a % 10, d = a - b, k = b - r;
  const ex = (difficulty) => ({ difficulty, split: { a, b, r, front }, slots: [{ label: '가르기 칸', answer: String(r) }, { label: '답 칸', answer: String(d) }] });
  const ab = `${a} - ${b}${nj(b, '을', '를')}`;
  if (front) {
    if (diff === 1) return Q(`${ab} 앞의 수 가르기로 풀어요. ${a}${nj(a, '은', '는')} 10과 몇으로 가를 수 있을까요?`, choicesFrom(r, [r + 1, r - 1, b, 10 - b]), r, '10개 묶음 하나와 낱개 몇 개로 되어 있는 수야. 낱개 자리 숫자를 살펴볼까?', ex(1));
    if (diff === 2) return Q(`${ab} 앞의 수 가르기로 풀어요. ${a}${nj(a, '을', '를')} 10과 ${r}${njRo(r)} 가르고, 10 - ${b} = ${10 - b}${nj(10 - b, '이에요', '예요')}. 그러면 ${10 - b} + ${r}${nj(r, '은', '는')} 얼마일까요?`, choicesFrom(d, [d + 1, d - 1, 10 - b, d + 10]), d, '10에서 먼저 뺀 결과에, 갈라 두었던 낱개를 다시 더해 보자!', ex(2));
    return Q(`${a} - ${b} = ?`, choicesFrom(d, [d + 1, d - 1, d + 10, k]), d, '앞의 수를 10과 나머지로 갈라 보자. 10에서 뒤의 수를 먼저 빼고, 남은 수를 더하면 돼!', ex(3));
  }
  if (diff === 1) {
    return Math.random() < 0.5
      ? Q(`${ab} 뒤의 수 가르기로 풀어요. ${a}에서 먼저 얼마를 빼면 10이 될까요?`, choicesFrom(r, [r + 1, r - 1, b, k]), r, '앞의 수에서 낱개만 먼저 덜어 내면 딱 10이 남아. 낱개가 몇 개인지 세어 볼까?', ex(1))
      : Q(`${ab} 뒤의 수 가르기로 풀어요. ${b}${nj(b, '을', '를')} ${r}${nj(r, '과', '와')} 몇으로 가를까요?`, choicesFrom(k, [k + 1, k - 1, r, b]), k, '가를 수에서 먼저 빼 줄 만큼을 덜어 내면 남는 수가 보여!', ex(1));
  }
  if (diff === 2) return Q(`${ab} 뒤의 수 가르기로 풀어요. ${b}${nj(b, '을', '를')} ${r}${nj(r, '과', '와')} ${k}${njRo(k)} 가르면 ${a} - ${r} = 10이에요. 그러면 10 - ${k}${nj(k, '은', '는')} 얼마일까요?`, choicesFrom(d, [d + 1, d - 1, k, d + 10]), d, '10을 만든 다음, 갈라 둔 나머지 수만큼 더 빼 보자!', ex(2));
  return Q(`${a} - ${b} = ?`, choicesFrom(d, [d + 1, d - 1, d + 10, k]), d, '뒤의 수를 둘로 갈라서 앞의 수를 먼저 10으로 만들어 보자. 그다음 남은 만큼 더 빼 볼까?', ex(3));
}

const GENERATORS = {
'1-math': [
  () => { const a = R(1, 6), b = R(1, 9 - a), e = pick(['🍎', '🍓', '🐥', '⚽', '🌷']); return Q(`${e} ${a}개와 ${e} ${b}개를 모으면 모두 몇 개일까요?`, choicesFrom(a + b, [a + b + 1, a + b - 1, a + b + 2, a + b - 2]), a + b, `왼쪽 ${a}개를 먼저 세고, 오른쪽을 하나씩 이어서 세어 볼까? 손가락을 하나씩 펴 보자!`, { v: { t: 'dots', a, b, e } }); },
  () => { const n = R(4, 10), a = R(1, n - 1); return Q(`${n}${nj(n, '은', '는')} ${a}${nj(a, '과', '와')} 몇으로 가를 수 있을까요?`, choicesFrom(n - a, [n - a + 1, n - a - 1, n - a + 2]), n - a, `동그라미 ${n}개 중에서 ${a}개를 손으로 가려 봐. 가려지지 않고 남은 동그라미를 세어 보자!`, { v: { t: 'dots', a: n, e: '🟡' } }); },
  () => { const a = R(1, 9); return Q(`10을 만들려면 ${a}${nj(a, '과', '와')} 어떤 수가 짝꿍일까요?`, choicesFrom(10 - a, [11 - a, 9 - a, 12 - a]), 10 - a, `${a}부터 시작해서 10이 될 때까지 손가락을 하나씩 펴며 세어 볼까? 몇 번 폈는지 기억해!`); },
  () => { const n = R(1, 19); return Q(`${n}보다 1 큰 수는 무엇일까요?`, choicesFrom(n + 1, [n + 2, n - 1, n + 3]), n + 1, `수를 순서대로 세어 보자. ${n} 바로 다음에 오는 수를 떠올려 봐!`); },
  () => { const n = R(3, 20); return Q(`${n}보다 1 작은 수는 무엇일까요?`, choicesFrom(n - 1, [n + 1, n - 2, n + 2]), n - 1, `수를 거꾸로 세어 볼까? ${n} 바로 앞에 오는 수를 떠올려 봐!`); },
  () => { const nums = shuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, 4); const max = Math.max(...nums); return Q('가장 큰 수는 무엇일까요?', nums, max, '수를 순서대로 셀 때 가장 나중에 나오는 수가 가장 큰 수야. 둘씩 비교해 볼까?'); },
  // ▼ 1학년 핵심: 10을 이용한 덧셈·뺄셈 (난이도 1 가르기 단계 → 2 중간 식 → 3 전체 계산)
  (diff = R(1, 3)) => genAddMake10(diff),
  (diff = R(1, 3)) => genSubSplit(true, diff),
  (diff = R(1, 3)) => genSubSplit(false, diff),
],
'2-math': [
  () => { let a, b; do { a = R(11, 79); b = R(11, 99 - a); } while ((a % 10) + (b % 10) < 10); const s = a + b; return Q(`${a} + ${b} = ?`, choicesFrom(s, [s + 10, s - 10, s + 1, s - 1]), s, '일의 자리끼리 먼저 더해 보자. 10이 넘으면 십의 자리로 받아올림하는 것 잊지 마!'); },
  () => { let a, b; do { a = R(30, 99); b = R(11, a - 5); } while ((a % 10) >= (b % 10)); const d = a - b; return Q(`${a} - ${b} = ?`, choicesFrom(d, [d + 10, d - 10, d + 1, d - 1]), d, '일의 자리끼리 뺄 수 없으면 십의 자리에서 10을 빌려 와서 계산해 보자!'); },
  () => { const a = R(2, 9), b = R(2, 9), p = a * b; return Q(`${a} × ${b} = ?`, choicesFrom(p, [p + a, p - a, p + 1, p - 1]), p, `${a}단 곱셈구구를 떠올려 봐. ${a}씩 ${b}번 뛰어 세어 볼까?`); },
  () => { const size = R(2, 5), count = R(2, 5), e = pick(['🍪', '🍩', '🧁', '🍬']), p = size * count; return Q(`${e} ${size}개씩 ${count}묶음이면 모두 몇 개일까요?`, choicesFrom(p, [p + size, p - size, p + 1, p - 1]), p, `${size}씩 뛰어 세기를 해 보자! 묶음 수만큼 손가락을 접으며 세어 볼까?`, { v: { t: 'groups', size, count, e } }); },
  () => { const m = R(1, 5), cm = R(5, 95), t = m * 100 + cm; return Q(`${m}m ${cm}cm는 몇 cm일까요?`, choicesFrom(t, [m * 10 + cm, m + cm, t + 10, t - 10, t + 100], 'cm'), `${t}cm`, '1m는 몇 cm인지 먼저 떠올려 봐. 그다음 남은 cm를 더해 보자!'); },
],
'3-math': [
  () => { const a = R(100, 599), b = R(100, 399), s = a + b; return Q(`${a} + ${b} = ?`, choicesFrom(s, [s + 10, s - 10, s + 100, s - 100, s + 1]), s, '일의 자리부터 차례로 더해 보자. 10이 넘을 때마다 윗자리로 받아올림하는 것 잊지 마!'); },
  () => { const a = R(300, 999), b = R(100, a - 50), d = a - b; return Q(`${a} - ${b} = ?`, choicesFrom(d, [d + 10, d - 10, d + 100, d - 100, d + 1]), d, '일의 자리부터 차례로 빼 보자. 뺄 수 없으면 바로 윗자리에서 받아내림해!'); },
  () => { const b = R(2, 9), q = R(2, 9), a = b * q; return Q(`${a} ÷ ${b} = ?`, choicesFrom(q, [q + 1, q - 1, q + 2, b]), q, `${b}단 곱셈구구에서 곱이 ${a}${nj(a, '이', '가')} 되는 수를 찾아보자!`); },
  () => { const a = R(12, 49), b = R(2, 9), p = a * b; return Q(`${a} × ${b} = ?`, choicesFrom(p, [p + 10, p - 10, p + b, p - b]), p, `${a}${nj(a, '을', '를')} 십의 자리와 일의 자리로 나눠서 각각 ${b}${nj(b, '을', '를')} 곱한 다음 더해 보자!`); },
  () => { const d = R(3, 8), n = R(1, d - 1); return Q('원을 똑같이 나눈 것 중 색칠한 부분을 분수로 나타내면?', [`${n}/${d}`, `${d}/${n}`, `${d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d + 1}`], `${n}/${d}`, '전체를 몇 조각으로 나누었는지가 분모, 그중 색칠한 조각 수가 분자야. 아래에 전체, 위에 부분!', { v: { t: 'frac', n, d } }); },
  () => { const h = R(1, 3), m = R(1, 11) * 5, t = h * 60 + m; return Q(`${h}시간 ${m}분은 모두 몇 분일까요?`, choicesFrom(t, [h * 100 + m, h + m, t + 10, t - 10, t + 60], '분'), `${t}분`, '1시간이 몇 분인지 먼저 떠올려 보고, 남은 분을 더해 보자!'); },
],
'4-math': [
  () => { const d = R(5, 12), a = R(1, d - 2), b = R(1, d - 1 - a); return Q(`${a}/${d} + ${b}/${d} = ?`, [`${a + b}/${d}`, `${a + b}/${d * 2}`, `${a + b + 1}/${d}`, `${Math.max(1, a + b - 1)}/${d}`, `${a * b}/${d}`], `${a + b}/${d}`, '분모가 같으면 조각 크기가 같아. 조각 크기는 그대로 두고 조각 개수만 더해 보자!'); },
  () => { const d = R(5, 12), a = R(3, d - 1), b = R(1, a - 1); return Q(`${a}/${d} - ${b}/${d} = ?`, [`${a - b}/${d}`, `${a + b}/${d}`, `${a - b + 1}/${d}`, `${a - b}/${d - 1}`, `${a - b}/${d * 2}`], `${a - b}/${d}`, '분모가 같으면 조각 크기가 같아. 조각 개수끼리만 빼 보면 몇 조각이 남을까?'); },
  () => { const a = R(101, 399), b = R(11, 39), p = a * b; return Q(`${a} × ${b} = ?`, choicesFrom(p, [p + a, p - a, p + 10, p - 10, p + 100]), p, `${b}${nj(b, '을', '를')} 십의 자리와 일의 자리로 나눠서 따로 곱한 다음 더해 보자!`); },
  () => { const b = R(3, 9), q = R(3, 12), r = R(1, b - 1), a = b * q + r; return Q(`${a} ÷ ${b}의 몫은 얼마일까요?`, choicesFrom(q, [q + 1, q - 1, r, q + 2]), q, `${b}단 곱셈구구에서 ${a}${nj(a, '을', '를')} 넘지 않는 가장 큰 곱을 찾아보자!`); },
  () => { let x, y; do { x = R(30, 80); y = R(30, 100); } while (x + y > 150); const t = 180 - x - y; return Q(`삼각형의 두 각이 ${x}°, ${y}°일 때 나머지 한 각은?`, choicesFrom(t, [360 - x - y, t + 10, t - 10, x + y], '°'), `${t}°`, '삼각형 세 각의 크기를 모두 더하면 몇 도인지 떠올려 보고, 아는 두 각을 빼 보자!'); },
  () => { let x, y, z, t; do { x = R(60, 120); y = R(60, 120); z = R(60, 120); t = 360 - x - y - z; } while (t < 40 || t > 160); return Q(`사각형의 세 각이 ${x}°, ${y}°, ${z}°일 때 나머지 한 각은?`, choicesFrom(t, [t + 10, t - 10, t + 20, 180 - t], '°'), `${t}°`,'사각형 네 각의 크기를 모두 더하면 몇 도인지 떠올려 보고, 아는 세 각을 빼 보자!'); },
],
'5-math': [
  () => { const [p, q] = pick(BASE_FRACS), k = R(2, 6); return Q(`${p * k}/${q * k}${nj(p * k, '을', '를')} 약분하여 기약분수로 나타내면?`, [`${p}/${q}`, `${p}/${q + 1}`, `${p + 1}/${q + 1}`, `${q}/${p}`, `${p}/${q * k}`], `${p}/${q}`, '분모와 분자를 동시에 나눌 수 있는 가장 큰 수, 즉 최대공약수로 나누어 보자!'); },
  () => { let a, b; do { a = R(2, 12); b = R(2, 12); } while (a === b); const l = (a * b) / gcd(a, b); return Q(`${a}${nj(a, '과', '와')} ${b}의 최소공배수는?`, choicesFrom(l, [a * b, l + a, l + b, l * 2]), l, `${a}의 배수와 ${b}의 배수를 차례로 써 보고, 처음으로 같아지는 수를 찾아보자!`); },
  () => { let g, m, n; do { g = R(2, 6); m = R(1, 5); n = R(2, 6); } while (m === n || gcd(m, n) !== 1); const a = g * m, b = g * n; return Q(`${a}${nj(a, '과', '와')} ${b}의 최대공약수는?`, choicesFrom(g, [g * 2, 1, g + 1, a, b]), g, '두 수를 똑같이 나누어떨어지게 하는 수를 모두 찾아보고, 그중 가장 큰 수를 골라 보자!'); },
  () => { const w = R(3, 15), h = R(3, 15), s = w * h; return Q(`가로 ${w}cm, 세로 ${h}cm인 직사각형의 넓이는?`, choicesFrom(s, [2 * (w + h), w + h, s + w, s - h], 'cm²'), `${s}cm²`, '넓이는 1cm² 타일이 몇 장 깔리는지 세는 거야. 한 줄에 몇 장, 몇 줄인지 생각해 보자!'); },
  () => { const b = R(2, 10) * 2, h = R(3, 12), s = (b * h) / 2; return Q(`밑변 ${b}cm, 높이 ${h}cm인 삼각형의 넓이는?`, choicesFrom(s, [b * h, s + b, s - h, b + h], 'cm²'), `${s}cm²`, '똑같은 삼각형 두 개를 붙이면 평행사변형이 돼. 그러면 삼각형 하나는 그 넓이의 얼마일까?'); },
  () => { const cnt = R(3, 4), avg = R(5, 12); let nums; do { nums = Array.from({ length: cnt - 1 }, () => avg + R(-4, 4)); nums.push(avg * cnt - nums.reduce((s, x) => s + x, 0)); } while (nums.some((x) => x < 1)); return Q(`${nums.join(', ')}의 평균은 얼마일까요?`, choicesFrom(avg, [avg + 1, avg - 1, avg * cnt, avg + 2]), avg, '평균은 모두 더한 값을 개수로 똑같이 나눈 거야. 먼저 수를 모두 더하고, 몇 개인지 세어 보자!'); },
  () => { let ai; do { ai = R(11, 49); } while (ai % 10 === 0); const b = R(2, 9), ans = (ai * b) / 10; return Q(`${fmtNum(ai / 10)} × ${b} = ?`, choicesFrom(ans, [ai * b, (ai * b) / 100, ans + 1, ans - 0.1]), fmtNum(ans), `소수점은 잠시 잊고 ${ai} × ${b}${nj(b, '을', '를')} 먼저 계산해 봐. 그다음 처음 수의 소수점 아래 자리 수만큼 소수점을 찍어 보자!`); },
],
'6-math': [
  () => { let a, b; do { a = R(2, 9); b = R(2, 9); } while (a === b); const k = R(2, 6), ans = b * k; return Q(`${a} : ${b} = ${a * k} : □ 에서 □에 알맞은 수는?`, choicesFrom(ans, [b + a * k - a, ans + 1, a * k, b + k]), ans, `앞의 수 ${a}${nj(a, '이', '가')} ${a * k}${nj(a * k, '이', '가')} 되려면 몇 배를 해야 할까? 뒤의 수에도 똑같이 해 보자!`); },
  () => { let total, pct; do { total = pick([20, 40, 60, 80, 120, 200, 300, 400]); pct = pick([10, 20, 25, 50, 75]); } while ((total * pct) % 100 !== 0); const ans = (total * pct) / 100; return Q(`${total}의 ${pct}%는 얼마일까요?`, choicesFrom(ans, [total - ans, pct, ans * 2, ans / 2]), ans, `${pct}%를 분수로 바꾸어 생각해 볼까? 전체를 100으로 볼 때 ${pct}만큼이라는 뜻이야.`); },
  () => { const r = R(1, 10), ans = 2 * r * 3.14; return Q(`반지름이 ${r}cm인 원의 원주는? (원주율 3.14)`, choicesFrom(ans, [r * 3.14, r * r * 3.14, 4 * r * 3.14], 'cm'), `${fmtNum(ans)}cm`, '원주는 지름 × 원주율이야. 반지름을 지름으로 바꾸는 걸 잊지 마!'); },
  () => { const r = R(2, 10), ans = r * r * 3.14; return Q(`반지름이 ${r}cm인 원의 넓이는? (원주율 3.14)`, choicesFrom(ans, [2 * r * 3.14, r * 3.14, (r + 1) * (r + 1) * 3.14], 'cm²'), `${fmtNum(ans)}cm²`, '원의 넓이는 반지름 × 반지름 × 원주율이야. 반지름끼리 먼저 곱해 볼까?'); },
  () => { let a, b; do { a = R(1, 5); b = R(2, 6); } while (a >= b); const k = R(2, 8), total = (a + b) * k; return Q(`사탕 ${total}개를 ${a} : ${b}${'036'.includes(String(b).slice(-1)) ? '으로' : '로'} 나누면 적은 쪽은 몇 개일까요?`, choicesFrom(a * k, [b * k, k, a * k + 1, total - k], '개'), `${a * k}개`, `전체를 ${a}+${b} 몫으로 나눈다고 생각해 봐. 한 몫이 몇 개인지 먼저 구해 볼까?`); },
  () => { let d, b, q; do { d = R(5, 12); b = R(1, 4); q = R(2, 4); } while (b * q >= d); return Q(`${b * q}/${d} ÷ ${b}/${d} = ?`, choicesFrom(q, [q + 1, b * q, d, q * d]), q, '분모가 같으면 분자끼리만 나누어도 돼. 조각 개수를 조각 묶음으로 나누는 거야!'); },
  () => { const b = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8]), q = R(2, 9); return Q(`${fmtNum(b * q)} ÷ ${b} = ?`, choicesFrom(q, [q * 10, q / 10, q + 1]), q, '나누는 수와 나뉘는 수에 똑같이 10을 곱해서 자연수 나눗셈으로 바꿔 보자!'); },
],
'1-kor': [
  () => { const [e, w] = pick(T.pic1); return Q('그림에 맞는 낱말을 골라요.', withOthers(w, T.pic1.map((x) => x[1])), w, '그림을 보고 이름을 천천히 소리 내어 말해 보자. 첫소리와 받침 소리에 귀 기울여 들어 봐!', { v: { t: 'big', text: e } }); },
  () => { const w = pick(T.batchimWords), f = finalOf(w); return Q(`'${w}'에서 받침은 무엇일까요?`, withOthers(f, ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅊ', 'ㅍ']), f, '글자를 위와 아래로 나누어 보자. 맨 아래에 앉아 있는 자음이 받침이야!'); },
  () => { const w = pick(T.batchimWords); return Q('받침이 있는 낱말은 무엇일까요?', [w, ...shuffle(T.noBatchim).slice(0, 3)], w, '낱말을 한 글자씩 보면서 글자 아래쪽에 자음이 붙어 있는지 찾아보자!'); },
],
'2-kor': [
  () => { const [a, b, h] = pick(T.opposite), rev = Math.random() < 0.5, [x, y] = rev ? [b, a] : [a, b]; const pool = T.opposite.filter((p) => p[0] !== a).flatMap((p) => [p[0], p[1]]); return Q(`'${x}'의 반대말은 무엇일까요?`, withOthers(y, pool), y, h); },
  () => { const [d, w] = pick(T.mimic); return Q(`${d}${kj(d, '을', '를')} 흉내 낸 말은?`, withOthers(w, T.mimic.map((x) => x[1])), w, '그 모습이나 소리를 몸이나 입으로 직접 따라 해 볼까? 그때 어울리는 말을 골라 보자!'); },
],
'3-kor': [
  () => { const [a, b] = pick(T.honor); return Q(`'${a}'의 높임말은 무엇일까요?`, withOthers(b, T.honor.map((x) => x[1])), b, '웃어른께 이야기할 때 이 낱말을 어떻게 바꿔 말하는지 떠올려 봐!'); },
  () => { const cats = Object.keys(T.category), cat = pick(cats), [words, h] = T.category[cat]; const ans = pick(words); const others = shuffle(cats.filter((c) => c !== cat)).map((c) => pick(T.category[c][0])); return Q(`다음 중 '${cat}'${kj(cat, '을', '를')} 나타내는 말은?`, [ans, ...others], ans, h); },
],
'4-kor': [
  () => { const [i, m] = pick(T.idioms); return Q(`'${i}'의 뜻은 무엇일까요?`, withOthers(m, T.idioms.map((x) => x[1])), m, '이 말은 몸의 진짜 모습을 말하는 게 아니야. 어떤 사람에게 이 말을 쓰는지 상황을 떠올려 봐!'); },
  () => { const [i, m] = pick(T.idioms); return Q(`'${m}'라는 뜻의 관용 표현은?`, withOthers(i, T.idioms.map((x) => x[0])), i, '각 표현을 쓰는 상황을 하나씩 떠올려 보고, 뜻과 어울리는 것을 찾아봐!'); },
  () => { const opinion = Math.random() < 0.5, ans = pick(opinion ? T.opinions : T.facts); return Q(`다음 중 '${opinion ? '의견' : '사실'}'인 문장은?`, [ans, ...shuffle(opinion ? T.facts : T.opinions).slice(0, 3)], ans, '누구나 확인할 수 있으면 사실, 사람마다 생각이 다를 수 있으면 의견이야. 친구들에게 물어보면 대답이 달라질 문장인지 따져 보자!'); },
],
'5-kor': [
  () => { const [s, type] = pick(T.figures); return Q('다음 표현에 쓰인 방법은 무엇일까요?', ['직유법', '은유법', '의인법', '과장법'], type, "'~처럼, ~같이'가 있는지, 'A는 B이다'로 바로 말하는지, 사람이 아닌 것이 사람처럼 행동하는지, 실제보다 크게 부풀렸는지 하나씩 따져 보자!", { p: s }); },
],
'6-kor': [
  () => { const [p, m] = pick(T.proverbs); return Q(`속담 '${p}'의 뜻은?`, withOthers(m, T.proverbs.map((x) => x[1])), m, '속담 속 장면을 머릿속에 그림으로 떠올려 봐. 그 장면이 우리 생활의 어떤 모습과 닮았는지 생각해 보자!'); },
  () => { const [p, m] = pick(T.proverbs); return Q(`'${m}'라는 뜻의 속담은?`, withOthers(p, T.proverbs.map((x) => x[0])), p, '보기 속 속담의 장면을 하나씩 그림으로 떠올려 보고, 뜻과 어울리는 장면을 찾아봐!'); },
],
'1-eng': [
  () => { const i = R(0, 24); return Q(`알파벳 ${ABC[i]} 다음에 오는 글자는?`, withOthers(ABC[i + 1], ABC), ABC[i + 1], `알파벳 노래를 처음부터 천천히 불러 볼까? ${ABC[i]} 바로 뒤에 나오는 친구를 찾아봐!`); },
  // l(엘)과 I(아이)는 글꼴에 따라 똑같이 보여서 서로의 오답 보기로 함께 내지 않음
  () => { const U = pick(ABC), lookAlike = { L: 'I', I: 'L' }; return Q(`작은 글자 '${U.toLowerCase()}'의 큰 글자는?`, withOthers(U, ABC.filter((x) => x !== lookAlike[U])), U, '작은 글자와 큰 글자는 이름이 같은 짝꿍이야. 알파벳 노래를 부르며 이름이 같은 큰 글자를 떠올려 봐!'); },
  () => { const [e, w] = pick(T.vocab1); return Q('그림의 영어 단어는 무엇일까요?', withOthers(w, T.vocab1.map((x) => x[1])), w, `그림 속 이름의 첫소리를 생각해 보자. '${SOUND[w[0]]}' 소리로 시작하는 단어를 찾아봐!`, { v: { t: 'big', text: e } }); },
  () => { const [e, w] = pick(T.vocab1.filter(([, x]) => /^[A-Za-z]{3,6}$/.test(x))), i = R(1, w.length - 1), ch = w[i].toLowerCase(); return Q(`그림을 보고 빈칸에 들어갈 글자를 골라요: ${w.slice(0, i)}_${w.slice(i + 1)}`, withOthers(ch, 'abcdefghiklmnoprstuwy'.split('')), ch, '단어를 천천히 소리 내어 읽어 보자. 빈칸 자리에서 어떤 소리가 나는지 귀 기울여 봐!', { v: { t: 'big', text: e } }); },
  () => { const [, w] = pick(T.vocab1); return Q(`'${w}'의 첫 글자는 무엇일까요?`, withOthers(w[0], ABC), w[0], '단어를 천천히 소리 내 읽으며 맨 처음 소리를 들어 봐. 그 소리를 내는 글자를 찾아보자!'); },
],
'2-eng': [
  () => { const n = R(1, 10); return Q(`영어 단어 '${T.numbers[n - 1]}'에 알맞은 숫자는?`, choicesFrom(n, [n + 1, n - 1, n + 2].filter((x) => x >= 1)), n, '손가락을 하나씩 펴면서 영어로 숫자를 차례차례 세어 볼까?'); },
  () => { const n = R(1, 10); return Q(`숫자 ${n}${nj(n, '을', '를')} 영어로 쓰면?`, withOthers(T.numbers[n - 1], T.numbers), T.numbers[n - 1], 'One부터 손가락을 하나씩 펴며 영어로 차례차례 세어 보자!'); },
  () => { const [e, w] = pick(T.colors); return Q('이 색깔의 영어 단어는 무엇일까요?', withOthers(w, T.colors.map((x) => x[1])), w, '이 색깔을 가진 물건을 떠올려 보고, 영어 이름의 첫소리를 생각해 봐!', { v: { t: 'big', text: e } }); },
  () => { const [e, w] = pick(T.colors); return Q(`영어 단어 '${w}'에 알맞은 색깔은?`, withOthers(e, T.colors.map((x) => x[0])), e, '단어를 소리 내어 읽어 보고, 영상에서 배운 색깔 이름을 떠올려 봐!'); },
  () => { const [e, w] = pick(T.animals); return Q('그림의 영어 단어는 무엇일까요?', withOthers(w, T.animals.map((x) => x[1])), w, `그림 속 동물의 영어 이름은 '${SOUND[w[0]]}' 소리로 시작해!`, { v: { t: 'big', text: e } }); },
  () => { const [e, w] = pick(T.animals.filter(([, x]) => x.length <= 6)), i = R(1, w.length - 1), ch = w[i].toLowerCase(); return Q(`철자 맞히기! 빈칸에 들어갈 글자는? ${w.slice(0, i)}_${w.slice(i + 1)}`, withOthers(ch, 'abcdefghiklmnoprstuwy'.split('')), ch, '동물 이름을 천천히 소리 내어 읽어 보자. 빈칸 자리에서 나는 소리를 떠올려 봐!', { v: { t: 'big', text: e } }); },
  () => { const [e, w] = pick(T.animals); return Q(`영어 단어 '${w}'에 알맞은 동물 그림은?`, withOthers(e, T.animals.map((x) => x[0])), e, '단어를 소리 내어 읽어 보고, 그 이름으로 불리는 동물을 떠올려 봐!'); },
],
'3-eng': [
  () => { const [en, ko] = pick(T.vocab3); return Q(`'${en}'의 뜻은 무엇일까요?`, withOthers(ko, T.vocab3.map((x) => x[1])), ko, '단어를 소리 내어 읽어 보고, 교실이나 생활 속에서 언제 쓰는 말인지 떠올려 봐!'); },
  () => { const [en, ko] = pick(T.vocab3); return Q(`'${ko}'${kj(ko, '을', '를')} 영어로 하면?`, withOthers(en, T.vocab3.map((x) => x[0])), en, '보기의 영어 단어를 하나씩 소리 내 읽어 보며 우리말 뜻과 어울리는 걸 찾아봐!'); },
  () => { const [en, ko] = pick(T.can3); return Q(`빈칸에 알맞은 말은? I can ___. (나는 ${ko} 수 있어.)`, withOthers(en, T.can3.map((x) => x[0])), en, '괄호 속 우리말에서 동작을 나타내는 말을 찾아 영어로 바꿔 보자!'); },
],
'4-eng': [
  () => { const i = R(0, 6), ans = T.days[(i + 1) % 7]; return Q(`'${T.days[i]}' 다음 요일은?`, withOthers(ans, T.days), ans, '일주일의 요일을 영어로 차례대로 불러 볼까? Sunday부터 시작해 봐!'); },
  () => { const i = R(0, 6); return Q(`'${T.daysKo[i]}'은 영어로 무엇일까요?`, withOthers(T.days[i], T.days), T.days[i], '요일 노래를 부르듯 Sunday부터 차례로 세어 보며 몇 번째 요일인지 찾아보자!'); },
  () => { const i = R(0, 11), ans = `${i + 1}월`; return Q(`'${T.months[i]}'에 알맞은 달은 몇 월일까요?`, withOthers(ans, T.months.map((_, k) => `${k + 1}월`)), ans, 'January가 1월이야. 차례대로 손가락을 접으며 세어 볼까?'); },
  () => { const [e, w] = pick(T.weather); return Q("'How's the weather?' 그림에 알맞은 대답은?", withOthers(`It's ${w}.`, T.weather.map((x) => `It's ${x[1]}.`)), `It's ${w}.`, '날씨를 묻고 있어. 그림 속 하늘 모습을 보고 어울리는 날씨 낱말을 떠올려 보자!', { v: { t: 'big', text: e } }); },
  () => { const h = R(1, 12), clock = String.fromCodePoint(0x1F550 + h - 1); return Q("시계를 보고 알맞은 대답을 골라요. What time is it?", withOthers(`It's ${h} o'clock.`, Array.from({ length: 12 }, (_, k) => `It's ${k + 1} o'clock.`)), `It's ${h} o'clock.`, '짧은바늘이 가리키는 숫자를 읽어 보자. 긴바늘이 맨 위에 있으면 정각이야!', { v: { t: 'big', text: clock } }); },
],
'5-eng': [
  () => { const [b, p, irr] = pick(T.past); return Q(`'${b}'의 과거형은?`, [p, `${b}ed`, `${b}s`, `${b}ing`, b], p, irr ? '이 동사는 -ed를 붙이지 않고 모양이 확 바뀌는 불규칙 동사야. 소리 내어 여러 번 말하며 떠올려 봐!' : '이 동사는 규칙 동사야. 지나간 일을 말할 때 끝에 붙는 꼬리를 떠올려 봐!'); },
  () => { const [a, c, s] = pick(T.compare); return Q(`'${a}'의 비교급(더 ~한)은?`, [c, s, `more ${a}`, a], c, '둘을 비교할 때는 형용사 끝에 꼬리를 붙여. than과 함께 쓰는 모양을 떠올려 봐!'); },
],
'6-eng': [
  () => { const [a, c, s] = pick(T.compare); return Q(`'${a}'의 최상급(가장 ~한)은?`, [s, c, `most ${a}`, a], s, '셋 이상 중에서 가장 ~하다고 말할 때 형용사 끝에 붙는 꼬리를 떠올려 봐!'); },
  () => { const [b, f1, f2, f3, obj, ko] = pick(T.will); return Q(`빈칸에 알맞은 말은? I will ___ ${obj} tomorrow. (나는 내일 ${ko} 거야.)`, [b, f1, f2, f3], b, 'will 뒤에는 동사의 어떤 모양이 올까? 꼬리(-s, -ed, -ing)를 붙이지 않은 원래 모양을 떠올려 봐!'); },
  () => { const [en, ko] = pick(T.jobs); return Q(`'나는 ${ko}${kj(ko, '이', '가')} 되고 싶어.'를 영어로 바르게 쓴 것은?`, [`I want to be a ${en}.`, `I want a ${en}.`, `I wanted to be a ${en} yesterday.`, `I like be a ${en}.`], `I want to be a ${en}.`, '장래 희망을 말할 때는 want 뒤에 to be를 함께 써. 그 모양이 들어간 문장을 찾아봐!'); },
  () => { const [en, ko] = pick(T.jobs); return Q(`'${en}'의 뜻은 무엇일까요?`, withOthers(ko, T.jobs.map((x) => x[1])), ko, '단어를 소리 내어 읽어 보고, 그 일을 하는 사람이 어디에서 무슨 일을 하는지 떠올려 봐!'); },
],
};
// 시험 대비 집중 모드의 '유형' = 위 문제 생성기(GENERATORS[단원] 의 번호)를 묶은 것
const FOCUS_TYPES = {
  '1-math': [['수 모으기·가르기', [0, 1, 2]], ['수의 순서와 크기', [3, 4, 5]], ['10 만들어 더하기', [6]], ['앞의 수 가르기 뺄셈', [7]], ['뒤의 수 가르기 뺄셈', [8]]],
  '2-math': [['받아올림·받아내림', [0, 1]], ['곱셈구구·묶어 세기', [2, 3]], ['길이 재기 (m·cm)', [4]]],
  '3-math': [['세 자리 덧셈·뺄셈', [0, 1]], ['곱셈·나눗셈', [2, 3]], ['분수', [4]], ['시간', [5]]],
  '4-math': [['분수의 덧셈·뺄셈', [0, 1]], ['큰 수의 곱셈·나눗셈', [2, 3]], ['각도', [4, 5]]],
  '5-math': [['약분·약수와 배수', [0, 1, 2]], ['넓이', [3, 4]], ['평균·소수의 곱셈', [5, 6]]],
  '6-math': [['비례식·비례배분', [0, 4]], ['백분율', [1]], ['원주·원의 넓이', [2, 3]], ['분수·소수의 나눗셈', [5, 6]]],
  '1-kor': [['그림 보고 낱말 읽기', [0]], ['받침', [1, 2]]],
  '2-kor': [['반대말', [0]], ['흉내 내는 말', [1]]],
  '3-kor': [['높임말', [0]], ['낱말 분류 (때·장소·움직임·모양)', [1]]],
  '4-kor': [['관용 표현', [0, 1]], ['사실과 의견', [2]]],
  '5-kor': [['비유 표현 (직유·은유·의인·과장)', [0]]],
  '6-kor': [['속담', [0, 1]]],
  '1-eng': [['알파벳 순서·대소문자', [0, 1]], ['그림 단어·첫소리', [2, 4]], ['철자 맞히기', [3]]],
  '2-eng': [['숫자', [0, 1]], ['색깔', [2, 3]], ['동물·철자', [4, 5, 6]]],
  '3-eng': [['단어 뜻', [0, 1]], ['I can 문장', [2]]],
  '4-eng': [['요일·달', [0, 1, 2]], ['날씨·시각', [3, 4]]],
  '5-eng': [['과거형', [0]], ['비교급', [1]]],
  '6-eng': [['최상급·미래형', [0, 1]], ['장래 희망', [2, 3]]],
};
const qid = (q) => [q.p || '', q.q, q.a, q.v ? JSON.stringify(q.v) : ''].join('|');
const isValidQ = (q) => q.ch.length === 4 && q.ch.includes(q.a) && !containsAnswer(q.h, q.a);
/* ---------- 생성기 메타데이터: GENERATORS[단원][번호] ↔ [conceptTag, 개념 이름, 기본 난이도, 난이도 조절 가능 여부] ---------- */
const GEN_META = {
  '1-math': [['add-gather', '수 모으기', 1], ['split-number', '수 가르기', 1], ['make-10-pair', '10을 만드는 짝꿍 수', 1], ['num-next', '1 큰 수·1 작은 수', 1], ['num-next', '1 큰 수·1 작은 수', 1], ['num-compare', '수의 크기 비교', 1], ['add-make-10', '10 만들어 더하기 (받아올림)', 2, true], ['sub-split-front', '앞의 수 가르기 뺄셈', 2, true], ['sub-split-back', '뒤의 수 가르기 뺄셈', 2, true]],
  '2-math': [['add-carry-2d', '받아올림 있는 두 자리 덧셈', 2], ['sub-borrow-2d', '받아내림 있는 두 자리 뺄셈', 2], ['times-table', '곱셈구구', 1], ['group-count', '묶어 세기', 1], ['length-m-cm', '길이 (m와 cm)', 2]],
  '3-math': [['add-3d', '세 자리 수의 덧셈', 2], ['sub-3d', '세 자리 수의 뺄셈', 2], ['div-basic', '나눗셈의 몫', 2], ['mul-2d1d', '두 자리 × 한 자리 곱셈', 2], ['frac-read', '분수 읽기', 1], ['time-min', '시간과 분', 2]],
  '4-math': [['frac-add-like', '분모가 같은 분수의 덧셈', 1], ['frac-sub-like', '분모가 같은 분수의 뺄셈', 1], ['mul-3d2d', '세 자리 × 두 자리 곱셈', 3], ['div-remainder', '나머지가 있는 나눗셈', 2], ['angle-triangle', '삼각형의 세 각', 2], ['angle-quad', '사각형의 네 각', 3]],
  '5-math': [['frac-reduce', '약분과 기약분수', 2], ['lcm', '최소공배수', 2], ['gcd', '최대공약수', 2], ['area-rect', '직사각형의 넓이', 1], ['area-tri', '삼각형의 넓이', 2], ['average', '평균', 2], ['dec-mul', '소수의 곱셈', 2]],
  '6-math': [['ratio-proportion', '비례식', 2], ['percent', '백분율', 2], ['circle-circum', '원주', 2], ['circle-area', '원의 넓이', 3], ['ratio-distribute', '비례배분', 3], ['frac-div', '분수의 나눗셈', 2], ['dec-div', '소수의 나눗셈', 2]],
  '1-kor': [['word-picture', '그림 보고 낱말 읽기', 1], ['batchim-find', '받침 찾기', 2], ['batchim-word', '받침 있는 낱말', 1]],
  '2-kor': [['antonym', '반대말', 1], ['mimetic', '흉내 내는 말', 1]],
  '3-kor': [['honorific', '높임말', 2], ['word-category', '낱말 분류 (때·장소·움직임)', 1]],
  '4-kor': [['idiom-meaning', '관용 표현의 뜻', 2], ['idiom-find', '뜻에 맞는 관용 표현', 2], ['fact-opinion', '사실과 의견', 2]],
  '5-kor': [['figurative', '비유 표현', 2]],
  '6-kor': [['proverb-meaning', '속담의 뜻', 2], ['proverb-find', '뜻에 맞는 속담', 3]],
  '1-eng': [['abc-order', '알파벳 순서', 1], ['abc-case', '대문자와 소문자', 1], ['phonics-short', '그림 단어와 첫소리 (파닉스)', 2], ['spelling-missing', '철자 빈칸', 2], ['phonics-initial', '단어의 첫 글자', 1]],
  '2-eng': [['number-word', '숫자 영어', 1], ['number-word', '숫자 영어', 1], ['color-word', '색깔 영어', 1], ['color-word', '색깔 영어', 1], ['animal-word', '동물 영어', 1], ['spelling-animal', '동물 이름 철자', 2], ['animal-word', '동물 영어', 1]],
  '3-eng': [['vocab-meaning', '영어 단어 뜻', 1], ['vocab-english', '우리말을 영어로', 2], ['can-sentence', 'I can 문장', 2]],
  '4-eng': [['day-order', '요일 순서', 1], ['day-word', '요일 영어', 1], ['month-word', '달 이름', 1], ['weather', '날씨 표현', 1], ['time-oclock', '시각 표현', 1]],
  '5-eng': [['past-tense', '과거형', 2], ['comparative', '비교급', 2]],
  '6-eng': [['superlative', '최상급', 2], ['future-will', '미래형 will', 2], ['job-sentence', '장래 희망 문장', 3], ['job-word', '직업 단어', 1]],
};
// 손으로 쓴 문항에만 있는 개념의 이름
const EXTRA_CONCEPT_LABELS = {
  'place-value': '세 자리 수의 크기 비교', 'circle-parts': '원의 중심과 반지름', 'quad-shapes': '여러 가지 사각형', 'large-number': '큰 수', 'ratio-basic': '비율',
  'frac-add-unlike': '분모가 다른 분수의 덧셈', 'solid-figure': '직육면체', 'solid-net': '입체도형의 전개도', 'syllable-build': '글자 만들기', 'spelling-pron': '맞춤법과 소리',
  punctuation: '문장 부호', modifier: '꾸며 주는 말', 'reading-main-idea': '문단의 중심 문장 찾기', dictionary: '국어사전 찾기', 'reading-detail': '글 내용 확인하기',
  synonym: '비슷한 말', 'letter-form': '편지의 형식', conjunction: '이어 주는 말', 'discussion-manner': '회의·토의 태도', 'reading-sequence': '일이 일어난 차례',
  'reading-claim': '글쓴이의 주장 찾기', 'argument-evidence': '주장과 근거', 'essay-structure': '논설문의 짜임', 'media-literacy': '매체 자료 읽기', interview: '면담하기',
  greeting: '인사와 대답', 'basic-sentence': '기초 영어 문장', preposition: '위치 표현', 'to-infinitive': 'want to 표현', permission: '허락 구하기 (May I)',
  possessive: '누구의 것인지 말하기', feelings: '기분 표현', 'reading-detail-en': '영어 글 내용 확인', 'modal-should': '충고 표현 should',
};
const CONCEPT_LABELS = { ...EXTRA_CONCEPT_LABELS, ...Object.fromEntries(Object.values(GEN_META).flat().map(([tag, label]) => [tag, label])) };
const conceptLabel = (tag) => CONCEPT_LABELS[tag] || (String(tag).endsWith('-review') ? '단원 종합 복습' : tag);
const conceptMetas = (key) => (GEN_META[key] || []).map(([tag, label, difficulty, leveled], i) => ({ tag, label, difficulty, leveled: !!leveled, gen: GENERATORS[key][i] })).filter((m) => m.gen);
const conceptHasGenerator = (key, tag) => conceptMetas(key).some((m) => m.tag === tag);

/* ---------- 적응형 난이도 & 취약 개념 진단 엔진 ----------
   conceptTag별 기록: 시도 수 · 정답 · 힌트 사용 · 풀이 시간 · 최근 8문제 결과 · 현재 난이도(1~3)
   - 연속 오답 / 힌트를 쓰고도 오답 / 너무 오래 걸린 오답 → 난이도 ↓ + '기초 다지기' 문제 우선 출제
   - 힌트 없이 빠르게 3연속 정답 → 난이도 ↑, 안정된 개념은 덜 나오고 다음 개념이 더 자주 나옴 */
const ADAPT = { window: 8, upStreak: 3, weakBelow: 0.6, startLevel: 2, slowSec: { 1: 20, 2: 30, 3: 45 } };
const Adaptive = {
  all() { return (typeof S !== 'undefined' && S.save && S.save.mastery) || {}; },
  stat(tag) { return { tries: 0, right: 0, hints: 0, timeMs: 0, timed: 0, level: ADAPT.startLevel, streakR: 0, streakW: 0, recent: [], needsBasics: false, last: null, unit: '', ...(this.all()[tag] || {}) }; },
  levelFor(tag) { return this.stat(tag).level; },
  // 최근 결과 점수: 한 번에 정답 1점, 힌트 쓰고 정답 0.6점, 오래 걸린 정답 ×0.85, 오답 0점
  score(tag) { const r = this.stat(tag).recent; return r.length ? r.reduce((s, x) => s + (x.ok ? (x.h ? 0.6 : 1) * (x.slow ? 0.85 : 1) : 0), 0) / r.length : null; },
  weakness(tag) { const r = this.stat(tag).recent, sc = this.score(tag); return r.length < 2 || sc == null ? 0 : (1 - sc) * Math.min(1, r.length / 4); },
  status(tag) {
    const s = this.stat(tag), sc = this.score(tag);
    if (sc == null) return 'new';
    if (s.recent.length >= 2 && (sc < ADAPT.weakBelow || s.needsBasics)) return 'weak';
    if (s.recent.length >= 3 && sc >= 0.85) return 'stable';
    return 'practice';
  },
  // 출제할 개념 고르기: 약한 개념·기초가 필요한 개념은 자주, 완전히 안정된 개념은 덜 자주
  pickConcept(metas) {
    const w = metas.map((m) => Math.max(0.2, 1 + 3 * this.weakness(m.tag) + (this.stat(m.tag).needsBasics ? 2 : 0) - (this.status(m.tag) === 'stable' && this.levelFor(m.tag) === 3 ? 0.6 : 0)));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < metas.length; i++) { r -= w[i]; if (r <= 0) return metas[i]; }
    return metas[metas.length - 1];
  },
  record(q, { ok, hinted = false, ms = null }) {
    const tag = q && q.conceptTag;
    if (!tag) return null;
    const s = this.stat(tag), slow = ms != null && ms / 1000 > ADAPT.slowSec[q.difficulty || 2];
    const recent = [...s.recent, { ok: !!ok, h: hinted ? 1 : 0, slow: slow ? 1 : 0 }].slice(-ADAPT.window);
    let { level, streakR, streakW, needsBasics } = s, change = 0;
    if (ok) { streakR += 1; streakW = 0; if (!hinted && !slow) needsBasics = false; } else { streakW += 1; streakR = 0; }
    if (!ok && (streakW >= 2 || hinted || slow)) { needsBasics = true; if (level > 1) { level -= 1; change = -1; } }
    else if (ok && !hinted && !slow && streakR >= ADAPT.upStreak) { streakR = 0; if (level < 3) { level += 1; change = 1; } }
    const next = { ...s, tries: s.tries + 1, right: s.right + (ok ? 1 : 0), hints: s.hints + (hinted ? 1 : 0), timeMs: s.timeMs + (ms || 0), timed: s.timed + (ms != null ? 1 : 0), level, streakR, streakW, recent, needsBasics, last: todayStr(), unit: q.unit || s.unit };
    S.save = { ...S.save, mastery: { ...this.all(), [tag]: next } };
    persist();
    if (change < 0) toast(`🧩 '${conceptLabel(tag)}' 기초부터 차근차근 다시 다져 볼게요`);
    if (change > 0) toast(`🚀 '${conceptLabel(tag)}' 실력이 쑥! 한 단계 어려운 문제로 올라가요`);
    return { change, needsBasics, slow };
  },
  // 같은 개념의 기초·유사 문제 1개 (자동 생성 우선, 없으면 같은 개념의 문제 은행 문항)
  remedial(q, exclude = new Set()) {
    if (!q || !q.conceptTag || !q.unit) return null;
    const ex = new Set([...exclude, qid(q)]);
    const gen = generateDynamicQuestions({ unit: q.unit, conceptTag: q.conceptTag, difficulty: this.levelFor(q.conceptTag), count: 1, exclude: ex })[0];
    const alt = gen || shuffle((UNITS[q.unit] ? UNITS[q.unit].qs : []).filter((x) => x.conceptTag === q.conceptTag && !ex.has(qid(x))))[0];
    return alt ? { ...alt, remedial: true } : null;
  },
  weakest({ unit = null, limit = 3 } = {}) {
    return Object.keys(this.all()).filter((t) => (!unit || this.stat(t).unit === unit) && this.status(t) === 'weak')
      .sort((x, y) => this.weakness(y) - this.weakness(x)).slice(0, limit);
  },
  diagnose(tag) {
    const s = this.stat(tag), r = s.recent;
    const firstRight = r.filter((x) => x.ok && !x.h).length, hints = r.filter((x) => x.h).length, slow = r.filter((x) => x.slow).length;
    const why = s.streakW >= 2 ? '연속으로 틀렸어요' : hints ? `힌트를 ${hints}번 쓰고 풀었어요` : slow ? '푸는 데 시간이 오래 걸렸어요' : '한 번에 맞힌 비율이 낮아요';
    return { title: `${conceptLabel(tag)} 집중 연습 필요`, detail: `최근 ${r.length}문제 중 ${firstRight}문제 한 번에 정답 · ${why}`, level: s.level };
  },
};

/* ---------- 문제 자동 생성: 개념(conceptTag)과 적응형 난이도에 맞춰 레코드 생성 ---------- */
function generatedPool(key, want, seen = new Set(), tags = null, fixedDiff = null) {
  const metas = conceptMetas(key).filter((m) => !tags || tags.includes(m.tag)), out = [], ids = new Set(seen);
  const title = UNITS[key] ? UNITS[key].title : key;
  for (let tries = 0; metas.length && out.length < want && tries < want * 40; tries++) {
    const m = Adaptive.pickConcept(metas);
    const diff = m.leveled ? (fixedDiff || Adaptive.levelFor(m.tag)) : m.difficulty;
    const raw = m.gen(diff);
    if (!isValidQ(raw) || ids.has(qid(raw))) continue;
    ids.add(qid(raw));
    out.push(toRecord(raw, { key, title, tag: m.tag, difficulty: diff, source: 'gen' }));
  }
  return out;
}
function generateDynamicQuestions({ unit, conceptTag = null, difficulty = null, count = 1, exclude = new Set() }) {
  return generatedPool(unit, count, exclude, conceptTag ? [conceptTag] : null, difficulty);
}
/*GEN-END*/

/* ---------- questionBank: 문제 은행 공개 API (화면 코드는 이 모듈로만 문제를 가져옵니다) ---------- */
const questionBank = {
  byUnit: (key) => (UNITS[key] ? UNITS[key].qs : []),
  byConcept: (tag) => Object.values(UNITS).flatMap((u) => u.qs).filter((q) => q.conceptTag === tag),
  concepts: (key) => uniq([...questionBank.byUnit(key).map((q) => q.conceptTag), ...conceptMetas(key).map((m) => m.tag)]),
  generate: generateDynamicQuestions,
  label: conceptLabel,
};

// 수업용 문제: 직접 만든 문항 + 자동 생성 문항을 섞어 10~15문제를 무작위로 냅니다
function buildLessonQuestions(key) {
  const n = R(QUESTION_RANGE[0], QUESTION_RANGE[1]);
  const base = questionBank.byUnit(key);
  const extra = generatedPool(key, n, new Set(base.map(qid))); // 적응형: 약한 개념이 더 자주, 개념별 현재 난이도로 생성
  return shuffle([...base, ...extra]).slice(0, n);
}

const SUBJECTS = {
  kor: { name: '국어', icon: '📖' },
  math: { name: '수학', icon: '🔢' },
  eng: { name: '영어', icon: '🔤' },
};
const GRADE_TOPIC = { 1: '수·받침·ABC', 2: '셈·낱말·단어', 3: '분수·문단·문장', 4: '각도·관용·회화', 5: '비율·비유·문법', 6: '비례·논설·독해' };
const PRAISE = ['정답이야! 정말 멋져!', '딩동댕! 스스로 해냈구나!', '우와, 최고야! 생각을 정말 잘했어!', '맞았어! 선생님이 감동했어!'];
const ENCOURAGE_SHORT = ['괜찮아, 같이 고쳐 보자!', '아깝다! 거의 다 왔어.', '틀려도 괜찮아. 생각하는 힘이 자라고 있어!'];
const MATCH_PRAISE = ['딩동댕! 짝꿍을 찾았어!', '우와, 기억력 최고야!', '멋져! 하나 더 찾아볼까?', '반짝반짝! 정말 잘했어!'];
const GENERIC_HINT = '문제를 천천히 소리 내어 다시 읽어 보자. 무엇을 묻는지 손가락으로 짚어 보고, 보기를 하나씩 문제에 넣어 생각해 볼까?';

/* ---------- 힌트 안전장치: 힌트에 정답이 그대로 들어 있으면 일반 힌트로 바꿉니다 ---------- */
function containsAnswer(hint, answer) {
  const a = String(answer).trim();
  if (!a) return false;
  const escRe = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (/^[0-9]+$/.test(a)) return new RegExp(`(^|[^0-9])${escRe}([^0-9]|$)`).test(hint);
  if (/^[A-Za-z]+$/.test(a)) return new RegExp(`(^|[^A-Za-z])${escRe}([^A-Za-z]|$)`).test(hint);
  // 한 글자 한글 정답('자', '문')은 '자음', '문제' 같은 다른 낱말 속 글자를 노출로 보지 않음 (단독 사용·조사 결합만 노출)
  if (/^[가-힣]$/.test(a)) return new RegExp(`(^|[^가-힣])${escRe}([^가-힣]|$|(을|를|이|가|은|는|와|과|도|로|의)(?![가-힣]))`).test(hint);
  return hint.includes(a);
}
function safeHint(q) { return containsAnswer(q.h, q.a) ? GENERIC_HINT : q.h; }
