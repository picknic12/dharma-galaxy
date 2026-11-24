// ============================================================
// @module    lib/sajuChart.js
// @layer     picnic game library — 사주팔자(四柱八字)·대운(大運) 산출
// @public    SajuChart.compute({y,m,d,hh,mm,cal:'solar'|'lunar',leap,gender:'M'|'F',timeUnknown})
//            SajuChart.solarTermsOf(year) / SajuChart.STEM / BRANCH ...
// @consumes  AstroEphemeris.sunLongitude(jd) (사주RPG 천문 코어), KoreanLunarCalendar (MIT, 음력→양력)
// @doctrine  - 모든 명조는 양력 기준. 음력 입력은 한국천문연구원 기준 음양력 표(1000~2050)로 양력 변환 후 산출.
//            - 년주: 입춘(태양 황경 315°) 시각 경계. 월주: 12절(節) 입절 시각 경계(태양 황경 315°+30°k).
//            - 일주: 2000-01-01 = 戊午(54) 기준 60갑자. 23:00 이후 출생은 다음 날 일주(자시 일주 전환).
//            - 시주: 일간 기준 시두법(甲己 → 甲子시 …). 시각은 한국 표준시 입력, 서머타임·UTC+8:30 시기는 자동 보정.
//            - 대운: 남자 양년간·여자 음년간 = 순행, 그 밖은 역행. 대운수 = 출생~(다음/이전) 절입까지 일수 ÷ 3 (반올림, 최소 1).
//            - 해석은 길흉 단정이 아니라 구조(체용·역할·책임)로 제시한다.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.SajuChart = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var GL = typeof window !== "undefined" ? window : globalThis;
  var STEM = "甲乙丙丁戊己庚辛壬癸", BRANCH = "子丑寅卯辰巳午未申酉戌亥";
  var STEM_KO = "갑을병정무기경신임계", BRANCH_KO = "자축인묘진사오미신유술해";
  var STEM_EL = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
  var BRANCH_EL = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
  var EL_HZ = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };
  var ANIMAL = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  // 12절(월 경계) — 315°(입춘)부터 30°씩
  var JEOL = ["입춘(立春)", "경칩(驚蟄)", "청명(淸明)", "입하(立夏)", "망종(芒種)", "소서(小暑)", "입추(立秋)", "백로(白露)", "한로(寒露)", "입동(立冬)", "대설(大雪)", "소한(小寒)"];
  // 십성(十星)
  var TEN = ["비견(比肩)", "겁재(劫財)", "식신(食神)", "상관(傷官)", "편재(偏財)", "정재(正財)", "편관(偏官)", "정관(正官)", "편인(偏印)", "정인(正印)"];
  var ELI = { 목: 0, 화: 1, 토: 2, 금: 3, 수: 4 };
  // 지장간 본기(本氣) — 십성 계산용
  var BR_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function eph() { return GL.AstroEphemeris; }
  function jdOf(y, m, d, hUT) { return eph().julianDay(y, m, d, 0) + hUT / 24; }
  function AE() { return GL.Astronomy; }
  // 정밀 태양 시황경: Astronomy Engine(MIT, 오차 1분 이내) 우선, 없으면 사주RPG 천문 코어 + 광행차·장동 보정
  function sunLon(jd) {
    if (AE()) return AE().SunPosition(new Date(jd2ms(jd))).elon;
    var T = (jd - 2451545) / 36525, om = 125.04 - 1934.136 * T;
    return (eph().sunLongitude(jd) - 0.00569 - 0.00478 * Math.sin(om * Math.PI / 180) + 360) % 360;
  }
  function ms2jd(ms) { return ms / 86400000 + 2440587.5; }
  function jd2ms(jd) { return (jd - 2440587.5) * 86400000; }

  // 한국 표준시 보정: 1954-03-21 ~ 1961-08-09 는 UTC+8:30, 서머타임 시기는 +1h
  var DST = [["1948-06-01T00", "1948-09-13T00"], ["1949-04-03T00", "1949-09-11T00"], ["1950-04-01T00", "1950-09-10T00"], ["1951-05-06T00", "1951-09-09T00"],
    ["1955-05-05T00", "1955-09-09T00"], ["1956-05-20T00", "1956-09-30T00"], ["1957-05-05T00", "1957-09-22T00"], ["1958-05-04T00", "1958-09-21T00"], ["1959-05-03T00", "1959-09-20T00"], ["1960-05-01T00", "1960-09-18T00"],
    ["1987-05-10T02", "1987-10-11T03"], ["1988-05-08T02", "1988-10-09T03"]];
  function tzOffset(y, m, d, hh) {
    var key = y + "-" + pad(m) + "-" + pad(d) + "T" + pad(hh);
    var base = (key >= "1954-03-21T00" && key < "1961-08-10T00") ? 8.5 : 9;
    for (var i = 0; i < DST.length; i++) if (key >= DST[i][0] && key < DST[i][1]) return { tz: base + 1, dst: true, base: base };
    return { tz: base, dst: false, base: base };
  }

  // 태양 황경이 target°에 닿는 순간(JD)을 근사값 근처에서 이분법으로 찾는다
  function crossing(target, jdGuess) {
    if (AE()) { var t = AE().SearchSunLongitude(target, new Date(jd2ms(jdGuess - 20)), 45); if (t) return ms2jd(t.date.getTime()); }
    var a = jdGuess - 20, b = jdGuess + 20;
    function f(j) { var x = sunLon(j) - target; x = ((x + 540) % 360) - 180; return x; }
    for (var k = 0; k < 60; k++) { var mid = (a + b) / 2; if (f(mid) >= 0) b = mid; else a = mid; }
    return (a + b) / 2;
  }
  // 그 해(양력)의 12절 입절 시각 (KST ms 기준 Date 문자열 포함)
  function solarTermsOf(year) {
    var out = [];
    for (var k = 0; k < 12; k++) {
      var deg = (315 + 30 * k) % 360;
      // 입춘 ≈ 2/4, 이후 약 30.44일 간격, 소한은 이듬해 1/6 무렵 → 해당 연도 1월 소한은 k=11 이전 해
      var approx = jdOf(year, 2, 4, 0) + k * 30.44;
      var j = crossing(deg, approx);
      out.push({ name: JEOL[k], deg: deg, jd: j, kst: fmtKst(j) });
    }
    return out;
  }
  function fmtKst(jd) { var dt = new Date(jd2ms(jd) + 9 * 3600000); return dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate()) + " " + pad(dt.getUTCHours()) + ":" + pad(dt.getUTCMinutes()); }

  function pillar(si, bi) { return { s: si, b: bi, hz: STEM[si] + BRANCH[bi], ko: STEM_KO[si] + BRANCH_KO[bi], sEl: STEM_EL[si], bEl: BRANCH_EL[bi] }; }
  function idx60(si, bi) { for (var n = 0; n < 60; n++) if (n % 10 === si && n % 12 === bi) return n; return 0; }
  function from60(n) { n = ((n % 60) + 60) % 60; return pillar(n % 10, n % 12); }
  function dayIndex(y, m, d) { var a = Date.UTC(y, m - 1, d), b = Date.UTC(2000, 0, 1); return (((Math.round((a - b) / 86400000) + 54) % 60) + 60) % 60; }
  function tenGod(dayStem, otherStem) {
    var de = ELI[STEM_EL[dayStem]], oe = ELI[STEM_EL[otherStem]], same = (dayStem % 2) === (otherStem % 2);
    var rel = (oe - de + 5) % 5; // 0 같음 1 내가 생함 2 내가 극함 3 나를 극함 4 나를 생함
    return TEN[rel * 2 + (same ? 0 : 1)];
  }
  function lunarToSolar(y, m, d, leap) {
    var K = GL.KoreanLunarCalendar; if (!K) return null;
    var c = new K(); if (!c.setLunarDate(y, m, d, !!leap)) return null;
    var s = c.getSolarCalendar(); return { y: s.year, m: s.month, d: s.day };
  }

  function compute(o) {
    o = o || {};
    if (!eph() && !AE()) return { ok: false, error: "천문 엔진이 없습니다" };
    var y = +o.y, m = +o.m, d = +o.d, note = [];
    var tu = !!o.timeUnknown || o.hh === "" || o.hh == null;
    var hh = tu ? 12 : +o.hh, mm = tu ? 0 : (+o.mm || 0);
    var input = { cal: o.cal || "solar", y: y, m: m, d: d, leap: !!o.leap };
    if (o.cal === "lunar") {
      var s = lunarToSolar(y, m, d, o.leap);
      if (!s) return { ok: false, error: "음력 날짜를 양력으로 바꿀 수 없습니다 (1000~2050년, 윤달 여부를 확인해 주세요)" };
      note.push("음력 " + y + "년 " + (o.leap ? "윤" : "") + m + "월 " + d + "일 → 양력 " + s.y + "-" + pad(s.m) + "-" + pad(s.d));
      y = s.y; m = s.m; d = s.d;
    }
    // 실존 날짜 검증
    var chk = new Date(Date.UTC(y, m - 1, d));
    if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== m - 1 || chk.getUTCDate() !== d) return { ok: false, error: "존재하지 않는 날짜입니다" };
    if (y < 1900 || y > 2100) return { ok: false, error: "1900~2100년 사이만 계산합니다" };
    var tzi = tzOffset(y, m, d, hh);
    if (tzi.dst && !tu) note.push("서머타임 시기 출생 → 1시간 빼서 계산");
    if (tzi.base === 8.5 && !tu) note.push("1954~1961년 표준시(UTC+8:30) 적용");
    var jd = jdOf(y, m, d, hh + mm / 60 - tzi.tz);
    var lon = sunLon(jd);
    // 년주: 입춘 이전이면 전년
    var ipchun = crossing(315, jdOf(y, 2, 4, 0));
    var sy = jd < ipchun ? y - 1 : y;
    var yS = ((sy - 4) % 10 + 10) % 10, yB = ((sy - 4) % 12 + 12) % 12;
    // 월주: 황경 기준 寅월(0)부터
    var mi = Math.floor((((lon - 315) % 360) + 360) % 360 / 30);
    var mS = ((yS % 5) * 2 + 2 + mi) % 10, mB = (2 + mi) % 12;
    // 일주·시주: 출생지 시계 기준(서머타임만 1시간 뺌). 23시 이후는 다음 날 일주.
    var clk = new Date(Date.UTC(y, m - 1, d, hh, mm) - (tzi.dst ? 3600000 : 0));
    var dy = clk.getUTCFullYear(), dm = clk.getUTCMonth() + 1, dd = clk.getUTCDate();
    var localH = tu ? 12 : clk.getUTCHours() + clk.getUTCMinutes() / 60;
    var di = dayIndex(dy, dm, dd);
    if (!tu && localH >= 23) di = (di + 1) % 60;
    var dP = from60(di);
    var hB = tu ? null : Math.floor((localH + 1) / 2) % 12;
    var hS = tu ? null : ((dP.s % 5) * 2 + hB) % 10;
    var P = { year: pillar(yS, yB), month: pillar(mS, mB), day: dP, hour: tu ? null : pillar(hS, hB) };
    // 대운
    var gender = o.gender === "F" ? "F" : "M";
    var yang = yS % 2 === 0, fwd = (gender === "M" && yang) || (gender === "F" && !yang);
    var curDeg = (315 + 30 * mi) % 360, nextDeg = (curDeg + 30) % 360;
    var prevJ = crossing(curDeg, jd - 15), nextJ = crossing(nextDeg, jd + 15);
    if (prevJ > jd) prevJ = crossing(curDeg, jd - 30);
    if (nextJ < jd) nextJ = crossing(nextDeg, jd + 30);
    var days = fwd ? (nextJ - jd) : (jd - prevJ);
    var dsu = Math.max(1, Math.round(days / 3));
    var m60 = idx60(mS, mB), dw = [];
    for (var k = 1; k <= 10; k++) { var p = from60(m60 + (fwd ? k : -k)); p.age = dsu + (k - 1) * 10; p.year = sy + p.age; p.ten = tenGod(dP.s, p.s); dw.push(p); }
    // 오행 분포
    var cnt = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    [P.year, P.month, P.day, P.hour].forEach(function (q) { if (q) { cnt[q.sEl]++; cnt[q.bEl]++; } });
    // 십성
    ["year", "month", "hour"].forEach(function (k2) { if (P[k2]) P[k2].ten = tenGod(dP.s, P[k2].s); });
    ["year", "month", "day", "hour"].forEach(function (k2) { if (P[k2]) P[k2].bten = tenGod(dP.s, BR_MAIN_STEM[P[k2].b]); });
    P.day.ten = "일간(日干)";
    return {
      ok: true, input: input, solar: { y: y, m: m, d: d, hh: tu ? null : hh, mm: tu ? null : mm }, timeUnknown: tu, gender: gender,
      pillars: P, daewoon: { forward: fwd, su: dsu, list: dw, basis: (fwd ? "다음 절입 " : "이전 절입 ") + fmtKst(fwd ? nextJ : prevJ) + " · " + days.toFixed(1) + "일 ÷ 3" },
      monthTerm: JEOL[mi] + " 이후", sunLon: Math.round(lon * 100) / 100, ipchun: fmtKst(ipchun), counts: cnt,
      dayMaster: { hz: STEM[dP.s], ko: STEM_KO[dP.s], el: STEM_EL[dP.s], yang: dP.s % 2 === 0 },
      animal: ANIMAL[yB], notes: note
    };
  }
  return { name: "sajuChart", version: "1.0.0", compute: compute, solarTermsOf: solarTermsOf, lunarToSolar: lunarToSolar, tenGod: tenGod,
    STEM: STEM, BRANCH: BRANCH, STEM_KO: STEM_KO, BRANCH_KO: BRANCH_KO, STEM_EL: STEM_EL, BRANCH_EL: BRANCH_EL, EL_HZ: EL_HZ, JEOL: JEOL };
}));
