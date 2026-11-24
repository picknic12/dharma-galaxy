// ============================================================
// @module    lib/battleMusic.js
// @layer     picnic game library — 생성형 전투 음악 (Tone.js 기반)
// @public    BattleMusic.{start(opt), intensity(x), stop(outcome), isPlaying()}
// @doctrine  - 부드러움과 강렬함의 공존: 따뜻한 현 패드(부드러움) 위에 16분 오스티나토·북·금관 동기(강렬함)를 층으로 쌓는다.
//            - 긴장도(0~1)에 따라 층이 하나씩 들어오고 음량은 천천히 오른다(급격한 전환 없음).
//            - 다양성: 오행 선법 5 × 리듬 6 × 화성 진행 8 × 템포 × 동기(seed) → 전투마다 다른 곡.
//            - 수호자(보스)전: 낮은 조성, 타이코 북, 합창 패드, 더 빠른 템포.
//            - 외부 음원 0, 기존 곡의 선율 사용 0.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.BattleMusic = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var global = typeof window !== "undefined" ? window : globalThis; // 브라우저에서도 Tone을 찾도록
  var MODES = { "목": [0, 2, 4, 6, 7, 9, 11], "화": [0, 2, 4, 5, 7, 9, 10], "토": [0, 2, 3, 5, 7, 8, 10], "금": [0, 2, 3, 5, 7, 9, 10], "수": [0, 1, 3, 5, 7, 8, 10] };
  var PROGS = [[0, 5, 3, 4], [0, 3, 5, 4], [0, 6, 5, 4], [5, 3, 0, 4], [0, 4, 5, 3], [0, 2, 5, 4], [0, 5, 6, 4], [3, 4, 0, 0]];
  // 리듬: 16스텝 [킥, 스네어, 하이햇 밀도]
  var RHY = [
    { k: [0, 8], s: [4, 12], h: 2 }, { k: [0, 6, 8], s: [4, 12], h: 2 }, { k: [0, 3, 8, 11], s: [4, 12], h: 1 },
    { k: [0, 10], s: [4, 12, 14], h: 2 }, { k: [0, 7, 8], s: [12], h: 4 }, { k: [0, 2, 8, 10], s: [4, 12], h: 1 }];
  var T = null, I = null, st = null, rep = null, lvl = 0, target = 0, playing = false;
  function rngOf(n) { var s = (n * 2654435761) >>> 0 || 7; return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; }
  function midi(m) { return T.Frequency(m, "midi").toNote(); }
  function build() {
    T = global.Tone; if (!T) return false; if (I) return true;
    var lim = new T.Limiter(-1.5).toDestination();
    var master = new T.Volume(-12).connect(lim);
    var rev = new T.Reverb({ decay: 4.5, wet: .3 }).connect(master);
    var comp = new T.Compressor(-20, 3).connect(master);
    I = {
      master: master,
      strings: new T.PolySynth(T.Synth, { oscillator: { type: "fatsawtooth", count: 3, spread: 28 }, envelope: { attack: .9, decay: .6, sustain: .75, release: 2.4 }, volume: -24 }).connect(new T.Filter(1300, "lowpass").connect(rev)),
      choir: new T.PolySynth(T.AMSynth, { harmonicity: 1.5, envelope: { attack: 1.4, decay: .5, sustain: .8, release: 3 }, volume: -26 }).connect(rev),
      osti: new T.PolySynth(T.Synth, { oscillator: { type: "square8" }, envelope: { attack: .002, decay: .12, sustain: 0, release: .1 }, volume: -27 }).connect(new T.Filter(2400, "lowpass").connect(rev)),
      brass: new T.PolySynth(T.FMSynth, { harmonicity: 1, modulationIndex: 7, oscillator: { type: "sine" }, envelope: { attack: .06, decay: .3, sustain: .6, release: .8 }, modulation: { type: "square" }, modulationEnvelope: { attack: .1, decay: .2, sustain: .4, release: .5 }, volume: -21 }).connect(rev),
      bass: new T.MonoSynth({ oscillator: { type: "fmsawtooth" }, filter: { Q: 2, type: "lowpass" }, filterEnvelope: { attack: .01, decay: .2, sustain: .3, baseFrequency: 90, octaves: 2.6 }, envelope: { attack: .01, decay: .25, sustain: .5, release: .3 }, volume: -17 }).connect(comp),
      kick: new T.MembraneSynth({ pitchDecay: .05, octaves: 6, envelope: { attack: .001, decay: .35, sustain: 0 }, volume: -10 }).connect(comp),
      taiko: new T.MembraneSynth({ pitchDecay: .12, octaves: 3, envelope: { attack: .002, decay: .7, sustain: 0 }, volume: -11 }).connect(rev),
      snare: new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: .001, decay: .16, sustain: 0 }, volume: -22 }).connect(new T.Filter(1800, "highpass").connect(comp)),
      hat: new T.MetalSynth({ envelope: { attack: .001, decay: .05, release: .01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -36 }).connect(master)
    };
    return true;
  }
  function chord(sc, root, deg) { var o = []; for (var k = 0; k < 4; k++) { var d = deg + k * 2; o.push(root + sc[d % 7] + 12 * Math.floor(d / 7)); } return o; }
  function start(opt) {
    if (!build()) return false; stop(); opt = opt || {};
    var seed = opt.seed || Math.floor(Math.random() * 1e6), r = rngOf(seed), el = opt.el || "화", boss = !!opt.boss;
    var sc = MODES[el], prog = PROGS[Math.floor(r() * PROGS.length)], rh = RHY[Math.floor(r() * RHY.length)];
    var root = (boss ? 38 : 41) + Math.floor(r() * 5), bpm = boss ? 138 + Math.floor(r() * 10) : 108 + Math.floor(r() * 22);
    var motif = []; for (var k = 0; k < 8; k++) motif.push(r() < .22 ? null : Math.floor(r() * 7) + (k % 4 === 0 ? 0 : Math.floor(r() * 3) - 1));
    var ostiPat = [[0, 1, 2, 1], [0, 2, 1, 2], [0, 1, 2, 3], [0, 0, 2, 1]][Math.floor(r() * 4)];
    st = { sc: sc, prog: prog, rh: rh, root: root, motif: motif, ostiPat: ostiPat, boss: boss, step: 0, r: r };
    lvl = .15; target = opt.intensity == null ? .45 : opt.intensity;
    T.Transport.stop(); T.Transport.cancel(0); T.Transport.bpm.value = bpm;
    I.master.volume.value = -30; I.master.volume.rampTo(-12, 2.5);
    rep = T.Transport.scheduleRepeat(tick, "16n", 0);
    T.Transport.start("+0.05"); playing = true; return true;
  }
  function tick(time) {
    var s = st.step++, bar = Math.floor(s / 16), q = s % 16, ch = chord(st.sc, st.root, st.prog[bar % 4]);
    lvl += (target - lvl) * .02; // 부드러운 고조
    var L = lvl, v = .5 + L * .4;
    if (q === 0) { I.strings.triggerAttackRelease(ch.slice(0, 3).map(function (m) { return midi(m + 12); }), "1m", time, .45 + L * .3); I.bass.triggerAttackRelease(midi(ch[0] - 12), "8n", time, .8); }
    if (q === 8 && L > .3) I.bass.triggerAttackRelease(midi(ch[(bar % 2) ? 2 : 0] - 12), "8n", time, .7);
    if (L > .55 && q === 0 && bar % 2 === 0) I.choir.triggerAttackRelease([midi(ch[0] + 24), midi(ch[2] + 24)], "2m", time, .4 + L * .3);
    // 오스티나토(16분) — 긴장도 0.3 이상
    if (L > .3 && (L > .6 || q % 2 === 0)) I.osti.triggerAttackRelease(midi(ch[st.ostiPat[q % 4]] + 12 + (q >= 8 && L > .75 ? 12 : 0)), "16n", time, .35 + L * .3);
    // 북
    if (st.rh.k.indexOf(q) >= 0) I.kick.triggerAttackRelease("C1", "8n", time, v);
    if (L > .25 && st.rh.s.indexOf(q) >= 0) I.snare.triggerAttackRelease("16n", time, .35 + L * .4);
    if (L > .4 && q % st.rh.h === 0) I.hat.triggerAttackRelease("32n", time, .2 + L * .25);
    if ((st.boss || L > .8) && (q === 0 || q === 10) && bar % 2 === 1) I.taiko.triggerAttackRelease(midi(st.root - 12), "4n", time, .9);
    // 금관 동기 — 2마디 부르고 2마디 답한다
    if (L > .45 && q % 4 === 0 && bar % 4 < 3) { var k = (bar % 2) * 4 + q / 4, d = st.motif[k]; if (d != null) { var deg = d + (bar % 4 === 2 ? 2 : 0); I.brass.triggerAttackRelease(midi(st.root + 12 + st.sc[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7)), q === 12 ? "4n" : "8n", time, .45 + L * .35); } }
  }
  function intensity(x) { target = Math.max(0, Math.min(1, x)); }
  function stop(outcome) {
    if (!T || !I) return; if (rep != null) { T.Transport.clear(rep); rep = null; }
    var was = playing; playing = false; T.Transport.stop(); T.Transport.cancel(0);
    I.strings.releaseAll(); I.choir.releaseAll(); I.brass.releaseAll(); I.osti.releaseAll();
    if (was && outcome && st) { var now = T.now() + .05, ch = chord(st.sc, st.root, 0);
      if (outcome === "win") { [0, 2, 4].forEach(function (k, j) { I.brass.triggerAttackRelease(midi(st.root + 12 + st.sc[k]), j === 2 ? "2n" : "8n", now + j * .16, .7); }); I.strings.triggerAttackRelease(ch.map(function (m) { return midi(m + 12); }), 2.5, now + .3, .6); }
      else { I.strings.triggerAttackRelease([midi(st.root), midi(st.root + 3), midi(st.root + 7)], 2.5, now, .5); }
    }
  }
  return { name: "battleMusic", version: "1.0.0", start: start, intensity: intensity, stop: stop, isPlaying: function () { return playing; } };
}));
