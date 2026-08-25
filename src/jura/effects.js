export function initJura() {

document.documentElement.style.scrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header scroll state ---------- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

/* ---------- Hero headline word reveal ---------- */
const headline = document.getElementById('hero-headline');
const words = ["Scaling","Frontier","AI","In","Vitro"];
headline.innerHTML = words.map((w,i)=>`<span class="word"><span style="animation-delay:${0.15 + i*0.09}s">${w}</span></span>`).join(' ');

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if(reduceMotion){
  revealEls.forEach(el=>el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:0.15});
  revealEls.forEach(el=>io.observe(el));
}

/* ---------- Loop diagram stage interaction ---------- */
const stages = document.querySelectorAll('.loop-stage');
stages.forEach((s,idx)=>{
  s.addEventListener('click', ()=>{
    const wasActive = s.classList.contains('active');
    stages.forEach(o=>o.classList.remove('active'));
    if(!wasActive) s.classList.add('active');
  });
  if(idx===0) s.classList.add('active');
});

/* ---------- Hero canvas: closed-loop particle field ---------- */
(function(){
  const canvas = document.getElementById('loop-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  const nodeLabels = ['DESIGN','SYNTHESIS','SCREENING','SIGNAL','DATA','MODEL'];
  let cx, cy, radius;
  function layout(){
    cx = w*0.68; cy = h*0.5; radius = Math.min(w,h)*0.28;
  }
  layout();
  window.addEventListener('resize', layout);

  let mouse = {x:cx, y:cy, active:false};
  canvas.addEventListener('mousemove', e=>{
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
  });
  canvas.addEventListener('mouseleave', ()=>{ mouse.active = false; });

  const particles = Array.from({length: 46}, () => ({
    a: Math.random()*Math.PI*2,
    speed: 0.0009 + Math.random()*0.0016,
    r: radius * (0.55 + Math.random()*0.7),
    size: 0.6 + Math.random()*1.6,
    drift: Math.random()*Math.PI*2
  }));

  let t = 0;
  function draw(){
    t += 1;
    ctx.clearRect(0,0,w,h);

    // faint radial glow
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.9);
    grad.addColorStop(0,'rgba(111,233,214,0.07)');
    grad.addColorStop(1,'rgba(111,233,214,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    // orbit ring nodes
    const nodePositions = nodeLabels.map((label,i)=>{
      const ang = (i/nodeLabels.length)*Math.PI*2 - Math.PI/2 + t*0.0006;
      const x = cx + Math.cos(ang)*radius;
      const y = cy + Math.sin(ang)*radius;
      return {x,y,label};
    });

    // connecting lines between consecutive nodes (the loop)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(111,233,214,0.28)';
    ctx.beginPath();
    nodePositions.forEach((p,i)=>{
      const n = nodePositions[(i+1)%nodePositions.length];
      const mx = (p.x+n.x)/2, my = (p.y+n.y)/2;
      if(i===0) ctx.moveTo(p.x,p.y);
      ctx.quadraticCurveTo(mx,my,n.x,n.y);
    });
    ctx.stroke();

    // mouse influence pulls the ring subtly
    const dx = mouse.active ? (mouse.x-cx)*0.02 : 0;
    const dy = mouse.active ? (mouse.y-cy)*0.02 : 0;

    // particles flowing along the loop
    particles.forEach(p=>{
      p.a += p.speed;
      const wob = Math.sin(t*0.01 + p.drift)*6;
      const x = cx + dx + Math.cos(p.a)*(p.r+wob);
      const y = cy + dy + Math.sin(p.a)*(p.r+wob);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(144,137,240,0.75)';
      ctx.arc(x,y,p.size,0,Math.PI*2);
      ctx.fill();
    });

    // nodes
    nodePositions.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = '#0a0b0d';
      ctx.arc(p.x+dx,p.y+dy,4.5,0,Math.PI*2);
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#6fe9d6';
      ctx.stroke();
    });

    if(!reduceMotion) requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- Sovereign engine canvas ---------- */
(function(){
  const canvas = document.getElementById('engine-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1,2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  const points = Array.from({length: 60}, () => {
    const ang = Math.random()*Math.PI*2;
    const rad = Math.random()*0.42;
    return {ang, rad, speed:(Math.random()-0.5)*0.004, z:Math.random()};
  });

  let t=0;
  function draw(){
    t+=1;
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, R=Math.min(w,h)*0.42;

    ctx.strokeStyle='rgba(255,255,255,0.08)';
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,R*0.6,0,Math.PI*2); ctx.stroke();

    const pts = points.map(p=>{
      p.ang += p.speed;
      const rr = R*p.rad*2 + R*0.15;
      return {x: cx+Math.cos(p.ang)*rr, y: cy+Math.sin(p.ang)*rr*0.9, z:p.z};
    });

    ctx.lineWidth=0.6;
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<70){
          ctx.strokeStyle=`rgba(144,137,240,${0.14*(1-d/70)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = 'rgba(111,233,214,0.85)';
      ctx.arc(p.x,p.y,1.6+p.z*1.6,0,Math.PI*2);
      ctx.fill();
    });

    // core
    const coreGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.22);
    coreGrad.addColorStop(0,'rgba(111,233,214,0.5)');
    coreGrad.addColorStop(1,'rgba(111,233,214,0)');
    ctx.fillStyle=coreGrad;
    ctx.beginPath(); ctx.arc(cx,cy,R*0.22,0,Math.PI*2); ctx.fill();

    if(!reduceMotion) requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- Modality selector ---------- */
const modalityData = [
  {name:'Antibodies', desc:'Designed and screened through JURA\u2019s closed experimental loop, targeting hard-to-reach epitopes.'},
  {name:'TCR Mimics', desc:'Engineered to recognize intracellular targets presented on the cell surface.'},
  {name:'Peptides', desc:'Short sequences optimized across successive rounds of synthesis and functional screening.'},
  {name:'T-cell Engagers', desc:'Bispecific formats designed to direct T-cell activity toward disease targets.'},
  {name:'Enzymes', desc:'Functional proteins refined through iterative design-synthesis-screening cycles.'},
  {name:'Emerging Modalities', desc:'Novel therapeutic formats explored where public data and prior art fall short.'}
];
const mItems = document.querySelectorAll('.modality-item');
const stageEyebrow = document.getElementById('stage-eyebrow');
const stageTitle = document.getElementById('stage-title');
const stageDesc = document.getElementById('stage-desc');
mItems.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    mItems.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const i = +btn.dataset.m;
    stageEyebrow.textContent = 'Modality 0'+(i+1);
    stageTitle.textContent = modalityData[i].name;
    stageDesc.textContent = modalityData[i].desc;
  });
});

/* ---------- Modality stage canvas (reacts to active modality subtly) ---------- */
(function(){
  const canvas = document.getElementById('modality-canvas');
  const ctx = canvas.getContext('2d');
  function resize(){
    const dpr = Math.min(window.devicePixelRatio||1,2);
    canvas.width = canvas.offsetWidth*dpr; canvas.height = canvas.offsetHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  setTimeout(resize, 50);

  const strands = Array.from({length:5}, (_,i)=>({offset:i*40, phase:Math.random()*Math.PI*2}));
  let t=0;
  function draw(){
    t+=1;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    ctx.clearRect(0,0,w,h);
    strands.forEach((s,i)=>{
      ctx.beginPath();
      ctx.strokeStyle = i%2===0 ? 'rgba(14,116,255,0.58)' : 'rgba(0,166,255,0.46)';
      ctx.lineWidth = 1.35;
      for(let x=0;x<=w;x+=8){
        const y = h*0.5 + Math.sin((x*0.02)+t*0.01+s.phase) * (30+s.offset*0.3) - 60 + i*30;
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
    if(!reduceMotion) requestAnimationFrame(draw);
  }
  draw();
})();

}
