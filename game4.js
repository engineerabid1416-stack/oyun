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
  $('sb').innerHTML=all.map(p=>`<div style="color:${p.c}">${p.n} ${p.k}/${p.d}</div>`).join('')}}
function loop(n){requestAnimationFrame(loop);const dt=Math.min(.05,(n-last)/1000);last=n;pad(dt);if(playing)update(dt);ren.render(scene,cam)}
cam.position.set(0,8,30);cam.rotation.x=-.25;requestAnimationFrame(loop);
// ---- tuş düzeni ----
function xh(s){$('cross').className=s;try{localStorage.setItem('valoXh',s)}catch(e){}}
try{xh(localStorage.getItem('valoXh')||'dot')}catch(e){xh('dot')}
const wt=document.body.classList.contains('touch'),tbs=[...document.querySelectorAll('.tb')];let sv={},dr=null;
try{sv=JSON.parse(localStorage.getItem('valoPos'))||{}}catch(e){}
const put=(e,r,b)=>{e.style.top='auto';e.style.right=r+'px';e.style.bottom=b+'px'};
tbs.forEach(e=>{e.dataset.d=e.style.cssText;const p=sv[e.textContent];if(p)put(e,p[0],p[1])});
function startEdit(){document.body.classList.add('touch','edit');$('menu').style.display='none';$('ebar').style.display='flex'}
function endEdit(){document.body.classList.remove('edit');if(!wt)document.body.classList.remove('touch');$('ebar').style.display='none';if(!playing)$('menu').style.display='flex'}
function resetEdit(){tbs.forEach(e=>e.style.cssText=e.dataset.d);sv={};try{localStorage.removeItem('valoPos')}catch(e){}}
const co={capture:true,passive:false};
document.addEventListener('touchstart',ev=>{if(!document.body.classList.contains('edit')||ev.target.closest('#ebar'))return;ev.stopPropagation();ev.preventDefault();const t=ev.target.closest('.tb');if(t&&!dr)dr={e:t,id:ev.changedTouches[0].identifier}},co);
document.addEventListener('touchmove',ev=>{if(!dr)return;ev.stopPropagation();ev.preventDefault();for(const t of ev.changedTouches)if(t.identifier===dr.id){const e=dr.e,w=e.offsetWidth,h=e.offsetHeight;put(e,Math.max(0,Math.min(innerWidth-w,innerWidth-t.clientX-w/2)),Math.max(0,Math.min(innerHeight-h,innerHeight-t.clientY-h/2)))}},co);
const dend=ev=>{if(!dr)return;ev.stopPropagation();for(const t of ev.changedTouches)if(t.identifier===dr.id){const e=dr.e;sv[e.textContent]=[parseFloat(e.style.right),parseFloat(e.style.bottom)];try{localStorage.setItem('valoPos',JSON.stringify(sv))}catch(x){}dr=null}};
document.addEventListener('touchend',dend,co);document.addEventListener('touchcancel',dend,co);
