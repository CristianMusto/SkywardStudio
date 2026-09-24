// Generated from Skyward Mappa.dc.html by the Skyward port script. Do not edit by hand.
/* eslint-disable */
export function createEngine(React, DCLogic, __PL, __send) {

const SYS=[
{id:'work',code:'SYS-01',name:'Work',min:4,desc:'Selected projects, starting with Skyward itself.',meta:'1 planet',hex:'#7FE6F2',tint:'127,230,242',core:12,p:[380,40,-210]},
{id:'services',code:'SYS-02',name:'Services',min:3,desc:'Web design, UI/UX, development and design systems.',meta:'4 planets',hex:'#FFD27A',tint:'255,210,122',core:11,p:[-480,-25,-40]},
{id:'process',code:'SYS-03',name:'Process',min:2,desc:'Four stages, from the first call to launch.',meta:'4 stages',hex:'#FF7A6B',tint:'255,122,107',core:10,p:[560,60,320]},
{id:'about',code:'SYS-04',name:'About',min:2,desc:'Who I am and how I work.',meta:'3 planets',hex:'#8CF0A0',tint:'140,240,160',core:10,p:[30,-40,500]},
{id:'contact',code:'SYS-05',name:'Contact',min:1,desc:'Tell me about your project.',meta:'2 planets',hex:'#C3A6FF',tint:'195,166,255',core:9,p:[-240,70,-560]},
{id:'home',code:'SYS-00',name:'Home',min:1,desc:'Where every route starts.',meta:'home planet',hex:'#FFB38A',tint:'255,179,138',core:10,p:[-40,0,90]}
];
const HOME=5;
const PC={cyan:['#E4FBFF','#5FC8D8','#0E3A48'],gold:['#FFF4D6','#E6B04E','#4A300C'],coral:['#FFE2DA','#E2654F','#4A1510'],green:['#E6FFE9','#5DC878','#0F3A1C'],violet:['#F0E8FF','#9C7CF0','#241452'],sand:['#FFF0E0','#D69A6A','#3E2410'],ice:['#F4F8FF','#9FB6E6','#1C2A4A']};
const PL=__PL;
const TILT=.36;
const LOGO=["M266.52 334.9C284.03 317.9 298.58 309.08 303.81 315.75C306.61 319.32 305.3 326.17 301 333C286.19 356.53 284.79 386.15 297 406C306.04 422.04 321.54 433.59 343 441C364.92 448.57 408.9 449.04 441 452C501.22 455.91 558.74 467.34 614 485C682.73 506.96 728.55 528.98 747 563C765.22 596.6 758.44 633.33 731 663C689.34 702.74 624.47 727.32 552 734C466.31 741.9 377.57 725.26 299 687C249.15 662.72 197.66 624.62 217 599C220.85 593.9 226.44 592.57 237 594C289.55 609.17 301.88 617.74 394 632C477.2 643.4 586.08 627.55 591 601.12C594.74 581.03 495.01 548.18 438 536C396.37 527.1 342.76 519.83 317 509C254.84 486.38 224.6 445.99 236 389C240.76 369.02 250.14 350.7 266.52 334.9Z","M315.14 365C322.03 298.46 407.74 257.57 485.01 245C635.32 220.55 772.78 255.6 814.5 325.11C825.27 343.05 824.98 359.25 817 365C800.94 376.57 775.24 356.64 751 349.34C658.83 318.76 592.68 330.43 569.05 332C545.25 335.34 533.16 337.91 532 342C530.48 347.35 548.61 351.17 569.05 356C635.06 373.83 691.6 399.06 737 433C798.87 480.06 815.96 539.47 801 599C798.18 610.22 791.38 619.69 786 619.12C779.18 618.4 776.77 615.49 776 607C778.69 572.88 758.97 530.68 730.8 512C688.55 476.1 544.64 430.68 449 427C371 423.99 314.78 422.41 315.14 365"];
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',');
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const ORIGIN=[-40,0,90],DMIN=150,DMAX=2800,DHOME=1250,DSYS=340,RG=1150;
const TEMP=[['186,208,255',.12],['222,230,255',.22],['242,238,230',.3],['255,236,194',.18],['255,206,152',.12],['255,162,128',.06]];
const NEB=['92,70,190','60,100,210','40,150,175','183,164,255','110,60,170','255,150,120'];
const WARP=['242,238,230','127,230,242','255,210,122','195,166,255','140,240,160','255,122,107'];
const rnd=(()=>{let s=0;try{s=+sessionStorage.getItem('skyward.seed')||0;}catch(e){}if(!s){s=1+Math.floor(Math.random()*2147483646);try{sessionStorage.setItem('skyward.seed',String(s));}catch(e){}}return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})(),gauss=()=>{let u=0;while(!u)u=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283*rnd());};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const pickT=()=>{let r=rnd();for(const [c,w] of TEMP){if((r-=w)<=0)return c;}return TEMP[2][0];};

class Component extends DCLogic {
  state={tyI:1,tyW:78,logoPlay:0,miniSel:1,jumpBusy:false,fv:{nome:'',email:'',msg:''},ferr:{},fstate:'idle',intro:null,coach:-1,audio:false,eggMsg:'',psel:-1,phover:-1,landMsg:'',here:HOME,visited:{[HOME]:true},vw:typeof window!=='undefined'?window.innerWidth:1280,vh:typeof window!=='undefined'?window.innerHeight:800,sel:-1,hover:-1,list:false,phase:'map',live:'',zoomed:false};
  btns=[];phalos=[];holds=[];hold=null;holdFired=false;wraps=[];pwraps=[];orb=[];ospd=1;lay=null;halos=[];sky=null;arrive=null;ptr=new Map();drag=false;vel=0;idle=0;cxOff=0;nextShoot=4;shoot=null;
  cam={yaw:.7,pitch:.52,dist:DHOME,T:[0,0,0]};tgt={yaw:null,pitch:.52,dist:DHOME,T:[0,0,0]};swY=0;swP=0;

  get reduced(){return !!this.props.forceReducedMotion||(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
  get motion(){return this.props.motion??1;}

  langIn=(()=>{try{return sessionStorage.getItem('skyward.langSwitch')==='1';}catch(e){return false;}})();
  veil(label){const v=document.createElement('div');v.setAttribute('aria-hidden','true');v.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0B0A1F;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity 280ms cubic-bezier(.4,0,.2,1);will-change:opacity';if(label){const t=document.createElement('span');t.textContent=label;t.style.cssText="font:400 12px 'Martian Mono',monospace;letter-spacing:.14em;color:#A9A3C2;transform:translateY(6px);transition:transform 280ms cubic-bezier(.2,.7,.2,1)";v.appendChild(t);}document.body.appendChild(v);return v;}
  componentDidMount(){
    if(this.langIn){try{sessionStorage.removeItem('skyward.langSwitch');}catch(e){}const de=document.documentElement;if(!de.hasAttribute('data-sk-veil'))de.setAttribute('data-sk-veil','');
      const go=()=>{de.style.setProperty('--sk-veil','0');setTimeout(()=>{de.removeAttribute('data-sk-veil');de.style.removeProperty('--sk-veil');},this.reduced?0:640);};
      Promise.race([document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,900))]).then(()=>{let n=0;const s=()=>{if(++n<5)requestAnimationFrame(s);else setTimeout(go,80);};requestAnimationFrame(s);});}
    document.documentElement.lang='en';
    this.onResize=()=>{this.setState({vw:innerWidth,vh:innerHeight});this.sizeCanvas();};
    this.onKey=e=>this.key(e);
    addEventListener('resize',this.onResize);addEventListener('keydown',this.onKey);
    this.cv=document.createElement('canvas');this.cv.style.cssText='position:absolute;inset:0;width:100%;height:100%';
    const el=this.sky;if(el){el.appendChild(this.cv);
      el.addEventListener('pointerdown',this.pDown);el.addEventListener('pointermove',this.pMove);
      el.addEventListener('pointerup',this.pUp);el.addEventListener('pointercancel',this.pUp);
      el.addEventListener('wheel',this.wheel,{passive:false});el.addEventListener('contextmenu',e=>e.preventDefault());}
    this.ctx=this.cv.getContext('2d');
    const qp=this.props.quality??'auto',low=innerWidth<760||(navigator.hardwareConcurrency||8)<=4;this.setQ(qp==='high'?1:qp==='low'?.4:(low?.7:1));
    this.sizeCanvas();this.sprites={};this.seed();
    this.t0=performance.now();this.last=this.t0;this.idle=this.t0-5000;
    this.onPop=()=>this.handlePop();addEventListener('popstate',this.onPop);
    let pref=false;try{pref=localStorage.getItem('skyward.audio')==='1';}catch(e){}
    if(pref){this.onFirst=()=>{removeEventListener('pointerdown',this.onFirst,true);removeEventListener('keydown',this.onFirst,true);if(!this.state.audio)this.toggleAudio();};addEventListener('pointerdown',this.onFirst,true);addEventListener('keydown',this.onFirst,true);}
    const dl=this.parseHash();
    if(dl.bad){this.setState({lost:'/'+dl.bad,live:'Page not found.'});}
    else if(dl.i>=0)this.openDirect(dl.i,dl.j);
    else if(this.wantIntro()){this.revealAt=Infinity;this.setState({intro:'boot'});this.introT=setTimeout(()=>this.setState(st=>st.intro==='boot'?{intro:'ready',live:'Ready. Press the button to launch.'}:null),this.reduced?300:1900);}
    else setTimeout(()=>this.startCoach(),1200);
    const loop=t=>{this.raf=requestAnimationFrame(loop);if(document.hidden){this.last=t;this.pt=0;return;}this.perf(t);this.frame(t);};
    this.raf=requestAnimationFrame(loop);
  }
  componentWillUnmount(){if(this.aboutRO)this.aboutRO.disconnect();cancelAnimationFrame(this.raf);cancelAnimationFrame(this.miniRaf);removeEventListener('popstate',this.onPop);clearTimeout(this.introT);clearTimeout(this.eggT);if(this.ac)this.ac.close();removeEventListener('resize',this.onResize);removeEventListener('keydown',this.onKey);}
  componentDidUpdate(pp){const p=this.props;if(pp.density!==p.density||pp.galaxies!==p.galaxies||pp.constellations!==p.constellations||pp.milkyWay!==p.milkyWay)this.seed();if(pp.quality!==p.quality){const q=p.quality??'auto';this.setQ(q==='high'?1:q==='low'?.4:.85);this.sizeCanvas();}this.syncHash();}

  setQ(q){this.q=q;this.stride=q>=.95?1:q>=.65?2:3;}
  perf(t){if((this.props.quality??'auto')!=='auto'){this.pt=t;return;}const d=this.pt?t-this.pt:16;this.pt=t;if(d>0&&d<250)this.ema=this.ema?this.ema*.94+d*.06:d;
    if(t-(this.qT||0)>2500&&this.state.phase!=='page'&&!this.warp&&!this.state.intro){this.qT=t;const q=this.q??1;if(this.ema>24&&q>.4){this.setQ(Math.max(.4,+(q-.2).toFixed(2)));this.sizeCanvas();}else if(this.ema<12.5&&q<1){this.setQ(Math.min(1,+(q+.1).toFixed(2)));this.sizeCanvas();}}}
  wantIntro(){if(this.langIn)return false;if(/[?&]return=1/.test(location.search))return false;const m=this.props.intro??'always';if(m==='never')return false;if(m==='always')return true;try{return localStorage.getItem('skyward.introSeen')!=='1';}catch(e){return true;}}
  wantCoach(){if(this.langIn)return false;if(/[?&]return=1/.test(location.search))return false;if((this.props.intro??'always')==='always')return true;try{return localStorage.getItem('skyward.coachSeen')!=='1';}catch(e){return true;}}
  startCoach(){if(this.state.lost)return;if(!this.wantCoach()||this.state.phase!=='map'||this.state.intro)return;this.coachGo(0);}
  coachGo(n){this.cs=n;this.cDrag=0;this.cAct=0;this.setState({coach:n});}
  coachDone=()=>{this.cs=-1;this.setState({coach:-1});try{localStorage.setItem('skyward.coachSeen','1');}catch(e){}};
  coachAct(n){if(this.cs!==n)return;if(n===2){this.coachDone();return;}this.cAct=(this.cAct||0)+1;if(this.cAct>5)this.coachGo(n+1);}
  markIntro(){try{localStorage.setItem('skyward.introSeen','1');}catch(e){}clearTimeout(this.introT);}
  launch(){const st=this.state;if(st.intro!=='ready'&&st.intro!=='boot')return;this.heroAt=Infinity;this.markIntro();this.ihold=null;this.revealAt=Infinity;
    const done=()=>{const n=performance.now();let ad=0;if(!this.reduced){ad=4200;this.approach={start:n,dur:ad,d0:9000,d1:DHOME,y0:.7-1.35,y1:.7,p0:.95,p1:.52};this.cam.T=[0,0,0];this.tgt.T=[0,0,0];this.tgt.yaw=null;this.fadeIn={start:n,dur:800,a0:.45};this.idle=n+ad+800;}this.revealAt=n+ad*.72;this.heroAt=n+ad;this.setState({intro:null,live:'Galaxy map. You are here: Home.'});setTimeout(()=>this.startCoach(),ad+900);};
    if(this.reduced){done();return;}
    this.sfx('jump',2);this.setState({intro:'warp'});this.warpP.forEach(q=>Object.assign(q,this.spawn(true)));
    let bx=this.W/2,by=this.H*.6;const br=this.introRing&&this.introRing.ownerSVGElement&&this.introRing.ownerSVGElement.getBoundingClientRect();if(br&&br.width){bx=br.left+br.width/2;by=br.top+br.height/2;}
    this.warp={start:performance.now(),dur:2100,handoff:.62,sx:bx,sy:by,end:[this.W/2,this.H*.4],tint:'255,210,160',name:'Skyward',ly:4.6,dir:1,land:done};}
  skipIntro=()=>{this.markIntro();this.warp=null;this.ihold=null;this.revealAt=performance.now();this.setState({intro:null});setTimeout(()=>this.startCoach(),900);};
  introDown=e=>{if(e.button!==undefined&&e.button!==0)return;this.ihold={start:performance.now()};};
  introUp=()=>{const h=this.ihold;if(!h)return;this.ihold=null;this.ipHandled=true;if(this.introRing)this.introRing.setAttribute('stroke-dashoffset','276.5');if(performance.now()-h.start<300)this.launch();};
  introCancel=()=>{if(!this.ihold)return;this.ihold=null;this.ipHandled=true;if(this.introRing)this.introRing.setAttribute('stroke-dashoffset','276.5');};
  introClick=()=>{if(this.ipHandled){this.ipHandled=false;return;}this.launch();};
  updIntroHold(t){const h=this.ihold;if(!h||!this.introRing)return;const k=clamp((t-h.start-150)/1200,0,1);this.introRing.setAttribute('stroke-dashoffset',(276.5*(1-k)).toFixed(1));if(k>=1){this.ihold=null;this.launch();}}
  parseHash(){let h='';try{h=decodeURIComponent((location.hash||'').replace(/^#\/?/,''));}catch(e){}const [a,b]=h.split('/');const i=SYS.findIndex(s=>s.id===a);if(i<0||i===HOME)return{i:-1,j:-1,bad:!!a&&a!=='home'?h:null};let j=-1;if(b)j=(PL[a]||[]).findIndex(p=>!p.ghost&&slug(p.name)===b);return{i,j,bad:b&&j<0?h:null};}
  lostTrap(on){const m=document.querySelector('main');if(!m)return;const d=m.querySelector('[role=alertdialog]');[...m.children].forEach(c=>{if(on&&d&&c.contains(d))return;if(on)c.setAttribute('inert','');else c.removeAttribute('inert');});}
  lostHome=()=>{this.lostTrap(false);this.setState({lost:null,live:'Back on the galaxy map.'});try{history.replaceState(null,'','#/');}catch(e){}if(this.state.phase!=='map'){this.goHome();}else setTimeout(()=>this.startCoach(),900);};
  hashFor(){const st=this.state;if(st.intro||this.warp||this.egg)return null;if(st.phase==='map')return '#/';if(st.sel<0)return null;const id=SYS[st.sel].id;if(st.phase==='arrive')return '#/'+id;if(st.phase==='page'){const p=(PL[id]||[])[st.psel];return p?'#/'+id+'/'+slug(p.name):'#/'+id;}return null;}
  syncHash(){const h=this.hashFor();if(h==null)return;const cur=location.hash||'#/';if(cur===h||(h==='#/'&&(cur==='#'||cur==='')))return;try{if(this.popping)history.replaceState(null,'',h);else history.pushState(null,'',h);}catch(e){}}
  handlePop(){const st=this.state;if(st.intro||this.warp||this.egg||st.phase==='jump')return;const {i,j,bad}=this.parseHash();if(bad){this.setState({lost:'/'+bad});return;}if(st.lost){this.lostTrap(false);this.setState({lost:null});}this.popping=true;setTimeout(()=>{this.popping=false;},80);
    if(i<0){if(st.phase==='page')this.setState({phase:'arrive'},()=>this.back());else if(st.phase==='arrive')this.back();return;}
    if(st.phase==='map'){if(j>=0){this.openDirect(i,j);return;}this.setState({hover:-1});this.select(i);setTimeout(()=>this.jump(),30);return;}
    if(st.sel===i){if(j>=0){if(st.phase==='page')this.goPlanet(j);else this.openPage(j,true);}else if(st.phase==='page')this.closePage();return;}
    this.openDirect(i,j);}
  openDirect(i,j){this.orb=[];this.orb0=null;this.ospd=1;this.tgt.T=[...SYS[i].p];this.cam.T=[...SYS[i].p];this.tgt.dist=this.cam.dist=220;this.tgt.pitch=this.cam.pitch=.34;
    this.setState(st=>({sel:i,hover:-1,list:false,phase:j>=0?'page':'arrive',psel:j,phover:-1,visited:{...st.visited,[i]:true},live:(j>=0?PL[SYS[i].id][j].name+', ':'')+SYS[i].name+'.'}),()=>setTimeout(()=>{const el=j>=0?this.pageTitle:this.arrive;el&&el.focus({preventScroll:true});},80));}
  openPage(j,anim){const st=this.state,p=(PL[SYS[st.sel].id]||[])[j];if(!p||p.ghost)return;
    const go=()=>{this.setState({phase:'page',psel:j,landMsg:'',live:'Landing on '+p.name+'.'},()=>{if(this.pageEl)this.pageEl.scrollTop=0;setTimeout(()=>this.pageTitle&&this.pageTitle.focus({preventScroll:true}),80);});};
    this.sfx('land',.8);const el=this.pwraps[j],z=this.zoomEl;if(!anim||this.reduced||!el||!z||!z.animate){go();return;}
    const r=el.getBoundingClientRect(),sz=Math.max(24,r.width),cx=r.left+r.width/2,cy=r.top+r.height/2,need=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy))*2/sz+.5;
    z.style.cssText='position:fixed;left:'+(cx-sz/2)+'px;top:'+(cy-sz/2)+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;pointer-events:none;z-index:30;display:block;background:radial-gradient(circle at 34% 30%,'+p.c[0]+' 0%,'+p.c[1]+' 40%,'+p.c[2]+' 100%)';
    const a=z.animate([{transform:'scale(1)'},{transform:'scale('+need.toFixed(2)+')'}],{duration:760,easing:'cubic-bezier(.7,0,.3,1)',fill:'forwards'});
    a.onfinish=()=>{go();const b=z.animate([{opacity:1},{opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'});b.onfinish=()=>{z.style.display='none';a.cancel();b.cancel();};};}
  fCheck(n,v){v=(v||'').trim();if(n==='nome')return v?'':'Enter your name.';if(n==='email'){if(!v)return 'Enter your email.';return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?'':'Check the email, e.g. name@studio.com';}if(n==='msg')return v.length>=10?'':'Tell me in a few lines what you need.';return '';}
  fIn=e=>{const n=e.target.name,v=e.target.value;this.setState(st=>({fv:{...st.fv,[n]:v},ferr:st.ferr[n]?{...st.ferr,[n]:this.fCheck(n,v)}:st.ferr,fstate:st.fstate==='sent'?'idle':st.fstate}));};
  fBlur=e=>{const n=e.target.name,v=e.target.value;if(!v)return;this.setState(st=>({ferr:{...st.ferr,[n]:this.fCheck(n,v)}}));};
  fSubmit=e=>{e.preventDefault();if(this.state.fstate==='sending')return;const fv=this.state.fv,er={};['nome','email','msg'].forEach(n=>{er[n]=this.fCheck(n,fv[n]);});this.setState({ferr:er});const bad=['nome','email','msg'].find(n=>er[n]);if(bad){const el=document.getElementById('f-'+bad);el&&el.focus();return;}
    this.setState({fstate:'sending',live:'Sending.'});__send(fv,'en').then(ok=>this.setState(ok?{fstate:'sent',fv:{nome:'',email:'',msg:''},ferr:{},live:'Message sent.'}:{fstate:'idle',live:'Sending failed. Try again or email me.'}));};
  attachMini(kind,el){if(!el)return;this.minis=this.minis||{};const m=this.minis[kind];if(m&&m.cv===el)return;
    const o={cv:el,ctx:el.getContext('2d'),vis:true,yaw:.7,pitch:.5,drag:null,idle:0,parts:kind==='jump'?Array.from({length:560},()=>this.spawn(true)):null,run:null};
    if(typeof IntersectionObserver!=='undefined'){o.io=new IntersectionObserver(es=>{o.vis=es[0].isIntersecting;});o.io.observe(el);}
    if(kind==='gal'){this.miniSeed();
      el.addEventListener('pointerdown',e=>{el.setPointerCapture&&el.setPointerCapture(e.pointerId);o.drag={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY};el.style.cursor='grabbing';});
      el.addEventListener('pointermove',e=>{const d=o.drag;if(!d)return;o.yaw-=(e.clientX-d.x)*.006;o.pitch=clamp(o.pitch+(e.clientY-d.y)*.005,.05,1.4);d.x=e.clientX;d.y=e.clientY;o.idle=performance.now();});
      const up=e=>{const d=o.drag;o.drag=null;el.style.cursor='grab';if(d&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<5&&o.scr){const r=el.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;let best=-1,bd=36;o.scr.forEach((p,i)=>{if(p){const dd=Math.hypot(p[0]-px,p[1]-py);if(dd<bd){bd=dd;best=i;}}});if(best>=0){this.setState({miniSel:best});this.sfx('blip');}}};
      el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{o.drag=null;});}
    this.minis[kind]=o;if(!this.miniRaf)this.miniRaf=requestAnimationFrame(this.miniLoop);}
  miniLoop=t=>{const ms=this.minis||{};let any=false;for(const k in ms){const m=ms[k];if(!m.cv.isConnected){m.io&&m.io.disconnect();delete ms[k];continue;}any=true;const dt=Math.min(.05,(t-(m.last||t))/1000);m.last=t;if(!m.vis||document.hidden)continue;this.fitMini(m);if(k==='gal')this.drawMiniGal(m,t,dt);else this.drawMiniJump(m,t,dt);}this.miniRaf=any?requestAnimationFrame(this.miniLoop):0;};
  fitMini(m){const d=Math.min(devicePixelRatio||1,2),w=m.cv.clientWidth,h=m.cv.clientHeight;if(m.cv.width!==Math.round(w*d)||m.cv.height!==Math.round(h*d)){m.cv.width=Math.round(w*d);m.cv.height=Math.round(h*d);}m.W=w;m.H=h;m.d=d;}
  miniSeed(){if(this.mStars)return;this.mStars=[];for(let i=0;i<1500;i++){const rr=RG*Math.pow(rnd(),.72),arm=i%3,th=arm*2.094+rr*.0046+gauss()*.26*(1+rr/RG);this.mStars.push({x:Math.cos(th)*rr+gauss()*26,y:gauss()*(38*(1-rr/RG)+9),z:Math.sin(th)*rr+gauss()*26,a:.25+rnd()*.6,r:rnd()<.06?1.6:.9,c:pickT()});}}
  drawMiniGal(m,t,dt){const c=m.ctx,W=m.W,H=m.H;c.setTransform(m.d,0,0,m.d,0,0);if(!m.drag&&!this.reduced&&t-m.idle>1500)m.yaw+=dt*.12;
    const dist=2500,cp=Math.cos(m.pitch),C=[dist*cp*Math.sin(m.yaw),dist*Math.sin(m.pitch),dist*cp*Math.cos(m.yaw)],l=Math.hypot(...C),fw=C.map(v=>-v/l);let r=[-fw[2],0,fw[0]];const lr=Math.hypot(...r)||1;r=r.map(v=>v/lr);const u=[r[1]*fw[2]-r[2]*fw[1],r[2]*fw[0]-r[0]*fw[2],r[0]*fw[1]-r[1]*fw[0]];
    const F=Math.min(W,H)*1.35,cx=W/2,cy=H/2,P=(x,y,z)=>{const dx=x-C[0],dy=y-C[1],dz=z-C[2],zc=dx*fw[0]+dy*fw[1]+dz*fw[2];if(zc<4)return null;const q=F/zc;return[cx+(dx*r[0]+dy*r[1]+dz*r[2])*q,cy-(dx*u[0]+dy*u[1]+dz*u[2])*q,q];};
    c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#07060F';c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
    const o=P(0,0,0);if(o){const s=760*o[2];c.globalAlpha=.4;c.drawImage(this.sprite('255,210,160',true),o[0]-s/2,o[1]-s/2,s,s);}
    for(const q of this.mStars){const p=P(q.x,q.y,q.z);if(!p||p[0]<0||p[1]<0||p[0]>W||p[1]>H)continue;c.globalAlpha=q.a;c.fillStyle='rgb('+q.c+')';c.fillRect(p[0],p[1],q.r,q.r);}
    const sel=this.state.miniSel;m.scr=SYS.map(s=>P(...s.p));const hp=m.scr[HOME];
    c.globalCompositeOperation='source-over';if(hp){c.globalAlpha=1;c.strokeStyle='rgba(169,163,194,.45)';c.setLineDash([2,6]);c.lineWidth=1;c.beginPath();m.scr.forEach((p,i)=>{if(p&&i!==HOME){c.moveTo(hp[0],hp[1]);c.lineTo(p[0],p[1]);}});c.stroke();
      const sp=m.scr[sel];if(sp&&sel!==HOME){c.strokeStyle=SYS[sel].hex;c.setLineDash([6,6]);c.lineDashOffset=-t/60;c.lineWidth=1.25;c.beginPath();c.moveTo(hp[0],hp[1]);c.lineTo(sp[0],sp[1]);c.stroke();}c.setLineDash([]);}
    SYS.forEach((s,i)=>{const p=m.scr[i];if(!p)return;const on=i===sel;c.globalCompositeOperation='lighter';c.globalAlpha=.9;const g=on?50:32;c.drawImage(this.sprite(s.tint,true),p[0]-g/2,p[1]-g/2,g,g);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle=s.hex;c.beginPath();c.arc(p[0],p[1],on?4.5:3.5,0,6.283);c.fill();
      if(on){c.strokeStyle=s.hex;c.lineWidth=1.5;c.beginPath();c.arc(p[0],p[1],13,0,6.283);c.stroke();}
      c.fillStyle='#F2EEE6';c.font='600 13px "Bricolage Grotesque", sans-serif';c.shadowColor='#07060F';c.shadowBlur=6;c.fillText(s.name,p[0]+15,p[1]+4);c.shadowBlur=0;});}
  drawMiniJump(m,t,dt){const c=m.ctx,W=m.W,H=m.H;c.setTransform(m.d,0,0,m.d,0,0);const R0=m.run;let v=.03,k=0;
    if(R0){const el=t-R0.start;k=el/R0.dur;if(k<.28){const q=k/.28;v=.03+q*q*q*.97;}else if(k<.66)v=1;else if(k<1){const q=(k-.66)/.34;v=Math.pow(1-q,2.4)*.97+.03;}else v=.03;if(el>R0.dur+1500){m.run=null;this.setState({jumpBusy:false});}}
    c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#05040C';c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';c.lineCap='round';
    const F=Math.max(W,H)*.16,cx=W/2,cy=H/2,V=v*2.1,dim=R0&&k>1?.35:1;
    for(const p of m.parts){p.z-=V*dt;if(p.z<=.025){Object.assign(p,this.spawn(false));continue;}const z2=Math.min(1.25,p.z+V*.045+.0015),x1=cx+p.x/p.z*F,y1=cy+p.y/p.z*F,x2=cx+p.x/z2*F,y2=cy+p.y/z2*F;if((x1<0&&x2<0)||(x1>W&&x2>W)||(y1<0&&y2<0)||(y1>H&&y2>H))continue;const nr=1-p.z,al=Math.min(1,p.b*(.12+nr*nr*1.3))*dim,lw=Math.max(.5,Math.min(2.4,.35+nr*nr*2.2));
      if(Math.abs(x1-x2)+Math.abs(y1-y2)<1.5){c.globalAlpha=al;c.fillStyle='rgb('+p.c+')';c.fillRect(x1,y1,lw,lw);}else{const g=c.createLinearGradient(x2,y2,x1,y1);g.addColorStop(0,'rgba('+p.c+',0)');g.addColorStop(1,'rgba('+p.c+','+al+')');c.globalAlpha=1;c.strokeStyle=g;c.lineWidth=lw;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();}}
    if(R0){const q=clamp((k-.6)/.4,0,1),e=q*q*(3-2*q),out=k>1?clamp((k-1)*R0.dur/1500,0,1):0,fade=out>.7?1-(out-.7)/.3:1,S=6+e*Math.min(W,H)*.3;c.globalAlpha=(.25+.75*e)*fade;const h=S*2.4;c.drawImage(this.sprite(R0.tint,true),cx-h/2,cy-h/2,h,h);
      const g=c.createRadialGradient(cx,cy,0,cx,cy,S/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.26,'rgba('+R0.tint+',1)');g.addColorStop(.5,'rgba('+R0.tint+',.35)');g.addColorStop(1,'rgba('+R0.tint+',0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,S/2,0,6.283);c.fill();
      c.globalCompositeOperation='source-over';c.globalAlpha=clamp(k/.12,0,1)*fade;c.textAlign='center';c.fillStyle='#F2EEE6';c.font='500 13px "Martian Mono", monospace';c.fillText((k<1?'JUMP · ':'ARRIVAL · ')+R0.name.toUpperCase(),W/2,H-26);c.textAlign='start';}
    else{c.globalCompositeOperation='source-over';c.globalAlpha=.9;c.textAlign='center';c.fillStyle='#A9A3C2';c.font='400 12px "Martian Mono", monospace';c.fillText('AWAITING ROUTE',W/2,H-26);c.textAlign='start';}
    c.globalAlpha=1;}
  jumpDemo=()=>{const m=this.minis&&this.minis.jump;if(!m||m.run)return;const s=SYS[this.state.miniSel];m.parts.forEach(q=>Object.assign(q,this.spawn(true)));m.run={start:performance.now(),dur:this.reduced?1:2200,tint:s.tint,name:s.name};this.setState({jumpBusy:true,live:'Demo jump to '+s.name+'.'});this.sfx('jump',2.2);};
  closePage=()=>{const i=this.state.sel;this.setState({phase:'arrive',live:'System '+(SYS[i]?SYS[i].name:'')+'.'},()=>setTimeout(()=>this.arrive&&this.arrive.focus({preventScroll:true}),40));};
  goPlanet(j){this.setState({psel:j},()=>{if(this.pageEl)this.pageEl.scrollTop=0;this.pageTitle&&this.pageTitle.focus({preventScroll:true});});}
  toContatti(){const cur=this.state.sel;this.setState({psel:-1,phase:'map',here:cur,sel:-1},()=>{this.select(4);setTimeout(()=>this.jump(),60);});}
  audioInit(){if(this.ac)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;const ac=this.ac=new AC(),m=this.master=ac.createGain();m.gain.value=0;m.connect(ac.destination);
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;lp.Q.value=.7;const dg=ac.createGain();dg.gain.value=.22;lp.connect(dg);dg.connect(m);
    [[55,'sine',.5],[82.41,'triangle',.22],[110.2,'sine',.12]].forEach(([fq,tp,g])=>{const o=ac.createOscillator(),gg=ac.createGain();o.type=tp;o.frequency.value=fq;o.detune.value=(rnd()-.5)*14;gg.gain.value=g;o.connect(gg);gg.connect(lp);o.start();});
    const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.07;lg.gain.value=160;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
    const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;this.noise=nb;return true;}
  toggleAudio=()=>{const on=!this.state.audio;if(on&&!this.audioInit())return;if(!this.ac)return;if(this.ac.state==='suspended')this.ac.resume();const now=this.ac.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(on?.5:0,now,.25);try{localStorage.setItem('skyward.audio',on?'1':'0');}catch(e){}this.setState({audio:on,live:on?'Audio on.':'Audio off.'});};
  sfx(type,dur){if(!this.state.audio||!this.ac)return;const ac=this.ac,t=ac.currentTime,m=this.master;
    if(type==='blip'){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(1320,t+.08);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(m);o.start(t);o.stop(t+.2);return;}
    const D=dur||1.4,src=ac.createBufferSource();src.buffer=this.noise;src.loop=true;const bp=ac.createBiquadFilter();bp.type=type==='egg'?'lowpass':'bandpass';bp.Q.value=type==='egg'?1:1.4;const g=ac.createGain();
    if(type==='jump'){bp.frequency.setValueAtTime(260,t);bp.frequency.exponentialRampToValueAtTime(2600,t+D*.55);bp.frequency.exponentialRampToValueAtTime(180,t+D);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+D*.5);g.gain.exponentialRampToValueAtTime(.0001,t+D);}
    else if(type==='egg'){bp.frequency.setValueAtTime(900,t);bp.frequency.exponentialRampToValueAtTime(60,t+D*.7);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.42,t+D*.55);g.gain.exponentialRampToValueAtTime(.0001,t+D);}
    else{bp.frequency.setValueAtTime(1600,t);bp.frequency.exponentialRampToValueAtTime(300,t+D);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+D*.25);g.gain.exponentialRampToValueAtTime(.0001,t+D);}
    src.connect(bp);bp.connect(g);g.connect(m);src.start(t);src.stop(t+D+.1);
    const o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.setValueAtTime(type==='egg'?120:90,t);o.frequency.exponentialRampToValueAtTime(type==='egg'?28:(type==='land'?60:360),t+D*.8);og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(.1,t+D*.3);og.gain.exponentialRampToValueAtTime(.0001,t+D);o.connect(og);og.connect(m);o.start(t);o.stop(t+D+.1);}
  bhClick=()=>{if(this.state.phase!=='map'||this.egg||this.state.intro)return;
    if(this.reduced){this.setState({eggMsg:'A black hole. Best keep your distance.'});clearTimeout(this.eggT);this.eggT=setTimeout(()=>this.setState({eggMsg:''}),4000);return;}
    this.egg={start:performance.now()};this.hold=null;this.vel=0;this.tgt.T=[...this.bh.p];this.tgt.dist=380;this.tgt.yaw=null;this.setState({sel:-1,hover:-1,eggMsg:'',live:'Being pulled in.'});this.sfx('egg',2.6);};
  drawEgg(c,W,H,t){const e=this.egg;if(!e)return;const k=(t-e.start)/2800,b=this.bhScr||{x:W/2,y:H/2,R:30};c.globalCompositeOperation='source-over';
    if(k<.45){const q=k/.45,rad=Math.max(W,H)*(1.25-q*1.05),g=c.createRadialGradient(b.x,b.y,Math.max(1,rad*.2),b.x,b.y,rad);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.2+q*.8)+')');c.globalAlpha=1;c.fillStyle=g;c.fillRect(0,0,W,H);}
    else if(k<.72){const q=(k-.45)/.27,cx=W/2,cy=H/2,Rm=Math.max(W,H)*.7;c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
      for(let i=0;i<280;i++){const u=(i*.618+q*1.7)%1,r=Rm*Math.pow(1-u,1.6),a=i*2.4+(1-u)*9+q*7;c.globalAlpha=u*.9;c.fillStyle=i%3?'rgb(255,200,140)':'rgb(183,164,255)';const z=1+(1-u)*2.4;c.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.8,z,z);}
      c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#000';c.beginPath();c.arc(cx,cy,30+q*50,0,6.283);c.fill();c.strokeStyle='rgba(255,230,200,.9)';c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,32+q*50,0,6.283);c.stroke();}
    else{if(!e.reset){e.reset=true;Object.assign(this.cam,{yaw:.7,pitch:.52,dist:DHOME*1.6,T:[0,0,0]});this.tgt.T=[0,0,0];this.tgt.dist=DHOME;this.tgt.pitch=.52;this.vel=0;this.idle=performance.now();
        this.setState({here:HOME,eggMsg:'Past the event horizon, and back.',live:'You’re back Home.'});clearTimeout(this.eggT);this.eggT=setTimeout(()=>this.setState({eggMsg:''}),4200);}
      const q=(k-.72)/.28;c.globalAlpha=Math.max(0,.85*(1-q*1.4));c.fillStyle='#F2F6FF';c.fillRect(0,0,W,H);}
    c.globalAlpha=1;if(k>=1)this.egg=null;}

  pDown=e=>{if(this.egg||this.state.intro||this.approach)return;this.down={x:e.clientX,y:e.clientY,t:performance.now()};this.sky.setPointerCapture&&this.sky.setPointerCapture(e.pointerId);this.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});this.drag=true;this.vel=0;this.rot=e.button===2||e.shiftKey;this.tgt.yaw=null;this.idle=performance.now();this.sky.style.cursor='grabbing';this.pinch=null;};
  pMove=e=>{
    const p=this.ptr.get(e.pointerId);if(!p)return;
    if(this.ptr.size===1){const dx=e.clientX-p.x,dy=e.clientY-p.y;if(this.cs===0){this.cDrag=(this.cDrag||0)+Math.abs(dx)+Math.abs(dy);if(this.cDrag>140)this.coachGo(1);}
      if(!(this.rot||e.shiftKey)){this.cam.yaw-=dx*.0055;this.vel=-dx*.0055;this.cam.pitch=this.tgt.pitch=clamp(this.cam.pitch+dy*.0045,-.6,1.45);}
      else{const {r,u}=this.basis(),k=this.cam.dist/(this.F||800),T=this.cam.T;for(let j=0;j<3;j++){T[j]+=(-r[j]*dx+u[j]*dy)*k;}const L=Math.hypot(T[0],T[2]);if(L>1500){T[0]*=1500/L;T[2]*=1500/L;}T[1]=clamp(T[1],-600,600);this.tgt.T=[...T];}}
    p.x=e.clientX;p.y=e.clientY;
    if(this.ptr.size===2){const [a,b]=[...this.ptr.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(this.pinch){this.zoomBy(this.pinch/d);this.coachAct(1);}this.pinch=d;}
    this.idle=performance.now();
  };
  pUp=e=>{const d0=this.down;this.down=null;if(d0&&e.type==='pointerup'&&Math.hypot(e.clientX-d0.x,e.clientY-d0.y)<5&&performance.now()-d0.t<500&&this.state.phase==='map'){if(this.state.sel>=0)this.clear();else if(this.state.hover>=0)this.setState({hover:-1});}this.ptr.delete(e.pointerId);if(!this.ptr.size){this.drag=false;this.sky.style.cursor='grab';}this.pinch=null;this.idle=performance.now();};
  wheel=e=>{e.preventDefault();if(this.egg||this.state.intro||this.approach)return;this.coachAct(1);this.zoomBy(Math.exp(e.deltaY*.0013));this.idle=performance.now();};
  zoomBy(k){this.tgt.dist=clamp(this.tgt.dist*k,DMIN,DMAX);}

  sizeCanvas(){if(!this.cv)return;const d=Math.max(.75,Math.min(devicePixelRatio||1,2)*((this.q??1)<.75?.72:1));this.dpr=d;this.cv.width=innerWidth*d;this.cv.height=innerHeight*d;this.W=innerWidth;this.H=innerHeight;}
  sprite(rgb,soft){const k=rgb+(soft?'s':'');if(this.sprites[k])return this.sprites[k];const n=soft?128:64,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
    if(soft){g.addColorStop(0,'rgba('+rgb+',.9)');g.addColorStop(.45,'rgba('+rgb+',.28)');g.addColorStop(1,'rgba('+rgb+',0)');}
    else{g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.08,'rgba('+rgb+',.95)');g.addColorStop(.25,'rgba('+rgb+',.28)');g.addColorStop(1,'rgba('+rgb+',0)');}
    x.fillStyle=g;x.fillRect(0,0,n,n);return this.sprites[k]=c;}

  seed(){
    const n=clamp(this.props.density??1400,200,3000),neb=this.props.milkyWay??true,arms=3;
    const buckets={};const add=(q)=>{(buckets[q.c]=buckets[q.c]||[]).push(q);};
    for(let i=0;i<n;i++){const rr=RG*Math.pow(rnd(),.72),arm=i%arms,th=arm*2.094+rr*.0046+gauss()*.26*(1+rr/RG);
      add({x:Math.cos(th)*rr+gauss()*26,y:gauss()*(38*(1-rr/RG)+9),z:Math.sin(th)*rr+gauss()*26,m:.55+Math.pow(rnd(),6)*3.4,a:.3+rnd()*.6,c:pickT(),p:9+rnd()*14,ph:rnd()*6.28});}
    for(let i=0;i<Math.round(n*.3);i++)add({x:gauss()*120,y:gauss()*60,z:gauss()*120,m:.5+Math.pow(rnd(),5)*2.4,a:.35+rnd()*.5,c:rnd()<.6?'255,222,176':'255,236,194',p:9+rnd()*14,ph:rnd()*6.28});
    const rot=(v,a,b)=>{const [x,y,z]=v,y1=y*Math.cos(a)-z*Math.sin(a),z1=y*Math.sin(a)+z*Math.cos(a);return[x*Math.cos(b)+z1*Math.sin(b),y1,-x*Math.sin(b)+z1*Math.cos(b)];};
    const HOT=['127,230,242','255,210,122','255,122,107','140,240,160','195,166,255','255,160,220'];
    this.regions=[];this.hot=[];
    const G=clamp(this.props.galaxies??22,0,40);let gT=0;for(let g=0;g<G&&gT<900;){gT++;const u=(rnd()*1.3-.65),t=rnd()*6.283,sn=Math.sqrt(1-u*u),D=2600+Math.pow(rnd(),.8)*6500,Rr=420+rnd()*620;
      const dir=[sn*Math.cos(t),u,sn*Math.sin(t)],ang=Math.atan(Rr*1.15/D);
      if(this.regions.some(o=>{const od=o.c.map(v=>v/o.D),sep=Math.acos(clamp(dir[0]*od[0]+dir[1]*od[1]+dir[2]*od[2],-1,1));return sep<(ang+Math.atan(o.Rr*1.15/o.D))*1.35||Math.hypot(dir[0]*D-o.c[0],dir[1]*D-o.c[1],dir[2]*D-o.c[2])<(Rr+o.Rr)*1.5;}))continue;
      g++;const a=(rnd()-.5)*1.4,b=rnd()*6.283,c=dir.map(v=>v*D),reg={c,Rr,a,b,D};this.regions.push(reg);
      const m=Math.round(n*.38*Math.min(1,10/Math.max(G,1))*1.6),ar=2+Math.floor(rnd()*2);
      for(let i=0;i<m;i++){const rr=Rr*Math.pow(rnd(),.72),th=(i%ar)*6.283/ar+rr/Rr*5.3+gauss()*.28*(1+rr/Rr),l=rot([Math.cos(th)*rr+gauss()*18,gauss()*(26*(1-rr/Rr)+6),Math.sin(th)*rr+gauss()*18],a,b);
        add({x:c[0]+l[0],y:c[1]+l[1],z:c[2]+l[2],m:1.2+Math.pow(rnd(),5)*4.5,a:.4+rnd()*.55,c:pickT(),p:9+rnd()*14,ph:rnd()*6.28});}
      for(let i=0;i<Math.round(m*.25);i++)add({x:c[0]+gauss()*Rr*.1,y:c[1]+gauss()*Rr*.05,z:c[2]+gauss()*Rr*.1,m:1+Math.pow(rnd(),4)*3,a:.4+rnd()*.5,c:'255,222,176',p:9+rnd()*14,ph:rnd()*6.28});
      for(let h=0;h<3;h++){const rr=Rr*(.25+rnd()*.6),th=rnd()*6.283,l=rot([Math.cos(th)*rr,0,Math.sin(th)*rr],a,b);this.hot.push({p:[c[0]+l[0],c[1]+l[1],c[2]+l[2]],c:HOT[Math.floor(rnd()*HOT.length)],sc:Rr/600});}
    }
    for(let h=0;h<7;h++){let p,tries=0;do{const rr=250+rnd()*(RG-300),th=rnd()*6.283;p=[Math.cos(th)*rr,gauss()*20,Math.sin(th)*rr];tries++;}while(tries<50&&SYS.some(s=>Math.hypot(s.p[0]-p[0],s.p[2]-p[2])<220));this.hot.push({p,c:HOT[Math.floor(rnd()*HOT.length)],sc:1});}
    this.buckets=Object.entries(buckets);
    this.haze=Array.from({length:60},()=>{const u=rnd()*2-1,t=rnd()*6.283,s=Math.sqrt(1-u*u);return{d:[s*Math.cos(t),u,s*Math.sin(t)],s:.25+rnd()*.5,a:.05+rnd()*.07,c:NEB[Math.floor(rnd()*NEB.length)]};});
    this.skyb=Array.from({length:2200},()=>{const u=rnd()*2-1,t=rnd()*6.283,s=Math.sqrt(1-u*u);return{d:[s*Math.cos(t),u,s*Math.sin(t)],a:.12+Math.pow(rnd(),3)*.5,r:rnd()<.08?1.4:.8};});
    const N=clamp(this.props.constellations??30,0,60),cl=[];let tries=0;
    while(cl.length<N&&tries<600){tries++;const rr=160+rnd()*(RG-200),th=rnd()*6.283,c=[Math.cos(th)*rr,gauss()*18,Math.sin(th)*rr];
      if(SYS.some(s=>Math.hypot(s.p[0]-c[0],s.p[2]-c[2])<110))continue;
      const young=rnd()<.55,base=young?'196,214,255':'255,226,180',k=10+Math.floor(rnd()*24),rad=10+rnd()*30,st=[];
      for(let i=0;i<k;i++){const dd=Math.pow(rnd(),.8);st.push({o:[gauss()*rad*dd,gauss()*rad*.6*dd,gauss()*rad*dd],m:.7+Math.pow(rnd(),3)*3.2,a:.45+rnd()*.5,c:rnd()<.75?base:pickT(),p:9+rnd()*14,ph:rnd()*6.28});}
      cl.push({c,st,glow:young?'150,180,255':'255,200,150',gs:rad*3.2});}
    this.clusters=cl;
    this.nebs=[];
    if(neb){for(let i=0;i<34;i++){const rr=120+rnd()*(RG-150),arm=i%arms,th=arm*2.094+rr*.0046+gauss()*.2;this.nebs.push({p:[Math.cos(th)*rr,gauss()*20,Math.sin(th)*rr],s:130+rnd()*300,a:.05+rnd()*.08,c:NEB[Math.floor(rnd()*NEB.length)]});}}
    SYS.forEach(s=>this.nebs.push({p:s.p,s:220,a:.12,c:s.tint}));
    for(const reg of this.regions){if(neb){const k=10;for(let i=0;i<k;i++){const rr=reg.Rr*Math.pow(rnd(),.6),th=rnd()*6.283;this.nebs.push({p:[reg.c[0]+Math.cos(th)*rr,reg.c[1]+gauss()*30,reg.c[2]+Math.sin(th)*rr],s:reg.Rr*(.35+rnd()*.5),a:.06+rnd()*.08,c:NEB[Math.floor(rnd()*NEB.length)]});}}
      this.nebs.push({p:reg.c,s:reg.Rr*.8,a:.22,c:'255,210,160'});
      for(let i=0;i<Math.round(N*Math.min(1,10/Math.max(G,1))/4);i++){const rr=reg.Rr*(.15+rnd()*.8),th=rnd()*6.283,cc=[reg.c[0]+Math.cos(th)*rr,reg.c[1]+gauss()*20,reg.c[2]+Math.sin(th)*rr],young=rnd()<.55,base=young?'196,214,255':'255,226,180',k=10+Math.floor(rnd()*18),rad=14+rnd()*34,st=[];
        for(let j=0;j<k;j++){const dd=Math.pow(rnd(),.8);st.push({o:[gauss()*rad*dd,gauss()*rad*.6*dd,gauss()*rad*dd],m:1.2+Math.pow(rnd(),3)*4,a:.45+rnd()*.5,c:rnd()<.75?base:pickT(),p:9+rnd()*14,ph:rnd()*6.28});}
        this.clusters.push({c:cc,st,glow:young?'150,180,255':'255,200,150',gs:rad*3.2});}}
    for(const h of this.hot){this.nebs.push({p:h.p,s:220*h.sc,a:.13,c:h.c});
      const st=Array.from({length:22},()=>({o:[gauss()*20*h.sc,gauss()*12*h.sc,gauss()*20*h.sc],m:(.8+Math.pow(rnd(),3)*2.2)*(h.sc>1?1.6:1),a:.5+rnd()*.5,c:h.c,p:9+rnd()*14,ph:rnd()*6.28}));
      st.push({o:[0,0,0],m:3.4*(h.sc>1?1.5:1),a:1,c:h.c,p:12,ph:rnd()*6.28});
      this.clusters.push({c:h.p,st,glow:h.c,gs:70*h.sc});}
    this.swarms=SYS.map(s=>Array.from({length:22},()=>({o:[gauss()*20,gauss()*12,gauss()*20],m:.8+Math.pow(rnd(),3)*2.2,a:.5+rnd()*.5,p:9+rnd()*14,ph:rnd()*6.28})));
    this.bh={p:[288,-1613,-2576],R:150,tilt:-.32,k:.24,parts:Array.from({length:1100},()=>{const r=1.55+Math.pow(rnd(),1.6)*2.9;return{r,a:rnd()*6.283,w:.9/Math.pow(r,1.5),s:.6+rnd()*1.3,b:.35+rnd()*.65};})};
    this.warpP=Array.from({length:1400},()=>this.spawn(true));
    this.warpNeb=Array.from({length:16},()=>{const an=rnd()*6.283,rr=.5+rnd()*1.4;return{x:Math.cos(an)*rr,y:Math.sin(an)*rr,z:.1+rnd()*.9,s:.25+rnd()*.5,c:NEB[Math.floor(rnd()*NEB.length)],t:rnd()<.35};});
  }
  aboutGalRef=el=>{if(this.aboutRO){this.aboutRO.disconnect();this.aboutRO=null;}if(!el)return;const draw=()=>this.drawAboutGal(el);this.aboutRO=new ResizeObserver(draw);this.aboutRO.observe(el);draw();};
  drawAboutGal(el){const W=el.clientWidth,H=el.clientHeight;if(!W||!H)return;const d=Math.min(devicePixelRatio||1,2);el.width=W*d;el.height=H*d;const x=el.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);
    for(let i=0;i<Math.round(W*H/900);i++){const px=rnd()*W,py=rnd()*H,r=rnd()<.9?.5+rnd()*.6:1+rnd()*.8;x.fillStyle='rgba(242,238,230,'+(.25+rnd()*.6)+')';x.beginPath();x.arc(px,py,r,0,6.283);x.fill();}
  }
  galaxy(col,spiral){
    const n=256,src=document.createElement('canvas');src.width=src.height=n;const x=src.getContext('2d'),h=n/2;
    const glow=(cx,cy,r,rgb,al)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba('+rgb+','+al+')');g.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,6.283);x.fill();};
    x.globalCompositeOperation='lighter';
    if(spiral){glow(h,h,n*.46,col,.16);
      const arms=2,b=.2+rnd()*.08,off=rnd()*6.283;
      for(let a=0;a<arms;a++)for(let i=0;i<340;i++){const th=rnd()*3.2*Math.PI,r=n*.03*Math.exp(b*th);if(r>n*.46)continue;const an=th+a*Math.PI+off+gauss()*.12,px=h+Math.cos(an)*r+gauss()*r*.06,py=h+Math.sin(an)*r+gauss()*r*.06;glow(px,py,1.5+rnd()*3.5,rnd()<.25?'255,255,255':col,.25+rnd()*.35*(1-r/(n*.46)));}
      glow(h,h,n*.13,'255,244,225',.9);glow(h,h,n*.05,'255,255,255',.9);}
    else{glow(h,h,n*.46,col,.35);glow(h,h,n*.2,'255,240,220',.55);glow(h,h,n*.06,'255,255,255',.8);}
    const c=document.createElement('canvas');c.width=c.height=n;const y=c.getContext('2d');
    y.translate(h,h);y.rotate(rnd()*6.283);y.scale(1,spiral?.3+rnd()*.7:.45+rnd()*.5);y.drawImage(src,-h,-h);
    return c;}
  drawBH(c,x,y,Rp,s,mo){
    const B=this.bh,th=B.tilt,k=B.k,ct=Math.cos(th),st=Math.sin(th),rot=s*(mo?.9:0);
    const L=(lx,ly)=>[x+lx*ct-ly*st,y+lx*st+ly*ct];
    const col=(r,b)=>{const t=clamp((r-1.55)/2.9,0,1);return t<.25?'255,246,226':t<.55?'255,208,140':t<.8?'255,150,82':'214,86,52';};
    c.globalCompositeOperation='source-over';
    let g=c.createRadialGradient(x,y,Rp*.9,x,y,Rp*3.2);g.addColorStop(0,'rgba(3,2,10,.95)');g.addColorStop(.35,'rgba(6,5,18,.55)');g.addColorStop(1,'rgba(11,10,31,0)');c.globalAlpha=1;c.fillStyle=g;c.beginPath();c.arc(x,y,Rp*3.2,0,6.283);c.fill();
    c.globalCompositeOperation='lighter';
    c.globalAlpha=.5;const ag=Rp*11;c.drawImage(this.sprite('255,150,90',true),x-ag/2,y-ag/2,ag,ag);
    c.globalAlpha=.12;c.strokeStyle='rgba(200,190,255,1)';c.lineWidth=1;c.beginPath();c.arc(x,y,Rp*2.6,0,6.283);c.stroke();
    const jf=mo?.75+.25*Math.sin(s*2.3):.85;for(const d of [-1,1]){const jl=Rp*(3+(mo?.4*Math.sin(s*.7+d):0)),[ex,ey]=L(d*0,-d*jl/k*.0+0);const ax=-st*d,ay=ct*d;const x2=x+ax*jl,y2=y-ay*jl*-1;const jg=c.createLinearGradient(x,y,x+(-st)*-d*jl,y+ct*-d*jl);jg.addColorStop(0,'rgba(170,200,255,'+(.22*jf)+')');jg.addColorStop(1,'rgba(170,200,255,0)');c.strokeStyle=jg;c.lineWidth=Math.max(1,Rp*.18);c.lineCap='round';c.globalAlpha=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+(-st)*-d*jl,y+ct*-d*jl);c.stroke();}
    const band=(a0,a1,al)=>{for(let i=0;i<14;i++){const r=(1.6+i*.2)*Rp,t=i/13;c.strokeStyle='rgba('+col(1.6+i*.2)+','+(al*(1-t*.7))+')';c.lineWidth=Rp*.22;c.globalAlpha=1;c.beginPath();c.ellipse(x,y,r,r*k,th,a0,a1);c.stroke();}};
    band(Math.PI,2*Math.PI,.07);
    for(const q of B.parts){const a=q.a+rot*q.w,sa=Math.sin(a);if(sa>0)continue;const ca=Math.cos(a),dop=1+.75*(-ca),[px,py]=L(ca*q.r*Rp,sa*q.r*Rp*k);c.globalAlpha=clamp(q.b*.5*dop,0,1);c.fillStyle='rgb('+col(q.r)+')';const z=q.s*Math.max(.6,Rp/60);c.fillRect(px-z/2,py-z/2,z,z);}
    for(const q of B.parts){if(q.r>3.4)continue;const a=q.a+rot*q.w,sa=Math.sin(a);if(sa>0)continue;const ca=Math.cos(a),rho=(1.12+(q.r-1.55)*.32)*Rp,dop=1+.75*(-ca);
      let [px,py]=L(ca*rho,-Math.sqrt(Math.max(0,1-ca*ca))*rho*.98);c.globalAlpha=clamp(q.b*.42*dop,0,1);c.fillStyle='rgb('+col(q.r)+')';const z=q.s*Math.max(.6,Rp/70);c.fillRect(px-z/2,py-z/2,z,z);
      [px,py]=L(ca*rho*.86,Math.sqrt(Math.max(0,1-ca*ca))*rho*.8);c.globalAlpha=clamp(q.b*.16*dop,0,1);c.fillRect(px-z/2,py-z/2,z,z);}
    for(let i=0;i<5;i++){const rr=Rp*(1.14+i*.09);c.globalAlpha=.1-i*.015;c.strokeStyle='rgb(255,200,130)';c.lineWidth=Rp*.12;c.beginPath();c.ellipse(x,y,rr,rr*.98,th,Math.PI*1.02,Math.PI*1.98);c.stroke();}
    c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#000';c.beginPath();c.arc(x,y,Rp,0,6.283);c.fill();
    c.globalCompositeOperation='lighter';
    const pr=mo?.85+.15*Math.sin(s*3.1):.9;c.globalAlpha=pr;c.strokeStyle='rgba(255,236,205,1)';c.lineWidth=Math.max(1,Rp*.045);c.beginPath();c.arc(x,y,Rp*1.035,0,6.283);c.stroke();
    c.globalAlpha=.35*pr;c.lineWidth=Math.max(2,Rp*.14);c.strokeStyle='rgba(255,190,120,1)';c.beginPath();c.arc(x,y,Rp*1.08,0,6.283);c.stroke();
    band(0,Math.PI,.09);
    for(const q of B.parts){const a=q.a+rot*q.w,sa=Math.sin(a);if(sa<=0)continue;const ca=Math.cos(a),dop=1+.75*(-ca),[px,py]=L(ca*q.r*Rp,sa*q.r*Rp*k);c.globalAlpha=clamp(q.b*.6*dop,0,1);c.fillStyle='rgb('+col(q.r)+')';const z=q.s*Math.max(.6,Rp/60);c.fillRect(px-z/2,py-z/2,z,z);}
    c.globalAlpha=1;
  }
  spawn(init){const an=rnd()*6.283,rr=.035+Math.pow(rnd(),.65)*1.3;return{x:Math.cos(an)*rr,y:Math.sin(an)*rr,z:init?.08+rnd()*1.1:1.1+rnd()*.15,c:pickT(),b:.35+Math.pow(rnd(),2)*.65,hot:rnd()<.45};}

  basis(){const {dist,T}=this.cam,yaw=this.cam.yaw+this.swY,pitch=this.cam.pitch+this.swP,cp=Math.cos(pitch);
    const C=[T[0]+dist*cp*Math.sin(yaw),T[1]+dist*Math.sin(pitch),T[2]+dist*cp*Math.cos(yaw)];
    let fw=[T[0]-C[0],T[1]-C[1],T[2]-C[2]];const l=Math.hypot(...fw);fw=fw.map(v=>v/l);
    let r=[-fw[2],0,fw[0]];const lr=Math.hypot(...r)||1;r=r.map(v=>v/lr);
    const u=[r[1]*fw[2]-r[2]*fw[1],r[2]*fw[0]-r[0]*fw[2],r[0]*fw[1]-r[1]*fw[0]];
    return{C,fw,r,u};}

  frame(t){
    const c=this.ctx;if(!c)return;const W=this.W,H=this.H,d=this.dpr;c.setTransform(d,0,0,d,0,0);
    const dt=Math.min(.05,(t-this.last)/1000);this.last=t;
    const s=(t-this.t0)/1000,red=this.reduced,mo=red?0:this.motion,st=this.state,cam=this.cam,tg=this.tgt;
    if(st.intro==='boot'||st.intro==='ready'){this.updIntroHold(t);return;}
    if(st.phase==='page'&&!this.warp&&t-(this.lastDraw||0)<66)return;this.lastDraw=t;
    if(this.egg){const ek=(t-this.egg.start)/2800;if(ek<.45)cam.yaw+=dt*(ek/.45)*2.4;}
    if(!this.drag){cam.yaw+=this.vel;this.vel*=Math.pow(.03,dt);}
    if(!red&&!this.drag&&t-this.idle>(st.sel>=0?1200:2200))cam.yaw+=dt*(st.sel>=0?.11:.03)*Math.min(mo,2);
    this.swY=0;this.swP=0;
    if(tg.yaw!=null&&!this.drag){const dy=tg.yaw-cam.yaw;cam.yaw+=dy*(red?1:1-Math.pow(.02,dt));if(Math.abs(dy)<.001){cam.yaw=tg.yaw;tg.yaw=null;}}
    const k=red?1:1-Math.pow(.02,dt);
    if(this.approach){const A=this.approach,q=clamp((t-A.start)/A.dur,0,1),e=1-Math.pow(1-q,3.2),dd=Math.exp(Math.log(A.d0)+(Math.log(A.d1)-Math.log(A.d0))*e);cam.dist=tg.dist=dd;cam.yaw=A.y0+(A.y1-A.y0)*e;cam.pitch=tg.pitch=A.p0+(A.p1-A.p0)*e;this.vel=0;if(q>=1){this.approach=null;this.idle=t;}}
    for(let i=0;i<3;i++)cam.T[i]+=(tg.T[i]-cam.T[i])*k;
    cam.dist+=(tg.dist-cam.dist)*k;if(!this.drag)cam.pitch+=(tg.pitch-cam.pitch)*k;
    const mob=W<760;this.cxOff+=(((st.sel>=0&&!mob&&!st.list&&st.phase==='map')?-190:0)-this.cxOff)*k;
    const z=cam.dist<900;if(z!==st.zoomed)this.setState({zoomed:z});
    if(this.warp){this.drawWarp(c,W,H,t,dt);return;}
    const arr=(st.phase==='arrive'||st.phase==='page')&&this.lay,{C,fw,r,u}=this.basis(),F=this.F=Math.min(W,H*1.15)*.95,cx=arr?this.lay.cx:W/2+this.cxOff,cy=arr?this.lay.cy:H*.40;
    const P=(x,y,zz)=>{const dx=x-C[0],dy=y-C[1],dz=zz-C[2],zc=dx*fw[0]+dy*fw[1]+dz*fw[2];if(zc<4)return null;const q=F/zc;return[cx+(dx*r[0]+dy*r[1]+dz*r[2])*q,cy-(dx*u[0]+dy*u[1]+dz*u[2])*q,q,zc];};
    c.clearRect(0,0,W,H);c.globalCompositeOperation='source-over';
    c.fillStyle='#F2EEE6';
    for(let bi=0,SK=this.skyb;bi<SK.length;bi+=this.stride){const b=SK[bi];const zc=b.d[0]*fw[0]+b.d[1]*fw[1]+b.d[2]*fw[2];if(zc<=.05)continue;const x=cx+(b.d[0]*r[0]+b.d[1]*r[1]+b.d[2]*r[2])/zc*F,y=cy-(b.d[0]*u[0]+b.d[1]*u[1]+b.d[2]*u[2])/zc*F;if(x<0||y<0||x>W||y>H)continue;c.globalAlpha=b.a;c.fillRect(x,y,b.r,b.r);}
    c.globalCompositeOperation='lighter';
    for(const b of this.haze||[]){const zc=b.d[0]*fw[0]+b.d[1]*fw[1]+b.d[2]*fw[2];if(zc<=.1)continue;const x=cx+(b.d[0]*r[0]+b.d[1]*r[1]+b.d[2]*r[2])/zc*F,y=cy-(b.d[0]*u[0]+b.d[1]*u[1]+b.d[2]*u[2])/zc*F,sz=b.s*F/zc;if(x<-sz||y<-sz||x>W+sz||y>H+sz)continue;c.globalAlpha=b.a;c.drawImage(this.sprite(b.c,true),x-sz/2,y-sz/2,sz,sz);}
    const vis=(p,m)=>p&&p[0]>-m&&p[1]>-m&&p[0]<W+m&&p[1]<H+m;
    for(const n of this.nebs){const p=P(n.p[0],n.p[1],n.p[2]);if(!vis(p,900))continue;const sz=n.s*p[2];if(sz<6)continue;const fade=clamp(1.6-sz/(Math.max(W,H)*2.2),0,1);c.globalAlpha=n.a*fade*(1+(mo?.15*Math.sin(s*.2+n.s):0));c.drawImage(this.sprite(n.c,true),p[0]-sz/2,p[1]-sz/2,sz,sz);}
    {const p=P(0,0,0);if(vis(p,900)){const sz=560*p[2];c.globalAlpha=.32;c.drawImage(this.sprite('255,210,160',true),p[0]-sz/2,p[1]-sz/2,sz,sz);}}
    this.bhScr=null;if((this.props.blackHole??true)&&this.bh){const bp=P(...this.bh.p);if(bp){const Rp=clamp(this.bh.R*bp[2],6,220);if(vis(bp,Rp*8)){this.drawBH(c,bp[0],bp[1],Rp,s,mo);this.bhScr={x:bp[0],y:bp[1],R:Rp};}c.globalCompositeOperation='lighter';}}
    const depth=zc=>clamp(1.35-zc/7500,.45,1);
    for(const [col,arr] of this.buckets){const spr=this.sprite(col);c.fillStyle='rgb('+col+')';
      for(let qi=0;qi<arr.length;qi+=this.stride){const q=arr[qi];const p=P(q.x,q.y,q.z);if(!vis(p,20))continue;const px=Math.min(5,q.m*p[2]*1.25),tw=mo?.7+.3*Math.sin(6.283*s/q.p+q.ph):1,a=q.a*depth(p[3])*tw;
        c.globalAlpha=a;if(px<1.3){c.fillRect(p[0],p[1],Math.max(.6,px),Math.max(.6,px));}else{const g=Math.min(48,px*5);c.drawImage(spr,p[0]-g/2,p[1]-g/2,g,g);}}}
    for(const g of this.clusters){const pc=P(g.c[0],g.c[1],g.c[2]);if(!vis(pc,400))continue;
      const gs=g.gs*pc[2];if(gs>4){c.globalAlpha=.16*(mo?.8+.2*Math.sin(s*.4+g.gs):1);c.drawImage(this.sprite(g.glow,true),pc[0]-gs/2,pc[1]-gs/2,gs,gs);}
      for(let qi=0,ST=g.st,sd=this.stride>2?2:1;qi<ST.length;qi+=sd){const q=ST[qi];const p=P(g.c[0]+q.o[0],g.c[1]+q.o[1],g.c[2]+q.o[2]);if(!p)continue;const tw=mo?.55+.45*Math.sin(6.283*s/q.p+q.ph):1,px=Math.min(7,q.m*p[2]*1.3),gg=Math.max(5,Math.min(70,px*7));
        c.globalAlpha=q.a*depth(p[3])*tw;c.drawImage(this.sprite(q.c),p[0]-gg/2,p[1]-gg/2,gg,gg);}}
    SYS.forEach((sy,i)=>{const spr=this.sprite(sy.tint);for(const q of this.swarms[i]){const p=P(sy.p[0]+q.o[0],sy.p[1]+q.o[1],sy.p[2]+q.o[2]);if(!p)continue;const tw=mo?.6+.4*Math.sin(6.283*s/q.p+q.ph):1,gg=Math.max(5,Math.min(60,q.m*p[2]*8));c.globalAlpha=q.a*tw*depth(p[3]);c.drawImage(spr,p[0]-gg/2,p[1]-gg/2,gg,gg);}});
    c.globalCompositeOperation='source-over';
    {const hp=P(...SYS[st.here].p),hx=SYS[st.here];if(hp&&st.phase==='map'){c.strokeStyle=hx.hex;c.lineWidth=1.4;
      const base=hx.home?clamp(24*hp[2],7,260)+8:16;
      for(let k=0;k<2;k++){const ph=red?.35:((s*.55+k*.5)%1);c.globalAlpha=(1-ph)*.8;c.beginPath();c.arc(hp[0],hp[1],base+ph*48,0,6.283);c.stroke();}}}
    c.globalAlpha=1;
    if(mo&&s>this.nextShoot&&!this.shoot){const a=(200+rnd()*35)*Math.PI/180,v=700+rnd()*500;this.shoot={x:W*(.3+rnd()*.65),y:H*(.04+rnd()*.35),vx:Math.cos(a)*v,vy:Math.abs(Math.sin(a)*v),t:0,life:.6+rnd()*.4};this.nextShoot=s+(6+rnd()*9)/Math.max(.3,mo);}
    if(this.shoot){const q=this.shoot;q.t+=dt;const kk=q.t/q.life,hx=q.x+q.vx*q.t,hy=q.y+q.vy*q.t,tx=hx-q.vx*.13,ty=hy-q.vy*.13;
      const g=c.createLinearGradient(tx,ty,hx,hy);g.addColorStop(0,'rgba(242,238,230,0)');g.addColorStop(1,'rgba(242,238,230,'+(.85*Math.sin(Math.PI*Math.min(1,kk)))+')');
      c.globalAlpha=1;c.strokeStyle=g;c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(tx,ty);c.lineTo(hx,hy);c.stroke();if(kk>=1)this.shoot=null;}
    c.globalAlpha=1;
    if(this.hold){const hd=this.hold,g=this.holds[hd.i],k=clamp((t-hd.start-180)/(red?500:850),0,1);
      if(g){g.style.opacity=k>0?'1':'0';const c2=g.lastChild;if(c2)c2.setAttribute('stroke-dashoffset',(169.6*(1-k)).toFixed(1));}
      if(k>=1){this.coachAct(2);this.hold=null;this.holdFired={i:hd.i,t:performance.now()};if(g)g.style.opacity='0';if(hd.i===HOME)this.goHome();else{this.select(hd.i);setTimeout(()=>this.jump(),40);}}}
    if(this.fadeIn){const q=clamp((t-this.fadeIn.start)/this.fadeIn.dur,0,1);c.globalCompositeOperation='source-over';c.globalAlpha=(this.fadeIn.a0??1)*Math.pow(1-q,1.6);c.fillStyle='#05040C';c.fillRect(0,0,W,H);c.globalAlpha=1;if(q>=1)this.fadeIn=null;}
    if(this.wtail){const T=this.wtail,q=clamp((t-T.start)/T.dur,0,1),V=T.V0*Math.pow(1-q,2.2),am=Math.pow(1-q,1.4),F2=Math.max(W,H)*.14,roll=(t-T.start)/1000*.1*T.dir,cr=Math.cos(roll),sr=Math.sin(roll),sd=this.stride||1;
      c.globalCompositeOperation='lighter';c.lineCap='round';
      for(let i=0,PP=this.warpP;i<PP.length;i+=sd){const p=PP[i];p.z-=V*dt;if(p.z<=.025){Object.assign(p,this.spawn(false));continue;}const z2=Math.min(1.25,p.z+V*.045+.0015),rx=p.x*cr-p.y*sr,ry=p.x*sr+p.y*cr,x1=T.cx+rx/p.z*F2,y1=T.cy+ry/p.z*F2,x2=T.cx+rx/z2*F2,y2=T.cy+ry/z2*F2;
        if((x1<-40&&x2<-40)||(x1>W+40&&x2>W+40)||(y1<-40&&y2<-40)||(y1>H+40&&y2>H+40))continue;const nr=1-p.z,al=Math.min(1,p.b*(.12+nr*nr*1.3))*am;if(al<.02)continue;const lw=Math.max(.5,Math.min(2.8,.35+nr*nr*2.6));
        const g=c.createLinearGradient(x2,y2,x1,y1);g.addColorStop(0,'rgba('+p.c+',0)');g.addColorStop(1,'rgba('+p.c+','+al+')');c.globalAlpha=1;c.strokeStyle=g;c.lineWidth=lw;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();}
      c.globalCompositeOperation='source-over';c.globalAlpha=1;if(q>=1)this.wtail=null;}
    this.drawEgg(c,W,H,t);
    this.lastP=P;this.place(P,s,mo);if(arr&&st.phase==='arrive')this.placePlanets(dt,s,mo);
  }
  place(P,s,mo){
    if(this.state.phase!=='map')return;
    const nowP=performance.now(),rv=this.revealAt;
    if(this.navEl)this.navEl.style.visibility=this.egg?'hidden':'';
    if(this.pIdle&&this.pIdle.parentNode)this.pIdle.parentNode.style.visibility=this.egg?'hidden':'';
    if(this.bhBtn){const b=this.bhScr;if(b&&!this.egg){const sz=clamp(b.R*2.6,44,220);this.bhBtn.style.width=this.bhBtn.style.height=sz+'px';this.bhBtn.style.translate=(b.x-sz/2).toFixed(1)+'px '+(b.y-sz/2).toFixed(1)+'px';this.bhBtn.style.visibility='visible';}else this.bhBtn.style.visibility='hidden';}
    const sel=this.state.sel,here=this.state.here,routes=this.props.routes??true,o=P(...SYS[here].p);let idle='',act='';this.scr=[];
    SYS.forEach((sy,i)=>{const p=P(...sy.p),w=this.wraps[i];this.scr[i]=p;
      if(w){if(p){const fl=p[0]>this.W-175;w.style.translate=p[0].toFixed(1)+'px '+p[1].toFixed(1)+'px';w.style.visibility='visible';w.style.flexDirection=fl?'row-reverse':'row';w.style.transform=fl?'translate(calc(-100% + 22px),-22px)':'translate(-22px,-22px)';if(w.lastChild&&w.lastChild.style){w.lastChild.style.textAlign=fl?'right':'left';const Rp=sy.home?clamp(24*p[2],7,260):0,ex=Math.max(0,Rp-8);w.lastChild.style.marginLeft=fl?'0px':ex+'px';w.lastChild.style.marginRight=fl?ex+'px':'0px';}}else w.style.visibility='hidden';}
      if(w&&rv!=null){const o=rv===Infinity?0:clamp((nowP-rv-150-i*110)/420,0,1),v=o>=1?'':String(o);if(w.firstChild)w.firstChild.style.opacity=v;if(w.lastChild)w.lastChild.style.opacity=v;}
      const h=this.halos[i];if(h){const kk=.5+.5*Math.sin(s*1.05+i*1.3);h.style.opacity=(mo?.35+.5*kk:.6).toFixed(3);h.style.transform='scale('+(mo?1+.35*kk:1.1).toFixed(3)+')';}
      if(p&&o&&i!==here){const seg='M'+o[0].toFixed(1)+' '+o[1].toFixed(1)+' L'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' ';if(i===sel)act+=seg;else idle+=seg;}
    });
    if(this.pIdle){this.pIdle.setAttribute('d',routes?idle:'');if(mo)this.pIdle.style.strokeDashoffset=(-s*4).toFixed(1);}
    if(this.pAct){this.pAct.setAttribute('d',act);if(sel>=0)this.pAct.setAttribute('stroke',SYS[sel].hex);if(mo)this.pAct.style.strokeDashoffset=(-s*14).toFixed(1);}
    if(this.pIdle){if(rv!=null){const o=rv===Infinity?0:clamp((nowP-rv-900)/700,0,1);this.pIdle.style.opacity=String(o);if(rv!==Infinity&&nowP-rv>2600){this.revealAt=null;this.pIdle.style.opacity='';}}}
    if(this.hero&&this.heroAt!=null){const ha=this.heroAt,o=ha===Infinity?0:clamp((nowP-ha-150)/650,0,1);this.hero.style.animation='none';this.hero.style.opacity=String(o);this.hero.style.transform='translateY('+((1-o)*12).toFixed(1)+'px)';if(ha!==Infinity&&nowP-ha>900){this.heroAt=null;this.hero.style.opacity='';this.hero.style.transform='';}}
    const now=performance.now();if(!this.rc||now-this.rcT>400){this.rcT=now;this.rc=[this.hero,this.hint].map(el=>el&&el.isConnected?el.getBoundingClientRect():null);}
    const hit=rc=>rc&&this.scr.some(p=>p&&p[0]+170>rc.left&&p[0]-22<rc.right&&p[1]+20>rc.top&&p[1]-22<rc.bottom);
    const st=this.state;if(this.hero)this.hero.style.opacity=this.egg||(this.approach&&performance.now()-this.approach.start<this.approach.dur*.65)?'0':(st.sel>=0||st.zoomed||hit(this.rc[0]))?'.22':'1';
    if(this.hint)this.hint.style.opacity=hit(this.rc[1])?'0':'1';
    if(this.orig){if(o){this.orig.style.translate=o[0].toFixed(1)+'px '+o[1].toFixed(1)+'px';this.orig.style.visibility='visible';}else this.orig.style.visibility='hidden';}
  }
  placePlanets(dt,s,mo){
    const L=this.lay,st=this.state,n=L.rx.length,E=this.emerge;let e=1,eo=1,es=1;
    if(E){const q=clamp((performance.now()-E.start)/1300,0,1);e=1-Math.pow(1-q,3);es=1-Math.pow(1-clamp(q/.8,0,1),2.4);eo=clamp((q-.12)/.5,0,1);if(q>=1)this.emerge=null;}
    if(this.orbSvg){this.orbSvg.style.transformOrigin=L.cx+'px '+L.cy+'px';this.orbSvg.style.transform=e<1?'scale('+e.toFixed(3)+')':'';this.orbSvg.style.opacity=eo<1?eo.toFixed(3):'';}
    const tgt=(st.psel>=0||st.phover>=0)?0:1;this.ospd+=(tgt-this.ospd)*(1-Math.pow(.02,dt));
    for(let i=0;i<n;i++){if(this.orb[i]==null)this.orb[i]=(this.orb0??(this.orb0=rnd()*6.283))+i*2.4+rnd()*.35;
      this.orb[i]+=dt*this.ospd*(mo?.16*Math.min(mo,2)/Math.pow(i+1,.75):0);
      const a=this.orb[i]+(1-e)*2.4,x=L.cx+Math.cos(a)*L.rx[i]*e,y=L.cy+Math.sin(a)*L.rx[i]*TILT*e,dd=(Math.sin(a)+1)/2,w=this.pwraps[i];
      const hl=this.phalos[i];if(hl){const kk=.5+.5*Math.sin(s*1.05+i*1.7);hl.style.scale=(mo?1+.3*kk:1.1).toFixed(3);}
      if(w){const lb=w.lastChild;if(lb&&lb.style){const lw=lb.offsetWidth||120,fl=x+w.offsetWidth/2+8+lw>innerWidth-16;if(lb._fl!==fl){lb._fl=fl;lb.style.left=fl?'auto':'calc(100% + 8px)';lb.style.right=fl?'calc(100% + 8px)':'auto';lb.style.textAlign=fl?'right':'left';}}
        w.style.translate=x.toFixed(1)+'px '+y.toFixed(1)+'px';w.style.scale=((.8+.28*dd)*(.35+.65*e)).toFixed(3);w.style.zIndex=Math.sin(a)>0?'3':'1';w.style.opacity=((.7+.3*dd)*eo).toFixed(3);}}
    if(this.starEl){const k=(mo?1+.05*Math.sin(s*1.3):1)*(E?1+(E.s0-1)*(1-es):1);this.starEl.style.scale=k.toFixed(3);}
  }
  drawWarp(c,W,H,t,dt){
    const w=this.warp,el=t-w.start,k=Math.min(1,el/w.dur),red=this.reduced,ke=w.entry?clamp((el-w.dur)/w.entry,0,1):1,fo=1-ke;
    let v;if(k<.28){const q=k/.28;v=.015+q*q*q*.985;}else if(k<.66)v=1;else{const q=(k-.66)/.34;v=Math.pow(1-q,2.4)*.985+.015;}
    if(w.handoff&&k>=w.handoff){const L=w.land;this.wtail={start:t,dur:1100,V0:v*2.1,cx:(w.end||[W/2,H*.4])[0],cy:(w.end||[W/2,H*.4])[1],dir:w.dir||1};this.warp=null;if(L)L();return;}
    const V=v*2.1,ec=w.end||[W/2,H*.4],mq=clamp(k/.5,0,1),em=mq*mq*(3-2*mq);
    let cx=w.sx+(ec[0]-w.sx)*em,cy=w.sy+(ec[1]-w.sy)*em;const sh=v>.7&&!red?(v-.7)*2.4:0;cx+=(rnd()-.5)*sh;cy+=(rnd()-.5)*sh;
    c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#05040C';c.fillRect(0,0,W,H);
    if(w.snap&&k<.24){const q=k/.24,sc=1+q*q*.9;c.globalAlpha=Math.pow(1-q,1.5);c.save();c.translate(w.sx,w.sy);c.scale(sc,sc);c.translate(-w.sx,-w.sy);c.drawImage(w.snap,0,0,W,H);c.restore();c.globalAlpha=1;}
    const F=Math.max(W,H)*.14*(1-.2*v),roll=(t-w.start)/1000*.1*(w.dir||1),cr=Math.cos(roll),sr=Math.sin(roll),fin=clamp(k/.1,0,1);
    c.globalCompositeOperation='lighter';
    const gv=c.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.6);gv.addColorStop(0,'rgba('+w.tint+','+(.07+.1*v)*fin+')');gv.addColorStop(.35,'rgba(60,70,140,'+(.05*v)+')');gv.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gv;c.fillRect(0,0,W,H);
    for(const n of this.warpNeb){n.z-=V*dt*.9;if(n.z<=.05){n.z=1;const an=rnd()*6.283,rr=.5+rnd()*1.4;n.x=Math.cos(an)*rr;n.y=Math.sin(an)*rr;}
      const sz=clamp(n.s/n.z*F,4,Math.max(W,H)*1.5),rx=n.x*cr-n.y*sr,ry=n.x*sr+n.y*cr,x=cx+rx/n.z*F,y=cy+ry/n.z*F;c.globalAlpha=clamp((1-n.z)*.09,0,.09)*fin;c.drawImage(this.sprite(n.t?w.tint:n.c,true),x-sz/2,y-sz/2,sz,sz);}
    c.lineCap='round';const st=this.stride||1,blue=v>.55,T=.045;
    for(let i=0,PP=this.warpP;i<PP.length;i+=st){const p=PP[i];p.z-=V*dt;if(p.z<=.025){Object.assign(p,this.spawn(false));continue;}
      const z2=Math.min(1.25,p.z+V*T+.0015),rx=p.x*cr-p.y*sr,ry=p.x*sr+p.y*cr,x1=cx+rx/p.z*F,y1=cy+ry/p.z*F,x2=cx+rx/z2*F,y2=cy+ry/z2*F;
      if((x1<-40&&x2<-40)||(x1>W+40&&x2>W+40)||(y1<-40&&y2<-40)||(y1>H+40&&y2>H+40))continue;
      const nr=1-p.z,al=Math.min(1,p.b*(.12+nr*nr*1.3))*fin*fo,col=blue&&p.hot?'214,228,255':p.c,len=Math.abs(x1-x2)+Math.abs(y1-y2),lw=Math.max(.5,Math.min(2.8,.35+nr*nr*2.6));
      if(len<1.5){c.globalAlpha=al;c.fillStyle='rgb('+col+')';c.fillRect(x1-lw/2,y1-lw/2,lw,lw);}
      else{const g=c.createLinearGradient(x2,y2,x1,y1);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(1,'rgba('+col+','+al+')');c.globalAlpha=1;c.strokeStyle=g;c.lineWidth=lw;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();}}
    if(w.dest){const q=clamp((k-.6)/.4,0,1),e=q*q*(3-2*q),S=6+e*(w.ss||100)+(w.entry?Math.pow(ke,2.4)*Math.hypot(W,H)*2.8:0);w.lastS=S;c.globalAlpha=.25+.75*e;const h=S*2.4;c.drawImage(this.sprite(w.tint,true),cx-h/2,cy-h/2,h,h);
      const g=c.createRadialGradient(cx,cy,0,cx,cy,S/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.26,'rgba('+w.tint+',1)');g.addColorStop(.5,'rgba('+w.tint+',.35)');g.addColorStop(1,'rgba('+w.tint+',0)');c.globalAlpha=1;c.fillStyle=g;c.beginPath();c.arc(cx,cy,S/2,0,6.283);c.fill();}
    c.globalCompositeOperation='source-over';
    const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(5,4,12,0)');vg.addColorStop(1,'rgba(5,4,12,'+((.35+.35*v)*fo)+')');c.globalAlpha=1;c.fillStyle=vg;c.fillRect(0,0,W,H);
    if(w.name){const ha=clamp(k/.15,0,1)*clamp((1-k)/.12,0,1)*fo,pe=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,dist=(w.ly*(1-pe)).toFixed(1),y0=H-Math.max(40,H*.08);
      c.globalAlpha=ha;c.textAlign='center';c.fillStyle='#F2EEE6';c.font='500 13px "Martian Mono", monospace';c.fillText('JUMP · '+w.name.toUpperCase(),W/2,y0-22);
      c.fillStyle='#A9A3C2';c.font='400 12px "Martian Mono", monospace';c.fillText('DISTANCE '+dist+' LY',W/2,y0);
      const bw=Math.min(220,W*.4);c.fillStyle='rgba(242,238,230,.18)';c.fillRect(W/2-bw/2,y0+12,bw,1);c.fillStyle='rgb('+w.tint+')';c.fillRect(W/2-bw/2,y0+12,bw*pe,1);c.globalAlpha=1;c.textAlign='start';}
    if(k>=1&&ke>=1){const L=w.land;this.warp=null;if(L)L();else{this.emergeScale=w.lastS&&w.ss?w.lastS/w.ss:1;this.arriveNow();}}
  }

  fly(i){const now=performance.now();if(i>=0){this.tgt.T=[...SYS[i].p];this.tgt.dist=DSYS;this.tgt.pitch=.34;}else{const hp=SYS[this.state.here].p;this.tgt.T=this.state.here===HOME?[0,0,0]:hp.map(v=>v*.7);this.tgt.dist=DHOME;this.tgt.pitch=.52;}this.idle=now-1500;}
  select(i){this.fly(i);if(i>=0)this.sfx('blip');this.setState({sel:i,live:i>=0?SYS[i].name+', '+SYS[i].code+', distance '+SYS[i].min+' minutes. Enter to jump.':''});}
  clear=()=>{const i=this.state.hover>=0?this.state.hover:this.state.sel;this.fly(-1);this.cardHot=false;clearTimeout(this.hvT);this.noCard=i;this.setState({sel:-1,hover:-1,list:false});if(i>=0&&this.btns[i]){const b=this.btns[i];b.focus({preventScroll:true});const off=()=>{this.noCard=null;b.removeEventListener('blur',off);b.removeEventListener('pointerleave',off);};b.addEventListener('blur',off);b.addEventListener('pointerleave',off);}};
  recenter=()=>{this.fly(-1);this.setState({sel:-1,live:'Map recentered.'});};
  zoomIn=()=>{this.zoomBy(.7);this.idle=performance.now();};
  zoomOut=()=>{this.zoomBy(1/.7);this.idle=performance.now();};
  openList=()=>this.setState({list:true,sel:-1,live:'List view. M to return to the map.'});
  openMap=()=>this.setState({list:false,live:'Map view.'});
  cardIdx(){const st=this.state;return st.phase==='map'&&!st.list&&st.hover>=0?st.hover:st.sel;}
  jump=()=>{
    const i=this.cardIdx();if(i<0)return;this.cardHot=false;clearTimeout(this.hvT);if(i!==this.state.sel||this.state.hover>=0){this.setState({sel:i,hover:-1},()=>this.jump());return;}if(i===HOME){this.goHome();return;}const s=SYS[i],p=(this.scr&&this.scr[i])||[this.W/2,this.H/2];
    if(i===this.state.here){this.setState({list:false,phase:'jump'});this.arriveNow();return;}
    this.setState({list:false,phase:'jump',live:'Jumping to '+s.name+'.'});
    if(this.reduced){this.arriveNow();return;}
    this.warpP.forEach(q=>Object.assign(q,this.spawn(true)));
    this.coachAct(2);const dur=Math.min(2600,1600+250*s.min);this.sfx('jump',dur/1000);
    const vw=this.W,vh=this.H,mob=vw<760,leftW=mob?0:Math.min(460,vw*.36),ecx=mob?vw/2:leftW+(vw-leftW)/2+10,ecy=mob?Math.max(200,vh*.34):Math.max(170,vh*.36),Rm=mob?Math.min(vw/2-56,(vh*.2)/TILT):Math.min((vw-leftW)/2-70,(vh*.36)/TILT);
    let snap=null;try{snap=document.createElement('canvas');snap.width=this.cv.width;snap.height=this.cv.height;snap.getContext('2d').drawImage(this.cv,0,0);}catch(e){snap=null;}
    this.warp={start:performance.now(),dur,sx:p[0],sy:p[1],tint:s.tint,end:[vw/2,vh/2],ss:Math.max(70,Math.min(130,Rm*.32)),snap,dir:rnd()<.5?-1:1,dest:true,entry:800,name:s.name,ly:s.min*1.3+rnd()*.4};
  };
  land=()=>{const st=this.state,pl=(PL[SYS[st.sel].id]||[])[st.psel];if(!pl)return;
    if(pl.ghost){this.toContatti();return;}
    this.openPage(st.psel,true);};
  goHome=()=>{
    const st=this.state;
    const land=()=>{this.setState({phase:'map',here:HOME,sel:-1,list:false,live:'Home. Starting map.'},()=>{this.fly(-1);this.tgt.yaw=.7+Math.round((this.cam.yaw-.7)/6.2832)*6.2832;this.tgt.pitch=.52;this.tgt.dist=DHOME;this.tgt.T=[0,0,0];});};
    if(st.here===HOME||this.reduced){land();return;}
    const p=(this.scr&&this.scr[HOME])||[this.W/2,this.H/2];
    this.setState({sel:HOME,list:false,phase:'jump',live:'Returning Home.'});
    this.warpP.forEach(q=>Object.assign(q,this.spawn(true)));
    this.sfx('jump',1.5);let snapH=null;try{snapH=document.createElement('canvas');snapH.width=this.cv.width;snapH.height=this.cv.height;snapH.getContext('2d').drawImage(this.cv,0,0);}catch(e){}this.warp={snap:snapH,name:'Home',ly:1.2,end:[this.W/2,this.H*.4],start:performance.now(),dur:1500,sx:p[0],sy:p[1],tint:SYS[HOME].tint,land};
  };
  arriveNow(){const i=this.state.sel;this.orb=[];this.orb0=null;this.ospd=1;this.setState({psel:-1,phover:-1,landMsg:''});this.tgt.dist=220;this.cam.dist=this.reduced?220:45;if(!this.reduced){this.emerge={start:performance.now(),s0:Math.max(1,this.emergeScale||6)};}this.arriveAnimVal=this.emerge?'none':'skFade 420ms ease-out';this.emergeScale=0;this.setState(st=>({phase:'arrive',visited:{...st.visited,[i]:true},live:'Arrived at '+SYS[i].name+'.'}),()=>setTimeout(()=>this.arrive&&this.arrive.focus(),30));}
  back=()=>{const i=this.state.sel;this.setState({psel:-1,phover:-1,landMsg:'',phase:'map',here:i,sel:-1,live:'Map. You are here: '+SYS[i].name+'.'},()=>{this.fly(-1);setTimeout(()=>this.btns[i]&&this.btns[i].focus(),30);});};

  key(e){if(this.state.shot){if(e.key==='Escape'){e.preventDefault();this.setState({shot:null});const b=this.shotFrom;if(b)setTimeout(()=>b.focus({preventScroll:true}),30);}return;}if(this.state.lost){if(e.key==='Escape')this.lostHome();return;}
    const st=this.state;if(e.metaKey||e.ctrlKey||e.altKey)return;
    const tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT'||tag==='TEXTAREA')return;
    const k=e.key.toLowerCase();
    if(st.intro)return;
    if(st.phase==='page'){const L0=PL[SYS[st.sel].id]||[];if(k==='escape'||k==='m'){e.preventDefault();this.closePage();return;}if(k==='arrowleft'&&st.psel>0&&!L0[st.psel-1].ghost){this.goPlanet(st.psel-1);return;}if(k==='arrowright'){const nx=L0[st.psel+1];if(nx&&!nx.ghost)this.goPlanet(st.psel+1);return;}return;}
    if(st.phase==='arrive'){const pl=PL[SYS[st.sel].id]||[];
      if(k==='escape'){e.preventDefault();if(st.psel>=0)this.setState({psel:-1,landMsg:''});else this.back();return;}
      if(k==='m'){e.preventDefault();this.back();return;}
      if(['arrowright','arrowdown','arrowleft','arrowup'].includes(k)&&pl.length){e.preventDefault();const dir=(k==='arrowright'||k==='arrowdown')?1:-1;this.setState({psel:st.psel<0?(dir>0?0:pl.length-1):(st.psel+dir+pl.length)%pl.length,landMsg:''});return;}
      if(k==='enter'&&st.psel>=0&&(e.target===document.body||!e.target.closest||!e.target.closest('button'))){e.preventDefault();this.land();return;}
      return;}
    if(st.phase!=='map')return;
    if(k==='m'){e.preventDefault();if(st.list)this.openMap();else if(st.sel>=0)this.clear();return;}
    if(k==='l'){e.preventDefault();if(!st.list)this.openList();return;}
    if(k==='escape'&&this.cs>=0){this.coachDone();return;}
    if(k==='escape'){if(st.list)this.openMap();else if(st.sel>=0)this.clear();return;}
    if(st.list)return;
    if(k==='+'||k==='='){this.zoomIn();return;}
    if(k==='-'||k==='_'){this.zoomOut();return;}
    if(k==='q'){this.vel=-.05;this.idle=performance.now();return;}
    if(k==='e'){this.vel=.05;this.idle=performance.now();return;}
    if(k==='r'||k==='0'){this.recenter();return;}
    const n=SYS.length;
    if(['arrowright','arrowdown','arrowleft','arrowup'].includes(k)){
      e.preventDefault();const dir=(k==='arrowright'||k==='arrowdown')?1:-1;
      const i=st.sel<0?(dir>0?0:n-1):(st.sel+dir+n)%n;this.select(i);this.btns[i]&&this.btns[i].focus();return;
    }
    if(k==='enter'&&st.sel>=0&&document.activeElement===this.btns[st.sel]){e.preventDefault();this.jump();}
  }

  renderVals(){
    const {vw,vh,sel,hover,list,phase,visited,zoomed,here,intro,coach,audio,eggMsg}=this.state,mob=vw<760,red=this.reduced;
    const systems=SYS.map((s,i)=>{
      const isSel=sel===i,isHov=hover===i,vis=!!visited[i]&&i!==here,isHere=i===here;
      return{
        ...s,selected:isSel&&!s.home,isHere,listColor:isHere?s.hex:'#A9A3C2',
        tf:'translate(-22px,-22px)',dir:'row',align:'left',
        op:sel>=0&&!isSel?.5:1,
        ringBorder:isSel?'1.5px solid '+s.hex:'1px solid rgba('+s.tint+',.7)',ringOp:!s.home&&(isSel||isHov)?1:0,ringScale:isSel||isHov?1:.6,
        core:isSel||isHov?s.core+2:s.core,
        coreBg:s.home||(vis&&!isSel)?'transparent':s.hex,
        coreBorder:!s.home&&vis&&!isSel?'2px solid '+s.hex:'0 solid transparent',
        glow:s.home?'none':'0 0 '+(isHov||isSel?24:16)+'px '+(isHov||isSel?7:4)+'px rgba('+s.tint+','+(isHov||isSel?.6:.42)+')',
        hud:s.code+' · '+s.min+' min'+(vis?' · visited':''),
        aria:s.name+(isHere?', you are here':'')+', '+s.desc+' Distance '+s.min+' minutes'+(vis?', visited':''),
        listMeta:isHere?'you are here':s.meta+' · '+s.min+' min'+(vis?' · visited':''),
        ref:el=>{this.btns[i]=el;},wrapRef:el=>{this.wraps[i]=el;},haloRef:el=>{this.halos[i]=el;},
        holdRef:el=>{this.holds[i]=el;},noMenu:e=>e.preventDefault(),
        onDown:e=>{if(e.button!==0)return;this.holdFired=null;this.hold={i,start:performance.now()};},
        onUp:()=>{if(this.hold&&this.hold.i===i){this.hold=null;const g=this.holds[i];if(g){g.style.opacity='0';g.lastChild&&g.lastChild.setAttribute('stroke-dashoffset','169.6');}}},
        onClick:()=>{const hf=this.holdFired;this.holdFired=null;if(hf&&hf.i===i&&performance.now()-hf.t<400)return;if(i===HOME){this.goHome();return;}if(sel===i)this.jump();else this.select(i);},
        onEnter:e=>{if(e&&e.pointerType==='touch')return;if(this.noCard===i&&(!e||e.type==='focus'))return;clearTimeout(this.hvT);this.setState({hover:i});},onLeave:e=>{if(e&&e.pointerType==='touch')return;clearTimeout(this.hvT);this.hvT=setTimeout(()=>{if(!this.cardHot)this.setState(st=>st.hover===i?{hover:-1}:null);},260);},
        onJump:()=>{if(i===HOME){this.goHome();return;}this.select(i);setTimeout(()=>this.jump(),0);}
      };
    });
    const ci=this.cardIdx(),S=ci>=0?SYS[ci]:SYS[0],vis=ci>=0&&!!visited[ci];
    let cardLeft='auto',cardRight='clamp(16px,3vw,32px)',cardTop=Math.max(80,(vh-360)/2)+'px',cardBottom='auto',cardWidth='340px',cardRadius='6px',cardAnim=(red?'skFade':'skCardIn')+' 240ms cubic-bezier(.2,.7,.2,1)';
    if(mob){cardLeft='0px';cardRight='0px';cardTop='auto';cardBottom='0px';cardWidth='auto';cardRadius='16px 16px 0 0';cardAnim=(red?'skFade':'skSheetIn')+' 280ms cubic-bezier(.2,.7,.2,1)';}
    let arrive={};
    if((phase==='arrive'||phase==='page')&&sel>=0){
      const list0=PL[SYS[sel].id]||[],n=list0.length,leftW=mob?0:Math.min(460,vw*.36),cx=mob?vw/2:leftW+(vw-leftW)/2+10,cy=mob?Math.max(200,vh*.34):Math.max(170,vh*.36);
      const Rmax=mob?Math.min(vw/2-56,(vh*.2)/TILT):Math.min((vw-leftW)/2-70,(vh*.36)/TILT);
      const rx=list0.map((_,i)=>Math.max(60,Rmax*(n===1?1:(.4+.6*i/(n-1)))));
      this.lay={cx,cy,rx};
      const ell=(r)=>'M'+(cx-r).toFixed(1)+' '+cy.toFixed(1)+' A'+r.toFixed(1)+' '+(r*TILT).toFixed(1)+' 0 1 0 '+(cx+r).toFixed(1)+' '+cy.toFixed(1)+' A'+r.toFixed(1)+' '+(r*TILT).toFixed(1)+' 0 1 0 '+(cx-r).toFixed(1)+' '+cy.toFixed(1)+' ';
      let od='',gd='';list0.forEach((p,i)=>{if(p.ghost)gd+=ell(rx[i]);else od+=ell(rx[i]);});
      const ps=this.state.psel,ph=this.state.phover,S0=SYS[sel];
      const planets=list0.map((p,i)=>{const on=ps===i,hv=ph===i,idx=String(i+1).padStart(2,'0');return{...p,idx,selected:on,
        half:p.size/2,hit:Math.max(44,p.size+8),ringW:p.size*1.9,ringH:p.size*.62,ring:false,
        tint:p.ghost?'242,238,230':hexRgb(p.c[1]),core:p.ghost?12:Math.round(clamp(p.size*.3,9,14))+(hv?2:0),coreM:'-'+(Math.round(clamp(p.size*.3,9,14))+(hv?2:0))/2+'px 0 0 -'+(Math.round(clamp(p.size*.3,9,14))+(hv?2:0))/2+'px',
        coreBg:p.ghost?'transparent':p.c[1],coreBorder:p.ghost?'1.5px dashed rgba(242,238,230,.7)':'0 solid transparent',
        coreGlow:p.ghost?'none':'0 0 '+(hv?24:16)+'px '+(hv?7:4)+'px rgba('+hexRgb(p.c[1])+','+(hv?.6:.42)+')',
        haloSize:p.size+20,haloM:'-'+(p.size+20)/2+'px 0 0 -'+(p.size+20)/2+'px',haloRef:el=>{this.phalos[i]=el;},
        glowOp:on?0:1,solidOp:on?1:0,solidScale:on?1:.3,
        ringD:(on?p.size:Math.round(clamp(p.size*.3,9,14)))+14,ringM:'-'+((on?p.size:Math.round(clamp(p.size*.3,9,14)))+14)/2+'px 0 0 -'+((on?p.size:Math.round(clamp(p.size*.3,9,14)))+14)/2+'px',ringCol:on?S0.hex:'rgba('+(p.ghost?'242,238,230':hexRgb(p.c[1]))+',.7)',ringOp:on||hv?1:0,
        bg:p.ghost?'rgba(11,10,31,.4)':'radial-gradient(circle at 34% 30%,'+p.c[0]+' 0%,'+p.c[1]+' 40%,'+p.c[2]+' 100%)',
        border:p.ghost?'1.5px dashed rgba(242,238,230,.55)':'0 solid transparent',
        dot:p.ghost?'transparent':p.c[1],
        shadow:p.ghost?'none':'0 0 30px 6px rgba('+hexRgb(p.c[1])+',.4), inset -6px -8px 14px rgba(0,0,0,.35)',
        idxColor:on?S0.hex:'#A9A3C2',rowBg:on?'rgba(36,31,77,.85)':'transparent',
        aria:idx+' '+p.name+', '+p.kind,
        wrapRef:el=>{this.pwraps[i]=el;},
        onSel:()=>this.setState({psel:on?-1:i,landMsg:''}),
        onEnter:()=>this.setState({phover:i}),onLeave:()=>this.setState(st=>st.phover===i?{phover:-1}:null)};});
      const P0=ps>=0?planets[ps]:null,ss=Math.max(70,Math.min(130,Rmax*.32));
      arrive={planets,orbitsD:od,ghostD:gd,orbitSelD:ps>=0?ell(rx[ps]):'',mapCx:cx,mapCy:cy,mapCxPct:(cx/vw*100).toFixed(1)+'%',mapCyPct:(cy/vh*100).toFixed(1)+'%',
        starSize:ss,starMargin:'-'+ss/2+'px 0 0 -'+ss/2+'px',starRef:el=>{this.starEl=el;},
        colTop:mob?Math.round(cy+Rmax*TILT+90)+'px':'clamp(88px,13vh,130px)',colW:mob?'calc(100% - 40px)':(leftW-56)+'px',
        planetOnMob:!!P0,planetOnDesk:false,pl:P0?{...P0,cta:P0.ghost?'Jump to Contact':'Land on '+P0.name}:{},
        panelPos:mob?'fixed':'absolute',panelLeft:mob?'16px':'auto',panelW:mob?'auto':'340px',
        landMsg:this.state.landMsg,land:this.land,closePlanet:()=>this.setState({psel:-1,landMsg:''})};
    }
    const ce=React.createElement,dot=(anim,extra)=>ce('span',{style:Object.assign({position:'absolute',left:'50%',top:'50%',width:10,height:10,margin:-5,borderRadius:'50%',background:'#7FE6F2',boxShadow:'0 0 12px 3px rgba(127,230,242,.5)',animation:anim},extra||{})});
    const CS=[{t:'Drag to rotate',d:mob?'Drag with one finger to spin the galaxy.':'Hold the mouse button and drag to spin the galaxy.'},{t:'Zoom in',d:mob?'Pinch with two fingers to zoom.':'Use the scroll wheel or the + and − keys to zoom.'},{t:'Enter a system',d:mob?'Tap a system to preview it. Hold to jump in.':'Hover a system to preview it. Hold to jump in.'}];
    let coachIcon=null;
    if(coach===0)coachIcon=ce('span',{key:'c0',style:{position:'relative',width:56,height:56}},dot('skDrag 1.8s ease-in-out infinite'));
    else if(coach===1)coachIcon=ce('span',{key:'c1',style:{position:'relative',width:56,height:56}},dot('skPinchA 1.8s ease-in-out infinite'),dot('skPinchB 1.8s ease-in-out infinite'));
    else if(coach===2)coachIcon=ce('svg',{key:'c2',width:44,height:44,viewBox:'0 0 44 44'},ce('circle',{cx:22,cy:22,r:18,fill:'none',stroke:'rgba(242,238,230,.2)',strokeWidth:2}),ce('circle',{cx:22,cy:22,r:18,fill:'none',stroke:'#7FE6F2',strokeWidth:2.5,strokeLinecap:'round',strokeDasharray:113,transform:'rotate(-90 22 22)',style:{animation:'skHoldRing 1.8s ease-in-out infinite'}}),ce('circle',{cx:22,cy:22,r:4,fill:'#7FE6F2'}));
    let page={},pagePrev=null,pageNext=null;
    if(phase==='page'&&sel>=0){const sy=SYS[sel],L0=PL[sy.id]||[],j=Math.max(0,this.state.psel),p=L0[j]||L0[0],prev=j>0?L0[j-1]:null,nx=L0[j+1],hasNext=!!nx&&!nx.ghost,isC=sy.id==='contact',ix=n=>String(n).padStart(2,'0'),c=p.c||PC.ice;
      const tp=p.type||'about',L1=L0.filter(q=>!q.ghost);page={isCase:tp==='case',isService:tp==='service',isStep:tp==='step',isCrew:tp==='crew',isAbout:tp==='about',isContact:tp==='contact',isForm:tp==='form',showIntro:tp!=='form',
        rows:p.rows||[],goCase:()=>this.openDirect(0,0),
        rail:tp==='step'?L1.map((q,qi)=>({idx:ix(qi+1),name:q.name,kind:q.kind,cur:qi===j?'step':'false',dot:qi===j?sy.hex:(qi<j?'rgba('+sy.tint+',.45)':'transparent'),dotBorder:qi<=j?sy.hex:'rgba(242,238,230,.5)',border:qi===j?sy.hex:'rgba(242,238,230,.18)',bg:qi===j?'rgba(36,31,77,.85)':'rgba(21,19,46,.5)',go:()=>this.goPlanet(qi)})):[],
        idx:ix(j+1),total:ix(L0.filter(q=>!q.ghost).length),name:p.name,kind:p.kind,desc:p.desc,sysName:sy.name,sysCode:sy.code,hex:sy.hex,
        horizon:'radial-gradient(circle at 50% 0%,'+c[1]+' 0%,'+c[2]+' 7%,#07060F 38%)',glow:'0 -10px 140px 18px rgba('+sy.tint+',.32), inset 0 3px 0 '+c[0]+', inset 0 26px 70px rgba(255,255,255,.16)',ground:c[2],
        hasPrev:!!prev&&!prev.ghost,prevIdx:prev?ix(j):'',prevName:prev?prev.name:'',nextIdx:hasNext?ix(j+2):(isC?'Galaxy':'SYS-05'),nextName:hasNext?nx.name:(isC?'Galaxy map':'Contact')};
      Object.assign(page,{hasPhoto:tp==='about'&&(p.name==='Me'||p.name==='Experience'||p.name==='Approach'),photoHex:c[1],phMe:slug(p.name)==='me',phExp:slug(p.name)==='experience',phAppr:slug(p.name)==='approach',photoSrc:{Experience:'assets/about/cristian-laptop.png',Approach:'assets/about/cristian-idea.png'}[p.name]||'assets/about/cristian.png',photoAlt:{Experience:'Cristian’s memoji: brown hair, round glasses, peeking over a laptop',Approach:'Cristian’s memoji with a raised finger and a light bulb above his head'}[p.name]||'Cristian’s memoji waving: brown hair, round glasses, black sweater',showIntro:!!p.lead,lead:p.lead||'',body:p.body||'',hasBody:!!p.body,items:p.items||[],happens:p.happens||'',gets:p.gets||[],blocks:p.blocks||[]});
      pagePrev=()=>this.goPlanet(j-1);pageNext=()=>{if(hasNext)this.goPlanet(j+1);else if(isC)this.setState({phase:'arrive'},()=>this.back());else this.toContatti();};}
    const coarse=typeof matchMedia!=='undefined'&&matchMedia('(pointer: coarse)').matches;
    const extra={shotOn:!!this.state.shot,shotSrc:this.state.shot?this.state.shot.src:'',shotAlt:this.state.shot?this.state.shot.alt:'',openShot:e=>{const d=e.currentTarget.dataset;this.shotFrom=e.currentTarget;this.setState({shot:{src:d.src,alt:d.alt}});},closeShot:e=>{if(e)e.stopPropagation();this.setState({shot:null});const b=this.shotFrom;if(b)setTimeout(()=>b.focus({preventScroll:true}),30);},shotImgRef:el=>{if(el&&this.state.shot&&el.getAttribute('src')!==this.state.shot.src)el.setAttribute('src',this.state.shot.src);},shotCloseRef:el=>{if(el&&el!==this.shotBtn){this.shotBtn=el;setTimeout(()=>el.focus(),40);}if(!el)this.shotBtn=null;},lostBtnRef:el=>{if(el&&el!==this.lostBtn){this.lostBtn=el;setTimeout(()=>{this.lostTrap(true);el.focus();},60);}if(!el&&this.lostBtn){this.lostBtn=null;this.lostTrap(false);}},kbdDisp:coarse?'none':'inline',lostOn:!!this.state.lost,lostPath:this.state.lost||'',lostHome:this.lostHome,lostJumps:SYS.filter(s=>s.id!=='home').map(s=>({name:s.name,hex:s.hex,code:s.code,go:()=>{const i=SYS.indexOf(s);this.lostTrap(false);this.setState({lost:null});try{history.replaceState(null,'','#/'+s.id);}catch(e){}this.openDirect(i,-1);}})),showWordmark:!mob,showRecenterLabel:!mob,crumbDisplay:mob?'none':'flex',
      navRef:el=>{this.navEl=el;},bhRef:el=>{this.bhBtn=el;},bhClick:this.bhClick,eggMsg,
      zoomRef:el=>{this.zoomEl=el;},pageRef:el=>{this.pageEl=el;},pageTitleRef:el=>{this.pageTitle=el;},
      audioOn:audio,audioAria:audio?'Audio on, turn off':'Audio off, turn on',audioWave:audio?'M13 7.5a3.5 3.5 0 0 1 0 5M15.2 5.2a6.6 6.6 0 0 1 0 9.6':'M13 8l4 4M17 8l-4 4',toggleAudio:this.toggleAudio,
      introOn:!!intro,introReady:intro==='ready',introBg:intro==='warp'?'rgba(7,6,15,0)':'#07060F',introContentOp:intro==='warp'?0:1,introContentTf:intro==='warp'?'scale(1.12)':'none',showSkip:intro==='boot'||intro==='ready',introHint:'HOLD TO LAUNCH',
      introRingRef:el=>{this.introRing=el;},introDown:this.introDown,introUp:this.introUp,introCancel:this.introCancel,introClick:this.introClick,skipIntro:this.skipIntro,noMenu:e=>e.preventDefault(),
      coachOn:coach>=0&&phase==='map'&&!intro&&!list&&this.cardIdx()<0,coachCount:(coach+1)+' / 3',coachTitle:coach>=0?CS[coach].t:'',coachText:coach>=0?CS[coach].d:'',coachIcon,coachNextLabel:coach<2?'Next':'Start',
      coachNext:()=>coach<2?this.coachGo(coach+1):this.coachDone(),coachSkip:this.coachDone,coachTop:mob?'136px':'auto',coachBottom:mob?'auto':'132px',coachLeft:mob?'50%':'auto',coachRight:mob?'auto':'clamp(16px,3vw,32px)',coachTf:mob?'translateX(-50%)':'none',
      fv:this.state.fv,fIn:this.fIn,fBlur:this.fBlur,fSubmit:this.fSubmit,fSending:this.state.fstate==='sending',fSent:this.state.fstate==='sent',fBtn:this.state.fstate==='sending'?'Sending…':'Send message',fBtnOp:this.state.fstate==='sending'?.7:1,
      fe:Object.fromEntries(['nome','email','msg'].map(n=>{const m=this.state.ferr[n];const help={nome:'',email:'I’ll reply to this address.',msg:'A few lines is enough: goal, timing, rough budget.'}[n];return[n,{inv:!!m,msg:m||help,color:m?'#FF8FB1':'#A9A3C2',border:m?'1.5px solid #FF8FB1':'1px solid rgba(242,238,230,.35)'}];})),
      logoDemo:(()=>{const lp=this.state.logoPlay,hx=SYS[1].hex;return ce('svg',{key:'lg'+lp,viewBox:'0 0 1000 1000',role:'img','aria-label':'Skyward logo',style:{width:'100%',height:'100%'}},ce('g',{transform:'matrix(1.577362,0,0,1.577362,-316.787463,-268.230134)',fill:'#F2EEE6',fillOpacity:0,stroke:hx,strokeWidth:5,strokeLinejoin:'round'},LOGO.map((d,i)=>ce('path',{key:i,d,pathLength:1,style:{strokeDasharray:1,strokeDashoffset:1,animation:'skDraw 1800ms '+(i*180)+'ms cubic-bezier(.65,0,.25,1) forwards, skFillIn 600ms '+(1700+i*180)+'ms ease-out forwards'}}))));})(),
      logoReplay:()=>this.setState(st=>({logoPlay:st.logoPlay+1})),
      tySw:SYS.map((s,i)=>({name:s.name,hex:s.hex,on:i===this.state.tyI,ring:i===this.state.tyI?'2px solid '+s.hex:'1px solid rgba(242,238,230,.25)',glow:'rgba('+s.tint+',.45)',pick:()=>this.setState({tyI:i})})),
      tyHex:SYS[this.state.tyI].hex,tyName:SYS[this.state.tyI].name.toUpperCase(),tyCode:SYS[this.state.tyI].code,tyHexLabel:SYS[this.state.tyI].hex,tyW:this.state.tyW,tyWIn:e=>this.setState({tyW:+e.target.value}),
      tyCr:(()=>{const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};const a=L(SYS[this.state.tyI].hex),b=L('#0B0A1F');return ((a+.05)/(b+.05)).toFixed(1)+':1';})(),
      miniGalRef:el=>this.attachMini('gal',el),switchLang:e=>{e.preventDefault();if(this.langBusy)return;this.langBusy=true;const a=e.currentTarget.getAttribute('href'),to=/^it\//.test(a)?'it':'en';try{localStorage.setItem('skyward.lang',to);sessionStorage.setItem('skyward.langSwitch','1');}catch(_){}this.setState({live:to==='it'?'Switching to Italian.':'Passaggio all’inglese.'});const v=this.veil(to==='it'?'ITALIANO':'ENGLISH');const d=this.reduced?1:280;requestAnimationFrame(()=>{v.style.opacity='1';const t=v.firstChild;if(t)t.style.transform='none';});setTimeout(()=>{cancelAnimationFrame(this.raf);this.raf=0;requestAnimationFrame(()=>{location.href=a+(location.hash||'');});},d+60);},aboutGalRef:this.aboutGalRef,miniJumpRef:el=>this.attachMini('jump',el),
      mChips:SYS.map((s,i)=>({name:s.name,hex:s.hex,on:i===this.state.miniSel,ring:i===this.state.miniSel?'1.5px solid '+s.hex:'1px solid rgba(242,238,230,.25)',bg:i===this.state.miniSel?'rgba(36,31,77,.85)':'transparent',pick:()=>this.setState({miniSel:i})})),
      mSelHex:SYS[this.state.miniSel].hex,jumpDemo:this.jumpDemo,jumpBusy:this.state.jumpBusy,jumpOp:this.state.jumpBusy?.6:1,jumpLabel:this.state.jumpBusy?'Jumping…':'Start the jump to '+SYS[this.state.miniSel].name,
      showPage:phase==='page'&&sel>=0,page,closePage:this.closePage,pagePrev,pageNext};
    return{
      ...arrive,...extra,arriveAnim:this.arriveAnimVal||'skFade 420ms ease-out',orbSvgRef:el=>{this.orbSvg=el;},
      vw,vh,skyRef:el=>{this.sky=el;},arriveRef:el=>{this.arrive=el;},
      pIdleRef:el=>{this.pIdle=el;},heroRef:el=>{this.hero=el;},hintRef:el=>{this.hint=el;},pActRef:el=>{this.pAct=el;},origRef:el=>{this.orig=el;},
      live:this.state.live,showMap:phase==='map'&&!intro,showArrive:phase==='arrive',
      systems,routesOpacity:list?0:1,
      showHint:vw>=1100&&sel<0&&!list,
      ctrlTop:mob?'76px':'auto',ctrlBottom:mob?'auto':'max(28px,env(safe-area-inset-bottom))',
      zoomIn:this.zoomIn,zoomOut:this.zoomOut,recenter:this.recenter,
      listOn:list,listLabel:mob?(list?'Map':'List'):(list?'Map view':'List view'),listKey:mob?'':(list?'M':'L'),
      toggleList:list?this.openMap:this.openList,
      goContatti:()=>{this.setState({list:false});this.select(4);setTimeout(()=>this.btns[4]&&this.btns[4].focus(),30);},
      clearSel:this.clear,goHome:this.goHome,jump:this.jump,backToMap:this.back,
      cardOn:ci>=0&&!list&&phase==='map',cardEnter:()=>{this.cardHot=true;clearTimeout(this.hvT);},cardLeave:()=>{this.cardHot=false;clearTimeout(this.hvT);this.hvT=setTimeout(()=>{if(!this.cardHot)this.setState({hover:-1});},260);},cardLeft,cardRight,cardTop,cardBottom,cardWidth,cardRadius,cardAnim,
      heroEyebrow:here===HOME?'Skyward · Design & development':'You are here · '+SYS[here].name,
      sel:{...S,cta:ci===HOME?'Back to Home':ci===here?'Enter '+S.name:'Jump to '+S.name,route:ci===here?'Current position':'Route · '+SYS[here].name+' → '+S.name,visitLabel:ci===here?'you are here':vis?'visited':'not visited',visitColor:vis||ci===here?S.hex:'#A9A3C2',visitBorder:vis?'rgba('+S.tint+',.55)':'rgba(242,238,230,.22)'}
    };
  }
}

return Component;
}
