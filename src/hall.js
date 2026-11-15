// The Hall of Fame: John's real posters, papers and awards, copied from his old
// jtavu.com into public/assets/hall. Labels say what each image actually shows.
// activity: the slug of the activity page that shows it as proof (or null).
const img=id=>({src:`/assets/hall/${id}.jpg`,sm:`/assets/hall/${id}-sm.jpg`});

export const HALL_KINDS=['All','Posters','Awards'];

export const hall=[
 {id:'poster-solar-tracker',...img('poster-solar-tracker'),kind:'Posters',title:'Dual Axis Solar Tracker',meta:'Science fair poster · AZSEF 1st place, then ISEF',activity:'regeneron-isef',w:1600,h:1467},
 {id:'poster-piezo-keyboard',...img('poster-piezo-keyboard'),kind:'Posters',title:'Sustainable EnerKey',meta:'Science fair poster · AZSEF 2nd place',activity:'arizona-science-and-engineering-fair',w:1600,h:1200},
 {id:'poster-solar-car',...img('poster-solar-car'),kind:'Posters',title:'Autonomous Eco-Drive',meta:'Science fair poster · AZSEF 3rd place',activity:'arizona-science-and-engineering-fair',w:1600,h:1467},
 {id:'ap-research-proposal',...img('ap-research-proposal'),kind:'Posters',title:'AP Research inquiry proposal',meta:'Maryvale health center capstone',activity:'ap-research-capstone',w:1236,h:1600},
 {id:'sunset-nails-top5',...img('sunset-nails-top5'),kind:'Awards',title:'BusinessRate Top 5, 2026',meta:'Sunset Nails · Mesa, AZ',activity:'sunset-nails',w:1061,h:1366},
 {id:'hinksey-certificate',...img('hinksey-certificate'),kind:'Awards',title:'Hinksey Labs certificate',meta:'4-week research program · April 2026',activity:'hinksey-labs',w:1600,h:1081},
 {id:'nhs-2026',...img('nhs-2026'),kind:'Awards',title:'National Honor Society',meta:'Gilbert Classical Academy · senior year',activity:null,w:1233,h:1600},
 {id:'most-improved-musician',...img('most-improved-musician'),kind:'Awards',title:'Most Improved Musician',meta:'Advanced Vocal Ensemble · 2024',activity:'advanced-vocal-ensemble',w:1600,h:1317},
 {id:'volleyball-peer-award',...img('volleyball-peer-award'),kind:'Awards',title:'Volleyball peer award',meta:'“Most likely to start a fish fight club” · 2026',activity:'volleyball',w:1600,h:1244},
 {id:'varsity-volleyball-2026',...img('varsity-volleyball-2026'),kind:'Awards',title:'Varsity boys’ volleyball',meta:'GCA · spring 2026',activity:'volleyball',w:1205,h:1600},
 {id:'most-likely-business',...img('most-likely-business'),kind:'Awards',title:'Most likely to own their own business',meta:'Class of 2026 superlative',activity:null,w:1600,h:1215},
 {id:'kroger-zero-hero-2026',...img('kroger-zero-hero-2026'),kind:'Awards',title:'Kroger Zero Hero',meta:'20+ hours of service · 2025 to 2026',activity:null,w:1056,h:816},
 {id:'kroger-zero-hero-2024',...img('kroger-zero-hero-2024'),kind:'Awards',title:'Kroger Zero Hero',meta:'8+ hours of service · 2023 to 2024',activity:null,w:1056,h:816},
];

export const hallFor=slug=>hall.filter(h=>h.activity===slug);
