// Joint motion is independent of page position: the feet never follow the head.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function bowJoints(progress){
 const t=Math.max(0,Math.min(1,progress));
 const dip=smooth((t-.16)/.30)*(1-smooth((t-.72)/.28));
 const flourish=smooth(t/.22)*(1-smooth((t-.68)/.32));
 return {waist:dip*28,head:dip*12,arm:flourish,blend:smooth(t/.12)*(1-smooth((t-.88)/.12))};
}

export function drawBow(ctx,texture,f,progress){
 const pose=bowJoints(progress),r=Math.PI/180;
 const crop=(x,y,w,h)=>ctx.drawImage(texture,f.x+x,f.y+y,w,h,x,y,w,h);
 // Crossfade only at the seam between the original cel and the jointed pose.
 ctx.globalAlpha=1-pose.blend;crop(0,0,f.w,f.h);ctx.globalAlpha=pose.blend;
 ctx.lineWidth=10;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#171512';ctx.fillStyle='#fff9e9';
 // Original feet/legs and tail remain planted, with the original pixel texture.
 crop(0,317,f.w,f.h-317);crop(0,278,104,44);
 ctx.save();ctx.translate(148,322);ctx.rotate(pose.waist*r);ctx.translate(-148,-322);
 // Far paw rests behind the back as a stage performer bows.
 ctx.beginPath();ctx.moveTo(136,242);ctx.quadraticCurveTo(83,246,80,285);ctx.quadraticCurveTo(83,302,106,294);ctx.lineTo(136,274);ctx.fill();ctx.stroke();
 // The torso bridges the fixed hips to the rotating collar.
 ctx.beginPath();ctx.moveTo(132,218);ctx.quadraticCurveTo(96,244,94,286);ctx.quadraticCurveTo(96,309,115,326);ctx.lineTo(184,326);ctx.quadraticCurveTo(203,291,184,252);ctx.lineTo(172,220);ctx.closePath();ctx.fill();ctx.stroke();
 // Face and ears use the original cel; the neck has its own nod.
 ctx.save();ctx.translate(158,219);ctx.rotate(pose.head*r);ctx.translate(-158,-219);crop(0,0,f.w,225);ctx.restore();
 // A bent elbow opens into an outward/downward presenting paw.
 const a=pose.arm;
 ctx.beginPath();ctx.moveTo(168,245);ctx.bezierCurveTo(184,260,186+17*a,274+14*a,202+23*a,282+10*a);
 ctx.bezierCurveTo(216+32*a,286+12*a,231+27*a,280+17*a,231+23*a,266+18*a);
 ctx.bezierCurveTo(229+22*a,252+19*a,211+20*a,254+14*a,205+8*a,252+5*a);
 ctx.lineTo(185,234);ctx.fill();ctx.stroke();
 // Finger creases make the open hand read at companion size.
 ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(220+23*a,266+18*a);ctx.lineTo(219+23*a,276+16*a);ctx.moveTo(210+23*a,268+16*a);ctx.lineTo(211+23*a,279+13*a);ctx.stroke();
 ctx.restore();ctx.globalAlpha=1;
}
