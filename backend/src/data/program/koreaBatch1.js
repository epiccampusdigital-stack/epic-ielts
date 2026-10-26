// 30-day residential programme: Korea scholarship batch 1.
// Two teaching blocks a day: a 4-hour block (8:30 to 12:30) and a 3-hour block (1:30 to 4:30).
// The languages swap every day, so English and Korean get the same time (105 hours each).
// Odd days: English morning, Korean afternoon. Even days: Korean morning, English afternoon.
// The last part of every block is IT lab practice of that block's lesson. Day 1 = Fri 30 Oct 2026.
// Everything here is a starting point: the tracker lets admins edit any day or session.

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
  // Teacher 1 is available before 1 PM only: she teaches the English morning block on odd days (ends 12:30)
  { key: 'EN_MORNING', name: 'English Teacher 1', subject: 'ENGLISH', focus: 'English morning block on odd days: grammar, writing & speaking (mornings only)', confirmed: true },
  { key: 'EN_SPEAKING', name: 'English Teacher 2', subject: 'ENGLISH', focus: 'Mock scholarship interviews and final presentations', confirmed: true },
  { key: 'EN_LISTENING', name: 'English Teacher 3', subject: 'ENGLISH', focus: 'English afternoon block on even days: reading, vocabulary & listening', confirmed: true },
  { key: 'EN_SUPPORT', name: 'English Teacher 4 (TBC)', subject: 'ENGLISH', focus: 'Cover teacher if someone cannot come', confirmed: false },
  { key: 'KR_1', name: 'Korean Teacher 1', subject: 'KOREAN', focus: 'Korean lessons (staff)', confirmed: true },
  { key: 'KR_2', name: 'Korean Teacher 2', subject: 'KOREAN', focus: 'Korean practice & Korean IT lab (staff)', confirmed: true },
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

// One evening activity a week, run by campus staff (no teacher cost)
const EVENINGS = {
  1: { subject: 'ACTIVITY', language: null, title: 'Welcome night & icebreakers', description: 'Run by campus staff.' },
  5: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #1: "This is me" (2 min each)', description: 'Run by campus staff. Students use their Day 3 and Day 5 writing.' },
  11: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #1: City life or village life?', description: 'Run by campus staff.' },
  17: { subject: 'ACTIVITY', language: 'EN', title: 'Presentation night #2: "My best memory"', description: 'Run by campus staff.' },
  23: { subject: 'ACTIVITY', language: 'EN', title: 'Debate night #2: Is studying abroad worth it?', description: 'Run by campus staff.' },
  30: { subject: 'ACTIVITY', language: null, title: 'Graduation ceremony & certificates', description: 'Run by campus staff with all teachers invited.' },
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

// Daily template: a 4-hour block and a 3-hour block, languages swap every day.
function buildSessions() {
  const sessions = [];
  ENGLISH.forEach((en, i) => {
    const day = i + 1;
    const odd = day % 2 === 1;
    const kr = KOREAN[i];
    const add = s => sessions.push({ dayNumber: day, ...s });
    const enLab = { subject: 'IT_LAB', language: 'EN', title: 'IT lab: English practice', description: itLabTaskFor(day, en).split(' Korean:')[0], link: '/learn' };
    const krLab = { subject: 'IT_LAB', language: 'KR', title: 'IT lab: Korean practice', description: `Practise "${kr}" on the Korean site.`, link: 'KOREAN_SITE' };
    const mid = en.test === 'MID' ? 'Mid-programme' : 'Final';

    if (odd) {
      // 8:30 to 12:30 English (4 hours), English Teacher 1
      if (day === 1) {
        add({ startTime: '08:30', endTime: '09:00', subject: 'ADMIN', language: null, title: 'Welcome & orientation', description: 'Rules, timetable, rooms, site logins.' });
        add({ startTime: '09:00', endTime: '11:00', subject: 'ASSESSMENT', language: 'EN', title: 'English placement test, parts 1 to 3 (IT lab)', description: 'Grammar, vocabulary and reading; listening; writing. On epicielts.live (it opens on first login).', teacher: 'EN_MORNING' });
        add({ startTime: '11:00', endTime: '11:15', subject: 'BREAK', language: null, title: 'Tea break' });
        add({ startTime: '11:15', endTime: '12:30', subject: 'ENGLISH', language: 'EN', title: 'Placement part 4 (speaking) + English: Speaking', description: `${en.theme}. ${en.s}`, teacher: 'EN_MORNING' });
      } else if (en.test) {
        add({ startTime: '08:30', endTime: '10:30', subject: 'ASSESSMENT', language: 'EN', title: `${mid} English test: reading & writing`, teacher: 'EN_MORNING' });
        add({ startTime: '10:30', endTime: '10:45', subject: 'BREAK', language: null, title: 'Tea break' });
        add({ startTime: '10:45', endTime: '12:30', subject: 'ASSESSMENT', language: 'EN', title: `${mid} English test: listening & speaking`, teacher: 'EN_MORNING' });
      } else {
        add({ startTime: '08:30', endTime: '10:30', subject: 'ENGLISH', language: 'EN', title: 'English: Grammar & writing', description: `${en.theme}. ${en.g}`, teacher: 'EN_MORNING' });
        add({ startTime: '10:30', endTime: '10:45', subject: 'BREAK', language: null, title: 'Tea break' });
        if (MOCK_INTERVIEW_DAYS[day]) {
          add({ startTime: '10:45', endTime: '12:30', subject: 'ASSESSMENT', language: 'EN', title: `Mock scholarship interview round ${MOCK_INTERVIEW_DAYS[day]}`, description: 'One-to-one, 7 minutes each, written feedback in session notes.', teacher: 'EN_SPEAKING' });
        } else {
          add({ startTime: '10:45', endTime: '11:45', subject: 'ENGLISH', language: 'EN', title: 'English: Speaking', description: `${en.theme}. ${en.s}`, teacher: 'EN_MORNING' });
          add({ startTime: '11:45', endTime: '12:30', ...enLab, teacher: 'EN_MORNING' });
        }
      }
      add({ startTime: '12:30', endTime: '13:30', subject: 'BREAK', language: null, title: 'Lunch' });
      // 1:30 to 4:30 Korean (3 hours)
      add({ startTime: '13:30', endTime: '15:30', subject: en.test ? 'ASSESSMENT' : 'KOREAN', language: 'KR', title: en.test ? kr : `Korean: ${kr}`, teacher: 'KR_1' });
      add({ startTime: '15:30', endTime: '15:45', subject: 'BREAK', language: null, title: 'Short break' });
      add({ startTime: '15:45', endTime: '16:30', ...krLab, teacher: 'KR_2' });
    } else {
      // 8:30 to 12:30 Korean (4 hours)
      add({ startTime: '08:30', endTime: '10:30', subject: 'KOREAN', language: 'KR', title: en.graduation ? 'Final Korean presentations' : `Korean: ${kr}`, teacher: 'KR_1' });
      add({ startTime: '10:30', endTime: '10:45', subject: 'BREAK', language: null, title: 'Tea break' });
      const krPractice = (day === 20) ? 'Korean mock interview: self-introduction' : en.graduation ? 'Graduation speech practice in Korean' : `Korean practice: ${kr}`;
      add({ startTime: '10:45', endTime: '11:45', subject: 'KOREAN', language: 'KR', title: krPractice, teacher: 'KR_2' });
      add({ startTime: '11:45', endTime: '12:30', ...krLab, teacher: 'KR_2' });
      add({ startTime: '12:30', endTime: '13:30', subject: 'BREAK', language: null, title: 'Lunch' });
      // 1:30 to 4:30 English (3 hours), English Teacher 3
      if (en.graduation) {
        add({ startTime: '13:30', endTime: '15:00', subject: 'ACTIVITY', language: 'EN', title: 'Final English presentations', teacher: 'EN_LISTENING' });
        add({ startTime: '15:00', endTime: '16:30', subject: 'ASSESSMENT', language: 'EN', title: 'Final mock interviews', teacher: 'EN_SPEAKING' });
      } else {
        add({ startTime: '13:30', endTime: '14:45', subject: 'ENGLISH', language: 'EN', title: 'English: Reading & vocabulary', description: `${en.theme}. ${en.r}`, teacher: 'EN_LISTENING' });
        add({ startTime: '14:45', endTime: '15:00', subject: 'BREAK', language: null, title: 'Short break' });
        if (MOCK_INTERVIEW_DAYS[day]) {
          add({ startTime: '15:00', endTime: '16:30', subject: 'ASSESSMENT', language: 'EN', title: `Mock scholarship interview round ${MOCK_INTERVIEW_DAYS[day]}`, description: 'One-to-one, 7 minutes each, written feedback in session notes.', teacher: 'EN_SPEAKING' });
        } else {
          add({ startTime: '15:00', endTime: '15:45', subject: 'ENGLISH', language: 'EN', title: 'English: Listening', description: `${en.theme}. ${en.l}`, teacher: 'EN_LISTENING' });
          add({ startTime: '15:45', endTime: '16:30', ...enLab, teacher: 'EN_LISTENING' });
        }
      }
    }

    // One evening a week, run by campus staff
    const ev = EVENINGS[day];
    if (ev) add({ startTime: '18:30', endTime: '19:30', ...ev });
  });
  return sessions;
}

module.exports = { PROGRAM, TEACHERS, ENGLISH, KOREAN, buildDays, buildSessions, addDays };
