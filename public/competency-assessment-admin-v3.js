import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
const fxecApp = getApps().length ? getApp() : initializeApp(window.FXEC_FIREBASE_CONFIG);
const auth=getAuth(fxecApp);
const functions=getFunctions(fxecApp,'us-central1');
const call=name=>{
  const fn=httpsCallable(functions,name);
  return async data=>{
    const user=auth.currentUser;
    if(!user) throw new Error('Administrator session is not authenticated. Please sign out and sign in again.');
    await user.getIdToken(true);
    return fn(data);
  };
};
const TRACKS=[['communication','Communication'],['aptitude','Aptitude'],['core-engineering','Core Engineering'],['c-programming','C Programming'],['problem-solving','Problem Solving'],['analytical','Analytical Skills']];
const MODULES={communication:['Grammar & Usage','Vocabulary & Word Usage','Reading Comprehension','Listening Skills','Speaking Skills','Professional Communication','Presentation Skills','Group Discussion','Workplace Writing','Integrated Communication'],aptitude:['Number Systems & Arithmetic','Percentages, Ratios & Averages','Profit, Loss & Interest','Time, Work & Speed','Algebra & Equations','Logical Reasoning','Data Interpretation','Numerical Reasoning','Verbal Reasoning','Integrated Aptitude'],'core-engineering':['Engineering Fundamentals','Measurements & Units','Engineering Materials','Basic Systems & Components','Diagrams & Schematics','Tools & Instrumentation','Digital / Computational Thinking','Engineering Analysis','Engineering Decisions','Integrated Programme Challenge'],'c-programming':['C Fundamentals','Control Flow','Arrays','Functions & Modular Programming','Pointers','Structures, Unions & User-Defined Types','Dynamic Memory & Memory Management','File Handling','Strings','Advanced C'],'problem-solving':['Problem Definition','Decomposition','Pattern Recognition','Abstraction','Algorithm Design','Pseudocode','Data & State Thinking','Debugging','Complexity & Optimisation','Integrated Problem Challenge'],analytical:['Information Extraction','Reading for Meaning','Listening for Meaning','Inference','Data Interpretation','Evidence & Claims','Comparison & Classification','Critical Reasoning','Decision Analysis','Integrated Analytical Challenge']};
let programs=[],selectedTrack='communication',selectedDay=1,viewerRole='admin',activeHostId='competencyAssessmentAdmin';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function host(){return document.getElementById(activeHostId)||document.getElementById('competencyAssessmentAdmin');}
function task(track,day){return programs.find(x=>x.trackId===track&&Number(x.day)===day);}
async function fetchPrograms(){
  const r=await call('getAdminCompetencyAssessmentPrograms')({trackId:selectedTrack,day:selectedDay});
  programs=r.data?.items||[];
  viewerRole=r.data?.role||'admin';
  return r;
}
function render(){
  const root=host();if(!root)return;
  const t=task(selectedTrack,selectedDay);
  let h='<div class="competencyAdminToolbar"><label>Competency <select id="caTrack">';
  h+=TRACKS.map(x=>'<option value="'+x[0]+'" '+(x[0]===selectedTrack?'selected':'')+'>'+x[1]+'</option>').join('');
  h+='</select></label>'+(viewerRole==='admin'?'<span class="practiceBadge">PREPARED MASTER BANKS</span>':'<span class="practiceBadge">FACULTY VERIFICATION MODE</span>')+'<button id="caLoadQuestions" class="primaryButton">Load Questions</button><button id="caRefresh" class="secondary">Refresh Module</button></div>';
  h+='<div class="caDayTabs">'+Array.from({length:10},(_,i)=>i+1).map(d=>'<button class="'+(d===selectedDay?'active':'')+'" data-day="'+d+'">Module '+d+'</button>').join('')+'</div>';
  h+='<div id="caStatus" class="scheduleSaveStatus"></div>';
  h+=t?renderEditor(t):'<div class="caEmpty"><strong>Module '+selectedDay+' is not prepared yet.</strong><p>Select another module or prepare this module in the controlled bank-preparation process. Only the selected module is loaded from Firestore.</p></div>';
  root.innerHTML=h;
  root.querySelectorAll('.caActivityType').forEach((el,i)=>{const q=t?.questions?.[i];if(q?.activityType)el.value=q.activityType;});
  const trackSelect=root.querySelector('#caTrack');
  if(trackSelect)trackSelect.addEventListener('change',e=>{selectedTrack=e.target.value;selectedDay=1;load(activeHostId,selectedTrack,selectedDay);});
  const loadQuestionsButton=root.querySelector('#caLoadQuestions');
  if(loadQuestionsButton)loadQuestionsButton.addEventListener('click',async()=>{
    loadQuestionsButton.disabled=true;
    loadQuestionsButton.textContent=selectedTrack==='c-programming'?'Loading prepared 10 × 50 bank…':'Loading…';
    try{
      if(selectedTrack==='c-programming'){
        setStatus('Loading the prepared, validated 500-question C bank. No questions are generated at runtime. All 10 modules remain DRAFT until review.','success');
        await call('loadPreparedCompetencyAssessmentProgram')({trackId:'c-programming'});
      }
      await load(activeHostId,selectedTrack,selectedDay);
    }catch(e){
      setStatus(e?.message||String(e),'error');
    }finally{
      const b=host()?.querySelector('#caLoadQuestions');
      if(b){b.disabled=false;b.textContent='Load Questions';}
    }
  });
  const refreshButton=root.querySelector('#caRefresh');
  if(refreshButton)refreshButton.addEventListener('click',()=>load(activeHostId,selectedTrack,selectedDay));
  root.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{selectedDay=Number(b.dataset.day);load(activeHostId,selectedTrack,selectedDay);}));
  if(t)wireEditor();
}

function renderGenerationProgress(){
 const completed=new Set(generationState?.completed||[]);
 const current=Number(generationState?.current||1);
 const failed=generationState?.error;
 const finished=Boolean(generationState?.finished);
 const isC=generationState?.trackId==='c-programming';
 const trackTitle=TRACKS.find(x=>x[0]===generationState?.trackId)?.[1]||'Competency';
 const percent=finished?100:Math.round((completed.size/10)*100);
 let h='<div class="caGenerationPanel '+(failed?'isError':finished?'isComplete':'')+'">';
 h+='<div class="caGenerationHero"><div><span class="sectionEyebrow">'+(isC?'NEW MIXED-FORMAT C BANK':'AUTOMATIC '+esc(trackTitle.toUpperCase())+' BANK')+'</span><h3>'+(finished?'Generation complete':failed?'Generation stopped':'Generating '+esc(trackTitle)+' Modules')+'</h3>';
 h+='<p>'+(failed?'Module '+failed.day+' could not be generated. Your existing draft remains unchanged.':finished?(isC?'500 questions generated and saved as DRAFT across all 10 C modules.':'All 10 module banks were generated and saved as DRAFT; students receive 10 questions automatically.'):'The old question editor is temporarily hidden. Each completed module is saved automatically; this page is only tracking the background jobs.')+'</p></div><strong>'+percent+'%</strong></div>';
 h+='<div class="caGenerationBar"><span style="width:'+percent+'%"></span></div>';
 h+='<div class="caGenerationGrid">';
 for(let d=1;d<=10;d++){
   const state=completed.has(d)?'complete':(failed?.day===d?'failed':(!finished&&d===current?'current':'pending'));
   const icon=state==='complete'?'✓':state==='failed'?'!':state==='current'?'…':'';
   h+='<div class="caGenerationStep '+state+'"><b>Module '+d+'</b><span>'+icon+' '+(state==='complete'?'50 saved':state==='failed'?'Failed':state==='current'?'Generating…':'Waiting')+'</span></div>';
 }
 h+='</div>';
 if(failed) h+='<div class="caGenerationError"><b>Generation failed for Module '+failed.day+'</b><span>'+esc(failed.message)+'</span><small>No existing questions were overwritten. Fix the server error, then run generation again.</small></div>';
 if(finished) h+='<div class="caGenerationComplete">✓ The 10-module mixed-format bank is ready. Select a module above to review its 50 master questions.</div>';
 h+='</div>';
 return h;
}

function renderEditor(t){
 const open=t.openAt&&t.openAt.seconds?new Date(t.openAt.seconds*1000).toISOString().slice(0,16):String(t.openAt||'').slice(0,16);
 const close=t.closeAt&&t.closeAt.seconds?new Date(t.closeAt.seconds*1000).toISOString().slice(0,16):String(t.closeAt||'').slice(0,16);

 let h='<div class="caEditor"><div class="caEditorHead"><div><span class="sectionEyebrow">MODULE '+t.day+' · '+esc(t.trackTitle)+'</span><h3>'+esc(t.title)+'</h3><p>Status: <b>'+esc(t.status||'draft')+'</b> · <b>'+Number(t.questionCount||t.questions?.length||0)+' master questions</b> · <b>'+Number(t.recommendedQuestionCount||15)+' questions per student</b></p></div><span class="practiceBadge">'+(t.isPublished?'PUBLISHED':'DRAFT')+'</span></div>';
 h+='<div class="caMetaGrid"><label>Title<input id="caTitle" value="'+esc(t.title)+'"></label><label>Topic<input id="caTopic" value="'+esc(t.topic)+'"></label><label>Date<input id="caDate" type="date" value="'+esc(t.date||'')+'"></label><label>Open<input id="caOpen" type="datetime-local" value="'+esc(open)+'"></label><label>Close<input id="caClose" type="datetime-local" value="'+esc(close)+'"></label></div>';
 h+='<div class="caFacultyAssign"><div><span class="sectionEyebrow">VERIFICATION WORKFLOW</span><strong>Faculty verifier</strong><p>'+(t.facultyEmail?'Assigned to '+esc(t.facultyName||t.facultyEmail):'No faculty verifier assigned. Admin can review directly.')+'</p></div>'+(viewerRole==='admin'?'<div class="caFacultyControls"><input id="caFacultyEmail" type="email" placeholder="faculty@francisxavier.ac.in" value="'+esc(t.facultyEmail||'')+'"><button id="caAssignFaculty" class="secondary">Assign Faculty</button></div>':'<span class="practiceBadge">Assigned Faculty</span>')+'</div>';
 const cSummary=selectedTrack==='c-programming'?renderCCompositionSummary(t.questions||[]):'';
 h+='<div class="caQuestionHead"><h4>Question Review & Assignment</h4><span>AI-generated questions are structurally validated and independently audited twice. Faculty/admin must still review before publishing.</span></div>'+cSummary+'<div id="caQuestions">'+(t.questions||[]).map((q,i)=>renderQuestion(q,i)).join('')+'</div>';
 h+='<div class="caActions"><button id="caSave">Save Draft</button><button id="caApprove" class="primaryButton" '+(t.isPublished?'disabled':'')+'>'+(t.isPublished?'✓ Published':'Approve & Publish Module '+t.day)+'</button></div><div id="caStatus"></div></div>';
 return h;
}
function renderCCompositionSummary(questions){
 const target={mcq:15,'output-prediction':8,'bug-identification':6,'missing-code':5,'code-observation':5,listening:3,'coding-challenge':3,'scenario-analysis':5};
 const counts={};
 (questions||[]).forEach(q=>{const k=String(q.activityType||'mcq');counts[k]=(counts[k]||0)+1;});
 const labels={'mcq':'MCQ / Concept','output-prediction':'Output Prediction','bug-identification':'Debugging / Bug ID','missing-code':'Missing Code','code-observation':'Code Observation / Trace','listening':'Audio / Listening','coding-challenge':'C Coding Challenge','scenario-analysis':'Scenario Analysis'};
 const total=(questions||[]).length;
 const allExpected=Object.entries(target).every(([k,v])=>counts[k]===v);
 const allMcq=total>0 && counts.mcq===total;
 return '<div class="caCompositionBox '+(allExpected?'isComplete':'isIncomplete')+'"><div><strong>C Assessment Composition</strong><span>'+total+' / 50 master questions currently loaded</span></div><div class="caCompositionGrid">'+Object.entries(target).map(([k,v])=>'<span class="'+(counts[k]===v?'ok':'missing')+'"><b>'+Number(counts[k]||0)+' / '+v+'</b> '+labels[k]+'</span>').join('')+'</div>'+(allMcq?'<div class="caCompositionWarning">⚠ This is the old MCQ-only bank. Do not publish it. Use <b>Load Questions</b> to load the prepared mixed-format C bank.</div>':'')+'</div>';
}

function renderQuestion(q,i){
 const coding=q.activityType==='coding-challenge';
 let h='<article class="caQuestion '+(coding?'caCodingQuestion':'')+'"><div class="caQuestionNo">Q'+String(i+1).padStart(2,'0')+'</div><div class="caQuestionFields">';
 h+='<div class="caQuestionLabelRow"><span class="questionKindBadge">'+(coding?'⌨ CODING CHALLENGE':esc(q.activityType||q.type||'MCQ').toUpperCase())+'</span><span class="questionTopicBadge">'+esc(q.topic||'')+'</span></div>';
 h+='<label>Question<textarea class="caPrompt">'+esc(q.prompt)+'</textarea></label>';
 if(coding){
   h+='<label>Starter Code<textarea class="caCodeStarter caCode">'+esc(q.starter||'')+'</textarea></label>';
   h+='<div class="caCodingMeta"><label>Sample Input<textarea class="caSampleInput">'+esc(q.sampleInput||'')+'</textarea></label><label>Expected Sample Output<textarea class="caSampleOutput">'+esc(q.sampleOutput||'')+'</textarea></label></div>';
   h+='<div class="caHiddenTests"><b>Hidden tests: '+Number(q.codingTests?.length||0)+'</b><span>Students never receive these test cases. They are used for server-side grading.</span></div>';
 }else{
   h+='<div class="caOptions">'+(q.options||[]).map((o,j)=>'<label>Option '+String.fromCharCode(65+j)+'<input class="caOpt" value="'+esc(o)+'"></label>').join('')+'</div>';
 }
 h+='<div class="caQuestionMeta"><label>Scoring Type<select class="caType"><option value="mcq" '+(q.type==='mcq'?'selected':'')+'>MCQ</option><option value="multipleCorrect" '+(q.type==='multipleCorrect'?'selected':'')+'>Multiple Correct</option><option value="scenario" '+(q.type==='scenario'?'selected':'')+'>Scenario</option></select></label><label>Activity Type<select class="caActivityType"><option value="mcq">MCQ</option><option value="multiple-correct">Multiple Correct</option><option value="match">Match</option><option value="code-observation">Code Observation</option><option value="output-prediction">Output Prediction</option><option value="bug-identification">Bug Identification</option><option value="missing-code">Missing Code</option><option value="coding-challenge" '+(coding?'selected':'')+'>Coding Challenge</option><option value="diagram-interpretation">Diagram Interpretation</option><option value="scenario-analysis">Scenario Analysis</option><option value="listening">Listening</option><option value="engineering-decision">Engineering Decision</option></select></label><label>Correct index(es)<input class="caAnswer" value="'+(coding?'':esc(Array.isArray(q.answer)?q.answer.join(','):q.answer))+'" '+(coding?'disabled':'')+'></label><label>Time (sec)<input class="caTime" type="number" min="20" value="'+Number(q.timeLimitSeconds||60)+'"></label></div>';
 if(!coding) h+='<label>Code / activity material<textarea class="caCode">'+esc(q.code||'')+'</textarea></label><label>Audio text (optional)<textarea class="caAudioText">'+esc(q.audioText||'')+'</textarea></label>';
 h+='<label>Explanation<textarea class="caExplanation">'+esc(q.explanation||'')+'</textarea></label></div></article>';return h;
}
function readQuestions(){
 return Array.from(host().querySelectorAll('.caQuestion')).map((card,i)=>{
  const type=card.querySelector('.caType').value,raw=card.querySelector('.caAnswer').value.trim();
  const coding=card.classList.contains('caCodingQuestion');
  const answer= coding ? 0 : (type==='multipleCorrect'?raw.split(',').map(Number).filter(Number.isInteger):Number(raw));
  const existing=task(selectedTrack,selectedDay)?.questions?.[i]||{};
  return {id:existing.id||selectedTrack+'-D'+selectedDay+'-Q'+(i+1),type,activityType:card.querySelector('.caActivityType')?.value||'mcq',difficulty:existing.difficulty|| (i<15?'easy':i<35?'moderate':'tough'),topic:host().querySelector('#caTopic').value.trim(),prompt:card.querySelector('.caPrompt').value.trim(),code:card.querySelector('.caCode')?.value.trim()||'',audioText:card.querySelector('.caAudioText')?.value.trim()||'',options:coding?[]:Array.from(card.querySelectorAll('.caOpt')).map(x=>x.value.trim()),answer,starter:card.querySelector('.caCodeStarter')?.value.trim()||existing.starter||'',sampleInput:card.querySelector('.caSampleInput')?.value.trim()||existing.sampleInput||'',sampleOutput:card.querySelector('.caSampleOutput')?.value.trim()||existing.sampleOutput||'',codingTests:existing.codingTests||[],explanation:card.querySelector('.caExplanation').value.trim(),timeLimitSeconds:Number(card.querySelector('.caTime').value||60),reviewed:true};
 });
}
function wireEditor(){
 const saveButton=host().querySelector('#caSave');
 const approveButton=host().querySelector('#caApprove');
 if(saveButton)saveButton.addEventListener('click',()=>save(false));
 if(approveButton)approveButton.addEventListener('click',()=>save(true));
 const assign=host().querySelector('#caAssignFaculty');
 if(assign)assign.addEventListener('click',async()=>{
   const email=host().querySelector('#caFacultyEmail').value.trim();
   if(!email)return setStatus('Enter the faculty email address.');
   try{assign.disabled=true;setStatus('Assigning faculty verifier…','saving');await call('assignCompetencyAssessmentFaculty')({trackId:selectedTrack,day:selectedDay,facultyEmail:email});await load();setStatus('✓ Faculty verifier assigned.','success');}
   catch(e){assign.disabled=false;setStatus(e.message||String(e));}
 });
}
async function save(approve){
 const date=host().querySelector('#caDate').value;
 const openValue=host().querySelector('#caOpen').value;
 const closeValue=host().querySelector('#caClose').value;
 const payload={trackId:selectedTrack,day:selectedDay,title:host().querySelector('#caTitle').value.trim(),topic:host().querySelector('#caTopic').value.trim(),date,openAt:openValue?new Date(openValue).toISOString():'',closeAt:closeValue?new Date(closeValue).toISOString():'',questions:readQuestions()};
 try{
   if(approve && (!date||!openValue||!closeValue)){setStatus('Set the assessment date, opening time and closing time before approval/publishing.');return;}
   setStatus('Saving draft…','saving');
   await call('saveCompetencyAssessmentDay')(payload);
   if(approve){
     if(!confirm('Approve and publish this module? Students will see it only during the scheduled assessment window.'))return;
     await call('approveCompetencyAssessmentDay')({trackId:selectedTrack,day:selectedDay});
   }
   await load();
   setStatus(approve?'✓ Approved and published for the scheduled window.':'✓ Draft saved.','success');
 }catch(e){setStatus(e.message||String(e));}
}
function setStatus(message,kind='error'){const el=host()?.querySelector('#caStatus');if(el){el.textContent=message;el.className='scheduleSaveStatus '+kind;}}
async function load(hostId='',trackId='',day=1){try{if(hostId)activeHostId=hostId;if(trackId)selectedTrack=trackId;if(day)selectedDay=Number(day);await fetchPrograms();render();}catch(e){const h=host();if(h)h.innerHTML='<p>Competency assessment administration is unavailable: '+esc(e.message)+'</p>';}}
window.FXECCompetencyAssessmentAdmin={load};
