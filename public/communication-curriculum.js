// FXEC First-Year Communication Curriculum
// International skill architecture: CEFR can-do progression with IELTS/TOEFL-aligned
// receptive/productive/interactive tasks. Original FXEC engineering contexts only.
// Target: B1 consolidation -> B2 development across the first year.
//
// This file contains curriculum/task metadata only. It does not reproduce IELTS/TOEFL
// test questions or proprietary material.

export const COMMUNICATION_STANDARD = Object.freeze({
  framework: 'CEFR',
  targetProgression: 'B1 consolidation → B2 development',
  benchmarkAlignment: ['IELTS Academic skill architecture', 'TOEFL iBT academic/campus communication'],
  assessedModes: ['reception', 'production', 'interaction', 'mediation'],
  speakingCriteria: ['fluency and coherence', 'lexical resource', 'grammatical range and accuracy', 'pronunciation/intelligibility'],
  engineeringContext: true
});

export const COMMUNICATION_MODULES = Object.freeze([
  {
    id: 1,
    title: 'Grammar & Usage',
    focus: 'Build accurate sentence control for academic, laboratory and workplace communication.',
    level: 'B1 → B2',
    topics: ['Sentence roles and word order','Subject–verb agreement','Tense and aspect','Articles, prepositions and modifiers','Editing for clarity and accuracy'],
    example: 'Improve: “The students was ready for the experiment.” Explain why “were” is required and identify the subject that controls the verb.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Sentence Accuracy · Falling',target:'The students were ready for the experiment.',intonation:'falling'},
      {type:'wordUsage',label:'Grammar in Speech',target:'Target word: accurately. Use the target word naturally in a complete sentence about engineering work.'},
      {type:'listeningSpeaking',label:'Listen & Respond',target:'In a laboratory meeting, explain one safety instruction in two clear sentences.'}
    ]
  },
  {
    id: 2,
    title: 'Vocabulary & Word Usage',
    focus: 'Develop precise academic and engineering vocabulary, collocations, register and paraphrasing.',
    level: 'B1 → B2',
    topics: ['Context clues','Word families and affixes','Engineering collocations','Formal and informal register','Confusable words and paraphrase'],
    example: 'Choose the professional collocation “conduct an experiment” rather than “do an experiment” in a formal laboratory report, then use it in a sentence.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Technical Vocabulary · Falling',target:'The engineer conducted a careful experiment to evaluate the material.',intonation:'falling'},
      {type:'wordUsage',label:'Word Practice',target:'Target word: evaluate. Use the target word naturally in a meaningful engineering sentence.'},
      {type:'listeningSpeaking',label:'Explain a Term',target:'Listen to the prompt and explain what “reliable” means when describing an engineering system.'}
    ]
  },
  {
    id: 3,
    title: 'Reading Comprehension',
    focus: 'Read academic and technical texts for purpose, main ideas, evidence, reference and inference.',
    level: 'B1 → B2',
    topics: ['Skimming and scanning','Main idea and supporting detail','Reference and cohesion','Inference from evidence','Accurate summarising'],
    example: 'Read a short paragraph about a solar-powered water pump. Identify its main claim, two supporting details and one conclusion that is implied rather than directly stated.',
    audio: false,
    speechTasks: [
      {type:'wordUsage',label:'Academic Vocabulary',target:'Target word: evidence. Use the target word naturally when explaining how a reader supports a conclusion.'},
      {type:'listeningSpeaking',label:'Summarise a Passage',target:'After reading an engineering passage, give a 30-second spoken summary containing the main idea and one supporting detail.'}
    ]
  },
  {
    id: 4,
    title: 'Listening Skills',
    focus: 'Understand spoken English in lectures, laboratory instructions, campus communication and technical discussions.',
    level: 'B1 → B2',
    topics: ['Listening for gist','Key details and numbers','Instructions and sequencing','Note-taking','Speaker purpose, attitude and implied meaning'],
    example: 'Listen to a laboratory announcement and capture the equipment name, time, location, safety instruction and required action.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Instruction Reading · Falling',target:'Please record the measurement carefully and report the result before leaving the laboratory.',intonation:'falling'},
      {type:'wordUsage',label:'Listening Vocabulary',target:'Target word: procedure. Use the target word naturally in a sentence about a laboratory task.'},
      {type:'listeningSpeaking',label:'Listen & Respond',target:'Listen to an academic instruction and respond by stating the required action, deadline and one important detail.'}
    ]
  },
  {
    id: 5,
    title: 'Speaking Skills',
    focus: 'Develop clear, intelligible and organised spoken responses for academic and professional situations.',
    level: 'B1 → B2',
    topics: ['Response structure','Fluency and pausing','Pronunciation and intelligibility','Grammar while speaking','Answering follow-up questions'],
    example: 'Give a 45-second answer to “Why did you choose engineering?” using a clear point, reason, example and closing sentence.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Fluency & Pronunciation · Falling',target:'Engineering students need clear communication because technical ideas must be understood by different audiences.',intonation:'falling'},
      {type:'wordUsage',label:'Spoken Vocabulary',target:'Target word: solution. Use the target word naturally in a sentence about solving an engineering problem.'},
      {type:'listeningSpeaking',label:'Academic Interview',target:'Answer this interview question clearly: What engineering skill do you want to develop during your first year, and why?'}
    ]
  },
  {
    id: 6,
    title: 'Professional Communication',
    focus: 'Use appropriate tone, politeness, turn-taking and action-oriented language in professional interactions.',
    level: 'B1 → B2',
    topics: ['Professional tone','Requests and responses','Clarification and confirmation','Polite disagreement','Meeting etiquette and action points'],
    example: 'Replace “Send me the file now” with a professional request that states the purpose, deadline and appreciation.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Professional Tone · Rising',target:'Could you please send the updated test results before the project meeting tomorrow?',intonation:'rising'},
      {type:'wordUsage',label:'Professional Word Use',target:'Target word: confirm. Use the target word naturally in a professional engineering sentence.'},
      {type:'listeningSpeaking',label:'Workplace Response',target:'Respond professionally to a teammate who asks for clarification about your part of a project.'}
    ]
  },
  {
    id: 7,
    title: 'Presentation Skills',
    focus: 'Plan and deliver structured technical presentations with clear signposting and audience awareness.',
    level: 'B1 → B2',
    topics: ['Audience and purpose','Presentation structure','Signposting language','Visual-to-verbal balance','Handling questions'],
    example: 'Present an engineering idea in three stages: problem, proposed solution and evidence. Use signposts so the audience can follow the structure.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Presentation Opening · Falling',target:'Good morning. Today I will explain the problem, the proposed solution, and the evidence supporting our design.',intonation:'falling'},
      {type:'wordUsage',label:'Presentation Vocabulary',target:'Target word: demonstrate. Use the target word naturally in a sentence about presenting engineering results.'},
      {type:'listeningSpeaking',label:'Mini Presentation',target:'Give a 60-second explanation of one simple engineering device. Include its purpose, main components and one benefit.'}
    ]
  },
  {
    id: 8,
    title: 'Group Discussion',
    focus: 'Participate constructively in discussions by listening, contributing evidence and responding respectfully.',
    level: 'B1 → B2',
    topics: ['Entering a discussion','Building on an idea','Agreeing and disagreeing','Evidence-based contributions','Summarising group decisions'],
    example: 'In a discussion on AI in engineering education, make one claim, support it with one reason, respond respectfully to another view and summarise your position.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Discussion Language · Falling',target:'I agree with that point, but I would like to add one practical consideration.',intonation:'falling'},
      {type:'wordUsage',label:'Discussion Vocabulary',target:'Target word: perspective. Use the target word naturally when responding to another person’s idea.'},
      {type:'listeningSpeaking',label:'Discussion Response',target:'State your position on whether first-year engineering students should learn AI tools, then give one reason and acknowledge one alternative view.'}
    ]
  },
  {
    id: 9,
    title: 'Workplace Writing',
    focus: 'Write concise, accurate and professional emails, reports, minutes and technical updates.',
    level: 'B1 → B2',
    topics: ['Purpose and audience','Email structure and subject lines','Paragraph control','Reports and minutes','Editing for tone, grammar and clarity'],
    example: 'Write a 120-word project update containing the situation, impact, action taken, pending issue and next step.',
    audio: false,
    speechTasks: [
      {type:'wordUsage',label:'Writing Vocabulary',target:'Target word: concise. Use the target word naturally when explaining good professional writing.'},
      {type:'listeningSpeaking',label:'Briefing Practice',target:'Give a 30-second spoken briefing that could later be converted into a professional project update email.'}
    ]
  },
  {
    id: 10,
    title: 'Integrated Communication',
    focus: 'Integrate reading, listening, speaking and writing to solve realistic first-year engineering communication tasks.',
    level: 'B1 → B2',
    topics: ['Multiple-source information','Briefing and response','Evidence selection','Professional synthesis','Final communication check'],
    example: 'Listen to a project update, read a short data note, identify the two most important facts and produce a five-sentence written briefing followed by a 45-second spoken summary.',
    audio: true,
    speechTasks: [
      {type:'pronunciation',label:'Integrated Speaking · Falling',target:'The project is progressing well, but we need to verify the test results before making the final design decision.',intonation:'falling'},
      {type:'wordUsage',label:'Integrated Vocabulary',target:'Target word: justify. Use the target word naturally when explaining an engineering decision.'},
      {type:'listeningSpeaking',label:'Final Integrated Response',target:'Give a 60-second response that states an engineering decision, provides evidence for it, acknowledges one limitation and concludes clearly.'}
    ]
  }
]);
