import {useEffect,useMemo,useRef,useState} from 'react';
import {projectList} from './projects';

// A comic-style jump menu. K (or Cmd/Ctrl+K, or the header button) opens it;
// type to filter, arrows to move, Enter to go, Escape to close.

const snoopy=(routine,say)=>()=>window.dispatchEvent(new CustomEvent('jtavu:snoopy-command',{detail:{command:'routine',routine,say}}));
const jump=id=>()=>document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
const open=url=>()=>{const a=document.createElement('a');a.href=url;if(url.startsWith('http')){a.target='_blank';a.rel='noreferrer';}a.click();};

// Calls back once the page has held still for a moment (or after 2 seconds).
function whenScrollSettles(done){
 let last=scrollY,still=0,tries=0;
 const id=setInterval(()=>{tries++;still=Math.abs(scrollY-last)<1?still+1:0;last=scrollY;if(still>=3||tries>20){clearInterval(id);done();}},100);
}

export function buildCommands(projects=projectList){
 return [
  ...projects.map(p=>({id:`project-${p.id}`,group:'Projects',title:`Show me ${p.title}`,hint:p.tags.join(' / '),keys:`${p.title} ${p.tags.join(' ')} project`,run:()=>{
   const el=document.getElementById(`project-${p.id}`);if(!el)return;
   const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
   // Lazy images above the project load during the scroll and push it down,
   // so re-aim until it is really on screen (up to three times).
   const aim=n=>{el.scrollIntoView({behavior,block:'center'});whenScrollSettles(()=>{const r=el.getBoundingClientRect();
    if(n<3&&(r.top>innerHeight*.7||r.bottom<innerHeight*.2))return aim(n+1);
    // A pointer-style click (detail 1), so the quick-take card does not take
    // keyboard focus and scroll the page away from the project.
    el.querySelector('[data-guide-trigger]')?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));});};
   aim(0);
  }})),
  {id:'go-highlights',group:'Go to',title:'Highlights',hint:'the short version',keys:'best awards isef',run:jump('highlights')},
  {id:'go-work',group:'Go to',title:'Work',hint:'things I’ve built',keys:'projects portfolio',run:jump('work')},
  {id:'go-offer',group:'Go to',title:'What I can do for you',hint:'services',keys:'hire offer help build',run:jump('offer')},
  {id:'go-experience',group:'Go to',title:'Experience',hint:'where I’ve been',keys:'linkedin jobs roles resume',run:jump('experience')},
  {id:'go-about',group:'Go to',title:'About',hint:'hey, I’m John',keys:'bio who',run:jump('about')},
  {id:'go-top',group:'Go to',title:'Back to the top',hint:'CREATOR',keys:'home canvas top start',run:jump('top')},
  {id:'email',group:'Say hi',title:'Email John',hint:'cloudietuan@gmail.com',keys:'contact hire mail hello',run:open('mailto:cloudietuan@gmail.com')},
  {id:'linkedin',group:'Say hi',title:'Open LinkedIn',hint:'linkedin.com/in/jtavu',keys:'experience profile',run:open('https://www.linkedin.com/in/jtavu')},
  {id:'resume',group:'Say hi',title:'Open résumé',hint:'jtavu.com/resume',keys:'resume cv',run:open('https://jtavu.com/resume')},
  {id:'dance',group:'Snoopy',title:'Make Snoopy dance',hint:'♪',keys:'party fun music',run:snoopy('dance','♪ ♪ ♪')},
  {id:'spin',group:'Snoopy',title:'Snoopy, spin!',hint:'whee',keys:'turn trick',run:snoopy('spin','wheee')},
  {id:'wave',group:'Snoopy',title:'Wave hello',hint:'hi!',keys:'greet hi',run:snoopy('wave','hi!')},
  {id:'cheer',group:'Snoopy',title:'Cheer',hint:'yay',keys:'happy celebrate',run:snoopy('cheer','yay!')},
  {id:'nap',group:'Snoopy',title:'Take a cat nap',hint:'z',keys:'sleep rest',run:snoopy('catNap')},
  {id:'double',group:'Snoopy',title:'Double take',hint:'!',keys:'look surprise',run:snoopy('doubleTake')},
  {id:'snoopy-menu',group:'Snoopy',title:'Open Snoopy’s menu',hint:'more tricks',keys:'tricks settings pause',run:()=>window.dispatchEvent(new CustomEvent('jtavu:snoopy-command',{detail:{command:'menu'}}))},
  {id:'intro',group:'Snoopy',title:'Replay the doghouse intro',hint:'from the start',keys:'intro doghouse landing replay',run:()=>document.querySelector('.site-header .brand')?.click()},
 ];
}

export function filterCommands(commands,query){
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 if(!words.length)return commands;
 return commands.filter(c=>{const hay=`${c.title} ${c.hint} ${c.keys} ${c.group}`.toLowerCase();return words.every(w=>hay.includes(w));});
}

export function CommandMenu(){
 const [isOpen,setOpen]=useState(false),[query,setQuery]=useState(''),[sel,setSel]=useState(0);
 const input=useRef(null),opener=useRef(null),list=useRef(null);
 const commands=useMemo(()=>buildCommands(),[]);
 const shown=filterCommands(commands,query);
 const show=()=>{opener.current=document.activeElement;setQuery('');setSel(0);setOpen(true);};
 const close=(restore=true)=>{setOpen(false);if(restore)requestAnimationFrame(()=>opener.current?.focus?.({preventScroll:true}));};
 const run=c=>{if(!c)return;close(false);setTimeout(c.run,60);};
 useEffect(()=>{
  const key=e=>{
   if(e.defaultPrevented)return;
   const typing=e.target.closest?.('input,textarea,select,[contenteditable="true"]');
   if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey||(!typing&&!e.altKey&&!document.querySelector('dialog[open]')))){e.preventDefault();setOpen(o=>{if(o)return false;opener.current=document.activeElement;setQuery('');setSel(0);return true;});}
  };
  const external=()=>show();
  window.addEventListener('keydown',key);window.addEventListener('jtavu:command-menu',external);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('jtavu:command-menu',external);};
 },[]);
 useEffect(()=>{if(isOpen)requestAnimationFrame(()=>input.current?.focus());},[isOpen]);
 useEffect(()=>{list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});},[sel,isOpen]);
 if(!isOpen)return null;
 let lastGroup='';
 return <div className="cmd-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
  <div className="cmd-menu" role="dialog" aria-modal="true" aria-label="Jump menu" onKeyDown={e=>{
   if(e.key==='Escape'){e.preventDefault();close();}
   else if(e.key==='ArrowDown'){e.preventDefault();setSel(n=>Math.min(shown.length-1,n+1));}
   else if(e.key==='ArrowUp'){e.preventDefault();setSel(n=>Math.max(0,n-1));}
   else if(e.key==='Enter'){e.preventDefault();run(shown[sel]);}
   else if(e.key==='Tab'){e.preventDefault();}
  }}>
   <input ref={input} value={query} onChange={e=>{setQuery(e.target.value);setSel(0);}} placeholder="Where to? Try “oncosync” or “dance”" aria-label="Search the site" role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={shown[sel]?`cmd-${shown[sel].id}`:undefined} autoComplete="off" spellCheck="false"/>
   <ul id="cmd-list" ref={list} role="listbox" aria-label="Results">
    {shown.length?shown.map((c,i)=>{const head=c.group!==lastGroup;lastGroup=c.group;return <li key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i===sel} data-group={head?c.group:undefined} className={i===sel?'is-sel':''} onMouseMove={()=>setSel(i)} onClick={()=>run(c)}><span>{c.title}</span><small>{c.hint}</small></li>;})
     :<li className="cmd-empty" role="presentation">Snoopy can’t find that one.</li>}
   </ul>
   <p className="cmd-foot" aria-hidden="true"><span className="kbd">↑</span><span className="kbd">↓</span> move · <span className="kbd">Enter</span> go · <span className="kbd">Esc</span> close</p>
  </div>
 </div>;
}
