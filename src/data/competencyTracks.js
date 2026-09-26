export const INTERNATIONAL_STANDARDS = Object.freeze({
  communication: { framework:'CEFR Companion Volume 2020', target:'B1-B2 progression', evidence:['receptive','productive','interactive','mediation'] },
  engineering: { framework:'ABET Engineering Accreditation Criteria 2026-2027', evidence:['problem solving','design','communication','professional responsibility','teamwork','experimentation','lifelong learning'] },
  computing: { framework:'CS2023 ACM/IEEE-CS/AAAI', evidence:['problem analysis','implementation','evaluation','professional communication','responsible practice'] },
  assessment: { principles:['construct alignment','clear stem','single defensible key','plausible distractors','appropriate difficulty','authentic context','transparent scoring','feedback for learning'] }
});

export const COMPETENCY_TRACKS = Object.freeze([
  { id:'communication', title:'Communication', modules:['Grammar & Usage','Listening','Speaking & GD','Professional Communication'], activityModel:['Learn','Watch','Practice','Knowledge Check','Challenge','Assessment'] },
  { id:'aptitude', title:'Aptitude', modules:['Quantitative Aptitude','Logical Reasoning','Data Interpretation','Problem Solving'], activityModel:['Learn','Worked Example','Practice','Timed Drill','Challenge','Assessment'] },
  { id:'core-engineering', title:'Core Engineering', modules:['Engineering Fundamentals','Branch Concepts','Diagram Interpretation','Engineering Decisions'], activityModel:['Concept','Example','Simulation/Diagram','Practice','Scenario','Assessment'] },
  { id:'c-programming', title:'C Programming', modules:['C Fundamentals','Strings','Arrays & Functions','Pointers','Algorithms','Coding Challenges'], activityModel:['Learn','Observe Code','Practice','Compile','Hidden-Test Challenge','Assessment'] },
  { id:'problem-solving', title:'Problem Solving', modules:['Problem Decomposition','Patterns','Algorithms','Debugging','Complexity'], activityModel:['Learn','Observe','Practice','Debug','Challenge','Assessment'] },
  { id:'analytical-skills', title:'Reading & Listening / Analytical Skills', modules:['Reading','Listening','Inference','Critical Reasoning','Information Analysis'], activityModel:['Read/Listen','Understand','Practice','Analyse','Challenge','Assessment'] }
]);
