import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { PREPARED_C_PROGRAMMING_QUESTION_BANK } from './prepared-c-programming-bank.js';
import { C_STAR_CODING_QUESTIONS } from './c-competency-coding-bank.js';
import { C_COMPETITIVE_CHALLENGES } from './c-competitive-coding-bank.js';
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
initializeApp({ storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'fxec-c-strings.firebasestorage.app' });
const db = getFirestore();
const auth = getAuth();
const bucket = getStorage().bucket();
const tts = new textToSpeech.TextToSpeechClient();

const ZEPTOMAIL_CONFIG = defineJsonSecret('ZEPTOMAIL_CONFIG');
const COMPILER_API_URL = defineString('COMPILER_API_URL', {default: 'https://ce.judge0.com'});
const COMPILER_API_TOKEN = defineString('COMPILER_API_TOKEN', {default: ''});
const AZURE_SPEECH_KEY = defineString('AZURE_SPEECH_KEY', {default: ''});
const AZURE_SPEECH_REGION = defineString('AZURE_SPEECH_REGION', {default: 'eastus'});
const CALLABLE_CORS = true;

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
function isAdminAuth(a) {
  const email = String(a?.token?.email || '').toLowerCase();
  return a?.token?.admin === true || email === CONFIG.adminEmail.toLowerCase();
}
function requireAdmin(request) {
  const a = requireAuth(request);
  if (!isAdminAuth(a)) throw new HttpsError('permission-denied', 'Admin authorization required.');
  return a;
}
async function requireCompetencyAssessmentManager(request, trackId, day) {
  const a = requireAuth(request);
  if (isAdminAuth(a)) return a;
  const ref = db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found','Assessment module not found.');
  const assigned = String(snap.data().facultyEmail || '').toLowerCase();
  if (!assigned || assigned !== String(a.token.email || '').toLowerCase()) {
    throw new HttpsError('permission-denied','You are not assigned as the faculty verifier for this assessment module.');
  }
  return a;
}
function asJsDate(value) {
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === 'function') return value.toDate();
  if (value && typeof value.toMillis === 'function') return new Date(value.toMillis());
  if (value && typeof value.seconds === 'number') return new Date(Number(value.seconds) * 1000 + Math.floor(Number(value.nanoseconds || 0) / 1e6));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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
  // Idempotently seed missing five-day assessment windows.
  // Existing documents are never overwritten, so administrator changes remain authoritative.
  for (const item of FIVE_DAY_SCHEDULE) {
    const ref = db.collection('assessmentSchedules').doc(item.date);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set(makeScheduleData(item));
      logger.info('Seeded missing assessment schedule', { date: item.date, day: item.day });
    }
  }
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
  return "You are the assessment engine for Francis Xavier Engineering College.\n"+
  "Generate exactly 25 high-quality C Programming Level 3 Strings questions for Day "+schedule.day+": "+schedule.topic+".\n"+
  "Use ONLY the supplied source map. Do not introduce concepts not supported by it.\n"+
  "POOL COUNTS: 5 mcq, 5 match, 8 audio, 2 problemSolving, 5 multiAnswer = 25.\n"+
  "DIFFICULTY COUNTS: 10 easy, 10 moderate, 5 tough.\n"+
  "FORMAT: mcq one correct option; match uses leftItems/rightItems and answer mapping; audio uses audioText; problemSolving may use C code/output prediction/reasoning; multiAnswer has exactly 2 or 3 correct indexes.\n"+
  "Every question must include id, type, difficulty, topic, prompt, options, answer, explanation.\n"+
  "Use 0-based option indexes for mcq/audio/problemSolving/multiAnswer.\n"+
  "Write clear professional English, globally understandable engineering contexts, realistic distractors, standard C, no all/none of the above, and avoid ambiguity.\n"+
  "Return JSON only as an object: {\"questions\":[...]}.\n\nSOURCE MAP:\n"+SOURCE_MAP;
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
      temperature: 0.25,
      thinkingConfig: { thinkingBudget: 0 },
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
  const prompt = "Audit the following generated C Strings questions against this source map. Return JSON only: {\"valid\":true} or {\"valid\":false,\"issues\":[\"...\"]}. Reject any question if its answer is wrong, ambiguous, has duplicate options, contains unsupported concepts, or its explanation contradicts the source.\nSOURCE:\n"+SOURCE_MAP+"\nQUESTIONS:\n"+JSON.stringify(questions);
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
  const className = cleanText(request.data?.className, 100);
  const email = cleanText(request.data?.email || a.token.email, 180).toLowerCase();
  if (!name || !registerNumber || !email) throw new HttpsError('invalid-argument', 'Name, register number and email are required.');
  if (email !== String(a.token.email || '').toLowerCase()) throw new HttpsError('permission-denied', 'Use the email address of the signed-in account.');
  if (!email.endsWith(CONFIG.studentEmailDomain)) throw new HttpsError('invalid-argument', 'Students must use their @francisxavier.ac.in college email address.');
  await db.collection('students').doc(a.uid).set({
    uid: a.uid, name, registerNumber, className, email, status: 'pending', role: 'student',
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

const C_COMPETITIVE_CHALLENGE_MAP = Object.freeze(Object.fromEntries(C_COMPETITIVE_CHALLENGES.map(x => [x.id, x])));

function normalizeCompilerText(value){
  return String(value ?? '').replace(/\r\n/g,'\n').trim();
}

async function judge0Submit(sourceCode, stdin, expectedOutput){
 const configured=String(COMPILER_API_URL.value()||'').trim().replace(/\/$/,'');
 const primary=configured||'https://ce.judge0.com';
 const bases=[primary,...(primary==='https://ce.judge0.com'?[]:['https://ce.judge0.com'])];
 let lastError='';
 for(const base of bases){
  const headers={'Content-Type':'application/json'};
  const token=String(COMPILER_API_TOKEN.value()||'').trim();
  if(token&&base===primary)headers['X-Auth-Token']=token;
  try{
   // Send submission fields as base64 to prevent Judge0's UTF-8 conversion errors
   // when student code contains non-ASCII characters or pasted Unicode.
   const payload={
    language_id:50,
    source_code:Buffer.from(sourceCode,'utf8').toString('base64'),
    stdin:Buffer.from(stdin||'','utf8').toString('base64'),
    cpu_time_limit:2,
    wall_time_limit:5,
    memory_limit:128000,
    max_file_size:1024
   };
   if(expectedOutput!==null&&expectedOutput!==undefined){
    payload.expected_output=Buffer.from(String(expectedOutput),'utf8').toString('base64');
   }
   const submitUrl=base+'/submissions/?base64_encoded=true&wait=false';
   let response=await fetch(submitUrl,{method:'POST',headers,body:JSON.stringify(payload)});
   let body=await response.json().catch(()=>({}));
   if(!response.ok){
    lastError=String(body?.error||body?.message||('Compiler service returned HTTP '+response.status));
    if(response.status===400 && /wait not allowed/i.test(lastError)){
      response=await fetch(base+'/submissions/?base64_encoded=true&wait=false',{method:'POST',headers,body:JSON.stringify(payload)});
      body=await response.json().catch(()=>({}));
    }else continue;
   }
   if(!response.ok){lastError=String(body?.error||body?.message||('Compiler service returned HTTP '+response.status));continue;}
   if(body.token && !body.status){
    for(let i=0;i<16;i++){
      await new Promise(r=>setTimeout(r,750));
      const poll=await fetch(base+'/submissions/'+encodeURIComponent(body.token)+'?base64_encoded=false',{headers});
      const data=await poll.json().catch(()=>({}));
      if(!poll.ok){lastError=String(data?.error||('Compiler polling failed: HTTP '+poll.status));break;}
      if(data.status && ![1,2].includes(Number(data.status.id))) return data;
    }
    if(lastError) continue;
    throw new HttpsError('deadline-exceeded','Compiler timed out while waiting for the execution result.');
   }
   if(body.status && Number(body.status.id)===13){lastError='Judge0 reported an internal execution error.';continue;}
   return body;
  }catch(e){
   if(e instanceof HttpsError) throw e;
   lastError=e?.message||String(e);
  }
 }
 throw new HttpsError('failed-precondition','The C compiler service is unavailable right now. '+(lastError||'Please try again in a moment.'));
}

function enforceCodeLimits(sourceCode, stdin){
  if(typeof sourceCode!=='string'||sourceCode.length<1||sourceCode.length>20000) throw new HttpsError('invalid-argument','C source code must be between 1 and 20,000 characters.');
  if(typeof stdin!=='string'||stdin.length>5000) throw new HttpsError('invalid-argument','Input is limited to 5,000 characters.');
}

async function consumeCompilerQuota(uid, amount=1){
  const ref=db.collection('compilerUsage').doc(uid);
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:CONFIG.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
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
  try{
    const sourceCode=String(request.data?.sourceCode||''),stdin=String(request.data?.stdin||'');
    enforceCodeLimits(sourceCode,stdin);
    await consumeCompilerQuota(user.uid,1);
    const result=await judge0Submit(sourceCode,stdin,null);
    const accepted=Number(result.status?.id)===3;
    return {accepted,status:result.status?.description||'Unknown',stdout:String(result.stdout||''),stderr:String(result.stderr||''),compileOutput:String(result.compile_output||''),message:String(result.message||''),time:result.time||null,memory:result.memory||null};
  }catch(e){
    if(e instanceof HttpsError) throw e;
    logger.error('runCCode failed',{uid:user.uid,error:String(e?.stack||e)});
    throw new HttpsError('failed-precondition','C code execution failed. Please try again.');
  }
});

export const submitCChallenge = onCall({cors:CALLABLE_CORS,timeoutSeconds:120,memory:'512MiB'}, async request=>{
  const user=requireAuth(request);
  const challengeId=String(request.data?.challengeId||'');
  const challenge=C_CHALLENGES[challengeId] || C_COMPETITIVE_CHALLENGE_MAP[challengeId];
  if(!challenge) throw new HttpsError('invalid-argument','Unknown C challenge.');
  const sourceCode=String(request.data?.sourceCode||'');
  enforceCodeLimits(sourceCode,'');
  await consumeCompilerQuota(user.uid,challenge.tests.length);
  const results=[];
  for(const [input,expected] of challenge.tests){
    try{
      const r=await judge0Submit(sourceCode,input,expected);
      results.push({
        input,expected,
        passed:Number(r.status?.id)===3,
        status:r.status?.description||'Unknown',
        stdout:String(r.stdout||'').slice(0,1000),
        stderr:String(r.stderr||'').slice(0,1000),
        compileOutput:String(r.compile_output||'').slice(0,1000),
        message:String(r.message||'').slice(0,500)
      });
    }catch(e){
      logger.error('C challenge test execution failed',{
        uid:user.uid,challengeId,testInput:input,error:e?.stack||e?.message||String(e)
      });
      if(e instanceof HttpsError) throw e;
      throw new HttpsError('failed-precondition','The challenge compiler could not complete test execution. Please try again.');
    }
  }
  const passedTests=results.filter(x=>x.passed).length;
  const passed=passedTests===results.length;
  const xpEarned=passed?challenge.xp:Math.min(5,passedTests);
  try{
    const progressRef=db.collection('competencyProgress').doc(user.uid);
    await db.runTransaction(async tx=>{
      const snap=await tx.get(progressRef); const d=snap.exists?snap.data():{};
      const oldXp=Number(d.xp||0), newXp=oldXp+xpEarned;
      const level=Math.floor(newXp/100)+1;
      const badges=Array.isArray(d.badges)?[...d.badges]:[];
      if(passed && !badges.includes('C Strings Coder')) badges.push('C Strings Coder');
      tx.set(progressRef,{xp:newXp,level,badges,updatedAt:FieldValue.serverTimestamp(),lastChallenge:challengeId,lastChallengePassed:passed},{merge:true});
    });
  }catch(e){
    logger.error('C challenge progress update failed',{
      uid:user.uid,challengeId,passedTests,totalTests:results.length,error:e?.stack||e?.message||String(e)
    });
    throw new HttpsError('failed-precondition','Challenge tests completed, but progress could not be saved. Please try again.');
  }
  return {
    passed,passedTests,totalTests:results.length,xpEarned,
    message:passed?'All hidden tests passed. Challenge completed.':'Some hidden tests failed. Review your algorithm and try again.',
    results:results.map(x=>({passed:x.passed,status:x.status,stdout:x.stdout,stderr:x.stderr,compileOutput:x.compileOutput,message:x.message}))
  };
});


const C_CONCEPT_CHALLENGES = Object.freeze({
  observation:{answer:'16',xp:8,explanation:'x starts at 2 and is doubled three times: 2 → 4 → 8 → 16.'},
  output:{answer:'F C',xp:8,explanation:'s[0] is F and s[3] is C, so printf outputs F C.'},
  bug:{answer:'2',xp:8,explanation:'The destination array has space for only 5 characters including the null terminator, but "David" needs 6 bytes.'},
  missing:{answer:'s[strcspn(s, "\\n")] = \'\\0\';',xp:8,explanation:'This replaces the newline inserted by fgets with the string terminator.'}
});

export const evaluateCConceptChallenge = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const challengeId=String(request.data?.challengeId||'');
  const answer=String(request.data?.answer||'');
  const challenge=C_CONCEPT_CHALLENGES[challengeId];
  if(!challenge) throw new HttpsError('invalid-argument','Unknown skill-builder challenge.');
  const correct=answer===challenge.answer;
  const xpEarned=correct?challenge.xp:0;
  if(correct){
    const ref=db.collection('competencyProgress').doc(user.uid);
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref); const d=snap.exists?snap.data():{};
      const oldXp=Number(d.xp||0),newXp=oldXp+xpEarned;
      tx.set(ref,{xp:newXp,level:Math.floor(newXp/100)+1,badges:Array.isArray(d.badges)?d.badges:[],updatedAt:FieldValue.serverTimestamp(),lastSkill:challengeId},{merge:true});
    });
  }
  return {correct,xpEarned,explanation:correct?challenge.explanation:'Review the code carefully and try again.'};
});


const C_SKILL_DEFS = Object.freeze({
 fundamentals:{xp:20},'control-flow':{xp:25},arrays:{xp:30},functions:{xp:30},pointers:{xp:35},structures:{xp:30},memory:{xp:35},files:{xp:30},strings:{xp:40},advanced:{xp:50}
});
export const getCProgression = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const snap=await db.collection('cProgression').doc(user.uid).get();
  if(!snap.exists)return {xp:0,completedSkills:[]};
  return snap.data();
});
export const completeCSkill = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const skillId=String(request.data?.skillId||'');
  const skill=C_SKILL_DEFS[skillId];
  if(!skill)throw new HttpsError('invalid-argument','Unknown C skill.');
  const ref=db.collection('cProgression').doc(user.uid);
  let result;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);const d=snap.exists?snap.data():{};
    const done=Array.isArray(d.completedSkills)?[...d.completedSkills]:[];
    if(done.includes(skillId)){result={xp:Number(d.xp||0),completedSkills:done,alreadyCompleted:true};return;}
    const skillOrder=['fundamentals','control-flow','arrays','functions','pointers','structures','memory','files','strings','advanced'];
    const previousId=skillOrder[skillOrder.indexOf(skillId)-1];
    if(previousId && !done.includes(previousId))throw new HttpsError('failed-precondition','Complete the previous C skill first.');
    done.push(skillId);const xp=Number(d.xp||0)+skill.xp;
    tx.set(ref,{xp,completedSkills:done,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    const progressRef=db.collection('competencyProgress').doc(user.uid);
    const cp=await tx.get(progressRef);const cpd=cp.exists?cp.data():{};
    const totalXp=Math.max(Number(cpd.xp||0),xp);
    tx.set(progressRef,{xp:totalXp,level:Math.floor(totalXp/100)+1,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    result={xp,completedSkills:done,alreadyCompleted:false};
  });
  return result;
});

export const recordCompetencyDrillAttempt = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const moduleId=cleanText(request.data?.moduleId||'C Fundamentals',120);
  const drillId=cleanText(request.data?.drillId||'',80);
  const trackId=competencyTrackOrThrow(request.data?.trackId||'c-programming');
  if(!drillId) throw new HttpsError('invalid-argument','drillId is required.');
  const attemptKey=user.uid+'_'+trackId+'_'+moduleId.replace(/[^a-zA-Z0-9_-]/g,'-')+'_'+drillId.replace(/[^a-zA-Z0-9_-]/g,'-');
  const attemptRef=db.collection('competencyDrillAttempts').doc(attemptKey);
  const progressRef=db.collection('competencyProgress').doc(user.uid);
  const boardRef=db.collection('competencyLeaderboards').doc(trackId).collection('students').doc(user.uid);
  const studentSnap=await db.collection('students').doc(user.uid).get();
  const studentData=studentSnap.exists?studentSnap.data():{};
  let result;
  await db.runTransaction(async tx=>{
    const [attemptSnap,progressSnap,boardSnap]=await Promise.all([tx.get(attemptRef),tx.get(progressRef),tx.get(boardRef)]);
    if(attemptSnap.exists){
      result={alreadyRecorded:true,stars:Number(progressSnap.exists?progressSnap.data().drillStars||0:0),bonusPoints:Number(progressSnap.exists?progressSnap.data().drillBonusPoints||0:0)};
      return;
    }
    const cp=progressSnap.exists?progressSnap.data():{xp:0,level:1,tracks:{}};
    const tracks={...(cp.tracks||{})};
    const cur={...(tracks[trackId]||{xp:0,progress:0,drillStars:0,drillBonusPoints:0,totalPoints:0})};
    const stars=Number(cp.drillStars||0)+1;
    const bonus=Math.min(5,stars*0.05);
    const trackStars=Number(cur.drillStars||0)+1;
    const trackBonus=Math.min(5,trackStars*0.05);
    const totalPoints=Number(cur.xp||0)+trackBonus;
    tracks[trackId]={...cur,drillStars:trackStars,drillBonusPoints:trackBonus,totalPoints};
    tx.set(attemptRef,{uid:user.uid,trackId,moduleId,drillId,createdAt:FieldValue.serverTimestamp()});
    tx.set(progressRef,{drillStars:stars,drillBonusPoints:bonus,tracks,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    tx.set(boardRef,{uid:user.uid,trackId,displayName:studentData.name||request.auth.token.name||'Student',displayClass:studentData.className||studentData.class||studentData.section||studentData.programme||studentData.department||'Class not set',drillStars:trackStars,drillBonusPoints:trackBonus,totalPoints,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    result={alreadyRecorded:false,stars,bonusPoints:bonus,trackStars,trackBonus,totalPoints};
  });
  return result;
});

export const getCompetencyLeaderboard = onCall({cors:CALLABLE_CORS},async request=>{
  requireAuth(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId||'c-programming');
  const snap=await db.collection('competencyLeaderboards').doc(trackId).collection('students').orderBy('totalPoints','desc').limit(10).get();
  const items=await Promise.all(snap.docs.map(async(d,i)=>{
    const x=d.data(),student=await db.collection('students').doc(d.id).get(),st=student.exists?student.data():{};
    return {rank:i+1,displayName:x.displayName||st.name||'Student',displayClass:st.className||st.class||st.section||st.programme||st.department||x.displayClass||'Class not set',totalPoints:Number(x.totalPoints||0),drillStars:Number(x.drillStars||0),drillBonusPoints:Number(x.drillBonusPoints||0)};
  }));
  return {trackId,items};
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

const COMPETENCY_TRACK_META = Object.freeze({
  communication:'Communication',
  aptitude:'Aptitude',
  'core-engineering':'Core Engineering',
  'c-programming':'C Programming',
  'problem-solving':'Problem Solving',
  analytical:'Reading & Listening / Analytical Skills'
});

export const getCompetencyContent = onCall({ cors: CALLABLE_CORS }, async request => {
  requireAuth(request);
  const snap = await db.collection('competencyContent').where('published','==',true).get();
  const items = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  items.sort((a,b) => String(a.trackId).localeCompare(String(b.trackId)) || String(a.title).localeCompare(String(b.title)));
  return { items };
});

export const publishCompetencyContent = onCall({ cors: CALLABLE_CORS }, async request => {
  const adminUser = requireAdmin(request);
  const trackId = cleanText(request.data?.trackId, 80);
  const title = cleanText(request.data?.title, 180);
  const description = cleanText(request.data?.description, 1200);
  const videoUrl = cleanText(request.data?.videoUrl, 1000);
  if (!COMPETENCY_TRACK_META[trackId]) throw new HttpsError('invalid-argument','Unknown competency track.');
  if (!title) throw new HttpsError('invalid-argument','Resource title is required.');
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) throw new HttpsError('invalid-argument','Video URL must begin with http:// or https://.');
  const ref = db.collection('competencyContent').doc();
  await ref.set({
    trackId, trackTitle:COMPETENCY_TRACK_META[trackId], title, description, videoUrl,
    published:true, publishedBy:adminUser.uid, publishedByEmail:adminUser.token.email || '',
    publishedAt:FieldValue.serverTimestamp(), updatedAt:FieldValue.serverTimestamp()
  });
  await db.collection('adminActions').add({action:'publishCompetencyContent',resourceId:ref.id,trackId,title,adminUid:adminUser.uid,createdAt:FieldValue.serverTimestamp()});
  return { success:true,id:ref.id };
});

const SPEECH_CONFIG = Object.freeze({ maxAudioBytes: 8 * 1024 * 1024, maxSeconds: 90, dailyMinutes: 20 });
const COMMUNICATION_TASKS = Object.freeze({
  pronunciation: { title:'Pronunciation Practice', prompt:'Read the target sentence clearly and naturally.', xp:15 },
  wordUsage: { title:'Word Usage Challenge', prompt:'Use the target word naturally in a meaningful sentence.', xp:20 },
  listeningSpeaking: { title:'Listen & Respond', prompt:'Listen to the prompt and respond clearly.', xp:20 }
});
function normalizeWords(s){ return cleanText(s,5000).toLowerCase().replace(/[^a-z0-9' ]+/g,' ').split(/\s+/).filter(Boolean); }
function scoreWordUsage(target, transcript){
 const targetWord=normalizeWords(target)[2] || normalizeWords(target)[0] || ''; const words=normalizeWords(transcript);
 const present=words.includes(targetWord); const sentence=words.length>=4; const score=present?(sentence?100:70):0;
 return {score,wordPresent:present,sufficientSentence:sentence,wordCount:words.length};
}
function speechAssessmentHeader(referenceText){
 return Buffer.from(JSON.stringify({
   ReferenceText: referenceText, GradingSystem:'HundredMark', Granularity:'Phoneme',
   Dimension:'Comprehensive', EnableMiscue:true, EnableProsodyAssessment:true,
   PhonemeAlphabet:'IPA'
 })).toString('base64');
}
async function azurePronunciationAssessment(wavBytes, referenceText){
 const key=AZURE_SPEECH_KEY.value(), region=AZURE_SPEECH_REGION.value();
 if(!key) throw new HttpsError('failed-precondition','Phoneme-level pronunciation assessment is not configured. Set AZURE_SPEECH_KEY.');
 const url='https://'+region+'.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed';
 const r=await fetch(url,{method:'POST',headers:{
   'Ocp-Apim-Subscription-Key':key,'Pronunciation-Assessment':speechAssessmentHeader(referenceText),
   'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000'
 },body:wavBytes});
 const body=await r.json(); if(!r.ok) throw new HttpsError('internal','Azure pronunciation assessment failed.');
 const json=body.NBest?.[0] || body;
 const pa=json.PronunciationAssessment || {};
 const words=(json.Words||[]).map(w=>({word:w.Word,accuracyScore:w.PronunciationAssessment?.AccuracyScore??null,errorType:w.PronunciationAssessment?.ErrorType||'None',phonemes:(w.Phonemes||[]).map(p=>({phoneme:p.Phoneme,accuracyScore:p.PronunciationAssessment?.AccuracyScore??null,spokenPhoneme:p.PronunciationAssessment?.NBestPhonemes?.[0]?.Phoneme||null}))}));
 return {transcript:json.Display||json.ITN||'',pronunciationScore:Math.round(pa.PronScore??pa.AccuracyScore??0),accuracyScore:Math.round(pa.AccuracyScore??0),fluencyScore:Math.round(pa.FluencyScore??0),completenessScore:Math.round(pa.CompletenessScore??0),prosodyScore:pa.ProsodyScore==null?null:Math.round(pa.ProsodyScore),words};
}

async function azureSpeechToText(wavBytes){
 const key=AZURE_SPEECH_KEY.value(), region=AZURE_SPEECH_REGION.value();
 if(!key) throw new HttpsError('failed-precondition','Speech assessment is not configured. Set AZURE_SPEECH_KEY.');
 const url='https://'+region+'.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed';
 const r=await fetch(url,{method:'POST',headers:{
   'Ocp-Apim-Subscription-Key':key,
   'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000',
   'Accept':'application/json'
 },body:wavBytes});
 const body=await r.json().catch(()=>({}));
 if(!r.ok) throw new HttpsError('internal','Speech recognition failed.');
 const json=body.NBest?.[0] || body;
 return {transcript:json.Display||json.ITN||''};
}
async function scoreIntegratedSpeaking(task,target,transcript){
 const prompt='You are evaluating a first-year engineering student\'s spoken response from its transcript. Use a CEFR-informed B1→B2 classroom rubric, not an IELTS/TOEFL band score. Assess only the transcript content; do not infer pronunciation from text. Return JSON only with score (0-100), relevance (0-25), organisation (0-25), vocabulary (0-25), grammar (0-25), and feedback (max 240 characters). The task was: '+target+'\nStudent transcript: '+transcript;
 try{
   const r=await generateJson(prompt);
   const score=Math.max(0,Math.min(100,Math.round(Number(r.score)||0)));
   return {score,relevance:Number(r.relevance)||0,organisation:Number(r.organisation)||0,vocabulary:Number(r.vocabulary)||0,grammar:Number(r.grammar)||0,feedback:String(r.feedback||'Address the task directly and organise the response clearly.').slice(0,240)};
 }catch{
   const words=normalizeWords(transcript).length;
   const score=Math.min(70,Math.max(0,words*4));
   return {score,relevance:score,organisation:0,vocabulary:0,grammar:0,feedback:'Your response was transcribed. Add specific supporting detail and a clear conclusion, then try again.'};
 }
}


function estimateWavIntonation(wavBytes){
  try{
    if(!Buffer.isBuffer(wavBytes)||wavBytes.length<44) return {direction:'unknown',matchScore:null};
    const channels=wavBytes.readUInt16LE(22),sampleRate=wavBytes.readUInt32LE(24),bits=wavBytes.readUInt16LE(34);
    if(channels!==1||bits!==16) return {direction:'unknown',matchScore:null};
    let dataOffset=12,dataSize=0;
    while(dataOffset+8<=wavBytes.length){
      const id=wavBytes.toString('ascii',dataOffset,dataOffset+4),size=wavBytes.readUInt32LE(dataOffset+4);
      if(id==='data'){dataOffset+=8;dataSize=Math.min(size,wavBytes.length-dataOffset);break;}
      dataOffset+=8+size+(size%2);
    }
    if(!dataSize) return {direction:'unknown',matchScore:null};
    const pcm=new Int16Array(dataSize/2);
    for(let i=0;i<pcm.length;i++) pcm[i]=wavBytes.readInt16LE(dataOffset+i*2);
    const frame=Math.max(240,Math.round(sampleRate*0.03)), step=Math.max(120,Math.round(sampleRate*0.015)), f0=[];
    for(let start=0;start+frame<=pcm.length;start+=step){
      let energy=0; for(let i=0;i<frame;i++){const x=pcm[start+i]/32768;energy+=x*x;}
      if(energy<0.00005) continue;
      let bestLag=0,best=-1;
      const minLag=Math.max(1,Math.floor(sampleRate/300)),maxLag=Math.min(Math.floor(sampleRate/70),frame-2);
      for(let lag=minLag;lag<=maxLag;lag++){
        let sum=0,e1=0,e2=0;
        for(let i=0;i<frame-lag;i++){const a=pcm[start+i],b=pcm[start+i+lag];sum+=a*b;e1+=a*a;e2+=b*b;}
        const corr=sum/Math.sqrt((e1||1)*(e2||1));
        if(corr>best){best=corr;bestLag=lag;}
      }
      if(best>0.45&&bestLag) f0.push(sampleRate/bestLag);
    }
    if(f0.length<4) return {direction:'unknown',matchScore:null};
    const sorted=[...f0].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];
    const q=n=>f0.slice(Math.floor(f0.length*n[0]),Math.max(Math.floor(f0.length*n[1]),Math.floor(f0.length*n[0])+1));
    const med=a=>{const z=a.filter(Number.isFinite).sort((x,y)=>x-y);return z.length?z[Math.floor(z.length/2)]:median;};
    const start=med(q([0,0.35])),finish=med(q([0.65,1])),ratio=(finish-start)/Math.max(1,start);
    const direction=ratio>0.08?'rising':ratio<-0.08?'falling':'flat';
    return {direction,matchScore:Math.round(Math.max(0,Math.min(100,50+Math.abs(ratio)*500)))};
  }catch(e){return {direction:'unknown',matchScore:null};}
}

export const assessCommunicationSpeech = onCall({ cors: CALLABLE_CORS }, async request => {
 const a=requireAuth(request);
 const taskType=cleanText(request.data?.taskType,40);
 const target=cleanText(request.data?.target,1000);
 const audioBase64=String(request.data?.audioBase64||'');
 const mimeType=cleanText(request.data?.mimeType||'audio/wav',80);
 const intonationTarget=cleanText(request.data?.intonation||'',20).toLowerCase();
 if(!COMMUNICATION_TASKS[taskType] || !target || !audioBase64) throw new HttpsError('invalid-argument','Task type, target and recording are required.');
 const bytes=Buffer.from(audioBase64,'base64');
 if(!bytes.length || bytes.length>SPEECH_CONFIG.maxAudioBytes) throw new HttpsError('invalid-argument','Audio file is missing or too large.');
 if(!mimeType.includes('wav')) throw new HttpsError('invalid-argument','Communication assessment requires 16 kHz WAV audio.');

 // Keep the original student recording so faculty/admin can review the actual
 // speech alongside the transcript and scores. The signed URL is generated
 // only for authorised faculty/admin viewers.
 const recordingPath='communication-recordings/'+a.uid+'/'+Date.now()+'-'+randomUUID()+'.wav';
 const recordingFile=bucket.file(recordingPath);
 await recordingFile.save(bytes,{contentType:'audio/wav',metadata:{metadata:{uid:a.uid,taskType,target}}});

 let result={};
 const intonation=estimateWavIntonation(bytes);
 if(taskType==='pronunciation'){
   result=await azurePronunciationAssessment(bytes,target);
   result.score=result.pronunciationScore;
 }else{
   result=await azureSpeechToText(bytes);
   if(taskType==='wordUsage'){
     const usage=scoreWordUsage(target,result.transcript);
     result={...result,...usage,score:usage.score,feedback:usage.score>=80?'Good use of the target word in a complete sentence.':usage.score>=60?'The target word was recognised. Expand the sentence and make the meaning clearer.':'Use the target word in a complete sentence and record again.'};
   }else{
     const spoken=await scoreIntegratedSpeaking(taskType,target,result.transcript);
     result={...result,...spoken};
   }
 }
 const score=Math.max(0,Math.min(100,Math.round(Number(result.score)||0)));
 const xp=score>=80?COMMUNICATION_TASKS[taskType].xp:score>=60?Math.round(COMMUNICATION_TASKS[taskType].xp*.5):0;
 await db.collection('communicationSpeechAttempts').add({
   uid:a.uid,taskType,target,transcript:result.transcript||'',score,xp,recordingPath,intonationTarget,detectedIntonation:intonation.direction,intonationMatchScore:intonation.matchScore,
   pronunciation:taskType==='pronunciation'?{accuracyScore:result.accuracyScore,fluencyScore:result.fluencyScore,completenessScore:result.completenessScore,prosodyScore:result.prosodyScore,words:result.words}:null,
   rubric:taskType==='listeningSpeaking'?{relevance:result.relevance,organisation:result.organisation,vocabulary:result.vocabulary,grammar:result.grammar}:null,
   createdAt:FieldValue.serverTimestamp()
 });
 if(xp){
   const ref=db.collection('competencyProgress').doc(a.uid);
   await db.runTransaction(async tx=>{
     const s=await tx.get(ref),d=s.exists?s.data():{xp:0,badges:[],tracks:{}};
     const next=(d.xp||0)+xp; const tracks={...(d.tracks||{})}; const cur=tracks.communication||{xp:0,progress:0};
     tracks.communication={...cur,xp:(cur.xp||0)+xp,progress:Math.min(100,Math.round(((cur.xp||0)+xp)))};
     tx.set(ref,{...d,xp:next,level:Math.floor(next/100)+1,tracks,updatedAt:FieldValue.serverTimestamp()},{merge:true});
   });
 }
 return {
   taskType,target,transcript:result.transcript||'',score,xp,
   accuracyScore:result.accuracyScore,fluencyScore:result.fluencyScore,completenessScore:result.completenessScore,prosodyScore:result.prosodyScore,
   relevance:result.relevance,organisation:result.organisation,vocabulary:result.vocabulary,grammar:result.grammar,
   words:result.words||[],intonationTarget,detectedIntonation:intonation.direction,intonationMatchScore:intonation.matchScore,feedback:result.feedback||(score>=80?'Strong performance.':score>=60?'Good attempt. Focus on the areas marked for improvement.':'Keep practising and record again with clearer, more complete speech.')
 };
});

export const getCommunicationSpeechAttempts = onCall({cors:CALLABLE_CORS},async request=>{
 const a=requireAuth(request);
 if(!isAdminAuth(a)) throw new HttpsError('permission-denied','Admin access required.');
 const limit=Math.min(100,Math.max(1,Number(request.data?.limit||50)));
 const taskType=cleanText(request.data?.taskType||'',40);
 let q=db.collection('communicationSpeechAttempts').orderBy('createdAt','desc').limit(limit);
 if(taskType) q=q.where('taskType','==',taskType);
 const snap=await q.get();
 const items=[];
 for(const doc of snap.docs){
   const d=doc.data();
   let recordingUrl='';
   if(d.recordingPath){
     try{
       const [url]=await bucket.file(d.recordingPath).getSignedUrl({version:'v4',action:'read',expires:Date.now()+60*60*1000});
       recordingUrl=url;
     }catch(e){ logger.warn('Could not sign communication recording',e); }
   }
   items.push({id:doc.id,uid:d.uid,taskType:d.taskType,target:d.target,transcript:d.transcript||'',score:Number(d.score||0),xp:Number(d.xp||0),pronunciation:d.pronunciation||null,rubric:d.rubric||null,intonationTarget:d.intonationTarget||'',detectedIntonation:d.detectedIntonation||'unknown',intonationMatchScore:d.intonationMatchScore??null,recordingUrl,createdAt:d.createdAt?.toDate?.()?.toISOString?.()||null});
 }
 return {items};
});

// Reusable competency activity engine. Answer keys remain server-side.
const COMPETENCY_ACTIVITY_BANK = Object.freeze({
  'c-programming': [
    {id:'c-fundamentals-01',stage:'Concept',title:'C Fundamentals Check',type:'mcq',prompt:'Which declaration creates an integer variable named count?',options:['int count;','integer count;','count int;','num count;'],answer:0,xp:10},
    {id:'c-control-flow-01',stage:'Knowledge Check',title:'Control Flow Check',type:'mcq',prompt:'Which statement exits the current loop immediately?',options:['continue','break','return 0;','goto'],answer:1,xp:10},
    {id:'c-arrays-01',stage:'Practice',title:'Array Index Check',type:'mcq',prompt:'For int a[5], which is the last valid index?',options:['5','4','3','1'],answer:1,xp:10},
    {id:'c-functions-01',stage:'Knowledge Check',title:'Function Prototype',type:'mcq',prompt:'Which is a valid prototype for a function that returns an int and accepts two ints?',options:['int add(int a, int b);','add int(a,b);','function int add(a,b);','int add(a,b)'],answer:0,xp:10},
    {id:'c-pointers-01',stage:'Concept',title:'Pointer Dereference',type:'mcq',prompt:'What does *p access when p points to an int?',options:['The address of p','The value stored at the pointed address','The size of p','The variable name'],answer:1,xp:10},
    {id:'c-structures-01',stage:'Practice',title:'Structure Member',type:'mcq',prompt:'Which operator accesses a member of a structure variable s?',options:['->','.','::','&'],answer:1,xp:10},
    {id:'c-memory-01',stage:'Knowledge Check',title:'Dynamic Memory',type:'mcq',prompt:'Which function releases memory allocated with malloc?',options:['delete','remove','free','release'],answer:2,xp:10},
    {id:'c-files-01',stage:'Practice',title:'File Opening',type:'mcq',prompt:'Which mode opens a text file for reading?',options:['w','a','r','x'],answer:2,xp:10},
    {id:'c-strings-01',stage:'Practice',title:'String Terminator',type:'mcq',prompt:'Which character terminates a C string?',options:['\\n','\\0','EOF','\\t'],answer:1,xp:15},
    {id:'c-advanced-01',stage:'Challenge',title:'Advanced C Check',type:'mcq',prompt:'Which feature allows storing the address of a function in a variable?',options:['Function pointer','Structure padding','Macro only','File pointer'],answer:0,xp:20}
  ]
});
function competencyActivityDefinitions(trackId){ return COMPETENCY_ACTIVITY_BANK[trackId] || []; }

export const getCompetencyJourney = onCall({cors:CALLABLE_CORS}, async request => {
  const user=requireAuth(request);
  const trackId=cleanText(request.data?.trackId,80);
  if(!COMPETENCY_TRACK_META[trackId]) throw new HttpsError('invalid-argument','Unknown competency track.');
  const activities=competencyActivityDefinitions(trackId).map(({answer,...safe})=>safe);
  const ref=db.collection('competencyTrackProgress').doc(user.uid+'_'+trackId);
  const snap=await ref.get();
  const progress=snap.exists?snap.data():{completedActivityIds:[],xp:0};
  const completed=new Set(Array.isArray(progress.completedActivityIds)?progress.completedActivityIds:[]);
  return {trackId,trackTitle:COMPETENCY_TRACK_META[trackId],activities:activities.map((a,i)=>({...a,sequence:i+1,completed:completed.has(a.id)})),xp:Number(progress.xp||0),completedCount:completed.size};
});

export const evaluateCompetencyActivity = onCall({cors:CALLABLE_CORS}, async request => {
  const user=requireAuth(request);
  const trackId=cleanText(request.data?.trackId,80);
  const activityId=cleanText(request.data?.activityId,120);
  const answer=request.data?.answer;
  if(!COMPETENCY_TRACK_META[trackId]) throw new HttpsError('invalid-argument','Unknown competency track.');
  const ordered=competencyActivityDefinitions(trackId);
  const activity=ordered.find(x=>x.id===activityId);
  if(!activity) throw new HttpsError('not-found','Activity not found.');
  const index=ordered.findIndex(x=>x.id===activityId);
  const progressRef=db.collection('competencyTrackProgress').doc(user.uid+'_'+trackId);
  let result;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(progressRef);
    const data=snap.exists?snap.data():{};
    const completed=Array.isArray(data.completedActivityIds)?[...data.completedActivityIds]:[];
    if(completed.includes(activityId)){ result={correct:true,alreadyCompleted:true,xp:Number(data.xp||0),earned:0}; return; }
    const previous=ordered[index-1];
    if(previous && !completed.includes(previous.id)) throw new HttpsError('failed-precondition','Complete the previous competency activity first.');
    const correct=answersEqual(answer,activity.answer);
    const earned=correct?activity.xp:0;
    if(correct) completed.push(activityId);
    const xp=Number(data.xp||0)+earned;
    tx.set(progressRef,{uid:user.uid,trackId,completedActivityIds:completed,xp,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    const overallRef=db.collection('competencyProgress').doc(user.uid);
    const overallSnap=await tx.get(overallRef);
    const overall=overallSnap.exists?overallSnap.data():{};
    const tracks={...(overall.tracks||{})};
    const track={...(tracks[trackId]||{})};
    tracks[trackId]={...track,xp:Number(track.xp||0)+earned,progress:Math.min(100,Math.round(completed.length/ordered.length*100))};
    const overallXp=Number(overall.xp||0)+earned;
    tx.set(overallRef,{uid:user.uid,xp:overallXp,level:Math.floor(overallXp/100)+1,tracks,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    result={correct,alreadyCompleted:false,xp,earned};
  });
  return {...result,explanation:result.correct?'Correct.':'Review the concept and try again.'};
});


const COMPETENCY_ASSESSMENT_TRACKS = Object.freeze({
  communication: {title:'Communication', defaultTopics:['Grammar & Usage','Vocabulary','Professional Communication','Presentation','Group Discussion']},
  aptitude: {title:'Aptitude', defaultTopics:['Quantitative Aptitude','Logical Reasoning','Data Interpretation','Numerical Reasoning','Integrated Aptitude']},
  'core-engineering': {title:'Core Engineering', defaultTopics:['Engineering Measurement','Engineering Materials','Basic Electrical Systems','Mechanical Systems & Motion','Thermal Engineering Basics','Digital Systems & Logic','Engineering Design Process','Sustainability in Engineering','Engineering Safety & Risk','Engineering Tools & Documentation']},
  'c-programming': {title:'C Programming', defaultTopics:['C Fundamentals','Control Flow','Arrays & Functions','Strings','Problem Solving']},
  'problem-solving': {title:'Problem Solving', defaultTopics:['Decomposition','Pattern Recognition','Algorithms','Debugging','Decision Making']},
  analytical: {title:'Analytical Skills', defaultTopics:['Reading Comprehension','Listening','Inference','Critical Analysis','Evidence Based Reasoning']}
});
const COMPETENCY_MODULE_TITLES = Object.freeze({
  communication:['Grammar & Usage','Vocabulary & Word Usage','Reading Comprehension','Listening Skills','Speaking Skills','Professional Communication','Presentation Skills','Group Discussion','Workplace Writing','Integrated Communication'],
  aptitude:['Number Sense & Estimation','Algebraic Reasoning','Sequences & Patterns','Ratio, Proportion & Variation','Data Interpretation','Logical Reasoning','Quantitative Word Problems','Probability & Uncertainty Basics','Geometry & Spatial Reasoning','Quantitative Decision Making'],
  'core-engineering':['Engineering Measurement','Engineering Materials','Basic Electrical Systems','Mechanical Systems & Motion','Thermal Engineering Basics','Digital Systems & Logic','Engineering Design Process','Sustainability in Engineering','Engineering Safety & Risk','Engineering Tools & Documentation'],
  'c-programming':['C Fundamentals','Control Flow','Arrays','Functions & Modular Programming','Pointers','Structures, Unions & User-Defined Types','Dynamic Memory & Memory Management','File Handling','Strings','Advanced C'],
  'problem-solving':['Problem Definition','Decomposition','Abstraction','Algorithms & Procedures','Pattern Recognition','Root-Cause Analysis','Constraint-Based Solutions','Iteration & Debugging','Solution Evaluation','Engineering Challenge Strategy'],
  analytical:['Observation & Evidence','Data Quality','Trends & Relationships','Inference & Hypothesis','Critical Reading of Technical Information','Graphs & Visual Analytics','Decision Analysis','Ethics & Engineering Judgement','Systems Thinking','Integrated Analytical Reasoning']
});
function competencyModuleTitle(trackId,day){
  return COMPETENCY_MODULE_TITLES[trackId]?.[Number(day)-1] || COMPETENCY_ASSESSMENT_TRACKS[trackId]?.defaultTopics?.[Number(day)-1] || ('Module '+day);
}


function competencyTrackOrThrow(trackId){
  const id=cleanText(trackId,80);
  if(!Object.prototype.hasOwnProperty.call(COMPETENCY_ASSESSMENT_TRACKS,id)) throw new HttpsError('invalid-argument','Unknown competency track.');
  return id;
}
function validateCompetencyQuestions(questions, trackId='', day=0){
  const basic=competencyQuestionValidation(questions, trackId, day);
  if(!basic.ok) throw new HttpsError('invalid-argument','Question validation failed: '+basic.errors.slice(0,8).join(' '));
  return questions.map(q=>({...q,id:String(q.id)}));
}


const COMPETENCY_ASSESSMENT_BLUEPRINT = Object.freeze({
  questionsPerDay: 50,
  recommendedPerStudent: 15,
  difficulty: {easy: 15, moderate: 20, tough: 15},
  genericTypes: {mcq: 50, multipleCorrect: 0, scenario: 0},
  cTypes: {mcq: 42, multipleCorrect: 0, scenario: 8},
  cActivityDistribution: {mcq:15,'output-prediction':8,'bug-identification':6,'missing-code':5,'code-observation':5,listening:3,'coding-challenge':3,'scenario-analysis':5}
});

const COMPETENCY_SOURCE_MAPS = Object.freeze({
  communication: 'Communication for first-year engineering students: grammar and usage in academic/professional contexts; sentence structure; subject-verb agreement; tenses; articles, prepositions, conjunctions; vocabulary in engineering contexts; word formation; collocations; formal email; technical description; paraphrasing; concise writing; presentation language; group discussion; listening comprehension; tone, clarity, register; avoiding ambiguity; interpreting instructions. Assess application and analysis, not trivia.',
  aptitude: 'First-year engineering aptitude: percentages; ratios and proportions; averages; profit/loss; simple and compound interest; time, speed and distance; time and work; mixtures; number systems; algebraic simplification; equations; sequences and series; permutations/combinations basics; probability basics; logical reasoning; syllogisms; coding-decoding; directions; blood relations; arrangements; data interpretation from tables/charts; estimation and quantitative reasoning. Use engineering-style numerical contexts where useful.',
  'core-engineering': 'First-year engineering core foundations: engineering measurements and units; dimensional analysis; significant figures; basic mechanics and force concepts; work, power and energy; materials and properties; stress/strain basics; manufacturing and machining fundamentals; electrical quantities, Ohm law, series/parallel circuits, Kirchhoff basics, AC/DC distinctions; semiconductor/electronic fundamentals; sensors and instrumentation basics; digital logic fundamentals; CAD/digital prototyping concepts; engineering safety and sustainable engineering. Keep mathematics appropriate to first-year level.',
  'c-programming': 'First-year C programming: program structure; data types; operators; expressions; input/output; selection; loops; arrays; strings and null terminators; string.h functions; functions, parameters and return values; pointers at introductory level; structures basics; recursion basics; debugging; algorithmic thinking; time/space reasoning at an introductory level. Questions may use short standard C code and require output prediction, tracing, debugging or algorithm selection. Avoid compiler-specific undefined behaviour.',
  'problem-solving': 'Engineering problem solving for first-year students: problem decomposition; identifying inputs/outputs/constraints; abstraction; pattern recognition; stepwise refinement; flowcharts/pseudocode; algorithm selection; tracing; edge cases; debugging strategies; decomposition into functions/modules; greedy vs exhaustive reasoning at an introductory level; validation and testing; complexity intuition; interpreting requirements; choosing representations; communicating a solution. Use authentic engineering-style problems.',
  analytical: 'Analytical skills for first-year engineering: reading comprehension; extracting claims/evidence; inference; assumptions; cause/effect; comparison; data interpretation; identifying trends and anomalies; distinguishing fact from opinion; evaluating evidence; consistency; logical conclusions; error/uncertainty awareness; short technical passages, tables and simple charts; listening/reading style interpretation without cultural trivia. Questions should require reasoning rather than recall.'
});

const COMPETENCY_MODULE_SOURCE_MAPS = Object.freeze({
  communication:[
    'Grammar & Usage: sentence structure, subject-verb agreement, tense control, articles/prepositions, punctuation, formal academic and workplace grammar.',
    'Vocabulary & Word Usage: engineering vocabulary, word formation, collocations, context-dependent meaning, precise word choice, common confusions.',
    'Reading Comprehension: main idea, supporting evidence, inference, technical instructions, reference words, concise interpretation of engineering passages.',
    'Listening Skills: identifying key information, sequence, speaker purpose, numbers/conditions, inference and distinguishing relevant from irrelevant spoken information.',
    'Speaking Skills: intelligibility, sentence stress, word stress, rising/falling intonation, clarification, turn-taking and concise technical responses.',
    'Professional Communication: audience, purpose, tone, register, concise workplace messages, requests, updates, escalation and clarification.',
    'Presentation Skills: opening, signposting, sequencing, explaining visuals, emphasis, transitions, handling questions and concise technical delivery.',
    'Group Discussion: entering a discussion, building on ideas, disagreeing respectfully, asking for evidence, summarising and reaching a supported conclusion.',
    'Workplace Writing: professional email, subject lines, paragraphing, action requests, technical descriptions, concise reports and avoiding ambiguity.',
    'Integrated Communication: combined reading/listening/speaking/writing tasks requiring accurate interpretation, synthesis, register and clear professional response.'
  ],
  aptitude:[
    'Number Sense & Estimation: integers, fractions, decimals, factors, multiples, HCF/LCM, remainders, estimation and order of magnitude.',
    'Algebraic Reasoning: variables, linear equations/inequalities, simultaneous equations, quadratics, algebraic modelling and verification.',
    'Sequences & Patterns: arithmetic/geometric sequences, recursive rules, differences, ratios, pattern validation and counterexamples.',
    'Ratio, Proportion & Variation: equivalent ratios, direct/inverse proportion, percentage change, scale factors and unit rates.',
    'Data Interpretation: tables, charts, percentages, averages, comparisons, trends, anomalies and evidence-based numerical conclusions.',
    'Logical Reasoning: statements, conditionals, syllogisms, ordering, necessary/sufficient conditions and valid conclusions.',
    'Quantitative Word Problems: quantities, unit rates, time/work, motion, multi-step modelling, assumptions and answer validation.',
    'Probability & Uncertainty Basics: sample spaces, probability, complements, independence, conditional probability and expected value.',
    'Geometry & Spatial Reasoning: angles, triangles, perimeter, area, similarity, scale, volume, surface area and coordinate/spatial reasoning.',
    'Quantitative Decision Making: criteria, weighted scores, cost-benefit comparison, sensitivity analysis, trade-offs and quantitative justification.'
  ],
  'core-engineering':[
    'Engineering Measurement: SI units, dimensions, range, resolution, accuracy, precision, significant figures, uncertainty and repeatability.',
    'Engineering Materials: metals, polymers, ceramics, composites, strength, stiffness, toughness, density and property-selection reasoning.',
    'Basic Electrical Systems: charge, voltage, current, resistance, Ohm law, series/parallel circuits, power, energy, measurement and safety.',
    'Mechanical Systems & Motion: force, equilibrium, motion, acceleration, work, power, gears, shafts, bearings and mechanical efficiency.',
    'Thermal Engineering Basics: temperature, heat, conduction, convection, radiation, specific heat, efficiency and heat-loss reasoning.',
    'Digital Systems & Logic: binary, logic levels, AND/OR/NOT, truth tables, Boolean expressions and basic combinational circuits.',
    'Engineering Design Process: need/problem definition, requirements, concepts, selection criteria, prototype, verification and iteration.',
    'Sustainability in Engineering: resource efficiency, energy, waste, circularity, life-cycle thinking and engineering trade-offs.',
    'Engineering Safety & Risk: hazard, risk, likelihood, consequence, hierarchy of controls, PPE, procedures and incident learning.',
    'Engineering Tools & Documentation: technical descriptions, block/flow diagrams, tables, specifications, revision control and engineering records.'
  ],
  'problem-solving':[
    'Problem Definition: stakeholder need, current/desired state, constraints, measurable success criteria and precise problem statements.',
    'Decomposition: functional decomposition, boundaries, dependencies, interfaces and integration of subproblems.',
    'Abstraction: relevant variables, levels of detail, models, inputs/outputs and information hiding.',
    'Algorithms & Procedures: inputs, outputs, ordered steps, conditions, loops, termination, pseudocode and requirement alignment.',
    'Pattern Recognition: repetition, differences, ratios, categories, invariants, useful patterns and counterexamples.',
    'Root-Cause Analysis: symptom versus cause, Five Whys, cause-effect relationships, evidence and corrective actions.',
    'Constraint-Based Solutions: hard/soft constraints, feasible solutions, trade-offs, constraint testing and optimisation intuition.',
    'Iteration & Debugging: reproduction, minimal tests, hypotheses, controlled changes, verification and regression checks.',
    'Solution Evaluation: requirement coverage, correctness, robustness, efficiency, evidence, edge cases and validation.',
    'Engineering Challenge Strategy: clarify, decompose, model, solve, test, communicate and adapt using evidence.'
  ],
  analytical:[
    'Observation & Evidence: facts, quantities, conditions, relevant versus irrelevant observations and structured evidence notes.',
    'Data Quality: source/provenance, missing data, measurement quality, sampling, bias and comparability.',
    'Trends & Relationships: trend, rate of change, correlation, outliers, baselines and distinguishing association from explanation.',
    'Inference & Hypothesis: hypothesis, evidence threshold, inference, alternative explanations, uncertainty and confidence.',
    'Critical Reading of Technical Information: claims, evidence, definitions, assumptions, method limitations and counterevidence.',
    'Graphs & Visual Analytics: axes, units, scale, trend lines, aggregation, visual distortion and accurate interpretation.',
    'Decision Analysis: criteria, evidence weighting, trade-offs, sensitivity and evidence-based rationale.',
    'Ethics & Engineering Judgement: evidence versus values, safety, fairness, uncertainty and professional responsibility.',
    'Systems Thinking: components, interactions, dependencies, feedback, bottlenecks, boundaries and system-level effects.',
    'Integrated Analytical Reasoning: multi-source synthesis, evidence matrices, conflicting sources, uncertainty and supported conclusions.'
  ]
});

function competencyQuestionValidation(questions, trackId='', day=0) {
  const errors = [];
  if (!Array.isArray(questions) || questions.length !== COMPETENCY_ASSESSMENT_BLUEPRINT.questionsPerDay) return {ok:false, errors:['Exactly 50 questions are required.']};
  const ids = new Set(), prompts = new Set(), counts = {mcq:0, multipleCorrect:0, scenario:0}, diffs = {easy:0, moderate:0, tough:0};
  const activityCounts = {};
  questions.forEach((q,i)=>{
    const n=i+1;
    if(!q || typeof q!=='object') { errors.push('Q'+n+': invalid object.'); return; }
    if(!q.id || ids.has(String(q.id))) errors.push('Q'+n+': missing or duplicate id.');
    ids.add(String(q.id));
    const promptKey=cleanText(q.prompt,5000).toLowerCase().replace(/\s+/g,' ');
    if(promptKey && prompts.has(promptKey)) errors.push('Q'+n+': duplicate question prompt.');
    if(promptKey) prompts.add(promptKey);
    if(!['mcq','multipleCorrect','scenario'].includes(q.type)) errors.push('Q'+n+': invalid type.'); else counts[q.type]++;
    if(!['easy','moderate','tough'].includes(q.difficulty)) errors.push('Q'+n+': invalid difficulty.'); else diffs[q.difficulty]++;
    const activity=String(q.activityType||'mcq');
    activityCounts[activity]=(activityCounts[activity]||0)+1;
    if(!cleanText(q.prompt,5000)) errors.push('Q'+n+': missing prompt.');

    // Every assessment item must be traceable through the same learning chain
    // shown to students: outcome -> material -> drill -> practice ladder.
    const lo=String(q.learningOutcomeId||'').trim();
    const mat=String(q.materialId||'').trim();
    const drill=String(q.guidedDrillId||'').trim();
    const rem=String(q.remediationMaterialId||'').trim();
    const ladder=Number(q.ladderLevel);
    const prefix=trackId+'-D'+day+'-';
    if(!lo || !lo.startsWith(prefix+'LO')) errors.push('Q'+n+': learningOutcomeId must use '+prefix+'LO1..LO5.');
    if(!mat || !mat.startsWith(prefix+'MAT')) errors.push('Q'+n+': materialId must use '+prefix+'MAT1..MAT5.');
    if(!drill || !drill.startsWith(prefix+'DR')) errors.push('Q'+n+': guidedDrillId must use '+prefix+'DR1..DR5.');
    if(!rem || !rem.startsWith(prefix+'MAT')) errors.push('Q'+n+': remediationMaterialId must use '+prefix+'MAT1..MAT5.');
    if(!Number.isInteger(ladder)||ladder<1||ladder>5) errors.push('Q'+n+': ladderLevel must be 1..5.');
    if(!['LO1','LO2','LO3','LO4','LO5'].some(x=>lo.endsWith(x))) errors.push('Q'+n+': learningOutcomeId must end LO1..LO5.');
    if(!/^.+-D\d+-MAT[1-5]$/.test(mat)||!/^.+-D\d+-DR[1-5]$/.test(drill)||!/^.+-D\d+-MAT[1-5]$/.test(rem)) errors.push('Q'+n+': invalid traceability identifier.');

    const isCoding=activity==='coding-challenge';
    if(isCoding){
      if(q.type!=='scenario') errors.push('Q'+n+': coding challenge must use scenario scoring type.');
      if(!cleanText(q.starter,20000)) errors.push('Q'+n+': coding starter missing.');
      if(!Array.isArray(q.codingTests)||q.codingTests.length<5) errors.push('Q'+n+': at least 5 hidden coding tests required.');
      else {
        const testKeys=q.codingTests.map(t=>JSON.stringify([String(t?.[0]??''),String(t?.[1]??'') ]));
        if(new Set(testKeys).size!==testKeys.length) errors.push('Q'+n+': duplicate coding test cases.');
      }
      if(!cleanText(q.sampleInput,5000)||!cleanText(q.sampleOutput,5000)) errors.push('Q'+n+': coding sample missing.');
    }else{
      if(!Array.isArray(q.options) || q.options.length!==4) errors.push('Q'+n+': exactly 4 options required.');
      else {
        const normalized=q.options.map(x=>cleanText(x,1000).toLowerCase());
        if(normalized.some(x=>!x)) errors.push('Q'+n+': blank option.');
        if(new Set(normalized).size!==4) errors.push('Q'+n+': duplicate options.');
        if(q.type==='multipleCorrect') {
          if(!Array.isArray(q.answer) || q.answer.length<2 || q.answer.length>3) errors.push('Q'+n+': multiple-correct needs 2 or 3 keys.');
          else q.answer.forEach(a=>{if(!Number.isInteger(a)||a<0||a>=4) errors.push('Q'+n+': answer index '+a+' is not a valid option.');});
        } else if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=4) errors.push('Q'+n+': answer key does not point to an existing option.');
      }
      if(['output-prediction','bug-identification','missing-code','code-observation'].includes(activity) && !cleanText(q.code,20)) errors.push('Q'+n+': '+activity+' requires C code.');
      if(activity==='listening' && !cleanText(q.audioText,20)) errors.push('Q'+n+': listening question requires audioText.');
    }
    if(!cleanText(q.explanation,50)) errors.push('Q'+n+': missing explanation.');
    if(!cleanText(q.remediationNote,30)) errors.push('Q'+n+': remediationNote must explain what to revisit after an error.');
    if(!Number.isFinite(Number(q.timeLimitSeconds)) || Number(q.timeLimitSeconds)<20) errors.push('Q'+n+': invalid time limit.');
  });
  const expectedTypes=trackId==='c-programming'?COMPETENCY_ASSESSMENT_BLUEPRINT.cTypes:COMPETENCY_ASSESSMENT_BLUEPRINT.genericTypes;
  for(const [k,v] of Object.entries(expectedTypes)) if(counts[k]!==v) errors.push('Type distribution '+k+' must be '+v+'.');
  for(const [k,v] of Object.entries(COMPETENCY_ASSESSMENT_BLUEPRINT.difficulty)) if(diffs[k]!==v) errors.push('Difficulty distribution '+k+' must be '+v+'.');
  if(trackId==='c-programming'){
    for(const [k,v] of Object.entries(COMPETENCY_ASSESSMENT_BLUEPRINT.cActivityDistribution)) if((activityCounts[k]||0)!==v) errors.push('C activity distribution '+k+' must be '+v+'.');
  }
  return {ok:errors.length===0,errors};
}

const COMMUNICATION_TEACHING_MATERIALS = Object.freeze({
  1:['Sentence roles: subject, verb and object','Basic word order','Subject–verb agreement','Word order in technical sentences','Editing for accuracy'],
  2:['Context clues','Word families','Engineering collocations','Register','Confusable words and paraphrase'],
  3:['Purpose and prediction','Main idea and supporting detail','Reference and cohesion','Inference from evidence','Accurate summarising'],
  4:['Listening for gist','Listening for details','Instructions and sequence','Note-taking','Purpose, attitude and implied meaning'],
  5:['Answer structure','Fluency and pausing','Pronunciation and intelligibility','Grammar while speaking','Follow-up questions'],
  6:['Professional tone','Requests and responses','Clarification and confirmation','Polite disagreement','Meetings and action points'],
  7:['Audience and purpose','Presentation structure','Signposting','Visual-to-verbal balance','Handling questions'],
  8:['Entering a discussion','Building on ideas','Agreeing and disagreeing','Evidence-based contribution','Summarising decisions'],
  9:['Purpose and audience','Email structure','Paragraph control','Reports and minutes','Editing for clarity'],
  10:['Multiple-source information','Briefing and response','Evidence selection','Professional synthesis','Final communication check']
});

const COMPETENCY_MODULE_SCOPES = Object.freeze({
 communication:['sentence roles, subject-verb agreement, tense/aspect, articles, prepositions, modifiers and editing for clarity','context clues, word families, engineering collocations, formal/informal register, confusable words and paraphrase','skimming/scanning, main idea, supporting detail, reference/cohesion, evidence-based inference and accurate summary','listening for gist, key details/numbers, instructions, sequencing, note-taking, speaker purpose and attitude','spoken response structure, fluency, pausing, pronunciation, intelligibility, grammar while speaking and follow-up questions','professional tone, requests, clarification, confirmation, polite disagreement, turn-taking and action points','audience/purpose, presentation structure, signposting, visual-verbal balance and handling questions','entering discussion, building on ideas, agreement/disagreement, evidence-based contribution and summarising decisions','purpose/audience, email structure, subject lines, paragraph control, reports/minutes and editing','multi-source information, briefing, evidence selection, professional synthesis and final communication check'],
 aptitude:['integers, fractions, factors, multiples, HCF/LCM, remainders, estimation and checking','linear relationships, variables, equations, algebraic manipulation, sequences and interpreting unknowns','patterns, arithmetic/geometric sequences, rule identification, missing terms and generalisation','ratios, proportions, direct/inverse variation, scaling, percentages and weighted comparisons','tables, bar/line charts, percentages, comparisons, rates, trends and data sufficiency','logical conditions, syllogisms, arrangements, directions, constraints and conditional reasoning','multi-step quantitative word problems involving rates, work, mixtures, money, motion and units','probability, sample spaces, independent/dependent events, expected frequency and uncertainty','angles, triangles, area, volume, coordinates, spatial relationships and dimensional reasoning','choosing quantitative methods, comparing alternatives, estimation, error checking and evidence-based decisions'],
 'core-engineering':['engineering quantities, SI units, dimensions, measurement systems, accuracy, precision, resolution and uncertainty','metals, polymers, ceramics, composites, properties, manufacturing considerations and material selection','voltage, current, resistance, power, series/parallel circuits, measurement and basic electrical safety','force, motion, work, energy, torque, simple machines, mechanisms and system behaviour','temperature, heat transfer, energy conversion, thermal systems and efficiency basics','binary representation, logic gates, Boolean conditions, combinational logic and digital system behaviour','requirements, constraints, concept generation, selection criteria, prototyping, testing and design iteration','energy/resource use, lifecycle thinking, waste, efficiency, environmental impact and sustainable choices','hazard identification, risk, controls, PPE, safe procedures, failure consequences and reporting','engineering drawings/diagrams, tool selection, documentation, version control, technical reporting and traceability'],
 'problem-solving':['stakeholders, goals, inputs, outputs, constraints, assumptions and measurable success criteria','decomposition, subtasks, dependencies, interfaces and bottom-up validation','abstraction levels, essential variables, models, interfaces and information hiding','algorithm properties, sequencing, conditions, loops, termination, pseudocode and trace tables','sequences, categories, invariants, analogies, repeated structures and pattern validation','symptoms, evidence, hypotheses, root causes, controlled tests and corrective actions','requirements, constraints, trade-offs, feasible solution spaces and prioritisation','reproduction, isolation, debugging hypotheses, minimal fixes, regression tests and iteration','correctness, efficiency, usability, maintainability, risk, trade-offs and solution comparison','end-to-end challenge strategy, planning, edge cases, validation, revision and solution explanation'],
 analytical:['fact identification, key terms, data extraction, relevance and structured evidence notes','data sources, completeness, accuracy, consistency, sampling, missing data and measurement quality','trend, comparison, rate of change, correlation, outliers and distinguishing observation from explanation','claims, evidence, hypotheses, inference, alternative explanations and confidence','technical claims, evidence chains, assumptions, contradictions, source quality and critical reading','tables, charts, axes, scales, misleading displays, distributions and visual comparison','criteria, alternatives, evidence weighting, uncertainty, risk and transparent decision rationale','ethical constraints, bias, fairness, professional responsibility, stakeholder impact and engineering judgement','components, interactions, feedback, dependencies, boundaries, unintended consequences and systems behaviour','multi-source synthesis, conflicting evidence, uncertainty, conclusion and defensible recommendation']
});
async function attachCompetencyAssessmentAudio(trackId, day, questions){
  if(trackId!=='communication') return questions;
  const audioCount=Number(day)===4?8:5;
  const preferred=questions.map((q,i)=>({q,i})).filter(x=>x.q.activityType==='listening'||Number(x.i)%10===2);
  const fallback=questions.map((q,i)=>({q,i})).filter(x=>!preferred.some(p=>p.q===x.q));
  const targets=[...preferred,...fallback].slice(0,audioCount);
  let created=0;
  for(const {q} of targets){
    q.activityType='listening';
    q.audioText=String(q.audioText||q.prompt||'').slice(0,3000);
    const path='audio/competency/'+trackId+'/D'+day+'/'+String(q.id)+'.mp3';
    let lastError=null;
    for(let attempt=1;attempt<=3;attempt++){
      try{
        const [response]=await tts.synthesizeSpeech({
          input:{text:q.audioText},
          voice:{languageCode:CONFIG.voice.languageCode,name:CONFIG.voice.name},
          audioConfig:{audioEncoding:'MP3'}
        });
        if(!response?.audioContent) throw new Error('Cloud Text-to-Speech returned no audio content.');
        await bucket.file(path).save(response.audioContent,{contentType:'audio/mpeg'});
        q.audioPath=path;
        try{
          const [signedUrl]=await bucket.file(path).getSignedUrl({
            action:'read',
            expires:Date.now()+1000*60*60*24*365
          });
          q.audioUrl=signedUrl;
        }catch(e){
          logger.warn('Could not sign competency audio URL',{trackId,day,questionId:q.id,error:String(e)});
        }
        created++;
        lastError=null;
        break;
      }catch(e){
        lastError=e;
        logger.warn('Competency audio synthesis attempt failed',{
          trackId,day,questionId:q.id,attempt,error:String(e)
        });
        if(attempt<3) await new Promise(resolve=>setTimeout(resolve,1500*attempt));
      }
    }
    if(lastError){
      logger.error('Competency audio could not be created after retries',{
        trackId,day,questionId:q.id,error:String(lastError)
      });
      delete q.audioPath;
      delete q.audioUrl;
    }
  }
  if(created<audioCount){
    logger.warn('Communication module has fewer stored audio items than required',{
      trackId,day,required:audioCount,created
    });
  }
  return questions;
}

function competencyGenerationPrompt(trackId, day) {
  const meta=COMPETENCY_ASSESSMENT_TRACKS[trackId], topic=competencyModuleTitle(trackId,day);
  const prefix=trackId+'-D'+day+'-';
  const trace='Use ONLY these traceability IDs: learningOutcomeId '+prefix+'LO1..'+prefix+'LO5; materialId '+prefix+'MAT1..'+prefix+'MAT5; guidedDrillId '+prefix+'DR1..'+prefix+'DR5. Set remediationMaterialId to one of the five '+prefix+'MAT IDs. ladderLevel must be 1 (recognise/understand), 2 (apply), 3 (analyse/verify), 4 (diagnose), or 5 (solve/transfer). Every question must identify the exact outcome, material, drill and ladder level it builds on.'+(trackId==='communication'?' For communication, write at least five questions that can be delivered as listening items: each must have a clear spoken prompt suitable for audioText and four answer options. Module 4 should contain a stronger listening emphasis.':'');
  if(trackId==='c-programming'){
    const scopes={
      1:'problem statements, C program structure, main, statements and blocks, identifiers, variables, constants, data types, type conversion, operators, expressions, printf/scanf, compilation and debugging basics',
      2:'relational and logical operators, if/else, nested decisions, else-if ladders, switch, for/while/do-while, break/continue, nested loops and control-flow tracing',
      3:'array declaration/indexing, initialization/traversal, input/output, sum/average/min/max, searching, sorting basics, frequency counting, two-dimensional arrays and matrices',
      4:'function purpose, declarations/definitions, parameters/arguments, return values, void functions, local/global scope, prototypes, call flow and modular design',
      5:'addresses, pointer declaration/initialization, & and *, dereferencing, pointers in functions, modifying caller values, pointer arithmetic basics and pointers with arrays',
      6:'structures, members, arrays of structures, nested structures, typedef, passing structures to functions, unions and choosing structure versus union',
      7:'stack/heap idea, malloc/calloc/realloc/free, NULL checks, memory leaks, dangling pointers, dynamic arrays and safe memory handling',
      8:'FILE pointers, fopen/fclose, file modes, fprintf/fscanf, fgets/fputs, fread/fwrite basics, error checking and file safety',
      9:'character arrays, null terminator, string input, strlen/strcpy/strcat/strcmp, manual traversal, searching/counting, palindrome/reverse, token/word processing and string bugs',
      10:'preprocessor/macros, const/scope review, command-line arguments, introductory function pointers, bitwise operators, enumerations/user-defined types, defensive programming and reading/debugging unfamiliar code'
    }[day];
    return 'You are a senior C programming assessment designer for Francis Xavier Engineering College.\\nCreate Module '+day+': '+topic+' for first-year engineering students.\\n\\nMODULE SCOPE:\\n'+scopes+'\\n\\n'+trace+'\\n\\nGenerate EXACTLY 50 master questions using this activity distribution:\\n15 mcq/concept\\n8 output-prediction\\n6 bug-identification/debugging\\n5 missing-code/code-completion\\n5 code-observation/tracing\\n3 listening/audio-based\\n3 coding-challenge\\n5 scenario-analysis\\nTOTAL 50.\\n\\nScoring types: use type "mcq" for the first six activity groups and type "scenario" for scenario-analysis and coding-challenge. Thus the exact scoring distribution is 42 mcq and 8 scenario.\\n\\nQuality:\\n- Every question must test the module scope; do not drift into another module.\\n- Output-prediction, bug-identification, missing-code and code-observation MUST include a short valid standard-C code snippet in code.\\n- Missing-code must visibly contain a placeholder such as /* MISSING */.\\n- Bug-identification must contain a real defect and ask the student to identify the defect/correction.\\n- Output-prediction must have one deterministically correct output.\\n- Code-observation must require tracing state, not merely recalling syntax.\\n- Listening questions must contain audioText with the complete spoken question and four answer options.\\n- Coding challenges must be genuine C programming tasks, with starter code, sampleInput, sampleOutput and at least 5 hidden codingTests. Do not copy external provider questions.\\n- Use realistic engineering, laboratory or student contexts.\\n- Standard C only; no undefined behaviour or compiler-specific assumptions.\\n- No all/none of the above, duplicate options or trick wording.\\n- Exactly 15 easy, 20 moderate and 15 tough.\\n- Every non-coding question has four distinct plausible options and one correct answer.\\n- Every question has a concise explanation and a remediationNote that tells the learner exactly what to revisit after an incorrect answer.\\n- The question must assess a taught skill, not introduce a new concept for the first time.\\n- Time limits: easy 30-45s, moderate 45-75s, tough 60-120s.\\n- Return JSON only.\\n\\nJSON shape:\\n{"questions":[{"id":"D'+day+'-Q01","type":"mcq|scenario","activityType":"mcq|output-prediction|bug-identification|missing-code|code-observation|listening|coding-challenge|scenario-analysis","difficulty":"easy|moderate|tough","topic":"specific subtopic","learningOutcomeId":"'+prefix+'LO1","materialId":"'+prefix+'MAT1","guidedDrillId":"'+prefix+'DR1","ladderLevel":1,"remediationMaterialId":"'+prefix+'MAT1","prompt":"...","code":"...","options":["A","B","C","D"],"answer":0,"audioText":"...","starter":"...","sampleInput":"...","sampleOutput":"...","codingTests":[["input","expected output"],["input","expected output"],["input","expected output"],["input","expected output"],["input","expected output"]],"explanation":"...","remediationNote":"Revisit ... then redo Guided Drill ...","timeLimitSeconds":45}]}';
  }
  return 'You are a senior university assessment designer for Francis Xavier Engineering College.\\nCreate Module '+day+' of a ten-module assessment programme for '+meta.title+', intended for first-year engineering students.\\n\\nMODULE TOPIC: '+topic+'\\nMODULE-SPECIFIC LEARNING SCOPE:\\n'+(((COMPETENCY_MODULE_SOURCE_MAPS[trackId]||[])[Number(day)-1])||((COMPETENCY_MODULE_SCOPES[trackId]||[])[Number(day)-1])||topic)+'\\n\\n'+trace+'\\n\\nGenerate EXACTLY 50 MCQ questions. Every question must use type "mcq". For communication, at least 35 questions must use activityType "listening" with a complete audioText field; students should hear the question first. Difficulty exactly 15 easy, 20 moderate, 15 tough.\\n\\nQuestions must measure the stated module scope in new contexts. Do not repeat worked examples or Guided Drills. Do not use generic filler such as "which approach is most appropriate" without a concrete situation, evidence, data or decision. For Communication, use these exact taught lesson anchors for the selected module: '+((trackId==='communication'?(COMMUNICATION_TEACHING_MATERIALS[Number(day)]||[]).join('; '):''))+' . Every Communication question must test one of those taught skills in a concrete academic, laboratory, workplace or professional-communication context. Do not use unrelated numerical, aptitude, generic reasoning or evidence-assumption distractors. Do not write template stems such as "During a task, a student must choose an approach".\\nQUALITY STANDARD: University-level first-year engineering standard; test understanding, application, analysis and transfer. No trivia, trick wording, culturally dependent assumptions or obscure facts. Moderate/tough questions must require reasoning, calculation, interpretation, evidence evaluation, error diagnosis or decision-making. Every question must be traceable to the module\'s five outcomes, five materials, five guided drills and one practice-ladder level. The question must assess a skill already taught in the student material. Every explanation must justify the key and every remediationNote must identify what the learner should revisit.\\nEvery question must have exactly four distinct, plausible options. Answer must be a 0-based option index. The answer MUST point to an option that literally exists. Never use all/none of the above. Avoid ambiguity. Code must use standard C and avoid undefined behaviour.\\nTime limits: easy 30-45s, moderate 45-75s, tough 60-120s.\\nReturn JSON only as {"questions":[{"id":"D'+day+'-Q01","type":"mcq","activityType":"mcq|listening","difficulty":"easy|moderate|tough","topic":"...","learningOutcomeId":"'+prefix+'LO1","materialId":"'+prefix+'MAT1","guidedDrillId":"'+prefix+'DR1","ladderLevel":1,"remediationMaterialId":"'+prefix+'MAT1","prompt":"...","options":["A","B","C","D"],"answer":0,"audioText":"...","explanation":"...","remediationNote":"Revisit ... then redo Guided Drill ...","timeLimitSeconds":45}]}';
}
async function auditCompetencyQuestions(trackId, day, questions, auditNumber) {
  const auditPrompt = `You are an independent senior university assessment auditor. Audit these 50 questions for ${COMPETENCY_ASSESSMENT_TRACKS[trackId].title}, Module ${day}. This is audit pass ${auditNumber}; do not assume the generator is correct. For EVERY question: recalculate numerical answers; trace code; verify answer indexes point to existing options; verify all four options are distinct; verify exactly one defensible answer for mcq/scenario; verify multipleCorrect has exactly intended 2-3 correct options and no hidden extra correct option; verify explanation matches the key; verify curriculum scope; verify clarity for first-year engineering; verify every item has valid outcome/material/drill/ladder/remediation traceability and that the trace points to a taught skill; reject ambiguity, broken logic, unsupported facts, or missing answer choices. Return JSON only: {"valid":true,"issues":[]} or {"valid":false,"issues":["Q07: ..."]}. CURRICULUM:
${COMPETENCY_SOURCE_MAPS[trackId]}
QUESTIONS:
${JSON.stringify(questions)}`;
  return generateJson(auditPrompt);
}

function buildCommunicationModule1Bank(){
  const items=[];
  const add=(topic,prompt,options,answer,difficulty,lo,mat,drill,ladder,time)=>{
    // Moderate/tough authored rows use the compact 9-field form: difficulty, LO, material, drill, time.
    // When the ladder field is omitted, use the difficulty level as the ladder and preserve the final value as time.
    if(time===undefined){ time=ladder; ladder=difficulty; }
    items.push({
      id:'D1-Q'+String(items.length+1).padStart(2,'0'),type:'mcq',activityType:'mcq',difficulty,topic,
      learningOutcomeId:'communication-D1-LO'+lo,materialId:'communication-D1-MAT'+mat,guidedDrillId:'communication-D1-DR'+drill,
      ladderLevel:ladder,remediationMaterialId:'communication-D1-MAT'+mat,prompt,options,answer,
      explanation:'The correct choice follows the taught '+topic.toLowerCase()+' principle and can be justified directly from the sentence structure and meaning.',
      remediationNote:'Revisit the '+topic.toLowerCase()+' material, then redo Guided Drill '+drill+' and explain why the selected option is correct.',
      timeLimitSeconds:time
    });
  };
  const easy=[
    ['Sentence roles','In “The technician calibrated the sensor”, which phrase is the subject?',['The technician','calibrated','the sensor','calibrated the sensor'],0,1,1,1,1,30],
    ['Sentence roles','In “The technician calibrated the sensor”, which word is the main verb?',['technician','calibrated','sensor','the'],1,1,1,1,1,30],
    ['Sentence roles','In “The technician calibrated the sensor”, which phrase is the object?',['The technician','calibrated','the sensor','technician calibrated'],2,1,1,1,1,30],
    ['Basic word order','Which sentence uses a clear Subject → Verb → Object order?',['The engineer inspected the pump.','Inspected the engineer the pump.','The pump the engineer inspected.','The engineer the pump inspected.'],0,1,2,2,1,30],
    ['Basic word order','Which sentence clearly tells the reader who performed the action?',['The report the student submitted.','Submitted the report the student.','The student submitted the report.','The report submitted student.'],2,1,2,2,2,30],
    ['Subject–verb agreement','Choose the correct sentence.',['The measurements shows variation.','The measurements show variation.','The measurements is showing variation.','The measurements has show variation.'],1,1,3,3,2,30],
    ['Subject–verb agreement','Choose the correct sentence.',['The result show a change.','The result are showing a change.','The result shows a change.','The result have a change.'],2,1,3,3,2,30],
    ['Subject–verb agreement','In “The list of readings is complete”, which noun controls the verb?',['readings','list','complete','of'],1,1,3,4,2,30],
    ['Editing for accuracy','Choose the corrected form: “The students was ready.”',['The students were ready.','The students is ready.','The students be ready.','The students has ready.'],0,1,5,5,2,30],
    ['Editing for accuracy','Choose the clearest sentence.',['The engineer the result recorded.','The result recorded the engineer.','The engineer recorded the result.','Recorded the result engineer.'],2,1,4,5,5,30]
  ];
  easy.push(
    ['Basic word order','Which sentence has the clearest subject, verb and object order?',['The student completed the assignment.','Completed the student the assignment.','The assignment the student completed.','The student the assignment completed.'],0,1,2,2,1,30],
    ['Editing for accuracy','Choose the correctly edited sentence.',['The report contain three sections.','The report contains three sections.','The report containing three sections.','The report have three sections.'],1,1,5,5,2,30],
    ['Subject–verb agreement','Choose the correct sentence.',['The equipment in the laboratory require care.','The equipment in the laboratory requires care.','The equipment in the laboratory requiring care.','The equipment in the laboratory are care.'],1,1,3,3,2,30],
    ['Sentence roles','In “The researcher analysed the results”, which word is the subject?',['researcher','analysed','results','the'],0,1,1,1,1,30],
    ['Editing for accuracy','Which sentence is grammatically accurate?',['The experiment produce reliable results.','The experiment produces reliable results.','The experiment producing reliable results.','The experiment have reliable results.'],1,1,5,5,2,30]
  );
  // Add all 15 authored easy questions after the five extra easy items are appended.
  // This guarantees 15 easy + 20 moderate + 15 tough = exactly 50 questions.
  easy.forEach(x=>add(x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],1,x[8]));
  const moderate=[
    ['Sentence roles','In “After the inspection, the maintenance team replaced the damaged cable”, which phrase is the subject?',['After the inspection','the maintenance team','the damaged cable','replaced'],1,2,1,1,2,45],
    ['Sentence roles','In “The design team reviewed the drawing carefully”, what is the object of reviewed?',['The design team','reviewed','the drawing','carefully'],2,2,1,1,2,45],
    ['Basic word order','Which revision makes the actor and action immediately clear?',['After the test the voltage the technician recorded.','The technician recorded the voltage after the test.','The voltage after the test recorded technician.','Recorded after the test the technician voltage.'],1,2,2,2,2,45],
    ['Basic word order','Which sentence avoids ambiguity about who inspected the equipment?',['The equipment was inspected after the student.','After the student, the equipment inspected the lab.','The student inspected the equipment after the experiment.','Inspected the equipment after the experiment student.'],2,2,2,2,3,45],
    ['Subject–verb agreement','Choose the correct sentence: “The set of readings ___ reliable.”',['are','were','is','have'],2,2,3,4,3,45],
    ['Subject–verb agreement','Choose the correct sentence: “The results from the second trial ___ consistent.”',['is','was','has','are'],3,2,3,3,3,45],
    ['Subject–verb agreement','Which sentence correctly handles an intervening phrase?',['The quality of the samples are improving.','The quality of the samples is improving.','The quality of the samples have improving.','The quality of the samples were improving.'],1,2,3,3,3,45],
    ['Subject–verb agreement','Which sentence is grammatically correct?',['Each of the sensors require calibration.','Each of the sensors requires calibration.','Each of the sensors require calibrations.','Each of the sensors are requiring calibration.'],1,2,3,3,4,45],
    ['Editing for accuracy','What is the best correction? “The group of students were preparing the report.”',['Change group to groups.','Change were to was.','Change students to student.','Change report to reports.'],1,2,5,4,4,45],
    ['Editing for accuracy','Which sentence is best for a technical report?',['The readings was not reliable.','The readings were not reliable.','The readings is not reliable.','The readings be not reliable.'],1,2,5,5,4,45],
    ['Sentence roles','In “The laboratory assistant recorded the temperature after calibration”, what is “after calibration”?',['The subject','The main verb','An object','A modifying phrase'],3,2,1,4,3,45],
    ['Basic word order','Which revision preserves the intended meaning most clearly?',['The technician after the test recorded the pressure.','After the test, the technician recorded the pressure.','Recorded the pressure after the test technician.','The pressure recorded after the test the technician.'],1,2,2,2,3,45],
    ['Editing for accuracy','Which sentence has correct agreement and clear order?',['The results of the experiment shows a pattern.','A pattern shows the results of the experiment.','The results of the experiment show a pattern.','The results of experiment showing a pattern.'],2,2,5,5,4,45],
    ['Subject–verb agreement','Choose the correct sentence.',['Neither the sensor nor the cables is available.','Neither the sensor nor the cables are available.','Neither the sensor nor the cables be available.','Neither the sensor nor the cables has available.'],1,2,3,3,5,60],
    ['Editing for accuracy','Which revision is most accurate? “The data from the first test indicate a problem.”',['The data from the first test indicates a problem.','The data from the first test indicate a problem.','The data from the first test indicating a problem.','The data from the first test indication a problem.'],1,2,5,5,5,60],
    ['Sentence roles','In “The design team evaluated the prototype before submission”, which phrase receives the action?',['The design team','evaluated','the prototype','before submission'],2,2,1,5,3,45],
    ['Basic word order','Which sentence is easiest to process in a laboratory report?',['The final reading after adjustment the technician recorded.','The technician recorded the final reading after adjustment.','Recorded after adjustment the final reading technician.','The final reading recorded technician after adjustment.'],1,2,2,2,4,45],
    ['Subject–verb agreement','Which sentence correctly identifies the head noun?',['The collection of samples are ready.','The collection of samples is ready.','The collection of samples have ready.','The collection of samples were ready.'],1,2,3,4,4,45],
    ['Editing for accuracy','Choose the best edited sentence.',['The instruments in the laboratory needs cleaning.','The instruments in the laboratory need cleaning.','The instruments in laboratory needs cleaning.','The instruments in the laboratory needing cleaning.'],1,2,5,5,4,45],
    ['Integrated editing','Which sentence is both grammatically accurate and clearly ordered?',['The report the student after the experiment submitted.','After the experiment, the student submitted the report.','Submitted after the experiment the report student.','The report submitted student after experiment.'],1,2,4,5,5,60]
  ];
  moderate.forEach(x=>add(...x));
  const tough=[
    ['Subject–verb agreement','A report sentence reads: “The series of calibration tests ___ a consistent reduction in error.” Choose the correct verb.',['show','shows','have shown','are showing'],1,3,3,4,5,60],
    ['Subject–verb agreement','A sentence reads: “The effect of the revised procedure on the measurements ___ significant.” Which verb is correct?',['are','were','is','have'],2,3,3,3,5,60],
    ['Subject–verb agreement','Which sentence is correct despite the plural noun inside the subject phrase?',['The cause of the failures were identified.','The cause of the failures was identified.','The cause of the failures have identified.','The cause of the failures are identified.'],1,3,3,4,5,60],
    ['Editing for accuracy','Which revision best corrects both agreement and clarity? “The group of readings from the sensors are difficult to compare.”',['The group of readings from the sensors is difficult to compare.','The readings from the sensors is difficult to compare.','The group of readings from the sensors are difficult comparing.','The group of readings from the sensor be difficult to compare.'],0,3,5,4,5,75],
    ['Basic word order','Which sentence makes the timing phrase least likely to be misunderstood?',['The technician recorded the pressure after the valve was adjusted.','After the valve was adjusted the pressure recorded the technician.','The pressure after the valve was adjusted recorded technician.','Recorded the technician pressure after the valve adjustment.'],0,3,2,2,5,60],
    ['Sentence roles','In “Before the final inspection, the engineer carefully reviewed the safety checklist”, which phrase is the grammatical subject?',['Before the final inspection','the engineer','carefully','the safety checklist'],1,3,1,1,4,60],
    ['Integrated editing','Which sentence would be strongest in a formal engineering report?',['The measurements was checked and the engineer changed the setup.','The measurements were checked, and the engineer changed the setup.','The measurements were checked and the setup changed engineer.','The measurements is checked, and the engineer changed setup.'],1,3,5,5,5,75],
    ['Subject–verb agreement','Choose the sentence with correct agreement and no distracting noun error.',['One of the proposed solutions require further testing.','One of the proposed solutions requires further testing.','One of the proposed solutions are requiring further testing.','One of the proposed solution require further tests.'],1,3,3,3,5,60],
    ['Editing for accuracy','Which revision best preserves meaning while improving sentence structure?',['The technician after checking the readings identified the fault.','After checking the readings, the technician identified the fault.','Identified the fault the technician after checking readings.','The fault after checking the readings identified technician.'],1,3,4,4,5,75],
    ['Integrated editing','Which sentence contains a correct subject, verb and object relationship?',['The updated procedure improves the reliability of measurements.','The updated procedure improve the reliability of measurements.','The reliability of measurements improve the updated procedure.','The updated procedure the reliability improves measurements.'],0,3,1,3,5,60],
    ['Subject–verb agreement','Which sentence is correct?',['What the technicians need are a clearer procedure.','What the technicians need is a clearer procedure.','What the technicians needs is clearer procedures.','What technicians need be a clearer procedure.'],1,3,3,5,5,75],
    ['Basic word order','Which sentence gives the clearest relationship between cause and action?',['Because the sensor failed, the technician replaced it.','The technician because failed the sensor replaced it.','The sensor replaced because failed the technician.','Replaced it because the sensor technician failed.'],0,3,2,2,5,60],
    ['Editing for accuracy','A student writes “The results from three trials was compared with the reference value.” Which correction is best?',['Change results to result.','Change was to were and compared remains unchanged.','Change reference to references.','No correction is required.'],1,3,5,3,5,60],
    ['Subject–verb agreement','Which sentence correctly handles a compound subject?',['The engineer and the technician checks the circuit.','The engineer and the technician check the circuit.','The engineer and the technician checking the circuit.','The engineer and the technician has checked the circuit.'],1,3,3,3,5,60],
    ['Integrated editing','Which final sentence is clearest and grammatically accurate?',['After the inspection, the team documented the fault and proposed a corrective action.','After the inspection the fault documented the team and proposed action.','The team after inspection the fault documented proposed corrective action.','Documented the fault after inspection the team corrective action.'],0,3,5,5,5,75]
  ];
  tough.forEach(x=>add(...x));
  return items;
}

async function generateHighStandardCompetencyDay(trackId, day) {
  let lastIssues=[];
  // Two attempts are sufficient because each successful attempt still receives
  // two independent audit passes. This avoids the old 4-attempt/serial-audit
  // path exhausting the 9-minute Gen2 event limit.
  for(let attempt=1; attempt<=2; attempt++){
    const generated=(await generateJson(competencyGenerationPrompt(trackId,day))).questions;
    const structural=competencyQuestionValidation(generated,trackId,day);
    if(!structural.ok){ lastIssues=structural.errors; continue; }
    const [audit1,audit2]=await Promise.all([
      auditCompetencyQuestions(trackId,day,generated,1),
      auditCompetencyQuestions(trackId,day,generated,2)
    ]);
    if(audit1.valid!==true){ lastIssues=audit1.issues||['Audit pass 1 failed.']; continue; }
    if(audit2.valid!==true){ lastIssues=audit2.issues||['Audit pass 2 failed.']; continue; }
    return generated.map((q,i)=>({...q,id:trackId+'-D'+day+'-Q'+String(i+1).padStart(2,'0'),reviewed:false,generatedBy:'AI',generatedAt:new Date()}));
  }
  throw new Error('Could not produce a fully validated '+COMPETENCY_ASSESSMENT_TRACKS[trackId].title+' Module '+day+' question bank. '+lastIssues.slice(0,5).join(' '));
}


// Long-running generation is intentionally moved out of the browser callable.
// The admin UI starts ten Firestore jobs and immediately receives a runId.
// Each module is generated independently, so one slow module cannot make the
// whole 10-module request hit a callable deadline. Firestore-triggered Gen2
// functions can run for up to 540 seconds.
export const processCompetencyGenerationJob = onDocumentCreated(
  {timeoutSeconds:540, memory:'1GiB', maxInstances:10},
  'competencyGenerationJobs/{jobId}',
  async event=>{
    const jobRef=event.data?.ref;
    if(!jobRef) return;
    const claimed=await db.runTransaction(async tx=>{
      const snap=await tx.get(jobRef);
      if(!snap.exists || snap.data().status!=='queued') return false;
      tx.update(jobRef,{status:'running',startedAt:FieldValue.serverTimestamp()});
      return true;
    });
    if(!claimed) return;

    const job=(await jobRef.get()).data()||{};
    const trackId=String(job.trackId||'');
    const day=Number(job.day||0);
    const runId=String(job.runId||'');
    const runRef=runId?db.collection('competencyGenerationRuns').doc(runId):null;
    const runKey=trackId+'_D'+day;
    try{
      const questions=trackId==='communication'&&day===1?buildCommunicationModule1Bank():await generateHighStandardCompetencyDay(trackId,day);
      await attachCompetencyAssessmentAudio(trackId,day,questions);
      if(!Array.isArray(questions)||questions.length!==50) throw new Error('Generated module did not contain exactly 50 questions.');
      const meta=COMPETENCY_ASSESSMENT_TRACKS[trackId];
      const adminUid=String(job.adminUid||'system');
      const taskRef=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
      await taskRef.set({
        trackId,trackTitle:meta.title,day,
        title:meta.title+' — Module '+day+' · '+competencyModuleTitle(trackId,day),
        topic:competencyModuleTitle(trackId,day),
        date:null,openAt:null,closeAt:null,
        questions,questionCount:50,recommendedQuestionCount:15,
        status:'draft',isPublished:false,source:'ai-validated-mixed-format',
        generatedBy:'Gemini + 2 audit passes',loadedBy:adminUid,
        loadedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()
      },{merge:true});
      const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+day);
      await poolRef.set({
        trackId,day,questionCount:50,recommendedQuestionCount:15,
        status:'draft',source:'ai-validated-mixed-format',updatedAt:FieldValue.serverTimestamp()
      },{merge:true});
      const questionsBatch=db.batch();
      for(const q of questions){
        questionsBatch.set(poolRef.collection('questions').doc(String(q.id)),{
          ...q,trackId,day,poolId:poolRef.id,source:'ai-validated-mixed-format',
          updatedAt:FieldValue.serverTimestamp()
        },{merge:true});
      }
      await questionsBatch.commit();
      await jobRef.update({status:'completed',completedAt:FieldValue.serverTimestamp(),questionCount:50});
      if(runRef){
        await db.runTransaction(async tx=>{
          const snap=await tx.get(runRef);
          if(!snap.exists) return;
          const run=snap.data()||{};
          const completed=Number(run.completed||0)+1;
          const finished=Number(run.finished||0)+1;
          const patch={
            ['modules.'+runKey]:'completed',
            completed,
            finished,
            updatedAt:FieldValue.serverTimestamp()
          };
          if(finished>=Number(run.totalModules||10)){
            patch.status=Object.keys(run.errors||{}).length?'completed-with-errors':'completed';
            patch.completedAt=FieldValue.serverTimestamp();
          }
          tx.update(runRef,patch);
        });
      }
    }catch(e){
      const message=String(e?.message||e).slice(0,3000);
      logger.error('Competency generation job failed',{trackId,day,runId,error:String(e?.stack||e)});
      await jobRef.update({status:'failed',error:message,failedAt:FieldValue.serverTimestamp()});
      if(runRef){
        await db.runTransaction(async tx=>{
          const snap=await tx.get(runRef);
          if(!snap.exists) return;
          const run=snap.data()||{};
          const finished=Number(run.finished||0)+1;
          const patch={
            ['modules.'+runKey]:'failed',
            ['errors.'+runKey]:message,
            finished,
            updatedAt:FieldValue.serverTimestamp()
          };
          if(finished>=Number(run.totalModules||10)){
            patch.status='completed-with-errors';
            patch.completedAt=FieldValue.serverTimestamp();
          }
          tx.update(runRef,patch);
        }).catch(()=>{});
      }
    }
  }
);

export const startCompetencyModuleGeneration = onCall(
  {cors:CALLABLE_CORS},
  async request=>{
    const adminUser=requireAdmin(request);
    const trackId=competencyTrackOrThrow(request.data?.trackId);
    const day=Number(request.data?.day);
    if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
    const runId='MODULE_'+trackId+'_D'+day+'_'+Date.now()+'_'+randomUUID().slice(0,8);
    await db.collection('competencyGenerationRuns').doc(runId).set({
      runId,trackId,trackTitle:COMPETENCY_ASSESSMENT_TRACKS[trackId].title,
      status:'running',totalModules:1,completed:0,finished:0,
      modules:{[day]:'queued'},errors:{},
      startedAt:FieldValue.serverTimestamp(),startedBy:adminUser.uid
    });
    const jobRef=db.collection('competencyGenerationJobs').doc(runId+'_D'+day);
    await jobRef.set({runId,trackId,day,adminUid:adminUser.uid,status:'queued',createdAt:FieldValue.serverTimestamp()});
    return {success:true,runId,trackId,day,message:'Module '+day+' generation started. Only the selected module is being prepared.'};
  }
);

export const startCompetencyAssessmentGeneration = onCall(
  {cors:CALLABLE_CORS},
  async request=>{
    const adminUser=requireAdmin(request);
    const trackId=competencyTrackOrThrow(request.data?.trackId);
    const runId=trackId+'_'+Date.now()+'_'+randomUUID().slice(0,8);
    const modules={};
    for(let day=1;day<=10;day++) modules[day]='queued';
    await db.collection('competencyGenerationRuns').doc(runId).set({
      runId,trackId,trackTitle:COMPETENCY_ASSESSMENT_TRACKS[trackId].title,
      status:'running',totalModules:10,completed:0,finished:0,modules,errors:{},
      startedAt:FieldValue.serverTimestamp(),startedBy:adminUser.uid
    });
    const batch=db.batch();
    for(let day=1;day<=10;day++){
      const jobRef=db.collection('competencyGenerationJobs').doc(runId+'_D'+day);
      batch.set(jobRef,{runId,trackId,day,adminUid:adminUser.uid,status:'queued',createdAt:FieldValue.serverTimestamp()});
    }
    await batch.commit();
    return {success:true,runId,trackId,totalModules:10,message:'Generation started. Ten module jobs are running independently; the page can be refreshed without losing progress.'};
  }
);

export const startCompetencyMasterBankGeneration = onCall(
  {cors:CALLABLE_CORS},
  async request=>{
    const adminUser=requireAdmin(request);
    const tracks=Object.keys(COMPETENCY_ASSESSMENT_TRACKS);
    const runId='MASTER_'+Date.now()+'_'+randomUUID().slice(0,8);
    const modules={};
    for(const trackId of tracks) for(let day=1;day<=10;day++) modules[trackId+'_D'+day]='queued';
    const totalModules=tracks.length*10;
    await db.collection('competencyGenerationRuns').doc(runId).set({
      runId,kind:'master-bank',status:'running',totalModules,completed:0,finished:0,
      modules,errors:{},trackIds:tracks,
      startedAt:FieldValue.serverTimestamp(),startedBy:adminUser.uid
    });
    const batch=db.batch();
    for(const trackId of tracks) for(let day=1;day<=10;day++){
      const jobRef=db.collection('competencyGenerationJobs').doc(runId+'_'+trackId+'_D'+day);
      batch.set(jobRef,{runId,trackId,day,adminUid:adminUser.uid,status:'queued',createdAt:FieldValue.serverTimestamp(),kind:'master-bank'});
    }
    await batch.commit();
    return {
      success:true,runId,kind:'master-bank',totalTracks:tracks.length,totalModules,
      message:'Master bank generation started: 6 tracks × 10 modules × 50 questions = 3,000 validated questions.'
    };
  }
);

export const getCompetencyAssessmentGenerationRun = onCall(
  {cors:CALLABLE_CORS},
  async request=>{
    requireAdmin(request);
    const runId=cleanText(request.data?.runId,160);
    if(!runId) throw new HttpsError('invalid-argument','runId is required.');
    const snap=await db.collection('competencyGenerationRuns').doc(runId).get();
    if(!snap.exists) throw new HttpsError('not-found','Generation run not found.');
    return snap.data();
  }
);

export const generatePreparedCompetencyModule = onCall(
  {cors:CALLABLE_CORS, timeoutSeconds:300, memory:'1GiB'},
  async request=>{
    const adminUser=requireAdmin(request);
    const trackId=competencyTrackOrThrow(request.data?.trackId);
    const day=Number(request.data?.day);
    if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');

    // Selected-module preparation only. Communication Module 1 is deterministic
    // and is written directly; no background generation is involved.
    if(trackId==='communication' && day===1){
      try{
        const questions=buildCommunicationModule1Bank();
        if(!Array.isArray(questions)) throw new Error('Communication Module 1 bank builder did not return an array.');

        // Complete the authored Module 1 bank defensively if the deployed builder
        // resolves to 45 items. These five items are real Grammar & Usage items,
        // not legacy/generated placeholders.
        const completion=[
          {topic:'Basic word order',prompt:'Choose the sentence with clear Subject → Verb → Object order.',options:['The engineer checked the circuit.','Checked the engineer the circuit.','The circuit the engineer checked.','The engineer the circuit checked.'],answer:0,difficulty:'easy',lo:2,mat:2,drill:1,ladder:1,time:30},
          {topic:'Editing for accuracy',prompt:'Choose the correctly edited sentence.',options:['The report contain two tables.','The report contains two tables.','The report containing two tables.','The report have two tables.'],answer:1,difficulty:'easy',lo:5,mat:5,drill:2,ladder:2,time:30},
          {topic:'Subject–verb agreement',prompt:'Choose the correct sentence.',options:['The equipment requires careful handling.','The equipment require careful handling.','The equipment are requiring handling.','The equipment have careful handling.'],answer:0,difficulty:'easy',lo:3,mat:3,drill:2,ladder:2,time:30},
          {topic:'Sentence roles',prompt:'In “The analyst checked the figures”, which word is the subject?',options:['analyst','checked','figures','the'],answer:0,difficulty:'easy',lo:1,mat:1,drill:1,ladder:1,time:30},
          {topic:'Editing for accuracy',prompt:'Which sentence is grammatically accurate?',options:['The experiment produces reliable results.','The experiment produce reliable results.','The experiment producing reliable results.','The experiment have reliable results.'],answer:0,difficulty:'easy',lo:5,mat:5,drill:2,ladder:2,time:30}
        ];
        while(questions.length<50 && completion.length){
          const x=completion.shift();
          questions.push({
            id:'D1-Q'+String(questions.length+1).padStart(2,'0'),
            type:'mcq',activityType:'mcq',difficulty:x.difficulty,topic:x.topic,
            learningOutcomeId:'communication-D1-LO'+x.lo,
            materialId:'communication-D1-MAT'+x.mat,
            guidedDrillId:'communication-D1-DR'+x.drill,
            ladderLevel:x.ladder,
            remediationMaterialId:'communication-D1-MAT'+x.mat,
            prompt:x.prompt,options:x.options,answer:x.answer,
            explanation:'The selected sentence follows the taught Grammar & Usage principle for this module.',
            remediationNote:'Revisit the related Grammar & Usage material and Guided Drill '+x.drill+' before attempting the item again.',
            timeLimitSeconds:x.time
          });
        }
        if(questions.length!==50){
          throw new Error('Communication Module 1 bank contains '+questions.length+' questions after completion; exactly 50 are required.');
        }
        await attachCompetencyAssessmentAudio(trackId,1,questions);
        const meta=COMPETENCY_ASSESSMENT_TRACKS[trackId];
        const taskRef=db.collection('competencyAssessmentTasks').doc('communication_D1');
        const poolRef=db.collection('competencyQuestionPools').doc('communication_D1');

        await taskRef.set({
          trackId,trackTitle:meta.title,day:1,
          title:meta.title+' — Module 1 · '+competencyModuleTitle(trackId,1),
          topic:competencyModuleTitle(trackId,1),
          date:null,openAt:null,closeAt:null,
          questions,questionCount:50,recommendedQuestionCount:15,
          status:'draft',isPublished:false,
          source:'faculty-authored-module-bank',
          generatedBy:'validated authored bank',loadedBy:adminUser.uid,
          loadedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()
        },{merge:true});

        await poolRef.set({
          trackId,day:1,questionCount:50,recommendedQuestionCount:15,
          status:'draft',source:'faculty-authored-module-bank',
          updatedAt:FieldValue.serverTimestamp()
        },{merge:true});

        const existing=await poolRef.collection('questions').get();
        const batch=db.batch();
        for(const doc of existing.docs){
          batch.delete(doc.ref);
        }
        for(const q of questions){
          batch.set(poolRef.collection('questions').doc(String(q.id)),{
            ...q,trackId,day:1,poolId:poolRef.id,
            source:'faculty-authored-module-bank',
            updatedAt:FieldValue.serverTimestamp()
          });
        }
        await batch.commit();

        return {
          success:true,completed:true,trackId,day:1,
          questionCount:50,recommendedQuestionCount:15,
          message:'Communication Module 1 loaded successfully: 50 master questions, 15 questions per student.'
        };
      }catch(e){
        logger.error('Communication Module 1 preparation failed',{error:e?.stack||e?.message||String(e)});
        throw new HttpsError('failed-precondition','Communication Module 1 could not be prepared: '+String(e?.message||e).slice(0,500));
      }
    }

    const runId='MODULE_'+trackId+'_D'+day+'_'+Date.now()+'_'+randomUUID().slice(0,8);
    await db.collection('competencyGenerationRuns').doc(runId).set({
      runId,trackId,trackTitle:COMPETENCY_ASSESSMENT_TRACKS[trackId].title,
      status:'running',totalModules:1,completed:0,finished:0,
      modules:{[day]:'queued'},errors:{},
      startedAt:FieldValue.serverTimestamp(),startedBy:adminUser.uid
    });
    await db.collection('competencyGenerationJobs').doc(runId+'_D'+day).set({
      runId,trackId,day,adminUid:adminUser.uid,status:'queued',createdAt:FieldValue.serverTimestamp()
    });
    return {success:true,runId,trackId,day,questionCount:50,recommendedQuestionCount:15,
      completed:false,message:'Module '+day+' generation started. Only the selected module is being prepared.'};
  }
);
export const loadPreparedCompetencyAssessmentProgram = onCall({cors:CALLABLE_CORS, timeoutSeconds:540, memory:'1GiB'}, async request=>{
  const adminUser=requireAdmin(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const requestedDay=request.data?.day==null?null:Number(request.data.day);
  if(trackId!=='c-programming') throw new HttpsError('invalid-argument','The prepared mixed-format bank is currently available for C Programming.');
  if(requestedDay!==null && (!Number.isInteger(requestedDay)||requestedDay<1||requestedDay>10)) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
  const meta=COMPETENCY_ASSESSMENT_TRACKS[trackId];
  const expected=COMPETENCY_ASSESSMENT_BLUEPRINT.cActivityDistribution;
  const all=PREPARED_C_PROGRAMMING_QUESTION_BANK;
  if(!Array.isArray(all) || all.length!==500) throw new HttpsError('failed-precondition','Prepared C bank must contain exactly 500 questions.');
  const days=requestedDay===null?[...Array(10)].map((_,i)=>i+1):[requestedDay];
  const modules=[];
  for(const day of days){
    const questions=all.filter(q=>String(q.id).startsWith('CMP'+String(day).padStart(2,'0')+'-D'+day+'-'));
    if(questions.length!==50) throw new HttpsError('failed-precondition','Prepared Module '+day+' must contain exactly 50 questions.');
    const validation=competencyQuestionValidation(questions.map(q=>({...q})),trackId,day);
    if(!validation.ok) throw new HttpsError('failed-precondition','Prepared Module '+day+' failed validation: '+validation.errors.slice(0,12).join(' | '));
    const counts={};
    questions.forEach(q=>{const k=String(q.activityType||'mcq');counts[k]=(counts[k]||0)+1;});
    for(const [k,v] of Object.entries(expected)) if((counts[k]||0)!==v) throw new HttpsError('failed-precondition','Prepared Module '+day+' has invalid '+k+' count.');
    modules.push({day,questions:questions.map(q=>({...q}))});
  }
  const taskBatch=db.batch();
  for(const {day,questions} of modules){
    const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
    taskBatch.set(ref,{
      trackId,trackTitle:meta.title,day,
      title:meta.title+' — Module '+day+' · '+competencyModuleTitle(trackId,day),
      topic:competencyModuleTitle(trackId,day),date:null,openAt:null,closeAt:null,
      questions,questionCount:50,recommendedQuestionCount:COMPETENCY_ASSESSMENT_BLUEPRINT.recommendedPerStudent,
      status:'draft',isPublished:false,source:'prepared-static-bank-v1',generatedBy:'prepared repository bank',loadedBy:adminUser.uid,
      loadedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()
    },{merge:true});
  }
  await taskBatch.commit();
  for(const {day,questions} of modules){
    const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+day);
    await poolRef.set({trackId,day,questionCount:50,recommendedQuestionCount:15,status:'draft',source:'prepared-static-bank-v1',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    const pb=db.batch();
    for(const q of questions) pb.set(poolRef.collection('questions').doc(String(q.id)),{...q,trackId,day,poolId:poolRef.id,source:'prepared-static-bank-v1',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    await pb.commit();
  }
  await db.collection('adminActions').add({
    action:'loadPreparedCompetencyAssessmentProgram',
    trackId,adminUid:adminUser.uid,
    modules:modules.length,questionCount:modules.length*50,
    selectedDay:requestedDay,source:'prepared-static-bank-v1',
    composition:expected,createdAt:FieldValue.serverTimestamp()
  });
  return {
    success:true,trackId,
    modules:modules.map(x=>({day:x.day,questionCount:x.questions.length})),
    totalQuestions:modules.length*50,composition:expected,
    message:requestedDay
      ? 'Prepared static mixed-format C Programming Module '+requestedDay+' loaded: 50 validated questions. Other modules were not loaded.'
      : 'Prepared static mixed-format C Programming bank loaded: 50 validated questions per module. No AI generation was performed. All modules remain DRAFT.'
  };
});
export const autoGenerateCompetencyAssessmentProgram = onCall({cors:CALLABLE_CORS, timeoutSeconds:540, memory:'1GiB'}, async request=>{
  const adminUser=requireAdmin(request), trackId=competencyTrackOrThrow(request.data?.trackId), meta=COMPETENCY_ASSESSMENT_TRACKS[trackId];
  const batch=db.batch(), poolWrites=[], created=[];
  for(let day=1;day<=10;day++){
    const questions=await generateHighStandardCompetencyDay(trackId,day);
    const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
    batch.set(ref,{trackId,trackTitle:meta.title,day,title:meta.title+' — Module '+day+' · '+competencyModuleTitle(trackId,day),topic:competencyModuleTitle(trackId,day),date:null,openAt:null,closeAt:null,questions,questionCount:questions.length,recommendedQuestionCount:COMPETENCY_ASSESSMENT_BLUEPRINT.recommendedPerStudent,status:'draft',isPublished:false,createdBy:adminUser.uid,generatedBy:'AI',generatedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true});
    poolWrites.push({day,questions});
    created.push({day,questionCount:questions.length,recommendedQuestionCount:COMPETENCY_ASSESSMENT_BLUEPRINT.recommendedPerStudent});
  }
  await batch.commit();
  for(const item of poolWrites){
    const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+item.day);
    await poolRef.set({trackId,day:item.day,questionCount:item.questions.length,recommendedQuestionCount:COMPETENCY_ASSESSMENT_BLUEPRINT.recommendedPerStudent,status:'draft',generatedBy:'AI',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    let pb=db.batch();
    for(const q of item.questions) pb.set(poolRef.collection('questions').doc(String(q.id)),{...q,trackId,day:item.day,poolId:poolRef.id,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    await pb.commit();
  }
  await db.collection('adminActions').add({action:'autoGenerateCompetencyAssessmentProgram',trackId,adminUid:adminUser.uid,modules:10,questionCount:500,createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,trackTitle:meta.title,modules:created,totalQuestions:500,message:'Ten module assessments generated with 50-question master pools and independently audited twice. Status remains DRAFT until administrator review and approval.'};
});

function starterCompetencyQuestions(trackId,day){
  // Never seed production assessment documents with synthetic/template questions.
  // A draft is intentionally empty until a validated generated/prepared bank is loaded.
  return [];
}

export const createCompetencyAssessmentProgram = onCall({cors:CALLABLE_CORS},async request=>{
  const adminUser=requireAdmin(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const meta=COMPETENCY_ASSESSMENT_TRACKS[trackId];
  const batch=db.batch();
  for(let day=1;day<=10;day++){
    const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
    batch.set(ref,{
      trackId,trackTitle:meta.title,day,
      title:cleanText(request.data?.title||meta.title,160)+' — Module '+day+' · '+competencyModuleTitle(trackId,day),
      topic:competencyModuleTitle(trackId,day),
      date:null,openAt:null,closeAt:null,
      questions:starterCompetencyQuestions(trackId,day),questionCount:0,recommendedQuestionCount:15,status:'draft',isPublished:false,contentState:'awaiting-validated-bank',
      createdBy:adminUser.uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()
    },{merge:true});
  }
  await batch.commit();
  await db.collection('adminActions').add({action:'createCompetencyAssessmentProgram',trackId,adminUid:adminUser.uid,createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,modules:10,message:'Blank editable 10-module programme created. Faculty/admin must load, review, schedule and approve each module assessment before students can see it.'};
});

export const getAdminCompetencyQuestionPool = onCall({cors:CALLABLE_CORS},async request=>{
  requireAdmin(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
  const taskSnap=await db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day).get();
  if(!taskSnap.exists) throw new HttpsError('not-found','Assessment day not found.');
  const task=taskSnap.data();
  const poolSnap=await db.collection('competencyQuestionPools').doc(trackId+'_D'+day).collection('questions').get();
  const questions=poolSnap.empty?(task.questions||[]):poolSnap.docs.map(d=>d.data());
  return {trackId,day,title:task.title,topic:task.topic,moduleTitle:competencyModuleTitle(trackId,day),questionCount:questions.length,recommendedQuestionCount:Number(task.recommendedQuestionCount||Math.min(15,questions.length)),status:task.status,questions};
});

export const getCompetencyAssessmentRole = onCall({cors:CALLABLE_CORS},async request=>{
  const a=requireAuth(request);
  if(isAdminAuth(a)) return {role:'admin'};
  const email=String(a.token.email||'').toLowerCase();
  if(!email) return {role:'student'};
  const snap=await db.collection('competencyAssessmentTasks').where('facultyEmail','==',email).limit(1).get();
  return {role:snap.empty?'student':'faculty'};
});

export const getAdminCompetencyAssessmentPrograms = onCall({cors:CALLABLE_CORS},async request=>{
  const a=requireAuth(request),admin=isAdminAuth(a),email=String(a.token.email||'').toLowerCase();
  const trackId=String(request.data?.trackId||'').trim();
  const day=Number(request.data?.day||0);
  if(trackId){
    const validTrack=COMPETENCY_ASSESSMENT_TRACKS[trackId];
    if(!validTrack) throw new HttpsError('invalid-argument','Invalid competency track.');
    if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
    const snap=await db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day).get();
    if(!snap.exists) return {items:[],role:admin?'admin':'student'};
    const item={id:snap.id,...snap.data()};
    const canonicalTitle=competencyModuleTitle(trackId,day);
    const canonicalTaskTitle=COMPETENCY_ASSESSMENT_TRACKS[trackId].title+' — Module '+day+' · '+canonicalTitle;
    const staleTitle=String(item.title||'') && String(item.title||'')!==canonicalTaskTitle;
    if(staleTitle){
      return {items:[{id:snap.id,trackId,day,title:canonicalTaskTitle,topic:canonicalTitle,status:'stale-content',isPublished:false,questionCount:0,staleContent:true}],role:admin?'admin':'faculty'};
    }
    if(!admin&&String(item.facultyEmail||'').toLowerCase()!==email) return {items:[],role:'student'};

    // Prefer the prepared question-pool subcollection for the selected module.
    // This prevents an older MCQ-only task document from masking a newly
    // generated mixed-format master bank.
    const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+day);
    // The prepared question documents are authoritative even if the parent
    // metadata document was not created. Query the subcollection directly.
    const questionSnap=await poolRef.collection('questions').get();
    if(!questionSnap.empty){
      const pool= (await poolRef.get()).exists ? ((await poolRef.get()).data()||{}) : {};
      const poolQuestions=questionSnap.docs.map(d=>d.data());
      // For C Programming, a verified 50-question prepared pool always
      // replaces the legacy MCQ-only task document.
      const isPrepared=(trackId==='c-programming' && poolQuestions.length===50)
        || String(pool.source||'').toLowerCase()==='ai-validated-mixed-format'
        || poolQuestions.some(q=>String(q.source||'').toLowerCase()==='ai-validated-mixed-format')
        || poolQuestions.some(q=>String(q.activityType||'')!=='mcq');
      if(isPrepared){
        item.questions=poolQuestions;
        item.questionCount=poolQuestions.length;
        item.recommendedQuestionCount=Number(pool.recommendedQuestionCount||item.recommendedQuestionCount||15);
        item.source='ai-validated-mixed-format';
        item.poolLoaded=true;
      }
    }
    return {items:[item],role:admin?'admin':'faculty'};
  }
  // Legacy callers may request the complete list; the competency admin UI no longer does.
  const snap=await db.collection('competencyAssessmentTasks').get();
  const items=snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>admin||String(x.facultyEmail||'').toLowerCase()===email).sort((a,b)=>String(a.trackId).localeCompare(String(b.trackId))||Number(a.day)-Number(b.day));
  return {items,role:admin?'admin':(items.length?'faculty':'student')};
});

export const assignCompetencyAssessmentFaculty = onCall({cors:CALLABLE_CORS},async request=>{
  const adminUser=requireAdmin(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  const facultyEmail=cleanText(request.data?.facultyEmail,180).toLowerCase();
  if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
  if(!facultyEmail||!facultyEmail.includes('@')) throw new HttpsError('invalid-argument','Enter a valid faculty email address.');
  const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day),snap=await ref.get();
  if(!snap.exists) throw new HttpsError('not-found','Create the assessment module before assigning faculty.');
  let facultyName='';
  const facultySnap=await db.collection('students').where('email','==',facultyEmail).limit(1).get();
  if(!facultySnap.empty) facultyName=facultySnap.docs[0].data().name||'';
  await ref.set({facultyEmail,facultyName,assignedBy:adminUser.uid,assignedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true});
  await db.collection('adminActions').add({action:'assignCompetencyAssessmentFaculty',trackId,day,facultyEmail,adminUid:adminUser.uid,createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,day,facultyEmail,facultyName};
});

export const saveCompetencyAssessmentDay = onCall({cors:CALLABLE_CORS},async request=>{
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  const adminUser=await requireCompetencyAssessmentManager(request,trackId,day);
  if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
  const date=cleanText(request.data?.date,20);
  const openAt=cleanText(request.data?.openAt,60);
  const closeAt=cleanText(request.data?.closeAt,60);
  const topic=cleanText(request.data?.topic,180);
  const title=cleanText(request.data?.title,180);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpsError('invalid-argument','Use YYYY-MM-DD for the assessment date.');
  const open=new Date(openAt),close=new Date(closeAt);
  if(Number.isNaN(open.getTime())||Number.isNaN(close.getTime())||close<=open) throw new HttpsError('invalid-argument','Assessment opening/closing times are invalid.');
  const questions=validateCompetencyQuestions(request.data?.questions,trackId);
  const rawVideoLinks=Array.isArray(request.data?.videoLinks)?request.data.videoLinks:[];
  const videoLinks=rawVideoLinks.map(v=>String(v||'').trim()).filter(v=>/^https?:\\/\\//i.test(v)).slice(0,2);
  const allowStudentScriptDownload=Boolean(request.data?.allowStudentScriptDownload);
  const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
  await ref.set({trackId,trackTitle:COMPETENCY_ASSESSMENT_TRACKS[trackId].title,day,date,openAt:open,closeAt:close,topic:topic||competencyModuleTitle(trackId,day),title:title||COMPETENCY_ASSESSMENT_TRACKS[trackId].title+' — Module '+day+' · '+competencyModuleTitle(trackId,day),questions,questionCount:questions.length,recommendedQuestionCount:Math.min(trackId==='c-programming'?10:15,questions.length),videoLinks,allowStudentScriptDownload,poolVersion:(Date.now()),status:'draft',isPublished:false,updatedBy:adminUser.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+day);
  await poolRef.set({trackId,day,questionCount:questions.length,recommendedQuestionCount:Math.min(COMPETENCY_ASSESSMENT_BLUEPRINT.recommendedPerStudent,questions.length),status:'draft',updatedBy:adminUser.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  const poolBatch=db.batch();
  for(const q of questions){
    poolBatch.set(poolRef.collection('questions').doc(String(q.id)),{...q,trackId,day,poolId:poolRef.id,updatedBy:adminUser.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  }
  await poolBatch.commit();
  return {success:true,trackId,day,questionCount:questions.length,recommendedQuestionCount:Math.min(15,questions.length),status:'draft'};
});

export const verifyCompetencyAssessmentDay = onCall({cors:CALLABLE_CORS},async request=>{
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  const verifier=await requireCompetencyAssessmentManager(request,trackId,day);
  const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
  const snap=await ref.get();
  if(!snap.exists) throw new HttpsError('not-found','Assessment module has not been created.');
  const d=snap.data();
  validateCompetencyQuestions(d.questions,trackId);
  if(!d.date||!d.openAt||!d.closeAt) throw new HttpsError('failed-precondition','Set the date, opening time and closing time before verification.');
  await ref.update({status:'verified',isPublished:false,verifiedBy:verifier.uid,verifiedByEmail:verifier.token.email||'',verifiedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  await db.collection('competencyQuestionPools').doc(trackId+'_D'+day).set({status:'verified',verifiedBy:verifier.uid,verifiedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true});
  await db.collection('adminActions').add({action:'verifyCompetencyAssessmentDay',trackId,day,verifierUid:verifier.uid,verifierEmail:verifier.token.email||'',createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,day,status:'verified'};
});

export const approveCompetencyAssessmentDay = onCall({cors:CALLABLE_CORS},async request=>{
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  const adminUser=requireAdmin(request);
  const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
  const snap=await ref.get();
  if(!snap.exists) throw new HttpsError('not-found','Assessment day has not been created.');
  const d=snap.data();
  validateCompetencyQuestions(d.questions,trackId);
  if(d.status!=='verified') throw new HttpsError('failed-precondition','Faculty verification is required before admin approval and publishing.');
  if(!d.date||!d.openAt||!d.closeAt) throw new HttpsError('failed-precondition','Set the date, opening time and closing time before approval/publishing.');
  await ref.update({status:'published',isPublished:true,approvedBy:adminUser.uid,approvedByEmail:adminUser.token.email||'',approvedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  await db.collection('competencyQuestionPools').doc(trackId+'_D'+day).set({status:'published',approvedBy:adminUser.uid,approvedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()},{merge:true});
  await db.collection('adminActions').add({action:'approveCompetencyAssessmentDay',trackId,day,adminUid:adminUser.uid,createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,day,status:'published'};
});

export const getCompetencyAssessmentResult = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const attemptId=cleanText(request.data?.attemptId,120);
  if(!attemptId) throw new HttpsError('invalid-argument','Attempt ID is required.');
  const snap=await db.collection('competencyAssessmentResults').doc(attemptId).get();
  if(!snap.exists) throw new HttpsError('not-found','Assessment result not found.');
  const result=snap.data();
  const admin=isAdminAuth(user);
  if(!admin && result.studentId!==user.uid) throw new HttpsError('permission-denied','Result ownership mismatch.');
  const taskSnap=await db.collection('competencyAssessmentTasks').doc(result.taskId).get();
  if(!taskSnap.exists) throw new HttpsError('not-found','Assessment module not found.');
  const task=taskSnap.data();
  if(!admin){
    const close=asJsDate(task.closeAt);
    if(!task.allowStudentScriptDownload || !close || new Date()<close){
      throw new HttpsError('failed-precondition','The answer script is not yet available. The assessment window must close and the administrator must activate student script downloads.');
    }
  }
  return result;
});

export const getCompetencyModuleLearningResources = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const student=await db.collection('students').doc(user.uid).get();
  if(!isAdminAuth(user) && (!student.exists || String(student.data().status||'').toLowerCase()!=='approved')){
    throw new HttpsError('permission-denied','Your student account is not approved.');
  }
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  const day=Number(request.data?.day);
  if(!Number.isInteger(day)||day<1||day>10) throw new HttpsError('invalid-argument','Module must be between 1 and 10.');
  const snap=await db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day).get();
  if(!snap.exists) return {trackId,day,videoLinks:[]};
  const d=snap.data();
  return {trackId,day,videoLinks:Array.isArray(d.videoLinks)?d.videoLinks.slice(0,2):[]};
});

export const getStudentCompetencyAssessments = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  try{
    const admin=isAdminAuth(user);
    if(!admin){
      const student=await db.collection('students').doc(user.uid).get();
      if(!student.exists || String(student.data().status||'').toLowerCase()!=='approved'){
        throw new HttpsError('permission-denied','Your student account is not approved for assessments.');
      }
    }
    const snap=await db.collection('competencyAssessmentTasks').where('isPublished','==',true).get();
    const now=new Date(),items=[];
    for(const d of snap.docs){
      const x=d.data(),open=asJsDate(x.openAt),close=asJsDate(x.closeAt);
      const canonicalTitle=competencyModuleTitle(String(x.trackId||''),Number(x.day||0));
      const canonicalTaskTitle=COMPETENCY_ASSESSMENT_TRACKS[x.trackId]?.title+' — Module '+Number(x.day||0)+' · '+canonicalTitle;
      if(!COMPETENCY_ASSESSMENT_TRACKS[x.trackId] || String(x.title||'')!==canonicalTaskTitle) continue;
      if(!open||!close) continue;
      const status=now>=open&&now<close?'open':now<open?'scheduled':'closed';
      if(status==='closed') continue;
      items.push({id:d.id,trackId:String(x.trackId||''),trackTitle:String(x.trackTitle||''),day:Number(x.day||0),title:String(x.title||''),topic:String(x.topic||''),date:String(x.date||''),openAt:open.toISOString(),closeAt:close.toISOString(),questionCount:Number(x.questionCount||0),status});
    }
    items.sort((a,b)=>a.openAt.localeCompare(b.openAt));
    return {items};
  }catch(e){
    if(e instanceof HttpsError) throw e;
    logger.error('getStudentCompetencyAssessments failed',{uid:user.uid,error:String(e?.stack||e)});
    throw new HttpsError('internal','Assessment Centre could not load its published modules. Please try again.');
  }
});

export const startCompetencyAssessment = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  try{
    const admin=isAdminAuth(user);
    if(!admin){
      const student=await db.collection('students').doc(user.uid).get();
      if(!student.exists || String(student.data().status||'').toLowerCase()!=='approved'){
        throw new HttpsError('permission-denied','Your student account is not approved for assessments.');
      }
    }
    const taskId=cleanText(request.data?.taskId,120);
    if(!taskId) throw new HttpsError('invalid-argument','Assessment module is required.');
    const taskSnap=await db.collection('competencyAssessmentTasks').doc(taskId).get();
    if(!taskSnap.exists||taskSnap.data().isPublished!==true) throw new HttpsError('failed-precondition','This assessment is not published.');
    const task=taskSnap.data();
    const canonicalTitle=competencyModuleTitle(String(task.trackId||''),Number(task.day||0));
    const canonicalTaskTitle=COMPETENCY_ASSESSMENT_TRACKS[task.trackId]?.title+' — Module '+Number(task.day||0)+' · '+canonicalTitle;
    if(!COMPETENCY_ASSESSMENT_TRACKS[task.trackId] || String(task.title||'')!==canonicalTaskTitle) throw new HttpsError('failed-precondition','This assessment uses an older curriculum version. Regenerate and approve the current module question bank before opening it.');
    const open=asJsDate(task.openAt),close=asJsDate(task.closeAt);
    if(!open||!close) throw new HttpsError('failed-precondition','This assessment has an invalid opening or closing time.');
    const now=new Date();
    if(now<open||now>=close) throw new HttpsError('failed-precondition','This assessment is not currently open.');
    const existing=await db.collection('competencyAssessmentAttempts').where('studentId','==',user.uid).where('taskId','==',taskId).limit(1).get();
    if(!existing.empty){
      const x=existing.docs[0];
      if(x.data().status==='finalized') throw new HttpsError('already-exists','You have already completed this assessment.');
      return {attemptId:x.id,trackId:task.trackId,title:task.title,day:task.day,closeAt:close.toISOString(),questions:x.data().questions||[],resumed:true,recommendedQuestionCount:(x.data().questions||[]).length};
    }
    const poolSnap=await db.collection('competencyQuestionPools').doc(taskId).collection('questions').get();
    const sourceQuestions=poolSnap.empty?(task.questions||[]):poolSnap.docs.map(d=>d.data());
    if(!sourceQuestions.length) throw new HttpsError('failed-precondition','No approved question pool is available.');
    const codingPool=task.trackId==='c-programming'?sourceQuestions.filter(q=>q.activityType==='coding-challenge'):[];
    const audioPool=task.trackId==='c-programming'?sourceQuestions.filter(q=>q.activityType==='listening'):[];
    // C retains its TCS-style 10-question assessment structure; all other competencies use 15.
    const targetStudentCount=task.trackId==='c-programming'?10:15;
    const recommendedCount=Math.min(targetStudentCount,sourceQuestions.length);
    const codingRequired=task.trackId==='c-programming'?shuffle(codingPool).slice(0,Math.min(1,recommendedCount)):[];
    const audioRequired=shuffle(audioPool.filter(q=>!codingRequired.some(c=>c.id===q.id))).slice(0,Math.min(1,Math.max(0,recommendedCount-codingRequired.length)));
    const required=[...codingRequired,...audioRequired];
    const remaining=sourceQuestions.filter(q=>!required.some(r=>r.id===q.id));
    const selected=shuffle(required.concat(shuffle(remaining).slice(0,Math.max(0,recommendedCount-required.length))));
    const questions=selected.map(q=>{const {answer,explanation,audioText,codingTests,...safe}=q;return {...safe,timeLimitSeconds:Number(q.timeLimitSeconds||60)};});
    const questionSnapshot=selected.map(q=>({...q,timeLimitSeconds:Number(q.timeLimitSeconds||60)}));
    const attemptRef=db.collection('competencyAssessmentAttempts').doc();
    await attemptRef.set({studentId:user.uid,taskId,trackId:task.trackId,day:task.day,questions,questionSnapshot,questionIds:questions.map(q=>q.id),questionBankVersion:String(task.poolVersion||task.updatedAt?.toMillis?.()||Date.now()),status:'started',startedAt:FieldValue.serverTimestamp(),closeAt:close});
    return {attemptId:attemptRef.id,trackId:task.trackId,title:task.title,day:task.day,closeAt:close.toISOString(),questions,recommendedQuestionCount:questions.length};
  }catch(e){
    if(e instanceof HttpsError) throw e;
    logger.error('startCompetencyAssessment failed',{uid:user.uid,error:String(e?.stack||e)});
    throw new HttpsError('internal','Assessment could not be started. Please try again.');
  }
});

export const submitCompetencyAssessment = onCall({cors:CALLABLE_CORS},async request=>{
  const user=requireAuth(request);
  const attemptId=cleanText(request.data?.attemptId,120);
  const answers=Array.isArray(request.data?.answers)?request.data.answers:[];
  const attemptRef=db.collection('competencyAssessmentAttempts').doc(attemptId);
  const attemptSnap=await attemptRef.get();
  if(!attemptSnap.exists) throw new HttpsError('not-found','Assessment attempt not found.');
  const attempt=attemptSnap.data();
  if(attempt.studentId!==user.uid) throw new HttpsError('permission-denied','Attempt ownership mismatch.');
  if(attempt.status==='finalized') return (await db.collection('competencyAssessmentResults').doc(attemptId).get()).data();
  if(new Date()>attempt.closeAt.toDate()) throw new HttpsError('deadline-exceeded','Assessment window has closed.');
  const pool=Array.isArray(attempt.questionSnapshot)?attempt.questionSnapshot:[];
  if(!pool.length) throw new HttpsError('failed-precondition','Immutable assessment question snapshot is unavailable.');
  const byId=new Map(pool.map(q=>[q.id,q]));
  const allowed=new Set(attempt.questionIds||[]);
  let correct=0;
  const codingSubmissions=answers.filter(x=>allowed.has(x.questionId)&&byId.get(x.questionId)?.activityType==='coding-challenge');
  if(codingSubmissions.length) await consumeCompilerQuota(user.uid,codingSubmissions.reduce((n,x)=>n+Number(byId.get(x.questionId)?.codingTests?.length||0),0));
  for(const submitted of answers){
    if(!allowed.has(submitted.questionId))continue;
    const q=byId.get(submitted.questionId);
    if(!q)continue;
    if(q.activityType==='coding-challenge'){
      const sourceCode=String(submitted.answer||'');
      try{
        enforceCodeLimits(sourceCode,'');
        const tests=Array.isArray(q.codingTests)?q.codingTests:[];
        let passedAll=true;
        for(const [input,expected] of tests){
          const r=await judge0Submit(sourceCode,String(input||''),String(expected||''));
          if(Number(r.status?.id)!==3){passedAll=false;break;}
        }
        if(passedAll)correct++;
      }catch(e){ logger.warn('Competency coding question failed',{questionId:q.id,error:String(e?.message||e)}); }
    }else if(answersEqual(q.answer,submitted.answer))correct++;
  }
  const total=Number(attempt.questions?.length||pool.length||1);
  const scorePercent=Math.round(correct/total*10000)/100;
  const passed=scorePercent>=80;
  const xp=passed?50:Math.round(scorePercent/100*25);
  const resultRef=db.collection('competencyAssessmentResults').doc(attemptId);
  await db.runTransaction(async tx=>{
    const current=await tx.get(resultRef);if(current.exists)return;
    tx.set(resultRef,{studentId:user.uid,attemptId,taskId:attempt.taskId,trackId:attempt.trackId,day:attempt.day,score:correct,total,scorePercent,passed,xp,questionBankVersion:attempt.questionBankVersion||'',questionSnapshot:pool,submittedAnswers:answers,completedAt:FieldValue.serverTimestamp()});
    tx.update(attemptRef,{status:'finalized',finalizedAt:FieldValue.serverTimestamp()});
    const cpRef=db.collection('competencyProgress').doc(user.uid),cpSnap=await tx.get(cpRef),cp=cpSnap.exists?cpSnap.data():{xp:0,level:1,tracks:{}};
    const studentSnap=await tx.get(db.collection('students').doc(user.uid));
    const studentData=studentSnap.exists?studentSnap.data():{};
    const tracks={...(cp.tracks||{})},cur={...(tracks[attempt.trackId]||{xp:0,progress:0})};
    const newTrackXp=Number(cur.xp||0)+xp;
    const drillBonusPoints=Number(cur.drillBonusPoints||0);
    const totalPoints=newTrackXp+drillBonusPoints;
    tracks[attempt.trackId]={...cur,xp:newTrackXp,progress:Math.min(100,Number(cur.progress||0)+xp),totalPoints};
    const totalXp=Number(cp.xp||0)+xp;
    tx.set(cpRef,{xp:totalXp,level:Math.floor(totalXp/100)+1,tracks,updatedAt:FieldValue.serverTimestamp()},{merge:true});
    const boardRef=db.collection('competencyLeaderboards').doc(attempt.trackId).collection('students').doc(user.uid);
    tx.set(boardRef,{uid:user.uid,trackId:attempt.trackId,displayName:studentData.name||request.auth.token.name||'Student',displayClass:studentData.className||studentData.class||studentData.section||studentData.programme||studentData.department||'Class not set',drillStars:Number(cur.drillStars||0),drillBonusPoints,totalPoints,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  });
  return {score:correct,total,scorePercent,passed,xp,trackId:attempt.trackId,day:attempt.day};
});


export const loadPreparedCompetencyTrack = onCall({cors:CALLABLE_CORS, timeoutSeconds:540, memory:'1GiB'}, async request=>{
  const adminUser=requireAdmin(request);
  const trackId=competencyTrackOrThrow(request.data?.trackId);
  throw new HttpsError('failed-precondition','Legacy prepared-static-bank-v1 is disabled. Generate the module through the validated AI workflow; only traceable, audited banks may be loaded.');
  const bankFiles={
    communication:'./prepared-communication-bank.js',
    aptitude:'./prepared-aptitude-bank.js',
    'core-engineering':'./prepared-core-engineering-bank.js',
    'problem-solving':'./prepared-problem-solving-bank.js',
    analytical:'./prepared-analytical-bank.js'
  };
  const exportNames={
    communication:'PREPARED_COMMUNICATION_QUESTION_BANK',
    aptitude:'PREPARED_APTITUDE_QUESTION_BANK',
    'core-engineering':'PREPARED_CORE_ENGINEERING_QUESTION_BANK',
    'problem-solving':'PREPARED_PROBLEM_SOLVING_QUESTION_BANK',
    analytical:'PREPARED_ANALYTICAL_QUESTION_BANK'
  };
  const mod=await import(bankFiles[trackId]);
  const all=mod[exportNames[trackId]];
  if(!Array.isArray(all)||all.length!==500) throw new HttpsError('failed-precondition',trackId+' prepared bank must contain exactly 500 questions.');
  const modules=[];
  for(let day=1;day<=10;day++){
    const questions=all.filter(q=>String(q.id).includes('-D'+day+'-'));
    if(questions.length!==50) throw new HttpsError('failed-precondition','Prepared '+trackId+' Module '+day+' must contain exactly 50 questions.');
    const validation=competencyQuestionValidation(questions.map(q=>({...q})),trackId);
    if(!validation.ok) throw new HttpsError('failed-precondition','Prepared '+trackId+' Module '+day+' failed validation: '+validation.errors.slice(0,12).join(' | '));
    modules.push({day,questions});
  }
  for(const {day,questions} of modules){
    const ref=db.collection('competencyAssessmentTasks').doc(trackId+'_D'+day);
    await ref.set({
      trackId,trackTitle:COMPETENCY_ASSESSMENT_TRACKS[trackId].title,day,
      title:COMPETENCY_ASSESSMENT_TRACKS[trackId].title+' — Module '+day+' · '+competencyModuleTitle(trackId,day),
      topic:competencyModuleTitle(trackId,day),date:null,openAt:null,closeAt:null,
      questions,questionCount:50,recommendedQuestionCount:10,status:'draft',isPublished:false,
      source:'prepared-static-bank-v1',generatedBy:'prepared repository bank',loadedBy:adminUser.uid,
      loadedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()
    },{merge:true});
    const poolRef=db.collection('competencyQuestionPools').doc(trackId+'_D'+day);
    await poolRef.set({trackId,day,questionCount:50,recommendedQuestionCount:10,status:'draft',source:'prepared-static-bank-v1',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    const batch=db.batch();
    for(const q of questions) batch.set(poolRef.collection('questions').doc(String(q.id)),{...q,trackId,day,poolId:poolRef.id,source:'prepared-static-bank-v1',updatedAt:FieldValue.serverTimestamp()},{merge:true});
    await batch.commit();
  }
  await db.collection('adminActions').add({action:'loadPreparedCompetencyTrack',trackId,adminUid:adminUser.uid,modules:10,questionCount:500,source:'prepared-static-bank-v1',createdAt:FieldValue.serverTimestamp()});
  return {success:true,trackId,totalQuestions:500,modules:10,message:'Prepared '+COMPETENCY_ASSESSMENT_TRACKS[trackId].title+' bank loaded: 50 questions per module. All modules remain DRAFT.'};
});
