import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineJsonSecret, defineString } from 'firebase-functions/params';
import { logger, setGlobalOptions } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { GoogleGenAI } from '@google/genai';
import textToSpeech from '@google-cloud/text-to-speech';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { randomUUID } from 'node:crypto';
import { QUESTION_BANK, QUESTION_BANK_META } from './question-bank.js';

setGlobalOptions({ invoker: 'public' });
initializeApp();
const db = getFirestore();
const auth = getAuth();
const bucket = getStorage().bucket();
const tts = new textToSpeech.TextToSpeechClient();

const ZEPTOMAIL_CONFIG = defineJsonSecret('ZEPTOMAIL_CONFIG');
const COMPILER_API_URL = defineString('COMPILER_API_URL', {default: 'https://ce.judge0.com'});
const COMPILER_API_TOKEN = defineString('COMPILER_API_TOKEN', {default: ''});
const CALLABLE_CORS = ['https://fxec-c-strings.web.app','https://fxec-c-strings.firebaseapp.com','http://localhost:5000','http://127.0.0.1:5000'];

const CONFIG = Object.freeze({
  adminEmail: 'admin@fxecdigital.org',
  studentEmailDomain: '@francisxavier.ac.in',
  passPercent: 80,
  rewardPoints: 40,
  poolSize: 25,
  questionsPerStudent: 15,
  timezone: 'Asia/Kolkata',
  model: 'gemini-2.5-flash',
  voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-A' }
});

const BLUEPRINT = Object.freeze({
  mcq: 3,
  match: 3,
  audio: 5,
  problemSolving: 1,
  multiAnswer: 3
});

const QUESTION_TIME_LIMITS = Object.freeze({
  mcq: 45,
  match: 60,
  audio: 45,
  problemSolving: 90,
  multiAnswer: 60
});

function questionTimeLimitSeconds(q) {
  return QUESTION_TIME_LIMITS[q?.type] || 60;
}

const POOL_DISTRIBUTION = Object.freeze({
  mcq: 5,
  match: 5,
  audio: 8,
  problemSolving: 2,
  multiAnswer: 5
});

const FIVE_DAY_SCHEDULE = [
  { day: 1, date: '2026-09-24', topic: 'String Basics', openAt: '2026-09-24T20:00:00+05:30', closeAt: '2026-09-25T07:00:00+05:30' },
  { day: 2, date: '2026-09-25', topic: 'String Library Functions', openAt: '2026-09-25T20:00:00+05:30', closeAt: '2026-09-26T07:00:00+05:30' },
  { day: 3, date: '2026-09-26', topic: 'Manual String Processing', openAt: '2026-09-26T20:00:00+05:30', closeAt: '2026-09-27T07:00:00+05:30' },
  { day: 4, date: '2026-09-27', topic: 'Character Frequency and String Analysis', openAt: '2026-09-27T20:00:00+05:30', closeAt: '2026-09-28T07:00:00+05:30' },
  { day: 5, date: '2026-09-28', topic: 'Advanced String Problem Solving', openAt: '2026-09-28T20:00:00+05:30', closeAt: '2026-09-29T07:00:00+05:30' }
];

const SOURCE_MAP = `
DAY 1: C strings are character arrays; null character \\0 marks the end; declaration/initialization; %s; scanf for a word; fgets for a complete line; indexing and modifying characters; Jack example; full-name coding challenge.
DAY 2: string.h; strlen, strcpy, strcat, strcmp; strlen excludes \\0; strcpy copies source to destination; strcat appends; strcmp returns 0 for equal strings.
DAY 3: manual length/copy/compare; explicit \\0; two-pointer reversal; remove spaces; lowercase to uppercase; character replacement; vowel count without string functions; hello world -> DLROWOLLEH challenge.
DAY 4: character frequency; frequency[256]; most frequent; repeating/non-repeating; vowels/consonants; uppercase/lowercase; digits/special characters; word count; longest/shortest word; banana frequency; swiss -> w; complete string analyzer.
DAY 5: palindrome; two pointers; case-insensitive palindrome; ignore spaces; anagram/frequency arrays; rotations; duplicate removal; first non-repeating; compression AAABBCCCC -> A3B2C4; subsequence ace in abcde; longest word; longest substring without repeating; systematic problem-solving workflow; final string analyzer.
`;

function requireAuth(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');
  return request.auth;
}
function requireAdmin(request) {
  const a = requireAuth(request);
  const email = String(a.token.email || '').toLowerCase();
  if (a.token.admin !== true && email !== CONFIG.adminEmail.toLowerCase()) {
    throw new HttpsError('permission-denied', 'Admin authorization required.');
  }
  return a;
}
function cleanText(value, max = 2000) {
  return String(value ?? '').trim().slice(0, max);
}
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
function normalizeAnswer(value) {
  if (Array.isArray(value)) return [...value].map(String).sort();
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
  }
  return String(value ?? '');
}
function answersEqual(a, b) {
  return JSON.stringify(normalizeAnswer(a)) === JSON.stringify(normalizeAnswer(b));
}


function stripJson(text) {
  const t = String(text || '').trim();
  const fenced = t.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/i);
  return fenced ? fenced[1].trim() : t;
}
function makeScheduleData(item) {
  return {
    ...item,
    openAt: new Date(item.openAt),
    closeAt: new Date(item.closeAt),
    isPublished: true,
    status: 'scheduled',
    updatedAt: FieldValue.serverTimestamp()
  };
}

async function ensureSchedules() {
  // Schedules are created and published only by the administrator.
  return;
}

async function sendEmail({ to, name, subject, html, text }) {
  const cfg = ZEPTOMAIL_CONFIG.value();
  if (!cfg?.apiKey || !cfg?.fromEmail) {
    logger.warn('ZeptoMail is not configured; email skipped.');
    return { skipped: true };
  }
  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Zoho-enczapikey ${cfg.apiKey}`
    },
    body: JSON.stringify({
      from: { address: cfg.fromEmail, name: cfg.fromName || 'FXEC Assessment Portal' },
      to: [{ email_address: { address: to, name: name || undefined } }],
      subject,
      htmlbody: html,
      textbody: text || subject,
      track_opens: true,
      track_clicks: true
    })
  });
  const body = await response.text();
  if (!response.ok) {
    logger.error('ZeptoMail error', { status: response.status, body });
    throw new Error(`ZeptoMail failed: ${response.status}`);
  }
  return JSON.parse(body || '{}');
}

function questionGenerationPrompt(schedule) {
  return `
You are the assessment engine for Francis Xavier Engineering College.
Generate exactly 25 high-quality C Programming Level 3 Strings questions for Day ${schedule.day}: ${schedule.topic}.
Use ONLY the supplied source map. Do not introduce concepts not supported by it.

POOL COUNTS:
5 mcq, 5 match, 8 audio, 2 problemSolving, 5 multiAnswer = 25.
DIFFICULTY COUNTS:
10 easy, 10 moderate, 5 tough.
A question has one difficulty: easy, moderate, tough.

FORMAT:
- mcq: one correct option.
- match: include leftItems (an array of labels), rightItems (an array of choices), and answer as a mapping object such as {"A":"1","B":"2"}. options may repeat rightItems for compatibility.
- audio: same scoring structure as mcq, but include audioText containing the exact spoken question and options. The browser will play an MP3 generated from audioText. Do not put the correct answer in audioText.
- problemSolving: one best answer; can use a short C code sample, output prediction, assertion/reasoning or algorithmic reasoning.
- multiAnswer: exactly 2 or 3 correct option indexes; options length 4.
Every question must include: id, type, difficulty, topic, prompt, options, answer, explanation.
For match, options may be an array of strings while answer is a mapping object.
For audio, answer is an option index.
Use 0-based option indexes for mcq/audio/problemSolving/multiAnswer.
Make distractors plausible and avoid ambiguity.
Do not copy the source's knowledge-check questions verbatim; create fresh questions from the same concepts.
Include C code samples where useful, especially moderate/tough questions.
Return JSON only as an object: {"questions":[...]}.

SOURCE MAP:
${SOURCE_MAP}
`;
}

async function generateJson(prompt) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'fxec-c-strings',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  });
  const response = await ai.models.generateContent({
    model: CONFIG.model,
    contents: prompt,
    config: {
      temperature: 0.35,
      responseMimeType: 'application/json',
      maxOutputTokens: 30000
    }
  });
  return JSON.parse(stripJson(response.text));
}

function structuralValidate(questions) {
  if (!Array.isArray(questions) || questions.length !== CONFIG.poolSize) return { ok: false, reason: 'wrong pool size' };
  const ids = new Set();
  const counts = { mcq: 0, match: 0, audio: 0, problemSolving: 0, multiAnswer: 0 };
  const diffs = { easy: 0, moderate: 0, tough: 0 };
  for (const q of questions) {
    if (!q.id || ids.has(q.id) || !counts.hasOwnProperty(q.type) || !diffs.hasOwnProperty(q.difficulty)) {
      return { ok: false, reason: 'invalid id/type/difficulty' };
    }
    ids.add(q.id); counts[q.type]++; diffs[q.difficulty]++;
    if (!q.prompt || !Array.isArray(q.options) || q.options.length < 2 || !q.explanation) {
      return { ok: false, reason: 'missing question fields' };
    }
    if (q.type !== 'match' && (typeof q.answer !== 'number' && !Array.isArray(q.answer))) {
      return { ok: false, reason: 'invalid answer' };
    }
    if (q.type === 'multiAnswer' && (!Array.isArray(q.answer) || q.answer.length < 2 || q.answer.length > 3)) {
      return { ok: false, reason: 'multiAnswer must have 2-3 correct options' };
    }
    if (q.type === 'audio' && !q.audioText) return { ok: false, reason: 'audioText missing' };
    if (q.type === 'match' && (!Array.isArray(q.leftItems) || !Array.isArray(q.rightItems) || !q.leftItems.length || !q.rightItems.length || !q.answer || typeof q.answer !== 'object' || Array.isArray(q.answer))) return { ok: false, reason: 'match fields missing' };
  }
  for (const [type, count] of Object.entries(POOL_DISTRIBUTION)) if (counts[type] !== count) return { ok: false, reason: `bad ${type} count` };
  for (const [d, count] of Object.entries({ easy: 10, moderate: 10, tough: 5 })) if (diffs[d] !== count) return { ok: false, reason: `bad ${d} count` };
  return { ok: true };
}

async function verifyQuestions(questions) {
  const prompt = `
Audit the following generated C Strings questions against this source map.
Return JSON only: {"valid":true} or {"valid":false,"issues":["..."]}.
Reject any question if its answer is wrong, ambiguous, has duplicate options, contains unsupported concepts, or its explanation contradicts the source.
SOURCE:
${SOURCE_MAP}
QUESTIONS:
${JSON.stringify(questions)}
`;
  return generateJson(prompt);
}

async function buildQuestionPool(schedule) {
  const poolRef = db.collection('questionPools').doc(schedule.date);
  const existing = await poolRef.get();
  if (existing.exists && existing.data().status === 'ready') return existing.data();

  const jobRef = db.collection('generationJobs').doc(schedule.date);
  const claimed = await db.runTransaction(async tx => {
    const snap = await tx.get(jobRef);
    if (snap.exists && ['running', 'ready'].includes(snap.data().status)) return false;
    tx.set(jobRef, { status: 'running', startedAt: FieldValue.serverTimestamp(), day: schedule.day }, { merge: true });
    return true;
  });
  if (!claimed) return null;

  try {
    let generated = null;
    let lastReason = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await generateJson(questionGenerationPrompt(schedule));
      const structural = structuralValidate(result.questions);
      if (!structural.ok) { lastReason = structural.reason; continue; }
      const audit = await verifyQuestions(result.questions);
      if (audit.valid === true) { generated = result.questions; break; }
      lastReason = (audit.issues || []).join('; ');
    }
    if (!generated) throw new Error(`Question validation failed: ${lastReason}`);

    const questions = [];
    for (const q of generated) {
      const item = {
        ...q,
        id: `${schedule.date}-${q.id}`,
        createdAt: new Date()
      };
      if (q.type === 'audio') {
        const spoken = cleanText(q.audioText || q.prompt, 3500);
        const [ttsResponse] = await tts.synthesizeSpeech({
          input: { text: spoken },
          voice: CONFIG.voice,
          audioConfig: { audioEncoding: 'MP3' }
        });
        const audioPath = `audio/${schedule.date}/${item.id}.mp3`;
        const file = bucket.file(audioPath);
        await file.save(ttsResponse.audioContent, { contentType: 'audio/mpeg', resumable: false, metadata: { cacheControl: 'public,max-age=31536000', metadata: { firebaseStorageDownloadTokens: randomUUID() } } });
        item.audioPath = audioPath;
      }
      questions.push(item);
    }

    const data = {
      date: schedule.date,
      day: schedule.day,
      topic: schedule.topic,
      status: 'ready',
      questions,
      poolSize: questions.length,
      generatedAt: FieldValue.serverTimestamp()
    };
    await poolRef.set(data);
    await jobRef.set({ status: 'ready', completedAt: FieldValue.serverTimestamp(), poolSize: questions.length }, { merge: true });
    return data;
  } catch (error) {
    await jobRef.set({ status: 'failed', failedAt: FieldValue.serverTimestamp(), error: String(error.message || error) }, { merge: true });
    throw error;
  }
}

function chooseAssessmentQuestions(poolQuestions) {
  // Find a subset satisfying both the question-type blueprint and the target difficulty mix.
  const targetType = { ...BLUEPRINT };
  const targetDifficulty = { easy: 6, moderate: 6, tough: 3 };
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = shuffle(poolQuestions);
    const typeCounts = { mcq:0, match:0, audio:0, problemSolving:0, multiAnswer:0 };
    const diffCounts = { easy:0, moderate:0, tough:0 };
    const picked = [];
    for (const q of candidate) {
      if (typeCounts[q.type] >= targetType[q.type]) continue;
      if (diffCounts[q.difficulty] >= targetDifficulty[q.difficulty]) continue;
      picked.push(q);
      typeCounts[q.type]++;
      diffCounts[q.difficulty]++;
      if (picked.length === CONFIG.questionsPerStudent) break;
    }
    if (
      picked.length === CONFIG.questionsPerStudent &&
      Object.entries(targetType).every(([k,v]) => typeCounts[k] === v) &&
      Object.entries(targetDifficulty).every(([k,v]) => diffCounts[k] === v)
    ) return shuffle(picked);
  }
  // Fallback: preserve the type blueprint even if a generated pool has an unexpected distribution.
  const result = [];
  for (const [type, count] of Object.entries(targetType)) {
    const candidates = shuffle(poolQuestions.filter(q => q.type === type));
    if (candidates.length < count) throw new Error(`Not enough ${type} questions`);
    result.push(...candidates.slice(0, count));
  }
  return shuffle(result).slice(0, CONFIG.questionsPerStudent);
}

function publicQuestion(q) {
  const { answer, explanation, audioText, ...safe } = q;
  return { ...safe, timeLimitSeconds: questionTimeLimitSeconds(q) };
}

export const bootstrapAdmin = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  if (a.token.admin === true) return { success: true, admin: true };
  if ((a.token.email || '').toLowerCase() !== CONFIG.adminEmail.toLowerCase()) {
    throw new HttpsError('permission-denied', 'Only the configured admin email can be bootstrapped.');
  }
  await auth.setCustomUserClaims(a.uid, { admin: true });
  await db.collection('students').doc(a.uid).set({
    uid: a.uid, email: a.token.email, name: 'FXEC Administrator', status: 'approved', role: 'admin',
    createdAt: FieldValue.serverTimestamp(), approvedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { success: true, admin: true, message: 'Admin claim set. Sign out and sign in again.' };
});

export const registerStudent = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  const name = cleanText(request.data?.name, 120);
  const registerNumber = cleanText(request.data?.registerNumber, 50);
  const email = cleanText(request.data?.email || a.token.email, 180).toLowerCase();
  if (!name || !registerNumber || !email) throw new HttpsError('invalid-argument', 'Name, register number and email are required.');
  if (email !== String(a.token.email || '').toLowerCase()) throw new HttpsError('permission-denied', 'Use the email address of the signed-in account.');
  if (!email.endsWith(CONFIG.studentEmailDomain)) throw new HttpsError('invalid-argument', 'Students must use their @francisxavier.ac.in college email address.');
  await db.collection('students').doc(a.uid).set({
    uid: a.uid, name, registerNumber, email, status: 'pending', role: 'student',
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { success: true, status: 'pending' };
});

async function approveStudentById(studentId) {
  if (!studentId) throw new HttpsError('invalid-argument', 'studentId is required.');
  const ref = db.collection('students').doc(studentId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Student not found.');
  const student = snap.data();
  await ref.update({ status: 'approved', approvedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  if (student.email) {
    try {
      await sendEmail({
        to: student.email, name: student.name,
        subject: 'FXEC C Programming Assessment – Registration Approved',
        html: '<p>Dear ' + (student.name || 'Student') + ',</p><p>Your registration for the FXEC C Programming – Level 3 Strings assessment has been approved.</p><p>The assessment windows will open automatically according to the published schedule.</p>',
        text: 'Dear ' + (student.name || 'Student') + ', your FXEC C Programming Strings assessment registration has been approved.'
      });
    } catch (e) { logger.error('Approval email failed; student approval retained.', e); }
  }
  return { success: true };
}

export const authorizeStudent = onCall({ cors: CALLABLE_CORS, secrets: [ZEPTOMAIL_CONFIG] }, async request => {
  requireAdmin(request);
  return approveStudentById(cleanText(request.data?.studentId, 200));
});

export const authorizeStudentsBulk = onCall({ cors: CALLABLE_CORS, secrets: [ZEPTOMAIL_CONFIG] }, async request => {
  requireAdmin(request);
  const ids = Array.isArray(request.data?.studentIds) ? [...new Set(request.data.studentIds.map(x => cleanText(x, 200)).filter(Boolean))] : [];
  if (!ids.length) throw new HttpsError('invalid-argument', 'Select at least one student.');
  const results = [];
  for (const id of ids) { try { await approveStudentById(id); results.push({ id, success: true }); } catch (e) { results.push({ id, success: false, error: e.message || 'Approval failed' }); } }
  return { success: results.every(x => x.success), approved: results.filter(x => x.success).length, results };
});

export const updateAssessmentSchedules = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAdmin(request);
  const schedules = Array.isArray(request.data?.schedules) ? request.data.schedules : [];
  if (!schedules.length || schedules.length > 10) throw new HttpsError('invalid-argument', 'Provide one or more assessment schedules.');
  const normalized = schedules.map(item => {
    const day = Number(item.day);
    const date = cleanText(item.date, 20);
    const topic = cleanText(item.topic, 200);
    const openAt = new Date(cleanText(item.openAt, 50));
    const closeAt = new Date(cleanText(item.closeAt, 50));
    if (!Number.isInteger(day) || day < 1 || !date || !topic || Number.isNaN(openAt.getTime()) || Number.isNaN(closeAt.getTime()) || closeAt <= openAt) {
      throw new HttpsError('invalid-argument', 'Each schedule needs a valid Day, date, opening time and closing time.');
    }
    return {day,date,topic,videoUrl:cleanText(item.videoUrl,500),openAt,closeAt,isPublished:item.isPublished===true,status:item.isPublished===true?'scheduled':'draft'};
  });
  const dates = new Set();
  const days = new Set();
  for (const s of normalized) {
    if (dates.has(s.date)) throw new HttpsError('invalid-argument','Each assessment day must have a unique date.');
    if (days.has(s.day)) throw new HttpsError('invalid-argument','Each assessment day must have a unique Day number.');
    dates.add(s.date); days.add(s.day);
  }
  const batch = db.batch();
  const existing = await db.collection('assessmentSchedules').get();
  existing.docs.forEach(d => batch.delete(d.ref));
  normalized.forEach(s => batch.set(db.collection('assessmentSchedules').doc(s.date), {...s,updatedAt:FieldValue.serverTimestamp()}));
  await batch.commit();
  logger.info('Assessment schedules saved', {count:normalized.length, adminUid:request.auth?.uid, dates:[...dates]});
  return {success:true,count:normalized.length};
});

export const getAssessment = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  const studentSnap = await db.collection('students').doc(a.uid).get();
  if (!studentSnap.exists || studentSnap.data().status !== 'approved') throw new HttpsError('permission-denied', 'Student is not approved.');
  const now = new Date();
  const schedules = (await db.collection('assessmentSchedules').where('isPublished', '==', true).get()).docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(x => x.openAt?.toDate && x.closeAt?.toDate)
    .sort((x, y) => x.openAt.toDate() - y.openAt.toDate());
  const current = schedules.find(x => now >= x.openAt.toDate() && now < x.closeAt.toDate());
  const upcoming = schedules.find(x => now < x.openAt.toDate());
  const target = current || upcoming;
  if (!target) return { status: 'closed', message: 'All scheduled assessments are closed.' };
  const poolSnap = await db.collection('questionPools').doc(target.date).get();
  if (!poolSnap.exists || poolSnap.data().status !== 'ready') return { status: target.status, schedule: { date: target.date, day: target.day, topic: target.topic, videoUrl: target.videoUrl || '', openAt: target.openAt.toDate().toISOString(), closeAt: target.closeAt.toDate().toISOString() }, ready: false };
  return { status: current ? 'open' : 'scheduled', schedule: { date: target.date, day: target.day, topic: target.topic, videoUrl: target.videoUrl || '', openAt: target.openAt.toDate().toISOString(), closeAt: target.closeAt.toDate().toISOString() }, ready: true };
});

export const startAttempt = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  const student = await db.collection('students').doc(a.uid).get();
  if (!student.exists || student.data().status !== 'approved') throw new HttpsError('permission-denied', 'Student is not approved.');
  const now = new Date();
  const schedules = (await db.collection('assessmentSchedules').where('isPublished', '==', true).get()).docs.map(d => d.data());
  const schedule = schedules.find(x => now >= x.openAt.toDate() && now < x.closeAt.toDate());
  if (!schedule) throw new HttpsError('failed-precondition', 'No assessment is currently open.');
  const poolSnap = await db.collection('questionPools').doc(schedule.date).get();
  if (!poolSnap.exists || poolSnap.data().status !== 'ready') throw new HttpsError('failed-precondition', 'Today\'s question pool is still being prepared. Please try again shortly.');
  const existing = await db.collection('attempts').where('studentId', '==', a.uid).where('assessmentDate', '==', schedule.date).limit(1).get();
  if (!existing.empty) {
    const attempt = existing.docs[0].data();
    if (attempt.status === 'finalized') throw new HttpsError('already-exists', 'You have already completed today\'s assessment.');
    return { attemptId: existing.docs[0].id, questions: attempt.questions, assessmentDate: schedule.date, closeAt: schedule.closeAt.toDate().toISOString(), resumed: true };
  }
  const selected = chooseAssessmentQuestions(poolSnap.data().questions || []);
  const questions = selected.map(publicQuestion);
  const totalTimeLimitSeconds = questions.reduce((sum, q) => sum + Number(q.timeLimitSeconds || 60), 0);
  const startedAt = Date.now();
  const scheduleCloseMs = schedule.closeAt.toDate().getTime();
  const assessmentCloseMs = Math.min(scheduleCloseMs, startedAt + totalTimeLimitSeconds * 1000);
  const assessmentCloseAt = new Date(assessmentCloseMs);
  const attemptRef = db.collection('attempts').doc();
  await attemptRef.set({
    studentId: a.uid, assessmentDate: schedule.date, poolId: schedule.date, totalQuestions: questions.length,
    questions, totalTimeLimitSeconds, status: 'started', startedAt: FieldValue.serverTimestamp(), closeAt: assessmentCloseAt,
    questionIds: questions.map(q => q.id)
  });
  return { attemptId: attemptRef.id, assessmentDate: schedule.date, closeAt: assessmentCloseAt.toISOString(), totalTimeLimitSeconds, questions };
});


export const finalizeAttemptSubmission = onDocumentCreated('assessmentSubmissions/{submissionId}', async event => {
  const submissionRef = event.data?.ref;
  const submission = event.data?.data();
  const attemptId = String(submission?.attemptId || '');
  const submissionId = event.params.submissionId;
  if (!submissionRef || !submission) return;
  try {
    const attemptRef = db.collection('attempts').doc(attemptId);
    const attemptSnap = await attemptRef.get();
    if (!attemptSnap.exists) throw new Error('Attempt not found.');
    const attempt = attemptSnap.data();
    if (submission.studentId !== attempt.studentId) throw new Error('Submission ownership mismatch.');

    const existingResultRef = db.collection('results').doc(attemptId);
    const existingResult = await existingResultRef.get();
    if (existingResult.exists) {
      await submissionRef.set({status:'completed', result:existingResult.data(), completedAt:FieldValue.serverTimestamp()},{merge:true});
      return;
    }

    // The assessment is governed by the published Day window. The client
    // enforces the per-question/overall timer; the server only rejects
    // submissions after the published assessment window itself closes.
    const scheduleSnap = await db.collection('assessmentSchedules').doc(attempt.assessmentDate).get();
    if (scheduleSnap.exists) {
      const schedule = scheduleSnap.data();
      const scheduleClose = schedule.closeAt?.toDate ? schedule.closeAt.toDate() : new Date(schedule.closeAt);
      if (!Number.isNaN(scheduleClose.getTime()) && new Date() > scheduleClose) {
        throw new Error('The assessment window has closed.');
      }
    }

    const poolSnap = await db.collection('questionPools').doc(attempt.poolId).get();
    if (!poolSnap.exists) throw new Error('Question pool unavailable.');
    const byId = new Map((poolSnap.data().questions || []).map(q => [q.id, q]));
    const allowedIds = new Set(Array.isArray(attempt.questionIds) ? attempt.questionIds : []);
    const answers = Array.isArray(submission.answers) ? submission.answers : [];
    let correct = 0;
    for (const submitted of answers) {
      if (!allowedIds.has(submitted.questionId)) continue;
      const q = byId.get(submitted.questionId);
      if (q && answersEqual(q.answer, submitted.answer)) correct++;
    }

    const total = Number(attempt.totalQuestions || CONFIG.questionsPerStudent);
    const scorePercent = Math.round((correct / total) * 10000) / 100;
    const passed = scorePercent >= CONFIG.passPercent;
    const rewardPoints = passed ? CONFIG.rewardPoints : 0;
    const studentRef = db.collection('students').doc(attempt.studentId);

    await db.runTransaction(async tx => {
      const current = await tx.get(existingResultRef);
      if (current.exists) return;
      tx.set(existingResultRef, {
        studentId:attempt.studentId,
        attemptId,
        assessmentDate:attempt.assessmentDate,
        score:correct,
        total,
        scorePercent,
        passed,
        rewardPoints,
        completedAt:FieldValue.serverTimestamp()
      });
      tx.update(attemptRef, {status:'finalized', finalizedAt:FieldValue.serverTimestamp()});
      if (passed) {
        tx.set(studentRef, {
          rewardPoints:FieldValue.increment(CONFIG.rewardPoints),
          lastRewardAt:FieldValue.serverTimestamp()
        }, {merge:true});
      }
      tx.set(db.collection('publicStats').doc('global'), {
        totalAttempts:FieldValue.increment(1),
        totalPassed:FieldValue.increment(passed ? 1 : 0),
        totalRewardPoints:FieldValue.increment(rewardPoints),
        updatedAt:FieldValue.serverTimestamp()
      }, {merge:true});
    });

    const result = {score:correct,total,scorePercent,passed,rewardPoints};
    await submissionRef.set({status:'completed',result,completedAt:FieldValue.serverTimestamp()},{merge:true});

    try {
      const student=(await studentRef.get()).data()||{};
      if(student.email) {
        await sendEmail({
          to:student.email,
          name:student.name,
          subject:passed?'FXEC C Programming Assessment – Congratulations!':'FXEC C Programming Assessment – Result',
          html:`<p>Dear ${student.name||'Student'},</p><p>You scored <strong>${scorePercent}%</strong>.</p><p>${passed?'Congratulations! 40 Reward Points have been credited.':'The passing requirement is 80%.'}</p>`,
          text:`Your score is ${scorePercent}%.`
        });
      }
    } catch(e) {
      logger.error('Result email failed after score commit.',{error:e?.message||String(e),attemptId});
    }
    try {
      await updateLeaderboard();
    } catch(e) {
      logger.error('Leaderboard update failed after score commit.',{error:e?.message||String(e),attemptId});
    }
  } catch(error) {
    logger.error('finalizeAttemptSubmission failed',{
      error:error?.stack||error?.message||String(error),
      attemptId,
      studentId:submission.studentId||''
    });
    await submissionRef.set({
      status:'failed',
      error:'Unable to process the assessment submission. Please contact the administrator.',
      failedAt:FieldValue.serverTimestamp()
    },{merge:true});
  }
});

export const finalizeAttempt = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  const attemptId = cleanText(request.data?.attemptId, 200);
  const answers = Array.isArray(request.data?.answers) ? request.data.answers : [];
  if (!attemptId) throw new HttpsError('invalid-argument', 'attemptId is required.');
  try {
    const attemptRef = db.collection('attempts').doc(attemptId);
    const attemptSnap = await attemptRef.get();
    if (!attemptSnap.exists) throw new HttpsError('not-found', 'Attempt not found.');
    const attempt = attemptSnap.data();
    if (attempt.studentId !== a.uid) throw new HttpsError('permission-denied', 'Attempt ownership mismatch.');
    if (attempt.status === 'finalized') {
      const existing = await db.collection('results').doc(attemptId).get();
      if (existing.exists) return existing.data();
      throw new HttpsError('failed-precondition', 'This attempt was already submitted.');
    }
    const closeAt = attempt.closeAt?.toDate ? attempt.closeAt.toDate() : new Date(attempt.closeAt);
    if (!Number.isNaN(closeAt.getTime()) && new Date() > closeAt) throw new HttpsError('deadline-exceeded', 'The assessment window has closed.');
    const poolSnap = await db.collection('questionPools').doc(attempt.poolId).get();
    if (!poolSnap.exists) throw new HttpsError('failed-precondition', 'Question pool unavailable.');
    const byId = new Map((poolSnap.data().questions || []).map(q => [q.id, q]));
    let correct = 0;
    for (const submitted of answers) {
      const q = byId.get(submitted.questionId);
      if (q && answersEqual(q.answer, submitted.answer)) correct++;
    }
    const total = Number(attempt.totalQuestions || CONFIG.questionsPerStudent);
    const scorePercent = Math.round((correct / total) * 10000) / 100;
    const passed = scorePercent >= CONFIG.passPercent;
    const rewardPoints = passed ? CONFIG.rewardPoints : 0;
    const studentRef = db.collection('students').doc(a.uid);
    const resultRef = db.collection('results').doc(attemptId);
    await db.runTransaction(async tx => {
      const current = await tx.get(resultRef);
      if (current.exists) return;
      tx.set(resultRef, {studentId:a.uid,attemptId,assessmentDate:attempt.assessmentDate,score:correct,total,scorePercent,passed,rewardPoints,completedAt:FieldValue.serverTimestamp()});
      tx.update(attemptRef, {status:'finalized',finalizedAt:FieldValue.serverTimestamp()});
      if (passed) tx.set(studentRef,{rewardPoints:FieldValue.increment(CONFIG.rewardPoints),lastRewardAt:FieldValue.serverTimestamp()},{merge:true});
      tx.set(db.collection('publicStats').doc('global'),{totalAttempts:FieldValue.increment(1),totalPassed:FieldValue.increment(passed?1:0),totalRewardPoints:FieldValue.increment(rewardPoints),updatedAt:FieldValue.serverTimestamp()},{merge:true});
    });
    try {
      const student=(await studentRef.get()).data()||{};
      if(student.email) await sendEmail({to:student.email,name:student.name,subject:passed?'FXEC C Programming Assessment – Congratulations!':'FXEC C Programming Assessment – Result',html:`<p>Dear ${student.name||'Student'},</p><p>You scored <strong>${scorePercent}%</strong>.</p><p>${passed?'Congratulations! 40 Reward Points have been credited.':'The passing requirement is 80%.'}</p>`,text:`Your score is ${scorePercent}%.`});
    } catch(e) { logger.error('Result email failed after score commit.',{error:e?.message||String(e),attemptId}); }
    try { await updateLeaderboard(); } catch(e) { logger.error('Leaderboard update failed after score commit.',{error:e?.message||String(e),attemptId}); }
    return {score:correct,total,scorePercent,passed,rewardPoints};
  } catch(error) {
    if(error instanceof HttpsError) throw error;
    logger.error('finalizeAttempt failed',{error:error?.stack||error?.message||String(error),attemptId,studentId:a.uid});
    throw new HttpsError('internal','Unable to submit the assessment. Please try again.');
  }
});
export const assessmentScheduler = onSchedule({ schedule: 'every 15 minutes', timeZone: CONFIG.timezone, timeoutSeconds: 540, secrets: [ZEPTOMAIL_CONFIG] }, async () => {
  await ensureSchedules();
  const now = new Date();
  const schedules = (await db.collection('assessmentSchedules').where('isPublished', '==', true).get()).docs;
  for (const doc of schedules) {
    const x = doc.data();
    const open = x.openAt?.toDate?.();
    const close = x.closeAt?.toDate?.();
    if (!open || !close) continue;
    const status = now < open ? 'scheduled' : now < close ? 'open' : 'closed';
    const patch = { status, lastSchedulerRunAt: FieldValue.serverTimestamp() };
    if (now < open && now.getTime() >= open.getTime() - 60 * 60 * 1000 && !x.reminderEmailSent) {
      patch.reminderEmailSent = true;
      await doc.ref.update(patch);
      try { await sendScheduleEmails({ day: x.day, topic: x.topic }, 'reminder'); } catch (e) { logger.error(e); }
    } else if (status === 'open' && !x.openEmailSent) {
      patch.openEmailSent = true;
      await doc.ref.update(patch);
      try { await sendScheduleEmails({ day: x.day, topic: x.topic }, 'open'); } catch (e) { logger.error(e); }
    } else {
      await doc.ref.update(patch);
    }
  }
});

export const assessmentContentScheduler = onSchedule({ schedule: 'every 15 minutes', timeZone: CONFIG.timezone, timeoutSeconds: 900 }, async () => {
  await ensureSchedules();
  // Generate every published assessment pool in advance and keep it ready.
  // buildQuestionPool() is idempotent: once a pool is marked "ready", it is never regenerated.
  const docs = await db.collection('assessmentSchedules').where('isPublished', '==', true).get();
  for (const doc of docs.docs) {
    const x = doc.data();
    try {
      await buildQuestionPool({
        date: x.date || doc.id,
        day: x.day,
        topic: x.topic,
        openAt: x.openAt?.toDate?.() || new Date(x.openAt),
        closeAt: x.closeAt?.toDate?.() || new Date(x.closeAt)
      });
    } catch (e) {
      logger.error('Pre-generation failed for ' + (x.date || doc.id), e);
    }
  }
});

export const getStudentProfile = onCall({ cors: CALLABLE_CORS }, async request => {
  const a = requireAuth(request);
  const snap = await db.collection('students').doc(a.uid).get();
  if (!snap.exists) {
    return { registered: false, status: 'not_registered', email: a.email || '' };
  }
  const s = snap.data();
  const resultSnap = await db.collection('results').where('studentId', '==', a.uid).get();
  const results = resultSnap.docs.map(d => d.data()).sort((x,y) => {
    const ax = x.completedAt?.toMillis?.() || 0, ay = y.completedAt?.toMillis?.() || 0;
    return ay - ax;
  });
  const latest = results[0] || null;
  return {
    registered: true,
    status: s.status || 'pending',
    name: s.name || '',
    registerNumber: s.registerNumber || '',
    email: s.email || a.email || '',
    rewardPoints: s.rewardPoints || 0,
    latestResult: latest ? {
      score: latest.score || 0,
      total: latest.total || 0,
      scorePercent: latest.scorePercent || 0,
      passed: latest.passed === true,
      rewardPoints: latest.rewardPoints || 0,
      assessmentDate: latest.assessmentDate || ''
    } : null
  };
});


function normalizeDraftQuestion(q) {
  const x = JSON.parse(JSON.stringify(q || {}));
  x.id = cleanText(x.id, 120);
  x.type = cleanText(x.type, 40);
  x.difficulty = cleanText(x.difficulty, 20);
  x.topic = cleanText(x.topic, 200);
  x.prompt = cleanText(x.prompt, 3000);
  x.explanation = cleanText(x.explanation, 3000);
  if (Array.isArray(x.options)) x.options = x.options.map(v => cleanText(v, 1000));
  if (x.audioText) x.audioText = cleanText(x.audioText, 3000);
  return x;
}

function validateDayQuestionBank(questions, day) {
  if (!Array.isArray(questions) || questions.length !== 25) return 'Day ' + day + ' must contain exactly 25 questions.';
  const ids = new Set();
  const expected = {mcq:5,match:5,audio:8,problemSolving:2,multiAnswer:5};
  const diffs = {easy:0,moderate:0,tough:0};
  const counts = {mcq:0,match:0,audio:0,problemSolving:0,multiAnswer:0};
  for (const q of questions) {
    if (!q.id || ids.has(q.id)) return 'Duplicate or missing question ID: ' + (q.id || '');
    ids.add(q.id);
    if (!Object.prototype.hasOwnProperty.call(expected,q.type)) return 'Invalid type in ' + q.id;
    if (!Object.prototype.hasOwnProperty.call(diffs,q.difficulty)) return 'Invalid difficulty in ' + q.id;
    counts[q.type]++; diffs[q.difficulty]++;
    if (!q.prompt || !Array.isArray(q.options) || q.options.length < 2 || !q.explanation) return 'Missing fields in ' + q.id;
    if (q.type === 'multiAnswer' && (!Array.isArray(q.answer) || q.answer.length < 2 || q.answer.length > 3)) return 'Multi-answer ' + q.id + ' must have 2 or 3 correct options.';
    if (q.type !== 'multiAnswer' && q.type !== 'match' && (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)) return 'Invalid answer in ' + q.id;
    if (q.type === 'audio' && !q.audioText) return 'Audio text missing in ' + q.id;
    if (q.type === 'match' && (!q.answer || typeof q.answer !== 'object')) return 'Match mapping missing in ' + q.id;
  }
  if (JSON.stringify(counts) !== JSON.stringify(expected)) return 'Day ' + day + ' type distribution must be 5 MCQ, 5 Match, 8 Audio, 2 Problem Solving, 5 Multi-answer.';
  if (JSON.stringify(diffs) !== JSON.stringify({easy:10,moderate:10,tough:5})) return 'Day ' + day + ' difficulty distribution must be 10 Easy, 10 Moderate, 5 Tough.';
  return null;
}

function validateQuestionBank(questions) {
  if (!Array.isArray(questions) || questions.length !== 125) return 'Question bank must contain exactly 125 questions.';
  const ids = new Set();
  const expected = {mcq:5,match:5,audio:8,problemSolving:2,multiAnswer:5};
  for (let day = 1; day <= 5; day++) {
    const dayQs = questions.filter(q => String(q.id).startsWith('D' + day + '-'));
    if (dayQs.length !== 25) return 'Day ' + day + ' must contain exactly 25 questions.';
    const counts = {mcq:0,match:0,audio:0,problemSolving:0,multiAnswer:0};
    const diffs = {easy:0,moderate:0,tough:0};
    for (const q of dayQs) {
      if (!q.id || ids.has(q.id)) return 'Duplicate or missing question ID: ' + (q.id || '');
      ids.add(q.id);
      if (!Object.prototype.hasOwnProperty.call(expected,q.type)) return 'Invalid type in ' + q.id;
      if (!Object.prototype.hasOwnProperty.call(diffs,q.difficulty)) return 'Invalid difficulty in ' + q.id;
      counts[q.type]++; diffs[q.difficulty]++;
      if (!q.prompt || !Array.isArray(q.options) || q.options.length < 2 || !q.explanation) return 'Missing fields in ' + q.id;
      if (q.type === 'multiAnswer' && (!Array.isArray(q.answer) || q.answer.length < 2 || q.answer.length > 3)) return 'Multi-answer ' + q.id + ' must have 2 or 3 correct options.';
      if (q.type !== 'multiAnswer' && q.type !== 'match' && (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)) return 'Invalid answer in ' + q.id;
      if (q.type === 'audio' && !q.audioText) return 'Audio text missing in ' + q.id;
      if (q.type === 'match' && (!q.answer || typeof q.answer !== 'object')) return 'Match mapping missing in ' + q.id;
    }
    if (JSON.stringify(counts) !== JSON.stringify(expected)) return 'Day ' + day + ' type distribution must be 5 MCQ, 5 Match, 8 Audio, 2 Problem Solving, 5 Multi-answer.';
    if (JSON.stringify(diffs) !== JSON.stringify({easy:10,moderate:10,tough:5})) return 'Day ' + day + ' difficulty distribution must be 10 Easy, 10 Moderate, 5 Tough.';
  }
  return null;
}

function normalizeMatch(q) {
  const x = {...q};
  if (x.type !== 'match') return x;
  const pairs = Array.isArray(x.options) ? x.options : [];
  const leftItems = pairs.map(p => String(p).split(' -> ')[0].trim());
  const rightItems = pairs.map(p => String(p).split(' -> ')[1]?.trim() || String(p).trim());
  const answer = {};
  Object.entries(x.answer || {}).forEach(([k,v]) => {
    const value = String(v);
    const idx = rightItems.findIndex(r => r === value);
    answer[k] = idx >= 0 ? rightItems[idx] : value;
  });
  return {...x, leftItems, rightItems, options:rightItems, answer};
}

async function getQuestionBankForAdmin() {
  const snap = await db.collection('questionBank').doc('master').get();
  if (snap.exists) return snap.data();
  const draft = {meta: QUESTION_BANK_META, questions: QUESTION_BANK, status:'draft'};
  await db.collection('questionBank').doc('master').set({
    ...draft,
    updatedAt: FieldValue.serverTimestamp()
  }, {merge:true});
  return draft;
}

export const questionBankAdminAction = onDocumentCreated({region:'asia-south1',timeoutSeconds:540,memory:'1GiB',retry:true}, 'adminActions/{actionId}', async event => {
  const actionRef = event.data?.ref;
  const actionId = event.params.actionId;
  try {
    
      const action = event.data?.data();
      if (!action || action.status !== 'requested') return;
      const id = event.params.actionId;
    
      if (id === 'seedQuestionBank') {
        const ref = db.collection('questionBank').doc('master');
        if (!(await ref.get()).exists) {
          await ref.set({meta:QUESTION_BANK_META,questions:QUESTION_BANK,status:'draft',source:'repository-question-bank',seededAt:FieldValue.serverTimestamp()});
        }
        await event.data.ref.set({status:'completed',completedAt:FieldValue.serverTimestamp()},{merge:true});
        return;
      }
    
      // Day-specific approval actions use IDs such as publishQuestionBankDay1_... .
      // Prefer the explicit day field and fall back to the action ID.
      const dayFromId = id.match(/^publishQuestionBankDay(\d+)_/);
      const requestedDay = Number(action.day || dayFromId?.[1] || 0);
      if (requestedDay >= 1 && requestedDay <= 5) {
        const day = requestedDay;
        const suppliedQuestions = Array.isArray(action.questions) ? action.questions : null;
        const bank = suppliedQuestions ? null : await getQuestionBankForAdmin();
        const allQuestions = (suppliedQuestions || bank?.questions || []).map(normalizeDraftQuestion);
        const dayQuestions = allQuestions.filter(q => Number(String(q.id).match(/^D(\d+)-/)?.[1] || 0) === day);
        if (!dayQuestions.length) {
          await event.data.ref.set({status:'failed',error:'No questions found for Day '+day,completedAt:FieldValue.serverTimestamp()},{merge:true});
          return;
        }
        const error = validateDayQuestionBank(dayQuestions, day);
        if (error) {
          await event.data.ref.set({status:'failed',error,completedAt:FieldValue.serverTimestamp()},{merge:true});
          return;
        }
        const scheduleSnap = await db.collection('assessmentSchedules').where('day','==',day).limit(1).get();
        const savedSchedule = scheduleSnap.empty ? null : scheduleSnap.docs[0].data();
        const date = savedSchedule?.date || FIVE_DAY_SCHEDULE[day-1]?.date;
        if (!date) {
          await event.data.ref.set({status:'failed',error:'No schedule date configured for Day '+day,completedAt:FieldValue.serverTimestamp()},{merge:true});
          return;
        }
        const enriched=[];
        for (const q0 of dayQuestions.map(normalizeMatch)) {
          const item={...q0};
          delete item.audioPath;
          if(q0.type==='audio'){
            try{
              const [response]=await tts.synthesizeSpeech({
                input:{text:q0.audioText||q0.prompt},
                voice:{languageCode:CONFIG.voice.languageCode,name:CONFIG.voice.name},
                audioConfig:{audioEncoding:'MP3'}
              });
              const path='audio/question-bank/'+date+'/'+q0.id+'.mp3';
              await bucket.file(path).save(response.audioContent,{contentType:'audio/mpeg',resumable:false,metadata:{cacheControl:'public,max-age=31536000',metadata:{firebaseStorageDownloadTokens:randomUUID()}}});
              item.audioPath=path;
            }catch(ttsError){
              logger.error('Question audio generation failed; publishing without MP3', {questionId:q0.id,error:ttsError?.message||String(ttsError)});
            }
          }
          enriched.push(item);
        }
        await db.collection('questionPools').doc(date).set({
          date,day,topic:FIVE_DAY_SCHEDULE[day-1]?.topic||qTopic(day),status:'ready',
          source:'admin-question-bank',approvedBy:action.requestedBy||'admin',
          approvedAt:FieldValue.serverTimestamp(),questions:enriched,updatedAt:FieldValue.serverTimestamp()
        });
        await db.collection('questionBank').doc('master').set({
          dayStatus:{[day]:'approved'},status:'draft',updatedAt:FieldValue.serverTimestamp()
        },{merge:true});
        await event.data.ref.set({status:'completed',completedAt:FieldValue.serverTimestamp(),day,questions:enriched.length},{merge:true});
        return;
      }
    
      if (id === 'publishQuestionBank') {
        const bank=await getQuestionBankForAdmin();
        const questions=(bank.questions||[]).map(normalizeDraftQuestion);
        const error=validateQuestionBank(questions);
        if(error){await event.data.ref.set({status:'failed',error,completedAt:FieldValue.serverTimestamp()},{merge:true});return;}
        const byDay=new Map();
        questions.forEach(q=>{const day=Number(String(q.id).match(/^D(\d+)-/)?.[1]||0);if(!byDay.has(day))byDay.set(day,[]);byDay.get(day).push(normalizeMatch(q));});
        for(const [day,dayQuestions] of byDay.entries()){
          const date=FIVE_DAY_SCHEDULE[day-1]?.date;if(!date)continue;
          const enriched=[];
          for(const q of dayQuestions){
            const item={...q};delete item.audioPath;
            if(q.type==='audio'){
              const [response]=await tts.synthesizeSpeech({input:{text:q.audioText||q.prompt},voice:{languageCode:CONFIG.voice.languageCode,name:CONFIG.voice.name},audioConfig:{audioEncoding:'MP3'}});
              const path='audio/question-bank/'+date+'/'+q.id+'.mp3';
              await bucket.file(path).save(response.audioContent,{contentType:'audio/mpeg'});item.audioPath=path;
            }
            enriched.push(item);
          }
          await db.collection('questionPools').doc(date).set({date,day,topic:FIVE_DAY_SCHEDULE[day-1]?.topic||qTopic(day),status:'ready',source:'admin-question-bank',approvedBy:action.requestedBy||'admin',approvedAt:FieldValue.serverTimestamp(),questions:enriched,updatedAt:FieldValue.serverTimestamp()});
        }
        await db.collection('questionBank').doc('master').set({status:'published',publishedAt:FieldValue.serverTimestamp()},{merge:true});
        await event.data.ref.set({status:'completed',completedAt:FieldValue.serverTimestamp(),questions:questions.length},{merge:true});
      }
  } catch (error) {
    logger.error("Question bank admin action failed", {
      actionId,
      error: error?.message || String(error),
      stack: error?.stack || ""
    });
    if (actionRef) {
      await actionRef.set({
        status: "failed",
        error: error?.message || String(error),
        completedAt: FieldValue.serverTimestamp()
      }, {merge:true});
    }
  }
})
export const getAdminQuestionBank = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAdmin(request);
  const bank = await getQuestionBankForAdmin();
  return {meta: bank.meta || QUESTION_BANK_META, status: bank.status || 'draft', questions: bank.questions || QUESTION_BANK};
});

export const saveAdminQuestionBank = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAdmin(request);
  const questions = Array.isArray(request.data?.questions) ? request.data.questions.map(normalizeDraftQuestion) : [];
  const error = validateQuestionBank(questions);
  if (error) throw new HttpsError('invalid-argument', error);
  await db.collection('questionBank').doc('master').set({
    meta: {...QUESTION_BANK_META, totalQuestions: questions.length},
    questions,
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid
  });
  return {success:true, status:'draft', totalQuestions:questions.length};
});

export const publishAdminQuestionBank = onCall({ cors: CALLABLE_CORS, timeoutSeconds:900 }, async request => {
  requireAdmin(request);
  const bank = await getQuestionBankForAdmin();
  const questions = (bank.questions || []).map(normalizeDraftQuestion);
  const error = validateQuestionBank(questions);
  if (error) throw new HttpsError('failed-precondition', error);

  const byDay = new Map();
  questions.forEach(q => {
    const day = Number(String(q.id).match(/^D(\d+)-/)?.[1] || 0);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(normalizeMatch(q));
  });

  for (const [day, dayQuestions] of byDay.entries()) {
    const date = FIVE_DAY_SCHEDULE[day - 1]?.date;
    if (!date) continue;
    const enriched = [];
    for (const q of dayQuestions) {
      const item = {...q};
      delete item.audioPath;
      if (q.type === 'audio') {
        const audioText = q.audioText || q.prompt;
        const [response] = await tts.synthesizeSpeech({
          input: {text: audioText},
          voice: {languageCode: CONFIG.voice.languageCode, name: CONFIG.voice.name},
          audioConfig: {audioEncoding:'MP3'}
        });
        const path = 'audio/question-bank/' + date + '/' + q.id + '.mp3';
        await bucket.file(path).save(response.audioContent, {contentType:'audio/mpeg'});
        item.audioPath = path;
      }
      enriched.push(item);
    }
    const ref = db.collection('questionPools').doc(date);
    await ref.set({
      date,
      day,
      topic: FIVE_DAY_SCHEDULE[day - 1]?.topic || qTopic(day),
      status:'ready',
      source:'admin-question-bank',
      approvedBy:request.auth.uid,
      approvedAt:FieldValue.serverTimestamp(),
      questions:enriched,
      updatedAt:FieldValue.serverTimestamp()
    });
  }
  await db.collection('questionBank').doc('master').set({
    status:'published',
    publishedAt:FieldValue.serverTimestamp(),
    publishedBy:request.auth.uid
  }, {merge:true});
  return {success:true, status:'published', days:byDay.size, questions:questions.length};
});

function qTopic(day) {
  return ['String Basics','String Library Functions','Manual String Processing','Character Frequency and String Analysis','Advanced String Problem Solving'][day-1] || 'C Strings';
}

export const getCourseOverview = onCall(async () => {
  const schedules = (await db.collection('assessmentSchedules').get()).docs
    .map(d => { const x=d.data(); return { day:x.day, date:x.date, topic:x.topic, isPublished:x.isPublished === true, openAt:x.openAt?.toDate?.().toISOString?.() || null, closeAt:x.closeAt?.toDate?.().toISOString?.() || null }; })
    .sort((a,b) => Number(a.day)-Number(b.day));
  return {
    title: 'C Programming – Level 3 | Strings',
    duration: 5,
    overview: 'A 5-day self-learning and assessment programme covering C strings from fundamentals through advanced string problem solving.',
    schedules
  };
});



const C_CHALLENGES = Object.freeze({
  'count-vowels': {
    title: 'Count Vowels',
    xp: 20,
    tests: [
      ['Engineering','4'],['AEIOU','5'],['rhythm','0'],['Hello World','3'],['FXEC Engineering College','9']
    ]
  },
  'reverse-string': {
    title: 'Reverse a String',
    xp: 20,
    tests: [
      ['hello','olleh'],['hello world','dlrow olleh'],['FXEC','CEXF'],['a','a'],['Engineering','gnireenignE']
    ]
  },
  'palindrome': {
    title: 'Palindrome Check',
    xp: 20,
    tests: [
      ['madam','YES'],['Never odd or even','YES'],['hello','NO'],['Level','YES'],['engineering','NO']
    ]
  }
});

function normalizeCompilerText(value){
  return String(value ?? '').replace(/\r\n/g,'\n').trim();
}

async function judge0Submit(sourceCode, stdin, expectedOutput){
  const base=String(COMPILER_API_URL.value()||'').replace(/\/$/,'');
  if(!base) throw new HttpsError('failed-precondition','Compiler service is not configured.');
  const headers={'Content-Type':'application/json'};
  const token=String(COMPILER_API_TOKEN.value()||'').trim();
  if(token) headers['X-Auth-Token']=token;
  const response=await fetch(base+'/submissions?base64_encoded=false&wait=false',{
    method:'POST',headers,
    body:JSON.stringify({
      language_id:50,
      source_code:sourceCode,
      stdin:stdin||'',
      expected_output:expectedOutput,
      cpu_time_limit:2,
      wall_time_limit:5,
      memory_limit:128000,
      max_file_size:1024
    })
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body.error||body.message||('Compiler service returned HTTP '+response.status));
  if(body.token && !body.status){
    for(let i=0;i<12;i++){
      await new Promise(r=>setTimeout(r,750));
      const poll=await fetch(base+'/submissions/'+encodeURIComponent(body.token)+'?base64_encoded=false',{headers});
      const data=await poll.json().catch(()=>({}));
      if(!poll.ok) throw new Error(data.error||'Compiler polling failed.');
      if(data.status && ![1,2].includes(Number(data.status.id))) return data;
    }
    throw new Error('Compiler timed out while waiting for the execution result.');
  }
  return body;
}

function enforceCodeLimits(sourceCode, stdin){
  if(typeof sourceCode!=='string'||sourceCode.length<1||sourceCode.length>20000) throw new HttpsError('invalid-argument','C source code must be between 1 and 20,000 characters.');
  if(typeof stdin!=='string'||stdin.length>5000) throw new HttpsError('invalid-argument','Input is limited to 5,000 characters.');
}

async function consumeCompilerQuota(uid, amount=1){
  const ref=db.collection('compilerUsage').doc(uid);
  const today=new Date().toISOString().slice(0,10);
  return db.runTransaction(async tx=>{
    const snap=await tx.get(ref); const d=snap.exists?snap.data():{};
    const count=d.date===today?Number(d.count||0):0;
    if(count+amount>30) throw new HttpsError('resource-exhausted','Daily coding-run limit reached (30 runs).');
    tx.set(ref,{date:today,count:count+amount,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    return count+amount;
  });
}

export const runCCode = onCall({cors:CALLABLE_CORS,timeoutSeconds:30,memory:'512MiB'}, async request=>{
  const user=requireAuth(request);
  const sourceCode=String(request.data?.sourceCode||'');
  const stdin=String(request.data?.stdin||'');
  enforceCodeLimits(sourceCode,stdin);
  await consumeCompilerQuota(user.uid,1);
  const result=await judge0Submit(sourceCode,stdin,null);
  const accepted=Number(result.status?.id)===3;
  return {
    accepted,
    status:result.status?.description||'Unknown',
    stdout:String(result.stdout||''),
    stderr:String(result.stderr||''),
    compileOutput:String(result.compile_output||''),
    message:String(result.message||''),
    time:result.time||null,
    memory:result.memory||null
  };
});

export const submitCChallenge = onCall({cors:CALLABLE_CORS,timeoutSeconds:120,memory:'512MiB'}, async request=>{
  const user=requireAuth(request);
  const challengeId=String(request.data?.challengeId||'');
  const challenge=C_CHALLENGES[challengeId];
  if(!challenge) throw new HttpsError('invalid-argument','Unknown C challenge.');
  const sourceCode=String(request.data?.sourceCode||'');
  enforceCodeLimits(sourceCode,'');
  await consumeCompilerQuota(user.uid,challenge.tests.length);
  const results=[];
  for(const [input,expected] of challenge.tests){
    const r=await judge0Submit(sourceCode,input,expected);
    results.push({
      input,expected,
      passed:Number(r.status?.id)===3,
      status:r.status?.description||'Unknown',
      stdout:String(r.stdout||'').slice(0,1000),
      stderr:String(r.stderr||'').slice(0,1000)
    });
  }
  const passedTests=results.filter(x=>x.passed).length;
  const passed=passedTests===results.length;
  const xpEarned=passed?challenge.xp:Math.min(5,passedTests);
  const progressRef=db.collection('competencyProgress').doc(user.uid);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(progressRef); const d=snap.exists?snap.data():{};
    const oldXp=Number(d.xp||0), newXp=oldXp+xpEarned;
    const level=Math.floor(newXp/100)+1;
    const badges=Array.isArray(d.badges)?[...d.badges]:[];
    if(passed && !badges.includes('C Strings Coder')) badges.push('C Strings Coder');
    tx.set(progressRef,{xp:newXp,level,badges,updatedAt:FieldValue.serverTimestamp(),lastChallenge:challengeId,lastChallengePassed:passed},{merge:true});
  });
  return {
    passed,passedTests,totalTests:results.length,xpEarned,
    message:passed?'All hidden tests passed. Challenge completed.':'Some hidden tests failed. Review your algorithm and try again.',
    results:results.map(x=>({passed:x.passed,status:x.status}))
  };
});

export const getCompetencyProgress = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const snap=await db.collection('competencyProgress').doc(user.uid).get();
  return snap.exists?snap.data():{xp:0,level:1,badges:[],tracks:[]};
});

export const getPublicStats = onCall({ cors: CALLABLE_CORS }, async request => {
  const snap = await db.collection('publicStats').doc('global').get();
  return snap.exists ? snap.data() : { totalAttempts: 0, totalPassed: 0, totalRewardPoints: 0, leaderboard: [] };
});

export const getAdminDashboard = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAdmin(request);
  const [students, results, schedules] = await Promise.all([
    db.collection('students').get(),
    db.collection('results').get(),
    db.collection('assessmentSchedules').get()
  ]);
  const pending = [];
  const approved = [];
  students.forEach(d => {
    const s = d.data();
    if (s.status === 'pending') pending.push({ id: d.id, ...s });
    if (s.status === 'approved') approved.push({ id: d.id, ...s });
  });
  approved.sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
  const resultRows = results.docs.map(d => ({ id: d.id, ...d.data() }));
  resultRows.sort((a, b) => (b.scorePercent || 0) - (a.scorePercent || 0));
  return {
    students: students.size, pending, approved, attempts: results.size,
    passed: resultRows.filter(x => x.passed).length,
    average: resultRows.length ? Math.round(resultRows.reduce((a, x) => a + x.scorePercent, 0) / resultRows.length * 100) / 100 : 0,
    top20: resultRows.slice(0, 20),
    schedules: schedules.docs.map(d => { const x=d.data(); return { id:d.id, day:x.day, date:x.date, topic:x.topic, videoUrl:x.videoUrl || '', isPublished:x.isPublished === true, openAt:x.openAt?.toDate?.().toISOString?.() || x.openAt, closeAt:x.closeAt?.toDate?.().toISOString?.() || x.closeAt, status:x.status }; })
  };
});

export const exportResults = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAdmin(request);
  const format = request.data?.format === 'pdf' ? 'pdf' : 'csv';
  const snap = await db.collection('results').orderBy('completedAt', 'desc').get();
  const rows = [];
  for (const d of snap.docs) {
    const r = d.data();
    const s = (await db.collection('students').doc(r.studentId).get()).data() || {};
    rows.push({ registerNumber: s.registerNumber || '', name: s.name || '', email: s.email || '', date: r.assessmentDate || '', score: r.score || 0, total: r.total || 0, percent: r.scorePercent || 0, passed: r.passed ? 'YES' : 'NO', rewardPoints: r.rewardPoints || 0 });
  }
  if (format === 'csv') {
    const header = Object.keys(rows[0] || { registerNumber:'',name:'',email:'',date:'',score:'',total:'',percent:'',passed:'',rewardPoints:'' });
    const csv = [header.join(','), ...rows.map(r => header.map(k => `"${String(r[k] ?? '').replaceAll('"','""')}"`).join(','))].join('\n');
    const path = `exports/results-${Date.now()}.csv`;
    await bucket.file(path).save(csv, { contentType: 'text/csv' });
    return { format, path };
  }
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 560;
  page.drawText('FXEC C Programming – Level 3 | Strings Results', { x: 24, y, size: 16, font });
  y -= 28;
  page.drawText('Register No. | Name | Date | Score | % | Pass | Points', { x: 24, y, size: 8, font });
  y -= 16;
  for (const r of rows) {
    if (y < 30) { page = pdf.addPage([842, 595]); y = 560; }
    const line = `${r.registerNumber} | ${r.name.slice(0,18)} | ${r.date} | ${r.score}/${r.total} | ${r.percent}% | ${r.passed} | ${r.rewardPoints}`;
    page.drawText(line.slice(0, 125), { x: 24, y, size: 7, font, color: rgb(0,0,0) });
    y -= 12;
  }
  const bytes = await pdf.save();
  const path = `exports/results-${Date.now()}.pdf`;
  await bucket.file(path).save(bytes, { contentType: 'application/pdf' });
  return { format, path };
});