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

const C_FUNDAMENTALS_LESSON=[
 {title:'1. From Problem to Program',level:'Foundation',teach:'A computer program is a precise sequence of instructions. Start with the problem, identify the inputs, decide the processing, define the output, then express those steps in C.',example:'Problem: calculate the area of a rectangle. Input length and width → multiply them → display the result.',code:'int length = 10;\\nint width = 5;\\nint area = length * width;\\nprintf("%d", area);',check:'Can you state the input, process and output before writing code?'},
 {title:'2. Anatomy of a C Program',level:'Foundation',teach:'A C program is built from declarations, statements, functions and blocks. Execution begins in main(). Braces define a block and semicolons terminate most statements.',example:'Read a program from top to bottom. Identify the header, main function, declarations, statements and output.',code:'#include <stdio.h>\\n\\nint main(void) {\\n    int age = 18;\\n    printf("%d", age);\\n    return 0;\\n}',check:'Why is main() important? What does return 0 communicate?'},
 {title:'3. Variables, Constants & Identifiers',level:'Foundation',teach:'A variable is a named storage location whose value can change. An identifier must follow C naming rules: it can contain letters, digits and underscore, but cannot begin with a digit or be a keyword.',example:'Use meaningful names such as totalMarks rather than x when the meaning matters.',code:'int totalMarks = 85;\\nconst int passMark = 40;',check:'Which names are legal identifiers: total_1, 2total, float, studentName?'},
 {title:'4. Data Types & Conversion',level:'Core',teach:'Choose a data type that matches the value you need. int represents whole numbers, float and double represent fractional values, and char stores a character. Conversion can be implicit or explicit.',example:'Integer division discards the fractional part when both operands are integers.',code:'int a = 5, b = 2;\\nprintf("%d", a / b);\\nprintf("%.1f", (double)a / b);',check:'Why does 5/2 differ from (double)5/2?'},
 {title:'5. Operators & Expressions',level:'Core',teach:'Arithmetic, relational and logical operators combine values into expressions. Precedence and associativity determine evaluation order, but parentheses should be used when clarity matters.',example:'Use (marks >= 40) && (attendance >= 75) when both conditions are required.',code:'int marks = 72;\\nint attendance = 80;\\nprintf("%d", marks >= 40 && attendance >= 75);',check:'What value does the logical expression produce?'},
 {title:'6. Input & Output',level:'Core',teach:'printf displays formatted output. scanf reads formatted input and normally needs the address of the variable so that the function can store the entered value.',example:'For an int variable n, scanf("%d", &n) passes its address.',code:'int n;\\nscanf("%d", &n);\\nprintf("You entered %d", n);',check:'Why is &n used with scanf for an int?'},
 {title:'7. Compile, Read Errors, Fix, Recompile',level:'Applied',teach:'Debugging is a cycle: reproduce the problem, read the compiler message, locate the smallest likely cause, fix it, compile again, then test the behaviour.',example:'A missing semicolon is a syntax error. A wrong formula may compile successfully but produce an incorrect result.',code:'int total = 10 + 20;\\nprintf("%d", total);',check:'Can you distinguish a compile-time error from a logic error?'},
 {title:'8. First Mini-Programs',level:'Applied',teach:'Combine variables, expressions and input/output to solve small problems. Start with one clear task, test normal values, boundary values and unusual values.',example:'A marks calculator can read three marks, calculate total and average, then display both.',code:'int a,b,c;\\nscanf("%d%d%d",&a,&b,&c);\\nint total=a+b+c;\\nprintf("%d",total);',check:'What test values would you use to verify the program?'}
];

const C_FUNDAMENTALS_DRILLS=[
 ['Identifier Hunt','Which is a valid C identifier?',['2marks','total_marks','float','student-name'],1,'Identifiers may contain letters, digits and underscore but cannot begin with a digit or be a keyword.'],
 ['Identifier Hunt','Which identifier is invalid because it begins with a digit?',['student1','_student','1student','student_1'],2,'An identifier cannot begin with a digit.'],
 ['Program Anatomy','Where does execution of a normal C program begin?',['printf()','main()','scanf()','include'],1,'The main function is the entry point of a hosted C program.'],
 ['Program Anatomy','Which symbol terminates this statement: int x = 5 ?',[':',';','.',','],1,'Most C statements end with a semicolon.'],
 ['Variables','Which declaration creates an integer variable named count?',['integer count;','int count;','count int;','num count;'],1,'int is the standard C integer type keyword.'],
 ['Variables','Which is a constant declaration?',['const int pass=40;','constant int pass=40;','int const? pass=40;','fixed int pass=40;'],0,'const makes the object non-modifiable through that identifier.'],
 ['Types','What is the value of 5 / 2 when both operands are int?',['2','2.5','3','0'],0,'Integer division produces the integer quotient.'],
 ['Types','Which expression forces floating-point division?',['5/2','(double)5/2','5%2','5-2'],1,'Casting one operand to double makes the division floating point.'],
 ['Operators','What is 7 % 3?',['1','2','3','0'],0,'The remainder after integer division of 7 by 3 is 1.'],
 ['Operators','Which operator means logical AND?',['&','&&','||','!'],1,'&& is logical AND; & is bitwise AND.'],
 ['Input','Why is &n normally used in scanf("%d",&n)?',['It prints n','It passes n’s address','It converts n to double','It ends the program'],1,'scanf needs the address where it should store the input.'],
 ['Output','What does printf("%d", 4+3) display?',['43','7','4+3','Error'],1,'The expression is evaluated before printf formats the integer result.'],
 ['Debugging','A program compiles but calculates average incorrectly. What kind of problem is most likely?',['Syntax error','Logic error','Linker keyword','Identifier rule'],1,'Incorrect output from valid code is commonly a logic error.'],
 ['Debugging','What should you read first after a compiler error?',['Random code','The compiler message','The keyboard manual','The final output'],1,'Compiler diagnostics usually identify the location and nature of syntax/type problems.'],
 ['Expressions','What is the value of 3 + 4 * 2?',['14','11','10','9'],1,'Multiplication has higher precedence than addition, giving 3+8.'],
 ['Expressions','Which improves clarity when combining conditions?',['Remove all parentheses','Use meaningful parentheses','Use random casts','Repeat the condition'],1,'Parentheses make intended grouping explicit.'],
 ['Testing','Which is a boundary test for a pass mark of 40?',['85','60','40','25'],2,'40 is exactly the decision boundary.'],
 ['Testing','Why test unusual inputs?',['To make code longer','To expose assumptions and defects','To avoid compiling','To remove variables'],1,'Unusual and boundary values reveal hidden assumptions.'],
 ['Syntax','Which line is syntactically correct?',['int x = 5;','int x = ;','integer x = 5;','int = x 5;'],0,'The first declaration follows C syntax.'],
 ['Algorithm','Before coding a small problem, what should you identify first?',['Font size','Input, process and output','Keyboard layout','File name only'],1,'IPO analysis gives the program a clear purpose and structure.']
];

const C_FUNDAMENTALS_PRACTICE=[
 {title:'Output Prediction',kind:'mcq',prompt:'What does this program print?',code:'int a = 8, b = 3;\\nprintf("%d %d", a+b, a%b);',options:['11 2','83 2','11 3','5 2'],answer:0,hint:'Evaluate + and % separately.'},
 {title:'Bug Fixing',kind:'bug',prompt:'Fix the input statement so the user can enter an integer.',code:'int age;\\nscanf("%d", age);',options:['scanf("%d", &age);','scanf("%d", age*1);','scanf("%d", *age);','scanf("%d", #age);'],answer:0,hint:'scanf needs the address of age.'},
 {title:'Missing Code',kind:'missing',prompt:'Choose the missing expression that calculates the average as a decimal.',code:'int total=75, count=2;\\ndouble average = ______;',options:['total/count','(double)total/count','total%count','(int)total/count'],answer:1,hint:'At least one operand must participate in floating-point division.'},
 {title:'Bug Fixing',kind:'bug',prompt:'The output should be 7. What should replace ???',code:'int a=3,b=4;\\nprintf("%d", ???);',options:['a+b','a*b','a-b','a/b'],answer:0,hint:'The requirement says add the two values.'},
 {title:'Code Observation',kind:'trace',prompt:'What value is stored in result?',code:'int x=5;\\nint y=2;\\nint result=x/y;',options:['2','2.5','3','0'],answer:0,hint:'Both operands are integers.'},
 {title:'Debugging Decision',kind:'scenario',prompt:'A program compiles successfully but prints the wrong total. What should you inspect first?',code:'The program builds without errors, but total is wrong.',options:['Logic and formula','Keyboard cable','Font family','File extension only'],answer:0,hint:'A compiling program can still contain logic errors.'}
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
 ws.querySelectorAll('[data-practice-answer]').forEach(b=>b.onclick=()=>handlePracticeChoice(b));
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
 const matHtml=data.title==='C Fundamentals'?C_FUNDAMENTALS_LESSON.map((lesson,i)=>'<article class="studyLesson"><div class="studyLessonHead"><span>LESSON '+String(i+1).padStart(2,'0')+' · '+esc(lesson.level)+'</span><strong>'+esc(lesson.title)+'</strong></div><p class="studyTeach">'+esc(lesson.teach)+'</p><div class="studyExample"><b>Worked example</b><p>'+esc(lesson.example)+'</p><pre class="codeBlock"><code>'+esc(lesson.code)+'</code></pre></div><div class="microCheck"><b>Micro-check</b><span>'+esc(lesson.check)+'</span></div></article>').join(''):data.materials.map((x,i)=>'<div class="studyMaterial"><span>RESOURCE '+String(i+1).padStart(2,'0')+'</span><strong>'+esc(x)+'</strong><button class="materialToggle" data-open="0">Teach me</button><p class="materialBody" hidden>'+esc(materialGuide(x,data.title))+'</p></div>').join('');
 const ds=drillStats(); const drillHtml=data.drills.map((x,i)=>'<article class="drillCard"><div><span>DRILL '+String(i+1).padStart(2,'0')+'</span><h5>'+esc(x)+'</h5><p>Short game-style practice. Attempt the mission, get instant feedback and collect a Drill Star. Stars are rewards only and never change the academic score.</p></div><button class="drillReveal">Start Drill</button></article>').join('')+'<div class="drillRewardBar"><strong>⭐ Drill Stars: '+ds.stars+'</strong><span>'+ds.completed+' drills completed · up to 100 drills can be added to this module</span></div>';
 const practiceHtml=data.practice.map((x,i)=>'<article class="practiceLevel"><div class="practiceLevelNo">0'+(i+1)+'</div><div><span>PRACTICE LEVEL '+(i+1)+'</span><h5>'+esc(x.replace(/^Level \d+ — /,''))+'</h5><p>'+esc(practiceInstruction(data.title,i))+'</p></div><button class="checkAnswer" data-question="'+esc(practiceQuestion(data.title,i))+'" data-answer="'+esc(practiceAnswer(data.title,i))+'">Try One</button></article>').join('');
 return '<section class="moduleLearningWorkspace">'+
  '<div class="moduleLearningHero"><div><span class="sectionEyebrow">'+esc(track.title.toUpperCase())+' · MODULE '+String(no).padStart(2,'0')+'</span><h3>'+esc(data.title)+'</h3><p>'+esc(data.scope)+'</p>'+(programme?'<small>Programme: '+esc(programme.title)+'</small>':'')+'</div><button class="secondary" id="backToModules">← Back to Modules</button></div>'+
  '<div class="masteryStrip"><div><strong>1</strong><span>Understand</span></div><div><strong>2</strong><span>Drill</span></div><div><strong>3</strong><span>Practise</span></div><div><strong>4</strong><span>Apply</span></div><div><strong>5</strong><span>Assess</span></div></div><div class="studentRewardBanner">🏅 <b>Drill Rewards</b><span>Collect stars for practice effort. Stars are motivational rewards only — they never alter marks, XP or academic results.</span><strong>⭐ '+drillStats().stars+' Stars</strong></div>'+
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
 if(title==='C Fundamentals'){
  const lesson=C_FUNDAMENTALS_LESSON.find(x=>resource.toLowerCase().includes(x.title.split('.')[1]?.trim().toLowerCase()||'@@'));
  if(lesson)return lesson.teach+'\\n\\nWorked example:\\n'+lesson.example+'\\n\\nCode:\\n'+lesson.code+'\\n\\nMicro-check: '+lesson.check;
 }
 return 'Read this resource in three passes: first for understanding, second while making your own notes, and third without looking at the notes. Then explain the idea aloud and complete a related drill.';
}
function drillPrompt(title,drill){return 'Module: '+title+'. Drill: '+drill+'.\n\nStep 1: attempt independently.\nStep 2: explain why your answer works.\nStep 3: create one similar example yourself.\nStep 4: repeat without notes.';}
function practiceInstruction(title,i){return i===0?'Solve the guided task, then explain each line.':i===1?'Find and fix the bug before checking the model.':i===2?'Predict the output before running or checking anything.':i===3?'Write the missing code and test at least two cases.':'Complete the challenge independently, then review edge cases and improve your solution.';}
function practiceQuestion(title,i){const p=C_FUNDAMENTALS_PRACTICE[i%C_FUNDAMENTALS_PRACTICE.length];return p?.prompt||('Solve one '+title+' task and explain your reasoning.');}
function practiceAnswer(title,i){const p=C_FUNDAMENTALS_PRACTICE[i%C_FUNDAMENTALS_PRACTICE.length];return p?'Model approach: '+p.hint:'Compare your solution with the module study material and repeat the task until you can explain every step.';}

function drillStats(){return JSON.parse(localStorage.getItem('fxecDrillRewards')||'{"stars":0,"completed":0}');}
function saveDrillStats(s){localStorage.setItem('fxecDrillRewards',JSON.stringify(s));}
function drillBadge(stars){
 if(stars>=100)return '🏆 Drill Master';
 if(stars>=50)return '🥇 Practice Champion';
 if(stars>=25)return '🥈 Persistent Learner';
 if(stars>=10)return '🥉 Drill Starter';
 return '🌱 Getting Started';
}
function showDrill(button){
 const card=button.closest('.drillCard');
 const old=card.querySelector('.drillInteractive'); if(old){old.remove();button.textContent='Start Drill';return;}
 const q=C_FUNDAMENTALS_DRILLS[Math.floor(Math.random()*C_FUNDAMENTALS_DRILLS.length)];
 const box=document.createElement('div');box.className='drillInteractive';
 box.innerHTML='<div class="drillGameHeader"><b>🎯 DRILL MISSION</b><span>+1 ★ for an attempt</span></div><h6>'+esc(q[0])+'</h6><p>'+esc(q[1])+'</p><div class="drillOptions">'+q[2].map((o,i)=>'<button data-answer="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>').join('')+'</div><div class="drillFeedback"></div>';
 card.appendChild(box);button.textContent='Close Drill';
 box.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
  const stats=drillStats(); if(!box.dataset.rewarded){stats.stars+=1;stats.completed+=1;saveDrillStats(stats);box.dataset.rewarded='1';}
  const ok=Number(b.dataset.answer)===q[3],fb=box.querySelector('.drillFeedback');
  fb.className='drillFeedback '+(ok?'correct':'review');fb.innerHTML=(ok?'⭐ Correct! Drill Star earned. ':'Keep going. ')+'<b>'+esc(q[4])+'</b><br><span>Drill Stars: '+stats.stars+' · Completed: '+stats.completed+'</span>';
  if(ok)b.disabled=true;
 });
}
function toggleMaterial(button){
 const body=button.parentElement.querySelector('.materialBody');const open=button.dataset.open==='1';
 body.hidden=open;button.dataset.open=open?'0':'1';button.textContent=open?'Teach me':'Hide lesson';
}
function handlePracticeChoice(button){
 const task=button.closest('.practiceLevel'), all=[...task.querySelectorAll('[data-practice-answer]')], idx=all.indexOf(button);
 const ok=idx===Number(task.dataset.correct),fb=task.querySelector('.practiceFeedback');
 fb.className='practiceFeedback '+(ok?'correct':'review');
 fb.innerHTML=(ok?'✓ Correct. Continue only after you can repeat the task independently.':'↻ Review the concept, inspect the code again and try once more.')+'<br><small>'+esc(task.dataset.hint||'Use the study material and explain why the answer is correct.')+'</small>';
 if(ok) all.forEach(x=>x.disabled=true);
}function checkPracticeAnswer(button){
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
