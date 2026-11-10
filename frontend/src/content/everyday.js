// "English for your day to day life" — content for the General English tab.
// Plain data so it is easy to add more lessons later.

export const EMAIL = {
  parts: [
    { name: 'Subject', what: 'A few words that say what the email is about.', ex: 'Subject: Introduction – GKS applicant, Mechanical Engineering' },
    { name: 'Greeting', what: 'Use the title and family name. Never "Hi" or "Hey" to a professor.', ex: 'Dear Professor Kim,' },
    { name: 'Who you are', what: 'One or two sentences: your name, where you are from, what you are doing.', ex: 'My name is Nimal Perera, and I am a student from Galle, Sri Lanka.' },
    { name: 'Why you are writing', what: 'Say your reason clearly and early.', ex: 'I am writing to introduce myself, as I am applying for the Global Korea Scholarship.' },
    { name: 'Details', what: 'Short facts that help: your interest, your study, your skills. Keep it short.', ex: 'I am very interested in your research on renewable energy.' },
    { name: 'Polite request', what: 'Ask one clear thing, politely.', ex: 'Would it be possible to ask you a few questions about your lab?' },
    { name: 'Closing line', what: 'Thank them and show you are waiting for a reply.', ex: 'Thank you for your time. I look forward to hearing from you.' },
    { name: 'Sign-off and name', what: 'A polite ending, then your full name and contact.', ex: 'Kind regards,\nNimal Perera\nnimal.perera@email.com' },
  ],
  formalInformal: [
    ['Hi / Hey', 'Dear Professor Kim,'],
    ['I want to…', 'I would like to…'],
    ['Can you…?', 'Could you please…? / Would it be possible to…?'],
    ['Tell me…', 'Please let me know…'],
    ['Sorry for…', 'I apologise for…'],
    ['Thanks!', 'Thank you for your time.'],
    ['Bye / See ya', 'Kind regards, / Best regards, / Yours sincerely,'],
    ['I got your email', 'Thank you for your email.'],
    ['ASAP', 'at your earliest convenience'],
  ],
  examples: [
    {
      title: 'Introducing yourself to a Korean professor',
      tag: 'Formal · Scholarship',
      subject: 'Introduction – GKS applicant interested in your lab',
      body: `Dear Professor Kim,

My name is Nimal Perera, and I am a 21-year-old student from Galle, Sri Lanka. I am writing to introduce myself, as I am applying for the Global Korea Scholarship (GKS) to study Mechanical Engineering at your university.

I have read about your research on renewable energy, and I am very interested in solar power systems. In school, I completed a small project on solar panels for village homes, and I would like to learn much more about this field.

Would it be possible to ask you a few questions about your lab and the kind of students you are looking for? I would be very grateful for any advice.

Thank you very much for your time. I look forward to hearing from you.

Kind regards,
Nimal Perera
Galle, Sri Lanka
nimal.perera@email.com`,
    },
    {
      title: 'Asking the university office about the dormitory',
      tag: 'Formal · Asking for information',
      subject: 'Question about dormitory move-in date',
      body: `Dear Sir or Madam,

My name is Sara Fernando, and I am a new international student starting in the Spring semester.

I would like to ask when I can move into the dormitory. My flight arrives in Seoul on 26 February. Could you please let me know if I can check in on that day?

Thank you for your help.

Best regards,
Sara Fernando
Student ID: 2027-1043`,
    },
    {
      title: 'Saying sorry: missing a class',
      tag: 'Formal · Apology',
      subject: 'Absence from class on Monday',
      body: `Dear Professor Lee,

I am sorry that I could not attend your class on Monday, 3 March. I had a high fever and went to the university clinic.

Could you please let me know what I missed and whether there is any homework? I will make sure to catch up before the next class.

Thank you for your understanding.

Kind regards,
Kavindu Silva`,
    },
    {
      title: 'Thank-you email after an interview',
      tag: 'Formal · Thank you',
      subject: 'Thank you for the interview',
      body: `Dear Dr. Park,

Thank you for taking the time to interview me yesterday. I enjoyed learning more about the programme and the research in your department.

Our conversation made me even more excited about the chance to study in Korea. Please let me know if you need any more information from me.

Thank you again.

Yours sincerely,
Dinesh Jayawardena`,
    },
    {
      title: 'A friendly email to a friend',
      tag: 'Informal · Friends',
      subject: 'Weekend plans?',
      body: `Hi Amal,

How are you? I hope your exams went well!

Are you free this Saturday? A few of us are going to the beach in Unawatuna. We're leaving at 9 in the morning. Do you want to come?

Let me know!

See you,
Ravi`,
    },
  ],
  mistakes: [
    ['Dear Kim,', 'Dear Professor Kim,', 'Use the title.'],
    ['hi sir i want to come ur lab', 'Dear Professor Kim, I would like to join your lab.', 'No text-message spelling. Use capitals and full words.'],
    ['Plz reply fast.', 'I look forward to hearing from you.', 'Never rush a professor.'],
    ['(No subject)', 'Subject: Question about the GKS application', 'Always write a subject.'],
    ['One very long paragraph', 'Short paragraphs with a blank line between them', 'Easy to read.'],
    ['From: coolboy1999@…', 'nimal.perera@…', 'Use a professional email address with your real name.'],
  ],
  checklist: [
    'Clear subject line',
    'Correct title and name (Professor / Dr. + family name)',
    'Who you are in the first sentence',
    'Why you are writing in the second sentence',
    'Short paragraphs',
    'One clear, polite request',
    'Thank you + a polite sign-off',
    'Full name and contact details',
    'Read it again out loud before you press Send',
  ],
};

export const CLAUDE = {
  intro: 'Claude is an AI assistant (claude.ai). It can explain grammar, check your writing, give you practice and answer questions in simple English. The better your question, the better the answer.',
  recipe: [
    { name: 'Who you are', ex: 'I am a Sri Lankan student, my English is A2 level.' },
    { name: 'What you want', ex: 'Explain the present perfect tense.' },
    { name: 'Details', ex: 'Use very simple words and 5 examples about studying in Korea.' },
    { name: 'The format', ex: 'Give me a short table, then 5 practice questions with answers at the end.' },
  ],
  badGood: [
    ['grammar', 'I am an A2 English learner. Explain when to use "a" and "an" with 6 simple examples, then give me 5 practice questions with answers.'],
    ['check this', 'Please check my email to a professor. Correct the mistakes, show my sentence and your sentence side by side, and explain each change in one short line.'],
    ['what is affect', 'What is the difference between "affect" and "effect"? Give 3 examples of each in simple English.'],
    ['ielts tips', 'I have IELTS Writing Task 1 next week. Give me 5 useful phrases to describe a line graph that goes up and down, with one example sentence each.'],
    ['words', 'Give me 10 useful English words for living in a student dormitory in Korea, with meanings and one example sentence each.'],
  ],
  prompts: [
    'Make me a 10-question quiz on the past simple. Give the answers at the end.',
    'Correct this sentence and explain why: "She don\'t like rice."',
    'Pretend you are a scholarship interviewer. Ask me one question at a time and give me feedback after each answer.',
    'Explain this sentence in simple words: "The results were inconclusive."',
    'Give me 5 polite ways to ask a teacher for help.',
    'Help me make my answer to "Why do you want to study in Korea?" better. Here is my answer: …',
    'Teach me 8 phrases I can use at a Korean convenience store, in English.',
  ],
  rules: [
    'Write your own work first. Use AI to check and improve it, not to copy.',
    'Never share passwords, bank details or your passport number.',
    'AI can make mistakes. Check important facts (dates, rules, prices) on the official website.',
    'If you do not understand the answer, ask: "Explain that more simply" or "Give me another example".',
    'Ask follow-up questions. It is a conversation.',
  ],
};

// More everyday situations: key phrases + a short model dialogue
export const SITUATIONS = [
  {
    title: 'Introducing yourself',
    phrases: ['Hi, I\'m … . Nice to meet you.', 'I\'m from Galle, in the south of Sri Lanka.', 'I\'m going to study … in Korea.', 'In my free time, I like …', 'How about you?'],
    dialogue: [['A', 'Hi, I\'m Ji-woo. Are you new here?'], ['B', 'Yes, I am. I\'m Nimal, from Sri Lanka. Nice to meet you.'], ['A', 'Nice to meet you too! What are you studying?'], ['B', 'Mechanical engineering. How about you?']],
  },
  {
    title: 'Short messages (WhatsApp / KakaoTalk)',
    phrases: ['Good morning, Ms Anna. I\'m sorry, I will be 10 minutes late today.', 'Thank you for today\'s class!', 'Could you please send me the homework?', 'Are we meeting at 3 or 4?', 'No problem, see you then.'],
    dialogue: [['You', 'Hi Sara, are you coming to the library later?'], ['Sara', 'Yes! Around 4. Is that OK?'], ['You', 'Perfect. See you at the entrance.']],
  },
  {
    title: 'At the airport',
    phrases: ['Here is my passport.', 'I\'m here to study at … University.', 'I will stay for four years.', 'Where can I find the airport bus to …?', 'How much is a ticket to …?'],
    dialogue: [['Officer', 'What is the purpose of your visit?'], ['You', 'I\'m here to study. I have a student visa.'], ['Officer', 'Which university?'], ['You', 'Chungbuk National University.']],
  },
  {
    title: 'Asking for directions',
    phrases: ['Excuse me, how do I get to the station?', 'Is it far from here?', 'Go straight, then turn left at the traffic lights.', 'It\'s next to / opposite / behind the bank.', 'Could you show me on the map, please?'],
    dialogue: [['You', 'Excuse me, where is the nearest subway station?'], ['Man', 'Go straight for two minutes and turn right. It\'s opposite the cafe.'], ['You', 'Thank you so much!']],
  },
  {
    title: 'Ordering food',
    phrases: ['Can I have …, please?', 'Is this spicy?', 'I don\'t eat pork / beef.', 'Could I have some water, please?', 'Can I pay by card?'],
    dialogue: [['Waiter', 'Are you ready to order?'], ['You', 'Yes. Can I have the chicken rice, please? Is it spicy?'], ['Waiter', 'A little.'], ['You', 'That\'s fine. And a bottle of water, please.']],
  },
  {
    title: 'At the doctor or pharmacy',
    phrases: ['I don\'t feel well.', 'I have a headache / a fever / a sore throat.', 'It started two days ago.', 'I\'m allergic to …', 'How many times a day should I take this?'],
    dialogue: [['Pharmacist', 'How can I help you?'], ['You', 'I have a sore throat and a cough. It started yesterday.'], ['Pharmacist', 'Take this twice a day after meals.'], ['You', 'Thank you. Should I see a doctor?']],
  },
  {
    title: 'Talking on the phone',
    phrases: ['Hello, this is … speaking.', 'Could I speak to …, please?', 'Sorry, could you repeat that, please?', 'Could you speak a little more slowly?', 'Thank you for your help. Goodbye.'],
    dialogue: [['Office', 'International Office, how can I help?'], ['You', 'Hello, this is Sara Fernando. I\'m calling about my student ID card.'], ['Office', 'One moment, please.']],
  },
  {
    title: 'Filling in forms',
    phrases: ['Surname / Family name = your last name', 'Given name / First name', 'Date of birth: 05/06/2004 (check if it is DD/MM or MM/DD!)', 'Nationality: Sri Lankan', 'Signature: sign your name, do not print it'],
    dialogue: [['Tip', 'Write in CAPITAL LETTERS if the form says "BLOCK CAPITALS".'], ['Tip', 'N/A = not applicable (it does not apply to you).']],
  },
];

export const WEBSITES = [
  { name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', what: 'Free lessons, videos, grammar and pronunciation. Try "6 Minute English".' },
  { name: 'British Council LearnEnglish', url: 'https://learnenglish.britishcouncil.org', what: 'Grammar, vocabulary, listening and reading practice at your level.' },
  { name: 'Cambridge Dictionary', url: 'https://dictionary.cambridge.org', what: 'Meanings, examples and pronunciation (UK and US).' },
  { name: 'News in Levels', url: 'https://www.newsinlevels.com', what: 'Real news written at 3 levels. Start with Level 1 or 2.' },
  { name: 'Breaking News English', url: 'https://breakingnewsenglish.com', what: 'Short news lessons with listening and activities.' },
  { name: 'YouGlish', url: 'https://youglish.com', what: 'Type a word and hear real people say it in YouTube videos.' },
  { name: 'Claude', url: 'https://claude.ai', what: 'Ask questions, check your writing and get practice. See the "How to use Claude" lesson.' },
  { name: 'Study in Korea (official)', url: 'https://www.studyinkorea.go.kr', what: 'Official site for studying in Korea and the Global Korea Scholarship.' },
];
