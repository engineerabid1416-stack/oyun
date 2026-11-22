async function go(mode){P.name=$('nm').value.trim().slice(0,12)||'Oyuncu';let code='';
 if(mode==='join'){code=$('cd').value.trim().toUpperCase();if(code.length<4){$('msg').textContent='Önce oda kodunu gir';return}}
 if(mode==='host'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(let i=0;i<5;i++)code+=A[Math.floor(Math.random()*A.length)]}
 $('msg').textContent='Bağlanıyor…';
 if(mode==='solo'){for(let i=0;i<4;i++)addP('b'+i,1)}
 else{const e=await net(code,mode==='host').catch(()=>'Bağlantı kurulamadı, tekrar dene.');if(e){$('msg').textContent=e;return}$('code').textContent='ODA KODU: '+code}
 $('menu').style.display='none';$('hud').style.display='block';playing=1;spawn();
 try{const f=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();const lk=()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{});f&&f.then?f.then(lk).catch(()=>{}):lk()}catch(e){}}
// ---- mağaza ----
function buyUI(){let h=`<h3 style="text-align:center">MAĞAZA 💰${P.cred}</h3>`;
 W.forEach((w,i)=>{h+=`<div class=r><b>${w.n}</b><span>Hasar ${dmg(w)} · Kafa = ÖLÜM</span>`+(w.own?`<button class=g onclick="sel(${i})">${P.cur==i?'Seçili':'Seç'}</button><button onclick="up(${i})">+10 hasar 💰100</button>`:`<button onclick="buy(${i})">Al 💰${w.p}</button>`)+`</div>`});
 [['heals','✚ Şifa paketi',100],['fl','✦ Flash',150],['sm','☁ Sis bombası',150]].forEach(a=>h+=`<div class=r><b>${a[1]}</b><span>Elinde: ${P[a[0]]}</span><button onclick="item('${a[0]}',${a[2]})">💰${a[2]}</button></div>`);
 h+=`<div class=r><b>Cephane</b><span>+1 şarjör</span><button onclick="item('am',100)">💰100</button></div><div class=r><b>Nişangah</b><span>Şekil seç</span><button class="g" onclick="xh('dot')">●</button><button class="g" onclick="xh('ring')">◯</button><button class="g" onclick="xh('plus')">＋</button></div><button class=g onclick="tb()">Kapat</button><button class=g onclick="tb();startEdit()">🎛 Tuş düzeni</button>`;$('buy').innerHTML=h}
function tb(){showBuy=!showBuy;$('buy').style.display=showBuy?'flex':'none';if(showBuy){buyUI();document.exitPointerLock&&document.exitPointerLock()}}
const buy=i=>{if(P.cred>=W[i].p){P.cred-=W[i].p;W[i].own=1;P.cur=i;buyUI()}},up=i=>{if(P.cred>=100){P.cred-=100;W[i].inv+=100;buyUI()}},sel=i=>{swap(i);buyUI()},
item=(k,c)=>{if(P.cred<c)return;P.cred-=c;k==='am'?W[P.cur].res+=W[P.cur].mag:P[k]++;buyUI()};
// ---- girdi: klavye/fare ----
const keys={},ms={l:0,r:0};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Space'||e.code==='Tab')e.preventDefault();if(keys[e.code])return;keys[e.code]=1;if(!playing)return;
 ({KeyR:reload,KeyH:heal,KeyF:()=>throwG('f'),KeyG:()=>throwG('s'),KeyB:tb,Digit1:()=>swap(0),Digit2:()=>swap(1),Digit3:()=>swap(2),Digit4:()=>swap(3)})[e.code]?.()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousedown',e=>{if(!playing||showBuy||e.target.tagName==='BUTTON')return;if(!document.pointerLockElement&&!document.body.classList.contains('touch'))$('c').requestPointerLock&&$('c').requestPointerLock();e.button===0?ms.l=1:e.button===2&&(ms.r=1)});
addEventListener('mouseup',e=>{e.button===0?ms.l=0:e.button===2&&(ms.r=0)});
addEventListener('mousemove',e=>{if(document.pointerLockElement){const s=.0022*(P.ads?.6:1);P.yaw-=e.movementX*s;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-e.movementY*s))}});
// ---- girdi: dokunmatik ----
const tc={mx:0,mz:0,fire:0,ads:0,cr:0,jump:0};let jt=null,lt=null,jo,ll;
const cv=$('c');cv.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){if(t.clientX<innerWidth*.4&&jt===null){jt=t.identifier;jo={x:t.clientX,y:t.clientY};for(const i of['jb','jk']){$(i).style.display='block';$(i).style.left=jo.x+'px';$(i).style.top=jo.y+'px'}}else if(lt===null){lt=t.identifier;ll={x:t.clientX,y:t.clientY}}}},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){if(t.identifier===jt){let dx=(t.clientX-jo.x)/50,dy=(t.clientY-jo.y)/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}tc.mx=dx;tc.mz=-dy;$('jk').style.left=jo.x+dx*50+'px';$('jk').style.top=jo.y+dy*50+'px'}
 else if(t.identifier===lt){const s=.0055*(P.ads?.6:1);P.yaw-=(t.clientX-ll.x)*s;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-(t.clientY-ll.y)*s));ll={x:t.clientX,y:t.clientY}}}},{passive:false});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier===jt){jt=null;tc.mx=tc.mz=0;$('jb').style.display=$('jk').style.display='none'}if(t.identifier===lt)lt=null}};
cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);
const act={fire:d=>tc.fire=d,jump:d=>tc.jump=d,ads:d=>d&&(tc.ads^=1),cr:d=>d&&(tc.cr^=1),rl:d=>d&&reload(),hl:d=>d&&heal(),fb:d=>d&&throwG('f'),sg:d=>d&&throwG('s'),sw:d=>d&&nextW(1),by:d=>d&&tb()};
[['fire','🔫',18,24,84],['ads','🔭',112,112,52],['jump','⤒',112,30,52],['cr','⤓',18,118,52],['rl','↻',190,30,48],['hl','✚',190,86,48],['fb','✦',18,184,48],['sg','☁',76,184,48],['sw','⇄',134,184,48]].forEach(([id,l,r,b,s])=>{
 const e=document.createElement('div');e.className='tb';e.textContent=l;e.style.cssText+=`right:${r}px;bottom:calc(${b}px + env(safe-area-inset-bottom,0px));width:${s}px;height:${s}px`;
 e.addEventListener('touchstart',x=>{x.preventDefault();act[id](1)},{passive:false});e.addEventListener('touchend',()=>act[id](0));e.addEventListener('touchcancel',()=>act[id](0));document.body.appendChild(e)});
{const e=document.createElement('div');e.className='tb';e.textContent='$';e.style.cssText+='right:10px;top:calc(8px + env(safe-area-inset-top,0px));width:44px;height:44px';e.addEventListener('touchstart',x=>{x.preventDefault();act.by(1)},{passive:false});document.body.appendChild(e)}
// ---- DualSense / gamepad ----
const G={mx:0,mz:0,fire:0,ads:0,jump:0,cr:0};let gp=[];
function pad(dt){const g=[...(navigator.getGamepads?navigator.getGamepads():[])].find(x=>x&&x.connected);document.body.classList.toggle('pad',!!g);if(!g){G.mx=G.mz=G.fire=G.ads=G.jump=G.cr=0;return}
 const a=i=>Math.abs(g.axes[i]||0)>.14?g.axes[i]:0,b=i=>g.buttons[i]?g.buttons[i].pressed:0,e=i=>b(i)&&!gp[i];
 G.mx=a(0);G.mz=-a(1);const s=dt*(P.ads?1.4:2.8);P.yaw-=a(2)*s;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-a(3)*s*.8));
 G.fire=b(7);G.ads=b(6);G.jump=b(0);G.cr=b(4)||b(10);
 if(playing){if(e(2))reload();if(e(3))heal();if(e(1))throwG('f');if(e(5))throwG('s');if(e(15))nextW(1);if(e(14))nextW(-1)}
 if(playing&&(e(9)||e(17)))tb();gp=g.buttons.map(x=>x.pressed)}
// ---- döngü ----
let last=performance.now(),hudT=0;
