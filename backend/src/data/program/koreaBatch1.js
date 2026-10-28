// 30-day residential programme: Korea scholarship batch 1. Day 1 = Fri 30 Oct 2026.
// Plan v5 (29 Oct): built around English Teacher 1 (Anna), who teaches 9:00 to 12:00 on
// Wednesdays, Thursdays and Saturdays only (12 days, from Wed 4 Nov).
// Each day has a morning and an afternoon session, each in one language:
//   - Anna's days: English 9:00-12:00 (grammar & writing, speaking), Korean 1:00-4:30.
//   - Other days: Korean 8:30-11:30, English 1:00-4:30 with English Teacher 3 (reading, listening, IT lab).
//   - Week 1 (Days 1, 4, 5): grammar foundation with English Teacher 2 (Mon morning, Tue all day).
//   - Days 2, 3, 15 and 29 are all-Korean days. About 30 sessions of each language.
// English Teacher 2: Mon morning, Tue all day, Wed/Thu daytime, never Saturday, no evenings.
// Everything here is a starting point: the tracker lets admins change any day, session or teacher.

const PLAN_ID = 'plan-v5-anna-wed-thu-sat';

const PROGRAM = {
  name: 'Korea Scholarship Batch 1 (30-day residential)',
  startDate: '2026-10-30',
  totalDays: 30,
  dayStartTime: '08:30',
  dayEndTime: '19:30',
  koreanSiteUrl: 'https://estudy-topik.info-belearn.chatgpt.site',
  remindMinutes: 30,
};

const TEACHERS = [
  { key: 'EN_MORNING', name: 'English Teacher 1', subject: 'ENGLISH', focus: 'Anna. Wed, Thu & Sat 9:00 to 12:00: grammar & writing, speaking, mid and final tests, final presentations (12 days)', confirmed: true },
  { key: 'EN_SPEAKING', name: 'English Teacher 2', subject: 'ENGLISH', focus: 'Week 1 grammar foundation + all mock interviews. Free Mon morning, Tue all day, Wed & Thu daytime. Not Saturdays, no evenings', confirmed: true },
  { key: 'EN_LISTENING', name: 'English Teacher 3', subject: 'ENGLISH', focus: 'English afternoons 1:00 to 4:30: reading, vocabulary, listening & IT lab', confirmed: true },
  { key: 'EN_SUPPORT', name: 'English Teacher 4 (TBC)', subject: 'ENGLISH', focus: 'Cover teacher if someone cannot come', confirmed: false },
  { key: 'KR_1', name: 'Korean Teacher 1', subject: 'KOREAN', focus: 'Korean mornings (staff)', confirmed: true },
  { key: 'KR_2', name: 'Korean Teacher 2', subject: 'KOREAN', focus: 'Korean afternoons & Korean IT lab (staff)', confirmed: true },
];

const EN = 'EN', KR = 'KR';
const ANNA_DAYS = [6, 7, 9, 13, 14, 16, 20, 21, 23, 27, 28, 30];

// English themes: Anna teaches grammar & writing + speaking, Teacher 3 teaches reading + listening.
const THEMES = {
  T1: { theme: 'Home & my town', g: 'there is / there are; prepositions of place', s: 'Describe your home', r: 'Places in town', l: 'Following directions on a map' },
  T2: { theme: 'Food & shopping', g: 'Countable / uncountable; some / any', s: 'Ordering in a café or restaurant', r: 'Clothes, prices and shops', l: 'Week 2 review: a day in the city' },
  T3: { theme: 'Now and last weekend', g: 'Present continuous vs present simple', s: 'Describing a picture', r: 'Weekend activities', l: 'A weekend story' },
  T4: { theme: 'Yesterday & school', g: 'Past simple of be (was / were)', s: 'Where were you yesterday?', r: 'School subjects and education', l: 'Students talk about school' },
  T5: { theme: 'Travel & health', g: 'Past simple; first, then, after that, finally', s: 'Telling a short travel story', r: 'Body, health and the doctor', l: 'At the clinic' },
  T6: { theme: 'Plans & careers', g: 'be going to; future time expressions', s: 'Talking about plans', r: 'Jobs and careers', l: 'Advice for a new student' },
  T7: { theme: 'Studying in Korea', g: 'Comparatives and superlatives', s: 'Comparing countries and universities', r: 'Rules, culture and daily life', l: 'Phone calls and appointments' },
  T8: { theme: 'Emails & goals', g: 'Formal vs informal emails', s: 'Polite requests', r: 'Personality and skills', l: 'Students describe their goals' },
  T9: { theme: 'The scholarship interview', g: 'Answer structure: point, reason, example', s: 'Have you ever...? (present perfect)', r: 'Phrases for a personal statement', l: 'Feedback on personal statements' },
};

// What happens in each half day. EN_AM: Anna (9-12). EN_PM: Teacher 3 (1-4:30). Korean slots are numbered in order.
const PLAN = {
  1: { am: 'D1_AM', pm: 'D1_PM' },
  2: { am: 'KR', pm: 'KR' }, 3: { am: 'KR', pm: 'KR' },
  4: { am: 'F2', pm: 'F3' }, 5: { am: 'F4', pm: 'F5' },
  6: { am: 'A:T1', pm: 'KR' }, 7: { am: 'A:T2', pm: 'KR' }, 8: { am: 'KR', pm: 'P:T1' },
  9: { am: 'A:T3', pm: 'KR' }, 10: { am: 'KR', pm: 'P:T2' }, 11: { am: 'KR', pm: 'P:T3' },
  12: { am: 'KR', pm: 'P:T4:mock1' }, 13: { am: 'A:T4', pm: 'KR' }, 14: { am: 'A:MID', pm: 'P:MID' },
  15: { am: 'KR', pm: 'KR' }, 16: { am: 'A:T5', pm: 'KR' }, 17: { am: 'KR', pm: 'P:T5' },
  18: { am: 'KR', pm: 'P:REVIEW3' }, 19: { am: 'KR', pm: 'P:T6:mock2' }, 20: { am: 'A:T6', pm: 'KR' },
  21: { am: 'A:T7', pm: 'KR' }, 22: { am: 'KR', pm: 'P:T7' }, 23: { am: 'A:T8', pm: 'KR' },
  24: { am: 'KR', pm: 'P:T8' }, 25: { am: 'KR', pm: 'P:T9' }, 26: { am: 'KR', pm: 'P:REVIEW4:mock3' },
  27: { am: 'A:T9', pm: 'KR' }, 28: { am: 'A:FINAL', pm: 'P:FINAL' }, 29: { am: 'KR', pm: 'KR' }, 30: { am: 'A:GRAD', pm: 'KR' },
};

// Korean follows the 24 EStudykorea site lessons and the 4 Korean workbooks, in this order.
const KOREAN_TOPICS = [
  'Hangul 1: alphabet warm-up + How Hangul works', 'Hangul 2: Six starting vowels', 'Hangul 3: The y-vowels', 'Hangul 4: Nine starting consonants',
  'Hangul 5: Air and consonants', 'Hangul 6: Tense consonants', 'Review: Hangul 1 to 6 + writing practice',
  'Hangul 7: Eleven more vowels', 'Hangul 8: Build and write blocks', 'Hangul 9: Final consonants: batchim', 'Hangul 10: Link sounds between blocks',
  'Hangul 11: Double finals and sound changes', 'Hangul 12: Read words and sentences', 'Mid-programme Korean check (Hangul)',
  'Beginner 1 lesson 1: Greetings & introductions', 'Beginner 1 lesson 2: What is this?', 'Beginner 1 lesson 3: Where is it?', 'Beginner 1 lesson 4: My everyday actions',
  'Beginner 1 lesson 5: Places & going out', 'Beginner 1 lesson 6: Numbers & prices', 'Review: Beginner 1 lessons 1 to 6',
  'Beginner 1 lesson 7: Shopping & quantities', 'Beginner 1 lesson 8: Time & routines', 'Beginner 1 lesson 9: What I do & do not do', 'Beginner 1 lesson 10: What I did yesterday',
  'Beginner 1 lesson 11: What I want to do', 'Beginner 1 lesson 12: Put it all together', 'Final Korean test', 'Korean self-introduction (graduation speech practice)',
];
const KR_SLOTS = [];
for (let d = 1; d <= 30; d++) for (const h of ['am', 'pm']) if (PLAN[d][h] === 'KR') KR_SLOTS.push(`${d}${h}`);
if (KR_SLOTS.length !== KOREAN_TOPICS.length) throw new Error(`Korean slots ${KR_SLOTS.length} vs topics ${KOREAN_TOPICS.length}`);
const koreanAt = (d, h) => { const i = KR_SLOTS.indexOf(`${d}${h}`); return i < 0 ? null : KOREAN_TOPICS[i]; };
const langOf = (d, h) => (PLAN[d][h] === 'KR' ? KR : EN);
const ENGLISH_DAYS = Object.keys(PLAN).map(Number).filter(d => langOf(d, 'am') === EN || langOf(d, 'pm') === EN);
const koreanFor = day => ({ am: koreanAt(day, 'am'), pm: koreanAt(day, 'pm') });
function englishLabel(code) {
  const [kind, t] = code.split(':');
  if (code === 'D1_AM') return 'Welcome + placement test';
  if (code === 'D1_PM') return 'Placement speaking + Foundation 1';
  if (/^F\d$/.test(code)) return FOUNDATION_TXT[code][0];
  if (t === 'MID') return kind === 'A' ? 'Mid-programme English test (part A)' : 'Mid-programme English test (part B)';
  if (t === 'FINAL') return kind === 'A' ? 'Final English test (part A)' : 'Final test listening + final mock interviews';
  if (t === 'GRAD') return 'Final English presentations';
  if (t === 'REVIEW3') return 'Review: travel & health, past tense';
  if (t === 'REVIEW4') return 'Review: interview language';
  return `${THEMES[t].theme} (${kind === 'A' ? 'grammar, writing & speaking' : 'reading & listening'})`;
}
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

const FOUNDATION_TXT = {
  F1: ['Foundation 1: parts of speech', 'The 8 parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection. What each one does in a sentence.'],
  F2: ['Foundation 2: sentence patterns', 'How English sentences are built: subject + verb (+ object / complement / place). Word order, questions and negatives with be and do.'],
  F3: ['Foundation 3: pronouns & prepositions', 'Subject, object and possessive pronouns; this / that; prepositions of time (at, on, in) and place (in, on, under, next to, between).'],
  F4: ['Foundation 4: tenses', 'The tense timeline: present simple and continuous, past simple, future (will / going to), a first look at present perfect.'],
  F5: ['Foundation 5: conjunctions & joining sentences', 'and, but, or, so, because, when, before, after. Joining short sentences into longer ones. Week 1 review quiz.'],
};

const MOCK_DESC = 'English Teacher 2 takes students one by one to a side room, 7 minutes each plus written feedback. The rest of the class carries on with the afternoon lesson.';
const wb = day => `Korean workbook ${day <= 8 ? 1 : day <= 15 ? 2 : day <= 22 ? 3 : 4}. Same lesson on the Korean site for the IT lab.`;
const enBook = day => `English workbook ${day <= 5 ? 1 : day <= 13 ? 2 : day <= 22 ? 3 : 4}.`;

function itLabTaskFor(day) {
  const p = PLAN[day];
  const kr = [koreanAt(day, 'am'), koreanAt(day, 'pm')].filter(Boolean);
  const out = [];
  if (p.pm !== 'KR') {
    const t = p.pm.split(':')[1];
    out.push(THEMES[t] ? `English: General English > Learn > "${THEMES[t].theme}", then its practice questions.` : 'English: General English > Learn, revise this week\'s lessons.');
  }
  if (kr.length) out.push(`Korean: practise ${kr.map(k => `"${k}"`).join(' and ')} on the Korean site.`);
  return out.join(' ');
}

function buildDays() {
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1, p = PLAN[day];
    const en = [p.am, p.pm].filter(x => x !== 'KR').map(englishLabel);
    const kr = koreanFor(day);
    return {
      dayNumber: day,
      date: addDays(PROGRAM.startDate, i),
      theme: en.length ? en.join(' + ') : `Korean day: ${kr.am}`,
      englishFocus: en.length ? en.map((x, j) => `${[p.am, p.pm].filter(y => y !== 'KR').length === 2 ? (j ? 'Afternoon' : 'Morning') : (p.am !== 'KR' ? 'Morning' : 'Afternoon')}: ${x}`).join('\n') : 'No English today',
      koreanFocus: [kr.am && `Morning: ${kr.am}`, kr.pm && `Afternoon: ${kr.pm}`].filter(Boolean).join('\n') || 'No Korean today',
      itLabTask: itLabTaskFor(day),
    };
  });
}

function buildSessions() {
  const sessions = [];
  for (let day = 1; day <= 30; day++) {
    const add = s => sessions.push({ dayNumber: day, ...s });
    const brk = (s, e, t = 'Tea break') => add({ startTime: s, endTime: e, subject: 'BREAK', language: null, title: t });
    const p = PLAN[day];
    const anna = p.am.startsWith('A:');

    // ---- morning
    if (p.am === 'KR') {
      const k = koreanAt(day, 'am'), test = /test|check/i.test(k);
      add({ startTime: '08:30', endTime: '10:00', subject: test ? 'ASSESSMENT' : 'KOREAN', language: KR, title: `Korean: ${k}`, description: wb(day), teacher: 'KR_1' });
      brk('10:00', '10:15');
      add({ startTime: '10:15', endTime: '11:30', subject: test ? 'ASSESSMENT' : 'KOREAN', language: KR, title: test ? `${k} (continued)` : `Korean practice: ${k}`, description: wb(day), teacher: 'KR_1' });
    } else if (p.am === 'D1_AM') {
      add({ startTime: '08:30', endTime: '09:00', subject: 'ADMIN', language: null, title: 'Welcome & orientation', description: 'Rules, timetable, rooms, site logins.' });
      add({ startTime: '09:00', endTime: '10:45', subject: 'ASSESSMENT', language: EN, title: 'English placement test, parts 1 to 3 (IT lab)', description: 'Grammar, vocabulary and reading; listening; writing. On epicielts.live (it opens on first login). Supervised by campus staff.' });
      brk('10:45', '11:00');
      add({ startTime: '11:00', endTime: '11:30', subject: 'ACTIVITY', language: EN, title: 'Getting to know you', description: 'Names, introductions, what the 30 days look like. Campus staff.' });
    } else if (/^F\d$/.test(p.am)) {
      const [t, d] = FOUNDATION_TXT[p.am];
      add({ startTime: '08:30', endTime: '10:00', subject: 'ENGLISH', language: EN, title: `${t} (part 1)`, description: `${d} ${enBook(day)}`, teacher: 'EN_SPEAKING' });
      brk('10:00', '10:15');
      add({ startTime: '10:15', endTime: '11:30', subject: 'ENGLISH', language: EN, title: `${t} (part 2: practice)`, description: 'Build, speak and write sentences with today\'s patterns.', teacher: 'EN_SPEAKING' });
    } else if (anna) {
      const t = p.am.split(':')[1];
      if (THEMES[t]) {
        add({ startTime: '09:00', endTime: '10:30', subject: 'ENGLISH', language: EN, title: 'English: Grammar & writing', description: `${THEMES[t].theme}. ${THEMES[t].g}. ${enBook(day)}`, teacher: 'EN_MORNING' });
        brk('10:30', '10:45');
        add({ startTime: '10:45', endTime: '12:00', subject: 'ENGLISH', language: EN, title: 'English: Speaking', description: `${THEMES[t].theme}. ${THEMES[t].s}`, teacher: 'EN_MORNING' });
      } else if (t === 'GRAD') {
        add({ startTime: '09:00', endTime: '10:30', subject: 'ACTIVITY', language: EN, title: 'Final English presentations (part 1)', teacher: 'EN_MORNING' });
        brk('10:30', '10:45');
        add({ startTime: '10:45', endTime: '12:00', subject: 'ACTIVITY', language: EN, title: 'Final English presentations (part 2) + programme review', teacher: 'EN_MORNING' });
      } else {
        const name = t === 'MID' ? 'Mid-programme' : 'Final';
        add({ startTime: '09:00', endTime: '10:30', subject: 'ASSESSMENT', language: EN, title: `${name} English test: language & reading`, teacher: 'EN_MORNING' });
        brk('10:30', '10:45');
        add({ startTime: '10:45', endTime: '12:00', subject: 'ASSESSMENT', language: EN, title: `${name} English test: writing`, teacher: 'EN_MORNING' });
      }
    }
    if (anna) add({ startTime: '08:30', endTime: '09:00', subject: 'ACTIVITY', language: null, title: 'Morning study time (self-study, campus staff)', description: 'Revise yesterday\'s workbook pages.' });
    add({ startTime: anna ? '12:00' : '11:30', endTime: '13:00', subject: 'BREAK', language: null, title: 'Lunch' });

    // ---- afternoon
    if (p.pm === 'KR') {
      const k = koreanAt(day, 'pm'), test = /test|check/i.test(k);
      add({ startTime: '13:00', endTime: '14:30', subject: test ? 'ASSESSMENT' : 'KOREAN', language: KR, title: `Korean: ${k}`, description: wb(day), teacher: 'KR_2' });
      brk('14:30', '14:45', 'Short break');
      add({ startTime: '14:45', endTime: '15:30', subject: test ? 'ASSESSMENT' : 'KOREAN', language: KR, title: test ? `${k} (continued)` : `Korean practice: ${k}`, teacher: 'KR_2' });
      add({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: KR, title: 'IT lab: Korean practice', description: itLabTaskFor(day), link: 'KOREAN_SITE', teacher: 'KR_2' });
    } else if (p.pm === 'D1_PM') {
      add({ startTime: '13:00', endTime: '14:00', subject: 'ASSESSMENT', language: EN, title: 'Placement part 4: speaking (one by one)', description: '5 minutes each. Students who are waiting start the parts of speech worksheet.', teacher: 'EN_SPEAKING' });
      brk('14:00', '14:15', 'Short break');
      add({ startTime: '14:15', endTime: '16:30', subject: 'ENGLISH', language: EN, title: FOUNDATION_TXT.F1[0], description: `${FOUNDATION_TXT.F1[1]} ${enBook(day)}`, teacher: 'EN_SPEAKING' });
    } else if (/^F\d$/.test(p.pm)) {
      const [t, d] = FOUNDATION_TXT[p.pm];
      const who = day === 4 ? 'EN_LISTENING' : 'EN_SPEAKING';
      add({ startTime: '13:00', endTime: '14:30', subject: 'ENGLISH', language: EN, title: `${t} (part 1)`, description: `${d} ${enBook(day)}`, teacher: who });
      brk('14:30', '14:45', 'Short break');
      add({ startTime: '14:45', endTime: '15:30', subject: 'ENGLISH', language: EN, title: `${t} (part 2: practice)`, description: p.pm === 'F5' ? 'Practice, then the week 1 review quiz.' : 'Practice in pairs and on paper.', teacher: who });
      add({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: EN, title: 'IT lab: English practice', description: 'General English > Learn, grammar lessons; repeat today\'s worksheet tasks on screen.', link: '/learn', teacher: who });
    } else {
      const [, t, mock] = p.pm.split(':');
      if (THEMES[t]) {
        add({ startTime: '13:00', endTime: '14:00', subject: 'ENGLISH', language: EN, title: 'English: Reading & vocabulary', description: `${THEMES[t].theme}. ${THEMES[t].r}. ${enBook(day)}`, teacher: 'EN_LISTENING' });
        brk('14:00', '14:15', 'Short break');
        add({ startTime: '14:15', endTime: '15:15', subject: 'ENGLISH', language: EN, title: 'English: Listening', description: `${THEMES[t].theme}. ${THEMES[t].l}`, teacher: 'EN_LISTENING' });
        brk('15:15', '15:30', 'Short break');
        add({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: EN, title: 'IT lab: English practice', description: itLabTaskFor(day), link: '/learn', teacher: 'EN_LISTENING' });
      } else if (t === 'MID' || t === 'FINAL') {
        const name = t === 'MID' ? 'Mid-programme' : 'Final';
        add({ startTime: '13:00', endTime: '14:00', subject: 'ASSESSMENT', language: EN, title: `${name} English test: listening`, teacher: 'EN_LISTENING' });
        brk('14:00', '14:15', 'Short break');
        if (t === 'MID') add({ startTime: '14:15', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: 'Mid-programme test: speaking (one by one) + IT lab review', description: 'Students not being tested review their weak areas in the IT lab.', teacher: 'EN_LISTENING' });
        else add({ startTime: '14:15', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: 'Final mock interviews (counts as the final speaking test)', description: MOCK_DESC, teacher: 'EN_SPEAKING' });
      } else {
        const what = t === 'REVIEW3' ? 'Week 3 review: travel, health and the past tense. Extra practice pages + weekly quiz.' : 'Interview language review: point, reason, example. Practise answers in pairs.';
        add({ startTime: '13:00', endTime: '14:30', subject: 'ENGLISH', language: EN, title: 'English: Review & extra practice', description: what, teacher: 'EN_LISTENING' });
        brk('14:30', '14:45', 'Short break');
        add({ startTime: '14:45', endTime: '15:30', subject: 'ENGLISH', language: EN, title: 'English: Speaking practice in pairs', teacher: 'EN_LISTENING' });
        add({ startTime: '15:30', endTime: '16:30', subject: 'IT_LAB', language: EN, title: 'IT lab: English practice', description: 'Weekly General English quiz under Practice.', link: '/learn', teacher: 'EN_LISTENING' });
      }
      if (mock) add({ startTime: '13:00', endTime: '16:30', subject: 'ASSESSMENT', language: EN, title: `Mock scholarship interview round ${mock.slice(-1)} (side room)`, description: MOCK_DESC, teacher: 'EN_SPEAKING' });
    }

    const ev = EVENINGS[day];
    if (ev) add({ startTime: '18:30', endTime: '19:30', ...ev });
  }
  return sessions;
}

const ENGLISH = {};
for (const [d, p] of Object.entries(PLAN)) {
  const parts = [p.am, p.pm].filter(x => x !== 'KR');
  if (parts.length) ENGLISH[d] = { theme: parts.map(x => englishLabel(x)).join(' + ') };
}

module.exports = { PLAN_ID, PROGRAM, TEACHERS, PLAN, THEMES, ANNA_DAYS, ENGLISH, ENGLISH_DAYS, KOREAN_TOPICS, langOf, koreanFor, koreanAt, buildDays, buildSessions, addDays };
