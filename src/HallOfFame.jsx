import {useEffect,useRef,useState} from 'react';
import {hall,HALL_KINDS,hallFor} from './hall.js';
import {activityHref} from './activities.js';

// A framed-panel wall of real posters and awards (idea from the "Hall of Fame"
// on landonorris.com), plus a full-size viewer that both the wall and the
// activity pages open.

export function HallViewer({item,onClose}){
 const ref=useRef(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(item&&!d.open){d.showModal();}if(!item&&d.open)d.close();},[item]);
 return <dialog ref={ref} className="hall-viewer" aria-labelledby="hall-viewer-title" onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
  {item&&<figure>
   <button type="button" className="hall-close" onClick={onClose} aria-label="Close">×</button>
   <img src={item.src} alt={`${item.title}, ${item.meta}`} width={item.w} height={item.h}/>
   <figcaption><h3 id="hall-viewer-title">{item.title}</h3><p>{item.meta}</p>
    <span className="hall-actions">{item.activity&&<a className="text-action" href={activityHref(item.activity)} onClick={onClose}>Read the story →</a>}<a className="text-action" href={item.src} target="_blank" rel="noreferrer">Open full size ↗</a></span>
   </figcaption>
  </figure>}
 </dialog>;
}

function Frame({item,i,onOpen}){
 return <li className={`hall-frame kind-${item.kind.toLowerCase()}`} style={{'--i':i,'--tilt':`${((i*37)%7)-3}deg`}}>
  <button type="button" onClick={()=>onOpen(item)} aria-label={`View ${item.title}`}>
   <span className="hall-pin" aria-hidden="true"/>
   <img src={item.sm} alt="" loading="lazy" width={item.w} height={item.h}/>
  </button>
  <p className="hall-plaque"><b>{item.title}</b><span>{item.meta}</span></p>
 </li>;
}

export function HallOfFame(){
 const [kind,setKind]=useState('All'),[open,setOpen]=useState(null);
 const shown=hall.filter(h=>kind==='All'||h.kind===kind);
 return <section id="hall" className="hall-section" aria-labelledby="hall-title">
  <p className="section-kicker">HALL OF FAME</p>
  <h2 id="hall-title">The proof.<span className="pow pow-head" aria-hidden="true">WIN!</span></h2>
  <p className="hall-lede">Posters I presented, awards I earned and certificates I didn’t throw away. Tap one to see it up close.</p>
  <div className="hall-filters" role="group" aria-label="Show">{HALL_KINDS.map(k=><button key={k} type="button" aria-pressed={kind===k} onClick={()=>setKind(k)}>{k}<span>{k==='All'?hall.length:hall.filter(h=>h.kind===k).length}</span></button>)}</div>
  <ul className="hall-wall">{shown.map((h,i)=><Frame key={h.id} item={h} i={i} onOpen={setOpen}/>)}</ul>
  <HallViewer item={open} onClose={()=>setOpen(null)}/>
 </section>;
}

// The same frames, small, on an activity page.
export function ActivityProof({slug}){
 const items=hallFor(slug),[open,setOpen]=useState(null);
 if(!items.length)return null;
 return <section className="act-proof" aria-labelledby="act-proof-title">
  <h2 id="act-proof-title">The proof<span className="pow pow-sm" aria-hidden="true">WIN!</span></h2>
  <ul className="hall-wall hall-wall-small">{items.map((h,i)=><Frame key={h.id} item={h} i={i} onOpen={setOpen}/>)}</ul>
  <HallViewer item={open} onClose={()=>setOpen(null)}/>
 </section>;
}
