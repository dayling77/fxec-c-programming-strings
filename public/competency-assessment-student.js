import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';

const fxecApp = getApps().length ? getApp() : initializeApp(window.FXEC_FIREBASE_CONFIG);
const functions = getFunctions(fxecApp, 'us-central1');
const call = name => httpsCallable(functions, name);
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function speak(textValue){if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(textValue||''));u.rate=.9;window.speechSynthesis.speak(u);}
function playOptionSequence(options,stage){let i=0;const next=()=>{if(i>=options.length){stage.textContent='All options played. Select A, B, C or D.';return;}stage.textContent='Listening to Option '+String.fromCharCode(65+i)+'…';speak(options[i]);i++;setTimeout(next,3000);};next();}

let current = null;
let answers = {};
let index = 0;
let questionDeadlines = {};
let timer = null;

function host(){ return document.getElementById('competencyAssessmentLaunch'); }

function formatClock(seconds){
  const s=Math.max(0,Math.floor(seconds));
  return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}

function renderList(items){
  const root=host();
  if(!root)return;

  if(!items.length){
    root.innerHTML='<div class="caStudentEmpty"><span class="sectionEyebrow">ASSESSMENT LAUNCH CENTRE</span><h3>No published assessments yet</h3><p>Your Administrator will publish each assessment after reviewing and approving its question pool.</p></div>';
    return;
  }

  const groups={};
  items.forEach(x=>(groups[x.trackId]??=[]).push(x));

  let h='<div class="caStudentIntro"><div><span class="sectionEyebrow">ASSESSMENT LAUNCH CENTRE</span><h3>Competency Assessments</h3><p>Administrator-approved assessments are shown here. Your recommended questions are selected securely on the server.</p></div><div class="caLaunchBadge">15 QUESTIONS</div></div>';

  Object.entries(groups).forEach(([track,list])=>{
    h+='<section class="caStudentTrack"><div class="caTrackHeader"><div><span class="sectionEyebrow">COMPETENCY TRACK</span><h4>'+esc(list[0].trackTitle)+'</h4></div><span class="caTrackDayCount">'+list.length+' DAY'+(list.length===1?'':'S')+'</span></div><div class="caStudentDayGrid">';

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

async function load(){
  const root=host();
  if(!root)return;
  root.innerHTML='<div class="caLoading"><div class="assessmentSpinner"></div><strong>Loading assessments…</strong><span>Checking the published assessment windows.</span></div>';
  try{
    const r=await call('getStudentCompetencyAssessments')({});
    renderList(r.data?.items||[]);
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
  root.querySelectorAll('input[name="caAnswer"]').forEach(x=>{
    const n=Number(x.value);
    x.checked=Array.isArray(a)?a.includes(n):a===n;
  });
}

function renderAssessment(){
  const root=host();
  const q=current?.questions?.[index];
  const total=current?.questions?.length||0;
  if(!root||!current)return;
  if(!q){ submit(); return; }

  const limit=Math.max(20,Number(q.timeLimitSeconds||60));
  if(!questionDeadlines[q.id])questionDeadlines[q.id]=Date.now()+limit*1000;

  const progress=Math.round(((index+1)/total)*100);
  const typeLabel=q.activityType?String(q.activityType).replace(/-/g,' ').toUpperCase():(q.type==='multipleCorrect'?'MULTIPLE CORRECT':q.type==='scenario'?'SCENARIO':'MCQ');
  const isMulti=q.type==='multipleCorrect';

  const listening=q.activityType==='listening';
  const options=(q.options||[]).map((o,i)=>
    '<label class="studentOption '+(listening?'audioAssessmentOption':'')+'"><input type="'+(isMulti?'checkbox':'radio')+'" name="caAnswer" value="'+i+'"><span class="studentOptionLetter">'+String.fromCharCode(65+i)+'</span><span class="studentOptionText">'+(listening?'<span class="srOnlyOption">'+esc(o)+'</span>Audio Option '+String.fromCharCode(65+i):esc(o))+'</span></label>'
  ).join('');

  root.innerHTML=
    '<div class="caLiveShell">'+
      '<div class="caLiveHeader">'+
        '<div><span class="sectionEyebrow">'+esc(current.trackId)+' · MODULE '+current.day+'</span><h3>'+esc(current.title)+'</h3><p>Question '+String(index+1).padStart(2,'0')+' of '+String(total).padStart(2,'0')+'</p></div>'+
        '<button class="caExitButton" id="caExit">← Assessment List</button>'+
      '</div>'+
      '<article class="studentQuestionCard caLiveCard">'+
        '<div class="studentQuestionTop"><span>QUESTION '+String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'</span><span>'+typeLabel+' · '+esc(q.difficulty||'standard')+'</span></div>'+
        '<div class="studentProgress"><span style="width:'+progress+'%"></span></div>'+
        '<div class="studentTimingBar">'+
          '<div><small>QUESTION TIME</small><strong id="caQuestionTimer">--:--</strong></div>'+
          '<div><small>TOTAL TIME</small><strong id="caTotalTimer">--:--</strong></div>'+
          '<div><small>TIME ALLOTTED</small><strong>'+formatClock(limit)+'</strong></div>'+
        '</div>'+
        (q.code?'<pre class="assessmentCodeBlock"><code>'+esc(q.code)+'</code></pre>':'')+
        (listening?'<div class="studentPrompt audioAssessmentPrompt"><button id="playAssessmentAudio">🔊 Play Question</button><span>Listen to the question and options.</span></div>':'<div class="studentPrompt">'+esc(q.prompt||'')+'</div>')+
        (listening?'<div class="audioAssessmentStage" id="audioAssessmentStage">Press Play to hear the options one at a time.</div>':'')+
        '<div class="caInstruction">'+(isMulti?'Select all correct answers.':'Select the one best answer.')+'</div>'+
        '<div class="studentAnswerArea"><div class="studentOptionList">'+options+'</div></div>'+
        '<div class="caLiveNav"><button class="secondary" id="caPrev" '+(index===0?'disabled':'')+'>← Previous</button><span>'+String(index+1)+' / '+String(total)+'</span><button id="caNext">'+(index===total-1?'Submit Assessment':'Next Question →')+'</button></div>'+
      '</article>'+
    '</div>';

  restoreAnswer(q,root);
  if(listening){
    const play=root.querySelector('#playAssessmentAudio');
    if(play)play.onclick=()=>{speak(q.audioText||q.prompt||'');const stage=root.querySelector('#audioAssessmentStage');setTimeout(()=>playOptionSequence(q.options||[],stage),1000);};
  }

  root.querySelectorAll('input[name="caAnswer"]').forEach(x=>x.addEventListener('change',()=>saveAnswer(q,root)));
  root.querySelector('#caPrev').onclick=()=>{
    saveAnswer(q,root);
    if(index>0){index--;renderAssessment();}
  };
  root.querySelector('#caNext').onclick=()=>{
    saveAnswer(q,root);
    const a=answers[q.id];
    if(a===undefined||(Array.isArray(a)&&!a.length)){
      const note=root.querySelector('.caInstruction');
      note.textContent='Please select an answer before continuing.';
      note.classList.add('caInstructionError');
      return;
    }
    if(index===total-1)submit();
    else{index++;renderAssessment();}
  };
  root.querySelector('#caExit').onclick=()=>{
    if(confirm('Leave the assessment and return to the assessment list? Your current attempt will remain open.'))load();
  };

  clearInterval(timer);
  const closeAt=new Date(current.closeAt).getTime();
  const tick=()=>{
    const qLeft=Math.max(0,questionDeadlines[q.id]-Date.now());
    const totalLeft=Math.max(0,closeAt-Date.now());
    const qTimer=root.querySelector('#caQuestionTimer');
    const totalTimer=root.querySelector('#caTotalTimer');
    if(qTimer)qTimer.textContent=formatClock(qLeft);
    if(totalTimer)totalTimer.textContent=formatClock(totalLeft);
    if(qLeft<=0){
      clearInterval(timer);
      saveAnswer(q,root);
      if(index<total-1){index++;renderAssessment();}
      else submit();
      return;
    }
    if(totalLeft<=0){
      clearInterval(timer);
      submit(true);
    }
  };
  tick();
  timer=setInterval(tick,250);
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
