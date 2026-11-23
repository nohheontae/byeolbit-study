/* 별빛 학습지 — 선생님 음성 (Web Speech API / 앱 네이티브 TTS) */
'use strict';

/* =====================================================================
   4. 음성 (Web Speech API) – 한국어/영어 자동 분리 낭독
   ===================================================================== */
function speechNormalize(t) {
  return String(t)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️‍⃣]/gu, ' ')
    .replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => ` ${b}분의 ${a} `)
    .replace(/cm²/g, ' 제곱센티미터').replace(/(\d)\s*cm/g, '$1 센티미터')
    .replace(/×/g, ' 곱하기 ').replace(/÷/g, ' 나누기 ').replace(/\+/g, ' 더하기 ')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 빼기 $2').replace(/=/g, ' 은 ').replace(/□/g, ' 네모 ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 대 $2').replace(/%/g, ' 퍼센트').replace(/°/g, '도')
    .replace(/_+/g, ' 빈칸 ').replace(/[↔→~·•①②③]/g, ' , ')
    .replace(/\s+/g, ' ').trim();
}
function toSegments(text) {
  const t = speechNormalize(text);
  const out = [];
  const re = /[A-Za-z][A-Za-z0-9'’,.!? ]*[A-Za-z0-9.!?']|[A-Za-z]/g;
  let last = 0, m;
  while ((m = re.exec(t))) {
    const before = t.slice(last, m.index);
    if (before.trim()) out.push({ text: before.trim(), lang: 'ko-KR' });
    out.push({ text: m[0].trim(), lang: 'en-US' });
    last = re.lastIndex;
  }
  const rest = t.slice(last);
  if (rest.trim()) out.push({ text: rest.trim(), lang: 'ko-KR' });
  return out.filter((s) => /[\p{L}\p{N}]/u.test(s.text));
}
const NATURAL_VOICE_RE = /natural|neural|online|premium|enhanced|wavenet/i;
// 기기별 대표 여성 음성(Edge·Windows·Chrome·macOS/iOS·Android)과 남성 음성 이름
const FEMALE_VOICE_RE = /sunhi|선히|서현|유진|지민|해미|유나|seohyeon|yujin|jimin|heami|yuna|\bsora\b|suhyun|google 한국|female|여성|여자|jenny|\baria\b|\bana\b|michelle|\bemma\b|\bava\b|samantha|zira|allison|susan|google us english|\bism\b|\bkob\b/i;
const MALE_VOICE_RE = /injoon|andrew|brian|인준|현수|봉진|국민|민수|hyunsu|bongjin|gookmin|minsu|\bjian\b|\bmale\b|남성|남자|\bguy\b|davis|\btony\b|jason|christopher|\beric\b|roger|steffan|\bdavid\b|\bmark\b|\balex\b|\bfred\b|\bkod\b/i;
const YOUNG_PREFERRED_RE = /sunhi|선히|서현|유진|지민|seohyeon|yujin|jimin|yuna|jenny|\bana\b|\baria\b|\bava\b/i;
function voiceScore(v, exactLang) {
  const n = v.name || '';
  let s = exactLang ? 5 : 0;
  if (FEMALE_VOICE_RE.test(n) && !/\bmale\b|남성|남자/i.test(n)) s += 50;
  if (MALE_VOICE_RE.test(n)) s -= 60;
  if (NATURAL_VOICE_RE.test(n)) s += 30;
  if (YOUNG_PREFERRED_RE.test(n)) s += 15;
  if (/heami|해미|zira/i.test(n)) s -= 10; // 구형 합성음은 같은 여성이어도 뒤로
  if (v.localService === false) s += 3;
  return s;
}
/* APK(Capacitor) 안의 안드로이드 WebView 는 speechSynthesis 를 지원하지 않으므로,
   @capacitor-community/text-to-speech 플러그인이 있으면 기기 TTS(삼성/구글 음성)로 말한다.
   웹·PWA·TWA(크롬)에서는 이 객체가 비활성이라 기존 Web Speech 경로를 그대로 사용. */
const NATIVE_INIT_RETRY_MS = 400;   // 앱을 켠 직후 기기 음성 엔진이 준비되는 동안 재시도 간격
const NATIVE_INIT_MAX_TRIES = 12;   // 최대 약 5초 대기
const NATIVE_LANG_CANDIDATES = { 'ko-KR': ['ko-KR', 'ko'], 'en-US': ['en-US', 'en-GB', 'en'] };
const ttsErrorText = (err) => String((err && (err.message || err.code)) || err || '');
const ttsSleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NativeTTS = {
  langFor: {},        // 언어별로 실제 동작한 태그 기억 (ko-KR 이 안 되면 ko)
  warned: {},         // 같은 안내는 한 번만
  get plugin() {
    const C = window.Capacitor;
    return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.TextToSpeech ? C.Plugins.TextToSpeech : null;
  },
  get available() { return !!this.plugin; },
  stop() { const p = this.plugin; if (p) p.stop().catch(() => { /* 말하는 중이 아니면 실패해도 무관 */ }); },
  /* 실패 원인을 아이·부모가 알 수 있게 화면에 한 번 안내 (조용히 무음이 되지 않도록) */
  report(kind, detail) {
    console.warn('[NativeTTS]', kind, detail);
    if (this.warned[kind]) return;
    this.warned[kind] = true;
    if (kind === 'no-korean') {
      toast('🔇 이 기기에 한국어 음성 데이터가 없어요. 설정 → 일반 → 텍스트 음성 변환 → 기본 엔진의 ⚙️ 에서 한국어 음성을 설치해 주세요.');
      const p = this.plugin; if (p && p.openInstall) p.openInstall().catch(() => { /* 설치 화면이 없는 기기 */ });
    } else if (kind === 'no-engine') {
      toast('🔇 기기 음성 엔진을 찾지 못했어요. 설정 → 일반 → 텍스트 음성 변환에서 기본 엔진(삼성 또는 Google)을 골라 주세요.');
    } else {
      toast(`🔇 음성 재생에 실패했어요 (${detail}). 태블릿 미디어 음량도 확인해 주세요.`);
    }
  },
  /* 한 구간 읽기: 엔진 준비 대기 + 언어 태그 대체. 성공하면 true */
  async speakOne(s, isCurrent, voice = null) {
    const en = s.lang === 'en-US';
    const rate = voice ? voice.rate : en ? 0.9 : 1.0, pitch = voice ? voice.pitch : en ? 1.05 : 1.1;
    const tags = this.langFor[s.lang] ? [this.langFor[s.lang]] : (NATIVE_LANG_CANDIDATES[s.lang] || [s.lang]);
    for (const lang of tags) {
      for (let tries = 0; tries < NATIVE_INIT_MAX_TRIES; tries++) {
        if (!isCurrent()) return false;
        try {
          await this.plugin.speak({ text: s.text, lang, rate, pitch, volume: 1.0, category: 'playback' });
          this.langFor[s.lang] = lang;
          return true;
        } catch (err) {
          const msg = ttsErrorText(err);
          if (/not yet initialized|not available/i.test(msg)) {
            if (tries === NATIVE_INIT_MAX_TRIES - 1) { this.report('no-engine', msg); return false; }
            await ttsSleep(NATIVE_INIT_RETRY_MS);
            continue;
          }
          if (/not supported/i.test(msg)) break;        // 다음 언어 태그로
          this.report('failed', msg);
          return false;
        }
      }
    }
    if (!en) this.report('no-korean', s.lang);       // 영어만 없으면 조용히 건너뜀
    return false;
  },
  async speakAll(segs, isCurrent, voice = null) {
    for (const s of segs) {
      if (!isCurrent()) return false;
      await this.speakOne(s, isCurrent, voice);
    }
    return isCurrent();
  },
  /* 🎙️ 버튼용 점검: 엔진·한국어 지원 여부를 요약 문구로 */
  async diagnose() {
    const p = this.plugin;
    if (!p) return '음성 플러그인 없음';
    try {
      const ko = await p.isLanguageSupported({ lang: 'ko-KR' });
      const langs = await p.getSupportedLanguages().catch(() => ({ languages: [] }));
      const n = (langs.languages || []).length;
      if (!n) return '음성 엔진 준비 안 됨 (텍스트 음성 변환 설정 확인)';
      return ko.supported ? `한국어 음성 ✓ (지원 언어 ${n}개)` : `한국어 음성 ✗ (지원 언어 ${n}개) — 한국어 음성 데이터 설치 필요`;
    } catch (err) {
      return `점검 실패: ${ttsErrorText(err)}`;
    }
  },
};
const Voice = {
  ok: ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) || NativeTTS.available,
  muted: S.save.muted, voices: [], speaking: false, token: 0,
  init() {
    if (!this.ok || !('speechSynthesis' in window)) return;
    const load = () => { this.voices = window.speechSynthesis.getVoices() || []; };
    load();
    if ('onvoiceschanged' in window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load;
  },
  /* 젊고 세련된 여성 음성 우선 선택: 자연어(Neural) 여성 > 일반 여성 > 기타, 남성 음성은 최후순위 */
  rankedVoices(lang) {
    const l = lang.toLowerCase().slice(0, 2);
    const norm = (v) => (v.lang || '').toLowerCase().replace('_', '-');
    return this.voices
      .filter((v) => norm(v).startsWith(l))
      .map((v) => ({ v, score: voiceScore(v, norm(v) === lang.toLowerCase()) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.v);
  },
  voiceFor(lang) {
    const list = this.rankedVoices(lang);
    if (lang === 'ko-KR') {
      const want = S.save.prefs.voiceKo;
      const picked = want && list.find((v) => v.name === want);
      if (picked) return picked;
    }
    return list[0] || null;
  },
  stop() {
    this.token++; this.speaking = false;
    if (typeof MonsterVoiceFile !== 'undefined') MonsterVoiceFile.stop(); // 몬스터 AI 목소리 파일도 멈춤 (선생님 말·소리 끔과 겹치지 않게)
    if (NativeTTS.available) { NativeTTS.stop(); return; }
    if (this.ok) { try { window.speechSynthesis.cancel(); } catch (e) { /* 일부 브라우저에서 cancel 실패는 무시 */ } }
  },
  // voice: { pitch, rate } — 몬스터 인사처럼 목소리를 바꿔 말할 때 (없으면 선생님 목소리)
  say(text, onend, voice = null) {
    this.stop();
    const my = this.token;
    const segs = toSegments(text);
    if (this.muted || !this.ok || !segs.length) {
      if (onend) setTimeout(() => { if (my === this.token) onend(); }, 500);
      return;
    }
    this.speaking = true;
    if (NativeTTS.available) {
      NativeTTS.speakAll(segs, () => my === this.token, voice).then((finished) => {
        if (!finished) return;
        this.speaking = false;
        if (onend) onend();
      });
      return;
    }
    let i = 0;
    const next = () => {
      if (my !== this.token) return;
      if (i >= segs.length) { this.speaking = false; if (onend) onend(); return; }
      const s = segs[i++];
      const u = new SpeechSynthesisUtterance(s.text);
      u.lang = s.lang;
      const v = this.voiceFor(s.lang); if (v) u.voice = v;
      // 자연어 음성은 원음이 가장 세련되므로 살짝만, 구형 음성은 톤을 조금 밝게 보정
      const natural = v && NATURAL_VOICE_RE.test(v.name);
      if (s.lang === 'en-US') { u.rate = natural ? 0.92 : 0.85; u.pitch = natural ? 1.03 : 1.1; }
      else { u.rate = natural ? 1.03 : 0.98; u.pitch = natural ? 1.05 : 1.15; }
      if (voice) { u.rate = voice.rate; u.pitch = voice.pitch; }
      u.onend = next; u.onerror = next;
      try { window.speechSynthesis.speak(u); } catch (e) { next(); }
    };
    setTimeout(next, 60); // cancel 직후 바로 speak 하면 무시되는 브라우저 대응
  },
};
Voice.init();

function teacherSay(text, { speak = true } = {}) {
  const b = $('#bubbleText');
  if (b) {
    b.textContent = text;
    const bb = b.closest('.bubble');
    if (bb) { bb.classList.remove('pop'); void bb.offsetWidth; bb.classList.add('pop'); }
  }
  const av = $('#teacherAv'); if (av) av.classList.add('talking');
  const done = () => { const a = $('#teacherAv'); if (a) a.classList.remove('talking'); };
  if (speak) Voice.say(text, done); else setTimeout(done, 600);
}
/* 🎙️ 선생님 목소리 순환: 여성 음성 우선 순위대로 돌며 미리듣기, 선택은 저장 */
function cycleTeacherVoice() {
  if (!Voice.ok) { toast('이 브라우저는 음성 기능을 지원하지 않아요.'); return; }
  if (NativeTTS.available) {
    if (Voice.muted) toggleMute();
    NativeTTS.warned = {};   // 점검할 때는 실패 안내를 다시 보여 줌
    NativeTTS.diagnose().then((status) => {
      toast(`🎙️ 기기 음성 점검: ${status}. 목소리는 설정 → 일반 → 텍스트 음성 변환에서 바꿀 수 있어요.`);
    });
    teacherSay('안녕하세요! 오늘도 선생님이랑 즐겁게 공부해 볼까요?');
    return;
  }
  if (!Voice.voices.length) Voice.voices = window.speechSynthesis.getVoices() || [];
  const all = Voice.rankedVoices('ko-KR');
  const female = all.filter((v) => voiceScore(v, true) > 0);
  const list = female.length ? female : all;
  if (!list.length) { toast('이 기기에는 한국어 음성이 없어요. Edge 브라우저를 쓰면 자연스러운 음성을 들을 수 있어요.'); return; }
  const cur = Voice.voiceFor('ko-KR');
  const idx = list.findIndex((v) => cur && v.name === cur.name);
  const next = list[(idx + 1) % list.length];
  S.save = { ...S.save, prefs: { ...S.save.prefs, voiceKo: next.name } };
  persist();
  const label = next.name.replace(/^(Microsoft|Google)\s*/i, '').replace(/\s*[-–(].*$/, '');
  const tip = list.some((v) => NATURAL_VOICE_RE.test(v.name)) ? '' : ' · 더 자연스러운 목소리는 Edge 브라우저에서 들을 수 있어요';
  toast(`🎙️ 선생님 목소리: ${label} (${list.indexOf(next) + 1}/${list.length})${tip}`);
  if (Voice.muted) toggleMute();
  teacherSay('안녕하세요! 오늘도 선생님이랑 즐겁게 공부해 볼까요?');
}
function toggleMute() {
  Voice.muted = !Voice.muted;
  S.save.muted = Voice.muted; persist();
  if (Voice.muted) Voice.stop();
  const btn = $('#muteBtn');
  if (btn) { btn.classList.toggle('muted', Voice.muted); btn.textContent = Voice.muted ? '🔇 소리 끔' : '🔊 소리 켬'; btn.setAttribute('aria-pressed', String(Voice.muted)); }
  if (S.onMute) S.onMute();
}
