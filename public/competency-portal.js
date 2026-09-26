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
 const track=TRACKS.find(t=>t.id===trackId)||{id:trackId,title:trackId,skills:[]};
 area.innerHTML='<div class="trackDetailLoading"><div class="assessmentSpinner"></div><strong>Loading '+esc2(track.title)+'…</strong><span>Preparing your competency dashboard.</span></div>';
 try{
  const r=await cpCall('getStudentCompetencyAssessments')({});
  const all=r.data?.items||[];
  const assessments=all.filter(x=>x.trackId===trackId);
  const progressCall=await cpCall('getCompetencyProgress')({});
  const p=progressCall.data?.tracks?.[trackId]||{};
  const progress=Math.max(0,Math.min(100,Number(p.progress||0)));

  area.innerHTML=
   '<div class="trackDetailHeader">'+
    '<div><span class="sectionEyebrow">FIRST-YEAR ENGINEERING · COMPETENCY TRACK</span><h3>'+esc2(track.title)+'</h3><p>Build the core skills, practise deliberately, and demonstrate your competency through the five-day assessment programme.</p></div>'+
    '<div class="trackDetailScore"><strong>'+progress+'%</strong><span>TRACK PROGRESS</span></div>'+
   '</div>'+
   '<div class="trackProgressLarge"><span style="width:'+progress+'%"></span></div>'+
   '<div class="trackSkillGrid">'+track.skills.map((s,i)=>'<div class="trackSkillCard"><span>0'+(i+1)+'</span><strong>'+esc2(s)+'</strong><small>Competency area</small></div>').join('')+'</div>'+
   '<div class="trackAssessmentSection">'+
    '<div class="sectionHeading"><div><span class="sectionEyebrow">ASSESSMENT PROGRAMME</span><h4>Five-Day Competency Assessment</h4><p>Each day contains a secure question pool. Your recommended questions are selected server-side.</p></div><span class="practiceBadge">15 QUESTIONS / DAY</span></div>'+
    '<div class="trackAssessmentDays">'+(
      assessments.length
      ? assessments.map(x=>{
        const open=x.status==='open',scheduled=x.status==='scheduled';
        const when=open?'OPEN NOW':scheduled?'Opens '+new Date(x.openAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Closed';
        return '<article class="trackAssessmentDay '+(open?'open':'')+'"><div class="trackAssessmentDayTop"><span>DAY '+x.day+'</span><b class="'+(open?'open':'')+'">'+(open?'OPEN':scheduled?'SCHEDULED':'CLOSED')+'</b></div><h5>'+esc2(x.title)+'</h5><p>'+esc2(x.topic||'Competency assessment')+'</p><small>'+Number(x.questionCount||15)+' recommended questions · '+esc2(when)+'</small><button class="trackAssessmentStart" data-task="'+esc2(x.id)+'" '+(open?'':'disabled')+'>'+(open?'Start Assessment →':scheduled?'Not Open Yet':'Closed')+'</button></article>';
      }).join('')
      : '<div class="trackNoAssessment"><strong>Assessment programme is being prepared.</strong><span>The Administrator will publish the five-day assessment after reviewing the question pool.</span></div>'
    )+'</div>'+
    '<div class="trackDetailActions"><button id="openCompetencyAssessments">Open Assessment Centre</button><button id="backToTracks" class="secondary">← Back to Competency Tracks</button></div>'+
   '</div>';

  area.querySelectorAll('.trackAssessmentStart').forEach(btn=>btn.addEventListener('click',async()=>{
    const panel=document.getElementById('competencyAssessmentPanel');
    const launch=document.getElementById('competencyAssessmentLaunch');
    if(panel&&launch){
      document.querySelectorAll('.studentHiddenPanel').forEach(x=>x.hidden=true);
      panel.hidden=false;
      if(window.FXECCompetencyAssessmentStudent?.load) await window.FXECCompetencyAssessmentStudent.load();
      launch.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(()=>launch.querySelector('[data-task="'+CSS.escape(btn.dataset.task)+'"]')?.click(),100);
    }
  }));
  area.querySelector('#openCompetencyAssessments')?.addEventListener('click',()=>{
    const panel=document.getElementById('competencyAssessmentPanel');
    document.querySelectorAll('.studentHiddenPanel').forEach(x=>x.hidden=true);
    if(panel){panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'});}
    window.FXECCompetencyAssessmentStudent?.load?.();
  });
  area.querySelector('#backToTracks')?.addEventListener('click',()=>{
    area.innerHTML='<div class="sectionHeading"><div><span class="sectionEyebrow">COMPETENCY DASHBOARD</span><h3>Choose a competency track</h3></div></div><p>Select a track above to view its learning areas and five-day assessment programme.</p>';
    root.querySelector('.trackGrid')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
 }catch(e){
  area.innerHTML='<div class="trackDetailError"><span class="sectionEyebrow">COMPETENCY TRACK</span><h3>Unable to load '+esc2(track.title)+'</h3><p>'+esc2(e.message||'Please try again.')+'</p><button id="retryTrack">Try Again</button></div>';
  area.querySelector('#retryTrack')?.addEventListener('click',()=>loadJourney(root,trackId));
 }
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
