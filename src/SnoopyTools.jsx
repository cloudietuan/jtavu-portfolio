import './snoopyPlayground.css';

export function SnoopyTools({tool,anchor,tip,subjectRect,subjectLabel='',progress=0,rise=120,actorSize=96,opacity=1,phase='act',reduced=false}) {
 if(!tool||!anchor)return null;
 // The ball is the real canvas prop; its station owns the reversible reaction.
 if(tool==='ball')return null;
 if(['hop','dash','bow'].includes(tool))return <div className={`snoopy-move-effects is-${tool} phase-${phase}`} aria-hidden="true" style={{left:anchor.x,top:anchor.y,opacity}}><span className="snoopy-ground-shadow"/>{tool==='dash'&&phase==='act'&&<span className="snoopy-dust"><i/><i/><i/></span>}{tool==='hop'&&phase==='recover'&&<span className="snoopy-landing-rings"/>}</div>;
 if(tool==='camera'){
  if(!subjectRect)return null;
  const left=Math.max(8,subjectRect.left-7),top=Math.max(innerWidth<700?110:74,subjectRect.top-7);
  const width=Math.max(0,Math.min(innerWidth-8,subjectRect.left+subjectRect.width+7)-left);
  const height=Math.max(0,Math.min(innerHeight-8,subjectRect.top+subjectRect.height+7)-top);
  if(!width||!height)return null;
  const cameraPhase=phase==='prepare'?'prepare':progress<.65?'contact':'recover';
  const reveal=reduced?1:Math.min(1,progress/.16,(1-progress)/.2);
  const shutter=reduced?0:Math.max(0,1-Math.abs(progress-.47)/.075);
  return <div className={`snoopy-photo-moment is-${cameraPhase}`} aria-hidden="true" style={{left,top,width,height,opacity:Math.max(0,reveal)*opacity,'--shutter':shutter}}>
   <span className="snoopy-viewfinder-corner top-left"/><span className="snoopy-viewfinder-corner top-right"/>
   <span className="snoopy-viewfinder-corner bottom-left"/><span className="snoopy-viewfinder-corner bottom-right"/>
   <span className="snoopy-shutter-pulse"/>
   <span className="snoopy-photo-caption">A closer look{subjectLabel?` · ${subjectLabel}`:''}</span>
  </div>;
 }
 if(tool==='portal')return <div className="snoopy-portal" style={{left:anchor.x,top:anchor.y-3,opacity:Math.min(1,(1-progress)*5)}} aria-hidden="true"><span/></div>;
 if(tool==='swing'&&tip){
  const dx=tip.x-anchor.x,dy=tip.y-anchor.y,length=Math.hypot(dx,dy);
  return <div className="snoopy-rope" style={{left:anchor.x,top:anchor.y,height:length,opacity,transform:`rotate(${-Math.atan2(dx,dy)*180/Math.PI}deg)`}} aria-hidden="true"><span className="snoopy-rope-knot"/></div>;
 }
 const left=tool==='ladder'?anchor.x+4:anchor.x+5;
 const ladderHeight=rise+actorSize*.8;
 const top=tool==='ladder'?anchor.y-ladderHeight:anchor.y-69;
 const swing=reduced?0:Math.sin(progress*Math.PI*10)*30;
 return <div className={`snoopy-tool snoopy-tool-${tool}`} style={{left,top,opacity,...(tool==='ladder'?{height:ladderHeight}: {})}} aria-hidden="true">
 <img src={`/assets/snoopy-${tool}.png`} alt="" style={tool==='hammer'?{transform:`rotate(${swing-15}deg)`}:undefined}/>
 </div>;
}
