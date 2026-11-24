// ============================================================
// @module    lib/scoreGrade.js
// @layer     picnic game library — 결과 등급·성찰 코멘트
// @origin    사주RPG domain/dungeon/dungeonScoreEngine.js (GRADES 표 → 달성률 → 등급) 일반화
// @public    ScoreGrade.evaluate({netWorth, startCash, rank, total, bankrupt}) → {grade, ratio, comment, question}
// @doctrine  - 점수는 벌이 아니라 거울: 등급과 함께 스스로에게 돌아오는 성찰 질문을 남긴다.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.ScoreGrade = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var GRADES = [
    { grade: "S", test: function (r, k) { return k === 1 && r >= 2.5; }, comment: "흐름을 읽은 것을 넘어, 스스로 흐름이 되었습니다." },
    { grade: "A", test: function (r, k) { return k === 1 || r >= 2.0; }, comment: "국면의 결을 따라 자산을 단단히 키웠습니다." },
    { grade: "B", test: function (r) { return r >= 1.2; }, comment: "지키며 키우는 균형이 작동했습니다." },
    { grade: "C", test: function () { return true; }, comment: "이번 판은 시장이 건넨 정보였습니다. 다음 판의 선택이 달라집니다." }
  ];
  var QUESTIONS = [
    "이번 판에서 당신의 선택은 공포와 탐욕 중 어디에서 출발했습니까?",
    "현금을 붙잡은 순간과 과감히 투자한 순간, 어느 쪽이 더 '나다운' 선택이었습니까?",
    "국면이 바뀔 때 당신은 흐름을 따랐습니까, 흐름을 거슬렀습니까? 그 이유는 무엇이었습니까?",
    "상대 AI의 수를 읽을 때, 당신은 그들의 성격을 보았습니까, 숫자를 보았습니까?",
    "잃은 자산이 당신에게 남긴 정보는 무엇입니까?"
  ];
  function evaluate(s) {
    var ratio = s.startCash > 0 ? s.netWorth / s.startCash : 0;
    var g = GRADES[GRADES.length - 1];
    if (!s.bankrupt) for (var i = 0; i < GRADES.length; i++) if (GRADES[i].test(ratio, s.rank)) { g = GRADES[i]; break; }
    return { grade: g.grade, ratio: Math.round(ratio * 100) / 100, comment: g.comment,
      question: QUESTIONS[Math.abs(Math.round(s.netWorth)) % QUESTIONS.length] };
  }
  return { name: "scoreGrade", version: "1.0.0", evaluate: evaluate, GRADES: GRADES };
}));
