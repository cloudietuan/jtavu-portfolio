import {useEffect,useRef} from 'react';
import {activityBySlug,activityList,activityHref,panelsOf,neighbours} from './activities.js';
import {experience} from './experience.js';
import {projects} from './projects.js';

// A page per activity, styled like a comic issue. Only real facts from
// experience.js and projects.js; nothing links back to jtavu.com.

const TONES=['sky','red','sun','paper','sky'];
const toneOf=group=>TONES[Math.max(0,experience.findIndex(g=>g.title===group))%TONES.length];
const external=href=>href.startsWith('http')?{target:'_blank',rel:'noreferrer'}:{};

function useArrival(key){
 const heading=useRef(null);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});},[key]);
 return heading;
}

export function ActivityPage({slug}){
 const a=activityBySlug(slug);
 const heading=useArrival(slug);
 useEffect(()=>{if(a)document.title=`${a.name} · John Vu`;return()=>{document.title='John Vu'}},[a]);
 if(!a)return <MissingPage/>;
 const tone=toneOf(a.group),p=a.project&&projects[a.project],{prev,next}=neighbours(slug);
 const siblings=activityList.filter(x=>x.group===a.group&&x.slug!==slug);
 return <main className={`activity-page tone-${tone}`} id="activity">
  <nav className="act-crumbs" aria-label="Breadcrumb"><a href="#experience">← All activities</a><span aria-hidden="true">/</span><span>{a.group}</span></nav>
  <header className="act-cover">
   <p className="act-kicker"><span className="act-tag">{a.group}</span>{a.burst&&<span className="pow pow-sm" aria-hidden="true">{a.burst}</span>}</p>
   <h1 ref={heading} tabIndex={-1}>{a.name}</h1>
   <p className="act-caption"><b>{a.role}</b>{a.when&&<span>{a.when}</span>}</p>
   {a.badge&&<span className="act-badge" aria-hidden="true">{a.badge}</span>}
  </header>
  <ol className="act-strip" aria-label="The story">
   {panelsOf(a).map((panel,i)=><li key={i} className="act-panel" style={{'--i':i}}>{panel.caption&&<span className="act-panel-caption">{panel.caption}</span>}<p>{panel.text}</p></li>)}
  </ol>
  {a.chips&&<section className="act-stats" aria-label="Highlights"><h2>The scoreboard</h2><ul>{a.chips.map(c=><li key={c}>{c}</li>)}</ul></section>}
  {p&&<section className="act-project" aria-labelledby="act-project-title">
   {p.image&&<img src={p.image} alt={`${p.title} preview`} loading="lazy"/>}
   <div><p className="act-tag">Related work</p><h2 id="act-project-title">{p.title}</h2><p>{p.detail||p.description}</p><a className="text-action" href={`#project-${p.id}`}>See {p.title} in my work →</a></div>
  </section>}
  {a.outside.length>0&&<section className="act-links" aria-label="Links"><h2>Go see it</h2><p>{a.outside.map(l=><a key={l.href} className="act-link" href={l.href} {...external(l.href)}>{l.label}{l.href.startsWith('http')&&<span aria-hidden="true"> ↗</span>}</a>)}</p></section>}
  {siblings.length>0&&<section className="act-more" aria-labelledby="act-more-title"><h2 id="act-more-title">More in {a.group}</h2><ul>{siblings.map(s=><li key={s.slug}><a href={activityHref(s.slug)}><b>{s.name}</b><span>{s.role}</span></a></li>)}</ul></section>}
  <nav className="act-pager" aria-label="Other activities">
   <a href={activityHref(prev.slug)} rel="prev"><span>← Previous</span><b>{prev.name}</b></a>
   <a href={activityHref(next.slug)} rel="next"><span>Next →</span><b>{next.name}</b></a>
  </nav>
 </main>;
}

function MissingPage(){
 const heading=useArrival('missing');
 return <main className="activity-page tone-paper" id="activity"><header className="act-cover"><p className="act-kicker"><span className="pow pow-sm" aria-hidden="true">HUH?</span></p><h1 ref={heading} tabIndex={-1}>That page wandered off.</h1><p className="act-caption"><a className="text-action" href="#experience">See all my activities</a></p></header></main>;
}

export function ResumePage(){
 const heading=useArrival('resume');
 useEffect(()=>{document.title='Résumé · John Vu';return()=>{document.title='John Vu'}},[]);
 return <main className="activity-page resume-page tone-paper" id="activity">
  <nav className="act-crumbs" aria-label="Breadcrumb"><a href="#experience">← Back to the site</a><button type="button" className="act-print" onClick={()=>window.print()}>Print or save as PDF</button></nav>
  <header className="act-cover resume-head">
   <h1 ref={heading} tabIndex={-1}>John Vu</h1>
   <p className="act-caption"><b>UC Berkeley ’30 · Economics &amp; Data Science</b></p>
   <p className="resume-contact"><a href="mailto:cloudietuan@gmail.com">cloudietuan@gmail.com</a><a href="https://www.linkedin.com/in/jtavu" target="_blank" rel="noreferrer">linkedin.com/in/jtavu</a></p>
  </header>
  {experience.map(g=><section key={g.title} className="resume-group"><h2>{g.title}</h2><ul>{g.items.map(it=>{const a=activityList.find(x=>x.name===it.name&&x.role===it.role);return <li key={it.name+it.role}><div className="resume-top"><a href={activityHref(a.slug)}><b>{it.name}</b></a>{it.when&&<span>{it.when}</span>}</div><em>{it.role}</em><p>{it.line}</p></li>})}</ul></section>)}
 </main>;
}
