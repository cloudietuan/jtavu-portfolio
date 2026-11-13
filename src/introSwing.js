// How Snoopy brings the intro blind down. Every visit starts the same way:
// he runs and zooms off the right side of the landing screen, pops back up
// from the bottom of the screen, zooms along the bottom to the pull tab,
// leaps up and grabs it. Then he pulls it down in one of several ways, never
// the same twice in a row. Pure: a plan is a function of time that says where
// the blind is, where Snoopy is, which pose he is in, and what he says.
// IntroBlind plays it; the companion catches him.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const easeOut=k=>1-Math.pow(1-clamp(k,0,1),3);
const easeIn=k=>Math.pow(clamp(k,0,1),2.2);
const easeInOut=k=>{k=clamp(k,0,1);return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;};
const lerp=(a,b,k)=>a+(b-a)*k;

export const SWING_VARIANTS=Object.freeze(['runningLeap','bungee','twoTugs']);

/** Any pull except the one played last time. */
export function chooseVariant(last,random=Math.random){
 const pool=SWING_VARIANTS.filter(v=>v!==last);
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}

function geometry({width,height,size,start}){
 const lift=Math.min(300,height*.4);
 // Where he stands on the landing screen when Explore is pressed (feet).
 const from=start&&Number.isFinite(start.x)&&Number.isFinite(start.y)?{x:clamp(start.x,0,width),y:clamp(start.y,size,height)}:{x:width*.4,y:height*.45};
 return {width,height,size,lift,from,floor:Math.min(150,lift*.5),cx:width/2,ground:height-6,hands:blindY=>height+blindY-4};
}

const HANG={kind:'action',action:'swing'},KICK={kind:'action',action:'ladder'},CROUCH={kind:'action',action:'portal'};
// Running: one full eight-frame stride covers about 1.4 body widths, so his
// feet keep pace with the ground instead of sliding or churning.
const strideOf=(g,dist)=>Math.abs(dist)/(g.size*1.4)*8;
const run=(g,dist)=>({kind:'walk',frame:Math.floor(strideOf(g,dist))%8});
// A small rise and fall on every step (two footfalls per stride).
const bob=(g,dist)=>g.size*.045*Math.abs(Math.sin(strideOf(g,dist)/8*Math.PI*2));
const hidden=blindY=>({blindY,visible:false});
function hang(g,blindY,rot,{pose=HANG,squash=[1,1],say=null,facing=-1}={}){
 return {blindY,visible:true,anchor:'hands',x:g.cx,y:g.hands(blindY),rot,pose,squash,say,facing,tabRot:clamp(rot*.6,-18,18)};
}
const feet=(blindY,x,y,pose,{rot=0,squash=[1,1],facing=1,say=null,zoom=0,dust=0}={})=>({blindY,visible:true,anchor:'feet',x,y,rot,pose,squash,facing,say,zoom,dust,tabRot:0});

// The shared entrance, about 1.9 seconds. Ends with his hands on the tab and
// the blind lifted.
const A={ready:300,dash:560,away:240,pop:380,zoom:400,crouch:120,leap:280};
export const APPROACH_MS=Object.values(A).reduce((a,b)=>a+b,0);
function approach(g,t){
 const lifted=-g.lift;
 // 0. Ready: he spots the edge ("!"), rocks back and crouches to push off.
 if(t<A.ready){
  const k=t/A.ready,c=Math.sin(Math.min(1,k/.7)*Math.PI/2);
  return feet(0,g.from.x-g.size*.06*c,g.from.y,{kind:'walk',frame:2},{rot:-7*c,facing:1,squash:[1+.08*c,1-.12*c],say:k<.6?'!':null});
 }
 let u=t-A.ready;
 // 1. Runs and zooms off the right side of the landing screen. The landing
 //    screen is the blind, so it has not moved yet. He pushes off hard,
 //    leans further into it as he speeds up, and kicks up dust.
 if(u<A.dash){
  const k=u/A.dash,endX=g.width+g.size*.9,x=lerp(g.from.x-g.size*.06,endX,easeIn(k)),d=x-g.from.x;
  return feet(0,x,g.from.y-bob(g,d),run(g,d),{rot:5+9*k,facing:1,squash:[1+.06*k,1-.04*k],say:k>.35?'zoom!':null,zoom:k>.25?1:0,dust:k<.75?1:0});
 }
 u-=A.dash;
 // 2. Off screen while the blind lifts and shows the strip of website below.
 if(u<A.away)return hidden(lifted*easeOut(u/A.away));
 u-=A.away;
 // 3. Pops up from the bottom of the screen near the right edge.
 const popX=g.width-g.size*1.1;
 if(u<A.pop){
  const k=u/A.pop,rise=g.size*1.3;
  const y=k<.7?lerp(g.height+g.size*1.1,g.ground-rise,easeOut(k/.7)):lerp(g.ground-rise,g.ground,easeIn((k-.7)/.3));
  return feet(lifted,popX,y,k<.85?KICK:CROUCH,{facing:-1,squash:k<.85?[.92,1.1]:[1.12,.86],say:k<.6?'boing!':null,dust:k>=.85?2:0});
 }
 u-=A.pop;
 // 4. Zooms left along the bottom to just right of the tab.
 const stopX=g.cx+g.size*1.25;
 if(u<A.zoom){
  const k=u/A.zoom,x=lerp(popX,stopX,easeOut(k)),d=popX-x;
  return feet(lifted,x,g.ground-bob(g,d)*(1-k),run(g,d),{rot:-11*(1-k),facing:-1,squash:[1.06,.96],zoom:k<.75?-1:0,say:k<.5?'zoooom':null,dust:k<.8?1:0});
 }
 u-=A.zoom;
 // 5. Crouches, then 6. leaps up and grabs the tab.
 if(u<A.crouch){const k=Math.sin(u/A.crouch*Math.PI/2);return feet(lifted,stopX,g.ground,CROUCH,{facing:-1,squash:[1+.1*k,1-.16*k]});}
 u-=A.crouch;
 const k=clamp(u/A.leap,0,1),e=easeOut(k),fromY=g.ground-g.size*.93,end={x:g.cx,y:g.hands(lifted)};
 return {blindY:lifted,visible:true,anchor:'hands',x:lerp(stopX,end.x,e),y:lerp(fromY,end.y,e)-70*4*k*(1-k),rot:16*(1-k),pose:HANG,squash:[1-.06*Math.sin(k*Math.PI),1+.08*Math.sin(k*Math.PI)],facing:-1,tabRot:0,say:k>.75?'hup!':null};
}

const PULLS={
 // Pumps his legs to swing higher and higher, dragging the blind down, then
 // lets go at the top of a swing.
 runningLeap(g,random){
  const flip=random()<.5,omega=Math.PI*2/800,swings=2+Math.floor(random()*2),swing=(Math.PI/2+swings*Math.PI)/omega,lean=-1;
  const pull=u=>{
   const k=u/swing,amp=lerp(10,30,easeOut(k*1.4)),theta=amp*Math.sin(omega*u)*lean;
   // The cord is tightest at the bottom of each swing, tugging the blind down.
   const tension=(1-Math.cos(2*omega*u))/2,blindY=-g.lift+(g.lift-g.floor)*easeInOut(k)+9*tension*(1-.5*k);
   const pumping=Math.cos(omega*u)*lean>0;
   return hang(g,blindY,theta,{pose:pumping&&k>.15?KICK:HANG,say:k>.45&&k<.7?'hnng!':null});
  };
  const dir=Math.sign(pull(swing-1).rot)||1;
  return {length:swing,pull,release:{vx:dir*-260,vy:-900,spin:dir*-(flip?620:240),say:flip?'ta-da!':'wheee!'}};
 },

 // Bounces like a bungee, each bounce deeper, until the blind recoils and
 // flings him high.
 bungee(g,random){
  const side=random()<.5?-1:1,T={grab:180,bounce:1500},depth=g.lift-g.floor+30;
  const pull=u=>{
   if(u<T.grab){const k=u/T.grab;return hang(g,-g.lift+10*Math.sin(k*Math.PI),6*Math.sin(k*Math.PI*2),{squash:[.96,1.06]});}
   u-=T.grab;
   // Three bounces, each deeper.
   const k=u/T.bounce,bounce=(1-Math.cos(2*Math.PI*3*k))/2,blindY=-g.lift+depth*(.35+.65*k)*bounce;
   const n=Math.min(2,Math.floor(k*3)),down=Math.sin(2*Math.PI*3*k)>0;
   return hang(g,blindY,4*Math.sin(k*Math.PI*9),{pose:down?HANG:KICK,squash:down?[1.04,.95]:[.96,1.06],say:bounce>.7?['boing','boing!','BOING!'][n]:null});
  };
  // Let go at the bottom of the deepest, third bounce.
  return {length:T.grab+T.bounce*5/6,pull,release:{vx:side*-120,vy:-1250,spin:side*700,say:'whooaa!'}};
 },

 // His first pull is not enough: the blind springs back and yanks him up. He
 // kicks, pulls again harder, and it gives.
 twoTugs(g,random){
  const side=random()<.5?-1:1,T={tug:520,snap:420,settle:200,tug2:620};
  const pull=u=>{
   if(u<T.tug){const k=u/T.tug;return hang(g,-g.lift+(g.lift-g.floor)*.8*easeInOut(k),5*Math.sin(k*Math.PI*2),{squash:[1.03,.97]});}
   u-=T.tug;
   if(u<T.snap){
    const k=u/T.snap,top=-g.lift-50,start=-g.lift+(g.lift-g.floor)*.8;
    const blindY=lerp(start,top,easeOut(k*1.6))+(k>.6?(k-.6)/.4*50:0);
    return hang(g,blindY,18*Math.sin(k*Math.PI*4)*(1-k*.4),{pose:Math.floor(u/90)%2?KICK:HANG,say:'whoa!'});
   }
   u-=T.snap;
   if(u<T.settle)return hang(g,-g.lift,3*Math.sin(u/T.settle*Math.PI*2));
   u-=T.settle;
   const k=u/T.tug2,kick=Math.floor(u/140)%2;
   return hang(g,-g.lift+(g.lift-g.floor+24)*easeInOut(k),7*Math.sin(k*Math.PI*5),{pose:kick?KICK:HANG,squash:kick?[.97,1.05]:[1.03,.96],say:k>.35?'hnnng!':null});
  };
  return {length:T.tug+T.snap+T.settle+T.tug2,pull,release:{vx:side*-150,vy:-950,spin:side*380,say:'got it!'}};
 },
};

export function planSwing(name,view,random=Math.random){
 const g=geometry(view),build=PULLS[name]||PULLS.runningLeap,p=build(g,random);
 const sample=t=>t<APPROACH_MS?approach(g,t):p.pull(t-APPROACH_MS);
 return {name:PULLS[name]?name:'runningLeap',releaseAt:APPROACH_MS+p.length,sample,release:p.release};
}
