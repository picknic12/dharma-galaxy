// ================= v0.5 루프 · 스테이지 — 기초부터 한 단계씩 =================
// 루프(단계)마다 여러 스테이지가 있다. 스테이지는 짧고(약 15분), 목표가 하나다.
// 반복하다 지루함 신호가 보이면 다음 루프로 올라가기를 권한다.
const LOOPS=[
 {n:'기초 루프',d:'사고, 받고, 모으기 — 보드의 기본 리듬',tier:1,st:[
  {id:'1-1',n:'첫 행성',el:'목',goal:'행성 3개 갖기',ok:s=>allOwned(0).length>=3},
  {id:'1-2',n:'월급날',el:'토',goal:'모항성 급여 3번 받기 (출발점 3번 지나기)',ok:s=>s.sal>=3},
  {id:'1-3',n:'한 가지 색',el:'화',goal:'같은 업종 행성 모두 모으기(독점 1개)',ok:()=>monoCount()>=1},
  {id:'1-4',n:'통행료 받기',el:'금',goal:'통행료로 모두 200억 받기',ok:s=>s.rent>=200},
  {id:'1-5',n:'알뜰 항해',el:'수',goal:'현금을 300억 아래로 떨어뜨리지 않고 12일 버티기',ok:s=>s.safe>=12},
  {id:'1-6',n:'은하 부자',el:'목',goal:'순자산 2,200억 넘기기',ok:()=>netWorth(0)>=2200}]},
 {n:'초중급 루프',d:'금리·예금·대출·담보 — 돈이 돈을 버는 법',tier:2,st:[
  {id:'2-1',n:'첫 예금',el:'금',goal:'예금 300억 이상 맡기기',ok:()=>G.players[0].dep>=300},
  {id:'2-2',n:'금리의 파도',el:'금',goal:'예금 금리 2% 이상일 때 예금하기',ok:()=>Y().flags.highDep},
  {id:'2-3',n:'빚의 무게',el:'화',goal:'대출을 받았다가 모두 갚기',ok:()=>Y().flags.repaid},
  {id:'2-4',n:'담보 풀기',el:'토',goal:'행성을 담보로 잡았다가 다시 풀기',ok:()=>Y().flags.unmort},
  {id:'2-5',n:'세 바구니',el:'수',goal:'현금·행성·금융 각 15% 이상',ok:()=>{const p=pie();return p.cash>=.15&&p.planet>=.15&&p.fin>=.15}},
  {id:'2-6',n:'채권 차익',el:'목',goal:'채권을 사서 금리가 더 낮을 때 팔기',ok:()=>Y().flags.bondWin}]},
 {n:'중급 루프',d:'영웅·병력·몬스터 — 지키고 넓히기',tier:2,st:[
  {id:'3-1',n:'첫 승리',el:'화',goal:'전투 1번 이기기',ok:()=>G.players[0].hero.wins>=1},
  {id:'3-2',n:'몬스터 사냥',el:'금',goal:'전투 3번 이기기',ok:()=>G.players[0].hero.wins>=3},
  {id:'3-3',n:'영웅의 성장',el:'목',goal:'영웅 레벨 3 되기',ok:()=>G.players[0].hero.lvl>=3},
  {id:'3-4',n:'다르마 인장',el:'토',goal:'다르마 인장 1개 얻기',ok:()=>G.players[0].hero.seals.length>=1},
  {id:'3-5',n:'화해의 길',el:'수',goal:'싸우지 않고 지나가거나 화해하기 (윤리 60 이상)',ok:()=>ethics()>=60},
  {id:'3-6',n:'은하 의회',el:'화',goal:'은하 의회 표결에 2번 참여하기',ok:()=>G.pol&&G.pol.votes>=2}]},
 {n:'중상급 루프',d:'연구소·로봇·카드 — 기술로 버는 법',tier:3,st:[
  {id:'4-1',n:'첫 로봇',el:'금',goal:'로봇 1대 만들기',ok:()=>(G.players[0].robots||[]).length>=1},
  {id:'4-2',n:'로봇 함대',el:'금',goal:'로봇 3대 만들기',ok:()=>(G.players[0].robots||[]).length>=3},
  {id:'4-3',n:'동맹',el:'목',goal:'AI와 동맹 또는 불가침 조약 맺기',ok:()=>G.pol&&Object.values(G.pol.pact).some(x=>x.until>=G.round)},
  {id:'4-4',n:'깊은 우주',el:'수',goal:'2차원 이상 평행우주 다녀오기',ok:()=>G.stats.depth>=2},
  {id:'4-5',n:'세 독점',el:'화',goal:'독점 3개 만들기',ok:()=>monoCount()>=3},
  {id:'4-6',n:'균형의 달인',el:'토',goal:'용호 조화 80% 이상으로 15일 지나기',ok:s=>s.harm>=15}]},
 {n:'고급 루프',d:'마법·유물·차원 결정 — 모든 체계를 한 판에',tier:5,st:[
  {id:'5-1',n:'마법사',el:'수',goal:'마법 8개 익히기',ok:()=>(G.players[0].spells||[]).length>=8},
  {id:'5-2',n:'전설의 유물',el:'금',goal:'전설 유물 1개 얻기',ok:()=>(G.players[0].relics||[]).length>=1},
  {id:'5-3',n:'차원 결정',el:'토',goal:'차원 결정 2개 모으기',ok:()=>G.players[0].shards>=2},
  {id:'5-4',n:'정책의 힘',el:'화',goal:'내가 찬성한 정책 통과시키기',ok:s=>s.polWin>=1},
  {id:'5-5',n:'일곱 빛',el:'목',goal:'차크라 4개 각성',ok:()=>(G.players[0].ck||[]).filter(Boolean).length>=4},
  {id:'5-6',n:'은하 통합',el:'토',goal:'순자산 1위로 마치기',ok:null,end:true}]}];
function monoCount(){const seen=new Set();let n=0;for(const [w,i] of allOwned(0)){const g=sp(w,i).g;const k=w+g;if(seen.has(k))continue;seen.add(k);if(ownsAll(0,w,g))n++}return n}
function stageAll(){return LOOPS.flatMap((L,li)=>L.st.map(s=>Object.assign({loop:li},s)))}
function stageRec(){return store.get('dagal_stage',{})}
function stageOpen(id){const all=stageAll(),k=all.findIndex(s=>s.id===id);if(k<=0)return true;const r=stageRec();const prev=all[k-1];const u=unl();
 return !!r[prev.id]||(all[k].loop<=(u.loop||0)&&all[k].id.endsWith('-1'))}
function startStage(id){const S=stageAll().find(s=>s.id===id);if(!S)return;closeTitle();const P=prefs(),b=birthLoad();
 const lp=LOOPS[S.loop];startGame({name:(b&&b.name)||P.name||'나',birth:'',ai:S.loop>=2?2:1,diff:S.loop>=3?'normal':'easy',rounds:24,speed:P.speed,seed:'stage'+id,stage:id,stageTier:lp.tier});
 G.stage={id,st:{sal:0,rent:0,safe:0,harm:0,polWin:0},done:false};G.tier=Math.max(G.tier,lp.tier);applyTier();
 const ph=OH.PHASES.findIndex(x=>x.el===S.el);if(ph>=0){G.phase=ph;try{CosmicMusic.setMood(S.el)}catch(e){}}
 showNews(`🗺 스테이지 ${id} · ${S.n}`,`목표: ${S.goal} (24일 안에)`);log(`🗺 스테이지 ${id} 「${S.n}」 — 목표: ${S.goal}`,'sys');renderAll()}
{const _l=log;log=function(t,cls){_l(t,cls);if(!G||!G.stage)return;const s=String(t),me=G.players[0].name;
 if(s.includes('급여')&&s.includes(me))G.stage.st.sal++;
 const m=s.match(/→ (.+?) 통행료 ([\d,]+)억/);if(m&&m[1]===me)G.stage.st.rent+=+m[2].replace(/,/g,'');
 if(/은하 의회/.test(s)&&/통과/.test(s)&&G.pol&&G.pol._myYes)G.stage.st.polWin++}}
{const _a=ask;ask=function(text,opts,cfg){const pr=_a(text,opts,cfg);if(G&&/은하 의회/.test(String(text)))pr.then(v=>{if(G.pol)G.pol._myYes=v>0}).catch(()=>{});return pr}}
function stageCheck(){if(!G||!G.stage||G.stage.done||G.over)return;const S=stageAll().find(s=>s.id===G.stage.id);const st=G.stage.st;
 if(S.end)return;let ok=false;try{ok=!!S.ok(st)}catch(e){}if(ok)stageClear(S)}
function stageClear(S){G.stage.done=true;const d=G.round,stars=d<=10?3:d<=17?2:1;const r=stageRec();r[S.id]=Math.max(r[S.id]||0,stars);store.set('dagal_stage',r);
 const all=stageAll(),k=all.findIndex(x=>x.id===S.id),nx=all[k+1];const u=unl();if(nx&&nx.loop>(u.loop||0)&&S.id.endsWith('-6')){u.loop=nx.loop;store.set('dagal_unlock',u)}
 burst(true);sfx('win');if(window.logEvent)logEvent('stage',{id:S.id,stars,d});
 modal(`<h2>🌟 스테이지 ${S.id} 완료!</h2><p style="font-size:28px;margin:4px 0">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</p><p>「${S.n}」 — ${S.goal}<br><span class="sub">${d}일 만에 해냈습니다. (10일 이내 ★3 · 17일 이내 ★2)</span></p>
 <div style="display:flex;gap:8px;flex-wrap:wrap">${nx?`<button class="btn main" id="stNext">다음 스테이지 ${nx.id} ▶</button>`:''}<button class="btn" id="stKeep">이 판 계속하기</button><button class="btn" id="stMenu">🗺 스테이지 지도</button></div>`);
 if(nx)$('#stNext').onclick=()=>{closeModal();G.over=true;startStage(nx.id)};$('#stKeep').onclick=closeModal;$('#stMenu').onclick=()=>{closeModal();G.over=true;openTitle();pane('stage')}}
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(G&&G.stage&&!G.over){const st=G.stage.st,P=G.players[0];if(P.cash>=300)st.safe++;else st.safe=0;if(typeof harmony==='function'&&harmony()>=.8)st.harm++;stageCheck()}return r}}
{const _r=renderAll;renderAll=function(){_r();if(G&&G.stage&&!G.stage.done){const S=stageAll().find(s=>s.id===G.stage.id);let c=$('#hStage');if(!c){$('#hRound').insertAdjacentHTML('afterend','<span class="chip" id="hStage"></span>');c=$('#hStage')}c.textContent=`🗺 ${S.id} ${S.n} — ${S.goal}`;c.style.display=''}else{const c=$('#hStage');if(c)c.style.display='none'}}}
{const _f=finish;finish=function(reason,who_){const stg=G&&!G.over&&G.stage&&!G.stage.done?G.stage:null;_f(reason,who_);if(stg){const S=stageAll().find(s=>s.id===stg.id);if(S.end){const rows=G.players.map((P,i)=>({i,nw:P.out?0:netWorth(i)})).sort((a,b)=>b.nw-a.nw);if(rows[0].i===0){const r=stageRec();r[S.id]=Math.max(r[S.id]||0,2);store.set('dagal_stage',r)}}}}}
function stageHTML(){const r=stageRec();return `<h2>🗺 스테이지</h2><div class="sub">루프마다 여섯 스테이지. 한 스테이지는 약 15분, 목표는 하나입니다. 앞 스테이지를 깨면 다음이 열립니다.</div>
 ${LOOPS.map((L,li)=>`<div class="tCard"><b>${li+1}. ${L.n}</b> <span class="sub">${L.d}</span><div class="stRow">${L.st.map(s=>{const open=stageOpen(s.id),st=r[s.id]||0;return `<button class="stTile ${st?'clr':''} ${open?'':'lock'}" data-s="${s.id}" ${open?'':'disabled'} title="${s.goal}"><b>${s.id}</b><span>${open?s.n:'🔒'}</span><small>${st?'★'.repeat(st):open?'도전':''}</small></button>`}).join('')}</div></div>`).join('')}`}
function bindStage(){document.querySelectorAll('.stTile[data-s]').forEach(b=>b.onclick=()=>{if(!b.disabled)startStage(b.dataset.s)})}

// ---- 지루함 신호 → 다음 루프 권하기 ----
function boredom(){if(!PROF.g)return 0;const g=PROF.g;const rec=(g.recent||[]).slice(-10);if(rec.length<6)return 0;
 const fast=rec.filter(ms=>ms<900).length/rec.length;let s=fast*.6;if(G.autoHuman)s+=.3;if((g.away||0)>=2)s+=.2;
 const nw=G.players.map((P,i)=>netWorth(i)),me=nw[0],best=Math.max(...nw.slice(1));if(me>best*1.6&&G.round>=10)s+=.25;return Math.min(1,s)}
{const _d=PROF.dec.bind(PROF);PROF.dec=function(kind,ms,v){_d(kind,ms,v);if(this.g){(this.g.recent=this.g.recent||[]).push(ms);if(this.g.recent.length>30)this.g.recent.shift()}}}
{const _t=PROF.tick.bind(PROF);PROF.tick=function(e){_t(e);if(this.g&&e.type==='away')this.g.away=(this.g.away||0)+1}}
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(G&&!G.over&&!G.tutorial&&!G.calm&&G.round>=8&&G.tier<5&&(!G.boredAt||G.round-G.boredAt>=12)&&boredom()>=.55){G.boredAt=G.round;offerUp()}return r}}
function offerUp(){let o=$('#lvup');if(!o){document.body.insertAdjacentHTML('beforeend','<div id="lvup"><div class="cBody"><div class="cTxt"></div><div style="display:flex;gap:6px;margin-top:8px"><button class="btn main" id="luYes">한 단계 올리기 ▶</button><button class="btn" id="luNo">지금이 좋아요</button></div></div></div>');o=$('#lvup')}
 const nx=Math.min(5,G.tier+1);o.querySelector('.cTxt').innerHTML=`손이 점점 빨라지고 있어요. 😊<br>이 판이 익숙해졌다면 <b>${TIER_NAME[nx]}</b> 단계를 열어 볼까요?<div class="sub" style="color:#665">${tierNews(nx)}</div>`;o.classList.add('show');
 $('#luYes').onclick=()=>{o.classList.remove('show');G.tier=nx;const u=unl();u.loop=Math.max(u.loop||0,nx-1);store.set('dagal_unlock',u);applyTier();if(feat('battle')&&!G.monsters.length)for(let k=0;k<3;k++)spawnMonster('W0');renderMonsters();renderAll();showNews(`🔓 ${TIER_NAME[nx]}`,tierNews(nx));if(window.logEvent)logEvent('levelUp',{to:nx,by:'boredom'})};
 $('#luNo').onclick=()=>{o.classList.remove('show');if(window.logEvent)logEvent('levelUp',{to:nx,declined:1})};setTimeout(()=>o.classList.remove('show'),25000)}
