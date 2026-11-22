const $=i=>document.getElementById(i),T=THREE;
if('ontouchstart' in window||navigator.maxTouchPoints>0)document.body.classList.add('touch');
$('nm').value='Oyuncu'+Math.floor(Math.random()*90+10);
const ren=new T.WebGLRenderer({canvas:$('c'),antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,1.75));
const scene=new T.Scene(),cam=new T.PerspectiveCamera(75,1,.05,200);cam.rotation.order='YXZ';
scene.background=new T.Color(0x8fb6d9);scene.fog=new T.Fog(0x8fb6d9,35,120);
scene.add(new T.HemisphereLight(0xffffff,0x556677,1.1),cam);
const sun=new T.DirectionalLight(0xffffff,.9);sun.position.set(30,50,20);scene.add(sun);
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
// ---- harita (herkeste aynı) ----
const solids=[],boxes=[];
function box(x,z,w,h,d,col){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color:col}));m.position.set(x,h/2,z);scene.add(m);solids.push(m);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top:h})}
const fl=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshLambertMaterial({color:0x3a4650}));fl.rotation.x=-Math.PI/2;scene.add(fl,new T.GridHelper(100,50,0x667788,0x4a5866));solids.push(fl);
[[0,-40,82,6,2],[0,40,82,6,2],[-40,0,2,6,82],[40,0,2,6,82]].forEach(a=>box(a[0],a[1],a[2],a[3],a[4],0x5b6573));
let sd=7;const sr=()=>(sd=sd*16807%2147483647)/2147483647;
for(let i=0;i<28;i++){const w=2+sr()*5,d=2+sr()*5,h=[1,1,2.5,3.5,4.5][i%5];box((sr()-.5)*72,(sr()-.5)*72,w,h,d,[0xd9506a,0x4fb6a5,0xe0b45a,0x7a85d6][i%4])}
const blocked=(x,z,y)=>boxes.some(b=>x>b.x0-.35&&x<b.x1+.35&&z>b.z0-.35&&z<b.z1+.35&&y<b.top-.25);
const gnd=(x,z,y)=>{let g=0;for(const b of boxes)if(x>b.x0-.2&&x<b.x1+.2&&z>b.z0-.2&&z<b.z1+.2&&b.top<=y+.35&&b.top>g)g=b.top;return g};
// ---- silahlar ----
const W=[{n:'Classic',mz:-.32,p:0,d:26,rate:.2,mag:12,auto:0,fov:60,sp:.012,own:1},{n:'Sheriff',mz:-.46,p:400,d:55,rate:.45,mag:6,auto:0,fov:55,sp:.006},{n:'Vandal',mz:-.75,p:1000,d:40,rate:.1,mag:25,auto:1,fov:50,sp:.015},{n:'Operator',mz:-1.2,p:1500,d:120,rate:1.1,mag:5,auto:0,fov:20,sp:.001}];
W.forEach(w=>{w.inv=0;w.ammo=w.mag;w.res=w.mag*3;w.own=w.own||0});
const dmg=w=>w.d+w.inv/10;
const P={x:0,y:0,z:0,vy:0,yaw:0,pitch:0,ch:1.65,hp:100,cred:2500,heals:2,fl:2,sm:2,k:0,d:0,dead:0,cur:0,rl:0,nx:0,t:0,healT:0,blind:0,dmgT:0,mf:0,og:1,fh:0,name:'Oyuncu'};
const gm=(w,h,d,c,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color:c}));m.position.set(x,y,z);return m};
const gun=new T.Group();gun.position.set(.22,-.2,-.5);cam.add(gun);
const wm=[
 [[.07,.08,.32,0x9aa5b1,0,.03,-.1],[.06,.05,.28,0x2b3138,0,-.02,-.08],[.055,.15,.07,0x1a1d21,0,-.1,.04],[.03,.03,.06,0x111111,0,.03,-.28],[.02,.025,.02,0xff4655,0,.08,.04]],
 [[.04,.04,.42,0xc0c8d0,0,.04,-.24],[.075,.075,.1,0x8a939d,0,.03,-.03],[.06,.09,.2,0x3a424b,0,.02,.06],[.055,.16,.07,0x6b4a2f,0,-.1,.08],[.02,.04,.03,0x111111,0,.09,.12],[.03,.03,.04,0x111111,0,.07,-.44]],
 [[.07,.09,.5,0x3a4350,0,0,-.05],[.03,.03,.3,0x111111,0,.02,-.55],[.08,.07,.28,0x2b3138,0,-.01,-.4],[.05,.17,.07,0x1f242a,0,-.13,-.08],[.05,.12,.06,0x1a1d21,0,-.1,.14],[.06,.1,.22,0x2b3138,0,-.02,.3],[.03,.04,.1,0x111111,0,.07,-.2],[.072,.02,.2,0xff4655,0,.05,-.05],[.045,.045,.06,0x111111,0,.02,-.72]],
 [[.07,.1,.6,0x2f3a2f,0,0,-.05],[.035,.035,.7,0x111111,0,.02,-.7],[.065,.065,.32,0x111111,0,.1,-.15],[.07,.07,.03,0x4fb6ff,0,.1,-.32],[.03,.04,.04,0x222222,0,.06,-.05],[.03,.04,.04,0x222222,0,.06,-.28],[.05,.1,.08,0x1f242a,0,-.1,-.05],[.07,.12,.28,0x2f3a2f,0,-.02,.3],[.055,.055,.08,0x111111,0,.02,-1.05]]
].map(a=>{const g=new T.Group();a.forEach(p=>g.add(gm(...p)));gun.add(g);return g});
const mfl=new T.Mesh(new T.BoxGeometry(.12,.12,.1),new T.MeshBasicMaterial({color:0xffd34d}));mfl.position.set(0,.03,-.32);mfl.visible=false;gun.add(mfl);
// ---- oyuncular ----
const players={},rc=new T.Raycaster();let rm=null,myId=null,peerL=[],playing=0,showBuy=0;
const hue=id=>{let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%360;return new T.Color().setHSL(h/360,.7,.55)};
function addP(id,bot){const g=new T.Group(),M=c=>new T.MeshLambertMaterial({color:c}),B=(w,h,d,c,y)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));m.position.y=y;return m};
 const b=B(.7,1.1,.4,hue(id),.95),l=B(.6,.7,.35,0x222831,.35),h=new T.Mesh(new T.SphereGeometry(.17,12,10),M(0xf2c9a0));h.position.y=1.72;h.userData.head=1;
 const gn=B(.08,.1,.5,0x111111,1.1);gn.position.set(.3,1.1,-.35);g.add(b,l,h,gn);
 const parts=[b,l,h];parts.forEach(x=>x.userData.pid=id);g.userData.parts=parts;scene.add(g);
 players[id]={m:g,id,bot,hp:100,name:bot?'Bot':'?',tx:0,ty:0,tz:0,ry:0,k:0,d:0,wt:0,dir:0,mv:0};if(bot)rbot(players[id])}
function rbot(p){for(let i=0;i<40;i++){const x=(Math.random()-.5)*70,z=(Math.random()-.5)*70;if(!blocked(x,z,0)){p.m.position.set(x,0,z);return}}}
// ---- efektler ----
const fxs=[],gr=[];
function tracer(a,b){const l=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...a),new T.Vector3(...b)]),new T.LineBasicMaterial({color:0xffe27a}));scene.add(l);fxs.push({k:'t',g:l,t:.07})}
function boom(k,p){const v=new T.Vector3(...p);
 if(k==='s'){const g=new T.Group(),mat=new T.MeshBasicMaterial({color:0xcfd6dc,transparent:true,opacity:.85,depthWrite:false});
  for(let i=0;i<14;i++){const s=new T.Mesh(new T.SphereGeometry(1.5+Math.random(),10,8),mat);s.position.set((Math.random()-.5)*5,Math.random()*2.5+.8,(Math.random()-.5)*5);g.add(s)}
  g.position.set(v.x,0,v.z);scene.add(g);fxs.push({k,g,mat,t:10});return}
 const g=new T.Mesh(new T.SphereGeometry(.4,10,8),new T.MeshBasicMaterial({color:0xffffff}));g.position.copy(v);scene.add(g);fxs.push({k,g,t:.35});
 const to=cam.position.clone().sub(v),dist=to.length();if(dist>45||P.dead)return;to.normalize();
 rc.set(v,to);rc.far=dist;const occ=rc.intersectObjects(solids,false).length;
 const d=new T.Vector3();cam.getWorldDirection(d);const look=Math.min(1,Math.max(0,(-d.dot(to)+.3)/1.3));
 if(!occ)P.blind=Math.max(P.blind,.8+3.5*(1-dist/45)*look)}
function throwG(k){if(P.dead||!playing)return;if(k==='f'){if(P.fl<1)return;P.fl--}else{if(P.sm<1)return;P.sm--}
 const d=new T.Vector3();cam.getWorldDirection(d);
 const m=new T.Mesh(new T.SphereGeometry(.1,8,8),new T.MeshBasicMaterial({color:k==='f'?0xffffaa:0x9aa5b1}));m.position.copy(cam.position).addScaledVector(d,.5);scene.add(m);
 gr.push({m,k,v:d.clone().multiplyScalar(15).add(new T.Vector3(0,3,0)),t:1.1})}
// ---- savaş ----
function feed(t){const e=document.createElement('div');e.textContent=t;$('feed').appendChild(e);setTimeout(()=>e.remove(),4000)}
function reload(){const w=W[P.cur];if(P.rl>0||w.ammo>=w.mag||w.res<=0||P.dead)return;P.rl=w.n==='Operator'?2.4:1.6}
function heal(){if(P.dead||P.heals<1||P.hp>=100||P.healT>0)return;P.heals--;P.healT=2}
function swap(i){if(W[i]&&W[i].own&&!P.dead){P.cur=i;P.rl=0}}
function nextW(s){let i=P.cur;do{i=(i+s+4)%4}while(!W[i].own);swap(i)}
function shoot(w){w.ammo--;const d=new T.Vector3();cam.getWorldDirection(d);
 const sp=w.sp*(P.ads?.25:1)*(P.og?1:3);d.x+=(Math.random()-.5)*sp*2;d.y+=(Math.random()-.5)*sp*2;d.z+=(Math.random()-.5)*sp*2;d.normalize();
 cam.updateMatrixWorld();rc.set(cam.position,d);rc.far=150;
 const tg=[...solids];for(const id in players){const p=players[id];if(p.m.visible)tg.push(...p.m.userData.parts)}
 const h=rc.intersectObjects(tg,false)[0],end=h?h.point:cam.position.clone().addScaledVector(d,100);
 const st=cam.localToWorld(new T.Vector3(.2,-.15,-.6)),a=[st.x,st.y,st.z],b=[end.x,end.y,end.z];
 tracer(a,b);rm&&rm.emit('fx',{k:'t',a,b}).catch(()=>{});P.mf=.05;P.pitch+=w.auto?.004:.012;gun.position.z=-.42;
 if(h&&h.object.userData.pid)dmgTo(h.object.userData.pid,h.object.userData.head?9999:dmg(w),h.object.userData.head)}
function dmgTo(id,d,hd){const p=players[id];if(!p||p.dead)return;const c=$('cross');c.classList.add('hit');setTimeout(()=>c.classList.remove('hit'),120);
 if(p.bot){p.hp-=d;if(p.hp<=0){P.k++;P.cred+=300;p.m.visible=false;p.dead=1;feed('Bot öldürüldü +300');setTimeout(()=>{p.hp=100;p.dead=0;p.m.visible=true;rbot(p)},3000)}}
 else rm&&rm.emit('hit',{t:id,d,by:myId,h:hd?1:0}).catch(()=>{})}
function die(by){P.dead=1;P.d++;P.hp=0;$('dead').style.display='flex';rm&&rm.emit('died',{by,v:myId}).catch(()=>{});
 setTimeout(()=>{P.hp=100;P.dead=0;P.healT=0;spawn();W.forEach(w=>{w.ammo=w.mag;w.res=w.mag*3});$('dead').style.display='none'},3000)}
function spawn(){for(let i=0;i<50;i++){const x=(Math.random()-.5)*70,z=(Math.random()-.5)*70;if(!blocked(x,z,0)){P.x=x;P.z=z;break}}P.y=0;P.vy=0}
// ---- online ----
async function net(code,host){
 const room=window.claude?await claude.use('room'):null;if(!room)return 'Online bağlantı yok. Oyunu Claude üzerindeki bağlantıdan aç.';
 rm=await room.join('valo-'+code);
 rm.onPeers(ch=>{peerL=ch.peers;ch.peers.forEach(p=>{if(p.isMe){myId=p.peer;return}let q=players[p.peer];const s=p.presence||{};
  if(!q){addP(p.peer,0);q=players[p.peer];q.m.position.set(s.x||0,s.y||0,s.z||0)}
  q.tx=s.x||0;q.ty=s.y||0;q.tz=s.z||0;q.ry=s.ry||0;q.name=s.name||'Oyuncu';q.k=s.k||0;q.d=s.d||0;q.m.visible=!s.dead;q.cr=s.cr});
  ch.left.forEach(p=>{const q=players[p.peer];if(q){scene.remove(q.m);delete players[p.peer]}})});
 rm.on('hit',m=>{const o=m.data;if(!o||m.isMe||o.t!==myId||P.dead)return;P.hp-=Math.min(+o.d||0,9999);P.dmgT=.4;if(P.hp<=0)die(o.by)});
 rm.on('died',m=>{const o=m.data||{};const n=id=>id===myId?'Sen':(players[id]&&players[id].name)||'?';feed(n(o.by)+' ➜ '+n(o.v));if(o.by===myId&&!m.isMe){P.k++;P.cred+=300}});
 rm.on('fx',m=>{if(m.isMe||!m.data)return;const o=m.data;o.k==='t'?tracer(o.a,o.b):boom(o.k,o.p)});
 const sendP=()=>rm&&rm.presence({x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),ry:+P.yaw.toFixed(2),name:P.name,k:P.k,d:P.d,dead:P.dead,cr:P.crouch?1:0,host:host?1:0}).catch(()=>{});
 sendP();setInterval(sendP,90);
 if(!host){await new Promise(r=>setTimeout(r,2500));if(!peerL.some(p=>!p.isMe&&p.presence&&p.presence.host)){await rm.leave();rm=null;return 'Bu kodla bir oda bulunamadı.'}}
 return ''}
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
function update(dt){const w=W[P.cur];P.t+=dt;
 if(!P.dead&&!showBuy){
  let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0)+tc.mx+G.mx,mz=(keys.KeyW?1:0)-(keys.KeyS?1:0)+tc.mz+G.mz;const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l}
  P.crouch=keys.KeyC||keys.ControlLeft||tc.cr||G.cr;P.ads=ms.r||tc.ads||G.ads;
  const sp=(P.crouch?2.8:5.4)*(P.ads?.65:1)*dt,s=Math.sin(P.yaw),c=Math.cos(P.yaw),dx=(-s*mz+c*mx)*sp,dz=(-c*mz-s*mx)*sp;
  if(!blocked(P.x+dx,P.z,P.y))P.x+=dx;if(!blocked(P.x,P.z+dz,P.y))P.z+=dz;P.x=Math.max(-38.5,Math.min(38.5,P.x));P.z=Math.max(-38.5,Math.min(38.5,P.z));
  if((keys.Space||G.jump||tc.jump)&&P.og){P.vy=7.2;P.og=0}
  const fire=ms.l||tc.fire||G.fire;
  if(P.rl>0){P.rl-=dt;if(P.rl<=0){const n=Math.min(w.mag-w.ammo,w.res);w.ammo+=n;w.res-=n}}
  else if(fire&&(w.auto||!P.fh)&&P.t>=P.nx){if(w.ammo>0){shoot(w);P.nx=P.t+w.rate}else reload()}
  P.fh=fire}
 P.vy-=20*dt;P.y+=P.vy*dt;const gh=gnd(P.x,P.z,P.y);if(P.y<=gh){P.y=gh;P.vy=0;P.og=1}else P.og=0;
 if(P.healT>0){const h=Math.min(P.healT,dt);P.healT-=h;P.hp=Math.min(100,P.hp+25*h)}
 P.ch+=((P.dead?.3:P.crouch?1.1:1.65)-P.ch)*Math.min(1,dt*14);
 cam.position.set(P.x,P.y+P.ch,P.z);cam.rotation.set(P.pitch,P.yaw,0);
 cam.fov+=((P.ads?w.fov:75)-cam.fov)*Math.min(1,dt*14);cam.updateProjectionMatrix();
 gun.visible=!P.ads&&!P.dead;wm.forEach((m,i)=>m.visible=i===P.cur);mfl.position.z=W[P.cur].mz;gun.position.z+=(-.5+(P.rl>0?.12:0)-gun.position.z)*Math.min(1,dt*15);P.mf-=dt;mfl.visible=P.mf>0;
 P.blind=Math.max(0,P.blind-dt);P.dmgT=Math.max(0,P.dmgT-dt);$('fl').style.opacity=Math.min(1,P.blind);$('dmg').style.opacity=Math.min(1,P.dmgT*2.5);
 for(const id in players){const p=players[id],m=p.m;
  if(p.bot){if(p.dead)continue;p.wt-=dt;if(p.wt<=0){p.wt=1+Math.random()*2;p.dir=Math.random()*6.28;p.mv=Math.random()>.3}
   if(p.mv){const nx=m.position.x-Math.sin(p.dir)*2.6*dt,nz=m.position.z-Math.cos(p.dir)*2.6*dt;if(!blocked(nx,nz,0)&&Math.abs(nx)<38&&Math.abs(nz)<38)m.position.set(nx,0,nz);else p.wt=0}m.rotation.y=p.dir;continue}
  const k=Math.min(1,dt*12);m.position.x+=(p.tx-m.position.x)*k;m.position.y+=(p.ty-m.position.y)*k;m.position.z+=(p.tz-m.position.z)*k;
  let da=p.ry-m.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));m.rotation.y+=da*k;m.scale.y=p.cr?.78:1}
 for(let i=gr.length-1;i>=0;i--){const g=gr[i],m=g.m;g.v.y-=18*dt;const o=m.position.clone();m.position.addScaledVector(g.v,dt);
  if(m.position.y<.1){m.position.y=.1;g.v.set(g.v.x*.4,0,g.v.z*.4)}
  if(blocked(m.position.x,m.position.z,m.position.y+.25)){m.position.copy(o);g.v.set(-g.v.x*.3,0,-g.v.z*.3)}
  g.t-=dt;if(g.t<=0){const p=[m.position.x,m.position.y,m.position.z];boom(g.k,p);rm&&rm.emit('fx',{k:g.k,p}).catch(()=>{});scene.remove(m);gr.splice(i,1)}}
 for(let i=fxs.length-1;i>=0;i--){const f=fxs[i];f.t-=dt;if(f.k==='s')f.mat.opacity=.85*Math.min(1,f.t/2);else if(f.k==='f')f.g.scale.multiplyScalar(1+dt*7);if(f.t<=0){scene.remove(f.g);fxs.splice(i,1)}}
 hudT-=dt;if(hudT<=0){hudT=.15;$('hp').style.width=P.hp+'%';$('hp').style.background=P.hp<35?'#ff4655':'#3ddc97';
  $('inf').textContent=`❤${Math.ceil(P.hp)}  💰${P.cred}  ${w.n} ${w.ammo}/${w.res}${P.rl>0?' ↻':''}  ⚔${dmg(w)}  ✚${P.heals} ✦${P.fl} ☁${P.sm}`;
  const all=[{n:P.name+' (sen)',k:P.k,d:P.d,c:'#7dffb5'},...Object.values(players).filter(p=>!p.bot||1).map(p=>({n:p.name,k:p.k,d:p.d,c:'#'+hue(p.id).getHexString()}))].sort((a,b)=>b.k-a.k);
  $('sb').innerHT
