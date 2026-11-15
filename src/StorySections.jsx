import {useEffect,useState} from 'react';
import {experience} from './experience';
import {activityHref,slugOf} from './activities.js';

// "A message from John": his own LinkedIn About story as a comic speech
// bubble with a handwritten sign-off (idea from "Message from Lando").
export function MessageFromJohn(){
 return <div className="john-message">
  <figure className="john-photo"><img src="/assets/hall/john-sm.jpg" alt="John Vu" width="640" height="640" loading="lazy"/><figcaption>John Vu · UC Berkeley ’30</figcaption></figure>
  <blockquote className="john-bubble">
   <p className="john-kicker">A message from John</p>
   <p>I’m a Vietnamese-American kid from Arizona. Since 2018, when I was 10, I’ve helped run my family’s nail salon. I started out selling fidget spinners in the store.</p>
   <p>Watching my parents build something on their own is why I care about small businesses. Now I’m at Berkeley studying Economics and Data Science, and I’m building Bayu Consulting so small shops get the strategy and tools big companies already have.</p>
   <p>Want to talk business, or fidget spinners? Email me. Tell me who you are and what you’re looking for.</p>
   <footer><span className="john-sign" aria-label="Signed, John Vu">John Vu</span></footer>
  </blockquote>
 </div>;
}

// Experience behind two big doors: On the clock (work, research, leadership)
// and Off the clock (volleyball, singing, photos). Idea from the On track /
// Off track split on landonorris.com.
export const DOORS=[
 {id:'on',label:'On the clock',sub:'Work, research and leadership',groups:g=>g.title!=='Off the clock'},
 {id:'off',label:'Off the clock',sub:'Volleyball, singing and photos',groups:g=>g.title==='Off the clock'},
];

export function ExperienceDoors({phone}){
 const [door,setDoor]=useState('on');
 useEffect(()=>{const pick=e=>{if(DOORS.some(d=>d.id===e.detail?.door))setDoor(e.detail.door);};window.addEventListener('jtavu:experience-door',pick);return()=>window.removeEventListener('jtavu:experience-door',pick);},[]);
 const groups=experience.filter(DOORS.find(d=>d.id===door).groups);
 const count=d=>experience.filter(d.groups).reduce((n,g)=>n+g.items.length,0);
 const keys=e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const next=door==='on'?'off':'on';setDoor(next);document.getElementById(`door-${next}`)?.focus();};
 return <>
  <div className="exp-doors" role="tablist" aria-label="Experience" onKeyDown={keys}>
   {DOORS.map(d=><button key={d.id} id={`door-${d.id}`} type="button" role="tab" aria-selected={door===d.id} aria-controls="exp-door-panel" tabIndex={door===d.id?0:-1} className={`exp-door door-${d.id}`} onClick={()=>setDoor(d.id)}>
    <span className="door-label">{d.label}</span><span className="door-sub">{d.sub}</span><span className="door-count">{count(d)}</span>
   </button>)}
  </div>
  <div id="exp-door-panel" role="tabpanel" aria-labelledby={`door-${door}`} key={door} className={`exp-groups door-panel-${door}`}>
   {groups.map((g,gi)=><details key={g.title} className="exp-group" style={{'--i':gi}} open={!phone||gi===0}><summary><h3>{g.title}</h3>{g.burst&&<span className="pow pow-sm" aria-hidden="true">{g.burst}</span>}<span className="exp-count">{g.items.length}</span></summary><ul>{g.items.map(it=><li key={it.name+it.role} className={`exp-item ${it.badge?'has-badge':''}`}>{it.badge&&<span className="exp-badge" aria-hidden="true">{it.badge}</span>}<div className="exp-top"><b><a href={activityHref(slugOf(it.name))}>{it.name}</a></b>{it.when&&<span>{it.when}</span>}</div><em>{it.role}</em><p>{it.line}</p>{it.chips&&<ul className="exp-chips">{it.chips.map(c=><li key={c}>{c}</li>)}</ul>}<p className="exp-links"><a className="exp-story" href={activityHref(slugOf(it.name))}>Read the story<span aria-hidden="true"> →</span></a>{(it.links||[]).map(l=><a key={l.href+l.label} href={l.href} {...(l.href.startsWith('http')?{target:'_blank',rel:'noreferrer'}:{})}>{l.label}{l.href.startsWith('http')?<span aria-hidden="true"> ↗</span>:<span aria-hidden="true"> →</span>}</a>)}</p></li>)}</ul></details>)}
  </div>
 </>;
}
