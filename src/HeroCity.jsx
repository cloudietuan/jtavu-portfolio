// A comic-book city behind the CREATOR word: action-burst sky, halftone dots
// and inked skyscrapers that rise from behind the letters. Original shapes in
// the site's ink, cream, yellow, sky and red; the style is a comic cover, not
// any particular character. Each near tower is its own element so Snoopy can
// stand on the rooftops (TERRAIN includes .hero-city .tower).

// x, w: left and width in % of the hero. h: height in % of the hero, measured
// up from the middle of the CREATOR word. wide: hidden on phones.
const NEAR=[
 {x:0,w:8,h:30,fill:'sky',roof:'water'},
 {x:9,w:6.5,h:24,fill:'cream',roof:'flat',wide:true},
 {x:16.5,w:9,h:33,fill:'sun',roof:'antenna'},
 {x:27,w:6,h:26,fill:'cream',roof:'step',wide:true},
 {x:34,w:8.5,h:31,fill:'sky',roof:'water',wide:true},
 {x:46,w:7,h:46,fill:'cream',roof:'water'},
 {x:54.5,w:9,h:56,fill:'sky',roof:'antenna'},
 {x:65,w:6,h:50,fill:'sun',roof:'flat'},
 {x:72,w:10,h:62,fill:'cream',roof:'spire'},
 {x:83.5,w:7,h:57,fill:'red',roof:'step'},
 {x:91.5,w:8.5,h:60,fill:'sky',roof:'water'},
];
const FAR=[[3,9,40],[12,7,48],[21,10,38],[38,8,52],[50,9,70],[60,7,82],[68,9,66],[79,8,88],[88,10,74]];

function Roof({kind}){
 if(kind==='water')return <svg className="roof roof-water" viewBox="0 0 40 46" aria-hidden="true"><path d="M8 18h24v16H8Z" fill="#E03A2E" stroke="#141414" strokeWidth="3"/><path d="M6 18 20 6l14 12Z" fill="#141414"/><path d="M10 34l-3 12M30 34l3 12M20 34v12M8 42h24" stroke="#141414" strokeWidth="3"/></svg>;
 if(kind==='antenna')return <svg className="roof roof-antenna" viewBox="0 0 20 60" aria-hidden="true"><path d="M10 60V6" stroke="#141414" strokeWidth="3"/><path d="M4 30h12M6 44h8" stroke="#141414" strokeWidth="3"/><circle cx="10" cy="6" r="4.5" fill="#E03A2E" stroke="#141414" strokeWidth="2.5" className="blink"/></svg>;
 if(kind==='spire')return <svg className="roof roof-spire" viewBox="0 0 60 80" aria-hidden="true"><path d="M8 80V52h44v28Z" fill="#FFF9EC" stroke="#141414" strokeWidth="3"/><path d="M16 52V30h28v22Z" fill="#A7D8FF" stroke="#141414" strokeWidth="3"/><path d="M24 30 30 0l6 30Z" fill="#FFF9EC" stroke="#141414" strokeWidth="3" strokeLinejoin="round"/></svg>;
 if(kind==='step')return <span className="roof roof-step" aria-hidden="true"/>;
 return null;
}

export function HeroCity(){
 return <div className="hero-city" aria-hidden="true">
  <div className="hero-burst"/>
  <div className="hero-far">{FAR.map(([x,w,h],i)=><span key={i} style={{left:`${x}%`,width:`${w}%`,height:`calc(${h*.62}% + var(--word)*.5)`}}/>)}</div>
  {NEAR.map((t,i)=><div key={i} className={`tower fill-${t.fill} ${t.wide?'wide-only':''}`} style={{left:`${t.x}%`,width:`${t.w}%`,'--h':t.h}}><Roof kind={t.roof}/></div>)}
 </div>;
}
