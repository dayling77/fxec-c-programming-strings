import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
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

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
}
function show(id, yes = true) { $(id).hidden = !yes; }
function msg(text, good = false) {
  $('message').textContent = text;
  $('message').className = good ? 'message good' : 'message';
}
function setTab(name) {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x.dataset.tab === name));
  document.querySelectorAll('.panel').forEach(x => x.hidden = x.id !== name);
}
document.querySelectorAll('.tab').forEach(x => x.onclick = () => setTab(x.dataset.tab));

async function registerStudentForm(form, nameId, noId, emailId, e) {
  e.preventDefault();
  try {
    await call('registerStudent')({
      name: $(nameId).value,
      registerNumber: $(noId).value,
      email: $(emailId).value
    });
    msg('Registration submitted. Your account is waiting for admin approval.', true);
  } catch (e) { msg(e.message); }
}
$('registerForm').onsubmit = e => registerStudentForm($('registerForm'),'regName','regNo','regEmail',e);
$('studentRegisterForm').onsubmit = e => registerStudentForm($('studentRegisterForm'),'studentRegName','studentRegNo','studentRegEmail',e);

$('signupForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await createUserWithEmailAndPassword(auth, $('signupEmail').value, $('signupPassword').value);
    msg('Account created. Complete your student registration.', true);
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
  try {
    const r = await call('getAssessment')({});
    const d = r.data;
    $('studentStatus').innerHTML = d.status === 'open'
      ? `<strong>Day ${d.schedule.day} – ${esc(d.schedule.topic)}</strong><br>Assessment is OPEN.`
      : d.status === 'scheduled'
        ? `<strong>Day ${d.schedule.day} – ${esc(d.schedule.topic)}</strong><br>Opens at ${new Date(d.schedule.openAt).toLocaleString('en-IN')}.`
        : esc(d.message || 'No active assessment.');
    $('startBtn').disabled = d.status !== 'open' || !d.ready;
  } catch (e) { $('studentStatus').textContent = e.message; }
  loadStats();
}

$('startBtn').onclick = async () => {
  try {
    const r = await call('startAttempt')({});
    currentAttempt = r.data;
    renderAssessment(currentAttempt);
  } catch (e) { msg(e.message); }
};

function renderAssessment(data) {
  show('assessmentPanel');
  $('assessmentPanel').scrollIntoView({behavior:'smooth'});
  $('assessmentTitle').textContent = `Day Assessment – ${data.assessmentDate}`;
  $('questions').innerHTML = data.questions.map((q, i) => {
    let body = '';
    if (q.type === 'match') {
      const left = Object.keys(q.answer || q.left || {});
      body = (q.leftItems || left).map((item, j) => `<label class="matchrow">${esc(item)} <select data-q="${esc(q.id)}" data-match="${esc(item)}"><option value="">Choose</option>${(q.rightItems || q.options || []).map((o,k)=>`<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>`).join('');
    } else if (q.type === 'multiAnswer') {
      body = q.options.map((o,k)=>`<label class="option"><input type="checkbox" data-q="${esc(q.id)}" data-multi="${k}"> ${esc(o)}</label>`).join('');
    } else {
      if (q.type === 'audio') body += `<button class="audioBtn" data-audio="${esc(q.audioPath || '')}" data-q="${esc(q.id)}">▶ Play Question</button>`;
      body += q.options.map((o,k)=>`<label class="option"><input type="radio" name="q-${esc(q.id)}" value="${k}"> ${esc(o)}</label>`).join('');
    }
    return `<article class="question"><div class="qhead"><span>Q${i+1}</span><span>${esc(q.type)} · ${esc(q.difficulty)}</span></div><h3>${q.type === 'audio' ? 'Listen to the question and choose the correct answer.' : esc(q.prompt)}</h3>${body}</article>`;
  }).join('');
  document.querySelectorAll('.audioBtn').forEach(b => b.onclick = async () => {
    const path = b.dataset.audio;
    if (!path) return;
    try {
      const url = await getDownloadURL(ref(storage, path));
      new Audio(url).play();
    } catch (e) { msg('Audio could not be loaded. Please try again.'); }
  });
  const end = new Date(data.closeAt).getTime();
  clearInterval(timer);
  timer = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    const mins = Math.floor(left/60000), secs = Math.floor(left/1000)%60;
    $('timer').textContent = `Time remaining: ${mins}:${String(secs).padStart(2,'0')}`;
    if (!left) { clearInterval(timer); submitAttempt(true); }
  }, 1000);
}

async function submitAttempt(auto = false) {
  if (!currentAttempt) return;
  const answers = currentAttempt.questions.map(q => {
    if (q.type === 'match') {
      const answer = {};
      document.querySelectorAll(`[data-q="${CSS.escape(q.id)}"][data-match]`).forEach(s => { if (s.value) answer[s.dataset.match] = s.value; });
      return {questionId:q.id, answer};
    }
    if (q.type === 'multiAnswer') {
      const answer = [...document.querySelectorAll(`input[data-q="${CSS.escape(q.id)}"][data-multi]:checked`)].map(x => Number(x.dataset.multi));
      return {questionId:q.id, answer};
    }
    const selected = document.querySelector(`input[name="q-${CSS.escape(q.id)}"]:checked`);
    return {questionId:q.id, answer:selected ? Number(selected.value) : -1};
  });
  $('submitBtn').disabled = true;
  try {
    const r = await call('finalizeAttempt')({attemptId:currentAttempt.attemptId, answers});
    clearInterval(timer);
    $('result').innerHTML = `<div class="result"><strong>Score: ${r.data.scorePercent}%</strong><br>${r.data.passed ? 'Congratulations! 40 Reward Points have been credited.' : 'The passing mark is 80%. No Reward Points are credited for this attempt.'}</div>`;
    show('result');
    $('submitBtn').disabled = true;
    if (!auto) window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
  } catch (e) {
    $('submitBtn').disabled = false;
    msg(e.message);
  }
}
$('submitBtn').onclick = () => submitAttempt(false);

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
      <label><input class="schPublished" type="checkbox" ${s.isPublished !== false ? 'checked' : ''}> Published</label>
    </div>`).join('');
  $('scheduleEditor').innerHTML = `
    <div class="scheduleHead"><b>Day</b><b>Topic</b><b>Date</b><b>Open</b><b>Close</b><b>Publish</b></div>
    ${rows || '<p>No schedules found.</p>'}`;
}
async function loadAdmin() {
  try {
    const r = await call('getAdminDashboard')({});
    const d = r.data;
    $('adminStats').innerHTML = `Students: <b>${d.students}</b> · Attempts: <b>${d.attempts}</b> · Passed: <b>${d.passed}</b> · Average: <b>${d.average}%</b>`;
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
  try {
    const schedules = [...document.querySelectorAll('.scheduleRow')].map(row => ({
      day: Number(row.querySelector('.schDay').value),
      topic: row.querySelector('.schTopic').value.trim(),
      date: row.querySelector('.schDate').value,
      openAt: new Date(row.querySelector('.schOpen').value).toISOString(),
      closeAt: new Date(row.querySelector('.schClose').value).toISOString(),
      isPublished: row.querySelector('.schPublished').checked
    }));
    const r = await call('updateAssessmentSchedules')({schedules});
    await loadAdmin();
    msg(`${r.data.count} assessment schedule(s) saved successfully.`, true);
  } catch(e) { msg(e.message); }
};
$('csvBtn').onclick = async () => {
  try { const r=await call('exportResults')({format:'csv'}); const url=await getDownloadURL(ref(storage,r.data.path)); $('downloadInfo').innerHTML=`<a href="${url}" target="_blank">Download CSV</a>`; } catch(e){msg(e.message);}
};
$('pdfBtn').onclick = async () => {
  try { const r=await call('exportResults')({format:'pdf'}); const url=await getDownloadURL(ref(storage,r.data.path)); $('downloadInfo').innerHTML=`<a href="${url}" target="_blank">Download PDF</a>`; } catch(e){msg(e.message);}
};

onAuthStateChanged(auth, async user => {
  currentUser = user;
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
