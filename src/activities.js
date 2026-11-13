// One page per activity, built only from the facts in experience.js.
// Pages live at #/a/<slug>; the résumé lives at #/resume.
import {experience} from './experience.js';

export const slugOf=name=>name.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export const activityList=experience.flatMap(g=>g.items.map(it=>({...it,slug:slugOf(it.name),group:g.title,burst:g.burst,
 project:(it.links||[]).map(l=>l.href.match(/^#project-(.+)$/)?.[1]).find(Boolean)||null,
 outside:(it.links||[]).filter(l=>!l.href.startsWith('#'))})));

export const activityHref=slug=>`#/a/${slug}`;
export const activityBySlug=slug=>activityList.find(a=>a.slug===slug)||null;

// Reads the hash into a page: {page:'activity',slug}, {page:'resume'} or null for the main site.
export function routeOf(hash){
 const m=/^#\/a\/([a-z0-9-]+)\/?$/.exec(hash||'');
 if(m)return activityBySlug(m[1])?{page:'activity',slug:m[1]}:{page:'missing'};
 if(/^#\/resume\/?$/.test(hash||''))return {page:'resume'};
 return null;
}

// Splits the story into comic panels, one per sentence (the role is already on the cover).
export function panelsOf(a){
 // Splits after . ! or ? but not after a one-letter abbreviation like U.S.
 const sentences=a.line.trim().split(/(?<!\b[A-Z]\.)(?<=[.!?])\s+/).filter(Boolean);
 return sentences.map((text,i)=>({caption:i===0?'What I did':null,text}));
}

export function neighbours(slug){
 const i=activityList.findIndex(a=>a.slug===slug),n=activityList.length;
 return {prev:activityList[(i-1+n)%n],next:activityList[(i+1)%n]};
}
