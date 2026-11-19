const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const menu=$('#menu'),office=$('#office'),monitor=$('#monitor'),jumpscare=$('#jumpscare'),win=$('#win');
let night=1,power=100,elapsed=0,closed={left:false,right:false},lights={left:false,right:false};
let enemies=[],timer=null,monitorOpen=false,gameRunning=false;
const camRooms={
 '1A':['Show Stage','A small stage waits in the dark.'],
 '1B':['Dining Area','Red curtains and dusty party tables.'],
 '2A':['West Hall','A corridor that bends toward the office.'],
 '2B':['West Hall Corner','A blind corner near the left door.'],
 '3':['Supply Closet','Boxes block the flickering camera.'],
 '4A':['East Hall','A corridor toward the right door.'],
 '4B':['East Hall Corner','A blind corner near the right door.'],
 '5':['Camera Room','Noisy monitors fill the room.']
};
function show(el){$$('.screen').forEach(s=>s.classList.remove('active'));el.classList.add('active')}
function reset(){
 night=Number(localStorage.getItem('marioNight')||night||1); power=100;elapsed=0;closed={left:false,right:false};lights={left:false,right:false};monitorOpen=false;
 enemies=[{name:'Mario',pos:'1A',side:'left',step:0,next:1.8},{name:'Luigi',pos:'1A',side:'right',step:0,next:3}];
 $$('.door').forEach(d=>d.classList.remove('closed'));$$('.door-control,.light-control').forEach(b=>b.classList.remove('on'));$('.office-bg').classList.remove('darkened');$('.office-bg').style.filter='';
 $('#night').textContent=night;$('#power').textContent=100;$('#hour').textContent=12;
 updateUsage();show(office);gameRunning=true;startTimer();
}
function startTimer(){clearInterval(timer);timer=setInterval(tick,100)}
function tick(){if(!gameRunning)return;
 elapsed+=.1;
 const hour=Math.min(6,Math.floor(elapsed/15));$('#hour').textContent=hour===0?12:hour;
 enemies.forEach(e=>{e.next-=.1;if(e.next>0)return;e.next=Math.max(.65,2.4-night*.25)+Math.random()*2;
  e.step++;
  const routes=e.side==='left'?['1A','1B','2A','2B','left']:['1A','1B','3','4A','4B','right'];
  let i=routes.indexOf(e.pos); if(i<0)i=0;
  if(i<routes.length-1)e.pos=routes[i+1]; else e.pos=e.side;
  if(e.pos===e.side){if(closed[e.side]){e.pos='1A';e.step=0}else{jumpscareEnemy(e.name);return}}
 });
 let draw=(monitorOpen?1:0)+(closed.left?1:0)+(closed.right?1:0)+(lights.left?1:0)+(lights.right?1:0);power-=.08+draw*.06;if(power<=0){power=0;powerOut();}
 $('#power').textContent=Math.ceil(power);updateUsage(draw);updateLights();updateCameras();
 if(elapsed>=90){winNight()}
}
function updateUsage(extra=0){const level=Math.min(5,Math.max(1,Math.ceil(power<20?5:power<45?4:power<65?3:power<85?2:1)+extra*.12));$$('#usage i').forEach((i,n)=>i.className=n<level?'active':'')}
function updateLights(){
 ['left','right'].forEach(side=>{const dark=lights[side];const foe=enemies.find(e=>e.side===side&&(e.pos===side||e.pos=== (side==='left'?'2B':'4B')));$('#'+side+'Foe').style.display=(dark||(!monitorOpen&&foe))?'block':'none'});
 $('.office-bg').classList.toggle('darkened',lights.left||lights.right);
}
function updateCameras(){const cam=$('.cam.active').dataset.cam;$('#camName').textContent=cam;$('#camTime').textContent='REC ●';
 const art=$('#roomArt');art.style.filter='contrast(1.1)';
 const enemy=enemies.find(e=>e.pos===cam);const badge=$('#enemyInCam');badge.textContent=enemies.find(e=>e.pos===cam)?.name==='Mario'?'M':'L';badge.classList.toggle('show',!!enemy); }
$$('.door-control').forEach(b=>b.onclick=()=>{if(!gameRunning)return;let s=b.dataset.side;closed[s]=!closed[s];$('.'+s+'-door').classList.toggle('closed',closed[s]);b.classList.toggle('on',closed[s])});
$$('.light-control').forEach(b=>b.onclick=()=>{if(!gameRunning)return;let s=b.dataset.side;lights[s]=!lights[s];b.classList.toggle('on',lights[s]);updateLights()});
$('#monitorButton').onclick=()=>{if(!gameRunning)return;monitorOpen=true;show(monitor);updateCameras()};
$('#monitorClose').onclick=()=>{monitorOpen=false;show(office)};
$$('.cam').forEach(b=>b.onclick=()=>{$$('.cam').forEach(c=>c.classList.remove('active'));b.classList.add('active');updateCameras();$('#cameraFeed').animate([{filter:'brightness(2)'},{filter:'brightness(1)'}],180)});
function jumpscareEnemy(name){clearInterval(timer);gameRunning=false;show(jumpscare);$('.scare-name').textContent=name+' GOT YOU';setTimeout(()=>show(menu),2600)}
function powerOut(){clearInterval(timer);gameRunning=false;monitorOpen=false;show(office);$('.office-bg').style.filter='brightness(.12)';setTimeout(()=>jumpscareEnemy('THE DARK'),5000)}
function winNight(){clearInterval(timer);gameRunning=false;localStorage.setItem('marioNight',Math.min(5,night+1));$('#winText').textContent='NIGHT '+night+' COMPLETE';show(win)}
$('#newGame').onclick=()=>{night=Number(localStorage.getItem('marioNight')||1);reset()};
$('#nextNight').onclick=()=>{night=Math.min(5,night+1);reset()};
// Restart cleanly after a power-out or jumpscare
setInterval(()=>{if(!gameRunning&&power===0){$('.office-bg').style.filter=''}},100);
