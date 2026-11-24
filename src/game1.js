/* ============================================================
 * 다르마 갤럭시(다갤) — 인간 vs AI 다중우주 경제 전략 RPG
 * 저자: 피크닉 신영호 · 임지혜 (이스턴드래곤 출판사)
 * 사용 라이브러리: picnic lib(사주RPG 추출), three.js(MIT), anime.js(MIT), canvas-confetti(ISC)
 * ============================================================ */
{
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=Math.round(n);return (n<0?'−':'')+Math.abs(n).toLocaleString('ko-KR')+'억'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const {SECT}=Multiverse; const SK=SpriteKit; const OH=OhaengCycle; const AC=AstroCalendar;
const SKEYS=Object.keys(SECT);
const OWNABLE=t=>t==='prop'||t==='etf'||t==='crypto';
const ICON={start:'🛰️',news:'📡',tax:'🧾',etf:'📈',crypto:'🪙',jail:'🚨',portal:'🌀',bank:'🏦',blackhole:'🕳️',gate:'🚪',treasure:'💎',prop:'🪐'};

// ---------- AI 성격 ----------
const PERS=[
 {key:'athena',name:'아테나',title:'전략가 AI',sym:'♟',color:'#9fb8ff',el:'금',reserve:1.2,build:1.1,greed:.25,deal:.6,risk:.45,cycle:1,fav:{F:1.2,D:1.2},quotes:['열 수 앞을 보고 둡니다.','오늘의 양보가 내일의 독점입니다.']},
 {key:'hermes',name:'헤르메스',title:'금융투자가 AI',sym:'☿',color:'#7ff0e0',el:'수',reserve:.9,build:.9,greed:.1,deal:1.1,risk:.7,momentum:1,fav:{ETF:1.5,CRYPTO:1.4,A:1.1},quotes:['차익은 순간에 있습니다.','오르는 것이 더 오릅니다.']},
 {key:'hephaestus',name:'헤파이스토스',title:'공학자 AI',sym:'⚒',color:'#ffb36b',el:'화',reserve:1,build:1.4,greed:.15,deal:.5,risk:.55,fav:{E:1.6,C:1.3,B:1.2},quotes:['기술이 곧 자본입니다.','더 크게, 더 높이 짓겠습니다.']},
 {key:'ares',name:'아레스',title:'군사전략가 AI',sym:'⚔',color:'#ff8a8a',el:'화',reserve:.5,build:1.3,greed:.4,deal:1.5,risk:.9,lev:1,fav:{D:1.2,F:1.3},quotes:['영토는 빼앗는 것입니다.','인수 제안 들어갑니다. 거절은 사양합니다.']},
 {key:'isis',name:'이시스',title:'연금술사 AI',sym:'✧',color:'#d6a6ff',el:'수',reserve:1,build:1,greed:.2,deal:.6,risk:.8,fav:{CRYPTO:1.5,C:1.3},quotes:['서로 다른 것이 섞일 때 금이 됩니다.','차원 너머에 보물이 있습니다.']},
 {key:'sophia',name:'소피아',title:'철학자 AI',sym:'☀',color:'#fff09a',el:'토',reserve:1.6,build:.8,greed:.05,deal:.4,risk:.3,value:1,kind:1,fav:{A:1.4,ETF:1.3,E:1.2},quotes:['지혜는 서두르지 않습니다.','함께 사는 우주가 더 부유합니다.']},
 {key:'chronos',name:'크로노스',title:'종합전략가 AI',sym:'◷',color:'#a6e3ff',el:'목',reserve:1.1,build:1.1,greed:.2,deal:.7,risk:.55,cycle:1,momentum:1,fav:{},quotes:['시간은 주기로 흐릅니다.','다음 국면이 이미 보입니다.']}
];
const DIFF={easy:{base:260,danger:.15,mistake:.22,dealGate:.5},normal:{base:200,danger:.35,mistake:.08,dealGate:1},hard:{base:150,danger:.6,mistake:0,dealGate:1.3}};
const TEN_GOD=(me,day)=>{ // 일진 오행(day)과 내 일간(me)의 관계 → 십성 계열
 if(me===day) return {k:'비겁',t:'비견·겁재의 날 — 같은 기운이 모입니다. 협상에서 상대가 한발 물러섭니다.'};
 if(OH.saeng(day,me)) return {k:'인성',t:'인성의 날 — 도움의 흐름이 들어옵니다. 급여 +15%.'};
 if(OH.saeng(me,day)) return {k:'식상',t:'식상의 날 — 표현과 창조의 흐름. 개발 비용 −10%.'};
 if(OH.geuk(me,day)) return {k:'재성',t:'재성의 날 — 재물을 다루는 흐름. 임대 수입 +10%.'};
 return {k:'관성',t:'관성의 날 — 규율의 흐름이 나를 다듬습니다. 통행료 +10%, 신중함이 이롭습니다.'};
};

let G=null, TOKEN=0; const ABORT={abort:1};
let R=null; // 난수
const rnd=()=>R.next(), ri=(a,b)=>R.int(a,b), pick=a=>R.pick(a);
const sfx=(n,...a)=>{ if(!G||!G.sound) return; try{DungeonSfx[n]&&DungeonSfx[n](...a)}catch(e){} };
function sleep(ms){const t=TOKEN;return new Promise((res,rej)=>setTimeout(()=>t===TOKEN?res():rej(ABORT),Math.max(0,ms*(G?G.speedMul:1))))}

// ---------- 다중우주 상태 ----------
function W(id){return G.worlds[id]}
function sp(wid,i){return W(wid).spaces[i]}
function own(wid,i){return W(wid).own[i]}
function addWorld(w){const id='W'+(G.wseq++);w.id=id;w.own=w.spaces.map(s=>OWNABLE(s.type)?{o:-1,lv:0,m:false,debt:0}:null);w.children={};w.loot={};G.worlds[id]=w;return id}
function groupKey(wid,g){return wid+':'+g}
function members(wid,g){const out=[];W(wid).spaces.forEach((s,i)=>{if(OWNABLE(s.type)&&s.g===g)out.push(i)});return out}
function idxOf(g){return G.idx[g]||100}
function mkt(wid,i){const s=sp(wid,i);return Math.round(s.price*idxOf(s.g)/100)}
function ownsAll(p,wid,g){const m=members(wid,g);return m.length>1&&m.every(j=>own(wid,j).o===p)}
function groupBuilt(wid,g){return members(wid,g).some(j=>own(wid,j).lv>0)}
function allOwned(p){const out=[];for(const wid in G.worlds){W(wid).own.forEach((o,i)=>{if(o&&o.o===p)out.push([wid,i])})}return out}
function rentOf(wid,i,dice){
 const s=sp(wid,i),o=own(wid,i); if(!o||o.o<0||o.m) return 0;
 let r;
 if(s.type==='prop'){ r=o.lv>0?s.rent[o.lv]:s.rent[0]*(ownsAll(o.o,wid,s.g)?2:1); }
 else if(s.type==='etf'){ const n=members(wid,'ETF').filter(j=>own(wid,j).o===o.o).length; r=[0,25,50,100,200][n]*(1+.55*W(wid).depth); }
 else { const n=members(wid,'CRYPTO').filter(j=>own(wid,j).o===o.o).length; r=(dice||7)*(n>=2?10:4)*(1+.55*W(wid).depth)*G.astro.vol; }
 r*=idxOf(s.g)/100;
 const owner=G.players[o.o]; if(owner.day&&owner.day.k==='재성') r*=1.1;
 return Math.round(r);
}
function netWorth(p){const P=G.players[p];let v=P.cash;for(const [wid,i] of allOwned(p)){const o=own(wid,i),s=sp(wid,i);v+=o.m?mkt(wid,i)-o.debt:mkt(wid,i);if(s.build)v+=o.lv*s.build*.5}if(P.dep!=null)v+=(P.hero?armyValue(P)*.5:0)+finWorth(p)+P.robots.reduce((a,r)=>a+r.cost*.5*r.hp/100,0);return Math.round(v)}
function rate(){return OH.PHASES[G.phase].rate}
// ---- 개발/담보/매각 규칙 ----
function canBuild(p,wid,i){const s=sp(wid,i),o=own(wid,i);if(!o||s.type!=='prop'||o.o!==p||o.m||o.lv>=5||!ownsAll(p,wid,s.g))return false;const m=members(wid,s.g);if(m.some(j=>own(wid,j).m))return false;return o.lv<=Math.min(...m.map(j=>own(wid,j).lv))}
function buildCost(p,wid,i){const c=sp(wid,i).build;return Math.round(c*(G.players[p].day&&G.players[p].day.k==='식상'?.9:1))}
function doBuild(p,wid,i){const c=buildCost(p,wid,i);if(!canBuild(p,wid,i)||G.players[p].cash<c)return false;G.players[p].cash-=c;own(wid,i).lv++;if(own(wid,i).lv===5){sfx('merge');burst();log(`🌟 ${who(p)} — ${sp(wid,i).name} 은하 상장(IPO)!`,'sys')}return true}
function canSellB(p,wid,i){const s=sp(wid,i),o=own(wid,i);if(!o||o.o!==p||o.lv<1)return false;return o.lv>=Math.max(...members(wid,s.g).map(j=>own(wid,j).lv))}
function sellB(p,wid,i){if(!canSellB(p,wid,i))return false;own(wid,i).lv--;G.players[p].cash+=Math.round(sp(wid,i).build*.5);return true}
function canMort(p,wid,i){const s=sp(wid,i),o=own(wid,i);return o&&o.o===p&&!o.m&&!(s.type==='prop'&&groupBuilt(wid,s.g))}
function mort(p,wid,i){if(!canMort(p,wid,i))return false;const o=own(wid,i);o.m=true;o.debt=Math.round(mkt(wid,i)*.5);G.players[p].cash+=o.debt;return true}
function unmortCost(wid,i){return Math.round(own(wid,i).debt*(1+rate()))}
function canUnmort(p,wid,i){const o=own(wid,i);return o&&o.o===p&&o.m&&G.players[p].cash>=unmortCost(wid,i)}
function unmort(p,wid,i){if(!canUnmort(p,wid,i))return false;G.players[p].cash-=unmortCost(wid,i);const o=own(wid,i);o.m=false;o.debt=0;return true}
function sellValue(wid,i){const o=own(wid,i);return Math.round(mkt(wid,i)*.8)-(o.m?unmortCost(wid,i):0)}
function canSellBank(p,wid,i){const s=sp(wid,i),o=own(wid,i);return o&&o.o===p&&o.lv===0&&!(s.type==='prop'&&groupBuilt(wid,s.g))&&sellValue(wid,i)>0}
function sellBank(p,wid,i){if(!canSellBank(p,wid,i))return false;G.players[p].cash+=sellValue(wid,i);Object.assign(own(wid,i),{o:-1,lv:0,m:false,debt:0});return true}
function tradable(wid,i){const s=sp(wid,i),o=own(wid,i);return o&&o.o>=0&&!o.m&&o.lv===0&&!(s.type==='prop'&&groupBuilt(wid,s.g))}
function transfer(wid,i,to){own(wid,i).o=to}
function who(p){const P=G.players[p];return P.isAI?`${P.name}`:`${P.name}`}

// ---------- 기록 ----------
function log(t,cls=''){G.log.unshift({t,cls,r:G.round});if(G.log.length>220)G.log.pop();renderLog()}
function say(p,kind){const P=G.players[p];if(!P.isAI||rnd()>.35)return;log(`💬 ${P.name}: "${pick(P.pers.quotes)}"`,'ai')}

// ---------- 돈 흐름 ----------
function addCash(p,a,why){const P=G.players[p];P.cash+=a;floatTxt(p,a);if(a>0)sfx('coin');if(why)log(why,a>=0?'good':'bad');renderPlayers()}
async function pay(p,amt,to,why){
 amt=Math.max(0,Math.round(amt));const P=G.players[p];if(amt===0)return true;
 if(P.cash<amt){ await raise(p,amt,why); }
 if(P.cash<amt){ await bankrupt(p,to,amt); return false; }
 P.cash-=amt;floatTxt(p,-amt);
 if(typeof to==='number'){G.players[to].cash+=amt;floatTxt(to,amt)} else if(to==='pot') G.pot+=amt;
 if(why)log(why,'bad'); sfx('ding'); renderPlayers(); return true;
}
function liquidateStep(p){ // 자동 자금 마련 1단계
 const L=allOwned(p);
 const score=([wid,i])=>{const s=sp(wid,i);return (s.type==='prop'&&ownsAll(p,wid,s.g)?1000:0)+mkt(wid,i)};
 const m1=L.filter(([w,i])=>canMort(p,w,i)&&!(sp(w,i).type==='prop'&&ownsAll(p,w,sp(w,i).g))).sort((a,b)=>score(a)-score(b));
 if(m1.length){mort(p,...m1[0]);return `담보 설정: ${sp(...m1[0]).name}`}
 const b=L.filter(([w,i])=>canSellB(p,w,i)).sort((a,b2)=>own(...b2).lv-own(...a).lv);
 if(b.length){sellB(p,...b[0]);return `개발 매각: ${sp(...b[0]).name}`}
 const m2=L.filter(([w,i])=>canMort(p,w,i)).sort((a,b2)=>score(a)-score(b2));
 if(m2.length){mort(p,...m2[0]);return `담보 설정: ${sp(...m2[0]).name}`}
 const s=L.filter(([w,i])=>canSellBank(p,w,i)).sort((a,b2)=>sellValue(...a)-sellValue(...b2));
 if(s.length){sellBank(p,...s[0]);return `은행 매각: ${sp(...s[0]).name}`}
 return null;
}
async function raise(p,amt,why){
 const P=G.players[p];
 if(!P.isAI&&!G.autoHuman){
  const v=await ask(`💸 자금 부족! <b>${fmt(amt)}</b>이 필요합니다 (보유 ${fmt(P.cash)}). 자산 탭에서 담보·매각을 하거나 자동 정리를 고르세요.`,[
   {t:'지불',v:'pay',main:1,en:()=>G.players[p].cash>=amt},{t:'자동 정리',v:'auto'},{t:'파산 선언',v:'quit'}],{manage:true,auto:()=>'auto'});
  if(v==='pay'||v==='quit')return;
 }
 const done=finLiquidate(p,amt);while(P.cash<amt){const r=liquidateStep(p);if(!r)break;done.push(r)}
 if(done.length)log(`🔧 ${who(p)} 자금 마련 — ${done.slice(0,4).join(', ')}${done.length>4?' 외 '+(done.length-4)+'건':''}`,'sys');
 renderAll();
}
async function bankrupt(p,to,amt){
 const P=G.players[p];P.out=true;sfx('boom');shake();
 log(`💥 ${who(p)} 파산! (${fmt(amt)} 지불 불능)`,'bad');
 const credit=typeof to==='number'&&!G.players[to].out?to:null;
 if(credit!==null){G.players[credit].cash+=Math.max(0,P.cash)}
 for(const [wid,i] of allOwned(p)){const o=own(wid,i);if(credit!==null){o.o=credit;o.lv=0}else Object.assign(o,{o:-1,lv:0,m:false,debt:0})}
 P.cash=0;renderAll();checkEnd();
}

// ---------- 질문(사람 입력) ----------
let pendingAsk=null;
function ask(text,opts,cfg={}){
 return new Promise((res,rej)=>{
  const t=TOKEN;
  const a={text,opts,cfg,rej,done:false,res:v=>{if(a.done||t!==TOKEN)return;a.done=true;pendingAsk=null;G.ask=null;renderAct();renderAssets();res(v)}};
  pendingAsk=a;G.ask=a;renderAct();renderAssets();
  if(G.autoHuman){const auto=cfg.auto||(()=>(opts.find(o=>o.main&&(!o.en||o.en()))||opts.find(o=>!o.en||o.en())||opts[0]).v);setTimeout(()=>{if(!a.done)a.res(auto())},Math.max(10,220*G.speedMul))}
 });
}
