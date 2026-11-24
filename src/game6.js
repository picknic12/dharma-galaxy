// ================= 8대 차크라 각성 · 명상 · 음악 =================
const CHAKRA=[
 {n:'물라다라',k:'뿌리',c:'#ff6b6b',hz:'396',t:'첫 행성을 품었습니다. 뿌리가 내려 흔들리지 않는 바탕이 생깁니다.'},
 {n:'스바디스타나',k:'흐름',c:'#ffa26b',hz:'417',t:'처음으로 통행료가 흘러들었습니다. 주고받음의 흐름이 열립니다.'},
 {n:'마니푸라',k:'의지',c:'#ffd86b',hz:'528',t:'첫 독점을 완성했습니다. 의지가 형태를 얻습니다.'},
 {n:'아나하타',k:'사랑',c:'#7ef0a8',hz:'639',t:'가장 어려운 이에게 손을 내밀었습니다. 경쟁의 우주가 연결의 우주로 바뀝니다. 지고의 사랑은 빼앗지 않고 흐르게 하는 힘입니다.'},
 {n:'비슈다',k:'소리',c:'#6bc8ff',hz:'741',t:'협상이 성사되었습니다. 진실한 말이 길을 엽니다.'},
 {n:'아즈나',k:'통찰',c:'#8f7cff',hz:'852',t:'보이지 않는 것을 관측했습니다. 제3의 눈이 흐름을 읽습니다.'},
 {n:'사하스라라',k:'초월',c:'#d9a6ff',hz:'963',t:'더 깊은 차원에 닿았습니다. 나와 우주의 경계가 옅어집니다.'},
 {n:'소울스타',k:'근원',c:'#fff3c4',hz:'1074',t:'차원 결정이 공명합니다. 여덟 빛이 하나의 근원으로 이어집니다.'}
];
function chakra(p,k){if(p!==0)return;const P=G.players[0];P.ck=P.ck||[];if(P.ck[k])return;P.ck[k]=true;const C=CHAKRA[k];
 log(`🪷 차크라 각성 ${k+1} · ${C.n}(${C.k}) — ${C.t}`,'good');sfx('merge');
 try{if(window.Tone&&CosmicMusic.isPlaying()){const s=new Tone.FMSynth({harmonicity:2.76,envelope:{attack:.01,decay:5,sustain:0,release:5},volume:-12}).toDestination();s.triggerAttackRelease(+C.hz/2,4);setTimeout(()=>s.dispose(),7000)}}catch(e){}
 const o=$('#bloom');o.style.setProperty('--cc',C.c);o.innerHTML=`<div><b>${C.n}</b><span>${C.k} · ${C.hz}Hz</span><p>${esc(C.t)}</p></div>`;o.classList.remove('go','heart');void o.offsetWidth;o.classList.add('go');if(k===3)o.classList.add('heart');
 if(k===3){P.love=true;burst(true);CosmicMusic.setMood('목');showNews('💚 아나하타 각성','지고의 사랑 — 이제부터 내가 받는 통행료가 10% 커지고, 매일 연결의 기운이 함께합니다.')}else burst();
 renderChakra();if(P.ck.filter(Boolean).length===8){log('🌈 여덟 차크라가 모두 깨어났습니다. 게임하는 지금 이 순간이 곧 명상입니다.','sys');gainShard(0)}}
function renderChakra(){const P=G&&G.players[0];if(!P)return;$('#chakra').innerHTML=CHAKRA.map((C,k)=>`<i title="${k+1}. ${C.n} (${C.k})${P.ck&&P.ck[k]?' — 각성':''}" style="--cc:${C.c}" class="${P.ck&&P.ck[k]?'on':''}"></i>`).reverse().join('')}
// 자비(아나하타) — 가장 어려운 상대에게 지원
function canCompassion(){if(!canManage())return null;const H=G.players[0];let t=-1,m=1e9;G.players.forEach((P,q)=>{if(q&&!P.out){const nw=netWorth(q);if(nw<m){m=nw;t=q}}});if(t<0||H.cash<120||G.round-(H.lastGift||-9)<5)return null;return t}
function compassion(){const t=canCompassion();if(t==null)return;const H=G.players[0],T=G.players[t];const a=Math.max(50,Math.round(H.cash*.06));H.cash-=a;T.cash+=a;H.lastGift=G.round;H.karma=(H.karma||0)+1;floatTxt(0,-a);floatTxt(t,a);
 log(`💚 ${H.name}가 가장 어려운 ${T.name}에게 ${fmt(a)}을 보냈습니다. 경쟁 속의 연결.`,'good');chakra(0,3);
 if(T.isAI)log(`💬 ${T.name}: "…계산에 없던 변수입니다. 이 호의를 기억하겠습니다."`,'ai');renderAll()}
// 호흡 가이드 (6회/분: 들숨 4초 · 날숨 6초)
function breath(){const b=$('#breath');if(!b)return;const t=(performance.now()/1000)%10;const s=t<4?t/4:1-(t-4)/6;b.style.setProperty('--s',(.55+.45*s).toFixed(3));b.dataset.ph=t<4?'들숨':'날숨';b.querySelector('span').textContent=t<4?'들숨':'날숨';requestAnimationFrame(breath)}
// 음악 UI
function musicUI(){CosmicMusic.onChange(I=>{$('#track').textContent=`♪ ${I.n}/${CosmicMusic.COUNT} · ${I.genre} · ${I.title} (${OH.HZ[I.el]})`});
 $('#bMusic').onclick=()=>{const on=CosmicMusic.toggle();$('#bMusic').classList.toggle('main',on);if(!on)$('#track').textContent='♪ 음악 꺼짐'};
 $('#bNext').onclick=()=>{if(window.Tone)Tone.start().then(()=>CosmicMusic.next())};
 document.addEventListener('pointerdown',()=>{if(window.Tone&&G&&G.music!==false&&!CosmicMusic.isPlaying()){CosmicMusic.start().then(()=>$('#bMusic').classList.add('main'))}},{once:true})}
$('#bMed').onclick=()=>{document.body.classList.toggle('med');const on=document.body.classList.contains('med');if(G){G.speedMul=on?1.6:1}toast(on?'🧘 명상 모드 — 호흡에 맞춰 천천히 흐릅니다':'명상 모드 끔')};
musicUI();breath();

// ================= 27가지 멀티 엔딩 + 엔딩 시네마틱 =================
const END_FAM=[
 ['금융경제','은하 금융제국의 창조자',S=>S.ratio/3],['과학기술','초지능 문명의 설계자',S=>(S.probes+S.ipo*2+S.robots*1.5)/10],['군사전략','은하의 패왕',S=>(S.mna*2+S.kills*3)/8],
 ['연금술','우주적 연금술의 대가',S=>S.shards/5],['지식','은하 아카식 도서관의 건설자',S=>(S.known+S.know/8)/7],['외교','은하연방의 창립자',S=>S.deals/4],
 ['탐험','미지의 우주를 개척한 자',S=>S.depth/4],['정신문화','보병궁 문명의 창조자',S=>(S.chakra/8+S.ethics/100)/2],['통합','은하문명의 대각성',null]];
function endingOf(){const H=G.players[0],st=G.stats;const S={ratio:netWorth(0)/G.startCash,probes:st.probes,ipo:allOwned(0).filter(([w,i])=>own(w,i).lv===5).length,mna:st.mna,kills:G.players.filter((P,i)=>i&&P.out).length+(st.kills2||0)/3,robots:(H.robots||[]).length,know:H.know||0,shards:H.shards,known:H.known.size,deals:st.deals,depth:st.depth,chakra:(H.ck||[]).filter(Boolean).length,ethics:ethics()};
 const sc=END_FAM.slice(0,8).map(f=>Math.min(1.2,f[2](S)));const minv=Math.min(...sc),best=sc.indexOf(Math.max(...sc));
 let k=best,v=sc[best];if(minv>=.45){k=8;v=minv*1.6}
 const tier=v>=.9?3:v>=.5?2:1;return {fam:END_FAM[k][0],title:END_FAM[k][1],tier,label:['','여명','개화','완성'][tier],no:k*3+tier}}
function endCinematic(won,reason,done){
 const E=endingOf();G.ending=E;
 const lines=reason==='lose'?['모든 것을 잃은 자리에서, 우주는 처음으로 조용해졌습니다','잃음 또한 정보이며, 다음 항해의 별빛입니다','또 하나의 우주가 그대의 선택을 기다리고 있다.']:
 ['제1장 · 문명의 회고 — 작은 기지에서 시작한 항로가 행성들을 잇습니다','제2장 · 창조물들의 귀환 — 함대들이 엔진을 끄고 은하의 중심으로 모입니다','제3장 · 은하문명의 연합 — 경쟁하던 문명들이 서로를 비추는 고리가 됩니다','제4장 · 우주적 관념망의 완성 — 발견한 지식이 빛의 선으로 이어져 생명나무가 됩니다','제5장 · 새로운 우주의 문 — 전쟁에서 화합으로, 모든 평행우주가 하나의 빛으로',
  '처음 그대에게 주어진 것은 작은 별 하나와 가능성뿐이었다.','그러나 가장 위대한 창조는 로봇도, 자본도, 거대한 제국도 아니었다.','그것은 그대 자신이 어떠한 존재로 진화하였는가에 있었다.',`엔딩 ${E.no}/27 · ${E.fam} — 「${E.title}」 ${E.label}`];
 const box=$('#cine');box.innerHTML=lines.map((t,k)=>`<p style="animation-delay:${.5+k*1.9}s">${esc(t)}</p>`).join('')+`<button class="btn" id="skipCine">건너뛰기 <kbd>Esc</kbd></button>`;box.classList.add('go');
 try{if(window.CosmicMusic&&CosmicMusic.isPlaying())CosmicMusic.play(reason==='lose'?3:5)}catch(e){}
 V.cine={t:0,won};let fin=false;const end=()=>{if(fin)return;fin=true;box.classList.remove('go');V.cine=null;done()};
 $('#skipCine').onclick=end;const esc_=e=>{if(e.key==='Escape'){removeEventListener('keydown',esc_);end()}};addEventListener('keydown',esc_);
 setTimeout(end,500+lines.length*1900+2600);
}
// ================= 우주 예언자 =================
async function prophet(){
 const H=G.players[0];const nx=OH.PHASES[(G.phase+1)%5];
 const v=await ask(`🔮 <b>우주 예언자</b>가 별빛 사이에서 나타났습니다.<br>"세 갈래의 별길이 보인다. 어느 길도 정해진 운명은 아니다. 걷는 이가 길을 만든다."<br><span class="sub">다가오는 국면: ${OH.HZ[nx.el]} ${nx.name}</span>`,
  [{t:'💰 축적의 길 (+80억)',v:0},{t:'💚 연결의 길 (윤리 공명↑, 모든 AI +20억)',v:1},{t:'👁 통찰의 길 (관측권 +2)',v:2,main:1}],{auto:()=>2});
 if(v===0)addCash(0,80,'🔮 축적의 길 — 쌓인 것은 언젠가 흘러야 합니다.');
 else if(v===1){H.karma=(H.karma||0)+1;G.players.forEach((P,q)=>{if(q&&!P.out){P.cash+=20;floatTxt(q,20)}});log('🔮 연결의 길 — 나누어진 것은 줄지 않고 공명합니다.','good')}
 else{H.qdice+=2;chakra(0,5);log('🔮 통찰의 길 — 보는 법이 바뀌면 보이는 것이 바뀝니다.','good')}
 log('🔮 예언자의 질문: "그대는 이 선택을 두려움에서 했는가, 앎에서 했는가?"','sys');
}
// ================= 신들의 개입 (드물게, 조용히) · 윤리 공명 =================
const GODS=[
 {n:'포르투나',o:'로마 · 행운의 수레바퀴',f:p=>{const q=G.cur;addCash(q,60,`🎡 포르투나의 수레바퀴가 ${G.players[q].name} 쪽으로 돕니다 (+60억)`)}},
 {n:'락슈미',o:'인도 · 풍요와 자비의 여신',f:()=>{let best=0,bk=-1;G.players.forEach((P,i)=>{if(!P.out&&(P.karma||0)>bk){bk=P.karma||0;best=i}});addCash(best,90,`🪷 락슈미가 가장 자비로운 ${G.players[best].name}에게 풍요를 내립니다 (+90억)`)}},
 {n:'마아트',o:'이집트 · 진리와 정의의 저울',f:()=>{let w=-1,m=1e9;G.players.forEach((P,i)=>{if(!P.out&&(P.karma||0)<m){m=P.karma||0;w=i}});if(m<0){const a=Math.min(G.players[w].cash,80);G.players[w].cash-=a;G.pot+=a;log(`⚖️ 마아트의 저울이 ${G.players[w].name}의 깃털보다 무거운 마음을 잽니다 (−${fmt(a)}, 공적자금으로)`,'sys')}else log('⚖️ 마아트의 저울이 고요합니다. 모든 함대의 마음이 깃털처럼 가볍습니다.','sys')}},
 {n:'칠성신',o:'한국 · 북두칠성의 수명과 복',f:()=>{G.players.forEach(P=>{if(!P.out)P.qdice++});log('✨ 북두칠성이 빛납니다 — 모든 함대에 양자 관측권 +1','sys')}},
 {n:'마고',o:'한국 · 우주를 빚은 창조의 할미',f:()=>{const w=W('W0');const cid=addWorld(Multiverse.sub(w,12,Math.min(4,1+(G.ascended?1:0)),R));log(`🌏 마고 할미가 새 우주를 빚었습니다 — ${W(cid).name} (포털 너머)`,'sys');if(!w.children[12])w.children[12]=cid}},
 {n:'아폴론',o:'그리스 · 빛과 예언의 신',f:()=>{const nx=OH.PHASES[(G.phase+1)%5];log(`☀️ 아폴론의 신탁: 다음 국면은 ${OH.HZ[nx.el]} ${nx.name} — ${nx.desc}`,'sys')}},
 {n:'관세음',o:'동아시아 · 세상의 소리를 듣는 자비',f:()=>{let t=-1,m=1e9;G.players.forEach((P,i)=>{if(!P.out&&P.cash<m){m=P.cash;t=i}});addCash(t,70,`🙏 관세음이 가장 힘든 ${G.players[t].name}의 소리를 듣습니다 (+70억)`)}}
];
function divine(){if(rnd()>.09)return;const g=pick(GODS);showNews(`🌠 신의 개입 · ${g.n}`,g.o);g.f();burst()}
function ethics(){const H=G.players[0];return clamp(50+(H.karma||0)*12,0,100)}
