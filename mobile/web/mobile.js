/* ===== 다르마 갤럭시 2027 · 모바일(안드로이드) 조작 레이어 =====
   PC판 게임 코드(src/game*.js)를 그대로 쓰고, 그 위에 터치 조작·화면 배치·성능 옵션만 얹습니다.
   게임 규칙을 바꾸는 코드는 넣지 않습니다(규칙 변경은 PC판 소스에서 한 번만). */
(function(){
'use strict';
var M=window.DG_MOBILE||{lite:true};
var $1=function(s){return document.querySelector(s)};
var body=document.body;var HAS_V=function(){return typeof V!=='undefined'&&V};
body.classList.add('m');if(M.lite)body.classList.add('lite');
body.classList.add('nopanel');

/* ---------- 1. 하단 탭바 ---------- */
var nav=document.createElement('nav');nav.id='mNav';
var NAV=[['space','🌌','우주'],['fleet','🚀','함대'],['assets','🪐','자산'],['hero','🛡','영웅'],['menu','☰','메뉴']];
nav.innerHTML=NAV.map(function(n){return '<button data-k="'+n[0]+'"><i>'+n[1]+'</i>'+n[2]+'</button>'}).join('');
body.appendChild(nav);
function setNav(k){nav.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.k===k)})}
function sheet(open){body.classList.toggle('nopanel',!open);if(open)guard();setTimeout(function(){try{resize()}catch(e){}},380)}
function openSheet(k){
 var aside=$1('aside');
 if(k==='fleet'){sheet(true);aside.scrollTop=0}
 else{try{tab(k)}catch(e){}sheet(true);var t=$1('aside .tabs');if(t)aside.scrollTop=t.closest('.panel').offsetTop-6}
 setNav(k);
 var on=$1('aside .tabs button.on');if(on&&k!=='fleet')on.scrollIntoView({inline:'center',block:'nearest'});
}
nav.addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b)return;var k=b.dataset.k;
 if(k==='menu'){menu(!$1('#mMenu').classList.contains('show'));return}
 menu(false);
 if(k==='space'||(b.classList.contains('on')&&!body.classList.contains('nopanel'))){sheet(false);setNav('space');return}
 openSheet(k);
});
setNav('space');
// PC 단축키 Q(패널)와 같은 상태를 공유
var tabBar=$1('aside .tabs');
if(tabBar)tabBar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=b.dataset.t;setNav(t==='hero'?'hero':t==='assets'?'assets':'fleet')});

/* ---------- 2. 메뉴 시트 : PC 상단 버튼들을 그대로 옮겨 담음 (기존 동작 유지) ---------- */
var mm=document.createElement('div');mm.id='mMenu';
mm.innerHTML='<div class="box"><h3>☰ 메뉴</h3><div class="grid" id="mGrid"></div><div class="foot">다르마 갤럭시 2027 · 모바일판 · 피크닉 신영호 · 임지혜 (이스턴드래곤 출판사)</div></div>';
body.appendChild(mm);
var grid=mm.querySelector('#mGrid');
var LABEL={bMusic:'음악',bNext:'다음 곡',bMed:'명상',bPause:'수동/자동',bSpeed:'속도',bAuto:'AI 오토',bSound:'효과음',bRules:'규칙',bSave:'저장',bLoad:'불러오기',bPanel:null,bFull:'전체 화면',bNew:''};
Object.keys(LABEL).forEach(function(id){
 var b=document.getElementById(id);if(!b)return;
 if(LABEL[id]===null){b.style.display='none';return}
 b.classList.remove('sm');
 if(LABEL[id]){var cap=document.createElement('span');cap.className='cap';cap.textContent=LABEL[id];cap.style.cssText='display:block;font-size:11px;opacity:.85';b.appendChild(cap)}
 grid.appendChild(b);
});
// 게임이 버튼 textContent를 바꾸면 이름표가 지워지므로 다시 붙임
new MutationObserver(function(){grid.querySelectorAll('.btn').forEach(function(b){if(!b.querySelector('.cap')&&LABEL[b.id]){var c=document.createElement('span');c.className='cap';c.textContent=LABEL[b.id];c.style.cssText='display:block;font-size:11px;opacity:.85';b.appendChild(c)}})}).observe(grid,{subtree:true,childList:true,characterData:true});
// 그래픽 모드 토글 (모바일 전용)
var gfx=document.createElement('button');gfx.className='btn';gfx.id='mGfx';
function gfxTxt(){gfx.innerHTML=(M.lite?'🍃':'✨')+'<span class="cap" style="display:block;font-size:11px;opacity:.85">'+(M.lite?'가벼운 그래픽':'고화질 그래픽')+'</span>'}
gfxTxt();gfx.onclick=function(){M.lite=!M.lite;try{localStorage.setItem('dg_gfx',M.lite?'lite':'full')}catch(e){}body.classList.toggle('lite',M.lite);gfxTxt();applyGfx();try{toast(M.lite?'🍃 가벼운 그래픽 — 배터리·발열을 줄입니다':'✨ 고화질 그래픽')}catch(e){}};
grid.appendChild(gfx);
var lbl=document.createElement('button');lbl.className='btn';lbl.innerHTML='🏷<span class="cap" style="display:block;font-size:11px;opacity:.85">이름표</span>';
lbl.onclick=function(){if(HAS_V())V.showLabels=!V.showLabels};grid.appendChild(lbl);
function menu(open){mm.classList.toggle('show',open);if(open){setNav('menu');guard()}else if(nav.querySelector('.on[data-k=menu]'))setNav(body.classList.contains('nopanel')?'space':'fleet')}
mm.addEventListener('click',function(e){if(e.target===mm){menu(false);return}var b=e.target.closest('.btn');if(b&&b.id!=='mGfx')setTimeout(function(){menu(false)},120)});

/* ---------- 3. 카메라 터치 조작판 (←→↑↓ +- H F 키 대체) ---------- */
var cam=document.createElement('div');cam.id='mCam';
cam.innerHTML='<button data-c="l" title="왼쪽으로 돌리기">⟲</button><button data-c="r" title="오른쪽으로 돌리기">⟳</button><button data-c="in" title="가까이">＋</button><button data-c="out" title="멀리">－</button><button data-c="home" title="내 우주">🏠</button><button data-c="follow" title="따라가기" class="on">🎯</button>';
var stage=$1('#stage');stage.appendChild(cam);cam.classList.add('hud');
cam.addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b||!HAS_V())return;var c=V.cam,k=b.dataset.c;V.idle=0;
 if(k==='l')c.tth-=Math.PI/2;else if(k==='r')c.tth+=Math.PI/2;
 else if(k==='in')c.tr=clamp(c.tr*.85,10,70);else if(k==='out')c.tr=clamp(c.tr*1.18,10,70);
 else if(k==='home'){if(typeof G!=='undefined'&&G&&G.players)switchView(G.players[0].wid)}
 else if(k==='follow'){V.follow=!V.follow;b.classList.toggle('on',V.follow);toast(V.follow?'카메라 따라가기 켬':'카메라 따라가기 끔')}
});

/* ---------- 4. 두 손가락 확대·축소, 손떨림 보정 ---------- */
var pinch=null,down=null;
stage.addEventListener('touchstart',function(e){if(e.touches.length===2&&HAS_V()){var a=e.touches[0],b=e.touches[1];pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r:V.cam.tr};V.drag=null}},{passive:true});
stage.addEventListener('touchmove',function(e){if(pinch&&e.touches.length===2){var a=e.touches[0],b=e.touches[1];var d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);V.cam.tr=clamp(pinch.r*pinch.d/Math.max(20,d),10,70);V.idle=0}},{passive:true});
stage.addEventListener('touchend',function(e){if(e.touches.length<2)pinch=null},{passive:true});
// 손가락은 살짝 흔들리므로 10px 안쪽 움직임은 '탭'으로 봄 (PC판의 4px 기준 보완)
stage.addEventListener('pointerdown',function(e){down={x:e.clientX,y:e.clientY,far:false}},true);
stage.addEventListener('pointermove',function(e){if(pinch){e.stopImmediatePropagation();return}if(!down||down.far)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<10)e.stopImmediatePropagation();else down.far=true},true);

/* ---------- 5. 탭 한 번으로 소리·화면 켜기 ---------- */
// 안드로이드 크롬은 손가락을 '뗄 때' 비로소 소리 재생을 허락합니다(pointerdown만으로는 부족).
function unlock(){
 try{DungeonSfx.unlock()}catch(e){}
 try{if(window.Tone){Tone.start();var G_=window.__game&&window.__game.G;if((!G_||G_.music!==false)&&window.CosmicMusic&&!CosmicMusic.isPlaying())CosmicMusic.start().then(function(){var b=$1('#bMusic');if(b)b.classList.add('main')})}}catch(e){}
 wake();
}
['pointerup','touchend','click'].forEach(function(ev){document.addEventListener(ev,function h(){unlock();['pointerup','touchend','click'].forEach(function(x){document.removeEventListener(x,h,true)})},true)});
var wl=null;function wake(){try{if(navigator.wakeLock&&!wl)navigator.wakeLock.request('screen').then(function(l){wl=l;l.addEventListener('release',function(){wl=null})}).catch(function(){})}catch(e){}}
document.addEventListener('visibilitychange',function(){
 if(document.visibilityState==='visible')wake();
 // 백그라운드로 가면 음악 정지(배터리)
 try{if(window.Tone&&Tone.context){if(document.hidden)Tone.context.rawContext.suspend();else Tone.context.rawContext.resume()}}catch(e){}
});

/* ---------- 6. 그래픽 성능 ---------- */
var lastR=0;
function applyGfx(){
 if(!HAS_V()||!V.ok)return;
 V.renderer.setPixelRatio(M.lite?Math.min(1.25,devicePixelRatio):Math.min(2,devicePixelRatio));
 if(V.stars&&V.stars.geometry)V.stars.geometry.setDrawRange(0,M.lite?4000:Infinity);
 try{resize()}catch(e){}
}
if(HAS_V()&&V.ok){
 var rr=V.renderer.render.bind(V.renderer);
 // 가벼운 모드: 3D 그리기를 초당 30장으로 제한 (게임 진행 속도는 그대로)
 V.renderer.render=function(s,c){var t=performance.now();if(M.lite&&t-lastR<31)return;lastR=t;rr(s,c)};
 applyGfx();
}
addEventListener('orientationchange',function(){setTimeout(function(){try{resize()}catch(e){}},300)});

/* ---------- 7. 안드로이드 뒤로 가기 버튼 ---------- */
var guarded=false,lastBack=0;
function guard(){if(!guarded){history.pushState({dg:1},'');guarded=true}}
addEventListener('popstate',function(){
 guarded=false;
 var mod=$1('#modal'),dl=$1('#dlg');
 if(mm.classList.contains('show')){menu(false);guard();return}
 if(mod&&mod.classList.contains('show')){if(!(dl&&dl.dataset.lock))closeModal();guard();return}
 if(!body.classList.contains('nopanel')){sheet(false);setNav('space');guard();return}
 var now=Date.now();if(now-lastBack<2000){history.back();return}
 lastBack=now;try{toast('한 번 더 누르면 게임을 나갑니다 (저장은 ☰ 메뉴 → 💾)')}catch(e){}guard();
});
guard();

/* ---------- 8. 질문이 오면 시트를 내려 판단 버튼이 보이게 ---------- */
if(typeof renderAct==='function'){
 var ra=renderAct;var had=false;
 window.renderAct=renderAct=function(){var r=ra.apply(this,arguments);var a=window.__game&&window.__game.G&&window.__game.G.ask;var now=!!a;if(now&&!had&&innerHeight>innerWidth&&!body.classList.contains('nopanel')){var act=$1('#act');if(act&&act.getBoundingClientRect().top<70){sheet(false);setNav('space')}}had=now;return r};
}

/* ---------- 9. 오프라인 설치(PWA) ---------- */
if('serviceWorker' in navigator&&location.protocol==='https:'&&!M.app){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
