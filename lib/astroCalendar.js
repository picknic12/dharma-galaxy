// ============================================================
// @module    lib/astroCalendar.js
// @layer     picnic game library — 일진(日辰)·태양 별자리·달 위상
// @public    AstroCalendar.{dayPillar(date), signOf(date), moonPhase(date), reading(date)}
// @doctrine  - 일진: 양력 날짜 기준 60갑자 순환. 기준점 2000-01-01 = 戊午日(54).
//              검증: 1949-10-01 甲子日, 2024-01-01 甲子日, 1900-01-01 甲戌日 (만세력 대조 일치).
//            - 날짜 단위 일진(자시 경계 미적용). 게임 하루 = 1라운드.
//            - 점성: 회귀황도 태양 별자리(경계일 근사), 달 위상은 삭망월 29.530588853일 평균 계산.
//            - 해석은 길흉 단정이 아니라 에너지 흐름(경향)으로 제시한다.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.AstroCalendar = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var STEM = "甲乙丙丁戊己庚辛壬癸", BRANCH = "子丑寅卯辰巳午未申酉戌亥";
  var STEM_KO = "갑을병정무기경신임계", BRANCH_KO = "자축인묘진사오미신유술해";
  var STEM_EL = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
  var BRANCH_EL = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
  var ANIMAL = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  function utcDays(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
  var BASE = Math.floor(Date.UTC(2000, 0, 1) / 86400000);
  function dayPillar(d) {
    var i = ((54 + utcDays(d) - BASE) % 60 + 60) % 60, s = i % 10, b = i % 12;
    return { index: i, hz: STEM[s] + BRANCH[b], ko: STEM_KO[s] + BRANCH_KO[b], stemEl: STEM_EL[s], branchEl: BRANCH_EL[b],
      yang: s % 2 === 0, animal: ANIMAL[b] };
  }
  var SIGNS = [ // [이름, 기호, 시작 월, 일, 원소]
    ["염소자리", "♑", 12, 22, "흙"], ["물병자리", "♒", 1, 20, "공기"], ["물고기자리", "♓", 2, 19, "물"], ["양자리", "♈", 3, 21, "불"],
    ["황소자리", "♉", 4, 20, "흙"], ["쌍둥이자리", "♊", 5, 21, "공기"], ["게자리", "♋", 6, 22, "물"], ["사자자리", "♌", 7, 23, "불"],
    ["처녀자리", "♍", 8, 23, "흙"], ["천칭자리", "♎", 9, 23, "공기"], ["전갈자리", "♏", 10, 23, "물"], ["사수자리", "♐", 11, 22, "불"]
  ];
  function signOf(d) {
    var m = d.getMonth() + 1, day = d.getDate(), cur = SIGNS[0];
    for (var i = 1; i < SIGNS.length; i++) { var s = SIGNS[i]; if (m > s[2] || (m === s[2] && day >= s[3])) cur = s; }
    if (m === 12 && day >= 22) cur = SIGNS[0];
    return { name: cur[0], sym: cur[1], el: cur[4] };
  }
  function moonPhase(d) {
    var ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000, syn = 29.530588853;
    var t = (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12) / 86400000 - ref) % syn; if (t < 0) t += syn;
    var names = ["신월", "초승달", "상현달", "차오르는 달", "보름달", "기우는 달", "하현달", "그믐달"], syms = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
    var k = Math.floor((t / syn) * 8 + 0.5) % 8;
    return { age: Math.round(t * 10) / 10, name: names[k], sym: syms[k], k: k };
  }
  // 게임 효과로 번역: 섹터별 경향(%) + 해설
  var SIGN_FX = { "불": { C: 3, CRYPTO: 4, B: 2 }, "흙": { D: 3, A: 2, E: 2 }, "공기": { ETF: 3, B: 2, F: 2 }, "물": { A: 2, E: 2, CRYPTO: -2 } };
  var EL_FX = { "목": { B: 3, C: 3 }, "화": { C: 3, CRYPTO: 4 }, "토": { D: 3, E: 2 }, "금": { A: 3, F: 2 }, "수": { A: 2, ETF: 2 } };
  function reading(d) {
    var p = dayPillar(d), s = signOf(d), m = moonPhase(d), fx = {};
    function add(o, w) { for (var k in o) fx[k] = (fx[k] || 0) + o[k] * w; }
    add(EL_FX[p.stemEl], 1); add(EL_FX[p.branchEl], 0.5); add(SIGN_FX[s.el], 0.6);
    var vol = (m.k === 4) ? 1.6 : (m.k === 0 ? 1.3 : 1); // 보름·신월에 변동성↑
    return { pillar: p, sign: s, moon: m, fx: fx, vol: vol,
      text: p.hz + "日(" + p.ko + "일, " + p.stemEl + "·" + p.branchEl + ") · " + s.sym + " " + s.name + " · " + m.sym + " " + m.name };
  }
  return { name: "astroCalendar", version: "1.0.0", dayPillar: dayPillar, signOf: signOf, moonPhase: moonPhase, reading: reading, STEM: STEM, BRANCH: BRANCH, STEM_EL: STEM_EL };
}));
