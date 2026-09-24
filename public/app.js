import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js';

const config = window.FXEC_FIREBASE_CONFIG;
const app = initializeApp(config);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');
const storage = getStorage(app);

const $ = id => document.getElementById(id);
const call = name => httpsCallable(functions, name);

let currentUser = null;
let currentAttempt = null;
let timer = null;
const SAMPLE_QUESTIONS = [
{q:'What marks the end of a C string?',o:['A newline','The null character \\0','A space','EOF'],a:1},
{q:'What is the visible length of "Jack"?',o:['3','4','5','6'],a:1},
{q:'Which function returns string length?',o:['strcpy()','strlen()','strcmp()','strcat()'],a:1},
{q:'Which function copies one string into another?',o:['strcpy()','strlen()','strcmp()','fgets()'],a:0},
{q:'What does strcmp() return when two strings are equal?',o:['1','-1','0','The string length'],a:2},
{q:'Which technique is taught for reversing a string?',o:['Binary search','Two pointers','Recursion only','Sorting'],a:1},
{q:'What does a frequency array store?',o:['Character counts','String length','Number of words','Only vowels'],a:0},
{q:'Which pair are anagrams?',o:['listen and silent','hello and world','cat and car','level and civic'],a:0},
{q:'Which is a palindrome?',o:['apple','madam','coding','string'],a:1},
{q:'Which is a subsequence of abcde?',o:['ace','azc','aedx','cbe'],a:0}
];
function renderSample(targetId,resultId,buttonId){const target=$(targetId);if(!target||!$(buttonId))return;target.innerHTML=SAMPLE_QUESTIONS.map((x,i)=>'<article class="sampleQ"><b>Q'+(i+1)+'. '+esc(x.q)+'</b>'+x.o.map((o,k)=>'<label class="option"><input type="radio" name="'+targetId+'-'+i+'" value="'+k+'"> '+esc(o)+'</label>').join('')+'</article>').join('');$(buttonId).onclick=()=>{let score=0;SAMPLE_QUESTIONS.forEach((x,i)=>{const v=document.querySelector('input[name="'+targetId+'-'+i+'"]:checked');if(v&&Number(v.value)===x.a)score++;});$(resultId).innerHTML='<strong>Recap Score: '+score+'/10 ('+(score*10)+'%)</strong><br>Practice only — no Reward Points.';};}
const COURSE_DAYS = [
  {
    day:1,title:'String Basics',subtitle:'Understand how strings work in C',
    topics:['What is a string and character array','Null character \\0 and string size','Declaring and initializing strings','Printing with %s','Reading words with scanf() and complete lines with fgets()','Indexing and modifying characters'],
    practice:'Print characters, find length manually, count vowels/digits, and modify a student name.',
    video:'https://www.youtube.com/embed/l7zI3nswO1g',videoTitle:'Programiz – C Strings'
  },
  {
    day:2,title:'String Library Functions',subtitle:'Use the standard functions in <string.h>',
    topics:['string.h header file','strlen() – string length','strcpy() – copy a string','strcat() – join strings','strcmp() – compare strings','Safe destination capacity including \\0'],
    practice:'Build a student name program using strcpy(), strcat() and strlen().',
    video:'https://www.youtube.com/embed/XdnmsKUvGsc',videoTitle:'Programiz – C String Functions'
  },
  {
    day:3,title:'Manual String Processing',subtitle:'Understand the algorithms behind string functions',
    topics:['Manual string length','Manual string copy','Manual string comparison','Reverse using the two-pointer technique','Remove spaces','Convert lowercase characters to uppercase'],
    practice:'Read a sentence, remove spaces, convert to uppercase and reverse it.'
  },
  {
    day:4,title:'Character Frequency & String Analysis',subtitle:'Analyse the information inside a string',
    topics:['Character frequency','Most frequent and first non-repeating character','Vowels and consonants','Uppercase/lowercase classification','Digits, spaces and special characters','Word counting and longest word'],
    practice:'Build a String Analyzer that reports characters, words, vowels, consonants, digits, spaces, special characters and frequency.'
  },
  {
    day:5,title:'Advanced String Problem Solving',subtitle:'Recognise patterns and solve unfamiliar string problems',
    topics:['Palindrome and two-pointer checking','Case-insensitive and space-ignoring palindrome','Anagram using frequency arrays','String rotation','Duplicate removal','String compression','Subsequence','Longest substring without repeating characters'],
    practice:'Complete the advanced String Analyzer and test normal and edge cases.'
  }
];

function renderPublicSchedule(schedules){
  const byDay = new Map((schedules||[]).map(s=>[Number(s.day),s]));
  const rows = COURSE_DAYS.map(day=>{
    const s=byDay.get(day.day)||{};
    const published=s.isPublished===true;
    const date=s.date||'Date & time to be announced by Admin';
    const video=s.videoUrl||day.video;
    return `<article class="courseDay">
      <div class="courseDayTop"><span class="dayBadge">DAY ${day.day}</span><span class="dayStatus">${published?'Published':'Learning material available'}</span></div>
      <h3>${esc(day.title)}</h3><p class="daySubtitle">${esc(day.subtitle)}</p>
      <div class="topicGrid">${day.topics.map(x=>'<span>✓ '+esc(x)+'</span>').join('')}</div>
      <div class="practiceLine"><strong>Practice:</strong> ${esc(day.practice)}</div>
      <div class="scheduleLine"><strong>Assessment:</strong> ${esc(date)}${published?'':' · Main assessment date/time will be set by Admin'}</div>
      ${video?'<a class="videoLink" href="'+esc(video)+'" target="_blank" rel="noopener">▶ Watch Day '+day.day+' Video</a>':''}
    </article>`;
  }).join('');
  $('publicSchedule').innerHTML=`<div class="courseStats"><div><strong>5</strong><span>Learning Days</span></div><div><strong>1</strong><span>Main Assessment</span></div><div><strong>10</strong><span>Recap Questions</span></div><div><strong>40</strong><span>Reward Points</span></div></div><div class="courseDayList">${rows}</div>`;
}

function renderStudentLearning(schedules){
  const byDay=new Map((schedules||[]).map(s=>[Number(s.day),s]));
  $('studentCourseDashboard').innerHTML = `
    <div class="learningIntro"><strong>Learn → Watch → Practice → Think → Code → Test</strong><p>Select a day to open its learning content.</p></div>
    <div class="dayButtonGrid">${COURSE_DAYS.map(day => '<button class="dayMenuButton" data-day-panel="dayContent'+day.day+'">DAY '+day.day+' · '+esc(day.title)+'</button>').join('')}</div>
    <div class="dayContentStack">${COURSE_DAYS.map(day=>{
      const s=byDay.get(day.day)||{}; const video=s.videoUrl||day.video;
      return '<div id="dayContent'+day.day+'" class="dayContentPanel" hidden><div class="dayContentHeader"><span class="dayBadge">DAY '+day.day+'</span><h3>'+esc(day.title)+'</h3><p>'+esc(day.subtitle)+'</p></div><h4>Learning Topics</h4><ul>'+day.topics.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div class="practiceLine"><strong>Practice:</strong> '+esc(day.practice)+'</div>'+(video?'<a class="videoLink" href="'+esc(video)+'" target="_blank" rel="noopener">▶ Watch Day '+day.day+' Video</a>':'')+'</div>';
    }).join('')}</div>`;
  document.querySelectorAll('.dayMenuButton').forEach(b=>b.onclick=()=>{document.querySelectorAll('.dayContentPanel').forEach(p=>p.hidden=true); const p=$(b.dataset.dayPanel); if(p){p.hidden=false;p.scrollIntoView({behavior:'smooth',block:'nearest'});}});
}
document.querySelectorAll('.menuButton').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.studentHiddenPanel').forEach(p=>p.hidden=true);
  const panel=$(b.dataset.panel);
  if(panel){panel.hidden=false; panel.scrollIntoView({behavior:'smooth',block:'start'});}
});

async function loadCourseOverview(){
  try{
    const r=await call('getCourseOverview')({});
    renderPublicSchedule(r.data.schedules||[]);
  }catch(e){
    renderPublicSchedule([]);
  }
  renderSample('sampleQuestions','sampleResult','sampleSubmit');
}


function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
}
function show(id, yes = true) { $(id).hidden = !yes; }
function msg(text, good = false) {
  $('message').textContent = text;
  $('message').className = good ? 'message good' : 'message';
  $('message').style.display = text ? 'block' : 'none';
}
function setTab(name) {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x.dataset.tab === name));
  document.querySelectorAll('.panel').forEach(x => x.hidden = x.id !== name);
}
document.querySelectorAll('.tab').forEach(x => x.onclick = () => setTab(x.dataset.tab));

async function registerStudentForm(form, nameId, noId, emailId, e) {
  e.preventDefault();
  const submit = form.querySelector('button');
  if (submit) { submit.disabled = true; submit.textContent = 'Submitting…'; }
  try {
    await call('registerStudent')({
      name: $(nameId).value.trim(),
      registerNumber: $(noId).value.trim(),
      email: $(emailId).value.trim()
    });
    form.hidden = true;
    $('studentRegistrationPanel').hidden = true;
    $('registrationStatus').hidden = false;
    $('registrationStatus').className = 'statusBanner pendingStatus';
    $('registrationStatus').innerHTML = '<strong>Registration submitted ✓</strong><span>Your details are with the Administrator for approval. You do not need to submit again.</span>';
    msg('Registration submitted. Please wait for Administrator approval.', true);
    await loadStudent();
  } catch (e) {
    if (submit) { submit.disabled = false; submit.textContent = 'Submit Registration'; }
    msg(e.message);
  }
}
$('studentRegisterForm').onsubmit = e => registerStudentForm($('studentRegisterForm'),'studentRegName','studentRegNo','studentRegEmail',e);

$('signupForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await createUserWithEmailAndPassword(auth, $('signupEmail').value, $('signupPassword').value);
    msg('Account created. Please complete your one-time registration after signing in.', true);
  } catch (e) { msg(e.message); }
};

$('forgotPasswordBtn').onclick = async () => {
  const email = $('loginEmail').value.trim();
  if (!email) return msg('Enter your registered college email first.');
  try {
    await sendPasswordResetEmail(auth, email);
    msg('Password reset email sent. Please check your inbox.', true);
  } catch (e) { msg(e.message); }
};

$('loginForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, $('loginEmail').value, $('loginPassword').value);
  } catch (e) { msg(e.message); }
};

$('logoutBtn').onclick = () => signOut(auth);
$('adminBootstrap').onclick = async () => {
  try {
    const r = await call('bootstrapAdmin')({});
    msg(r.data.message || 'Admin claim set. Sign out and sign in again.', true);
  } catch (e) { msg(e.message); }
};

async function loadStudent() {
  show('authArea', false); show('student', true); show('admin', false); show('publicShell', false);
  $('studentRegistrationPanel').hidden = true;
  renderSample('studentSampleQuestions','studentSampleResult','studentSampleSubmit');
  try {
    const profile = (await call('getStudentProfile')({})).data;
    if (profile.registered) {
      $('studentRegistrationPanel').hidden = true;
      $('registrationStatus').hidden = false;
      if (profile.status === 'approved') {
        $('registrationStatus').className='statusBanner approvedStatus';
        $('registrationStatus').innerHTML='<strong>Registration approved ✓</strong><span>You can study and take the main assessment during a published window.</span>';
      } else {
        $('registrationStatus').className='statusBanner pendingStatus';
        $('registrationStatus').innerHTML='<strong>Approval pending</strong><span>Your registration has been submitted. You can continue studying while you wait.</span>';
      }
    } else {
      $('studentRegistrationPanel').hidden = false;
      $('registrationStatus').hidden = false;
      $('registrationStatus').className='statusBanner pendingStatus';
      $('registrationStatus').innerHTML='<strong>One-time registration required</strong><span>Complete your student registration below. It will disappear permanently after submission.</span>';
      $('studentRegName').value=''; $('studentRegNo').value=''; $('studentRegEmail').value=currentUser?.email||'';
    }
  } catch(e) { msg(e.message); }
  try {
    const profile=(await call('getStudentProfile')({})).data;
    if(profile.latestResult){
      $('myScore').innerHTML='<div class="result"><strong>Latest Score: '+profile.latestResult.scorePercent+'%</strong><br>'+ (profile.latestResult.passed?'PASS · '+profile.latestResult.rewardPoints+' Reward Points credited.':'FAIL · Passing mark is 80%.') + '<br><small>Assessment: '+esc(profile.latestResult.assessmentDate)+'</small></div>';
    } else {
      $('myScore').innerHTML='<p>No completed assessment result is available yet.</p>';
    }
  } catch(e) {}
  try { const overview=await call('getCourseOverview')({}); renderStudentLearning(overview.data.schedules||[]); } catch(e){ renderStudentLearning([]); }
  try {
    const r=await call('getAssessment')({}), d=r.data;
    $('studentStatus').innerHTML = d.status==='open' ? '<div class="openState"><strong>Day '+d.schedule.day+' · '+esc(d.schedule.topic)+'</strong><span>Assessment is open until '+new Date(d.schedule.closeAt).toLocaleString('en-IN')+'</span></div>' : d.status==='scheduled' ? '<div class="scheduledState"><strong>Next assessment · Day '+d.schedule.day+'</strong><span>'+esc(d.schedule.topic)+' · Opens '+new Date(d.schedule.openAt).toLocaleString('en-IN')+'</span></div>' : '<div class="closedState">'+esc(d.message||'No assessment is currently scheduled.')+'</div>';
    $('startBtn').disabled=d.status!=='open'||!d.ready;
  } catch(e) { $('studentStatus').textContent=e.message; }
  loadStats();
  $('myScore').innerHTML='<p>Open <strong>Check My Score</strong> to review your latest completed assessment.</p>';
}
$('startBtn').onclick = async () => {
  try { const r=await call('startAttempt')({}); currentAttempt=r.data; assessmentAnswers={}; assessmentIndex=0; renderAssessment(currentAttempt); }
  catch(e){ msg(e.message); }
};

let assessmentIndex=0;
let assessmentAnswers={};

function renderAssessment(data) {
  show('assessmentPanel');
  $('assessmentPanel').scrollIntoView({behavior:'smooth'});
  $('assessmentTitle').textContent='Day Assessment – '+data.assessmentDate;
  const q=data.questions[assessmentIndex];
  let body='';
  if(q.type==='match'){
    body=(q.leftItems||[]).map(item=>'<label class="matchrow">'+esc(item)+' <select data-match-item="'+esc(item)+'"><option value="">Choose</option>'+((q.rightItems||q.options||[]).map(o=>'<option value="'+esc(o)+'">'+esc(o)+'</option>').join(''))+'</select></label>').join('');
  } else if(q.type==='multiAnswer'){
    body=(q.options||[]).map((o,k)=>'<label class="option"><input type="checkbox" data-multi="'+k+'"> '+esc(o)+'</label>').join('');
  } else {
    if(q.type==='audio') body='<button class="audioBtn" id="playCurrentAudio" data-audio="'+esc(q.audioPath||'')+'">▶ Play Question</button>';
    body+=(q.options||[]).map((o,k)=>'<label class="option"><input type="radio" name="currentQ" value="'+k+'"> '+esc(o)+'</label>').join('');
  }
  $('questions').innerHTML='<article class="question"><div class="qhead"><span>Question '+(assessmentIndex+1)+' of '+data.questions.length+'</span><span>'+esc(q.type)+' · '+esc(q.difficulty)+'</span></div><h3>'+((q.type==='audio')?'Listen to the question and choose the correct answer.':esc(q.prompt))+'</h3>'+body+'</article>';
  restoreCurrentAnswer(q);
  document.querySelectorAll('#questions input[type=radio]').forEach(x=>x.onchange=()=>{assessmentAnswers[q.id]=Number(x.value);});
  document.querySelectorAll('#questions input[type=checkbox]').forEach(x=>x.onchange=()=>{assessmentAnswers[q.id]=[...document.querySelectorAll('#questions input[type=checkbox]:checked')].map(y=>Number(y.dataset.multi));});
  document.querySelectorAll('#questions select').forEach(x=>x.onchange=()=>{const a={...(assessmentAnswers[q.id]||{})};a[x.dataset.matchItem]=x.value;assessmentAnswers[q.id]=a;});
  const audio=$('playCurrentAudio');
  if(audio) audio.onclick=async()=>{try{const url=await getDownloadURL(ref(storage,audio.dataset.audio));new Audio(url).play();}catch(e){msg('Audio could not be loaded. Please try again.');}};
  $('questionCounter').textContent=(assessmentIndex+1)+' / '+data.questions.length;
  $('prevBtn').disabled=assessmentIndex===0;
  $('nextBtn').hidden=assessmentIndex===data.questions.length-1;
  $('submitBtn').hidden=assessmentIndex!==data.questions.length-1;
  const end=new Date(data.closeAt).getTime();
  clearInterval(timer);
  timer=setInterval(()=>{const left=Math.max(0,end-Date.now());const mins=Math.floor(left/60000),secs=Math.floor(left/1000)%60;$('timer').textContent='Time remaining: '+mins+':'+String(secs).padStart(2,'0');if(!left){clearInterval(timer);submitAttempt(true);}},1000);
}
function restoreCurrentAnswer(q){
  const a=assessmentAnswers[q.id];
  if(a===undefined)return;
  if(q.type==='match'){document.querySelectorAll('#questions select').forEach(s=>{s.value=a[s.dataset.matchItem]||'';});}
  else if(q.type==='multiAnswer'){document.querySelectorAll('#questions input[data-multi]').forEach(x=>x.checked=a.includes(Number(x.dataset.multi)));}
  else {const r=document.querySelector('#questions input[type=radio][value="'+a+'"]');if(r)r.checked=true;}
}

async function submitAttempt(auto=false){
  if(!currentAttempt)return;
  const answers=currentAttempt.questions.map(q=>({questionId:q.id,answer:assessmentAnswers[q.id] ?? (q.type==='match'?{}:q.type==='multiAnswer'?[]:-1)}));
  $('submitBtn').disabled=true;
  try{
    const r=await call('finalizeAttempt')({attemptId:currentAttempt.attemptId,answers});
    clearInterval(timer);
    $('result').innerHTML='<div class="result"><strong>Score: '+r.data.scorePercent+'%</strong><br>'+ (r.data.passed?'Congratulations! 40 Reward Points have been credited.':'The passing mark is 80%. No Reward Points are credited for this attempt.')+'</div>';
    show('result'); $('submitBtn').disabled=true;
    $('myScore').innerHTML='<div class="result"><strong>Latest Score: '+r.data.scorePercent+'%</strong><br>'+ (r.data.passed?'PASS · 40 Reward Points credited.':'FAIL · Passing mark is 80%.')+'</div>';
  }catch(e){$('submitBtn').disabled=false;msg(e.message);}
}
$('prevBtn').onclick=()=>{if(assessmentIndex>0){assessmentIndex--;renderAssessment(currentAttempt);}};
$('nextBtn').onclick=()=>{if(assessmentIndex<currentAttempt.questions.length-1){assessmentIndex++;renderAssessment(currentAttempt);}};
$('submitBtn').onclick=()=>submitAttempt(false);

async function loadStats() {
  try {
    const r = await call('getPublicStats')({});
    const d = r.data || {};
    $('stats').innerHTML = `<strong>${d.totalAttempts || 0}</strong> students have completed assessments · <strong>${d.totalPassed || 0}</strong> passed`;
    $('leaderboard').innerHTML = (d.leaderboard || []).map(x => `<tr><td>${x.rank}</td><td>${esc(x.name)}</td><td>${esc(x.registerNumber)}</td><td>${x.scorePercent}%</td></tr>`).join('') || '<tr><td colspan="4">No results yet.</td></tr>';
  } catch {}
}

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function renderSchedules(schedules) {
  const rows = (schedules || []).sort((a,b) => Number(a.day)-Number(b.day)).map((s, i) => `
    <div class="scheduleRow">
      <input class="schDay" type="number" min="1" value="${esc(s.day || i+1)}" placeholder="Day">
      <input class="schTopic" value="${esc(s.topic || '')}" placeholder="Topic">
      <input class="schDate" type="date" value="${esc(s.date || '')}">
      <input class="schOpen" type="datetime-local" value="${s.openAt ? toLocalInput(s.openAt) : ''}">
      <input class="schClose" type="datetime-local" value="${s.closeAt ? toLocalInput(s.closeAt) : ''}">
      <input class="schVideo" value="${esc(s.videoUrl || '')}" placeholder="Video URL">
      <label><input class="schPublished" type="checkbox" ${s.isPublished === true ? 'checked' : ''}> Published</label>
    </div>`).join('');
  $('scheduleEditor').innerHTML = `
    <div class="scheduleHead"><b>Day</b><b>Topic</b><b>Date</b><b>Open</b><b>Close</b><b>Video URL</b><b>Admin Publish</b></div>
    ${rows || '<p>No schedules found.</p>'}`;
}
async function loadAdmin() {
  try {
    const r = await call('getAdminDashboard')({});
    const d = r.data;
    $('adminStats').innerHTML = `Students: <b>${d.students}</b> · Attempts: <b>${d.attempts}</b> · Passed: <b>${d.passed}</b> · Average: <b>${d.average}%</b>`;
    $('adminStudentsStat').textContent = d.students;
    $('adminAttemptsStat').textContent = d.attempts;
    $('adminPassedStat').textContent = d.passed;
    $('adminAverageStat').textContent = d.average + '%';
    $('pending').innerHTML = d.pending.map(s => `
      <div class="pending">
        <label><input type="checkbox" class="pendingCheck" value="${esc(s.id)}"> <b>${esc(s.name)}</b> · ${esc(s.registerNumber)} · ${esc(s.email)}</label>
        <button data-approve="${esc(s.id)}">Approve</button>
      </div>`).join('') || '<p>No pending students.</p>';
    document.querySelectorAll('[data-approve]').forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await call('authorizeStudent')({studentId:b.dataset.approve}); await loadAdmin(); msg('Student approved. The student can now wait for the assessment window.',true); }
      catch(e){ b.disabled=false; msg(e.message); }
    });
    $('approvedStudents').innerHTML = d.approved.map(s => `
      <div class="pending">
        <span><b>${esc(s.name)}</b> · ${esc(s.registerNumber)} · ${esc(s.email)}</span>
        <span>Approved</span>
      </div>`).join('') || '<p>No approved students yet.</p>';
    renderSchedules(d.schedules);
    $('pendingSection').hidden=false;
    $('approvedSection').hidden=true;
    $('adminResults').innerHTML = d.top20.map(x => `<tr><td>${esc(x.studentId)}</td><td>${x.scorePercent}%</td><td>${x.passed ? 'PASS':'FAIL'}</td><td>${x.rewardPoints}</td></tr>`).join('') || '<tr><td colspan="4">No results yet.</td></tr>';
  } catch (e) {
    $('adminStats').textContent = e.message;
  }
}
$('selectAllBtn').onclick = () => {
  const boxes = [...document.querySelectorAll('.pendingCheck')];
  const shouldCheck = boxes.some(x => !x.checked);
  boxes.forEach(x => x.checked = shouldCheck);
};
$('bulkApproveBtn').onclick = async () => {
  const studentIds = [...document.querySelectorAll('.pendingCheck:checked')].map(x => x.value);
  if (!studentIds.length) return msg('Select at least one student to approve.');
  try {
    const r = await call('authorizeStudentsBulk')({studentIds});
    await loadAdmin();
    msg(`${r.data.approved} student(s) approved. Approval emails are sent automatically when ZeptoMail is available.`, true);
  } catch(e) { msg(e.message); }
};
$('saveSchedulesBtn').onclick = async () => {
  const button = $('saveSchedulesBtn');
  const status = $('scheduleSaveStatus');
  button.disabled = true;
  button.textContent = 'Saving…';
  if (status) { status.className = 'scheduleSaveStatus saving'; status.textContent = 'Saving the five-day schedule to Firebase…'; }
  try {
    const rows = [...document.querySelectorAll('.scheduleRow')];
    const schedules = rows.map((row, idx) => {
      const day = Number(row.querySelector('.schDay').value);
      const topic = row.querySelector('.schTopic').value.trim();
      const date = row.querySelector('.schDate').value;
      const openValue = row.querySelector('.schOpen').value;
      const closeValue = row.querySelector('.schClose').value;
      if (!Number.isInteger(day) || day < 1) throw new Error('Day '+(idx+1)+': enter a valid day number.');
      if (!topic) throw new Error('Day '+day+': enter the topic.');
      if (!date) throw new Error('Day '+day+': select the assessment date.');
      if (!openValue || !closeValue) throw new Error('Day '+day+': select both opening and closing times.');
      const openAt = new Date(openValue), closeAt = new Date(closeValue);
      if (Number.isNaN(openAt.getTime()) || Number.isNaN(closeAt.getTime())) throw new Error('Day '+day+': invalid date/time.');
      if (closeAt <= openAt) throw new Error('Day '+day+': closing time must be after opening time.');
      return {day,topic,date,openAt:openAt.toISOString(),closeAt:closeAt.toISOString(),videoUrl:row.querySelector('.schVideo')?.value.trim()||'',isPublished:row.querySelector('.schPublished').checked};
    });
    const seen = new Set();
    for (const s of schedules) {
      if (seen.has(s.date)) throw new Error('Two assessment days cannot use the same date.');
      seen.add(s.date);
    }
    const result = await call('updateAssessmentSchedules')({schedules});
    await loadAdmin();
    if (status) { status.className = 'scheduleSaveStatus success'; status.textContent = '✓ Saved successfully: '+result.data.count+' assessment days. Student access and question generation will follow these dates and times.'; }
    msg('Assessment schedule saved successfully.', true);
  } catch(e) {
    console.error('Schedule save failed:', e);
    if (status) { status.className = 'scheduleSaveStatus error'; status.textContent = '✕ Schedule was NOT saved: '+(e?.message || e); }
    msg('Schedule was NOT saved: '+(e?.message || e));
  } finally {
    button.disabled = false;
    button.textContent = 'Save Assessment Schedule';
  }
};
$('csvBtn').onclick = async () => {
  try { const r=await call('exportResults')({format:'csv'}); const url=await getDownloadURL(ref(storage,r.data.path)); $('downloadInfo').innerHTML=`<a href="${url}" target="_blank">Download CSV</a>`; } catch(e){msg(e.message);}
};
$('pdfBtn').onclick = async () => {
  try { const r=await call('exportResults')({format:'pdf'}); const url=await getDownloadURL(ref(storage,r.data.path)); $('downloadInfo').innerHTML=`<a href="${url}" target="_blank">Download PDF</a>`; } catch(e){msg(e.message);}
};

loadCourseOverview();
$('showPendingBtn').onclick=()=>{$('pendingSection').hidden=false;$('approvedSection').hidden=true;};
$('showApprovedBtn').onclick=()=>{$('pendingSection').hidden=true;$('approvedSection').hidden=false;};

onAuthStateChanged(auth, async user => {
  currentUser = user;
  show('publicShell', !user);
  show('authArea', !user);
  show('appArea', !!user);
  if (!user) return;
  $('userEmail').textContent = user.email;
  const token = await user.getIdTokenResult(true);
  const isConfiguredAdminEmail = user.email?.toLowerCase() === 'admin@fxecdigital.org';
  if (isConfiguredAdminEmail && token.claims.admin === true) { msg('', true); $('message').style.display = 'none'; } else { $('message').style.display = ''; }
  show('admin', token.claims.admin === true || isConfiguredAdminEmail);
  show('adminBootstrap', isConfiguredAdminEmail && token.claims.admin !== true);
  if (token.claims.admin === true) { setTab('admin'); loadAdmin(); }
  else if (isConfiguredAdminEmail) { setTab('admin'); }
  else { setTab('student'); loadStudent(); }
});
