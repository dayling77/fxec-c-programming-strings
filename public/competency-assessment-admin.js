import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
const functions=getFunctions(undefined,'us-central1');
const call=name=>httpsCallable(functions,name);
const TRACKS=[['communication','Communication'],['aptitude','Aptitude'],['core-engineering','Core Engineering'],['c-programming','C Programming'],['problem-solving','Problem Solving'],['analytical','Analytical Skills']];
let programs=[],selectedTrack='communication',selectedDay=1;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function host(){return document.getElementById('competencyAssessmentAdmin');}
function task(track,day){return programs.find(x=>x.trackId===track&&Number(x.day)===day);}
function render(){
 const root=host();if(!root)return;const t=task(selectedTrack,selectedDay);
 let h='<div class="competencyAdminToolbar"><label>Competency <select id="caTrack">';
 h+=TRACKS.map(x=>'<option value="'+x[0]+'" '+(x[0]===selectedTrack?'selected':'')+'>'+x[1]+'</option>').join('');
 h+='</select></label><button id="caAuto" class="primaryButton">✨ Auto-Generate & Audit 125 Questions</button><button id="caCreate" class="secondary">Create Blank 5-Day Programme</button><button id="caRefresh" class="secondary">Refresh</button></div>';
 h+='<div class="caDayTabs">'+[1,2,3,4,5].map(d=>'<button class="'+(d===selectedDay?'active':'')+'" data-day="'+d+'">Day '+d+'</button>').join('')+'</div>';
 h+=t?renderEditor(t):'<div class="caEmpty">Create the five-day programme for this competency first.</div><div id="caStatus"></div>';
 root.innerHTML=h;
 root.querySelector('#caTrack').onchange=e=>{selectedTrack=e.target.value;selectedDay=1;render();};
 root.querySelector('#caAuto').onclick=async()=>{if(!confirm('Generate 125 high-standard questions for this competency (25 per day), then run two independent answer/ambiguity audits? The result will remain DRAFT for faculty review.'))return;try{setStatus('Generating 5 days × 25 questions and running two audits per day. This may take several minutes…','saving');const r=await call('autoGenerateCompetencyAssessmentProgram')({trackId:selectedTrack});await load();setStatus('✓ '+r.data.message,'success');}catch(e){setStatus(e.message||String(e));}};
 root.querySelector('#caCreate').onclick=async()=>{if(!confirm('Create/reset the five-day programme?'))return;try{await call('createCompetencyAssessmentProgram')({trackId:selectedTrack});await load();setStatus('Five-day programme created with editable starter questions.','success');}catch(e){setStatus(e.message);}};
 root.querySelector('#caRefresh').onclick=load;
 root.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selectedDay=Number(b.dataset.day);render();});
 if(t)wireEditor();
}
function renderEditor(t){
 const open=t.openAt&&t.openAt.seconds?new Date(t.openAt.seconds*1000).toISOString().slice(0,16):String(t.openAt||'').slice(0,16);
 const close=t.closeAt&&t.closeAt.seconds?new Date(t.closeAt.seconds*1000).toISOString().slice(0,16):String(t.closeAt||'').slice(0,16);
 let h='<div class="caEditor"><div class="caEditorHead"><div><span class="sectionEyebrow">DAY '+t.day+' · '+esc(t.trackTitle)+'</span><h3>'+esc(t.title)+'</h3><p>Status: <b>'+esc(t.status||'draft')+'</b> · '+Number(t.questionCount||0)+' questions</p></div><span class="practiceBadge">'+(t.isPublished?'PUBLISHED':'DRAFT')+'</span></div>';
 h+='<div class="caMetaGrid"><label>Title<input id="caTitle" value="'+esc(t.title)+'"></label><label>Topic<input id="caTopic" value="'+esc(t.topic)+'"></label><label>Date<input id="caDate" type="date" value="'+esc(t.date||'')+'"></label><label>Open<input id="caOpen" type="datetime-local" value="'+esc(open)+'"></label><label>Close<input id="caClose" type="datetime-local" value="'+esc(close)+'"></label></div>';
 h+='<div class="caQuestionHead"><h4>Question Review & Assignment</h4><span>AI-generated questions are structurally validated and independently audited twice. Faculty/admin must still review before publishing.</span></div><div id="caQuestions">'+(t.questions||[]).map((q,i)=>renderQuestion(q,i)).join('')+'</div>';
 h+='<div class="caActions"><button id="caSave">Save Draft</button><button id="caApprove" class="primaryButton" '+(t.isPublished?'disabled':'')+'>'+(t.isPublished?'✓ Published':'Approve & Launch Day '+t.day)+'</button></div><div id="caStatus"></div></div>';
 return h;
}
function renderQuestion(q,i){
 let h='<article class="caQuestion"><div class="caQuestionNo">Q'+String(i+1).padStart(2,'0')+'</div><div class="caQuestionFields">';
 h+='<label>Question<textarea class="caPrompt">'+esc(q.prompt)+'</textarea></label><div class="caOptions">';
 h+=(q.options||[]).map((o,j)=>'<label>Option '+String.fromCharCode(65+j)+'<input class="caOpt" value="'+esc(o)+'"></label>').join('');
 h+='</div><div class="caQuestionMeta"><label>Type<select class="caType"><option value="mcq" '+(q.type==='mcq'?'selected':'')+'>MCQ</option><option value="multipleCorrect" '+(q.type==='multipleCorrect'?'selected':'')+'>Multiple Correct</option><option value="scenario" '+(q.type==='scenario'?'selected':'')+'>Scenario MCQ</option></select></label><label>Correct index(es)<input class="caAnswer" value="'+esc(Array.isArray(q.answer)?q.answer.join(','):q.answer)+'"></label><label>Time (sec)<input class="caTime" type="number" min="10" value="'+Number(q.timeLimitSeconds||60)+'"></label></div>';
 h+='<label>Explanation<textarea class="caExplanation">'+esc(q.explanation||'')+'</textarea></label></div></article>';return h;
}
function readQuestions(){
 return Array.from(host().querySelectorAll('.caQuestion')).map((card,i)=>{
  const type=card.querySelector('.caType').value,raw=card.querySelector('.caAnswer').value.trim();
  const answer=type==='multipleCorrect'?raw.split(',').map(Number).filter(Number.isInteger):Number(raw);
  return {id:(task(selectedTrack,selectedDay)?.questions?.[i]?.id)||selectedTrack+'-D'+selectedDay+'-Q'+(i+1),type,difficulty:i<2?'easy':i<4?'moderate':'tough',topic:host().querySelector('#caTopic').value.trim(),prompt:card.querySelector('.caPrompt').value.trim(),options:Array.from(card.querySelectorAll('.caOpt')).map(x=>x.value.trim()),answer,explanation:card.querySelector('.caExplanation').value.trim(),timeLimitSeconds:Number(card.querySelector('.caTime').value||60),reviewed:true};
 });
}
function wireEditor(){host().querySelector('#caSave').onclick=()=>save(false);host().querySelector('#caApprove').onclick=()=>save(true);}
async function save(approve){
 const questions=readQuestions(),payload={trackId:selectedTrack,day:selectedDay,title:host().querySelector('#caTitle').value.trim(),topic:host().querySelector('#caTopic').value.trim(),date:host().querySelector('#caDate').value,openAt:new Date(host().querySelector('#caOpen').value).toISOString(),closeAt:new Date(host().querySelector('#caClose').value).toISOString(),questions};
 try{setStatus('Saving draft…','saving');await call('saveCompetencyAssessmentDay')(payload);if(approve){if(!confirm('Approve this day? It will be visible to approved students during the published window.'))return;await call('approveCompetencyAssessmentDay')({trackId:selectedTrack,day:selectedDay});}await load();setStatus(approve?'✓ Approved and launched for the scheduled window.':'✓ Draft saved.','success');}catch(e){setStatus(e.message||String(e));}
}
function setStatus(message,kind='error'){const el=host()?.querySelector('#caStatus');if(el){el.textContent=message;el.className='scheduleSaveStatus '+kind;}}
async function load(){try{const r=await call('getAdminCompetencyAssessmentPrograms')({});programs=r.data?.items||[];render();}catch(e){const h=host();if(h)h.innerHTML='<p>Competency assessment administration is unavailable: '+esc(e.message)+'</p>';}}
window.FXECCompetencyAssessmentAdmin={load};
