import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db=getFirestore();
const PASS_PERCENT=80;
const REWARD_POINTS=40;

function requireAdmin(request){if(request.auth?.token?.admin!==true)throw new Error('Admin authorization required');}

export const authorizeStudent=onCall(async request=>{
  requireAdmin(request);
  const {studentId}=request.data||{};
  if(!studentId)throw new Error('studentId is required');
  await db.collection('students').doc(studentId).update({status:'approved',approvedAt:FieldValue.serverTimestamp()});
  return {success:true};
});

export const finalizeAttempt=onCall(async request=>{
  if(!request.auth)throw new Error('Login required');
  const {attemptId,answers}=request.data||{};
  if(!attemptId||!Array.isArray(answers))throw new Error('Invalid attempt');
  const attemptRef=db.collection('attempts').doc(attemptId);
  const attemptSnap=await attemptRef.get();
  if(!attemptSnap.exists)throw new Error('Attempt not found');
  const attempt=attemptSnap.data();
  if(attempt.studentId!==request.auth.uid)throw new Error('Attempt ownership mismatch');
  const poolSnap=await db.collection('questionPools').doc(attempt.poolId).get();
  if(!poolSnap.exists)throw new Error('Question pool unavailable');
  const byId=new Map((poolSnap.data().questions||[]).map(q=>[q.id,q]));
  let correct=0;
  for(const submitted of answers){const q=byId.get(submitted.questionId);if(!q)continue;const expected=Array.isArray(q.answer)?[...q.answer].sort():q.answer;const actual=Array.isArray(submitted.answer)?[...submitted.answer].sort():submitted.answer;if(JSON.stringify(expected)===JSON.stringify(actual))correct++;}
  const total=attempt.totalQuestions||15;
  const scorePercent=total?correct/total*100:0;
  const passed=scorePercent>=PASS_PERCENT;
  const rewardPoints=passed?REWARD_POINTS:0;
  await db.collection('results').doc(attemptId).set({studentId:request.auth.uid,attemptId,assessmentDate:attempt.assessmentDate,score:correct,total,scorePercent,passed,rewardPoints,completedAt:FieldValue.serverTimestamp()});
  await attemptRef.update({status:'finalized',finalizedAt:FieldValue.serverTimestamp()});
  return {score:correct,total,scorePercent,passed,rewardPoints};
});

export const assessmentScheduler=onSchedule({schedule:'every 15 minutes',timeZone:'Asia/Kolkata'},async()=>{
  const now=new Date();
  const snap=await db.collection('assessmentSchedules').where('isPublished','==',true).get();
  const batch=db.batch();
  for(const d of snap.docs){const x=d.data();const open=x.openAt?.toDate?.();const close=x.closeAt?.toDate?.();if(!open||!close)continue;const status=now<open?'scheduled':now<close?'open':'closed';batch.update(d.ref,{status,lastSchedulerRunAt:FieldValue.serverTimestamp()});}
  if(!snap.empty)await batch.commit();
});
