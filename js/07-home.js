/* 별빛 학습지 — 홈 화면 */
'use strict';

/* =====================================================================
   6. 홈 화면
   ===================================================================== */
function renderHome() {
  S.lesson = null;
  ensureTodayMissions();
  const g = S.grade;
  const greet = '안녕! 나는 별빛 선생님이야. 오늘은 몇 학년, 어떤 과목을 공부해 볼까? 학년을 고르고 과목 카드를 눌러 줘!';
  setScreen(`<div class="wrap">${headerHTML(false)}
    <section class="hero card">
      <div class="tav" id="teacherAv">${teacherSVG()}</div>
      <div class="hero-r">
        <div class="bubble big"><span id="bubbleText">${greet}</span></div>
        <button class="ibtn soft" id="greetBtn">🔊 선생님 말 듣기</button>
        ${Voice.ok ? '' : '<div class="notice">이 브라우저는 음성 읽기를 지원하지 않아요. 말풍선 자막으로 안내할게요.</div>'}
      </div>
    </section>
    ${todayStripHTML()}
    <section class="missions card" id="missionPanel" aria-label="오늘의 미션">${missionPanelHTML()}</section>
    <section class="card piggycard" id="piggyCard" aria-label="용돈 저금통">${piggyCardHTML()}</section>
    <section class="card diagcard" aria-label="취약 개념 진단">${diagnosisHTML()}</section>
    <h2 class="sec">1. 학년을 골라요</h2>
    <div class="grades" role="group" aria-label="학년 선택">${[1, 2, 3, 4, 5, 6].map((n) => `<button class="gbtn g${n} ${n === g ? 'on' : ''}" data-grade="${n}" aria-pressed="${n === g}">${n}학년<small>${GRADE_TOPIC[n]}</small></button>`).join('')}</div>
    <h2 class="sec">2. 과목을 골라요 <small>(${g}학년)</small></h2>
    <div class="subjects">${['kor', 'math', 'eng'].map((k) => subjectCard(k, g)).join('')}</div>
    <section class="focusban card"><div><h2>🎯 시험 대비 집중 모드</h2><p>원하는 유형만 골라 <b>시간 제한 없이 차분히 연습</b>하거나, <b>10문제 연속 도전</b>으로 실력을 점검해요.</p></div>
      <button class="bigbtn violet" data-act="focus">집중 모드 시작 ›</button></section>
    <p class="foot">학습 순서: ① 개념 영상 → ② 학습지 + 선생님 힌트 → ③ 숨은 몬스터 찾기 · 몬스터 퀴즈 배틀 → ④ 종합 테스트 → ⑤ 별과 몬스터 캡슐 보상<br>모든 그림과 소리는 이 파일 안에서 만들어져서 인터넷 없이도 공부할 수 있어요.</p>
  </div>`);
  document.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
    S.grade = Number(b.dataset.grade); S.save.grade = S.grade; persist(); renderHome();
  }));
  document.querySelectorAll('[data-subj]').forEach((b) => b.addEventListener('click', () => startLesson(b.dataset.subj)));
  document.querySelectorAll('[data-course]').forEach((b) => b.addEventListener('click', () => renderCourseMap(b.dataset.course)));
  $('#greetBtn').addEventListener('click', () => teacherSay(greet));
  $('#missionPanel').addEventListener('click', (e) => {
    const claim = e.target.closest('[data-ms]');
    if (claim) { claimMission(claim.dataset.ms); return; }
    const all = e.target.closest('[data-msall]');
    if (all) { claimAllMissions(all); return; }
    const go = e.target.closest('[data-go]'); if (!go) return;
    if (go.dataset.go === 'note') openNote();
    else if (go.dataset.go === 'focus') renderFocusSetup();
    else $('.subjects').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  S.view = 'home';
}
// 과목 카드: 진도표의 '지금 단원'과 통과한 단원 수를 보여 줍니다
function subjectCard(k, g) {
  const sj = SUBJECTS[k], ck = `${g}-${k}`, curKey = currentUnitKey(ck), cu = curKey ? courseUnit(curKey) : null;
  const { passed, total } = courseProgress(ck), best = curKey ? S.save.best[curKey] || 0 : 3;
  const unitText = cu ? `${semLabel(cu)} · ${cu.title}` : '준비된 단원을 모두 마쳤어요!';
  return `<div class="scard-wrap"><button class="scard s-${k}" data-subj="${k}" aria-label="${g}학년 ${sj.name} ${esc(unitText)} ${cu ? '시작하기' : '진도표 보기'}">
    <span class="sicon">${sj.icon}</span><span class="sname">${sj.name}</span>
    <span class="sunit">📍 ${esc(unitText)}</span>
    <span class="sprog" aria-label="통과 ${passed} / ${total}단원"><i style="width:${total ? Math.round((passed / total) * 100) : 0}%"></i></span>
    <span class="sbest">${'★'.repeat(best)}${'☆'.repeat(3 - best)} <small>통과 ${passed}/${total}</small></span>
    <span class="sgo">${cu ? '이어서 공부하기 ▶' : '진도표 보기 ▶'}</span></button>
    <button class="ibtn soft cm-open" data-course="${ck}">🗺️ ${sj.name} 진도표</button></div>`;
}
// 진도 수업: 지금 단원 (+ 지난 단원 복습 문제) · 복습 수업: 진도표에서 고른 지난 단원 (진도에 영향 없음)
function startLesson(subj, { unitKey = null, review = false } = {}) {
  const ck = `${S.grade}-${subj}`;
  const key = unitKey || currentUnitKey(ck);
  if (!key) { renderCourseMap(ck, '🎉 지금 준비된 단원을 모두 마쳤어요! 복습하고 싶은 단원을 골라 보세요.'); return; }
  if (!S.save.course[ck]) saveCourseState(ck, courseState(ck)); // 처음 시작한 과목의 진도 위치 저장
  const qs = lessonQuestionsFor(ck, key, review); // 10~15문제 무작위 (다시 하기 때마다 새 문제 조합)
  S.lesson = { key, ck, grade: S.grade, subj, unit: UNITS[key], review, qs, balls: 0, ws: { stars: 0 }, hunt: { captured: 0, kinds: [] }, battle: { stars: 0 } };
  renderVideo();
}
