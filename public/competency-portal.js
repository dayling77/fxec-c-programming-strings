import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
const fxecApp = getApps().length ? getApp() : initializeApp(window.FXEC_FIREBASE_CONFIG);
const cpFunctions=getFunctions(fxecApp,'us-central1');
const cpCall=name=>httpsCallable(cpFunctions,name);

const TRACKS=[
 {id:'communication',title:'Communication',icon:'💬',skills:['Grammar & Usage','Vocabulary','Professional Communication','Presentation','Group Discussion'],xp:100},
 {id:'aptitude',title:'Aptitude',icon:'🧮',skills:['Quantitative Aptitude','Logical Reasoning','Data Interpretation','Verbal Reasoning'],xp:100},
 {id:'core-engineering',title:'Core Engineering',icon:'⚙️',skills:['Engineering Fundamentals','Measurements','Materials','Circuits','Digital Prototyping'],xp:100},
 {id:'c-programming',title:'C Programming',icon:'💻',skills:['Fundamentals','Strings','Arrays','Functions','Pointers','Algorithms','Coding Challenges'],xp:100},
 {id:'problem-solving',title:'Problem Solving',icon:'🧩',skills:['Decomposition','Pattern Recognition','Algorithms','Debugging','Decision Making'],xp:100},
 {id:'analytical',title:'Reading & Listening / Analytical Skills',icon:'🎧',skills:['Reading Comprehension','Listening','Inference','Critical Analysis','Evidence Based Reasoning'],xp:100}
];

const ACTIVITY_TYPES=[
 ['mcq','MCQ'],['multiple-correct','Multiple Correct'],['match','Match'],['code-observation','Code Observation'],
 ['output-prediction','Output Prediction'],['bug-identification','Bug Identification'],['missing-code','Missing Code'],
 ['coding-challenge','Coding Challenge'],['diagram-interpretation','Diagram Interpretation'],['scenario-analysis','Scenario Analysis'],
 ['listening','Listening'],['engineering-decision','Engineering Decision']
];
const MODULE_STAGES=['Concept','Example','Faculty Video','Practice','Knowledge Check','Challenge','Assessment'];
function esc2(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function renderCompetencyPortal(root){
 root.innerHTML='<div class="card competencyMasterCard">'+
 '<div class="sectionHeading"><div><span class="sectionEyebrow">FIRST-YEAR ENGINEERING COMPETENCY PORTAL</span><h2>One Journey · Six Competency Tracks</h2></div><span class="practiceBadge">Integrated Learning Engine</span></div>'+
 '<p>Every track follows the same learning cycle: <b>Learn → Watch/Observe → Practice → Knowledge Check → Challenge → Assessment → XP/Badge</b>. Evaluation and XP are handled server-side.</p>'+
 '<div class="competencyFlow">'+MODULE_STAGES.map((x,i)=>'<span>'+esc2(x)+'</span>'+(i<MODULE_STAGES.length-1?'<i>→</i>':'')).join('')+'</div>'+
 '<div id="trackGrid" class="trackGrid">'+TRACKS.map(t=>'<article class="trackCard" data-track="'+esc2(t.id)+'"><div class="trackIcon">'+t.icon+'</div><div><h3>'+esc2(t.title)+'</h3><p>'+t.skills.map(esc2).join(' · ')+'</p><div class="trackProgress"><span data-progress="'+esc2(t.id)+'" style="width:0%"></span></div><small data-progress-label="'+esc2(t.id)+'">Loading progress…</small></div></article>').join('')+'</div>'+
 '<div id="journeyArea" class="card innerCard"><h3>Competency Journey</h3><p>Select a track to begin. C Programming is currently the first fully interactive track; the same engine will be populated for the remaining tracks.</p></div>'+
 '<div class="card innerCard"><h3>Assessment Studio — Activity Types</h3><div class="activityTypeGrid">'+ACTIVITY_TYPES.map(x=>'<span class="activityType">'+esc2(x[1])+'</span>').join('')+'</div></div>'+
 '<div class="card innerCard"><h3>Student Journey</h3><div class="journeyMilestones">'+['Foundation','Skill Builder','Applied Practice','Challenge','Assessment','Mastery Badge'].map((x,i)=>'<div class="journeyNode"><b>'+(i+1)+'</b><span>'+x+'</span></div>').join('')+'</div></div>'+
 '<div id="facultyContentArea"></div></div>';
 const cards=root.querySelectorAll('.trackCard');
 cards.forEach(card=>card.addEventListener('click',()=>loadJourney(root,card.dataset.track)));
 loadProgress(root);
 loadFacultyContent(root.querySelector('#facultyContentArea'));
}

async function loadProgress(root){
 try{
  const r=await cpCall('getCompetencyProgress')({});
  const data=r.data||{}, tracks=data.tracks||{};
  TRACKS.forEach(t=>{
   const p=Number(tracks[t.id]?.progress||0);
   const fill=root.querySelector('[data-progress="'+t.id+'"]');
   const label=root.querySelector('[data-progress-label="'+t.id+'"]');
   if(fill)fill.style.width=Math.max(0,Math.min(100,p))+'%';
   if(label)label.textContent=p+'% progress · '+Number(tracks[t.id]?.xp||0)+' XP';
  });
 }catch(e){
  root.querySelectorAll('[data-progress-label]').forEach(x=>x.textContent='Progress unavailable');
 }
}

async function loadJourney(root,trackId){
 const area=root.querySelector('#journeyArea');
 area.innerHTML='<h3>Loading '+esc2(TRACKS.find(t=>t.id===trackId)?.title||trackId)+'…</h3><p>Please wait.</p>';
 try{
  const r=await cpCall('getCompetencyJourney')({trackId});
  const d=r.data||{};
  if(!d.activities?.length){
   area.innerHTML='<h3>'+esc2(d.trackTitle||trackId)+'</h3><p>This track is part of the common competency framework, but its interactive activity content has not yet been published. No placeholder score or XP is awarded.</p>';
   return;
  }
  area.innerHTML='<div class="sectionHeading"><div><span class="sectionEyebrow">'+esc2(d.trackTitle||trackId)+'</span><h3>Sequential Learning Journey</h3></div><span class="practiceBadge">'+Number(d.xp||0)+' XP</span></div>'+
   '<p>Activities unlock in sequence. The correct answers remain server-side.</p><div id="activityList">'+d.activities.map(a=>renderActivityRow(a)).join('')+'</div>';
  area.querySelectorAll('.journeyStart').forEach(btn=>btn.addEventListener('click',()=>openActivity(root,trackId,btn.dataset.activity)));
 }catch(e){
  area.innerHTML='<h3>Journey unavailable</h3><p>Unable to load this track right now.</p>';
 }
}
function renderActivityRow(a){
 return '<article class="activityEngineItem '+(a.completed?'completed':'')+'"><div><span class="sectionEyebrow">STEP '+a.sequence+' · '+esc2(a.stage)+'</span><h4>'+esc2(a.title)+'</h4><p>'+esc2(a.prompt)+'</p></div>'+
 (a.completed?'<span class="practiceBadge">✓ Completed</span>':'<button type="button" class="journeyStart" data-activity="'+esc2(a.id)+'">Start</button>')+'</article>';
}
async function openActivity(root,trackId,activityId){
 const area=root.querySelector('#journeyArea');
 try{
  const r=await cpCall('getCompetencyJourney')({trackId});
  const a=(r.data?.activities||[]).find(x=>x.id===activityId);
  if(!a)return;
  const options=Array.isArray(a.options)?a.options.map((o,i)=>'<label class="competencyOption"><input type="radio" name="fxecCompetencyAnswer" value="'+i+'"> '+esc2(o)+'</label>').join(''):'';
  area.innerHTML='<div class="sectionHeading"><div><span class="sectionEyebrow">'+esc2(a.stage)+'</span><h3>'+esc2(a.title)+'</h3></div><span class="practiceBadge">'+Number(a.sequence)+' / '+Number(r.data?.activities?.length||0)+'</span></div>'+
   '<p>'+esc2(a.prompt)+'</p><div class="competencyOptions">'+options+'</div><button id="submitJourneyAnswer" type="button">Submit Answer</button><div id="journeyFeedback"></div>';
  area.querySelector('#submitJourneyAnswer').addEventListener('click',async()=>{
   const selected=area.querySelector('input[name="fxecCompetencyAnswer"]:checked');
   if(!selected){area.querySelector('#journeyFeedback').textContent='Select an answer first.';return;}
   const button=area.querySelector('#submitJourneyAnswer');button.disabled=true;button.textContent='Evaluating…';
   try{
    const result=await cpCall('evaluateCompetencyActivity')({trackId,activityId,answer:Number(selected.value)});
    area.querySelector('#journeyFeedback').textContent=result.data?.correct?'Correct — +'+Number(result.data?.earned||0)+' XP.':'Not correct yet. Review the concept and try again.';
    await loadProgress(root);
    setTimeout(()=>loadJourney(root,trackId),500);
   }catch(e){
    button.disabled=false;button.textContent='Submit Answer';
    area.querySelector('#journeyFeedback').textContent=e.message||'Evaluation failed. Please try again.';
   }
  });
 }catch(e){area.innerHTML='<p>Unable to open this activity.</p>';}
}

async function loadFacultyContent(target){
 try{
  const r=await cpCall('getCompetencyContent')({});
  const items=r.data?.items||[];
  target.innerHTML='<div class="card innerCard"><div class="sectionHeading"><div><span class="sectionEyebrow">FACULTY CONTENT</span><h3>Learning Resources & Videos</h3></div></div>'+
   '<div class="facultyResourceGrid">'+(items.length?items.map(x=>'<article class="facultyResource"><span>'+esc2(x.trackTitle||x.trackId)+'</span><h4>'+esc2(x.title)+'</h4><p>'+esc2(x.description||'')+'</p>'+(x.videoUrl?'<a href="'+esc2(x.videoUrl)+'" target="_blank" rel="noopener">▶ Watch Faculty Video</a>':'<em>Faculty video pending</em>')+'</article>').join(''):'<p>Faculty resources will appear here as they are published.</p>')+'</div></div>';
 }catch(e){target.innerHTML='<div class="card innerCard"><h3>Faculty Content</h3><p>Resources are temporarily unavailable.</p></div>';}
}
export {renderCompetencyPortal,TRACKS,ACTIVITY_TYPES};
window.FXECCompetencyPortal={renderCompetencyPortal,TRACKS,ACTIVITY_TYPES};
