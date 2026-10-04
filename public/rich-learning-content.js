// FXEC Rich HTML Self-Learning Content
// CONTENT ONLY — existing rendering, callable names, Firestore loading and assessment logic are unchanged.
// The database remains authoritative whenever a module document contains curriculum metadata.
// This file supplies substantive fallback teaching material for all 60 competency modules.
//
// Standards used appropriately:
// • Communication: CEFR Companion Volume-style can-do performance
// • Engineering: ABET student outcomes / engineering practice and CDIO principles
// • Aptitude: mathematical literacy, quantitative reasoning and PISA-style application
// • C Programming: ABET computing foundations and ACM/IEEE CS2023-aligned problem solving
// These references guide design; they are not claims that one framework governs every competency.

import { FIRST_YEAR_MODULE_CONTENT } from './first-year-module-content.js';
import { COMMUNICATION_LEARNING_CONTENT } from './communication-learning-content.js';

const esc = value => String(value ?? '')
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;');

const card = (label, html) =>
  '<section class="learn-card"><div class="learn-card-label">'+label+'</div>'+html+'</section>';

const rich = (title, html, example, check, level='Foundation') =>
  ({title,level,html,example,check});

const TRACK_LABELS={
  aptitude:'Quantitative & Logical Reasoning',
  'core-engineering':'Engineering Foundations',
  'problem-solving':'Engineering Problem Solving',
  analytical:'Analytical Reasoning',
  'c-programming':'Computing & C Programming'
};

const C_MODULES = [
 {title:'C Fundamentals',topics:['Problem definition and IPO','C program structure','Variables, types and conversion','Operators and expressions','Input, output and debugging']},
 {title:'Control Flow',topics:['Boolean conditions','if/else and switch','for/while/do-while loops','Loop boundaries and tracing','Nested control flow and debugging']},
 {title:'Arrays',topics:['Array representation and indexing','Traversal and statistics','Searching','Sorting and frequency counting','Two-dimensional arrays']},
 {title:'Functions & Modular Programming',topics:['Function purpose and design','Parameters and arguments','Return values','Scope and prototypes','Call flow and modular decomposition']},
 {title:'Pointers',topics:['Addresses and pointer variables','Dereferencing and indirection','Pointers and functions','Pointers with arrays','Pointer safety and tracing']},
 {title:'Structures, Unions & User-Defined Types',topics:['Structure records','Member access','Arrays of structures','typedef and functions','Union selection and data representation']},
 {title:'Dynamic Memory & Memory Management',topics:['Stack and heap concepts','malloc and calloc','realloc and dynamic arrays','free and ownership','Leaks, dangling pointers and safe cleanup']},
 {title:'File Handling',topics:['FILE pointers and file lifecycle','Opening modes and errors','Text input/output','Formatted and line-based processing','Binary I/O and safe closing']},
 {title:'Strings',topics:['Character arrays and null terminator','String input and bounds','strlen/strcpy/strcat/strcmp','Manual traversal and searching','String algorithms and common bugs']},
 {title:'Advanced C',topics:['Preprocessor and macros','const, scope and command-line arguments','Function pointers','Bitwise operations','Defensive programming and unfamiliar-code debugging']}
];

function cCode(day,index){
 const samples=[
  '#include <stdio.h>\\nint main(void){\\n    int a=12,b=8;\\n    printf("%d",a+b);\\n    return 0;\\n}',
  'int mark=72;\\nif(mark>=40) printf("PASS");\\nelse printf("FAIL");',
  'int a[5]={4,7,2,9,5};\\nfor(int i=0;i<5;i++) printf("%d ",a[i]);',
  'int add(int a,int b){ return a+b; }\\nprintf("%d",add(4,6));',
  'int x=10;\\nint *p=&x;\\n*p=25;\\nprintf("%d",x);',
  'struct Student{int id; double mark;};\\nstruct Student s={101,82.5};',
  'int *p=malloc(5*sizeof *p);\\nif(p){ /* use p */ free(p); }',
  'FILE *fp=fopen("data.txt","r");\\nif(fp){ /* read */ fclose(fp); }',
  'char s[]="engineering";\\nprintf("%zu",strlen(s));',
  'unsigned int x=5u;\\nprintf("%u",x<<1);'
 ];
 return samples[index%10];
}

function formulaFor(track,title){
 const t=title.toLowerCase();
 if(track==='aptitude'){
  if(t.includes('number')) return '<div class="learn-formula"><math><mi>percentage</mi><mo>=</mo><mfrac><mi>part</mi><mi>whole</mi></mfrac><mo>×</mo><mn>100</mn></math></div>';
  if(t.includes('algebra')) return '<div class="learn-formula"><math><mi>y</mi><mo>=</mo><mi>mx</mi><mo>+</mo><mi>c</mi></math></div>';
  if(t.includes('sequence')) return '<div class="learn-formula"><math><msub><mi>a</mi><mi>n</mi></msub><mo>=</mo><mi>a</mi><mo>+</mo><mo>(</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo>)</mo><mi>d</mi></math></div>';
  if(t.includes('ratio')) return '<div class="learn-formula"><math><mfrac><mi>a</mi><mi>b</mi></mfrac><mo>=</mo><mfrac><mi>c</mi><mi>d</mi></mfrac></math></div>';
  if(t.includes('data')) return '<div class="learn-formula"><math><mi>mean</mi><mo>=</mo><mfrac><mrow><mo>Σ</mo><mi>x</mi></mrow><mi>n</mi></mfrac></math></div>';
  if(t.includes('probability')) return '<div class="learn-formula"><math><mi>P</mi><mo>(</mo><mi>A</mi><mo>′</mo><mo>)</mo><mo>=</mo><mn>1</mn><mo>−</mo><mi>P</mi><mo>(</mo><mi>A</mi><mo>)</mo></math></div>';
  if(t.includes('geometry')) return '<div class="learn-formula"><math><mi>A</mi><mo>=</mo><mi>π</mi><msup><mi>r</mi><mn>2</mn></msup><mo>;</mo><mi>V</mi><mo>=</mo><mi>π</mi><msup><mi>r</mi><mn>2</mn></msup><mi>h</mi></math></div>';
  return '<div class="learn-formula"><strong>QUANTITY → RELATIONSHIP → CALCULATION → INTERPRETATION</strong></div>';
 }
 if(track==='core-engineering'){
  if(t.includes('measurement')) return '<div class="learn-formula"><math><mi>x</mi><mo>≈</mo><mover><mi>x</mi><mo>¯</mo></mover><mo>±</mo><mi>u</mi></math></div>';
  if(t.includes('electrical')) return '<div class="learn-formula"><math><mi>V</mi><mo>=</mo><mi>I</mi><mi>R</mi><mo>;</mo><mi>P</mi><mo>=</mo><mi>V</mi><mi>I</mi></math></div>';
  if(t.includes('mechanical')) return '<div class="learn-formula"><math><mi>τ</mi><mo>=</mo><mi>r</mi><mi>F</mi><mo>sin</mo><mi>θ</mi><mo>;</mo><mi>P</mi><mo>=</mo><mfrac><mi>W</mi><mi>t</mi></mfrac></math></div>';
  if(t.includes('thermal')) return '<div class="learn-formula"><math><mi>Q</mi><mo>=</mo><mi>m</mi><mi>c</mi><mi>ΔT</mi></math></div>';
  if(t.includes('digital')) return '<div class="learn-formula"><strong>AND</strong>: output 1 only when both inputs are 1; <strong>OR</strong>: output 1 when at least one input is 1.</div>';
  if(t.includes('safety')) return '<div class="learn-formula"><strong>Risk is evaluated from likelihood and consequence; controls should reduce the hazard at its source where feasible.</strong></div>';
  return '<div class="learn-formula"><strong>REQUIREMENT → EVIDENCE → ENGINEERING JUDGEMENT → VERIFIED RESULT</strong></div>';
 }
 if(track==='problem-solving') return '<div class="learn-formula"><strong>PROBLEM → DECOMPOSE → MODEL → TEST → SOLVE → VERIFY → TRANSFER</strong></div>';
 if(track==='analytical') return '<div class="learn-formula"><strong>OBSERVATION → EVIDENCE → INFERENCE → TEST → CONCLUSION</strong></div>';
 if(track==='c-programming') return '<div class="learn-formula"><strong>REQUIREMENT → ALGORITHM → CODE → TEST → DEBUG → VERIFY</strong></div>';
 return '';
}

function domainTeaching(track,topic,module,i){
 const t=String(topic);
 const m=String(module.title);
 if(track==='aptitude'){
  const map=[
   '<p>Start by defining the quantities and their units. Separate exact values from estimates, then choose a representation that makes comparison easy. Estimation is a verification tool: if the exact answer differs by an order of magnitude from a sensible estimate, stop and inspect the setup.</p><p><strong>Worked method:</strong> identify the whole and part; convert to compatible units; calculate; round only at the end; interpret what the number means in the engineering situation.</p>',
   '<p>Translate words into variables before manipulating an equation. Preserve equality by performing the same valid operation on both sides. After solving, substitute the result back into the original relationship and check units.</p><p><strong>Worked method:</strong> list knowns → choose the governing relationship → isolate the unknown → substitute → verify by substitution and dimensional reasoning.</p>',
   '<p>Do not assume a pattern is a law merely because several observations fit it. Calculate successive differences or ratios, state the rule, then test the next value. A counterexample is evidence that the proposed rule needs revision.</p><p><strong>Worked method:</strong> compare adjacent terms → identify the simplest rule → predict → verify against new data.</p>',
   '<p>Ratios compare quantities in a common relationship. A unit rate makes that relationship operational. For direct proportion, the ratio remains constant; for inverse proportion, the product remains constant under the stated assumptions.</p><p><strong>Worked method:</strong> state the proportional model → keep units consistent → scale one quantity → calculate the other → check whether the physical assumption still holds.</p>',
   '<p>Read the title, axes, units, categories and sample size before interpreting a chart. Choose mean, median, range or rate according to the question. Distinguish an observed trend from a causal claim.</p><p><strong>Worked method:</strong> describe what is measured → quantify the comparison → identify anomalies → state only the conclusion supported by the data.</p>'
  ];
  return map[i%map.length];
 }
 if(track==='core-engineering'){
  const map=[
   '<p>Engineering measurement begins with a defined measurand and an instrument whose range and resolution fit the task. Accuracy concerns closeness to the true value; precision concerns consistency. Report units, sensible significant figures and uncertainty rather than false precision.</p>',
   '<p>Material selection is a requirements problem. Strength, stiffness, toughness, density, conductivity and manufacturability answer different questions. Compare properties against the service conditions rather than choosing a material from a catalogue label alone.</p>',
   '<p>Build the physical model before calculating. Define voltage, current and resistance, identify series or parallel topology, then apply the governing relationship. Measurements must respect instrument loading and safe connection practices.</p>',
   '<p>Relate motion and force to the geometry of the system. State the direction and point of application of forces before calculating moments or torque. Use energy and power to compare how quickly work is transferred, not simply how large a force appears.</p>',
   '<p>Thermal reasoning starts by identifying where energy is stored and how it crosses a boundary. Distinguish temperature from heat transfer, then identify conduction, convection or radiation and the assumptions that make the simplified model reasonable.</p>'
  ];
  return map[i%map.length];
 }
 if(track==='problem-solving'){
  const map=[
   '<p>A useful problem statement specifies the system, stakeholder need, current condition, desired outcome and measurable success criteria. “Improve” is not testable until the improvement has a target and a way to measure it.</p>',
   '<p>Decomposition turns a large task into functions that can be solved and verified independently. Preserve interfaces: an otherwise correct subsystem can fail when its assumptions do not match the neighbouring subsystem.</p>',
   '<p>Abstraction deliberately removes detail that does not affect the current decision. Every simplification is an assumption; record it and state when the omitted detail would become important.</p>',
   '<p>An algorithm is a finite, ordered procedure. Inputs, decisions, repetition and termination must be explicit enough that another student could execute the procedure without guessing.</p>',
   '<p>Patterns are useful only when their defining features actually match the new problem. Look for invariants and counterexamples before transferring a method from one context to another.</p>'
  ];
  return map[i%map.length];
 }
 if(track==='analytical'){
  const map=[
   '<p>Separate observation from interpretation. A measurement is evidence; a causal explanation is a hypothesis. Write the evidence first, then state what it supports and what it does not establish.</p>',
   '<p>Before analysis, inspect provenance, completeness, sampling, instrument behaviour, outliers and comparability. A sophisticated calculation cannot repair a dataset that does not represent the question being asked.</p>',
   '<p>Describe relationships quantitatively where possible. Correlation can motivate a hypothesis, but it does not by itself establish causation. Check time order, confounders and alternative explanations.</p>',
   '<p>A good hypothesis predicts observations that could support or weaken it. Competing hypotheses should lead to distinguishable predictions; the test should therefore be designed around the evidence that would separate them.</p>',
   '<p>Technical claims need definitions, baselines, operating conditions and evidence. A headline percentage is not comparable until its denominator, boundary and test conditions are understood.</p>'
  ];
  return map[i%map.length];
 }
 if(track==='c-programming'){
  const map=[
   '<p>Translate the requirement into input, processing and output before writing C. Choose data types deliberately, make the state visible and use a small test case to establish expected behaviour.</p>',
   '<p>Control flow is a model of decision and repetition. Trace the condition, state change and termination together; a loop is correct only when it makes progress toward a defined stopping condition.</p>',
   '<p>An array represents a fixed sequence of same-type elements indexed from 0. Bounds, traversal order and the relationship between an index and an element must remain explicit throughout the algorithm.</p>',
   '<p>Functions reduce complexity when each function has a clear purpose, contract, inputs and output. Separate interface from implementation and trace the call sequence when debugging.</p>',
   '<p>A pointer stores an address. Dereferencing accesses the object at that address, so pointer reasoning requires tracking both the pointer value and the lifetime/type of the object it refers to.</p>'
  ];
  return map[i%map.length];
 }
 return '<p>Build the concept from a precise definition, connect it to the module problem, then test the idea with evidence. The aim is to explain the reasoning, not merely reproduce a definition.</p>';
}

function domainWorkedExample(track,module,topic,i){
 const ex=String(module.example||'Apply the skill to a realistic first-year engineering situation.');
 if(track==='c-programming') return '<p>'+esc(ex)+'</p><pre class="codeBlock"><code>'+esc(cCode(module.id||i+1,i))+'</code></pre><p><strong>Verification:</strong> predict the result first, then test a normal case and one boundary case. If the observed behaviour differs, identify the smallest statement responsible before editing the program.</p>';
 return '<p>'+esc(ex)+'</p>'+formulaFor(track,module.title)+'<ol class="learn-steps"><li>State the requirement or question.</li><li>Identify the relevant quantities, evidence or constraints.</li><li>Apply the method one step at a time.</li><li>Check units, assumptions, limits or alternative explanations.</li><li>Interpret the result in the original context.</li></ol>';
}

function errorFor(track,topic){
 if(track==='c-programming') return 'Changing code before reproducing the defect. Also check array bounds, type conversions, lifetime and the exact program state at the failing statement.';
 if(track==='aptitude') return 'Using a formula without checking units or the meaning of the quantities. A numerically neat answer can still be dimensionally or contextually wrong.';
 if(track==='core-engineering') return 'Reporting a calculation without its physical assumptions, units or measurement conditions. Engineering results need evidence and stated limits.';
 if(track==='problem-solving') return 'Solving the first interpretation of the problem without checking the requirement, constraints or success criterion.';
 return 'Treating a plausible interpretation as established fact. Trace every conclusion back to evidence and state what remains uncertain.';
}

function genericRichLessons(track,module,index){
 const topics=(module.topics||[]).slice(0,5);
 const focus=module.focus||'Build the skill through understanding, guided application, analysis, diagnosis and transfer.';
 const lessons=topics.map((topic,i)=>{
  const level=['Foundation','Guided Application','Analyse / Verify','Diagnose','Transfer / Solve'][i];
  const body=
    '<h3>'+esc(topic)+'</h3>'+
    domainTeaching(track,topic,module,i)+
    card('WHY THIS MATTERS','<p><strong>'+esc(m.title)+'</strong> develops '+esc(focus)+'</p><p>Use this idea as part of a traceable engineering workflow: identify what is known, make the reasoning explicit, verify it and communicate the result.</p>')+
    card('WORKED ENGINEERING EXAMPLE',domainWorkedExample(track,module,topic,i))+
    card('METHOD / CHECKPOINTS','<ol class="learn-steps"><li>Define the task in observable terms.</li><li>Identify the relevant variables, evidence or constraints.</li><li>Apply the method and record intermediate reasoning.</li><li>Run an independent check: unit, boundary, comparison, test case or counterexample.</li><li>State the result together with its meaning and limitation.</li></ol>')+
    card('COMMON ERROR','<p>'+esc(errorFor(track,topic))+'</p>')+
    card('MICRO-CHECK','<p>Without looking back, explain <strong>'+esc(topic)+'</strong> in two or three sentences, solve or analyse one new case, and name one check that could expose an incorrect answer.</p>');
  return rich(topic,body,String(module.example||''),'Explain '+topic+' in your own words, apply it to a new case and justify one independent verification step.',level);
 });
 return lessons;
}

function communicationRich(){
 return COMMUNICATION_LEARNING_CONTENT.map(module=>module.lessons.map((lesson,i)=>{
  const body=
    '<h3>'+esc(lesson.title)+'</h3>'+
    '<p>'+esc(lesson.teach||'Build this communication skill through a clear can-do task.')+'</p>'+
    card('WORKED PROFESSIONAL EXAMPLE','<p>'+esc(lesson.example||'Apply the communication skill to an engineering context.')+'</p>')+
    card('PERFORMANCE CRITERIA','<ul><li>Meaning is clear to the intended audience.</li><li>Language or delivery is accurate enough for the task.</li><li>Ideas are organised and linked.</li><li>Register and tone fit the situation.</li><li>The learner can repair or clarify meaning when needed.</li></ul>')+
    card('MICRO-CHECK','<p>'+esc(lesson.check||'Explain the choice and produce a new example.')+'</p>')+
    card('TRANSFER','<p>Perform the same communication task with a different engineering topic and a different audience. Keep the message accurate while adapting vocabulary, structure and level of detail.</p>');
  return rich(lesson.title,body,lesson.example||'',lesson.check||'',i<2?'Foundation':i<4?'Guided Application':'Transfer / Solve');
 }));
}

function cRich(){
 return C_MODULES.map((module,no)=>module.topics.map((topic,i)=>{
  const body=
    '<h3>'+esc(topic)+'</h3>'+
    domainTeaching('c-programming',topic,module,i)+
    card('WORKED CODE','<pre class="codeBlock"><code>'+esc(cCode(no+1,i))+'</code></pre><p>Trace the state before and after the key statement. Do not rely on what the code “looks like”; derive the result from the language rules.</p>')+
    card('DEBUGGING ROUTINE','<ol class="learn-steps"><li>Reproduce the smallest failing case.</li><li>Identify the expected result.</li><li>Trace variables, control flow and relevant memory objects.</li><li>Change one cause at a time.</li><li>Retest normal, boundary and invalid inputs.</li></ol>')+
    card('COMMON BUG','<p>'+esc(errorFor('c-programming',topic))+'</p>')+
    card('MICRO-CHECK','<p>Predict the example, explain the language rule, then state one input or state that would expose an implementation error.</p>');
  return rich(topic,body,'Trace the supplied C example and explain why it behaves as it does.','Trace the example, predict the result, explain the rule and state one boundary case.',i<2?'Foundation':i<4?'Guided Application':'Transfer / Solve');
 }));
}

const nonCommunication={};
for(const [track,modules] of Object.entries(FIRST_YEAR_MODULE_CONTENT)){
 nonCommunication[track]={};
 modules.forEach((m,i)=>{ nonCommunication[track][i+1]=genericRichLessons(track,m,i); });
}

const communication={};
communicationRich().forEach((lessons,i)=>{communication[i+1]=lessons;});

const cProgramming={};
cRich().forEach((lessons,i)=>{cProgramming[i+1]=lessons;});

export const RICH_HTML_MODULES=Object.freeze({
 communication,
 aptitude:nonCommunication.aptitude,
 'core-engineering':nonCommunication['core-engineering'],
 'problem-solving':nonCommunication['problem-solving'],
 analytical:nonCommunication.analytical,
 'c-programming':cProgramming
});
