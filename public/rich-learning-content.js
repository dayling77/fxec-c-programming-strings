// FXEC Rich HTML Self-Learning Content
// CONTENT ONLY. Preserves the existing Topic -> Materials -> Drills -> Practice -> Challenge -> Assessment architecture.
// The curriculum is designed around explicit outcomes, active learning, worked examples, verification and transfer.
// Communication is informed by CEFR-style can-do performance; engineering tracks by ABET/CDIO principles;
// aptitude by contextual mathematical literacy; C programming by CS2023/ABET computing fundamentals.

import { FIRST_YEAR_MODULE_CONTENT } from './first-year-module-content.js';
import { COMMUNICATION_LEARNING_CONTENT } from './communication-learning-content.js';

const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const card = (label, html) => '<section class="learn-card"><div class="learn-card-label">'+label+'</div>'+html+'</section>';
const rich = (title, html, example, check, level='Foundation') => ({title,level,html,example,check});

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
  if(t.includes('digital')) return '<div class="learn-formula"><strong>AND:</strong> 1 only when both inputs are 1 &nbsp; <strong>OR:</strong> 1 when at least one input is 1</div>';
  if(t.includes('sustainability')) return '<div class="learn-formula"><strong>Impact → life cycle → alternatives → trade-off → decision</strong></div>';
  if(t.includes('safety')) return '<div class="learn-formula"><strong>Risk = likelihood × consequence</strong></div>';
  return '<div class="learn-formula"><strong>REQUIREMENT → EVIDENCE → ENGINEERING JUDGEMENT → VERIFIED RESULT</strong></div>';
 }
 if(track==='problem-solving') return '<div class="learn-formula"><strong>PROBLEM → DECOMPOSE → MODEL → TEST → SOLVE → VERIFY → TRANSFER</strong></div>';
 if(track==='analytical') return '<div class="learn-formula"><strong>OBSERVATION → EVIDENCE → INFERENCE → TEST → CONCLUSION</strong></div>';
 if(track==='c-programming') return '<div class="learn-formula"><strong>REQUIREMENT → ALGORITHM → CODE → TEST → DEBUG → VERIFY</strong></div>';
 return '';
}

function genericRichLessons(track,module,index){
 const topics=module.topics||[];
 const focus=module.focus||'Build the skill through understanding, guided application, analysis, diagnosis and transfer.';
 const example=module.example||'Apply '+module.title+' to a realistic first-year engineering situation and verify the result.';
 return topics.slice(0,5).map((topic,i)=>{
  const level=['Foundation','Foundation','Application','Diagnosis','Transfer'][i];
  const safeTopic=esc(topic), safeTitle=esc(module.title);
  let learn='';
  if(i===0) learn='<h3>Build the concept before attempting the task</h3><p><strong>'+safeTopic+'</strong> is one of the core ideas in <strong>'+safeTitle+'</strong>. '+esc(focus)+' Start by defining the quantity, relationship, rule or decision involved. Do not jump directly to the answer.</p>';
  else if(i===1) learn='<h3>Connect the rule to a worked situation</h3><p>Use <strong>'+safeTopic+'</strong> as a decision tool, not as a memorised definition. Identify the known information, the unknown, the governing relationship and the evidence required to justify the result.</p>';
  else if(i===2) learn='<h3>Analyse conditions and verify the result</h3><p>Ask what assumptions make <strong>'+safeTopic+'</strong> valid. Test units, boundaries, alternative explanations or counterexamples. A correct-looking answer is not enough without a reason it is defensible.</p>';
  else if(i===3) learn='<h3>Diagnose the failure, not just the symptom</h3><p>When a result is wrong, reproduce the case, isolate the step where reasoning changed, identify the violated condition and change one assumption or operation at a time.</p>';
  else learn='<h3>Transfer the skill to a new context</h3><p>Apply <strong>'+safeTopic+'</strong> to a new engineering, laboratory or professional situation. Explain why the method remains appropriate and what evidence would cause you to revise the conclusion.</p>';
  const worked=card('WORKED ENGINEERING EXAMPLE','<p>'+esc(example)+'</p>'+formulaFor(track,module.title));
  const method=card('HOW TO THINK','<ol class="learn-steps"><li>State the requirement.</li><li>Identify the relevant evidence and variables.</li><li>Apply the appropriate method step by step.</li><li>Check units, assumptions, constraints or boundary cases.</li><li>Explain the result in the context of the original problem.</li></ol>');
  const error=card('COMMON ERROR','<p>Using a familiar rule without checking its conditions. Ask: <strong>What evidence supports this step?</strong> If the evidence is missing, stop and gather it before proceeding.</p>');
  const check='Explain '+topic+' without the notes, apply it to one new case and state one independent check you would use before accepting the result.';
  return rich(topic,learn+worked+method+error,example,check,level);
 });
}

function communicationRich(){
 return COMMUNICATION_LEARNING_CONTENT.map((module,no)=>module.lessons.map((lesson,i)=>{
  const body='<h3>'+esc(lesson.title)+'</h3><p>'+esc(lesson.teach||'Build this communication skill through a clear can-do task.')+'</p>'+
    card('WORKED EXAMPLE','<p>'+esc(lesson.example||'Apply the language skill to a professional engineering context.')+'</p>')+
    card('LANGUAGE / PERFORMANCE CHECK','<p>Use the CEFR-style question: <strong>Can I perform this task clearly for the intended audience?</strong> Check accuracy, range, fluency, coherence and appropriateness where relevant.</p>')+
    card('MICRO-CHECK','<p>'+esc(lesson.check||'Explain the choice and produce a new example.')+'</p>');
  return rich(lesson.title,body,lesson.example||'',lesson.check||'',i<2?'Foundation':i<4?'Application':'Transfer');
 }));
}

function cRich(){
 return C_MODULES.map((module,no)=>module.topics.map((topic,i)=>{
  const code=cCode(no+1,i);
  const learn='<h3>'+esc(topic)+'</h3><p>In <strong>'+esc(module.title)+'</strong>, this skill must be understood before code is written. Read the requirement, identify the program state, predict the behaviour and only then implement it.</p>'+
    card('C PROGRAMMING RULE','<p>Prefer defined, testable behaviour. Make types explicit, keep control flow traceable, avoid undefined behaviour and use compiler feedback as evidence rather than guessing.</p>')+
    card('WORKED CODE','<pre class="codeBlock"><code>'+esc(code)+'</code></pre>')+
    card('TRACE IT','<ol class="learn-steps"><li>Identify each variable or data object.</li><li>Record its value/state before the key statement.</li><li>Execute one operation at a time.</li><li>Predict the output.</li><li>Test a normal and a boundary input.</li></ol>')+
    card('COMMON BUG','<p>Changing code before reproducing the defect. First create the smallest failing case, then identify the exact statement or assumption responsible.</p>');
  const check='Trace the example, predict the result, explain the rule and state one boundary case that could expose an error.';
  return rich(topic,learn,'Trace the supplied C example and explain why it behaves as it does.',check,i<2?'Foundation':i<4?'Application':'Transfer');
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
