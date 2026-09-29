import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';

const app=getApps().length?getApp():initializeApp(window.FXEC_FIREBASE_CONFIG);
const functions=getFunctions(app,'us-central1');
const assess=httpsCallable(functions,'assessCommunicationSpeech');

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function floatToWav(samples,sampleRate){
  const buffer=new ArrayBuffer(44+samples.length*2);
  const view=new DataView(buffer);
  const write=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
  write(0,'RIFF');view.setUint32(4,36+samples.length*2,true);write(8,'WAVE');
  write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);
  view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples.length*2,true);
  let p=44;
  for(const s of samples){const x=Math.max(-1,Math.min(1,s));view.setInt16(p,x<0?x*0x8000:x*0x7fff,true);p+=2;}
  return new Blob([view],{type:'audio/wav'});
}

async function blobTo16kWav(blob){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw new Error('Audio processing is not supported by this browser.');
  const ctx=new AC();
  try{
    const decoded=await ctx.decodeAudioData(await blob.arrayBuffer());
    const source=decoded.getChannelData(0);
    const ratio=16000/decoded.sampleRate;
    const length=Math.max(1,Math.round(source.length*ratio));
    const out=new Float32Array(length);
    for(let i=0;i<length;i++){
      const pos=i/ratio, a=Math.floor(pos), b=Math.min(source.length-1,a+1), f=pos-a;
      out[i]=source[a]*(1-f)+source[b]*f;
    }
    return floatToWav(out,16000);
  }finally{await ctx.close().catch(()=>{});}
}

async function blobToBase64(blob){
  const bytes=new Uint8Array(await blob.arrayBuffer());
  let binary='';
  const step=0x8000;
  for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));
  return btoa(binary);
}

export function renderCommunicationAudioLab(taskList,title='Communication Audio Practice'){
  const tasks=Array.isArray(taskList)&&taskList.length?taskList:[];
  if(!tasks.length)return '';
  const first=tasks[0];
  return '<div class="communicationAudioLab" data-comm-audio-lab>'+
    '<div class="communicationAudioHead"><div><span class="sectionEyebrow">COMMUNICATION LAB · AUTO-ASSESS</span><h4>'+esc(title)+'</h4><p>Record your response. Objective pronunciation and word-use tasks are checked automatically; spoken responses receive rubric-based feedback.</p></div><span class="practiceBadge">MIC + AI</span></div>'+
    '<div class="communicationAudioTaskGrid">'+tasks.map((t,i)=>'<button type="button" class="communicationAudioTask '+(i===0?'active':'')+'" data-task-index="'+i+'"><span>'+(t.type==='pronunciation'?'🗣️':t.type==='wordUsage'?'📚':'🎧')+'</span><strong>'+esc(t.label||t.type)+'</strong></button>').join('')+'</div>'+
    '<div class="communicationAudioPrompt"><span class="sectionEyebrow" id="commAudioType">'+esc(first.label||first.type)+'</span><strong id="commAudioTarget">'+esc(first.target)+'</strong><p id="commAudioInstruction">Read, speak or respond naturally. Use a clear voice and steady pace.</p></div>'+
    '<div class="communicationRecorder"><div class="recordIndicator" data-rec-indicator>● Ready</div><div class="communicationTimer" data-rec-timer>00:00</div><div class="communicationRecorderActions"><button type="button" data-rec-start>🎙️ Start Recording</button><button type="button" data-rec-stop disabled>⏹ Stop</button><button type="button" data-rec-play disabled>▶ Play</button><button type="button" data-rec-assess disabled>✓ Auto Assess</button></div><audio data-rec-audio controls hidden></audio></div>'+
    '<div class="communicationSpeechResult" data-rec-result aria-live="polite"></div>'+
    '<script type="application/json" data-comm-tasks>'+esc(JSON.stringify(tasks))+'</script>'+
  '</div>';
}

export function wireCommunicationAudioLab(root){
  root?.querySelectorAll?.('[data-comm-audio-lab]').forEach(lab=>{
    let tasks=[];
    try{tasks=JSON.parse(lab.querySelector('[data-comm-tasks]')?.textContent||'[]');}catch{}
    if(!tasks.length)return;
    let current=0,mediaRecorder=null,chunks=[],recorded=null,startedAt=0,timer=null;
    const typeEl=lab.querySelector('#commAudioType'),targetEl=lab.querySelector('#commAudioTarget'),instructionEl=lab.querySelector('#commAudioInstruction');
    const indicator=lab.querySelector('[data-rec-indicator]'),timerEl=lab.querySelector('[data-rec-timer]');
    const start=lab.querySelector('[data-rec-start]'),stop=lab.querySelector('[data-rec-stop]'),play=lab.querySelector('[data-rec-play]'),assessBtn=lab.querySelector('[data-rec-assess]'),audio=lab.querySelector('[data-rec-audio]'),result=lab.querySelector('[data-rec-result]');
    const format=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
    const render=()=>{
      const t=tasks[current];
      typeEl.textContent=t.label||t.type;
      targetEl.textContent=t.target||'';
      instructionEl.textContent=t.type==='pronunciation'?'Read the sentence aloud exactly as shown, with natural rhythm.':t.type==='wordUsage'?'Say a complete sentence that uses the target word naturally.':'Respond to the speaking task clearly, with a beginning, supporting idea and conclusion.';
      lab.querySelectorAll('.communicationAudioTask').forEach((b,i)=>b.classList.toggle('active',i===current));
      recorded=null;audio.hidden=true;play.disabled=true;assessBtn.disabled=true;result.innerHTML='';
    };
    lab.querySelectorAll('.communicationAudioTask').forEach(b=>b.onclick=()=>{if(mediaRecorder?.state==='recording')return;current=Number(b.dataset.taskIndex)||0;render();});
    start.onclick=async()=>{
      if(!navigator.mediaDevices?.getUserMedia){result.textContent='Microphone access is not supported in this browser.';return;}
      try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        const mime=['audio/webm;codecs=opus','audio/webm','audio/ogg'].find(x=>MediaRecorder.isTypeSupported(x))||'';
        mediaRecorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);chunks=[];startedAt=Date.now();
        mediaRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        mediaRecorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());recorded=new Blob(chunks,{type:mediaRecorder.mimeType||'audio/webm'});audio.src=URL.createObjectURL(recorded);audio.hidden=false;play.disabled=false;assessBtn.disabled=false;indicator.textContent='● Recording ready';};
        mediaRecorder.start();indicator.textContent='● Recording…';start.disabled=true;stop.disabled=false;play.disabled=true;assessBtn.disabled=true;
        timer=setInterval(()=>timerEl.textContent=format((Date.now()-startedAt)/1000),250);
      }catch(e){result.textContent=e.message||'Microphone permission was not granted.';}
    };
    stop.onclick=()=>{if(mediaRecorder?.state==='recording'){mediaRecorder.stop();clearInterval(timer);start.disabled=false;stop.disabled=true;}};
    play.onclick=()=>audio.play();
    assessBtn.onclick=async()=>{
      if(!recorded)return;
      assessBtn.disabled=true;result.innerHTML='<div class="speechAssessLoading">Converting recording and assessing your response…</div>';
      try{
        const wav=await blobTo16kWav(recorded),audioBase64=await blobToBase64(wav),t=tasks[current];
        const r=await assess({taskType:t.type,target:t.target,audioBase64,mimeType:'audio/wav'});
        const d=r.data||{};
        const metrics=[
          d.score!=null?'<strong>'+Number(d.score)+'/100</strong> overall':'',
          d.accuracyScore!=null?'<span>Accuracy '+Number(d.accuracyScore)+'</span>':'',
          d.fluencyScore!=null?'<span>Fluency '+Number(d.fluencyScore)+'</span>':'',
          d.completenessScore!=null?'<span>Completeness '+Number(d.completenessScore)+'</span>':'',
          d.prosodyScore!=null?'<span>Prosody '+Number(d.prosodyScore)+'</span>':'',
          d.xp?'<span>+'+Number(d.xp)+' XP</span>':''
        ].join('');
        result.innerHTML='<div class="speechScoreCard"><div class="speechScoreMetrics">'+metrics+'</div><p><b>Recognised speech:</b> '+esc(d.transcript||'(not recognised)')+'</p><p>'+esc(d.feedback||'Assessment complete.')+'</p></div>';
      }catch(e){result.innerHTML='<div class="speechAssessError">'+esc(e.message||String(e))+'</div>';}
      finally{assessBtn.disabled=false;}
    };
    render();
  });
}
