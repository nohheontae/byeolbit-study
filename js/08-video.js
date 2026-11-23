/* 별빛 학습지 — 개념 애니메이션 영상 (Canvas) */
'use strict';

/* =====================================================================
   7. 개념 애니메이션 영상 (Canvas)
   ===================================================================== */
const VW = 960, VH = 540, BX = 330, BY = 40, BW = 600, BH = 390, CX = BX + BW / 2, CY = BY + BH / 2;
const FONT = '"Pretendard","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const sidekickImg = new Image();
sidekickImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 136 136">${monsterSVG(MONSTERS[0])}</svg>`);

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fitFont(ctx, text, maxW, size, weight = '800') {
  let s = size;
  for (;;) { ctx.font = `${weight} ${s}px ${FONT}`; if (ctx.measureText(text).width <= maxW || s <= 14) break; s -= 2; }
  return s;
}
function ctxStar(ctx, cx, cy, R, r, color) { ctx.fillStyle = color; ctx.fill(new Path2D(starPath(cx, cy, R, r))); }
function drawRoom(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#FFF4D8'); g.addColorStop(1, '#FFE2B5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = '#F6C98A'; ctx.fillRect(0, 470, VW, 70);
  for (let i = 0; i < 5; i++) ctxStar(ctx, 40 + i * 60, 40 + (i % 2) * 26, 9 + Math.sin(t * 2 + i) * 2, 4, 'rgba(255,197,49,.55)');
  ctx.fillStyle = '#A86B3C'; rr(ctx, BX - 14, BY - 14, BW + 28, BH + 28, 20); ctx.fill();
  ctx.fillStyle = '#2F6B4F'; rr(ctx, BX, BY, BW, BH, 12); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(BX + 80 + i * 95, BY + 60 + (i % 3) * 110, 60, 14, 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#8B5E34'; ctx.fillRect(BX + 40, BY + BH + 8, BW - 80, 10);
  ctx.fillStyle = '#fff'; ctx.fillRect(BX + 80, BY + BH + 2, 30, 7); ctx.fillStyle = '#FFE27A'; ctx.fillRect(BX + 120, BY + BH + 2, 24, 7);
}
function drawTeacher(ctx, t, talking) {
  const x = 165, y = 300 + Math.sin(t * 2.2) * 4;
  ctx.save();
  ctx.fillStyle = 'rgba(60,40,20,.15)'; ctx.beginPath(); ctx.ellipse(x, 512, 90, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FF8FAB'; ctx.beginPath(); ctx.moveTo(x - 80, y + 210); ctx.quadraticCurveTo(x - 78, y + 76, x, y + 70); ctx.quadraticCurveTo(x + 78, y + 76, x + 80, y + 210); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 20, y + 72); ctx.lineTo(x, y + 100); ctx.lineTo(x + 20, y + 72); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(x + 52, y + 110); ctx.rotate(-0.75 + Math.sin(t * 2.6) * 0.18);
  ctx.strokeStyle = '#FF8FAB'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.stroke();
  ctx.fillStyle = '#FFE1C9'; ctx.beginPath(); ctx.arc(76, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8B5E34'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(80, -4); ctx.lineTo(150, -30); ctx.stroke();
  ctxStar(ctx, 152, -31, 12, 5, '#FFC531');
  ctx.restore();
  ctx.fillStyle = '#5B3A29'; ctx.beginPath(); ctx.arc(x, y - 72, 28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFE1C9'; ctx.beginPath(); ctx.arc(x, y - 8, 64, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5B3A29'; ctx.beginPath(); ctx.moveTo(x - 66, y - 4); ctx.quadraticCurveTo(x - 64, y - 78, x, y - 78); ctx.quadraticCurveTo(x + 64, y - 78, x + 66, y - 4); ctx.quadraticCurveTo(x + 40, y - 48, x, y - 44); ctx.quadraticCurveTo(x - 40, y - 48, x - 66, y - 4); ctx.fill();
  ctxStar(ctx, x + 46, y - 58, 12, 5, '#FFC531');
  const blink = (t % 3.4) < 0.14;
  [-22, 22].forEach((dx) => {
    if (blink) { ctx.strokeStyle = '#2B2F4A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + dx - 6, y); ctx.lineTo(x + dx + 6, y); ctx.stroke(); }
    else { ctx.fillStyle = '#2B2F4A'; ctx.beginPath(); ctx.ellipse(x + dx, y, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + dx + 2, y - 3, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#7A5CFF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + dx, y, 17, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.stroke();
  ctx.fillStyle = 'rgba(255,143,171,.6)'; ctx.beginPath(); ctx.ellipse(x - 40, y + 20, 10, 6, 0, 0, Math.PI * 2); ctx.ellipse(x + 40, y + 20, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
  if (talking) { const h = 4 + Math.abs(Math.sin(t * 13)) * 9; ctx.fillStyle = '#C2410C'; ctx.beginPath(); ctx.ellipse(x, y + 32, 10, h, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = '#C2410C'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y + 22, 13, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  ctx.restore();
}
function drawSidekick(ctx, t) {
  if (!sidekickImg.complete || !sidekickImg.naturalWidth) return;
  const hop = Math.abs(Math.sin(t * 3)) * 26;
  ctx.fillStyle = 'rgba(60,40,20,.12)'; ctx.beginPath(); ctx.ellipse(285, 508, 34 - hop * 0.4, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(sidekickImg, 235, 408 - hop, 100, 100);
}
function drawVisual(ctx, v, p, lt) {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chalk = '#FFFFFF', yellow = '#FFE27A';
  switch (v.t) {
    case 'title': {
      const s = backOut(clamp(lt / 0.7));
      for (let i = 0; i < 6; i++) { const a = lt * 0.8 + i * Math.PI / 3; ctxStar(ctx, CX + Math.cos(a) * 240, CY + Math.sin(a) * 130, 13, 5, 'rgba(255,246,176,.8)'); }
      ctx.translate(CX, CY); ctx.scale(s, s);
      fitFont(ctx, v.text, BW - 80, 62, '900');
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillText(v.text, 3, 4); ctx.fillStyle = yellow; ctx.fillText(v.text, 0, 0);
      break;
    }
    case 'merge': case 'split': {
      const isM = v.t === 'merge'; const a = v.a; const b = isM ? v.b : v.n - v.a; const n = a + b;
      const sz = Math.min(54, (BW - 80) / (n + 1)); const m0 = ease(clamp((p - 0.3) / 0.3)); const m = isM ? m0 : 1 - m0;
      ctx.font = `${Math.round(sz * 0.85)}px ${EMOJI_FONT}`;
      const leftC = CX - 140, rightC = CX + 140;
      if (m < 0.95) {
        ctx.globalAlpha = 1 - m; ctx.strokeStyle = yellow; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
        rr(ctx, leftC - (a * sz) / 2 - 10, CY - 60, a * sz + 20, 80, 16); ctx.stroke();
        rr(ctx, rightC - (b * sz) / 2 - 10, CY - 60, b * sz + 20, 80, 16); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      for (let i = 0; i < n; i++) {
        const tx = CX - ((n - 1) * sz) / 2 + i * sz;
        const ax = i < a ? leftC - ((a - 1) * sz) / 2 + i * sz : rightC - ((b - 1) * sz) / 2 + (i - a) * sz;
        const pop = clamp((lt - i * 0.08) / 0.3);
        ctx.save(); ctx.translate(lerp(ax, tx, m), CY - 20 + Math.sin(lt * 4 + i) * 3); ctx.scale(pop, pop); ctx.fillText(v.e, 0, 0); ctx.restore();
      }
      const label = isM ? (p < 0.6 ? `${a}  와(과)  ${b}` : `${a} + ${b} = ${n}`) : (p < 0.6 ? `${n}` : `${n} → ${a}, ${b}`);
      fitFont(ctx, label, BW - 60, 46, '900'); ctx.fillStyle = chalk; ctx.fillText(label, CX, CY + 110);
      break;
    }
    case 'word': {
      const s = backOut(clamp(lt / 0.6));
      ctx.save(); ctx.translate(CX, CY - (v.sub ? 40 : 0)); ctx.scale(s, s);
      fitFont(ctx, v.text, BW - 60, 66, '900'); ctx.fillStyle = chalk; ctx.fillText(v.text, 0, 0); ctx.restore();
      if (v.sub) { ctx.globalAlpha = clamp((p - 0.3) / 0.15); fitFont(ctx, v.sub, BW - 60, 38, '700'); ctx.fillStyle = yellow; ctx.fillText(v.sub, CX, CY + 70); ctx.globalAlpha = 1; }
      break;
    }
    case 'list': {
      const n = v.items.length, lh = Math.min(74, (BH - 60) / n), y0 = CY - ((n - 1) * lh) / 2;
      v.items.forEach((it, i) => {
        const a = clamp((p - (i * 0.6) / n) / 0.12); if (a <= 0) return;
        ctx.globalAlpha = a; fitFont(ctx, it, BW - 80, Math.min(46, lh * 0.7), '800');
        ctx.fillStyle = i % 2 ? yellow : chalk; ctx.fillText(it, CX + (1 - a) * 40, y0 + i * lh);
      });
      ctx.globalAlpha = 1; break;
    }
    case 'groups': {
      const { size, count, e } = v; const shown = Math.min(count, Math.floor(clamp(p / 0.6) * count) + 1);
      const cw = 46, bw = size * cw + 20, gap = 24, tot = count * bw + (count - 1) * gap, k = Math.min(1, (BW - 40) / tot);
      ctx.save(); ctx.translate(CX, CY - 20); ctx.scale(k, k);
      for (let gi = 0; gi < shown; gi++) {
        const x0 = -tot / 2 + gi * (bw + gap);
        ctx.strokeStyle = yellow; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); rr(ctx, x0, -40, bw, 80, 16); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `38px ${EMOJI_FONT}`; for (let j = 0; j < size; j++) ctx.fillText(e, x0 + 10 + cw / 2 + j * cw, 2);
      }
      ctx.restore();
      if (p > 0.65 && v.label) { fitFont(ctx, v.label, BW - 60, 48, '900'); ctx.fillStyle = chalk; ctx.fillText(v.label, CX, CY + 110); }
      break;
    }
    case 'frac': {
      const { n, d } = v, r = 120, px = CX - 120, filled = Math.round(clamp((p - 0.1) / 0.5) * n);
      for (let i = 0; i < d; i++) {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / d, a1 = a0 + (2 * Math.PI) / d;
        ctx.beginPath(); ctx.moveTo(px, CY); ctx.arc(px, CY, r, a0, a1); ctx.closePath();
        ctx.fillStyle = i < filled ? '#FFC531' : 'rgba(255,255,255,.12)'; ctx.fill(); ctx.strokeStyle = chalk; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.fillStyle = chalk; ctx.font = `900 72px ${FONT}`; ctx.fillText(String(n), CX + 150, CY - 50); ctx.fillText(String(d), CX + 150, CY + 55);
      ctx.fillRect(CX + 105, CY - 4, 90, 8);
      ctx.fillStyle = yellow; ctx.font = `800 30px ${FONT}`; ctx.fillText(`${d}분의 ${n}`, CX + 150, CY + 140);
      break;
    }
    case 'angle': {
      const vx = CX - 170, vy = CY + 110, cur = v.deg * ease(clamp(p / 0.6)), rad = (-cur * Math.PI) / 180;
      ctx.strokeStyle = chalk; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + 300, vy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + 260 * Math.cos(rad), vy + 260 * Math.sin(rad)); ctx.stroke();
      ctx.strokeStyle = yellow; ctx.lineWidth = 4;
      if (Math.abs(cur - 90) < 1) { ctx.strokeRect(vx, vy - 40, 40, 40); } else { ctx.beginPath(); ctx.arc(vx, vy, 60, 0, rad, true); ctx.stroke(); }
      ctx.fillStyle = yellow; ctx.font = `900 46px ${FONT}`; ctx.fillText(`${Math.round(cur)}°`, vx + 130, vy - 90);
      if (v.name && p > 0.6) { ctx.fillStyle = chalk; ctx.fillText(v.name, CX + 150, CY - 110); }
      break;
    }
    case 'grid': {
      const { w, h } = v, c = 56, gx = CX - (w * c) / 2, gy = CY - (h * c) / 2 - 30, k = Math.floor(clamp(p / 0.65) * w * h);
      for (let i = 0; i < w * h; i++) {
        const x = gx + (i % w) * c, y = gy + Math.floor(i / w) * c;
        ctx.fillStyle = i < k ? '#FFC531' : 'rgba(255,255,255,.1)'; ctx.fillRect(x + 2, y + 2, c - 4, c - 4);
        ctx.strokeStyle = chalk; ctx.lineWidth = 2; ctx.strokeRect(x, y, c, c);
      }
      if (p > 0.65) { ctx.fillStyle = chalk; ctx.font = `900 44px ${FONT}`; ctx.fillText(`${w} × ${h} = ${w * h}`, CX, gy + h * c + 50); }
      break;
    }
    case 'pair': {
      const e1 = ease(clamp(lt / 0.6));
      [[v.l, lerp(BX - 200, CX - 145, e1)], [v.r, lerp(BX + BW + 200, CX + 145, e1)]].forEach(([txt, x], i) => {
        ctx.fillStyle = i ? '#E7FBF3' : '#FFF7D6'; rr(ctx, x - 120, CY - 60, 240, 120, 22); ctx.fill();
        fitFont(ctx, txt, 210, 40, '900'); ctx.fillStyle = '#2B2F4A'; ctx.fillText(txt, x, CY);
      });
      ctx.globalAlpha = clamp((p - 0.3) / 0.2); ctx.fillStyle = yellow; ctx.font = `900 54px ${FONT}`; ctx.fillText('↔', CX, CY); ctx.globalAlpha = 1;
      break;
    }
    default: break;
  }
  ctx.restore();
}

function renderVideo() {
  const L = S.lesson, sj = SUBJECTS[L.subj];
  const scenes = [
    { say: `안녕! ${L.grade}학년 ${sj.name} 시간이야. 오늘은 '${L.unit.title}'에 대해 함께 알아볼 거야!`, v: { t: 'title', text: L.unit.title } },
    ...L.unit.sc.map(([say, v]) => ({ say, v })),
    { say: '잘 봤어요! 이제 학습지 문제를 풀어 볼까? 어려우면 선생님 힌트 버튼을 눌러 줘!', v: { t: 'title', text: '문제 풀러 가자! ✏️' } },
  ];
  let total = 0;
  scenes.forEach((s) => { s.start = total; s.dur = Math.max(4.5, speechNormalize(s.say).length * 0.16 + 1.2); total += s.dur; });

  setScreen(`<div class="wrap">${lessonTop(0)}
    <div class="player card">
      <div class="screen">
        <canvas id="vcv" width="${VW}" height="${VH}" role="img" aria-label="개념 설명 애니메이션"></canvas>
        <div class="vend" id="vend" hidden><div class="vend-box"><div class="vend-emo">🎉</div><b>영상을 다 봤어요!</b>
          <button class="bigbtn" data-v="next">✏️ 학습지 풀러 가기</button><button class="ibtn soft" data-v="replay">↺ 다시 보기</button></div></div>
      </div>
      <div class="cap" id="vcap" aria-live="polite"></div>
      <div class="ctrls">
        <button class="ibtn play" id="vplay" aria-label="재생">▶</button>
        <button class="ibtn soft" data-v="replay" aria-label="처음부터 다시 보기">↺</button>
        <div class="track" id="vtrack" role="slider" tabindex="0" aria-label="영상 위치" aria-valuemin="0" aria-valuemax="${Math.round(total)}" aria-valuenow="0">
          <div class="fill" id="vfill"></div>${scenes.slice(1).map((s) => `<i class="tick" style="left:${(s.start / total) * 100}%"></i>`).join('')}<div class="knob" id="vknob"></div>
        </div>
        <span class="vtime" id="vtime">0:00 / ${fmt(total)}</span>
        <button class="ibtn soft" data-v="next">건너뛰기 ⏭</button>
      </div>
    </div></div>`);

  const ctx = $('#vcv').getContext('2d');
  let time = 0, playing = false, cur = -1, hold = 0, ended = false, last = performance.now(), raf = 0;
  const sceneIdx = (t) => { for (let i = 0; i < scenes.length; i++) if (t < scenes[i].start + scenes[i].dur) return i; return scenes.length - 1; };
  const enter = (i, speak) => { cur = i; hold = 0; $('#vcap').textContent = scenes[i].say; if (speak) Voice.say(scenes[i].say); };
  const syncBtn = () => { const b = $('#vplay'); b.textContent = playing ? '⏸' : '▶'; b.setAttribute('aria-label', playing ? '일시정지' : '재생'); };
  const play = () => { if (ended) { time = 0; ended = false; $('#vend').hidden = true; } playing = true; enter(sceneIdx(time), true); syncBtn(); };
  const pause = () => { playing = false; Voice.stop(); syncBtn(); };
  const seek = (t) => { time = clamp(t, 0, total - 0.01); ended = false; $('#vend').hidden = true; enter(sceneIdx(time), playing); };
  const finish = () => { playing = false; ended = true; time = total; $('#vend').hidden = false; syncBtn(); };
  const ui = () => {
    const f = (time / total) * 100;
    $('#vfill').style.width = f + '%'; $('#vknob').style.left = f + '%';
    $('#vtime').textContent = `${fmt(time)} / ${fmt(total)}`; $('#vtrack').setAttribute('aria-valuenow', String(Math.round(time)));
  };
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing && !isOverlayOpen()) { // 도감·오답노트·리포트가 열려 있으면 영상 시간을 멈춤
      const s = scenes[cur], end = s.start + s.dur;
      let nt = time + dt;
      if (nt >= end && Voice.speaking && hold < 6) { hold += dt; nt = end - 0.001; } // 음성이 끝날 때까지 장면 유지
      time = nt;
      if (time >= total) finish(); else { const i = sceneIdx(time); if (i !== cur) enter(i, true); }
    }
    const s = scenes[Math.max(0, cur)], lt = time - s.start, gt = now / 1000;
    drawRoom(ctx, gt); drawVisual(ctx, s.v, clamp(lt / s.dur), lt);
    drawTeacher(ctx, gt, playing && (Voice.speaking || Voice.muted || !Voice.ok)); drawSidekick(ctx, gt);
    ui(); raf = requestAnimationFrame(frame);
  };
  onCleanup(() => cancelAnimationFrame(raf));
  S.onMute = () => { if (playing && !Voice.muted) Voice.say(scenes[cur].say); };
  S.onModalClose = S.onMute; // 도감을 닫으면 현재 장면 내레이션을 다시 들려줌

  $('#vplay').addEventListener('click', () => (playing ? pause() : play()));
  $('.player').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    if (b.dataset.v === 'replay') { ended = false; $('#vend').hidden = true; time = 0; playing = true; enter(0, true); syncBtn(); }
    if (b.dataset.v === 'next') renderWorksheet();
  });
  const track = $('#vtrack'); let dragging = false;
  const seekFromEvent = (e) => { const r = track.getBoundingClientRect(); seek(clamp((e.clientX - r.left) / r.width) * total); };
  track.addEventListener('pointerdown', (e) => { dragging = true; track.setPointerCapture(e.pointerId); seekFromEvent(e); });
  track.addEventListener('pointermove', (e) => { if (dragging) seekFromEvent(e); });
  track.addEventListener('pointerup', () => { dragging = false; });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { seek(time + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { seek(time - 5); e.preventDefault(); }
    if (e.key === ' ') { (playing ? pause : play)(); e.preventDefault(); }
  });
  enter(0, false); raf = requestAnimationFrame(frame); play();
}
