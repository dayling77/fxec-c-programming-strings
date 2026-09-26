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

const C_MODULES=[
 {id:1,title:'C Fundamentals',scope:'Build a strong foundation in C so that a beginner can read, write, compile, trace and explain simple programs confidently.',
  topics:['Programming mindset and problem statements','C program structure','main(), statements and blocks','Variables, constants and identifiers','Data types and type conversion','Operators and expressions','Input and output with printf/scanf','Compilation, errors and debugging basics'],
  materials:['Concept notes: From problem to C program','Syntax map: data types, variables and operators','Worked examples with line-by-line explanation','Common beginner mistakes and correction guide'],
  drills:['Identify valid/invalid identifiers','Predict the type and value of an expression','Trace variable values after each statement','Write printf/scanf statements','Convert simple algorithms into C statements'],
  practice:['Level 1 — guided fill-in-the-code drills','Level 2 — write small programs from examples','Level 3 — trace-and-predict output','Level 4 — mixed foundation drill','Level 5 — timed mini challenge'],
  challenge:'Create a small menu-driven calculator using variables, input, operators and formatted output.',
  assessment:'20-question mastery check: concepts, syntax, output prediction, debugging and short code construction.'},
 {id:2,title:'Control Flow',scope:'Learn to make programs take decisions, repeat actions and combine conditions without losing track of program flow.',
  topics:['Relational and logical operators','if, if-else and nested decisions','else-if ladders','switch-case','for, while and do-while loops','break and continue','Nested loops','Tracing control flow'],
  materials:['Decision-making flowchart guide','Loop dry-run worksheet','Worked examples: grading, menus and counters','Debugging guide for infinite and off-by-one loops'],
  drills:['Choose the correct condition','Trace if-else branches','Predict loop output','Find loop boundary errors','Convert repeated code into a loop'],
  practice:['Level 1 — condition drills','Level 2 — loop tracing','Level 3 — pattern/output drills','Level 4 — nested-loop practice','Level 5 — timed control-flow challenge'],
  challenge:'Build a number analysis program that reports factors, prime status, digit count and digit sum using decisions and loops.',
  assessment:'20-question mastery check covering decisions, loops, tracing, debugging and nested control flow.'},
 {id:3,title:'Arrays',scope:'Move from one value at a time to organised collections of data and learn to process them systematically.',
  topics:['Array declaration and indexing','Initialisation and traversal','Input/output with arrays','Sum, average, minimum and maximum','Searching','Sorting basics','Frequency counting','Two-dimensional arrays and matrices'],
  materials:['Array memory/index visual guide','Traversal patterns','Worked programs for search and statistics','Matrix operation examples'],
  drills:['Predict array element values','Find index errors','Trace traversal loops','Write sum/min/max logic','Count frequencies'],
  practice:['Level 1 — indexing drills','Level 2 — traversal drills','Level 3 — search and statistics','Level 4 — sorting and frequency problems','Level 5 — mixed timed array drill'],
  challenge:'Build a student marks analyser that calculates total, average, highest/lowest mark, grade counts and rank order.',
  assessment:'20-question mastery check on indexing, traversal, search, sorting, frequency and matrix reasoning.'},
 {id:4,title:'Functions & Modular Programming',scope:'Learn to break a program into small reusable functions and reason about parameters, return values and scope.',
  topics:['Why functions matter','Function declaration and definition','Parameters and arguments','Return values','void functions','Local and global scope','Function prototypes','Call flow and modular design'],
  materials:['Function anatomy reference','Parameter/return-value diagrams','Worked examples: calculator and statistics','Modular-program design checklist'],
  drills:['Match parameters with arguments','Predict returned values','Trace nested function calls','Identify scope errors','Complete missing function bodies'],
  practice:['Level 1 — function syntax drills','Level 2 — call-and-return tracing','Level 3 — decomposition exercises','Level 4 — multi-function programs','Level 5 — timed modular coding drill'],
  challenge:'Refactor a single long program into reusable functions for input, calculation, validation and reporting.',
  assessment:'20-question mastery check on declarations, calls, parameters, return values, scope and modular design.'},
 {id:5,title:'Pointers',scope:'Develop a safe mental model of addresses, pointers, dereferencing and how functions can work with memory.',
  topics:['Address and memory concepts','Pointer declaration and initialisation','& and * operators','Dereferencing','Pointers and functions','Call by value versus modifying through pointers','Pointer arithmetic basics','Pointers with arrays'],
  materials:['Memory-box visual walkthrough','Address/dereference tracing sheets','Worked swap and update examples','Pointer safety checklist'],
  drills:['Match variables to addresses','Predict *p values','Trace pointer updates','Find uninitialised pointer mistakes','Trace pointer-array relationships'],
  practice:['Level 1 — address/dereference drills','Level 2 — pointer tracing','Level 3 — swap and update exercises','Level 4 — arrays and pointers','Level 5 — pointer debugging challenge'],
  challenge:'Write reusable functions to swap values, update statistics and process an array using pointers.',
  assessment:'20-question mastery check on addresses, dereferencing, functions, arrays and pointer tracing.'},
 {id:6,title:'Structures, Unions & User-Defined Types',scope:'Represent real-world records cleanly and choose suitable user-defined data structures.',
  topics:['Structure declaration and objects','Members and member access','Arrays of structures','Nested structures','typedef','Passing structures to functions','Union basics','Choosing structure versus union'],
  materials:['Record-modelling guide','Structure memory illustrations','Worked student/employee record examples','typedef and union comparison sheet'],
  drills:['Select suitable fields','Trace member access','Complete structure declarations','Process arrays of records','Identify structure/union misuse'],
  practice:['Level 1 — declaration drills','Level 2 — record input/output','Level 3 — arrays of structures','Level 4 — functions with structures','Level 5 — integrated record-management drill'],
  challenge:'Create a small student record system that stores, searches, updates and reports student information.',
  assessment:'20-question mastery check on structures, arrays of structures, functions, typedef and unions.'},
 {id:7,title:'Dynamic Memory & Memory Management',scope:'Understand why dynamic memory is needed and use malloc/calloc/realloc/free with disciplined ownership.',
  topics:['Stack versus heap idea','malloc and calloc','realloc','free','NULL checks','Memory leaks','Dangling pointers','Dynamic arrays and safe memory handling'],
  materials:['Heap/stack visual explanation','Allocation lifecycle checklist','Worked dynamic-array examples','Memory-leak and dangling-pointer guide'],
  drills:['Choose the correct allocation function','Trace allocated memory','Identify missing free calls','Find use-after-free mistakes','Predict realloc outcomes'],
  practice:['Level 1 — allocation vocabulary','Level 2 — pointer/heap tracing','Level 3 — dynamic array exercises','Level 4 — debugging memory problems','Level 5 — timed memory-management challenge'],
  challenge:'Create a dynamically sized marks list that grows as needed, calculates statistics and releases all allocated memory safely.',
  assessment:'20-question mastery check on allocation, resizing, NULL checks, leaks and safe release.'},
 {id:8,title:'File Handling',scope:'Store and retrieve information beyond program execution using text and binary file operations.',
  topics:['Why files are needed','FILE pointers','fopen and fclose','Read/write modes','fprintf/fscanf','fgets/fputs','fread/fwrite basics','Error checking and file safety'],
  materials:['File-mode decision chart','Text-file workflow guide','Worked read/write examples','File-error debugging checklist'],
  drills:['Choose the correct file mode','Trace file operations','Identify missing fclose/error checks','Predict text output','Convert console data to file storage'],
  practice:['Level 1 — file API recognition','Level 2 — text read/write drills','Level 3 — record storage','Level 4 — search/update file exercises','Level 5 — timed file-handling challenge'],
  challenge:'Build a simple student-record file utility that writes records, reads them back and searches by register number.',
  assessment:'20-question mastery check on file pointers, modes, text I/O, errors and safe closing.'},
 {id:9,title:'Strings',scope:'Master character arrays and string operations through careful tracing, drills and progressive coding practice.',
  topics:['Character arrays and null terminator','String input','strlen, strcpy, strcat, strcmp','Manual string traversal','Searching and counting characters','Palindrome and reverse logic','Token/word processing','Common string bugs'],
  materials:['String memory and null-terminator visual','Function reference sheet','Worked tracing examples','String debugging checklist'],
  drills:['Count characters manually','Trace null terminators','Predict library-function results','Find buffer/input mistakes','Write character-frequency logic'],
  practice:['Level 1 — character and indexing drills','Level 2 — library-function drills','Level 3 — manual string-processing drills','Level 4 — mixed string challenges','Level 5 — timed string mastery drill'],
  challenge:'Create a text analyser that counts characters, words, vowels, digits and repeated characters and reports useful statistics.',
  assessment:'20-question mastery check on representation, library functions, tracing, bugs and string algorithms.'},
 {id:10,title:'Advanced C',scope:'Integrate earlier skills into robust programs and develop the confidence to read unfamiliar C code, debug it and extend it.',
  topics:['Preprocessor and macros','const and scope review','Command-line arguments','Function pointers introduction','Bitwise operators','Enumerations and advanced user-defined types','Defensive programming','Reading and debugging unfamiliar code'],
  materials:['Advanced C quick-reference','Bitwise operation visual guide','Function-pointer concept map','Code-review and debugging checklist'],
  drills:['Predict bitwise results','Trace macros and constants','Read unfamiliar functions','Identify unsafe assumptions','Choose the correct debugging strategy'],
  practice:['Level 1 — advanced syntax recognition','Level 2 — trace unfamiliar code','Level 3 — bitwise drills','Level 4 — integrated debugging','Level 5 — timed advanced-code challenge'],
  challenge:'Analyse and improve a partially working C program: identify defects, explain them, fix them and add one useful feature.',
  assessment:'20-question cumulative mastery check combining concepts, output prediction, debugging and applied reasoning.'}
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
  '<div class="competencyHero"><div><span class="sectionEyebrow">FXEC · FIRST-YEAR ENGINEERING</span><h2>Competency Learning Centre</h2><p>One complete learning system across six competencies. Every module is designed for mastery: <b>Concept → Example → Guided Drill → Practice → Knowledge Check → Challenge → Assess → XP</b>.</p></div>'+
  '<div class="competencyHeroStats"><div><strong>6</strong><span>Competencies</span></div><div><strong>60</strong><span>Learning Modules</span></div><div><strong>60</strong><span>Module Assessments</span></div></div></div>'+
  '<div class="competencyFlowLarge"><span>CONCEPT</span><i>→</i><span>EXAMPLE</span><i>→</i><span>GUIDED DRILL</span><i>→</i><span>PRACTISE</span><i>→</i><span>CHECK</span><i>→</i><span>CHALLENGE</span><i>→</i><span>ASSESS</span></div>'+
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
  '<div class="moduleSectionHeading"><div><span class="sectionEyebrow">LEARNING MODULES</span><h4>Complete the modules in sequence</h4><p>Slow, steady mastery is built into every module. Learn the idea, see it work, drill it repeatedly, then apply it.</p></div><span class="practiceBadge">'+track.modules.length+' ASSESSMENTS</span></div>'+
  '<div class="moduleGrid">'+track.modules.map((m,i)=>'<article class="learningModuleCard"><div class="moduleTop"><span>MODULE '+String(i+1).padStart(2,'0')+'</span><b>ASSESSMENT '+String(i+1).padStart(2,'0')+'</b></div><h5>'+esc(m)+'</h5><div class="moduleFlow"><span>Concept</span><i>→</i><span>Example</span><i>→</i><span>Guided Drill</span><i>→</i><span>Practise</span><i>→</i><span>Challenge</span></div><div class="moduleBottom"><small>Scope + Study Material + Drills + Practice + Assessment</small><button class="moduleOpen" data-track="'+esc(track.id)+'" data-module="'+(i+1)+'">Open Module →</button></div></article>').join('')+'</div>';
}

function openModule(root,trackId,moduleNo,programme){
 const track=TRACKS.find(x=>x.id===trackId); if(!track)return;
 const title=track.modules[moduleNo-1]||'Module';
 const data=trackId==='c-programming'?C_MODULES[moduleNo-1]:genericModule(title,track.title,moduleNo);
 const ws=root.querySelector('#competencyWorkspace');
 ws.innerHTML=moduleView(track,data,moduleNo,programme);
 ws.querySelector('#backToModules').onclick=()=>openTrack(root,trackId);
 ws.querySelector('#startAssessment').onclick=()=>launchAssessmentCentre();
 ws.querySelectorAll('.drillReveal').forEach(b=>b.onclick=()=>showDrill(b));
 ws.querySelectorAll('.checkAnswer').forEach(b=>b.onclick=()=>checkPracticeAnswer(b));
 ws.querySelectorAll('.materialToggle').forEach(b=>b.onclick=()=>toggleMaterial(b));
 ws.scrollIntoView({behavior:'smooth',block:'start'});
}

function genericModule(title,trackTitle,no){
 return {id:no,title,scope:'Build the core skill step by step, with repeated practice before moving to application.',
 topics:['Core concepts and terminology','Worked examples','Common errors','Application patterns','Review and mastery'],
 materials:['Concept summary','Worked example sheet','Quick-reference guide','Common mistakes checklist'],
 drills:['Recognition drill','Trace-and-explain drill','Guided completion drill','Error-finding drill','Mixed recall drill'],
 practice:['Level 1 — guided','Level 2 — basic','Level 3 — reinforcement','Level 4 — mixed','Level 5 — timed challenge'],
 challenge:'Complete an applied task that combines the ideas from this module.',
 assessment:'Module mastery assessment with concept, application, reasoning and challenge questions.'};
}

function moduleView(track,data,no,programme){
 const topicHtml=data.topics.map(x=>'<li>'+esc(x)+'</li>').join('');
 const matHtml=data.materials.map((x,i)=>'<div class="studyMaterial"><span>RESOURCE '+String(i+1).padStart(2,'0')+'</span><strong>'+esc(x)+'</strong><button class="materialToggle" data-open="0">Show guide</button><p class="materialBody" hidden>'+esc(materialGuide(x,data.title))+'</p></div>').join('');
 const drillHtml=data.drills.map((x,i)=>'<article class="drillCard"><div><span>DRILL '+String(i+1).padStart(2,'0')+'</span><h5>'+esc(x)+'</h5><p>Attempt without looking at the answer. Then reveal the guidance and repeat until you can do it independently.</p></div><button class="drillReveal" data-text="'+esc(drillPrompt(data.title,x))+'">Start Drill</button></article>').join('');
 const practiceHtml=data.practice.map((x,i)=>'<article class="practiceLevel"><div class="practiceLevelNo">0'+(i+1)+'</div><div><span>PRACTICE LEVEL '+(i+1)+'</span><h5>'+esc(x.replace(/^Level \d+ — /,''))+'</h5><p>'+esc(practiceInstruction(data.title,i))+'</p></div><button class="checkAnswer" data-question="'+esc(practiceQuestion(data.title,i))+'" data-answer="'+esc(practiceAnswer(data.title,i))+'">Try One</button></article>').join('');
 return '<section class="moduleLearningWorkspace">'+
  '<div class="moduleLearningHero"><div><span class="sectionEyebrow">'+esc(track.title.toUpperCase())+' · MODULE '+String(no).padStart(2,'0')+'</span><h3>'+esc(data.title)+'</h3><p>'+esc(data.scope)+'</p>'+(programme?'<small>Programme: '+esc(programme.title)+'</small>':'')+'</div><button class="secondary" id="backToModules">← Back to Modules</button></div>'+
  '<div class="masteryStrip"><div><strong>1</strong><span>Understand</span></div><div><strong>2</strong><span>Drill</span></div><div><strong>3</strong><span>Practise</span></div><div><strong>4</strong><span>Apply</span></div><div><strong>5</strong><span>Assess</span></div></div>'+
  '<div class="moduleLearningGrid">'+
   '<section class="learningSection scopeSection"><span class="sectionEyebrow">01 · SCOPE & OUTCOMES</span><h4>What you will master</h4><ul class="scopeList">'+topicHtml+'</ul></section>'+
   '<section class="learningSection"><span class="sectionEyebrow">02 · STUDY MATERIALS</span><h4>Learn at your own pace</h4><p class="slowLearnerNote">If a concept is difficult, do not skip it. Read the guide again, work through the example, repeat the drill and return to practice.</p>'+matHtml+'</section>'+
  '</div>'+
  '<section class="learningSection"><span class="sectionEyebrow">03 · GUIDED DRILLS</span><h4>Build accuracy before speed</h4><p>These short drills are deliberately repetitive. Master the pattern first; speed comes later.</p><div class="drillGrid">'+drillHtml+'</div></section>'+
  '<section class="learningSection"><span class="sectionEyebrow">04 · PRACTICE LADDER</span><h4>Five levels from guided to independent</h4><p>Do not move up until you can complete the current level confidently. A slow learner gets more repetition, not less opportunity.</p><div class="practiceLadder">'+practiceHtml+'</div></section>'+
  '<section class="learningSection challengeSection"><span class="sectionEyebrow">05 · CHALLENGE</span><h4>Apply what you have learned</h4><div class="challengeBox"><p>'+esc(data.challenge)+'</p><ul><li>First explain your approach.</li><li>Then write the solution.</li><li>Test with normal, boundary and unusual inputs.</li><li>Review and improve before moving to assessment.</li></ul></div></section>'+
  '<section class="learningSection assessmentSection"><span class="sectionEyebrow">06 · ASSESSMENT</span><h4>Module Mastery Assessment</h4><p>'+esc(data.assessment)+'</p><div class="assessmentReadiness"><span>✓ Concepts reviewed</span><span>✓ Drills attempted</span><span>✓ Practice ladder completed</span><span>✓ Challenge attempted</span></div><button id="startAssessment">Open Assessment Centre →</button><p class="assessmentNote">The formal assessment engine uses administrator-approved question pools and server-side scoring. Module-specific assessment pools can be published from Assessment Studio.</p></section>'+
  '</section>';
}

function materialGuide(resource,title){
 return 'Study this '+resource.toLowerCase()+' for '+title+'. Read it once for understanding, once while making your own notes, then close it and explain the idea in your own words. Return to this guide whenever a drill exposes a gap.';
}
function drillPrompt(title,drill){return 'Module: '+title+'. Drill: '+drill+'.\n\nStep 1: attempt independently.\nStep 2: explain why your answer works.\nStep 3: create one similar example yourself.\nStep 4: repeat without notes.';}
function practiceInstruction(title,i){return 'Complete a '+title+' exercise at this level. Check your work, correct errors, and repeat a similar question before progressing.';}
function practiceQuestion(title,i){return 'For '+title+', explain the key idea for Practice Level '+(i+1)+' and give one small example that demonstrates it.';}
function practiceAnswer(title,i){return 'Your answer should correctly explain the central '+title+' concept, show the relevant steps and include a valid example. Compare your explanation with the study material before progressing.';}

function showDrill(button){
 const old=button.parentElement.querySelector('.drillResult'); if(old){old.remove();return;}
 const p=document.createElement('div');p.className='drillResult';p.textContent=button.dataset.text;button.parentElement.appendChild(p);button.textContent='Hide Guidance';
}
function toggleMaterial(button){
 const body=button.parentElement.querySelector('.materialBody');const open=button.dataset.open==='1';
 body.hidden=open;button.dataset.open=open?'0':'1';button.textContent=open?'Show guide':'Hide guide';
}
function checkPracticeAnswer(button){
 const box=document.createElement('div');box.className='practicePrompt';box.innerHTML='<strong>Self-check</strong><p>'+esc(button.dataset.question)+'</p><p><b>Model check:</b> '+esc(button.dataset.answer)+'</p>';
 button.parentElement.appendChild(box);button.textContent='Review Prompt';
}

function launchAssessmentCentre(){
 const btn=document.querySelector('.menuButton[data-panel="competencyAssessmentPanel"]');
 if(btn){btn.click();return;}
 const panel=document.getElementById('competencyAssessmentPanel');
 if(panel){document.querySelectorAll('.studentHiddenPanel').forEach(p=>p.hidden=true);panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'});}
}

document.addEventListener('click',e=>{
 const b=e.target.closest('.moduleOpen'); if(!b)return;
 const root=b.closest('.competencyPortal'); if(!root)return;
 const trackId=b.dataset.track, no=Number(b.dataset.module);
 const track=TRACKS.find(x=>x.id===trackId);
 const programmeSelect=root.querySelector('#programmeSelect');
 const programme=programmeSelect?.value?PROGRAMMES.find(p=>p.id===programmeSelect.value):null;
 openModule(root,trackId,no,programme);
});

export {renderPortal as renderCompetencyPortal,TRACKS,PROGRAMMES,C_MODULES};
window.FXECCompetencyPortal={renderCompetencyPortal:renderPortal,TRACKS,PROGRAMMES,C_MODULES};
