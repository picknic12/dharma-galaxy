// ================= v0.2 AI 연구소 · 카드 · 로봇 · 포션 · 아이템 · 몬스터 · 저장 =================
const IC=ItemCatalog;const KINDS=['core','body','power'];
function giveCard(p,n=1,why){const P=G.players[p];const got=[];for(let k=0;k<n;k++){const kind=pick(KINDS),i=ri(0,9);P.cards[kind][i]++;got.push(IC.card(kind,i))}
 if(p===0&&why)log(`🃏 ${why}: ${got.map(c=>`${c.label} 「${c.name}」(${c.hz})`).join(', ')}`,'good');return got}
function giveItem(p,why){const P=G.players[p];const r=rnd();const rar=r<.5?0:r<.78?1:r<.92?2:r<.985?3:4;const id=ri(0,IC.ITEM_COUNT/5-1)*5+rar;P.items.push(id);if(P.items.length>40)P.items.shift();G.codex.add(id);const it=IC.item(id);
 if(p===0){log(`🎁 ${why||'아이템'}: [${it.rarityName}] ${it.name} — ${it.joke}`,'good');lootBeam(P.wid,P.pos,it.rarityColor)}return it}
function givePotion(p,why){const P=G.players[p];const id=ri(0,IC.POTION_COUNT-1);P.potions.push(id);if(P.potions.length>20)P.potions.shift();const po=IC.potion(id);if(p===0)log(`🧪 ${why||'포션'}: ${po.name}`,'good');return po}
// ---- 로봇 설계 ----
function design(ci,bi,pi,align){
 const c=IC.card('core',ci),b=IC.card('body',bi),w=IC.card('power',pi);const h=OH.harmony([c.el,b.el,w.el]);
 let atk=(c.atk+b.atk+w.atk)*(h.atk||h.mul),def=(c.def+b.def+w.def)*(h.hp||h.mul),prod=c.prod*b.prod*w.prod*h.mul;
 if(align==='빛')prod*=1.15;else atk*=1.2;
 atk=Math.round(atk);def=Math.round(def);const cost=Math.round(30+(atk+def)*1.2);const income=Math.round(cost/(13-prod*2)*10)/10;
 const els=[c.el,b.el,w.el];const dom=els.sort((a,b2)=>els.filter(x=>x===b2).length-els.filter(x=>x===a).length)[0];
 return {ci,bi,pi,align,name:`${c.name}·${b.name}·${w.name} ${align==='빛'?'光':'玄'}봇`,atk,def,income,cost,harmony:h.name,el:dom,recipe:ci*100+bi*10+pi+1,payback:Math.ceil(cost/Math.max(.1,income))}}
function canBuildRobot(p,d){const P=G.players[p];return P.cards.core[d.ci]>0&&P.cards.body[d.bi]>0&&P.cards.power[d.pi]>0&&P.cash>=d.cost&&P.robots.length<12}
function buildRobot(p,d){if(!canBuildRobot(p,d))return false;const P=G.players[p];P.cash-=d.cost;P.cards.core[d.ci]--;P.cards.body[d.bi]--;P.cards.power[d.pi]--;P.robots.push(Object.assign({hp:100},d));if(p===0){G.recipes.add(d.recipe*2+(d.align==='빛'?0:1));sfx('merge');burst();log(`🤖 로봇 탄생! ${d.name} (${d.harmony}) 공격 ${d.atk} · 방어 ${d.def} · 생산 ${fmt(d.income)}/일`,'good')}else log(`🤖 ${P.name} 연구소에서 ${d.name} 제조`,'ai');return true}
function robotMul(r){const day=G.astro.pillar.stemEl;return OH.saeng(day,r.el)?1.2:OH.geuk(day,r.el)?.9:1}
function robotIncome(p){const P=G.players[p];if(!P.robots.length)return;let s=0;for(const r of P.robots)s+=(r.income+eqBonus(r).inc)*robotMul(r)*(r.hp/100);s=Math.round(s*10)/10;if(s>0){P.cash=Math.round((P.cash+s)*10)/10;if(p===0&&rnd()<.35)log(`🏭 로봇 생산 수익 +${fmt(s)} (오늘 ${G.astro.pillar.hz}日의 기운 반영)`,'good')}}
function armyPower(p){const P=G.players[p];return 20+P.robots.reduce((a,r)=>{const b=eqBonus(r);return a+(r.atk+r.def+b.atk+b.def)*(r.hp/100)},0)+(P.buff.atk||0)+(P.buff.def||0)}
function aiLab(p){const P=G.players[p];const k=P.pers.key;if(P.robots.length>=12)return;const res=aiReserve(p);let best=null;
 for(let t=0;t<30;t++){const ci=ri(0,9),bi=ri(0,9),pi=ri(0,9);if(!P.cards.core[ci]||!P.cards.body[bi]||!P.cards.power[pi])continue;const d=design(ci,bi,pi,(k==='ares'||k==='hephaestus')&&rnd()<.6?'현기':'빛');const sc=(k==='ares'?d.atk*3:0)+d.income*10-d.payback;if(!best||sc>best.sc)best=Object.assign(d,{sc})}
 if(best&&P.cash-best.cost>res*(k==='hephaestus'||k==='isis'?.6:1))buildRobot(p,best);
 if((k==='hephaestus'||k==='isis')&&P.cash>res*2&&rnd()<.4){P.cash-=25;giveCard(p,1)}}
// ---- 포션 마시기 ----
function drink(p,idx){const P=G.players[p];const id=P.potions[idx];if(id==null)return;const po=IC.potion(id),m=po.mag;P.potions.splice(idx,1);P.know+=1;let t='';
 switch(po.essName){
  case '생명':P.robots.forEach(r=>r.hp=Math.min(100,r.hp+25*m));t='로봇들이 수리되었습니다';break;
  case '분노':P.buff.atk=(P.buff.atk||0)+15*m;t=`다음 전투 공격 +${Math.round(15*m)}`;break;
  case '강철':P.buff.def=(P.buff.def||0)+15*m;t=`다음 전투 방어 +${Math.round(15*m)}`;break;
  case '질풍':P.buff.move=(P.buff.move||0)+1;t='다음 이동 +1';break;
  case '화염':{const n=G.monsters.filter(x=>x.wid===P.wid&&Math.abs(x.pos-P.pos)<=3);n.forEach(x=>x.hp-=40*m);G.monsters=G.monsters.filter(x=>x.hp>0);t=`주변 몬스터 ${n.length}마리에 화염!`;renderMonsters();break}
  case '독':{const q=G.players.findIndex((Q,i)=>i!==p&&!Q.out&&Q.isAI);if(q>0){G.players[q].buff.poison=2;t=`${G.players[q].name}의 다음 통행료 수입 반감`}break}
  case '행운':P.qdice+=1;t='양자 관측권 +1';break;
  case '황금':{const a=Math.round(20*m);P.cash+=a;t=`+${fmt(a)}`;break}
  case '시간':if(P.jail){P.jail=false;t='감찰청에서 즉시 석방'}else{P.buff.free=1;t='면책 기운 보관'};break;
  case '투명':P.buff.freeRent=1;t='다음 통행료 1회 면제';break;
  case '예지':{const nx=OH.PHASES[(G.phase+1)%5];t=`다음 국면: ${OH.HZ[nx.el]} ${nx.name} (${G.phaseLeft}일 후)`;chakra(p,5);break}
  case '공포':G.monsters.forEach(x=>{if(x.wid===P.wid&&Math.abs(x.pos-P.pos)<=4)x.pos=(x.pos+ri(5,9))%W(x.wid).spaces.length});renderMonsters();t='몬스터들이 달아났습니다';break;
  case '번영':{const gs=new Set(allOwned(p).map(([w,i])=>sp(w,i).g));const mp={};gs.forEach(g=>mp[g]=Math.round(3*m));if(gs.size)shock(mp);t='보유 섹터 시세 상승';break}
  case '혼돈':{const k=pick(SKEYS);shock({[k]:ri(-15,25)});t='시장이 요동칩니다';break}
  case '지식':{P.know+=Math.round(5*m);const s=learnSpell(p,true);t=`지식 +${Math.round(5*m)}${s?` · 마법 「${s.name}」 습득`:''}`;break}
 }
 if(p===0){log(`🧪 ${po.name}을(를) 마셨습니다 — ${t}`,'good');sfx('pop',1,2,id%30)}renderAll()}
// ---- 몬스터 ----
const MON=[
 {n:'인플레 슬라임',o:{shape:'blob',color:'#9be3c4'},lv:1},{n:'버블 요정',o:{shape:'round',color:'#ffc6e6',wings:'fairy',eyeSize:5},lv:1},
 {n:'숏셀러 늑대',o:{shape:'round',color:'#b9c4d8',ears:'pointy',eyes:'angry',fangs:1},lv:2},{n:'부채 골렘',o:{shape:'golem',color:'#c9a98a',eyes:'angry'},lv:3},
 {n:'세금 유령',o:{shape:'ghost',color:'#e8ecff',eyes:'sleepy'},lv:2},{n:'랜섬 박쥐',o:{shape:'round',color:'#8f7cbf',wings:'bat',fangs:1,eyes:'angry'},lv:2},
 {n:'해킹 거미',o:{shape:'round',color:'#6b6b8f',legs:'spider',eyes:'angry'},lv:2},{n:'하락장 곰',o:{shape:'round',color:'#b08a6b',ears:'round',belly:1},lv:3},
 {n:'뱀파이어 대부업자',o:{shape:'hood',color:'#5a2d4a',wings:'bat'},lv:4},{n:'거품 드래곤',o:{shape:'round',color:'#ff9fb5',wings:'dragon',horns:1,tail:1,crown:1,fangs:1},lv:5},
 {n:'블랙스완',o:{shape:'bird',color:'#3a3550'},lv:5},{n:'성운 고래 수호신',o:{shape:'blob',color:'#8fd0ff',crown:1},lv:4}];
function spawnMonster(wid){const w=W(wid);const L=w.spaces.length;const k=ri(0,Math.min(11,3+Math.floor(G.round/4)+w.depth*2));const M=MON[k];const align=rnd()<.5?'빛':'현기';
 G.monsters.push({id:G.mseq++,k,wid,pos:ri(1,L-1),lv:M.lv+w.depth,hp:100,align});}
function monsterTick(){G.monsters.forEach(x=>{const L=W(x.wid).spaces.length;x.pos=(x.pos+ri(1,3))%L;if(x.pos===0&&W(x.wid).parent)x.pos=1});
 while(G.monsters.filter(x=>x.wid==='W0').length<4+Math.floor(G.round/6))spawnMonster('W0');
 for(const wid in G.worlds)if(wid!=='W0'&&!G.monsters.some(x=>x.wid===wid)&&rnd()<.5)spawnMonster(wid);
 renderMonsters()}
async function encounterQuick(p){const P=G.players[p];const x=G.monsters.find(m=>m.wid===P.wid&&m.pos===P.pos);if(!x)return;const M=MON[x.k];
 const ring=hasRing(p);if(ring){ring.c--;if(ring.c<=0)P.relics.splice(P.relics.indexOf(ring),1);log(`💍 ${who(p)} 솔로몬의 반지로 ${M.n}와(과) 대화 — 싸우지 않고 지나갑니다`,'good');chakra(p,4);return}
 const sp_=bestBattleSpell(p);const spB=sp_?sp_.pow*(OH.saeng(G.astro.pillar.stemEl,sp_.el)?1.2:1):0;
 const mp=x.lv*38*(x.hp/100),pp=armyPower(p)+spB;const chance=Math.round(pp/(pp+mp)*100);const bribe=Math.round(15+x.lv*10);
 let c;if(isHuman(p))c=await ask(`👾 <b>${esc(M.n)}</b> (Lv.${x.lv} · ${x.align==='빛'?'✨빛':'🌑현기'})이(가) 항로를 막았습니다!<br>내 로봇 전력 ${Math.round(pp)} vs 몬스터 ${Math.round(mp)} — 승리 확률 약 ${chance}%${sp_?`<br>🔮 출격하면 「${esc(sp_.name)}」 자동 시전 (마나 ${sp_.mp})`:''}`,[{t:'⚔️ 로봇 출격',v:'fight',main:1},{t:`💸 통행세 ${fmt(bribe)} 내고 지나가기`,v:'bribe',en:()=>G.players[p].cash>=bribe}],{auto:()=>chance>=45||P.cash<bribe?'fight':'bribe'});
 else c=chance>=40||P.cash<bribe?'fight':'bribe';
 if(c==='bribe'){P.cash-=bribe;G.pot+=bribe;log(`💸 ${who(p)} ${M.n}에게 통행세 ${fmt(bribe)}`,'sys');return}
 // 빛/현기 상성: 반대 성향이면 서로 +15%
 if(sp_)castBattle(p,sp_);let eff=pp;if(P.robots.length&&P.robots.filter(r=>r.align!==x.align).length>P.robots.length/2)eff*=1.15;
 const win=rnd()<eff/(eff+mp);P.buff.atk=0;P.buff.def=0;shake();sfx(win?'win':'hit',1);
 if(win){G.monsters.splice(G.monsters.indexOf(x),1);const cash=Math.round(30+x.lv*25);P.cash+=cash;P.know+=x.lv;if(p===0)G.stats.kills2=(G.stats.kills2||0)+1;
  log(`⚔️ ${who(p)} ${M.n} 격파! +${fmt(cash)} · 지식 +${x.lv}`,p===0?'good':'ai');giveCard(p,1+(x.lv>3?1:0),'전리품 카드');if(rnd()<.6)givePotion(p,'전리품 포션');giveItem(p,'전리품');if(x.lv>=3&&rnd()<.3)learnSpell(p);if(x.lv>=4&&rnd()<.25)giveRelic(p,M.n+' 처치');if(p===0)burst()}
 else{const loss=Math.round(P.cash*.05);P.cash-=loss;P.robots.forEach(r=>r.hp=Math.max(20,r.hp-25));log(`💥 ${who(p)} ${M.n}에게 패배 — ${fmt(loss)} 손실, 로봇 손상`,'bad')}
 renderMonsters();renderAll()}
// 3D 몬스터 스프라이트
const monTex={};function svgTex(svg){const t=new THREE.TextureLoader().load('data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg.replace('<svg ','<svg width="256" height="256" ')))));return t}
function renderMonsters(){if(!V.ok||!G)return;if(!V.monG){V.monG=new THREE.Group();V.scene.add(V.monG)}clearGroup(V.monG);
 G.monsters.filter(x=>x.wid===V.view).forEach((x,k)=>{const M=MON[x.k];const key=x.k+x.align;if(!monTex[key])monTex[key]=svgTex(SK.creature(Object.assign({},M.o,{glow:x.align==='빛'?'#fff1a8':'#8f5cff'})));
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:monTex[key],transparent:true,depthWrite:false}));const p=nodePos(x.wid,x.pos);s.position.set(p.x+.9,p.y+1.1,p.z-.6);const sc=1.3+x.lv*.15;s.scale.set(sc,sc,1);s.userData.bob=k;V.monG.add(s);
  const a=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(x.align==='빛'?'rgba(255,240,170,.7)':'rgba(140,90,255,.7)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));a.position.copy(s.position);a.scale.set(sc*2,sc*2,1);V.monG.add(a)})}
function lootBeam(wid,pos,col){if(!V.ok||wid!==V.view)return;const p=nodePos(wid,pos);const m=new THREE.Mesh(new THREE.CylinderGeometry(.12,.35,9,16,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(p.x,p.y+4.5,p.z);V.scene.add(m);let t=0;const f=()=>{t+=.016;m.material.opacity=.75*(1-t/2.2);m.scale.x=m.scale.z=1+t*.6;if(t<2.2)requestAnimationFrame(f);else{V.scene.remove(m);m.geometry.dispose();m.material.dispose()}};f()}
// ---- 연구소 UI ----
let labSel={ci:0,bi:0,pi:0,align:'빛'};
function renderLab(){const box=$('#lab');if(!box||!G)return;const P=G.players[0];const d=design(labSel.ci,labSel.bi,labSel.pi,labSel.align);
 const opt=(kind,key)=>IC.CARDS[kind].map((c,i)=>`<option value="${i}" ${labSel[key]===i?'selected':''}>${c[0]} (${OH.HZ[c[4]]}) ×${P.cards[kind][i]}</option>`).join('');
 const robo=SK.robot({chassis:d.bi%6,color:SK.mix(OH.COLOR[d.el],.3),accent:d.align==='빛'?'#fff1a8':'#a67cff',eye:d.ci%4,antenna:d.pi%5,arm:['cannon','shield','blade','orb','wrench','claw'][(d.ci+d.pi)%6],move:['legs','tread','hover','wings'][d.pi%4]});
 box.innerHTML=`<div class="sub">카드 3장(지능 코어·기체·동력)을 연금술로 합성해 로봇을 만듭니다. 1,000가지 조합 × 빛/현기 = 2,000가지 설계 · 발견 ${G.recipes.size}/2000</div>
 <div class="labg"><div><label>지능 코어</label><select id="lc">${opt('core','ci')}</select><label>기체</label><select id="lb">${opt('body','bi')}</select><label>동력</label><select id="lp">${opt('power','pi')}</select>
 <label>성향</label><select id="la"><option ${labSel.align==='빛'?'selected':''}>빛</option><option ${labSel.align==='현기'?'selected':''}>현기</option></select></div>
 <div class="robo ${d.align==='빛'?'light':'dark'}">${robo}</div></div>
 <div class="sub"><b>${esc(d.name)}</b> · ${d.harmony} · 주 기운 ${OH.HZ[d.el]}<br>공격 <b>${d.atk}</b> · 방어 <b>${d.def}</b> · 생산 <b>${fmt(d.income)}</b>/일 · 비용 ${fmt(d.cost)} · 회수 ${d.payback}일</div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0"><button class="btn sm main" id="mk" ${canBuildRobot(0,d)?'':'disabled'}>⚗️ 합성·제조</button><button class="btn sm" id="pack" ${P.cash>=25?'':'disabled'}>🃏 카드 팩 (25억)</button></div>
 <h3 style="margin-top:8px">🤖 나의 로봇 (${P.robots.length}/12) · 전력 ${Math.round(armyPower(0))}</h3>${P.robots.map(r=>`<div class="sub">${r.align==='빛'?'✨':'🌑'} ${esc(r.name)} · 공${r.atk} 방${r.def} · 생산 ${fmt(r.income)} · 내구 ${Math.round(r.hp)}%</div>`).join('')||'<div class="sub">아직 로봇이 없습니다.</div>'}
 <h3 style="margin-top:8px">🧪 포션 (${P.potions.length})</h3>${P.potions.map((id,k)=>{const po=IC.potion(id);return `<div class="asset"><span style="width:26px;height:26px">${SK.potion(po.flask,po.color)}</span><span>${esc(po.name)}<br><small class="sub">마시기: ${esc(po.uses[0].text)} · 전투: ${esc(po.uses[1].text)} · 촉매: ${esc(po.uses[2].text)}</small></span><button class="btn sm" data-d="${k}">마시기</button></div>`}).join('')||'<div class="sub">포션이 없습니다. 몬스터·보물 행성에서 얻습니다.</div>'}
 <div class="sub" style="margin-top:6px">📚 지식 ${P.know} · 도감: 아이템 ${G.codex.size}/${IC.ITEM_COUNT.toLocaleString()} <button class="btn sm" id="codex">📖 도감 검색</button></div><div id="lab3"></div>`;
 ['lc','lb','lp','la'].forEach((id,k)=>$('#'+id).onchange=e=>{labSel[['ci','bi','pi','align'][k]]=k<3?+e.target.value:e.target.value;renderLab()});
 $('#mk').onclick=()=>{if(buildRobot(0,design(labSel.ci,labSel.bi,labSel.pi,labSel.align)))renderAll()};$('#pack').onclick=()=>{if(P.cash>=25){P.cash-=25;giveCard(0,1,'카드 팩');sfx('coin');renderAll()}};
 box.querySelectorAll('button[data-d]').forEach(b=>b.onclick=()=>drink(0,+b.dataset.d));$('#codex').onclick=codexModal;renderLab3()}
function codexModal(){modal(`<h2>📖 은하 도감</h2><div class="sub">아이템 ${IC.ITEM_COUNT.toLocaleString()}종 · 포션 ${IC.POTION_COUNT}종(용도 ${IC.POTION_COUNT*3}가지) · 로봇 설계 2,000가지. 발견한 아이템에는 ✔가 붙습니다.</div>
 <input id="cq" placeholder="검색: 예) 지니, 전설, 火, 현기, 회복…"><div style="display:flex;gap:6px;margin:8px 0"><button class="btn sm main" id="cqi">아이템</button><button class="btn sm" id="cqp">포션</button></div><div id="cres" style="max-height:52vh;overflow:auto"></div>
 <button class="btn" onclick="document.getElementById('modal').classList.remove('show')">닫기 <kbd>Esc</kbd></button>`);
 let mode='i';const draw=()=>{const q=$('#cq').value;const r=$('#cres');if(mode==='i')r.innerHTML=IC.searchItems(q,60).map(it=>`<div class="asset"><span style="width:30px;height:30px">${SK.item(it.shape,OH.COLOR[it.el],it.rarity)}</span><span>${G.codex.has(it.id)?'✔ ':''}<b style="color:${it.rarityColor}">[${it.rarityName}]</b> ${esc(it.name)} <small class="sub">${it.cat} · ${it.align} · ${it.effect}</small><br><small class="sub">${esc(it.joke)}</small></span><span class="sub">#${it.id}</span></div>`).join('');
  else r.innerHTML=IC.searchPotions(q,60).map(po=>`<div class="asset"><span style="width:30px;height:30px">${SK.potion(po.flask,po.color)}</span><span><b>${esc(po.name)}</b><br><small class="sub">${po.uses.map(u=>u.ctx+': '+u.text).join(' · ')}</small></span><span class="sub">#${po.id}</span></div>`).join('')};
 $('#cq').oninput=draw;$('#cqi').onclick=()=>{mode='i';draw()};$('#cqp').onclick=()=>{mode='p';draw()};draw()}
// ---- 저장·불러오기 ----
function saveGame(){try{const S=JSON.parse(JSON.stringify(G,(k,v)=>v instanceof Set?{__set:[...v]}:(k==='pers'&&v&&v.key)?{__pers:v.key}:(k==='ask'?null:v)));S.rngState=null;localStorage.setItem('dagal_save',JSON.stringify(S));toast('💾 저장했습니다 (이 브라우저)');return true}catch(e){toast('저장할 수 없는 환경입니다');return false}}
function loadGame(){let S;try{S=JSON.parse(localStorage.getItem('dagal_save')||'null')}catch(e){}if(!S){toast('저장된 게임이 없습니다');return}
 TOKEN++;if(pendingAsk){try{pendingAsk.rej(ABORT)}catch(e){}pendingAsk=null}
 const rev=v=>{if(v&&typeof v==='object'){if(v.__set)return new Set(v.__set);if(v.__pers)return PERS.find(p=>p.key===v.__pers)||PERS[0];for(const k in v)v[k]=rev(v[k])}return v};
 G=rev(S);G.startDate=new Date(G.startDate);G.date=new Date(G.date);G.ask=null;G.over=false;R=PicnicRng.create(Date.now()%1e9);if(!G.players[0].pers)G.players[0].pers=Object.assign({},PERS[0],{quotes:['']});
 V.ships.forEach(s=>s.o&&V.shipG.remove(s.o));V.ships=[];closeModal();buildWorld(G.players[0].wid);renderMonsters();renderAll();toast('📂 불러왔습니다');log('📂 저장된 항해를 이어갑니다','sys');gameLoop()}
// ---- 시점·전체화면 ----
function isoView(){const c=V.cam;V.iso=!V.iso;c.ph=V.iso?.8:.955;c.tr=V.iso?22:28;toast(V.iso?'🎥 2.5D 근접 쿼터뷰 (디아블로식)':'🎥 2.5D 전경 쿼터뷰')}
function fullScreen(){const d=document.documentElement;try{if(!document.fullscreenElement)d.requestFullscreen().catch(()=>toast('전체 화면을 쓸 수 없는 환경입니다'));else document.exitFullscreen()}catch(e){toast('전체 화면을 쓸 수 없는 환경입니다')}}
$('#bFull').onclick=fullScreen;$('#bPanel').onclick=()=>document.body.classList.toggle('nopanel');$('#bSave').onclick=saveGame;$('#bLoad').onclick=loadGame;
addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||$('#modal').classList.contains('show'))return;const k=e.key.toLowerCase();if(k==='v')isoView();else if(k==='z')fullScreen();else if(k==='q')document.body.classList.toggle('nopanel');else if(k==='s'&&e.ctrlKey){e.preventDefault();saveGame()}else if(k==='4')tab('lab');else if(k==='5')tab('bank');else if(k==='6')tab('hero')});
