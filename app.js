'use strict';
const $=id=>document.getElementById(id), scene=$('scene'),canvas=$('rain'),ctx=canvas.getContext('2d');
let image=$('city'),viewRequest=0;
const sceneImages={city:$('city'),window:$('windowScene')};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let entered=false, zoom=1, px=0,py=0,w=innerWidth,h=innerHeight,iw=0,ih=0,last=0,elapsed=0,manual=false,hideTimer,environmentOn=true,audio;
$('motion').checked=!reduced;
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);const cover=Math.max(w/(image.naturalWidth||1942),h/(image.naturalHeight||809));iw=(image.naturalWidth||1942)*cover;ih=(image.naturalHeight||809)*cover;image.style.width=iw+'px';image.style.height=ih+'px';renderImage();}
function renderImage(){const drift=entered&&!manual&&$('motion').checked&&!reduced ? .025*(.5-.5*Math.cos(elapsed/90000*Math.PI)):0;const z=zoom+drift;px=Math.max(-(iw*z-w)/2,Math.min((iw*z-w)/2,px));py=Math.max(-(ih*z-h)/2,Math.min((ih*z-h)/2,py));image.style.transform=`translate(${(w-iw*z)/2+px}px,${(h-ih*z)/2+py}px) scale(${z})`;image.style.transformOrigin='0 0';}
function wake(){if(!entered)return;document.body.classList.add('awake');clearTimeout(hideTimer);hideTimer=setTimeout(()=>{if($('panel').hidden)document.body.classList.remove('awake');},4500);}
function scaleTo(z,x=w/2,y=h/2){manual=true;const old=zoom;zoom=Math.max(1,Math.min(1.65,z));px=(px+w/2-x)*zoom/old-w/2+x;py=(py+h/2-y)*zoom/old-h/2+y;renderImage();wake();}
function reset(){zoom=1;px=py=0;manual=false;elapsed=0;renderImage();wake();}
scene.addEventListener('wheel',e=>{e.preventDefault();scaleTo(zoom*Math.exp(-e.deltaY*.001),e.clientX,e.clientY);},{passive:false});
const pointers=new Map();let gesture,tapStart=null,moved=false;
scene.addEventListener('pointerdown',e=>{if(!entered)return;scene.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=null;tapStart={x:e.clientX,y:e.clientY};moved=pointers.size>1;wake();});
scene.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;if(tapStart&&Math.hypot(e.clientX-tapStart.x,e.clientY-tapStart.y)>7)moved=true;const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(gesture)scaleTo(zoom*distance/gesture,(a.x+b.x)/2,(a.y+b.y)/2);gesture=distance;}else{manual=true;if(image!==sceneImages.window){px+=e.clientX-previous.x;py+=e.clientY-previous.y;renderImage();}}});
scene.addEventListener('pointerup',()=>{tapStart=null;});
for(const name of ['pointerup','pointercancel','lostpointercapture'])scene.addEventListener(name,e=>{pointers.delete(e.pointerId);gesture=null;});
scene.addEventListener('dblclick',e=>scaleTo(zoom>1?1:1.8,e.clientX,e.clientY));
scene.addEventListener('keydown',e=>{if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();manual=true;if(e.key==='0')reset();else if(e.key==='+'||e.key==='=')scaleTo(zoom*1.15);else if(e.key==='-')scaleTo(zoom/1.15);else {px+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;py+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;renderImage();}wake();}});
const drops=Array.from({length:3200},()=>({x:Math.random(),y:Math.random(),depth:Math.random(),speed:Math.random(),phase:Math.random()*Math.PI*2}));
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;if(!document.hidden){if(entered)elapsed+=dt*1000;renderImage();ctx.clearRect(0,0,w,h);const amount=+$('amount').value/100;document.documentElement.style.setProperty('--mist',String(amount*.9));if(entered&&amount>0){const count=Math.min(3200,Math.round(w*h*(amount*amount/400+amount/25000)));
for(let layer=0;layer<3;layer++){ctx.lineWidth=[.55,.9,1.5][layer];ctx.strokeStyle=`rgba(187,210,227,${[.12,.20,.25][layer]+amount*[.08,.13,.18][layer]})`;ctx.beginPath();
for(let i=0;i<count;i++){const d=drops[i];if(Math.min(2,Math.floor(d.depth*3))!==layer)continue;const speed=(140+d.depth*460+d.speed*120)*(1+amount*.35)*(reduced?0:1);d.y+=dt*speed/h;d.x-=dt*speed*.12/w;if(d.y>1.08){d.y=-.08;d.x=Math.random();}if(d.x<-.03)d.x=1.03;const length=(6+d.depth*23)*(1+amount*.9)*(1+(zoom-1)*.35),x=d.x*w,y=d.y*h;ctx.moveTo(x,y);ctx.lineTo(x-length*.12,y+length);}ctx.stroke();}}}requestAnimationFrame(frame);}
// Only these four user-selected recordings are used. No synthesized fallback.
const AUDIO_FILES={environment:'assets/audio/rain-city-sachintempini.mp3',ambient1:'assets/audio/ambient-i-universfield.mp3',ambient2:'assets/audio/ambient-ii-universfield.mp3',jazz:'assets/audio/rainy-jazz-alex-morgan.mp3'};
const audioMessages={environment:'',music:''};
function audioStatus(channel,message){audioMessages[channel]=message;$('audioStatus').textContent=Object.values(audioMessages).filter(Boolean).join(' · ');if(channel==='environment')$('sound').textContent=!environmentOn?'环境音 关':message.includes('加载')?'环境音 加载中':message?'环境音 重试':'环境音 开';}
function initAudio(){
 const ac=new (window.AudioContext||window.webkitAudioContext)();
 const master=ac.createGain(),limiter=ac.createDynamicsCompressor(),environment=ac.createGain(),music=ac.createGain();
 master.gain.value=.75;limiter.threshold.value=-3;limiter.knee.value=6;limiter.ratio.value=8;master.connect(limiter);limiter.connect(ac.destination);environment.connect(master);music.connect(master);environment.gain.value=0;music.gain.value=.55;
 let envVoice=null,currentVoice=null,activeMusic='off',musicRequest=0,environmentRequest=0,envBuffer=null;
 const voices=new Set(),pending=new Map();
 // Blend the tail into the head once, then use a sample-continuous native loop.
 function seamless(decoded){
  const length=decoded.length,fade=Math.min(Math.floor(decoded.sampleRate*1.5),Math.floor(length/8));
  if(fade<2)throw new Error('音频过短');
  let peak=0;
  for(let c=0;c<decoded.numberOfChannels;c++){
   const samples=decoded.getChannelData(c);
   for(let i=0;i<fade;i++){const mix=i/(fade-1);samples[length-fade+i]=samples[length-fade+i]*(1-mix)+samples[i]*mix;}
   for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(samples[i]));
  }
  if(peak>0)for(let c=0;c<decoded.numberOfChannels;c++){const samples=decoded.getChannelData(c),gain=.8/peak;for(let i=0;i<length;i++)samples[i]*=gain;}
  return decoded;
 }
 async function load(key){
  if(key==='environment'&&envBuffer)return envBuffer;
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{const response=await fetch(AUDIO_FILES[key],{cache:'no-cache'});if(!response.ok)throw new Error('文件缺失');const decoded=await ac.decodeAudioData(await response.arrayBuffer());const buffer=seamless(decoded);if(key==='environment')envBuffer=buffer;return buffer;})();
  pending.set(key,task);try{return await task;}finally{pending.delete(key);}
 }
 function voice(buffer,bus){const source=ac.createBufferSource(),gain=ac.createGain();source.buffer=buffer;source.loop=true;source.loopStart=Math.min(1.5,buffer.length/buffer.sampleRate/8);source.loopEnd=buffer.length/buffer.sampleRate;gain.gain.value=0;source.connect(gain);gain.connect(bus);const v={source,gain,start:ac.currentTime,from:0,to:0,end:ac.currentTime,stopping:false};voices.add(v);source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(v);};source.start();return v;}
 function fade(v,to,duration,stop=false){
  const now=ac.currentTime,fraction=v.end===v.start?1:Math.max(0,Math.min(1,(now-v.start)/(v.end-v.start))),value=v.from+(v.to-v.from)*fraction;
  v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(value,now);v.gain.gain.linearRampToValueAtTime(to,now+duration);v.start=now;v.end=now+duration;v.from=value;v.to=to;
  if(stop&&!v.stopping){v.stopping=true;v.source.stop(now+duration+.05);}
 }
 async function setEnvironment(on){
  const request=++environmentRequest;environment.gain.setTargetAtTime(on?+$('environmentVolume').value/100:0,ac.currentTime,.35);
  if(!on){audioStatus('environment','');return;}
  audioStatus('environment','环境音加载中…');
  try{const buffer=await load('environment');if(request!==environmentRequest||!environmentOn)return;if(!envVoice){envVoice=voice(buffer,environment);fade(envVoice,1,1.8);}audioStatus('environment','');}
  catch{if(request===environmentRequest)audioStatus('environment','环境音文件尚未加入');}
 }
 async function setMusic(key){
  const request=++musicRequest;
  if(key==='off'){for(const v of voices)if(v!==envVoice&&!v.stopping)fade(v,0,2,true);currentVoice=null;activeMusic='off';audioStatus('music','');return;}
  if(currentVoice&&key===activeMusic){audioStatus('music','');return;}
  audioStatus('music','音乐加载中…');
  try{
   const buffer=await load(key);if(request!==musicRequest)return;
   // Every fading voice is silenced at the same rate; rapid taps cannot stack songs.
   for(const v of voices)if(v!==envVoice&&!v.stopping)fade(v,0,2.5,true);
   currentVoice=voice(buffer,music);activeMusic=key;fade(currentVoice,1,2.5);audioStatus('music','');
  }catch{if(request===musicRequest){$('music').value=activeMusic;audioStatus('music','音乐文件尚未加入');}}
 }
 function levels(){environment.gain.setTargetAtTime(environmentOn?+$('environmentVolume').value/100:0,ac.currentTime,.2);music.gain.setTargetAtTime(+$('musicVolume').value/100,ac.currentTime,.2);}
 return{ac,setEnvironment,setMusic,levels};
}
async function unlockAudio(){
 try{if(!audio)audio=initAudio();await audio.ac.resume();return audio.ac.state==='running';}
 catch{audioStatus('environment','声音未启动，请再次轻触环境开关。');return false;}
}
async function switchView(key){
 const request=++viewRequest,target=sceneImages[key];$('view').disabled=true;
 try{await target.decode();if(request!==viewRequest)return;image=target;document.querySelector('.hint').textContent=key==='window'?'按住拖动擦雾 · 设置中调节声音':'拖动探索 · 设置中调节声音';$('viewHint').textContent=key==='window'?'拖动擦雾 · 双指或滚轮靠近':'拖动探索 · 双指或滚轮靠近';scene.setAttribute('aria-label',key==='window'?'东京雨夜窗边，按住拖动擦去玻璃雾气':'东京雨夜，可缩放和拖动画面');zoom=1;px=py=0;manual=false;elapsed=0;resize();for(const item of Object.values(sceneImages))item.classList.toggle('active',item===target);const next=key==='window'?'城市全景':'窗边视角';$('view').textContent=key==='window'?'视角：窗边':'视角：城市';$('view').title='切换到'+next;$('view').setAttribute('aria-label','切换到'+next);}
 catch{if(request===viewRequest)$('view').textContent='图片未加载，点击重试';}
 finally{if(request===viewRequest)$('view').disabled=false;}
}
$('view').onclick=()=>{switchView(image===sceneImages.city?'window':'city');wake();};
$('enter').onclick=async()=>{
 entered=true;switchView('window');document.body.classList.add('entered');$('entry').inert=true;scene.focus();setTimeout(()=>$('entry').hidden=true,1900);
 if(await unlockAudio()){audio.levels();audio.setEnvironment(environmentOn);}
 wake();setTimeout(()=>$('caption').style.display='none',6500);
};
$('sound').onclick=async()=>{
 environmentOn=audioMessages.environment&&!audioMessages.environment.includes('加载')?true:!environmentOn;$('sound').textContent=environmentOn?'环境音 开':'环境音 关';$('sound').setAttribute('aria-label',environmentOn?'关闭环境音':'开启环境音');$('sound').setAttribute('aria-pressed',String(environmentOn));
 if(await unlockAudio())audio.setEnvironment(environmentOn);wake();
};
function panel(open){$('panel').hidden=!open;document.body.classList.toggle('panel-open',open);$('settings').setAttribute('aria-expanded',String(open));wake();if(open)$('close').focus();else $('settings').focus();}
$('settings').onclick=()=>panel($('panel').hidden);$('close').onclick=()=>panel(false);$('reset').onclick=reset;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{$('fullscreen').textContent='请用浏览器全屏';$('fullscreen').title='此浏览器不支持网页全屏，请使用浏览器菜单进入全屏';}wake();};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏';});
for(const id of ['amount','environmentVolume','musicVolume'])$(id).addEventListener('input',()=>{$(id+'Value').textContent=$(id).value;});
for(const id of ['environmentVolume','musicVolume'])$(id).addEventListener('input',()=>audio?.levels());
$('music').addEventListener('change',async()=>{const selection=$('music').value;if(await unlockAudio()){audio.levels();audio.setMusic(selection);}});
document.addEventListener('pointermove',wake);document.addEventListener('pointerdown',wake);document.addEventListener('keydown',e=>{wake();if(e.key==='Escape'&&!$('panel').hidden)panel(false);});
document.addEventListener('visibilitychange',()=>{if(audio){if(document.hidden)audio.ac.suspend();else if(entered)audio.ac.resume();}last=performance.now();});window.addEventListener('resize',resize);
function ready(){resize();$('enter').disabled=false;$('enter').textContent='Enter Tokyo';}image.onload=ready;image.onerror=()=>{$('error').hidden=false;$('enter').textContent='Tokyo unavailable';};if(image.complete&&image.naturalWidth)ready();resize();requestAnimationFrame(frame);
