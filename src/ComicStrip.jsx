import {KINDS} from './projects';

// A project's story told as a four-panel comic strip: the idea, my part, what
// I made, where it stands. Every panel uses the project's own words from
// projects.js; the sound effects change with the kind of work.
export function stripPanels(p){
 const words=(KINDS[p.kind]||KINDS.web).words;
 return [
  {caption:'The idea',text:p.detail||p.description,fx:words[0]},
  {caption:'My part',text:p.contribution,fx:words[1]},
  {caption:'What I made',text:p.artifact,fx:words[2]},
  {caption:'Where it stands',text:p.next||p.status,fx:words[3]},
 ].filter(panel=>panel.text);
}

export function ComicStrip({project}){
 const panels=stripPanels(project);
 return <ol className={`comic-strip kind-${project.kind}`} aria-label={`${project.title}, told in ${panels.length} panels`}>
  {panels.map((panel,i)=><li key={panel.caption} className="strip-panel" style={{'--i':i}}>
   <span className="strip-caption">{panel.caption}</span>
   <span className="strip-fx" aria-hidden="true">{panel.fx}</span>
   <p>{panel.text}</p>
  </li>)}
 </ol>;
}
