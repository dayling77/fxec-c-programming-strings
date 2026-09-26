import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
const functions=getFunctions(undefined,'us-central1');const call=name=>httpsCallable(functions,name);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let current=null,answers={};
function host(){return document.getElementById('competencyAssessmentLaunch');}
function renderList(items){
 const root=host();if(!root)return;
 if(!items.length){root.innerHTML='<div class="caStudentEmpty">No competency assessments are currently published. Your Administrator will publish each assessment after reviewing its questions.</div>';return;}
 const groups={};items.forEach(x=>(groups[x.trackId]??=[]).push(x));
 let h='<div class="caStudentIntro"><span class="sectionEyebrow">ASSESSMENT LAUNCH CENTRE</span><h3>Published Competency Assessments</h3><p>Only Administrator-approved assessments appear here. Each assessment is scored on the server.</p></div>';
 Object.entries(groups).forEach(([track,list])=>{
  h+='<section class="caStudentTrack"><h4>'+esc(list[0].trackTitle)+'</h4><div class="caStudentDayGrid">';
  list.forEach(x=>{const open=x.status==='open';h+='<article class="caStudentDay"><span>DAY '+x.day+'</span><h5>'+esc(x.title)+'</h5><p>'+esc(x.topic)+'</p><small>'+x.questionCount+' questions · '+(open?'OPEN NOW':'Opens '+new Date(x.openAt).toLocaleString('en-IN'))+'</small><button data-task="'+esc(x.id)+'" '+(open?'':'disabled')+'>'+ (open?'Start Assessment':'Not Open') +'</button></article>';});
  h+='</div></section>';
 });
 root.innerHTML=h;root.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>start(b.dataset.task));
}
async function load(){
 const root=host();if(!root)return;root.innerHTML='<p>Loading published assessments…</p>';
 try{const r=await call('getStudentCompetencyAssessments')({});renderList(r.data?.items||[]);}catch(e){root.innerHTML='<p>'+esc(e.message||String(e))+'</p>';}
}
async function start(taskId){
 const root=host();try{root.innerHTML='<p>Preparing assessment securely…</p>';const r=await call('startCompetencyAssessment')({taskId});current=r.data;answers={};renderAssessment();}catch(e){root.innerHTML='<p>'+esc(e.message||String(e))+'</p>';}}
function renderAssessment(){
 const root=host(),q=current.questions[current.index||0],index=current.index||0,total=current.questions.length;
 if(!q){return submit();}
 let h='<div class="caLiveHeader"><span class="sectionEyebrow">'+esc(current.trackId)+' · DAY '+current.day+'</span><h3>'+esc(current.title)+'</h3><p>Question '+(index+1)+' of '+total+'</p></div><article class="caLiveQuestion"><h4>'+esc(q.prompt)+'</h4><div class="caLiveOptions">';
 (q.options||[]).forEach((o,i)=>{const checked=Array.isArray(answers[q.id])?answers[q.id].includes(i):Number(answers[q.id])===i;h+='<label><input type="'+(q.type==='multiple-correct'?'checkbox':'radio')+'" name="caAnswer" value="'+i+'" '+(checked?'checked':'')+'>'+String.fromCharCode(65+i)+'. '+esc(o)+'</label>';});
 h+='</div><div class="caLiveActions">'+(index?'':'')+'<button id="caNext">'+(index===total-1?'Submit Assessment':'Next Question')+'</button></div></article>';
 root.innerHTML=h;
 root.querySelectorAll('input[name="caAnswer"]').forEach(x=>x.onchange=()=>{if(q.type==='multiple-correct')answers[q.id]=Array.from(root.querySelectorAll('input[name="caAnswer"]:checked')).map(y=>Number(y.value));else answers[q.id]=Number(x.value);});
 root.querySelector('#caNext').onclick=()=>{if(answers[q.id]===undefined||(Array.isArray(answers[q.id])&&!answers[q.id].length)){alert('Please select an answer.');return;}if(index===total-1)submit();else{current.index=index+1;renderAssessment();}};
}
async function submit(){
 const root=host();try{const payload=Object.keys(answers).map(id=>({questionId:id,answer:answers[id]}));const r=await call('submitCompetencyAssessment')({attemptId:current.attemptId,answers:payload});const d=r.data;root.innerHTML='<div class="caResult"><span class="sectionEyebrow">ASSESSMENT COMPLETE</span><h3>'+esc(current.title)+'</h3><strong>'+Number(d.scorePercent)+'%</strong><p>'+Number(d.score)+' / '+Number(d.total)+' correct · '+(d.passed?'Passed':'Not passed')+' · +'+Number(d.xp)+' XP</p><button id="caBack">Back to Assessments</button></div>';root.querySelector('#caBack').onclick=load;}catch(e){root.innerHTML='<p>'+esc(e.message||String(e))+'</p>';}}
window.FXECCompetencyAssessmentStudent={load};
