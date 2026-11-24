// ================= v0.3 마법 100종 · 로봇 변신·장착 · 전설 유물 =================
// 마법 = 원형 20 × 오행 5 = 100종. 고전 RPG의 '유성우·연쇄 번개·시간 정지·부활' 같은 보편적 원형을 우주·오행 언어로 새로 지었다.
const SP_EL=[['목','청목'],['화','적염'],['토','황토'],['금','백금'],['수','흑수']];
const SP_ARCH=[ // [이름, 종류, 위력, 마나, 설명]  종류: atk(전투 피해) buf(전투 강화) heal econ move util
 ['유성우','atk',60,8,'하늘에서 작은 별들이 쏟아집니다'],['연쇄 번개','atk',45,6,'번개가 적에서 적으로 튀어 다닙니다'],['초신성 폭발','atk',90,14,'별 하나가 생을 마치며 빛을 터뜨립니다'],
 ['얼음 감옥','atk',35,5,'적을 시간째 얼려 버립니다'],['영혼 흡수','atk',40,6,'적의 기운을 빨아 로봇을 고칩니다'],['혼돈의 소용돌이','atk',55,9,'적 전체를 무작위로 휘젓습니다'],
 ['수호 방벽','buf',40,5,'빛의 벽이 로봇들을 감쌉니다'],['광전사의 외침','buf',45,6,'로봇들이 두려움을 잊습니다'],['가속의 바람','buf',30,4,'로봇들이 두 배로 빨라집니다'],['매혹의 노래','buf',50,8,'적이 싸울 이유를 잊습니다'],
 ['치유의 빛','heal',30,4,'모든 로봇의 상처를 메웁니다'],['부활의 불꽃','heal',100,12,'멈춘 로봇에 다시 심장을 켭니다'],
 ['금화의 비','econ',60,7,'하늘에서 금화가 내립니다'],['번영의 축복','econ',4,8,'내 섹터 시세가 오릅니다'],['연금 변환','econ',40,6,'포션 하나를 금으로 바꿉니다'],
 ['순간이동','move',0,6,'원하는 보물 행성으로 건너뜁니다'],['시간 정지','move',0,10,'한 번 더 차례를 얻습니다'],['차원문 열기','move',0,9,'바로 앞에 평행우주 포털을 엽니다'],
 ['예지의 눈','util',0,3,'다음 국면과 숨은 위협을 봅니다'],['정화의 종','util',0,5,'저주·독·감찰청 구속을 풉니다']];
const SPELLS=[];SP_ARCH.forEach((a,k)=>SP_EL.forEach(([el,adj],e)=>SPELLS.push({id:k*5+e,name:`${adj}의 ${a[0]}`,base:a[0],type:a[1],pow:Math.round(a[2]*(1+e*.04)),mp:a[3],el,desc:a[4]})));
function mpMax(p){const P=G.players[p];return 20+5*(P.ck||[]).filter(Boolean).length+Math.floor((P.know||0)/5)}
function spellInit(P,i){P.mp=12;P.spells=[];P.relics=[];for(let k=0;k<3;k++)learnSpell(i,true)}
function learnSpell(p,quiet){const P=G.players[p];const pool=SPELLS.filter(s=>!P.spells.includes(s.id));if(!pool.length)return null;
 // 내 일간 오행과 같은 계열을 조금 더 잘 배운다
 const fav=pool.filter(s=>s.el===P.el);const s=(fav.length&&rnd()<.4)?pick(fav):pick(pool);P.spells.push(s.id);
 if(!quiet&&p===0){log(`📜 새 마법 습득: 「${s.name}」 (${OH.HZ[s.el]} · ${s.desc})`,'good');sfx('merge')}return s}
function mpTick(){G.players.forEach((P,i)=>{if(P.out)return;P.mp=Math.min(mpMax(i),(P.mp||0)+4);P.robots.forEach(r=>{if(r.regen)r.hp=Math.min(100,r.hp+8)})})}
// 전투용 마법 고르기
function bestBattleSpell(p){const P=G.players[p];let b=null;for(const id of P.spells){const s=SPELLS[id];if((s.type==='atk'||s.type==='buf')&&s.mp<=P.mp&&(!b||s.pow>b.pow))b=s}return b}
function castBattle(p,s){const P=G.players[p];P.mp-=s.mp;spellFx(p,s);let bonus=s.pow;if(OH.saeng(G.astro.pillar.stemEl,s.el))bonus*=1.2;
 if(s.base==='영혼 흡수')P.robots.forEach(r=>r.hp=Math.min(100,r.hp+15));log(`🔮 ${who(p)} 「${s.name}」 시전! 전력 +${Math.round(bonus)}`,p===0?'good':'ai');return bonus}
function spellFx(p,s){const P=G.players[p];if(V.ok&&P.wid===V.view)lootBeam(P.wid,P.pos,OH.COLOR[s.el]);if(p===0){burst();sfx('pop',1,4,s.id%20)}}
// 필드 마법 시전 (사람·AI 공통)
async function castField(p,id){const P=G.players[p],s=SPELLS[id];if(!s||P.mp<s.mp||G.over)return false;
 if(s.type==='atk'||s.type==='buf')return false;P.mp-=s.mp;spellFx(p,s);let t='';
 switch(s.base){
  case '치유의 빛':P.robots.forEach(r=>r.hp=Math.min(100,r.hp+s.pow));t='로봇들이 회복되었습니다';break;
  case '부활의 불꽃':P.robots.forEach(r=>r.hp=100);t='모든 로봇이 완전히 회복되었습니다';break;
  case '금화의 비':P.cash+=s.pow;t=`+${fmt(s.pow)}`;break;
  case '번영의 축복':{const gs=new Set(allOwned(p).map(([w,i])=>sp(w,i).g));const m={};gs.forEach(g=>m[g]=s.pow);if(gs.size)shock(m);t='보유 섹터 시세 상승';break}
  case '연금 변환':if(P.potions.length){P.potions.shift();P.cash+=s.pow;t=`포션 하나가 ${fmt(s.pow)}이 되었습니다`}else{P.mp+=s.mp;return false}break;
  case '순간이동':{const ts=[];for(const wid in G.worlds)W(wid).spaces.forEach((x,i)=>{if(x.type==='treasure')ts.push([wid,i])});if(!ts.length){P.mp+=s.mp;return false}const [wid,i]=pick(ts);t=`${W(wid).name}의 보물 행성으로`;log(`🔮 ${who(p)} 「${s.name}」 — ${t}`,p===0?'good':'ai');await warpTo(p,wid,i,false);await land(p,7);renderAll();return true}
  case '시간 정지':P.extraTurn=1;t='이번 차례가 끝나면 한 번 더 움직입니다';break;
  case '차원문 열기':{const w=W(P.wid);if(w.depth>=4){P.mp+=s.mp;return false}log(`🔮 ${who(p)} 「${s.name}」 — 차원문이 열립니다`,p===0?'good':'ai');await portal(p);renderAll();return true}
  case '예지의 눈':{const nx=OH.PHASES[(G.phase+1)%5];const near=G.monsters.filter(x=>x.wid===P.wid&&((x.pos-P.pos+W(P.wid).spaces.length)%W(P.wid).spaces.length)<=12).length;t=`다음 국면 ${OH.HZ[nx.el]} ${nx.name}(${G.phaseLeft}일 후) · 전방 12칸 몬스터 ${near}마리`;chakra(p,5);break}
  case '정화의 종':P.jail=false;P.buff.poison=0;P.robots.forEach(r=>r.hp=Math.max(r.hp,60));t='구속과 독이 풀렸습니다';break;
 }
 log(`🔮 ${who(p)} 「${s.name}」 — ${t}`,p===0?'good':'ai');renderAll();return true}
function aiSpells(p){const P=G.players[p];if(P.mp<6)return;
 const own=P.spells.map(i=>SPELLS[i]);const dmg=P.robots.some(r=>r.hp<60);
 const pref=own.find(s=>dmg&&s.type==='heal'&&s.mp<=P.mp)||own.find(s=>s.type==='econ'&&s.base!=='연금 변환'&&s.mp<=P.mp&&P.mp>mpMax(p)*.7);
 if(pref)castField(p,pref.id)}
// ---- 로봇에게 포션 먹이기: 변신 ----
const FORMS={생명:['재생 장갑','regen'],분노:['광전사 모드','atk'],강철:['요새 모드','def'],질풍:['제트 모드','inc'],화염:['쌍격 화염포','atk2'],독:['관통 독침','atk'],행운:['행운 복제','copy'],
 황금:['황금 도금','refund'],시간:['시간 재생','regen'],투명:['스텔스 비행','def2'],예지:['원거리 조준경','atk'],공포:['공포의 가면','def'],번영:['번영 엔진','inc2'],혼돈:['혼돈 변이','chaos'],지식:['지식 각인','spell']};
function feedRobot(p,pi,ri_){const P=G.players[p];const r=P.robots[ri_],id=P.potions[pi];if(!r||id==null)return false;const po=IC.potion(id),m=po.mag;const [form,k]=FORMS[po.essName];P.potions.splice(pi,1);r.forms=r.forms||[];
 if(r.forms.length>=4){r.forms.shift()}r.forms.push(form);let t='';
 switch(k){case 'regen':r.regen=1;r.hp=100;t='매일 스스로 수리';break;case 'atk':r.atk=Math.round(r.atk+8*m);t=`공격 +${Math.round(8*m)}`;break;case 'atk2':r.atk=Math.round(r.atk*1.15+4);t='공격 ×1.15';break;
  case 'def':r.def=Math.round(r.def+8*m);t=`방어 +${Math.round(8*m)}`;break;case 'def2':r.def=Math.round(r.def*1.12+3);r.stealth=1;t='방어 ×1.12, 스텔스';break;
  case 'inc':r.income=Math.round((r.income+.6*m)*10)/10;t=`생산 +${(.6*m).toFixed(1)}`;break;case 'inc2':r.income=Math.round(r.income*1.2*10)/10;t='생산 ×1.2';break;
  case 'copy':if(P.robots.length<12){P.robots.push(Object.assign({},r,{forms:['행운 복제체'],hp:70}));t='쌍둥이 로봇이 태어났습니다'}else t='격납고가 가득 차 복제 실패';break;
  case 'refund':{const a=Math.round(r.cost*.3);P.cash+=a;t=`제조비 ${fmt(a)} 환급`;break}
  case 'chaos':{const d=ri(-6,16);r.atk=Math.max(5,r.atk+d);r.def=Math.max(5,r.def+ri(-6,16));t=`예측 불가 변이 (공격 ${d>=0?'+':''}${d})`;break}
  case 'spell':{const s=learnSpell(p,true);t=s?`마법 「${s.name}」을 각인`:'더 배울 마법이 없습니다';break}}
 if(p===0){log(`🦾 ${r.name} ← ${po.name}: ${form}! ${t}`,'good');sfx('merge');burst()}return true}
// ---- 장착 ----
const SLOT={무기:'w',방어구:'a',장신구:'t','로봇 부품':'t'};
function equip(p,ii,ri_){const P=G.players[p];const r=P.robots[ri_],id=P.items[ii];if(!r||id==null)return false;const it=IC.item(id);const sl=SLOT[it.cat];if(!sl)return false;r.eq=r.eq||{};
 if(r.eq[sl]!=null)P.items.push(r.eq[sl]);r.eq[sl]=id;P.items.splice(ii,1);if(p===0){log(`🛠 ${r.name}에 [${it.rarityName}] ${it.name} 장착`,'good');sfx('coin')}return true}
function eqBonus(r){const b={atk:0,def:0,inc:0};if(!r.eq)return b;for(const sl in r.eq){const it=IC.item(r.eq[sl]);const v=Math.round(it.power/3);if(sl==='w')b.atk+=v;else if(sl==='a')b.def+=v;else b.inc+=it.power/100}return b}
function aiGear(p){const P=G.players[p];if(!P.robots.length)return;
 for(let k=P.items.length-1;k>=0;k--){const it=IC.item(P.items[k]);const sl=SLOT[it.cat];if(!sl)continue;const r=P.robots.reduce((a,x)=>{const cur=x.eq&&x.eq[sl]!=null?IC.item(x.eq[sl]).power:-1;return cur<it.power&&(!a||cur<a.c)?{x,c:cur}:a},null);if(r)equip(p,k,P.robots.indexOf(r.x))}
 if(P.potions.length>2&&rnd()<.5){const r=P.robots.reduce((a,x)=>(!a||(x.forms||[]).length<(a.forms||[]).length)?x:a,null);feedRobot(p,0,P.robots.indexOf(r))}}
// ---- 전설 유물 (고대 지구의 신화·민담 모티프, 모두 공공 영역 전승) ----
const RELICS=[
 {n:'지니의 호리병',o:'아라비아 민담',c:3,d:'소원 3번: 현금 300억 · 차원 결정 · 원하는 곳으로',f:async p=>{const P=G.players[p];const v=isHuman(p)?await ask('🧞 호리병의 정령이 묻습니다. 무엇을 바라십니까?',[{t:'💰 300억',v:0,main:1},{t:'💠 차원 결정',v:1},{t:'🌀 보물 행성으로',v:2}],{auto:()=>P.shards>=3?1:0}):(P.shards>=2?1:0);
   if(v===0)addCash(p,300,`🧞 ${who(p)}의 소원: 300억`);else if(v===1)gainShard(p);else await castFieldFree(p,'순간이동')}},
 {n:'알라딘의 램프',o:'천일야화',c:1,d:'램프의 정령이 상대 AI 하나의 현금 15%를 공적자금으로 옮깁니다',f:p=>{const q=richest(p);if(q<0)return;const a=Math.round(G.players[q].cash*.15);G.players[q].cash-=a;G.pot+=a;log(`🪔 램프의 정령이 ${G.players[q].name}의 ${fmt(a)}을 공적자금으로 옮겼습니다`,'sys')}},
 {n:'여의주',o:'동아시아 용 신화',c:2,d:'모든 로봇 완전 회복 + 마나 가득',f:p=>{const P=G.players[p];P.robots.forEach(r=>r.hp=100);P.mp=mpMax(p);log(`🐉 ${who(p)} 여의주가 빛납니다 — 로봇 회복·마나 충전`,'good')}},
 {n:'판도라의 상자',o:'그리스 신화',c:1,d:'열면 큰 재앙과 큰 희망이 함께 나옵니다',f:p=>{const P=G.players[p];const bad=Math.round(P.cash*.1);P.cash-=bad;shake();const k=pick(SKEYS);shock({[k]:-20});giveItem(p,'상자 밑바닥의 희망');gainShard(p);log(`📦 ${who(p)} 판도라의 상자 — 재앙(${fmt(bad)}, ${SECT[k].name} −20%) 뒤에 남은 희망`,'sys')}},
 {n:'솔로몬의 반지',o:'고대 근동 전승',c:3,d:'몬스터와 대화해 싸우지 않고 지나갑니다 (자동 발동)',passive:'ring'},
 {n:'성배',o:'아서왕 전설',c:1,d:'윤리 +, 모든 함대에 치유의 은총',f:p=>{G.players[p].karma=(G.players[p].karma||0)+2;G.players.forEach(P=>P.robots&&P.robots.forEach(r=>r.hp=100));chakra(p,3);log(`🏆 ${who(p)} 성배를 들어 올립니다 — 모든 함대가 치유됩니다`,'good')}},
 {n:'삼족오의 깃털',o:'고구려 태양 신화',c:2,d:'다음 이동을 원하는 수(2~12)로',f:async p=>{const P=G.players[p];let n=7;if(isHuman(p))n=await ask('☀️ 삼족오가 날아갑니다. 몇 칸을 갈까요?',[2,4,6,7,8,10,12].map(x=>({t:x+'칸',v:x,main:x===7})),{auto:()=>7});P.fixMove=n;log(`☀️ ${who(p)} 다음 이동 ${n}칸 고정`,'good')}},
 {n:'여의봉',o:'서유기',c:2,d:'몬스터 하나를 즉시 날려 보냅니다 + 전리품',f:p=>{const P=G.players[p];const x=G.monsters.filter(m=>m.wid===P.wid).sort((a,b)=>Math.abs(a.pos-P.pos)-Math.abs(b.pos-P.pos))[0];if(!x)return;G.monsters.splice(G.monsters.indexOf(x),1);giveCard(p,2,'여의봉 전리품');renderMonsters();log(`🥢 ${who(p)} 여의봉이 늘어나 ${MON[x.k].n}을(를) 날려 보냈습니다`,'good')}},
 {n:'아틀란티스 수정',o:'플라톤의 전설',c:1,d:'모든 로봇 생산 +25% 영구',f:p=>{G.players[p].robots.forEach(r=>r.income=Math.round(r.income*1.25*10)/10);log(`💎 ${who(p)} 아틀란티스 수정 — 로봇 생산 +25%`,'good')}},
 {n:'천부인',o:'단군 신화',c:1,d:'세 보인의 힘: 카드 3장 · 포션 · 마법',f:p=>{giveCard(p,3,'천부인');givePotion(p,'천부인');learnSpell(p)}},
 {n:'이그드라실의 씨앗',o:'북유럽 신화',c:1,d:'새 평행우주를 틔워 그곳으로 갑니다',f:async p=>{const P=G.players[p];const w=W(P.wid);if(w.depth>=4)return;const cid=addWorld(Multiverse.sub(w,P.pos,Math.min(4,w.depth+1),R));log(`🌳 ${who(p)} 세계수의 씨앗 — ${W(cid).name}가 자라납니다`,'sys');await warpTo(p,cid,1,false);await land(p,7)}},
 {n:'칠지도',o:'백제 전승',c:2,d:'다음 몬스터 전투 전력 +150',f:p=>{const P=G.players[p];P.buff.atk=(P.buff.atk||0)+150;log(`🗡 ${who(p)} 칠지도의 일곱 가지가 빛납니다`,'good')}}];
function richest(p){let q=-1,m=-1;G.players.forEach((P,i)=>{if(i!==p&&!P.out&&P.cash>m){m=P.cash;q=i}});return q}
async function castFieldFree(p,base){const s=SPELLS.find(x=>x.base===base);G.players[p].mp+=s.mp;return castField(p,s.id)}
function giveRelic(p,why){const P=G.players[p];const have=new Set(P.relics.map(r=>r.k));const pool=RELICS.map((_,k)=>k).filter(k=>!have.has(k));if(!pool.length)return;const k=pick(pool);P.relics.push({k,c:RELICS[k].c});
 log(`🌟 ${who(p)} 전설 유물 발견 — 「${RELICS[k].n}」 (${RELICS[k].o}) ${why?'· '+why:''}`,p===0?'good':'ai');if(p===0){burst(true);sfx('win',1);lootBeam(P.wid,P.pos,'#ffd36b')}}
async function useRelic(p,idx){const P=G.players[p];const r=P.relics[idx];if(!r||G.over)return;const R_=RELICS[r.k];if(R_.passive)return;r.c--;if(r.c<=0)P.relics.splice(idx,1);await R_.f(p);renderAll()}
function hasRing(p){const P=G.players[p];const r=(P.relics||[]).find(x=>RELICS[x.k].passive==='ring');return r}
async function aiRelics(p){const P=G.players[p];if(!P.relics.length||rnd()>.35)return;const i=P.relics.findIndex(r=>!RELICS[r.k].passive);if(i>=0)await useRelic(p,i)}
// ---- 연구소 v0.3 패널 (로봇 정비·마법서·유물) ----
let gearSel=0;
function renderLab3(){const box=$('#lab3');if(!box||!G)return;const P=G.players[0];if(!P.spells)return;
 if(gearSel>=P.robots.length)gearSel=0;const r=P.robots[gearSel];
 const robSel=P.robots.length?`<select id="gsel">${P.robots.map((x,k)=>`<option value="${k}" ${k===gearSel?'selected':''}>${x.align==='빛'?'✨':'🌑'} ${esc(x.name)}</option>`).join('')}</select>`:'<div class="sub">로봇을 먼저 만드세요.</div>';
 const eq=r?(()=>{const b=eqBonus(r);return `<div class="sub">변신: ${(r.forms||[]).join(' · ')||'없음'}<br>장착: ${['w','a','t'].map(sl=>r.eq&&r.eq[sl]!=null?IC.item(r.eq[sl]).name:'—').join(' / ')} · 장비 보너스 공${b.atk} 방${b.def} 생산 +${b.inc.toFixed(1)}</div>`})():'';
 const items=P.items.map((id,k)=>({it:IC.item(id),k})).filter(o=>SLOT[o.it.cat]);
 box.innerHTML=`<h3 style="margin-top:8px">🦾 로봇 정비 (포션 먹이기 = 변신 · 장비 장착)</h3>${robSel}${eq}
 ${r?`<div class="sub" style="margin-top:4px">포션 먹이기:</div>${P.potions.map((id,k)=>{const po=IC.potion(id);return `<button class="btn sm" data-fd="${k}" title="${esc(po.uses[2].text)}">🧪 ${esc(po.essName)} → ${FORMS[po.essName][0]}</button>`}).join(' ')||'<span class="sub">포션 없음</span>'}
 <div class="sub" style="margin-top:4px">장착 가능 장비:</div>${items.slice(-8).map(o=>`<button class="btn sm" data-eq="${o.k}" style="border-color:${o.it.rarityColor}">🛠 ${esc(o.it.name)} (${o.it.cat})</button>`).join(' ')||'<span class="sub">장비 없음 (무기·방어구·장신구·로봇 부품)</span>'}`:''}
 <h3 style="margin-top:8px">📜 마법서 (${P.spells.length}/100) · 마나 ${Math.round(P.mp)}/${mpMax(0)}</h3>
 ${P.spells.map(id=>{const s=SPELLS[id];const field=!(s.type==='atk'||s.type==='buf');return `<div class="asset"><span style="background:${OH.COLOR[s.el]};width:8px;height:22px;border-radius:4px"></span><span><b>${esc(s.name)}</b> <small class="sub">${OH.HZ[s.el]} · ${({atk:'전투 공격',buf:'전투 강화',heal:'회복',econ:'경제',move:'이동',util:'보조'})[s.type]} · 마나 ${s.mp}</small><br><small class="sub">${esc(s.desc)}${field?'':' (몬스터 전투에서 자동 시전)'}</small></span>${field?`<button class="btn sm" data-sp="${id}" ${P.mp>=s.mp&&canManage()?'':'disabled'}>시전</button>`:'<span></span>'}</div>`}).join('')}
 <h3 style="margin-top:8px">🌟 전설 유물 (${P.relics.length}/12)</h3>${P.relics.map((x,k)=>{const R_=RELICS[x.k];return `<div class="asset"><span style="width:8px;height:22px;background:#ffd36b;border-radius:4px"></span><span><b style="color:#ffd36b">${R_.n}</b> <small class="sub">${R_.o} · 남은 횟수 ${x.c}</small><br><small class="sub">${R_.d}</small></span>${R_.passive?'<span class="sub">자동</span>':`<button class="btn sm main" data-rl="${k}" ${canManage()?'':'disabled'}>사용</button>`}</div>`}).join('')||'<div class="sub">보물 행성(깊은 차원일수록)과 강한 몬스터에게서 발견됩니다.</div>'}`;
 const gs=$('#gsel');if(gs)gs.onchange=e=>{gearSel=+e.target.value;renderLab3()};
 box.querySelectorAll('[data-fd]').forEach(b=>b.onclick=()=>{feedRobot(0,+b.dataset.fd,gearSel);renderAll()});
 box.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{equip(0,+b.dataset.eq,gearSel);renderAll()});
 box.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>castField(0,+b.dataset.sp));
 box.querySelectorAll('[data-rl]').forEach(b=>b.onclick=()=>useRelic(0,+b.dataset.rl))}
