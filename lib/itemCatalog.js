// ============================================================
// @module    lib/itemCatalog.js
// @layer     picnic game library — 생성형 아이템·포션·설계 카드 도감
// @public    ItemCatalog.{ITEM_COUNT, item(id), searchItems(q,limit), POTION_COUNT, potion(id), searchPotions(q,limit),
//                         CARDS, card(kind,i), RARITY}
// @doctrine  - 아이템 = (기반 24 × 오행 5 × 접두 20 × 등급 5) = 12,000종. id로 결정론 복원 (저장 공간 0).
//            - 포션 = (정수 15 × 오행 5 × 농도 5) = 375종, 각 3가지 쓰임(마시기·전투·연금 촉매) = 용도 1,125가지.
//            - 설계 카드 = 지능 코어 10 · 기체 10 · 동력 10 (기획서 v0.2), 각 카드는 오행과 빛/현기 성향을 지닌다.
//            - 아이템 이름은 웃음과 신화를 섞는다(지니의 호리병, 알라딘풍 램프 등 고대 전설 모티프).
// ============================================================
(function (global, factory) {
  var api = factory();
  if (typeof module === "object" && typeof module.exports === "object") module.exports = api;
  if (global) global.ItemCatalog = api;
}(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this), function () {
  "use strict";
  var EL = ["목", "화", "토", "금", "수"], ELHZ = { "목": "木", "화": "火", "토": "土", "금": "金", "수": "水" };
  var ELADJ = { "목": "푸른 숲", "화": "홍염", "토": "황토", "금": "백금", "수": "심해" };
  var RARITY = [{ n: "일반", c: "#cfd6e6" }, { n: "고급", c: "#8fe3b0" }, { n: "희귀", c: "#7cc4ff" }, { n: "영웅", c: "#d39bff" }, { n: "전설", c: "#ffd36b" }];
  var BASES = [ // [이름, 분류, 아이콘 형태, 한 줄 해학]
    ["지니의 호리병", "고대 유물", "vial", "문지르면 소원 대신 고객센터 대기번호가 나옵니다"], ["알라딘풍 마법 램프", "고대 유물", "flame", "램프의 정령이 연차 휴가 중입니다"],
    ["양자 회로칩", "로봇 부품", "chip", "관측하기 전엔 고장인지 아닌지 모릅니다"], ["오리하르콘 주괴", "연금술 재료", "ingot", "아틀란티스 반품 기한 지남"],
    ["미스릴 장갑판", "방어구", "plate", "가볍지만 할부는 무겁습니다"], ["성광 배터리", "로봇 부품", "battery", "별빛 100% 충전, 체감 80%"],
    ["플라즈마 오브", "마법 도구", "orb", "들여다보면 내 통장 잔고가 보입니다"], ["룬 석판", "고대 유물", "rune", "고대 문자로 '여기 낙서 금지'"],
    ["시그널 별", "장신구", "star", "반짝일 때마다 알림이 옵니다"], ["백서 두루마리", "설계 카드", "scroll", "읽으면 똑똑해지고 졸립니다"],
    ["번개석", "연금술 재료", "bolt", "정전기 주의, 머리카락 주의"], ["공명 반지", "장신구", "ring", "끼면 남의 속마음이 2초 늦게 들립니다"],
    ["메모리 디스크", "로봇 부품", "disk", "어젯밤 기억은 삭제되었습니다"], ["암호 열쇠", "특수 소비", "key", "비밀번호는 1234입니다(아님)"],
    ["데이터 수정", "연금술 재료", "crystal", "빛에 비추면 엑셀 표가 보입니다"], ["톱니바퀴 심장", "로봇 부품", "gear", "째깍째깍, 감정도 째깍째깍"],
    ["유동성 이슬", "연금술 재료", "drop", "중앙은행이 아침마다 뿌립니다"], ["생명의 잎", "연금술 재료", "leaf", "물만 줘도 배당이 자랍니다"],
    ["바람 깃털", "장신구", "feather", "주사위를 한 칸 더 굴러가게 합니다(기분상)"], ["파동 안테나", "무기", "antenna", "파동포 발사 시 와이파이 끊김"],
    ["은하 나침반", "마법 도구", "orb", "북쪽 대신 돈 냄새를 가리킵니다"], ["드래곤 비늘 방패", "방어구", "plate", "용이 탈피하고 버린 것"],
    ["블랙홀 사탕", "특수 소비", "orb", "한번 빨면 시간이 사라집니다"], ["토성 고리 부메랑", "무기", "ring", "던지면 6년 뒤 돌아옵니다"]
  ];
  var PREFIX = [["날카로운", "공격 +1"], ["단단한", "방어 +1"], ["재빠른", "속도 +1"], ["거대한", "체력 +15%"], ["빛나는", "모든 능력 +"], ["고대의", "지식 +2"],
    ["양자", "확률 조작"], ["신비한", "마법 +2"], ["정밀한", "명중 +"], ["폭주하는", "공격 +2 / 방어 −1"], ["잔잔한", "명상 +1"], ["황금빛", "수익 +5%"],
    ["서리 낀", "적 둔화"], ["번뜩이는", "선제 행동"], ["묵직한", "방어 +2 / 속도 −1"], ["축복받은", "행운 +"], ["저주받은", "공격 +3 / 체력 −10%"], ["행운의", "전리품 +"],
    ["영롱한", "빛 성향 +"], ["은밀한", "현기 성향 +"]];
  var ITEM_COUNT = BASES.length * 5 * PREFIX.length * 5;
  function item(id) {
    id = ((id % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT;
    var r = id % 5, t = Math.floor(id / 5), pf = t % PREFIX.length; t = Math.floor(t / PREFIX.length);
    var e = t % 5, b = Math.floor(t / 5), B = BASES[b];
    var light = (b + pf + e) % 2 === 0;
    return { id: id, name: PREFIX[pf][0] + " " + ELADJ[EL[e]] + "의 " + B[0], cat: B[1], shape: B[2], joke: B[3], el: EL[e], hz: ELHZ[EL[e]],
      rarity: r, rarityName: RARITY[r].n, rarityColor: RARITY[r].c, effect: PREFIX[pf][1], align: light ? "빛" : "현기", power: (r + 1) * 10 + pf };
  }
  function searchItems(q, limit) {
    var out = [], L = limit || 40; q = (q || "").trim();
    for (var i = 0; i < ITEM_COUNT && out.length < L; i++) { var it = item(i); if (!q || (it.name + it.cat + it.rarityName + it.hz + it.align + it.effect).indexOf(q) >= 0) out.push(it); }
    return out;
  }
  var ESSENCE = [ // [이름, 색, 마시기, 전투, 연금 촉매]
    ["생명", "#7ef0a8", "로봇 수리: 로봇 내구도 회복", "아군 회복과 부활", "로봇 체력 강화"], ["분노", "#ff7a7a", "다음 전투 공격력 상승", "아군 공격 3턴 상승", "로봇 공격력 강화"],
    ["강철", "#c9ced8", "다음 전투 방어력 상승", "아군 방어 3턴 상승", "로봇 방어력 강화"], ["질풍", "#9fe8ff", "주사위 +1 이동", "아군 즉시 재행동", "속도 강화"],
    ["화염", "#ffa36b", "주변 몬스터에 화염 피해", "적에게 화염 피해", "쌍격 부여"], ["독", "#a6e36b", "상대의 다음 통행료 수입 반감", "적 중독", "관통 부여"],
    ["행운", "#ffe36b", "양자 관측권 +1", "치명타 확률 상승", "로봇 개체 수 +1"], ["황금", "#ffd36b", "즉시 현금 획득", "전리품 2배", "제조 비용 환급"],
    ["시간", "#b9a6ff", "감찰청 즉시 석방", "아군 한 부대 추가 행동", "재생 부여"], ["투명", "#e8f4ff", "다음 통행료 1회 면제", "부대 은신", "비행 부여"],
    ["예지", "#8fb3ff", "다음 국면과 시세 예측", "적 정보 공개", "원거리 부여"], ["공포", "#7a6bd9", "몬스터 쫓아내기", "적 기절", "반격 무시 부여"],
    ["번영", "#7ff0d0", "보유 섹터 시세 상승", "아군 사기 상승", "조화 합성 보장"], ["혼돈", "#ff9fe0", "무작위 섹터 요동", "적 전체 무작위 피해", "무작위 강화"],
    ["지식", "#a6c8ff", "지식 포인트 +", "마법 피해 증가", "숨은 제조법 단서"]];
  var GRADE = ["미약한", "보통의", "진한", "농축된", "전설의"];
  var POTION_COUNT = ESSENCE.length * 5 * 5;
  function potion(id) {
    id = ((id % POTION_COUNT) + POTION_COUNT) % POTION_COUNT;
    var g = id % 5, t = Math.floor(id / 5), e = t % 5, s = Math.floor(t / 5), E = ESSENCE[s];
    var m = [1, 1.6, 2.4, 3.5, 5][g];
    return { id: id, ess: s, essName: E[0], el: EL[e], hz: ELHZ[EL[e]], grade: g, name: GRADE[g] + " " + ELADJ[EL[e]] + " " + E[0] + "의 물약", color: E[1], flask: (s + e) % 5, mag: m,
      uses: [{ ctx: "마시기", text: E[2] }, { ctx: "전투", text: E[3] }, { ctx: "연금 촉매", text: E[4] }] };
  }
  function searchPotions(q, limit) { var out = [], L = limit || 40; q = (q || "").trim(); for (var i = 0; i < POTION_COUNT && out.length < L; i++) { var p = potion(i); if (!q || (p.name + p.uses.map(function (u) { return u.text; }).join("")).indexOf(q) >= 0) out.push(p); } return out; }
  // 설계 카드 (기획서 v0.2: 지능 코어 · 기체 · 동력)
  var CARDS = {
    core: [["양자", 9, 2, 1.3, "수"], ["전략", 6, 4, 1.2, "금"], ["금융", 3, 3, 1.8, "토"], ["전투", 10, 2, .8, "화"], ["의료", 2, 6, 1.0, "목"], ["탐험", 5, 4, 1.1, "수"], ["외교", 3, 5, 1.4, "토"], ["연금", 6, 3, 1.3, "화"], ["예지", 7, 3, 1.2, "목"], ["창조", 8, 5, 1.5, "금"]],
    body: [["미스릴", 4, 8, 1.0, "금"], ["수정", 5, 5, 1.2, "수"], ["백금", 3, 9, 1.1, "금"], ["오리하르콘", 7, 9, 1.2, "토"], ["흑요석", 8, 4, .9, "수"], ["세계수 목재", 3, 6, 1.4, "목"], ["화산암", 6, 7, .9, "화"], ["성운 직물", 4, 4, 1.3, "목"], ["운석철", 7, 6, 1.0, "토"], ["드래곤 본", 9, 7, 1.0, "화"]],
    power: [["태양", 8, 2, 1.3, "화"], ["에테르", 5, 4, 1.4, "목"], ["성광", 7, 3, 1.5, "금"], ["반물질", 11, 1, 1.1, "수"], ["지열", 4, 5, 1.2, "토"], ["뇌전", 9, 2, 1.0, "목"], ["월광", 4, 6, 1.3, "수"], ["혜성", 8, 3, 1.2, "화"], ["중력", 6, 6, 1.1, "토"], ["카르마", 6, 5, 1.6, "금"]]
  };
  function card(kind, i) { var c = CARDS[kind][i]; return { kind: kind, i: i, name: c[0], atk: c[1], def: c[2], prod: c[3], el: c[4], hz: ELHZ[c[4]], label: { core: "지능 코어", body: "기체", power: "동력" }[kind] }; }
  return { name: "itemCatalog", version: "1.0.0", ITEM_COUNT: ITEM_COUNT, item: item, searchItems: searchItems, POTION_COUNT: POTION_COUNT, potion: potion, searchPotions: searchPotions, CARDS: CARDS, card: card, RARITY: RARITY, ESSENCE: ESSENCE };
}));
