const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:900,height:640}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+__dirname+'/../docs/index.html');await p.waitForTimeout(1500);
 await p.screenshot({path:'shot_setup.png'});
 const n=+(process.argv[2]||7), rounds=+(process.argv[3]||30);
 for(const seed of (process.argv[4]||"1,2,3").split(",").map(Number)){
  await p.evaluate(([n,seed,rounds])=>{document.getElementById('modal').classList.remove('show');window.__game.start({name:'테스터',birth:'1970-05-05',ai:n,diff:'hard',rounds,speed:'test',seed:String(seed),auto:true})},[n,seed,rounds]);
  const t0=Date.now();
  while(Date.now()-t0<100000){const o=await p.evaluate(()=>window.__game.G.over);if(o)break;await p.waitForTimeout(500)}
  const r=await p.evaluate(()=>{const G=window.__game.G;return {over:G.over,round:G.round,worlds:Object.keys(G.worlds).length,players:G.players.map(P=>P.name+':'+Math.round(P.cash)+(P.out?'(out)':'')+' s'+P.shards+' r'+P.robots.length+' d'+Math.round(P.dep)+' L'+Math.round(P.loan)+' st'+P.stock+' pot'+P.potions.length),mon:G.monsters.length,kills:G.stats.kills2||0,codex:G.codex.size,title:document.querySelector('#dlg h2')?.textContent,log:G.log.slice(0,3).map(l=>l.t)}});
  console.log(JSON.stringify(r));
 }
 await p.evaluate(()=>document.getElementById('modal').classList.remove('show'));
 await p.waitForTimeout(800);await p.screenshot({path:'shot_end.png'});
 console.log('ERRORS',errs.length,errs.slice(0,3).map(e=>e.slice(0,300)));
 await b.close();
})();
