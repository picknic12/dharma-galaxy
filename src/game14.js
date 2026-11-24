// ================= v0.5 용호(龍虎) 균형 · 8대 차크라 점진 각성 · 경제 배움 8과 · 용호 수련 =================
// 좌뇌(호랑이 🐯 · 계산·분석)와 우뇌(용 🐉 · 직관·상징)가 함께 움직일수록 에너지가 고르게 흐르고,
// 아래(뿌리)에서 위(근원)로 차크라가 하나씩, 게임 진행에 맞춰 천천히 깨어난다.
// 내부 조절값(XCFG)은 화면 설정에 드러내지 않는다.
function XCFG(){return Object.assign({chakra:true,gate:1,flow:1,bodies:true,stressW:1,logMove:500},store.get('dagal_x',{}))}
function Y(){if(!G)return null;return G.yh||(G.yh={L:0,R:0,l:0,r:0,lv:[0,0,0,0,0,0,0,0],fin:0,lessons:{},flags:{},next:0,side:0,qr:{L:[0,0],R:[0,0]},hist:[]})}
function progress(){if(!G)return 0;return Math.min(1,Math.max(G.round/(G.maxRounds||60),(G.playMs||0)/(G.timeLimit||3600000)))}
function harmony(){const y=Y();if(!y)return .5;const a=y.l,b=y.r;if(a+b<4)return .6;return 1-Math.abs(a-b)/(a+b)}
// 왼쪽(계산) 또는 오른쪽(직관) 기운을 더한다
function yh(side,n,why){const y=Y();if(!y)return;n=n||1;if(side==='L'){y.L+=n;y.l+=n}else{y.R+=n;y.r+=n}
 if(window.logEvent)logEvent('yh',{side,n,why:why||''});
 feed(n*2*(.35+harmony())*XCFG().flow)}
// 에너지를 가장 덜 깨어난 차크라부터 고르게 채운다
function feed(e){const y=Y();if(!y||!XCFG().chakra)return;const P=G.players[0];P.ck=P.ck||[];
 while(e>0){let k=-1,m=1e9;for(let i=0;i<8;i++){if(P.ck[i])continue;if(y.lv[i]<m){m=y.lv[i];k=i}}if(k<0)break;const add=Math.min(e,4);y.lv[k]=Math.min(100,y.lv[k]+add);e-=add;if(y.lv.every((v,i)=>P.ck[i]||v>=100))break}
 tryAwaken()}
function gateOf(k){return Math.min(.95,(k+1)/10*XCFG().gate)}
function tryAwaken(){const y=Y(),P=G.players[0];P.ck=P.ck||[];const pr=progress();
 for(let k=0;k<8;k++){if(P.ck[k])continue;if(y.lv[k]>=100&&pr>=gateOf(k)){_awaken(0,k);break}if(!P.ck[k])break}
 renderChakra()}
const _awaken=chakra;
// 기존 각성 사건은 이제 '자극'이다: 해당 차크라를 데우고, 아래 차크라(좌뇌·현실)와 위 차크라(우뇌·직관)로 용호 기운을 보탠다
chakra=function(p,k){if(p!==0||!G||!XCFG().chakra)return;const y=Y();const P=G.players[0];P.ck=P.ck||[];
 if(!P.ck[k])y.lv[k]=Math.min(100,y.lv[k]+5);yh([0,1,2,4].includes(k)?'L':'R',1,'chakra'+k)};
renderChakra=function(){const P=G&&G.players[0];if(!P)return;const box=$('#chakra');if(!box)return;box.style.display=XCFG().chakra?'':'none';const y=Y();
 box.innerHTML=CHAKRA.map((C,k)=>{const on=P.ck&&P.ck[k],lv=on?100:Math.round(y?y.lv[k]:0);return `<i title="${k+1}. ${C.n} (${C.k}) — ${on?'각성':lv+'%'}" style="--cc:${C.c};--lv:${lv}%" class="${on?'on':''}${!on&&lv>=100?' full':''}"></i>`}).reverse().join('')+
 `<div class="yhg" title="용호(龍虎) 균형 — 🐯 계산 ${Math.round(y?y.l:0)} · 🐉 직관 ${Math.round(y?y.r:0)}"><span class="ti">🐯</span><b style="--h:${Math.round(harmony()*100)}%"></b><span class="dr">🐉</span></div>`};
// 매일: 직전 흐름을 조금씩 잊고(최근 행동이 중요), 조화도만큼 기본 에너지가 흐른다
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(!G||G.over)return r;const y=Y();
 if(document.body.classList.contains('med'))yh('R',1.5,'meditation');
 if(window.CosmicMusic&&CosmicMusic.isPlaying())y.r+=.3;
 const base=900/Math.max(60,G.maxRounds||60);feed(base*(.25+harmony())*XCFG().flow);
 y.l*=.9;y.r*=.9;y.hist.push({d:G.round,h:Math.round(harmony()*100),L:Math.round(y.L),R:Math.round(y.R),ck:(G.players[0].ck||[]).filter(Boolean).length});
 lessonCheck('round');
 const every=G.tutorial?99:G.stress?99:Math.max(3,Math.round((G.maxRounds||60)/15));if(T13()>=1&&G.round%every===0)y.due=true;
 return r}}
// ---- 행동 → 용호 기운 ----
{const _f=fin;fin=function(p,act,amt){const ok=_f(p,act,amt);if(ok&&p===0&&G){const y=Y();if(y.fin<40){y.fin++;yh('L',1,'fin-'+act)}
 if(act==='loan')y.flags.loan=1;if(act==='repay'&&y.flags.loan&&G.players[0].loan<=0)y.flags.repaid=1;if(act==='dep'&&depRate()>=.02)y.flags.highDep=1;if(act==='dep')y.flags.dep=1;
 if(act==='bondB')y.flags.bondRate=depRate();if(act==='bondS'&&y.flags.bondRate!=null&&depRate()<y.flags.bondRate)y.flags.bondWin=1;
 lessonCheck('fin')}return ok}}
{const _m=mort;mort=function(p,w,i){const ok=_m(p,w,i);if(ok&&p===0&&G){Y().flags.mort=1;yh('L',1,'mort')}return ok}}
{const _u=unmort;unmort=function(p,w,i){const ok=_u(p,w,i);if(ok&&p===0&&G){const y=Y();if(y.flags.mort)y.flags.unmort=1;yh('L',1,'unmort');lessonCheck('fin')}return ok}}
{const _c=compassion;compassion=function(){const r=_c.apply(this,arguments);if(G)yh('R',2,'compassion');return r}}
{const _a=ask;ask=function(text,opts,cfg){const t=String(text);const pr=_a(text,opts,cfg);
 if(G&&!G.autoHuman&&/양자 주사위/.test(t))pr.then(v=>{if(v<2)yh('R',1,'quantum')}).catch(()=>{});
 if(G&&!G.autoHuman&&/매입가/.test(t))pr.then(v=>{if(v===1)yh('L',.6,'buy')}).catch(()=>{});
 return pr}}
// 사람 차례가 오면, 정해진 날마다 '용호 수련' 한 문제 (좌·우 번갈아)
{const _t=turn;turn=async function(p){if(G&&!G.over&&p===0&&isHuman(0)&&Y().due){Y().due=false;try{await yhQuiz()}catch(e){if(e===ABORT)throw e}}return _t(p)}}

// ================= 용호 수련 문제 =================
const ELS5=['목','화','토','금','수'];
function shuffleOpts(a){return PicnicRng.create().shuffle(a)}
function quizL(){const r=R.int(0,5);const dr=depRate();
 if(r===0){const amt=1000,d=10,rr=Math.max(.008,dr);const ans=Math.round(amt*Math.pow(1+rr,d));const opts=shuffleOpts([ans,amt+Math.round(amt*rr),Math.round(amt*(1+rr*d*2)),amt].map(String).filter((v,i,a)=>a.indexOf(v)===i));
  return {q:`🐯 복리 — ${fmt(amt)}을 하루 금리 ${(rr*100).toFixed(1)}%로 ${d}일 맡기면 약 얼마가 될까요? (이자에도 이자가 붙습니다)`,o:opts.map(v=>fmt(+v)),a:opts.indexOf(String(ans)),why:`매일 ×${(1+rr).toFixed(3)}씩 ${d}번 곱해 약 ${fmt(ans)}. 시간이 길수록 복리의 힘이 커집니다.`}}
 if(r===1){const price=R.int(12,40)*10,rent=R.int(3,9)*10;const ans=Math.ceil(price/rent);const opts=shuffleOpts([ans,ans+3,Math.max(1,ans-2),ans*2]).filter((v,i,a)=>a.indexOf(v)===i);
  return {q:`🐯 본전 계산 — ${fmt(price)}짜리 행성의 통행료가 ${fmt(rent)}입니다. 몇 번 손님이 와야 본전일까요?`,o:opts.map(v=>v+'번'),a:opts.indexOf(ans),why:`${fmt(price)} ÷ ${fmt(rent)} ≈ ${ans}번. 본전 기간이 짧을수록 수익률이 높습니다.`}}
 if(r===2)return {q:'🐯 금리와 채권 — 금리가 오르면 이미 발행된 채권의 가격은 보통 어떻게 될까요?',o:['내린다','오른다','변하지 않는다'],a:0,why:'새 채권이 더 높은 이자를 주니, 옛 채권은 싸져야 팔립니다. 금리와 채권값은 시소처럼 움직입니다.'};
 if(r===3){const lr=(loanRate()*100).toFixed(1);return {q:`🐯 빚과 수익 — 대출 금리가 하루 ${lr}%입니다. 하루 수익률 1%짜리 투자를 빚으로 하면?`,o:['손해가 쌓인다','이익이 쌓인다','똑같다'],a:+lr>1?0:1,why:`빌린 돈의 비용(${lr}%)이 수익(1%)보다 ${+lr>1?'크면 빚이 수익을 갉아먹습니다':'작으면 지렛대가 됩니다'}. 빚은 비용과 수익을 함께 따져야 합니다.`}}
 if(r===4)return {q:'🐯 분산 — 같은 업종 행성 3개와 서로 다른 업종 행성 3개, 한 업종이 흔들릴 때 더 버티는 쪽은?',o:['서로 다른 업종 3개','같은 업종 3개','똑같다'],a:0,why:'달걀을 한 바구니에 담지 않는 법. 위험이 서로 엇갈리면 전체가 덜 흔들립니다.'};
 return {q:'🐯 담보 — 행성을 담보로 돈을 빌리면, 갚기 전까지 그 행성은?',o:['통행료를 받지 못하고 팔기도 어렵다','통행료가 두 배가 된다','아무 변화가 없다'],a:0,why:'담보는 빌린 돈의 보증입니다. 갚을 때까지 그 자산의 쓰임이 묶입니다.'}}
function quizR(){const r=R.int(0,4);
 if(r===0){const e=R.int(0,4);const ans=ELS5[(e+1)%5];return {q:`🐉 상생(相生) — ${e===0?'나무':e===1?'불':e===2?'흙':e===3?'쇠':'물'}(${ELS5[e]}) 다음에 태어나는 기운은?`,o:shuffleOpts(ELS5.filter(x=>x!==ELS5[e]).slice()),ans,why:'목생화 · 화생토 · 토생금 · 금생수 · 수생목. 생(生)은 흐름을 이어 주는 힘입니다.'}}
 if(r===1){const e=R.int(0,4);const ans=ELS5[(e+2)%5];return {q:`🐉 상극(相剋) — ${ELS5[e]}(${OH.HZ[ELS5[e]]})이(가) 다스리는(극하는) 기운은?`,o:shuffleOpts(ELS5.filter(x=>x!==ELS5[e])),ans,why:'목극토 · 토극수 · 수극화 · 화극금 · 금극목. 극(剋)은 벌이 아니라 균형을 잡는 브레이크입니다.'}}
 if(r===2){const c=[['붉은 노을','화'],['푸른 숲','목'],['누런 황토','토'],['하얀 금속','금'],['깊은 바다','수']][R.int(0,4)];return {q:`🐉 상징 — “${c[0]}”이 품은 기운은?`,o:shuffleOpts(ELS5.slice()),ans:c[1],why:'색과 풍경은 오행의 언어입니다. 느낌으로 먼저 알고, 계산으로 확인합니다.'}}
 if(r===3){const k=R.int(0,7);const C=CHAKRA[k];return {q:`🐉 차크라 — ${C.n}(${C.k})의 빛깔에 가장 가까운 것은?`,o:shuffleOpts(['빨강','주황','노랑','초록','파랑','남색','보라','흰 금빛'].filter((x,i)=>i===k||R.next()<.45).slice(0,4)),ans:['빨강','주황','노랑','초록','파랑','남색','보라','흰 금빛'][k],why:`${C.n}은(는) ${C.hz}Hz와 공명하는 ${C.k}의 자리입니다.`}}
 return {q:'🐉 직관 — 숨을 세 번 천천히 고른 뒤, 지금 마음이 끌리는 별을 고르세요. (정답은 없습니다)',o:['🌕 둥근 별','🌟 반짝이는 별','🌠 흐르는 별','🌑 고요한 별'],a:-1,why:'정답 없는 선택도 마음의 근육을 씁니다. 고른 별 쪽으로 오늘의 직관이 조금 더 깨어납니다.'}}
async function yhQuiz(){const y=Y();y.side=1-y.side;const side=y.side?'R':'L';let Q=side==='L'?quizL():quizR();if(Q.ans!=null){if(!Q.o.includes(Q.ans))Q.o[Q.o.length-1]=Q.ans;Q.o=Q.o.filter((v,i,a)=>a.indexOf(v)===i);Q.a=Q.o.indexOf(Q.ans)}
 const t0=performance.now();const v=await ask(`${Q.q}<div class="sub">용호(龍虎) 수련 — ${side==='L'?'계산하는 호랑이':'느끼는 용'}의 차례 · 맞히면 그쪽 기운이 자랍니다</div>`,Q.o.map((o,k)=>({t:o,v:k,main:k===0})).concat([{t:'건너뛰기',v:-9}]),{auto:()=>-9});
 if(v===-9)return;const ok=Q.a<0||v===Q.a;y.qr[side][ok?0:1]++;
 if(window.logEvent)logEvent('quiz',{side,ok,ms:Math.round(performance.now()-t0)});
 yh(side,ok?3:1,'quiz');if(ok)addCash(0,20);
 showNews(ok?(Q.a<0?'🐉 직관이 한 걸음':'✅ 맞았습니다'):'💡 함께 알아봐요',`${ok?'':'정답: '+Q.o[Q.a]+' — '}${Q.why}${ok?' (+20억)':''}`);sfx(ok?'coin':'step')}

// ================= 경제 배움 8과 =================
const LESSONS=[
 {k:'rate',t:'금리와 경기 순환',c:'국면(오행)마다 예금 금리가 다릅니다. 금(金) 국면이 2.2%로 가장 높고, 수(水) 국면이 0.8%로 가장 낮습니다.',task:'금(金) 국면처럼 예금 금리가 2% 이상일 때 예금하기',ok:y=>y.flags.highDep},
 {k:'alloc',t:'자산 배분',c:'현금(안전) · 행성(수익) · 금융(이자·배당)을 함께 들고 있으면 한쪽이 흔들려도 버팁니다.',task:'현금·행성·금융이 각각 순자산의 15% 이상',ok:()=>{const p=pie();return p.cash>=.15&&p.planet>=.15&&p.fin>=.15}},
 {k:'risk',t:'위험과 수익',c:'수익이 큰 곳은 보통 위험도 큽니다. 매입 창의 본전 기간·현금 위험 표시를 함께 보세요.',task:'행성 3개 이상 보유하면서 현금을 순자산의 10% 이상 남기기',ok:()=>allOwned(0).length>=3&&pie().cash>=.1},
 {k:'debt',t:'부채와 이자',c:'대출 이자는 매일 붙습니다. 빌린 돈으로 번 수익이 이자보다 클 때만 빚이 지렛대가 됩니다.',task:'대출을 받았다가 모두 갚기',ok:y=>y.flags.repaid},
 {k:'coll',t:'담보',c:'담보 잡힌 행성은 통행료를 받지 못합니다. 급할 때 쓰고, 여유가 생기면 바로 풀어야 합니다.',task:'행성을 담보로 잡았다가 다시 풀기',ok:y=>y.flags.unmort},
 {k:'div',t:'분산 투자',c:'서로 다른 업종에 나눠 두면 한 업종의 충격이 전체로 번지지 않습니다.',task:'서로 다른 업종의 행성 3곳 이상 보유',ok:()=>new Set(allOwned(0).map(([w,i])=>sp(w,i).g)).size>=3},
 {k:'comp',t:'복리',c:'이자에 이자가 붙으면 시간이 곧 돈이 됩니다. 일찍, 오래 맡길수록 커집니다.',task:'예금을 8일 이상 이어서 유지',ok:y=>(y.depDays||0)>=8},
 {k:'cycle',t:'경기 국면 매매',c:'금리가 높을 때 채권을 사 두면, 금리가 내려갈 때 채권값이 올라 차익이 납니다.',task:'채권을 산 뒤, 금리가 더 낮은 국면에 팔기',ok:y=>y.flags.bondWin}];
function pie(){const P=G.players[0];let pl=0;for(const [w,i] of allOwned(0)){const o=own(w,i);pl+=Math.max(0,mkt(w,i)-(o.m?o.debt:0))}const f=typeof finWorth==='function'?Math.max(0,P.dep+P.bonds*bondPrice()+P.stock*stockPrice()):0;
 const ar=(P.robots||[]).length*60+(typeof armyValue==='function'?armyValue(P)*.5:0);const c=Math.max(0,P.cash);const tot=c+pl+f+ar||1;return {cash:c/tot,planet:pl/tot,fin:f/tot,army:ar/tot,tot,loan:P.loan||0}}
function lessonCheck(why){if(!G||!feat('econ'))return;const y=Y();const P=G.players[0];if(why==='round'){y.depDays=P.dep>0?(y.depDays||0)+1:0}
 LESSONS.forEach((L,k)=>{if(y.lessons[L.k])return;if(k>0&&!y.lessons[LESSONS[k-1].k]&&!(G.cfg&&lenOf(G.cfg.rounds)!=='basic'))return;
  let ok=false;try{ok=!!L.ok(y)}catch(e){}if(ok){y.lessons[L.k]=G.round;addCash(0,50);yh('L',4,'lesson');log(`📘 경제 배움 ${k+1}과 완료 — ${L.t} (+50억). ${L.c}`,'good');showNews(`📘 ${k+1}과 완료 · ${L.t}`,L.c);burst()}});
 renderLearn()}
function renderLearn(){let box=$('#learn');if(!G)return;
 if(!box){const aside=document.querySelector('aside');if(!aside)return;aside.insertAdjacentHTML('afterbegin','<div class="panel" id="learnP"><h3>📘 경제 배움 <small class="sub" id="learnN"></small><button class="btn sm" id="learnT" style="float:right;min-height:26px;padding:2px 8px">접기</button></h3><div id="learn"></div></div>');box=$('#learn');
  $('#learnT').onclick=()=>{$('#learnP').classList.toggle('fold');$('#learnT').textContent=$('#learnP').classList.contains('fold')?'펼치기':'접기'}}
 const show=feat('econ');$('#learnP').style.display=show?'':'none';if(!show)return;const y=Y();
 const done=LESSONS.filter(L=>y.lessons[L.k]).length;$('#learnN').textContent=`${done}/8`;
 const cur=LESSONS.find((L,k)=>!y.lessons[L.k]);const p=pie();
 const bar=[['cash','현금','#9ff0d2'],['planet','행성','#b9a6ff'],['fin','금융','#ffd88a'],['army','함대·로봇','#ffc6a8']].map(([k,n,c])=>`<i style="width:${(p[k]*100).toFixed(1)}%;background:${c}" title="${n} ${(p[k]*100).toFixed(0)}%"></i>`).join('');
 box.innerHTML=`${cur?`<div class="lesson"><b>${LESSONS.indexOf(cur)+1}과 · ${cur.t}</b><div class="sub">${cur.c}</div><div class="task">🎯 ${cur.task}</div></div>`:'<div class="lesson"><b>🎓 여덟 과를 모두 익혔습니다</b><div class="sub">이제 금리·배분·부채·담보·위험을 한꺼번에 저울질하는 감각이 몸에 붙었습니다.</div></div>'}
 <div class="pie">${bar}</div><div class="sub">현금 ${(p.cash*100).toFixed(0)}% · 행성 ${(p.planet*100).toFixed(0)}% · 금융 ${(p.fin*100).toFixed(0)}% · 함대 ${(p.army*100).toFixed(0)}%${p.loan>0?` · <span class="bad">대출 ${fmt(p.loan)} (하루 이자 ${(loanRate()*100).toFixed(1)}%)</span>`:''}</div>`}
{const _r=renderAll;renderAll=function(){_r();if(G&&G.players[0]&&G.players[0].hero){try{renderLearn()}catch(e){}applyTier()}}}
// 매입 판단 창에 위험·수익 줄 보태기
{const _j=judgeFactors;judgeFactors=function(p,wid,i,price){const f=_j(p,wid,i,price);try{if(p===0&&feat('econ')){const s=sp(wid,i);const rent=Math.round((s.rent?s.rent[0]:25)*idxOf(s.g)/100)||1;const P=G.players[0];const after=P.cash-price;
 f.push({t:`📘 본전까지 손님 약 ${Math.ceil(price/rent)}번 · 1회 수익률 ${(rent/price*100).toFixed(1)}%`,v:0});if(after<danger(0))f.push({t:`📘 산 뒤 현금 ${fmt(after)} — 위험선 아래(통행료를 못 낼 수 있음)`,v:-1})}}catch(e){}return f}}
