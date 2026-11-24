// ============================================================
// @module    lib/picnicRng.js
// @layer     picnic game library — 결정론 난수
// @origin    사주RPG domain/game/ohaengSnapEngine.js (makeRng·shuffled) 추출·일반화
// @public    PicnicRng.create(seed) → { next, int(a,b), pick(arr), shuffle(arr), chance(p), seed }
// @doctrine  - 같은 seed → 같은 게임. 테스트·리플레이 결정성.
//            - DOM/저장소 의존 0, UMD (브라우저 전역 + Node require)
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.PicnicRng = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  function mulberry32(seed) {
    var s = (seed >>> 0) || 0x9e3779b9;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function create(seed) {
    if (seed == null || seed === "") seed = Math.floor(Math.random() * 1e9);
    var next = mulberry32(+seed);
    var r = {
      seed: +seed, next: next,
      int: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
      }
    };
    return r;
  }
  // 문자열/숫자 → 안정 해시 (스프라이트·이름 지문용)
  function hash(v) {
    var s = String(v), h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  return { name: "picnicRng", version: "1.0.0", create: create, mulberry32: mulberry32, hash: hash };
}));
