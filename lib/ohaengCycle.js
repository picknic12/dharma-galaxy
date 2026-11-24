// ============================================================
// @module    lib/ohaengCycle.js
// @layer     picnic game library — 오행 상생상극 + 경기 사이클
// @origin    사주RPG domain/game/ohaengSnapEngine.js (SAENG/GEUK 순환) 추출·확장
// @public    OhaengCycle.{EL, HZ, NAME, saeng(a,b), geuk(a,b), harmony(list), PHASES}
// @doctrine  - 상생: 목→화→토→금→수→목 / 상극: 목→토→수→화→금→목 (정통 명리 순환)
//            - 경기 국면은 오행 순환으로 해석한다: 회복(木)→호황(火)→안정(土)→긴축(金)→침체(水)
//            - "정해진 운명"이 아니라 흐름의 작동 방식: 국면은 예고되고, 선택은 플레이어에게 남는다.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.OhaengCycle = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var EL = ["목", "화", "토", "금", "수"];
  var HZ = { "목": "木", "화": "火", "토": "土", "금": "金", "수": "水" };
  var COLOR = { "목": "#8fd19e", "화": "#f59a8b", "토": "#e8c77a", "금": "#c9ced8", "수": "#8cb8e8" };
  var SAENG = { "목": "화", "화": "토", "토": "금", "금": "수", "수": "목" };
  var GEUK = { "목": "토", "토": "수", "수": "화", "화": "금", "금": "목" };
  function saeng(a, b) { return SAENG[a] === b; }
  function geuk(a, b) { return GEUK[a] === b; }
  // 원소 목록의 조화 판정: 순수(모두 같음) / 조화(상생 연결) / 불안정(상극 포함) / 평범
  function harmony(list) {
    var u = list.filter(function (x, i) { return list.indexOf(x) === i; });
    if (u.length === 1) return { key: "pure", name: "순수 합성", mul: 1.3 };
    var hasGeuk = false, saengPairs = 0;
    for (var i = 0; i < list.length; i++) for (var j = 0; j < list.length; j++) {
      if (i === j) continue;
      if (geuk(list[i], list[j])) hasGeuk = true;
      if (saeng(list[i], list[j])) saengPairs++;
    }
    if (hasGeuk && saengPairs === 0) return { key: "unstable", name: "불안정 합성", mul: 1.0, atk: 1.35, hp: 0.8 };
    if (saengPairs >= list.length - 1) return { key: "harmony", name: "조화 합성", mul: 1.2 };
    return { key: "plain", name: "평범한 합성", mul: 1.0 };
  }
  var PHASES = [
    { el: "목", name: "회복기", desc: "새싹이 돋듯 성장 자산이 살아납니다.", drift: { A: -1, B: 5, C: 6, D: 2, E: 3, F: 3, ETF: 3, CRYPTO: 4 }, rate: 0.10 },
    { el: "화", name: "호황기", desc: "열기가 과열로 번집니다. 위험자산이 급등합니다.", drift: { A: -3, B: 5, C: 7, D: 5, E: 3, F: 4, ETF: 4, CRYPTO: 10 }, rate: 0.12 },
    { el: "토", name: "안정기", desc: "열기를 품고 고르게 다집니다. 실물 자산이 단단해집니다.", drift: { A: 1, B: 1, C: 0, D: 3, E: 2, F: 2, ETF: 2, CRYPTO: -2 }, rate: 0.10 },
    { el: "금", name: "긴축기", desc: "금리를 조여 거품을 걷어냅니다. 채권만 웃습니다.", drift: { A: 4, B: -4, C: -7, D: -5, E: -1, F: -2, ETF: -3, CRYPTO: -9 }, rate: 0.20 },
    { el: "수", name: "침체기", desc: "유동성이 바닥에서 다음 성장을 준비합니다.", drift: { A: 5, B: -3, C: -4, D: -3, E: 1, F: -3, ETF: -4, CRYPTO: -4 }, rate: 0.05 }
  ];
  return { name: "ohaengCycle", version: "1.0.0", EL: EL, HZ: HZ, COLOR: COLOR, SAENG: SAENG, GEUK: GEUK, saeng: saeng, geuk: geuk, harmony: harmony, PHASES: PHASES };
}));
