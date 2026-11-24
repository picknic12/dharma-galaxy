// ============================================================
// @module    domain/astrology/natalChartEngine.js
// @layer     domain/astrology (v0.1 — 네이탈 차트 조립)
// @summary   출생 정보 → 10천체 별자리·하우스·상승/천정·애스펙트·원소균형·리딩.
// @public    NatalChartEngine.compute(input) → chart
//            input = { year, month, day, hour, minute, second?,
//                      tzOffsetHours (동경+, 예 KST=9), lat (북+), lon (동+),
//                      houseSystem?: "whole"|"equal", name? }
//            NatalChartEngine.SIGNS / BODIES / ASPECT_TYPES
// @consumes  AstroEphemeris (window 글로벌)
// @doctrine  - 결정론·무네트워크. 예언·처방 아님 — "구조의 지도"(거울).
//            - 근사 이론 기반. 별자리·하우스 판정용. 단정 금지.
// ============================================================
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(require("./astroEphemeris.js"), require("./astroMath.js"));
    if (global) global.NatalChartEngine = module.exports;
  } else {
    global.NatalChartEngine = factory(global.AstroEphemeris, global.AstroMath);
  }
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function (Ephem, AstroMath) {
  "use strict";

  function _ephem() {
    return Ephem || (typeof globalThis !== "undefined" ? globalThis.AstroEphemeris : null);
  }

  // 공용 각도·삼각함수 (astroMath.js — 단일 출처)
  var M = AstroMath || (typeof globalThis !== "undefined" ? globalThis.AstroMath : null);

  var SIGNS = [
    { en: "Aries", kr: "양자리", glyph: "♈", element: "fire", modality: "cardinal", ruler: "화성" },
    { en: "Taurus", kr: "황소자리", glyph: "♉", element: "earth", modality: "fixed", ruler: "금성" },
    { en: "Gemini", kr: "쌍둥이자리", glyph: "♊", element: "air", modality: "mutable", ruler: "수성" },
    { en: "Cancer", kr: "게자리", glyph: "♋", element: "water", modality: "cardinal", ruler: "달" },
    { en: "Leo", kr: "사자자리", glyph: "♌", element: "fire", modality: "fixed", ruler: "태양" },
    { en: "Virgo", kr: "처녀자리", glyph: "♍", element: "earth", modality: "mutable", ruler: "수성" },
    { en: "Libra", kr: "천칭자리", glyph: "♎", element: "air", modality: "cardinal", ruler: "금성" },
    { en: "Scorpio", kr: "전갈자리", glyph: "♏", element: "water", modality: "fixed", ruler: "화성·명왕성" },
    { en: "Sagittarius", kr: "궁수자리", glyph: "♐", element: "fire", modality: "mutable", ruler: "목성" },
    { en: "Capricorn", kr: "염소자리", glyph: "♑", element: "earth", modality: "cardinal", ruler: "토성" },
    { en: "Aquarius", kr: "물병자리", glyph: "♒", element: "air", modality: "fixed", ruler: "토성·천왕성" },
    { en: "Pisces", kr: "물고기자리", glyph: "♓", element: "water", modality: "mutable", ruler: "목성·해왕성" }
  ];

  var BODIES = [
    { key: "sun", kr: "태양", glyph: "☉" }, { key: "moon", kr: "달", glyph: "☽" },
    { key: "mercury", kr: "수성", glyph: "☿" }, { key: "venus", kr: "금성", glyph: "♀" },
    { key: "mars", kr: "화성", glyph: "♂" }, { key: "jupiter", kr: "목성", glyph: "♃" },
    { key: "saturn", kr: "토성", glyph: "♄" }, { key: "uranus", kr: "천왕성", glyph: "♅" },
    { key: "neptune", kr: "해왕성", glyph: "♆" }, { key: "pluto", kr: "명왕성", glyph: "♇" }
  ];

  var ASPECT_TYPES = [
    { en: "conjunction", kr: "합", glyph: "☌", angle: 0, orb: 8 },
    { en: "sextile", kr: "육각", glyph: "﹡", angle: 60, orb: 6 },
    { en: "square", kr: "사각", glyph: "□", angle: 90, orb: 8 },
    { en: "trine", kr: "삼각", glyph: "△", angle: 120, orb: 8 },
    { en: "quincunx", kr: "150도", glyph: "⚻", angle: 150, orb: 3 },
    { en: "opposition", kr: "대립", glyph: "☍", angle: 180, orb: 8 }
  ];

  var norm360 = M.norm360;
  function signIndex(lon) { return Math.floor(norm360(lon) / 30) % 12; }
  function degInSign(lon) { return norm360(lon) - signIndex(lon) * 30; }
  function isNum(x) { return typeof x === "number" && isFinite(x); }

  function signOf(lon) {
    var i = signIndex(lon), s = SIGNS[i], d = degInSign(lon);
    return { index: i, en: s.en, kr: s.kr, glyph: s.glyph, element: s.element, modality: s.modality, ruler: s.ruler, deg: d, degStr: _degStr(d) };
  }
  function _degStr(d) {
    var deg = Math.floor(d), min = Math.floor((d - deg) * 60);
    return deg + "°" + (min < 10 ? "0" : "") + min + "'";
  }

  // ── 상승점(ASC)·천정(MC) ──
  function angles(jd, lat, lon, eps, E) {
    var ramc = norm360(E.gmst(jd) + lon); // 국지 항성시 = RAMC
    var mc = norm360(M.atan2d(M.sind(ramc), M.cosd(ramc) * M.cosd(eps)));
    var asc = norm360(M.atan2d(
      M.cosd(ramc),
      -(M.sind(ramc) * M.cosd(eps) + M.tand(lat) * M.sind(eps))
    ));
    return { asc: asc, mc: mc, ramc: ramc };
  }

  // ── Placidus 하우스 커스프 (반호 반복법) ──
  // 반환: [c1..c12] 황경 배열, 또는 극지/발산 시 null (호출부가 equal 폴백).
  function placidusCusps(ramc, eps, lat, ascLon, mcLon) {
    if (Math.abs(lat) >= 66.0) return null; // 극권 이상 — Placidus 미정의
    // 공용 삼각함수 (astroMath)
    var sD = M.sind, cD = M.cosd, tD = M.tand, asinD = M.asind, acosD = M.acosd, atan2D = M.atan2d;
    // RA α(적경) → 황도상 점의 황경 λ (β=0)
    function raToLon(a) { return norm360(atan2D(sD(a), cD(a) * cD(eps))); }
    function lonToDec(lon) { return asinD(sD(eps) * sD(lon)); }
    // α = ramc + sdConst + sdCoef·SD 를 만족하는 커스프. SD=반주호(semidiurnal arc).
    function solve(guess, sdConst, sdCoef) {
      var alpha = ramc + guess, prev = alpha, i;
      for (i = 0; i < 100; i++) {
        var dec = lonToDec(raToLon(alpha));
        var SD = acosD(-tD(lat) * tD(dec)); // 0..180
        alpha = ramc + sdConst + sdCoef * SD;
        if (Math.abs(alpha - prev) < 1e-9) break;
        prev = alpha;
      }
      return raToLon(alpha);
    }
    var c11 = solve(30, 0, 1 / 3);
    var c12 = solve(60, 0, 2 / 3);
    var c2 = solve(120, 60, 2 / 3);
    var c3 = solve(150, 120, 1 / 3);
    var c1 = norm360(ascLon), c10 = norm360(mcLon);
    var cusps = [
      c1, c2, c3, norm360(c10 + 180), norm360(c11 + 180), norm360(c12 + 180),
      norm360(c1 + 180), norm360(c2 + 180), norm360(c3 + 180), c10, c11, c12
    ];
    // 단조성 검증(황도순환) — 실패 시 발산으로 간주하고 폴백
    for (var k = 0; k < 12; k++) {
      var a = cusps[k], b = cusps[(k + 1) % 12];
      var span = norm360(b - a);
      if (span < 1 || span > 120) return null; // 비정상 간격 → 폴백
    }
    return cusps;
  }

  // 커스프 배열 기준 하우스 판정 (Placidus/Equal 공통)
  function houseFromCusps(lon, cusps) {
    lon = norm360(lon);
    for (var i = 0; i < 12; i++) {
      var a = cusps[i], b = cusps[(i + 1) % 12];
      var rel = norm360(lon - a), span = norm360(b - a);
      if (rel < span) return i + 1;
    }
    return 12;
  }

  function houseOf(lon, ascLon, system) {
    if (system === "equal") {
      return (Math.floor(norm360(lon - ascLon) / 30) % 12) + 1;
    }
    // whole sign
    return ((signIndex(lon) - signIndex(ascLon) + 12) % 12) + 1;
  }

  function aspectsBetween(placed) {
    var out = [];
    for (var i = 0; i < placed.length; i++) {
      for (var j = i + 1; j < placed.length; j++) {
        var d = Math.abs(placed[i].lon - placed[j].lon) % 360;
        if (d > 180) d = 360 - d;
        for (var t = 0; t < ASPECT_TYPES.length; t++) {
          var at = ASPECT_TYPES[t];
          var orb = Math.abs(d - at.angle);
          if (orb <= at.orb) {
            out.push({ a: placed[i].key, b: placed[j].key, type: at.en, kr: at.kr, glyph: at.glyph, angle: at.angle, orb: Math.round(orb * 100) / 100 });
            break;
          }
        }
      }
    }
    out.sort(function (x, y) { return x.orb - y.orb; });
    return out;
  }

  function _pad(n) { return n < 10 ? "0" + n : "" + n; }

  function compute(input) {
    input = input || {};
    var E = _ephem();
    if (!E) return { ok: false, error: "ephemeris_missing", copy: "천문 엔진(AstroEphemeris) 미로딩." };

    var y = input.year, mo = input.month, d = input.day;
    if (!isNum(y) || !isNum(mo) || !isNum(d)) {
      return { ok: false, error: "invalid_date", copy: "출생 연·월·일을 확인해 주세요." };
    }
    var hour = isNum(input.hour) ? input.hour : 12;
    var minute = isNum(input.minute) ? input.minute : 0;
    var second = isNum(input.second) ? input.second : 0;
    var tz = isNum(input.tzOffsetHours) ? input.tzOffsetHours
      : (isNum(input.tzOffsetMin) ? input.tzOffsetMin / 60 : 9); // 기본 KST
    var lat = isNum(input.lat) ? input.lat : 37.5665;  // 기본 서울
    var lon = isNum(input.lon) ? input.lon : 126.9780;
    var houseSystem = (input.houseSystem === "equal" || input.houseSystem === "placidus") ? input.houseSystem : "whole";
    var timeKnown = isNum(input.hour); // 시각 미상이면 ASC/하우스 신뢰 낮음

    var hourUT = hour + minute / 60 + second / 3600 - tz;
    var jd = E.julianDay(y, mo, d, 0) + hourUT / 24;
    var T = E.centuries(jd);
    var eps = E.obliquity(T);

    var raw = E.allBodies(jd);
    var ang = angles(jd, lat, lon, eps, E);

    // 하우스 커스프 산출 (Placidus/Equal은 도수 커스프, Whole은 별자리 경계)
    var houseCusps = null, houseSystemUsed = houseSystem, houseNote = null;
    if (houseSystem === "placidus") {
      houseCusps = placidusCusps(ang.ramc, eps, lat, ang.asc, ang.mc);
      if (!houseCusps) { // 극지/발산 → Equal 폴백
        houseSystemUsed = "equal"; houseNote = "고위도/발산으로 Placidus 계산 불가 — Equal 하우스로 대체.";
      }
    }
    if (houseSystemUsed === "equal") {
      houseCusps = [];
      for (var hc = 0; hc < 12; hc++) houseCusps.push(norm360(ang.asc + hc * 30));
    }

    function assignHouse(bodyLon) {
      if (houseCusps) return houseFromCusps(bodyLon, houseCusps);
      return houseOf(bodyLon, ang.asc, "whole");
    }

    var placed = [];
    for (var i = 0; i < BODIES.length; i++) {
      var meta = BODIES[i], b = raw[meta.key];
      if (!b) continue;
      placed.push({
        key: meta.key, kr: meta.kr, glyph: meta.glyph,
        lon: b.lon, lat: b.lat, retrograde: !!b.retrograde,
        sign: signOf(b.lon),
        house: assignHouse(b.lon)
      });
    }

    // 원소·모드 균형 (10천체)
    var elementBalance = { fire: 0, earth: 0, air: 0, water: 0 };
    var modalityBalance = { cardinal: 0, fixed: 0, mutable: 0 };
    placed.forEach(function (p) {
      elementBalance[p.sign.element]++;
      modalityBalance[p.sign.modality]++;
    });

    var ascSign = signOf(ang.asc), mcSign = signOf(ang.mc);
    var aspects = aspectsBetween(placed);

    var chart = {
      ok: true,
      version: "0.1.0",
      name: (typeof input.name === "string" && input.name) ? input.name : null,
      datetime: {
        local: y + "-" + _pad(mo) + "-" + _pad(d) + " " + _pad(hour) + ":" + _pad(minute),
        tzOffsetHours: tz, timeKnown: timeKnown
      },
      location: { lat: lat, lon: lon },
      julianDay: jd,
      obliquity: eps,
      houseSystem: houseSystemUsed,
      houseSystemRequested: houseSystem,
      houseCusps: houseCusps ? houseCusps.map(function (l, idx) { return { house: idx + 1, lon: l, sign: signOf(l) }; }) : null,
      ascendant: { lon: ang.asc, sign: ascSign },
      midheaven: { lon: ang.mc, sign: mcSign },
      bodies: placed,
      aspects: aspects,
      elementBalance: elementBalance,
      modalityBalance: modalityBalance,
      copy: ""
    };
    chart.copy = writeCopy(chart);
    var notices = [];
    if (houseNote) notices.push(houseNote);
    if (!timeKnown) notices.push("출생 시각 미상 — 태양·행성 별자리는 유효하나 상승점·하우스·달(정밀)은 신뢰도가 낮습니다(정오 12:00 가정).");
    if (notices.length) chart.notice = notices.join(" ");
    return chart;
  }

  function writeCopy(c) {
    function bk(key) { for (var i = 0; i < c.bodies.length; i++) if (c.bodies[i].key === key) return c.bodies[i]; return null; }
    var sun = bk("sun"), moon = bk("moon");
    var parts = [];
    parts.push("[" + c.datetime.local + "] ");
    if (sun) parts.push("태양 " + sun.sign.glyph + sun.sign.kr + (c.houseSystem ? " " + sun.house + "하우스" : ""));
    if (moon) parts.push(" · 달 " + moon.sign.glyph + moon.sign.kr);
    if (c.datetime.timeKnown) parts.push(" · 상승 " + c.ascendant.sign.glyph + c.ascendant.sign.kr);
    var eb = c.elementBalance;
    parts.push(". 원소: 불" + eb.fire + " 흙" + eb.earth + " 공기" + eb.air + " 물" + eb.water + ".");
    parts.push(" (이 차트는 예언이 아니라 그대 의식이 어떤 구조 위에 서 있는지의 지도입니다. 판단과 선택은 그대에게.)");
    return parts.join("");
  }

  return {
    name: "natalChartEngine",
    version: "0.1.0",
    SIGNS: SIGNS,
    BODIES: BODIES,
    ASPECT_TYPES: ASPECT_TYPES,
    signOf: signOf,
    houseOf: houseOf,
    placidusCusps: placidusCusps,
    houseFromCusps: houseFromCusps,
    compute: compute
  };
}));
