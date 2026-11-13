import {useEffect,useState} from 'react';

const clock=()=>new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Los_Angeles'}).format(new Date());

export function SiteFooter({onTop}){
 const [time,setTime]=useState(clock);
 useEffect(()=>{const id=setInterval(()=>setTime(clock()),30000);return()=>clearInterval(id);},[]);
 return <footer className="site-footer">
  <div className="footer-row">
   <p>John Vu<span>Websites, design &amp; experiments</span></p>
   <p className="footer-time">Berkeley, California<span>{time} local time</span></p>
   <a href="#top" onClick={onTop}>Back to top <span aria-hidden="true">↑</span></a>
  </div>
  <p className="footer-word" aria-hidden="true">JTAVU</p>
  <p className="footer-note">A world, still in the making.</p>
 </footer>;
}
