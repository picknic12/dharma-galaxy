// ================= 3D 다중우주 렌더러 (three.js) =================
const V={ok:false,view:'W0',nodes:[],ships:[],labels:[],follow:true,showLabels:true,cam:{th:Math.PI/4,tth:Math.PI/4,ph:.955,r:28,tr:28,tx:0,ty:0,tz:0},drag:null,t0:performance.now()};
function texCanvas(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return t}
function glowTex(col){return texCanvas(128,128,(g,w)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,col);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128)})}
function planetTex(seed,col){const rr=PicnicRng.create(seed);return texCanvas(256,128,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);for(let k=0;k<26;k++){g.globalAlpha=.08+rr.next()*.18;g.fillStyle=SK.mix(col,rr.next()<.5?-.4:.45);const y=rr.next()*h;g.fillRect(0,y,w,2+rr.next()*14)}for(let k=0;k<40;k++){g.globalAlpha=.1+rr.next()*.2;g.fillStyle=SK.mix(col,rr.next()<.5?-.5:.5);g.beginPath();g.ellipse(rr.next()*w,rr.next()*h,2+rr.next()*14,1+rr.next()*6,0,0,7);g.fill()}g.globalAlpha=1})}
function initScene(){
 const host=$('#stage');
 try{V.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(e){host.insertAdjacentHTML('beforeend','<p style="padding:20px">이 브라우저에서 3D(WebGL)를 사용할 수 없습니다.</p>');return}
 V.ok=true;const r=V.renderer;r.setPixelRatio(Math.min(2,devicePixelRatio));host.prepend(r.domElement);r.domElement.id='gl';V.px=[$('.px1'),$('.px2')];
 V.scene=new THREE.Scene();V.scene.background=new THREE.Color('#05040f');
 V.camera=new THREE.PerspectiveCamera(24,1,.1,4000); // 2.5D: 좁은 화각 + 먼 거리 = 준(準)직교 쿼터뷰
 V.scene.add(new THREE.AmbientLight(0x8f86c8,.55));
 V.sun=new THREE.PointLight(0xffd6b0,2.2,90);V.scene.add(V.sun);
 const dl=new THREE.DirectionalLight(0xb9c8ff,.5);dl.position.set(10,20,8);V.scene.add(dl);
 // 은하수
 const N=9000,pos=new Float32Array(N*3),colr=new Float32Array(N*3),cols=['#ffffff','#cfe0ff','#ffd6f0','#ffe8b0','#b9a6ff','#9ff0e0'].map(c=>new THREE.Color(c));
 const tilt=new THREE.Matrix4().makeRotationZ(.45).multiply(new THREE.Matrix4().makeRotationX(.25));
 for(let k=0;k<N;k++){const band=k<N*.72;const a=Math.random()*Math.PI*2;let lat=band?(Math.random()+Math.random()+Math.random()-1.5)*.18:(Math.random()*2-1)*1.5;const rr=380+Math.random()*420;const v=new THREE.Vector3(Math.cos(a)*Math.cos(lat),Math.sin(lat),Math.sin(a)*Math.cos(lat)).multiplyScalar(rr).applyMatrix4(tilt);pos.set([v.x,v.y,v.z],k*3);const c=cols[Math.floor(Math.random()*(band?6:3))];colr.set([c.r,c.g,c.b],k*3)}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));sg.setAttribute('color',new THREE.BufferAttribute(colr,3));
 V.stars=new THREE.Points(sg,new THREE.PointsMaterial({size:2.4,map:glowTex('rgba(255,255,255,.6)'),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));V.scene.add(V.stars);
 // 성운
 V.nebula=new THREE.Group();const nc=['rgba(255,140,200,.55)','rgba(140,160,255,.55)','rgba(120,240,220,.45)','rgba(255,200,140,.45)','rgba(190,140,255,.55)'];
 for(let k=0;k<16;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(nc[k%5]),transparent:true,opacity:.22+Math.random()*.18,depthWrite:false,blending:THREE.AdditiveBlending}));const a=k/16*Math.PI*2;const v=new THREE.Vector3(Math.cos(a)*520,(Math.random()-.5)*160,Math.sin(a)*520).applyMatrix4(tilt);s.position.copy(v);const sc=260+Math.random()*320;s.scale.set(sc,sc*.6,1);V.nebula.add(s)}
 V.scene.add(V.nebula);
 // 중심 블랙홀 + 강착원반
 V.core=new THREE.Group();
 V.core.add(new THREE.Mesh(new THREE.SphereGeometry(1.5,48,48),new THREE.MeshBasicMaterial({color:0x000000})));
 const disk=new THREE.Mesh(new THREE.RingGeometry(1.8,5.2,128),new THREE.MeshBasicMaterial({map:texCanvas(512,512,(g)=>{const r=g.createRadialGradient(256,256,90,256,256,256);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.12,'rgba(255,214,150,1)');r.addColorStop(.35,'rgba(255,130,170,.85)');r.addColorStop(.65,'rgba(150,120,255,.45)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,512,512);for(let k=0;k<400;k++){g.strokeStyle=`rgba(255,240,255,${Math.random()*.25})`;g.beginPath();const rad=95+Math.random()*150;const a=Math.random()*6.28;g.arc(256,256,rad,a,a+.3+Math.random());g.stroke()}}),side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 disk.rotation.x=-Math.PI/2+.32;V.disk=disk;V.core.add(disk);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('rgba(255,170,220,.6)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(16,16,1);V.core.add(halo);
 const lens=new THREE.Mesh(new THREE.TorusGeometry(1.62,.05,8,96),new THREE.MeshBasicMaterial({color:0xfff0d8}));V.core.add(lens);V.lens=lens;
 V.scene.add(V.core);
 V.world=new THREE.Group();V.scene.add(V.world);V.shipG=new THREE.Group();V.scene.add(V.shipG);
 V.ray=new THREE.Raycaster();
 bindCamera(host);addEventListener('resize',resize);resize();requestAnimationFrame(loop);
}
function resize(){if(!V.ok)return;const h=$('#stage');const w=h.clientWidth,hh=h.clientHeight;V.renderer.setSize(w,hh,false);V.camera.aspect=w/hh;V.camera.updateProjectionMatrix()}
function nodePos(wid,i){const w=W(wid),L=w.spaces.length,root=wid==='W0';const R=root?12:8.5;const a=-i/L*Math.PI*2+Math.PI/2;return new THREE.Vector3(Math.cos(a)*R,Math.sin(2*a+(root?0:1))*(root?1.6:1.1),Math.sin(a)*R*.82)}
function clearGroup(g){while(g.children.length){const c=g.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})}}
function buildWorld(wid){
 if(!V.ok)return;V.view=wid;clearGroup(V.world);V.nodes=[];
 const w=W(wid),L=w.spaces.length;const hue=w.hue;const fc=new THREE.Color().setHSL(hue/360,.5,.04);V.scene.background=fc;V.scene.fog=new THREE.FogExp2(fc,.006);
 V.nebula.children.forEach((s,k)=>s.material.color.setHSL(((hue+k*25)%360)/360,.7,.75));
 const pts=[];for(let i=0;i<L;i++)pts.push(nodePos(wid,i));
 const curve=new THREE.CatmullRomCurve3(pts,true);const lg=new THREE.BufferGeometry().setFromPoints(curve.getPoints(L*12));
 V.world.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:new THREE.Color().setHSL(hue/360,.8,.75),transparent:true,opacity:.45})));
 const dots=new THREE.Points(new THREE.BufferGeometry().setFromPoints(curve.getPoints(L*24)),new THREE.PointsMaterial({size:.18,color:0xffffff,transparent:true,opacity:.6,map:glowTex('rgba(255,255,255,.8)'),depthWrite:false,blending:THREE.AdditiveBlending}));V.world.add(dots);V.flow=dots;
 w.spaces.forEach((s,i)=>{
  const g=new THREE.Group();g.position.copy(pts[i]);const ud={wid,i};let mesh,rad=.6;
  const col=OWNABLE(s.type)?SECT[s.g].c:{start:'#bfe6ff',news:'#9ff0ff',tax:'#ffb3b3',jail:'#ff8f9f',portal:'#c9a6ff',bank:'#ffe08a',blackhole:'#7a5cff',gate:'#ffffff',treasure:'#ffd66b'}[s.type];
  if(OWNABLE(s.type)){rad=s.type==='prop'?.5+s.price/650:.62;mesh=new THREE.Mesh(new THREE.SphereGeometry(rad,40,28),new THREE.MeshStandardMaterial({map:planetTex(PicnicRng.hash(wid+i),col),roughness:.85,metalness:.05,emissive:new THREE.Color(col).multiplyScalar(.18)}));
   if(s.type==='etf'){const rg=new THREE.Mesh(new THREE.TorusGeometry(rad*1.55,.035,8,64),new THREE.MeshBasicMaterial({color:col}));rg.rotation.x=1.2;g.add(rg)}
   if(s.type==='crypto')mesh.material.metalness=.6;}
  else if(s.type==='start'){mesh=new THREE.Group();mesh.add(new THREE.Mesh(new THREE.TorusGeometry(.8,.12,12,48),new THREE.MeshStandardMaterial({color:0xdfe9ff,metalness:.6,roughness:.3})));const c=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,1.8,12),new THREE.MeshStandardMaterial({color:0xbfd0ff,metalness:.6}));c.rotation.z=Math.PI/2;mesh.add(c);mesh.add(new THREE.Mesh(new THREE.SphereGeometry(.3,16,16),new THREE.MeshBasicMaterial({color:0x7ad3ff})));rad=.8}
  else if(s.type==='portal'||s.type==='gate'){mesh=new THREE.Group();mesh.add(new THREE.Mesh(new THREE.TorusGeometry(.72,.09,12,64),new THREE.MeshBasicMaterial({color:col})));const sw=new THREE.Mesh(new THREE.CircleGeometry(.66,48),new THREE.MeshBasicMaterial({map:texCanvas(256,256,(gg)=>{for(let k=0;k<60;k++){gg.strokeStyle=`hsla(${hue+k*4},90%,${60+k%3*10}%,.5)`;gg.lineWidth=3;gg.beginPath();gg.arc(128,128,8+k*2,k*.4,k*.4+2.2);gg.stroke()}}),transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));mesh.add(sw);mesh.userData.spin=sw;rad=.72}
  else if(s.type==='blackhole'){mesh=new THREE.Group();mesh.add(new THREE.Mesh(new THREE.SphereGeometry(.42,24,24),new THREE.MeshBasicMaterial({color:0})));const d=new THREE.Mesh(new THREE.RingGeometry(.5,1.1,48),new THREE.MeshBasicMaterial({map:V.disk.material.map,transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));d.rotation.x=-1.2;mesh.add(d);mesh.userData.spin=d;rad=.9}
  else{const geo={news:new THREE.OctahedronGeometry(.55),tax:new THREE.ConeGeometry(.45,.9,6),jail:new THREE.OctahedronGeometry(.7,0),bank:new THREE.IcosahedronGeometry(.75),treasure:new THREE.DodecahedronGeometry(.6)}[s.type]||new THREE.OctahedronGeometry(.55);mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(col).multiplyScalar(.45),metalness:.5,roughness:.25,flatShading:true}));rad=.7}
  mesh.traverse(o=>o.userData=Object.assign(o.userData||{},ud));g.add(mesh);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col.length===7?hexA(col,.5):col),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.75}));glow.scale.set(rad*4.2,rad*4.2,1);g.add(glow);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(rad*1.35,.05,8,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));ring.rotation.x=1.35;g.add(ring);
  const moons=new THREE.Group();g.add(moons);
  V.world.add(g);V.nodes[i]={g,mesh,glow,ring,moons,rad,lv:-1,s};
 });
 V.ent=new THREE.Group();V.world.add(V.ent);
 buildLabels();renderBoard();V.cam.tr=wid==='W0'?30:22;
 $('#worldName').textContent=W(wid).name;
}
function hexA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function buildLabels(){const box=$('#labels');box.innerHTML='';V.labels=W(V.view).spaces.map((s,i)=>{const d=document.createElement('div');d.className='lab';d.dataset.i=i;box.appendChild(d);d.onclick=()=>openInfo(V.view,i);return d})}
function renderBoard(){
 if(!V.ok||!G)return;const wid=V.view,w=W(wid);if(!w)return;
 w.spaces.forEach((s,i)=>{const n=V.nodes[i];if(!n)return;const o=w.own[i];const lab=V.labels[i];
  let html=`<b>${ICON[s.type]||''} ${esc(s.name)}</b>`;
  if(o){const P=o.o>=0?G.players[o.o]:null;html+=`<span>${P?`<i style="color:${P.color}">●</i> ${esc(P.name)}`:fmt(mkt(wid,i))}${o.lv?` ${o.lv===5?'🌟IPO':'★'.repeat(o.lv)}`:''}${o.m?' 🔒':''}</span>`;
   n.ring.material.opacity=P?.95:0;if(P)n.ring.material.color.set(P.color);
   if(n.mesh.material&&n.mesh.material.color){n.mesh.material.color.set(o.m?'#666':'#fff')}
   if(n.lv!==o.lv){clearGroup(n.moons);for(let k=0;k<o.lv;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(k===4?.16:.1,12,12),new THREE.MeshBasicMaterial({color:k===4?0xffd66b:0xe8ecff}));m.userData.k=k;n.moons.add(m)}n.lv=o.lv}
  } else if(s.type==='bank')html+=`<span>공적자금 ${fmt(G.pot)}</span>`;
  else if(s.type==='portal'&&w.children[i])html+=`<span>→ ${esc(W(w.children[i]).name)}</span>`;
  lab.innerHTML=html;});
 clearGroup(V.ent);
 for(const e of G.entangle){if(e.a[0]===wid&&e.b[0]===wid){const g=new THREE.BufferGeometry().setFromPoints([nodePos(wid,e.a[1]),nodePos(wid,e.b[1])]);V.ent.add(new THREE.Line(g,new THREE.LineDashedMaterial({color:0x9ff0ff,dashSize:.3,gapSize:.2})).computeLineDistances())}}
 syncShips();
}
function shipObj(P,k){const g=new THREE.Group();const c=new THREE.Color(P.color);
 const body=new THREE.Mesh(new THREE.ConeGeometry(.22,.75,P.isAI?4:12),new THREE.MeshStandardMaterial({color:c,emissive:c.clone().multiplyScalar(.4),metalness:.4,roughness:.3}));body.rotation.x=Math.PI/2;g.add(body);
 const wing=new THREE.Mesh(new THREE.BoxGeometry(.7,.04,.22),new THREE.MeshStandardMaterial({color:c.clone().multiplyScalar(.7)}));wing.position.z=-.12;g.add(wing);
 const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(hexA(P.color,.9)),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));fl.scale.set(1.2,1.2,1);fl.position.z=-.45;g.add(fl);
 if(!P.isAI){const crown=new THREE.Mesh(new THREE.TorusGeometry(.16,.04,6,16),new THREE.MeshBasicMaterial({color:0xffd66b}));crown.position.y=.25;crown.rotation.x=Math.PI/2;g.add(crown)}
 g.userData={k};return g}
function syncShips(){
 if(!V.ok||!G)return;if(V.ships.length!==G.players.length){clearGroup(V.shipG);V.ships=G.players.map((P,k)=>{const o=shipObj(P,k);V.shipG.add(o);return {o,pos:new THREE.Vector3(),tgt:new THREE.Vector3(),init:false}})}
 G.players.forEach((P,k)=>{const s=V.ships[k];s.o.visible=!P.out&&P.wid===V.view;if(s.o.visible){const t=shipTarget(k);s.tgt.copy(t);if(!s.init){s.pos.copy(t);s.init=true}}});
}
function shipTarget(k){const P=G.players[k];const here=G.players.map((Q,j)=>j).filter(j=>!G.players[j].out&&G.players[j].wid===P.wid&&G.players[j].pos===P.pos);const m=here.indexOf(k),n=here.length;const base=nodePos(P.wid,P.pos);const a=m/Math.max(1,n)*Math.PI*2;return base.add(new THREE.Vector3(Math.cos(a)*.9*(n>1?1:0),1.25+(n>1?.25*(m%2):0),Math.sin(a)*.9*(n>1?1:0)))}
function moveShip(p,instant){if(!V.ok)return;syncShips();const s=V.ships[p];if(!s)return;s.tgt.copy(shipTarget(p));if(instant)s.pos.copy(s.tgt);G.players.forEach((_,k)=>{if(k!==p&&V.ships[k])V.ships[k].tgt.copy(shipTarget(k))})}
function onWorldChange(p){const P=G.players[p];P.known.add(P.wid);if(p===0||(G.autoHuman&&p===0)){if(V.view!==P.wid)switchView(P.wid)}else syncShips();renderMap()}
function switchView(wid){if(!V.ok){V.view=wid;return}const f=$('#warp');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');V.cam.r=4;buildWorld(wid);if(G&&G.monsters)renderMonsters();renderMap()}
function focusPlayer(p){const P=G.players[p];if(V.follow&&P.wid!==V.view&&(p===0||G.players[0].known.has(P.wid)&&V.followAll))switchView(P.wid)}
function hot(wid,i){if(!V.ok||wid!==V.view)return;const n=V.nodes[i];if(n)n.hot=1}
function bindCamera(host){
 const c=V.cam;host.addEventListener('pointerdown',e=>{if(e.target.closest('.hud,.lab'))return;V.drag={x:e.clientX,y:e.clientY,th:c.th,ph:c.ph,moved:false};host.setPointerCapture(e.pointerId)});
 host.addEventListener('pointermove',e=>{const d=V.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>4)d.moved=true;c.th=d.th-dx*.006;c.ph=clamp(d.ph-dy*.003,.75,1.12);V.idle=0});
 host.addEventListener('pointerup',e=>{const d=V.drag;V.drag=null;c.tth=Math.round((c.th-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4;if(d&&!d.moved)pickAt(e)});
 host.addEventListener('wheel',e=>{e.preventDefault();c.tr=clamp(c.tr*(1+Math.sign(e.deltaY)*.1),10,70);V.idle=0},{passive:false});
}
function pickAt(e){if(!V.ok)return;const r=V.renderer.domElement.getBoundingClientRect();const m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);V.ray.setFromCamera(m,V.camera);const hit=V.ray.intersectObjects(V.world.children,true).find(h=>h.object.userData&&h.object.userData.wid);if(hit)openInfo(hit.object.userData.wid,hit.object.userData.i)}
let lastT=performance.now();
function loop(t){
 requestAnimationFrame(loop);if(!V.ok)return;const dt=Math.min(.05,(t-lastT)/1000);lastT=t;const c=V.cam;
 V.idle=(V.idle||0)+dt;if(!V.drag)c.th+=(c.tth-c.th)*Math.min(1,dt*5);
 c.r+=(c.tr-c.r)*Math.min(1,dt*3);
 // 따라가기
 let tx=0,ty=0,tz=0;if(G&&V.follow&&G.cur!=null&&V.ships[G.cur]&&V.ships[G.cur].o.visible){const p=V.ships[G.cur].pos;tx=p.x*.35;ty=p.y*.3;tz=p.z*.35}
 c.tx+=(tx-c.tx)*dt*2;c.ty+=(ty-c.ty)*dt*2;c.tz+=(tz-c.tz)*dt*2;
 const K=2.15;V.camera.position.set(c.tx+K*c.r*Math.sin(c.ph)*Math.cos(c.th),c.ty+K*c.r*Math.cos(c.ph),c.tz+K*c.r*Math.sin(c.ph)*Math.sin(c.th));V.camera.lookAt(c.tx,c.ty,c.tz);
 if(V.cine){const k=V.cine;k.t+=dt;c.tr=Math.min(60,30+k.t*3);c.th+=dt*.15;V.core.children[2].scale.setScalar(16+k.t*9);V.core.children[2].material.color.setHSL(.12,.6,.75+Math.min(.25,k.t*.02));V.disk.material.opacity=Math.max(.2,1-k.t*.08);V.nodes.forEach(n=>{if(n){n.ring.material.opacity=1;n.ring.material.color.setHSL((k.t*.05+n.g.position.x*.01)%1,.7,.8);n.glow.scale.setScalar(n.rad*4.2*(1+Math.min(1.5,k.t*.15)))}});V.ships.forEach(s=>{s.tgt.lerp(new THREE.Vector3(0,0,0),dt*.12)})}
 V.disk.rotation.z+=dt*.25;V.stars.rotation.y+=dt*.004;V.lens.rotation.z+=dt;V.lens.lookAt(V.camera.position);
 if(V.flow)V.flow.rotation.y=0;
 const time=t/1000;
 V.nodes.forEach((n,i)=>{if(!n)return;n.mesh.rotation.y+=dt*.3;if(n.mesh.userData.spin)n.mesh.userData.spin.rotation.z-=dt*2;if(n.s.type==='portal'||n.s.type==='gate')n.mesh.lookAt(V.camera.position);
  n.moons.children.forEach(m=>{const a=time*(1.2+m.userData.k*.25)+m.userData.k*1.3;const rr=n.rad*1.7+m.userData.k*.12;m.position.set(Math.cos(a)*rr,Math.sin(a*1.3)*.25,Math.sin(a)*rr)});
  if(n.hot>0){n.hot-=dt*.8;n.glow.scale.setScalar(n.rad*4.2*(1+n.hot*.9))}});
 V.ships.forEach((s,k)=>{if(!s.o.visible)return;s.pos.lerp(s.tgt,Math.min(1,dt*9));s.o.position.copy(s.pos);s.o.position.y+=Math.sin(time*2+k)*.08;const ahead=s.tgt.clone().sub(s.pos);if(ahead.lengthSq()>.001)s.o.lookAt(s.o.position.clone().add(ahead));else s.o.rotation.y+=dt*.6});
 if(V.monG)V.monG.children.forEach((s,k)=>{if(s.userData.by==null)s.userData.by=s.position.y;s.position.y=s.userData.by+Math.sin(time*2.2+k)*.18});
 if(V.px){const ox=(c.th*180)%400,oy=(c.ph-.955)*300;V.px[0].style.transform=`translate(${-ox*.35-c.tx*6}px,${oy*.4+c.tz*4}px)`;V.px[1].style.transform=`translate(${-ox*.8-c.tx*14}px,${oy+c.tz*9}px)`}
 V.renderer.render(V.scene,V.camera);
 // 라벨 투영
 const W2=V.renderer.domElement.clientWidth,H2=V.renderer.domElement.clientHeight;
 V.labels.forEach((d,i)=>{const n=V.nodes[i];if(!n||!V.showLabels){d.style.display='none';return}const p=n.g.position.clone();p.y-=n.rad+.35;const q=p.project(V.camera);if(q.z>1){d.style.display='none';return}d.style.display='';const dist=V.camera.position.distanceTo(n.g.position);d.style.transform=`translate(-50%,0) translate(${(q.x+1)/2*W2}px,${(1-q.y)/2*H2}px) scale(${clamp(22/dist,.55,1.1)})`;d.style.zIndex=String(1000-Math.round(dist*10))});
}
