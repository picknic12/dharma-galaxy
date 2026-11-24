// ============================================================
// @module    domain/dungeon/dungeonSfx.js
// @layer     browser sfx (던전 격파 효과음 — v0.1)
// @summary   WebAudio 합성 8비트 오락실 효과음. 외부 오디오 파일 0, 네트워크 0.
// @public    DungeonSfx.{unlock, pop(combo, fruit), boom, ding, step, win, dead, start(level)}
// @doctrine  - 브라우저 전용이지만 Node 부팅(스모크)에서 조용히 no-op — AudioContext 가드.
//            - 자동재생 정책: 첫 사용자 제스처(키/클릭)에서 unlock() 호출로 컨텍스트 활성화.
//            - 보글보글풍: 사각파 아르페지오·콤보마다 음정 상승(연타 쾌감), 강벽은 "띠~잉".
//            - 모든 효과음은 _sound(fn) 래퍼 경유 — 컨텍스트 확보 실패 시 no-op 게이트 단일화.
// ============================================================
(function (global, factory) {
  var api = factory(); // 단일 인스턴스 — Node(require)와 전역이 같은 객체를 본다
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.DungeonSfx = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";

  var _ctx = null;
  var _noiseBuf = null;

  function _AC() {
    var G = (typeof window !== "undefined") ? window : {};
    return G.AudioContext || G.webkitAudioContext || null;
  }
  function _get() {
    var AC = _AC();
    if (!AC) return null;
    if (!_ctx) {
      try { _ctx = new AC(); } catch (e) { return null; }
    }
    if (_ctx.state === "suspended") { try { _ctx.resume(); } catch (e) {} }
    return _ctx;
  }
  function unlock() { _get(); }

  // 공통 게이트: 컨텍스트 확보 실패(Node/미지원) 시 조용히 no-op.
  // 각 효과음은 (ctx, t, …인자)를 받는 순수 스케줄링 함수로 작성한다.
  function _sound(fn) {
    return function () {
      var ctx = _get();
      if (!ctx) return;
      var args = [ctx, ctx.currentTime];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      return fn.apply(null, args);
    };
  }

  // 단음: 파형·주파수(시작→끝 벤드)·길이·음량
  function _tone(ctx, t0, type, f0, f1, dur, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function _noise(ctx, t0, dur, vol, fc0, fc1) {
    if (!_noiseBuf) {
      var len = Math.floor(ctx.sampleRate * 0.5);
      _noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = _noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    var src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    src.buffer = _noiseBuf; src.loop = true;
    f.type = "lowpass";
    f.frequency.setValueAtTime(fc0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, fc1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  // 🍎 과일 수확 — 맛 계열 6종 × 과일 고유 음정 시드 = 100종이 전부 다른 소리
  //   family: 0아삭 / 1톡톡 / 2달콤 / 3사각 / 4뽀글 / 5띠링, seed: 과일 id(음정 지문)
  var pop = _sound(function (ctx, t, combo, family, seed) {
    var up = Math.pow(1.0595, Math.min(combo || 1, 14)); // 반음^콤보 (최대 14)
    var pv = 1 + ((((seed | 0) % 9) - 4) * 0.045);       // 과일별 고유 음정 지문 (±18%)
    var dt = pv * (1 + (Math.random() * 0.03 - 0.015));  // + 미세 생기
    var f = (typeof family === "number") ? ((family % 6) + 6) % 6 : Math.floor(Math.random() * 6);
    switch (f) {
      case 0: // 🍎 사과 — 아삭! 크고 청량한 크런치
        _tone(ctx, t, "square", 660 * up * dt, 660 * up * dt, 0.04, 0.17);
        _tone(ctx, t + 0.04, "square", 990 * up * dt, 990 * up * dt, 0.05, 0.15);
        _noise(ctx, t, 0.06, 0.14, 5200, 900);
        break;
      case 1: // 🍊 귤 — 톡! 톡! 과즙이 위로 튀는 두 방울
        _tone(ctx, t, "triangle", 523 * up * dt, 784 * up * dt, 0.06, 0.17);
        _tone(ctx, t + 0.07, "triangle", 659 * up * dt, 988 * up * dt, 0.06, 0.15);
        _noise(ctx, t + 0.02, 0.05, 0.06, 3000, 800);
        break;
      case 2: // 🍑 복숭아 — 달콤~ 부드럽게 미끄러지는 사인 글라이드
        _tone(ctx, t, "sine", 440 * up * dt, 660 * up * dt, 0.12, 0.20);
        _tone(ctx, t + 0.08, "sine", 880 * up * dt, 880 * up * dt, 0.09, 0.10);
        break;
      case 3: // 🍐 배 — 사각사각, 낮고 순한 크런치
        _tone(ctx, t, "triangle", 392 * up * dt, 392 * up * dt, 0.05, 0.18);
        _tone(ctx, t + 0.055, "triangle", 587 * up * dt, 587 * up * dt, 0.06, 0.15);
        _noise(ctx, t, 0.08, 0.08, 2400, 400);
        break;
      case 4: // 🍇 포도 — 뽀글뽀글, 알알이 터지는 4연속 방울
        [700, 850, 1000, 1150].forEach(function (fr, i) {
          _tone(ctx, t + i * 0.045, "square", fr * up * dt, fr * up * dt, 0.035, 0.12);
        });
        break;
      default: // 🍓 딸기 — 띠링♪ 귀엽고 반짝이는 차임
        _tone(ctx, t, "triangle", 1319 * up * dt, 1319 * up * dt, 0.05, 0.16);
        _tone(ctx, t + 0.055, "square", 1760 * up * dt, 1760 * up * dt, 0.07, 0.12);
        _tone(ctx, t + 0.12, "triangle", 2637 * up, 2637 * up, 0.06, 0.08);
    }
    if ((combo || 1) >= 3) { // 3연쇄부터 반짝이 보너스음
      _tone(ctx, t + 0.16, "square", 1046 * up, 1568 * up, 0.09, 0.12);
    }
    if ((combo || 1) >= 5) { // 5연쇄 "빠바밤!" 미니 팡파레
      _tone(ctx, t + 0.23, "square", 1318 * up, 1318 * up, 0.07, 0.14);
      _tone(ctx, t + 0.3, "square", 1568 * up, 2093 * up, 0.12, 0.14);
    }
  });

  // ✨ 큰 과일 합체 — 10개가 하나로! 도-레-미-솔 상승 + 팡
  var merge = _sound(function (ctx, t) {
    [523, 587, 659, 784].forEach(function (f, i) {
      _tone(ctx, t + i * 0.06, "square", f, f, 0.09, 0.15);
    });
    _tone(ctx, t + 0.26, "triangle", 1568, 2093, 0.18, 0.14);
    _noise(ctx, t + 0.26, 0.12, 0.08, 4000, 1200);
  });

  // 🎒 가방 가득 — 묵직한 "붕—" 거절음
  var bagFull = _sound(function (ctx, t) {
    _tone(ctx, t, "sawtooth", 160, 120, 0.18, 0.2);
    _tone(ctx, t + 0.2, "sawtooth", 130, 100, 0.2, 0.18);
  });

  // 💰 골드 — 짤랑
  var coin = _sound(function (ctx, t) {
    _tone(ctx, t, "square", 1976, 1976, 0.05, 0.14);
    _tone(ctx, t + 0.06, "square", 2637, 2637, 0.1, 0.12);
  });

  // 🎪 던전 입장 멜로디 — 게임판 테마별 3가지 짧은 모티프
  var start = _sound(function (ctx, t, level) {
    var motifs = [
      [523, 659, 784, 1046],  // 1판 분홍-주황: 장조 도약
      [587, 784, 880, 1175],  // 2판 비취: 오묘한 5음계
      [659, 880, 1046, 1319]  // 3판 연하늘-연노랑: 높이 나는 느낌
    ];
    var m = motifs[(level || 0) % 3];
    m.forEach(function (fr, i) {
      _tone(ctx, t + i * 0.09, "square", fr, fr, 0.11, 0.13);
      _tone(ctx, t + i * 0.09, "triangle", fr * 2, fr * 2, 0.11, 0.05);
    });
  });

  // 💥 폭탄 폭발 — 노이즈 스윕 + 저음 쿵 + 만화적 "삐용" + 파편 반짝이 (심각하지 않게)
  var boom = _sound(function (ctx, t) {
    _noise(ctx, t, 0.32, 0.32, 2500, 60);
    _tone(ctx, t, "sine", 130, 35, 0.28, 0.45);
    _tone(ctx, t + 0.14, "sawtooth", 900, 120, 0.3, 0.10);
    [1800, 1400, 2200].forEach(function (f, i) { // 파편이 또르르 떨어지는 반짝이
      _tone(ctx, t + 0.3 + i * 0.07, "triangle", f, f * 0.5, 0.09, 0.07);
    });
  });

  // 🪨 벽 충돌 "쿵—띠용~띠용" — 아픈 쿵 + 우스꽝스러운 이중 용수철 (보글보글식 유머)
  var ding = _sound(function (ctx, t) {
    _tone(ctx, t, "sine", 95, 45, 0.12, 0.35); // 쿵 (생명이 깎이는 무게감)
    _tone(ctx, t, "triangle", 1568, 1568, 0.045, 0.20);
    _tone(ctx, t + 0.045, "triangle", 1318, 260, 0.2, 0.16);
    _tone(ctx, t + 0.045, "sine", 659, 130, 0.2, 0.10);
    _tone(ctx, t + 0.25, "triangle", 880, 200, 0.16, 0.10); // 두 번째 작은 띠용
  });

  // 발소리 — 통·통 번갈아 튀는 밝은 블립 (걷는 리듬감)
  var _stepTurn = 0;
  var step = _sound(function (ctx, t) {
    _stepTurn++;
    _tone(ctx, t, "square", _stepTurn % 2 ? 330 : 392, _stepTurn % 2 ? 262 : 330, 0.035, 0.06);
  });

  // 🏆 승리 — 네온사인 축하쇼용 신나는 8비트 승리곡 (~4.8초, 리드+화음+베이스+하이햇)
  var win = _sound(function (ctx, t) {
    var E = 0.15; // 8분음표 길이(초) — 전체 약 4.3초
    // 리드 멜로디: [음정, 8분음표 수] — 밝은 장조 두 프레이즈 + 클라이맥스
    var lead = [
      [523, 1], [659, 1], [784, 1], [1046, 2], [784, 1], [1046, 2],
      [1175, 1], [1046, 1], [988, 1], [1046, 2], [1318, 2],
      [1046, 1], [1318, 1], [1568, 2], [1318, 1], [1568, 2],
      [1760, 1], [1568, 1], [1397, 1], [1568, 4]
    ];
    var cur = t;
    lead.forEach(function (n) {
      var dur = n[1] * E;
      _tone(ctx, cur, "square", n[0], n[0], dur * 0.92, 0.15);
      _tone(ctx, cur, "triangle", n[0] * 1.5, n[0] * 1.5, dur * 0.92, 0.06); // 5도 화음
      cur += dur;
    });
    var total = cur - t;
    // 베이스 라인: 도-솔-라-미-파-도-파-솔 순환
    var bass = [262, 392, 440, 330, 349, 262, 349, 392];
    for (var b = 0; b * E * 2 < total; b++) {
      _tone(ctx, t + b * E * 2, "square", bass[b % bass.length] / 2, bass[b % bass.length] / 2, E * 1.7, 0.10);
    }
    // 하이햇 (스윙 리듬)
    for (var h = 0; h * E < total; h++) {
      _noise(ctx, t + h * E, 0.03, h % 2 ? 0.05 : 0.03, 8000, 5000);
    }
    // 마무리 대화음 + 반짝반짝
    _tone(ctx, cur, "square", 1046, 1046, 0.5, 0.13);
    _tone(ctx, cur, "square", 1318, 1318, 0.5, 0.11);
    _tone(ctx, cur, "triangle", 1568, 1568, 0.5, 0.10);
    [2093, 2637, 3136, 2637, 3520].forEach(function (f, i) {
      _tone(ctx, cur + 0.1 + i * 0.07, "triangle", f, f, 0.09, 0.08);
    });
  });

  // 👹 괴물 괴성 — 무기 종류별로 다른 무서운 목소리 (전부 합성)
  var roar = _sound(function (ctx, t, kind) {
    switch (kind) {
      case "stone": // 낮게 우르릉대는 그르렁 (덩치 큰 돌던지기 괴물)
        _tone(ctx, t, "sawtooth", 75, 48, 0.7, 0.30);
        _tone(ctx, t + 0.05, "sawtooth", 112, 60, 0.65, 0.18);
        _noise(ctx, t, 0.7, 0.12, 300, 90);
        break;
      case "water": // 부글부글 젖은 울음 (물총 괴물)
        _tone(ctx, t, "sine", 150, 210, 0.25, 0.25);
        _tone(ctx, t + 0.25, "sine", 210, 120, 0.35, 0.25);
        _noise(ctx, t, 0.55, 0.10, 900, 250);
        break;
      case "club": // 컹! 컹! 짧고 사나운 으르렁 (몽둥이 괴물)
        _tone(ctx, t, "square", 130, 78, 0.16, 0.28);
        _tone(ctx, t + 0.22, "square", 118, 70, 0.18, 0.28);
        _noise(ctx, t, 0.14, 0.14, 500, 150);
        break;
      case "fire": // 끼에에엑— 찢어지는 비명 (불화살 괴물)
        _tone(ctx, t, "sawtooth", 1350, 320, 0.5, 0.22);
        _tone(ctx, t + 0.06, "sawtooth", 1800, 400, 0.44, 0.13);
        _noise(ctx, t, 0.4, 0.08, 4000, 900);
        break;
      default: // trapper — 키득키득 소름끼치는 웃음
        [900, 780, 880, 700, 820, 620].forEach(function (f, i) {
          _tone(ctx, t + i * 0.09, "sawtooth", f, f * 0.8, 0.07, 0.14);
        });
    }
  });

  // 무기 피격음 — 맞은 무기마다 다른 충격
  var hit = _sound(function (ctx, t, weapon) {
    switch (weapon) {
      case "stone": // 퍽! 둔탁한 돌 충격
        _tone(ctx, t, "sine", 140, 55, 0.14, 0.4);
        _noise(ctx, t, 0.1, 0.2, 1800, 300);
        break;
      case "club": // 빡! 나무 몽둥이
        _tone(ctx, t, "square", 190, 80, 0.1, 0.32);
        _noise(ctx, t, 0.07, 0.22, 1200, 400);
        break;
      case "water": // 촤악~ 물살
        _noise(ctx, t, 0.3, 0.25, 2800, 600);
        _tone(ctx, t + 0.04, "sine", 500, 900, 0.16, 0.12);
        break;
      case "fire": // 슈욱—화르륵 불화살
        _noise(ctx, t, 0.14, 0.16, 5000, 2000);
        _tone(ctx, t + 0.1, "sawtooth", 700, 180, 0.25, 0.2);
        _noise(ctx, t + 0.12, 0.25, 0.12, 1500, 300);
        break;
      case "mega": // 콰앙! 보스 파동포 — 묵직한 이중 충격
        _tone(ctx, t, "sine", 70, 30, 0.25, 0.5);
        _tone(ctx, t, "sawtooth", 400, 60, 0.3, 0.28);
        _noise(ctx, t, 0.3, 0.3, 2000, 100);
        _tone(ctx, t + 0.18, "sine", 55, 28, 0.2, 0.35);
        break;
      default: // trap — 철컥! 덫
        _tone(ctx, t, "square", 2200, 2200, 0.03, 0.25);
        _tone(ctx, t + 0.03, "square", 300, 90, 0.16, 0.3);
        _noise(ctx, t + 0.02, 0.08, 0.15, 3000, 800);
    }
  });

  // 👿 중급보스 탄생 — 낮게 겹친 이중 포효 + 찢어지는 상층음
  var bossRoar = _sound(function (ctx, t) {
    _tone(ctx, t, "sawtooth", 62, 38, 1.1, 0.34);
    _tone(ctx, t + 0.04, "sawtooth", 93, 52, 1.0, 0.24);
    _noise(ctx, t, 1.0, 0.14, 350, 80);
    _tone(ctx, t + 0.35, "sawtooth", 1500, 380, 0.5, 0.12);
  });

  // 🏰 괴물기지 등장 — 불길한 저음 뿔피리 2연발
  var baseHorn = _sound(function (ctx, t) {
    _tone(ctx, t, "sawtooth", 110, 92, 0.5, 0.28);
    _tone(ctx, t, "square", 55, 46, 0.5, 0.18);
    _tone(ctx, t + 0.55, "sawtooth", 98, 78, 0.65, 0.3);
    _tone(ctx, t + 0.55, "square", 49, 39, 0.65, 0.2);
    _noise(ctx, t, 1.2, 0.07, 250, 70);
  });

  // 💣 지뢰 설치 — 날카로운 이중 비프
  var mineSet = _sound(function (ctx, t) {
    _tone(ctx, t, "square", 1800, 1800, 0.03, 0.1);
    _tone(ctx, t + 0.05, "square", 1400, 1400, 0.04, 0.08);
  });

  // 함정 설치 — 멀리서 들리는 나지막한 철컥
  var trapSet = _sound(function (ctx, t) {
    _tone(ctx, t, "square", 1400, 1400, 0.025, 0.08);
    _tone(ctx, t + 0.03, "square", 500, 350, 0.06, 0.07);
  });

  // ⏰ 시간 경고·초과·고갈
  var timeWarn = _sound(function (ctx, t) { // 삐-삐- 10초 경보
    [0, 0.18].forEach(function (o) { _tone(ctx, t + o, "square", 988, 988, 0.12, 0.2); });
  });
  var tickTock = _sound(function (ctx, t, n) { // 마지막 5초 초침
    _tone(ctx, t, "square", (n % 2) ? 740 : 620, (n % 2) ? 740 : 620, 0.05, 0.16);
  });
  var timeOver = _sound(function (ctx, t) { // 뿌-뿌-뿌 경보
    [0, 0.22, 0.44].forEach(function (o) { _tone(ctx, t + o, "sawtooth", 420, 300, 0.18, 0.25); });
  });
  var drain = _sound(function (ctx, t) { // 생명이 새는 심장박동
    _tone(ctx, t, "sine", 90, 55, 0.12, 0.4);
    _tone(ctx, t + 0.16, "sine", 80, 50, 0.14, 0.32);
  });

  // 🌊 출렁이는 벽 — 멀리서 돌이 갈리는 나지막한 우르릉 (2초 주기라 아주 조용하게)
  var rumble = _sound(function (ctx, t) {
    _noise(ctx, t, 0.25, 0.05, 220, 60);
    _tone(ctx, t, "sine", 62, 44, 0.22, 0.07);
  });

  // 💀 게임오버 — 하강 단조 (애수 + 유머)
  var dead = _sound(function (ctx, t) {
    [392, 330, 262, 196].forEach(function (f, i) {
      _tone(ctx, t + i * 0.16, "square", f, f * 0.94, 0.15, 0.16);
    });
    _tone(ctx, t + 0.64, "sawtooth", 150, 55, 0.5, 0.14);
  });

  var WIN_MS = 4400; // 승리곡 총 길이(ms) — 화면 네온쇼·성적표 타이밍의 단일 원천

  return {
    name: "dungeonSfx",
    version: "0.11.0",
    WIN_MS: WIN_MS,
    unlock: unlock,
    pop: pop, boom: boom, ding: ding, step: step, win: win, dead: dead, start: start,
    roar: roar, hit: hit, trapSet: trapSet, bossRoar: bossRoar, baseHorn: baseHorn, mineSet: mineSet, rumble: rumble,
    timeWarn: timeWarn, tickTock: tickTock, timeOver: timeOver, drain: drain,
    merge: merge, bagFull: bagFull, coin: coin
  };
}));
