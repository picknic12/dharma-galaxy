// ============================================================
// @module    lib/spriteKit.js
// @layer     picnic game library — 절차적 SVG 스프라이트 (몬스터·NPC·로봇·아이템·포션·말)
// @public    SpriteKit.{creature(opt), robot(opt), item(shape,color,rarity), potion(flask,color,el), pawn(color,face)}
// @doctrine  - 외부 이미지 0: 모든 그림은 인라인 SVG. 그라데이션 몸통 + 바닥 그림자 + 하이라이트(빛의 가장자리).
//            - 같은 입력 → 같은 그림 (도감·리플레이 일관성). id 충돌은 내부 카운터로 회피.
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.SpriteKit = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var uid = 0;
  function U() { return "sk" + (++uid); }
  function mix(hex, amt) { // amt>0 밝게, <0 어둡게
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)))); }
    return "#" + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function grad(id, c) {
    return '<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + mix(c, .55) + '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + mix(c, -.35) + '"/></radialGradient>';
  }
  function svg(inner, defs, cls) {
    return '<svg class="' + (cls || "spr") + '" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs>' + (defs || "") + "</defs>" + inner + "</svg>";
  }
  var SHADOW = '<ellipse cx="32" cy="59" rx="17" ry="3.2" fill="#000" opacity=".28"/>';

  function eyes(kind, y, gap, size) {
    y = y || 33; gap = gap || 8; size = size || 4.2;
    var s = "", xs = [32 - gap, 32 + gap];
    xs.forEach(function (x, i) {
      if (kind === "sleepy") { s += '<path d="M' + (x - size) + " " + y + " q" + size + " " + size * .8 + " " + size * 2 + ' 0" stroke="#2a2340" stroke-width="2" fill="none" stroke-linecap="round"/>'; return; }
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + size + '" ry="' + (size * 1.15) + '" fill="#fff"/>';
      s += '<circle cx="' + (x + (i ? -.6 : .6)) + '" cy="' + (y + .8) + '" r="' + (size * .62) + '" fill="#2a2340"/>';
      s += '<circle cx="' + (x + 1.2) + '" cy="' + (y - 1.2) + '" r="' + (size * .28) + '" fill="#fff"/>';
      if (kind === "angry") s += '<path d="M' + (x - size - 1) + " " + (y - size - 2 + (i ? 2 : 0)) + " L" + (x + size + 1) + " " + (y - size - 2 + (i ? 0 : 2)) + '" stroke="#2a2340" stroke-width="2.2" stroke-linecap="round"/>';
    });
    return s;
  }
  function cheeks(y) { return '<ellipse cx="20" cy="' + y + '" rx="3.4" ry="2" fill="#ff8fb1" opacity=".55"/><ellipse cx="44" cy="' + y + '" rx="3.4" ry="2" fill="#ff8fb1" opacity=".55"/>'; }

  // ---- 몬스터·NPC -------------------------------------------------
  // opt: {shape, color, eyes, horns, ears, wings, crown, tail, fangs, glow, legs, hood, bag, belly}
  function creature(o) {
    var id = U(), c = o.color || "#9be3c4", d = grad(id, c), g = "url(#" + id + ")", s = "";
    var edge = mix(c, -.45);
    if (o.glow) { d += '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + o.glow + '" stop-opacity=".75"/><stop offset="1" stop-color="' + o.glow + '" stop-opacity="0"/></radialGradient>'; s += '<circle cx="32" cy="34" r="30" fill="url(#' + id + 'g)"/>'; }
    s += SHADOW;
    var W = o.wings;
    if (W === "bat" || W === "dragon") {
      var wc = W === "dragon" ? mix(c, -.2) : mix(c, -.3);
      s += '<path d="M18 32 C6 22 2 30 3 40 C7 36 9 40 12 38 C13 42 16 41 19 40Z" fill="' + wc + '" stroke="' + edge + '" stroke-width="1"/>';
      s += '<path d="M46 32 C58 22 62 30 61 40 C57 36 55 40 52 38 C51 42 48 41 45 40Z" fill="' + wc + '" stroke="' + edge + '" stroke-width="1"/>';
    } else if (W === "fairy") {
      s += '<ellipse cx="14" cy="26" rx="10" ry="7" fill="#fff" opacity=".55" transform="rotate(-25 14 26)"/><ellipse cx="50" cy="26" rx="10" ry="7" fill="#fff" opacity=".55" transform="rotate(25 50 26)"/>';
    } else if (W === "angel") {
      s += '<path d="M16 34 C4 30 4 18 12 16 C14 24 18 28 22 30Z" fill="#fff" opacity=".9"/><path d="M48 34 C60 30 60 18 52 16 C50 24 46 28 42 30Z" fill="#fff" opacity=".9"/>';
    }
    if (o.tail) s += '<path d="M48 50 C58 50 60 42 56 38" stroke="' + mix(c, -.2) + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M56 38 l3 -4 l1 5z" fill="' + mix(c, -.3) + '"/>';
    if (o.legs === "spider") for (var k = 0; k < 4; k++) {
      s += '<path d="M24 ' + (42 + k * 3) + " Q12 " + (36 + k * 4) + " 8 " + (50 + k * 2) + '" stroke="' + edge + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      s += '<path d="M40 ' + (42 + k * 3) + " Q52 " + (36 + k * 4) + " 56 " + (50 + k * 2) + '" stroke="' + edge + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
    if (o.ears === "pointy") s += '<path d="M17 24 L20 8 L29 20Z" fill="' + g + '" stroke="' + edge + '"/><path d="M47 24 L44 8 L35 20Z" fill="' + g + '" stroke="' + edge + '"/><path d="M21 18 L22 12 L25 18Z" fill="#ffb3c7"/><path d="M43 18 L42 12 L39 18Z" fill="#ffb3c7"/>';
    if (o.ears === "round") s += '<circle cx="18" cy="20" r="6.5" fill="' + g + '" stroke="' + edge + '"/><circle cx="46" cy="20" r="6.5" fill="' + g + '" stroke="' + edge + '"/><circle cx="18" cy="20" r="3" fill="#ffc6d6"/><circle cx="46" cy="20" r="3" fill="#ffc6d6"/>';
    if (o.ears === "tuft") s += '<path d="M16 22 L14 8 L26 18Z" fill="' + mix(c, -.15) + '"/><path d="M48 22 L50 8 L38 18Z" fill="' + mix(c, -.15) + '"/>';
    var sh = o.shape || "round";
    if (sh === "blob") s += '<path d="M9 53 C5 40 13 17 32 16 C51 17 59 40 55 53 C51 59 13 59 9 53Z" fill="' + g + '" stroke="' + edge + '" stroke-width="1.2"/><ellipse cx="22" cy="25" rx="6" ry="3.5" fill="#fff" opacity=".55" transform="rotate(-30 22 25)"/>';
    else if (sh === "ghost") s += '<path d="M13 54 V32 C13 18 22 10 32 10 C42 10 51 18 51 32 V54 l-6.3 -5 -6.3 5 -6.4 -5 -6.3 5 -6.4 -5z" fill="' + g + '" stroke="' + edge + '" stroke-width="1.2"/>';
    else if (sh === "golem") s += '<rect x="11" y="14" width="42" height="42" rx="11" fill="' + g + '" stroke="' + edge + '" stroke-width="1.4"/><path d="M18 22 l5 6 -3 5 M45 44 l-5 -4 2 -6" stroke="' + edge + '" stroke-width="1.4" fill="none"/>';
    else if (sh === "bird") s += '<ellipse cx="32" cy="42" rx="19" ry="14" fill="' + g + '" stroke="' + edge + '"/><path d="M36 34 C36 22 30 16 24 18" stroke="' + c + '" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="24" cy="18" r="8" fill="' + g + '" stroke="' + edge + '"/><path d="M16 18 l-6 2 6 2z" fill="#ffb347"/>';
    else if (sh === "hood") s += '<path d="M10 56 C10 30 18 12 32 12 C46 12 54 30 54 56Z" fill="' + g + '" stroke="' + edge + '" stroke-width="1.2"/><ellipse cx="32" cy="34" rx="13" ry="12" fill="#3b2f4a"/>';
    else s += '<ellipse cx="32" cy="36" rx="21" ry="20" fill="' + g + '" stroke="' + edge + '" stroke-width="1.2"/>';
    if (o.belly) s += '<ellipse cx="32" cy="44" rx="11" ry="8" fill="' + mix(c, .6) + '" opacity=".8"/>';
    if (o.horns) s += '<path d="M20 18 C16 10 18 6 22 4 C22 10 24 14 26 16Z" fill="#fff4d6" stroke="#c9a45c"/><path d="M44 18 C48 10 46 6 42 4 C42 10 40 14 38 16Z" fill="#fff4d6" stroke="#c9a45c"/>';
    var ey = sh === "bird" ? 17 : (sh === "hood" ? 33 : 32);
    if (sh === "bird") s += '<circle cx="23" cy="16" r="2.6" fill="#2a2340"/><circle cx="24" cy="15" r=".9" fill="#fff"/>';
    else if (sh === "hood") s += '<circle cx="27" cy="33" r="2.4" fill="#ffe9a8"/><circle cx="37" cy="33" r="2.4" fill="#ffe9a8"/>';
    else { s += eyes(o.eyes || "cute", ey, o.eyeGap || 8, o.eyeSize || 4.2); s += cheeks(ey + 7); }
    if (sh !== "bird" && sh !== "hood") {
      if (o.fangs) s += '<path d="M25 44 q7 5 14 0" stroke="#2a2340" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M27 44.6 l1.4 3 1.4 -2.6z M37 44.6 l-1.4 3 -1.4 -2.6z" fill="#fff"/>';
      else s += '<path d="M28 43 q4 3.5 8 0" stroke="#2a2340" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    }
    if (o.crown) s += '<path d="M22 14 l3 -8 4 5 3 -7 3 7 4 -5 3 8z" fill="#ffd66b" stroke="#c99a2e"/><circle cx="32" cy="6" r="1.6" fill="#ff7aa8"/>';
    if (o.bag) s += '<rect x="42" y="38" width="14" height="14" rx="3" fill="#c98f5a" stroke="#8a5a32"/><path d="M45 38 v-3 h8 v3" stroke="#8a5a32" fill="none"/><circle cx="49" cy="45" r="2" fill="#ffd66b"/>';
    if (o.coin) s += '<circle cx="32" cy="46" r="6" fill="#ffd66b" stroke="#c99a2e"/><text x="32" y="49" font-size="8" text-anchor="middle" fill="#9a6a10" font-weight="700">₩</text>';
    return svg(s, d, o.cls);
  }

  // ---- 로봇 --------------------------------------------------------
  // opt: {chassis 0-5, color, accent, eye 0-3, antenna 0-4, arm, move}
  function robot(o) {
    var id = U(), c = o.color || "#cfd8ea", a = o.accent || "#7ad3ff", d = grad(id, c), g = "url(#" + id + ")", s = "", edge = mix(c, -.5);
    d += '<radialGradient id="' + id + 'v"><stop offset="0" stop-color="' + mix(a, .7) + '"/><stop offset="1" stop-color="' + a + '"/></radialGradient>';
    s += SHADOW;
    var mv = o.move || "legs";
    if (mv === "legs") s += '<rect x="22" y="48" width="6" height="9" rx="2" fill="' + mix(c, -.3) + '"/><rect x="36" y="48" width="6" height="9" rx="2" fill="' + mix(c, -.3) + '"/><rect x="19" y="55" width="11" height="4" rx="2" fill="' + edge + '"/><rect x="34" y="55" width="11" height="4" rx="2" fill="' + edge + '"/>';
    else if (mv === "tread") s += '<rect x="14" y="49" width="36" height="10" rx="5" fill="' + edge + '"/><circle cx="20" cy="54" r="3" fill="' + mix(c, .2) + '"/><circle cx="32" cy="54" r="3" fill="' + mix(c, .2) + '"/><circle cx="44" cy="54" r="3" fill="' + mix(c, .2) + '"/>';
    else if (mv === "hover") s += '<ellipse cx="32" cy="53" rx="14" ry="3.5" fill="' + a + '" opacity=".75"/><ellipse cx="32" cy="56" rx="9" ry="2" fill="' + a + '" opacity=".4"/>';
    else s += '<path d="M16 36 L2 26 L6 42Z" fill="' + a + '" opacity=".7"/><path d="M48 36 L62 26 L58 42Z" fill="' + a + '" opacity=".7"/><ellipse cx="32" cy="54" rx="8" ry="2.4" fill="' + a + '" opacity=".6"/>';
    var ch = (o.chassis || 0) % 6, body;
    if (ch === 0) body = '<rect x="15" y="26" width="34" height="26" rx="8"';
    else if (ch === 1) body = '<ellipse cx="32" cy="39" rx="18" ry="14"';
    else if (ch === 2) body = '<path d="M32 24 L50 33 L46 52 L18 52 L14 33Z"';
    else if (ch === 3) body = '<path d="M20 26 H44 L50 39 L44 52 H20 L14 39Z"';
    else if (ch === 4) body = '<rect x="18" y="24" width="28" height="29" rx="14"';
    else body = '<path d="M14 30 Q32 20 50 30 L46 52 H18Z"';
    s += body + ' fill="' + g + '" stroke="' + edge + '" stroke-width="1.3"/>';
    s += '<rect x="26" y="40" width="12" height="7" rx="2" fill="' + mix(c, -.25) + '"/><circle cx="32" cy="43.5" r="2.2" fill="url(#' + id + 'v)"/>';
    var arm = o.arm || "claw", ac = mix(c, -.2);
    if (arm === "cannon") s += '<rect x="46" y="34" width="14" height="6" rx="2" fill="' + ac + '" stroke="' + edge + '"/><circle cx="60" cy="37" r="2" fill="' + a + '"/><rect x="8" y="36" width="8" height="5" rx="2" fill="' + ac + '"/>';
    else if (arm === "shield") s += '<path d="M3 30 H15 V44 Q9 50 3 44Z" fill="' + mix(a, .3) + '" stroke="' + edge + '"/><rect x="48" y="36" width="9" height="5" rx="2" fill="' + ac + '"/>';
    else if (arm === "blade") s += '<path d="M50 38 L62 22 L58 40Z" fill="#eef4ff" stroke="' + edge + '"/><rect x="47" y="37" width="6" height="5" rx="1" fill="' + ac + '"/><rect x="8" y="36" width="8" height="5" rx="2" fill="' + ac + '"/>';
    else if (arm === "orb") s += '<circle cx="56" cy="32" r="5" fill="url(#' + id + 'v)" stroke="' + edge + '"/><circle cx="8" cy="32" r="5" fill="url(#' + id + 'v)" stroke="' + edge + '"/>';
    else if (arm === "wrench") s += '<path d="M48 38 L58 30 M58 30 l3 -1 -1 -3 -3 1z" stroke="' + ac + '" stroke-width="3.4" stroke-linecap="round"/><rect x="8" y="36" width="8" height="5" rx="2" fill="' + ac + '"/>';
    else s += '<path d="M48 36 l8 -2 2 6 -4 -2 -1 4z" fill="' + ac + '" stroke="' + edge + '"/><path d="M16 36 l-8 -2 -2 6 4 -2 1 4z" fill="' + ac + '" stroke="' + edge + '"/>';
    // 머리
    s += '<rect x="19" y="8" width="26" height="19" rx="8" fill="' + g + '" stroke="' + edge + '" stroke-width="1.3"/>';
    var ey = o.eye || 0;
    if (ey === 0) s += '<rect x="22" y="13" width="20" height="8" rx="4" fill="#1c1830"/><rect x="24" y="15" width="16" height="4" rx="2" fill="url(#' + id + 'v)"/>';
    else if (ey === 1) s += '<circle cx="27" cy="17" r="3.4" fill="#1c1830"/><circle cx="37" cy="17" r="3.4" fill="#1c1830"/><circle cx="27" cy="17" r="2" fill="' + a + '"/><circle cx="37" cy="17" r="2" fill="' + a + '"/>';
    else if (ey === 2) s += '<circle cx="32" cy="17" r="5.4" fill="#1c1830"/><circle cx="32" cy="17" r="3.4" fill="url(#' + id + 'v)"/><circle cx="33.4" cy="15.6" r="1" fill="#fff"/>';
    else s += '<path d="M24 18 q3 -4 6 0 M34 18 q3 -4 6 0" stroke="' + a + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    var an = o.antenna || 0;
    if (an === 1) s += '<path d="M32 8 V2" stroke="' + edge + '" stroke-width="1.6"/><circle cx="32" cy="2.5" r="2.2" fill="' + a + '"/>';
    else if (an === 2) s += '<path d="M24 9 L20 2 M40 9 L44 2" stroke="' + edge + '" stroke-width="1.6"/><circle cx="20" cy="2.5" r="1.8" fill="' + a + '"/><circle cx="44" cy="2.5" r="1.8" fill="' + a + '"/>';
    else if (an === 3) s += '<path d="M26 8 L32 1 L38 8Z" fill="' + a + '" opacity=".9"/>';
    else if (an === 4) s += '<ellipse cx="32" cy="7" rx="9" ry="2.6" fill="none" stroke="' + a + '" stroke-width="1.4"/>';
    s += '<ellipse cx="25" cy="11" rx="4" ry="1.6" fill="#fff" opacity=".5"/>';
    return svg(s, d, o.cls);
  }

  // ---- 아이템 카드 아이콘 (20형) ----------------------------------
  var SHAPES = {
    ingot: '<path d="M12 40 L20 28 H44 L52 40Z" fill="F" stroke="E"/><path d="M20 28 L24 22 H40 L44 28Z" fill="L"/>',
    gear: '<circle cx="32" cy="32" r="14" fill="F" stroke="E" stroke-width="7" stroke-dasharray="5 4"/><circle cx="32" cy="32" r="11" fill="F" stroke="E"/><circle cx="32" cy="32" r="4" fill="L"/>',
    plate: '<path d="M32 12 L50 20 V34 C50 44 42 50 32 54 C22 50 14 44 14 34 V20Z" fill="F" stroke="E"/><path d="M32 18 V48" stroke="L" stroke-width="2"/>',
    ring: '<circle cx="32" cy="36" r="13" fill="none" stroke="F" stroke-width="6"/><path d="M26 22 L32 14 L38 22 L32 26Z" fill="L" stroke="E"/>',
    chip: '<rect x="18" y="18" width="28" height="28" rx="4" fill="F" stroke="E"/><rect x="25" y="25" width="14" height="14" rx="2" fill="L"/><path d="M22 14v4M28 14v4M34 14v4M40 14v4M22 46v4M28 46v4M34 46v4M40 46v4M14 22h4M14 28h4M14 34h4M14 40h4M46 22h4M46 28h4M46 34h4M46 40h4" stroke="E" stroke-width="2"/>',
    disk: '<circle cx="32" cy="32" r="18" fill="F" stroke="E"/><circle cx="32" cy="32" r="5" fill="#1c1830"/><path d="M20 24 A14 14 0 0 1 32 16" stroke="L" stroke-width="2.4" fill="none"/>',
    key: '<circle cx="22" cy="26" r="9" fill="F" stroke="E"/><circle cx="22" cy="26" r="3.5" fill="#1c1830"/><path d="M29 31 L48 50 M40 42 l4 -4 M45 47 l4 -4" stroke="F" stroke-width="5" stroke-linecap="round"/>',
    antenna: '<path d="M32 50 V22" stroke="E" stroke-width="3"/><circle cx="32" cy="20" r="5" fill="F" stroke="E"/><path d="M20 14 A16 16 0 0 0 20 30 M44 14 A16 16 0 0 1 44 30" stroke="L" stroke-width="2.4" fill="none"/><rect x="24" y="48" width="16" height="6" rx="2" fill="F"/>',
    battery: '<rect x="20" y="16" width="24" height="38" rx="5" fill="F" stroke="E"/><rect x="27" y="11" width="10" height="5" rx="1" fill="E"/><path d="M34 22 L26 36 H33 L29 48 L39 32 H32Z" fill="L"/>',
    bolt: '<path d="M36 8 L16 36 H30 L26 56 L48 26 H34Z" fill="F" stroke="E"/>',
    flame: '<path d="M32 8 C40 20 50 26 48 40 C46 52 38 56 32 56 C24 56 16 50 16 40 C16 30 24 28 26 18 C30 24 30 28 32 30 C34 22 32 14 32 8Z" fill="F" stroke="E"/><path d="M32 34 C36 40 38 44 36 48 C34 52 28 52 28 46 C28 42 32 40 32 34Z" fill="L"/>',
    orb: '<circle cx="32" cy="32" r="17" fill="F" stroke="E"/><ellipse cx="26" cy="25" rx="6" ry="4" fill="L" opacity=".8"/><circle cx="32" cy="32" r="22" fill="none" stroke="F" opacity=".35"/>',
    scroll: '<rect x="16" y="16" width="32" height="34" rx="3" fill="F" stroke="E"/><path d="M22 24h20M22 30h20M22 36h14" stroke="E" stroke-width="2"/><rect x="12" y="12" width="40" height="7" rx="3.5" fill="L" stroke="E"/><rect x="12" y="47" width="40" height="7" rx="3.5" fill="L" stroke="E"/>',
    rune: '<path d="M20 12 H44 L50 50 H14Z" fill="F" stroke="E"/><path d="M28 22 L36 30 L28 38 M36 22 V42" stroke="L" stroke-width="2.6" fill="none"/>',
    crystal: '<path d="M32 6 L46 24 L40 56 H24 L18 24Z" fill="F" stroke="E"/><path d="M32 6 L32 56 M18 24 H46" stroke="L" stroke-width="1.4" opacity=".8"/>',
    star: '<path d="M32 8 L38 25 L56 25 L41 35 L47 53 L32 42 L17 53 L23 35 L8 25 L26 25Z" fill="F" stroke="E"/><circle cx="32" cy="31" r="4" fill="L"/>',
    vial: '<path d="M26 10 H38 V24 L48 46 C50 52 46 56 40 56 H24 C18 56 14 52 16 46 L26 24Z" fill="F" stroke="E"/><path d="M19 42 H45 L48 47 C49 52 46 54 41 54 H23 C18 54 15 52 16 47Z" fill="L" opacity=".8"/>',
    drop: '<path d="M32 8 C40 22 48 30 48 40 C48 50 40 56 32 56 C24 56 16 50 16 40 C16 30 24 22 32 8Z" fill="F" stroke="E"/><ellipse cx="26" cy="38" rx="4" ry="6" fill="L" opacity=".8"/>',
    leaf: '<path d="M14 50 C14 24 30 12 52 12 C52 34 40 50 14 50Z" fill="F" stroke="E"/><path d="M14 50 L44 20" stroke="L" stroke-width="2"/>',
    feather: '<path d="M50 10 C30 14 18 30 16 50 L22 48 C26 34 36 24 50 10Z" fill="F" stroke="E"/><path d="M16 54 L40 22" stroke="L" stroke-width="1.8"/>'
  };
  var RARITY_COL = ["#cfd6e6", "#8fe3b0", "#7cc4ff", "#d39bff", "#ffd36b"];
  function item(shape, color, rarity) {
    var id = U(), c = color, r = RARITY_COL[rarity || 0];
    var body = (SHAPES[shape] || SHAPES.orb).replace(/="F"/g, '="url(#' + id + ')"').replace(/="E"/g, '="' + mix(c, -.5) + '"').replace(/="L"/g, '="' + mix(c, .6) + '"');
    var d = grad(id, c) + '<radialGradient id="' + id + 'r"><stop offset=".55" stop-color="' + r + '" stop-opacity=".0"/><stop offset="1" stop-color="' + r + '" stop-opacity=".55"/></radialGradient>';
    return svg('<circle cx="32" cy="32" r="31" fill="url(#' + id + 'r)"/>' + body, d, "spr item");
  }
  var FLASKS = [
    { path: "M27 8 H37 V20 C46 24 52 32 52 40 C52 50 43 57 32 57 C21 57 12 50 12 40 C12 32 18 24 27 20Z", liq: "M14 40 C14 50 22 55 32 55 C42 55 50 50 50 40Z" },
    { path: "M26 8 H38 V22 L50 50 C51 54 48 57 44 57 H20 C16 57 13 54 14 50 L26 22Z", liq: "M18 42 H46 L50 51 C50 54 48 55 44 55 H20 C16 55 14 54 14 51Z" },
    { path: "M28 6 H36 V18 H42 C46 18 48 22 48 26 V52 C48 55 46 57 43 57 H21 C18 57 16 55 16 52 V26 C16 22 18 18 22 18 H28Z", liq: "M18 34 H46 V52 C46 54 44 55 42 55 H22 C20 55 18 54 18 52Z" },
    { path: "M28 6 H36 V16 L48 28 C54 34 54 44 48 50 L42 56 H22 L16 50 C10 44 10 34 16 28 L28 16Z", liq: "M14 40 C14 46 16 50 20 54 H44 C48 50 50 46 50 40Z" },
    { path: "M29 6 H35 V24 C42 26 46 30 46 36 C46 40 44 42 42 44 C46 46 48 50 48 52 C48 55 46 57 43 57 H21 C18 57 16 55 16 52 C16 50 18 46 22 44 C20 42 18 40 18 36 C18 30 22 26 29 24Z", liq: "M20 47 H44 C46 49 46 51 46 52 C46 54 44 55 42 55 H22 C20 55 18 54 18 52 C18 51 18 49 20 47Z" }
  ];
  function potion(flask, color, glow) {
    var f = FLASKS[(flask || 0) % FLASKS.length], id = U();
    var d = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(color, .45) + '"/><stop offset="1" stop-color="' + mix(color, -.25) + '"/></linearGradient>';
    d += '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + (glow || color) + '" stop-opacity=".6"/><stop offset="1" stop-color="' + (glow || color) + '" stop-opacity="0"/></radialGradient>';
    var s = '<circle cx="32" cy="40" r="28" fill="url(#' + id + 'g)"/>' +
      '<path d="' + f.path + '" fill="#eaf4ff" fill-opacity=".28" stroke="#d9e6ff" stroke-width="1.6"/>' +
      '<path d="' + f.liq + '" fill="url(#' + id + ')"/>' +
      '<rect x="26" y="3" width="12" height="6" rx="2" fill="#c98f5a" stroke="#8a5a32"/>' +
      '<ellipse cx="24" cy="34" rx="2.4" ry="7" fill="#fff" opacity=".55"/><circle cx="38" cy="48" r="1.6" fill="#fff" opacity=".7"/><circle cx="30" cy="51" r="1" fill="#fff" opacity=".7"/>';
    return svg(s, d, "spr item");
  }
  function pawn(color, ai, seed) {
    if (ai) return robot({ chassis: seed % 6, color: mix(color, .35), accent: color, eye: seed % 4, antenna: (seed >> 2) % 5, arm: "orb", move: "hover", cls: "spr pawn" });
    var id = U();
    var d = grad(id, color);
    var s = SHADOW + '<path d="M22 56 C22 46 26 40 28 34 H36 C38 40 42 46 42 56Z" fill="url(#' + id + ')" stroke="' + mix(color, -.5) + '"/>' +
      '<rect x="24" y="30" width="16" height="5" rx="2.5" fill="' + mix(color, -.2) + '"/>' +
      '<circle cx="32" cy="20" r="11" fill="url(#' + id + ')" stroke="' + mix(color, -.5) + '"/><circle cx="28" cy="16" r="3.4" fill="#fff" opacity=".6"/>' +
      '<path d="M26 8 l2 -5 4 4 4 -4 2 5z" fill="#ffd66b" stroke="#c99a2e"/>';
    return svg(s, d, "spr pawn");
  }
  return { name: "spriteKit", version: "1.0.0", creature: creature, robot: robot, item: item, potion: potion, pawn: pawn, mix: mix, ITEM_SHAPES: Object.keys(SHAPES), RARITY_COL: RARITY_COL };
}));

// ---- 행성·우주선·블랙홀 확장 (v1.1) ----------------------------------
(function (G) {
  var SK = G && G.SpriteKit; if (!SK) return;
  var mix = SK.mix, n = 0;
  function U() { return "pk" + (++n); }
  // 행성: seed로 줄무늬/크레이터/고리/대기 결정
  SK.planet = function (seed, color, opt) {
    opt = opt || {};
    var id = U(), c = color, s = "", h = seed >>> 0;
    var d = '<radialGradient id="' + id + '" cx="34%" cy="30%" r="80%"><stop offset="0" stop-color="' + mix(c, .65) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + mix(c, -.65) + '"/></radialGradient>' +
      '<radialGradient id="' + id + 'a"><stop offset=".62" stop-color="' + mix(c, .4) + '" stop-opacity="0"/><stop offset=".78" stop-color="' + mix(c, .5) + '" stop-opacity=".55"/><stop offset="1" stop-color="' + mix(c, .5) + '" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><circle cx="32" cy="32" r="19"/></clipPath>';
    s += '<circle cx="32" cy="32" r="30" fill="url(#' + id + 'a)"/>';
    var ring = opt.ring != null ? opt.ring : (h % 3 === 0);
    if (ring) s += '<ellipse cx="32" cy="32" rx="29" ry="7" fill="none" stroke="' + mix(c, .35) + '" stroke-width="2.4" opacity=".75" transform="rotate(-18 32 32)"/>';
    s += '<circle cx="32" cy="32" r="19" fill="url(#' + id + ')"/>';
    var g = '<g clip-path="url(#' + id + 'c)">', kind = h % 4;
    if (kind === 0) for (var i = 0; i < 4; i++) g += '<path d="M8 ' + (20 + i * 7 + (h >> i) % 3) + ' Q32 ' + (16 + i * 7) + ' 56 ' + (22 + i * 7) + '" stroke="' + mix(c, i % 2 ? .3 : -.25) + '" stroke-width="' + (2 + (h >> (i + 2)) % 3) + '" fill="none" opacity=".55"/>';
    else if (kind === 1) for (var j = 0; j < 5; j++) g += '<circle cx="' + (18 + (h >> (j * 3)) % 28) + '" cy="' + (18 + (h >> (j * 2 + 1)) % 28) + '" r="' + (1.6 + (h >> j) % 4) + '" fill="' + mix(c, -.35) + '" opacity=".5"/>';
    else if (kind === 2) g += '<path d="M14 30 C20 22 28 34 34 26 S46 30 50 24 L50 52 L14 52Z" fill="' + mix(c, -.3) + '" opacity=".45"/><path d="M18 40 C24 36 30 44 38 40" stroke="' + mix(c, .5) + '" stroke-width="2" fill="none" opacity=".6"/>';
    else g += '<circle cx="24" cy="26" r="7" fill="' + mix(c, .45) + '" opacity=".35"/><circle cx="40" cy="40" r="9" fill="' + mix(c, -.3) + '" opacity=".35"/>';
    s += g + '</g>';
    s += '<path d="M15 26 A19 19 0 0 1 32 13" stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>';
    if (ring) s += '<path d="M3.5 36.5 A29 7 -18 0 0 61 27" stroke="' + mix(c, .45) + '" stroke-width="2.4" fill="none" opacity=".85" transform="rotate(0)"/>';
    if (opt.station) s += '<rect x="44" y="10" width="12" height="4" rx="1" fill="#e8ecff"/><rect x="48" y="6" width="4" height="12" rx="1" fill="#c9d2f5"/><circle cx="50" cy="12" r="1.6" fill="#7ad3ff"/>';
    return '<svg class="spr planet" viewBox="0 0 64 64"><defs>' + d + '</defs>' + s + '</svg>';
  };
  SK.ship = function (color, ai) {
    var id = U(), c = color;
    var d = '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(c, .6) + '"/><stop offset="1" stop-color="' + mix(c, -.3) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'f"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="' + mix(c, .3) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
    var s = '<ellipse cx="32" cy="56" rx="7" ry="8" fill="url(#' + id + 'f)"/>';
    if (ai) s += '<path d="M32 6 L46 40 L40 50 H24 L18 40Z" fill="url(#' + id + ')" stroke="' + mix(c, -.5) + '"/><path d="M18 40 L6 50 L20 48Z M46 40 L58 50 L44 48Z" fill="' + mix(c, -.15) + '"/><rect x="27" y="22" width="10" height="7" rx="3" fill="#1c1830"/><rect x="28.5" y="24" width="7" height="3" rx="1.5" fill="#7af0ff"/>';
    else s += '<path d="M32 4 C40 14 44 26 42 44 L36 50 H28 L22 44 C20 26 24 14 32 4Z" fill="url(#' + id + ')" stroke="' + mix(c, -.5) + '"/><path d="M22 36 L10 50 L23 47Z M42 36 L54 50 L41 47Z" fill="' + mix(c, -.15) + '"/><circle cx="32" cy="22" r="5" fill="#bfe8ff" stroke="#fff"/><circle cx="30.5" cy="20.5" r="1.6" fill="#fff"/>';
    return '<svg class="spr ship" viewBox="0 0 64 64"><defs>' + d + '</defs>' + s + '</svg>';
  };
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
