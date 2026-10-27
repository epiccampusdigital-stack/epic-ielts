// 30-day residential programme: Korea scholarship batch 1. Day 1 = Fri 30 Oct 2026.
// Whole-day swap: a day is either an English day or a Korean day, never both.
// Every day has two sessions: morning 8:30 to 11:30 (3 hours) and afternoon 1:00 to 4:30 (3.5 hours).
// English days: 1, 4, 6, 8 ... 30 (Day 1, then every even day from Day 4). Korean days: 2, 3, 5, 7 ... 29.
// Days 2 and 3 are both Korean because no English teacher is free on Sat 31 Oct and Sun 1 Nov.
// English Teacher 1 (Anna) teaches mornings only and leaves at 11:30.
// English Teacher 2 is free Mon morning, Tue all day, Wed and Thu daytime (no evenings), never Saturday.
// Week 1 (Days 1, 4, 6) is the grammar foundation: parts of speech, sentence patterns, pronouns,
// prepositions, tenses and conjunctions, mainly with English Teacher 2.
// Everything here is a starting point: the tracker lets admins change any day, session or teacher.

const PLAN_ID = 'plan-v3-whole-day';

const PROGRAM = {
  name: 'Korea Scholarship Batch 1 (30-day residential)',
  startDate: '2026-10-30',
  totalDays: 30,
  dayStartTime: '08:30',
  dayEndTime: '19:30',
  koreanSiteUrl: 'https://estudy-topik.info-belearn.chatgpt.site',
  remindMinutes: 30,
};

// Teacher slots. Names/phones are filled in by the admin in the tracker.
const TEACHERS = [
  { key: 'EN_MORNING', name: 'English Teacher 1', subject: 'ENGLISH', focus: 'Anna. English mornings 8:30 to 11:30: grammar, writing & speaking (mornings only, leaves 11:30)', confirmed: true },
  { key: 'EN_SPEAKING', name: 'English Teacher 2', subject: 'ENGLISH', focus: 'Week 1 grammar foundation, mock interviews. Free Mon morning, Tue all day, Wed & Thu daytime. Not Saturdays, no evenings', confirmed: true },
  { key: 'EN_LISTENING', name: 'English Teacher 3', subject: 'ENGLISH', focus: 'English afternoons 1:00 to 4:30: reading, vocabulary, listening & IT lab', confirmed: true },
  { key: 'EN_SUPPORT', name: 'English Teacher 4 (TBC)', subject: 'ENGLISH', focus: 'Cover teacher if someone cannot come', confirmed: false },
  { key: 'KR_1', name: 'Korean Teacher 1', subject: 'KOREAN', focus: 'Korean mornings (staff)', confirmed: true },
  { key: 'KR_2', name: 'Korean Teacher 2', subject: 'KOREAN', focus: 'Korean afternoons & Korean IT lab (staff)', confirmed: true },
];

const EN = 'EN', KR = 'KR';
const ENGLISH_DAYS = [1, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
const langOf = day => (ENGLISH_DAYS.includes(day) ? EN : KR);

// English days. am / pm: { title, parts: [[start, end, title, detail]], teacher }
// Morning lessons: grammar & writing 8:30-10:00, break, speaking 10:15-11:30.
// Afternoon lessons: reading 1:00-2:00, break, listening 2:15-3:15, break, IT lab 3:30-4:30.
const ENGLISH = {
  1: { theme: 'Welcome + placement + parts of speech', week: 1 },
  4: { theme: 'Foundation: sentence patterns + pronouns & prepositions', week: 1 },
  6: { theme: 'Foundation: tenses + conjunctions', week: 1, quiz: true },
  8: { theme: 'Home & my town', g: 'there is / there are; prepositions of place', s: 'Describe your home', r: 'Places in town', l: 'Following directions on a map' },
  10: { theme: 'Food & shopping', g: 'Countable / uncountable; some / any', s: 'Ordering in a café or restaurant', r: 'Clothes, prices and shops', l: 'Week 2 review: a day in the city' },
  12: { theme: 'Now and last weekend', g: 'Present continuous vs present simple', s: 'Describing a picture', r: 'Weekend activities', l: 'A weekend story', mock: 1 },
  14: { theme: 'Yesterday & school', g: 'Past simple of be (was / were)', s: 'Where were you yesterday?', r: 'School subjects and education', l: 'Students talk about school', quiz: true },
  16: { theme: 'Mid-programme test', test: 'MID' },
  18: { theme: 'Travel & health', g: 'Past simple; first, then, after that, finally', s: 'Telling a short travel story', r: 'Body, health and the doctor', l: 'At the clinic' },
  20: { theme: 'Plans & careers', g: 'be going to; future time expressions', s: 'Talking about plans', r: 'Jobs and careers', l: 'Advice for a new student', mock: 2 },
  22: { theme: 'Studying in Korea', g: 'Comparatives and superlatives', s: 'Comparing countries and universities', r: 'Rules, culture and daily life', l: 'Phone calls and appointments', quiz: true },
  24: { theme: 'Emails & goals', g: 'Formal vs informal emails', s: 'Polite requests', r: 'Personality and skills', l: 'Students describe their goals' },
  26: { theme: 'The scholarship interview', g: 'Answer structure: point, reason, example', s: 'Have you ever...? (present perfect)', r: 'Phrases for a personal statement', l: 'Feedback on personal statements', mock: 3, quiz: true },
  28: { theme: 'Final test + final mock interviews', test: 'FINAL' },
  30: { theme: 'Graduation day', graduation: true },
};

// Korean: two topics a day (morning, afternoon). The Korean teachers own this and can change it in the tracker.
const KOREAN_TOPICS = [
  'Hangul: basic vowels', 'Hangul: basic consonants', 'Hangul: combined vowels', 'Hangul: aspirated & tense consonants',
  'Hangul: batchim (final consonants)', 'Reading practice + greetings', 'Self-introduction: 저는 ~입니다',
  '이에요/예요, family words', 'Sino-Korean numbers', 'Native numbers & age', 'Time & dates', 'Week 2 review + quiz',
  '있어요/없어요, places', 'Location words (앞, 뒤, 옆)', 'Mid-programme Korean check', 'Present tense 아요/어요',
  'Food & ordering', 'Shopping & money', 'Past tense', 'Daily routine in Korean', 'Transport & directions',
  'Weather & seasons', 'TOPIK I: test format', 'TOPIK I: core vocabulary', 'TOPIK I: listening practice',
  'TOPIK I: reading practice', 'Korean self-introduction for interviews', 'University life in Korean',
  'Final Korean test', 'Graduation speech in Korean',
];
const KOREAN_DAYS = Array.from({ length: 30 }, (_, i) => i + 1).filter(d => langOf(d) === KR);
const koreanFor = day => {
  const k = KOREAN_DAYS.indexOf(day);
  return k < 0 ? null : { am: KOREAN_TOPICS[k * 2], pm: KOREAN_TOPICS[k * 2 + 1] };
};

// One evening activity a week, run by campus staff (no teacher cost)
const EVENINGS = {
  1: { subject: 'ACTIVITY', language: null, title: 'Welcome night & icebreakers', description: 'Run by campus staff.' },
  5: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #1: "This is me" (2 min each)', description: 'Run by campus staff. Students use the sentences they built in the week 1 foundation lessons.' },
  11: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #1: City life or village life?', description: 'Run by campus staff.' },
  17: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #2: "My best memory"', description: 'Run by campus staff.' },
  23: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #2: Is studying abroad worth it?', description: 'Run by campus staff.' },
  30: { subject: 'ACTIVITY', language: null, title: 'Graduation ceremony & certificates', description: 'Run by campus staff with all teachers invited.' },
};

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const FOUNDATION = {
  1: { pm: ['Foundation 1: parts of speech', 'The 8 parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection. What each one does in a sentence.'] },
  4: {
    am: ['Foundation 2: sentence patterns', 'How English sentences are built: subject + verb (+ object / complement / place). Word order, questions and negatives with be and do.'],
    pm: ['Foundation 3: pronouns & prepositions', 'Subject, object and possessive pronouns; this / that; prepositions of time (at, on, in) and place (in, on, under, next to, between).'],
  },
  6: {
    am: ['Foundation 4: tenses', 'The tense timeline: present simple and continuous, past simple, future (will / going to), a first look at present perfect.'],
    pm: ['Foundation 5: conjunctions & joining sentences', 'and, but, or, so, because, when, before, after. Joining short sentences into longer ones. Week 1 review quiz.'],
  },
};

function englishFocusText(day) {
  const en = ENGLISH[day];
  if (FOUNDATION[day]) {
    return Object.values(FOUNDATION[day]).map(([t, d]) => `${t}: ${d}`).join('\n');
  }
  if (en.test) return en.test === 'MID' ? 'Mid-programme test: language, reading & writing (morning); listening & speaking (afternoon).' : 'Final test: language, reading & writing (morning). Afternoon: final test listening + final mock interviews.';
  if (en.graduation) return 'Final English presentations, programme review, graduation.';
  return `Grammar & writing: ${en.g}\nSpeaking: ${en.s}\nReading & vocab: ${en.r}\nListening: ${en.l}`;
}

function itLabTaskFor(day) {
  if (langOf(day) === KR) {
    const k = koreanFor(day);
    return `Korean: practise "${k.am}" and "${k.pm}" on the Korean site.`;
  }
  const en = ENGLISH[day];
  if (en.test) return 'English: no new lesson, test review.';
  if (en.graduation) return 'Free practice; finish any missed lessons.';
  let t = `English: General English > Learn > the "${en.theme}" lesson, then do its practice questions.`;
  if (en.quiz) t += ' Then take the weekly General English quiz under Practice.';
  return t;
}

function buildDays() {
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const k = koreanFor(day);
    return {
      dayNumber: day,
      date: addDays(PROGRAM.startDate, i),
      theme: langOf(day) === EN ? `English day: ${ENGLISH[day].theme}` : `Korean day: ${k.am}`,
      englishFocus: langOf(day) === EN ? englishFocusText(day) : 'Korean day (no English class)',
      koreanFocus: k ? `Morning: ${k.am}\nAfternoon: ${k.pm}` : 'English day (no Korean class)',
      itLabTask: itLabTaskFor(day),
    };
  });
}

const MOCK_DESC = 'English Teacher 2 takes students one by one to a side room, 7 minutes each plus written feedback. The rest of the class carries on with the afternoon lesson.';

function buildSessions() {
  const sessions = [];
  for (let day = 1; day <= 30; day++) {
    const add = s => sessions.push({ dayNumber: day, ...s });
    const lunch = () => add({ startTime: '11:30', endTime: '13:00', subject: 'BREAK', language: null, title: 'Lunch' });

    if (langOf(day) === KR) {
      const k = koreanFor(day);
      const test = k.am.includes('Final Korean test') || k.am.includes('Mid-programme');
      add({ startTime: '08:30', endTime: '10:00', subject: test ? 'ASSESSMENT' : 'KOREAN', language: KR, title: `Korean: ${k.am}`, teacher: 'KR_1' });
      add({ startTime: '10:00', endTime: '10:15', subject: 'BREAK', language: null, title: 'Tea break' });
      add({ startTime: '10:15', endTime: '11:30', subject: 'KOREAN', language: KR, title: `Korean practice: ${k.am}`, teacher: 'KR_1' });
      lunch();
      add({ startTime: '13:00', endTime: '14:30', subject: 'KOREAN', language: KR, title: `Korean: ${k.pm}`, teacher: 'KR_2' });
      add({ startTime: '14:30', endTime: '14:45', subject: 'BREAK', language: null, title: 'Short break' });
      add({ startTime: '14:45', endTime: '15:30', subject: 'KOREAN', language: KR, title: `Korean practice: ${k.pm}`, teacher: 'KR_2' });
      add({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: KR, title: 'IT lab: Korean practice', description: itLabTaskFor(day), link: 'KOREAN_SITE', teacher: 'KR_2' });
    } else {
      const en = ENGLISH[day];
      const enLab = (teacher) => ({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: EN, title: 'IT lab: English practice', description: itLabTaskFor(day), link: '/learn', teacher });
      const brk = (s, e, t = 'Tea break') => add({ startTime: s, endTime: e, subject: 'BREAK', language: null, title: t });

      if (day === 1) {
        add({ startTime: '08:30', endTime: '09:00', subject: 'ADMIN', language: null, title: 'Welcome & orientation', description: 'Rules, timetable, rooms, site logins.' });
        add({ startTime: '09:00', endTime: '10:45', subject: 'ASSESSMENT', language: EN, title: 'English placement test, parts 1 to 3 (IT lab)', description: 'Grammar, vocabulary and reading; listening; writing. On epicielts.live (it opens on first login).', teacher: 'EN_MORNING' });
        brk('10:45', '11:00');
        add({ startTime: '11:00', endTime: '11:30', subject: 'ENGLISH', language: EN, title: 'Getting to know you', description: 'Names, introductions, what the 30 days look like.', teacher: 'EN_MORNING' });
        lunch();
        add({ startTime: '13:00', endTime: '14:00', subject: 'ASSESSMENT', language: EN, title: 'Placement part 4: speaking (one by one)', description: '5 minutes each. Students who are waiting start the parts of speech worksheet.', teacher: 'EN_SPEAKING' });
        brk('14:00', '14:15', 'Short break');
        add({ startTime: '14:15', endTime: '16:30', subject: 'ENGLISH', language: EN, title: FOUNDATION[1].pm[0], description: FOUNDATION[1].pm[1], teacher: 'EN_SPEAKING' });
      } else if (FOUNDATION[day]) {
        const [at, ad] = FOUNDATION[day].am, [pt, pd] = FOUNDATION[day].pm;
        const amT = 'EN_SPEAKING';
        const pmT = day === 6 ? 'EN_SPEAKING' : 'EN_LISTENING';
        add({ startTime: '08:30', endTime: '10:00', subject: 'ENGLISH', language: EN, title: `${at} (part 1)`, description: ad, teacher: amT });
        brk('10:00', '10:15');
        add({ startTime: '10:15', endTime: '11:30', subject: 'ENGLISH', language: EN, title: `${at} (part 2: practice)`, description: 'Build, speak and write sentences with today\'s patterns.', teacher: amT });
        lunch();
        add({ startTime: '13:00', endTime: '14:30', subject: 'ENGLISH', language: EN, title: `${pt} (part 1)`, description: pd, teacher: pmT });
        brk('14:30', '14:45', 'Short break');
        add({ startTime: '14:45', endTime: '15:30', subject: 'ENGLISH', language: EN, title: `${pt} (part 2: practice)`, description: day === 6 ? 'Practice, then the week 1 review quiz.' : 'Practice in pairs and on paper.', teacher: pmT });
        add({ ...enLab(pmT), description: 'English: General English > Learn, grammar lessons; repeat today\'s worksheet tasks on screen.' });
      } else if (en.test) {
        const mid = en.test === 'MID' ? 'Mid-programme' : 'Final';
        add({ startTime: '08:30', endTime: '10:00', subject: 'ASSESSMENT', language: EN, title: `${mid} English test: language & reading`, teacher: 'EN_MORNING' });
        brk('10:00', '10:15');
        add({ startTime: '10:15', endTime: '11:30', subject: 'ASSESSMENT', language: EN, title: `${mid} English test: writing`, teacher: 'EN_MORNING' });
        lunch();
        add({ startTime: '13:00', endTime: '14:00', subject: 'ASSESSMENT', language: EN, title: `${mid} English test: listening`, teacher: 'EN_LISTENING' });
        brk('14:00', '14:15', 'Short break');
        if (en.test === 'MID') {
          add({ startTime: '14:15', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: 'Mid-programme test: speaking (one by one) + IT lab review', description: 'Students not being tested review their weak areas in the IT lab.', teacher: 'EN_LISTENING' });
        } else {
          add({ startTime: '14:15', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: 'Final mock interviews (counts as the final speaking test)', description: MOCK_DESC, teacher: 'EN_SPEAKING' });
        }
      } else if (en.graduation) {
        add({ startTime: '08:30', endTime: '10:00', subject: 'ACTIVITY', language: EN, title: 'Final English presentations (part 1)', teacher: 'EN_MORNING' });
        brk('10:00', '10:15');
        add({ startTime: '10:15', endTime: '11:30', subject: 'ACTIVITY', language: EN, title: 'Final English presentations (part 2)', teacher: 'EN_MORNING' });
        lunch();
        add({ startTime: '13:00', endTime: '14:30', subject: 'ENGLISH', language: EN, title: 'Programme review: what we learned + feedback forms', teacher: 'EN_LISTENING' });
        brk('14:30', '14:45', 'Short break');
        add({ startTime: '14:45', endTime: '16:30', subject: 'ACTIVITY', language: EN, title: 'Graduation rehearsal & speeches practice', teacher: 'EN_LISTENING' });
      } else {
        add({ startTime: '08:30', endTime: '10:00', subject: 'ENGLISH', language: EN, title: 'English: Grammar & writing', description: `${en.theme}. ${en.g}`, teacher: 'EN_MORNING' });
        brk('10:00', '10:15');
        add({ startTime: '10:15', endTime: '11:30', subject: 'ENGLISH', language: EN, title: 'English: Speaking', description: `${en.theme}. ${en.s}`, teacher: 'EN_MORNING' });
        lunch();
        add({ startTime: '13:00', endTime: '14:00', subject: 'ENGLISH', language: EN, title: 'English: Reading & vocabulary', description: `${en.theme}. ${en.r}`, teacher: 'EN_LISTENING' });
        brk('14:00', '14:15', 'Short break');
        add({ startTime: '14:15', endTime: '15:15', subject: 'ENGLISH', language: EN, title: 'English: Listening', description: `${en.theme}. ${en.l}`, teacher: 'EN_LISTENING' });
        brk('15:15', '15:30', 'Short break');
        add(enLab('EN_LISTENING'));
        if (en.mock) {
          // Runs alongside the afternoon lesson, in a side room
          add({ startTime: '13:00', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: `Mock scholarship interview round ${en.mock} (side room)`, description: MOCK_DESC, teacher: 'EN_SPEAKING' });
        }
      }
    }

    const ev = EVENINGS[day];
    if (ev) add({ startTime: '18:30', endTime: '19:30', ...ev });
  }
  return sessions;
}

module.exports = { PLAN_ID, PROGRAM, TEACHERS, ENGLISH, ENGLISH_DAYS, KOREAN_TOPICS, langOf, koreanFor, buildDays, buildSessions, addDays };
