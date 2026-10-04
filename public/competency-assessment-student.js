import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';

const fxecApp = getApps().length ? getApp() : initializeApp(window.FXEC_FIREBASE_CONFIG);
const functions = getFunctions(fxecApp, 'us-central1');
const call = name => httpsCallable(functions, name);
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function speak(textValue){if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(textValue||''));u.rate=.9;window.speechSynthesis.speak(u);}
function playOptionSequence(options,stage){
 let i=0;
 const next=()=>{
  if(i>=options.length){stage.textContent='All options played. Select A, B, C or D.';return;}
  stage.innerHTML='<strong>OPTION '+String.fromCharCode(65+i)+'</strong><span>Listening…</span>';
  speak(options[i]);i++;setTimeout(next,2000);
 };
 next();
}
function assessmentCodeViewer(code){
 const lines=String(code||'').replace(/\\n/g,'\n').split('\n');
 return '<div class="assessmentCodeViewport"><div class="assessmentCodeNumbers">'+lines.map((_,i)=>'<span>'+String(i+1)+'</span>').join('')+'</div><pre class="assessmentCodeScroll"><code>'+esc(lines.join('\n'))+'</code></pre></div>';
}

let activeHostId = 'competencyAssessmentLaunch';
let current = null;
let answers = {};
let index = 0;
let questionDeadlines = {};
let timer = null;

function host(){ return document.getElementById(activeHostId) || document.getElementById('competencyAssessmentLaunch'); }

function formatClock(seconds){
  const s=Math.max(0,Math.floor(seconds));
  return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}

function renderList(items,preferredTaskId=''){
  const root=host();
  if(!root)return;

  const preferred=preferredTaskId?items.find(x=>x.id===preferredTaskId):null;
  if(preferredTaskId){
    if(preferred && preferred.status==='open'){ start(preferredTaskId); return; }
    if(!preferred){
      root.innerHTML='<div class="caStudentEmpty"><span class="sectionEyebrow">FINAL ASSESSMENT</span><h3>No published assessment window for this module yet</h3><p>This module does not currently have an active or scheduled published assessment. Your study materials, Guided Drills and Practice Ladder remain available.</p><p><strong>Assessment status:</strong> The module assessment appears here only after its master question bank is reviewed, scheduled and approved.</p></div>';
      return;
    }
    const when=new Date(preferred.openAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
    root.innerHTML='<div class="caStudentEmpty"><span class="sectionEyebrow">FINAL ASSESSMENT · MODULE '+Number(preferred.day)+'</span><h3>'+esc(preferred.title)+'</h3><p>'+esc(preferred.topic)+'</p><div class="caDayMeta"><span>▣ 15 questions / student</span><span>◷ Opens '+esc(when)+'</span></div><button class="caStartButton" disabled>Not Open Yet</button></div>';
    return;
  }

  if(!items.length){
    root.innerHTML='<div class="caStudentEmpty"><span class="sectionEyebrow">FINAL ASSESSMENT</span><h3>No published assessment windows</h3><p>Your module learning pages remain available. Final Assessments appear inside their respective modules after review, scheduling and approval.</p></div>';
    return;
  }

  const groups={};
  items.forEach(x=>(groups[x.trackId]??=[]).push(x));

  let h='<div class="caStudentIntro"><div><span class="sectionEyebrow">ASSESSMENT LIST</span><h3>Published Competency Assessments</h3><p>Use the module page to launch a specific Final Assessment. Your recommended questions are selected securely on the server.</p></div><div class="caLaunchBadge">15 QUESTIONS · DIFFERENT SET PER STUDENT</div></div>';

  Object.entries(groups).forEach(([track,list])=>{
    h+='<section class="caStudentTrack"><div class="caTrackHeader"><div><span class="sectionEyebrow">COMPETENCY TRACK</span><h4>'+esc(list[0].trackTitle)+'</h4></div><span class="caTrackDayCount">'+list.length+' MODULE'+(list.length===1?'':'S')+'</span></div><div class="caStudentDayGrid">';

    list.forEach(x=>{
      const open=x.status==='open';
      const when=open?'OPEN NOW':'Opens '+new Date(x.openAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
      h+='<article class="caStudentDay '+(open?'isOpen':'')+'">'+
        '<div class="caDayTop"><span>MODULE '+x.day+'</span><span class="caOpenPill '+(open?'open':'scheduled')+'">'+(open?'OPEN':'SCHEDULED')+'</span></div>'+
        '<h5>'+esc(x.title)+'</h5><p>'+esc(x.topic)+'</p>'+
        '<div class="caDayMeta"><span>▣ '+Number(x.questionCount||15)+' questions</span><span>◷ '+esc(when)+'</span></div>'+
        '<button class="caStartButton" data-task="'+esc(x.id)+'" '+(open?'':'disabled')+'>'+(open?'Start Assessment →':'Not Open Yet')+'</button>'+
      '</article>';
    });

    h+='</div></section>';
  });

  root.innerHTML=h;
  root.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>start(b.dataset.task));
}

async function load(preferredTaskId='',hostId=''){
  if(hostId) activeHostId=hostId;
  const root=host();
  if(!root)return;
  root.innerHTML='<div class="caLoading"><div class="assessmentSpinner"></div><strong>Loading assessments…</strong><span>Checking the published assessment windows.</span></div>';
  try{
    const r=await call('getStudentCompetencyAssessments')({});
    renderList(r.data?.items||[],preferredTaskId);
  }catch(e){
    root.innerHTML='<div class="caStudentEmpty error"><span class="sectionEyebrow">ASSESSMENT CENTRE</span><h3>Unable to load assessments</h3><p>'+esc(e.message||String(e))+'</p><button id="caRetry">Try Again</button></div>';
    root.querySelector('#caRetry')?.addEventListener('click',load);
  }
}

async function start(taskId){
  const root=host();
  try{
    root.innerHTML='<div class="caLoading"><div class="assessmentSpinner"></div><strong>Preparing your assessment…</strong><span>Your 15-question set is being selected securely. Please do not refresh.</span></div>';
    const r=await call('startCompetencyAssessment')({taskId});
    current=r.data;
    answers={};
    index=0;
    questionDeadlines={};
    clearInterval(timer);
    renderAssessment();
  }catch(e){
    root.innerHTML='<div class="caStudentEmpty error"><span class="sectionEyebrow">ASSESSMENT CENTRE</span><h3>Unable to start assessment</h3><p>'+esc(e.message||String(e))+'</p><button id="caBack">Back to Assessments</button></div>';
    root.querySelector('#caBack')?.addEventListener('click',load);
  }
}

function saveAnswer(q,root){
  if(q.activityType==='coding-challenge'){
    const editor=root.querySelector('.caCodeAnswer');
    if(editor) answers[q.id]=editor.value;
    return;
  }
  if(q.type==='multipleCorrect'){
    answers[q.id]=Array.from(root.querySelectorAll('input[name="caAnswer"]:checked')).map(x=>Number(x.value));
  }else{
    const selected=root.querySelector('input[name="caAnswer"]:checked');
    if(selected)answers[q.id]=Number(selected.value);
  }
}

function restoreAnswer(q,root){
  const a=answers[q.id];
  if(a===undefined)return;
  if(q.activityType==='coding-challenge'){
    const editor=root.querySelector('.caCodeAnswer');
    if(editor) editor.value=String(a);
    return;
  }
  root.querySelectorAll('input[name="caAnswer"]').forEach(x=>{
    const n=Number(x.value);
    x.checked=Array.isArray(a)?a.includes(n):a===n;
  });
}

function renderAssessment(){
 const root=host(),q=current?.questions?.[index],total=current?.questions?.length||0;
 if(!root||!current)return;
 if(!q){submit();return;}
 const limit=Math.max(20,Number(q.timeLimitSeconds||60));
 if(!questionDeadlines[q.id])questionDeadlines[q.id]=Date.now()+limit*1000;
 const progress=Math.round(((index+1)/total)*100);
 const codingMode=q.activityType==='coding-challenge';
 const typeLabel=codingMode?'CODING CHALLENGE':q.activityType?String(q.activityType).replace(/-/g,' ').toUpperCase():(q.type==='multipleCorrect'?'MULTIPLE CORRECT':q.type==='scenario'?'SCENARIO':q.type==='audio'?'AUDIO':'MCQ');
 const isMulti=q.type==='multipleCorrect';
 const audioMode=q.type==='audio'||q.activityType==='listening'||q.activityType==='audio-options';
 const audioOptions=audioMode;
 const options=codingMode?'':(q.options||[]).map((o,i)=>
   '<label class="studentOption '+(audioOptions?'audioAssessmentOption':'')+'"><input type="'+(isMulti?'checkbox':'radio')+'" name="caAnswer" value="'+i+'"><span class="studentOptionLetter">'+String.fromCharCode(65+i)+'</span><span class="studentOptionText">'+(audioOptions?'<span class="srOnlyOption">'+esc(o)+'</span>Audio Option '+String.fromCharCode(65+i):esc(o))+'</span></label>'
 ).join('');
 root.innerHTML='<div class="caLiveShell caModernAssessment">'+
  '<div class="caLiveHeader"><div><span class="sectionEyebrow">'+esc(current.trackId)+' · MODULE '+current.day+'</span><h3>'+esc(current.title)+'</h3><p>Question '+String(index+1).padStart(2,'0')+' of '+String(total).padStart(2,'0')+'</p></div><button class="caExitButton" id="caExit">← Assessment List</button></div>'+
  '<article class="studentQuestionCard caLiveCard">'+
   '<div class="studentQuestionTop"><span>QUESTION '+String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'</span><span>'+typeLabel+' · '+esc(q.difficulty||'standard')+'</span></div>'+
   '<div class="studentProgress"><span style="width:'+progress+'%"></span></div>'+
   '<div class="studentTimingBar"><div><small>QUESTION TIME</small><strong id="caQuestionTimer">--:--</strong></div><div><small>TOTAL TIME</small><strong id="caTotalTimer">--:--</strong></div><div><small>TIME ALLOTTED</small><strong>'+formatClock(limit)+'</strong></div></div>'+
   (q.code?assessmentCodeViewer(q.code):'')+
   '<div class="studentPrompt audioAssessmentPrompt '+(audioMode?'audioOnlyPrompt':'')+'"><div><span class="promptKicker">QUESTION</span>'+(audioMode?'<p class="audioPromptPlaceholder">🔊 Question available by audio</p>':'<p>'+esc(q.prompt||'')+'</p>')+'</div>'+(audioMode&&q.audioUrl?'<audio id="assessmentQuestionAudio" controls preload="none" src="'+esc(q.audioUrl)+'"></audio>':'')+'<button id="playAssessmentAudio" class="audioQuestionButton">🔊 '+(q.audioUrl?'Play Audio':'Listen to Question')+'</button></div>'+
   (audioMode?'<div class="audioAssessmentStage" id="audioAssessmentStage"><strong>READY</strong><span>Press Listen to Question to hear the options one at a time.</span></div>':'')+
   (codingMode?'<div class="codingAssessmentBox"><div class="codingAssessmentMeta"><span>⌨ WRITE C CODE</span><span>Sample input: '+esc(q.sampleInput||'')+'</span><span>Expected: '+esc(q.sampleOutput||'')+'</span></div><textarea class="caCodeAnswer" spellcheck="false">'+esc(q.starter||'')+'</textarea><div class="codingAssessmentRun"><button type="button" id="runAssessmentCode" class="secondary">▶ Run Sample</button><span id="assessmentCodeOutput">Run your code against the sample before submitting.</span></div></div>':'')+
   '<div class="caInstruction">'+(codingMode?'Write and test a complete C program. Your code is graded against hidden server-side test cases.':isMulti?'Select all correct answers.':'Select the one best answer.')+'</div>'+
   '<div class="studentAnswerArea">'+(codingMode?'':('<div class="studentOptionList">'+options+'</div>'))+'</div>'+
   '<div class="caLiveNav"><button class="secondary" id="caPrev" '+(index===0?'disabled':'')+'>← Previous</button><span>'+String(index+1)+' / '+String(total)+'</span><button id="caNext">'+(index===total-1?'Submit Assessment':'Next Question →')+'</button></div>'+
  '</article></div>';
 restoreAnswer(q,root);
 const play=root.querySelector('#playAssessmentAudio');
 const audioEl=root.querySelector('#assessmentQuestionAudio');
 if(play)play.onclick=()=>{
   if(audioEl){
     audioEl.currentTime=0;
     const p=audioEl.play();
     if(p?.catch)p.catch(()=>{});
     const stage=root.querySelector('#audioAssessmentStage');
     if(stage){
       stage.innerHTML='<strong>LISTENING</strong><span>Listen to the question, then select your answer.</span>';
     }
     audioEl.onended=()=>{ if(stage) playOptionSequence(q.options||[],stage); };
   }else{
     speak(q.audioText||q.prompt||'');
     if(audioMode){
       const stage=root.querySelector('#audioAssessmentStage');
       setTimeout(()=>playOptionSequence(q.options||[],stage),1100);
     }
   }
 };
 root.querySelectorAll('input[name="caAnswer"]').forEach(x=>x.addEventListener('change',()=>saveAnswer(q,root)));
 const runAssessmentCode=root.querySelector('#runAssessmentCode');
 if(runAssessmentCode) runAssessmentCode.onclick=async()=>{
   const editor=root.querySelector('.caCodeAnswer'),out=root.querySelector('#assessmentCodeOutput');
   runAssessmentCode.disabled=true;out.textContent='Compiling sample…';
   try{const r=await call('runCCode')({sourceCode:editor.value,stdin:String(q.sampleInput||'')});out.textContent=(r.data?.stdout||r.data?.compileOutput||r.data?.stderr||r.data?.status||'No output')+(r.data?.accepted?' ✓ Sample passed':' ↻ Fix and try again');}
   catch(e){out.textContent=e.message||String(e);}finally{runAssessmentCode.disabled=false;}
 };
 root.querySelector('#caPrev').onclick=()=>{saveAnswer(q,root);if(index>0){index--;renderAssessment();}};
 root.querySelector('#caNext').onclick=()=>{
   saveAnswer(q,root);const a=answers[q.id];
   if(a===undefined||(Array.isArray(a)&&!a.length)||(codingMode&&!String(a||'').trim())){const note=root.querySelector('.caInstruction');note.textContent=codingMode?'Write your C program before continuing.':'Please select an answer before continuing.';note.classList.add('caInstructionError');return;}
   if(index===total-1)submit();else{index++;renderAssessment();}
 };
 root.querySelector('#caExit').onclick=()=>{if(confirm('Leave the assessment and return to the assessment list? Your current attempt will remain open.'))load();};
 clearInterval(timer);
 const closeAt=new Date(current.closeAt).getTime();
 const tick=()=>{
  const qLeft=Math.max(0,questionDeadlines[q.id]-Date.now()),totalLeft=Math.max(0,closeAt-Date.now());
  const qTimer=root.querySelector('#caQuestionTimer'),totalTimer=root.querySelector('#caTotalTimer');
  if(qTimer)qTimer.textContent=formatClock(qLeft);if(totalTimer)totalTimer.textContent=formatClock(totalLeft);
  if(qLeft<=0){clearInterval(timer);saveAnswer(q,root);if(index<total-1){index++;renderAssessment();}else submit();return;}
  if(totalLeft<=0){clearInterval(timer);submit(true);}
 };
 tick();timer=setInterval(tick,250);
}
async function submit(auto=false){
  if(!current)return;
  clearInterval(timer);
  const root=host();
  try{
    if(root)root.innerHTML='<div class="caLoading"><div class="assessmentSpinner"></div><strong>Submitting your assessment…</strong><span>Answers are being checked securely on the server.</span></div>';
    const payload=Object.keys(answers).map(id=>({questionId:id,answer:answers[id]}));
    const r=await call('submitCompetencyAssessment')({attemptId:current.attemptId,answers:payload});
    const d=r.data;
    root.innerHTML='<div class="caResult">'+
      '<span class="sectionEyebrow">ASSESSMENT COMPLETE</span>'+
      '<h3>'+esc(current.title)+'</h3>'+
      '<div class="caScoreRing"><strong>'+Number(d.scorePercent)+'%</strong><span>'+Number(d.score)+' / '+Number(d.total)+' correct</span></div>'+
      '<div class="caResultStatus '+(d.passed?'passed':'notPassed')+'">'+(d.passed?'✓ PASSED':'REVIEW REQUIRED')+'</div>'+
      '<p>'+ (d.passed?'You have completed this competency assessment successfully.':'Review the learning material and use the next available assessment opportunity to strengthen the skill.')+'</p>'+
      '<div class="caResultStats"><div><strong>+'+Number(d.xp)+' XP</strong><span>XP earned</span></div><div><strong>'+Number(d.scorePercent)+'%</strong><span>Score</span></div><div><strong>'+Number(d.total)+'</strong><span>Questions</span></div></div>'+
      '<button id="caBack">Back to Assessments</button>'+
    '</div>';
    root.querySelector('#caBack').onclick=load;
  }catch(e){
    root.innerHTML='<div class="caStudentEmpty error"><span class="sectionEyebrow">SUBMISSION</span><h3>Submission could not be completed</h3><p>'+esc(e.message||String(e))+'</p><button id="caRetrySubmit">Try Again</button></div>';
    root.querySelector('#caRetrySubmit')?.addEventListener('click',()=>submit(auto));
  }
}

window.FXECCompetencyAssessmentStudent={load};
