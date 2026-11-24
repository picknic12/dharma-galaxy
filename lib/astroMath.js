// ============================================================
// @module    domain/astrology/astroMath.js
// @layer     domain/astrology (v0.1 — 각도·삼각함수 공용 기반)
// @summary   점성 모듈 공용 도(度) 단위 삼각함수 + 정규화. (중복 제거 단일 출처)
// @public    AstroMath.{ DEG2RAD, RAD2DEG, norm360, clampUnit,
//                         sind, cosd, tand, asind, acosd, atan2d }
// @doctrine  - 순수 함수, 무의존, 무네트워크. astroEphemeris/natalChartEngine/transitEngine 공유.
// ============================================================
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
    if (global) global.AstroMath = module.exports;
  } else {
    global.AstroMath = factory();
  }
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";

  var DEG2RAD = Math.PI / 180, RAD2DEG = 180 / Math.PI;

  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function clampUnit(x) { return x < -1 ? -1 : (x > 1 ? 1 : x); }
  function sind(d) { return Math.sin(d * DEG2RAD); }
  function cosd(d) { return Math.cos(d * DEG2RAD); }
  function tand(d) { return Math.tan(d * DEG2RAD); }
  function asind(x) { return Math.asin(clampUnit(x)) * RAD2DEG; }
  function acosd(x) { return Math.acos(clampUnit(x)) * RAD2DEG; }
  function atan2d(y, x) { return Math.atan2(y, x) * RAD2DEG; }

  return {
    name: "astroMath",
    version: "0.1.0",
    DEG2RAD: DEG2RAD, RAD2DEG: RAD2DEG,
    norm360: norm360, clampUnit: clampUnit,
    sind: sind, cosd: cosd, tand: tand,
    asind: asind, acosd: acosd, atan2d: atan2d
  };
}));
