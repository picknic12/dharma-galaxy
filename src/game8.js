// ================= v0.2 은하 중앙은행 · 예금 · 신용대출 · 채권 · 종합주 =================
const RATES={목:1.2,화:1.6,토:1.0,금:2.2,수:0.8};
function depRate(){return RATES[OH.PHASES[G.phase].el]/100}
function loanRate(){return depRate()+.018}
function composite(){return Math.round(SKEYS.reduce((a,k)=>a+G.idx[k],0)/SKEYS.length)}
function stockPrice(){return composite()/10}
function bondPrice(){return Math.max(6,10*(1+(.015-depRate())*8))}
function finInit(P){Object.assign(P,{dep:0,loan:0,bonds:0,stock:0,cards:{core:Array(10).fill(0),body:Array(10).fill(0),power:Array(10).fill(0)},robots:[],potions:[],items:[],know:0,buff:{}})}
function finWorth(p){const P=G.players[p];return P.dep+P.bonds*bondPrice()+P.stock*stockPrice()-P.loan}
function creditLimit(p){return Math.round(300+Math.max(0,netWorth(p))*.15)}
function finTick(){
 for(let q=0;q<G.players.length;q++){const P=G.players[q];if(P.out)continue;
  if(P.dep>0)P.dep=Math.round(P.dep*(1+depRate())*10)/10;
  if(P.loan>0)P.loan=Math.round(P.loan*(1+loanRate())*10)/10;
  if(P.bonds>0){P.cash+=Math.round(P.bonds*10*.015*10)/10}
  robotIncome(q);
 }
}
function fin(p,act,amt){const P=G.players[p];amt=Math.round(amt);let ok=false;
 if(act==='dep'&&P.cash>=amt){P.cash-=amt;P.dep+=amt;ok=true}
 else if(act==='wd'){const a=Math.min(amt,P.dep);P.dep-=a;P.cash+=a;ok=a>0}
 else if(act==='loan'){const a=Math.min(amt,creditLimit(p)-P.loan);if(a>0){P.loan+=a;P.cash+=a;ok=true}}
 else if(act==='repay'){const a=Math.min(amt,P.loan,P.cash);if(a>0){P.loan-=a;P.cash-=a;ok=true}}
 else if(act==='bondB'){const c=bondPrice()*amt;if(P.cash>=c){P.cash-=c;P.bonds+=amt;ok=true}}
 else if(act==='bondS'){const a=Math.min(amt,P.bonds);if(a>0){P.bonds-=a;P.cash+=bondPrice()*a;ok=true}}
 else if(act==='stkB'){const c=stockPrice()*amt;if(P.cash>=c){P.cash-=c;P.stock+=amt;ok=true}}
 else if(act==='stkS'){const a=Math.min(amt,P.stock);if(a>0){P.stock-=a;P.cash+=stockPrice()*a;ok=true}}
 P.cash=Math.round(P.cash*10)/10;P.loan=Math.max(0,Math.round(P.loan*10)/10);return ok}
function finLiquidate(p,need){const P=G.players[p];const out=[];
 if(P.cash<need&&P.dep>0){fin(p,'wd',need-P.cash);out.push('예금 인출')}
 if(P.cash<need&&P.stock>0){fin(p,'stkS',Math.ceil((need-P.cash)/stockPrice()));out.push('종합주 매도')}
 if(P.cash<need&&P.bonds>0){fin(p,'bondS',Math.ceil((need-P.cash)/bondPrice()));out.push('채권 매도')}
 if(P.cash<need&&P.loan<creditLimit(p)){fin(p,'loan',need-P.cash);out.push('신용대출')}
 return out}
function aiFinance(p){const P=G.players[p],res=aiReserve(p),k=P.pers.key;const m=[];
 if(P.loan>0&&P.cash>res*1.8){const a=Math.min(P.loan,P.cash-res*1.5);if(fin(p,'repay',a))m.push(`대출 상환 ${fmt(a)}`)}
 if((k==='sophia'||k==='athena'||P.pers.reserve>=1.4)&&P.cash>res*2.2){const a=Math.round(P.cash-res*1.8);if(fin(p,'dep',a))m.push(`예금 ${fmt(a)}`)}
 if(P.dep>0&&P.cash<res*.6){fin(p,'wd',res-P.cash);m.push('예금 인출')}
 const h=G.hist.A,mom=SKEYS.reduce((a,s)=>{const x=G.hist[s];return a+(x.length>2?x[x.length-1]-x[x.length-3]:0)},0);
 if((k==='hermes'||k==='chronos'||P.pers.momentum)&&mom>8&&P.cash>res*1.5){const u=Math.floor((P.cash-res*1.3)/stockPrice()/2);if(u>0&&fin(p,'stkB',u))m.push(`종합주 ${u}주 매수`)}
 if(P.stock>0&&mom<-6){const u=P.stock;fin(p,'stkS',u);m.push(`종합주 ${u}주 매도`)}
 if(OH.PHASES[G.phase].el==='금'&&P.pers.key!=='ares'&&P.cash>res*1.6){const u=Math.floor((P.cash-res*1.4)/bondPrice()/3);if(u>0&&fin(p,'bondB',u))m.push(`채권 ${u}개 매입`)}
 if(k==='ares'&&P.cash<res*.5&&P.loan<creditLimit(p)*.6){fin(p,'loan',res);m.push(`신용대출 ${fmt(res)}`)}
 if(m.length&&rnd()<.6)log(`🏦 ${P.name}: ${m.join(' · ')}`,'ai')}
function renderBank(){const box=$('#bank');if(!box||!G)return;const P=G.players[0];const ph=OH.PHASES[G.phase];
 box.innerHTML=`<div class="sub">${OH.HZ[ph.el]} ${ph.name} · 예금금리 <b>${(depRate()*100).toFixed(1)}%</b>/일 · 대출금리 ${(loanRate()*100).toFixed(1)}%/일 · 채권 표면이자 1.5%/일</div>
 <div class="frow"><span>💰 현금</span><b>${fmt(P.cash)}</b></div>
 <div class="frow"><span>🏦 예금</span><b>${fmt(P.dep)}</b><button class="btn sm" data-f="dep" data-a="100">+100</button><button class="btn sm" data-f="wd" data-a="100">−100</button><button class="btn sm" data-f="wd" data-a="99999">전액</button></div>
 <div class="frow"><span>💳 신용대출</span><b>${fmt(P.loan)}</b><small class="sub">한도 ${fmt(creditLimit(0))}</small><button class="btn sm" data-f="loan" data-a="100">+100</button><button class="btn sm" data-f="repay" data-a="100">상환 100</button></div>
 <div class="frow"><span>📜 은하 채권</span><b>${P.bonds}개</b><small class="sub">개당 ${fmt(bondPrice())}</small><button class="btn sm" data-f="bondB" data-a="5">+5</button><button class="btn sm" data-f="bondS" data-a="5">−5</button></div>
 <div class="frow"><span>📈 은하 종합주</span><b>${P.stock}주</b><small class="sub">주당 ${fmt(stockPrice())} (지수 ${composite()})</small><button class="btn sm" data-f="stkB" data-a="10">+10</button><button class="btn sm" data-f="stkS" data-a="10">−10</button></div>
 <div class="sub">금융 순자산 ${fmt(finWorth(0))} · 모든 금리·가격은 게임 속 가상 경제 규칙입니다.</div>`;
 box.querySelectorAll('button[data-f]').forEach(b=>b.onclick=()=>{if(G.over)return;if(fin(0,b.dataset.f,+b.dataset.a)){sfx('coin');log(`🏦 ${b.parentElement.firstElementChild.textContent} ${b.textContent}`,'good')}else sfx('bagFull');renderAll()})}
