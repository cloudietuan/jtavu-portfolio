import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectList} from '../src/projects.js';

// SnoopyGuide.jsx contains JSX; evaluate only its pure helpers.
const src=fs.readFileSync(new URL('../src/SnoopyGuide.jsx',import.meta.url),'utf8');
const body=src.slice(src.indexOf('const TOPICS'),src.indexOf('export function SnoopyGuide'));
const projectsUrl=new URL('../src/projects.js',import.meta.url).href;
const {guideContent,guidePlacement,topicProjects}=await import('data:text/javascript,'+encodeURIComponent(`import {projectList,projects} from '${projectsUrl}';\n${body}`));

test('every project gets a quick take built only from its own data',()=>{
 for(const p of projectList){
  const c=guideContent({type:'project',id:p.id});
  assert.equal(c.title,p.title);assert.equal(c.status,p.status);assert.equal(c.url,p.url);
  assert.deepEqual(c.facts[0],['What it is',p.description]);
  assert.deepEqual(c.facts[1],['John’s part',p.contribution]);
  assert.ok(c.facts.length<=3);
  assert.doesNotMatch(c.kicker,/\d/);
 }
 assert.equal(guideContent({type:'project',id:'oncosync'}).facts[2][0],'Where it stands');
 assert.equal(guideContent({type:'project',id:'nope'}),null);
 assert.equal(guideContent(null),null);
});

test('topics count and list the right projects',()=>{
 for(const topic of ['All','Websites','Design','Research']){
  const c=guideContent({type:'topic',id:topic}),expected=topic==='All'?projectList:projectList.filter(p=>p.tags.includes(topic));
  assert.deepEqual(c.projects.map(p=>p.id),expected.map(p=>p.id));
  assert.ok(c.line.startsWith(String(expected.length)));
 }
 assert.equal(topicProjects('All').length,6);
});

test('the card stays on screen beside Snoopy, or becomes a bottom sheet on phones',()=>{
 const card={width:340,height:300},view={width:1280,height:800,top:64};
 for(const [left,top] of [[20,100],[1150,700],[600,70],[640,400]]){
  const s={left,top,right:left+96,width:96,height:96},p=guidePlacement(s,card,view);
  assert.ok(p.left>=12&&p.left+card.width<=view.width-12);
  assert.ok(p.top>=view.top+12&&p.top+card.height<=view.height-12);
  // It never sits on top of him.
  assert.ok(p.left>=s.right||p.left+card.width<=s.left);
 }
 const phone=guidePlacement({left:100,top:300,right:180,width:80,height:80},{width:366,height:320},{width:390,height:844,top:100});
 assert.equal(phone.sheet,true);assert.equal(phone.top+320,844-12);
 assert.equal(guidePlacement(null,card,view).sheet,true);
});
