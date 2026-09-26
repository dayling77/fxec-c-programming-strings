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
 loadFacultyContent(root.querySelector('#facultyContentArea'));
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
