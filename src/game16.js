// ================= v0.5 정치·외교 — 은하 의회 · 정책 · 동맹/불가침 =================
// 선택형 모듈(설정 → 넣을 게임 체계). 경제가 '얼마나'를 묻는다면, 정치는 '누구와 어떤 규칙으로'를 묻는다.
const POLICY=[
 {k:'rateUp',n:'기준금리 인상',d:'예금·대출 금리 +0.8%p. 저축하는 이에게 유리하고, 빚진 이에게 무겁습니다.'},
 {k:'rateDn',n:'기준금리 인하',d:'예금·대출 금리 −0.6%p(바닥 0.2%). 빚을 내 투자하는 이에게 유리합니다.'},
 {k:'rentCap',n:'통행료 상한제',d:'모든 통행료 ×0.8. 행성이 적은 이를 보호합니다.'},
 {k:'rentFree',n:'통행료 자유화',d:'모든 통행료 ×1.15. 행성을 많이 가진 이에게 유리합니다.'},
 {k:'ubi',n:'은하 기본소득',d:'매일 모든 함대에 15억. 바닥을 받쳐 경쟁을 부드럽게 합니다.'},
 {k:'wealth',n:'부유세',d:'매일 순자산 1위가 현금 2%를 가장 어려운 함대에 보냅니다.'},
 {k:'truce',n:'은하 휴전',d:'공성전과 몬스터 습격이 멈춥니다. 병력 대신 경제로 겨룹니다.'}];
function POL(){if(!G)return null;return G.pol||(G.pol={inf:G.players.map(()=>0),rel:G.players.map(()=>0),pact:{},act:null,until:0,next:0,votes:0,hist:[]})}
function polOn(){return G&&feat('politics')}
function pkey(a,b){return a<b?a+'-'+b:b+'-'+a}
function pactOf(a,b){const P=POL();const x=P.pact[pkey(a,b)];return x&&x.until>=G.round?x:null}
function policy(k){const P=POL();return polOn()&&P.act===k&&P.until>=G.round}
// 금리 정책
{const _d=depRate;depRate=function(){let r=_d();if(policy('rateUp'))r+=.008;if(policy('rateDn'))r=Math.max(.002,r-.006);return r}}
// 통행료 정책·조약 (공성 판정 배율에 곱한다)
{const _s=siege;siege=async function(p,o,wid,i,rent){let m=await _s.apply(this,arguments);if(!polOn())return m;
 if(policy('truce')&&m>1)m=1;if(policy('rentCap'))m*=.8;if(policy('rentFree'))m*=1.15;const pc=pactOf(p,o);if(pc&&pc.t==='ally')m*=.7;
 const P=POL();P.rel[p]=(P.rel[p]||0);if(o===0&&p!==0)P.rel[p]=Math.max(-100,P.rel[p]-1);if(p===0&&o!==0)P.rel[o]=Math.max(-100,P.rel[o]-1);return m}}
{const _sm=spawnMonster;spawnMonster=function(w){if(polOn()&&policy('truce'))return;return _sm(w)}}
{const _c=compassion;compassion=function(){const t=canCompassion();const r=_c.apply(this,arguments);if(polOn()&&t!=null){const P=POL();P.rel[t]=Math.min(100,(P.rel[t]||0)+15)}return r}}
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(!G||G.over||!polOn())return r;const P=POL();
 if(policy('ubi'))G.players.forEach((x,i)=>{if(!x.out)x.cash+=15});
 if(policy('wealth')){const live=G.players.map((x,i)=>({i,nw:x.out?-1e9:netWorth(i)})).filter(x=>x.nw>-1e9).sort((a,b)=>b.nw-a.nw);if(live.length>1){const top=G.players[live[0].i],bot=G.players[live[live.length-1].i];const a=Math.round(Math.max(0,top.cash)*.02);top.cash-=a;bot.cash+=a}}
 const every=Math.max(5,Math.round((G.maxRounds||60)/10));if(!P.next)P.next=G.round+3;if(G.round>=P.next){P.next=G.round+every;P.due=true}
 return r}}
{const _t=turn;turn=async function(p){if(G&&!G.over&&polOn()&&POL().due&&p===0){POL().due=false;try{await council()}catch(e){if(e===ABORT)throw e}}return _t(p)}}
function votesOf(i){const P=POL(),X=G.players[i];if(X.out)return 0;return 1+Math.floor(allOwned(i).length/5)+Math.floor((P.inf[i]||0)/2)}
function aiVote(i,pol){const X=G.players[i],k=X.pers?X.pers.key:'';const nw=netWorth(i),avg=G.players.reduce((a,_,j)=>a+netWorth(j),0)/G.players.length,rich=nw>avg;const owned=allOwned(i).length;
 const s={rateUp:(X.dep||0)>(X.loan||0)?1:-1,rateDn:(X.loan||0)>(X.dep||0)?1:-1,rentCap:owned<5?1:-1,rentFree:owned>=5?1:-1,ubi:rich?-1:1,wealth:rich?-1:1,truce:(k==='ares'?-1:k==='sophia'||k==='isis'?1:(X.hero&&X.hero.wins>2?-1:1))}[pol.k]||0;
 return s+(R.next()-.5)*.8>0?1:-1}
async function council(){const P=POL();const pool=POLICY.filter(x=>x.k!==P.act);const pol=pool[R.int(0,pool.length-1)];P.votes++;
 let lobby=0;const H=G.players[0];
 let v=await ask(`🏛 <b>은하 의회</b> — 안건: <b>${pol.n}</b><div class="sub">${pol.d}</div><div class="sub">내 표 ${votesOf(0)} · 영향력 ${P.inf[0]||0}. 통과되면 ${Math.max(5,Math.round((G.maxRounds||60)/10))}일 동안 우주의 규칙이 바뀝니다.</div>`,
  [{t:'👍 찬성',v:1,main:1},{t:'👎 반대',v:-1},{t:'💬 로비 후 찬성 (50억)',v:2,en:()=>H.cash>=50},{t:'💬 로비 후 반대 (50억)',v:-2,en:()=>H.cash>=50},{t:'기권',v:0}],{auto:()=>0});
 if(Math.abs(v)===2){H.cash-=50;lobby=2;v=v/2;P.inf[0]=(P.inf[0]||0)+1}
 let yes=0,no=0;const tally=[];G.players.forEach((X,i)=>{if(X.out)return;const n=votesOf(i)+(i===0?lobby:0);const d=i===0?v:aiVote(i,pol);if(d>0)yes+=n;else if(d<0)no+=n;tally.push(`${X.name} ${d>0?'찬':d<0?'반':'기'}${n}`);
  if(i&&v!==0&&d===v)P.rel[i]=Math.min(100,(P.rel[i]||0)+5);if(i&&v!==0&&d===-v)P.rel[i]=Math.max(-100,(P.rel[i]||0)-3)});
 const pass=yes>no;if(pass){P.act=pol.k;P.until=G.round+Math.max(5,Math.round((G.maxRounds||60)/10))}
 if(v!==0)P.inf[0]=(P.inf[0]||0)+(pass===(v>0)?1:0);
 P.hist.unshift({d:G.round,n:pol.n,pass,yes,no});P.hist=P.hist.slice(0,12);
 log(`🏛 은하 의회 「${pol.n}」 ${pass?'통과':'부결'} (찬 ${yes} : 반 ${no}) — ${tally.join(' · ')}`,'sys');showNews(`🏛 ${pol.n} ${pass?'통과':'부결'}`,pass?pol.d:'지금의 규칙이 이어집니다.');
 if(typeof yh==='function')yh(v===0?'R':'L',1,'council');if(window.logEvent)logEvent('vote',{pol:pol.k,v,pass,lobby});renderPol()}
function propose(i,t){const P=POL(),X=G.players[i];const need=t==='ally'?30:5;const pr=X.pers||{};const base=(P.rel[i]||0)+(t==='peace'?20:0)+((pr.deal||1)-1)*30+(R.next()*30-15);
 const ok=base>=need;const days=t==='ally'?12:10;if(ok){P.pact[pkey(0,i)]={t,until:G.round+days};P.rel[i]=Math.min(100,(P.rel[i]||0)+5);log(`🤝 ${X.name}와(과) ${t==='ally'?'동맹':'불가침 조약'} 체결 (${days}일)`,'good');if(typeof chakra==='function')chakra(0,4)}
 else{P.rel[i]=Math.max(-100,(P.rel[i]||0)-4);log(`🙅 ${X.name}이(가) ${t==='ally'?'동맹':'불가침'} 제안을 거절했습니다 (관계 ${P.rel[i]})`,'bad')}
 if(window.logEvent)logEvent('pact',{i,t,ok});renderPol()}
// 불가침 상대끼리는 공성이 일어나지 않는다
{const _s=siege;siege=async function(p,o){if(polOn()){const pc=pactOf(p,o);if(pc&&pc.t==='peace'){return 1*(policy('rentCap')?.8:1)*(policy('rentFree')?1.15:1)}}return _s.apply(this,arguments)}}
function renderPol(){const box=$('#pol');if(!box||!G)return;if(!polOn()){box.innerHTML='<p class="sub">정치·외교는 설정의 「넣을 게임 체계」에서 켜고, 영웅 원정 단계부터 열립니다.</p>';return}const P=POL();
 const cur=P.act&&P.until>=G.round?POLICY.find(x=>x.k===P.act):null;
 box.innerHTML=`<div class="tCard"><b>🏛 지금의 정책</b> ${cur?`<b>${cur.n}</b> <span class="sub">(${P.until-G.round+1}일 남음)</span><div class="sub">${cur.d}</div>`:'<span class="sub">없음 — 다음 의회를 기다립니다</span>'}<div class="sub">다음 의회: ${Math.max(0,(P.next||0)-G.round)}일 뒤 · 내 표 ${votesOf(0)} · 영향력 ${P.inf[0]||0}</div></div>
 <table class="rk"><tr><th>함대</th><th>관계</th><th>조약</th><th></th></tr>${G.players.map((X,i)=>i===0||X.out?'':`<tr><td>${esc(X.name)}</td><td>${P.rel[i]||0}</td><td>${(()=>{const pc=pactOf(0,i);return pc?(pc.t==='ally'?'🤝 동맹':'🕊 불가침')+` ${pc.until-G.round+1}일`:'—'})()}</td><td><button class="btn sm" data-ally="${i}">🤝 동맹</button> <button class="btn sm" data-peace="${i}">🕊 불가침</button></td></tr>`).join('')}</table>
 <div class="sub">동맹: 서로 내는 통행료 −30%. 불가침: 서로 공성전 없음. 관계는 자비(+15), 같은 표(+5), 통행료 다툼(−1)으로 움직입니다.</div>
 ${P.hist.length?`<div class="tCard"><b>의회 기록</b>${P.hist.map(h=>`<div class="sub">${h.d}일 · ${h.n} — ${h.pass?'통과':'부결'} (${h.yes}:${h.no})</div>`).join('')}</div>`:''}`;
 box.querySelectorAll('[data-ally]').forEach(b=>b.onclick=()=>propose(+b.dataset.ally,'ally'));box.querySelectorAll('[data-peace]').forEach(b=>b.onclick=()=>propose(+b.dataset.peace,'peace'))}
{const _r=renderAll;renderAll=function(){_r();if(G&&G.players[0]&&G.players[0].hero)try{renderPol()}catch(e){console.warn(e)}}}
addEventListener('keydown',e=>{if(e.key==='7'&&G&&!$('#modal').classList.contains('show')&&!titleOpen()&&!e.target.matches('input,select,textarea')&&polOn())tab('pol')});

// ================= 내부 조절 (숨은 패널) =================
// (운영용)
(function(){let n=0,t0=0;
 const h=s=>{let x=2166136261;for(const ch of s){x^=ch.codePointAt(0);x=Math.imul(x,16777619)>>>0}return x.toString(16)};
 document.addEventListener('click',e=>{const m=e.target.closest('.tMark');if(!m||!e.shiftKey)return;const now=Date.now();if(now-t0>4000)n=0;t0=now;if(++n<7)return;n=0;
  modal(`<h2>🔐</h2><input id="xk" type="password" autocomplete="off" style="width:100%"><div style="margin-top:8px"><button class="btn main" id="xo">열기</button></div>`);$('#xk').focus();
  const go=()=>{if(h($('#xk').value.trim())!=='3e44def5'){closeModal();return}xPanel()};$('#xo').onclick=go;$('#xk').onkeydown=ev=>{if(ev.key==='Enter')go()}});
 function xPanel(){const X=XCFG();const row=(k,lab,min,max,st)=>`<label>${lab} <b id="o_${k}">${X[k]}</b></label><input type="range" data-x="${k}" min="${min}" max="${max}" step="${st}" value="${X[k]}">`;
  modal(`<h2>🔐 내부 조절</h2><div class="tgl"><label><input type="checkbox" data-b="chakra" ${X.chakra?'checked':''}> 차크라 체계 작동</label><label><input type="checkbox" data-b="bodies" ${X.bodies?'checked':''}> 9대 에너지체 관찰</label></div>
  ${row('gate','차크라 각성 문턱 배율(진행도)',.3,1.5,.05)}${row('flow','용호 에너지 흐름 배율',.3,3,.1)}${row('stressW','스트레스 신호 가중치',0,3,.1)}${row('logMove','마우스 이동 기록 간격(ms)',100,3000,100)}
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" id="xAll">모든 단계 열기</button><button class="btn sm" id="xReset">단계 초기화</button><button class="btn sm" id="xDump">현재 판 수치 보기</button><button class="btn main" onclick="document.getElementById('modal').classList.remove('show')">닫기</button></div><pre id="xOut" class="sub" style="white-space:pre-wrap;max-height:180px;overflow:auto"></pre>`);
  const save=(k,v)=>{const s=store.get('dagal_x',{});s[k]=v;store.set('dagal_x',s)};
  document.querySelectorAll('[data-x]').forEach(r=>r.oninput=()=>{save(r.dataset.x,+r.value);$('#o_'+r.dataset.x).textContent=r.value});
  document.querySelectorAll('[data-b]').forEach(c=>c.onchange=()=>{save(c.dataset.b,c.checked);if(G)renderChakra()});
  $('#xAll').onclick=()=>{const u=unl();u.games=Math.max(u.games,8);u.tut=1;store.set('dagal_unlock',u);toast('모든 단계 열림')};
  $('#xReset').onclick=()=>{store.set('dagal_unlock',{});toast('단계 초기화')};
  $('#xDump').onclick=()=>{$('#xOut').textContent=G?JSON.stringify({tier:G.tier,mods:G.mods,yh:G.yh&&{L:Math.round(G.yh.L),R:Math.round(G.yh.R),h:Math.round(harmony()*100),lv:G.yh.lv.map(Math.round)},bodies:bodies(),progress:+progress().toFixed(3),playMin:Math.round((G.playMs||0)/60000)},null,1):'진행 중인 판 없음'}}
})();
