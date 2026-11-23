/* 별빛 학습지 — 진도 단원 등록 (교과서 단원 1개 = 학습 단원 1개) */
'use strict';

/* =====================================================================
   2-A. 진도 단원 등록
   - 단원 키: '학년-과목-학기-번호'  예) '1-math-2-1' = 1학년 수학 2학기 1단원
     (key.split('-') 의 앞 두 칸이 학년·과목이라 기존 기록·리포트 코드와 호환)
   - 단원마다 개념 영상(sc) · 문제 생성기(gens) · 손으로 쓴 문항(qs) · 몬스터 찾기 미션(hunt) · 짝 데이터(pairs)
   - 등록하면 UNITS / GENERATORS / GEN_META / FOCUS_TYPES / CONCEPT_LABELS 에 함께 들어가므로
     적응형 난이도 · 오답노트 · 미니게임 · 종합 테스트 · 집중 모드가 그대로 동작합니다.
   ===================================================================== */
/**
 * @param {string} key  단원 키 ('1-math-1-1')
 * @param {object} spec
 *   title   단원 이름
 *   sc      [[내레이션, 영상 그림], ...]  (08-video.js 의 그림 종류 사용)
 *   gens    [{ tag, label, diff, leveled, make(diff) => Q(...) }, ...]  tag 는 '<단원키>.<영문 이름>'
 *   qs      손으로 쓴 문항 [{ q, ch, a, h, v?, p?, tag? }] (tag 생략 시 첫 생성기 개념)
 *   hunt    [[미션 문장, 정답 팻말, [오답 팻말들]], ...]
 *   pairs   [[A, B], ...]  pairRel: 짝 관계 이름  pairGen: () => [A, B]
 *   splitCards  종합 테스트에 '가르기 카드'(받아내림 뺄셈)를 섞을지
 */
function defineUnit(key, spec) {
  const gens = spec.gens || [];
  if (!spec.title || !gens.length) throw new Error(`[defineUnit] ${key}: title 과 gens 는 꼭 있어야 해요`);
  GENERATORS[key] = gens.map((g) => g.make);
  GEN_META[key] = gens.map((g) => [g.tag, g.label, g.diff || 1, !!g.leveled]);
  gens.forEach((g) => { CONCEPT_LABELS[g.tag] = g.label; });
  // 집중 모드 '유형' = 개념 이름이 같은 생성기 묶음
  const byLabel = new Map();
  gens.forEach((g, i) => byLabel.set(g.label, [...(byLabel.get(g.label) || []), i]));
  FOCUS_TYPES[key] = [...byLabel.entries()];
  const firstTag = gens[0].tag;
  UNITS[key] = {
    title: spec.title, sc: spec.sc || [], hunt: spec.hunt || [], pairs: spec.pairs || [],
    pairRel: spec.pairRel || '짝꿍', pairGen: spec.pairGen || null, splitCards: !!spec.splitCards,
    qs: (spec.qs || []).map(({ tag, ...q }) => toRecord(q, { key, title: spec.title, tag: tag || firstTag, difficulty: q.difficulty || 1, source: 'bank' })),
  };
}
