// ================= v0.5 행동 기록 DB · 성향 분석(8대 차크라 · 9대 에너지체) · 오늘의 마음 쉼 =================
// 모든 기록은 이 브라우저의 IndexedDB('dagal_log')에만 남는다. 밖으로 보내지 않는다. 설정에서 끄고·지우고·내보낼 수 있다.
const LOGDB={db:null,q:[],sid:Date.now().toString(36)};
function logOpen(){if(LOGDB.db||!window.indexedDB)return Promise.resolve(LOGDB.db);return new Promise(res=>{try{const r=indexedDB.open('dagal_log',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('ev')){const s=d.createObjectStore('ev',{autoIncrement:true});s.createIndex('sid','sid')}};r.onsuccess=()=>{LOGDB.db=r.result;res(LOGDB.db)};r.onerror=()=>res(null)}catch(e){res(null)}})}
function logEvent(type,data){if(!prefs().log)return;const e={t:Date.now(),sid:LOGDB.sid,type,d:G?G.round:0,data:data||{}};LOGDB.q.push(e);PROF.tick(e);if(LOGDB.q.length>=40)logFlush()}
function logFlush(){const q=LOGDB.q.splice(0);if(!q.length)return;logOpen().then(db=>{if(!db)return;try{const tx=db.transaction('ev','readwrite');const s=tx.objectStore('ev');q.forEach(e=>s.add(e))}catch(e){}})}
setInterval(logFlush,8000);addEventListener('pagehide',logFlush);
function logAll(){return logOpen().then(db=>new Promise(res=>{if(!db)return res([]);const out=[];const c=db.transaction('ev').objectStore('ev').openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out.push(cur.value);cur.continue()}else res(out.concat(LOGDB.q))};c.onerror=()=>res(out)}))}
function logCount(){return logOpen().then(db=>new Promise(res=>{if(!db)return res(LOGDB.q.length);const r=db.transaction('ev').objectStore('ev').count();r.onsuccess=()=>res(r.result+LOGDB.q.length);r.onerror=()=>res(0)}))}
function logClear(){LOGDB.q=[];store.set('dagal_prof',[]);return logOpen().then(db=>new Promise(res=>{if(!db)return res();const r=db.transaction('ev','readwrite').objectStore('ev').clear();r.onsuccess=()=>{toast('🗑 행동 기록을 지웠습니다');res()};r.onerror=()=>res()}))}
function logExport(fmt_){logFlush();setTimeout(()=>logAll().then(all=>{let blob,name;
 if(fmt_==='csv'){const rows=[['time','session','day','type','data']].concat(all.map(e=>[new Date(e.t).toISOString(),e.sid,e.d,e.type,JSON.stringify(e.data).replace(/"/g,'""')]));blob=new Blob(['﻿'+rows.map(r=>r.map((v,i)=>i===4?`"${v}"`:v).join(',')).join('\n')],{type:'text/csv'});name='dagal_log.csv'}
 else{blob=new Blob([JSON.stringify({exported:new Date().toISOString(),profiles:store.get('dagal_prof',[]),events:all},null,1)],{type:'application/json'});name='dagal_log.json'}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast(`⬇ ${name} (${all.length.toLocaleString()}건)`)}),300)}
window.logEvent=logEvent;window.logExport=logExport;window.logClear=logClear;window.logCount=logCount;

// ---- 입력 수집: 마우스·키보드 ----
const IN={clicks:0,keys:0,dist:0,lx:null,ly:null,lastMove:0,miss:0,rage:0,lastClk:0,clkSeq:0,start:Date.now()};
addEventListener('pointerdown',e=>{IN.clicks++;const now=Date.now();if(now-IN.lastClk<350){IN.clkSeq++;if(IN.clkSeq>=3)IN.rage++}else IN.clkSeq=0;IN.lastClk=now;
 const el=e.target.closest('button,a,input,select,.cell,canvas,.tItem');if(!el)IN.miss++;
 logEvent('click',{x:+(e.clientX/innerWidth).toFixed(3),y:+(e.clientY/innerHeight).toFixed(3),el:el?(el.id||el.dataset.a||el.dataset.t||el.tagName.toLowerCase()):'none',txt:el&&el.textContent?el.textContent.trim().slice(0,18):''})},true);
addEventListener('pointermove',e=>{const now=Date.now();if(IN.lx!=null)IN.dist+=Math.hypot(e.clientX-IN.lx,e.clientY-IN.ly);IN.lx=e.clientX;IN.ly=e.clientY;if(now-IN.lastMove>XCFG().logMove){IN.lastMove=now;logEvent('move',{x:+(e.clientX/innerWidth).toFixed(3),y:+(e.clientY/innerHeight).toFixed(3),dist:Math.round(IN.dist)})}},{passive:true});
addEventListener('keydown',e=>{IN.keys++;logEvent('key',{k:e.key.length===1?e.key.toLowerCase():e.key})},true);
addEventListener('wheel',()=>logEvent('wheel',{}),{passive:true});
document.addEventListener('visibilitychange',()=>logEvent(document.hidden?'away':'back',{}));

// ---- 판단(질문) 기록: 무엇을 골랐고, 얼마나 걸렸는가 ----
{const _a=ask;ask=function(text,opts,cfg){const t0=performance.now(),auto=G&&G.autoHuman;const pr=_a(text,opts,cfg);
 pr.then(v=>{if(auto)return;const ms=Math.round(performance.now()-t0);const o=opts.find(x=>x.v===v);const kind=askKind(String(text),v);PROF.dec(kind,ms,v);
  logEvent('decide',{kind,ms,pick:o?String(o.t).replace(/<[^>]+>/g,'').slice(0,24):String(v),n:opts.length,q:String(text).replace(/<[^>]+>/g,'').slice(0,40)})}).catch(()=>{});return pr}}
function askKind(t,v){if(/매입가/.test(t))return v===1?'buy':'pass';if(/양자 주사위/.test(t))return v<2?'quantum':'qsave';if(/차원 포털/.test(t))return v?'portal':'stay';if(/M&A|인수/.test(t))return 'mna';if(/용호/.test(t))return 'quiz';if(/차례입니다/.test(t))return 'roll';if(/턴을 종료/.test(t))return 'end';
 if(v==='fight')return 'fight';if(v==='auto')return 'fight';if(v==='bribe')return 'bribe';if(v==='peace')return 'peace';if(v==='flee')return 'flee';return 'other'}

// ================= 성향 측정기 (판 단위) =================
const PROF={g:null,
 reset(){this.g={dec:0,ms:0,fast:0,slow:0,buy:0,pass:0,quantum:0,fight:0,peace:0,bribe:0,flee:0,portal:0,stay:0,mna:0,yhL:0,yhR:0,fin:0,loanMax:0,cashLow:0,days:0,quizOk:0,quizN:0,med:0,lossTilt:0,lastCash:null,clicks0:IN.clicks,keys0:IN.keys,dist0:IN.dist,miss0:IN.miss,rage0:IN.rage,series:[],start:Date.now()}},
 dec(kind,ms,v){const g=this.g;if(!g)return;g.dec++;g.ms+=Math.min(ms,60000);if(ms<1500)g.fast++;if(ms>10000)g.slow++;if(g[kind]!=null)g[kind]++;
  if(kind==='buy'&&g.lastLoss)g.lossTilt++},
 tick(e){const g=this.g;if(!g)return;if(e.type==='yh'){if(e.data.side==='L')g.yhL+=e.data.n;else g.yhR+=e.data.n;if(/^fin/.test(e.data.why))g.fin++;if(e.data.why==='meditation')g.med++}
  if(e.type==='quiz'){g.quizN++;if(e.data.ok)g.quizOk++}},
 day(){const g=this.g;if(!g||!G)return;const P=G.players[0];g.days++;const nw=netWorth(0);g.lastLoss=g.lastCash!=null&&P.cash<g.lastCash-80;g.lastCash=P.cash;
  if(P.cash<danger(0))g.cashLow++;g.loanMax=Math.max(g.loanMax,(P.loan||0)/Math.max(1,nw));
  const b=bodies();g.series.push({d:G.round,nw:Math.round(nw),h:Math.round(harmony()*100),ck:(Y().lv||[]).map((v,i)=>P.ck&&P.ck[i]?100:Math.round(v)),b:b.map(x=>[x.e,x.c])});
  logEvent('day',{nw:Math.round(nw),cash:Math.round(P.cash),loan:Math.round(P.loan||0),h:Math.round(harmony()*100),bodies:b.map(x=>x.e+'/'+x.c).join(' ')})}};
{const _st=startGame;startGame=function(cfg){_st(cfg);PROF.reset();logEvent('start',{len:lenOf(G.maxRounds),tier:G.tier,ai:G.players.length-1,diff:G.diff,tutorial:!!G.tutorial,stress:!!G.stress})}}
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(G&&!G.over)PROF.day();return r}}

// ================= 9대 에너지체 · 8대 차크라 관찰 =================
// 상징적 거울: 게임 속 행동의 패턴을 비춘 것일 뿐, 의학·심리 진단이 아니다.
const BODIES=[
 {n:'물질체(物質體)',k:'현실의 뿌리 — 사고·지키기·안정',c:'#ff9b9b'},{n:'에테르체(生氣體)',k:'생기 — 꾸준한 활동과 리듬',c:'#ffbe8f'},
 {n:'감정체(感情體)',k:'감정의 파도 — 손실 뒤의 평정',c:'#ffe08f'},{n:'하위 멘탈체(知性體)',k:'계산과 분석 — 경제 배움·금융',c:'#a8e8b8'},
 {n:'상위 멘탈체(理性體)',k:'멀리 보기 — 숙고·예측·탐사',c:'#9fd8ff'},{n:'원인체(因果體)',k:'인과와 윤리 — 자비·화해',c:'#a9b6ff'},
 {n:'붓디체(直觀體)',k:'직관 — 양자 관측·상징 읽기',c:'#cfa9ff'},{n:'아트마체(意志體)',k:'의지 — 끝까지 가는 힘',c:'#f3b6e6'},{n:'모나드체(根源體)',k:'통합 — 용호 조화와 차크라의 고름',c:'#fff1b8'}];
function clamp01(x){return Math.max(0,Math.min(1,x))}
function bodies(){const g=PROF.g;if(!g||!G)return BODIES.map(()=>({e:0,c:0}));const P=G.players[0],y=Y(),days=Math.max(1,g.days),dec=Math.max(1,g.dec);
 const owned=allOwned(0).length,eth=typeof ethics==='function'?ethics():50,avgMs=g.ms/dec;
 const ck=(P.ck||[]).filter(Boolean).length,lvAvg=(y.lv||[]).reduce((a,v,i)=>a+(P.ck&&P.ck[i]?100:v),0)/8,lvSd=Math.sqrt((y.lv||[]).reduce((a,v,i)=>{const x=(P.ck&&P.ck[i]?100:v)-lvAvg;return a+x*x},0)/8);
 const clicks=IN.clicks-g.clicks0,mins=Math.max(1,(Date.now()-g.start)/60000);
 const L=g.yhL,Rr=g.yhR,H=harmony();
 const raw=[
  [clamp01(owned/10+(g.buy/(g.buy+g.pass+1))*.4),clamp01(1-g.cashLow/days)],
  [clamp01(clicks/mins/25),clamp01(1-((IN.rage-g.rage0)/Math.max(5,clicks))*8)],
  [clamp01((g.fight+g.buy+g.portal)/days/2),clamp01(1-g.lossTilt/Math.max(1,g.buy)-(IN.miss-g.miss0)/Math.max(10,clicks))],
  [clamp01(L/Math.max(20,days*1.2)),clamp01(Object.keys(y.lessons||{}).length/8*.6+(g.quizN?y.qr.L[0]/Math.max(1,y.qr.L[0]+y.qr.L[1]):.5)*.4)],
  [clamp01((g.slow+g.portal+(G.stats.probes||0))/days),clamp01(avgMs>2500&&avgMs<15000?.8:avgMs<=2500?.45:.55)],
  [clamp01((g.peace+(P.karma||0))/6),clamp01(eth/100)],
  [clamp01(Rr/Math.max(20,days*1.2)),clamp01((g.quantum+y.qr.R[0])/Math.max(3,g.quantum+y.qr.R[0]+y.qr.R[1]+2))],
  [clamp01(g.days/(G.maxRounds||60)*1.2),clamp01(1-g.flee/Math.max(1,g.fight+g.flee))],
  [clamp01(lvAvg/100),clamp01(H*.6+(1-lvSd/50)*.4)]];
 return raw.map(([e,c])=>({e:Math.round(e*100),c:Math.round(c*100)}))}
function chakraState(){const P=G&&G.players[0];if(!P||!G.yh)return [];return CHAKRA.map((C,k)=>({n:C.n,k:C.k,c:C.c,lv:P.ck&&P.ck[k]?100:Math.round(G.yh.lv[k])}))}
// 기울기로 흐름을 내다본다 (경향일 뿐, 정해진 미래가 아니다)
function slope(arr){const n=arr.length;if(n<3)return 0;let sx=0,sy=0,sxy=0,sxx=0;arr.forEach((y,x)=>{sx+=x;sy+=y;sxy+=x*y;sxx+=x*x});return (n*sxy-sx*sy)/Math.max(1e-6,n*sxx-sx*sx)}
function forecast(){const g=PROF.g;if(!g||g.series.length<4)return [];const S=g.series.slice(-20);const left=Math.max(0,(G.maxRounds||60)-G.round);
 return BODIES.map((B,i)=>{const e=S.map(s=>s.b[i][0]),c=S.map(s=>s.b[i][1]);const se=slope(e),sc=slope(c);const ne=Math.round(clamp01((e[e.length-1]+se*Math.min(left,20))/100)*100),nc=Math.round(clamp01((c[c.length-1]+sc*Math.min(left,20))/100)*100);return {n:B.n,se,sc,ne,nc}})}

// 판이 끝나면 요약을 남긴다
function profSummary(){const g=PROF.g;if(!g||!G)return null;const b=bodies(),y=Y(),dec=Math.max(1,g.dec);
 return {date:new Date().toISOString(),len:lenOf(G.maxRounds),tut:!!G.tutorial,stress:!!G.stress,days:g.days,mins:Math.round((Date.now()-g.start)/60000),
  avgMs:Math.round(g.ms/dec),fastR:+(g.fast/dec).toFixed(2),slowR:+(g.slow/dec).toFixed(2),buyR:+(g.buy/Math.max(1,g.buy+g.pass)).toFixed(2),
  risk:Math.round(clamp01(g.loanMax*2+g.cashLow/Math.max(1,g.days)+(g.buy/Math.max(1,g.buy+g.pass))*.3)*100),
  coop:Math.round(clamp01((g.peace+g.bribe*.5+(G.players[0].karma||0))/Math.max(1,g.peace+g.bribe+g.fight+(G.players[0].karma||0)))*100),
  L:Math.round(g.yhL),R:Math.round(g.yhR),h:Math.round(harmony()*100),lessons:Object.keys(y.lessons||{}).length,ck:(G.players[0].ck||[]).filter(Boolean).length,
  clicks:IN.clicks-g.clicks0,keys:IN.keys-g.keys0,dist:Math.round(IN.dist-g.dist0),miss:IN.miss-g.miss0,rage:IN.rage-g.rage0,bodies:b,eth:typeof ethics==='function'?ethics():50}}
{const _f=finish;finish=function(reason,who_){const first=G&&!G.over;_f(reason,who_);if(first){try{const s=profSummary();if(s){const L=store.get('dagal_prof',[]);L.unshift(s);store.set('dagal_prof',L.slice(0,40));logEvent('end',{reason,h:s.h,ck:s.ck});logFlush()}
 let n=0;const iv=setInterval(()=>{const a=$('#again');if(a&&!$('#profBtn')){a.insertAdjacentHTML('afterend','<button class="btn" id="profBtn">🧭 이번 판의 성향 리포트</button>');$('#profBtn').onclick=()=>{closeModal();openTitle();pane('prof')};clearInterval(iv)}if(++n>200)clearInterval(iv)},300)}catch(e){console.warn(e)}}}}

// ================= 성향 리포트 화면 =================
function radar(vals,vals2,labels){const N=vals.length,cx=150,cy=150,R0=110;const pt=(v,i)=>{const a=-Math.PI/2+i*2*Math.PI/N;return [cx+Math.cos(a)*R0*v/100,cy+Math.sin(a)*R0*v/100]};
 const poly=(vs)=>vs.map((v,i)=>pt(v,i).map(x=>x.toFixed(1)).join(',')).join(' ');
 let g='';for(let r=25;r<=100;r+=25)g+=`<polygon points="${poly(Array(N).fill(r))}" fill="none" stroke="rgba(190,180,255,.18)"/>`;
 labels.forEach((l,i)=>{const [x,y]=pt(122,i);g+=`<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" font-size="10" fill="#cfc8ff">${l}</text>`});
 return `<svg viewBox="-10 -5 320 315" class="radar">${g}<polygon points="${poly(vals)}" fill="rgba(255,216,138,.22)" stroke="#ffd88a"/><polygon points="${poly(vals2)}" fill="rgba(159,240,210,.18)" stroke="#9ff0d2"/></svg>`}
function profileHTML(){const L=store.get('dagal_prof',[]).filter(x=>!x.tut);const live=G&&!G.over&&PROF.g&&PROF.g.days>=3;
 const s=live?profSummary():L[0];if(!s)return '<h2>🧭 나의 성향</h2><p class="sub">한 판을 마치면 리포트가 생깁니다.</p>';
 const prev=live?L[0]:L[1];const b=s.bodies;const fc=live?forecast():[];const ck=live?chakraState():[];
 const tr=(k,label,unit)=>prev&&prev[k]!=null?` <span class="sub">(지난 판 ${prev[k]}${unit||''} → ${s[k]>prev[k]?'▲':s[k]<prev[k]?'▼':'＝'})</span>`:'';
 const speed=s.avgMs<2500?'빠르게 직관으로 고르는 편으로 작동합니다':s.avgMs<9000?'살펴본 뒤 고르는 편으로 작동합니다':'충분히 숙고한 뒤 움직이는 편으로 작동합니다';
 const risk=s.risk>=60?'수익을 향해 몸을 크게 기울이는 흐름':s.risk>=30?'위험과 수익 사이에서 저울을 쓰는 흐름':'지키는 쪽에 무게를 두는 흐름';
 const coop=s.coop>=55?'연결과 화해 쪽으로 손이 먼저 가는 흐름':s.coop>=30?'경쟁과 연결을 오가는 흐름':'정면 승부를 먼저 고르는 흐름';
 const yhT=s.h>=75?'호랑이(계산)와 용(직관)이 거의 같은 걸음으로 걷습니다':s.L>s.R?'호랑이(계산)가 앞서고 용(직관)이 뒤따릅니다':'용(직관)이 앞서고 호랑이(계산)가 뒤따릅니다';
 const lo=b.map((x,i)=>({i,v:(x.e+x.c)/2})).sort((a,c)=>a.v-c.v)[0],hi=b.map((x,i)=>({i,v:(x.e+x.c)/2})).sort((a,c)=>c.v-a.v)[0];
 return `<h2>🧭 나의 성향 ${live?'<small class="sub">(진행 중인 판)</small>':''}</h2>
 <div class="tCard sub">게임 속 행동을 비춘 상징의 거울입니다. 정해진 성격이나 진단이 아니라, 이번 판에서 의식이 이렇게 작동했다는 기록입니다.</div>
 <div class="profGrid"><div>${radar(b.map(x=>x.e),b.map(x=>x.c),BODIES.map(B=>B.n.split('(')[0]))}<div class="sub" style="text-align:center"><span style="color:#ffd88a">■ 에너지 수준</span> · <span style="color:#9ff0d2">■ 의식 수준</span> — 9대 에너지체</div></div>
 <div>${b.map((x,i)=>`<div class="bRow"><span style="color:${BODIES[i].c}">${BODIES[i].n}</span><i style="--e:${x.e}%;--c:${x.c}%"></i><small>${x.e}/${x.c}</small></div>`).join('')}</div></div>
 ${ck.length?`<div class="tCard"><b>8대 차크라 각성도</b><div class="ckRow">${ck.map(c=>`<span style="--cc:${c.c}"><i style="height:${c.lv}%"></i><small>${c.n}<br>${c.lv}%</small></span>`).join('')}</div></div>`:`<div class="tCard">차크라 각성 ${s.ck}/8 · 용호 조화 ${s.h}%</div>`}
 <div class="tCard"><b>이번 판에서 이렇게 작동했습니다</b><ul>
 <li>판단 — 평균 ${(s.avgMs/1000).toFixed(1)}초, ${speed}.${tr('avgMs','','ms')}</li>
 <li>위험 — ${risk} (위험 지수 ${s.risk}).${tr('risk')}</li>
 <li>관계 — ${coop} (연결 지수 ${s.coop}).${tr('coop')}</li>
 <li>용호 — ${yhT} (조화 ${s.h}%, 🐯 ${s.L} · 🐉 ${s.R}).${tr('h','','%')}</li>
 <li>배움 — 경제 배움 ${s.lessons}/8과 · 윤리 공명 ${s.eth}%.</li>
 <li>손과 몸 — 클릭 ${s.clicks}회 · 키 ${s.keys}회 · 마우스 이동 ${Math.round(s.dist/1000)}k px · 빈 곳 누름 ${s.miss}회 · 연타 ${s.rage}회.</li></ul></div>
 <div class="tCard"><b>가장 밝게 움직인 몸</b> ${BODIES[hi.i].n} — ${BODIES[hi.i].k}<br><b>가장 조용했던 몸</b> ${BODIES[lo.i].n} — ${BODIES[lo.i].k}</div>
 ${fc.length?`<div class="tCard"><b>흐름 예측 (이대로 이어진다면, 약 20일 뒤)</b><div class="sub">경향을 그대로 이은 선일 뿐, 선택이 바뀌면 선도 바뀝니다.</div><div class="fcRow">${fc.map(f=>`<span>${f.n.split('(')[0]} <b>${f.ne}/${f.nc}</b> ${f.sc>0.3?'↗':f.sc<-0.3?'↘':'→'}</span>`).join('')}</div></div>`:''}
 <div class="tCard"><b>🪞 돌아보는 질문</b><ul><li>${BODIES[lo.i].n.split('(')[0]}이(가) 조용했던 순간, 나는 무엇을 미루고 있었을까요?</li><li>${s.L>s.R?'계산이 앞설 때, 직관은 어떤 신호를 보내고 있었을까요?':'직관이 앞설 때, 숫자는 무엇을 말하고 있었을까요?'}</li></ul>
 <div class="sub">다음 판에서 해 볼 수 있는 선택지 — ① 큰 결정 앞에서 세 번 숨 고르기 ② 용호 수련 문제를 건너뛰지 않기 ③ 가장 어려운 상대에게 한 번 손 내밀기</div></div>
 ${L.length>1?`<div class="tCard"><b>지난 판들의 흐름</b><table class="rk"><tr><th>날짜</th><th>길이</th><th>판단(초)</th><th>위험</th><th>연결</th><th>조화</th><th>차크라</th></tr>${L.slice(0,8).map(x=>`<tr><td>${x.date.slice(0,10)}</td><td>${x.stress?'마음 쉼':LEN[x.len]?LEN[x.len].n:x.len}</td><td>${(x.avgMs/1000).toFixed(1)}</td><td>${x.risk}</td><td>${x.coop}</td><td>${x.h}%</td><td>${x.ck}/8</td></tr>`).join('')}</table></div>`:''}`}
function bindProfile(){}
{const _r=renderAll;renderAll=function(){_r();}}

// ================= 오늘의 마음 쉼 — 일일 스트레스 풀기 판 =================
// 자가 점검(몸·마음·잠·기분) + 최근 플레이 신호(연타·빈 곳 누름·판단 속도)로 지금의 긴장도를 어림하고,
// 음악·소리·속도·게임 내용을 그에 맞게 부드럽게 바꾼다. 의학적 진단이 아니라 쉼을 돕는 놀이다.
const SQ=[['몸','어깨·목이 굳어 있나요?',['🙂 가벼워요','😐 조금','😣 많이']],['마음','생각이 복잡한가요?',['🙂 고요해요','😐 조금','🌀 많이']],['잠','어젯밤 잘 잤나요?',['😴 푹 잤어요','😐 보통','🥱 못 잤어요']],['기분','지금 기분은 어떤가요?',['😊 좋아요','😐 그저 그래요','😞 가라앉아요']]];
let sAns=[0,0,0,0];
function stressSignal(){const c=Math.max(10,IN.clicks);return clamp01(((IN.rage)/c)*6+(IN.miss/c)*2)}
function stressHTML(){const last=store.get('dagal_stress',[])[0];return `<h2>🌿 오늘의 마음 쉼</h2><div class="sub">약 15분. 이기고 지는 것보다 숨이 고르게 쉬어지는 것이 목표입니다. 지금 상태를 골라 주세요.</div>
 ${SQ.map((q,i)=>`<label>${q[0]} — ${q[1]}</label><div class="seg sq" data-i="${i}">${q[2].map((t,k)=>`<button class="btn ${sAns[i]===k?'main':''}" data-v="${k}">${t}</button>`).join('')}</div>`).join('')}
 <div class="tCard" id="sOut"></div><button class="btn main" id="sGo">🌿 마음 쉼 시작</button>
 ${last?`<p class="sub">지난 마음 쉼 (${last.date.slice(0,10)}) — 시작 ${last.before}% → 끝 ${last.after??'?'}%</p>`:''}`}
function stressLevel(){const self=sAns.reduce((a,b)=>a+b,0)/8;return Math.round(clamp01(self*.8+stressSignal()*.2*XCFG().stressW)*100)}
function stressPlan(s){return s>=60?{n:'깊은 쉼',g:'명상',speed:'slow',ai:'easy',breath:3,d:'싱잉볼과 느린 드론 · 아주 느린 진행 · 3일마다 숨 고르기 · 몬스터 없음'}:s>=30?{n:'고요한 흐름',g:'힐링',speed:'slow',ai:'easy',breath:4,d:'잔잔한 힐링 음악 · 느린 진행 · 4일마다 숨 고르기'}:{n:'가벼운 산책',g:'우주 여행',speed:'normal',ai:'easy',breath:5,d:'밝은 우주 여행 음악 · 보통 진행 · 5일마다 숨 고르기'}}
function bindStress(){const draw=()=>{const s=stressLevel(),p=stressPlan(s);$('#sOut').innerHTML=`<b>지금의 긴장도 약 ${s}%</b> → <b>${p.n}</b><div class="sub">${p.d}</div><div class="sbar"><i style="width:${s}%"></i></div>`};
 document.querySelectorAll('.sq').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{sAns[+g.dataset.i]=+b.dataset.v;g.querySelectorAll('button').forEach(x=>x.classList.toggle('main',x===b));draw()}));draw();
 $('#sGo').onclick=()=>startStress()}
function startStress(){const s=stressLevel(),p=stressPlan(s);const b=birthLoad();closeTitle();
 const L=store.get('dagal_stress',[]);L.unshift({date:new Date().toISOString(),before:s,ans:sAns.slice(),plan:p.n});store.set('dagal_stress',L.slice(0,60));
 startGame({name:(b&&b.name)||prefs().name,birth:'',ai:1,diff:p.ai,rounds:30,speed:p.speed,seed:'',stress:true,stressMin:15,stressLv:s,breath:p.breath});
 document.body.classList.add('calm');G.calm={lv:s,plan:p,breath:p.breath};G.sound=prefs().sfx;
 try{CosmicMusic.setGenre(p.g);if(window.Tone){Promise.resolve(Tone.start()).then(()=>{CosmicMusic.next()})}}catch(e){}
 showNews(`🌿 ${p.n}`,'숨을 천천히 들이쉬고, 길게 내쉬세요. 오늘은 파산이 없습니다. 지는 날도 쉼의 일부입니다.');logEvent('stress',{lv:s,plan:p.n})}
// 마음 쉼 판의 규칙: 파산 없음(현금 바닥 보호), 숨 고르기, 긴장 신호가 오르면 더 느리게
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(G&&G.calm&&!G.over){const P=G.players[0];if(P.cash<120){P.cash=120;log('🌿 마음 쉼 — 오늘은 바닥이 받쳐 줍니다 (현금 120억 보호)','good')}
 if(G.round%G.calm.breath===0)setTimeout(breathe,500);
 const sig=stressSignal();if(sig>.35&&G.speedMul<1.6){G.speedMul=1.6;toast('🌿 손끝이 바빠 보여요 — 조금 더 천천히 갑니다')}}return r}}
try{if(typeof DungeonSfx==='object')Object.keys(DungeonSfx).filter(k=>/dead|boom|hit|bad|explo|over/i.test(k)).forEach(k=>{const f=DungeonSfx[k];if(typeof f==='function')DungeonSfx[k]=function(){if(G&&G.calm)return DungeonSfx.step&&DungeonSfx.step();return f.apply(this,arguments)}})}catch(e){}
function breathe(){if(!G||G.over)return;let o=$('#breathe');if(!o){document.body.insertAdjacentHTML('beforeend','<div id="breathe"><div class="bc"></div><div class="bt"></div><button class="btn sm" id="bSkip">건너뛰기</button></div>');o=$('#breathe');$('#bSkip').onclick=()=>o.classList.remove('show')}
 o.classList.add('show');const t=o.querySelector('.bt'),c=o.querySelector('.bc');const steps=[['들이쉬기 · 4초',4000,'in'],['머금기 · 4초',4000,'hold'],['내쉬기 · 6초',6000,'out'],['들이쉬기 · 4초',4000,'in'],['머금기 · 4초',4000,'hold'],['내쉬기 · 6초',6000,'out']];let k=0;
 try{if(window.Tone){const s=new Tone.FMSynth({harmonicity:2.76,envelope:{attack:.01,decay:6,sustain:0,release:6},volume:-16}).toDestination();s.triggerAttackRelease(216,5);setTimeout(()=>s.dispose(),9000)}}catch(e){}
 const go=()=>{if(k>=steps.length||!o.classList.contains('show')){o.classList.remove('show');yh('R',1,'breath');logEvent('breath',{done:k});return}const [tx,ms,cls]=steps[k++];t.textContent=tx;c.className='bc '+cls;setTimeout(go,ms)};go()}
// 마음 쉼이 끝나면 다시 한 번 점검
{const _f=finish;finish=function(reason,who_){const calm=G&&!G.over&&G.calm;_f(reason,who_);if(calm){document.body.classList.remove('calm');setTimeout(()=>{modal(`<h2>🌿 마음 쉼을 마쳤습니다</h2><p>지금은 어떤가요? 한 가지만 골라 주세요.</p><div class="seg" id="sAfter">${['🙂 한결 가벼워요','😐 비슷해요','😣 아직 무거워요'].map((t,k)=>`<button class="btn" data-v="${k}">${t}</button>`).join('')}</div><p class="sub">쉼은 결과가 아니라 연습입니다. 내일 같은 시간에 한 번 더 와도 좋습니다.</p><button class="btn main" onclick="document.getElementById('modal').classList.remove('show')">닫기</button>`);
 $('#sAfter').querySelectorAll('button').forEach(b=>b.onclick=()=>{const L=store.get('dagal_stress',[]);if(L[0]){L[0].after=Math.round(clamp01(calm.lv/100*[.45,.85,1.05][+b.dataset.v])*100);store.set('dagal_stress',L)}logEvent('stressEnd',{v:+b.dataset.v});toast('기록했습니다. 고맙습니다 🌿');closeModal();openTitle()})},G.speedMul<.1?0:3500)}}}
