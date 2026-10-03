// FXEC Communication learning materials — original teaching content.
// Structured for: teach → guided drill → practice ladder → challenge.
// No assessment-bank or application logic belongs in this file.

const L=(title,teach,example,check)=>({title,level:'Foundation',teach,example,code:'',check});
const D=(category,prompt,options,answer,explanation)=>({category,prompt,options,answer,explanation});
const P=(title,prompt,options,answer,hint,explanation)=>({title,kind:'mcq',prompt,options,answer,hint,explanation});

export const COMMUNICATION_LEARNING_CONTENT=Object.freeze([
 {
  id:1,
  lessons:[
   L('Sentence roles: subject, verb and object','A sentence communicates a complete idea. The subject tells us who or what the sentence is about; the verb expresses the action, state or condition; the object receives the action when an object is needed.','The technician tested the circuit. Subject = the technician; verb = tested; object = the circuit.','Can you identify the subject, verb and object in a new sentence?'),
   L('Basic word order','In a clear English statement, the most common order is Subject → Verb → Object. Keeping this order helps the reader understand who did what to whom.','The student completed the experiment. Changing the order carelessly can change or obscure the meaning.','Rewrite one technical sentence using Subject → Verb → Object order.'),
   L('Subject–verb agreement','The verb must agree with its subject in number. Singular subjects normally take singular present-tense forms; plural subjects take plural forms. Do not let a nearby noun distract you from the real subject.','The results show a clear trend. The result shows a clear trend. In “The list of measurements is ready”, “list” controls the verb.','Which noun actually controls the verb in a sentence with a prepositional phrase?'),
   L('Word order in technical sentences','Technical writing becomes easier to follow when the actor, action and affected item are placed clearly. Put important information where its role is obvious rather than creating ambiguous structures.','Unclear: “The voltage after the test the technician recorded.” Clear: “The technician recorded the voltage after the test.”','Can you move a misplaced phrase without changing the intended meaning?'),
   L('Editing for accuracy','Good grammar is not only about spotting a wrong word. Edit systematically: identify the subject, check the verb, inspect word order, then check modifiers and punctuation.','Incorrect: “The students was ready for the experiment.” Correct: “The students were ready for the experiment.”','Before submitting a sentence, can you explain why every correction is necessary?')
  ],
  drills:[
   D('Subject Hunt','In “The technician tested the circuit”, which word group is the subject?',['The technician','tested','the circuit','tested the circuit'],0,'The technician is the noun phrase performing the action.'),
   D('Word Order','Which sentence follows the clearest Subject → Verb → Object pattern?',['The engineer inspected the machine.','The machine the engineer inspected carefully.','Inspected the engineer the machine.','The engineer the machine inspected.'],0,'The subject comes first, followed by the verb and then the object.'),
   D('Agreement','Choose the correct sentence.',['The results shows a trend.','The results show a trend.','The results showing a trend.','The results is showing a trend.'],1,'Results is plural, so the present-tense verb is show.'),
   D('Agreement Trace','In “The list of measurements is complete”, which word controls the verb?',['measurements','list','complete','of'],1,'The head noun of the subject is list, which is singular.'),
   D('Editing','Which correction is needed? “The students was ready for the experiment.”',['Change students to student.','Change was to were.','Change experiment to experiments.','No correction is needed.'],1,'Students is plural, so the verb must be were.')
  ],
  practice:[
   P('Level 1 · Identify','In “The laboratory assistant recorded the temperature”, what is the subject?',['laboratory assistant','recorded','temperature','the'],0,'Ask who performed the action.','The laboratory assistant performs the action, so it is the subject.'),
   P('Level 2 · Apply','Choose the correct sentence for a report.',['The measurements shows variation.','The measurements show variation.','The measurements showing variation.','The measurements is show variation.'],1,'Identify the plural subject first.','Measurements is plural, so use show.'),
   P('Level 3 · Verify','Which check best verifies subject–verb agreement?',['Find the subject and compare its number with the verb.','Choose the verb that sounds longer.','Look only at the nearest noun.','Ignore the subject if the sentence is technical.'],0,'Do not let nearby nouns distract you.','Agreement is verified by matching the verb with the actual subject.'),
   P('Level 4 · Diagnose','“The set of readings are reliable.” What is the problem?',['Set is singular, so are should be is.','Readings is singular, so set should be are.','Reliable must be replaced.','There is no problem.'],0,'Find the head noun of the subject phrase.','Set is the singular head noun: “The set of readings is reliable.”'),
   P('Level 5 · Transfer','Which revision is clearest?',['After the test the technician the voltage recorded.','The technician recorded the voltage after the test.','Recorded after the test the technician voltage.','The voltage after the test recorded technician.'],1,'Put actor, action and object in a clear order.','The second sentence gives the reader an immediate Subject → Verb → Object structure.')
  ],
  challenge:'Edit a short engineering paragraph containing five sentence-role, word-order and agreement errors. For each correction, identify the subject, explain the verb choice and rewrite the sentence clearly.'
 },
 {
  id:2,
  lessons:[
   L('Context clues','A word can often be understood from the surrounding sentence. Look for definitions, examples, contrasts and cause–effect clues before reaching for a dictionary.','“The material is brittle; it fractures easily under sudden impact.” The second clause helps explain brittle.','Which surrounding words provide evidence for the meaning?'),
   L('Word families','Prefixes, suffixes and related forms help you recognise how a word functions. Know the difference between a noun, verb, adjective and adverb when constructing a sentence.','analyse → analysis → analytical; rely → reliable → reliability.','Can you change a base word into the form required by the sentence?'),
   L('Engineering collocations','Some words naturally occur together in professional English. Learning these combinations makes technical communication more precise and natural.','conduct an experiment, measure temperature, analyse data, meet a requirement, solve a problem.','Which verb naturally combines with experiment?'),
   L('Register','Professional communication changes according to audience and purpose. Formal reports usually avoid casual wording, while spoken teamwork can be more conversational.','“The test failed” is direct; “The test produced an unexpected result” may be more neutral in a report.','Can you adapt the same idea for a report and a conversation?'),
   L('Confusable words and paraphrase','Words that look or sound similar can carry different meanings. Paraphrasing means expressing the same idea accurately without copying the original wording.','affect = influence; effect = result. “The temperature affected performance” differs from “The effect was significant.”','Can you replace a word without changing the intended meaning?')
  ],
  drills:[
   D('Context Clue','“The coating is durable, so it remains effective after repeated use.” What does durable most nearly mean?',['Long-lasting','Transparent','Expensive','Flexible'],0,'The consequence “remains effective after repeated use” indicates long-lasting.'),
   D('Word Family','Which word correctly completes “The team conducted a detailed ___ of the results”?',['analyse','analysis','analytical','analysed'],1,'The sentence needs a noun after “a detailed”.'),
   D('Collocation','Which is the most natural professional phrase?',['do an experiment','make an experiment','conduct an experiment','perform a research'],2,'Conduct an experiment is a standard professional collocation.'),
   D('Register','Which is more suitable for a formal report?',['The machine went crazy.','The machine behaved unexpectedly.','The machine was kinda bad.','The machine messed up.'],1,'Formal reports use precise, neutral wording.'),
   D('Confusable Words','Choose the correct word: “High temperature can ___ the sensor output.”',['effect','affect','affection','effective'],1,'Affect is the verb meaning influence.')
  ],
  practice:[
   P('Level 1 · Recognise','Which phrase is a professional engineering collocation?',['conduct an experiment','do a stuff','make an experiment','take a measurementing'],0,'Choose the natural verb + noun combination.','Conduct an experiment is the standard collocation.'),
   P('Level 2 · Apply','Complete: “The test results were ___, so the team repeated the measurement.”',['inconsistent','inconsistency','inconsistently','inconsist'],0,'The sentence needs an adjective.','Inconsistent describes the results.'),
   P('Level 3 · Verify','What should you check when choosing a word from context?',['Its meaning and grammatical role in the sentence.','Only its spelling.','Only its length.','Whether it appears first in a dictionary.'],0,'Meaning and grammatical function both matter.','Context determines both intended meaning and required word form.'),
   P('Level 4 · Diagnose','A student writes “The data was very usefully.” What needs attention?',['Subject agreement and word form.','Only punctuation.','Only spelling.','Nothing.'],0,'Check both the noun–verb relationship and adverb/adjective choice.','Depending on style, data may take plural agreement, and useful is the adjective needed after “was”.'),
   P('Level 5 · Transfer','Which sentence is most appropriate in a technical report?',['We got some weird numbers.','The measurements showed unexpected variation.','The numbers were kinda strange.','The data went bad.'],1,'Use precise, neutral technical language.','The second sentence communicates the observation without informal or vague wording.')
  ],
  challenge:'Take ten common engineering words and build a mini glossary with definition, word family, collocation and one original technical sentence.'
 },
 {
  id:3,
  lessons:[
   L('Purpose and prediction','Before reading, identify why you are reading and predict what information is likely to matter. This prepares attention for structure and evidence.','A laboratory procedure is read differently from a research summary because the reader needs different information.','What is the purpose of the text?'),
   L('Main idea and supporting detail','The main idea is the central point; supporting details explain, justify or illustrate it. Do not mistake an interesting detail for the main message.','A paragraph may discuss three sensor tests but its main idea may be that calibration improved measurement reliability.','Can you state the main idea in one sentence?'),
   L('Reference and cohesion','Pronouns, repeated key terms and linking words connect ideas. Trace references carefully so that “this”, “they” or “it” is linked to the correct noun.','“The pump was redesigned. This reduced vibration.” This refers to the redesign, not the pump.','What does each reference word point to?'),
   L('Inference from evidence','An inference is a conclusion supported by information in the text but not stated word-for-word. Separate what the text says from what you infer.','If a report says energy use fell after insulation was added, you may infer reduced heat loss, but you should not invent an exact cause without evidence.','Which conclusion is supported and which is speculation?'),
   L('Accurate summarising','A summary keeps the central idea and essential evidence while removing minor details and personal opinion.','A good summary of a test report states purpose, major finding and relevant limitation rather than copying every measurement.','Can you summarise without adding information not in the text?')
  ],
  drills:[
   D('Main Idea','A paragraph explains that calibration reduced measurement error across three tests. What is its likely main idea?',['Calibration improved measurement reliability.','The laboratory has three tests.','Measurements always contain no error.','Calibration is expensive.'],0,'The main idea captures the central conclusion supported by the details.'),
   D('Reference','“The team replaced the sensor. This improved accuracy.” What does This refer to?',['The team','The sensor','Replacing the sensor','Accuracy'],2,'This refers to the preceding action.'),
   D('Inference','A report says a device consumed less energy after insulation was added. Which conclusion is safest?',['Energy consumption decreased after the change.','Insulation always eliminates all heat loss.','The device became twice as efficient.','No other factor could matter.'],0,'Only the supported relationship should be claimed.'),
   D('Purpose','What is the main purpose of a laboratory procedure?',['To tell the reader how to perform the procedure safely and consistently.','To entertain the reader.','To advertise a product.','To provide unrelated background.'],0,'Procedures are action-oriented and reproducible.'),
   D('Summary','Which belongs in a concise technical summary?',['Central finding and relevant limitation','Every minor detail','Personal feelings','Unverified assumptions'],0,'A summary keeps essential evidence and limitations.')
  ],
  practice:[
   P('Level 1 · Identify','What is the main idea of a paragraph?',['Its central message','The longest sentence','The first number','A minor example'],0,'Ask what the whole paragraph is mainly communicating.','The main idea is the central message supported by the details.'),
   P('Level 2 · Apply','A passage reports that a new filter reduced particles by 20%. What detail directly supports the claim?',['The measured particle reduction','The colour of the equipment','The team lunch time','An unrelated temperature'],0,'Select evidence directly connected to the claim.','The measured reduction is the relevant supporting evidence.'),
   P('Level 3 · Verify','How can you check an inference?',['Trace it back to explicit evidence in the text.','Assume it because it sounds plausible.','Use outside facts without checking the passage.','Choose the most dramatic interpretation.'],0,'An inference must be anchored in evidence.','Tracing the conclusion to text evidence prevents unsupported interpretation.'),
   P('Level 4 · Diagnose','A summary contains many details but misses the report’s main finding. What is the main weakness?',['It has poor prioritisation.','It has too many verbs.','It uses too many units.','It is necessarily false.'],0,'A summary must prioritise the central message.','The summary needs to retain the main finding and remove less important detail.'),
   P('Level 5 · Transfer','Which summary is strongest for a technical report?',['The test was interesting and had many numbers.','The test found a 12% reduction in energy use, although the sample size was limited.','The engineers did many things.','The product is definitely the best.'],1,'Include finding plus important limitation.','The second summary is concise, evidence-based and appropriately cautious.')
  ],
  challenge:'Read a one-page engineering article and produce a 60-word summary containing the purpose, main finding, one supporting detail and one limitation.'
 },
 {
  id:4,
  lessons:[
   L('Listening for gist','First listen for the overall purpose and situation rather than trying to capture every word. Identify who is speaking, why and what the main message is.','A laboratory announcement may mainly tell students what action is required before a practical session.','Can you state the speaker’s main purpose after one listen?'),
   L('Listening for details','After identifying the gist, listen for names, numbers, times, locations, conditions and required actions. These details often carry the operational meaning.','“Submit the report by 4 p.m. Friday in Lab 2” contains three details that must be captured accurately.','Which details must be written down rather than remembered loosely?'),
   L('Instructions and sequence','Listen for sequence markers such as first, next, then, finally and before. These show the order in which actions should occur.','First switch off the supply; then disconnect the cable; finally record the reading.','Can you reproduce the steps in the correct order?'),
   L('Note-taking','Effective notes capture keywords and relationships, not every spoken sentence. Use abbreviations, arrows and headings while preserving critical numbers and conditions.','“Temp ↑ after load” can preserve the relationship while avoiding unnecessary transcription.','Which information is essential enough to record exactly?'),
   L('Purpose, attitude and implied meaning','Speakers communicate attitude through wording, emphasis and tone. Distinguish explicit information from a reasonable inference about attitude or intention.','“We need to check that result again before release” implies caution without explicitly saying the result is wrong.','What is directly stated and what is only implied?')
  ],
  drills:[
   D('Gist','A speaker explains how to submit a laboratory report. What should you identify first?',['The overall purpose and required action','Every individual word','The speaker’s accent','An unrelated detail'],0,'Gist comes before detailed note-taking.'),
   D('Detail','Which detail is most important to capture exactly from an instruction?',['The submission deadline','The speaker’s favourite topic','A repeated filler word','The room colour'],0,'Operational details such as deadlines affect action.'),
   D('Sequence','Which word most clearly signals the final step?',['First','Next','Finally','Before'],2,'Finally signals the last stage in a sequence.'),
   D('Notes','Which note is most efficient for “Increase the load gradually and record the temperature after each step”?',['Load ↑ gradually → record temp each step','Write every word exactly','Load is interesting','Temperature maybe'],0,'The first note preserves the action and sequence.'),
   D('Inference','A lecturer says, “Let us verify this reading before we use it.” What attitude is most reasonably implied?',['Caution','Celebration','Anger','Certainty'],0,'The request to verify indicates caution about reliability.')
  ],
  practice:[
   P('Level 1 · Gist','During a campus announcement, what should you identify first?',['Purpose and main action','Every word','Only numbers','The speaker’s accent'],0,'Start with the overall message.','Gist establishes the situation and purpose before details.'),
   P('Level 2 · Apply','You hear “The assessment window closes at 11:59 p.m. on Friday.” Which information is essential?',['Closing time and date','The speaker’s name only','The room temperature','Nothing needs recording'],0,'Capture operational details accurately.','The date and exact closing time determine the required action.'),
   P('Level 3 · Verify','You missed one word in an instruction. What should you do?',['Use surrounding context and listen again if possible.','Invent the missing word.','Ignore the whole instruction.','Assume the first guess is correct.'],0,'Use context and available repetition to verify meaning.','Context can narrow meaning, but uncertainty should be checked when possible.'),
   P('Level 4 · Diagnose','Your notes contain many words but you cannot reconstruct the procedure. What failed?',['You recorded words without relationships or sequence.','You listened too carefully.','You used headings.','You recorded numbers.'],0,'Notes need structure, not transcription.','Useful notes preserve steps, conditions and relationships.'),
   P('Level 5 · Transfer','After a technical briefing, which note set is most useful?',['Keywords + sequence + critical numbers + required action','Every filler word','Only the opening sentence','Only your personal opinion'],0,'Capture the information needed to act.','The first option supports accurate reconstruction of the briefing.')
  ],
  challenge:'Listen to a two-minute technical briefing and produce structured notes with purpose, three key details, sequence, deadline and required action.'
 },
 {
  id:5,
  lessons:[
   L('Answer structure','A clear spoken answer normally has a point, supporting reason or evidence, an example and a concise close. Structure helps listeners follow ideas even when grammar is imperfect.','Question: Why engineering? Answer: point → reason → personal example → closing statement.','Can you answer in four connected parts rather than isolated sentences?'),
   L('Fluency and pausing','Fluency does not mean speaking without pauses. Use short planned pauses between ideas and avoid filling every silence with repeated hesitation words.','Pause after the main point, then continue with the reason or example.','Can you pause at natural boundaries instead of stopping randomly?'),
   L('Pronunciation and intelligibility','Good pronunciation aims for understandable speech. Stress important words, pronounce key endings clearly and use a steady pace.','In “The results were significantly higher”, stress results and significantly rather than every word equally.','Which words carry the main meaning?'),
   L('Grammar while speaking','Spoken accuracy improves when you prepare useful sentence patterns instead of translating every word. Correct yourself briefly when necessary and continue.','“The main reason is… because…” can introduce a reason clearly, followed by one specific example.','Can you correct a small error without losing the main idea?'),
   L('Follow-up questions','Professional and academic conversations require responses to follow-up questions. Listen to the question, answer directly, then add evidence or clarification.','If asked “Why?”, give the reason first; if asked “How?”, describe the process or method.','Does your answer directly respond to the question word?')
  ],
  drills:[
   D('Structure','Which sequence creates a clear short answer?',['Point → reason → example → close','Example → unrelated story → close','Point → silence → unrelated fact','Close → point → no evidence'],0,'A simple structure gives the listener a logical path.'),
   D('Fluency','Which is a useful speaking habit?',['Pause between ideas','Speak as fast as possible','Fill every pause with “um”','Avoid breathing pauses'],0,'Planned pauses improve clarity and control.'),
   D('Intelligibility','Which words should normally receive more stress?',['Important content words','Every word equally','Only articles','Only conjunctions'],0,'Content words carry the main information.'),
   D('Grammar','What is a good response when you notice a small grammar error while speaking?',['Correct it briefly and continue.','Stop the answer completely.','Repeat the whole answer five times.','Ignore the listener.'],0,'Brief self-correction can preserve fluency.'),
   D('Follow-up','If an interviewer asks “Why did you choose this project?”, what should you give first?',['A direct reason','A completely new topic','A one-word answer only','Silence'],0,'Answer the actual question before expanding.')
  ],
  practice:[
   P('Level 1 · Structure','What should a short academic answer contain?',['A clear point and supporting explanation','Only one isolated word','An unrelated story','A memorised paragraph regardless of the question'],0,'Give the listener a clear main idea.','A point plus support creates a meaningful response.'),
   P('Level 2 · Apply','Which opening is clearest for “Why did you choose engineering?”',['I chose engineering because I enjoy solving practical problems.','Engineering.','Maybe, I think, actually, yes.','It is a long story.'],0,'Answer the question directly.','The first response gives a direct point and reason.'),
   P('Level 3 · Verify','How can you check whether your spoken answer is effective?',['Check relevance, organisation, intelligibility and support.','Count only the number of words.','Speak faster.','Avoid examples.'],0,'Evaluate the response against communication criteria.','A useful check considers whether the listener can understand and follow the answer.'),
   P('Level 4 · Diagnose','A student gives correct ideas but listeners struggle to follow them. What should be checked first?',['Organisation, pacing and pronunciation','Only vocabulary difficulty','Only handwriting','The room colour'],0,'Meaning can be lost through delivery as well as grammar.','Organisation and intelligibility affect how easily listeners process the message.'),
   P('Level 5 · Transfer','Which answer best handles a follow-up question?',['Answer directly, give a reason or evidence, then clarify if needed.','Repeat the original answer unchanged.','Change the topic.','Give a memorised unrelated paragraph.'],0,'Adapt the response to the actual question.','Strong interaction requires responsive, relevant answers.')
  ],
  challenge:'Record a 60-second response to an engineering interview question. Review it for structure, fluency, pronunciation/intelligibility, grammar and direct response to the question.'
 },
 {
  id:6,
  lessons:[
   L('Professional tone','Professional tone is respectful, clear and appropriate to the relationship and purpose. Avoid unnecessary commands, slang or emotional wording.','Instead of “Send me the file now”, write “Could you please send the updated file before the meeting?”','Does the wording show respect while remaining clear about the action?'),
   L('Requests and responses','A professional request states what is needed, provides useful context or deadline and uses an appropriate level of politeness.','“Could you confirm the test schedule by 3 p.m.?” is clearer than “Let me know.”','Can the receiver identify exactly what action is requested?'),
   L('Clarification and confirmation','When information is unclear, ask a focused clarification question. Confirm important details rather than relying on assumptions.','“Do you mean the revised circuit diagram or the original version?” prevents an avoidable mistake.','What exact detail needs confirmation?'),
   L('Polite disagreement','Disagreement can be constructive when it acknowledges the other view and gives a reason or evidence for the alternative.','“I understand that concern. However, the test data suggest we should repeat the measurement.”','Can you disagree with the idea without attacking the person?'),
   L('Meetings and action points','A useful meeting contribution identifies decisions, owners and deadlines. Good communication turns discussion into clear next actions.','Decision: repeat test. Owner: Priya. Deadline: Friday 4 p.m.','Can another person act on your meeting note without asking what you meant?')
  ],
  drills:[
   D('Tone','Which is the most professional request?',['Send the file now.','Could you please send the updated file by 3 p.m.?','Give me that file.','I need it, okay?'],1,'The second option is polite, clear and time-specific.'),
   D('Clarification','Which question best clarifies an ambiguous instruction?',['What do you mean by “the report”? Which version should I use?','Okay.','I will guess.','Why are you unclear?'],0,'A focused clarification identifies the missing detail.'),
   D('Confirmation','Which response best confirms a deadline?',['So, to confirm, the report is due by 4 p.m. Friday?','Fine.','Whatever.','I think maybe.'],0,'Restating the critical detail checks shared understanding.'),
   D('Disagreement','Which response is constructive disagreement?',['That is wrong.','I see your point, but the test results suggest another approach.','Your idea is bad.','No.'],1,'It acknowledges the view and introduces evidence.'),
   D('Action Point','Which meeting note is most actionable?',['Discuss testing.','Repeat the vibration test — Arun — Friday 4 p.m.','Testing maybe later.','Someone should check it.'],1,'An action point needs task, owner and deadline.')
  ],
  practice:[
   P('Level 1 · Tone','Which feature is central to professional communication?',['Clarity and respectful tone','Slang','Unexplained commands','Personal attacks'],0,'Think about how the receiver will interpret the message.','Professional communication is clear and respectful.'),
   P('Level 2 · Apply','Rewrite “Send the results now” as a professional request.',['Could you please send the results before 3 p.m.?','Send results!!!','I want it now.','Results.'],0,'Keep the action and add appropriate politeness.','The first option preserves the request while improving tone.'),
   P('Level 3 · Verify','How can you check a professional request?',['Confirm that the receiver knows what, when and why if context requires it.','Make it as short as possible even if ambiguous.','Remove the deadline.','Use technical jargon everywhere.'],0,'A request should be actionable.','The receiver needs enough information to act correctly.'),
   P('Level 4 · Diagnose','A meeting ends with “We will fix it soon.” What is missing?',['A specific action, owner and deadline','More emotion','A longer sentence','A joke'],0,'Vague commitments are difficult to execute.','Action, ownership and timing turn discussion into execution.'),
   P('Level 5 · Transfer','Which response handles disagreement professionally?',['I understand the concern; however, the latest measurements support repeating the test.','That is a stupid idea.','No, you are wrong.','I refuse to discuss it.'],0,'Acknowledge, provide evidence and propose a constructive next step.','The first response preserves respect and focuses on evidence.')
  ],
  challenge:'Simulate a two-minute project meeting: request an update, clarify one ambiguity, disagree respectfully with one proposal and finish with two action points including owners and deadlines.'
 },
 {
  id:7,
  lessons:[
   L('Audience and purpose','Before presenting, decide who the audience is, what they already know and what you want them to understand or do.','A presentation to first-year students needs different explanations from a presentation to a laboratory supervisor.','Who is the audience and what should they remember?'),
   L('Presentation structure','A technical presentation needs a beginning, logical middle and clear conclusion. Organise information around a message rather than around slides alone.','Problem → proposed solution → evidence → limitation → conclusion is a useful engineering structure.','Can a listener predict where your presentation is going?'),
   L('Signposting','Signposting phrases tell the audience how ideas are connected: “first”, “next”, “the key point is”, “finally”.','“First I will explain the problem. Next I will show our design. Finally I will discuss the test result.”','Can listeners identify the structure from your spoken transitions?'),
   L('Visual-to-verbal balance','Slides should support the speaker, not replace the speaker. Explain the meaning of a graph or image instead of reading every word on the screen.','For a graph, state the trend, important comparison and implication rather than reading every axis label aloud.','What should the audience notice in the visual?'),
   L('Handling questions','Listen fully to the question, check its meaning if necessary and answer directly. If evidence is unavailable, say so rather than inventing an answer.','“I do not have that measurement yet; we can verify it in the next test.”','Can you answer confidently without pretending to know unsupported information?')
  ],
  drills:[
   D('Audience','Before preparing a presentation, what should you identify?',['Audience and purpose','Font colour only','Number of animations','Slide background'],0,'Audience and purpose determine content and level of explanation.'),
   D('Structure','Which sequence is coherent for a design presentation?',['Problem → solution → evidence → conclusion','Conclusion → unrelated joke → problem','Five definitions with no purpose','Slides in random order'],0,'A logical structure supports comprehension.'),
   D('Signposting','Which phrase signals a transition to the next stage?',['Next, I will explain the test results.','Um, anyway.','Whatever.','I forgot.'],0,'The phrase explicitly guides the audience.'),
   D('Visuals','When showing an engineering graph, what should the speaker do?',['Explain the important trend and implication.','Read every label aloud.','Ignore the graph.','Describe only its colour.'],0,'The speaker adds interpretation rather than duplicating the slide.'),
   D('Questions','What should you do if you do not know an answer?',['State the limitation honestly and explain how it can be verified.','Invent a number.','Change the subject.','Pretend not to hear.'],0,'Professional credibility depends on transparent limits.')
  ],
  practice:[
   P('Level 1 · Purpose','What is the purpose of a presentation opening?',['Orient the audience to the topic and purpose','Give every detail immediately','Read the entire slide','Avoid stating the topic'],0,'The opening gives listeners a map.','A clear opening establishes topic, purpose and structure.'),
   P('Level 2 · Apply','Which signpost best introduces the evidence section?',['Now I will present the test results supporting our design.','Here is some stuff.','Look at this.','Next thing.'],0,'Name the stage and its purpose.','The first option tells the audience what they will hear and why.'),
   P('Level 3 · Verify','How can you test whether a presentation is understandable?',['Ask whether a listener can state the main message and evidence.','Count the animations.','Increase text on every slide.','Speak without pauses.'],0,'Check listener understanding, not slide decoration.','Audience recall of the message is evidence of communication effectiveness.'),
   P('Level 4 · Diagnose','A slide contains a paragraph of text and the speaker reads it word-for-word. What is the main issue?',['The visual is replacing rather than supporting the explanation.','The topic is necessarily wrong.','The room is too large.','The speaker needs more animations.'],0,'Slides and speech should have complementary roles.','The speaker should interpret and explain rather than simply duplicate the slide.'),
   P('Level 5 · Transfer','A question asks for evidence you have not collected. What is the strongest response?',['I do not have that evidence yet; we would need to measure it before making that claim.','The answer is definitely 90%.','I will guess.','That question is irrelevant.'],0,'Protect accuracy by distinguishing evidence from assumption.','Transparent limits are part of professional technical communication.')
  ],
  challenge:'Prepare and deliver a three-minute engineering presentation with a clear opening, three signposts, one visual explanation, one limitation and a concise conclusion.'
 },
 {
  id:8,
  lessons:[
   L('Entering a discussion','Join a group discussion by listening for a natural opening and contributing something relevant. Avoid interrupting a speaker who is still completing an idea.','“May I add one point about the testing requirement?” signals a relevant contribution.','Can you enter the discussion without taking control of it?'),
   L('Building on ideas','Good discussion is cumulative. Refer to another speaker’s idea, then add evidence, an example, a qualification or a different implication.','“Building on Anu’s point, the cost data also suggest that…”','Does your contribution connect to what was already said?'),
   L('Agreeing and disagreeing','Agreement can identify the reason for agreement; disagreement should focus on ideas and evidence.','“I agree because the test results support that conclusion.” / “I see the point, but the sample is too small.”','Can you state your reason rather than only saying yes or no?'),
   L('Evidence-based contribution','Strong discussion contributions distinguish evidence from personal preference. Use examples, measurements or stated constraints when available.','“The prototype failed twice under the same load, so reliability should be considered.”','What evidence supports your claim?'),
   L('Summarising decisions','A discussion should end with a shared understanding of what was decided, what remains unresolved and what happens next.','“We agree to repeat the test tomorrow; the uncertainty is still the sample size.”','Can you summarise the decision without changing someone’s meaning?')
  ],
  drills:[
   D('Entry','Which is an appropriate way to enter a discussion?',['May I add one point about the testing requirement?','Stop talking.','Listen to me now.','I have something better.'],0,'The first phrase requests a turn respectfully and signals relevance.'),
   D('Build','Which contribution best builds on another idea?',['Building on that point, the cost data also support the proposal.','I disagree.','Anyway, my topic is different.','That reminds me of lunch.'],0,'It connects directly to the previous contribution.'),
   D('Disagree','Which is respectful disagreement?',['I see the point, but the sample size is too small to support that conclusion.','That is stupid.','You are wrong.','No way.'],0,'Focus on evidence and reasoning, not the person.'),
   D('Evidence','Which statement uses evidence?',['The prototype failed twice under the same load.','I just feel it will fail.','Everyone knows it.','It looks bad.'],0,'A repeated observed result is evidence.'),
   D('Summary','Which closing statement best summarises a decision?',['We agreed to repeat the test tomorrow, with Arun responsible for the setup.','So, yeah, okay.','Someone will do it.','We talked a lot.'],0,'A useful summary states the decision and responsibility.')
  ],
  practice:[
   P('Level 1 · Participate','What makes a discussion contribution effective?',['Relevance to the current idea','Speaking the longest','Interrupting frequently','Changing the topic'],0,'Participation should move the discussion forward.','Relevant contributions help the group reason together.'),
   P('Level 2 · Apply','Which phrase builds on another speaker?',['Building on your point, I would add that the test data show…','I have nothing to add.','You are wrong.','Listen to me.'],0,'Acknowledge and extend the previous idea.','The first phrase connects your contribution to the group’s reasoning.'),
   P('Level 3 · Verify','How can you check whether a discussion claim is well supported?',['Identify the evidence or reason offered for it.','Count how loudly it was said.','Choose the most confident speaker.','Assume agreement proves it.'],0,'Claims need reasons or evidence.','A supported claim can be traced to relevant evidence or reasoning.'),
   P('Level 4 · Diagnose','A group repeatedly disagrees without giving reasons. What is the main problem?',['The discussion lacks evidence-based reasoning.','The group needs louder voices.','The topic is automatically impossible.','Everyone should stop speaking.'],0,'Disagreement needs reasons to become productive.','Without reasons, the group cannot evaluate competing claims.'),
   P('Level 5 · Transfer','What should a discussion leader do at the end?',['Summarise decisions, unresolved points and next actions.','Choose a winner without evidence.','End suddenly.','Repeat every sentence spoken.'],0,'Close by converting discussion into shared understanding.','A concise summary makes the outcome actionable.')
  ],
  challenge:'Conduct a four-person discussion on an engineering decision. Each participant must contribute evidence, respond to another view and finish with a jointly agreed action summary.'
 },
 {
  id:9,
  lessons:[
   L('Purpose and audience','Professional writing begins by deciding what the reader needs to know and what action or understanding should result.','A project update should help a supervisor understand status, risk and next action quickly.','Who will read this and what do they need from it?'),
   L('Email structure','A professional email normally needs a useful subject line, greeting, purpose, essential context, requested action and closing.','Subject: Test report — vibration results and next step. Then state the finding and requested action directly.','Can the reader understand the purpose from the first two sentences?'),
   L('Paragraph control','A paragraph should develop one main idea with supporting information. Avoid mixing unrelated issues in one block of text.','One paragraph can report the test result; the next can explain the limitation and next action.','Does each paragraph have one clear purpose?'),
   L('Reports and minutes','Reports organise evidence and conclusions; minutes record decisions, actions, owners and deadlines. Match the document structure to its purpose.','Minutes: Decision — repeat test. Owner — Meena. Deadline — Friday 4 p.m.','Could another person act from the document without asking for clarification?'),
   L('Editing for clarity','Edit in passes: content first, then structure, grammar, word choice and final proofreading. Remove repetition and vague wording.','Replace “things were done” with the specific action: “The team repeated the temperature test at 60°C.”','Can you replace vague words with observable actions or evidence?')
  ],
  drills:[
   D('Purpose','What should a project update communicate?',['Current status, important issue and next action','Every historical detail','Personal feelings only','Unrelated information'],0,'The reader needs the information required to understand and act.'),
   D('Email','Which subject line is most useful?',['Update','Important!!!','Vibration test results — action required','Hello'],2,'A useful subject identifies the topic and purpose.'),
   D('Paragraph','Which principle improves paragraph clarity?',['One main idea per paragraph','Mix every topic together','Avoid topic sentences','Repeat the same sentence'],0,'A focused paragraph is easier to follow.'),
   D('Minutes','Which action point is complete?',['Repeat test — Meena — Friday 4 p.m.','Test soon','Someone check it','Discuss later'],0,'Task, owner and deadline make the action actionable.'),
   D('Editing','Which revision is most precise?',['Things were done.','The team repeated the temperature test at 60°C.','Stuff happened.','The work was kind of completed.'],1,'The second sentence states an observable action and condition.')
  ],
  practice:[
   P('Level 1 · Purpose','What is the first question to ask before writing a professional message?',['Who is the reader and what is the purpose?','Which font is largest?','How many emojis can be used?','How long can the message be?'],0,'Audience and purpose control content.','Professional writing is purposeful and audience-aware.'),
   P('Level 2 · Apply','Which email opening is clearest?',['I am writing to report the vibration test result and request approval for a repeat test.','Hi, just some stuff.','You need to know this.','Important matter.'],0,'State purpose directly.','The first opening gives purpose and requested action.'),
   P('Level 3 · Verify','How can you check a technical update for clarity?',['A reader should be able to identify status, evidence, issue and next action.','Make every sentence longer.','Remove all numbers.','Use more jargon.'],0,'Test the document against the reader’s information needs.','A useful update supports understanding and action.'),
   P('Level 4 · Diagnose','A report contains accurate data but readers cannot see the conclusion. What should be improved?',['Structure and signposting','More unrelated data','Longer sentences','Decorative formatting only'],0,'Evidence needs an understandable structure.','Clear organisation helps readers connect evidence to the conclusion.'),
   P('Level 5 · Transfer','Which sentence is strongest for a technical update?',['The test failed badly.','The prototype exceeded the vibration limit at 80% load; the team will repeat the test after reinforcing the mount.','Things were not good.','We will see what happens.'],1,'State evidence, condition and next action.','The second sentence is specific, measurable and action-oriented.')
  ],
  challenge:'Write a 150-word project update containing a precise subject line, current status, two evidence-based findings, one limitation, one action, an owner and a deadline.'
 },
 {
  id:10,
  lessons:[
   L('Multiple-source information','Integrated communication requires combining information from different modes without losing source boundaries. Identify what came from the spoken briefing, written note or data table.','A project briefing says a test is complete while the data note says one measurement remains uncertain. Both facts should be represented accurately.','Can you distinguish source information before combining it?'),
   L('Briefing and response','A professional briefing prioritises the information the listener needs to understand the situation and act.','State the decision, strongest evidence, unresolved issue and next action in that order when time is limited.','What information is essential if you have only 45 seconds?'),
   L('Evidence selection','Not every fact deserves equal attention. Select evidence by relevance, reliability and direct connection to the decision.','A single measured failure under the required load may matter more than several unrelated observations.','Why is this evidence relevant to the decision?'),
   L('Professional synthesis','Synthesis combines sources into a coherent message while preserving uncertainty and contradictions. Do not hide a limitation simply because it complicates the conclusion.','“The prototype met the response-time target, but the test used only five trials, so reliability remains uncertain.”','Can you state both the conclusion and its limitation?'),
   L('Final communication check','Before delivering or submitting an integrated message, check accuracy, relevance, organisation, tone, grammar and intelligibility.','Compare your final statement against the original sources and remove claims that cannot be supported.','Can every important claim in your final message be traced to evidence?')
  ],
  drills:[
   D('Source Trace','When combining a briefing and a written note, what should you do first?',['Identify which source supports each important fact.','Blend all facts without checking.','Use only the most recent sentence.','Ignore contradictions.'],0,'Source tracing prevents accidental distortion.'),
   D('Briefing','What should a short engineering briefing prioritise?',['Decision, strongest evidence, limitation and next action','Every minor detail','Personal opinion only','Background unrelated to the decision'],0,'Time-limited communication needs prioritisation.'),
   D('Evidence','Which evidence is most relevant to a load-capacity decision?',['Measured performance under the required load','The colour of the prototype','An unrelated meeting time','A general slogan'],0,'Evidence should connect directly to the decision criterion.'),
   D('Synthesis','Which statement shows responsible synthesis?',['The prototype met the target, but only five trials were completed.','The prototype is definitely perfect.','Only the positive result matters.','The limitation should be hidden.'],0,'A defensible synthesis includes both conclusion and relevant limitation.'),
   D('Final Check','What final check is most important?',['Trace important claims back to their evidence and check clarity.','Add more claims.','Remove all limitations.','Use the longest possible sentences.'],0,'Traceability and clarity protect accuracy.')
  ],
  practice:[
   P('Level 1 · Identify','What is the key feature of integrated communication?',['Combining information accurately across modes','Repeating one source only','Ignoring uncertainty','Using maximum technical jargon'],0,'Integration requires accurate synthesis.','Integrated communication combines sources while preserving meaning and evidence.'),
   P('Level 2 · Apply','You have 45 seconds to brief a supervisor. What should you prioritise?',['Decision, strongest evidence, limitation and next action','Every detail in the report','A long background story','Personal feelings'],0,'Prioritise information that supports action.','The first option gives the supervisor the decision-relevant information.'),
   P('Level 3 · Verify','How can you verify an integrated briefing?',['Trace each important claim to its source or evidence.','Assume all sources agree.','Remove all numbers.','Speak faster.'],0,'Traceability is the key verification step.','A claim should be supported by the source or evidence attributed to it.'),
   P('Level 4 · Diagnose','Two sources disagree about a measurement. What should you do?',['State the discrepancy and identify what must be checked.','Choose the larger number silently.','Hide the disagreement.','Average them without explanation.'],0,'Conflicting evidence must remain visible until resolved.','The discrepancy itself is important information requiring verification.'),
   P('Level 5 · Transfer','Which conclusion is most defensible?',['The design meets the response-time target in five trials, but more trials are needed to assess reliability.','The design is proven perfect.','The design will always work.','The data do not matter.'],0,'State evidence and its limitation.','The first conclusion matches the available evidence without overclaiming.')
  ],
  challenge:'Read a short project note, listen to a spoken update and inspect a small data table. Produce a five-sentence written briefing and a 60-second spoken summary containing the decision, two supporting facts, one limitation and the next action.'
 }
]);
