# FXEC C Programming – Level 3 | Strings

Automated 5-Day Assessment Portal.

## Automation
1. The uploaded 5-day Strings learning module is represented in `content/module-source.md`.
2. Cloud Scheduler automatically creates/maintains the five assessment windows.
3. Gemini on Vertex AI automatically generates a 25-question daily pool.
4. The generated pool is structurally validated and then audited by Gemini for correctness, ambiguity and source alignment.
5. Audio questions are automatically converted to MP3 using Google Cloud Text-to-Speech and stored in Firebase Storage.
6. Each approved student receives 15 questions selected server-side from the 25-question pool.
7. Correct answers never go to the browser.
8. Submission is scored server-side.
9. 80% or above automatically earns 40 Reward Points.
10. ZeptoMail automatically sends approval, opening/reminder and result emails.
11. Top 20 and aggregate statistics are updated automatically.
12. Admin can export results as CSV or PDF.

## One-time setup
- Firebase Authentication: Email/Password enabled.
- Firestore and Storage deployed.
- Cloud Functions deployed after one-time secret/API configuration.
- Store ZeptoMail credentials only in Secret Manager as `ZEPTOMAIL_CONFIG`, for example:
  {"apiKey":"YOUR_SEND_MAIL_TOKEN","fromEmail":"noreply@yourdomain.com","fromName":"FXEC Assessment Portal"}
- Enable Vertex AI and Cloud Text-to-Speech APIs.
- Web app Firebase configuration is kept in the frontend and is not a secret.

## Assessment blueprint
- Pool: 25 questions.
- Per student: 15 questions.
- Per student mix: 3 MCQ + 3 Match + 5 Audio + 1 Problem Solving + 3 Multiple Answer.
- Difficulty target per student: 6 easy + 6 moderate + 3 tough.
- Pass: 80%.
- Reward: 40 points.

## Important
A statistical target such as only about 5% of students scoring 100% cannot be guaranteed before real student response data exists. The generator deliberately makes the tough portion challenging and the system stores outcomes so the pool can be tuned later.

## Competency Portal Phase 1

The existing C Programming | Level 3 | Strings portal now includes a reusable competency layer and C Coding Lab without replacing the existing approval, question-pool, assessment, or server-side scoring flow.

### C Coding Lab

- Student-facing C editor with standard input.
- Compile & Run sends source code to the server-side `runCCode` callable.
- Submit Challenge evaluates against hidden server-side test cases.
- Hidden test inputs/expected outputs are never sent to the browser.
- Daily compiler quota: 30 execution/test units per student.
- Successful challenge completion awards XP and the first C Strings badge.

### Compiler configuration

The portal uses a Judge0-compatible API. The Firebase function defaults to `https://ce.judge0.com`, but for an institution serving a large cohort, configure a dedicated Judge0 deployment or another compatible endpoint through the Firebase Functions parameters:

- `COMPILER_API_URL`
- `COMPILER_API_TOKEN` (only when the selected Judge0 instance requires it)

Judge0 provides sandboxed compilation/execution and supports self-hosting. The portal submits asynchronously and polls for completion.

### Track model

The C Programming model is the reference implementation for the other first-year competency tracks. Track definitions live in `src/data/competencyTracks.js`:

1. Communication
2. Aptitude
3. Core Engineering
4. C Programming
5. Problem Solving
6. Reading & Listening / Analytical Skills

Each track follows the same pipeline:

`Learn → Watch/Observe → Practice → Knowledge Check → Challenge → Assessment → XP/Badge`

The existing C Strings assessment remains the first live implementation; the other tracks can be populated against the same engine rather than creating separate portals.

### Deployment note

The GitHub phase adds the code and configuration. The compiler endpoint must be configured and available before student code execution is enabled in production. The compiler service should be capacity-tested before opening coding challenges to the full cohort.


## Communication pronunciation assessment

The Communication Lab supports browser microphone recording and server-side Azure Speech Pronunciation Assessment. Pronunciation tasks are sent as 16 kHz PCM WAV and request HundredMark + Phoneme granularity + IPA, with miscue and comprehensive scoring. Results can include overall pronunciation, accuracy, fluency, completeness, prosody, word-level errors, and phoneme-level scores. Configure Firebase parameters `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` before deployment. Azure documents that Phoneme granularity returns full-text, word, syllable (where supported), and phoneme-level results, with IPA available for en-US. citeturn0search0turn0search2
