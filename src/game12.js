// ================= v0.4 영웅 원정 — 조우 · 공성전 · 오행 수호자 · 퀘스트 · 영웅 탭 =================
MON.push(
 {n:'청목 수호자 · 세계수의 그림자',o:{shape:'ghost',color:'#5fbf7a',crown:1,wings:'angel'},lv:6,boss:'목'},
 {n:'적염 수호자 · 꺼지지 않는 불새',o:{shape:'bird',color:'#ff7a4a',crown:1},lv:6,boss:'화'},
 {n:'황토 수호자 · 대지의 거인왕',o:{shape:'golem',color:'#d9b46a',crown:1,eyes:'angry'},lv:7,boss:'토'},
 {n:'백금 수호자 · 강철 백호',o:{shape:'round',color:'#f2f4fa',ears:'pointy',fangs:1,crown:1,eyes:'angry'},lv:7,boss:'금'},
 {n:'흑수 수호자 · 심연의 현무',o:{shape:'golem',color:'#3f5f7a',crown:1,eyes:'sleepy'},lv:8,boss:'수'});
const BOSS0=MON.length-5;
function spawnBoss(){const H=G.players[0];const need=ELS.filter(e=>!H.hero.seals.includes(e)&&!G.monsters.some(x=>MON[x.k].boss===e));if(!need.length)return;const el=need[0];
 const ids=Object.keys(G.worlds);const wid=rnd()<.6?'W0':pick(ids);const L=W(wid).spaces.length;
 G.monsters.push({id:G.mseq++,k:BOSS0+ELS.indexOf(el),wid,pos:ri(1,L-1),lv:MON[BOSS0+ELS.indexOf(el)].lv+W(wid).depth,hp:100,align:el==='목'||el==='토'?'빛':'현기',boss:1});
 log(`👑 ${OH.HZ[el]} ${MON[BOSS0+ELS.indexOf(el)].n}이(가) ${W(wid).name}에 나타났습니다. 쓰러뜨리거나 화해하면 「다르마 인장」을 얻습니다.`,'sys');showNews(`👑 ${OH.HZ[el]}의 수호자 출현`,'다섯 인장을 모으면 차원 결정이 함께 모입니다');renderMonsters()}
function bossTick(){if(G.round>=4&&G.round%3===1&&!G.monsters.some(x=>x.boss))spawnBoss()}
function powOf(stacks){return stacks.reduce((a,s)=>a+stackPow(s),0)}
async function encounter(p){const P=G.players[p];const x=G.monsters.find(m=>m.wid===P.wid&&m.pos===P.pos);if(!x)return;const M=MON[x.k];
 const ring=hasRing(p);if(ring&&!M.boss){ring.c--;if(ring.c<=0)P.relics.splice(P.relics.indexOf(ring),1);log(`💍 ${who(p)} 솔로몬의 반지로 ${M.n}와(과) 대화 — 싸우지 않고 지나갑니다`,'good');chakra(p,4);return}
 const foe=monsterArmy(x);const mine=powOf(sideStacks(p,0)),theirs=powOf(foe);const odds=Math.round(mine/(mine+theirs)*100);const bribe=Math.round(15+x.lv*10)*(M.boss?3:1);
 const peace=M.boss&&p===0&&ethics()>=60;let c;
 if(isHuman(p))c=await ask(`${M.boss?'👑':'👾'} <b>${esc(M.n)}</b> (Lv.${x.lv} · ${x.align==='빛'?'✨빛':'🌑현기'}${M.boss?` · ${OH.HZ[M.boss]}의 인장`:''})이(가) 항로를 막았습니다!<br>아군 전력 ${Math.round(mine)} vs 적 ${Math.round(theirs)} — 예상 우세 약 ${odds}%<br><small class="sub">육각 전장에서 부대를 직접 지휘합니다. 자동 전투도 가능합니다.</small>`,
  [{t:'⚔️ 직접 지휘',v:'fight',main:1},{t:'🤖 자동 전투',v:'auto'},...(peace?[{t:'☮️ 화해의 대화 (윤리 60+)',v:'peace'}]:[]),{t:`💸 통행세 ${fmt(bribe)}`,v:'bribe',en:()=>G.players[p].cash>=bribe}],{auto:()=>odds>=45||P.cash<bribe?'auto':'bribe'});
 else c=odds>=42||P.cash<bribe?'auto':'bribe';
 if(c==='bribe'){P.cash-=bribe;G.pot+=bribe;log(`💸 ${who(p)} ${M.n}에게 통행세 ${fmt(bribe)}`,'sys');return}
 if(c==='peace'){G.monsters.splice(G.monsters.indexOf(x),1);P.karma=(P.karma||0)+1;sealGet(p,M.boss,'화해');chakra(0,3);log(`☮️ ${M.n}이(가) 칼을 내려놓습니다 — "분리에서 연결로." 싸우지 않고 인장을 건넵니다.`,'good');renderMonsters();renderAll();return}
 const r=await battle(p,foe,{title:M.n,auto:c==='auto'});
 if(r.win){G.monsters.splice(G.monsters.indexOf(x),1);const cash=Math.round(30+x.lv*25)*(M.boss?3:1);P.cash+=cash;P.know+=x.lv;if(p===0)G.stats.kills2=(G.stats.kills2||0)+1;
  log(`⚔️ ${who(p)} ${M.n} 격파! +${fmt(cash)} · 지식 +${x.lv}`,p===0?'good':'ai');giveCard(p,1+(x.lv>3?1:0),'전리품 카드');if(rnd()<.6)givePotion(p,'전리품 포션');giveItem(p,'전리품');
  if(x.lv>=3&&rnd()<.3)learnSpell(p);if((x.lv>=4&&rnd()<.25)||M.boss)giveRelic(p,M.n+' 처치');if(M.boss)sealGet(p,M.boss,'승리');if(p===0){burst();questEvent('kill',x)}}
 else{const loss=Math.round(P.cash*.05);P.cash-=loss;log(`💥 ${who(p)} ${M.n}에게 ${r.fled?'후퇴':'패배'} — ${fmt(loss)} 손실, 부대 손상`,'bad')}
 renderMonsters();renderAll()}
function sealGet(p,el,how){const H=G.players[p].hero;if(H.seals.includes(el))return;H.seals.push(el);log(`🔱 ${who(p)} ${OH.HZ[el]}의 다르마 인장 획득 (${how}) — ${H.seals.length}/5`,p===0?'good':'ai');if(p===0){burst(true);sfx('win',1)}gainShard(p)}
// ---- 공성전: 개발된 행성에서 통행료 대신 결투 ----
async function siege(p,o,wid,i,rent){const P=G.players[p],O=G.players[o];if(own(wid,i).lv<1||rent<40)return 1;
 const foe=garrison(o,wid,i);const mine=powOf(sideStacks(p,0)),theirs=powOf(foe);if(mine<10)return 1;const odds=Math.round(mine/(mine+theirs)*100);let c;
 if(isHuman(p))c=await ask(`🏰 <b>${esc(sp(wid,i).name)}</b> 수비대가 통행료 ${fmt(rent)}을 요구합니다.<br>공성전에 이기면 통행료 0 + 전리품, 지면 통행료 ×1.5. 예상 우세 약 ${odds}%`,[{t:`💳 ${fmt(rent)} 지불`,v:'pay',main:1},{t:'⚔️ 공성전 (직접 지휘)',v:'fight'},{t:'🤖 공성전 (자동)',v:'auto'}],{auto:()=>odds>=62?'auto':'pay'});
 else c=odds>=60&&rnd()<(P.pers.key==='ares'?.9:.5)?'auto':'pay';
 if(c==='pay')return 1;log(`🏰 ${who(p)} → ${O.name}의 ${sp(wid,i).name} 공성전!`,'sys');
 const r=await battle(p,foe,{title:`${sp(wid,i).name} 공성전`,auto:c==='auto',ehero:o});
 if(r.win){P.hero.sieges++;const loot=Math.round(rent*.3);P.cash+=loot;O.hero.army.slice(0,2).forEach(s=>s.n=Math.floor(s.n*.8));O.hero.army=O.hero.army.filter(s=>s.n>0);log(`🏰 ${who(p)} 공성전 승리! 통행료 면제 + 전리품 ${fmt(loot)}`,p===0?'good':'ai');if(p===0)questEvent('siege');return 0}
 log(`🏰 ${who(p)} 공성전 패배 — 통행료 ×1.5`,'bad');return 1.5}
// ---- AI 영웅 ----
function aiArmy(p){const P=G.players[p];const k=P.pers.key;const res=aiReserve(p);const share={ares:.45,athena:.25,chronos:.25,hephaestus:.2,isis:.2,hermes:.15,sophia:.12}[k]||.2;let budget=Math.max((P.cash-res)*share,armyValue(P)<60+G.round*8?P.cash*share*.5:0);if(budget<10)return;
 const av=availUnits(p).sort((a,b)=>b.tier-a.tier||(a.el===P.hero.el?-1:1));for(const u of av){if(budget<u.cost)continue;const n=Math.min(Math.floor(budget/u.cost),Math.floor((leadMax(P)-leadUsed(P))/u.lead));if(n<=0)continue;const got=recruit(p,u.id,n);budget-=got*u.cost;if(got&&rnd()<.4)log(`🛡 ${P.name} ${u.name} ${got}기 모병`,'ai');if(P.hero.army.length>=5)break}}
// ---- 퀘스트 ----
const QT=[
 {k:'kill',n:2,t:'항로의 몬스터 2마리를 물리치기',rew:p=>{addCash(p,120,'📜 퀘스트 보상 +120억');gainXp(p,80)}},
 {k:'siege',n:1,t:'공성전에서 1번 이기기',rew:p=>{giveRelic(p,'퀘스트 보상')}},
 {k:'recruit3',n:1,t:'3단계 이상 병종 모병하기',rew:p=>{learnSpell(p);gainXp(p,60)}},
 {k:'depth',n:2,t:'깊이 2 이상의 평행우주에 들어가기',rew:p=>{giveCard(p,3,'퀘스트 보상')}},
 {k:'army',n:300,t:'군대 가치 300억 이상 꾸리기',rew:p=>{G.players[p].hero.lead+=60;log('📜 퀘스트 보상 — 지휘력 +60','good')}},
 {k:'kill',n:4,t:'몬스터 4마리 토벌 (은하 치안대 의뢰)',rew:p=>{addCash(p,260,'📜 퀘스트 보상 +260억');givePotion(p,'퀘스트 보상')}},
 {k:'level',n:4,t:'영웅 레벨 4 달성',rew:p=>{giveRelic(p,'퀘스트 보상')}},
 {k:'seal',n:2,t:'다르마 인장 2개 모으기',rew:p=>{G.players[p].karma=(G.players[p].karma||0)+1;gainXp(p,150);chakra(0,5)}}];
function questInit(){G.quests=[];G.qdone=0;G.qNext=0;for(let k=0;k<3;k++)questNew()}
function questNew(){if(G.qNext>=QT.length)return;const q=QT[G.qNext++];G.quests.push({i:G.qNext-1,have:0})}
function questEvent(type,data){if(!G.quests)return;const H=G.players[0];
 for(const q of G.quests){const T=QT[q.i];if(T.k==='kill'&&type==='kill')q.have++;else if(T.k==='siege'&&type==='siege')q.have++;else if(T.k==='recruit3'&&type==='recruit'&&data.tier>=3)q.have++;
  else if(T.k==='depth')q.have=G.stats.depth;else if(T.k==='army')q.have=Math.round(armyValue(H));else if(T.k==='level')q.have=H.hero.lvl;else if(T.k==='seal')q.have=H.hero.seals.length}
 const done=G.quests.filter(q=>q.have>=QT[q.i].n);for(const q of done){G.quests.splice(G.quests.indexOf(q),1);G.qdone++;log(`📜 퀘스트 완료: ${QT[q.i].t}`,'good');QT[q.i].rew(0);sfx('win',1);questNew()}}
// ---- 영웅 탭 ----
function renderHero(){const box=$('#hero');if(!box||!G||!G.players[0].hero)return;const P=G.players[0],H=P.hero;
 const av=availUnits(0);const room=leadMax(P)-leadUsed(P);
 box.innerHTML=`<div class="herocard"><div><b style="font-size:16px">${esc(P.name)}</b> · ${OH.HZ[H.el]} ${H.cls} <span class="sub">(${H.path})</span><br>
  <span class="sub">레벨 ${H.lvl} · 경험 ${H.xp}/${H.lvl*120} · 공격 +${H.atk} · 방어 +${H.def} · 마나 ${Math.round(P.mp)}/${mpMax(0)} · 승리 ${H.wins} · 공성 ${H.sieges}</span>
  <div class="xpbar"><i style="width:${Math.round(H.xp/(H.lvl*120)*100)}%"></i></div>
  <span class="sub">지휘력 ${leadUsed(P)}/${leadMax(P)} · 군대 가치 ${fmt(armyValue(P))}</span><br>
  <span class="seals">${ELS.map(e=>`<i class="${H.seals.includes(e)?'on':''}" style="--c:${OH.COLOR[e]}" title="${OH.HZ[e]}의 다르마 인장">${OH.HZ[e]}</i>`).join('')}</span> <span class="sub">다르마 인장 ${H.seals.length}/5 (모으면 차원 결정도 함께)</span></div></div>
 <h3 style="margin-top:8px">⚔️ 부대 (${H.army.length}/5) ${P.robots.length?`+ 로봇 ${Math.min(2,P.robots.filter(r=>r.hp>20).length)}대 참전`:''}</h3>
 ${H.army.map((s,k)=>{const u=UNITS[s.u];return `<div class="unit"><img src="${unitImg(u.id).src}"><span><b>${u.name}</b> ×${s.n} <small class="sub">${OH.HZ[u.el]} · ${u.tier}단계 · ${u.align}${u.ranged?' · 원거리':''}${u.fly?' · 비행':''}${u.skill?' · '+u.skill:''}</small><br><small class="sub">체력 ${u.hp} · 공 ${u.atk} · 방 ${u.def} · 피해 ${u.d[0]}~${u.d[1]} · 속도 ${u.spd}</small></span><button class="btn sm" data-dis="${k}">해산</button></div>`}).join('')||'<div class="sub">부대가 없습니다.</div>'}
 <h3 style="margin-top:8px">🛡 모병소 <small class="sub">남은 지휘력 ${room} · 소유 행성의 오행이 높은 단계를 엽니다</small></h3>
 <div class="recruit">${av.sort((a,b)=>a.tier-b.tier||ELS.indexOf(a.el)-ELS.indexOf(b.el)).map(u=>{const mx=Math.max(0,Math.min(Math.floor(room/u.lead),Math.floor(P.cash/u.cost)));return `<div class="unit sm"><img src="${unitImg(u.id).src}"><span><b>${u.name}</b> <small class="sub">${OH.HZ[u.el]}${u.tier} · ${fmt(u.cost)}/기 · 지휘 ${u.lead}</small></span><button class="btn sm" data-rc="${u.id}" data-n="5" ${mx>=1?'':'disabled'}>+5</button><button class="btn sm" data-rc="${u.id}" data-n="${mx}" ${mx>=1?'':'disabled'}>최대 ${mx}</button></div>`}).join('')}</div>
 <h3 style="margin-top:8px">📜 퀘스트 (완료 ${G.qdone})</h3>${(G.quests||[]).map(q=>`<div class="sub">◇ ${QT[q.i].t} — ${Math.min(q.have,QT[q.i].n)}/${QT[q.i].n}</div>`).join('')||'<div class="sub">모든 의뢰를 마쳤습니다.</div>'}
 <div class="sub" style="margin-top:4px">🔮 우주 예언자의 큰 의뢰: 다섯 오행 수호자에게서 다르마 인장을 모으십시오. 윤리가 60 이상이면 싸우지 않고 화해할 수 있습니다.</div>`;
 box.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{if(G.over)return;recruit(0,+b.dataset.rc,+b.dataset.n);renderAll()});
 box.querySelectorAll('[data-dis]').forEach(b=>b.onclick=()=>{H.army.splice(+b.dataset.dis,1);renderAll()})}
