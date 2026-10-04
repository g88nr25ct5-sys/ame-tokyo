'use strict';
// Condensation is a separate translucent surface. Trails remove it, never paint light.
(()=>{
 const scene=document.getElementById('scene'),windowImage=document.getElementById('windowScene');
 const canvas=document.getElementById('condensation'),ctx=canvas.getContext('2d');
 const base=document.createElement('canvas'),baseCtx=base.getContext('2d');
 const brush=document.createElement('canvas');brush.width=brush.height=96;
 const b=brush.getContext('2d'),gradient=b.createRadialGradient(48,48,5,48,48,45);
 gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(.52,'rgba(0,0,0,.93)');gradient.addColorStop(.80,'rgba(0,0,0,.32)');gradient.addColorStop(1,'rgba(0,0,0,0)');
 b.beginPath();for(let i=0;i<=72;i++){const angle=i/72*Math.PI*2,r=43+1.8*Math.sin(angle*7)+1.1*Math.cos(angle*11);const x=48+Math.cos(angle)*r,y=48+Math.sin(angle)*r;i?b.lineTo(x,y):b.moveTo(x,y);}b.closePath();b.clip();b.fillStyle=gradient;b.fillRect(0,0,96,96);
 const strokes=[],pointers=new Set();let stroke=null,start=null,pinching=false,width=0,height=0,scale=1,lastFrame=0,visible=false,needsPaint=true;
 function windowActive(){return document.body.classList.contains('entered')&&windowImage.classList.contains('active');}
 function resize(){width=scene.clientWidth;height=scene.clientHeight;scale=Math.min(1,1100/Math.max(width,height));canvas.width=base.width=Math.max(1,Math.round(width*scale));canvas.height=base.height=Math.max(1,Math.round(height*scale));
  baseCtx.clearRect(0,0,base.width,base.height);baseCtx.fillStyle='rgba(162,184,193,.085)';baseCtx.fillRect(0,0,base.width,base.height);
  for(let i=0;i<9;i++){const x=(.1+(i*.317)%1)*base.width,y=(.13+(i*.213)%1)*base.height,r=base.width*(.2+(i%3)*.055);const g=baseCtx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(181,201,207,.028)');g.addColorStop(1,'rgba(181,201,207,0)');baseCtx.fillStyle=g;baseCtx.fillRect(0,0,base.width,base.height);}
  // Very fine surface moisture, cached once per resize rather than generated per frame.
  baseCtx.fillStyle='rgba(208,223,225,.045)';for(let i=0;i<base.width*base.height/70;i++){baseCtx.fillRect(Math.random()*base.width,Math.random()*base.height,1,1);}needsPaint=true;
 }
 function point(e){const rect=scene.getBoundingClientRect();return{x:(e.clientX-rect.left)/width,y:(e.clientY-rect.top)/height};}
 function finish(){if(stroke)stroke.released=performance.now();stroke=null;start=null;needsPaint=true;}
 scene.addEventListener('pointerdown',e=>{if(!windowActive()||(e.pointerType==='mouse'&&e.button!==0))return;pointers.add(e.pointerId);if(pointers.size>1){pinching=true;finish();return;}if(!pinching)start={...point(e),pointer:e.pointerId,touch:e.pointerType!=='mouse'};});
 scene.addEventListener('pointermove',e=>{
  if(!start||start.pointer!==e.pointerId||pinching||!windowActive())return;
  const events=e.getCoalescedEvents?.()||[];for(const sample of events.length?events:[e]){
   const p=point(sample);if(!stroke){if(Math.hypot((p.x-start.x)*width,(p.y-start.y)*height)<4)continue;stroke={points:[{x:start.x,y:start.y}],released:null,radius:start.touch?22:18,seed:Math.random()*10};strokes.push(stroke);}
   const previous=stroke.points[stroke.points.length-1],dx=(p.x-previous.x)*width,dy=(p.y-previous.y)*height,distance=Math.hypot(dx,dy);
   if(distance<4)continue;const steps=Math.ceil(distance/5);for(let i=1;i<=steps;i++)stroke.points.push({x:previous.x+(p.x-previous.x)*i/steps,y:previous.y+(p.y-previous.y)*i/steps});
   // Bound redraw work during unusually long, uninterrupted drawing sessions.
   if(stroke.points.length>4000)stroke.points.splice(0,stroke.points.length-4000);
   while(strokes.reduce((n,s)=>n+s.points.length,0)>6500&&strokes.length>1)strokes.shift();needsPaint=true;
  }
 });
 function release(e){pointers.delete(e.pointerId);if(start?.pointer===e.pointerId)finish();if(!pointers.size)pinching=false;}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])scene.addEventListener(event,release);
 window.addEventListener('blur',()=>{finish();pointers.clear();pinching=false;});window.addEventListener('resize',resize);
 const observer=new MutationObserver(()=>{if(!windowActive()){finish();strokes.length=0;pointers.clear();pinching=false;}needsPaint=true;});observer.observe(windowImage,{attributes:true,attributeFilter:['class']});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 function frame(now){requestAnimationFrame(frame);if(document.hidden||now-lastFrame<50)return;lastFrame=now;const active=windowActive();if(!active){if(visible)ctx.clearRect(0,0,canvas.width,canvas.height);visible=false;return;}if(!needsPaint&&!strokes.length&&visible)return;visible=true;needsPaint=false;
  for(let i=strokes.length-1;i>=0;i--)if(strokes[i].released!==null&&now-strokes[i].released>=16000)strokes.splice(i,1);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);ctx.globalCompositeOperation='destination-out';
  for(const trail of strokes){const age=trail.released===null?0:now-trail.released;const recovery=Math.max(0,Math.min(1,(age-4000)/12000));ctx.globalAlpha=1-recovery*recovery*(3-2*recovery);if(ctx.globalAlpha<=0)continue;for(let i=0;i<trail.points.length;i++){const p=trail.points[i],r=trail.radius*scale*(1+.055*Math.sin(i*.37+trail.seed));ctx.drawImage(brush,p.x*width*scale-r,p.y*height*scale-r,r*2,r*2);}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 }
 resize();requestAnimationFrame(frame);
})();
