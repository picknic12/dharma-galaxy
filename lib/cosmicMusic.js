// ============================================================
// @module    lib/cosmicMusic.js
// @layer     picnic game library — 생성형 우주 음악 777곡 (Tone.js 기반)
// @public    CosmicMusic.{COUNT, info(n), start(), play(n), next(el?), stop(), toggle(), setVolume(db), onChange(cb)}
// @doctrine  - 곡 = seed. 같은 번호 → 같은 곡 (작곡 규칙 결정론). 각 곡 40~58초.
//            - 장르 5: 명상(싱잉볼·드론) / 힐링(피아노 아르페지오) / 환타지(하프·현 패드) /
//              우주 여행(은하 열차의 리듬) / 클래식 변주(퍼블릭 도메인 작품의 화성·음형 모티프).
//            - 오행 선법: 木 리디안 · 火 믹솔리디안 · 土 이오니안 · 金 도리안 · 水 에올리안(+5음계)
//            - 외부 음원 0, 저작권 있는 곡의 선율 사용 0. 클래식은 작곡가 사후 70년 이상 경과 작품의 화성 진행·음형만 차용.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.CosmicMusic = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var global = typeof window !== "undefined" ? window : globalThis; // 브라우저에서도 Tone을 찾도록
  var COUNT = 777;
  var MODES = { "목": [0, 2, 4, 6, 7, 9, 11], "화": [0, 2, 4, 5, 7, 9, 10], "토": [0, 2, 4, 5, 7, 9, 11], "금": [0, 2, 3, 5, 7, 9, 10], "수": [0, 2, 3, 5, 7, 8, 10] };
  var ELS = ["목", "화", "토", "금", "수"];
  var GENRES = ["명상", "힐링", "환타지", "우주 여행", "클래식 변주"];
  var PROGS = [[0, 4, 5, 3], [0, 5, 3, 4], [5, 3, 0, 4], [0, 3, 0, 4], [0, 2, 3, 4], [3, 4, 2, 5], [0, 6, 5, 4], [0, 3, 5, 4]];
  var A = ["은하수", "별빛", "성운", "토성 고리", "달의 뒤편", "목성", "오리온", "안드로메다", "혜성", "북극성", "은하 열차", "별자리", "우주 정거장", "광년", "새벽 행성", "푸른 성운", "황금 성단", "고요한 궤도"];
  var B = ["자장가", "기도", "편지", "여행", "꿈", "정원", "춤", "노래", "기억", "명상", "회상", "빛", "숨결", "약속", "귀향", "산책", "환상곡", "소야곡"];
  // 퍼블릭 도메인 모티프: [제목, 근음 진행(반음, 장조 기준), 음형 종류]
  var CLASSICS = [
    ["파헬벨 카논 변주", [0, 7, 9, 4, 5, 0, 5, 7], "canon", 0],
    ["바흐 평균율 전주곡 C장조 모티프", [0, 2, 7, 0, 9, 2, 7, 0], "bach", 0],
    ["사티풍 짐노페디 변주", [7, 2, 7, 2, 7, 2, 7, 2], "satie", 1],
    ["베토벤 월광 1악장 음형 변주", [0, 0, 9, 7, 0, 0, 9, 7], "moon", 2],
    ["드뷔시풍 달빛 변주", [5, 0, 5, 0, 2, 7, 0, 0], "float", 0],
    ["그리그 아침 기분 모티프 변주", [0, 7, 0, 7, 5, 7, 0, 0], "morning", 0]
  ];
  function rngOf(n) { var s = (n * 2654435761) >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; }
  function info(n) {
    n = ((n - 1) % COUNT + COUNT) % COUNT + 1;
    var r = rngOf(n), el = ELS[n % 5], genre = GENRES[Math.floor(r() * 5)];
    var title = A[Math.floor(r() * A.length)] + "의 " + B[Math.floor(r() * B.length)];
    var cl = null;
    if (genre === "클래식 변주") { cl = CLASSICS[n % CLASSICS.length]; title = cl[0]; }
    return { n: n, el: el, genre: genre, title: title, classic: cl, bpm: genre === "명상" ? 54 + Math.floor(r() * 10) : 62 + Math.floor(r() * 22), root: 46 + Math.floor(r() * 8), prog: PROGS[Math.floor(r() * PROGS.length)], bars: 12 + Math.floor(r() * 5) };
  }
  var T = null, inst = null, playing = false, cur = 0, cbs = [], timer = null, vol = -14;
  function midi(m) { return T.Frequency(m, "midi").toNote(); }
  function build() {
    T = global.Tone; if (!T) return false; if (inst) return true;
    var lim = new T.Limiter(-2).toDestination();
    var master = new T.Volume(vol).connect(lim);
    var rev = new T.Reverb({ decay: 9, wet: .45 }).connect(master);
    var dly = new T.FeedbackDelay("8n.", .32).connect(rev); dly.wet.value = .28;
    var cho = new T.Chorus(1.2, 3.5, .6).connect(rev).start();
    inst = {
      master: master,
      pad: new T.PolySynth(T.Synth, { oscillator: { type: "fatsine", count: 3, spread: 22 }, envelope: { attack: 2.2, decay: 1, sustain: .7, release: 4.5 }, volume: -16 }).connect(cho),
      bell: new T.PolySynth(T.FMSynth, { harmonicity: 3.01, modulationIndex: 6, envelope: { attack: .005, decay: 1.6, sustain: 0, release: 1.8 }, modulationEnvelope: { attack: .005, decay: .4, sustain: 0, release: .5 }, volume: -15 }).connect(dly),
      piano: new T.PolySynth(T.Synth, { oscillator: { type: "triangle" }, envelope: { attack: .004, decay: 1.4, sustain: .08, release: 1.6 }, volume: -11 }).connect(rev),
      harp: new T.PolySynth(T.Synth, { oscillator: { type: "sine" }, envelope: { attack: .002, decay: .9, sustain: 0, release: 1.2 }, volume: -10 }).connect(dly),
      bass: new T.MonoSynth({ oscillator: { type: "sine" }, envelope: { attack: 1, decay: 1, sustain: .8, release: 3 }, filterEnvelope: { attack: 1, baseFrequency: 120, octaves: 1 }, volume: -15 }).connect(rev),
      bowl: new T.FMSynth({ harmonicity: 2.76, modulationIndex: 3, envelope: { attack: .01, decay: 6, sustain: 0, release: 6 }, volume: -18 }).connect(rev),
      train: new T.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: .005, decay: .08, sustain: 0 }, volume: -32 }).connect(master)
    };
    return true;
  }
  function chord(scale, root, deg, n) { var out = []; for (var k = 0; k < (n || 4); k++) { var d = deg + k * 2; out.push(root + scale[d % 7] + 12 * Math.floor(d / 7)); } return out; }
  function schedule(I) {
    var r = rngOf(I.n * 7 + 3), sc = MODES[I.el], beat = 60 / I.bpm, bar = beat * 4, now = T.now() + .15, ev = [];
    var root = I.root, total = I.bars * bar;
    function at(t, f) { ev.push(T.Transport.schedule(function (time) { f(time); }, t)); }
    for (var b = 0; b < I.bars; b++) {
      var t0 = b * bar, ch;
      if (I.classic) { var cr = root + I.classic[1][b % 8]; var minor = I.classic[3] === 2 && b % 4 !== 2; ch = [cr, cr + (minor ? 3 : 4), cr + 7, cr + 12]; }
      else ch = chord(sc, root, I.prog[b % I.prog.length], 4);
      (function (ch, t0, b) {
        if (b % 2 === 0 || I.genre === "명상") at(t0, function (tm) { inst.pad.triggerAttackRelease(ch.slice(0, 3).map(function (m) { return midi(m + 12); }), bar * (I.genre === "명상" ? 1 : 2) * .95, tm, .5); });
        at(t0, function (tm) { inst.bass.triggerAttackRelease(midi(ch[0] - 12), bar * .9, tm, .6); });
        var g = I.classic ? I.classic[2] : I.genre;
        if (g === "명상") { if (b % 2 === 0) at(t0 + beat, function (tm) { inst.bowl.triggerAttackRelease(midi(ch[0] + 24), 5, tm, .5); }); }
        else if (g === "힐링" || g === "bach" || g === "moon" || g === "canon") {
          var pat = g === "bach" ? [0, 1, 2, 3, 2, 3, 2, 3] : g === "moon" ? [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2] : [0, 2, 1, 3, 2, 1, 3, 2];
          var step = bar / pat.length; pat.forEach(function (k, j) { at(t0 + j * step, function (tm) { inst.piano.triggerAttackRelease(midi(ch[k % 4] + 12 + (g === "bach" && k > 1 ? 12 : 0)), step * 2.2, tm, .45 + r() * .15); }); });
        } else if (g === "환타지" || g === "float" || g === "satie") {
          [0, 1, 2, 3, 2, 1].forEach(function (k, j) { at(t0 + j * bar / 6, function (tm) { inst.harp.triggerAttackRelease(midi(ch[k % 4] + 24), 1.2, tm, .4); }); });
        } else {
          for (var j = 0; j < 8; j++) (function (j) { at(t0 + j * beat / 2, function (tm) { inst.train.triggerAttackRelease(.05, tm, j % 2 ? .25 : .5); if (j % 4 === 0) inst.harp.triggerAttackRelease(midi(ch[(j / 4) % 3] + 24), .5, tm, .3); }); })(j);
        }
        // 선율: 음계 위 무작위 산책 + 쉼표 (별빛 음상)
        if (b >= 2 && b < I.bars - 1) {
          var deg = 7 + Math.floor(r() * 5);
          for (var q = 0; q < 4; q++) {
            if (r() < .38) continue;
            deg += Math.floor(r() * 5) - 2; deg = Math.max(5, Math.min(14, deg));
            (function (m, q) { at(t0 + q * beat + (r() < .3 ? beat / 2 : 0), function (tm) { inst.bell.triggerAttackRelease(midi(m), beat * 1.6, tm, .35 + r() * .2); }); })(root + 12 + sc[deg % 7] + 12 * Math.floor(deg / 7), q);
          }
        }
      })(ch, t0, b);
    }
    return { ev: ev, len: total + 3.5 };
  }
  function play(n) {
    if (!build()) return null;
    stopInner();
    var I = info(n || 1); cur = I.n;
    T.Transport.bpm.value = I.bpm;
    var s = schedule(I);
    T.Transport.start("+0.1");
    playing = true;
    clearTimeout(timer); timer = setTimeout(function () { if (playing) next(); }, s.len * 1000);
    cbs.forEach(function (f) { try { f(I); } catch (e) {} });
    return I;
  }
  var mood = null, genre = null;
  function next(el) {
    if (el) mood = el;
    var n = cur, tries = 0;
    do { n = 1 + Math.floor(Math.random() * COUNT); tries++; } while (((genre && info(n).genre !== genre) || (mood && info(n).el !== mood && tries < 60)) && tries < 400);
    return play(n);
  }
  function stopInner() { if (!T) return; T.Transport.stop(); T.Transport.cancel(0); if (inst) { inst.pad.releaseAll(); inst.piano.releaseAll(); inst.bell.releaseAll(); inst.harp.releaseAll(); } }
  function stop() { playing = false; clearTimeout(timer); stopInner(); }
  function start() { if (!global.Tone) return null; var p = global.Tone.start(); try { if (global.Tone.context.state !== "running") global.Tone.context.resume(); } catch (e) {} return Promise.resolve(p).then(function () { return playing ? null : next(mood); }); }
  function toggle() { if (playing) { stop(); return false; } start(); return true; }
  function setVolume(db) { vol = db; if (inst) inst.master.volume.value = db; }
  return { name: "cosmicMusic", version: "1.0.0", COUNT: COUNT, info: info, play: play, next: next, stop: stop, start: start, toggle: toggle, setVolume: setVolume, onChange: function (f) { cbs.push(f); }, isPlaying: function () { return playing; }, setMood: function (el) { mood = el; }, setGenre: function (g) { genre = g || null; } };
}));
