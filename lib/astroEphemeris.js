// ============================================================
// @module    domain/astrology/astroEphemeris.js
// @layer     domain/astrology (v0.1 — 천문 계산 코어)
// @summary   결정론 천문 계산 — Julian Day / 황도경사 / 항성시 /
//            태양·달(Meeus) · 행성(Standish JPL Keplerian) 지구중심 황경.
// @public    AstroEphemeris.julianDay(y,mo,d,hourUT) → JD
//            AstroEphemeris.obliquity(T) / gmst(jd)
//            AstroEphemeris.sunLongitude(jd) → deg (황도-of-date)
//            AstroEphemeris.moonLongitude(jd) → {lon,lat}
//            AstroEphemeris.bodyLongitude(key, jd) → {lon,lat}
//            AstroEphemeris.allBodies(jd) → { sun, moon, mercury, ... , pluto }
// @doctrine  - 외부 의존 0, 네트워크 0, class/import 0 (UMD).
//            - 근사 이론(Standish 1800–2050 · Meeus 절단). 별자리·하우스엔 충분.
//              정밀 애스펙트/천문학 연구용 아님 — "구조의 지도"용.
// ============================================================
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(require("./astroMath.js"));
    if (global) global.AstroEphemeris = module.exports;
  } else {
    global.AstroEphemeris = factory(global.AstroMath);
  }
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function (AstroMath) {
  "use strict";

  // 공용 각도·삼각함수 (astroMath.js — 단일 출처)
  var M = AstroMath || (typeof globalThis !== "undefined" ? globalThis.AstroMath : null);
  var D2R = M.DEG2RAD, R2D = M.RAD2DEG;
  var norm360 = M.norm360, sind = M.sind, cosd = M.cosd, tand = M.tand, atan2d = M.atan2d;

  // ─── Julian Day (Gregorian, Meeus ch.7) ───
  function julianDay(y, mo, d, hourUT) {
    hourUT = hourUT || 0;
    if (mo <= 2) { y -= 1; mo += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) +
      d + B - 1524.5 + hourUT / 24;
  }
  function centuries(jd) { return (jd - 2451545.0) / 36525.0; }

  // ─── 황도경사 (Meeus 22.2) ───
  function obliquity(T) {
    return 23.4392911 - 0.0130041667 * T - 1.63889e-7 * T * T + 5.03611e-7 * T * T * T;
  }

  // ─── 그리니치 평항성시 (deg) ───
  function gmst(jd) {
    var T = centuries(jd);
    var g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T - (T * T * T) / 38710000.0;
    return norm360(g);
  }

  // ─── 태양 황경 (Meeus 25, of-date) ───
  function sunLongitude(jd) {
    var T = centuries(jd);
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sind(M) +
      (0.019993 - 0.000101 * T) * sind(2 * M) + 0.000289 * sind(3 * M);
    return norm360(L0 + C);
  }

  // ─── 달 (Meeus 47, 절단) → {lon,lat} of-date ───
  // [D, M, Mp, F, coeff_lon(1e-6 deg), coeff_lat(1e-6 deg)]
  var MOON_TERMS = [
    [0, 0, 1, 0, 6288774, 0], [2, 0, -1, 0, 1274027, 0], [2, 0, 0, 0, 658314, 0],
    [0, 0, 2, 0, 213618, 0], [0, 1, 0, 0, -185116, 0], [0, 0, 0, 2, -114332, 0],
    [2, 0, -2, 0, 58793, 0], [2, -1, -1, 0, 57066, 0], [2, 0, 1, 0, 53322, 0],
    [2, -1, 0, 0, 45758, 0], [0, 1, -1, 0, -40923, 0], [1, 0, 0, 0, -34720, 0],
    [0, 1, 1, 0, -30383, 0], [2, 0, 0, -2, 15327, 0], [0, 0, 1, 2, -12528, 0],
    [0, 0, 1, -2, 10980, 0], [4, 0, -1, 0, 10675, 0], [0, 0, 3, 0, 10034, 0],
    [4, 0, -2, 0, 8548, 0], [2, 1, -1, 0, -7888, 0], [2, 1, 0, 0, -6766, 0],
    [1, 0, -1, 0, -5163, 0], [1, 1, 0, 0, 4987, 0], [2, -1, 1, 0, 4036, 0],
    [2, 0, 2, 0, 3994, 0], [4, 0, 0, 0, 3861, 0], [2, 0, -3, 0, 3665, 0],
    [0, 1, -2, 0, -2689, 0], [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 0],
    [1, 0, 1, 0, -2348, 0], [2, -2, 0, 0, 2236, 0], [0, 1, 2, 0, -2120, 0],
    [0, 2, 0, 0, 2069, 0], [2, -2, -1, 0, 2048, 0]
  ];
  // 위도 주요항 [D,M,Mp,F,coeff(1e-6)]
  var MOON_LAT = [
    [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693],
    [2, 0, 0, -1, 173237], [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271],
    [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266],
    [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
    [2, 0, 1, 1, 4200], [0, 1, 0, 1, -3359], [2, -1, -1, 1, 2463],
    [2, -1, 0, 1, 2211], [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870],
    [4, 0, -1, -1, 1828], [0, 1, 0, -1, -1794]
  ];
  function moonLongitude(jd) {
    var T = centuries(jd);
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841 - (T * T * T * T) / 65194000;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868 - (T * T * T * T) / 113065000;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var sumL = 0, sumB = 0, i, t, arg, ecc;
    for (i = 0; i < MOON_TERMS.length; i++) {
      t = MOON_TERMS[i];
      arg = t[0] * D + t[1] * M + t[2] * Mp + t[3] * F;
      ecc = t[1] === 0 ? 1 : (Math.abs(t[1]) === 1 ? E : E * E);
      sumL += t[4] * ecc * sind(arg);
    }
    for (i = 0; i < MOON_LAT.length; i++) {
      t = MOON_LAT[i];
      arg = t[0] * D + t[1] * M + t[2] * Mp + t[3] * F;
      ecc = t[1] === 0 ? 1 : (Math.abs(t[1]) === 1 ? E : E * E);
      sumB += t[4] * ecc * sind(arg);
    }
    return { lon: norm360(Lp + sumL / 1e6), lat: sumB / 1e6 };
  }

  // ─── 행성 (Standish JPL 근사 궤도요소, 1800–2050) ───
  // [a0,ȧ, e0,ė, I0,İ, L0,L̇, ϖ0,ϖ̇, Ω0,Ω̇]  (a: au, 각: deg, rate: /century)
  var ELEM = {
    mercury: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
    venus: [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    earth: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0.0, 0.0],
    mars: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
    jupiter: [5.20288700, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
    saturn: [9.53667594, -0.00125060, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794],
    uranus: [19.18916464, -0.00196176, 0.04725744, -0.00004397, 0.77263783, -0.00242939, 313.23810451, 428.48202785, 170.95427630, 0.40805281, 74.01692503, 0.04240589],
    neptune: [30.06992276, 0.00026291, 0.00859048, 0.00005105, 1.77004347, 0.00035372, -55.12002969, 218.45945325, 44.96476227, -0.32241464, 131.78422574, -0.00508664],
    pluto: [39.48211675, -0.00031596, 0.24882730, 0.00005170, 17.14001206, 0.00004818, 238.92903833, 145.20780515, 224.06891629, -0.04062942, 110.30393684, -0.01183482]
  };

  function solveKepler(M, e) { // M deg, e — returns E deg
    M = ((M + 180) % 360 + 360) % 360 - 180; // -180..180
    var estar = R2D * e;
    var E = M + estar * sind(M), dE = 1, iter = 0;
    while (Math.abs(dE) > 1e-8 && iter < 60) {
      dE = (M - (E - estar * sind(E))) / (1 - e * cosd(E));
      E += dE; iter++;
    }
    return E;
  }

  // 행성 → 태양중심 황도 J2000 직교좌표 (au)
  function helioXYZ(key, T) {
    var el = ELEM[key];
    var a = el[0] + el[1] * T, e = el[2] + el[3] * T, I = el[4] + el[5] * T;
    var L = el[6] + el[7] * T, wbar = el[8] + el[9] * T, Om = el[10] + el[11] * T;
    var w = wbar - Om;
    var M = L - wbar;
    var E = solveKepler(M, e);
    var xp = a * (cosd(E) - e);
    var yp = a * Math.sqrt(1 - e * e) * sind(E);
    var cw = cosd(w), sw = sind(w), cO = cosd(Om), sO = sind(Om), cI = cosd(I), sI = sind(I);
    var x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
    var y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
    var z = (sw * sI) * xp + (cw * sI) * yp;
    return { x: x, y: y, z: z };
  }

  // J2000 → of-date 황경 세차 보정 (deg)
  function precession(T) { return 1.3969713 * T + 0.0003086 * T * T; }

  // 행성 지구중심 황경/황위 (of-date)
  function planetGeo(key, jd) {
    var T = centuries(jd);
    var p = helioXYZ(key, T), earth = helioXYZ("earth", T);
    var gx = p.x - earth.x, gy = p.y - earth.y, gz = p.z - earth.z;
    var lon = norm360(atan2d(gy, gx) + precession(T));
    var lat = atan2d(gz, Math.sqrt(gx * gx + gy * gy));
    return { lon: lon, lat: lat };
  }

  function bodyLongitude(key, jd) {
    if (key === "sun") return { lon: sunLongitude(jd), lat: 0 };
    if (key === "moon") return moonLongitude(jd);
    if (ELEM[key] && key !== "earth") return planetGeo(key, jd);
    return null;
  }

  var BODY_KEYS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  function allBodies(jd) {
    var out = {};
    for (var i = 0; i < BODY_KEYS.length; i++) {
      var k = BODY_KEYS[i];
      var b = bodyLongitude(k, jd);
      // 역행 판정 (황경이 감소하면 R). 태양·달 제외.
      if (b && k !== "sun" && k !== "moon") {
        var b2 = bodyLongitude(k, jd + 1);
        var d = ((b2.lon - b.lon + 540) % 360) - 180; // -180..180
        b.retrograde = d < 0;
      } else if (b) { b.retrograde = false; }
      out[k] = b;
    }
    return out;
  }

  return {
    name: "astroEphemeris",
    version: "0.1.0",
    BODY_KEYS: BODY_KEYS,
    norm360: norm360,
    julianDay: julianDay,
    centuries: centuries,
    obliquity: obliquity,
    gmst: gmst,
    sunLongitude: sunLongitude,
    moonLongitude: moonLongitude,
    solveKepler: solveKepler,
    helioXYZ: helioXYZ,
    precession: precession,
    bodyLongitude: bodyLongitude,
    allBodies: allBodies
  };
}));
