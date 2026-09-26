import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
const cpFunctions=getFunctions(undefined,'us-central1');
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
 '<p>Every track follows the same learning cycle: <b>Learn → Watch/Observe → Practice → Knowledge Check → Challenge → Assessment → XP/Badge</b>.</p>'+
 '<div class="competencyFlow">'+MODULE_STAGES.map((x,i)=>'<span>'+esc2(x)+'</span>'+(i<MODULE_STAGES.length-1?'<i>→</i>':'')).join('')+'</div>'+
 '<div class="trackGrid">'+TRACKS.map(t=>'<article class="trackCard" data-track="'+t.id+'"><div class="trackIcon">'+t.icon+'</div><div><h3>'+esc2(t.title)+'</h3><p>'+t.skills.map(esc2).join(' · ')+'</p><div class="trackProgress"><span style="width:0%"></span></div><small>0% started · '+t.xp+' XP framework</small></div></article>').join('')+'</div>'+
 '<div class="card innerCard"><h3>Assessment Studio — All Required Activity Types</h3><div class="activityTypeGrid">'+ACTIVITY_TYPES.map(x=>'<span class="activityType">'+esc2(x[1])+'</span>').join('')+'</div></div>'+
 '<div class="card innerCard"><h3>Student Journey</h3><div class="journeyMilestones">'+['Foundation','Skill Builder','Applied Practice','Challenge','Assessment','Mastery Badge'].map((x,i)=>'<div class="journeyNode"><b>'+(i+1)+'</b><span>'+x+'</span></div>').join('')+'</div></div>'+
 '<div id="facultyContentArea"></div></div>';
 loadFacultyContent(root.querySelector('#facultyContentArea'));\n root.querySelectorAll('.trackCard').forEach(card=>card.addEventListener('click',()=>loadCompetencyJourney(root,card.dataset.track)));
}
async function loadFacultyContent(target){
 try{
  const r=await cpCall('getCompetencyContent')({});
  const items=r.data?.items||[];
  target.innerHTML='<div class="card innerCard"><div class="sectionHeading"><div><span class="sectionEyebrow">FACULTY CONTENT</span><h3>Learning Resources & Videos</h3></div></div>'+
   '<div class="facultyResourceGrid">'+(items.length?items.map(x=>'<article class="facultyResource"><span>'+esc2(x.trackTitle||x.trackId)+'</span><h4>'+esc2(x.title)+'</h4><p>'+esc2(x.description||'')+'</p>'+(x.videoUrl?'<a href="'+esc2(x.videoUrl)+'" target="_blank" rel="noopener">▶ Watch Faculty Video</a>':'<em>Faculty video pending</em>')+'</article>').join(''):'<p>Faculty resources will appear here as they are published.</p>')+'</div></div>';
 }catch(e){target.innerHTML='<div class="card innerCard"><h3>Faculty Content</h3><p>Resources are temporarily unavailable.</p></div>';}
}
window.FXECCompetencyPortal={renderCompetencyPortal,TRACKS,ACTIVITY_TYPES};

async function loadCompetencyJourney(root,trackId){
 const area=root.querySelector('#facultyContentArea');
 area.innerHTML='<div class="card innerCard"><p>Loading competency journey…</p></div>';
 try{
  const r=await cpCall('getCompetencyJourney')({trackId});
  const d=r.data||{};
  area.innerHTML='<div class="card innerCard"><div class="sectionHeading"><div><span class="sectionEyebrow">'+esc2(d.trackTitle||trackId)+'</span><h3>Learning Journey</h3></div><span class="practiceBadge">'+esc2(String(d.xp||0))+' XP</span></div>'+
   '<p>Activities unlock sequentially. Evaluation and XP are performed on the server.</p>'+
   '<div class="competencyActivityList">'+(d.activities||[]).map(a=>'<article class="competencyActivity '+(a.completed?'completed':'')+'"><div><small>Stage '+a.sequence+' · '+esc2(a.stage)+'</small><h4>'+esc2(a.title)+'</h4><p>'+esc2(a.prompt)+'</p></div>'+(a.completed?'<span class="practiceBadge">✓ Completed</span>':'<button class="competencyStart" data-activity="'+esc2(a.id)+'">Start</button>')+'</article>').join('')+'</div></div>';
  area.querySelectorAll('.competencyStart').forEach(btn=>btn.addEventListener('click',()=>startCompetencyActivity(root,trackId,btn.dataset.activity)));
 }catch(e){area.innerHTML='<div class="card innerCard"><h3>Journey unavailable</h3><p>Please try again.</p></div>';}
}
async function startCompetencyActivity(root,trackId,activityId){
 const area=root.querySelector('#facultyContentArea');
 try{
  const r=await cpCall('getCompetencyJourney')({trackId});
  const activity=(r.data?.activities||[]).find(x=>x.id===activityId);
  if(!activity)return;
  const options=(activity.options||[]).map((x,i)=>'<label><input type="radio" name="competencyAnswer" value="'+i+'"> '+esc2(x)+'</label>').join('');
  area.innerHTML='<div class="card innerCard"><span class="sectionEyebrow">'+esc2(activity.stage)+'</span><h3>'+esc2(activity.title)+'</h3><p>'+esc2(activity.prompt)+'</p><div class="competencyOptions">'+options+'</div><button id="submitCompetencyAnswer" class="primaryButton">Submit Answer</button><div id="competencyFeedback"></div></div>';
  area.querySelector('#submitCompetencyAnswer').addEventListener('click',async()=>{
   const selected=area.querySelector('input[name="competencyAnswer"]:checked');
   if(!selected){area.querySelector('#competencyFeedback').textContent='Select an answer first.';return;}
   const button=area.querySelector('#submitCompetencyAnswer');button.disabled=true;
   try{
    const result=await cpCall('evaluateCompetencyActivity')({trackId,activityId,answer:Number(selected.value)});
    area.querySelector('#competencyFeedback').innerHTML=result.data?.correct?'<p>✓ Correct. +'+esc2(result.data.earned||0)+' XP</p>':'<p>Not yet. Review the concept and try again.</p>';
    setTimeout(()=>loadCompetencyJourney(root,trackId),700);
   }catch(e){area.querySelector('#competencyFeedback').textContent='Unable to evaluate this activity. Please try again.';button.disabled=false;}
  });
 }catch(e){area.innerHTML='<div class="card innerCard"><p>Unable to load this activity.</p></div>';}
}
