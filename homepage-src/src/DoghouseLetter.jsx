
// Two-unit steps keep the house silhouette closer to the character's pixels.
function roofPolygon(peakY, baseY, halfWidth) {
  const steps = Math.round(halfWidth / 2);
  let left = `M50 ${peakY}`, right = `M50 ${peakY}`;
  for (let i = 1; i <= steps; i++) {
    const y = Math.round((peakY+(baseY-peakY)*i/steps)/2)*2;
    left += `H${50-i*2}V${y}`;
    right += `H${50+i*2}V${y}`;
  }
  // Two filled halves avoid diagonal antialiasing while preserving the A shape.
  return `${left}H50Z ${right}H50Z`;
}


const matLetters = {
 W:['101','101','111','111','101'], E:['111','100','110','100','111'],
 L:['100','100','100','100','111'], C:['111','100','100','100','111'],
 O:['111','101','101','101','111'], M:['101','111','111','101','101'],
};
function MatLettering() {
  const word = 'WELCOME';
  return <g fill="#674d2f" aria-hidden="true">{[...word].flatMap((letter,index)=>
    matLetters[letter].flatMap((row,y)=>[...row].flatMap((pixel,x)=>{
      if(pixel!=='1') return [];
      const spread = 1 + y * .035;
      return <rect key={`${index}-${y}-${x}`} x={50 + ((index*4+x)-13.5)*1.6*spread} y={106+y*1.2} width={1.6*spread} height={1.2}/>;
    }))
  )}</g>;
}

// Snoopy is drawn by the one shared sprite in front of the house (App), so he
// looks identical asleep, waking and standing.
export function DoghouseLetter() {
  return <svg className="doghouse-letter" viewBox="0 0 100 108" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges">
    <path fill="var(--ink,#0b0b0b)" d={roofPolygon(0,70,50)}/>
    <path fill="var(--ink,#0b0b0b)" d="M18 62h64v46H18Z"/>
    <path fill="#343434" d={roofPolygon(6,66,42)}/>
    <path fill="var(--ink,#0b0b0b)" d={roofPolygon(10,66,38)}/>
    <path fill="var(--house,#c93d32)" d={roofPolygon(18,58,28)}/>
    <path fill="#343434" d="M20 62h60v42H20Z"/>
    <path fill="var(--house,#c93d32)" d="M22 56h56v46H22Z"/>
    <path fill="#982a24" d="M22 62h56v2H22Zm0 12h56v2H22Zm0 12h56v2H22Zm0 12h56v2H22ZM76 56h2v46h-2Z"/>
    <path fill="#982a24" d="M46 36h8v8h-8Z"/>
    <path fill="var(--ink,#0b0b0b)" d="M32 46h36v2h2v10h-2v2H32v-2h-2V48h2Z"/>
    <rect x="32" y="48" width="36" height="10" fill="#eee9dd"/>
    <text x="50" y="55" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fontSize="5.5" fill="#0b0b0b" shapeRendering="auto">SNOOPY</text>
    <path fill="#777" d="M34 52h2v2h-2Zm30 0h2v2h-2Z"/>
    <path fill="#343434" d="M32 102V78h2v-4h2v-4h4v-2h4v-2h12v2h4v2h4v4h2v4h2v24Z"/>
    <path fill="var(--ink,#0b0b0b)" d="M36 102V80h2v-4h2v-4h4v-2h12v2h4v4h2v4h2v22Z"/>
    <path fill="var(--ink,#0b0b0b)" d="M30 100h40v8H30Z"/>
    <path fill="#343434" d="M32 102h36v4H32Z"/>
    <path fill="#777" d="M34 102h32v2H34Z"/>
    <g aria-label="Welcome mat">
      <path fill="#30271e" d="M28 100H72v2h2v2h2v2h2v2h2v2h2v2h2v2h2v2h2v2H12v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2Z"/>
      <path fill="#d6b88b" d="M30 102H70v2h2v2h2v2h2v2h2v2h2v2h2v2H18v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2Z"/>
      <path fill="#bf9c70" d="M32 104h36v1H32ZM22 114h56v1H22Z"/>
      <MatLettering/>
    </g>
  </svg>;
}
