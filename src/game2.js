// ---------- 시장 ----------
function shock(map,label){const parts=[];for(const k in map){G.idx[k]=clamp(Math.round(G.idx[k]*(1+map[k]/100)),35,320);parts.push(`${SECT[k].name} ${map[k]>0?'+':''}${map[k]}%`)}if(label!==false)log(`📊 ${parts.join(', ')}`,'sys');renderMarket()}
function newDayAstro(){G.date=new Date(G.startDate.getTime()+(G.round-1)*86400000);G.astro=AC.reading(G.date);for(const P of G.players){P.day=P.el?TEN_GOD(P.el,G.astro.pillar.stemEl):null}}
function marketTick(){
 const ph=OH.PHASES[G.phase];
 for(const k of SKEYS){const drift=(ph.drift[k]||0)+(G.astro.fx[k]||0)*.6;const noise=(rnd()*2-1)*3.5*G.astro.vol;G.idx[k]=clamp(Math.round(G.idx[k]*(1+(drift+noise)/100)),35,320);G.hist[k].push(G.idx[k]);if(G.hist[k].length>30)G.hist[k].shift()}
}
function newRound(){
 G.round++;
 if(G.maxRounds&&G.round>G.maxRounds){finish('round');return}
 newDayAstro();
 if(--G.phaseLeft<=0){G.phase=(G.phase+1)%5;G.phaseLeft=3;const ph=OH.PHASES[G.phase];if(window.CosmicMusic&&!G.players[0].love)CosmicMusic.setMood(ph.el);log(`☯ 국면 전환: ${OH.HZ[ph.el]} ${ph.name} — ${ph.desc}`,'sys');sfx('start',G.phase%3);showNews(`${OH.HZ[ph.el]} ${ph.name}`,ph.desc+` (담보 이자 ${Math.round(ph.rate*100)}%)`)}
 marketTick();finTick();mpTick();monsterTick();
 // 양자 얽힘 수명
 G.entangle=G.entangle.filter(e=>--e.left>0);
 // 중반부 차원 상승
 if(!G.ascended&&G.round>=Math.max(6,Math.floor((G.maxRounds||30)/3))){G.ascended=true;log('✴️ 차원 상승! 다중우주의 막이 얇아졌습니다. 이제 블랙홀과 포털이 더 높은 차원(깊이 +1)으로 열립니다.','sys');showNews('✴️ 차원 상승','중반부 진입: 더 높은 차원의 우주가 열립니다. 깊은 우주일수록 보상과 위험이 커집니다.');burst()}
 // 탐사선
 for(const pr of G.probes.slice()){if(--pr.eta<=0){probeReport(pr);G.probes.splice(G.probes.indexOf(pr),1)}}
 log(`🗓 ${G.round}일차 · ${G.astro.text}`,'sys');
 if(G.round%7===0)G.prophetDue=true;divine();renderAll();
}

// ---------- 우주 뉴스 카드 ----------
const NEWS=[
 {t:'은하 기준금리 인상',d:'항성 채권 +8%, 우주 거주지 −10%, 우주 벤처 −8%',f:p=>shock({A:8,D:-10,C:-8})},
 {t:'은하 기준금리 인하',d:'거주지 +10%, 벤처 +8%, 광물 +6%, 채권 −5%',f:p=>shock({D:10,C:8,B:6,A:-5})},
 {t:'초지능 AI 붐',d:'우주 벤처 +20%, 행성 광물 +12%, 항성 에너지 +10%',f:p=>shock({C:20,B:12,E:10})},
 {t:'퀀텀코인 겨울',d:'거래소 붕괴 — 퀀텀 코인 −35%',f:p=>{shock({CRYPTO:-35});sfx('boom');shake()}},
 {t:'반감기 랠리',d:'퀀텀 코인 +40%',f:p=>shock({CRYPTO:40})},
 {t:'은하 경기 침체 경보',d:'전 섹터 −10%, 항성 채권 +5%',f:p=>{const m={};SKEYS.forEach(k=>m[k]=-10);m.A=5;shock(m)}},
 {t:'항성 인플레이션',d:'모든 함대의 현금 5% 증발, 거주지 +12%, 에너지 +6%',f:p=>{G.players.forEach((P,i)=>{if(!P.out){const l=Math.round(P.cash*.05);P.cash-=l;floatTxt(i,-l)}});shock({D:12,E:6})}},
 {t:'배당 시즌',d:'보유 자산 1개당 15억 배당',f:p=>{const n=allOwned(p).filter(([w,i])=>!own(w,i).m).length;addCash(p,15*n,`💰 ${who(p)} 배당 ${fmt(15*n)}`)}},
 {t:'은하 세무조사',d:'개발 단계당 25억, 상장 자산당 100억 추징',f:async p=>{let a=0;for(const [w,i] of allOwned(p)){const lv=own(w,i).lv;a+=lv===5?100:lv*25}await pay(p,a,'pot',`🧾 ${who(p)} 세무조사 ${fmt(a)}`)}},
 {t:'스톡옵션 행사',d:'+150억',f:p=>addCash(p,150)},
 {t:'공모주 청약 당첨',d:'+100억',f:p=>addCash(p,100)},
 {t:'랜섬웨어 성간 해킹',d:'복구 비용 80억',f:async p=>pay(p,80,'pot')},
 {t:'감찰청 소환',d:'불공정 거래 의혹 — 즉시 은하 감찰청으로',f:async p=>goJail(p)},
 {t:'귀항 보너스',d:'모항성 기지로 워프해 급여 수령',f:async p=>{await warpTo(p,'W0',0,true);await land(p,7)}},
 {t:'정부 R&D 지원금',d:'+50억',f:p=>addCash(p,50)},
 {t:'적대적 M&A 기회',d:'다른 함대의 미개발 자산 1개를 시세 150%에 강제 인수',f:async p=>mna(p)},
 {t:'컨설팅 수수료',d:'다른 모든 함대에게서 각 20억',f:async p=>{for(let q=0;q<G.players.length;q++)if(q!==p&&!G.players[q].out)await pay(q,20,p)}},
 {t:'블랙스완',d:'예상 못 한 충격 — 뒤로 3칸',f:async p=>{await moveBy(p,-3);await land(p,7)}},
 {t:'준법감시 인증',d:'감찰청 면책권 1장',f:p=>{G.players[p].free++}},
 {t:'중앙은행 유동성 공급',d:'은하 중앙은행으로 워프해 공적자금 수령',f:async p=>{await warpTo(p,'W0',16,true);await land(p,7)}},
 {t:'플래시 크래시',d:'무작위 섹터 −25%',f:p=>{const k=pick(SKEYS);shock({[k]:-25});sfx('boom');return SECT[k].name+' 폭락!'}},
 {t:'숏 스퀴즈',d:'무작위 섹터 +25%',f:p=>{const k=pick(SKEYS);shock({[k]:25});return SECT[k].name+' 급등!'}},
 {t:'양자 도약',d:'현재 우주의 원하는 행성으로 즉시 도약',f:async p=>quantumLeap(p)},
 {t:'양자 얽힘',d:'내 자산 하나와 상대 자산 하나가 4일간 얽힙니다. 상대 자산에 통행료가 오가면 나도 50%를 받습니다',f:async p=>entangle(p)},
 {t:'불확정성 원리',d:'관측 전까지 결과는 중첩 상태 — 무작위 두 섹터가 ±30% 안에서 흔들립니다',f:p=>{const a=pick(SKEYS),b=pick(SKEYS);shock({[a]:ri(-30,30)});shock({[b]:ri(-30,30)});return '관측 완료'}},
 {t:'관측권 획득',d:'양자 주사위 관측권 +1 (주사위 두 쌍 중 하나 선택)',f:p=>{G.players[p].qdice++}},
 {t:'차원 결정 공명',d:'차원 결정 1개 획득 (5개 모으면 초월)',f:p=>gainShard(p)}
];
async function drawNews(p){
 if(!G.deck.length)G.deck=R.shuffle(NEWS.map((_,i)=>i));
 const c=NEWS[G.deck.pop()];
 showNews(c.t,c.d);log(`📡 ${who(p)} — ${c.t}: ${c.d}`,'sys');sfx('pop',1,5,c.t.length);
 await sleep(900);
 const extra=await c.f(p);if(extra)log('　→ '+extra,'sys');
 if(rnd()<.3)giveCard(p,1,'뉴스 특전 카드');
}
async function mna(p){
 const P=G.players[p];const cands=[];
 for(let q=0;q<G.players.length;q++){if(q===p||G.players[q].out)continue;for(const [w,i] of allOwned(q))if(tradable(w,i)){const price=Math.round(mkt(w,i)*1.5);if(price<=P.cash)cands.push({w,i,q,price,v:aiValue(p,w,i)})}}
 if(!cands.length){log('　→ 인수할 대상이 없습니다','sys');return}
 cands.sort((a,b)=>b.v-a.v);
 let c=null;
 if(isHuman(p)){const top=cands.slice(0,6);const v=await ask('⚔️ 적대적 M&A — 인수할 자산을 고르세요.',top.map((c,k)=>({t:`${sp(c.w,c.i).name} (${G.players[c.q].name}) ${fmt(c.price)}`,v:k})).concat([{t:'포기',v:-1}]),{auto:()=>0});c=v>=0?top[v]:null}
 else{const x=cands[0];if(P.cash-x.price>=aiReserve(p)*.5&&x.v>=1.2)c=x}
 if(!c){log(`　→ ${who(p)} 인수 포기`,'sys');return}
 P.cash-=c.price;G.players[c.q].cash+=c.price;transfer(c.w,c.i,p);sfx('merge');P.karma=(P.karma||0)-1;if(p===0)G.stats.mna++;
 log(`⚔️ ${who(p)}가 ${G.players[c.q].name}의 ${sp(c.w,c.i).name}을(를) ${fmt(c.price)}에 강제 인수!`,'sys');renderAll();
}
async function quantumLeap(p){
 const P=G.players[p],w=W(P.wid);let target;
 if(isHuman(p)){const opts=w.spaces.map((s,i)=>({s,i})).filter(x=>x.i!==P.pos&&OWNABLE(x.s.type)).slice(0,12);
  const v=await ask('⚛️ 양자 도약 — 도약할 행성을 고르세요.',opts.map(x=>({t:x.s.name,v:x.i})),{auto:()=>opts.sort((a,b)=>aiValue(p,P.wid,b.i)-aiValue(p,P.wid,a.i))[0].i});target=v}
 else{const opts=w.spaces.map((s,i)=>i).filter(i=>OWNABLE(w.spaces[i].type)&&own(P.wid,i).o<0);target=opts.length?opts.sort((a,b)=>aiValue(p,P.wid,b)-aiValue(p,P.wid,a))[0]:ri(0,w.spaces.length-1)}
 await warpTo(p,P.wid,target,false);await land(p,7);
}
async function entangle(p){
 const mine=allOwned(p);const theirs=[];G.players.forEach((P,q)=>{if(q!==p&&!P.out)allOwned(q).forEach(x=>theirs.push(x))});
 if(!mine.length||!theirs.length){log('　→ 얽힐 자산이 부족해 양자 상태가 붕괴했습니다','sys');return}
 const a=mine.sort((x,y)=>mkt(...y)-mkt(...x))[0];const b=theirs.sort((x,y)=>rentOf(y[0],y[1],7)-rentOf(x[0],x[1],7))[0];
 G.entangle.push({p,a,b,left:4});sfx('merge');log(`🔗 양자 얽힘: ${sp(...a).name} ⟷ ${sp(...b).name} (4일)`,'sys');renderBoard();
}
function gainShard(p){const P=G.players[p];P.shards++;if(P.shards>=3)chakra(p,7);sfx('merge');burst();log(`💠 ${who(p)} 차원 결정 획득 (${P.shards}/5)`,'good');renderPlayers();if(P.shards>=5)finish('transcend',p)}

// ---------- 이동 ----------
function isHuman(p){return !G.players[p].isAI&&!G.autoHuman}
async function salary(p){const P=G.players[p];const sect=new Set(allOwned(p).map(([w,i])=>sp(w,i).g)).size;let s=200+10*sect;if(P.day&&P.day.k==='인성')s=Math.round(s*1.15);addCash(p,s,`🛰️ ${who(p)} 모항성 급여 ${fmt(s)}${sect?` (분산 보너스 ${sect}섹터)`:''}`);if(!P.isAI)sfx('coin');giveCard(p,1,'모항성 보급 카드')}
async function moveBy(p,n){
 const P=G.players[p];const dir=n>0?1:-1;
 for(let k=0;k<Math.abs(n);k++){
  const w=W(P.wid),L=w.spaces.length;let np=(P.pos+dir+L)%L;
  if(w.parent&&np===0&&dir>0){ // 귀환 게이트 통과 → 상위 우주로
   P.wid=w.parent;P.pos=w.portalIdx;log(`🚪 ${who(p)} 귀환 게이트 통과 → ${W(P.wid).name}`,'sys');onWorldChange(p);
  } else {P.pos=np;if(P.wid==='W0'&&np===0&&dir>0)await salary(p)}
  sfx('step');moveShip(p);await sleep(G.stepMs);
 }
}
async function warpTo(p,wid,pos,collect){const P=G.players[p];if(collect&&wid==='W0'&&pos===0&&P.wid==='W0')await salary(p);P.wid=wid;P.pos=pos;onWorldChange(p);moveShip(p,true);sfx('merge');await sleep(500)}
function goJail(p){const P=G.players[p];P.wid='W0';P.pos=8;P.jail=true;P.jt=0;P.dbl=0;onWorldChange(p);moveShip(p,true);sfx('timeWarn');log(`🚨 ${who(p)} 은하 감찰청 조사!`,'bad')}
function rollDice(){return [ri(1,6),ri(1,6)]}
async function showRoll(p){
 const P=G.players[p];let d=rollDice();
 if(P.qdice>0){const d2=rollDice();
  if(isHuman(p)){const v=await ask(`⚛️ 양자 주사위 — 두 결과가 중첩되어 있습니다. 관측할 결과를 고르세요. (관측권 ${P.qdice})`,[{t:`🎲 ${d[0]}+${d[1]}=${d[0]+d[1]}`,v:0,main:1},{t:`🎲 ${d2[0]}+${d2[1]}=${d2[0]+d2[1]}`,v:1},{t:'관측권 아끼기',v:2}]);if(v<2){P.qdice--;chakra(p,5);if(v===1)d=d2;log(`⚛️ ${who(p)} 양자 관측 → ${d[0]+d[1]}`,'sys')}}
  else if(rnd()<.5){P.qdice--;const best=[d,d2].sort((a,b)=>aiLandScore(p,b[0]+b[1])-aiLandScore(p,a[0]+a[1]))[0];d=best;log(`⚛️ ${who(p)} 양자 관측 → ${d[0]+d[1]}`,'ai')}
 }
 G.dice=d;renderDice(true);sfx('step');await sleep(520);return d;
}
function aiLandScore(p,n){const P=G.players[p],w=W(P.wid),L=w.spaces.length;const i=(P.pos+n)%L;const o=w.own[i];if(o&&o.o>=0&&o.o!==p)return -rentOf(P.wid,i,n);if(o&&o.o<0)return aiValue(p,P.wid,i)*20;const t=w.spaces[i].type;return t==='treasure'?60:t==='blackhole'?-30:0}

// ---------- 도착 ----------
async function land(p,dice){
 const P=G.players[p];if(P.out||G.over)return;
 const wid=P.wid,i=P.pos,s=sp(wid,i);hot(wid,i);
 if(OWNABLE(s.type)){
  const o=own(wid,i);
  if(o.o<0){const price=mkt(wid,i);
   const yes=isHuman(p)?await ask(`🪐 <b>${esc(s.name)}</b> (${SECT[s.g].name}) 매입가 <b>${fmt(price)}</b> · 기본 통행료 ${fmt(Math.round((s.rent?s.rent[0]:25)*idxOf(s.g)/100))}${factorHTML(judgeFactors(p,wid,i,price))}`,[{t:'매입',v:1,main:1,en:()=>G.players[p].cash>=price},{t:'패스',v:0}],{manage:true,auto:()=>aiBuy(p,wid,i,price)?1:0}):aiBuy(p,wid,i,price);
   if(isHuman(p))lesson(p,wid,i,!!(yes&&P.cash>=price));
   if(yes&&P.cash>=price){P.cash-=price;o.o=p;floatTxt(p,-price);chakra(p,0);if(s.type==='prop'&&ownsAll(p,wid,s.g))chakra(p,2);sfx('coin');log(`🪐 ${who(p)} ${s.name} 매입 (${fmt(price)})`,P.isAI?'ai':'good');say(p);renderAll()}
   else if(P.isAI)log(`🤖 ${who(p)} ${s.name} 패스`,'ai');
  } else if(o.o!==p&&!o.m&&!G.players[o.o].out){
   if(P.buff&&P.buff.freeRent){P.buff.freeRent=0;log(`🫥 ${who(p)} 투명 포션으로 통행료 면제!`,'good');renderAll();return}
   let r=rentOf(wid,i,dice);if(P.day&&P.day.k==='관성')r=Math.round(r*1.1);if(G.players[o.o].buff&&G.players[o.o].buff.poison){r=Math.round(r/2);G.players[o.o].buff.poison--}
   log(`💳 ${who(p)} → ${G.players[o.o].name} 통행료 ${fmt(r)} (${s.name})`,'bad');
   if(G.players[o.o].love)r=Math.round(r*1.1);const ok=await pay(p,r,o.o);if(ok)chakra(o.o,1);
   if(ok)for(const e of G.entangle){if(e.b[0]===wid&&e.b[1]===i&&e.p!==p&&!G.players[e.p].out){const b=Math.round(r*.5);addCash(e.p,b,`🔗 양자 얽힘 공명 — ${who(e.p)} +${fmt(b)}`)}}
  }
 } else switch(s.type){
  case 'news': await drawNews(p);break;
  case 'tax':{const a=s.amount||Math.min(200,Math.round(netWorth(p)*.1));await pay(p,a,'pot',`🧾 ${who(p)} ${s.name} ${fmt(a)}`);break}
  case 'bank': if(G.pot>0){const a=G.pot;G.pot=0;addCash(p,a,`🏦 ${who(p)} 공적자금 ${fmt(a)} 수령!`);burst()}break;
  case 'portal': await portal(p);break;
  case 'blackhole': await blackhole(p);break;
  case 'treasure': await treasure(p);break;
 }
 renderAll();
}
async function portal(p){
 const P=G.players[p],w=W(P.wid);
 const enter=isHuman(p)?await ask(`🌀 <b>차원 포털</b> — ${w.depth+1+(G.ascended?1:0)+3}차원 평행우주로 진입할까요? 깊을수록 자산 가치와 보물이 커지고, 블랙홀도 기다립니다. 귀환 게이트를 지나면 돌아옵니다.`,[{t:'진입',v:1,main:1},{t:'머무르기',v:0}],{auto:()=>rnd()<.6?1:0}):rnd()<P.pers.risk;
 if(!enter)return;
 let cid=w.children[P.pos];
 if(!cid){const depth=Math.min(4,w.depth+1+(G.ascended?1:0));cid=addWorld(Multiverse.sub(w,P.pos,depth,R));w.children[P.pos]=cid;log(`✨ 새로운 평행우주 탄생: ${W(cid).name}`,'sys')}
 log(`🌀 ${who(p)} → ${W(cid).name}`,'sys');if(W(cid).depth>=2)chakra(p,6);if(p===0)G.stats.depth=Math.max(G.stats.depth,W(cid).depth);
 await warpTo(p,cid,0,false);
}
async function blackhole(p){
 const P=G.players[p];shake();sfx('boom');
 const loss=Math.max(20,Math.round(P.cash*.05));P.cash-=loss;floatTxt(p,-loss);
 if(rnd()<.5){ // 순간이동
  const ids=Object.keys(G.worlds);const wid=pick(ids);const L=W(wid).spaces.length;const pos=ri(1,L-1);
  log(`🕳️ ${who(p)} 블랙홀에 빨려 들어가 질량 ${fmt(loss)} 손실 → ${W(wid).name}의 ${sp(wid,pos).name}로 튕겨 나감`,'bad');
  await warpTo(p,wid,pos,false);await land(p,7);
 } else { // 웜홀: 새 차원 생성
  const w=W(P.wid);const depth=Math.min(4,w.depth+1+(G.ascended?1:0));const cid=addWorld(Multiverse.sub(w,P.pos,depth,R));
  log(`🕳️ ${who(p)} 블랙홀이 웜홀로 변해 새 차원을 열었습니다! → ${W(cid).name} (질량 손실 ${fmt(loss)})`,'sys');burst();
  await warpTo(p,cid,1,false);await land(p,7);
 }
}
async function treasure(p){
 const P=G.players[p],w=W(P.wid),k=P.pos;const last=w.loot[k+':'+p]||-99;
 if(G.round-last<3){log(`💎 ${who(p)} — 이미 탐사한 보물 행성 (재생 중)`,'sys');return}
 w.loot[k+':'+p]=G.round;
 const cash=Math.round((60+ri(0,80))*(1+w.depth*.8));addCash(p,cash,`💎 ${who(p)} 보물 행성 발굴 +${fmt(cash)}`);burst();
 if(rnd()<.2+w.depth*.18)gainShard(p);
 if(rnd()<.35){P.qdice++;log(`　→ ⚛️ 관측권 +1`,'good')}
 giveCard(p,2,'보물 행성 카드');givePotion(p,'보물 행성 포션');giveItem(p,'보물 행성 유물');if(w.depth>=2&&rnd()<.4)giveItem(p,'심층 차원 유물');if(w.depth>=1&&rnd()<.12+w.depth*.06)giveRelic(p,'보물 행성');
}
