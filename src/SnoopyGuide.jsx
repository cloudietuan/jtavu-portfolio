import {useEffect,useLayoutEffect,useRef} from 'react';
import {projectList,projects} from './projects';

// Snoopy as a guide: tap a project or a topic and he comes over with the
// short version. Every line here is taken from projects.js; nothing is invented.

const TOPICS={
 All:{title:'Everything',line:n=>`${n} projects. Two get the full treatment up top, the rest follow. Tap any of them and I’ll give you the short version.`},
 Websites:{title:'Websites',line:n=>`${n} of John’s projects live as websites you can click through.`},
 Design:{title:'Design',line:n=>`${n} ${n===1?'project is':'projects are'} about how things look: identity, graphics, and pieces made to be worn.`},
 Research:{title:'Research',line:n=>`${n} projects that started as a question John wanted answered.`},
};
export const topicProjects=topic=>topic==='All'?projectList:projectList.filter(p=>p.tags.includes(topic));
export const nextProject=id=>projectList[(projectList.findIndex(p=>p.id===id)+1)%projectList.length].id;
export const projectNumber=id=>String(projectList.findIndex(p=>p.id===id)+1).padStart(2,'0');

/** What the card says for a project or topic. Pure, so it can be tested. */
export function guideContent(guide){
 if(!guide)return null;
 if(guide.type==='project'){
  const p=projects[guide.id];if(!p)return null;
  return {kind:'project',id:p.id,kicker:`${projectNumber(p.id)} · ${p.tags.join(' / ')}`,title:p.title,status:p.status,role:p.role,
   facts:[['What it is',p.description],['John’s part',p.contribution],p.next?['Where it stands',p.next]:null].filter(Boolean),url:p.url};
 }
 const t=TOPICS[guide.id];if(!t)return null;
 const list=topicProjects(guide.id);
 return {kind:'topic',id:guide.id,kicker:'Topic',title:t.title,line:t.line(list.length),projects:list.map(p=>({id:p.id,title:p.title}))};
}

/** Where the card sits: beside Snoopy on wide screens, a bottom sheet on phones. */
export function guidePlacement(snoopy,card,view){
 const m=12;
 if(view.width<700||!snoopy)return {left:m,top:Math.max(view.top+m,view.height-card.height-m),sheet:true};
 const roomRight=view.width-snoopy.right,right=roomRight>=snoopy.left;
 const left=right?snoopy.right+10:snoopy.left-card.width-10;
 const top=snoopy.top+snoopy.height*.25-card.height*.5;
 return {left:Math.max(m,Math.min(view.width-card.width-m,left)),top:Math.max(view.top+m,Math.min(view.height-card.height-m,top)),sheet:false,side:right?'right':'left'};
}

export function SnoopyGuide({guide,onClose,onOpenProject,onBrief,onGoTo,focusOnOpen}){
 const card=useRef(null),content=guideContent(guide);
 // Follow Snoopy as he walks, slides or rides the page.
 useLayoutEffect(()=>{
  if(!content)return;let id;
  const tick=()=>{
   const el=card.current;if(el){
    const s=document.querySelector('.snoopy-companion')?.getBoundingClientRect(),h=document.querySelector('.site-header')?.getBoundingClientRect();
    const p=guidePlacement(s&&s.width?s:null,{width:el.offsetWidth,height:el.offsetHeight},{width:innerWidth,height:innerHeight,top:h?Math.max(0,h.bottom):0});
    el.style.transform=`translate(${Math.round(p.left)}px,${Math.round(p.top)}px)`;el.dataset.side=p.sheet?'sheet':p.side;el.style.visibility='visible';
   }
   id=requestAnimationFrame(tick);
  };
  tick();return()=>cancelAnimationFrame(id);
 },[guide?.type,guide?.id]);
 useEffect(()=>{
  if(!content)return;
  if(focusOnOpen)card.current?.focus();
  const key=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose(true);}};
  const outside=e=>{if(!e.target.closest?.('.snoopy-guide,[data-guide-trigger],.snoopy-companion,.snoopy-control-panel'))onClose(false);};
  window.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
 },[guide?.type,guide?.id]);
 if(!content)return null;
 return <aside ref={card} key={`${content.kind}-${content.id}`} className="snoopy-guide" role="dialog" aria-label={`Snoopy’s quick take on ${content.title}`} tabIndex={-1} style={{visibility:'hidden'}}>
  <button className="guide-close" onClick={()=>onClose(true)} aria-label="Close Snoopy’s quick take">×</button>
  <p className="guide-kicker"><span>Snoopy’s quick take</span>{content.kicker}</p>
  <h3>{content.title}</h3>
  {content.kind==='project'?<>
   <p className="guide-meta"><span className="project-status">{content.status}</span>{content.role}</p>
   <dl>{content.facts.map(([label,text])=><div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
   <div className="guide-actions"><button className="guide-primary" onClick={()=>onOpenProject(content.id)}>Full story</button><button onClick={()=>onGoTo(content.id)}>Take me there</button><a href={content.url} target="_blank" rel="noreferrer">Visit ↗</a><button className="guide-next" data-guide-trigger onClick={()=>onBrief('project',nextProject(content.id))}>Next →</button></div>
  </>:<>
   <p className="guide-line">{content.line}</p>
   <div className="guide-chips">{content.projects.map(p=><button key={p.id} data-guide-trigger onClick={()=>onBrief('project',p.id)}><i>{projectNumber(p.id)}</i>{p.title}</button>)}</div>
  </>}
 </aside>;
}
