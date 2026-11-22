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
