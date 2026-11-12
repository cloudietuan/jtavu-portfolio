// How Snoopy brings the intro blind down. Each visit picks one of several
// stunts so it never plays the same way twice in a row. Pure: a plan is a
// function of time that says where the blind is, where Snoopy is, which pose
// he is in, and what he says. IntroBlind plays it; the companion catches him.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const easeOut=k=>1-Math.pow(1-clamp(k,0,1),3);
const easeInOut=k=>{k=clamp(k,0,1);return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;};
const lerp=(a,b,k)=>a+(b-a)*k;

export const SWING_VARIANTS=Object.freeze(['runningLeap','bungee','twoTugs']);

/** Any stunt except the one played last time. */
export function chooseVariant(last,random=Math.random){
 const pool=SWING_VARIANTS.filter(v=>v!==last);
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}

function geometry({width,height,size}){
 const lift=Math.min(300,height*.4);
 return {width,height,size,lift,floor:Math.min(150,lift*.5),cx:width/2,ground:height-6,hands:blindY=>height+blindY-4};
}

const HANG={kind:'action',action:'swing'},KICK={kind:'action',action:'ladder'},CROUCH={kind:'action',action:'portal'};
const hidden=blindY=>({blindY,visible:false});
function hang(g,blindY,rot,{pose=HANG,squash=[1,1],say=null,facing=1}={}){
 return {blindY,visible:true,anchor:'hands',x:g.cx,y:g.hands(blindY),rot,pose,squash,say,facing,tabRot:clamp(rot*.6,-18,18)};
}
function liftPhase(g,t,ms){return -g.lift*easeOut(t/ms);}
/** A leap from a point to the tab, arriving with hands on it. */
function leap(g,from,k,{arc=90,rot=0}={}){
 const end={x:g.cx,y:g.hands(-g.lift)},e=easeOut(k);
 return {blindY:-g.lift,visible:true,anchor:'hands',x:lerp(from.x,end.x,e),y:lerp(from.y,end.y,e)-arc*4*k*(1-k),rot:rot*(1-k),pose:HANG,squash:[1-.06*Math.sin(k*Math.PI),1+.08*Math.sin(k*Math.PI)],facing:from.x<end.x?1:-1,tabRot:0};
}

const BUILDERS={
 // Runs in along the strip of website below the blind, crouches, leaps for the
 // tab, then pumps his legs to swing higher before letting go at the top.
 runningLeap(g,random){
  const side=random()<.5?-1:1,facing=side<0?1:-1,flip=random()<.5;
  const T={lift:420,run:640,crouch:150,leap:300};
  const omega=Math.PI*2/950,base=T.lift+T.run+T.crouch+T.leap;
  // Let go exactly at the peak of a swing.
  const swings=3+Math.floor(random()*2),swing=(Math.PI/2+swings*Math.PI)/omega;
  const fromX=side<0?-g.size*.7:g.width+g.size*.7,stopX=g.cx+side*g.size*1.5,lean=side<0?1:-1;
  const sample=t=>{
   if(t<T.lift)return hidden(liftPhase(g,t,T.lift));
   let u=t-T.lift;
   if(u<T.run){
    const k=u/T.run,x=lerp(fromX,stopX,1-Math.pow(1-k,1.6)),dist=Math.abs(x-fromX);
    return {blindY:-g.lift,visible:true,anchor:'feet',x,y:g.ground,rot:-4*facing,pose:{kind:'walk',frame:Math.floor(dist/13)%8},squash:[1,1],facing,tabRot:0};
   }
   u-=T.run;
   if(u<T.crouch){const k=Math.sin(u/T.crouch*Math.PI/2);return {blindY:-g.lift,visible:true,anchor:'feet',x:stopX,y:g.ground,rot:0,pose:CROUCH,squash:[1+.1*k,1-.16*k],facing,tabRot:0};}
   u-=T.crouch;
   if(u<T.leap){const p=leap(g,{x:stopX,y:g.ground-g.size*.93},u/T.leap,{arc:70,rot:-20*lean});return {...p,facing,say:u>T.leap*.8?'hup!':null};}
   u-=T.leap;
   const k=u/swing,amp=lerp(10,30,easeOut(k*1.4)),theta=amp*Math.sin(omega*u)*lean;
   // The cord is tightest at the bottom of each swing, tugging the blind down.
   const tension=(1-Math.cos(2*omega*u))/2,blindY=-g.lift+(g.lift-g.floor)*easeInOut(k)+9*tension*(1-.5*k);
   const pumping=Math.cos(omega*u)*lean>0;
   return hang(g,blindY,theta,{pose:pumping&&k>.15?KICK:HANG,facing,say:k>.45&&k<.7?'hnng!':null});
  };
  const releaseAt=base+swing,last=sample(releaseAt-1),dir=Math.sign(last.rot)||1;
  return {name:'runningLeap',releaseAt,sample,release:{vx:dir*-260,vy:-900,spin:dir*-(flip?620:240),say:flip?'ta-da!':'wheee!'}};
 },

 // Grabs on and bounces like a bungee, each bounce deeper, until the blind
 // recoils and flings him high.
 bungee(g,random){
  const side=random()<.5?-1:1,T={lift:420,leap:360,grab:180,bounce:1500};
  const from={x:g.cx+side*Math.min(140,g.width*.18),y:g.height+g.size*1.1};
  const depth=g.lift-g.floor+30;
  const sample=t=>{
   if(t<T.lift)return hidden(liftPhase(g,t,T.lift));
   let u=t-T.lift;
   if(u<T.leap)return leap(g,from,u/T.leap,{arc:60,rot:-14*side});
   u-=T.leap;
   if(u<T.grab){const k=u/T.grab;return hang(g,-g.lift+10*Math.sin(k*Math.PI),6*Math.sin(k*Math.PI*2),{squash:[.96,1.06],say:'hup!'});}
   u-=T.grab;
   // Three bounces, each deeper: zero at k=0,1/3,2/3,1 and deepest between.
   const k=u/T.bounce,bounce=(1-Math.cos(2*Math.PI*3*k))/2,blindY=-g.lift+depth*(.35+.65*k)*bounce;
   const n=Math.min(2,Math.floor(k*3)),down=Math.sin(2*Math.PI*3*k)>0;
   const words=['boing','boing!','BOING!'];
   return hang(g,blindY,4*Math.sin(k*Math.PI*9),{pose:down?HANG:KICK,squash:down?[1.04,.95]:[.96,1.06],say:bounce>.7?words[n]:null});
  };
  // Let go at the bottom of the deepest, third bounce.
  const releaseAt=T.lift+T.leap+T.grab+T.bounce*5/6;
  return {name:'bungee',releaseAt,sample,release:{vx:side*-120,vy:-1250,spin:side*700,say:'whooaa!'}};
 },

 // His first pull is not enough: the blind springs back and yanks him up. He
 // kicks, pulls again harder, and it gives.
 twoTugs(g,random){
  const side=random()<.5?-1:1,T={lift:420,leap:340,tug:520,snap:420,settle:200,tug2:620};
  const from={x:g.cx+side*Math.min(160,g.width*.2),y:g.height+g.size*1.1};
  const sample=t=>{
   if(t<T.lift)return hidden(liftPhase(g,t,T.lift));
   let u=t-T.lift;
   if(u<T.leap)return leap(g,from,u/T.leap,{arc:80,rot:-18*side});
   u-=T.leap;
   if(u<T.tug){const k=u/T.tug;return hang(g,-g.lift+(g.lift-g.floor)*.8*easeInOut(k),5*Math.sin(k*Math.PI*2),{say:k<.4?'hup!':null,squash:[1.03,.97]});}
   u-=T.tug;
   if(u<T.snap){
    // The blind wins: it springs back past where it started, carrying him up.
    const k=u/T.snap,top=-g.lift-50,start=-g.lift+(g.lift-g.floor)*.8;
    const blindY=lerp(start,top,easeOut(k*1.6))+(k>.6?(k-.6)/.4*50:0);
    const flail=Math.floor(u/90)%2;
    return hang(g,blindY,18*Math.sin(k*Math.PI*4)*(1-k*.4),{pose:flail?KICK:HANG,say:'whoa!'});
   }
   u-=T.snap;
   if(u<T.settle)return hang(g,-g.lift,3*Math.sin(u/T.settle*Math.PI*2),{});
   u-=T.settle;
   const k=u/T.tug2,kick=Math.floor(u/140)%2;
   return hang(g,-g.lift+(g.lift-g.floor+24)*easeInOut(k),7*Math.sin(k*Math.PI*5),{pose:kick?KICK:HANG,squash:kick?[.97,1.05]:[1.03,.96],say:k>.35?'hnnng!':null});
  };
  const releaseAt=T.lift+T.leap+T.tug+T.snap+T.settle+T.tug2;
  return {name:'twoTugs',releaseAt,sample,release:{vx:side*-150,vy:-950,spin:side*380,say:'got it!'}};
 },
};

export function planSwing(name,view,random=Math.random){
 const build=BUILDERS[name]||BUILDERS.runningLeap;
 return build(geometry(view),random);
}
