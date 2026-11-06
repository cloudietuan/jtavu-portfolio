import {isClear,clampPoint} from './snoopySafety.js';

export function companionDock(width,height,size){
 return {x:Math.max(size/2+12,width-size/2-18),y:Math.max(size+50,height-22)};
}

// Resting companions must remain discoverable, even when no free page pocket
// exists. A dock is an intentional interface surface, not an obstacle-free perch.
export function resolvePresence({point,width,height,size,obstacles=[],docked=false,passing=false,dragging=false,performing=false}){
 if(dragging||performing)return {point,docked:false,visible:true};
 if(passing)return {point,docked:false,visible:isClear(point,obstacles,size)};
 if(docked)return {point:companionDock(width,height,size),docked:true,visible:true};
 const bounds=clampPoint(point,width,height,size);
 const onScreen=Math.abs(bounds.x-point.x)<1&&Math.abs(bounds.y-point.y)<1;
 if(onScreen&&isClear(point,obstacles,size))return {point,docked:false,visible:true};
 return {point:companionDock(width,height,size),docked:true,visible:true};
}

// A downward gesture always restores presence, including when it interrupts an
// upward portal wait. A previous return must not keep the character missing.
export function scrollDisposition(delta){return delta>1?'dock':delta < -1?'pass':'still';}
