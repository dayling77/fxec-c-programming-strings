import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
const f=getFunctions(undefined,'us-central1'), callF=n=>httpsCallable(f,n);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function load(){
 const r=await callF('getCompetencyContent')({}); const el=document.getElementById('facultyContentList'); if(!el)return;
 el.innerHTML=(r.data?.items||[]).map(x=>'<div class="facultyAdminRow"><b>'+esc(x.trackTitle||x.trackId)+'</b><span>'+esc(x.title)+'</span><a href="'+esc(x.videoUrl||'#')+'" target="_blank">'+esc(x.videoUrl||'No video')+'</a></div>').join('')||'<p>No faculty resources published.</p>';
}
window.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('facultyContentForm'); if(!form)return;
 form.addEventListener('submit',async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;b.textContent='Publishing…';try{await callF('publishCompetencyContent')({trackId:form.trackId.value,title:form.title.value,description:form.description.value,videoUrl:form.videoUrl.value});form.reset();document.getElementById('facultyContentStatus').textContent='✓ Resource published.';await load();}catch(err){document.getElementById('facultyContentStatus').textContent=err.message||String(err);}finally{b.disabled=false;b.textContent='Publish Resource';}});
 load().catch(()=>{});
});
