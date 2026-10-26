// 30-day residential programme: Korea scholarship batch 1.
// 50% English / 50% Korean teaching time. Day 1 = Fri 30 Oct 2026.
// Everything here is a starting point: the tracker lets admins edit any day or session.

const PROGRAM = {
  name: 'Korea Scholarship Batch 1 (30-day residential)',
  startDate: '2026-10-30',
  totalDays: 30,
  dayStartTime: '08:30',
  dayEndTime: '20:30',
  koreanSiteUrl: 'https://estudy-topik.info-belearn.chatgpt.site',
  remindMinutes: 30,
};

// Teacher slots. Names/phones are filled in by the admin in the tracker.
const TEACHERS = [
  // Teacher 1 is available before 1 PM only: every one of her sessions ends by 12:15
  { key: 'EN_MORNING', name: 'English Teacher 1', subject: 'ENGLISH', focus: 'Grammar, writing, reading & vocabulary (mornings only)', confirmed: true },
  { key: 'EN_SPEAKING', name: 'English Teacher 2', subject: 'ENGLISH', focus: 'Speaking & interviews', confirmed: true },
  { key: 'EN_LISTENING', name: 'English Teacher 3', subject: 'ENGLISH', focus: 'Listening & IT lab', confirmed: true },
  { key: 'EN_SUPPORT', name: 'English Teacher 4 (TBC)', subject: 'ENGLISH', focus: 'IT lab & evening clubs', confirmed: false },
  { key: 'KR_1', name: 'Korean Teacher 1', subject: 'KOREAN', focus: 'Korean (morning blocks)', confirmed: true },
  { key: 'KR_2', name: 'Korean Teacher 2 (optional)', subject: 'KOREAN', focus: 'Korean (afternoon blocks)', confirmed: false },
];

// English syllabus: one row per teaching day.
// g = grammar & writing, s = speaking, r = reading & vocabulary, l = listening
const ENGLISH = [
  // Week 1: Me and my world
  { theme: 'Hello! Introductions', g: 'Verb to be (am / is / are)', s: 'Greetings, introducing yourself, spelling your name', r: 'Alphabet, countries & nationalities', l: 'Listening to introductions' },
  { theme: 'Personal information', g: 'Wh- questions with be', s: 'Asking for and giving personal details', r: 'Numbers, phone numbers, email addresses', l: 'Taking down details on a form' },
  { theme: 'Family & people', g: 'have / has, possessive \'s, my/your/his/her', s: 'Talking about your family', r: 'Family words, describing people', l: 'A family photo conversation' },
  { theme: 'Daily routine', g: 'Present simple (I / you / we / they)', s: 'Describing your day', r: 'Daily activities, telling the time', l: 'Someone\'s daily schedule' },
  { theme: 'Free time & likes', g: 'Present simple he / she / it; like / love / hate + -ing', s: 'Talking about hobbies', r: 'Hobbies and sports vocabulary', l: 'Weekend plans conversation' },
  { theme: 'Week 1 review', g: 'Questions with do / does', s: 'Interview a classmate', r: 'Week 1 vocabulary review', l: 'Week 1 listening review', quiz: true },
  // Week 2: Daily life and places
  { theme: 'Home & rooms', g: 'there is / there are; prepositions of place', s: 'Describe your home', r: 'Rooms and furniture', l: 'Finding things in a house' },
  { theme: 'My town & directions', g: 'Imperatives for directions', s: 'Asking for and giving directions', r: 'Places in town', l: 'Following directions on a map' },
  { theme: 'Food & drink', g: 'Countable / uncountable; some / any', s: 'Ordering in a café or restaurant', r: 'Food and drink vocabulary', l: 'A restaurant order' },
  { theme: 'Shopping & money', g: 'How much / how many; this / that / these / those', s: 'Buying things, asking prices', r: 'Clothes, prices, shops', l: 'Conversations in a shop' },
  { theme: 'What\'s happening now?', g: 'Present continuous vs present simple', s: 'Describing a picture', r: 'Action verbs', l: 'Phone call: what are you doing?' },
  { theme: 'Week 2 review', g: 'Week 2 grammar review', s: 'Role-play: a day in town', r: 'Week 2 vocabulary review', l: 'Week 2 listening review', quiz: true },
  // Week 3: Past and experiences
  { theme: 'Yesterday', g: 'Past simple of be (was / were)', s: 'Where were you yesterday?', r: 'Time expressions: yesterday, last, ago', l: 'Where were they?' },
  { theme: 'Last weekend', g: 'Past simple regular verbs; -ed pronunciation', s: 'Talking about last weekend', r: 'Weekend activities', l: 'A weekend story' },
  { theme: 'Mid-programme check', g: 'Irregular verbs: the first 20', s: 'Short speaking check', r: 'Mid test: reading', l: 'Mid test: listening', test: 'MID' },
  { theme: 'School & education', g: 'Past simple irregular verbs', s: 'My school life', r: 'School subjects and education words', l: 'Students talk about school' },
  { theme: 'Travel stories', g: 'Sequencing: first, then, after that, finally', s: 'Telling a short travel story', r: 'Transport and travel vocabulary', l: 'A trip that went wrong' },
  { theme: 'Week 3 review + health', g: 'Week 3 grammar review', s: 'At the doctor role-play', r: 'Body and health words', l: 'Week 3 listening review', quiz: true },
  // Week 4: Future and plans
  { theme: 'My plans', g: 'be going to; future time expressions', s: 'Talking about plans', r: 'Plans and intentions vocabulary', l: 'Friends making plans' },
  { theme: 'Predictions & promises', g: 'will for predictions, offers and promises', s: 'What will life be like in Korea?', r: 'Jobs and careers', l: 'Predictions about the future' },
  { theme: 'Studying abroad', g: 'Comparatives and superlatives', s: 'Comparing countries and universities', r: 'University and campus words', l: 'A university open day' },
  { theme: 'Life in Korea', g: 'should / must / have to', s: 'Giving advice and talking about rules', r: 'Rules, culture and daily life', l: 'Advice for a new student' },
  { theme: 'Writing emails', g: 'Formal vs informal email language', s: 'Polite requests', r: 'Email phrases', l: 'A voicemail from a university office' },
  { theme: 'Week 4 review + phone calls', g: 'can / could for requests', s: 'Making an appointment by phone', r: 'Week 4 vocabulary review', l: 'Week 4 listening review', quiz: true },
  // Week 5: Scholarship ready
  { theme: 'Talking about experiences', g: 'Present perfect: ever / never', s: 'Have you ever...?', r: 'Experience vocabulary', l: 'Interview with a student abroad' },
  { theme: 'Strengths & goals', g: 'because / so / but; giving reasons', s: 'Talking about strengths and goals', r: 'Personality and skills words', l: 'Students describe their goals' },
  { theme: 'The scholarship interview', g: 'Answer structure: point, reason, example', s: 'Common interview questions', r: 'Interview language', l: 'A model scholarship interview' },
  { theme: 'Personal statement', g: 'Writing a 150-word personal statement', s: 'Reading your statement aloud', r: 'Statement phrases', l: 'Feedback on statements' },
  { theme: 'Final tests', g: 'Final test: writing', s: 'Final test: speaking', r: 'Final test: reading', l: 'Final test: listening', test: 'FINAL' },
  { theme: 'Graduation day', g: 'Final presentations', s: 'Final presentations', r: 'Programme review', l: 'Programme review', graduation: true },
];

// Suggested Korean focus. The Korean teacher owns this and can change it in the tracker.
const KOREAN = [
  'Hangul: basic vowels', 'Hangul: basic consonants', 'Hangul: combined vowels', 'Hangul: aspirated & tense consonants',
  'Hangul: batchim (final consonants)', 'Reading practice + greetings', 'Self-introduction: 저는 ~입니다',
  '이에요/예요, family words', 'Sino-Korean numbers', 'Native numbers & age', 'Time & dates', 'Week 2 review + quiz',
  '있어요/없어요, places', 'Location words (앞, 뒤, 옆)', 'Mid-programme Korean check', 'Present tense 아요/어요',
  'Food & ordering', 'Shopping & money', 'Past tense', 'Daily routine in Korean', 'Transport & directions',
  'Weather & seasons', 'TOPIK I: test format', 'TOPIK I: core vocabulary', 'TOPIK I: listening practice',
  'TOPIK I: reading practice', 'Korean self-introduction for interviews', 'University life in Korean',
  'Final Korean test', 'Graduation speech in Korean',
];

// Evening events that replace the default evening slot
const EVENINGS = {
  1: { subject: 'ACTIVITY', language: null, title: 'Welcome night & icebreakers' },
  5: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #1: "This is me" (2 min each)', teacher: 'EN_SPEAKING' },
  11: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #1: City life or village life?', teacher: 'EN_SPEAKING' },
  17: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #2: "My best memory"', teacher: 'EN_SPEAKING' },
  23: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #2: Is studying abroad worth it?', teacher: 'EN_SPEAKING' },
  29: { subject: 'ACTIVITY', language: null, title: 'Rehearsal for graduation presentations' },
  30: { subject: 'ACTIVITY', language: null, title: 'Graduation ceremony & certificates' },
};

const MOCK_INTERVIEW_DAYS = { 10: 1, 20: 2, 27: 3 };

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function itLabTaskFor(day, en) {
  if (en.test) return `English: no new lesson, test review. Korean: revise on the Korean site.`;
  if (en.graduation) return 'Free practice on both sites; finish any missed lessons.';
  let t = `English: General English > Learn > Day ${day} "${en.theme}" lesson, then do its practice questions.`;
  if (en.quiz) t += ' Then take the weekly General English quiz under Practice.';
  return t + ` Korean: practise "${KOREAN[day - 1]}" on the Korean site.`;
}

function buildDays() {
  return ENGLISH.map((en, i) => {
    const day = i + 1;
    return {
      dayNumber: day,
      date: addDays(PROGRAM.startDate, i),
      theme: en.theme,
      englishFocus: `Grammar & writing: ${en.g}\nSpeaking: ${en.s}\nReading & vocab: ${en.r}\nListening: ${en.l}`,
      koreanFocus: KOREAN[i],
      itLabTask: itLabTaskFor(day, en),
    };
  });
}

// Daily template. Teacher keys rotate so the 4 English teachers share the load by skill.
function buildSessions() {
  const sessions = [];
  ENGLISH.forEach((en, i) => {
    const day = i + 1;
    const odd = day % 2 === 1;
    const kr = KOREAN[i];
    const enA = odd ? { teacher: 'EN_MORNING', skill: 'Grammar & writing', topic: en.g } : { teacher: 'EN_MORNING', skill: 'Reading & vocabulary', topic: en.r };
    const enB = odd ? { teacher: 'EN_SPEAKING', skill: 'Speaking', topic: en.s } : { teacher: 'EN_LISTENING', skill: 'Listening', topic: en.l };
    const add = s => sessions.push({ dayNumber: day, ...s });

    // 08:30 warm-up (alternates language; evenings alternate the other way)
    if (day === 1) {
      add({ startTime: '08:30', endTime: '09:00', subject: 'ADMIN', language: null, title: 'Welcome & orientation', description: 'Rules, timetable, room allocation, site logins.' });
    } else {
      add(odd
        ? { startTime: '08:30', endTime: '09:00', subject: 'ACTIVITY', language: 'KR', title: 'Korean warm-up game', teacher: 'KR_1' }
        : { startTime: '08:30', endTime: '09:00', subject: 'ACTIVITY', language: 'EN', title: 'English warm-up game', teacher: enA.teacher });
    }

    // 09:00 English block A
    if (day === 1) {
      add({ startTime: '09:00', endTime: '10:30', subject: 'ASSESSMENT', language: 'EN', title: 'English placement test (IT lab)', description: 'Students take the placement test on epicielts.live.', teacher: 'EN_MORNING' });
    } else if (en.test) {
      add({ startTime: '09:00', endTime: '10:30', subject: 'ASSESSMENT', language: 'EN', title: `${en.test === 'MID' ? 'Mid-programme' : 'Final'} English test: reading & writing`, teacher: 'EN_MORNING' });
    } else if (en.graduation) {
      add({ startTime: '09:00', endTime: '10:30', subject: 'ACTIVITY', language: 'EN', title: 'Final English presentations', teacher: 'EN_MORNING' });
    } else {
      add({ startTime: '09:00', endTime: '10:30', subject: 'ENGLISH', language: 'EN', title: `English: ${enA.skill}`, description: `${en.theme}. ${enA.topic}`, teacher: enA.teacher });
    }
    add({ startTime: '10:30', endTime: '10:45', subject: 'BREAK', language: null, title: 'Tea break' });

    // 10:45 Korean block A
    add({
      startTime: '10:45', endTime: '12:15', subject: en.test ? 'ASSESSMENT' : 'KOREAN', language: 'KR',
      title: en.test ? kr : en.graduation ? 'Final Korean presentations' : `Korean: ${kr}`, teacher: 'KR_1',
    });
    add({ startTime: '12:15', endTime: '13:15', subject: 'BREAK', language: null, title: 'Lunch' });

    // 13:15 English block B (mock interviews replace it on interview days)
    if (MOCK_INTERVIEW_DAYS[day]) {
      add({ startTime: '13:15', endTime: '14:45', subject: 'ASSESSMENT', language: 'EN', title: `Mock scholarship interview round ${MOCK_INTERVIEW_DAYS[day]}`, description: 'One-to-one, 7 minutes each, written feedback in session notes.', teacher: 'EN_SPEAKING' });
    } else if (en.test) {
      add({ startTime: '13:15', endTime: '14:45', subject: 'ASSESSMENT', language: 'EN', title: `${en.test === 'MID' ? 'Mid-programme' : 'Final'} English test: listening & speaking`, teacher: 'EN_LISTENING' });
    } else if (en.graduation) {
      add({ startTime: '13:15', endTime: '14:45', subject: 'ASSESSMENT', language: 'EN', title: 'Final mock interviews', teacher: 'EN_SPEAKING' });
    } else {
      add({ startTime: '13:15', endTime: '14:45', subject: 'ENGLISH', language: 'EN', title: `English: ${enB.skill}`, description: `${en.theme}. ${enB.topic}`, teacher: enB.teacher });
    }
    add({ startTime: '14:45', endTime: '15:00', subject: 'BREAK', language: null, title: 'Short break' });

    // 15:00 Korean block B
    const krBTitle = (day === 20 || day === 27) ? 'Korean mock interview: self-introduction'
      : en.graduation ? 'Graduation speech practice in Korean'
      : en.test ? 'Korean test review' : `Korean practice: ${kr}`;
    add({ startTime: '15:00', endTime: '16:30', subject: 'KOREAN', language: 'KR', title: krBTitle, teacher: 'KR_2' });
    add({ startTime: '16:30', endTime: '16:45', subject: 'BREAK', language: null, title: 'Tea break' });

    // IT lab: practice what was taught today
    add({ startTime: '16:45', endTime: '17:45', subject: 'IT_LAB', language: 'EN', title: 'IT lab: English practice', description: itLabTaskFor(day, en).split(' Korean:')[0], teacher: odd ? 'EN_LISTENING' : 'EN_SUPPORT', link: '/learn' });
    add({ startTime: '17:45', endTime: '18:45', subject: 'IT_LAB', language: 'KR', title: 'IT lab: Korean practice', description: `Practise "${kr}" on the Korean site.`, teacher: odd ? 'KR_2' : 'KR_1', link: 'KOREAN_SITE' });
    add({ startTime: '18:45', endTime: '19:30', subject: 'BREAK', language: null, title: 'Dinner' });

    // 19:30 evening
    const ev = EVENINGS[day];
    if (ev) {
      add({ startTime: '19:30', endTime: '20:30', ...ev });
    } else if (odd) {
      add({ startTime: '19:30', endTime: '20:30', subject: 'ACTIVITY', language: 'EN', title: 'English evening: games & conversation club', teacher: 'EN_SUPPORT' });
    } else {
      add({ startTime: '19:30', endTime: '20:30', subject: 'ACTIVITY', language: 'KR', title: 'Korean evening: culture, songs & vocab games', teacher: 'KR_1' });
    }
  });
  return sessions;
}

module.exports = { PROGRAM, TEACHERS, ENGLISH, KOREAN, buildDays, buildSessions, addDays };
