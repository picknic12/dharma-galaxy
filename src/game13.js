// ================= v0.5 시작 메뉴 · 게임 길이 · 단계적 공개 · 나의 명조(命造) · 튜토리얼 =================
// 게임 길이: 기초 약 1시간 / 중급 약 3시간 / 고급 약 10시간 (무제한 없음). 실제 플레이 시간 제한을 함께 둔다.
const LEN={basic:{n:'기초',rounds:60,min:60,d:'약 1시간 · 화면이 단순하고 공략이 쉽습니다. 판을 거듭할수록 메뉴가 하나씩 열립니다.'},
 mid:{n:'중급',rounds:180,min:180,d:'약 3시간 · 금융·영웅 원정·연구소가 차례로 열립니다.'},
 adv:{n:'고급',rounds:600,min:600,d:'약 10시간 · 모든 체계가 열린 대장정입니다.'}};
function lenOf(r){return r>=600?'adv':r>=180?'mid':'basic'}
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function prefs(){return Object.assign({name:'피크닉',diff:'normal',len:'basic',ai:1,speed:'normal',vol:-6,sfx:true,fx:true,follow:true,log:true},store.get('dagal_cfg',{}))}
function setPref(k,v){const p=prefs();p[k]=v;store.set('dagal_cfg',p);return p}
function unl(){return Object.assign({games:0,tut:0,mid:0,adv:0,stress:0,seen:0},store.get('dagal_unlock',{}))}
// 단계(tier): 0 튜토리얼 · 1 기본 경제 · 2 영웅·몬스터 · 3 연구소 · 4 마법·유물·퀘스트 · 5 전체(세밀한 화면)
const TIER_NAME=['첫걸음','은행과 경제','영웅 원정','AI 연구소','마법과 유물','모든 우주'];
function tierOf(cfg){if(cfg.tutorial)return 0;if(cfg.stress)return 1;const ts=prefs().tierSel;if(ts!=null&&ts!=='auto')return +ts;const u=unl(),lp=Math.max(u.loop||0,Math.floor(u.games/2));if(cfg.quick)return Math.min(2,1+lp);const L=lenOf(cfg.rounds);return L==='basic'?Math.min(4,1+lp):L==='mid'?Math.min(5,2+lp):5}
function T13(){return G&&G.tier!=null?G.tier:5}
// 게임 체계 선택(모듈): 사람마다 넣고 뺄 수 있다. 단계(tier)가 열려 있어야 실제로 켜진다.
const MODS={econ:{n:'🏦 경제·금융',d:'은행·예금·대출·채권·종합주, 경제 배움',need:1},politics:{n:'🏛 정치·외교',d:'은하 의회 표결·정책, 동맹·불가침 조약',need:2},battle:{n:'⚔️ 영웅 원정·전투',d:'몬스터·수호자·공성전·육각 전투',need:2},lab:{n:'🤖 AI 연구소',d:'카드·로봇 설계·포션·아이템',need:3},magic:{n:'✨ 마법·유물·퀘스트',d:'마법 100종·전설 유물·퀘스트',need:4}};
function mods(){return Object.assign({econ:true,politics:true,battle:true,lab:true,magic:true},prefs().mods||{})}
function feat(k){const m=(G&&G.mods)||mods();return T13()>=MODS[k].need&&m[k]!==false}
// 오래 가는 판에서 몬스터·적 성장 곡선이 끝없이 커지지 않도록 하는 체감 라운드
function eR(){const r=G?G.round:1;return r<=60?r:60+(r-60)*.4}
function applyTier(){const t=T13();for(let k=0;k<6;k++)document.body.classList.toggle('t'+k,k===t);document.body.classList.toggle('tlo',t<=1);
 document.querySelectorAll('.tabs button').forEach(b=>{const k={bank:'econ',hero:'battle',lab:'lab',pol:'politics'}[b.dataset.t];b.style.display=!k||feat(k)?'':'none'})}
// ---- 기능 게이트 (낮은 단계에서는 사람도 AI도 숨은 체계를 쓰지 않는다) ----
const gate=(f,k)=>function(){return feat(k)?f.apply(this,arguments):undefined};
spawnBoss=gate(spawnBoss,'battle');bossTick=gate(bossTick,'battle');aiArmy=gate(aiArmy,'battle');aiFinance=gate(aiFinance,'econ');aiLab=gate(aiLab,'lab');aiGear=gate(aiGear,'lab');aiSpells=gate(aiSpells,'magic');aiRelics=gate(aiRelics,'magic');giveRelic=gate(giveRelic,'magic');
spawnMonster=gate(spawnMonster,'battle');
{const _sg=siege;siege=async function(){if(!feat('battle'))return 1;return _sg.apply(this,arguments)}}
{const _b=burst;burst=function(big){if(!prefs().fx)return;return _b(big)}}

// ---- 시작(startGame) 확장: 길이·시간 제한·단계 ----
{const _st=startGame;startGame=function(cfg){
 cfg=Object.assign({},cfg);if(!cfg.rounds||cfg.rounds<1)cfg.rounds=60;
 const L=cfg.tutorial?{min:15}:cfg.stress?{min:cfg.stressMin||15}:cfg.quick?{min:15}:LEN[lenOf(cfg.rounds)];
 _st(cfg);G.tier=tierOf(cfg);G.mods=cfg.tutorial?{econ:false,politics:false,battle:false,lab:false,magic:false}:cfg.stress?{econ:true,politics:false,battle:false,lab:false,magic:false}:mods();G.tutorial=!!cfg.tutorial;G.quick=!!cfg.quick;G.stress=!!cfg.stress;G.timeLimit=L.min*60000;G.playMs=0;G.timeUp=false;
 const P=prefs();G.sound=P.sfx!==false;if(window.V)V.follow=P.follow!==false;
 if(G.tier<1)G.players.forEach(p=>p.qdice=0);
 if(!feat('battle')){G.monsters=[];renderMonsters()}
 applyTier();closeTitle();renderAll();
 if(G.tutorial)setTimeout(()=>coach('hello'),900);
 const u=unl();if(G.tier>u.seen&&!G.tutorial&&!G.stress){u.seen=G.tier;store.set('dagal_unlock',u);setTimeout(()=>showNews(`🔓 새 단계 열림 — ${TIER_NAME[G.tier]}`,tierNews(G.tier)),1500)}
}}
function tierNews(t){return['','🏦 금융 탭과 📘 경제 배움이 열렸습니다. 금리·예금·대출을 익혀 보세요.','🛡 영웅 탭이 열렸습니다. 몬스터와 수호자를 만나 병력을 이끌어 보세요.','🤖 AI 연구소가 열렸습니다. 카드로 로봇을 설계하세요.','✨ 마법·전설 유물·퀘스트가 열렸습니다.','🌌 모든 우주가 열렸습니다. 화면도 가장 세밀해집니다.'][t]||''}

// ---- 실제 플레이 시간 측정 (탭이 보일 때, 시작 메뉴가 닫혀 있을 때만) ----
setInterval(()=>{if(!G||G.over||document.hidden||G.speedMul<.1||titleOpen())return;G.playMs=(G.playMs||0)+1000;
 if(G.timeLimit){const left=G.timeLimit-G.playMs;
  if(left===5*60000)showNews('⏳ 남은 시간 5분','이번 날이 끝나면 곧 항해가 마무리됩니다. 마지막 판단을 준비하세요.');
  if(left<=0&&!G.timeUp){G.timeUp=true;G.maxRounds=G.round;log('⏳ 제한 시간이 다 되었습니다 — 이번 날을 마치면 항해가 끝납니다.','sys')}}
 if(G.playMs%5000===0)renderHeader()},1000);
{const _rh=renderHeader;renderHeader=function(){_rh();if(!G)return;
 if(G.tier>=1&&typeof depRate==='function'){const h=$('#hPhase');if(h&&!h.querySelector('.rate'))h.insertAdjacentHTML('beforeend',` <span class="rate" title="지금 국면의 예금 금리 (대출은 +1.8%p)">· 예금 ${(depRate()*100).toFixed(1)}%</span>`)}
 let c=$('#hTime');if(!c){$('#hPot').insertAdjacentHTML('afterend','<span class="chip" id="hTime" title="남은 플레이 시간"></span>');c=$('#hTime')}
 const left=Math.max(0,(G.timeLimit||0)-(G.playMs||0));c.textContent=G.timeLimit?`⏳ ${Math.floor(left/3600000)?Math.floor(left/3600000)+'시간 ':''}${Math.floor(left/60000)%60}분`:'';}}

// ================= 시작 메뉴 (2026 화면) =================
function titleOpen(){const t=$('#title');return !!(t&&t.classList.contains('show'))}
function closeTitle(){const t=$('#title');if(t)t.classList.remove('show')}
let tSel=0,tItems=[];
function hasSave(){try{return !!localStorage.getItem('dagal_save')}catch(e){return false}}
function menuItems(){const u=unl(),live=G&&!G.over;
 return [
 {k:'tut',i:'📘',t:'튜토리얼',s:'처음이라면 여기부터! 별이가 하나씩 알려 줘요 (약 15분)',go:startTutorial},
 live&&{k:'cont',i:'▶',t:'계속하기',s:'지금 하던 항해로 돌아갑니다',go:closeTitle},
 !live&&hasSave()&&{k:'cont2',i:'▶',t:'이어하기',s:'마지막으로 저장한 항해를 불러옵니다',go:()=>{closeTitle();loadGame();setTimeout(()=>{if(G){G.tier=G.tier??5;applyTier()}},300)}},
 {k:'new',i:'🚀',t:'새 게임',s:`정규 항해 · ${LEN[prefs().len].n} (${LEN[prefs().len].d.split(' · ')[0]})`,go:()=>{closeTitle();setup()}},
 {k:'quick',i:'☕',t:'가벼운 한 판',s:'15분 · AI 한 명 · 쉬운 규칙. 심심풀이로 부담 없이',go:startQuick},
 {k:'stage',i:'🗺',t:'스테이지',s:'루프마다 여섯 스테이지 · 목표 하나 · 약 15분',go:()=>pane('stage')},
 {k:'stress',i:'🌿',t:'오늘의 마음 쉼',s:'일일 스트레스 풀기 판 — 지금 마음 상태에 맞춰 음악·소리·게임이 부드러워집니다',go:()=>pane('stress')},
 {k:'load',i:'📂',t:'불러오기',s:hasSave()?'이 브라우저에 저장된 항해':'저장된 항해가 아직 없습니다',dis:!hasSave(),go:()=>{closeTitle();loadGame();setTimeout(()=>{if(G){G.tier=G.tier??5;applyTier()}},300)}},
 {k:'diff',i:'⚔️',t:'난이도 · 게임 길이',s:'AI 난이도와 기초 1시간 / 중급 3시간 / 고급 10시간',go:()=>pane('diff')},
 {k:'set',i:'⚙️',t:'환경 설정',s:'음악·효과음·속도·행동 기록 · 나의 명조(사주팔자·네이탈 차트)',go:()=>pane('set')},
 {k:'prof',i:'🧭',t:'나의 성향',s:u.games>=1?'8대 차크라 · 9대 에너지체 관찰 리포트':'🔒 한 판을 마치면 열립니다',lock:u.games<1,go:()=>pane('prof')},
 {k:'hall',i:'🏆',t:'명예의 전당',s:u.games>=1?'지난 항해의 기록':'🔒 한 판을 마치면 열립니다',lock:u.games<1,go:()=>pane('hall')},
 {k:'rules',i:'📖',t:'규칙서',s:'게임 규칙 안내서',go:()=>{rules()}},
 {k:'guide',i:'📕',t:'공략서',s:u.games>=2?'기초에서 고급까지 (PDF)':'🔒 두 판을 마치면 열립니다',lock:u.games<2,go:()=>window.open('https://picknic12.github.io/dharma-galaxy/guide.pdf','_blank','noopener')},
 {k:'cred',i:'✨',t:'제작진',s:'만든 사람들과 오픈소스',go:()=>pane('cred')}].filter(Boolean)}
function openTitle(){let t=$('#title');
 if(!t){document.body.insertAdjacentHTML('beforeend',`<div id="title"><div class="tBg"><i class="neb n1"></i><i class="neb n2"></i><i class="neb n3"></i><div class="tStars"></div><div class="tRing"></div></div>
 <div class="tWrap"><div class="tLeft"><div class="tLogo"><div class="tMark">☸</div><div><h1>다르마 갤럭시 <span class="yr">2027</span></h1><div class="tSub">DHARMA GALAXY 2027 · 다갤 · v0.5</div></div></div><div class="tTag">은하문명의 창조자들 — 인간 대 AI 다중우주 경제 전략 RPG</div>
 <nav id="tMenu" role="menu"></nav><div class="tFoot">↑↓ 고르기 · Enter 선택 · Esc 뒤로<br>© 피크닉 신영호 · 임지혜 (이스턴드래곤 출판사)</div></div><div class="tRight" id="tPane"></div></div></div>`);t=$('#title');
  const st=t.querySelector('.tStars');let h='';const r=PicnicRng.create(77);for(let k=0;k<140;k++)h+=`<i style="left:${r.next()*100}%;top:${r.next()*100}%;--d:${(2+r.next()*5).toFixed(1)}s;--s:${(1+r.next()*2.2).toFixed(1)}px"></i>`;st.innerHTML=h}
 t.classList.add('show');tSel=0;drawMenu();pane('home')}
function drawMenu(){tItems=menuItems();if(tSel>=tItems.length)tSel=0;
 $('#tMenu').innerHTML=tItems.map((m,k)=>`<button class="tItem${k===tSel?' on':''}${m.lock||m.dis?' lock':''}" data-k="${k}" role="menuitem"><span class="ti">${m.i}</span><span class="tt"><b>${m.t}</b><small>${m.s}</small></span></button>`).join('');
 $('#tMenu').querySelectorAll('.tItem').forEach(b=>{b.onmouseenter=()=>{tSel=+b.dataset.k;mark()};b.onclick=()=>{tSel=+b.dataset.k;mark();choose()}})}
function mark(){$('#tMenu').querySelectorAll('.tItem').forEach((b,k)=>b.classList.toggle('on',k===tSel))}
function choose(){const m=tItems[tSel];if(!m)return;if(m.lock){toast('🔒 '+m.s.replace('🔒 ',''));return}if(m.dis){toast(m.s);return}try{sfx('step')}catch(e){}m.go()}
addEventListener('keydown',e=>{if(!titleOpen())return;if(e.target.matches('input,select,textarea'))return;
 if($('#modal').classList.contains('show'))return;
 e.stopImmediatePropagation();
 if(e.key==='ArrowDown'){tSel=(tSel+1)%tItems.length;mark();e.preventDefault()}else if(e.key==='ArrowUp'){tSel=(tSel-1+tItems.length)%tItems.length;mark();e.preventDefault()}
 else if(e.key==='Enter'){e.preventDefault();choose()}else if(e.key==='Escape'){pane('home')}},true);
function paneHome(){const now=new Date(),dp=AC.dayPillar(now),u=unl(),b=birthLoad();let mp='';try{mp=AC.moonPhase(now).name||''}catch(e){}
 const tr=window.CosmicMusic&&CosmicMusic.isPlaying()?'♪ 우주 음악이 흐르는 중':'♪ 화면을 누르면 우주 음악이 흐릅니다';
 return `<div class="tCard hero"><div class="tBig">${dp.hz}日</div><div>오늘의 일진 <b>${dp.ko}</b> · ${OH.HZ[dp.stemEl]}(${dp.stemEl}) 기운${mp?' · '+mp:''}</div><div class="sub">${tr}</div></div>
 ${b&&b.saju&&b.saju.ok?`<div class="tCard"><b>🪪 ${esc(b.name||'나')}의 일간</b> ${b.saju.dayMaster.hz}(${b.saju.dayMaster.ko}) · ${OH.HZ[b.saju.dayMaster.el]}(${b.saju.dayMaster.el}) — 오늘의 일진 ${dp.hz}과(와) 만나는 흐름이 게임에 반영됩니다.</div>`:`<div class="tCard"><b>🪪 나의 명조</b> — 환경 설정에서 생년월일시를 넣으면 사주팔자와 네이탈 차트를 저장하고, 게임 속 일간 기운으로 씁니다.</div>`}
 <div class="tCard"><b>🧭 나의 여정</b><div class="tSteps">${TIER_NAME.map((n,k)=>`<span class="${k<=Math.min(5,1+Math.floor(u.games/2))||(k===0)?'on':''}">${k}. ${n}</span>`).join('')}</div><div class="sub">마친 판 ${u.games}회 · 튜토리얼 ${u.tut?'완료':'아직'} · 마음 쉼 ${u.stress}회. 판을 거듭할수록 화면이 세밀해지고 숨은 메뉴가 하나씩 열립니다.</div></div>
 <div class="tCard sub">이 게임은 미래를 맞히는 도구가 아니라, 내가 어떻게 판단하고 움직이는지 비춰 보는 거울입니다. 왼쪽 뇌(계산)와 오른쪽 뇌(직관)가 용과 호랑이처럼 함께 움직일 때 차크라가 차례로 깨어납니다.</div>`}
function pane(k){const p=$('#tPane');if(!p)return;let h='';
 if(k==='home')h=paneHome();
 else if(k==='diff'){const P=prefs();h=`<h2>⚔️ 난이도 · 게임 길이</h2>
  <label>게임 길이</label><div class="seg" id="pLen">${Object.entries(LEN).map(([key,L])=>{const lock=key==='mid'&&unl().games<1&&!unl().tut||key==='adv'&&unl().games<3;return `<button class="btn ${P.len===key?'main':''}" data-v="${key}" ${lock?'disabled title="🔒 '+(key==='mid'?'튜토리얼이나 한 판을 마치면':'세 판을 마치면')+' 열립니다"':''}>${lock?'🔒 ':''}${L.n}<small>${L.d.split(' · ')[0]}</small></button>`}).join('')}</div><div class="sub" id="pLenD">${LEN[P.len].d}</div>
  <label>AI 난이도</label><div class="seg" id="pDiff">${[['easy','쉬움'],['normal','보통'],['hard','어려움']].map(([v,n])=>`<button class="btn ${P.diff===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
  <label>AI 상대 수</label><div class="seg" id="pAi">${[1,2,3,4,5,6,7].map(n=>`<button class="btn sm ${P.ai==n?'main':''}" data-v="${n}">${n}</button>`).join('')}</div>
  <p class="sub">기초는 1명과의 1:1 대결을 권합니다. 고급 판에서도 언제든 💾 저장하고 이어서 할 수 있습니다.</p>`}
 else if(k==='set'){const P=prefs();h=`<h2>⚙️ 환경 설정</h2>
  <label>🎵 음악 볼륨 <span id="vOut">${P.vol} dB</span></label><input type="range" id="pVol" min="-36" max="0" step="2" value="${P.vol}">
  <div class="tgl"><label><input type="checkbox" id="pSfx" ${P.sfx?'checked':''}> 🔊 효과음</label><label><input type="checkbox" id="pFx" ${P.fx?'checked':''}> ✨ 화려한 효과(꽃가루·빛)</label><label><input type="checkbox" id="pFollow" ${P.follow?'checked':''}> 🎥 카메라 따라가기</label></div>
  <label>⚔️ AI 난이도 <span class="sub">(게임 중에도 바로 바뀝니다)</span></label><div class="seg" id="pDiff2">${[['easy','쉬움'],['normal','보통'],['hard','어려움']].map(([v,n])=>`<button class="btn ${P.diff===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
  <label>🖥 화면 복잡도</label><div class="seg" id="pTier">${[['auto','자동 (추천)']].concat(TIER_NAME.map((n,k)=>[String(k),k+'. '+n])).map(([v,n])=>`<button class="btn sm ${String(P.tierSel??'auto')===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
  <div class="sub">자동이면 처음엔 단순하게 시작해, 판을 거듭할수록 화면이 세밀해지고 숨은 메뉴가 하나씩 열립니다.</div>
  <label>🧩 넣을 게임 체계</label><div class="tgl mods">${Object.entries(MODS).map(([k,M])=>`<label title="${M.d}"><input type="checkbox" data-m="${k}" ${mods()[k]?'checked':''}> ${M.n} <small>${M.d}</small></label>`).join('')}</div>
  <label>⏩ 진행 속도</label><div class="seg" id="pSpeed">${[['slow','느리게'],['normal','보통'],['fast','빠르게']].map(([v,n])=>`<button class="btn ${P.speed===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
  <div class="tCard"><b>📝 행동 기록</b> <label style="display:inline"><input type="checkbox" id="pLog" ${P.log?'checked':''}> 기록하기</label>
  <div class="sub">마우스·키보드 조작, 고른 선택지, 판단에 걸린 시간, 매일의 자산·차크라 흐름을 <b>이 브라우저 안에만</b> 저장합니다. 밖으로 보내지 않으며, '나의 성향' 리포트를 만드는 데만 씁니다. 언제든 끄거나 지울 수 있습니다.</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn sm" id="pExpJ">⬇ JSON 내보내기</button><button class="btn sm" id="pExpC">⬇ CSV 내보내기</button><button class="btn sm" id="pClr">🗑 기록 지우기</button><span class="sub" id="pLogN"></span></div></div>
  <div class="tCard"><b>🪪 나의 명조(命造)</b><div class="sub">생년월일시를 양력·음력과 남녀로 넣으면 사주팔자·대운과 네이탈 차트를 계산해 저장합니다.</div><button class="btn main" id="pBirth" style="margin-top:6px">명조 입력·보기</button></div>`}
 else if(k==='birth')h=birthForm();
 else if(k==='hall')h=hallHTML();
 else if(k==='stage')h=typeof stageHTML==='function'?stageHTML():'';
 else if(k==='prof')h=typeof profileHTML==='function'?profileHTML():'';
 else if(k==='stress')h=typeof stressHTML==='function'?stressHTML():'';
 else if(k==='cred')h=`<h2>✨ 제작진</h2><div class="tCard"><b>기획·세계관·글</b><br>피크닉 신영호 · 임지혜 (이스턴드래곤 출판사)</div>
  <div class="tCard"><b>재사용 모듈</b><br>사주RPG 라이브러리 — 효과음, 등급, 오행 순환, 천문 계산 코어(태양·달·행성), 네이탈 차트 엔진</div>
  <div class="tCard"><b>오픈소스</b><br>three.js (MIT) · anime.js (MIT) · canvas-confetti (ISC) · Tone.js (MIT) · Astronomy Engine (MIT, 절기 시각) · korean-lunar-calendar (MIT, 한국천문연구원 기준 음양력)</div>
  <div class="tCard sub">모든 음악은 실시간 생성(777곡), 모든 그림은 코드로 그린 독자 창작입니다. 기존 게임의 이름·인물·그림·음악은 쓰지 않았습니다.</div>`;
 p.innerHTML=`<div class="tPaneIn">${h}${k!=='home'?'<button class="btn" id="tBack" style="margin-top:12px">← 뒤로 <kbd>Esc</kbd></button>':''}</div>`;
 const bk=$('#tBack');if(bk)bk.onclick=()=>pane(k==='birth'?'set':'home');
 if(k==='diff'){[['pLen','len'],['pDiff','diff'],['pAi','ai']].forEach(([id,key])=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{setPref(key,key==='ai'?+b.dataset.v:b.dataset.v);pane('diff');drawMenu()}))}
 if(k==='set'){const P=prefs();
  $('#pVol').oninput=e=>{const v=+e.target.value;setPref('vol',v);$('#vOut').textContent=v+' dB';applyVol()};
  $('#pSfx').onchange=e=>{setPref('sfx',e.target.checked);if(G)G.sound=e.target.checked};$('#pFx').onchange=e=>setPref('fx',e.target.checked);$('#pFollow').onchange=e=>{setPref('follow',e.target.checked);if(window.V)V.follow=e.target.checked};
  $('#pLog').onchange=e=>setPref('log',e.target.checked);
  $('#pSpeed').querySelectorAll('button').forEach(b=>b.onclick=()=>{setPref('speed',b.dataset.v);if(G&&!G.over)G.speedMul={slow:1.5,normal:1,fast:.45}[b.dataset.v];pane('set')});
  $('#pDiff2').querySelectorAll('button').forEach(b=>b.onclick=()=>{setPref('diff',b.dataset.v);if(G&&!G.over){G.diff=b.dataset.v;G.cfg.diff=b.dataset.v}toast('AI 난이도: '+b.textContent);pane('set')});
  $('#pTier').querySelectorAll('button').forEach(b=>b.onclick=()=>{setPref('tierSel',b.dataset.v);if(G&&!G.over&&!G.tutorial){G.tier=tierOf(G.cfg);applyTier();renderAll()}pane('set')});
  document.querySelectorAll('.mods input').forEach(c=>c.onchange=()=>{const m=mods();m[c.dataset.m]=c.checked;setPref('mods',m);if(G&&!G.over&&!G.tutorial&&!G.stress){G.mods=Object.assign({},m);if(!feat('battle')){G.monsters=[];renderMonsters()}applyTier();renderAll()}});
  $('#pExpJ').onclick=()=>window.logExport&&logExport('json');$('#pExpC').onclick=()=>window.logExport&&logExport('csv');$('#pClr').onclick=()=>window.logClear&&logClear().then(()=>pane('set'));
  if(window.logCount)logCount().then(n=>{const o=$('#pLogN');if(o)o.textContent=`저장된 기록 ${n.toLocaleString()}건`});
  $('#pBirth').onclick=()=>pane('birth')}
 if(k==='birth')bindBirth();
 if(k==='stress'&&typeof bindStress==='function')bindStress();
 if(k==='stage'&&typeof bindStage==='function')bindStage();
 if(k==='prof'&&typeof bindProfile==='function')bindProfile();
}
function applyVol(){try{if(window.Tone)Tone.Destination.volume.value=prefs().vol}catch(e){}}
setTimeout(applyVol,500);document.addEventListener('pointerdown',()=>applyVol(),{once:true});

// ---- 설정 화면 보강: 정규 게임 설정 모달에 길이 선택·명조 연결·뒤로 ----
{const _su=setup;setup=function(){_su();const P=prefs(),b=birthLoad();
 const sel=$('#sRounds');if(sel){sel.innerHTML=Object.entries(LEN).map(([key,L])=>{const lock=key==='mid'&&unl().games<1&&!unl().tut||key==='adv'&&unl().games<3;return `<option value="${L.rounds}" ${lock?'disabled':''}>${lock?'🔒 ':''}${L.n} · ${L.d.split(' · ')[0]} (${L.rounds}일)</option>`}).join('');sel.value=String(LEN[P.len].rounds);if(sel.selectedOptions[0]&&sel.selectedOptions[0].disabled)sel.value='60';sel.onchange=()=>setPref('len',lenOf(+sel.value))}
 const lab=sel&&sel.previousElementSibling;if(lab)lab.textContent='게임 길이 (무제한 없음)';
 if(!(G&&G.cfg)){$('#sDiff').value=P.diff;$('#sSpeed').value=P.speed;const ai=$('#sAi');if(ai){ai.value=String(P.ai);ai.onchange&&ai.onchange()}$('#sName').value=(b&&b.name)||P.name}
 if(b&&b.saju&&b.saju.ok&&!$('#sBirth').value){const s=b.saju.solar;$('#sBirth').value=`${s.y}-${String(s.m).padStart(2,'0')}-${String(s.d).padStart(2,'0')}`;$('#sBirth').dispatchEvent(new Event('input'))}
 const row=$('#go')&&$('#go').parentElement;if(row&&!(G&&!G.over)){row.insertAdjacentHTML('beforeend','<button class="btn" id="toTitle">← 시작 메뉴</button>');$('#toTitle').onclick=()=>{delete $('#dlg').dataset.lock;closeModal();openTitle()}}
 const go=$('#go');if(go){const _g=go.onclick;go.onclick=()=>{setPref('name',$('#sName').value.trim()||'지휘관');setPref('diff',$('#sDiff').value);setPref('ai',+$('#sAi').value);_g()}}
}}

// ================= 나의 명조(命造): 사주팔자 · 대운 · 네이탈 차트 =================
function birthLoad(){return store.get('dagal_birth',null)}
const CITY=[['서울',37.5665,126.978],['부산',35.1796,129.0756],['대구',35.8714,128.6014],['인천',37.4563,126.7052],['광주',35.1595,126.8526],['대전',36.3504,127.3845],['울산',35.5384,129.3114],['수원',37.2636,127.0286],['청주',36.6424,127.489],['전주',35.8242,127.148],['강릉',37.7519,128.8761],['제주',33.4996,126.5312]];
function birthForm(){const b=birthLoad()||{};const i=b.input||{cal:'solar',y:'',m:'',d:'',hh:'',mm:'',gender:'M',city:0,tu:false,leap:false};
 return `<h2>🪪 나의 명조(命造)</h2><div class="sub">사주는 모두 양력 기준으로 세웁니다. 음력으로 넣으면 한국천문연구원 기준 음양력 표로 양력으로 바꾼 뒤 계산합니다.</div>
 <div class="grid2"><div><label>이름</label><input id="bName" value="${esc(b.name||prefs().name)}" maxlength="10"></div>
 <div><label>성별 (대운 순행·역행에 씁니다)</label><div class="seg" id="bG"><button class="btn ${i.gender!=='F'?'main':''}" data-v="M">남(男)</button><button class="btn ${i.gender==='F'?'main':''}" data-v="F">여(女)</button></div></div>
 <div><label>달력</label><div class="seg" id="bCal"><button class="btn ${i.cal!=='lunar'?'main':''}" data-v="solar">양력(陽曆)</button><button class="btn ${i.cal==='lunar'?'main':''}" data-v="lunar">음력(陰曆)</button></div><label style="display:${i.cal==='lunar'?'block':'none'}" id="bLeapL"><input type="checkbox" id="bLeap" ${i.leap?'checked':''}> 윤달(閏月)</label></div>
 <div><label>생년월일</label><div style="display:flex;gap:4px"><input id="bY" inputmode="numeric" placeholder="1970" value="${i.y}" style="width:38%"><input id="bM" inputmode="numeric" placeholder="월" value="${i.m}" style="width:28%"><input id="bD" inputmode="numeric" placeholder="일" value="${i.d}" style="width:28%"></div></div>
 <div><label>태어난 시각 (한국 표준시)</label><input id="bT" type="time" value="${i.hh!==''&&i.hh!=null?String(i.hh).padStart(2,'0')+':'+String(i.mm||0).padStart(2,'0'):''}"><label><input type="checkbox" id="bTu" ${i.tu?'checked':''}> 시각 모름</label></div>
 <div><label>태어난 곳 (네이탈 차트용)</label><select id="bCity">${CITY.map((c,k)=>`<option value="${k}" ${k==i.city?'selected':''}>${c[0]}</option>`).join('')}</select></div></div>
 <div style="display:flex;gap:8px;margin-top:10px"><button class="btn main" id="biSave">계산하고 저장</button>${b.saju?'<button class="btn" id="bDel">지우기</button>':''}</div>
 <div id="bOut">${b.saju&&b.saju.ok?chartHTML(b):''}</div>`}
function bindBirth(){let cal=(birthLoad()||{input:{}}).input.cal||'solar',gen=(birthLoad()||{input:{}}).input.gender||'M';
 $('#bCal').querySelectorAll('button').forEach(x=>x.onclick=()=>{cal=x.dataset.v;$('#bCal').querySelectorAll('button').forEach(y=>y.classList.toggle('main',y===x));$('#bLeapL').style.display=cal==='lunar'?'block':'none'});
 $('#bG').querySelectorAll('button').forEach(x=>x.onclick=()=>{gen=x.dataset.v;$('#bG').querySelectorAll('button').forEach(y=>y.classList.toggle('main',y===x))});
 const d=$('#bDel');if(d)d.onclick=()=>{localStorage.removeItem('dagal_birth');pane('birth')};
 $('#biSave').onclick=()=>{const t=$('#bT').value,tu=$('#bTu').checked||!t;const inp={cal,y:+$('#bY').value,m:+$('#bM').value,d:+$('#bD').value,hh:tu?'':+t.split(':')[0],mm:tu?'':+t.split(':')[1],gender:gen,city:+$('#bCity').value,tu,leap:cal==='lunar'&&$('#bLeap').checked};
  if(!inp.y||!inp.m||!inp.d){$('#bOut').innerHTML='<p class="bad">생년월일을 모두 넣어 주세요.</p>';return}
  const s=SajuChart.compute({cal:inp.cal,y:inp.y,m:inp.m,d:inp.d,leap:inp.leap,hh:inp.hh,mm:inp.mm,timeUnknown:tu,gender:inp.gender});
  if(!s.ok){$('#bOut').innerHTML=`<p class="bad">${esc(s.error)}</p>`;return}
  const c=CITY[inp.city]||CITY[0];let n=null;try{n=NatalChartEngine.compute({year:s.solar.y,month:s.solar.m,day:s.solar.d,hour:tu?undefined:inp.hh,minute:tu?undefined:inp.mm,tzOffsetHours:9,lat:c[1],lon:c[2],houseSystem:'placidus'})}catch(e){}
  const nat=n&&n.ok?{asc:n.ascendant.sign.kr,mc:n.midheaven.sign.kr,bodies:n.bodies.map(x=>({kr:x.kr,glyph:x.glyph,sign:x.sign.kr,sg:x.sign.glyph,deg:x.sign.degStr,house:x.house,r:x.retrograde})),el:n.elementBalance,notice:n.notice||''}:null;
  const rec={name:$('#bName').value.trim()||'나',input:inp,saju:s,natal:nat,city:c[0],savedAt:new Date().toISOString()};store.set('dagal_birth',rec);
  $('#bOut').innerHTML=chartHTML(rec);toast('🪪 명조를 저장했습니다 (이 브라우저)');if(window.logEvent)logEvent('birth',{saved:1})}}
const ELC={목:'#c9f2d4',화:'#ffd3cc',토:'#f3e5bf',금:'#e9edf3',수:'#cfe0ff'};
function chartHTML(b){const s=b.saju,P=s.pillars,i=b.input;
 const col=(lab,p)=>p?`<div class="pc"><div class="pl">${lab}</div><div class="pt">${p.ten||''}</div><div class="ps" style="background:${ELC[p.sEl]}">${SajuChart.STEM[p.s]}<small>${SajuChart.STEM_KO[p.s]}·${p.sEl}(${SajuChart.EL_HZ[p.sEl]})</small></div><div class="ps" style="background:${ELC[p.bEl]}">${SajuChart.BRANCH[p.b]}<small>${SajuChart.BRANCH_KO[p.b]}·${p.bEl}(${SajuChart.EL_HZ[p.bEl]})</small></div><div class="pt">${p.bten||''}</div></div>`:`<div class="pc"><div class="pl">${lab}</div><div class="pt">&nbsp;</div><div class="ps unk">?<small>시각 모름</small></div><div class="ps unk">?<small>&nbsp;</small></div><div class="pt">&nbsp;</div></div>`;
 const dw=s.daewoon.list.slice().reverse();
 const sol=s.solar,inp=i.cal==='lunar'?`음력 ${i.y}.${i.m}.${i.d}${i.leap?' (윤달)':''} → `:'';
 return `<div class="saju"><div class="sajuHead"><b>${esc(b.name)}</b> · ${s.gender==='F'?'여(女)':'남(男)'} · ${inp}양력 ${sol.y}.${sol.m}.${sol.d} ${s.timeUnknown?'(시각 모름)':String(sol.hh).padStart(2,'0')+':'+String(sol.mm).padStart(2,'0')} · ${esc(b.city||'')}</div>
 <div class="pillars">${col('시주(時柱)',P.hour)}${col('일주(日柱)',P.day)}${col('월주(月柱)',P.month)}${col('년주(年柱)',P.year)}</div>
 <div class="sub">일간(日干) ${s.dayMaster.hz}(${s.dayMaster.ko}) · ${s.dayMaster.el}(${SajuChart.EL_HZ[s.dayMaster.el]}) ${s.dayMaster.yang?'양(陽)':'음(陰)'} · 띠 ${s.animal} · 월령 ${s.monthTerm} · 입춘 ${s.ipchun}</div>
 <div class="sub">오행 분포 ${Object.entries(s.counts).map(([e,n])=>`${e}(${SajuChart.EL_HZ[e]}) ${n}`).join(' · ')}</div>
 <div class="dwHead">대운(大運) — ${s.daewoon.forward?'순행(順行)':'역행(逆行)'} · 대운수 ${s.daewoon.su} <span class="sub">(${s.daewoon.basis})</span></div>
 <div class="dw">${dw.map(p=>`<div class="dc"><div class="da">${p.age}</div><div class="ps sm" style="background:${ELC[p.sEl]}">${SajuChart.STEM[p.s]}<small>${SajuChart.STEM_KO[p.s]}</small></div><div class="ps sm" style="background:${ELC[p.bEl]}">${SajuChart.BRANCH[p.b]}<small>${SajuChart.BRANCH_KO[p.b]}</small></div><div class="pt">${p.ten.split('(')[0]}</div></div>`).join('')}</div>
 <div class="sub">오른쪽이 첫 대운이고, 왼쪽으로 갈수록 나이가 많아집니다.${s.notes.length?' · '+s.notes.join(' · '):''}</div>
 ${b.natal?`<div class="dwHead">네이탈 차트 — 상승궁(ASC) ${b.natal.asc} · 천정(MC) ${b.natal.mc}</div><div class="natal">${b.natal.bodies.map(x=>`<span>${x.glyph} ${x.kr} <b>${x.sg} ${x.sign}</b> ${x.deg}${x.house?` · ${x.house}하우스`:''}${x.r?' ℞':''}</span>`).join('')}</div><div class="sub">원소 균형 — 불 ${b.natal.el.fire} · 흙 ${b.natal.el.earth} · 공기 ${b.natal.el.air} · 물 ${b.natal.el.water}${b.natal.notice?' · '+esc(b.natal.notice):''}</div>`:''}
 <p class="sub">명조는 정해진 운명이 아니라 에너지가 작동하는 구조의 지도입니다. 같은 구조도 의식이 깨어 있는 정도에 따라 다르게 작동합니다.</p></div>`}

// ================= 명예의 전당 =================
function hallHTML(){const H=store.get('dagal_hall',[]);if(!H.length)return '<h2>🏆 명예의 전당</h2><p class="sub">아직 마친 항해가 없습니다.</p>';
 const best=H.slice().sort((a,b)=>b.nw-a.nw).slice(0,10);
 return `<h2>🏆 명예의 전당</h2><table class="rk"><tr><th>#</th><th>날짜</th><th>길이</th><th>지휘관</th><th>순위</th><th>등급</th><th class="n">순자산</th><th>차크라</th><th>엔딩</th></tr>${best.map((r,k)=>`<tr><td>${k+1}</td><td>${r.date}</td><td>${r.len}</td><td>${esc(r.name)}</td><td>${r.rank}/${r.total}</td><td>${r.grade}</td><td class="n">${fmt(r.nw)}</td><td>${r.ck}/8</td><td>${esc(r.ending||'')}</td></tr>`).join('')}</table><p class="sub">최근 ${H.length}판 기록 중 순자산 상위 10판</p>`}
{const _f=finish;finish=function(reason,who_){if(G.over)return _f(reason,who_);const t0=G.tutorial,st=G.stress;_f(reason,who_);
 try{const H=G.players[0],rows=G.players.map((P,i)=>({i,nw:P.out?0:netWorth(i)})).sort((a,b)=>b.nw-a.nw);const rank=rows.findIndex(r=>r.i===0)+1;
  const ev=ScoreGrade.evaluate({netWorth:netWorth(0),startCash:G.startCash,rank,total:rows.length,bankrupt:H.out});
  const u=unl();if(t0)u.tut=1;else if(st)u.stress++;else{u.games++;if(lenOf(G.maxRounds)==='mid')u.mid++;if(lenOf(G.maxRounds)==='adv')u.adv++}store.set('dagal_unlock',u);
  if(!t0&&!st){const L=store.get('dagal_hall',[]);L.unshift({date:new Date().toISOString().slice(0,10),name:H.name,len:G.cfg.tutorial?'튜토리얼':LEN[lenOf(G.cfg.rounds)].n,rank,total:rows.length,grade:ev.grade,nw:Math.round(netWorth(0)),ck:(H.ck||[]).filter(Boolean).length,ending:G.ending?G.ending.title:'',mins:Math.round((G.playMs||0)/60000)});store.set('dagal_hall',L.slice(0,60))}
  if(t0)setTimeout(()=>coach('end'),400);
 }catch(e){console.warn(e)}
 if(G.timeUp){const fix=()=>{const h=$('#dlg h2');if(h&&/항해 종료/.test(h.textContent)){h.textContent='⏳ 제한 시간 종료 — 항해를 마칩니다';return true}};let n=0;const iv=setInterval(()=>{if(fix()||++n>40)clearInterval(iv)},250)}
 // 결과 화면에 '시작 메뉴' 단추
 let n=0;const iv=setInterval(()=>{const s2=$('#setup2');if(s2){s2.textContent='🏠 시작 메뉴';s2.onclick=()=>{closeModal();openTitle()};clearInterval(iv)}if(++n>200)clearInterval(iv)},300);
}}

// ================= 튜토리얼 — 초등 3학년도 할 수 있게, 한 번에 하나씩 =================
function startQuick(){closeTitle();const P=prefs(),b=birthLoad();startGame({name:(b&&b.name)||P.name||'나',birth:'',ai:1,diff:'easy',rounds:20,speed:P.speed==='slow'?'normal':P.speed,seed:'',quick:true})}
function startTutorial(){closeTitle();const P=prefs(),b=birthLoad();
 startGame({name:(b&&b.name)||P.name||'나',birth:b&&b.saju&&b.saju.ok?`${b.saju.solar.y}-${String(b.saju.solar.m).padStart(2,'0')}-${String(b.saju.solar.d).padStart(2,'0')}`:'',ai:1,diff:'easy',rounds:15,speed:'slow',seed:'2026',tutorial:true,manual:false})}
const COACH={
 hello:'안녕! 나는 별이야 ⭐<br>이 게임은 <b>우주를 빙글빙글 도는 놀이</b>야.<br>별(행성)을 사 두면, 친구가 내 별에 올 때 <b>돈을 받아</b>.',
 dice:'내 차례야! <b>주사위를 굴려</b> 볼까?<br>아래 큰 단추를 누르거나 <b>스페이스</b> 키를 눌러.',
 buy:'빈 별이야! 사면 <b>내 별</b>이 돼.<br>돈이 넉넉하면 아래 <b>‘👍 살래요’</b>를 눌러 봐.<br>값보다 내 돈이 훨씬 많으면 사도 괜찮아.',
 bought:'잘했어! 👏<br>이제 친구가 이 별에 오면 <b>통행료</b>를 받아.',
 rent:'앗, 친구 별에 들렀네.<br><b>통행료</b>를 냈어. 괜찮아!<br>다음엔 내가 받을 수 있어.',
 salary:'출발점을 지났어!<br>한 바퀴 돌 때마다 <b>월급</b>을 받아. 💰',
 color:'같은 색 별을 <b>모두</b> 모으면<br>통행료가 <b>훨씬 커져</b>.<br>같은 색을 모아 봐!',
 save:'돈을 다 쓰면 위험해.<br>조금은 <b>남겨 두자</b>.<br>이게 <b>위험과 수익</b>을 함께 생각하는 거야.',
 bank:'은행에 돈을 맡기면 <b>조금씩 자라</b>.<br>이걸 <b>이자</b>라고 해.<br>(다음 판에서 은행이 열려!)',
 breath:'잠깐! 숨을 <b>크게 한 번</b> 쉬어 볼까?<br>계산하는 머리(호랑이 🐯)와<br>느끼는 마음(용 🐉)이 함께 움직이면<br>오른쪽 위 <b>차크라 빛</b>이 하나씩 켜져.',
 last:'곧 끝나!<br>마지막엔 <b>가진 돈 + 별 값</b>을 모두 더해서<br>순위를 정해.',
 end:'끝까지 해냈어! 🎉<br>이제 <b>새 게임</b>에서 진짜 항해를 해 봐.<br>판을 거듭하면 새 메뉴가 하나씩 열려.'};
function coach(k){if(!G||!G.tutorial&&k!=='end')return;G.coachSeen=G.coachSeen||{};if(G.coachSeen[k])return;G.coachSeen[k]=1;
 let c=$('#coach');if(!c){document.body.insertAdjacentHTML('beforeend','<div id="coach"><div class="cStar">⭐</div><div class="cBody"><div class="cTxt"></div><button class="btn main" id="cOk">알겠어요 ✓</button></div></div>');c=$('#coach');$('#cOk').onclick=()=>c.classList.remove('show')}
 c.querySelector('.cTxt').innerHTML=COACH[k];c.classList.add('show');try{sfx('step')}catch(e){}
 clearTimeout(coach.t);coach.t=setTimeout(()=>c.classList.remove('show'),G&&G.tutorial?30000:12000)}
{const _a=ask;ask=function(text,opts,cfg){if(G&&(G.tutorial||G.quick)){const t=String(text);if(/차례입니다/.test(t))coach('dice');else if(/매입가/.test(t)){coach('buy');
  const nm=(t.match(/<b>(.*?)<\/b>/)||[])[1]||'이 별',pr=(t.match(/매입가 <b>(.*?)<\/b>/)||[])[1]||'',rent=(t.match(/기본 통행료 ([^<]*?)(<|$)/)||[])[1]||'';const P=G.players[0];
  text=`🪐 <b>${nm}</b>을(를) 살까요?<div class="easy">값 <b>${pr}</b> · 지금 내 돈 <b>${fmt(P.cash)}</b>${rent?` · 손님이 오면 <b>${rent.trim()}</b>씩 받아요`:''}</div>`;
  opts=opts.map(o=>o.v===1?Object.assign({},o,{t:'👍 살래요'}):o.v===0||o.t==='패스'?Object.assign({},o,{t:'괜찮아요'}):o)}}return _a(text,opts,cfg)}}
{const _l=log;log=function(t,cls){_l(t,cls);if(!G||!G.tutorial)return;const s=String(t),me=G.players[0].name;
 if(s.includes('매입')&&s.includes(me))coach('bought');else if(s.includes('통행료')&&s.indexOf(me)>=0&&s.indexOf(me)<s.indexOf('→'))coach('rent');else if(/월급/.test(s)&&s.includes(me))coach('salary')}}
{const _n=newRound;newRound=function(){const r=_n.apply(this,arguments);if(G&&G.tutorial){const k={3:'color',5:'save',7:'breath',9:'bank',13:'last'}[G.round];if(k)setTimeout(()=>coach(k),600)}return r}}

// 머리말 '새 게임' 단추는 시작 메뉴를 연다
$('#bNew').onclick=()=>openTitle();
