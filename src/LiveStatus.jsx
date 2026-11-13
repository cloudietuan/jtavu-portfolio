import {useEffect,useState} from 'react';
import {nowStatus} from './experience';

// "Right now:" flips through what John is actually doing, with a blinking
// pixel light. `compact` is the small pill for the header.
export function LiveStatus({compact=false,interval=2800}){
 const [i,setI]=useState(0);
 useEffect(()=>{
  const id=setInterval(()=>setI(n=>(n+1)%nowStatus.length),interval);
  return()=>clearInterval(id);
 },[interval]);
 if(compact)return <span className="status-pill" aria-hidden="true"><i/><span key={i}>{nowStatus[i]}</span></span>;
 return <p className="live-status">
  <span className="status-dot" aria-hidden="true"/>
  <span className="status-label">Right now:</span>
  {/* Screen readers get the full list once instead of a changing line. */}
  <span className="sr-only">{nowStatus.join(', ')}</span>
  <span className="status-flip" aria-hidden="true"><span key={i}>{nowStatus[i]}</span></span>
 </p>;
}
