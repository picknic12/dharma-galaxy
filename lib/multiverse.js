// ============================================================
// @module    lib/multiverse.js
// @layer     picnic game library — 재귀 평행우주 보드 생성기
// @public    Multiverse.{SECT, root(), sub(parentWorld, portalIdx, depth, seed, kind), UNIVERSE_KINDS}
// @doctrine  - 보드 = 우주. 각 우주는 순환 항로(loop)이며, 차원 포털·블랙홀이 하위 우주를 낳는다.
//            - 하위 우주는 lazy 생성(진입 시), seed 결정론 → 같은 게임 seed면 같은 다중우주.
//            - 깊어질수록 자산 가격·임대료 배율↑ (위험과 보상의 비례). 최대 깊이 4.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.Multiverse = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var SECT = {
    A: { name: "항성 채권", c: "#9fc4ff" }, B: { name: "행성 광물", c: "#ffadc4" }, C: { name: "우주 벤처", c: "#c4abff" },
    D: { name: "우주 거주지", c: "#ffc79c" }, E: { name: "항성 에너지", c: "#93ecc9" }, F: { name: "은하 대기업", c: "#ffe07f" },
    ETF: { name: "은하 ETF", c: "#93e2ff" }, CRYPTO: { name: "퀀텀 코인", c: "#ffbf8f" }
  };
  function P(name, g, price, build, rent) { return { type: "prop", name: name, g: g, price: price, build: build, rent: rent }; }
  function root() {
    var S = [
      { type: "start", name: "모항성 기지" },
      P("은하연방 국채", "A", 60, 50, [4, 20, 60, 180, 320, 450]),
      { type: "news", name: "우주 뉴스" },
      P("성간 회사채", "A", 70, 50, [5, 25, 75, 200, 350, 500]),
      { type: "tax", name: "성간 관세", rate: 0.1 },
      { type: "etf", name: "오리온 지수 ETF", g: "ETF", price: 200 },
      P("달 헬륨-3 광산", "B", 100, 50, [6, 30, 90, 270, 400, 550]),
      P("소행성대 니켈", "B", 100, 50, [6, 30, 90, 270, 400, 550]),
      { type: "jail", name: "은하 감찰청" },
      P("희토류 행성", "B", 120, 50, [8, 40, 100, 300, 450, 600]),
      { type: "crypto", name: "퀀텀코인", g: "CRYPTO", price: 150 },
      P("AI 함선 벤처", "C", 140, 100, [10, 50, 150, 450, 625, 750]),
      { type: "portal", name: "차원 포털" },
      P("테라포밍 벤처", "C", 140, 100, [10, 50, 150, 450, 625, 750]),
      { type: "etf", name: "안드로메다 ETF", g: "ETF", price: 200 },
      P("웜홀 핀테크", "C", 160, 100, [12, 60, 180, 500, 700, 900]),
      { type: "bank", name: "은하 중앙은행" },
      P("화성 돔시티", "D", 180, 100, [14, 70, 200, 550, 750, 950]),
      { type: "news", name: "우주 뉴스" },
      P("궤도 정거장", "D", 180, 100, [14, 70, 200, 550, 750, 950]),
      P("유로파 해저도시", "D", 200, 100, [16, 80, 220, 600, 800, 1000]),
      { type: "etf", name: "성운 배당 ETF", g: "ETF", price: 200 },
      P("반물질 발전소", "E", 220, 150, [18, 90, 250, 700, 875, 1050]),
      { type: "crypto", name: "스타토큰", g: "CRYPTO", price: 150 },
      { type: "blackhole", name: "블랙홀" },
      P("다이슨 스웜", "E", 240, 150, [20, 100, 300, 750, 925, 1100]),
      { type: "portal", name: "차원 포털" },
      P("성간 물류연합", "F", 280, 200, [24, 120, 360, 850, 1025, 1200]),
      { type: "etf", name: "암흑물질 ETF", g: "ETF", price: 200 },
      P("성간 조선소", "F", 300, 200, [26, 130, 390, 900, 1100, 1275]),
      { type: "tax", name: "은하 법인세", amount: 100 },
      P("은하 거래소", "F", 350, 200, [35, 175, 500, 1100, 1300, 1500])
    ];
    return { id: "W0", name: "제1우주 · 은하 본류", kind: 0, depth: 0, parent: null, portalIdx: -1, spaces: S, hue: 250 };
  }
  var UNIVERSE_KINDS = [
    { name: "거울 우주", hue: 200, words: ["반사", "거울", "역상", "대칭"] },
    { name: "양자 거품 우주", hue: 290, words: ["양자", "거품", "중첩", "확률"] },
    { name: "고대 문명 우주", hue: 40, words: ["고대", "유적", "룬", "황금"] },
    { name: "반물질 우주", hue: 330, words: ["반물질", "역류", "음전하", "소멸"] },
    { name: "꿈의 성운 우주", hue: 160, words: ["몽환", "성운", "기억", "꿈결"] },
    { name: "시간 정지 우주", hue: 60, words: ["정지", "영원", "시계", "초침"] }
  ];
  var NOUN = { A: ["채권", "국채"], B: ["광맥", "수정광산", "광물 행성"], C: ["벤처", "연구소"], D: ["정착지", "도시"], E: ["발전소", "에너지탑"], F: ["재벌", "연합"], ETF: ["지수 ETF"], CRYPTO: ["코인"] };
  function sub(parent, portalIdx, depth, rng, kindIdx) {
    var K = UNIVERSE_KINDS[kindIdx != null ? kindIdx : rng.int(0, UNIVERSE_KINDS.length - 1)];
    var mul = 1 + 0.55 * depth;
    var props = ["A", "B", "C", "D", "E", "F"];
    var g1 = rng.pick(props), g2 = rng.pick(props.filter(function (x) { return x !== g1; }));
    function mk(g, k) {
      var base = { A: 70, B: 110, C: 150, D: 190, E: 230, F: 300 }[g], bld = { A: 50, B: 50, C: 100, D: 100, E: 150, F: 200 }[g];
      var r0 = Math.round(base / 10);
      return P(rng.pick(K.words) + " " + rng.pick(NOUN[g]) + " " + "ⅠⅡⅢ"[k], g, Math.round(base * mul / 10) * 10, bld,
        [r0, r0 * 5, r0 * 15, r0 * 40, r0 * 55, r0 * 70].map(function (v) { return Math.round(v * (1 + 0.7 * depth)); }));
    }
    var S = [{ type: "gate", name: "귀환 게이트" }];
    var body = [mk(g1, 0), mk(g1, 1), mk(g1, 2), mk(g2, 0), mk(g2, 1), mk(g2, 2),
      { type: "treasure", name: "보물 행성" }, { type: "news", name: "평행 신호" },
      { type: "crypto", name: rng.pick(K.words) + " 코인", g: "CRYPTO", price: Math.round(150 * mul / 10) * 10 },
      { type: "blackhole", name: "블랙홀" }];
    if (depth < 4) body.push({ type: "portal", name: "심층 포털" }); else body.push({ type: "treasure", name: "보물 행성" });
    body = rng.shuffle(body);
    S = S.concat(body);
    return { id: null, name: K.name + " (깊이 " + depth + ")", kind: K, depth: depth, parent: parent.id, portalIdx: portalIdx, spaces: S, hue: K.hue };
  }
  return { name: "multiverse", version: "1.0.0", SECT: SECT, root: root, sub: sub, UNIVERSE_KINDS: UNIVERSE_KINDS };
}));
