/* 다르마 갤럭시 2027 · 모바일 사전 설정 (게임 스크립트보다 먼저 실행) */
(function(){
 var ls=function(k,d){try{var v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
 window.DG_MOBILE={
  app:/DharmaGalaxyApp/.test(navigator.userAgent)||!!window.Capacitor,
  lite:ls('dg_gfx','lite')==='lite',
  version:'2027-m1'
 };
})();
