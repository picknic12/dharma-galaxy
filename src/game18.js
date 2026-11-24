// ================= v0.5 부드러운 효과음 · 연령대별 소리·음악 조율 =================
// 8비트 오락실 소리 대신, 둥근 사인·삼각파와 느린 어택, 은은한 잔향의 '친절한' 소리. 연령대에 따라 음높이·밝기·음량·음악 장르가 달라진다.
const AGE=[['child','어린이 (12세 이하)'],['teen','10대'],['20','20대'],['30','30대'],['40','40대'],['50','50대'],['60','60대 이상']];
const AGE_TONE={'2030':{pitch:1.08,bright:2200,vol:.78,genres:['우주 여행','힐링','클래식 변주','환타지'],d:'산뜻하고 따뜻한 벨 (기본)'},child:{pitch:1.5,bright:3200,vol:.9,genres:['환타지','우주 여행'],d:'밝고 통통 튀는 마림바·종소리'},teen:{pitch:1.25,bright:2800,vol:.85,genres:['우주 여행','환타지'],d:'경쾌하고 선명한 소리'},
 '20':{pitch:1.15,bright:2400,vol:.8,genres:['우주 여행','힐링','클래식 변주'],d:'산뜻한 신스 벨'},'30':{pitch:1,bright:2000,vol:.75,genres:['힐링','클래식 변주','우주 여행'],d:'따뜻한 벨과 패드'},
 '40':{pitch:.95,bright:1800,vol:.72,genres:['힐링','클래식 변주'],d:'부드럽고 차분한 벨'},'50':{pitch:.88,bright:1500,vol:.68,genres:['클래식 변주','힐링','명상'],d:'둥글고 낮은 종소리'},'60':{pitch:.8,bright:1300,vol:.65,genres:['명상','클래식 변주','힐링'],d:'고요한 싱잉볼과 낮은 종'}};
function ageBand(){const P=prefs();if(P.age)return P.age;const b=birthLoad();if(b&&b.saju&&b.saju.ok){const a=new Date().getFullYear()-b.saju.solar.y;return a<=12?'child':a<20?'teen':a<30?'20':a<40?'30':a<50?'40':a<60?'50':'60'}return '2030'}
const SFX_STYLE={soft:{n:'부드러운 벨'},marimba:{n:'밝은 마림바',pitch:1.3,bright:3400,type:'triangle'},bowl:{n:'고요한 싱잉볼',pitch:.75,bright:1200,len:1.8},retro:{n:'레트로 8비트'}};
function tone(){const T=Object.assign({},AGE_TONE[ageBand()]||AGE_TONE['2030']);const st=SFX_STYLE[prefs().sfxStyle||'soft']||{};if(st.pitch)T.pitch*=st.pitch/1.1;if(st.bright)T.bright=st.bright;T.type=st.type;T.len=st.len||1;return T}
const SOFT=(function(){let ctx=null,out=null,dly=null;
 function get(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{ctx=new A()}catch(e){return null}
  out=ctx.createGain();out.gain.value=.5;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=tone().bright;out.connect(lp);lp.connect(ctx.destination);out._lp=lp;
  dly=ctx.createDelay();dly.delayTime.value=.21;const fb=ctx.createGain();fb.gain.value=.28;const wet=ctx.createGain();wet.gain.value=.22;out.connect(dly);dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(lp)}
  if(ctx.state==='suspended')try{ctx.resume()}catch(e){}return ctx}
 // 한 음: 부드러운 어택·긴 꼬리. type: sine|triangle, 배음 조금
 function note(f,t,dur,vol,type){const c=ctx,T=tone();f*=T.pitch;const o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type=T.type||type||'sine';dur*=T.len||1;o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.001;
  const g2=c.createGain();g2.gain.value=.18;o.connect(g);o2.connect(g2);g2.connect(g);g.connect(out);const v=vol*T.vol*.32;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.018);g.gain.exponentialRampToValueAtTime(Math.max(1e-4,v*.35),t+dur*.35);g.gain.exponentialRampToValueAtTime(1e-4,t+dur);
  o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
 const P5=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5];
 function play(fn){return function(){const c=get();if(!c)return;try{out._lp.frequency.value=tone().bright;fn(c.currentTime+.01,...arguments)}catch(e){}}}
 return {
  unlock(){get()},
  step:play(t=>note(P5[Math.floor(Math.random()*3)]*.5,t,.22,.35,'triangle')),
  coin:play(t=>{note(P5[4],t,.5,.55);note(P5[6],t+.07,.6,.45)}),
  ding:play(t=>note(P5[5],t,1.1,.5)),
  pop:play(t=>note(P5[2+Math.floor(Math.random()*3)],t,.35,.45,'triangle')),
  merge:play(t=>{[0,2,4].forEach((k,j)=>note(P5[k],t+j*.09,.9,.45))}),
  win:play(t=>{[0,2,4,5].forEach((k,j)=>note(P5[k],t+j*.13,1.4,.5));note(P5[0]*.5,t,2.2,.35)}),
  start:play(t=>{[4,2,0].forEach((k,j)=>note(P5[k]*.5,t+j*.16,1.2,.45));note(P5[5],t+.5,1.6,.35)}),
  boom:play(t=>{note(110,t,1.2,.6,'sine');note(164.8,t+.04,1,.35)}),
  dead:play(t=>{[4,2,1,0].forEach((k,j)=>note(P5[k]*.5,t+j*.22,1.3,.4))})}})();
// 게임 효과음을 부드러운 소리로 바꾼다 (DungeonSfx 이름은 그대로 두고 내용만 교체)
const RETRO={};try{Object.keys(SOFT).forEach(k=>{if(typeof DungeonSfx==='object'){RETRO[k]=DungeonSfx[k];DungeonSfx[k]=function(){if(prefs().sfxStyle==='retro'&&RETRO[k]&&!(G&&G.calm))return RETRO[k].apply(null,arguments);if(G&&G.calm&&/boom|dead/.test(k))return SOFT.step();return SOFT[k].apply(null,arguments)}}})}catch(e){}
// 연령대에 맞는 음악 장르
const GENRE_OPT=[['auto','연령대에 맞춰 (추천)'],['mix','골고루'],['명상','명상'],['힐링','힐링'],['환타지','환타지'],['우주 여행','우주 여행'],['클래식 변주','클래식 변주']];
function applyAgeMusic(){if(!window.CosmicMusic||document.body.classList.contains('med')||(G&&G.calm))return;const mg=prefs().musicGenre||'auto';if(mg==='mix'){try{CosmicMusic.setGenre(null)}catch(e){}return}if(mg!=='auto'){try{CosmicMusic.setGenre(mg)}catch(e){}return}const gs=tone().genres;try{CosmicMusic.setGenre(gs[Math.floor(Math.random()*gs.length)])}catch(e){}}
{const _st=startGame;startGame=function(cfg){_st(cfg);if(!G.calm)applyAgeMusic()}}
setTimeout(applyAgeMusic,300);
try{CosmicMusic.onChange(()=>{if(Math.random()<.5)applyAgeMusic()})}catch(e){}
// 전투 음악도 어린이·60대 이상에게는 한결 부드럽게
{const _bs=BattleMusic.start;BattleMusic.start=function(o){const r=_bs.call(BattleMusic,o);try{const b=ageBand();if(b==='child'||b==='60'||b==='50'){BattleMusic.intensity(.3)}}catch(e){}return r}}

// 설정 화면에 '소리와 음악' 칸을 더한다
{const _p=pane;pane=function(k){_p(k);if(k!=='set')return;const P=prefs();const box=$('#tPane .tPaneIn');if(!box)return;const anchor=box.querySelector('.tgl');if(!anchor)return;
 anchor.insertAdjacentHTML('beforebegin',`<div class="tCard"><b>🎼 소리와 음악</b>
 <label>연령대 <span class="sub">(생년월일을 넣지 않아도 됩니다 · 기본 20~30대)</span></label><div class="seg" id="pAge">${[['2030','20~30대 (기본)']].concat(AGE).map(([v,n])=>`<button class="btn sm ${String(P.age||'')===v||(!P.age&&v==='2030')?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
 <label>음악 종류</label><div class="seg" id="pGenre">${GENRE_OPT.map(([v,n])=>`<button class="btn sm ${(P.musicGenre||'auto')===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
 <label>효과음 스타일</label><div class="seg" id="pSfxSt">${Object.entries(SFX_STYLE).map(([v,o])=>`<button class="btn sm ${(P.sfxStyle||'soft')===v?'main':''}" data-v="${v}">${o.n}</button>`).join('')}<button class="btn sm" id="pSfxTry">🔔 들어 보기</button></div>
 <label>보드 이름표</label><div class="seg" id="pLab">${[['imp','중요한 것만 (기본)'],['all','모두'],['none','숨김 (마우스를 올리면 보기)']].map(([v,n])=>`<button class="btn sm ${(P.labels||'imp')===v?'main':''}" data-v="${v}">${n}</button>`).join('')}</div>
 <div class="sub" id="pToneD">지금 소리: ${tone().d||''}</div></div>`);
 const rb=(id,key,after)=>$('#'+id).querySelectorAll('button[data-v]').forEach(b=>b.onclick=()=>{setPref(key,b.dataset.v==='2030'&&key==='age'?'':b.dataset.v);after&&after();pane('set')});
 rb('pAge','age',()=>{applyAgeMusic();SOFT.merge()});rb('pGenre','musicGenre',()=>{applyAgeMusic();try{if(CosmicMusic.isPlaying())CosmicMusic.next()}catch(e){}});rb('pSfxSt','sfxStyle',()=>DungeonSfx.merge());rb('pLab','labels');
 $('#pSfxTry').onclick=()=>{DungeonSfx.coin();setTimeout(()=>DungeonSfx.merge(),400);setTimeout(()=>DungeonSfx.win(),1100)}}}
// ================= 정밀 초상: 자주 나오는 몬스터 12종 · 지휘관 8인 =================
MON.forEach((M,k)=>{if(k<ArtKit.COUNT)M.o.art=k+1});
{const _c=SpriteKit.creature;SpriteKit.creature=function(o){if(o&&o.art&&!o.plain){const s=ArtKit.monster(o.art-1,o.glow);if(s)return s}return _c(o)}}
{const _p=SpriteKit.pawn;const map={'#7fd6ff':'human'};PERS.forEach(P=>map[P.color]=P.key);SpriteKit.pawn=function(color,face,seed){const k=map[color];if(k){const s=ArtKit.commander(k,color);if(s)return s}return _p(color,face,seed)}}
// 질문 창이 떠 있는 동안 보드 이름표를 흐리게
{const _ra=renderAct;renderAct=function(){_ra();document.body.classList.toggle('asking',!!(G&&G.ask&&!G.ask.done))}}
// 보드 이름표: 중요한 것만 기본으로(함대가 선 자리·내 행성·내 다음 몇 칸), 나머지는 마우스를 올리면 나타난다
function labelMode(){return prefs().labels||'imp'}
setInterval(()=>{if(!G||!window.V||!V.labels)return;const mode=labelMode();const w=W(V.view);if(!w)return;const imp=new Set();
 G.players.forEach(P=>{if(!P.out&&P.wid===V.view)imp.add(P.pos)});const H=G.players[0];
 if(H.wid===V.view&&G.ask&&!G.ask.done)for(let d=0;d<=0;d++)imp.add(H.pos);
 w.own.forEach((o,i)=>{if(o&&o.o===0)imp.add(i)});
 V.labels.forEach((d,i)=>{const on=mode==='all'||(mode==='imp'&&imp.has(i));d.classList.toggle('dim',!on);d.classList.toggle('mine',!!(w.own[i]&&w.own[i].o===0))})},400);
