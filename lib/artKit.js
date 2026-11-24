// ============================================================
// @module    lib/artKit.js
// @layer     picnic game library — 자주 나오는 몬스터·지휘관 정밀 초상 (인라인 SVG)
// @public    ArtKit.monster(index, glow) / ArtKit.commander(key) / ArtKit.KEYS
// @doctrine  - 외부 이미지 0. 64×64 좌표에 그라데이션 몸통·림라이트·소품으로 특징을 또렷하게.
//            - 각 몬스터는 이름의 경제 개념을 모양으로 말한다(인플레=부푸는 젤리 속 동전, 숏셀러=하락 화살표 넥타이 …).
//            - 같은 입력 → 같은 그림.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.ArtKit = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var n = 0;
  function id() { return "ak" + (++n); }
  function rg(i, a, b, c) { return '<radialGradient id="' + i + '" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="' + a + '"/><stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></radialGradient>'; }
  function lg(i, a, b, v) { return '<linearGradient id="' + i + '" x1="0" y1="0" x2="' + (v ? 0 : 1) + '" y2="' + (v ? 1 : 0) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function wrap(defs, body, glow) {
    var g = "";
    if (glow) { var gi = id(); defs += '<radialGradient id="' + gi + '"><stop offset="0" stop-color="' + glow + '" stop-opacity=".7"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient>'; g = '<circle cx="32" cy="34" r="31" fill="url(#' + gi + ')"/>'; }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs>' + defs + '</defs>' + g + '<ellipse cx="32" cy="59" rx="17" ry="3.2" fill="#000" opacity=".22"/>' + body + "</svg>";
  }
  var EYE = function (x, y, r, col) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + (r * 1.15) + '" fill="' + (col || "#241c3a") + '"/><circle cx="' + (x - r * .35) + '" cy="' + (y - r * .45) + '" r="' + (r * .42) + '" fill="#fff"/><circle cx="' + (x + r * .35) + '" cy="' + (y + r * .3) + '" r="' + (r * .18) + '" fill="#fff" opacity=".8"/>'; };
  var ANGRY = function (x, y, r, col, flip) { return EYE(x, y, r, col) + '<path d="M' + (x - r * 1.4) + " " + (y - r * (flip ? 1.1 : 1.9)) + " L" + (x + r * 1.4) + " " + (y - r * (flip ? 1.9 : 1.1)) + '" stroke="#241c3a" stroke-width="1.8" stroke-linecap="round"/>'; };
  var BLUSH = function (y) { return '<ellipse cx="20" cy="' + y + '" rx="3.6" ry="2" fill="#ff7aa8" opacity=".35"/><ellipse cx="44" cy="' + y + '" rx="3.6" ry="2" fill="#ff7aa8" opacity=".35"/>'; };
  var M = [];
  // 0 인플레 슬라임 — 동전을 삼키며 부푸는 민트 젤리, 머리 위 상승 화살표
  M[0] = function () { var a = id(), b = id(); return [rg(a, "#e9fff6", "#8fe3c0", "#3fae88") + lg(b, "#ffe9a0", "#d9a531", 1),
    '<path d="M8 54 C3 40 12 15 32 14 C52 15 61 40 56 54 C52 60 12 60 8 54Z" fill="url(#' + a + ')" stroke="#2f8f6e" stroke-width="1.2"/>' +
    '<circle cx="22" cy="46" r="4.2" fill="url(#' + b + ')" stroke="#b9861d" stroke-width=".8" opacity=".85"/><circle cx="40" cy="49" r="3.4" fill="url(#' + b + ')" stroke="#b9861d" stroke-width=".8" opacity=".7"/><circle cx="33" cy="52" r="2.6" fill="url(#' + b + ')" opacity=".6"/>' +
    '<path d="M14 26 C16 20 22 17 27 17" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="46" cy="22" r="1.6" fill="#fff" opacity=".7"/>' +
    '<path d="M44 12 l6 -7 6 7 h-3.6 v6 h-4.8 v-6z" fill="#ff8f8f" stroke="#c94f4f" stroke-width=".8"/>' + EYE(25, 33, 3.6) + EYE(39, 33, 3.6) + BLUSH(40) + '<path d="M28 41 q4 4 8 0" stroke="#1f5c47" stroke-width="1.8" fill="none" stroke-linecap="round"/>'] };
  // 1 버블 요정 — 비눗방울 날개, 별 지팡이, 거품 드레스
  M[1] = function () { var a = id(), w = id(); return [rg(a, "#fff4fb", "#ffc6e6", "#e98cc0") + '<radialGradient id="' + w + '" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#c9f0ff" stop-opacity=".35"/><stop offset="1" stop-color="#b9a6ff" stop-opacity=".55"/></radialGradient>',
    '<circle cx="14" cy="26" r="11" fill="url(#' + w + ')" stroke="#d9c8ff" stroke-width=".8"/><circle cx="50" cy="26" r="11" fill="url(#' + w + ')" stroke="#d9c8ff" stroke-width=".8"/><circle cx="12" cy="40" r="6" fill="url(#' + w + ')"/><circle cx="52" cy="40" r="6" fill="url(#' + w + ')"/>' +
    '<path d="M20 56 C20 44 25 38 32 38 C39 38 44 44 44 56Z" fill="url(#' + a + ')" stroke="#d56fa8"/><circle cx="24" cy="55" r="3" fill="#fff" opacity=".7"/><circle cx="31" cy="56" r="3.3" fill="#fff" opacity=".7"/><circle cx="39" cy="55" r="3" fill="#fff" opacity=".7"/>' +
    '<circle cx="32" cy="27" r="13" fill="url(#' + a + ')" stroke="#d56fa8"/><path d="M20 22 C22 12 42 12 44 22 C40 17 24 17 20 22Z" fill="#ffe08a"/>' +
    EYE(27, 28, 3.4, "#5a3a7a") + EYE(37, 28, 3.4, "#5a3a7a") + BLUSH(33) + '<path d="M29.5 34 q2.5 2.4 5 0" stroke="#8a3a6a" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M47 52 L54 36" stroke="#c99a2e" stroke-width="1.6" stroke-linecap="round"/><path d="M54 30 l1.6 3.6 3.9 .4 -2.9 2.6 .8 3.8 -3.4 -2 -3.4 2 .8 -3.8 -2.9 -2.6 3.9 -.4z" fill="#ffe08a" stroke="#c99a2e" stroke-width=".7"/>'] };
  // 2 숏셀러 늑대 — 회색 늑대, 붉은 하락 화살표 넥타이, 날카로운 귀
  M[2] = function () { var a = id(), t = id(); return [rg(a, "#f1f4fa", "#b9c4d8", "#6f7d99") + lg(t, "#ff8f8f", "#b33a3a", 1),
    '<path d="M14 26 L16 4 L28 18Z" fill="url(#' + a + ')" stroke="#56627c"/><path d="M50 26 L48 4 L36 18Z" fill="url(#' + a + ')" stroke="#56627c"/><path d="M18 19 L18.5 10 L24 17Z M46 19 L45.5 10 L40 17Z" fill="#ffc0cf"/>' +
    '<path d="M10 40 C10 24 20 15 32 15 C44 15 54 24 54 40 C54 50 46 56 32 56 C18 56 10 50 10 40Z" fill="url(#' + a + ')" stroke="#56627c" stroke-width="1.2"/>' +
    '<path d="M22 42 C24 36 40 36 42 42 C42 50 22 50 22 42Z" fill="#eef2f8"/><ellipse cx="32" cy="40" rx="3.4" ry="2.4" fill="#2a2340"/>' +
    ANGRY(24, 31, 3, "#2a6fd6") + ANGRY(40, 31, 3, "#2a6fd6", 1) + '<path d="M27 46 q5 3 10 0" stroke="#2a2340" stroke-width="1.4" fill="none"/><path d="M28.5 46.4 l1 2.4 1 -2.1z M35.5 46.4 l-1 2.4 -1 -2.1z" fill="#fff"/>' +
    '<path d="M29 54 h6 l-1 3 3 0 -5 6 -5 -6 3 0z" fill="url(#' + t + ')" stroke="#8a2a2a" stroke-width=".6"/>'] };
  // 3 부채 골렘 — 돌덩이 몸, 차용증 두루마리, 사슬, 금이 간 무늬
  M[3] = function () { var a = id(), p = id(); return [rg(a, "#efe2d2", "#c9a98a", "#7d6046") + lg(p, "#fffbea", "#eadcb4", 1),
    '<rect x="5" y="30" width="11" height="18" rx="5" fill="url(#' + a + ')" stroke="#5e4532"/><rect x="48" y="30" width="11" height="18" rx="5" fill="url(#' + a + ')" stroke="#5e4532"/>' +
    '<rect x="12" y="12" width="40" height="44" rx="12" fill="url(#' + a + ')" stroke="#5e4532" stroke-width="1.4"/><path d="M18 20 l5 6 -3 5 M46 44 l-5 -4 2 -6 M38 15 l-2 5" stroke="#6e523b" stroke-width="1.2" fill="none"/>' +
    '<rect x="19" y="24" width="26" height="9" rx="4" fill="#3b2c22"/><circle cx="26" cy="28.5" r="2.6" fill="#ffb84a"/><circle cx="38" cy="28.5" r="2.6" fill="#ffb84a"/><circle cx="26" cy="28.5" r="1" fill="#fff6d6"/><circle cx="38" cy="28.5" r="1" fill="#fff6d6"/>' +
    '<rect x="21" y="38" width="22" height="14" rx="2" fill="url(#' + p + ')" stroke="#b69a5c" stroke-width=".8" transform="rotate(-6 32 45)"/><path d="M24 42 h14 M24 45 h12 M24 48 h9" stroke="#8a7650" stroke-width=".9" transform="rotate(-6 32 45)"/><text x="31" y="51.5" font-size="5" fill="#b33a3a" font-weight="700" text-anchor="middle" transform="rotate(-6 32 45)">IOU</text>' +
    '<path d="M12 50 c4 3 8 3 12 0 c4 3 8 3 12 0 c4 3 8 3 12 0" stroke="#9aa0ad" stroke-width="2.2" fill="none" stroke-dasharray="3 2"/>'] };
  // 4 세금 유령 — 반투명 유령, 영수증 꼬리, 도장
  M[4] = function () { var a = id(); return ['<radialGradient id="' + a + '" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e8ecff" stop-opacity=".92"/><stop offset="1" stop-color="#aab4e8" stop-opacity=".75"/></radialGradient>',
    '<path d="M12 52 V30 C12 16 21 8 32 8 C43 8 52 16 52 30 V52 l-6.6 -5 -6.6 5 -6.8 -5 -6.6 5 -6.8 -5z" fill="url(#' + a + ')" stroke="#8f9ad6" stroke-width="1.2"/>' +
    '<path d="M44 46 l4 0 0 16 -2 -1.6 -2 1.6 -2 -1.6 -2 1.6 0 -16z" fill="#fffdf2" stroke="#c9c1a0" stroke-width=".7"/><path d="M41 50 h6 M41 53 h6 M41 56 h4" stroke="#a89f7a" stroke-width=".7"/>' +
    '<path d="M23 28 q3 -3 6 0 M35 28 q3 -3 6 0" stroke="#3a3560" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="37" rx="4" ry="3.2" fill="#3a3560" opacity=".8"/>' + BLUSH(33) +
    '<g transform="rotate(-18 16 44)"><rect x="9" y="40" width="13" height="9" rx="2" fill="#ffb3c0" stroke="#c94f6a" stroke-width=".8"/><text x="15.5" y="47" font-size="5.4" fill="#c94f6a" font-weight="900" text-anchor="middle">稅</text></g>'] };
  // 5 랜섬 박쥐 — 보랏빛 박쥐, 막 날개, 가슴의 자물쇠
  M[5] = function () { var a = id(), w = id(); return [rg(a, "#d9cdf6", "#8f7cbf", "#4e3f7a") + lg(w, "#6f5aa6", "#3a2d66", 1),
    '<path d="M22 32 C10 18 2 22 2 36 C6 33 8 38 11 35 C12 41 16 40 19 40 C19 44 22 43 24 42Z" fill="url(#' + w + ')" stroke="#2e2350"/><path d="M42 32 C54 18 62 22 62 36 C58 33 56 38 53 35 C52 41 48 40 45 40 C45 44 42 43 40 42Z" fill="url(#' + w + ')" stroke="#2e2350"/>' +
    '<path d="M22 16 L20 6 L28 13Z M42 16 L44 6 L36 13Z" fill="url(#' + a + ')" stroke="#3a2d66"/><circle cx="32" cy="34" r="16" fill="url(#' + a + ')" stroke="#3a2d66" stroke-width="1.2"/>' +
    ANGRY(26, 30, 3, "#ff4f6a") + ANGRY(38, 30, 3, "#ff4f6a", 1) + '<path d="M28 37 l2 3 2 -2 2 2 2 -3" stroke="#fff" stroke-width="1.4" fill="none" stroke-linejoin="round"/>' +
    '<rect x="27" y="42" width="10" height="8" rx="1.6" fill="#ffd66b" stroke="#b9861d"/><path d="M29 42 v-2.6 a3 3 0 0 1 6 0 v2.6" stroke="#b9861d" stroke-width="1.4" fill="none"/><circle cx="32" cy="45.6" r="1.2" fill="#5a3a10"/>'] };
  // 6 해킹 거미 — 금속 몸통, 회로 무늬, 초록 빛 눈 여섯
  M[6] = function () { var a = id(); var legs = ""; for (var k = 0; k < 4; k++) { legs += '<path d="M24 ' + (38 + k * 3) + " Q10 " + (28 + k * 5) + " 5 " + (46 + k * 3) + '" stroke="#3b3b55" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M40 ' + (38 + k * 3) + " Q54 " + (28 + k * 5) + " 59 " + (46 + k * 3) + '" stroke="#3b3b55" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
    return [rg(a, "#b8bad6", "#6b6b8f", "#2e2e46"), legs + '<ellipse cx="32" cy="44" rx="14" ry="11" fill="url(#' + a + ')" stroke="#22223a"/><circle cx="32" cy="28" r="12" fill="url(#' + a + ')" stroke="#22223a" stroke-width="1.2"/>' +
    '<path d="M24 44 h6 v4 h6 M38 40 h4 v6 M27 50 h10" stroke="#7fffc1" stroke-width="1" fill="none" opacity=".9"/><circle cx="30" cy="48" r="1" fill="#7fffc1"/><circle cx="42" cy="46" r="1" fill="#7fffc1"/>' +
    '<circle cx="27" cy="26" r="2.6" fill="#7fffc1"/><circle cx="37" cy="26" r="2.6" fill="#7fffc1"/><circle cx="23.5" cy="22" r="1.5" fill="#7fffc1"/><circle cx="40.5" cy="22" r="1.5" fill="#7fffc1"/><circle cx="29" cy="20.5" r="1.2" fill="#7fffc1"/><circle cx="35" cy="20.5" r="1.2" fill="#7fffc1"/>' +
    '<circle cx="27" cy="26" r="5" fill="#7fffc1" opacity=".15"/><circle cx="37" cy="26" r="5" fill="#7fffc1" opacity=".15"/><text x="32" y="36" font-size="5" fill="#7fffc1" text-anchor="middle" font-family="monospace">01</text>'] };
  // 7 하락장 곰 — 갈색 곰, 둥근 귀, 배에 붉은 하락 차트
  M[7] = function () { var a = id(); return [rg(a, "#ecd3bd", "#b08a6b", "#6e4f36"),
    '<circle cx="16" cy="18" r="7" fill="url(#' + a + ')" stroke="#5a3f2a"/><circle cx="48" cy="18" r="7" fill="url(#' + a + ')" stroke="#5a3f2a"/><circle cx="16" cy="18" r="3.4" fill="#e9b9a0"/><circle cx="48" cy="18" r="3.4" fill="#e9b9a0"/>' +
    '<ellipse cx="32" cy="38" rx="22" ry="20" fill="url(#' + a + ')" stroke="#5a3f2a" stroke-width="1.2"/><ellipse cx="32" cy="45" rx="13" ry="10" fill="#f3e2d2"/>' +
    '<path d="M23 41 l5 2 4 -1 4 5 6 3" stroke="#e04a4a" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M42 50 l-3.4 .6 2.6 -3z" fill="#e04a4a"/>' +
    '<ellipse cx="32" cy="34" rx="6.5" ry="4.6" fill="#f3e2d2"/><ellipse cx="32" cy="32.4" rx="2.6" ry="1.8" fill="#2a2340"/>' + EYE(24, 27, 2.8) + EYE(40, 27, 2.8) + '<path d="M29 36.5 q3 1.6 6 0" stroke="#2a2340" stroke-width="1.3" fill="none"/>' +
    '<path d="M21 23 l6 1.6 M43 23 l-6 1.6" stroke="#3a2a1a" stroke-width="1.6" stroke-linecap="round"/>'] };
  // 8 뱀파이어 대부업자 — 높은 깃 망토, 창백한 얼굴, 장부
  M[8] = function () { var a = id(), f = id(); return [lg(a, "#7a3a64", "#2e1226", 1) + rg(f, "#ffffff", "#ecdff0", "#bfa8c9"),
    '<path d="M6 58 C8 36 16 22 32 22 C48 22 56 36 58 58Z" fill="url(#' + a + ')" stroke="#1e0a18"/><path d="M14 30 L8 10 L24 24Z M50 30 L56 10 L40 24Z" fill="#a03050" stroke="#1e0a18"/>' +
    '<ellipse cx="32" cy="26" rx="11" ry="12" fill="url(#' + f + ')" stroke="#7a5a8a"/><path d="M21 22 C22 12 42 12 43 22 L38 18 L32 22 L26 18Z" fill="#241024"/>' +
    '<ellipse cx="27.5" cy="26" rx="2" ry="2.3" fill="#d62a4a"/><ellipse cx="36.5" cy="26" rx="2" ry="2.3" fill="#d62a4a"/><circle cx="27" cy="25.2" r=".7" fill="#fff"/><circle cx="36" cy="25.2" r=".7" fill="#fff"/>' +
    '<path d="M28 32 q4 2.6 8 0" stroke="#5a2040" stroke-width="1.3" fill="none"/><path d="M29.4 32.6 l.8 2.2 .8 -1.9z M34.6 32.6 l-.8 2.2 -.8 -1.9z" fill="#fff"/>' +
    '<rect x="25" y="40" width="14" height="12" rx="1.4" fill="#4a2a18" stroke="#c99a2e" stroke-width=".9"/><path d="M27 43 h10 M27 46 h10 M27 49 h7" stroke="#c99a2e" stroke-width=".6"/><text x="32" y="38.5" font-size="4.6" fill="#ffd66b" text-anchor="middle" font-weight="700">%%%</text>'] };
  // 9 거품 드래곤 — 분홍 아기용, 비눗방울 숨결, 금관
  M[9] = function () { var a = id(), w = id(), bb = id(); return [rg(a, "#fff0f4", "#ff9fb5", "#d65a7e") + lg(w, "#ffc0d0", "#c95a80", 1) + '<radialGradient id="' + bb + '" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#a6e3ff" stop-opacity=".35"/></radialGradient>',
    '<path d="M18 32 C6 20 2 30 3 40 C7 36 9 40 12 38 C13 42 16 41 19 40Z" fill="url(#' + w + ')" stroke="#a03a5e"/><path d="M46 32 C58 20 62 30 61 40 C57 36 55 40 52 38 C51 42 48 41 45 40Z" fill="url(#' + w + ')" stroke="#a03a5e"/>' +
    '<path d="M46 50 C58 52 60 42 54 38" stroke="#e07a98" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M54 38 l4 -4 l1 6z" fill="#ffd66b"/>' +
    '<ellipse cx="32" cy="40" rx="17" ry="16" fill="url(#' + a + ')" stroke="#a03a5e" stroke-width="1.2"/><ellipse cx="32" cy="46" rx="9" ry="7" fill="#ffe6ec"/><path d="M26 42 h12 M25 46 h14 M27 50 h10" stroke="#f2b7c6" stroke-width=".8"/>' +
    '<path d="M22 22 C18 14 20 10 24 8 C24 14 26 18 28 20Z" fill="#fff4d6" stroke="#c9a45c"/><path d="M42 22 C46 14 44 10 40 8 C40 14 38 18 36 20Z" fill="#fff4d6" stroke="#c9a45c"/>' +
    '<path d="M23 18 l3 -7 4 4 2 -6 2 6 4 -4 3 7z" fill="#ffd66b" stroke="#c99a2e" stroke-width=".8"/><circle cx="32" cy="10" r="1.4" fill="#7fd6ff"/>' +
    EYE(26, 33, 3.4) + EYE(38, 33, 3.4) + BLUSH(39) + '<path d="M29 40 q3 2.4 6 0" stroke="#a03a5e" stroke-width="1.4" fill="none"/>' +
    '<circle cx="8" cy="12" r="4" fill="url(#' + bb + ')" stroke="#a6c8ff" stroke-width=".6"/><circle cx="14" cy="5" r="2.6" fill="url(#' + bb + ')" stroke="#a6c8ff" stroke-width=".5"/><circle cx="56" cy="10" r="3" fill="url(#' + bb + ')" stroke="#a6c8ff" stroke-width=".5"/>'] };
  // 10 블랙스완 — 우아한 검은 백조, 붉은 부리, 별빛 깃털
  M[10] = function () { var a = id(); return [rg(a, "#6a6488", "#2f2a44", "#120f1e"),
    '<path d="M10 46 C10 34 24 30 36 34 C46 37 56 34 58 28 C60 40 52 54 34 56 C20 57 10 54 10 46Z" fill="url(#' + a + ')" stroke="#0a0814" stroke-width="1"/>' +
    '<path d="M18 44 C24 38 34 38 42 42 M20 49 C28 45 38 46 46 48" stroke="#8a84b0" stroke-width="1" fill="none" opacity=".7"/>' +
    '<path d="M30 36 C30 22 26 14 20 13 C14 12 12 18 16 20" stroke="url(#' + a + ')" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    '<path d="M15 19 L7 22 L15 23Z" fill="#e0384a" stroke="#8a1a2a" stroke-width=".6"/><circle cx="19.5" cy="15.5" r="1.8" fill="#ffd66b"/><circle cx="19.2" cy="15.1" r=".6" fill="#fff"/>' +
    '<path d="M44 38 l1 2.4 2.6 .2 -2 1.7 .6 2.5 -2.2 -1.4 -2.2 1.4 .6 -2.5 -2 -1.7 2.6 -.2z" fill="#fff1a8" opacity=".9"/><circle cx="34" cy="48" r=".9" fill="#fff"/><circle cx="50" cy="44" r=".7" fill="#fff"/><circle cx="26" cy="50" r=".6" fill="#fff"/>'] };
  // 11 성운 고래 수호신 — 별이 비치는 푸른 고래, 물줄기 왕관
  M[11] = function () { var a = id(); return ['<radialGradient id="' + a + '" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#e6f6ff"/><stop offset=".45" stop-color="#8fd0ff"/><stop offset=".8" stop-color="#6a7cff"/><stop offset="1" stop-color="#4a3aa6"/></radialGradient>',
    '<path d="M4 40 C4 26 18 18 34 20 C50 22 58 32 56 42 C62 38 63 30 62 26 C64 34 62 46 54 50 C46 56 22 58 12 52 C6 49 4 45 4 40Z" fill="url(#' + a + ')" stroke="#3a2f86" stroke-width="1.1"/>' +
    '<path d="M10 46 C22 52 40 52 52 46" stroke="#e6f6ff" stroke-width="1.2" fill="none" opacity=".7"/><path d="M14 49 h28 M16 52 h22" stroke="#cfe8ff" stroke-width=".8" opacity=".6"/>' +
    '<circle cx="30" cy="30" r="1" fill="#fff"/><circle cx="40" cy="27" r=".8" fill="#fff"/><circle cx="46" cy="36" r="1.1" fill="#fff1a8"/><circle cx="24" cy="38" r=".7" fill="#fff"/><path d="M36 33 l.8 1.8 2 .2 -1.5 1.3 .4 1.9 -1.7 -1 -1.7 1 .4 -1.9 -1.5 -1.3 2 -.2z" fill="#fff1a8"/>' +
    '<path d="M24 20 C22 12 18 10 16 6 M24 20 C26 12 30 10 30 5 M24 20 C24 13 24 9 23 3" stroke="#a6e3ff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="16" cy="6" r="1.6" fill="#e6f6ff"/><circle cx="30" cy="5" r="1.6" fill="#e6f6ff"/><circle cx="23" cy="3" r="1.6" fill="#ffd66b"/>' +
    EYE(15, 38, 2.6) + '<path d="M7 44 q5 3 10 1" stroke="#3a2f86" stroke-width="1.3" fill="none" stroke-linecap="round"/>' + '<ellipse cx="19" cy="43" rx="2.6" ry="1.4" fill="#ff7aa8" opacity=".35"/>'] };
  function monster(i, glow) { var f = M[i]; if (!f) return null; var r = f(); return wrap(r[0], r[1], glow); }

  // ---- 지휘관 초상 (사람 + AI 7인) ----
  function face(skin, hair, eyes, extra) { var a = id(); return ['<radialGradient id="' + a + '" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="' + skin + '"/><stop offset="1" stop-color="' + skin + '" stop-opacity=".85"/></radialGradient>', a]; }
  var C = {
    human: function () { var s = face("#ffe0cc"), b = id(); return [s[0] + lg(b, "#7fd6ff", "#2a6fd6", 1), '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="url(#' + b + ')" stroke="#1a3a7a"/><path d="M26 42 L32 50 L38 42" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="32" cy="52" r="2.2" fill="#ffd66b" stroke="#c99a2e" stroke-width=".6"/>' +
      '<ellipse cx="32" cy="26" rx="12" ry="13" fill="url(#' + s[1] + ')" stroke="#d9a58a"/><path d="M19 24 C19 10 45 10 45 24 C42 18 36 16 32 18 C28 16 22 18 19 24Z" fill="#3a2a40"/>' +
      '<path d="M19 22 C20 16 44 16 45 22 L45 27 C40 25 24 25 19 27Z" fill="#7fd6ff" opacity=".55" stroke="#2a6fd6" stroke-width=".8"/>' + EYE(27.5, 28, 2.2, "#2a3a6a") + EYE(36.5, 28, 2.2, "#2a3a6a") + '<path d="M29 34 q3 2 6 0" stroke="#a0564a" stroke-width="1.2" fill="none"/>'] },
    athena: function () { var s = face("#ffe6d6"), h = id(); return [s[0] + lg(h, "#e6ecff", "#7f8fd6", 1), '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#9fb8ff" stroke="#4a5a9a"/><path d="M14 60 L22 42 M50 60 L42 42" stroke="#e6ecff" stroke-width="1.4"/>' +
      '<ellipse cx="32" cy="28" rx="11" ry="12" fill="url(#' + s[1] + ')" stroke="#d9a58a"/><path d="M18 26 C16 10 48 10 46 26 L44 22 C40 14 24 14 20 22Z" fill="url(#' + h + ')" stroke="#4a5a9a"/><path d="M32 6 C30 12 30 16 32 18 C34 16 34 12 32 6Z" fill="#ff8a8a"/>' +
      '<circle cx="24" cy="21" r="3" fill="#fff" stroke="#4a5a9a" stroke-width=".6"/><circle cx="40" cy="21" r="3" fill="#fff" stroke="#4a5a9a" stroke-width=".6"/><circle cx="24" cy="21" r="1.3" fill="#2a2340"/><circle cx="40" cy="21" r="1.3" fill="#2a2340"/>' + EYE(28, 30, 2, "#3a4a8a") + EYE(36, 30, 2, "#3a4a8a") + '<path d="M29.5 35.5 q2.5 1.6 5 0" stroke="#a0564a" stroke-width="1.1" fill="none"/>'] },
    hermes: function () { var s = face("#ffe6d6"); return [s[0], '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#7ff0e0" stroke="#2a8a7a"/><path d="M28 44 v12 M32 42 v14 M36 44 v12" stroke="#1f6a5e" stroke-width="1.2"/>' +
      '<ellipse cx="32" cy="28" rx="11" ry="12" fill="url(#' + s[1] + ')" stroke="#d9a58a"/><path d="M19 24 C20 12 44 12 45 24 C40 20 24 20 19 24Z" fill="#c9a45c"/><ellipse cx="32" cy="18" rx="15" ry="4" fill="#e6c27a" stroke="#a07a2a"/>' +
      '<path d="M17 18 C10 12 8 16 7 20 C10 18 12 20 14 19 M47 18 C54 12 56 16 57 20 C54 18 52 20 50 19" fill="#fff" stroke="#c9c9d9" stroke-width=".8"/>' + EYE(28, 29, 2, "#1f6a5e") + EYE(36, 29, 2, "#1f6a5e") + '<path d="M28.5 34.5 q3.5 2.6 7 0" stroke="#a0564a" stroke-width="1.2" fill="none"/>'] },
    hephaestus: function () { var s = face("#f0c9a8"); return [s[0], '<path d="M8 60 C10 44 20 38 32 38 C44 38 54 44 56 60Z" fill="#ffb36b" stroke="#a05a1a"/><rect x="22" y="44" width="20" height="14" rx="2" fill="#7a5a3a" stroke="#4a3220"/>' +
      '<ellipse cx="32" cy="27" rx="12" ry="12" fill="url(#' + s[1] + ')" stroke="#b07a5a"/><path d="M20 30 C20 42 44 42 44 30 C40 36 24 36 20 30Z" fill="#8a4a2a"/><path d="M20 22 C22 12 42 12 44 22" stroke="#8a4a2a" stroke-width="4" fill="none"/>' +
      '<rect x="20" y="20" width="24" height="6" rx="3" fill="#3a3a4a"/><circle cx="27" cy="23" r="3.2" fill="#ffd66b" stroke="#3a3a4a"/><circle cx="37" cy="23" r="3.2" fill="#ffd66b" stroke="#3a3a4a"/>' +
      '<path d="M48 40 l8 -10" stroke="#7a5a3a" stroke-width="2.4"/><rect x="52" y="24" width="9" height="6" rx="1" fill="#9aa0ad" stroke="#4a4a5a" transform="rotate(40 56 27)"/>'] },
    ares: function () { var s = face("#f5d0b8"), h = id(); return [s[0] + lg(h, "#ffb0b0", "#a02a2a", 1), '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#8a2a2a" stroke="#4a1010"/><path d="M14 46 L24 42 L32 48 L40 42 L50 46" stroke="#ffd66b" stroke-width="1.4" fill="none"/>' +
      '<ellipse cx="32" cy="29" rx="11" ry="12" fill="url(#' + s[1] + ')" stroke="#c08a6a"/><path d="M19 30 C17 12 47 12 45 30 L42 30 L42 24 L22 24 L22 30Z" fill="url(#' + h + ')" stroke="#5a1010"/>' +
      '<path d="M32 4 C24 6 22 12 24 16 C28 12 36 12 40 16 C42 12 40 6 32 4Z" fill="#ff4f4f" stroke="#5a1010"/><rect x="30.6" y="24" width="2.8" height="9" fill="#a02a2a"/>' + ANGRY(27, 29, 1.9, "#5a1010") + ANGRY(37, 29, 1.9, "#5a1010", 1) + '<path d="M29 36 h6" stroke="#8a3a2a" stroke-width="1.3"/>'] },
    isis: function () { var s = face("#f0c9a8"), w = id(); return [s[0] + lg(w, "#f0d9ff", "#8a5ad6", 1), '<path d="M4 50 C6 30 14 30 22 40 M60 50 C58 30 50 30 42 40" stroke="url(#' + w + ')" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#d6a6ff" stroke="#6a3aa6"/>' +
      '<path d="M18 40 C14 26 18 12 32 12 C46 12 50 26 46 40Z" fill="#241a40"/><ellipse cx="32" cy="28" rx="10.5" ry="11.5" fill="url(#' + s[1] + ')" stroke="#b07a5a"/>' +
      '<path d="M22 16 h20 l-2 4 h-16z" fill="#ffd66b" stroke="#c99a2e" stroke-width=".7"/><circle cx="32" cy="12" r="4" fill="none" stroke="#ffd66b" stroke-width="1.4"/><circle cx="32" cy="12" r="1.8" fill="#ff7aa8"/>' +
      '<path d="M25 29 h5 M34 29 h5" stroke="#241a40" stroke-width="1.6" stroke-linecap="round"/><path d="M29.5 35 q2.5 1.6 5 0" stroke="#a0564a" stroke-width="1.1" fill="none"/>'] },
    sophia: function () { var s = face("#ffe6d6"); return [s[0], '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#fff09a" stroke="#a08a2a"/><rect x="24" y="46" width="16" height="11" rx="1.4" fill="#fffbea" stroke="#a08a2a"/><path d="M32 46 v11" stroke="#a08a2a" stroke-width=".8"/>' +
      '<circle cx="32" cy="26" r="20" fill="none" stroke="#fff1a8" stroke-width="1" opacity=".7"/><ellipse cx="32" cy="27" rx="11" ry="12" fill="url(#' + s[1] + ')" stroke="#d9a58a"/>' +
      '<path d="M19 28 C16 12 48 12 45 28 C44 20 38 16 32 16 C26 16 20 20 19 28Z" fill="#e8e8f0"/><path d="M19 28 C18 36 20 42 22 44 M45 28 C46 36 44 42 42 44" stroke="#e8e8f0" stroke-width="3" fill="none"/>' +
      '<path d="M25 28 q2.5 -2 5 0 M34 28 q2.5 -2 5 0" stroke="#5a4a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M29.5 34 q2.5 1.6 5 0" stroke="#a0564a" stroke-width="1.1" fill="none"/>' +
      '<path d="M32 3 l1.4 3.2 3.4 .3 -2.6 2.2 .8 3.4 -3 -1.8 -3 1.8 .8 -3.4 -2.6 -2.2 3.4 -.3z" fill="#ffd66b"/>'] },
    chronos: function () { var s = face("#f5dccb"); return [s[0], '<path d="M10 60 C12 46 20 40 32 40 C44 40 52 46 54 60Z" fill="#a6e3ff" stroke="#2a6a8a"/><circle cx="32" cy="51" r="6.5" fill="#fff" stroke="#2a6a8a"/><path d="M32 47 v4 l3 2" stroke="#2a6a8a" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="32" cy="27" rx="11" ry="12" fill="url(#' + s[1] + ')" stroke="#c09a8a"/><path d="M20 22 C22 12 42 12 44 22 C38 18 26 18 20 22Z" fill="#cfd6e6"/><path d="M22 34 C22 46 42 46 42 34 C38 40 26 40 22 34Z" fill="#e6ecf6"/>' +
      '<path d="M44 10 h8 l-3 5 3 5 h-8 l3 -5z" fill="#ffd66b" opacity=".9" stroke="#a07a2a" stroke-width=".7"/>' + EYE(27.5, 27, 1.9, "#2a6a8a") + EYE(36.5, 27, 1.9, "#2a6a8a") + '<path d="M29.5 33 q2.5 1.4 5 0" stroke="#8a5a4a" stroke-width="1.1" fill="none"/>'] }
  };
  function commander(key, ring) { var f = C[key]; if (!f) return null; var r = f(); var rr = ring ? '<circle cx="32" cy="32" r="30" fill="none" stroke="' + ring + '" stroke-width="2" opacity=".8"/>' : ""; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs>' + r[0] + '</defs><circle cx="32" cy="32" r="30" fill="#1a1636" opacity=".55"/>' + r[1] + rr + "</svg>"; }
  return { name: "artKit", version: "1.0.0", monster: monster, commander: commander, KEYS: Object.keys(C), COUNT: M.length };
}));
