const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modules = [
  {
    title: 'Grammar',
    description: 'Master the grammar patterns that appear most in IELTS',
    icon: '📝',
    color: '#4F46E5',
    order: 1,
    lessons: [
      {
        title: 'Articles: A, An, The',
        order: 1,
        estimatedMin: 8,
        content: `## Why this matters for IELTS
Sri Lankan students commonly lose marks in Writing because of article errors. Examiners notice these immediately.

## The Rules

**A / An** — use when mentioning something for the first time, or when it could be any one of many:
- "A student needs to practise every day."
- "She wrote an essay about the environment."

**The** — use when both speaker and listener know which specific thing you mean:
- "The essay she wrote was excellent." (we already mentioned it)
- "The government should invest in education." (there is only one government)

**Nothing (zero article)** — use with general plural nouns and uncountable nouns when speaking generally:
- "Students need motivation." (students in general)
- "Water is essential for life." (water in general)

## Examples

❌ "The life is difficult for the students in the rural areas."
✅ "Life is difficult for students in rural areas."

❌ "She has a good knowledge of the grammar."
✅ "She has a good knowledge of grammar."

❌ "The unemployment is a serious problem."
✅ "Unemployment is a serious problem."

## Practice Questions

1. "___ government announced new policies." (A / The / nothing)
2. "___ education is important for all children." (A / The / nothing)
3. "He wrote ___ interesting report." (a / an / the)
4. "___ report he wrote was excellent." (A / An / The)
5. "They studied ___ history of Sri Lanka." (a / the / nothing)

**Answers:** The, nothing, an, The, the`
      },
      {
        title: 'Linking Words',
        order: 2,
        estimatedMin: 8,
        content: `## Why this matters
Linking words are worth marks in both Writing and Speaking. They show the examiner you can organise your thoughts clearly.

## Four Types of Linking Words

**Adding ideas:**
also, furthermore, in addition, moreover, as well as

**Contrasting ideas:**
however, although, despite, on the other hand, nevertheless, while

**Giving reasons:**
because, since, due to, as a result of, owing to

**Giving results:**
therefore, consequently, as a result, thus, hence

## Examples

❌ "Air pollution is increasing. People are getting sick. The government should act."

✅ "Air pollution is increasing. Consequently, people are getting sick. Therefore, the government should take immediate action."

❌ "Some people like living in cities. Some people prefer the countryside."

✅ "While some people enjoy the convenience of city life, others prefer the peace and quiet of the countryside."

## Common Mistakes

❌ "Although it was raining, but we went outside." → Never use although + but together
❌ "However people disagree." → Always use a comma: "However, people disagree."
❌ Overusing "also" — vary your linking words

## Practice

Connect these sentence pairs using a linking word:

1. "The exam was difficult. ___ many students passed." (contrast)
2. "He studied hard. ___, he got a high band score." (result)
3. "She enjoys reading. ___, she reads every night." (adding)
4. "___ the traffic, she arrived on time." (despite)

**Answers:** However / Therefore / Furthermore / Despite`
      },
      {
        title: 'Tenses for Writing Task 1',
        order: 3,
        estimatedMin: 8,
        content: `## Why this matters
Task 1 charts show data — usually from the past. Using the wrong tense is one of the most common Band 4-5 mistakes.

## The Rules

**Past data (chart shows past years e.g. 1990-2020):**
Use past simple:
- "The number of cars increased significantly between 1990 and 2000."
- "Sales fell sharply in 2008."

**Present data (current situation):**
Use present simple:
- "The chart shows that most energy comes from fossil fuels."

**Future data (projections):**
Use future forms:
- "The population is predicted to reach 10 billion by 2050."
- "Consumption is expected to rise steadily."

## Useful Task 1 Verbs

**Upward:** increased, rose, grew, climbed, surged
**Downward:** decreased, fell, dropped, declined, plummeted
**Stable:** remained stable, stayed constant, plateaued, levelled off

**Adding adverbs:** sharply, slightly, steadily, dramatically, gradually

## Practice

Correct the tense errors:

1. "In 2005, the temperature is rising by 2 degrees."
2. "The graph shows that sales will increase last year."
3. "By 2030, the population rises to 9 billion."

**Answers:** rose / increased / is predicted to rise`
      }
    ]
  },
  {
    title: 'Writing Skills',
    description: 'Learn how to structure Task 1 and Task 2 answers for high band scores',
    icon: '✍️',
    color: '#D97706',
    order: 2,
    lessons: [
      {
        title: 'How to Write a Task 1 Overview',
        order: 1,
        estimatedMin: 8,
        content: `## Why this matters
The overview is the most important sentence in Task 1. Without it, you cannot get above Band 5. With a strong one, you are heading toward Band 6+.

## What an Overview Is

One or two sentences that summarise the main trend or most striking feature of the chart — without specific numbers.

**The formula:**
"Overall, [main trend]. [Second most important feature, if relevant]."

## Example

Bar chart showing internet usage by age group:

❌ Weak (just describes, no overview):
"Young people use the internet more than old people. 25-year-olds use it 95% of the time."

✅ Strong overview:
"Overall, internet usage decreases consistently with age, with younger age groups showing significantly higher usage rates than older generations."

## Common Mistakes

- Including specific numbers in the overview ❌
- Writing the overview at the end instead of after the introduction ❌
- Copying the question word-for-word ❌

## Practice

Pie chart data: Coal 40%, Gas 30%, Nuclear 15%, Renewables 10%, Other 5%

Write an overview sentence. Model answer:
"Overall, fossil fuels — particularly coal and gas — dominate the energy mix, while renewable and nuclear sources account for a relatively small proportion."`
      },
      {
        title: 'Task 2: The 4-Paragraph Structure',
        order: 2,
        estimatedMin: 10,
        content: `## Why this matters
A clear structure is worth marks in Coherence and Cohesion (25% of your Writing score).

## The Structure

**Paragraph 1 — Introduction (2-3 sentences)**
- Paraphrase the question in your own words
- State your position

**Paragraph 2 — Main body point 1 (4-5 sentences)**
- Topic sentence
- Explanation
- Example
- Result or impact

**Paragraph 3 — Main body point 2 (4-5 sentences)**
- Same structure, different point

**Paragraph 4 — Conclusion (2 sentences)**
- Restate your position
- Final thought or recommendation

## Full Example

Question: "Some people believe that university education should be free for all students. To what extent do you agree or disagree?"

**Introduction:**
"There is ongoing debate about whether higher education should be provided at no cost to students. I strongly believe that university education should be free, as it benefits both individuals and society."

**Body 1:**
"Firstly, free university education would give equal opportunities to all students regardless of their financial background. Currently, many talented young people cannot afford tuition fees and are therefore unable to fulfil their potential. In Sri Lanka, for example, state universities are free, which has allowed thousands of students from rural areas to access higher education. As a result, society benefits from a more educated workforce."

**Body 2:**
"Furthermore, an educated population contributes significantly to economic growth. Countries with high university graduation rates consistently show stronger economic performance. If governments invest in free education, they are investing in their country's future productivity."

**Conclusion:**
"In conclusion, I firmly believe that university education should be free for all. Governments should prioritise education funding, as the long-term benefits far outweigh the costs."`
      },
      {
        title: 'Paraphrasing: How to Rewrite the Question',
        order: 3,
        estimatedMin: 8,
        content: `## Why this matters
Copying the question word-for-word in your introduction scores zero for Lexical Resource on that sentence. You must rewrite it.

## Three Techniques

**Technique 1 — Use synonyms:**
- "university" → "higher education institution"
- "children" → "young people" / "the younger generation"
- "important" → "significant" / "crucial" / "essential"
- "problem" → "issue" / "challenge" / "concern"

**Technique 2 — Change word form:**
- "education is important" → "education plays an important role"
- "people believe" → "there is a belief that"

**Technique 3 — Change sentence structure:**
- "Many people think social media has a negative effect on young people."
- → "The negative impact of social media on younger generations is a concern for many."

## Full Example

Original: "Some people think that a sense of competition in children should be encouraged. Others believe that children who are taught to cooperate become more useful adults."

❌ Bad (copied):
"Some people think that a sense of competition in children should be encouraged..."

✅ Good (paraphrased):
"There is ongoing debate about whether young people benefit more from being raised in a competitive environment or whether learning to work collaboratively better prepares them for adult life."

## Practice

Paraphrase this question:
"The number of cars on our roads is increasing. What are the causes of this and what action can be taken to reduce it?"

Try writing your own version before checking any model answer.`
      }
    ]
  },
  {
    title: 'Reading Skills',
    description: 'Learn the strategies to read faster and answer questions accurately',
    icon: '📖',
    color: '#2563EB',
    order: 3,
    lessons: [
      {
        title: 'True, False, Not Given',
        order: 1,
        estimatedMin: 10,
        content: `## Why this matters
This question type appears in almost every IELTS Reading test. Most students confuse False and Not Given, losing easy marks.

## The Difference

**TRUE** — The passage directly confirms the statement.
**FALSE** — The passage directly contradicts the statement.
**NOT GIVEN** — The information is simply not there.

## The Key Rule
Only use information IN THE PASSAGE. Do not use your own knowledge.

## Example

Passage: "The Amazon rainforest produces approximately 20% of the world's oxygen. Deforestation has increased significantly since 2019, threatening thousands of species."

| Statement | Answer | Why |
|-----------|--------|-----|
| The Amazon produces 20% of the world's oxygen | TRUE | Directly stated |
| Deforestation decreased after 2019 | FALSE | Passage says increased |
| The Amazon contains more species than any other forest | NOT GIVEN | Not mentioned |

## The Trap

"I know that the Amazon has the most species, so I will put TRUE."

Wrong. If it is not in the passage → NOT GIVEN.

## Practice

Using the same passage:
1. "Deforestation threatens wildlife in the Amazon." — TRUE / FALSE / NOT GIVEN
2. "The Amazon rainforest is located in Brazil." — TRUE / FALSE / NOT GIVEN
3. "Deforestation rates were lower before 2019." — TRUE / FALSE / NOT GIVEN

**Answers:** TRUE / NOT GIVEN / TRUE`
      },
      {
        title: 'Skimming and Scanning',
        order: 2,
        estimatedMin: 8,
        content: `## Why this matters
IELTS Reading gives you 60 minutes for 40 questions. You cannot read every word. You need two speed-reading skills.

## Skimming — Reading for the General Idea

Read only: the title, the first sentence of each paragraph, the last sentence.
Goal: understand what the passage is about in 60-90 seconds.
Do this BEFORE looking at the questions.

## Scanning — Searching for Specific Information

Move your eyes quickly looking for a specific word, number, or name.
Goal: find WHERE the answer is, then read that section carefully.
Do this WHEN answering questions.

## The Process

1. Skim the whole passage (60 seconds)
2. Read question 1
3. Identify keywords in the question
4. Scan the passage for those keywords
5. Read that section carefully
6. Answer and move on

## What to Scan For

- Numbers and percentages → scan for digits
- Names of people → scan for capital letters
- Dates → scan for years
- Places → scan for capital letters
- Technical terms → appear exactly in the text

## Common Mistake

Reading the whole passage carefully before looking at the questions. This wastes 15-20 minutes and leaves you rushing at the end.`
      },
      {
        title: 'Matching Headings',
        order: 3,
        estimatedMin: 8,
        content: `## Why this matters
Matching headings questions have one trap that costs students 3-4 marks every time.

## The Trap
The heading must match the WHOLE paragraph — not just one sentence.

## The Strategy

Step 1: Cover the list of headings. Read paragraph 1. Write your own heading in one word.
Step 2: Now look at the list. Find the closest match.
Step 3: Check — does it describe the whole paragraph, or just one sentence?
Step 4: Watch out for distractor headings — they use words from the paragraph but describe it wrongly.

## Example

Paragraph: "Solar energy has grown significantly in recent years. However, the high installation costs remain a barrier for many households. Research into cheaper solar panels is ongoing, but widespread adoption is still some years away."

❌ Wrong: "The benefits of solar energy" — paragraph is mostly about barriers
❌ Wrong: "Recent growth in renewable energy" — only matches first sentence
✅ Correct: "Challenges facing solar energy adoption" — matches the whole paragraph

## Key Tip

Always read the whole paragraph before choosing a heading. The first sentence often sounds like the answer but the paragraph may take a different direction.`
      }
    ]
  },
  {
    title: 'Speaking Skills',
    description: 'Build confidence and fluency for all three parts of the Speaking test',
    icon: '🎤',
    color: '#DB2777',
    order: 4,
    lessons: [
      {
        title: 'Part 1: How to Give Full Answers',
        order: 1,
        estimatedMin: 8,
        content: `## Why this matters
Part 1 is supposed to be the easy part — familiar topics like family, work, hobbies. But students lose marks by giving one-word answers.

## The Problem

❌ Examiner: "Do you enjoy cooking?"
❌ Student: "Yes." (silence)

This gives the examiner nothing to assess. You need at least 2-3 sentences every time.

## The AREA Formula

Use this for every Part 1 answer:

**A — Answer** the question directly
**R — Reason** why
**E — Example** or extra detail
**A — Alternative** or contrast (optional but impressive)

## Example

Examiner: "Do you enjoy cooking?"

✅ Strong answer:
"Yes, I really enjoy cooking, especially on weekends. (Answer)
I find it relaxing after a busy week of studying. (Reason)
My favourite thing to cook is rice and curry — I learned the recipe from my mother. (Example)
Although I do not have much time during the week, I always try to cook at least once on Sundays." (Alternative)

That is a Band 6+ answer to a simple question.

## Practice

Answer these questions using the AREA formula. Speak out loud:

1. "Do you enjoy watching movies?"
2. "What kind of music do you like?"
3. "Tell me about your hometown."

Record yourself if possible and listen back.`
      },
      {
        title: 'Part 2: How to Speak for 2 Minutes',
        order: 2,
        estimatedMin: 10,
        content: `## Why this matters
Part 2 requires you to speak for 1-2 minutes without stopping. Most students run out of things to say after 30 seconds.

## What Happens in Part 2

- Examiner gives you a task card with a topic
- You have 1 minute to prepare — use every second of it
- You speak for 1-2 minutes
- Examiner may ask 1-2 follow-up questions

## Example Task Card

"Describe a book you have read that you found interesting.
You should say:
— what the book was about
— when you read it
— why you chose it
and explain why you found it interesting."

## The System — Use Your 1 Minute Well

Write notes for 4 things:
1. What (basic facts)
2. When/Where (context)
3. Why (reason/feeling)
4. Impact (what you learned or how it affected you)

## Strong Answer Structure

"I would like to talk about [topic]. It was [basic description]. I [when/context]. The reason I chose it was [reason]. What I found most interesting was [specific detail]. This experience taught me [impact]."

## When You Start Running Out of Things to Say

- Add a comparison: "This was very different from..."
- Add a memory: "I remember that..."
- Add an opinion: "I think what made it special was..."
- Add a recommendation: "I would definitely recommend..."

## Practice

Use this task card:
"Describe a place in your country that you would recommend to a visitor.
Say where it is, what it is like, why you like it, and why you recommend it."

Prepare for 1 minute, then speak for 2 minutes. Time yourself.`
      }
    ]
  },
  {
    title: 'Vocabulary',
    description: 'Build the academic vocabulary that examiners want to see and hear',
    icon: '📚',
    color: '#059669',
    order: 5,
    lessons: [
      {
        title: '20 Academic Words for IELTS',
        order: 1,
        estimatedMin: 10,
        content: `## Why this matters
These 20 words appear constantly in Reading passages, Writing questions, and Speaking topics. Knowing them improves all four skills.

## The 20 Words

**significant** — important, large
"a significant increase in population"

**contribute** — to help cause something
"Technology contributes to economic growth"

**impact** — effect
"the impact of climate change"

**indicate** — to show
"The graph indicates a steady rise"

**evident** — clear, obvious
"It is evident that education is important"

**whereas** — but, in contrast
"Reading decreased, whereas writing improved"

**consequently** — as a result
"Consequently, prices increased"

**proportion** — a part of a whole
"A large proportion of students passed"

**approximately** — about, roughly
"approximately 40% of respondents"

**facilitate** — to make easier
"Technology facilitates communication"

**demonstrate** — to show clearly
"The data demonstrates a clear trend"

**maintain** — to keep the same
"Prices maintained a steady level"

**decline** — to decrease
"There was a decline in reading habits"

**generate** — to produce
"Solar panels generate electricity"

**affect** — to have an effect on
"Pollution affects health significantly"

**factor** — a cause or reason
"A key factor is lack of education"

**overall** — generally, in total
"Overall, the trend is positive"

**substantial** — large, significant
"a substantial improvement in scores"

**primarily** — mainly, mostly
"primarily due to economic factors"

**establish** — to set up, to show clearly
"Research has established a clear link"

## Practice

Fill in the blanks:

1. "The chart ___ that sales increased in 2020." (indicates/generates)
2. "___, the number of students has risen." (Overall/Whereas)
3. "Pollution has a significant ___ on public health." (impact/factor)
4. "Reading decreased, ___ speaking improved." (whereas/consequently)

**Answers:** indicates / Overall / impact / whereas

## How to Learn These Words

Do not just memorise definitions. For each word:
1. Read the example sentence
2. Write your own sentence using the word
3. Use it in your next Writing practice`
      }
    ]
  }
];

async function main() {
  console.log('Seeding EPIC Learn modules and lessons...');

  // Clear existing learn data
  await prisma.learnProgress.deleteMany();
  await prisma.learnLesson.deleteMany();
  await prisma.learnModule.deleteMany();

  for (const mod of modules) {
    const { lessons, ...moduleData } = mod;
    const createdModule = await prisma.learnModule.create({
      data: moduleData
    });

    for (const lesson of lessons) {
      await prisma.learnLesson.create({
        data: {
          ...lesson,
          moduleId: createdModule.id
        }
      });
    }

    console.log(`Created module: ${mod.title} (${lessons.length} lessons)`);
  }

  console.log('Done! EPIC Learn seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

module.exports = { modules };
