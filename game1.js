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
