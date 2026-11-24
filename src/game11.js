// ================= v0.4 영웅 원정 — 턴제 육각 전술 RPG 층 (게임의 30% 이상) =================
// 독자 설계: 영웅 + 병종 30종(오행 5 × 6) + 2.5D 육각 전투 + 공성전 + 오행 수호자 + 퀘스트.
const ELS=['목','화','토','금','수'];
const SECT_EL={A:'금',B:'토',C:'목',D:'토',E:'화',F:'금',ETF:'수',CRYPTO:'수'};
const TIER={1:{hp:10,atk:3,def:3,d:[1,3],spd:4,ini:6,lead:10,cost:2},2:{hp:25,atk:6,def:5,d:[3,6],spd:4,ini:7,lead:25,cost:6},3:{hp:55,atk:10,def:9,d:[6,12],spd:5,ini:8,lead:50,cost:15},4:{hp:110,atk:15,def:14,d:[14,24],spd:5,ini:9,lead:100,cost:35},5:{hp:240,atk:22,def:20,d:[30,50],spd:6,ini:10,lead:200,cost:80}};
// [이름, 오행, 단계, 원거리, 비행, 성향, 그림, 특기]
const UDEF=[
 ['새싹 정령','목',1,0,0,'빛',{shape:'blob',color:'#9be8a8',wings:'fairy'},'재생'],['덩굴 사수','목',1,1,0,'빛',{shape:'hood',color:'#6fbf7a'},''],['바람 사슴 기병','목',2,0,0,'빛',{shape:'round',color:'#b6e39b',ears:'pointy'},'돌격'],
 ['숲 골렘','목',3,0,0,'빛',{shape:'golem',color:'#7fb36b'},'재생'],['청룡 기사','목',4,0,1,'빛',{shape:'round',color:'#5fd0b0',wings:'dragon',horns:1,tail:1},''],['세계수 수호령','목',5,1,0,'빛',{shape:'ghost',color:'#c9f5c4',crown:1,wings:'angel'},'치유'],
 ['불씨 도깨비','화',1,0,0,'현기',{shape:'round',color:'#ff9a7a',horns:1,fangs:1},''],['화염 궁수','화',1,1,0,'빛',{shape:'hood',color:'#e8734f'},''],['용암 거북','화',2,0,0,'현기',{shape:'golem',color:'#d9774a',eyes:'sleepy'},'단단함'],
 ['불사조 정찰병','화',3,0,1,'빛',{shape:'bird',color:'#ffb35a'},'부활'],['태양 사제','화',4,1,0,'빛',{shape:'ghost',color:'#ffd27a',crown:1},'치유'],['홍염 드래곤','화',5,0,1,'현기',{shape:'round',color:'#ff6a5a',wings:'dragon',horns:1,tail:1,fangs:1,crown:1},'화염숨'],
 ['흙 인형','토',1,0,0,'빛',{shape:'golem',color:'#d8bb8a'},'단단함'],['투석 두더지','토',1,1,0,'빛',{shape:'round',color:'#c9a07a',ears:'round',belly:1},''],['황토 곰 전사','토',2,0,0,'빛',{shape:'round',color:'#c08a5a',ears:'round',belly:1,eyes:'angry'},''],
 ['바위 거인','토',3,0,0,'현기',{shape:'golem',color:'#a89a86',eyes:'angry'},'단단함'],['기린 수호자','토',4,0,0,'빛',{shape:'round',color:'#f0d27a',horns:1,ears:'pointy'},'치유'],['황룡','토',5,0,1,'빛',{shape:'round',color:'#f5c84a',wings:'dragon',horns:1,tail:1,crown:1},''],
 ['강철 드론','금',1,0,1,'빛',{robot:1,chassis:0,color:'#d5dbe6',accent:'#7ad3ff',move:'hover'},''],['레이저 포탑','금',1,1,0,'현기',{robot:1,chassis:2,color:'#c2c8d6',accent:'#ff7a9a',arm:'cannon',move:'tread'},''],['백금 기사','금',2,0,0,'빛',{robot:1,chassis:1,color:'#eef1f7',accent:'#ffe07f',arm:'blade',move:'legs'},''],
 ['파동포 전차','금',3,1,0,'현기',{robot:1,chassis:3,color:'#b9c2d4',accent:'#a67cff',arm:'cannon',move:'tread'},'관통'],['메카 골렘','금',4,0,0,'현기',{robot:1,chassis:4,color:'#9aa4b8',accent:'#ff9f5a',arm:'claw',move:'legs'},'단단함'],['백호 메카','금',5,0,0,'빛',{robot:1,chassis:5,color:'#ffffff',accent:'#9fd8ff',arm:'blade',move:'legs',antenna:3},'돌격'],
 ['물방울 요정','수',1,0,1,'빛',{shape:'blob',color:'#9fd8ff',wings:'fairy'},''],['얼음 투창병','수',1,1,0,'빛',{shape:'hood',color:'#8fb8e8'},''],['심해 문어','수',2,0,0,'현기',{shape:'round',color:'#8f7cbf',legs:'spider'},''],
 ['빙결 마녀','수',3,1,0,'현기',{shape:'hood',color:'#5a6fa8'},'둔화'],['현무 수호자','수',4,0,0,'빛',{shape:'golem',color:'#4f8f9a',eyes:'sleepy'},'단단함'],['흑룡','수',5,0,1,'현기',{shape:'round',color:'#3a3f6a',wings:'dragon',horns:1,tail:1,fangs:1},'흡혈']];
const UNITS=UDEF.map((d,i)=>{const t=TIER[d[2]];return {id:i,name:d[0],el:d[1],tier:d[2],ranged:d[3],fly:d[4],align:d[5],art:d[6],skill:d[7],hp:t.hp,atk:t.atk+(d[3]?-1:0),def:t.def+(d[7]==='단단함'?3:0),d:t.d,spd:t.spd+(d[4]?2:0)-(d[3]?1:0),ini:t.ini+(d[4]?1:0),lead:t.lead,cost:t.cost}});
const uImg={};function unitImg(u){const k=typeof u==='number'?u:u.key;if(uImg[k])return uImg[k];const U_=typeof u==='number'?UNITS[u]:u;const a=U_.art;const svg=a.robot?SK.robot(a):SK.creature(Object.assign({},a,{glow:U_.align==='빛'?'#fff1a8':'#9b6bff'}));const im=new Image();im.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg.replace('<svg ','<svg width="128" height="128" '))));uImg[k]=im;return im}
// ---- 영웅 ----
const HERO_CLASS={목:['성림 순례자','재생과 성장의 길'],화:['홍염 기사단장','돌파와 열정의 길'],토:['황토 수호장','균형과 수호의 길'],금:['백금 기공사','정밀과 기계의 길'],수:['심해 현자','지혜와 흐름의 길']};
function heroInit(P,i){const el=P.el||ELS[i%5];const cls=HERO_CLASS[el];P.hero={lvl:1,xp:0,el,cls:cls[0],path:cls[1],lead:220,atk:1,def:1,army:[],seals:[],wins:0,sieges:0};
 const t1=UNITS.filter(u=>u.el===el&&u.tier===1);t1.forEach(u=>P.hero.army.push({u:u.id,n:8}));}
function leadUsed(P){return P.hero.army.reduce((a,s)=>a+UNITS[s.u].lead*s.n,0)}
function leadMax(P){return P.hero.lead+(P.relics||[]).length*15}
function armyValue(P){return P.hero.army.reduce((a,s)=>a+UNITS[s.u].cost*s.n,0)}
function availUnits(p){const P=G.players[p];const cnt={};ELS.forEach(e=>cnt[e]=0);allOwned(p).forEach(([w,i])=>{const s=sp(w,i);if(s.g&&SECT_EL[s.g])cnt[SECT_EL[s.g]]++});
 return UNITS.filter(u=>u.tier===1||(u.el===P.hero.el&&u.tier<=2)||u.tier<=1+cnt[u.el])}
function recruit(p,uid,n){const P=G.players[p],u=UNITS[uid];n=Math.min(n,Math.floor((leadMax(P)-leadUsed(P))/u.lead),Math.floor(P.cash/u.cost));if(n<=0)return 0;
 let s=P.hero.army.find(x=>x.u===uid);if(!s){if(P.hero.army.length>=5)return 0;s={u:uid,n:0};P.hero.army.push(s)}s.n+=n;P.cash-=n*u.cost;
 if(p===0){log(`🛡 ${u.name} ${n}기 모병 (${fmt(n*u.cost)})`,'good');sfx('coin');questEvent('recruit',u)}return n}
function gainXp(p,x){const P=G.players[p],H=P.hero;H.xp+=Math.round(x);while(H.xp>=H.lvl*120){H.xp-=H.lvl*120;H.lvl++;H.lead+=70;H.atk++;H.def++;P.mp=mpMax(p);
  if(H.lvl%2===0)learnSpell(p,p!==0);if(p===0){log(`⭐ 영웅 레벨 ${H.lvl}! 지휘력 +70 · 공격/방어 +1${H.lvl%2===0?' · 새 마법':''}`,'good');burst(true);sfx('win',1);if(H.lvl>=3)chakra(0,2);if(H.lvl>=6)chakra(0,6)}}}
// ---- 전장 ----
const BC=11,BR=7;
function hexN(c,r){const odd=r&1;return (odd?[[-1,0],[1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[-1,0],[1,0],[-1,-1],[0,-1],[-1,1],[0,1]]).map(([dc,dr])=>[c+dc,r+dr]).filter(([x,y])=>x>=0&&y>=0&&x<BC&&y<BR)}
function hexD(a,b){const cv=([c,r])=>{const x=c-(r-(r&1))/2,z=r;return [x,z,-x-z]};const A=cv(a),B=cv(b);return Math.max(Math.abs(A[0]-B[0]),Math.abs(A[1]-B[1]),Math.abs(A[2]-B[2]))}
function mkStack(side,u,n,c,r){return {side,u,n,hp:u.hp,c,r,ret:1,acted:0,defB:0,dead:0}}
function robotUnit(r){return {key:'rb'+r.recipe+r.align,name:r.name.split(' ')[0]+' 봇',el:r.el,tier:3,ranged:r.forms&&r.forms.includes('원거리 조준경')?1:0,fly:r.stealth?1:0,align:r.align,art:{robot:1,chassis:r.bi%6,color:SK.mix(OH.COLOR[r.el],.3),accent:r.align==='빛'?'#fff1a8':'#a67cff',arm:'cannon',move:'hover'},skill:r.regen?'재생':'',hp:Math.round(40+r.def*2*(r.hp/100)),atk:Math.round(6+r.atk/6+eqBonus(r).atk/4),def:Math.round(5+r.def/6+eqBonus(r).def/4),d:[Math.round(4+r.atk/10),Math.round(8+r.atk/6)],spd:5,ini:8,lead:0,cost:r.cost}}
function sideStacks(p,side){const P=G.players[p];const out=[];const col=side?BC-1:0;
 P.hero.army.filter(s=>s.n>0).forEach(s=>out.push({u:UNITS[s.u],n:s.n,src:s}));P.robots.filter(r=>r.hp>20).slice(0,2).forEach(r=>out.push({u:robotUnit(r),n:1,robot:r}));
 return out.slice(0,7).map((o,k)=>Object.assign(mkStack(side,o.u,o.n,o.u.ranged?col:(side?col-1:col+1),[3,1,5,0,6,2,4][k]),{src:o.src,robot:o.robot}))}
function monsterArmy(x){const M=MON[x.k];const el=M.boss||x.el||pick(ELS);const lv=x.lv;const pool=UNITS.filter(u=>u.el===el&&u.tier<=Math.min(5,1+Math.ceil(lv/2)));const st=[];
 const leader={key:'mon'+x.k+x.align,name:M.n,el,tier:Math.min(5,lv),ranged:0,fly:M.o.wings?1:0,align:x.align,art:Object.assign({},M.o),skill:M.boss?'흡혈':'',hp:Math.round(24*lv*(M.boss?3:1)),atk:3+lv*2,def:3+lv*2,d:[2+lv*2,4+lv*3],spd:4,ini:7,lead:0,cost:lv*20};
 st.push({u:leader,n:M.boss?1:1+Math.floor(lv/3)});const k=Math.min(4,1+Math.floor(lv/2));for(let i=0;i<k;i++){const u=pick(pool);st.push({u,n:Math.max(1,Math.round((3+lv*2.2+eR()*.35)/u.tier/u.tier*1.3))})}
 return st.map((o,k)=>mkStack(1,o.u,o.n,o.u.ranged?BC-1:BC-2,[3,1,5,0,6,2,4][k]))}
function garrison(o,wid,i){const s=sp(wid,i),el=SECT_EL[s.g]||'토';const lv=(own(wid,i).lv||0)+W(wid).depth;const pool=UNITS.filter(u=>u.el===el&&u.tier<=Math.min(5,1+lv));const st=[];
 for(let k=0;k<2+Math.min(3,lv);k++){const u=pick(pool);st.push({u,n:Math.max(1,Math.round((10+lv*8)/u.tier/u.tier*2))})}
 const O=G.players[o];O.hero.army.filter(s=>s.n>0).slice(0,2).forEach(s=>st.push({u:UNITS[s.u],n:Math.ceil(s.n*.5)}));
 return st.slice(0,7).map((x,k)=>mkStack(1,x.u,x.n,x.u.ranged?BC-1:BC-2,[3,1,5,0,6,2,4][k]))}
function stackPow(s){return s.n*(s.u.atk+s.u.def)*(s.u.d[0]+s.u.d[1])/2+s.hp}
function obstacles(){const ob=new Set();const n=ri(2,5);for(let k=0;k<n;k++)ob.add(ri(3,BC-4)+','+ri(0,BR-1));return ob}
// ---- 전투 엔진 (UI 유무와 무관) ----
function dmgCalc(B,a,d,mult){const A=a.u,D=d.u;let base=0;for(let k=0;k<Math.min(a.n,25);k++)base+=ri(A.d[0],A.d[1]);if(a.n>25)base*=a.n/25;
 const atk=A.atk+(B.hb[a.side].atk||0),def=D.def+(B.hb[d.side].def||0)+d.defB;let m=atk>=def?1+.05*Math.min(40,atk-def):1/(1+.05*Math.min(40,def-atk));
 if(OH.geuk(A.el,D.el))m*=1.25;else if(OH.geuk(D.el,A.el))m*=.85;if(OH.saeng(G.astro.pillar.stemEl,A.el))m*=1.1;if(A.align!==D.align)m*=1.05;return Math.max(1,Math.round(base*m*(mult||1)))}
function applyDmg(B,d,dmg){const tot=(d.n-1)*d.u.hp+d.hp-dmg;const before=d.n;if(tot<=0){d.n=0;d.dead=1}else{d.n=Math.ceil(tot/d.u.hp);d.hp=tot-(d.n-1)*d.u.hp}return before-d.n}
function reach(B,s){const occ=new Set(B.st.filter(x=>!x.dead&&x!==s).map(x=>x.c+','+x.r));const R_=new Map([[s.c+','+s.r,0]]);const q=[[s.c,s.r]];
 while(q.length){const [c,r]=q.shift();const dd=R_.get(c+','+r);if(dd>=s.u.spd)continue;for(const [x,y] of hexN(c,r)){const k=x+','+y;if(R_.has(k)||occ.has(k)||(!s.u.fly&&B.ob.has(k)))continue;R_.set(k,dd+1);q.push([x,y])}}
 R_.delete(s.c+','+s.r);return R_}
function enemiesOf(B,s){return B.st.filter(x=>!x.dead&&x.side!==s.side)}
function adjEnemy(B,s){return enemiesOf(B,s).some(e=>hexD([s.c,s.r],[e.c,e.r])===1)}
async function doAttack(B,a,d,ranged){const mult=ranged&&adjEnemy(B,a)?.5:1;let dmg=dmgCalc(B,a,d,mult);const k=applyDmg(B,d,dmg);B.fx.push({c:d.c,r:d.r,t:`−${dmg}${k?` (${k})`:''}`,col:ranged?'#9fd8ff':'#ffb3b3'});
 bLog(B,`${a.side?'🔻':'🔹'} ${a.u.name} → ${d.u.name}: ${dmg} 피해${k?`, ${k}기 쓰러짐`:''}`);if(B.ui){sfx(ranged?'pop':'hit',1);await bAnim(B,a,d)}
 if(a.u.skill==='흡혈'&&!a.dead){a.hp=Math.min(a.u.hp,a.hp+Math.round(dmg*.3))}
 if(!d.dead&&!ranged&&d.ret&&hexD([a.c,a.r],[d.c,d.r])===1){d.ret=0;const r2=dmgCalc(B,d,a,1);const k2=applyDmg(B,a,r2);B.fx.push({c:a.c,r:a.r,t:`−${r2}`,col:'#ffd6a0'});bLog(B,`　↩ ${d.u.name} 반격 ${r2}${k2?`, ${k2}기`:''}`);if(B.ui)await bAnim(B,d,a)}}
function aiPick(B,s){const en=enemiesOf(B,s);if(!en.length)return null;const val=e=>(e.u.atk+e.u.d[1])*e.n/((e.n-1)*e.u.hp+e.hp);
 if(s.u.ranged&&!adjEnemy(B,s))return {t:'shoot',e:en.sort((a,b)=>val(b)-val(a))[0]};
 const R_=reach(B,s);let best=null;for(const e of en){if(hexD([s.c,s.r],[e.c,e.r])===1){const sc=val(e)*2;if(!best||sc>best.sc)best={t:'hit',e,sc,to:null}}
  for(const [k,dd] of R_){const [c,r]=k.split(',').map(Number);if(hexD([c,r],[e.c,e.r])===1){const sc=val(e)*2-dd*.01;if(!best||sc>best.sc)best={t:'hit',e,sc,to:[c,r]}}}}
 if(best)return best;// 접근
 const tgt=en.sort((a,b)=>hexD([s.c,s.r],[a.c,a.r])-hexD([s.c,s.r],[b.c,b.r]))[0];let mv=null,md=1e9;for(const [k] of R_){const [c,r]=k.split(',').map(Number);const d2=hexD([c,r],[tgt.c,tgt.r]);if(d2<md){md=d2;mv=[c,r]}}
 return mv?{t:'move',to:mv}:{t:'wait'}}
async function act(B,s,a){if(!a)return;if(a.to){s.c=a.to[0];s.r=a.to[1];if(B.ui){sfx('step');await sleep(120)}}
 if(a.t==='shoot')await doAttack(B,s,a.e,true);else if(a.t==='hit'&&a.e&&!a.e.dead)await doAttack(B,s,a.e,false);else if(a.t==='def')s.defB=Math.round(s.u.def*.3)}
function heroSpellAI(B,side){const p=B.pl[side];if(p==null||B.cast[side])return;const P=G.players[p];const s=bestBattleSpell(p);if(!s||rnd()<.35)return;castInBattle(B,side,s,null)}
function castInBattle(B,side,s,target){const p=B.pl[side];const P=G.players[p];if(P.mp<s.mp)return false;P.mp-=s.mp;B.cast[side]=1;const H=P.hero;const pow=Math.round(s.pow*(1+H.lvl*.12)*(OH.saeng(G.astro.pillar.stemEl,s.el)?1.2:1));
 if(s.type==='atk'){const en=B.st.filter(x=>!x.dead&&x.side!==side);if(!en.length)return true;const many=['연쇄 번개','유성우','혼돈의 소용돌이'].includes(s.base);const tg=many?en:[target&&!target.dead&&target.side!==side?target:en.sort((a,b)=>stackPow(b)-stackPow(a))[0]];
  tg.forEach(e=>{const dmg=Math.round(pow*(many?.55:1)*(OH.geuk(s.el,e.u.el)?1.25:1));const k=applyDmg(B,e,dmg);B.fx.push({c:e.c,r:e.r,t:`✦${dmg}`,col:OH.COLOR[s.el]})});
  if(s.base==='영혼 흡수')B.st.filter(x=>!x.dead&&x.side===side).forEach(x=>x.hp=x.u.hp)}
 else if(s.type==='buf'){B.hb[side].atk=(B.hb[side].atk||0)+Math.round(pow/10);B.hb[side].def=(B.hb[side].def||0)+Math.round(pow/12)}
 bLog(B,`🔮 ${side?'적':'아군'} 영웅 「${s.name}」 시전 (위력 ${pow})`);if(B.ui){burst();sfx('merge')}return true}
async function runBattle(B){let round=0;
 while(round<30){round++;B.round=round;if(B.ui&&window.BattleMusic){const pw=sd=>B.st.filter(x=>!x.dead&&x.side===sd).reduce((a,s)=>a+stackPow(s),0);const a=pw(0),b=pw(1);BattleMusic.intensity(.38+round*.07+(B.boss?.25:0)+(1-Math.abs(a-b)/(a+b+1))*.25)}B.cast=[0,0];B.st.forEach(s=>{s.ret=1;s.acted=0;s.defB=0;if(s.u.skill==='재생'&&!s.dead)s.hp=s.u.hp});
  const order=B.st.filter(s=>!s.dead).sort((a,b)=>b.u.ini-a.u.ini||a.side-b.side);
  for(const s of order){if(s.dead)continue;if(!enemiesOf(B,s).length)break;if(B.tok!==TOKEN)throw ABORT;B.cur=s;
   if(B.ui&&s.side===0&&!B.auto){bDraw(B);const a=await bHumanTurn(B,s);if(a==='flee'){B.fled=1;return 1}await act(B,s,a)}
   else{heroSpellAI(B,s.side);await act(B,s,aiPick(B,s));if(B.ui){bDraw(B);await sleep(160)}}
   s.acted=1}
  const al=[0,1].map(sd=>B.st.some(x=>!x.dead&&x.side===sd));if(!al[0]||!al[1])return al[0]?0:1}
 return B.st.filter(x=>!x.dead&&x.side===0).reduce((a,s)=>a+stackPow(s),0)>=B.st.filter(x=>!x.dead&&x.side===1).reduce((a,s)=>a+stackPow(s),0)?0:1}
function bLog(B,t){B.log.unshift(t);if(B.log.length>8)B.log.pop();if(B.ui){const e=$('#btLog');if(e)e.innerHTML=B.log.map(esc).join('<br>')}}
// 전투 시작: p=플레이어, foe=적 스택 배열, opt={title, enemyHero(p2)}
async function battle(p,foe,opt){const P=G.players[p];const B={st:sideStacks(p,0).concat(foe),ob:obstacles(),hb:[{atk:P.hero.atk,def:P.hero.def},{atk:opt.ehero!=null?G.players[opt.ehero].hero.atk:Math.floor(eR()/6),def:opt.ehero!=null?G.players[opt.ehero].hero.def:Math.floor(eR()/6)}],pl:[p,opt.ehero!=null?opt.ehero:null],log:[],fx:[],tok:TOKEN,title:opt.title||'전투',ui:isHuman(p)&&G.speedMul>0,auto:!!opt.auto,cast:[0,0]};
 B.st.forEach(s=>B.ob.delete(s.c+','+s.r));const pow0=B.st.filter(s=>s.side===0).reduce((a,s)=>a+stackPow(s),0);
 if(!B.st.some(s=>s.side===0)){bLog(B,'싸울 병력이 없습니다');return finishBattle(p,B,1,opt)}
 B.boss=!!opt.boss;if(B.ui)bOpen(B);let res;try{res=await runBattle(B);B.res=res}finally{if(B.ui)await bClose(B)}
 return finishBattle(p,B,res,opt)}
function finishBattle(p,B,res,opt){const P=G.players[p];
 // 아군 손실 반영
 B.st.filter(s=>s.side===0).forEach(s=>{if(s.src)s.src.n=Math.max(0,B.fled?Math.floor(s.n*.7):s.n);if(s.robot)s.robot.hp=Math.max(20,s.dead?20:Math.round(s.robot.hp*(s.hp/s.u.hp)*.5+s.robot.hp*.5))});
 P.hero.army=P.hero.army.filter(s=>s.n>0);
 const killed=B.st.filter(s=>s.side===1).reduce((a,s)=>a+(s.dead?1:0)*s.u.cost*2+s.u.tier*3,0);
 if(res===0){P.hero.wins++;gainXp(p,40+killed);if(p===0)chakra(0,0)}else gainXp(p,10);
 return {win:res===0,fled:!!B.fled,B}}
// ---- 전투 화면 (2.5D 육각) ----
function hexXY(B,c,r){const w=B.cw,h=B.ch;const sz=Math.min(w/(BC+1.2),h/(BR*0.78+2.6));const ox=(w-sz*(BC+.5))/2+sz/2,oy=Math.max(sz*.9,(h-(BR-1)*sz*.62)/2-sz*.05);return [ox+c*sz+(r&1)*sz/2,oy+r*sz*.62,sz]}
function bOpen(B){let o=$('#bt');if(!o){o=document.createElement('div');o.id='bt';document.body.appendChild(o)}
 o.innerHTML=`<canvas id="btc"></canvas><div class="bt-top"><b id="btT"></b><span id="btR" class="sub"></span></div><div class="bt-bar" id="btBar"></div><div class="bt-log" id="btLog"></div>`;o.classList.add('show');
 const cv=$('#btc');const fit=()=>{const r=devicePixelRatio>1?1.5:1;B.cw=innerWidth;B.ch=innerHeight;cv.width=B.cw*r;cv.height=B.ch*r;cv.style.width=B.cw+'px';cv.style.height=B.ch+'px';B.ctx=cv.getContext('2d');B.ctx.setTransform(r,0,0,r,0,0);bDraw(B)};B.fit=fit;addEventListener('resize',fit);fit();
 $('#btT').textContent='⚔️ '+B.title;cv.onmousemove=e=>{B.hov=bPick(B,e);bDraw(B)};cv.onclick=e=>{const h=bPick(B,e);if(h&&B.onPick)B.onPick(h)};
 B.anim=true;const loop=()=>{if(!B.anim)return;bDraw(B);requestAnimationFrame(loop)};loop();
 B.music=false;if(window.BattleMusic&&window.Tone&&!window.__musicOff&&G.sound){B.amb=CosmicMusic.isPlaying();CosmicMusic.stop();const foes=B.st.filter(s=>s.side===1);const el=foes.sort((a,b)=>stackPow(b)-stackPow(a))[0].u.el;Promise.resolve(Tone.start()).then(()=>{if(B.anim){BattleMusic.start({el,boss:B.boss});B.music=true}})}}
async function bClose(B){B.anim=false;removeEventListener('resize',B.fit);if(window.BattleMusic&&BattleMusic.isPlaying())BattleMusic.stop(B.res===0?'win':'lose');await sleep(B.ui?900:0);const o=$('#bt');if(o)o.classList.remove('show');if(window.CosmicMusic){CosmicMusic.setMood(OH.PHASES[G.phase].el);if(B.amb||(B.music&&!window.__musicOff))setTimeout(()=>{if(!CosmicMusic.isPlaying()&&!(window.BattleMusic&&BattleMusic.isPlaying()))CosmicMusic.start()},1800)}}
function bPick(B,e){let best=null,bd=1e9;for(let r=0;r<BR;r++)for(let c=0;c<BC;c++){const [x,y,sz]=hexXY(B,c,r);const d=Math.hypot(e.clientX-x,(e.clientY-y)*1.6);if(d<bd&&d<sz*.6){bd=d;best=[c,r]}}return best}
function bDraw(B){const g=B.ctx;if(!g)return;const W_=B.cw,H_=B.ch;const t=performance.now()/1000;
 const bg=g.createLinearGradient(0,0,0,H_);bg.addColorStop(0,'#0b0820');bg.addColorStop(.6,'#1b1240');bg.addColorStop(1,'#2a1a3a');g.fillStyle=bg;g.fillRect(0,0,W_,H_);
 for(let k=0;k<70;k++){const x=(k*137.5+t*(k%3+1)*4)%W_,y=(k*71.3)%(H_*.55);g.fillStyle=`rgba(255,255,255,${.25+.25*Math.sin(t+k)})`;g.fillRect(x,y,1.6,1.6)}
 const reachSet=B.reach||new Map();const cur=B.cur;
 for(let r=0;r<BR;r++)for(let c=0;c<BC;c++){const [x,y,sz]=hexXY(B,c,r);const k=c+','+r;g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6;g.lineTo(x+Math.cos(a)*sz*.55,y+Math.sin(a)*sz*.55*.62)}g.closePath();
  g.fillStyle=B.ob.has(k)?'rgba(90,70,110,.75)':reachSet.has(k)?'rgba(127,214,255,.28)':((c+r)&1?'rgba(150,130,230,.13)':'rgba(170,150,250,.18)');g.fill();
  g.strokeStyle=B.hov&&B.hov[0]===c&&B.hov[1]===r?'rgba(255,230,160,.95)':'rgba(200,190,255,.25)';g.lineWidth=B.hov&&B.hov[0]===c&&B.hov[1]===r?2:1;g.stroke();
  if(B.ob.has(k)){g.fillStyle='#6b5a80';g.beginPath();g.ellipse(x,y-sz*.12,sz*.26,sz*.2,0,0,7);g.fill();g.fillStyle='#8f7caa';g.beginPath();g.ellipse(x-sz*.06,y-sz*.18,sz*.1,sz*.07,0,0,7);g.fill()}}
 const live=B.st.filter(s=>!s.dead).sort((a,b)=>a.r-b.r);
 for(const s of live){const [x0,y0,sz]=hexXY(B,s.c,s.r);s.dx=s.dx==null?x0:s.dx+(x0-s.dx)*.25;s.dy=s.dy==null?y0:s.dy+(y0-s.dy)*.25;const x=s.dx,y=s.dy;
  if(s===cur){g.fillStyle='rgba(255,230,140,.35)';g.beginPath();g.ellipse(x,y,sz*.5,sz*.3,0,0,7);g.fill()}
  g.fillStyle=s.side?'rgba(255,90,120,.35)':'rgba(90,200,255,.35)';g.beginPath();g.ellipse(x,y+sz*.05,sz*.38,sz*.14,0,0,7);g.fill();
  const im=unitImg(s.u.key?s.u:s.u.id);const bob=Math.sin(t*2.4+s.c+s.r)*sz*.03+(s.u.fly?-sz*.12:0);if(im.complete){g.save();if(s.side)g.translate(x*2,0),g.scale(-1,1);g.drawImage(im,x-sz*.5,y-sz*.92+bob,sz,sz);g.restore()}
  g.font=`700 ${Math.round(sz*.2)}px "Noto Sans KR",sans-serif`;const tx=String(s.n);g.fillStyle=s.side?'#ff7a9a':'#4fb8ff';const bw=g.measureText(tx).width+10;g.fillRect(x+sz*.12,y+sz*.02,bw,sz*.24);g.fillStyle='#fff';g.fillText(tx,x+sz*.12+5,y+sz*.2);
  const hpw=sz*.6;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x-hpw/2,y+sz*.3,hpw,3);g.fillStyle='#8ff0a8';g.fillRect(x-hpw/2,y+sz*.3,hpw*(s.hp/s.u.hp),3)}
 B.fx=B.fx.filter(f=>{f.a=(f.a||0)+.016;if(f.a>1.3)return false;const [x,y,sz]=hexXY(B,f.c,f.r);g.globalAlpha=Math.max(0,1-f.a/1.3);g.font=`900 ${Math.round(sz*.26)}px "Noto Sans KR",sans-serif`;g.fillStyle=f.col;g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=3;g.strokeText(f.t,x-sz*.3,y-sz*.9-f.a*30);g.fillText(f.t,x-sz*.3,y-sz*.9-f.a*30);g.globalAlpha=1;return true});
 const rr=$('#btR');if(rr)rr.textContent=` · ${B.round||1}라운드 · ${cur?`${cur.side?'적':'아군'} ${cur.u.name}(${OH.HZ[cur.u.el]}) 차례`:''} · 일진 ${G.astro.pillar.hz}日`}
function bAnim(B,a,d){return new Promise(res=>{const [x,y]=hexXY(B,d.c,d.r);const ox=a.dx,oy=a.dy;a.dx=ox+(x-ox)*.35;a.dy=oy+(y-oy)*.35;setTimeout(res,Math.max(60,260*G.speedMul))})}
function bHumanTurn(B,s){return new Promise(res=>{B.reach=reach(B,s);const P=G.players[0];const sp_=P.spells.map(i=>SPELLS[i]).filter(x=>(x.type==='atk'||x.type==='buf'));let spellMode=null;
 const bar=$('#btBar');bar.innerHTML=`<span class="sub">${s.u.name} ×${s.n} · 공${s.u.atk} 방${s.u.def} 피해${s.u.d[0]}~${s.u.d[1]} 이동${s.u.spd}${s.u.ranged?' · 원거리':''}${s.u.fly?' · 비행':''} · 마나 ${Math.round(P.mp)}</span>
  <button class="btn sm" id="bW">⏳ 대기</button><button class="btn sm" id="bD">🛡 방어</button>${B.cast[0]?'':`<select id="bS"><option value="">🔮 마법…</option>${sp_.map(x=>`<option value="${x.id}" ${P.mp<x.mp?'disabled':''}>${x.name} (${x.mp})</option>`).join('')}</select>`}
  <button class="btn sm main" id="bA">🤖 자동 전투</button><button class="btn sm" id="bF">🏳 후퇴</button>`;
 const done=a=>{B.reach=null;B.onPick=null;bar.innerHTML='';res(a)};
 $('#bW').onclick=()=>done({t:'wait'});$('#bD').onclick=()=>done({t:'def'});$('#bA').onclick=()=>{B.auto=true;done(aiPick(B,s))};$('#bF').onclick=()=>done('flee');
 const sel=$('#bS');if(sel)sel.onchange=()=>{spellMode=sel.value?SPELLS[+sel.value]:null;if(spellMode&&spellMode.type==='buf'){castInBattle(B,0,spellMode,null);spellMode=null;sel.remove()}else if(spellMode)bLog(B,'🔮 마법을 걸 적 부대를 누르세요')};
 B.onPick=([c,r])=>{const tgt=B.st.find(x=>!x.dead&&x.c===c&&x.r===r);
  if(spellMode&&tgt&&tgt.side===1){castInBattle(B,0,spellMode,tgt);spellMode=null;if(sel)sel.remove();if(!enemiesOf(B,s).length)done({t:'wait'});return}
  if(tgt&&tgt.side===1){if(s.u.ranged&&!adjEnemy(B,s)){done({t:'shoot',e:tgt});return}
   if(hexD([s.c,s.r],[c,r])===1){done({t:'hit',e:tgt});return}
   let best=null,bd=1e9;for(const [k,dd] of B.reach){const [x,y]=k.split(',').map(Number);if(hexD([x,y],[c,r])===1&&dd<bd){bd=dd;best=[x,y]}}if(best)done({t:'hit',e:tgt,to:best});else bLog(B,'닿을 수 없는 거리입니다');return}
  if(B.reach.has(c+','+r))done({t:'move',to:[c,r]})};bDraw(B)})}
