import {useEffect,useRef,useState} from 'react';

// The marketing storyline: one scroll story about how John helps a small
// business get found, told through his real work. On wide screens the stage
// pins while you scroll and each scene slams in like a new comic panel; on
// phones and under reduced motion the scenes simply stack.
// Every fact here already appears elsewhere on the site (experience.js,
// projects.js) or in his LinkedIn About. Nothing invented.

export const SCENES=[
 {id:'origin',step:'Where it started',place:'Mesa, Arizona · 2018',title:'It started at the front desk.',tone:'paper',sfx:'DING!',
  text:['I was 10, selling fidget spinners at my family’s nail salon.','Eight years later I still help run it, and I learned the hard part early: a good business still has to get found.'],
  visual:{img:'/assets/hall/john-sm.jpg',alt:'John Vu',frame:'polaroid',caption:'John Vu',second:'/assets/sunset.webp',secondAlt:'The Sunset Nails website'}},
 {id:'research',step:'Research',place:'Hinksey Labs · 2026',title:'First, find out why customers come back.',tone:'sky',sfx:'HMM…',
  text:['I studied how the salon could bring in new customers and keep them.','An in-store survey, competitor benchmarking and Yelp reviews turned into a research paper.'],
  chips:['In-store survey','Competitor benchmarking','Yelp review analysis'],
  visual:{img:'/assets/hall/hinksey-certificate-sm.jpg',alt:'Hinksey Labs certificate',frame:'taped'},link:{label:'Read the story',href:'#/a/hinksey-labs'}},
 {id:'brand',step:'Brand',place:'Sunset Nails · JTAVU Apparel',title:'Then, make it look like it means business.',tone:'sun',sfx:'POW!',
  text:['I led the salon’s new visual identity and website.','I also design graphics and team identities that people actually wear.'],
  chips:['Visual identity','Website','Apparel graphics'],
  visual:{img:'/assets/apparel-front.jpg',alt:'A JTAVU Apparel hoodie design',frame:'taped',second:'/assets/hall/sunset-nails-top5-sm.jpg',secondAlt:'BusinessRate Top 5 award for Sunset Nails, 2026'},link:{label:'Visit sunsetnails.shop',href:'https://sunsetnails.shop/'}},
 {id:'content',step:'Content',place:'Instagram · Cal Baseball · SCRL',title:'Get it in front of people.',tone:'red',sfx:'30K!',
  text:['I run @gcamensvolleyball: game-day graphics, recaps and spotlights, with 30K peak profile views.','I make brand content for SCRL, and content with the Cal Baseball media team and AAA’s media committee. I shoot for Redline too.'],
  stat:{big:'30K',small:'peak profile views on @gcamensvolleyball'},
  chips:['Social graphics','Brand content','Sports media','Photography']},
 {id:'outreach',step:'Outreach',place:'Paletté · Golden Summit',title:'Bring the right people in.',tone:'sky',sfx:'HELLO!',
  text:['At Paletté I run outreach and partnerships to grow its network of creators and brand partners.','For Golden Summit we brought in 15+ professionals from places like Honeywell, Vanguard and ASU for 200+ students.'],
  stat:{big:'15+',small:'professionals recruited for 200+ students'},
  visual:{img:'/assets/golden-summit-poster.jpg',alt:'Golden Summit Career Day',frame:'taped'},link:{label:'Watch the recap',href:'#/a/golden-summit-career-day'}},
 {id:'scale',step:'Scale it',place:'Bayu Consulting · now',title:'Now I do it for other small businesses.',tone:'sun',sfx:'KA-CHING!',
  text:['I co-founded Bayu Consulting, a student club that helps local businesses get found online, free for the business.','I lead strategy and client relations, and I built the club’s website and brand.'],
  visual:{img:'/assets/bayu-preview.jpg',alt:'The Bayu Consulting website',frame:'browser',label:'bayuconsulting.lovable.app'},link:{label:'Visit Bayu Consulting',href:'https://bayuconsulting.lovable.app/'}},
 {id:'next',step:'Your turn',place:'Berkeley · today',title:'Got a business that deserves to be found?',tone:'red',sfx:'YOUR TURN!',
  text:['Research, brand, content and outreach. I can help with one piece or the whole story.'],
  cta:true},
];

// Counts a stat like 30K or 15+ up from zero when its scene arrives.
function CountUp({value,run}){
 const m=/^(\d+)(.*)$/.exec(value),[n,setN]=useState(m?0:value);
 useEffect(()=>{if(!m||!run)return;const end=+m[1],t0=performance.now(),dur=900;let f=0;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setN(end);return;}
  const tick=t=>{const k=Math.min(1,(t-t0)/dur);setN(Math.round(end*(1-Math.pow(1-k,3))));if(k<1)f=requestAnimationFrame(tick);};
  f=requestAnimationFrame(tick);return()=>cancelAnimationFrame(f);},[run,value]);
 return m?<>{n}{m[2]}</>:value;
}

const external=href=>href.startsWith('http')?{target:'_blank',rel:'noreferrer'}:{};

function Visual({scene,run}){
 const v=scene.visual;
 if(scene.stat)return <div className="story-stat"><b aria-label={scene.stat.big}><CountUp value={scene.stat.big} run={run}/></b><span>{scene.stat.small}</span>{v&&<img src={v.img} alt={v.alt} loading="eager" decoding="async"/>}</div>;
 if(scene.cta)return <div className="story-cta-panel"><span className="story-cta-burst" aria-hidden="true">HIRE ME!</span><div className="hero-cta"><a className="hero-primary" href="mailto:jtavu9@gmail.com">Email me</a><a href="#work">See the work ↓</a></div></div>;
 if(!v)return null;
 return <figure className={`story-visual frame-${v.frame}`}>
  {v.frame==='browser'&&<span className="story-browser" aria-hidden="true"><i/><i/><i/><em>{v.label}</em></span>}
  <img src={v.img} alt={v.alt} loading="eager" decoding="async"/>
  {v.caption&&<figcaption>{v.caption}</figcaption>}
  {v.second&&<img className="story-second" src={v.second} alt={v.secondAlt} loading="eager" decoding="async"/>}
 </figure>;
}

function Scene({scene,i,state,pinned}){
 const ref=useRef(null),[seen,setSeen]=useState(false);
 // Stacked scenes count up the first time they scroll into view.
 useEffect(()=>{if(pinned||seen||!ref.current)return;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setSeen(true);io.disconnect();}},{threshold:.35});io.observe(ref.current);return()=>io.disconnect();},[pinned,seen]);
 const run=pinned?state==='is-on':seen;
 return <article ref={ref} className={`story-scene tone-${scene.tone} ${state} ${!pinned&&seen?'is-seen':''}`} id={`story-${scene.id}`} aria-labelledby={`story-${scene.id}-title`} style={{'--i':i}}>
  <div className="story-words">
   <p className="story-step"><span>{scene.step}</span><em>{scene.place}</em></p>
   <h3 id={`story-${scene.id}-title`}>{scene.title}</h3>
   {scene.text.map((t,k)=><p key={k} className="story-text">{t}</p>)}
   {scene.chips&&<ul className="story-chips">{scene.chips.map(c=><li key={c}>{c}</li>)}</ul>}
   {scene.link&&<a className="text-action story-link" href={scene.link.href} {...external(scene.link.href)}>{scene.link.label} →</a>}
  </div>
  <div className="story-art"><span className="pow story-sfx" aria-hidden="true">{scene.sfx}</span><Visual scene={scene} run={run}/></div>
 </article>;
}

export function StoryLine(){
 const root=useRef(null),[active,setActive]=useState(0),[pinned,setPinned]=useState(false);
 useEffect(()=>{
  const wide=matchMedia('(min-width:901px) and (min-height:600px)'),calm=matchMedia('(prefers-reduced-motion: reduce)');
  const decide=()=>setPinned(wide.matches&&!calm.matches);decide();
  wide.addEventListener('change',decide);calm.addEventListener('change',decide);
  return()=>{wide.removeEventListener('change',decide);calm.removeEventListener('change',decide);};
 },[]);
 useEffect(()=>{
  if(!pinned)return;let frame=0;
  const read=()=>{frame=0;const el=root.current;if(!el)return;const r=el.getBoundingClientRect(),span=el.offsetHeight-innerHeight;
   const p=Math.min(1,Math.max(0,-r.top/Math.max(1,span)));el.style.setProperty('--story-p',p.toFixed(4));
   setActive(Math.min(SCENES.length-1,Math.floor(p*SCENES.length*.999)));};
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(read);};
  read();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  return()=>{removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);cancelAnimationFrame(frame);};
 },[pinned]);
 // Jump to a scene from the rail: scroll to its slice of the pinned section.
 const go=i=>{const el=root.current;if(!el)return;
  if(!pinned){document.getElementById(`story-${SCENES[i].id}`)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  const span=el.offsetHeight-innerHeight,top=el.getBoundingClientRect().top+scrollY;
  window.scrollTo({top:top+span*((i+.5)/SCENES.length),behavior:'smooth'});};
 return <section id="story" ref={root} className={`story-section ${pinned?'is-pinned':'is-stacked'}`} style={{'--scenes':SCENES.length}} aria-labelledby="story-title">
  <div className="story-stage">
   <header className="story-head">
    <p className="section-kicker">THE STORY</p>
    <h2 id="story-title">How I help a small business get found.</h2>
   </header>
   <nav className="story-rail" aria-label="Story steps"><ol>{SCENES.map((s,i)=><li key={s.id}><button type="button" className={i===active&&pinned?'is-on':i<active&&pinned?'is-past':''} aria-current={i===active&&pinned?'step':undefined} onClick={()=>go(i)}>{s.step}</button></li>)}</ol>
     {pinned&&<span className="story-progress" aria-hidden="true"><i/></span>}</nav>
   <div className="story-scenes">{SCENES.map((s,i)=><Scene key={s.id} scene={s} i={i} pinned={pinned} state={!pinned?'':i===active?'is-on':i<active?'is-past':'is-next'}/>)}</div>
  </div>
 </section>;
}
