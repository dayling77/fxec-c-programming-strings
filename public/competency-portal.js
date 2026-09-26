import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';

const fxecApp=getApps().length?getApp():initializeApp(window.FXEC_FIREBASE_CONFIG);
const functions=getFunctions(fxecApp,'us-central1');
const call=name=>httpsCallable(functions,name);

const PROGRAMMES=[
 {id:'cse',title:'B.E. Computer Science & Engineering'},
 {id:'ai-ds',title:'B.Tech Artificial Intelligence & Data Science'},
 {id:'ece',title:'B.E. Electronics & Communication Engineering'},
 {id:'eee',title:'B.E. Electrical & Electronics Engineering'},
 {id:'mechanical',title:'B.E. Mechanical Engineering'},
 {id:'civil',title:'B.E. Civil Engineering'}
];

const C_PROGRAMMING=[
 'C Fundamentals','Control Flow','Arrays','Functions & Modular Programming','Pointers',
 'Structures, Unions & User-Defined Types','Dynamic Memory & Memory Management','File Handling','Strings','Advanced C'
];

const TRACKS=[
 {id:'communication',title:'Communication',icon:'💬',description:'Build accurate, confident and professional communication skills.',modules:['Grammar & Usage','Vocabulary & Word Usage','Reading Comprehension','Listening Skills','Speaking Skills','Professional Communication','Presentation Skills','Group Discussion','Workplace Writing','Integrated Communication']},
 {id:'aptitude',title:'Aptitude',icon:'🧮',description:'Develop quantitative, logical and data-driven problem-solving ability.',modules:['Number Systems & Arithmetic','Percentages, Ratios & Averages','Profit, Loss & Interest','Time, Work & Speed','Algebra & Equations','Logical Reasoning','Data Interpretation','Numerical Reasoning','Verbal Reasoning','Integrated Aptitude']},
 {id:'core-engineering',title:'Core Engineering',icon:'⚙️',description:'Choose your engineering programme and build programme-specific core competency.',modules:['Engineering Fundamentals','Measurements & Units','Engineering Materials','Basic Systems & Components','Diagrams & Schematics','Tools & Instrumentation','Digital / Computational Thinking','Engineering Analysis','Engineering Decisions','Integrated Programme Challenge'],programmeWise:true},
 {id:'c-programming',title:'C Programming',icon:'💻',description:'Progress from C fundamentals to structured programming, memory and advanced problem solving.',modules:C_PROGRAMMING},
 {id:'problem-solving',title:'Problem Solving',icon:'🧩',description:'Learn to decompose unfamiliar problems and develop systematic solutions.',modules:['Problem Definition','Decomposition','Pattern Recognition','Abstraction','Algorithm Design','Pseudocode','Data & State Thinking','Debugging','Complexity & Optimisation','Integrated Problem Challenge']},
 {id:'analytical',title:'Analytical Skills',icon:'🎧',description:'Read, listen, interpret evidence and make reasoned analytical decisions.',modules:['Information Extraction','Reading for Meaning','Listening for Meaning','Inference','Data Interpretation','Evidence & Claims','Comparison & Classification','Critical Reasoning','Decision Analysis','Integrated Analytical Challenge']}
];

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function progressMap(data){return data?.tracks||{};}

function renderPortal(root){
 root.innerHTML='<div class="competencyPortal">'+
  '<div class="competencyHero"><div><span class="sectionEyebrow">FXEC · FIRST-YEAR ENGINEERING</span><h2>Competency Learning Centre</h2><p>One complete learning system across six competencies. Each module follows the proven FXEC learning flow: <b>Concept → Example → Practise → Challenge → Assess → XP</b>.</p></div>'+
  '<div class="competencyHeroStats"><div><strong>6</strong><span>Competencies</span></div><div><strong>60</strong><span>Assessments</span></div><div><strong>10</strong><span>Modules / Track</span></div></div></div>'+
  '<div class="competencyFlowLarge"><span>CONCEPT</span><i>→</i><span>EXAMPLE</span><i>→</i><span>PRACTISE</span><i>→</i><span>KNOWLEDGE CHECK</span><i>→</i><span>CHALLENGE</span><i>→</i><span>ASSESS</span></div>'+
  '<div class="competencyTrackGrid" id="competencyTrackGrid"></div><div id="competencyWorkspace"></div></div>';
 const grid=root.querySelector('#competencyTrackGrid');
 grid.innerHTML=TRACKS.map((t,i)=>'<article class="competencyTrackCard" data-track="'+esc(t.id)+'"><div class="competencyTrackIcon">'+t.icon+'</div><div class="competencyTrackNo">0'+(i+1)+'</div><h3>'+esc(t.title)+'</h3><p>'+esc(t.description)+'</p><div class="competencyTrackMeta"><span>10 modules</span><span>10 assessments</span></div><div class="trackProgress"><span data-p="'+esc(t.id)+'" style="width:0%"></span></div><small data-pl="'+esc(t.id)+'">Loading progress…</small></article>').join('');
 grid.querySelectorAll('[data-track]').forEach(card=>card.onclick=()=>openTrack(root,card.dataset.track));
 loadProgress(root);
}

async function loadProgress(root){
 try{
  const r=await call('getCompetencyProgress')({}),tracks=progressMap(r.data);
  TRACKS.forEach(t=>{
   const p=Math.max(0,Math.min(100,Number(tracks[t.id]?.progress||0)));
   const fill=root.querySelector('[data-p="'+t.id+'"]'); if(fill)fill.style.width=p+'%';
   const label=root.querySelector('[data-pl="'+t.id+'"]'); if(label)label.textContent=p+'% progress · '+Number(tracks[t.id]?.xp||0)+' XP';
  });
 }catch(e){root.querySelectorAll('[data-pl]').forEach(x=>x.textContent='Progress will appear after you begin');}
}

function openTrack(root,trackId){
 const track=TRACKS.find(x=>x.id===trackId); if(!track)return;
 const ws=root.querySelector('#competencyWorkspace');
 ws.innerHTML='<section class="competencyWorkspace"><div class="workspaceHeader"><div><span class="sectionEyebrow">COMPETENCY PROGRAMME</span><h3>'+esc(track.title)+'</h3><p>'+esc(track.description)+'</p></div><button class="secondary" id="closeTrack">← All Competencies</button></div>'+
  (track.programmeWise?programmeChooser():'')+
  '<div id="moduleArea">'+(track.programmeWise?'<div class="moduleLocked">Select your programme above to open your department-specific Core Engineering modules.</div>':moduleGrid(track,null))+'</div></section>';
 ws.querySelector('#closeTrack').onclick=()=>{ws.innerHTML='';root.querySelector('#competencyTrackGrid')?.scrollIntoView({behavior:'smooth',block:'start'});};
 if(track.programmeWise){
  ws.querySelector('#programmeSelect').onchange=e=>{
   const value=e.target.value;
   ws.querySelector('#moduleArea').innerHTML=value?moduleGrid(track,PROGRAMMES.find(p=>p.id===value)):'<div class="moduleLocked">Select your programme above to open your department-specific Core Engineering modules.</div>';
  };
 }
 ws.scrollIntoView({behavior:'smooth',block:'start'});
}

function programmeChooser(){
 return '<div class="programmeChooser"><div><span class="sectionEyebrow">CORE ENGINEERING</span><h4>Choose Your Programme</h4><p>Core Engineering content and assessments are organised by the student’s engineering programme.</p></div><select id="programmeSelect"><option value="">Select your programme</option>'+PROGRAMMES.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.title)+'</option>').join('')+'</select></div>';
}

function moduleGrid(track,programme){
 return '<div class="moduleProgrammeBanner">'+(programme?'<span>PROGRAMME</span><strong>'+esc(programme.title)+'</strong>':'<span>COMPETENCY PATHWAY</span><strong>'+esc(track.title)+'</strong>')+'</div>'+
  '<div class="moduleSectionHeading"><div><span class="sectionEyebrow">LEARNING MODULES</span><h4>Complete the modules in sequence</h4><p>Every module uses the same proven learning pattern. Assessment answers remain server-side.</p></div><span class="practiceBadge">10 ASSESSMENTS</span></div>'+
  '<div class="moduleGrid">'+track.modules.map((m,i)=>'<article class="learningModuleCard"><div class="moduleTop"><span>MODULE '+String(i+1).padStart(2,'0')+'</span><b>ASSESSMENT '+String(i+1).padStart(2,'0')+'</b></div><h5>'+esc(m)+'</h5><div class="moduleFlow"><span>Concept</span><i>→</i><span>Example</span><i>→</i><span>Practise</span><i>→</i><span>Challenge</span></div><div class="moduleBottom"><small>Learning + Practice + Assessment</small><button class="moduleOpen" data-track="'+esc(track.id)+'" data-module="'+(i+1)+'">Open Module →</button></div></article>').join('')+'</div>';
}

export {renderPortal as renderCompetencyPortal,TRACKS,PROGRAMMES};
window.FXECCompetencyPortal={renderCompetencyPortal:renderPortal,TRACKS,PROGRAMMES};
