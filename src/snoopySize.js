// Snoopy's box size on the site. It starts from his box on the doghouse
// landing screen, 0.409 of the JTAVU wordmark's font size there
// (clamp(105px, 25.3vw, 420px), or 28.2vw on screens up to 600px).
// Laptops and desktops (wider than 700px) use 70% of that, because the user
// found him too big on a laptop (15 November). Phones keep the full size and
// a floor so he stays big enough to see and tap.
export const PHONE_FLOOR=64;
export const LAPTOP_SCALE=.7;
export function snoopySize(width){
 const font=width<=600?width*.282:Math.max(105,Math.min(width*.253,420));
 const full=font*.409;
 return Math.round(Math.max(PHONE_FLOOR,width>700?full*LAPTOP_SCALE:full));
}
