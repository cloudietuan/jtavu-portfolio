import {useEffect} from 'react';
import {ExperienceArchive} from './ExperienceArchive';
import {projectNumber} from './SnoopyGuide';
import {projectList} from './projects';
export function ScrollPortfolio({filter,setFilter,openProject,brief}){
 const visible=projectList.filter(p=>filter==='All'||p.tags.includes(filter));
 const featured=visible.filter(p=>p.featured),others=visible.filter(p=>!p.featured);
 useEffect(()=>{
  const el=document.getElementById('contact');if(!el||!('IntersectionObserver' in window))return;
  const seen=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){seen.disconnect();window.dispatchEvent(new CustomEvent('jtavu:snoopy-command',{detail:{command:'farewell'}}));}},{threshold:.5});
  seen.observe(el);return()=>seen.disconnect();
 },[]);
 // Sections ease in as they arrive. Content stays visible without JavaScript,
 // and reduced motion turns the movement off in CSS.
 useEffect(()=>{
  const items=[...document.querySelectorAll('.scroll-portfolio .work-intro,.scroll-portfolio .project-story,.scroll-portfolio .index-project,.scroll-portfolio .making-section,.scroll-portfolio .beyond-section,.scroll-portfolio .about-section,.scroll-portfolio .contact-section')];
  if(!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target);}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  for(const el of items){if(el.classList.contains('is-revealed'))continue;const b=el.getBoundingClientRect();if(b.top<innerHeight&&b.bottom>0){el.classList.add('is-revealed');continue;}el.classList.add('reveal');observer.observe(el);}
  return()=>observer.disconnect();
 },[filter]);
 // Header reading progress and the current section in the navigation.
 useEffect(()=>{
  const links=[...document.querySelectorAll('.site-header nav a')],ids=['top','work','beyond','about','contact'];
  let queued=false;
  const update=()=>{
   queued=false;
   const max=document.documentElement.scrollHeight-innerHeight;
   document.documentElement.style.setProperty('--scroll-progress',max>0?Math.min(1,scrollY/max).toFixed(4):'0');
   let current='top';
   for(const id of ids){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.45)current=id;}
   for(const a of links){const on=a.getAttribute('href')===`#${current}`;a.classList.toggle('is-current',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}
  };
  const onScroll=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);
  return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);};
 },[]);
 return <div className="scroll-portfolio">
 <section id="work" className="work-intro"><p className="section-kicker">01 / SELECTED WORK</p><div className="work-heading"><h2>A few things<br/><em>I’ve made.</em></h2><p>Websites, design, and ideas<br/>I wanted to see in the world.</p></div><div className="work-filter-row"><div className="work-filters" aria-label="Filter selected work">{['All','Websites','Design','Research'].map(f=><button key={f} data-guide-trigger aria-pressed={filter===f} onClick={e=>{setFilter(f);brief('topic',f,e);}}>{f}</button>)}</div><p aria-live="polite">{visible.length} projects</p></div><ol className="project-directory" aria-label="Project directory. Choose one for Snoopy’s quick take.">{visible.map(p=><li key={p.id}><button data-guide-trigger data-preview={p.image} onClick={e=>brief('project',p.id,e)}><i>{projectNumber(p.id)}</i><b>{p.title}</b><span>{p.tags.join(' / ')}</span><em>{p.status}</em></button></li>)}</ol><p className="directory-hint">Tap a project and Snoopy will give you the short version.</p></section>
 <div className="featured-stories">{featured.map((p,i)=><section key={p.id} data-project-id={p.id} data-snoopy-actions="inspect climb" id={`project-${p.id}`} className={`project-story ${p.id==='apparel'?'apparel-story':''}`} aria-labelledby={`title-${p.id}`}><div className="story-heading"><p className="section-kicker"><b>{projectNumber(p.id)}</b>{p.tags.join(' / ').toUpperCase()}</p><h2 id={`title-${p.id}`}>{p.title}</h2><p className="story-role">{p.role} <span className="project-status">{p.status}</span></p></div><button className="story-image" data-guide-trigger onClick={e=>brief('project',p.id,e)} aria-label={`Snoopy’s quick take on ${p.title}`}><img src={p.image} alt={`${p.title} website and design preview`} loading="lazy"/></button><div className="story-copy"><p className="story-statement">{p.description}</p><div><p>{p.detail}</p><button className="text-action" onClick={()=>openProject(p.id)}>Project details</button><a className="text-action" href={p.url} target="_blank" rel="noreferrer">Visit the project</a></div></div></section>)}</div>
 {others.length>0&&<section className="project-index" aria-label="More selected projects"><div className="index-intro"><p className="section-kicker">MORE TO EXPLORE</p><p>Questions turned into projects.</p></div>{others.map(p=><article key={p.id} data-project-id={p.id} data-snoopy-actions="inspect climb" id={`project-${p.id}`} className="index-project"><div className="index-identity"><p className="section-kicker"><b>{projectNumber(p.id)}</b>{p.tags.join(' / ').toUpperCase()}</p><h3><button className="project-title-button" data-guide-trigger onClick={e=>brief('project',p.id,e)}>{p.title}</button></h3><p className="index-role">{p.role}</p><p className="project-status">{p.status}</p></div><button className="index-preview" data-guide-trigger onClick={e=>brief('project',p.id,e)} aria-label={`Snoopy’s quick take on ${p.title}`}><img src={p.image} alt={`${p.title} archived project preview`} loading="lazy"/></button><p>{p.description}</p><button className="text-action" onClick={()=>openProject(p.id)}>Explore project</button></article>)}</section>}
 <section id="making" className="making-section"><p className="section-kicker">02 / STILL IN THE MAKING</p><h2>Room for<br/><em>what’s next.</em></h2><div><p>OncoSync is an ongoing exploration of a connected workspace for cancer research, with further validation still ahead.</p><button className="text-action" onClick={()=>openProject('oncosync')}>Explore OncoSync</button></div></section>
 <section id="beyond" className="beyond-section"><p className="section-kicker">03 / BEYOND WORK</p><h2>Curiosity doesn’t<br/><em>stay at a desk.</em></h2><p>Filmmaking, photography, and volleyball.<br/>More places to explore.</p><ExperienceArchive/></section>
 <section id="about" className="about-section"><p className="section-kicker">04 / ABOUT</p><h2>Hey, I’m John.</h2><p>I’m John Vu, a Berkeley student making websites, visual identities, and research projects. My work moves between a family business, student communities, and questions I want to explore.</p><p className="bio-label">UC Berkeley ’30 · Economics &amp; Data Science</p><div id="contact" className="contact-section"><p className="section-kicker">HAVE SOMETHING IN MIND?</p><a href="mailto:cloudietuan@gmail.com">Let’s make something.</a><p><a className="text-action" href="mailto:cloudietuan@gmail.com">cloudietuan@gmail.com</a><a className="text-action" href="https://jtavu.com/resume" target="_blank" rel="noreferrer">View résumé</a></p><a className="back-top" href="#top">Back to the canvas</a></div></section>
 </div>;
}
