// ================= UI =================
function renderAll(){if(typeof renderLab==='function'&&G){renderLab();renderBank();renderHero()}renderChakra();renderPlayers();renderMarket();renderAssets();renderAct();renderBoard();renderHeader();renderMap()}
function renderHeader(){if(!G)return;const ph=OH.PHASES[G.phase];$('#hRound').textContent=`${G.round}${G.maxRounds?'/'+G.maxRounds:''}일차`;$('#hDate').textContent=`${G.date.getFullYear()}.${G.date.getMonth()+1}.${G.date.getDate()} ${G.astro.pillar.hz}日`;$('#hPhase').innerHTML=`${OH.HZ[ph.el]} ${ph.name} <small>${G.phaseLeft}일</small>`;$('#hPot').textContent=`🏦 ${fmt(G.pot)}`;
 $('#astro').innerHTML=`${esc(G.astro.text)}${G.players[0].day?`<br><b style="color:#ffe3a3">나의 흐름: ${esc(G.players[0].day.t)}</b>`:''}`;drawWheel()}
function drawWheel(){const s=$('#wheel');if(!s)return;const R=40;let h='';OH.EL.forEach((e,k)=>{const a=-Math.PI/2+k*2*Math.PI/5;const x=50+Math.cos(a)*R,y=50+Math.sin(a)*R;const on=k===G.phase;h+=`<circle cx="${x}" cy="${y}" r="${on?13:10}" fill="${OH.COLOR[e]}" opacity="${on?1:.45}" ${on?'stroke="#fff" stroke-width="2"':''}/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="${on?14:11}" fill="#1a1530" font-weight="700">${OH.HZ[e]}</text>`});s.innerHTML=`<circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(255,255,255,.18)" stroke-dasharray="3 4"/>${h}`}
function renderPlayers(){if(!G)return;const max=Math.max(...G.players.map((P,i)=>P.out?0:netWorth(i)),1);
 $('#players').innerHTML=G.players.map((P,i)=>{const nw=P.out?0:netWorth(i);const loc=P.wid===G.players[0].wid||G.players[0].known.has(P.wid)?W(P.wid).name.split(' (')[0]:'신호 두절';
 return `<div class="pl ${G.cur===i?'cur':''} ${P.out?'out':''}" style="--pc:${P.color}" id="pl${i}"><span class="av">${P.isAI?SK.pawn(P.color,true,i*7+3):SK.pawn(P.color,false)}</span><div class="nm">${esc(P.name)} <small>${P.isAI?esc(P.pers.title):'인간 · '+(P.el?OH.HZ[P.el]+' 일간':'')}</small></div><div class="cash">${fmt(P.cash)}</div><div class="meta"><span>순자산 ${fmt(nw)}</span><span>🪐${allOwned(i).length}</span><span>💠${P.shards}/5</span>${i===0?`<span title="인류의 도덕과 우주의 도덕의 공명">☯${ethics()}%</span>`:''}${P.qdice?`<span>⚛️${P.qdice}</span>`:''}${P.jail?'<span>🚨조사</span>':''}<span>📍${esc(loc)}</span></div><div class="bar"><i style="width:${nw/max*100}%"></i></div></div>`}).join('')}
function spark(a,c){if(a.length<2)return '';const mn=Math.min(...a),mx=Math.max(...a),r=mx-mn||1;return `<svg viewBox="0 0 70 20" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="1.6" points="${a.map((v,k)=>`${k/(a.length-1)*70},${18-(v-mn)/r*16}`).join(' ')}"/></svg>`}
function renderMarket(){if(!G)return;$('#market').innerHTML=SKEYS.map(k=>{const h=G.hist[k],v=G.idx[k],pv=h.length>1?h[h.length-2]:100,ch=Math.round((v/pv-1)*1000)/10;return `<div class="mk"><span class="dot" style="background:${SECT[k].c};box-shadow:0 0 8px ${SECT[k].c}"></span><span>${SECT[k].name}</span><span class="v">${v}</span><span class="v ${ch>=0?'up':'dn'}">${ch>=0?'▲':'▼'}${Math.abs(ch)}%</span>${spark(h.concat([v]),SECT[k].c)}</div>`}).join('')}
function canManage(){return G&&G.ask&&G.ask.cfg.manage&&G.cur===0&&!G.autoHuman}
function renderAssets(){if(!G)return;const box=$('#assets');const m=canManage();const L=allOwned(0);
 let h=`<div class="sub" style="margin-bottom:6px">${m?'지금 관리할 수 있습니다.':'내 차례의 결정 시점에 개발·담보·매각·인수 제안이 가능합니다.'}</div>`;
 h+=`<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap"><button class="btn sm" data-a="probe" ${m&&G.players[0].cash>=40?'':'disabled'}>🛰 탐사선 발사 (40억)</button><button class="btn sm" data-a="love" ${canCompassion()!=null?'':'disabled'} title="가장 어려운 상대에게 현금 6%를 보냅니다 (5일마다)">💚 자비 · 아나하타</button></div>`;
 if(!L.length)h+='<div class="sub">아직 보유 자산이 없습니다. 행성에 도착해 매입해 보세요.</div>';
 for(const [w,i] of L){const s=sp(w,i),o=own(w,i);h+=`<div class="asset"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:${SECT[s.g].c}"></span><span><b>${esc(s.name)}</b> <small class="sub">${esc(W(w).name.split(' (')[0])} · ${o.lv?(o.lv===5?'🌟IPO':'★'.repeat(o.lv)):''}${o.m?'🔒담보':''} 통행료 ${fmt(rentOf(w,i,7))}</small></span><span class="acts">
 <button class="btn sm" data-a="b" data-w="${w}" data-i="${i}" ${m&&canBuild(0,w,i)&&G.players[0].cash>=buildCost(0,w,i)?'':'disabled'} title="개발 (${fmt(s.build?buildCost(0,w,i):0)})">개발</button>
 <button class="btn sm" data-a="sb" data-w="${w}" data-i="${i}" ${m&&canSellB(0,w,i)?'':'disabled'}>철수</button>
 ${o.m?`<button class="btn sm" data-a="um" data-w="${w}" data-i="${i}" ${m&&canUnmort(0,w,i)?'':'disabled'}>해제 ${fmt(unmortCost(w,i))}</button>`:`<button class="btn sm" data-a="mo" data-w="${w}" data-i="${i}" ${m&&canMort(0,w,i)?'':'disabled'}>담보</button>`}
 <button class="btn sm" data-a="sl" data-w="${w}" data-i="${i}" ${m&&canSellBank(0,w,i)?'':'disabled'}>매각</button></span></div>`}
 box.innerHTML=h;}
$('#assets').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b||b.disabled||!canManage())return;const a=b.dataset.a,w=b.dataset.w,i=+b.dataset.i;
 if(a==='probe'){launchProbe(0)}else if(a==='love'){compassion()}else if(a==='b'){doBuild(0,w,i)&&(sfx('merge'),log(`🏗 ${sp(w,i).name} 개발 → ${'★'.repeat(own(w,i).lv)}`,'good'))}else if(a==='sb'){sellB(0,w,i)}else if(a==='mo'){mort(0,w,i)&&log(`🔒 ${sp(w,i).name} 담보 설정`,'sys')}else if(a==='um'){unmort(0,w,i)}else if(a==='sl'){const v=sellValue(w,i);sellBank(0,w,i)&&log(`💱 ${sp(w,i).name} 은행 매각 +${fmt(v)}`,'sys')}
 sfx('coin');renderAll()});
function renderAct(){if(!G)return;const box=$('#act');const a=G.ask;
 if(!a){box.innerHTML=`<div class="q">${G.over?'게임 종료':esc(G.status||'')}</div>`;return}
 box.innerHTML=`<div class="q">${a.text}</div><div class="row">${a.opts.map((o,k)=>`<button class="btn ${o.main?'main':''}" data-k="${k}" ${o.en&&!o.en()?'disabled':''}>${o.t}<kbd>${o.main?'Space':k+1}</kbd></button>`).join('')}</div>`;
 box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const o=a.opts[+b.dataset.k];if(o.en&&!o.en())return;sfx('step');a.res(o.v)});
 if(a.cfg.manage)renderAssets();}
function renderLog(){const b=$('#log');if(!b||!G)return;b.innerHTML=G.log.slice(0,140).map(l=>`<div class="${l.cls}">${esc(l.t)}</div>`).join('')}
function renderDice(anim){const pips={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};['#d1','#d2'].forEach((id,k)=>{const el=$(id);el.innerHTML=[...Array(9)].map((_,j)=>`<i style="visibility:${pips[G.dice[k]].includes(j)?'visible':'hidden'}"></i>`).join('');if(anim){el.classList.remove('roll');void el.offsetWidth;el.classList.add('roll')}})}
function renderMap(){if(!G)return;const H=G.players[0];const box=$('#map');if(!box)return;
 const tree=(id,d)=>{const w=W(id);const known=H.known.has(id);const here=G.players.map((P,k)=>!P.out&&P.wid===id&&(known)?`<i style="color:${P.color}">●</i>`:'').join('');
  let s=`<div class="mnode ${V.view===id?'on':''}" style="margin-left:${d*14}px" data-w="${known?id:''}">${known?`🌌 ${esc(w.name)}`:'❔ 미확인 신호'} ${here}</div>`;
  for(const k in w.children)s+=tree(w.children[k],d+1);return s};
 const roots=Object.keys(G.worlds).filter(id=>!G.worlds[id].parent||!Object.values(W(G.worlds[id].parent).children).includes(id));
 let h=roots.map(r=>tree(r,0)).join('');
 // 위협 레이더
 const th=[];for(const wid in G.worlds){if(!H.known.has(wid))continue;const w=W(wid);for(const g of new Set(w.spaces.filter(s=>s.type==='prop').map(s=>s.g))){const m=members(wid,g);G.players.forEach((P,q)=>{if(q===0||P.out)return;const c=m.filter(j=>own(wid,j).o===q).length;if(c===m.length)th.push(`🔴 ${P.name}: ${SECT[g].name} 독점 완성 (${w.name.split(' (')[0]})`);else if(c===m.length-1&&m.some(j=>own(wid,j).o<0))th.push(`🟠 ${P.name}: ${SECT[g].name} 독점 1칸 전 — 남은 칸을 선점하세요`)})}}
 h+=`<h3 style="margin-top:10px">🎯 수읽기 레이더</h3>${th.length?th.map(t=>`<div class="sub" style="color:#ffd0a8">${esc(t)}</div>`).join(''):'<div class="sub">감지된 독점 위협 없음</div>'}`;
 h+=`<div class="sub" style="margin-top:6px">AI 성향 힌트: ${G.players.filter(P=>P.isAI&&!P.out).map(P=>`${esc(P.name)}=${esc(P.pers.title)}`).join(', ')}</div>`;
 box.innerHTML=h;box.querySelectorAll('.mnode[data-w]').forEach(n=>{if(n.dataset.w)n.onclick=()=>switchView(n.dataset.w)});}
function showNews(t,d){const n=$('#news');n.innerHTML=`<b>${esc(t)}</b><div>${esc(d)}</div>`;n.classList.remove('show');void n.offsetWidth;n.classList.add('show')}
function floatTxt(p,a){const el=$('#pl'+p);if(!el||!a)return;const f=document.createElement('div');f.className='float '+(a>0?'up':'dn');f.textContent=(a>0?'+':'')+fmt(a);el.appendChild(f);setTimeout(()=>f.remove(),1400)}
function burst(big){if(typeof confetti!=='function'||!G||G.speedMul<.1)return;try{confetti({particleCount:big?220:70,spread:big?120:70,origin:{y:.6},colors:['#ffd6f0','#b9a6ff','#9ff0e0','#ffe3a3','#ffffff'],disableForReducedMotion:true})}catch(e){}}
function shake(){const s=$('#stage');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake')}
function modal(html){$('#dlg').innerHTML=html;$('#modal').classList.add('show')}
function closeModal(){$('#modal').classList.remove('show')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'&&!$('#dlg').dataset.lock)closeModal()});
function openInfo(wid,i){if(!G)return;const s=sp(wid,i),o=own(wid,i);let h=`<h2>${ICON[s.type]||''} ${esc(s.name)}</h2><div class="sub">${esc(W(wid).name)}</div>`;
 const desc={start:'통과하거나 도착하면 급여 200억 + 보유 섹터당 10억 분산 보너스.',news:'우주 뉴스 카드를 뽑습니다.',tax:s.amount?`${s.amount}억을 납부합니다.`:'순자산의 10%(최대 200억)를 납부합니다.',jail:'은하 감찰청. 조사 중이면 과징금 50억, 더블, 면책권, 1/12 확률 양자 터널링으로 탈출.',portal:'평행우주로 들어가는 문. 하위 우주는 자산 가치가 높고 보물 행성이 있습니다. 귀환 게이트를 지나면 돌아옵니다.',bank:`쌓인 세금·과징금(공적자금 ${fmt(G.pot)})을 모두 가져갑니다.`,blackhole:'빨려 들어가 질량(현금 5%)을 잃고, 다른 우주로 튕겨 나가거나 웜홀이 되어 새 차원을 엽니다.',gate:'상위 우주로 돌아가는 문 (지나가면 자동 귀환).',treasure:'보물 행성: 현금과 차원 결정(5개면 초월 승리)을 얻습니다. 3일마다 재생.'}[s.type];
 if(desc)h+=`<p>${desc}</p>`;
 if(o){const P=o.o>=0?G.players[o.o]:null;h+=`<div class="info"><div class="rent"><span>섹터</span><span>${SECT[s.g].name} (지수 ${idxOf(s.g)})</span><span>시세</span><span>${fmt(mkt(wid,i))}</span><span>소유</span><span>${P?esc(P.name):'없음'}</span><span>현재 통행료</span><span>${fmt(rentOf(wid,i,7))}</span>`;
  if(s.type==='prop')h+=['기본','★','★★','★★★','★★★★','🌟 상장(IPO)'].map((l,k)=>`<span>${l}</span><span>${fmt(s.rent[k]*idxOf(s.g)/100)}</span>`).join('')+`<span>개발비</span><span>${fmt(s.build)}</span>`;
  else if(s.type==='etf')h+='<span>ETF 1/2/3/4개</span><span>25/50/100/200억×지수</span>';else h+='<span>코인 1/2개</span><span>주사위×4 / ×10 ×지수</span>';
  h+='</div></div>';
  if(P&&P.isAI&&canManage()){const def=Math.round(mkt(wid,i)*1.5);h+=`<label>인수 제안가 (억)</label><input id="offer" type="number" min="1" value="${def}"><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn main" id="offerBtn">🤝 인수 제안 (${3-G.offers}회 남음)</button></div><div id="offerRes" class="sub" style="margin-top:6px"></div>`}
 }
 h+=`<div style="margin-top:10px"><button class="btn" onclick="document.getElementById('modal').classList.remove('show')">닫기 <kbd>Esc</kbd></button></div>`;
 modal(h);const ob=$('#offerBtn');if(ob)ob.onclick=()=>{const r=humanOffer(wid,i,+$('#offer').value);const box=$('#offerRes');if(typeof r==='string'){box.textContent=r;return}if(r.ok){box.textContent='인수 성공!';burst();setTimeout(closeModal,700)}else{box.innerHTML=`거절 — 상대의 역제안: <b>${fmt(r.need)}</b> <button class="btn sm main" id="ctr">역제안 수락</button>`;$('#ctr').onclick=()=>{if(acceptCounter(wid,i,r.need)){burst();closeModal()}else box.textContent='현금이 부족하거나 거래가 불가능합니다'}}}}

// ================= 설정·시작 =================
let lineup=null;
function setup(){
 if(!lineup)lineup=PicnicRng.create().shuffle(PERS.map((_,i)=>i));
 const c=(G&&G.cfg)||{name:'피크닉',ai:1,diff:'normal',rounds:30,speed:'normal',seed:'',birth:''};
 modal(`<h2>🌌 다르마 갤럭시 · 다갤</h2><div class="sub" style="margin:-6px 0 8px">PICNIC GALAXY — 은하문명의 창조자들</div><p class="sub">인간 1명 대 AI 1~7명. 우주가 곧 보드입니다. 행성 자산을 사고 개발해 통행료를 걷고, AI의 수를 읽어 독점을 막으세요. 차원 포털과 블랙홀 너머 평행우주에서 차원 결정 5개를 모으면 초월 승리합니다.</p>
 <div class="grid2"><div><label>지휘관 이름</label><input id="sName" value="${esc(c.name)}" maxlength="10"></div>
 <div><label>생년월일 (양력, 선택) — 일주로 나의 일간 오행 산출</label><input id="sBirth" type="date" value="${esc(c.birth)}"></div>
 <div><label>AI 상대 수</label><select id="sAi">${[1,2,3,4,5,6,7].map(n=>`<option ${n==c.ai?'selected':''} value="${n}">${n}명${n===1?' (1:1 대결)':''}</option>`).join('')}</select></div>
 <div><label>AI 난이도</label><select id="sDiff"><option value="easy">쉬움</option><option value="normal">보통</option><option value="hard">어려움</option></select></div>
 <div><label>항해 기간</label><select id="sRounds">${[[20,'20턴 (빠른 판)'],[30,'30턴'],[50,'50턴'],[100,'100턴'],[200,'200턴'],[0,'무제한 (파산·초월까지)']].map(([v,t])=>`<option value="${v}" ${v==c.rounds?'selected':''}>${t}</option>`).join('')}</select></div>
 <div><label>진행 속도</label><select id="sSpeed"><option value="slow">느리게</option><option value="normal">보통</option><option value="fast">빠르게</option></select></div>
 <div><label>우주 시드 (비우면 무작위)</label><input id="sSeed" value="${esc(c.seed)}" inputmode="numeric"></div></div>
 <div id="birthOut" class="sub" style="margin-top:6px"></div>
 <label>AI 상대 미리보기 <button class="btn sm" id="reroll">🔀 다시 뽑기</button></label><div class="lineup" id="lineup"></div>
 <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn main" id="go">🚀 출항 <kbd>Enter</kbd></button><button class="btn" id="rulesBtn">📖 규칙</button></div>`);
 $('#sDiff').value=c.diff;$('#sSpeed').value=c.speed;$('#dlg').dataset.lock=G&&!G.over?'':'1';
 const drawL=()=>{const n=+$('#sAi').value;$('#lineup').innerHTML=lineup.slice(0,n).map(k=>{const P=PERS[k];return `<div class="ai"><span>${SK.pawn(P.color,true,k*7+3)}</span><span><b>${P.name}</b> · ${P.title}</span></div>`}).join('')};
 const drawB=()=>{const v=$('#sBirth').value;if(!v){$('#birthOut').textContent='';return}const d=new Date(v+'T12:00:00');const p=AC.dayPillar(d);$('#birthOut').innerHTML=`일주 <b style="font-size:18px;color:#ffe3a3">${p.hz}</b> (${p.ko}) — 일간 ${p.hz[0]} = ${OH.HZ[p.stemEl]}(${p.stemEl}) 기운. 매일의 일진과 나의 일간이 만드는 십성 흐름이 게임에 반영됩니다.`};
 $('#sAi').onchange=drawL;$('#reroll').onclick=()=>{lineup=PicnicRng.create().shuffle(lineup);drawL()};$('#sBirth').oninput=drawB;drawL();drawB();
 $('#rulesBtn').onclick=rules;
 $('#go').onclick=()=>{delete $('#dlg').dataset.lock;const cfg={name:$('#sName').value.trim()||'지휘관',birth:$('#sBirth').value,ai:+$('#sAi').value,diff:$('#sDiff').value,rounds:+$('#sRounds').value,speed:$('#sSpeed').value,seed:$('#sSeed').value.trim(),lineup:lineup.slice()};closeModal();startGame(cfg)};
}
function startGame(cfg){
 TOKEN++;if(pendingAsk){try{pendingAsk.rej(ABORT)}catch(e){}pendingAsk=null}
 R=PicnicRng.create(cfg.seed===''?null:+cfg.seed||PicnicRng.hash(cfg.seed));
 const sp_={slow:1.5,normal:1,fast:.45,test:0}[cfg.speed]??1;
 G={cfg,players:[],worlds:{},wseq:0,idx:{},hist:{},round:1,maxRounds:cfg.rounds,phase:0,phaseLeft:3,pot:0,deck:[],turn:0,cur:0,over:false,diff:cfg.diff,speedMul:sp_,stepMs:170,sound:G?G.sound:true,log:[],dice:[1,1],entangle:[],probes:[],cool:{},offers:0,autoHuman:!!cfg.auto,manual:!!cfg.manual,autoManage:cfg.autoManage!==false,pauseReq:false,startCash:1500,startDate:new Date(),ascended:false,status:'',stats:{probes:0,mna:0,deals:0,depth:0},prophetDue:false};
 G.startDate.setHours(12,0,0,0);
 addWorld(Multiverse.root());
 SKEYS.forEach(k=>{G.idx[k]=100;G.hist[k]=[100]});
 const me={name:cfg.name,isAI:false,color:'#7fd6ff',el:cfg.birth?AC.dayPillar(new Date(cfg.birth+'T12:00:00')).stemEl:null};
 G.players.push(me);(cfg.lineup||PERS.map((_,i)=>i)).slice(0,cfg.ai).forEach(k=>{const P=PERS[k];G.players.push({name:P.name,isAI:true,pers:P,color:P.color,el:P.el})});
 G.players[0].pers=Object.assign({},PERS[0],{quotes:['']});G.players.forEach(P=>Object.assign(P,{cash:G.startCash,wid:'W0',pos:0,jail:false,jt:0,free:0,out:false,dbl:0,shards:0,qdice:1,known:new Set(['W0'])}));G.players.forEach(P=>finInit(P));G.players.forEach((P,i)=>spellInit(P,i));G.players.forEach((P,i)=>heroInit(P,i));questInit();G.codex=new Set();G.recipes=new Set();G.monsters=[];G.mseq=0;
 G.players.forEach((P,i)=>{['core','body','power'].forEach(k=>P.cards[k][ri(0,9)]++);giveCard(i,1);givePotion(i)});
 G.phase=R.int(0,4);newDayAstro();
 V.ships.forEach(s=>s.o&&V.shipG.remove(s.o));V.ships=[];if(window.CosmicMusic)CosmicMusic.setMood(OH.PHASES[G.phase].el);
 buildWorld('W0');renderDice();for(let k=0;k<3;k++)spawnMonster('W0');renderMonsters();
 log(`🚀 출항! ${G.players.length-1}명의 AI와 대결합니다 · 시드 ${R.seed}`,'sys');log(`🗓 1일차 · ${G.astro.text}`,'sys');
 const ph=OH.PHASES[G.phase];showNews(`${OH.HZ[ph.el]} ${ph.name}에서 시작`,ph.desc);sfx('start',0);
 renderAll();gameLoop();
}
function rules(){modal(`<div class="rules"><h2>📖 다르마 갤럭시(다갤) — 규칙</h2>${RULES_HTML}<div style="margin-top:10px"><button class="btn" onclick="document.getElementById('modal').classList.remove('show')">닫기 <kbd>Esc</kbd></button></div></div>`)}

// ================= 키보드·버튼 =================
addEventListener('keydown',e=>{
 if(e.target.matches('input,select,textarea'))return;
 const mOpen=$('#modal').classList.contains('show');
 if(e.key==='Escape'){if(mOpen&&!$('#dlg').dataset.lock)closeModal();return}
 if(mOpen){if(e.key==='Enter'){const b=$('#dlg .btn.main');if(b){e.preventDefault();b.click()}}return}
 const a=G&&G.ask;
 if(a&&(e.key===' '||e.key==='Enter')){e.preventDefault();const o=a.opts.find(o=>o.main&&(!o.en||o.en()));if(o){sfx('step');a.res(o.v)}return}
 if(a&&e.key.toLowerCase()==='b'){const o=a.opts.find(o=>o.t==='매입'&&(!o.en||o.en()));if(o){sfx('coin');a.res(o.v)}return}
 if(a&&/^[1-9]$/.test(e.key)){const o=a.opts[+e.key-1];if(o&&(!o.en||o.en())){sfx('step');a.res(o.v)}return}
 const k=e.key.toLowerCase();const c=V.cam;
 if(k==='l'){V.showLabels=!V.showLabels}else if(k==='f'){V.follow=!V.follow;toast(V.follow?'카메라 따라가기 켬':'카메라 따라가기 끔')}
 else if(k==='m'){G.sound=!G.sound;$('#bSound').textContent=G.sound?'🔊':'🔇'}else if(k==='r'||k==='?'){rules()}
 else if(k==='arrowleft'){c.tth-=Math.PI/2}else if(k==='arrowright'){c.tth+=Math.PI/2}else if(k==='arrowup'){c.ph=clamp(c.ph-.08,.75,1.12)}else if(k==='arrowdown'){c.ph=clamp(c.ph+.08,.75,1.12)}
 else if(k==='+'||k==='='){c.tr=clamp(c.tr*.88,10,70)}else if(k==='-'){c.tr=clamp(c.tr*1.12,10,70)}
 else if(k==='p'){$('#bPause').click()}else if(k==='h'){switchView(G.players[0].wid)}else if(k==='1'||k==='2'||k==='3'){const t=['assets','map','logT'][+k-1];tab(t)}
});
function toast(t){const d=$('#toast');d.textContent=t;d.classList.remove('show');void d.offsetWidth;d.classList.add('show')}
function tab(id){document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===id));['assets','map','logT','lab','bank','hero'].forEach(x=>$('#'+x).style.display=x===id?'':'none')}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
$('#bRules').onclick=rules;$('#bNew').onclick=setup;$('#bSound').onclick=()=>{G.sound=!G.sound;$('#bSound').textContent=G.sound?'🔊':'🔇'};
$('#bAuto').onclick=()=>{G.autoHuman=!G.autoHuman;$('#bAuto').classList.toggle('main',G.autoHuman);toast(G.autoHuman?'🤖 오토 항해 — AI가 대신 둡니다':'오토 항해 끔');if(G.autoHuman&&G.ask&&!G.ask.done){const a=G.ask;const auto=a.cfg.auto||(()=>(a.opts.find(o=>o.main&&(!o.en||o.en()))||a.opts[0]).v);a.res(auto())}};
$('#bSpeed').onclick=()=>{const order=[1.5,1,.45];const k=(order.indexOf(G.speedMul)+1)%3;G.speedMul=order[k];$('#bSpeed').textContent=['🐢','▶','⏩'][k];toast(['느리게','보통','빠르게'][k])};
$('#bPause').onclick=()=>{if(!G)return;G.manual=!G.manual;$('#bPause').classList.toggle('main',G.manual);toast(G.manual?'✋ 수동 모드 — 매 턴 주사위·턴 종료를 직접 합니다':'⚡ 자동 진행 — 핵심 판단만 직접 합니다 (80% 자동화)')};
$('#bHome').onclick=()=>switchView(G.players[0].wid);
document.addEventListener('pointerdown',()=>{try{DungeonSfx.unlock()}catch(e){}},{once:true});

