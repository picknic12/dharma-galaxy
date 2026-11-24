// ---------- AI 두뇌 ----------
function danger(p){const P=G.players[p],w=W(P.wid),L=w.spaces.length;let m=0;for(let d=2;d<=12;d++){const i=(P.pos+d)%L,o=w.own[i];if(o&&o.o>=0&&o.o!==p&&!o.m)m=Math.max(m,rentOf(P.wid,i,7))}return m}
function aiReserve(p){const P=G.players[p],D=DIFF[G.diff];return Math.round(D.base*P.pers.reserve+danger(p)*D.danger)}
function aiValue(p,wid,i){
 const s=sp(wid,i),P=G.players[p],per=P.pers||{fav:{}};let v=per.fav[s.g]??1;
 const m=members(wid,s.g);const mine=m.filter(j=>own(wid,j).o===p).length;
 if(m.length>1&&mine===m.length-1&&own(wid,i).o!==p)v+=1.6;else v+=.35*mine;
 for(let q=0;q<G.players.length;q++){if(q===p)continue;const c=m.filter(j=>own(wid,j).o===q).length;if(m.length>1&&c===m.length-1&&own(wid,i).o<0)v+=.9}
 const h=G.hist[s.g];if(per.momentum&&h.length>3)v+=(h[h.length-1]-h[h.length-4])/50;
 if(per.cycle){const nx=OH.PHASES[(G.phase+1)%5];v+=((OH.PHASES[G.phase].drift[s.g]||0)+(nx.drift[s.g]||0))/12}
 if(per.value)v+=(100-idxOf(s.g))/90;
 v*=1+W(wid).depth*.12;
 return v;
}
function aiBuy(p,wid,i,price){
 const P=G.players[p];if(P.cash<price)return false;const v=aiValue(p,wid,i),res=aiReserve(p);
 let ok=v>=2.4?P.cash-price>=res*.3:P.cash-price>=res/Math.max(.45,v);
 if(!ok&&P.pers.lev&&v>=2.4){/* 레버리지: 담보로 자금 마련 */let k=0;while(P.cash-price<res*.3&&k++<6){const L=allOwned(p).filter(([w,j])=>canMort(p,w,j)&&!(sp(w,j).type==='prop'&&ownsAll(p,w,sp(w,j).g)));if(!L.length)break;mort(p,...L[0])}ok=P.cash>=price}
 if(G.players[p].isAI&&rnd()<DIFF[G.diff].mistake)ok=!ok&&P.cash>=price*1.5;
 return ok;
}
function aiAsk(seller,buyer,wid,i){ // 판매 희망가
 const S=G.players[seller],per=S.pers||{greed:.2};const s=sp(wid,i);let need=1.3+per.greed;
 const m=members(wid,s.g);if(m.length>1&&m.filter(j=>j!==i).every(j=>own(wid,j).o===buyer))need+=G.diff==='hard'?1.4:G.diff==='normal'?1:.5;
 if(m.some(j=>j!==i&&own(wid,j).o===seller))need+=.5;
 if(S.cash<120)need-=.35;
 if(G.players[buyer].day&&G.players[buyer].day.k==='비겁')need-=.15;
 return Math.round(mkt(wid,i)*need);
}
async function aiManage(p){
 const P=G.players[p];if(P.out)return;const msgs=[];aiFinance(p);aiLab(p);aiGear(p);aiSpells(p);await aiRelics(p);if(P.potions.length>3&&rnd()<.3)drink(p,0);
 // 담보 해제
 for(const [w,i] of allOwned(p).filter(([w,i])=>own(w,i).m).sort((a,b)=>mkt(...b)-mkt(...a))){if(P.cash-unmortCost(w,i)>=aiReserve(p)*1.6&&unmort(p,w,i))msgs.push(`담보 해제 ${sp(w,i).name}`)}
 // 개발
 let built=0;for(let k=0;k<30;k++){const res=aiReserve(p)/P.pers.build;let best=null,bs=-1;
  for(const [w,i] of allOwned(p)){if(!canBuild(p,w,i))continue;const s=sp(w,i),c=buildCost(p,w,i);if(P.cash-c<res)continue;const gain=(s.rent[own(w,i).lv+1]-s.rent[own(w,i).lv])/c;if(gain>bs){bs=gain;best=[w,i]}}
  if(!best)break;doBuild(p,...best);built++}
 if(built)msgs.push(`개발 ${built}단계`);
 // 차익 실현
 if((P.pers.value||P.pers.key==='athena'||P.pers.key==='chronos')){for(const [w,i] of allOwned(p)){const s=sp(w,i);if(idxOf(s.g)>=175&&!(s.type==='prop'&&ownsAll(p,w,s.g))&&canSellBank(p,w,i)&&rnd()<.4){const v=sellValue(w,i);sellBank(p,w,i);msgs.push(`차익 실현 ${s.name} +${fmt(v)}`)}}}
 if(msgs.length){log(`🤖 ${P.name}: ${msgs.join(' · ')}`,'ai');renderAll()}
 await aiDeals(p);
}
async function aiDeals(p){
 const P=G.players[p];if(rnd()>.45*P.pers.deal*DIFF[G.diff].dealGate)return;
 for(const wid in G.worlds){const w=W(wid);for(const g of new Set(w.spaces.filter(s=>s.type==='prop').map(s=>s.g))){
  const m=members(wid,g);const mine=m.filter(j=>own(wid,j).o===p);if(mine.length!==m.length-1)continue;
  const i=m.find(j=>own(wid,j).o!==p);const o=own(wid,i);if(o.o<0||G.players[o.o].out||!tradable(wid,i))continue;
  const key=wid+':'+i;if((G.cool[key]||-9)>G.round)continue;G.cool[key]=G.round+3;
  const price=Math.round(mkt(wid,i)*(1.5+.5*P.pers.deal+rnd()*.3));if(P.cash-price<aiReserve(p)*.6)continue;
  const q=o.o;let yes;
  if(isHuman(q)){yes=await ask(`🤝 <b>${esc(P.name)}</b>(${esc(P.pers.title)})가 <b>${esc(sp(wid,i).name)}</b>을(를) <b>${fmt(price)}</b>에 인수하겠다고 제안합니다. (시세 ${fmt(mkt(wid,i))} · 이 자산을 넘기면 상대가 독점을 완성합니다)`,[{t:'수락',v:1},{t:'거절',v:0,main:1}])}
  else yes=price>=aiAsk(q,p,wid,i);
  if(yes){P.cash-=price;G.players[q].cash+=price;transfer(wid,i,p);if(q===0){chakra(0,4);G.stats.deals++}sfx('merge');log(`🤝 거래 성사: ${P.name} ← ${G.players[q].name} · ${sp(wid,i).name} ${fmt(price)}`,'sys')}
  else log(`🙅 ${G.players[q].name}가 ${P.name}의 인수 제안(${sp(wid,i).name} ${fmt(price)})을 거절`,'ai');
  renderAll();return;
 }}
}
function aiJail(p){const P=G.players[p];if(P.free>0)return 'card';const un=Object.values(G.worlds).reduce((a,w)=>a+w.own.filter(o=>o&&o.o<0).length,0);if(un>=6&&P.cash>aiReserve(p)*.8)return 'pay';if(P.pers.reserve>=1.4&&P.cash>400)return 'pay';return 'roll'}

// ---------- 사람의 자동 관리 (80% 자동화) ----------
function humanAutoManage(){const P=G.players[0];const save=P.pers;P.pers=PERS[0];const res=Math.max(260,aiReserve(0)*1.2);const msgs=[];if(G.autoHuman){aiFinance(0);aiLab(0);aiGear(0);aiSpells(0)}
 for(const [w,i] of allOwned(0).filter(([w,i])=>own(w,i).m)){if(P.cash-unmortCost(w,i)>=res*1.4&&unmort(0,w,i))msgs.push('담보 해제 '+sp(w,i).name)}
 let n=0;for(let k=0;k<20;k++){let best=null,bs=-1;for(const [w,i] of allOwned(0)){if(!canBuild(0,w,i))continue;const c=buildCost(0,w,i);if(P.cash-c<res)continue;const s=sp(w,i);const g=(s.rent[own(w,i).lv+1]-s.rent[own(w,i).lv])/c;if(g>bs){bs=g;best=[w,i]}}if(!best)break;doBuild(0,...best);n++}
 if(n)msgs.push(`개발 ${n}단계`);P.pers=save;if(msgs.length){log('🤖 자동 관리: '+msgs.join(' · '),'good');renderAll()}}
// ---------- 종합 판단 패널 (칸트의 종합판단 연습) ----------
function judgeFactors(p,wid,i,price){const P=G.players[p],s=sp(wid,i),m=members(wid,s.g);const mine=m.filter(j=>own(wid,j).o===p).length;const f=[];
 const left=P.cash-price,res=Math.max(150,danger(p));f.push([left>=res?'＋':'－',`현금 여력: 매입 후 ${fmt(left)} (주변 최대 통행료 ${fmt(danger(p))})`]);
 if(m.length>1)f.push([mine===m.length-1?'＋＋':mine>0?'＋':'·',`독점 가능성: ${SECT[s.g].name} ${mine}/${m.length} 보유${mine===m.length-1?' → 매입하면 독점 완성!':''}`]);
 G.players.forEach((Q,q)=>{if(q!==p&&!Q.out){const c=m.filter(j=>own(wid,j).o===q).length;if(m.length>1&&c===m.length-1)f.push(['＋＋',`위협 차단: ${Q.name}의 독점을 막습니다`])}});
 const ph=OH.PHASES[G.phase],nx=OH.PHASES[(G.phase+1)%5];const d=(ph.drift[s.g]||0)+(nx.drift[s.g]||0);f.push([d>0?'＋':d<0?'－':'·',`국면 흐름: 지금 ${OH.HZ[ph.el]}${ph.name}, 다음 ${OH.HZ[nx.el]}${nx.name} — 이 섹터 경향 ${d>0?'상승':d<0?'하락':'보합'}`]);
 f.push([idxOf(s.g)<95?'＋':idxOf(s.g)>150?'－':'·',`가격 수준: 시세 지수 ${idxOf(s.g)} (${idxOf(s.g)<95?'저평가':idxOf(s.g)>150?'고평가':'보통'})`]);
 if(W(wid).depth)f.push(['＋',`차원 깊이 ${W(wid).depth}: 통행료 배율이 높습니다`]);
 return f}
function factorHTML(f){return `<div style="font-size:12.5px;margin:6px 0 2px;line-height:1.45">${f.map(([k,t])=>`<div><b style="color:${k.includes('－')?'#ffb3c0':k.includes('＋')?'#a6f5c8':'#cfc8ee'}">${k}</b> ${esc(t)}</div>`).join('')}</div><div class="sub">요소들을 하나의 판단으로 종합해 보세요.</div>`}
function lesson(p,wid,i,bought){if(p!==0||G.autoHuman)return;const v=aiValue(1<G.players.length?1:0,wid,i);const f=judgeFactors(0,wid,i,0);const plus=f.filter(x=>x[0].includes('＋')).length,minus=f.filter(x=>x[0].includes('－')).length;
 const t=bought?(plus>=minus?'근거가 모인 매입이었습니다. 독점·차단·흐름이 같은 방향을 가리킬 때 판단은 단단해집니다.':'근거보다 의지가 앞선 매입일 수 있습니다. 현금 여력이 무너지면 다음 통행료가 판단을 대신합니다.'):(plus>minus?'지나친 자산이 상대에게 독점의 열쇠가 될 수 있습니다. 차단 가치도 가치입니다.':'현금을 지킨 선택입니다. 기회비용과 안전 사이의 저울질이 작동했습니다.');
 log('💡 배움: '+t,'sys')}
// ---------- 사람의 인수 제안 ----------
function humanOffer(wid,i,price){
 const s=sp(wid,i),o=own(wid,i),H=G.players[0];
 if(!G.ask||!G.ask.cfg.manage)return '지금은 제안할 수 없습니다 (내 차례의 결정 시점에 가능)';
 if(G.offers>=3)return '이번 턴의 제안 기회(3회)를 모두 썼습니다';
 if(!tradable(wid,i))return '개발되었거나 담보 중인 자산은 거래할 수 없습니다';
 if(price>H.cash)return '현금이 부족합니다';
 G.offers++;const need=aiAsk(o.o,0,wid,i),A=G.players[o.o];
 if(price>=need){G.stats.deals++;H.karma=(H.karma||0)+.5;H.cash-=price;A.cash+=price;transfer(wid,i,0);chakra(0,4);sfx('merge');log(`🤝 인수 성공! ${s.name} ← ${A.name} (${fmt(price)})`,'good');renderAll();return {ok:true}}
 sfx('bagFull');log(`🙅 ${A.name}: "${fmt(need)} 아래로는 넘길 수 없습니다."`,'ai');return {ok:false,need};
}
function acceptCounter(wid,i,need){const H=G.players[0],o=own(wid,i);if(H.cash<need||!tradable(wid,i))return false;H.cash-=need;G.players[o.o].cash+=need;chakra(0,4);G.stats.deals++;log(`🤝 역제안 수락: ${sp(wid,i).name} ← ${G.players[o.o].name} (${fmt(need)})`,'good');transfer(wid,i,0);sfx('merge');renderAll();return true}

// ---------- 탐사선 ----------
function launchProbe(p){const P=G.players[p];if(P.cash<40)return false;P.cash-=40;if(p===0)G.stats.probes++;G.probes.push({p,eta:2});log(`🛰 ${who(p)} 탐사선 발사 (40억, 2일 후 보고)`,'sys');renderAll();return true}
function probeReport(pr){
 const P=G.players[pr.p];if(P.out)return;
 const unknown=Object.keys(G.worlds).filter(id=>!P.known.has(id));
 if(unknown.length){const id=pick(unknown);P.known.add(id);if(!P.isAI)log(`🛰 탐사선 보고: 미확인 신호 해독 → ${W(id).name}`,'good')}
 const nx=OH.PHASES[(G.phase+1)%5];chakra(pr.p,5);if(!P.isAI)log(`🛰 탐사선 예측: 다음 국면은 ${OH.HZ[nx.el]} ${nx.name} (${G.phaseLeft}일 후)`,'good');
 const r=rnd();if(r<.25){P.qdice++;if(!P.isAI)log('🛰 탐사선이 양자 관측권을 회수했습니다 (+1)','good')}else if(r<.4){const c=ri(30,90);addCash(pr.p,c,P.isAI?null:`🛰 탐사선이 소행성 자원을 채굴해 왔습니다 +${fmt(c)}`)}
 renderAll();
}

// ---------- 턴 ----------
async function jailPhase(p){
 const P=G.players[p];P.jt++;
 let c;if(isHuman(p))c=await ask(`🚨 은하 감찰청 조사 중 (${P.jt}일째). 어떻게 할까요?`,[{t:'과징금 50억 납부',v:'pay',main:1,en:()=>G.players[p].cash>=50},{t:'더블 도전',v:'roll'}].concat(P.free>0?[{t:`면책권 사용 (${P.free})`,v:'card'}]:[]),{manage:true,auto:()=>aiJail(p)});else c=aiJail(p);
 if(c==='card'){P.free--;P.jail=false;log(`📜 ${who(p)} 면책권으로 석방`,'good');return 'free'}
 if(c==='pay'){await pay(p,50,'pot',`🚨 ${who(p)} 과징금 50억 납부`);P.jail=false;return 'free'}
 const d=await showRoll(p);
 if(d[0]===d[1]||rnd()<1/12){P.jail=false;log(d[0]===d[1]?`🎲 ${who(p)} 더블! 석방`:`⚛️ ${who(p)} 양자 터널링으로 탈출!`,'good');await moveBy(p,d[0]+d[1]);await land(p,d[0]+d[1]);return 'moved'}
 if(P.jt>=3){await pay(p,50,'pot',`🚨 ${who(p)} 3일 만료 — 과징금 납부`);P.jail=false;await moveBy(p,d[0]+d[1]);await land(p,d[0]+d[1]);return 'moved'}
 log(`🚨 ${who(p)} 조사 계속`,'bad');return 'stay';
}
async function turn(p){
 const P=G.players[p];G.cur=p;G.offers=0;renderAll();focusPlayer(p);
 if(P.isAI){G.status=`${P.name}(${P.pers.title}) 생각 중…`;renderAct();await sleep(450);await aiManage(p)}
 if(p===0&&G.prophetDue&&!P.out){G.prophetDue=false;await prophet()}
 if(P.jail){const r=await jailPhase(p);if(r!=='free'){if(P.isAI&&!P.out)await aiManage(p);return}}
 let again=true;
 while(again&&!P.out&&!G.over){
  again=false;
  if(isHuman(p)){if(G.manual||G.pauseReq){G.pauseReq=false;await ask(`🚀 <b>${esc(P.name)}</b>님의 차례입니다. 자산을 정비한 뒤 주사위를 굴리세요.${P.qdice?` (⚛️ 관측권 ${P.qdice})`:''}`,[{t:'🎲 주사위 굴리기',v:1,main:1}],{manage:true})}else{if(G.autoManage)humanAutoManage();G.status=`🚀 ${P.name}님의 차례 — 자동 항해 중 (⏸ 일시정지로 직접 정비)`;renderAct();await sleep(650)}}
  const d=await showRoll(p);
  if(d[0]===d[1]){P.dbl++;if(P.dbl>=3){log(`🎲 ${who(p)} 3연속 더블 — 과열 거래 혐의!`,'bad');goJail(p);break}again=true;log(`🎲 ${who(p)} 더블! 한 번 더`,'sys')}
  let mv=d[0]+d[1];if(P.fixMove){mv=P.fixMove;P.fixMove=0;log(`☀️ 삼족오의 비행 — ${mv}칸`,'sys')}if(P.buff&&P.buff.move){mv+=P.buff.move;P.buff.move=0}
  await moveBy(p,mv);await encounter(p);if(P.out||G.over)break;await land(p,d[0]+d[1]);
  if(P.jail||P.out)again=false;else if(P.extraTurn){P.extraTurn=0;again=true;log(`⏳ ${who(p)} 시간 정지 — 한 번 더!`,'sys')}
  if(P.isAI&&!P.out&&!G.over)await aiManage(p);
 }
 P.dbl=0;
 if(isHuman(p)&&!P.out&&!G.over&&G.autoManage)humanAutoManage();
 if(isHuman(p)&&!P.out&&!G.over&&(G.manual||G.pauseReq))await ask('행동을 마쳤다면 턴을 종료하세요. (자산 탭에서 개발·담보·인수 제안·탐사선 발사 가능)',[{t:'턴 종료 ▶',v:1,main:1}],{manage:true});
}
function checkEnd(){if(G.over)return;const H=G.players[0];const alive=G.players.filter(P=>!P.out);if(H.out)finish('lose');else if(alive.length===1)finish('win')}
async function gameLoop(){
 try{
  while(!G.over){
   const p=G.turn;if(!G.players[p].out)await turn(p);
   if(G.over)break;
   let n=p;do{n=(n+1)%G.players.length}while(G.players[n].out&&n!==p);
   if(n<=p)newRound();
   G.turn=n;
  }
 }catch(e){if(e!==ABORT){console.error(e);log('⚠️ 오류: '+e.message,'bad')}}
}
function finish(reason,who_){
 if(G.over)return;G.over=true;renderAll();
 const rows=G.players.map((P,i)=>({i,P,nw:P.out?0:netWorth(i)})).sort((a,b)=>(b.P.out?-1:0)-(a.P.out?-1:0)||b.nw-a.nw);
 if(reason==='transcend'){const k=rows.findIndex(r=>r.i===who_);rows.unshift(rows.splice(k,1)[0])}
 const rank=rows.findIndex(r=>r.i===0)+1,H=G.players[0];
 const ev=ScoreGrade.evaluate({netWorth:rows.find(r=>r.i===0).nw,startCash:G.startCash,rank,total:rows.length,bankrupt:H.out});
 const title=reason==='transcend'?(who_===0?'🌌 차원 초월 승리!':`🌌 ${G.players[who_].name}이(가) 차원을 초월했습니다`):reason==='win'?'🏆 승리! 모든 AI가 파산했습니다':reason==='lose'?'💥 파산 — 이번 판은 정보였습니다':`🏁 ${G.maxRounds}일 항해 종료`;
 const won=(reason==='transcend'&&who_===0)||reason==='win'||(reason==='round'&&rank===1);
 if(won){sfx('win');burst(true)}else sfx('dead');
 const showResult=()=>modal(`<div class="grade">${ev.grade}</div><h2>${title}</h2><p>순위 <b>${rank}</b> / ${rows.length} · 자산 성장 ×${ev.ratio}</p><p>${ev.comment}</p>${G.ending?`<p style="color:#ffe3a3">🏛 엔딩 ${G.ending.no}/27 · ${G.ending.fam} — 「${esc(G.ending.title)}」 ${G.ending.label}</p>`:''}
 <table class="rk"><tr><th>순위</th><th>함대</th><th class="n">순자산</th><th class="n">결정</th></tr>${rows.map((r,k)=>`<tr><td>${k+1}</td><td>${esc(r.P.name)} <small>${esc(r.P.isAI?r.P.pers.title:'인간')}</small>${r.P.out?' 💥':''}</td><td class="n">${fmt(r.nw)}</td><td class="n">💠${r.P.shards}</td></tr>`).join('')}</table>
 ${H.ck&&H.ck.filter(Boolean).length===8?'<p style="color:#d9ffe9">🌈 순수의 극치 — 여덟 빛이 모두 깨어났습니다. 이긴 것보다 깨어난 것이 이번 항해의 보물입니다.</p>':''}<p style="color:#cfe9ff">☯ 윤리 공명 ${ethics()}% — ${ethics()>=70?'인류의 도덕과 우주의 도덕이 하나의 결로 울렸습니다.':ethics()>=40?'두 도덕 사이에서 균형을 찾아가는 항해였습니다.':'이긴 방식이 다음 우주의 모습을 만듭니다. 어떤 우주를 남기고 싶습니까?'}</p>${H.divine?'<p style="color:#e9dcff">✨ 우주적 지성과 감성이 신성으로 조화된 항해였습니다.</p>':''}
 <p style="margin-top:12px;color:#ffe3a3">🪞 성찰 질문 — ${ev.question}</p>
 <div class="row" style="display:flex;gap:8px;margin-top:10px"><button class="btn main" id="again">같은 설정으로 다시 <kbd>Enter</kbd></button><button class="btn" id="setup2">새 설정</button></div>`);
; const bind=()=>{$('#again').onclick=()=>{closeModal();startGame(G.cfg)};$('#setup2').onclick=()=>{closeModal();setup()}};
 if(G.speedMul<.1){G.ending=endingOf();showResult();bind();return}
 endCinematic(won,reason,()=>{showResult();bind()});
}
