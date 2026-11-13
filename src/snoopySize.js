// Snoopy's box size on the site matches his box on the doghouse landing
// screen, which is 0.409 of the JTAVU wordmark's font size there
// (clamp(105px, 25.3vw, 420px), or 28.2vw on screens up to 600px).
// Phones keep a floor so he stays big enough to see and tap.
export const PHONE_FLOOR=64;
export function snoopySize(width){
 const font=width<=600?width*.282:Math.max(105,Math.min(width*.253,420));
 return Math.round(Math.max(PHONE_FLOOR,font*.409));
}
