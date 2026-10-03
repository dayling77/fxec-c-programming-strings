import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { C_CODING_CHALLENGES } from './c-programming-coding-bank.js';
import { C_COMPETITIVE_META_BY_ID } from './c-competitive-coding-meta.js';
import { COMMUNICATION_MODULES } from './communication-curriculum.js';
import { renderCommunicationAudioLab, wireCommunicationAudioLab } from './communication-audio-lab.js';
import { FIRST_YEAR_MODULE_CONTENT } from './first-year-module-content.js';
import { COMMUNICATION_LEARNING_CONTENT } from './communication-learning-content.js';

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

const C_FUNDAMENTALS_DRILL_BASE=[
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

const C_FUNDAMENTALS_DRILLS=[...C_FUNDAMENTALS_DRILL_BASE];
(function buildHundredDrills(){
  const add=(category,prompt,options,answer,explanation,mode='text')=>C_FUNDAMENTALS_DRILLS.push([category,prompt,options,answer,explanation,mode]);
  const nums=[3,4,5,6,7,8,9,11,12,13];
  nums.forEach((n,i)=>{
    const m=(i%5)+2;
    add('Output Prediction','What is the value of '+n+' % '+m+'?',String([n%m,n,m,0]).split(',').map(Number).sort(()=>0).map(String),0,'The modulo operator returns the remainder after integer division.','audio-question');
  });
  for(let i=0;i<10;i++){
    const a=2+i,b=3+(i%4),c=4+(i%3),ans=a+b*c;
    add('Expression Trace','What is the value of '+a+' + '+b+' * '+c+'?',[String(ans),String((a+b)*c),String(a+b+c),String(a*b+c)],0,'Multiplication is evaluated before addition.','text');
  }
  for(let i=0;i<10;i++){
    const a=9+i,b=2+(i%5),ans=Math.floor(a/b);
    add('Integer Division','Both operands are int. What does '+a+' / '+b+' produce?',[String(ans),String(a/b),String(ans+1),'0'],0,'Integer division discards the fractional part.','audio-question');
  }
  for(let i=0;i<10;i++){
    const marks=35+i,att=70+(i%6)*2;
    const ans=(marks>=40&&att>=75)?1:0;
    add('Logic Check','Which result is produced by (marks >= 40) && (attendance >= 75) when marks='+marks+' and attendance='+att+'?',['0','1','marks','attendance'],ans,'Logical AND is true only when both conditions are true.','audio-options');
  }
  for(let i=0;i<10;i++){
    const value=10+i*3;
    add('Input & Output','Which statement correctly reads an integer into n?',['scanf("%d", n);','scanf("%d", &n);','scanf("%f", &n);','scanf("%d", *n);'],1,'scanf needs the address of an int variable for %d.','audio-options');
  }
  for(let i=0;i<10;i++){
    const x=2+i,y=5+i,ans=x+y;
    add('Bug Fixing','The program must print '+ans+'. Which expression should replace ??? in printf("%d", ???);?',['x+y','x*y','y-x','x/y'],0,'Match the expression to the stated requirement and test it with the given values.','text');
  }
  for(let i=0;i<10;i++){
    const boundary=20+i*5;
    add('Testing','If the valid range begins at '+boundary+', which is the most important boundary test?',[String(boundary-1),String(boundary),String(boundary+10),String(boundary+20)],1,'The exact boundary value should be tested along with values just below and above it.','audio-question');
  }
  for(let i=0;i<10;i++){
    const val=4+i;
    add('Syntax & Types','Which declaration is valid C syntax for an integer initialized to '+val+'?',['int value = '+val+';','integer value = '+val+';','int = value '+val+';','value int = '+val+';'],0,'C uses the type name followed by the identifier and initializer.','text');
  }
  for(let i=0;i<10;i++){
    const a=6+i,b=2+(i%3),ans=a+b;
    add('Algorithm Thinking','A program receives '+a+' and '+b+'. Which first step best represents the processing for a sum problem?',['Add the two inputs','Display a random value','Change the variable names','Skip input validation'],0,'Translate the requirement into a precise input-process-output sequence.','audio-question');
  }
  C_FUNDAMENTALS_DRILLS.splice(100);
})();



const C_FUNDAMENTALS_PRACTICE=[
 {title:'Output Prediction',kind:'mcq',prompt:'Predict the exact output before checking.',code:'int a = 8, b = 3;\\nprintf("%d %d", a+b, a%b);',options:['11 2','83 2','11 3','5 2'],answer:0,hint:'Evaluate + and % separately.'},
 {title:'Bug Fixing',kind:'bug',prompt:'Repair the scanf line. Type the corrected line in the editor.',code:'int age;\\nscanf("%d", age);',starter:'int age;\\nscanf("%d", age);',tests:[['18','18']],answerText:'scanf("%d", &age);',hint:'scanf needs the address of age.'},
 {title:'Missing Code',kind:'missing',prompt:'Complete the expression so average is calculated as a decimal.',code:'int total = 75, count = 2;\\ndouble average = ______;',options:['total/count','(double)total/count','total%count','(int)total/count'],answer:1,hint:'At least one operand must participate in floating-point division.'},
 {title:'Output Prediction',kind:'trace',prompt:'Trace the variables line by line. What is stored in result?',code:'int x = 5;\\nint y = 2;\\nint result = x / y;',options:['2','2.5','3','0'],answer:0,hint:'Both operands are integers.'},
 {title:'Coding Task',kind:'coding',prompt:'Write a complete C program that reads two integers and prints their sum.',starter:'#include <stdio.h>\\n\\nint main(void) {\\n    // write your code here\\n    return 0;\\n}',tests:[['7 5','12'],['20 22','42']],hint:'Read two ints, add them and print the result.'},
 {title:'Coding Task',kind:'coding',prompt:'Write a C program that reads three marks and prints the total.',starter:'#include <stdio.h>\\n\\nint main(void) {\\n    // read three marks\\n    // calculate total\\n    // print total\\n    return 0;\\n}',tests:[['10 20 30','60'],['35 40 25','100']],hint:'Use three int variables and add them.'},
 {title:'Bug Fixing',kind:'bug',prompt:'The program should print 14. Fix the expression and test it.',code:'int a=6, b=8;\\nprintf("%d", a*b);',options:['a+b','a-b','a*b','a/b'],answer:0,hint:'The requirement is addition, not multiplication.'},
 {title:'Code Completion',kind:'coding',prompt:'Complete the missing condition so the program prints PASS when mark is at least 40.',starter:'#include <stdio.h>\\nint main(void) {\\n    int mark = 56;\\n    if (__________)\\n        printf("PASS");\\n    else\\n        printf("FAIL");\\n    return 0;\\n}',tests:[['','PASS']],hint:'Use a relational expression involving mark and the boundary 40.'},
 {title:'Edge-Case Testing',kind:'mcq',prompt:'For a program that accepts marks from 0 to 100, which test set gives useful boundary coverage?',options:['50,60,70','0,1,99,100','25,50,75','10,40,80'],answer:1,hint:'Test the exact boundaries and values immediately inside them.'},
 {title:'Debugging Decision',kind:'mcq',prompt:'A program compiles but prints the wrong total. What should you inspect first?',options:['Logic and formula','Keyboard cable','Font family','File extension only'],answer:0,hint:'A compiling program can still contain logic errors.'}
];

const C_FUNDAMENTALS_PRACTICE_POOL=[
 ...C_FUNDAMENTALS_PRACTICE,
 {title:'Output Prediction — Variables',kind:'trace',prompt:'Predict the exact value printed.',code:'int a=12;\nint b=5;\nprintf("%d", a-b);',options:['7','17','60','2'],answer:0,hint:'Subtract b from a.'},
 {title:'Bug Fixing — scanf',kind:'bug',prompt:'Fix the input statement so n receives an integer.',starter:'#include <stdio.h>\nint main(void) {\n int n;\n scanf("%d", n);\n printf("%d", n);\n return 0;\n}',tests:[['25','25']],hint:'scanf needs the address of the variable.'},
 {title:'Missing Code — Comparison',kind:'missing',prompt:'Complete the condition so PASS prints when mark is 40 or higher.',starter:'#include <stdio.h>\nint main(void) {\n int mark=40;\n if (__________) printf("PASS");\n return 0;\n}',tests:[['','PASS']],hint:'Use the >= relational operator.'},
 {title:'Coding Task — Difference',kind:'coding',prompt:'Read two integers and print the first minus the second.',starter:'#include <stdio.h>\nint main(void) {\n int a,b;\n scanf("%d%d",&a,&b);\n // print the difference\n return 0;\n}',tests:[['9 4','5'],['20 7','13']],hint:'Print a-b.'},
 {title:'Coding Task — Even Check',kind:'coding',prompt:'Read an integer and print EVEN if it is divisible by 2, otherwise ODD.',starter:'#include <stdio.h>\nint main(void) {\n int n;\n scanf("%d",&n);\n // complete the decision\n return 0;\n}',tests:[['8','EVEN'],['7','ODD']],hint:'Use n % 2.'},
 {title:'Debugging Decision — Logic',kind:'mcq',prompt:'A condition should pass when both marks and attendance are valid. Which operator combines the two requirements?',options:['&&','||','!','%'],answer:0,hint:'Both requirements must be true.'},
 {title:'Output Prediction — Modulo',kind:'mcq',prompt:'What does this program print?',code:'int n=17;\nprintf("%d", n%5);',options:['2','3','5','12'],answer:1,hint:'Modulo gives the remainder.'},
 {title:'Code Completion — printf',kind:'coding',prompt:'Complete the program so it prints the value of total.',starter:'#include <stdio.h>\nint main(void) {\n int total=35;\n // print total\n return 0;\n}',tests:[['','35']],hint:'Use printf with the %d format.'},
 {title:'Edge-Case Testing — Average',kind:'mcq',prompt:'Which input is most useful for checking a pass condition at 40?',options:['39','40','41','80'],answer:1,hint:'Test the exact boundary.'},
 {title:'Bug Identification — Formula',kind:'bug',prompt:'The requirement is addition, but the program multiplies. Choose the corrected expression.',code:'int a=14,b=6;\nprintf("%d", a*b);',options:['a+b','a-b','a*b','a/b'],answer:0,hint:'The requirement says addition.'},
 {title:'Trace — Assignment',kind:'mcq',prompt:'What is the final value of x?',code:'int x=4;\nx=x+3;\nx=x*2;',options:['10','14','11','7'],answer:1,hint:'Trace 4 → 7 → 14.'},
 {title:'Syntax Check — Declaration',kind:'mcq',prompt:'Which declaration is valid?',options:['int total = 25;','integer total = 25;','int = total 25;','total int = 25;'],answer:0,hint:'Use the C type followed by the identifier.'},
 {title:'Coding Task — Three Values',kind:'coding',prompt:'Read three integers and print their total.',starter:'#include <stdio.h>\nint main(void) {\n int a,b,c;\n // read values and print their total\n return 0;\n}',tests:[['1 2 3','6'],['10 20 30','60']],hint:'Read a, b and c, then print a+b+c.'},
 {title:'Bug Fixing — Division',kind:'bug',prompt:'The program must calculate a decimal average. Choose the correct expression.',code:'int total=75,count=2;\nprintf("%.1f", total/count);',options:['total/count','(double)total/count','total%count','(int)total/count'],answer:1,hint:'Force floating-point division.'},
 {title:'Output Prediction — Condition',kind:'mcq',prompt:'What is printed?',code:'int mark=45;\nif(mark>=40) printf("PASS"); else printf("FAIL");',options:['PASS','FAIL','45','Error'],answer:0,hint:'45 meets the >=40 condition.'},
 {title:'Testing — Range',kind:'mcq',prompt:'For an input range 1 to 100, which set gives strong boundary coverage?',options:['20,40,60','1,2,99,100','25,50,75','10,30,80'],answer:1,hint:'Use exact boundaries and nearby values.'},
 {title:'Algorithm Thinking — IPO',kind:'mcq',prompt:'Before coding a problem, which three elements should be made explicit?',options:['Input, process, output','Font, colour, title','Keyboard, mouse, screen','File, folder, password'],answer:0,hint:'IPO gives the program a clear structure.'},
 {title:'Missing Code — Remainder',kind:'mcq',prompt:'Which expression tests whether n is even?',options:['n/2==0','n%2==0','n*2==0','n+2==0'],answer:1,hint:'An even integer has remainder zero when divided by 2.'},
 {title:'Debugging — Compile vs Logic',kind:'mcq',prompt:'The program compiles but produces the wrong result. What should you inspect first?',options:['Logic and formula','Monitor cable','Font size','File name'],answer:0,hint:'A compiling program can still contain logic errors.'},
 {title:'Coding Task — Larger Value',kind:'coding',prompt:'Read two integers and print the larger value.',starter:'#include <stdio.h>\nint main(void) {\n int a,b;\n // read a and b\n // print the larger value\n return 0;\n}',tests:[['7 5','7'],['12 19','19']],hint:'Compare a and b with if.'},
 {title:'Output Prediction — Precedence',kind:'mcq',prompt:'What is printed?',code:'int x=3+4*2;\nprintf("%d",x);',options:['11','14','10','9'],answer:0,hint:'Multiplication is evaluated before addition.'},
 {title:'Code Completion — Counter',kind:'coding',prompt:'Complete the loop so it prints 1 2 3.',starter:'#include <stdio.h>\nint main(void) {\n for(int i=1; ______; i++) printf("%d ",i);\n return 0;\n}',tests:[['','1 2 3 ']],hint:'Continue while i is at most 3.'},
 {title:'Bug Identification — Missing Semicolon',kind:'bug',prompt:'Which edit fixes the syntax error?',code:'int total = 10 + 20\nprintf("%d", total);',options:['Add ; after 20','Remove printf','Change int to integer','Add a comma after total'],answer:0,hint:'The declaration statement needs its terminating semicolon.'},
 {title:'Trace — Integer Division',kind:'mcq',prompt:'What is stored in result?',code:'int result=9/2;',options:['4','4.5','5','2'],answer:0,hint:'Both operands are int.'},
 {title:'Coding Task — Pass or Fail',kind:'coding',prompt:'Read mark and print PASS for mark >= 40, otherwise FAIL.',starter:'#include <stdio.h>\nint main(void) {\n int mark;\n // read mark and print PASS or FAIL\n return 0;\n}',tests:[['40','PASS'],['39','FAIL']],hint:'Use an if-else decision with mark >= 40.'}
];

const C_MODULES=[
 {id:1,title:'C Fundamentals',scope:'Build a strong foundation in C so that a beginner can read, write, compile, trace and explain simple programs confidently.',
  topics:['Programming mindset and problem statements','C program structure','main(), statements and blocks','Variables, constants and identifiers','Data types and type conversion','Operators and expressions','Input and output with printf/scanf','Compilation, errors and debugging basics'],
  materials:['Concept notes: From problem to C program','Syntax map: data types, variables and operators','Worked examples with line-by-line explanation','Common beginner mistakes and correction guide'],
  drills:['Identify valid/invalid identifiers','Predict the type and value of an expression','Trace variable values after each statement','Write printf/scanf statements','Convert simple algorithms into C statements'],
  practice:['Level 1 — guided fill-in-the-code drills','Level 2 — write small programs from examples','Level 3 — trace-and-predict output','Level 4 — mixed foundation drill','Level 5 — timed mini challenge'],
  challenge:'Create a small menu-driven calculator using variables, input, operators and formatted output.',
  assessment:'15-question mastery check: concepts, syntax, output prediction, debugging and short code construction.'},
 {id:2,title:'Control Flow',scope:'Learn to make programs take decisions, repeat actions and combine conditions without losing track of program flow.',
  topics:['Relational and logical operators','if, if-else and nested decisions','else-if ladders','switch-case','for, while and do-while loops','break and continue','Nested loops','Tracing control flow'],
  materials:['Decision-making flowchart guide','Loop dry-run worksheet','Worked examples: grading, menus and counters','Debugging guide for infinite and off-by-one loops'],
  drills:['Choose the correct condition','Trace if-else branches','Predict loop output','Find loop boundary errors','Convert repeated code into a loop'],
  practice:['Level 1 — condition drills','Level 2 — loop tracing','Level 3 — pattern/output drills','Level 4 — nested-loop practice','Level 5 — timed control-flow challenge'],
  challenge:'Build a number analysis program that reports factors, prime status, digit count and digit sum using decisions and loops.',
  assessment:'15-question mastery check covering decisions, loops, tracing, debugging and nested control flow.'},
 {id:3,title:'Arrays',scope:'Move from one value at a time to organised collections of data and learn to process them systematically.',
  topics:['Array declaration and indexing','Initialisation and traversal','Input/output with arrays','Sum, average, minimum and maximum','Searching','Sorting basics','Frequency counting','Two-dimensional arrays and matrices'],
  materials:['Array memory/index visual guide','Traversal patterns','Worked programs for search and statistics','Matrix operation examples'],
  drills:['Predict array element values','Find index errors','Trace traversal loops','Write sum/min/max logic','Count frequencies'],
  practice:['Level 1 — indexing drills','Level 2 — traversal drills','Level 3 — search and statistics','Level 4 — sorting and frequency problems','Level 5 — mixed timed array drill'],
  challenge:'Build a student marks analyser that calculates total, average, highest/lowest mark, grade counts and rank order.',
  assessment:'15-question mastery check on indexing, traversal, search, sorting, frequency and matrix reasoning.'},
 {id:4,title:'Functions & Modular Programming',scope:'Learn to break a program into small reusable functions and reason about parameters, return values and scope.',
  topics:['Why functions matter','Function declaration and definition','Parameters and arguments','Return values','void functions','Local and global scope','Function prototypes','Call flow and modular design'],
  materials:['Function anatomy reference','Parameter/return-value diagrams','Worked examples: calculator and statistics','Modular-program design checklist'],
  drills:['Match parameters with arguments','Predict returned values','Trace nested function calls','Identify scope errors','Complete missing function bodies'],
  practice:['Level 1 — function syntax drills','Level 2 — call-and-return tracing','Level 3 — decomposition exercises','Level 4 — multi-function programs','Level 5 — timed modular coding drill'],
  challenge:'Refactor a single long program into reusable functions for input, calculation, validation and reporting.',
  assessment:'15-question mastery check on declarations, calls, parameters, return values, scope and modular design.'},
 {id:5,title:'Pointers',scope:'Develop a safe mental model of addresses, pointers, dereferencing and how functions can work with memory.',
  topics:['Address and memory concepts','Pointer declaration and initialisation','& and * operators','Dereferencing','Pointers and functions','Call by value versus modifying through pointers','Pointer arithmetic basics','Pointers with arrays'],
  materials:['Memory-box visual walkthrough','Address/dereference tracing sheets','Worked swap and update examples','Pointer safety checklist'],
  drills:['Match variables to addresses','Predict *p values','Trace pointer updates','Find uninitialised pointer mistakes','Trace pointer-array relationships'],
  practice:['Level 1 — address/dereference drills','Level 2 — pointer tracing','Level 3 — swap and update exercises','Level 4 — arrays and pointers','Level 5 — pointer debugging challenge'],
  challenge:'Write reusable functions to swap values, update statistics and process an array using pointers.',
  assessment:'15-question mastery check on addresses, dereferencing, functions, arrays and pointer tracing.'},
 {id:6,title:'Structures, Unions & User-Defined Types',scope:'Represent real-world records cleanly and choose suitable user-defined data structures.',
  topics:['Structure declaration and objects','Members and member access','Arrays of structures','Nested structures','typedef','Passing structures to functions','Union basics','Choosing structure versus union'],
  materials:['Record-modelling guide','Structure memory illustrations','Worked student/employee record examples','typedef and union comparison sheet'],
  drills:['Select suitable fields','Trace member access','Complete structure declarations','Process arrays of records','Identify structure/union misuse'],
  practice:['Level 1 — declaration drills','Level 2 — record input/output','Level 3 — arrays of structures','Level 4 — functions with structures','Level 5 — integrated record-management drill'],
  challenge:'Create a small student record system that stores, searches, updates and reports student information.',
  assessment:'15-question mastery check on structures, arrays of structures, functions, typedef and unions.'},
 {id:7,title:'Dynamic Memory & Memory Management',scope:'Understand why dynamic memory is needed and use malloc/calloc/realloc/free with disciplined ownership.',
  topics:['Stack versus heap idea','malloc and calloc','realloc','free','NULL checks','Memory leaks','Dangling pointers','Dynamic arrays and safe memory handling'],
  materials:['Heap/stack visual explanation','Allocation lifecycle checklist','Worked dynamic-array examples','Memory-leak and dangling-pointer guide'],
  drills:['Choose the correct allocation function','Trace allocated memory','Identify missing free calls','Find use-after-free mistakes','Predict realloc outcomes'],
  practice:['Level 1 — allocation vocabulary','Level 2 — pointer/heap tracing','Level 3 — dynamic array exercises','Level 4 — debugging memory problems','Level 5 — timed memory-management challenge'],
  challenge:'Create a dynamically sized marks list that grows as needed, calculates statistics and releases all allocated memory safely.',
  assessment:'15-question mastery check on allocation, resizing, NULL checks, leaks and safe release.'},
 {id:8,title:'File Handling',scope:'Store and retrieve information beyond program execution using text and binary file operations.',
  topics:['Why files are needed','FILE pointers','fopen and fclose','Read/write modes','fprintf/fscanf','fgets/fputs','fread/fwrite basics','Error checking and file safety'],
  materials:['File-mode decision chart','Text-file workflow guide','Worked read/write examples','File-error debugging checklist'],
  drills:['Choose the correct file mode','Trace file operations','Identify missing fclose/error checks','Predict text output','Convert console data to file storage'],
  practice:['Level 1 — file API recognition','Level 2 — text read/write drills','Level 3 — record storage','Level 4 — search/update file exercises','Level 5 — timed file-handling challenge'],
  challenge:'Build a simple student-record file utility that writes records, reads them back and searches by register number.',
  assessment:'15-question mastery check on file pointers, modes, text I/O, errors and safe closing.'},
 {id:9,title:'Strings',scope:'Master character arrays and string operations through careful tracing, drills and progressive coding practice.',
  topics:['Character arrays and null terminator','String input','strlen, strcpy, strcat, strcmp','Manual string traversal','Searching and counting characters','Palindrome and reverse logic','Token/word processing','Common string bugs'],
  materials:['String memory and null-terminator visual','Function reference sheet','Worked tracing examples','String debugging checklist'],
  drills:['Count characters manually','Trace null terminators','Predict library-function results','Find buffer/input mistakes','Write character-frequency logic'],
  practice:['Level 1 — character and indexing drills','Level 2 — library-function drills','Level 3 — manual string-processing drills','Level 4 — mixed string challenges','Level 5 — timed string mastery drill'],
  challenge:'Create a text analyser that counts characters, words, vowels, digits and repeated characters and reports useful statistics.',
  assessment:'15-question mastery check on representation, library functions, tracing, bugs and string algorithms.'},
 {id:10,title:'Advanced C',scope:'Integrate earlier skills into robust programs and develop the confidence to read unfamiliar C code, debug it and extend it.',
  topics:['Preprocessor and macros','const and scope review','Command-line arguments','Function pointers introduction','Bitwise operators','Enumerations and advanced user-defined types','Defensive programming','Reading and debugging unfamiliar code'],
  materials:['Advanced C quick-reference','Bitwise operation visual guide','Function-pointer concept map','Code-review and debugging checklist'],
  drills:['Predict bitwise results','Trace macros and constants','Read unfamiliar functions','Identify unsafe assumptions','Choose the correct debugging strategy'],
  practice:['Level 1 — advanced syntax recognition','Level 2 — trace unfamiliar code','Level 3 — bitwise drills','Level 4 — integrated debugging','Level 5 — timed advanced-code challenge'],
  challenge:'Analyse and improve a partially working C program: identify defects, explain them, fix them and add one useful feature.',
  assessment:'15-question cumulative mastery check combining concepts, output prediction, debugging and applied reasoning.'}
];

const TRACKS=[
 {id:'communication',title:'Communication',icon:'💬',description:'Build accurate, confident and professional communication skills.',modules:['Grammar & Usage','Vocabulary & Word Usage','Reading Comprehension','Listening Skills','Speaking Skills','Professional Communication','Presentation Skills','Group Discussion','Workplace Writing','Integrated Communication']},
 {id:'aptitude',title:'Aptitude',icon:'🧮',description:'Develop quantitative, logical and data-driven problem-solving ability.',modules:['Number Sense & Estimation','Algebraic Reasoning','Sequences & Patterns','Ratio, Proportion & Variation','Data Interpretation','Logical Reasoning','Quantitative Word Problems','Probability & Uncertainty Basics','Geometry & Spatial Reasoning','Quantitative Decision Making']},
 {id:'core-engineering',title:'Core Engineering',icon:'⚙️',description:'Build a common first-year engineering foundation in measurement, materials, systems, design, safety and documentation.',modules:['Engineering Measurement','Engineering Materials','Basic Electrical Systems','Mechanical Systems & Motion','Thermal Engineering Basics','Digital Systems & Logic','Engineering Design Process','Sustainability in Engineering','Engineering Safety & Risk','Engineering Tools & Documentation']},
 {id:'c-programming',title:'C Programming',icon:'💻',description:'Progress from C fundamentals to structured programming, memory and advanced problem solving.',modules:C_PROGRAMMING},
 {id:'problem-solving',title:'Problem Solving',icon:'🧩',description:'Learn to define, decompose, model, test, debug and optimise unfamiliar problems systematically.',modules:['Problem Definition','Decomposition','Abstraction','Algorithms & Procedures','Pattern Recognition','Root-Cause Analysis','Constraint-Based Solutions','Iteration & Debugging','Solution Evaluation','Engineering Challenge Strategy']},
 {id:'analytical',title:'Analytical Skills',icon:'🎧',description:'Read, listen, interpret evidence and make reasoned analytical decisions.',modules:['Observation & Evidence','Data Quality','Trends & Relationships','Inference & Hypothesis','Critical Reading of Technical Information','Graphs & Visual Analytics','Decision Analysis','Ethics & Engineering Judgement','Systems Thinking','Integrated Analytical Reasoning']}
];

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function progressMap(data){return data?.tracks||{};}

function renderPortal(root){
 root.innerHTML='<div class="competencyPortal">'+
  '<div class="competencyHero"><div><span class="sectionEyebrow">FXEC · FIRST-YEAR ENGINEERING</span><h2>Reward Points Portal</h2><p>One complete learning system across six competencies. Every module is designed for mastery: <b>Concept → Example → Guided Drill → Practice → Knowledge Check → Challenge → Assess → XP</b>.</p></div>'+
  '<div class="competencyHeroStats"><div><strong>6</strong><span>Competencies</span></div><div><strong>60</strong><span>Learning Modules</span></div><div><strong>60</strong><span>Module Assessments</span></div></div><small class="portalBuildStamp">PORTAL BUILD 2026.09.30 · FINAL QA · MODULE FLOW</small></div>'+
  '<div class="competencyFlowLarge"><span>CONCEPT</span><i>→</i><span>EXAMPLE</span><i>→</i><span>GUIDED DRILL</span><i>→</i><span>PRACTISE</span><i>→</i><span>CHECK</span><i>→</i><span>CHALLENGE</span><i>→</i><span>ASSESS</span></div>'+
  '<div class="competencyTrackGrid" id="competencyTrackGrid"></div><section class="dashboardLeaderboardSection"><div class="moduleSectionHeading"><div><span class="sectionEyebrow">STUDENT PERFORMANCE</span><h4>🏆 Top Performers Across Competencies</h4><p>Recognise sustained learning, assessment performance and practice rewards.</p></div></div><div class="dashboardLeaderboardGrid" id="dashboardLeaderboardGrid"><div class="leaderboardLoading">Loading top performers…</div></div></section><div id="competencyWorkspace"></div></div>';
 const grid=root.querySelector('#competencyTrackGrid');
 grid.innerHTML=TRACKS.map((t,i)=>'<article class="competencyTrackCard" data-track="'+esc(t.id)+'"><div class="competencyTrackIcon">'+t.icon+'</div><div class="competencyTrackNo">0'+(i+1)+'</div><h3>'+esc(t.title)+'</h3><p>'+esc(t.description)+'</p><div class="competencyTrackMeta"><span>10 modules</span><span>10 assessments</span></div><div class="trackProgress"><span data-p="'+esc(t.id)+'" style="width:0%"></span></div><small data-pl="'+esc(t.id)+'">Loading progress…</small></article>').join('');
 grid.querySelectorAll('[data-track]').forEach(card=>card.onclick=()=>openTrack(root,card.dataset.track));
 loadProgress(root);
 loadDashboardLeaderboards(root);
}

async function loadDashboardLeaderboards(root){
 const box=root.querySelector('#dashboardLeaderboardGrid');if(!box)return;
 try{
  const rows=await Promise.all(TRACKS.map(async t=>{try{const r=await call('getCompetencyLeaderboard')({trackId:t.id});return {track:t,items:(r.data?.items||[]).slice(0,3)};}catch(e){return {track:t,items:[]};}}));
  box.innerHTML=rows.map(x=>'<article class="dashboardLeaderboardCard"><div class="dashboardLeaderboardHead"><span>'+x.track.icon+'</span><strong>'+esc(x.track.title)+'</strong></div>'+(x.items.length?x.items.map(i=>'<div class="dashboardLeaderboardRow"><b>#'+i.rank+'</b><span><strong>'+esc(i.displayName)+'</strong><small>'+esc(i.displayClass||'Class not set')+'</small></span><strong>'+Number(i.totalPoints).toFixed(2)+' pts</strong></div>').join(''):'<p class="leaderboardLoading">No ranked students yet.</p>')+'</article>').join('');
 }catch(e){box.innerHTML='<div class="leaderboardLoading">Top performers will appear after recorded activity.</div>';}
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
 // Quick-access cards can fire before the portal markup has been rendered.
 // Re-render the portal if the workspace mount is missing instead of throwing.
 let ws=root?.querySelector?.('#competencyWorkspace');
 if(!ws && root){
   renderPortal(root);
   ws=root.querySelector('#competencyWorkspace');
 }
 if(!ws)return;
 const grid=root.querySelector('#competencyTrackGrid');
 const leaderboard=root.querySelector('.dashboardLeaderboardSection');
 ws.innerHTML='<section class="competencyWorkspace"><div class="workspaceHeader"><div><span class="sectionEyebrow">COMPETENCY PROGRAMME</span><h3>'+esc(track.title)+'</h3><p>'+esc(track.description)+'</p></div><button class="secondary" id="closeTrack">← All Competencies</button></div>'+
  (track.programmeWise?programmeChooser():'')+
  '<div id="moduleArea">'+(track.programmeWise?'<div class="moduleLocked">Select your programme above to open your department-specific Core Engineering modules.</div>':moduleGrid(track,null))+'</div></section>';
 grid.hidden=true;
 grid.setAttribute('aria-hidden','true');
 if(leaderboard)leaderboard.hidden=true;
 if(leaderboard)leaderboard.setAttribute('aria-hidden','true');
 ws.hidden=false;
 ws.removeAttribute('aria-hidden');
 ws.querySelector('#closeTrack').onclick=()=>{
   ws.innerHTML='';
   ws.hidden=true;
   ws.setAttribute('aria-hidden','true');
   grid.hidden=false;
   grid.removeAttribute('aria-hidden');
   if(leaderboard)leaderboard.hidden=false;
   if(leaderboard)leaderboard.removeAttribute('aria-hidden');
   root.closest('#firstYearCompetencyPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
 };
 if(track.programmeWise){
  ws.querySelector('#programmeSelect').onchange=e=>{
   const value=e.target.value;
   ws.querySelector('#moduleArea').innerHTML=value?moduleGrid(track,PROGRAMMES.find(p=>p.id===value)):'<div class="moduleLocked">Select your programme above to open your department-specific Core Engineering modules.</div>';
  };
 }
 root.closest('#firstYearCompetencyPanel')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function programmeChooser(){
 return '<div class="programmeChooser"><div><span class="sectionEyebrow">CORE ENGINEERING</span><h4>Choose Your Programme</h4><p>Core Engineering content and assessments are organised by the student’s engineering programme.</p></div><select id="programmeSelect"><option value="">Select your programme</option>'+PROGRAMMES.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.title)+'</option>').join('')+'</select></div>';
}

function moduleGrid(track,programme){
 const assessmentCount=track.id==='c-programming'?15:10;
 return '<div class="moduleProgrammeBanner">'+(programme?'<span>PROGRAMME</span><strong>'+esc(programme.title)+'</strong>':'<span>COMPETENCY PATHWAY</span><strong>'+esc(track.title)+'</strong>')+'</div>'+
  '<div class="moduleSectionHeading"><div><span class="sectionEyebrow">MODULE LEARNING PATH</span><h4>Every module keeps its own learning flow</h4><p>Topic → materials → guided drills → practice → challenge → final assessment. Drill Stars belong only to Guided Drills.</p></div><span class="practiceBadge">'+track.modules.length+' MODULE ASSESSMENTS</span></div>'+
  '<div class="moduleGrid">'+track.modules.map((m,i)=>'<article class="learningModuleCard"><div class="moduleTop"><span>MODULE '+String(i+1).padStart(2,'0')+'</span><b>FINAL ASSESSMENT · '+assessmentCount+'</b></div><h5>'+esc(m)+'</h5><div class="moduleFlow"><span>Topic</span><i>→</i><span>Materials</span><i>→</i><span>Drills</span><i>→</i><span>Practice</span><i>→</i><span>Challenge</span><i>→</i><span>Assessment</span></div><div class="moduleAssessmentMeta"><span><b>'+assessmentCount+'</b> questions / student</span><span><b>50</b> master questions</span>'+(track.id==='c-programming'?'<span class="codingMeta">⌨ coding practice</span>':'')+'</div><div class="moduleBottom"><small>Master question bank belongs to Module '+(i+1)+'</small><button class="moduleOpen" data-track="'+esc(track.id)+'" data-module="'+(i+1)+'">Open Module '+(i+1)+' →</button></div></article>').join('')+'</div>';
}

function openModule(root,trackId,moduleNo,programme){
 const track=TRACKS.find(x=>x.id===trackId); if(!track)return;
 const title=track.modules[moduleNo-1]||'Module';
 const data=trackId==='c-programming'?C_MODULES[moduleNo-1]:genericModule(title,track.title,moduleNo);
 const ws=root.querySelector('#competencyWorkspace');
 ws.innerHTML=moduleView(track,data,moduleNo,programme);
 ws.querySelector('#backToModules').onclick=()=>openTrack(root,trackId);
 ws.querySelector('#startAssessment').onclick=()=>launchModuleAssessment(trackId,moduleNo,ws);
 ws.querySelectorAll('.drillReveal').forEach(b=>b.onclick=()=>showDrill(b));
 ws.querySelectorAll('.addDrillsButton').forEach(b=>b.onclick=()=>addTenDrills(b.closest('.drillRewardBar')?.parentElement?.querySelector('.drillCard')?.dataset.module||'C Fundamentals',b.closest('.drillRewardBar')));
 ws.querySelectorAll('.checkAnswer').forEach(b=>b.onclick=()=>checkPracticeAnswer(b));
 ws.querySelectorAll('.materialToggle').forEach(b=>b.onclick=()=>toggleMaterial(b));
 wirePracticeTasks(ws);
 wireCommunicationAudioLab(ws);
 loadCompetencyLeaderboard(ws,trackId);
 ws.scrollIntoView({behavior:'smooth',block:'start'});
}

const GENERIC_MODULE_BLUEPRINTS = {
 aptitude:[
  {focus:'Estimate and calculate confidently with integers, fractions, decimals and place value before using a calculator.',topics:['Place value and signed numbers','Fractions and decimals','Factors, multiples, HCF and LCM','Remainders and divisibility','Estimation and order of magnitude'],example:'A laboratory receives 48 boxes containing 125 components each. Estimate the total first, then calculate it exactly and compare the two results.'},
  {focus:'Translate relationships between quantities into algebraic expressions and equations, then verify the solution.',topics:['Variables and algebraic expressions','Linear equations and inequalities','Simultaneous linear equations','Quadratic relationships and roots','Algebraic modelling and verification'],example:'Two sensor packages cost ₹1,800 together. One costs ₹300 more than the other. Define variables, form equations and verify both prices.'},
  {focus:'Recognise numerical sequences and patterns, explain the rule and use it to predict or test later terms.',topics:['Arithmetic sequences','Geometric sequences','Recursive rules','Difference and ratio patterns','Pattern validation and exceptions'],example:'A calibration reading changes 4, 7, 10, 13. Identify the rule, predict the next two readings and explain how you would test whether the pattern continues.'},
  {focus:'Reason about proportional relationships and distinguish direct, inverse and percentage-based change.',topics:['Equivalent ratios','Direct proportion','Inverse proportion','Percentage change','Scale factors and unit rates'],example:'A pump delivers 240 L in 6 minutes at constant rate. Find the delivery for 15 minutes and state the assumption that makes proportional reasoning valid.'},
  {focus:'Read tables and charts, calculate relevant quantities and communicate what the data actually supports.',topics:['Table extraction','Bar and line charts','Percentages and proportions','Mean and comparison','Trend and anomaly interpretation'],example:'Given weekly energy-use data for a laboratory, calculate the percentage change, identify the highest week and distinguish a trend from a single spike.'},
  {focus:'Use formal and informal logic to evaluate conditions, sequences, relationships and conclusions.',topics:['Statements and truth conditions','Conditional reasoning','Syllogisms','Ordering and arrangement','Necessary versus sufficient conditions'],example:'If every calibrated sensor passes a verification test and Sensor A is calibrated, determine what follows and what does not follow.'},
  {focus:'Convert realistic word problems into known quantities, unknowns, equations and a checked solution.',topics:['Identifying quantities','Unit-rate models','Time-work problems','Motion problems','Multi-step validation'],example:'Two technicians complete a maintenance task at different rates. Model the combined rate, calculate the completion time and check the units.'},
  {focus:'Understand probability as a measure of uncertainty and distinguish equally likely outcomes from conditional situations.',topics:['Sample spaces','Basic probability','Complementary events','Independent events','Conditional probability and expected value'],example:'A quality check selects one component from a batch containing known pass and fail counts. Calculate the probability of selecting a pass and explain the assumption behind the model.'},
  {focus:'Apply geometric relationships to dimensions, area, volume, angles and spatial constraints in engineering contexts.',topics:['Angles and triangles','Perimeter and area','Similarity and scale','Volume and surface area','Coordinate and spatial reasoning'],example:'A rectangular enclosure must fit around a cylindrical component. Calculate available area and identify which dimension creates the binding constraint.'},
  {focus:'Make quantitative decisions by defining criteria, comparing alternatives and checking the sensitivity of the conclusion.',topics:['Decision criteria','Weighted scores','Cost-benefit comparison','Sensitivity analysis','Quantitative justification'],example:'Compare two campus lighting options using installation cost, annual energy use and expected life; explain how changing the energy-price assumption affects the decision.'}
 ],
 'core-engineering':[
  {focus:'Use SI units, dimensions, measurement instruments and uncertainty to produce trustworthy engineering measurements.',topics:['SI base and derived units','Instrument range and resolution','Accuracy and precision','Significant figures','Uncertainty and repeatability'],example:'Three measurements of a shaft diameter are 12.01, 12.03 and 12.02 mm. Report a suitable value and discuss repeatability without claiming more precision than the instrument supports.'},
  {focus:'Relate material structure and properties to engineering selection rather than memorising material names.',topics:['Metals and alloys','Polymers','Ceramics and glass','Composites','Strength, stiffness, toughness and density'],example:'Select a material for a lightweight protective enclosure and justify the choice using at least three relevant properties and one manufacturing constraint.'},
  {focus:'Explain basic electrical quantities and safe circuit behaviour using voltage, current, resistance and power.',topics:['Charge, voltage and current','Resistance and Ohm’s law','Series and parallel circuits','Electrical power and energy','Measurement and safety'],example:'A 12 V supply feeds two resistors in series. Determine current and power, then identify a safe measurement method.'},
  {focus:'Connect force, motion, work and mechanical components to the behaviour of simple engineering systems.',topics:['Force and equilibrium','Motion and acceleration','Work and power','Gears, shafts and bearings','Mechanical efficiency'],example:'A motor drives a load through a gear reduction. Explain how speed, torque and power change while accounting for efficiency.'},
  {focus:'Use temperature, heat, energy and efficiency concepts to reason about thermal systems.',topics:['Temperature and heat','Conduction, convection and radiation','Specific heat capacity','Thermal efficiency','Heat-loss reasoning'],example:'Compare two enclosure materials for reducing heat transfer and explain which heat-transfer mode dominates under the stated conditions.'},
  {focus:'Represent digital systems with logic levels, Boolean operations and simple combinational circuits.',topics:['Binary and logic levels','AND, OR and NOT','Truth tables','Boolean expressions','Combinational decision circuits'],example:'A safety interlock activates only when the guard is closed and the enable switch is on. Write the Boolean condition and truth table.'},
  {focus:'Follow a disciplined engineering design process from requirements through concept selection, prototype and verification.',topics:['Need and problem statement','Requirements and constraints','Concept generation','Selection criteria','Prototype and verification'],example:'Design a low-cost classroom energy monitor. Write measurable requirements, compare two concepts and propose a verification test.'},
  {focus:'Evaluate engineering choices through resource use, life-cycle effects, energy, waste and practical constraints.',topics:['Resource efficiency','Energy use','Waste and circularity','Life-cycle thinking','Sustainability trade-offs'],example:'Compare two packaging designs by material mass, reuse potential and transport impact, while identifying an assumption that could change the result.'},
  {focus:'Identify hazards, assess risk and choose controls using a systematic engineering safety process.',topics:['Hazard versus risk','Likelihood and consequence','Risk controls','PPE and procedures','Incident learning'],example:'A laboratory uses a rotating machine with an exposed moving part. Identify the hazard, describe the risk and select controls in priority order.'},
  {focus:'Create clear engineering documentation that another person can interpret, verify and use safely.',topics:['Technical descriptions','Block and flow diagrams','Tables and specifications','Revision control','Engineering reports and records'],example:'Turn a maintenance activity into a concise technical record containing equipment ID, observed condition, action, measurement and verification.'}
 ],
 'problem-solving':[
  {focus:'Turn an ambiguous situation into a measurable problem with a clear user, goal, boundary and success criterion.',topics:['Stakeholder and need','Current state','Desired state','Constraints','Measurable success criteria'],example:'Replace “students wait too long for certificates” with a problem statement specifying who is affected, current delay, desired target and system constraints.'},
  {focus:'Decompose complex work into smaller subproblems while preserving dependencies, interfaces and the overall objective.',topics:['Functional decomposition','Subproblem boundaries','Dependencies','Interfaces','Integration checks'],example:'Decompose a student assessment system into registration, question delivery, submission, scoring and reporting, then identify two dependencies.'},
  {focus:'Create useful abstractions that preserve what matters for the decision while removing irrelevant detail.',topics:['Relevant variables','Abstraction levels','Models','Inputs and outputs','Information hiding'],example:'Model a campus shuttle service for timetable planning using only variables that affect arrival time and capacity.'},
  {focus:'Design finite, clear and testable procedures using sequence, selection, iteration and termination.',topics:['Algorithm inputs and outputs','Ordered steps','Conditions','Loops and termination','Traceability to requirements'],example:'Develop a procedure for finding the highest of three measurements and specify how you would test every possible ordering.'},
  {focus:'Detect recurring structures and invariants, then verify that a proposed pattern actually holds.',topics:['Repetition and regularity','Differences and ratios','Categories','Invariants','Counterexamples'],example:'Two different maintenance schedules show the same repeating constraint. Identify the invariant and give a case that would disprove the pattern.'},
  {focus:'Find the underlying cause of a failure by separating symptoms, contributing factors and root causes.',topics:['Symptom versus cause','Five Whys','Cause-and-effect chains','Evidence collection','Corrective action'],example:'A prototype overheats after 20 minutes. Build a cause chain and identify the evidence needed before blaming the motor.'},
  {focus:'Design solutions that remain valid when resources, time, safety, capacity or other constraints change.',topics:['Constraint identification','Hard versus soft constraints','Feasible region','Trade-offs','Constraint testing'],example:'Choose a delivery route subject to vehicle capacity, time window and road restrictions; explain which constraints are non-negotiable.'},
  {focus:'Debug iteratively by reproducing a failure, forming a hypothesis, changing one variable and regression-testing the fix.',topics:['Reproduction','Minimal test case','Hypothesis','Controlled change','Regression test'],example:'A program fails only for an empty input. Build a minimal reproduction, propose one hypothesis and choose a test that could confirm it.'},
  {focus:'Evaluate solutions against requirements, evidence, edge cases and resource use rather than judging by whether they work once.',topics:['Requirement coverage','Correctness','Robustness','Efficiency','Verification evidence'],example:'Two solutions produce the same normal-case output. Compare their boundary behaviour and explain which evidence is needed before adoption.'},
  {focus:'Use a repeatable strategy for unfamiliar engineering challenges from framing through validation and communication.',topics:['Clarify','Decompose','Model','Solve','Test and communicate'],example:'Take a campus queue problem from stakeholder interview to measurable requirement, solution options, test plan and final recommendation.'}
 ],
 analytical:[
  {focus:'Extract explicit facts, quantities, conditions and relationships without mixing observations with assumptions.',topics:['Observed facts','Quantities and labels','Conditions','Relevant versus irrelevant information','Structured evidence notes'],example:'From a project brief, list only stated dates, measured values, constraints and deliverables before interpreting what they mean.'},
  {focus:'Judge whether data is complete, reliable, comparable and appropriate for the conclusion being considered.',topics:['Source and provenance','Missing data','Measurement quality','Sampling and bias','Comparability'],example:'Two departments report attendance using different counting rules. Decide whether their percentages can be compared directly and identify the missing information.'},
  {focus:'Identify genuine trends and relationships while distinguishing them from noise, outliers or changes in scale.',topics:['Trend','Rate of change','Correlation','Outlier','Baseline comparison'],example:'A chart shows energy use rising for three weeks and then dropping sharply. Separate the observed pattern from explanations that require additional evidence.'},
  {focus:'Form testable hypotheses and draw only conclusions justified by the available evidence.',topics:['Hypothesis','Evidence threshold','Inference','Alternative explanation','Confidence and uncertainty'],example:'A machine produces fewer defects after a process change. State a testable hypothesis and two alternative explanations that should be checked.'},
  {focus:'Read technical claims critically by separating evidence, assumptions, definitions, limitations and conclusions.',topics:['Claim and evidence','Definitions','Assumptions','Method limitations','Counterevidence'],example:'A report claims a new material is “more efficient.” Identify what must be defined and measured before accepting the claim.'},
  {focus:'Read graphs and visual displays accurately, including scale, axes, aggregation, anomalies and misleading presentation.',topics:['Axes and units','Scale','Trend lines','Aggregation','Visual distortion'],example:'A bar chart begins its vertical axis at 90 rather than zero. Explain how that choice can affect visual interpretation without changing the underlying values.'},
  {focus:'Make transparent decisions by defining criteria, weighting evidence and checking alternatives and sensitivity.',topics:['Decision criteria','Evidence weighting','Trade-offs','Sensitivity','Decision rationale'],example:'Compare two project tools using reliability, cost and learning time. Show how a change in criterion weight could alter the recommendation.'},
  {focus:'Apply evidence-based judgement to engineering choices involving safety, fairness, uncertainty and competing responsibilities.',topics:['Evidence and values','Safety priority','Fairness','Uncertainty','Professional responsibility'],example:'A cheaper component has less test evidence. Identify the engineering judgement issue and the evidence needed before selection.'},
  {focus:'Understand how changes in one part of an engineering system can propagate through connected components and feedback loops.',topics:['Components and interactions','Dependencies','Feedback','Bottlenecks','System boundaries'],example:'Increasing server capacity removes one delay but exposes a slower database. Explain the system interaction and why the bottleneck moved.'},
  {focus:'Integrate multiple sources and produce a defensible conclusion that separates evidence, uncertainty and recommendation.',topics:['Multi-source synthesis','Evidence matrix','Conflicting sources','Uncertainty statement','Conclusion and recommendation'],example:'Combine a memo, a data table and a spoken project update into an evidence brief that states one conclusion and one unresolved uncertainty.'}
 ]
};
function buildGenericActivities(trackKey,moduleNo,title,b){
 const topics=Array.isArray(b.topics)?b.topics.filter(Boolean):[];
 const focus=String(b.focus||'Build the skill through understanding, guided practice and transfer.');
 const example=String(b.example||'Apply the skill to a realistic first-year engineering situation.');
 const prefix=trackKey+'-D'+moduleNo+'-';
 const drills=[
  {category:'1 · Understand',prompt:'Teach '+topics[0]+': which statement best captures the idea a learner must understand before applying it?',options:[topics[0]+' as a skill used to interpret the stated problem and evidence.', 'A fact to memorise without context.','A shortcut that removes the need to inspect conditions.','A rule that is valid regardless of the situation.'],answer:0,explanation:'The first drill establishes the meaning and conditions of the first taught concept before application.'},
  {category:'2 · Guided Application',prompt:'Apply '+topics[1]+'. In this module example — '+example+' — which action should happen first?',options:['Identify the relevant quantities, conditions or evidence before choosing the method.','Choose an answer before reading the conditions.','Copy a previous answer even when the inputs differ.','Ignore units, constraints or definitions.'],answer:0,explanation:'Application begins by mapping the real situation to the concept taught in the material.'},
  {category:'3 · Analyse / Verify',prompt:'A learner has applied '+topics[2]+'. Which check would provide the strongest evidence that the result is defensible?',options:['Test the result against the stated conditions, evidence, units or success criterion.','Accept it because the method looked familiar.','Change several assumptions simultaneously.','Use only the first intermediate value.'],answer:0,explanation:'Verification must use an independent check connected to the actual requirement and evidence.'},
  {category:'4 · Diagnose',prompt:'A solution using '+topics[3]+' works for one case but fails for another. What should the learner do first?',options:['Reproduce the failure with a small controlled case and identify the changed condition.','Rewrite the entire solution immediately.','Ignore the failed case.','Change several variables at once.'],answer:0,explanation:'Controlled comparison isolates the condition responsible for the failure instead of encouraging guessing.'},
  {category:'5 · Transfer',prompt:'A new engineering situation depends on '+topics[4]+'. Which response demonstrates transfer?',options:['Adapt the underlying concept to the new conditions, justify the choice and verify the result.','Copy the worked example unchanged.','Use a memorised answer without checking the context.','Choose the fastest-looking method without identifying the requirement.'],answer:0,explanation:'Transfer means recognising the underlying principle, adapting it to new conditions and checking the outcome.'}
 ];
 return {
  drills:drills.map((q,i)=>({...q,id:prefix+'DR'+(i+1),learningOutcomeId:prefix+'LO'+(i+1),materialId:prefix+'MAT'+(i+1),ladderLevel:i+1,audio:(i===1||i===4)&&!!b.audio,audioText:(i===1||i===4)&&!!b.audio?q.prompt:''})),
  practice:[
   {id:prefix+'PR1',title:'Level 1 · Recognise and explain',kind:'mcq',prompt:'Without looking at the notes, explain '+topics[0]+' in one or two sentences and identify when it is relevant.',options:['State its meaning and the condition/context in which it applies.','Give a memorised answer without context.','Skip the definition and calculate immediately.','Use an unrelated module.'],answer:0,hint:'Start with meaning, purpose and conditions.',explanation:'Level 1 checks conceptual understanding before independent application.'},
   {id:prefix+'PR2',title:'Level 2 · Apply',kind:'mcq',prompt:'Apply '+topics[1]+' to a new case. What should you identify before solving?',options:['The requirement, relevant information and conditions.','Only the final number.','Only the wording of the worked example.','A memorised option.'],answer:0,hint:'Separate relevant from irrelevant information.',explanation:'Application requires mapping the new case to the taught method.'},
   {id:prefix+'PR3',title:'Level 3 · Analyse and verify',kind:'mcq',prompt:'After applying '+topics[2]+', which independent check is most useful?',options:['Compare the result with evidence, constraints, units, boundaries or a success criterion.','Repeat the same calculation without checking assumptions.','Change the answer until it looks reasonable.','Ignore contradictory evidence.'],answer:0,hint:'Use evidence outside the original assumption.',explanation:'Verification tests whether the reasoning survives an independent check.'},
   {id:prefix+'PR4',title:'Level 4 · Diagnose',kind:'mcq',prompt:'A result fails because of '+topics[3]+'. What is the strongest diagnostic approach?',options:['Reproduce the failure, isolate the changed condition, form a hypothesis and test one change.','Rewrite everything without testing.','Ignore the failure because another case worked.','Change multiple causes at the same time.'],answer:0,hint:'Control the investigation.',explanation:'Diagnosis requires evidence-based isolation of the cause.'},
   {id:prefix+'PR5',title:'Level 5 · Solve and transfer',kind:'mcq',prompt:'How should you use '+topics[4]+' in an unfamiliar engineering problem?',options:['Adapt the taught method, explain the decision, test an edge or alternative case and justify the result.','Copy the worked example unchanged.','Use a shortcut without checking constraints.','Select an answer before analysing the problem.'],answer:0,hint:'Transfer requires adaptation plus verification.',explanation:'The highest level demonstrates independent application in a changed context.'}
  ].map((q,i)=>({...q,ladderLevel:i+1,learningOutcomeId:prefix+'LO'+(i+1),materialId:prefix+'MAT'+(i+1),guidedDrillId:prefix+'DR'+(i+1),activityType:(i===1||i===4)&&!!b.audio?'listening':'mcq',audioText:(i===1||i===4)&&!!b.audio?q.prompt:''}))
 };
}

function genericModule(title,trackTitle,no){
 const trackKey=({Communication:'communication',Aptitude:'aptitude','Core Engineering':'core-engineering','Problem Solving':'problem-solving','Analytical Skills':'analytical'})[trackTitle]||'';
 const catalogue=trackKey==='communication'?(COMMUNICATION_MODULES[no-1]||{}):(FIRST_YEAR_MODULE_CONTENT[trackKey]?.[no-1]||GENERIC_MODULE_BLUEPRINTS[trackKey]?.[no-1]||{});
 const custom=trackKey==='communication'?(COMMUNICATION_LEARNING_CONTENT[no-1]||{}):{};
 const canonicalTitle=catalogue.title||title;
 const topics=catalogue.topics||['Core concepts and terminology','Worked examples','Common errors','Application patterns','Review and mastery'];
 const focus=catalogue.focus||'Build the core skill step by step, with repeated practice before moving to application.';
 const example=catalogue.example||'Apply '+canonicalTitle+' to a realistic first-year engineering situation.';
 const activities=buildGenericActivities(trackKey,no,canonicalTitle,catalogue);
 const modulePrefix=trackKey+'-D'+no+'-';
 const outcomes=[
   {id:modulePrefix+'LO1',text:'Explain the core idea of '+canonicalTitle+' in your own words.'},
   {id:modulePrefix+'LO2',text:'Apply the method to a guided example before working independently.'},
   {id:modulePrefix+'LO3',text:'Identify an error, limitation or condition that affects the result.'},
   {id:modulePrefix+'LO4',text:'Verify an answer using evidence, constraints or a success criterion.'},
   {id:modulePrefix+'LO5',text:'Transfer the skill to a new first-year engineering situation.'}
 ];
 const fallbackLessons=topics.map((topic,i)=>({
   level:i<2?'Foundation':i<4?'Application':'Transfer',
   title:topic,
   teach:i===0
     ?'Learn the concept before attempting the drill. '+focus+' The key question is: what is the concept, when is it valid, and what evidence shows that it has been applied correctly?'
     :i===1
     ?'Work through the module example step by step. '+example+' Record the important intermediate reasoning instead of jumping directly to the answer.'
     :i===2
     ?'Apply '+topic+' to a related situation. Compare the new conditions with the worked example and identify what must change.'
     :i===3
     ?'Test your reasoning. Look for a boundary case, alternative explanation, limitation or failure condition before accepting the result.'
     :'Transfer '+topic+' to an unfamiliar first-year engineering context and explain why your chosen method remains appropriate.',
   example:i===0?example:i===1?'Start with the worked example, identify the relevant '+topic+', then explain each decision before continuing.':'Create a new example using '+topic+' and state the evidence that would confirm your answer.',
   code:'',
   check:'Can you explain '+topic+', apply it without the notes, and state how you would verify the result?'
 }));
 const lessons=(custom.lessons||fallbackLessons).map((x,i)=>({...x,level:x.level||'Application'}));
 const drills=(custom.drills||activities.drills).map((x,i)=>({...x,id:x.id||modulePrefix+'DR'+(i+1),learningOutcomeId:x.learningOutcomeId||modulePrefix+'LO'+(i+1),materialId:x.materialId||modulePrefix+'MAT'+(i+1),guidedDrillId:x.guidedDrillId||modulePrefix+'DR'+(i+1),ladderLevel:x.ladderLevel||i+1}));
 const practiceTasks=(custom.practice||activities.practice).map((x,i)=>({...x,id:x.id||modulePrefix+'PR'+(i+1),ladderLevel:x.ladderLevel||i+1,learningOutcomeId:x.learningOutcomeId||modulePrefix+'LO'+(i+1),materialId:x.materialId||modulePrefix+'MAT'+(i+1),guidedDrillId:x.guidedDrillId||modulePrefix+'DR'+(i+1)}));
 const materials=custom.materials||[
   {id:modulePrefix+'MAT1',title:'Core concept — what it is and why it matters',body:focus+' Start by defining the skill in your own words. In first-year engineering, use it when the stated task requires this kind of reasoning. Before calculating or deciding, ask: What is the requirement? What information is relevant? What conditions make the method valid?'},
   {id:modulePrefix+'MAT2',title:'Key ideas — the five parts of the skill',body:topics.map((x,i)=>(i+1)+'. '+x+': identify what this part means, what evidence would show that you have applied it correctly, and how it connects to the other parts of the module.').join(' ' )},
   {id:modulePrefix+'MAT3',title:'Worked example — think before you answer',body:'Worked example: '+example+' Method: (1) state the requirement, (2) identify the relevant '+topics[0]+', (3) apply the appropriate reasoning step by step, (4) check the result against the context, and (5) explain why the result is defensible.'},
   {id:modulePrefix+'MAT4',title:'Common errors — diagnose before changing the method',body:'Typical failure pattern: applying a familiar rule without checking its conditions. To diagnose an error, reproduce the case, identify the exact step where the reasoning changes, compare the successful and failed cases, then change one assumption or step at a time. Check units, evidence, constraints and boundary cases where relevant.'},
   {id:modulePrefix+'MAT5',title:'Mastery check — explain, apply, verify, transfer',body:'Close the notes. Explain '+canonicalTitle+' in 30 seconds, solve a new example, verify the result independently, then describe one situation where the method would not be appropriate. Only after this check should you attempt the Guided Drills and Practice Ladder.'}
 ];
 return {
  id:no,title:canonicalTitle,scope:custom.scope||focus,topics,
  learningOutcomes:custom.learningOutcomes||outcomes.map(x=>x.text),learningOutcomeMap:outcomes,
  materials,lessons,
  drills,practiceTasks,example,
  audio:!!catalogue.audio,speechTasks:catalogue.speechTasks||[],
  challenge:custom.challenge||'Transfer challenge: solve a new '+canonicalTitle+' situation without copying the worked example. State the requirement, identify the relevant concept, show the important reasoning, test one boundary or alternative, and justify the final result.',
  assessment:'The formal assessment measures the same learning outcomes in new contexts. It is intentionally separate from the Guided Drills so that success demonstrates transfer rather than memorisation.'
 };
}
const C_MODULE_ENRICHMENT={
  1:{lessons:[
   {level:'Foundation',title:'From problem statement to C program',teach:'Start with the requirement, identify inputs, processing and outputs, then map each step to C syntax. Keep identifiers meaningful and compile after small changes.',example:'For a marks-total problem, identify three integer inputs, add them, and print the total before writing the complete program.',code:'#include <stdio.h>\\nint main(void){\\n int a,b;\\n scanf("%d%d",&a,&b);\\n printf("%d",a+b);\\n return 0;\\n}',check:'What are the input, process and output in this program?'},
   {level:'Core',title:'Expressions, types and input/output',teach:'C expressions combine values with operators. Match the data type and format specifier to the value being read or printed, and watch integer division.',example:'When total and count are integers, cast total before division if a decimal average is required.',code:'double avg=(double)total/count;\\nprintf("%.2f",avg);',check:'Why is the cast needed for a decimal average?'},
   {level:'Applied',title:'Compile, trace and debug systematically',teach:'Separate syntax errors, warnings, logic errors and incorrect assumptions. Compile early, trace variables with a small input and test a boundary case.',example:'If a program prints the wrong total, trace each assignment before changing the formula.',code:'int total=0;\\nfor(int i=0;i<n;i++) total+=a[i];\\nprintf("%d",total);',check:'Which test input would help expose an off-by-one loop error?'}
  ]},
  9:{lessons:[
   {level:'Foundation',title:'Strings are character arrays',teach:'A C string is a character array terminated by the null character. Indexing and the terminator determine where the string begins and ends.',example:'The literal "hello" occupies six characters including \\0.',code:'char s[]="hello";\\nprintf("%s",s);',check:'Why is the null terminator required?'},
   {level:'Core',title:'String library functions have precise contracts',teach:'strlen counts characters before \\0; strcpy copies a string; strcat appends; strcmp compares strings. Always provide sufficient destination storage.',example:'strcmp returns zero when two strings contain the same character sequence.',code:'if(strcmp(a,b)==0) printf("Equal");',check:'What does strcmp return when the strings are equal?'},
   {level:'Applied',title:'Trace strings and prevent input bugs',teach:'For reliable string programs, choose the correct input method, respect buffer limits and trace each character before modifying the array.',example:'Use fgets for a complete line, then process spaces, punctuation and the terminating newline deliberately.',code:'fgets(s,sizeof s,stdin);\\n/* inspect and process the characters */',check:'Why can fgets be safer than scanf("%s", s) for a complete line?'}
  ]},
 2:{lessons:[
  {level:'Foundation',title:'Decisions are Boolean questions',teach:'A decision evaluates a condition to choose one path. Relational operators compare values and logical operators combine conditions.',example:'For marks >= 40 && attendance >= 75, both requirements must be true.',code:'if (marks >= 40 && attendance >= 75) {\n    printf("Eligible");\n}',check:'What changes if || replaces &&?'},
  {level:'Core',title:'Loops need a clear boundary',teach:'A loop repeats while its control condition permits. Before coding, identify the initial value, condition, update and termination point.',example:'A for loop from i=1 to i<=5 executes five times.',code:'for (int i=1; i<=5; i++)\n    printf("%d ", i);',check:'Which part prevents this loop from continuing forever?'},
  {level:'Applied',title:'Trace before you debug',teach:'Create a small trace table for nested decisions and loops. Record the changing variables and the branch taken at each step.',example:'For n=12, test divisors 1 through 12 and count those for which n%i==0.',code:'for (int i=1; i<=n; i++)\n    if (n%i==0) count++;',check:'Why is the loop boundary i<=n safe here?'}
 ]},
 3:{lessons:[
  {level:'Foundation',title:'An array is indexed storage',teach:'An array stores same-type elements in contiguous positions. Indexing begins at zero, so an array of size 5 has valid indexes 0 through 4.',example:'int marks[5] stores five marks at indexes 0,1,2,3,4.',code:'int marks[5]={70,82,65,91,76};\nprintf("%d", marks[2]);',check:'Which value is printed?'},
  {level:'Core',title:'Traversal is the main pattern',teach:'Most array algorithms use one loop to visit every valid index. Keep the loop bound tied to the array size.',example:'Sum five values by starting total at zero and adding marks[i] for each index.',code:'int total=0;\nfor(int i=0;i<5;i++) total+=marks[i];',check:'What happens if the loop runs while i<=5?'},
  {level:'Applied',title:'Search and frequency are reusable patterns',teach:'Linear search checks elements one by one; frequency counting stores how often each value or category occurs.',example:'To find the first mark equal to 80, scan from index zero and stop when the target is found.',code:'for(int i=0;i<n;i++)\n    if(a[i]==target){ pos=i; break; }',check:'Why can break save unnecessary work?'}
 ]},
 4:{lessons:[
  {level:'Foundation',title:'Functions package one responsibility',teach:'A function has a return type, name, parameter list and body. Give each function one clear responsibility.',example:'A function add(a,b) should calculate and return the sum rather than also printing unrelated messages.',code:'int add(int a,int b){\n    return a+b;\n}',check:'What is the return type of add?'},
  {level:'Core',title:'Arguments supply values',teach:'Parameters receive values when a function is called. C passes ordinary arguments by value, so changing a parameter does not directly change the caller variable.',example:'square(5) receives 5 in its parameter and returns 25.',code:'int square(int x){ return x*x; }\nint y=square(5);',check:'What is stored in y?'},
  {level:'Applied',title:'Decompose before coding',teach:'A long program becomes easier to test when input, calculation, validation and output are separate functions.',example:'A marks program can use readMarks(), calculateAverage(), findGrade() and printReport().',code:'double average(int total,int count){\n    return (double)total/count;\n}',check:'Which function should own validation?'}
 ]},
 5:{lessons:[
  {level:'Foundation',title:'A pointer stores an address',teach:'A pointer variable stores the address of another object. & obtains an address and * dereferences a pointer to access the pointed-to value.',example:'If p=&x, then *p refers to x.',code:'int x=10;\nint *p=&x;\nprintf("%d", *p);',check:'What does p contain and what does *p produce?'},
  {level:'Core',title:'Pointers can modify caller data',teach:'Passing an address to a function allows the function to modify the caller’s object through dereferencing.',example:'A swap function receives two int pointers and exchanges the values they point to.',code:'void swap(int *a,int *b){\n int t=*a; *a=*b; *b=t;\n}',check:'Why are pointers required for this swap?'},
  {level:'Applied',title:'Arrays and pointers are related',teach:'In many expressions an array name converts to a pointer to its first element. Pointer arithmetic can move through the elements.',example:'*(a+i) accesses the same element as a[i] for a valid array.',code:'for(int i=0;i<n;i++)\n    printf("%d ", *(a+i));',check:'Which expression is equivalent to a[i]?'}
 ]},
 6:{lessons:[
  {level:'Foundation',title:'Structures model records',teach:'A structure groups related fields of different types under one object, making real-world records easier to represent.',example:'A Student record can contain register number, name and CGPA.',code:'struct Student{\n int regNo;\n char name[40];\n float cgpa;\n};',check:'Why is a structure better than unrelated variables?'},
  {level:'Core',title:'Arrays of structures scale records',teach:'An array of structures stores many records of the same shape. Use a loop to read, search and report them.',example:'students[0].cgpa accesses the CGPA of the first record.',code:'for(int i=0;i<n;i++)\n    printf("%.2f",students[i].cgpa);',check:'What does the dot operator access?'},
  {level:'Applied',title:'Structure versus union',teach:'Structure members have separate storage, while union members share the same storage. Choose a union only when one alternative value is active at a time.',example:'A sensor value that may be integer or floating point at different times can be modelled with a union when appropriate.',code:'union Value{ int i; float f; };',check:'Why can writing one union member affect another?'}
 ]},
 7:{lessons:[
  {level:'Foundation',title:'Dynamic memory lives on the heap',teach:'malloc and calloc request memory during runtime. The program must keep the returned pointer and check whether allocation succeeded.',example:'Allocate space for n integers with malloc(n*sizeof(int)).',code:'int *a=malloc(n*sizeof(int));\nif(a==NULL) return 1;',check:'Why should NULL be checked?'},
  {level:'Core',title:'Ownership must be explicit',teach:'Every successful allocation should have a clear owner and a matching free. Losing the pointer before freeing causes a memory leak.',example:'After using a dynamic array, call free(a) and avoid using a afterward.',code:'free(a);\na=NULL;',check:'Why is setting a to NULL useful after free?'},
  {level:'Applied',title:'Resize carefully',teach:'realloc may move a block, so preserve the returned pointer and update the owning variable only after the operation succeeds.',example:'Grow a dynamic array when capacity is reached, then continue inserting elements.',code:'int *tmp=realloc(a,newCap*sizeof(int));\nif(tmp!=NULL) a=tmp;',check:'Why should the old pointer not be overwritten blindly?'}
 ]},
 8:{lessons:[
  {level:'Foundation',title:'A FILE pointer represents an open stream',teach:'fopen opens a file in a chosen mode and returns a FILE pointer. Always check whether opening succeeded and close the file when finished.',example:'Use "r" for reading an existing text file and "w" for writing a new or truncated file.',code:'FILE *fp=fopen("marks.txt","r");\nif(fp==NULL) return 1;',check:'What does fopen return when opening fails?'},
  {level:'Core',title:'Choose text I/O for structured records',teach:'fprintf and fscanf format values, while fgets and fputs are useful for line-oriented text. Match the function to the data shape.',example:'Write a register number and mark as a formatted record, then read them back with matching formats.',code:'fprintf(fp,"%d %.1f\\n",reg,mark);',check:'Why must the format used for reading match the stored representation?'},
  {level:'Applied',title:'Files need error-aware workflows',teach:'A reliable file program checks open results, handles end-of-file correctly, validates input and closes the stream on every normal path.',example:'A student record search should distinguish “file could not open” from “record not found”.',code:'if(fp==NULL){\n    perror("marks.txt");\n    return 1;\n}',check:'Why are file-open failure and missing-record cases different?'}
 ]},
 10:{lessons:[
  {level:'Foundation',title:'The preprocessor changes source before compilation',teach:'Headers, macros and conditional compilation are processed before the compiler handles the C translation unit.',example:'A constant macro can avoid repeating a literal, but macros should be simple and carefully named.',code:'#define MAX_STUDENTS 100\nint count=0;',check:'Is a macro a runtime variable?'},
  {level:'Core',title:'Bitwise operators work on representations',teach:'&, |, ^, ~ and shifts operate on integer bit patterns. They are useful for flags, masks and compact state representations.',example:'n & 1 tests the least significant bit and can identify odd numbers.',code:'if(n & 1) printf("ODD");',check:'Why does n & 1 distinguish odd and even integers?'},
  {level:'Applied',title:'Read unfamiliar code systematically',teach:'Start with inputs and outputs, identify state, trace one execution path, isolate risky assumptions and then change one thing at a time.',example:'When a legacy function returns the wrong result, reproduce the failure before rewriting the whole function.',code:'/* trace inputs -> state -> branch -> output */',check:'Why is reproducing the defect valuable before editing?'}
 ]}
};
Object.keys(C_MODULE_ENRICHMENT).forEach(k=>Object.assign(C_MODULES[Number(k)-1],C_MODULE_ENRICHMENT[k]));

function normaliseCModules(){
 C_MODULES.forEach((m,i)=>{
   const n=i+1,prefix='c-programming-D'+n+'-';
   const oldMaterials=Array.isArray(m.materials)?m.materials:[];
   const oldDrills=Array.isArray(m.drills)?m.drills:[];
   const oldPractice=Array.isArray(m.practice)?m.practice:[];
   m.learningOutcomeMap=[
     {id:prefix+'LO1',text:'Explain the core '+m.title+' concepts and terminology.'},
     {id:prefix+'LO2',text:'Apply '+m.title+' techniques in a guided C example.'},
     {id:prefix+'LO3',text:'Trace, diagnose or correct a C implementation involving '+m.title+'.'},
     {id:prefix+'LO4',text:'Verify a C solution using tests, constraints and expected behaviour.'},
     {id:prefix+'LO5',text:'Transfer '+m.title+' knowledge to a new engineering programming task.'}
   ];
   m.learningOutcomes=m.learningOutcomeMap.map(x=>x.text);
   m.materials=oldMaterials.slice(0,5).map((x,j)=>({id:prefix+'MAT'+(j+1),title:'Material '+(j+1),body:String(x)}));
   while(m.materials.length<5) m.materials.push({id:prefix+'MAT'+(m.materials.length+1),title:'Material '+(m.materials.length+1),body:'Review the worked examples and notes for '+m.title+', then reproduce the method without looking at the answer.'});
   m.drills=oldDrills.slice(0,5).map((x,j)=>({id:prefix+'DR'+(j+1),category:'Guided Drill '+(j+1),prompt:String(x),learningOutcomeId:prefix+'LO'+(j+1),materialId:prefix+'MAT'+(j+1),ladderLevel:Math.min(5,j+1),explanation:'Use the linked material first, then explain why the chosen C construct or reasoning step works.'}));
   while(m.drills.length<5) m.drills.push({id:prefix+'DR'+(m.drills.length+1),category:'Guided Drill '+(m.drills.length+1),prompt:'Apply '+m.title+' to a new small C example and explain each step.',learningOutcomeId:prefix+'LO'+(m.drills.length+1),materialId:prefix+'MAT'+(m.drills.length+1),ladderLevel:m.drills.length+1,explanation:'The drill reinforces the corresponding material before independent practice.'});
   m.practiceTasks=oldPractice.slice(0,5).map((x,j)=>({id:prefix+'PR'+(j+1),title:String(x),kind:'mcq',prompt:'Complete this '+m.title+' practice level by explaining the method, applying it to a new case and checking the result.',options:['Use the linked method and verify the result','Copy the worked answer without checking','Ignore the stated conditions','Choose a random C construct'],answer:0,hint:'Revisit the linked material and Guided Drill before retrying.',explanation:'Practice should progress from understanding to application, verification, diagnosis and transfer.',ladderLevel:j+1,learningOutcomeId:prefix+'LO'+(j+1),materialId:prefix+'MAT'+(j+1),guidedDrillId:prefix+'DR'+(j+1)}));
   m.practiceTasks.push(...Array.from({length:Math.max(0,5-m.practiceTasks.length)},(_,j)=>({id:prefix+'PR'+(m.practiceTasks.length+j+1),title:'Level '+(m.practiceTasks.length+j+1)+' · Transfer',kind:'mcq',prompt:'Apply '+m.title+' in a new C situation and verify your result.',options:['Adapt the method and test it','Copy the example unchanged','Skip testing','Ignore constraints'],answer:0,hint:'Change one condition, solve, then test.',explanation:'The highest practice levels require independent transfer and verification.',ladderLevel:m.practiceTasks.length+j+1,learningOutcomeId:prefix+'LO'+(m.practiceTasks.length+j+1),materialId:prefix+'MAT'+(m.practiceTasks.length+j+1),guidedDrillId:prefix+'DR'+(m.practiceTasks.length+j+1)})));
   m.scope=m.scope||'Build '+m.title+' capability through taught concepts, guided practice, verification and transfer.';
   m.challenge=m.challenge||'Apply '+m.title+' to a new C programming problem, test normal and boundary cases, and explain the design.';
   m.assessment=m.assessment||'The final assessment measures the same taught outcomes in new contexts.';
 });
}
normaliseCModules();
function decodeCode(value){return String(value??'').replace(/\\n/g,'\n');}
function drillState(title){
 const key='fxecDrillState:'+String(title||'module').replace(/[^a-z0-9]+/gi,'-').toLowerCase();
 try{return {key,data:{active:10,stars:0,completed:[],bonusPoints:0,...JSON.parse(localStorage.getItem(key)||'{}')}};}catch(e){return {key,data:{active:10,stars:0,completed:[],bonusPoints:0}};}
}
function saveDrillState(title,data){try{localStorage.setItem(drillState(title).key,JSON.stringify(data));}catch(e){}}
function drillStats(){const all=drillState('C Fundamentals').data;return {stars:Number(all.stars||0),completed:Array.isArray(all.completed)?all.completed.length:Number(all.completed||0),active:Number(all.active||10),bonusPoints:Number(all.bonusPoints||0)};}
function drillBadge(stars){
 if(stars>=100)return '🏆 Drill Master';
 if(stars>=75)return '💎 Elite Practice';
 if(stars>=50)return '🥇 Practice Champion';
 if(stars>=25)return '🥈 Persistent Learner';
 if(stars>=10)return '🥉 Drill Starter';
 return '🌱 Getting Started';
}
function addTenDrills(title,box){
 const st=drillState(title).data;
 if(st.active>=100)return;
 st.active=Math.min(100,Number(st.active||10)+10);
 saveDrillState(title,st);
 box.innerHTML=renderDrillReward(title);
}
function renderDrillReward(title){
 const st=drillState(title).data;
 const bonus=Math.min(5,Number(st.stars||0)*0.05);
 st.bonusPoints=bonus;saveDrillState(title,st);
 return '<div class="drillRewardBar"><div><strong>⭐ '+Number(st.stars||0)+' Drill Stars</strong><span>'+Number(Array.isArray(st.completed)?st.completed.length:st.completed||0)+' completed · '+drillBadge(Number(st.stars||0))+'</span></div><div><b>+'+bonus.toFixed(2)+' bonus points</b><small> · max 5 points from drills</small></div><button class="addDrillsButton" '+(Number(st.active||10)>=100?'disabled':'')+'>+10 Drills</button></div>';
}
function chooseDrill(title){
 const st=drillState(title).data,limit=Math.min(100,Number(st.active||10));
 const done=new Set(Array.isArray(st.completed)?st.completed:[]);
 const available=C_FUNDAMENTALS_DRILLS.slice(0,limit).filter((_,i)=>!done.has('D'+i));
 const pool=available.length?available:C_FUNDAMENTALS_DRILLS.slice(0,limit);
 const i=Math.floor(Math.random()*pool.length);
 return {q:pool[i],id:'D'+C_FUNDAMENTALS_DRILLS.indexOf(pool[i])};
}
function speak(textValue){
 if(!('speechSynthesis' in window))return;
 window.speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(String(textValue||''));u.rate=.9;u.pitch=1;u.volume=1;window.speechSynthesis.speak(u);
}
function startAudioSequence(box,options){
 const stage=box.querySelector('.drillAudioStage'), status=box.querySelector('.drillAudioStatus');
 let i=0;const next=()=>{
   if(i>=options.length){status.textContent='All options played. Select A, B, C or D.';return;}
   stage.innerHTML='<strong>OPTION '+String.fromCharCode(65+i)+'</strong><span>Listening…</span>';
   speak(options[i]);i++;setTimeout(next,2000);
 };next();
}
function isCodeLike(value){
 const x=String(value||'');
 return /\\n|#include|\\b(?:int|char|float|double|printf|scanf|if|for|while|return)\\b|[{};]/.test(x);
}
function renderDrillOption(value,index,audio){
 const label=String.fromCharCode(65+index);
 if(audio) return '<button data-answer="'+index+'" class="audioDrillOption"><span class="audioOptionLetter">'+label+'</span><span class="srOnlyOption">'+esc(value)+'</span></button>';
 return '<button data-answer="'+index+'" class="'+(isCodeLike(value)?'drillCodeOption':'')+'"><span class="drillOptionLetter">'+label+'.</span>'+(isCodeLike(value)?'<pre>'+esc(decodeCode(value))+'</pre>':'<span>'+esc(value)+'</span>')+'</button>';
}
function showDrill(button){
 const card=button.closest('.drillCard'),title=card.dataset.module||'C Fundamentals',trackId=card.dataset.track||'c-programming';
 const old=card.querySelector('.drillInteractive');if(old){old.remove();button.textContent='Start Drill';return;}
 let q,chosenId;
 if(trackId==='c-programming'){
   const chosen=chooseDrill(title);q={category:chosen.q[0],prompt:chosen.q[1],options:chosen.q[2],answer:chosen.q[3],explanation:chosen.q[4],audio:chosen.q[5]==='audio-question'||chosen.q[5]==='audio-options'};chosenId=chosen.id;
 }else{
   const moduleNo=Number(card.dataset.moduleNo||1);
   const data=genericModule(title,TRACKS.find(t=>t.id===trackId)?.title||trackId,moduleNo);
   q=data.drills[Math.floor(Math.random()*data.drills.length)];chosenId=q.id;
 }
 const box=document.createElement('div');box.className='drillInteractive';
 const audioQ=!!q.audio;
 box.innerHTML='<div class="drillGameHeader"><b>🎯 DRILL MISSION</b><span>+1 ★ for an attempt</span></div>'+
   '<h6>'+esc(q.category||'Guided Drill')+'</h6>'+
   '<div class="drillQuestion '+(audioQ?'audioOnlyQuestion':'')+'">'+(audioQ?'<button class="playAudioQuestion">🔊 Play Question</button><small>Listen once or replay if needed.</small>':'<p>'+esc(q.prompt)+'</p>')+'</div>'+
   '<div class="drillOptions">'+q.options.map((o,i)=>renderDrillOption(o,i,false)).join('')+'</div><div class="drillFeedback"></div>';
 card.appendChild(box);button.textContent='Close Drill';
 if(audioQ)box.querySelector('.playAudioQuestion').onclick=()=>speak(q.prompt);
 box.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
   const st=drillState(title).data;
   if(!st.completed)st.completed=[];
   if(!box.dataset.rewarded){
     st.stars=Number(st.stars||0)+1;st.completed.push(chosenId);st.bonusPoints=Math.min(5,Number(st.stars)*.05);saveDrillState(title,st);box.dataset.rewarded='1';
     call('recordCompetencyDrillAttempt')({trackId,moduleId:title,drillId:chosenId}).then(()=>loadCompetencyLeaderboard(card.closest('.moduleLearningWorkspace'),trackId)).catch(()=>{});
   }
   const ok=Number(b.dataset.answer)===Number(q.answer),fb=box.querySelector('.drillFeedback');
   fb.className='drillFeedback '+(ok?'correct':'review');
   fb.innerHTML=(ok?'⭐ Correct! Drill Star earned. ':'↻ Keep practising. A Star is awarded for completing the attempt. ')+'<b>'+esc(q.explanation||'Review the module notes and trace the example.')+'</b><br><span>Stars: '+st.stars+' · Bonus: '+Number(st.bonusPoints||0).toFixed(2)+' / 5</span>';
   if(ok)box.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);
 });
}
function toggleMaterial(button){const body=button.parentElement.querySelector('.materialBody');const open=button.dataset.open==='1';body.hidden=open;button.dataset.open=open?'0':'1';button.textContent=open?'Teach me':'Hide lesson';}
function practiceInstruction(title,i){return i===0?'Predict first, then prove it by tracing each line.':i===1?'Repair the code and explain the exact defect.':i===2?'Complete the missing expression and test two values.':i===3?'Trace the variables line by line before checking.':i===4?'Write the program yourself, then run it against the supplied test cases.':'Complete the coding task, test an edge case and improve your solution.';}
function lineNumberedEditor(initial,id){
 const code=decodeCode(initial),lines=code.split('\n').length;
 return '<div class="codeEditorWrap codeThreeLine"><div class="codeLineNumbers" data-lines="'+id+'">'+Array.from({length:Math.max(lines,4)},(_,i)=>'<span>'+(i+1)+'</span>').join('')+'</div><textarea class="codeEditor" id="'+id+'" spellcheck="false">'+esc(code)+'</textarea></div>';
}
async function runPracticeCode(button){
 const task=button.closest('.practiceTask'),editor=task.querySelector('.codeEditor'),stdin=task.querySelector('.practiceInput')?.value||'';
 const out=task.querySelector('.practiceRunOutput');if(!editor||!out)return;
 button.disabled=true;out.textContent='Running C code…';
 try{
  const r=await call('runCCode')({sourceCode:editor.value,stdin});
  out.className='practiceRunOutput '+(r.data?.accepted?'passed':'failed');
  out.textContent=(r.data?.stdout||r.data?.compileOutput||r.data?.stderr||r.data?.status||'No output')+(r.data?.accepted?'\n✓ Program executed successfully.':'\n↻ Read the compiler/output message and fix the code.');
 }catch(e){out.className='practiceRunOutput failed';out.textContent=e.message||String(e);}
 finally{button.disabled=false;}
}
function practicePoolForStudent(title){
 const key='fxecPracticeSet:'+String(title||'module').replace(/[^a-z0-9]+/gi,'-').toLowerCase();
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved)&&saved.length===10)return saved;}catch(e){}
 const pool=C_FUNDAMENTALS_PRACTICE_POOL||C_FUNDAMENTALS_PRACTICE,indices=pool.map((_,i)=>i);
 for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
 const picked=indices.slice(0,10);try{localStorage.setItem(key,JSON.stringify(picked));}catch(e){}return picked;
}
function renderPracticeTask(task,i){
 const p=task,answer=Number.isInteger(p.answer)?p.answer:'';
 const practiceAudio=String(p.activityType||p.mode||'').toLowerCase().includes('audio')||String(p.activityType||'').toLowerCase()==='listening'; const common='<details class="practiceTask" data-answer="'+answer+'" data-explanation="'+esc(p.explanation||p.hint||'')+'"><summary><span class="practiceTaskSummary"><span>LEVEL '+(Math.floor(i/2)+1)+' · TASK '+String(i+1).padStart(2,'0')+'</span><strong>'+esc(p.title)+'</strong><em>Open task ▾</em></span></summary><div class="practiceTaskBody"><div class="practicePromptBar '+(practiceAudio?'audioPracticePrompt':'')+'"><p>'+(practiceAudio?'🔊 Question available by audio':esc(p.prompt))+'</p><button type="button" class="practicePlayQuestion" data-speech="'+esc(p.prompt)+'">🔊 Listen</button></div>';
 if(p.kind==='coding'||p.kind==='bug'){
  const starter=p.starter||p.code||'';
  return common+lineNumberedEditor(starter,'practiceCode'+i)+(p.tests?'<div class="practiceTests"><b>Test cases</b>'+p.tests.map(t=>'<span>Input: '+esc(t[0])+' → Expected: '+esc(t[1])+'</span>').join('')+'</div>':'')+'<label class="practiceInputLabel">Input for your run <input class="practiceInput" placeholder="e.g. 7 5"></label><div class="practiceTaskActions"><button class="runCodeButton">▶ Run C Code</button><button class="revealHintButton">Hint</button></div><div class="practiceRunOutput">Your output will appear here.</div><div class="practiceFeedback" hidden></div></div></details>';
 }
 return common+(p.code?'<pre class="codeBlock"><code>'+esc(decodeCode(p.code))+'</code></pre>':'')+(p.options?'<div class="practiceOptions">'+p.options.map((o,j)=>isCodeLike(o)?'<button data-choice="'+j+'" class="practiceCodeChoice">'+String.fromCharCode(65+j)+'.<pre>'+esc(decodeCode(o))+'</pre></button>':'<button data-choice="'+j+'">'+String.fromCharCode(65+j)+'. '+esc(o)+'</button>').join('')+'</div>':'')+'<div class="practiceFeedback" hidden></div></div></details>';
}
function wirePracticeTasks(ws){
 ws.querySelectorAll('.codeEditor').forEach(editor=>{
   const numbers=editor.closest('.codeEditorWrap')?.querySelector('.codeLineNumbers');
   const sync=()=>{if(!numbers)return;const count=Math.max(4,editor.value.split('\\n').length);numbers.innerHTML=Array.from({length:count},(_,i)=>'<span>'+(i+1)+'</span>').join('');};
   editor.addEventListener('input',sync);sync();
 });
 ws.querySelectorAll('.practicePlayQuestion').forEach(b=>b.onclick=()=>speak(b.dataset.speech||'')); 
 ws.querySelectorAll('.runCodeButton').forEach(b=>b.onclick=()=>runPracticeCode(b));
 ws.querySelectorAll('.revealHintButton').forEach(b=>b.onclick=()=>{
   const f=b.closest('.practiceTask').querySelector('.practiceFeedback');
   const i=Number(b.closest('.practiceTask').querySelector('.codeEditor').id.replace('practiceCode',''));
   const selected=practicePoolForStudent('C Fundamentals')[i]??i;
   const p=(C_FUNDAMENTALS_PRACTICE_POOL||C_FUNDAMENTALS_PRACTICE)[selected];
   f.hidden=false;f.innerHTML='💡 '+esc(p?.hint||'Use the requirement, trace the code and test a boundary value.');
 });
 ws.querySelectorAll('.practiceTask .practiceOptions button').forEach(b=>b.onclick=()=>{
   const task=b.closest('.practiceTask'),idx=[...task.querySelectorAll('[data-choice]')].indexOf(b),answer=Number(task.dataset.answer);
   const ok=idx===answer;const f=task.querySelector('.practiceFeedback');f.className='practiceFeedback '+(ok?'correct':'review');f.hidden=false;f.innerHTML=ok?'✓ Correct.<br><small>'+esc(task.dataset.explanation||'Now explain why the answer is correct.')+'</small>':'↻ Review the task, revisit the relevant material and try again.';
   if(ok)task.querySelectorAll('[data-choice]').forEach(x=>x.disabled=true);
 });
}
async function loadCompetencyLeaderboard(ws,trackId){
 const root=ws?.querySelector?.('#competencyLeaderboard');if(!root)return;
 root.innerHTML='<div class="leaderboardLoading">Loading top performers…</div>';
 try{
  const r=await call('getCompetencyLeaderboard')({trackId});
  const items=r.data?.items||[];
  root.innerHTML=items.length?'<div class="leaderboardRows">'+items.map(x=>'<div class="leaderboardRow"><b>#'+Number(x.rank)+'</b><span><strong>'+esc(x.displayName)+'</strong><small>'+esc(x.displayClass||'Class not set')+'</small></span><strong>'+Number(x.totalPoints).toFixed(2)+' pts</strong><small>⭐ '+Number(x.drillStars)+'</small></div>').join('')+'</div>':'<div class="leaderboardLoading">Complete drills and assessments to appear here.</div>';
 }catch(e){root.innerHTML='<div class="leaderboardLoading">Leaderboard will appear after your first recorded activity.</div>';}
}

function codingLabShell(title,prompt,starter,meta=null){
 const sampleHtml=meta?.sampleTests?.length?'<div class="codingSampleTests"><b>Sample Test Cases</b>'+meta.sampleTests.map((t,i)=>'<div class="codingSampleCase"><span>Sample '+(i+1)+'</span><code>Input: '+esc(t[0])+'</code><code>Expected: '+esc(t[1])+'</code></div>').join('')+'</div>':'';
 const hiddenHtml=meta?'<div class="codingHiddenBadge">🔒 '+Number(meta.hiddenTestCount||0)+' hidden test cases · evaluated on submission</div>':'';
 return '<div class="codingLabCard"><div class="codingLabHead"><div><span class="sectionEyebrow">HACKERRANK-STYLE C CODING LAB</span><h4>'+esc(title)+'</h4><p>'+esc(prompt)+'</p></div><span class="codingDomainBadge">'+(meta?esc(meta.domain):'Placement Implementation')+'</span></div>'+
 sampleHtml+hiddenHtml+
 '<div class="codingLabRules"><span>✓ Compile & run</span><span>✓ Sample cases visible</span><span>✓ Hidden cases protected server-side</span><span>✓ Output checked exactly</span></div>'+
 lineNumberedEditor(starter||'#include <stdio.h>\\n\\nint main(void) {\\n    return 0;\\n}','codingLabEditor')+
 '<label class="codingLabInputLabel">Custom input <textarea class="codingLabInput" placeholder="Enter test input here"></textarea></label>'+
 '<div class="codingLabActions"><button type="button" class="codingRunSample">▶ Run Sample Tests</button><button type="button" class="codingRunCustom secondary">▶ Run Custom Input</button>'+(meta?'<button type="button" class="codingSubmitChallenge">Submit Challenge ✓</button>':'')+'<button type="button" class="codingClose secondary">Close Lab</button></div>'+
 '<div class="codingLabResult" aria-live="polite">Write your solution, then run the sample tests.</div></div>';
}
async function wireCodingLab(ws){
 const mount=ws?.querySelector?.('#moduleCodingLabMount'); if(!mount)return;
 const editor=mount.querySelector('#codingLabEditor'),numbers=mount.querySelector('.codeLineNumbers');
 if(editor&&numbers){const sync=()=>{const count=Math.max(4,editor.value.split('\\n').length);numbers.innerHTML=Array.from({length:count},(_,i)=>'<span>'+(i+1)+'</span>').join('');};editor.addEventListener('input',sync);sync();}
 const result=mount.querySelector('.codingLabResult'),metaId=mount.dataset.metaId||'',meta=C_COMPETITIVE_META_BY_ID[metaId]||null;
 const runOne=async(input,expected)=>{
   const r=await call('runCCode')({sourceCode:editor.value,stdin:input});
   const actual=String(r.data?.stdout||'').replace(/\\r/g,'').trim(),exp=String(expected||'').replace(/\\r/g,'').trim();
   return {ok:!!r.data?.accepted&&actual===exp,actual,expected:exp};
 };
 mount.querySelector('.codingRunSample')?.addEventListener('click',async()=>{
   if(!meta)return; result.className='codingLabResult running';result.textContent='Running sample tests…';
   try{const rows=[];for(const [input,expected] of meta.sampleTests) rows.push(await runOne(input,expected));const passed=rows.filter(x=>x.ok).length;result.className='codingLabResult '+(passed===rows.length?'passed':'failed');result.innerHTML='<strong>Sample result: '+passed+'/'+rows.length+' passed</strong>'+rows.map((x,i)=>'<div class="codingTestRow '+(x.ok?'ok':'bad')+'"><span>Sample '+(i+1)+'</span><span>'+(x.ok?'✓ Passed':'✗ Failed')+'</span><code>Output: '+esc(x.actual||'(no output)')+'</code></div>').join('');}
   catch(e){result.className='codingLabResult failed';result.textContent=e.message||String(e);}
 });
 mount.querySelector('.codingRunCustom')?.addEventListener('click',async()=>{
   const input=mount.querySelector('.codingLabInput')?.value||'';result.className='codingLabResult running';result.textContent='Running custom input…';
   try{const r=await call('runCCode')({sourceCode:editor.value,stdin:input});result.className='codingLabResult '+(r.data?.accepted?'passed':'failed');result.textContent=String(r.data?.stdout||r.data?.compileOutput||r.data?.stderr||r.data?.status||'No output');}
   catch(e){result.className='codingLabResult failed';result.textContent=e.message||String(e);}
 });
 mount.querySelector('.codingSubmitChallenge')?.addEventListener('click',async()=>{
   if(!meta)return;result.className='codingLabResult running';result.textContent='Submitting to hidden test suite…';
   try{const r=await call('submitCChallenge')({challengeId:meta.challengeId,sourceCode:editor.value});result.className='codingLabResult '+(r.data?.passed?'passed':'failed');result.innerHTML='<strong>'+(r.data?.passed?'✓ Challenge completed':'↻ Submission needs improvement')+'</strong><p>'+esc(r.data?.message||'')+'</p><div class="codingSubmissionStats">'+Number(r.data?.passedTests||0)+' / '+Number(r.data?.totalTests||0)+' test cases passed · +'+Number(r.data?.xpEarned||0)+' XP</div>';}
   catch(e){result.className='codingLabResult failed';result.textContent=e.message||String(e);}
 });
 mount.querySelector('.codingClose')?.addEventListener('click',()=>{mount.hidden=true;mount.innerHTML='';});
}
function openCodingLab(ws,{title,prompt,starter,metaId=''}){
 const mount=ws?.querySelector?.('#moduleCodingLabMount'); if(!mount)return;
 const meta=metaId?C_COMPETITIVE_META_BY_ID[metaId]:null;
 mount.hidden=false;mount.dataset.metaId=metaId;mount.innerHTML=codingLabShell(title,prompt,starter,meta);
 wireCodingLab(ws);mount.scrollIntoView({behavior:'smooth',block:'start'});
}

function moduleView(track,data,no,programme){
 const assessmentCount=track.id==='c-programming'?15:10;
 const communicationAudio=track.id==='communication'&&data.audio?renderCommunicationAudioLab(data.speechTasks||[],data.title+' — Speaking Practice'):'';
 const topicHtml=(data.topics||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 let materialHtml='';
 if(Array.isArray(data.lessons)&&data.lessons.length){
   materialHtml=data.lessons.map((lesson,i)=>'<article class="studyLesson"><div class="studyLessonHead"><span>LESSON '+String(i+1).padStart(2,'0')+' · '+esc(lesson.level)+'</span><strong>'+esc(lesson.title)+'</strong></div><p class="studyTeach">'+esc(lesson.teach)+'</p><div class="studyExample"><b>Worked example</b><p>'+esc(lesson.example)+'</p><pre class="codeBlock"><code>'+esc(decodeCode(lesson.code))+'</code></pre></div><div class="microCheck"><b>Micro-check</b><span>'+esc(lesson.check)+'</span></div></article>').join('');
 }else{
   materialHtml=(data.materials||[]).map((x,i)=>{
     const title=typeof x==='string'?x:(x.title||'Learning material '+(i+1));
     const body=typeof x==='string'?materialGuide(x,data.title):(x.body||'');
     return '<div class="studyMaterial" data-material-id="'+esc(x.id||'')+'"><span>RESOURCE '+String(i+1).padStart(2,'0')+'</span><strong>'+esc(title)+'</strong><button class="materialToggle" data-open="0">Teach me</button><p class="materialBody" hidden>'+esc(body)+'</p></div>';
   }).join('');
 }
 if(data.example) materialHtml+='<article class="studyLesson moduleExampleLesson"><div class="studyLessonHead"><span>WORKED EXAMPLE</span><strong>See the skill in context</strong></div><p class="studyTeach">'+esc(data.example)+'</p>'+(data.audio?'<button type="button" class="practicePlayQuestion moduleAudioButton" data-speech="'+esc(data.example)+'">🔊 Listen to Example</button>':'')+'<div class="microCheck"><b>Explain it yourself</b><span>Close the notes and explain the example, the decision and one possible mistake.</span></div></article>';

 const drillHtml=(data.drills||[]).map((x,i)=>'<article class="drillCard" data-track="'+esc(track.id)+'" data-module-no="'+no+'" data-module="'+esc(data.title)+'"><div><span>DRILL '+String(i+1).padStart(2,'0')+'</span><h5>'+esc(typeof x==='string'?x:x.category)+'</h5><p>'+esc(typeof x==='string'?'Guided mission: solve the task, explain your reasoning and earn a Star for the attempt.':x.prompt)+'</p></div><button class="drillReveal">Start Drill</button></article>').join('')+renderDrillReward(data.title);
 const practiceHtml=data.title==='C Fundamentals'?'<div class="practiceTaskGrid">'+practicePoolForStudent(data.title).map((idx,i)=>renderPracticeTask(C_FUNDAMENTALS_PRACTICE_POOL[idx]||C_FUNDAMENTALS_PRACTICE[i],i)).join('')+'</div>':'<div class="practiceTaskGrid">'+(data.practiceTasks||[]).map((x,i)=>renderPracticeTask(x,i)).join('')+'</div>';

 const legacyCoding=track.id==='c-programming'?C_CODING_CHALLENGES.filter(x=>x.module===data.title):[];
 const competitiveCoding=track.id==='c-programming'?Object.values(C_COMPETITIVE_META_BY_ID).filter(x=>x.module===data.title):[];
 const codingHtml=track.id==='c-programming'?'<div class="codingApplyBlock"><div class="codingApplyHeader"><span class="sectionEyebrow">C PROGRAMMING · APPLY</span><h4>Executable Coding Practice</h4><p>Write, compile, run and improve your C solution before the module challenge.</p></div>'+
 '<div class="codingProgrammeGrid">'+legacyCoding.map((x,i)=>'<article class="codingProgrammeCard"><div><span>PLACEMENT PROGRAMME '+String(i+1).padStart(2,'0')+' · '+esc(x.difficulty.toUpperCase())+'</span><h5>'+esc(x.title)+'</h5></div><p>'+esc(x.prompt)+'</p><button class="openCodingProgramme" data-title="'+esc(x.title)+'" data-prompt="'+esc(x.prompt)+'">Open Coding Lab →</button></article>').join('')+'</div>'+
 '<div class="codingApplyHeader competitiveHeader"><span class="sectionEyebrow">COMPETITIVE CODING</span><h4>Algorithm Challenges · Samples + Hidden Tests</h4><p>Original FXEC problems covering implementation, searching, sorting, strings, sliding window, dynamic programming, recursion, greedy and bit manipulation.</p></div>'+
 '<div class="codingProgrammeGrid">'+competitiveCoding.map((x,i)=>'<article class="codingProgrammeCard competitiveCard"><div><span>ALGORITHM CHALLENGE '+String(i+1).padStart(2,'0')+' · '+esc(String(x.difficulty||x.domain||'Mixed').toUpperCase())+'</span><h5>'+esc(x.title)+'</h5><small class="codingDomainText">'+esc(x.domain)+'</small></div><p>'+esc(x.prompt)+'</p><div class="codingMetaRow"><span>2 sample tests</span><span>🔒 '+Number(x.hiddenTestCount||0)+' hidden</span></div><button class="openCompetitiveCoding" data-challenge-id="'+esc(x.id)+'">Open Challenge →</button></article>').join('')+'</div><div id="moduleCodingLabMount" class="moduleCodingLabMount" hidden></div></div>':'';

 return '<section class="moduleLearningWorkspace">'+
 '<div class="moduleLearningHero"><div><span class="sectionEyebrow">'+esc(track.title.toUpperCase())+' · MODULE '+String(no).padStart(2,'0')+'</span><h3>'+esc(data.title)+'</h3><p>'+esc(data.scope)+'</p>'+(programme?'<small>Programme: '+esc(programme.title)+'</small>':'')+'</div><button class="secondary" id="backToModules">← Back to Modules</button></div>'+
 '<div class="moduleFlowBanner"><strong>MODULE LEARNING FLOW</strong><span>01 Topic</span><i>→</i><span>02 Materials</span><i>→</i><span>03 Drills</span><i>→</i><span>04 Practice</span><i>→</i><span>05 Challenge</span><i>→</i><span>06 Final Assessment · '+assessmentCount+' Questions</span></div>'+
 '<section class="learningSection scopeSection"><span class="sectionEyebrow">01 · MODULE TOPIC</span><h4>What you will learn</h4><p class="moduleScopeText">'+esc(data.scope)+'</p><ul class="scopeList">'+topicHtml+'</ul><div class="learningOutcomes"><b>By the end of this module, you should be able to:</b><ol>'+(data.learningOutcomes||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div></section>'+
 '<section class="learningSection"><span class="sectionEyebrow">02 · MATERIALS</span><h4>Study Materials</h4><p class="slowLearnerNote">Learn the concept → inspect the example → trace it → complete the micro-check.</p>'+materialHtml+'</section>'+communicationAudio+
 '<section class="learningSection"><span class="sectionEyebrow">03 · GUIDED DRILLS</span><h4>Practise like a game</h4><p>Complete the guided missions here. ⭐ Stars belong to drills only.</p><div class="drillGrid">'+drillHtml+'</div></section>'+
 '<section class="learningSection"><span class="sectionEyebrow">04 · PRACTICE</span><h4>Practice Ladder · Levels 1–5</h4><p>Build independence step by step. Practice progress is separate from Drill Stars.</p><div class="practiceLadder">'+practiceHtml+'</div>'+codingHtml+'</section>'+
 '<section class="learningSection challengeSection"><span class="sectionEyebrow">05 · CHALLENGE</span><h4>Apply what you have learned</h4><div class="challengeBox"><p>'+esc(data.challenge)+'</p><ul><li>Write the solution in the editor.</li><li>Run normal, boundary and unusual inputs.</li><li>Fix compiler and logic errors.</li><li>Review before moving to the final assessment.</li></ul></div></section>'+
 '<section class="learningSection assessmentSection"><span class="sectionEyebrow">06 · FINAL ASSESSMENT</span><h4>Final Module Assessment · '+assessmentCount+' Questions</h4><p>'+esc(data.assessment)+'</p><div class="assessmentReadiness"><span>✓ Exactly '+assessmentCount+' questions</span><span>✓ Module-specific pool</span><span>✓ C modules include coding</span><span>✓ Admin/faculty approval required</span></div><button id="startAssessment">Start Final Assessment · '+assessmentCount+' Questions →</button><div id="moduleAssessmentMount" class="assessmentInlineMount"></div><p class="assessmentNote">This is the formal assessment for '+esc(data.title)+'. Drill Stars and practice rewards do not replace the final assessment score.</p></section></section>';
}
function materialGuide(resource,title){return 'Study this topic in three passes. First understand the idea. Second trace the worked example line by line. Third close the notes and reproduce the idea yourself. Then complete a related drill and explain the reasoning aloud. Resource: '+resource+'.';}
function checkPracticeAnswer(button){const box=document.createElement('div');box.className='practicePrompt';box.innerHTML='<strong>Self-check</strong><p>'+esc(button.dataset.question)+'</p><p><b>Model approach:</b> '+esc(button.dataset.answer)+'</p>';button.parentElement.appendChild(box);button.textContent='Review Prompt';}

async function loadCommunicationSpeechReview(mount){
 if(!mount)return;
 const box=document.createElement('section');box.className='communicationSpeechReview';
 box.innerHTML='<div class="moduleSectionHeading"><div><span class="sectionEyebrow">FACULTY / ADMIN · SPEAKING REVIEW</span><h4>Student Recordings</h4><p>Review the original recording, recognised text and speech scores. Recordings are private to authorised reviewers.</p></div><button type="button" class="secondary" data-load-speech>Load Recordings</button></div><div data-speech-list class="speechReviewList"></div>';
 mount.appendChild(box);
 box.querySelector('[data-load-speech]').onclick=async()=>{
  const list=box.querySelector('[data-speech-list]');list.innerHTML='<p>Loading recordings…</p>';
  try{
   const r=await call('getCommunicationSpeechAttempts')({limit:50});
   const items=r.data?.items||[];
   list.innerHTML=items.length?items.map(x=>{
    const p=x.pronunciation||{},rb=x.rubric||{};
    return '<article class="speechReviewCard"><div class="speechReviewMeta"><strong>'+esc(x.taskType)+'</strong><span>'+esc(x.uid)+'</span><span>'+Number(x.score||0)+'/100</span></div><p><b>Target:</b> '+esc(x.target)+'</p><p><b>Intonation target:</b> '+esc(x.intonationTarget||'not specified')+' · <b>Detected:</b> '+esc(x.detectedIntonation||'unknown')+(x.intonationMatchScore!=null?' · <b>Pitch-contour check:</b> '+Number(x.intonationMatchScore)+'/100':'')+'</p><p><b>Recognised speech:</b> '+esc(x.transcript||'(not recognised)')+'</p>'+(x.recordingUrl?'<audio controls preload="none" src="'+esc(x.recordingUrl)+'"></audio>':'<p>No recording URL available.</p>')+'<div class="speechReviewScores">'+(p.accuracyScore!=null?'<span>Accuracy '+p.accuracyScore+'</span>':'')+(p.fluencyScore!=null?'<span>Fluency '+p.fluencyScore+'</span>':'')+(p.completenessScore!=null?'<span>Completeness '+p.completenessScore+'</span>':'')+(p.prosodyScore!=null?'<span>Prosody '+p.prosodyScore+'</span>':'')+(rb.relevance!=null?'<span>Relevance '+rb.relevance+'</span>':'')+(rb.organisation!=null?'<span>Organisation '+rb.organisation+'</span>':'')+'</div></article>';
   }).join(''):'<p>No speaking recordings have been submitted yet.</p>';
  }catch(e){list.innerHTML='<p>Could not load speaking recordings: '+esc(e.message||String(e))+'</p>';}
 };
}
async function launchModuleAssessment(trackId,moduleNo,workspace=null){
 const taskId=String(trackId)+'_D'+String(moduleNo);
 const mount=workspace?.querySelector('#moduleAssessmentMount')||document.getElementById('competencyAssessmentLaunch');
 if(!mount)return;
 mount.id='moduleAssessmentMount';
 mount.innerHTML='<div class="caLoading"><strong>Checking assessment workflow…</strong><span>Admin/faculty review the full master question bank. Students see only the approved module assessment during its scheduled window.</span></div>';
 mount.scrollIntoView({behavior:'smooth',block:'start'});
 try{
   const roleResult=await call('getAdminCompetencyAssessmentPrograms')({});
   const role=roleResult.data?.role||'student';
   if(role==='admin'||role==='faculty'){
     if(!window.FXECCompetencyAssessmentAdmin?.load){
       mount.innerHTML='<div class="caError"><strong>Assessment administration script is not loaded.</strong><span>Refresh the page after the latest Hosting deployment.</span></div>';
       return;
     }
     mount.innerHTML='<div id="moduleAssessmentAdminMount"></div>';
     await window.FXECCompetencyAssessmentAdmin.load('moduleAssessmentAdminMount',trackId,moduleNo);
     if(trackId==='communication') await loadCommunicationSpeechReview(mount);
     return;
   }
   if(role==='student'){
     if(window.FXECCompetencyAssessmentStudent?.load) await window.FXECCompetencyAssessmentStudent.load(taskId,'moduleAssessmentMount');
     return;
   }
   mount.innerHTML='<div class="caError"><strong>Assessment role could not be determined.</strong><span>Please refresh and try again.</span></div>';
 }catch(e){
   mount.innerHTML='<div class="caError"><strong>Assessment administration could not be loaded.</strong><span>'+esc(e?.message||String(e))+'</span><p>For Admin/Faculty, this screen will not fall back to the student assessment.</p></div>';
 }
}

document.addEventListener('click',async e=>{
 const audio=e.target.closest('.moduleAudioButton');
 if(audio){ e.preventDefault(); speak(audio.dataset.speech||''); return; }
 const coding=e.target.closest('.openCodingProgramme');
 if(coding){
  e.preventDefault();
  const ws=coding.closest('.moduleLearningWorkspace');
  openCodingLab(ws,{title:coding.dataset.title||'Coding Programme',prompt:coding.dataset.prompt||'',starter:'#include <stdio.h>\n\nint main(void) {\n    /* Write your solution here. */\n    return 0;\n}'});
  return;
 }
 const competitive=e.target.closest('.openCompetitiveCoding');
 if(competitive){
  e.preventDefault();
  const ws=competitive.closest('.moduleLearningWorkspace');
  const id=competitive.dataset.challengeId;
  const meta=C_COMPETITIVE_META_BY_ID[id];
  if(meta) openCodingLab(ws,{title:meta.title,prompt:meta.prompt,starter:meta.starter,metaId:id});
  return;
 }
 const star=e.target.closest('.starAssessmentButton');
 if(star){
  e.preventDefault();
  const root=star.closest('.competencyPortal'); if(!root)return;
  const trackId=star.dataset.starTrack, no=Number(star.dataset.starModule);
  const programmeSelect=root.querySelector('#programmeSelect');
  const programme=programmeSelect?.value?PROGRAMMES.find(p=>p.id===programmeSelect.value):null;
  openModule(root,trackId,no,programme);
  const ws=root.querySelector('#competencyWorkspace');
  if(ws) await launchModuleAssessment(trackId,no,ws);
  return;
 }
 const b=e.target.closest('.moduleOpen'); if(!b)return;
 const root=b.closest('.competencyPortal'); if(!root)return;
 const trackId=b.dataset.track, no=Number(b.dataset.module);
 const track=TRACKS.find(x=>x.id===trackId);
 const programmeSelect=root.querySelector('#programmeSelect');
 const programme=programmeSelect?.value?PROGRAMMES.find(p=>p.id===programmeSelect.value):null;
 openModule(root,trackId,no,programme);
});

export {renderPortal as renderCompetencyPortal,TRACKS,PROGRAMMES,C_MODULES};
window.FXECCompetencyPortal={buildStamp:'2026.09.30.0635',renderCompetencyPortal:renderPortal,TRACKS,PROGRAMMES,C_MODULES,openTrack:(trackId)=>{const root=document.getElementById('firstYearCompetencyRoot');if(root)openTrack(root,trackId);}};
