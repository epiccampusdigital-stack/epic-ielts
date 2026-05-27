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
      },
      {
        title: 'Passive Voice',
        order: 4,
        estimatedMin: 8,
        content: `## Why this matters
IELTS Writing Task 1 and Task 2 both reward passive voice when used correctly. It is also a key feature examiners look for in Band 6+ writing.

## Active vs Passive

Active: "The government built the road."
Passive: "The road was built by the government."

## When to Use Passive

- When the action is more important than who did it
- In academic writing (more formal tone)
- In Task 1 when describing processes

## Formula

Subject + was/were + past participle (+ by + agent)

## Common Past Participles

built, made, produced, shown, found, given, taken, increased, reduced, used

## Examples

❌ "People use solar energy to produce electricity."
✅ "Solar energy is used to produce electricity."

❌ "They have discovered a new treatment."
✅ "A new treatment has been discovered."

## Practice

Convert to passive:
1. "The company manufactures cars in Germany."
2. "Scientists have proven that exercise improves health."
3. "The government reduced taxes last year."

**Answers:** Cars are manufactured in Germany / It has been proven that exercise improves health / Taxes were reduced last year`
      },
      {
        title: 'Conditionals',
        order: 5,
        estimatedMin: 8,
        content: `## Why this matters
Conditionals appear in Task 2 essays and Speaking Part 3. Using them correctly shows grammatical range — worth marks in both skills.

## Four Types

**Zero conditional — general truths:**
If + present simple, present simple
"If you study every day, your English improves."

**First conditional — real future possibility:**
If + present simple, will + verb
"If you practise speaking, you will improve your fluency."

**Second conditional — hypothetical/unlikely:**
If + past simple, would + verb
"If governments invested more in education, fewer students would drop out."

**Third conditional — past hypothetical:**
If + past perfect, would have + past participle
"If she had studied harder, she would have passed the exam."

## IELTS Examples

"If governments were to invest in renewable energy, carbon emissions would decrease significantly."
"If this trend continues, the population will reach 10 billion by 2050."

## Common Mistakes

❌ "If I would study more, I will pass."
✅ "If I study more, I will pass."

❌ "If he would have tried, he would succeed."
✅ "If he had tried, he would have succeeded."

## Practice

Complete the sentences:
1. "If pollution ___ (continue), the environment ___ (suffer)."
2. "If governments ___ (ban) cars, air quality ___ (improve) significantly."

**Answers:** continues / will suffer / banned / would improve`
      },
      {
        title: 'Relative Clauses',
        order: 6,
        estimatedMin: 8,
        content: `## Why this matters
Relative clauses help you write longer, more complex sentences — a key requirement for Band 6+.

## Three Types

**Who** — for people:
"Students who practise daily improve faster."

**Which** — for things:
"The report, which was published last year, showed significant findings."

**Where** — for places:
"The city where I grew up has changed dramatically."

## Defining vs Non-defining

Defining (no commas) — essential information:
"Students who work hard achieve high bands."

Non-defining (with commas) — extra information:
"IELTS, which is recognised worldwide, is taken by millions of students."

## Examples

❌ "The man he discovered penicillin won the Nobel Prize."
✅ "The man who discovered penicillin won the Nobel Prize."

❌ "The book it changed my life was written in 1960."
✅ "The book which changed my life was written in 1960."

## Practice

Combine using a relative clause:
1. "She is a student. She scored Band 8."
2. "London is a city. It attracts millions of tourists."
3. "He read a report. It changed his opinion."

**Answers:** She is a student who scored Band 8 / London is a city which attracts millions of tourists / He read a report which changed his opinion`
      },
      {
        title: 'Reported Speech',
        order: 7,
        estimatedMin: 8,
        content: `## Why this matters
Reported speech appears in Reading (summarising what authors say) and Speaking Part 3 (discussing opinions).

## Direct vs Reported

Direct: "Climate change is a serious problem," said the scientist.
Reported: The scientist said that climate change was a serious problem.

## Tense Shifts

- is → was
- are → were
- will → would
- can → could
- have done → had done

## Reporting Verbs

said, stated, claimed, argued, suggested, reported, found, concluded

## Examples

Direct: "Pollution levels have increased dramatically."
Reported: The report stated that pollution levels had increased dramatically.

Direct: "We will introduce new policies next year."
Reported: The government announced that it would introduce new policies the following year.

## Practice

Report these statements:
1. "IELTS is the world's most popular English test," said the examiner.
2. "Students should practise every day," the teacher suggested.

**Answers:** The examiner said that IELTS was the world's most popular English test / The teacher suggested that students should practise every day`
      },
      {
        title: 'Comparison Structures',
        order: 8,
        estimatedMin: 8,
        content: `## Why this matters
Task 1 is almost entirely about comparing data. Without good comparison language, you cannot score above Band 5.

## Comparative Adjectives

higher than, lower than, greater than, smaller than, faster than, slower than

## Superlatives

the highest, the lowest, the most significant, the least popular

## Useful Comparison Phrases

- "twice as high as"
- "three times more than"
- "significantly higher than"
- "slightly lower than"
- "approximately the same as"
- "in contrast to"
- "compared with/to"

## Examples

"In 2020, car ownership was significantly higher than in 2010."
"The USA consumed twice as much energy as Germany."
"Reading scores were slightly lower than listening scores."
"In contrast to urban areas, rural regions showed a decline."

## Common Mistakes

❌ "Cars are more popular than buses in 2020."
✅ "Cars were more popular than buses in 2020." (past data needs past tense)

❌ "The sales were more higher in summer."
✅ "The sales were higher in summer."

## Practice

Write comparison sentences using this data:
Reading average: 5.0 / Writing average: 4.4 / Speaking average: 3.2

**Model answer:** Reading scores were significantly higher than speaking scores, while writing performance fell between the two at 4.4.`
      },
      {
        title: 'Avoiding Repetition',
        order: 9,
        estimatedMin: 7,
        content: `## Why this matters
Repeating the same word or phrase loses marks in Lexical Resource. Examiners reward variety.

## Three Techniques

**Technique 1 — Synonyms:**
- increase → rise, grow, climb, surge, go up
- decrease → fall, drop, decline, reduce, go down
- important → significant, crucial, vital, essential
- show → indicate, demonstrate, reveal, suggest

**Technique 2 — Pronouns:**
"The government announced new policies. It also stated that..."
"Students need motivation. They also need consistent practice."

**Technique 3 — General words:**
- "London, Paris, and Tokyo" → "these cities"
- "reading, writing, listening, speaking" → "these skills" / "all four components"
- "solar, wind, and nuclear energy" → "these sources" / "such alternatives"

## Example

❌ "The graph shows an increase. The increase was significant. The increase happened between 2010 and 2020."

✅ "The graph shows a significant increase between 2010 and 2020. This rise was most pronounced in the middle of the decade, eventually levelling off toward 2020."

## Practice

Rewrite avoiding repetition:
"More students are studying abroad. Studying abroad is expensive. Many students who study abroad face financial difficulties."

**Model answer:** More students are choosing to pursue their education overseas. However, this path can be costly, and many of those who take it face significant financial challenges.`
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
      },
      {
        title: 'Task 1: Describing Trends',
        order: 4,
        estimatedMin: 8,
        content: `## Why this matters
Line graphs, bar charts, and tables all require you to describe how things change over time. This is the core skill of Task 1.

## Upward Trends

increased, rose, grew, climbed, surged, went up, shot up

## Downward Trends

decreased, fell, dropped, declined, plummeted, went down, reduced

## Stable Trends

remained stable, stayed constant, plateaued, levelled off, maintained a steady level

## Adverbs of Degree

sharply, dramatically, significantly, considerably (big change)
slightly, gradually, steadily, modestly (small change)

## Sentence Structures

"[Subject] + [verb] + [adverb] + from [number] to [number] between [year] and [year]."
"There was a [adjective] [noun] in [subject] between [year] and [year]."

## Examples

"Car ownership increased sharply from 20% to 45% between 2000 and 2020."
"There was a dramatic rise in internet usage during the same period."
"Unemployment remained relatively stable throughout the decade."

## Practice

Describe this data in two sentences:
Coal usage: 60% in 2000, dropping to 25% in 2020
Renewable energy: 5% in 2000, rising to 35% in 2020

**Model answer:** Coal usage declined dramatically from 60% to 25% over the two decades. Meanwhile, renewable energy saw a significant rise, climbing from just 5% to 35% over the same period.`
      },
      {
        title: 'Task 2: Giving Your Opinion Clearly',
        order: 5,
        estimatedMin: 8,
        content: `## Why this matters
Many Task 2 questions ask "To what extent do you agree or disagree?" Students often write vague answers — losing marks for Task Achievement.

## Three Clear Position Types

**Fully agree:**
"I completely agree that..."
"I strongly believe that..."
"It is my firm view that..."

**Partially agree:**
"While there is some truth in this view, I believe..."
"Although X has merit, I would argue that..."

**Fully disagree:**
"I strongly disagree with this view."
"I do not believe that..."

## Stating Opinion in the Body

"In my opinion..."
"From my perspective..."
"I would argue that..."
"It seems clear that..."

## Common Mistake — Being Vague

❌ "There are many opinions about this topic. Some people agree and some disagree. Both sides have good points."
(This scores Band 4 — no clear position)

✅ "I strongly believe that governments should fund free university education, as the long-term economic benefits far outweigh the initial costs."
(This scores Band 6+ — clear, supported position)

## Practice

Write one clear opinion statement for this question:
"Some people think children should learn a foreign language at primary school. To what extent do you agree?"

Write 2-3 sentences: your position + one reason + one example.`
      },
      {
        title: 'Avoiding Common Writing Mistakes',
        order: 6,
        estimatedMin: 8,
        content: `## Why this matters
These are the most common IELTS Writing mistakes. Fixing them can raise your band by 0.5 to 1.0.

## Mistake 1 — Starting Every Sentence with I

❌ "I think pollution is bad. I believe the government should act. I also feel that..."
✅ Vary your starters: "Pollution poses a serious threat... The government must therefore... Furthermore..."

## Mistake 2 — Using Informal Language

❌ lots of → ✅ a significant number of
❌ a lot of → ✅ a considerable amount of
❌ kids → ✅ children
❌ really important → ✅ crucially important
❌ nowadays (overused) → ✅ in recent years / in the modern era

## Mistake 3 — Copying the Question

Never copy the question word for word in your introduction. Paraphrase it completely.

## Mistake 4 — One-Sentence Paragraphs

❌ "Education is important. Countries with good education do well."
✅ Develop every point: topic sentence + explanation + example + result (4-5 sentences minimum)

## Mistake 5 — No Conclusion

Every Task 2 essay needs a conclusion. Two sentences minimum:
"In conclusion, I firmly believe that [restate position]. [Final recommendation or thought]."

## Quick Checklist Before Submitting

- Did I paraphrase the question? ✓
- Does every paragraph have 4-5 sentences? ✓
- Did I write an overview (Task 1) or clear opinion (Task 2)? ✓
- Did I write a conclusion? ✓
- Did I avoid copying the question? ✓`
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
      },
      {
        title: 'Multiple Choice Questions',
        order: 4,
        estimatedMin: 8,
        content: `## Why this matters
Multiple choice looks easy but has traps that catch most students. The wrong answers are designed to confuse you.

## The Three Traps

**Trap 1 — Partially correct answers:**
The answer contains true information from the passage but does not fully answer the question.

**Trap 2 — Extreme language:**
Options with always, never, all, none are usually wrong — the passage rarely uses such absolute language.

**Trap 3 — Out of scope:**
The answer sounds reasonable but the passage does not mention it.

## The Strategy

1. Read the question carefully — note exactly what it is asking
2. Underline keywords in the question
3. Find the relevant section in the passage
4. Read that section carefully
5. Eliminate obviously wrong answers
6. Choose between remaining options — which one does the passage actually support?

## Key Rule

The correct answer must be directly supported by the passage — not just probably true or logical.

## Practice Tip

For each wrong answer you eliminate, find the specific reason it is wrong from the passage. This prevents guessing and builds confidence.`
      },
      {
        title: 'Summary Completion',
        order: 5,
        estimatedMin: 8,
        content: `## Why this matters
Summary completion tests whether you can find specific information and use the right word form. One wrong word form means a wrong answer.

## The Rules

- Use words from the passage — do not change them
- Check the word limit: NO MORE THAN TWO WORDS means maximum two words
- The word must fit grammatically in the sentence
- Spelling must be exactly correct

## The Strategy

1. Read the summary to understand what it is about
2. Identify what type of word is needed (noun, verb, adjective)
3. Find the relevant section in the passage
4. Find the exact word or words that fit

## Word Form Errors — Common Trap

Passage: "The experiment demonstrated remarkable accuracy."
Summary: "The experiment was remarkable for its ___."
❌ accurate (wrong form — adjective not noun)
✅ accuracy (correct — noun needed)

## Practice

Passage: "Solar panels have become increasingly affordable in recent years, making them accessible to a wider range of households."
Summary: "Solar panels are now more ___ and can be used by more ___."

**Answers:** affordable / households`
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
      },
      {
        title: 'Part 3: Discussing Abstract Topics',
        order: 3,
        estimatedMin: 10,
        content: `## Why this matters
Part 3 is where Band 6 becomes Band 7. Examiners ask abstract questions about society, culture, and global issues. Most students give short, simple answers.

## Example Part 3 Questions

"How important is education for a country's development?"
"Do you think technology has changed the way people communicate?"
"Should governments control what people eat?"

## What Examiners Want

- Extended answers (5-8 sentences minimum)
- Opinions with reasons
- Comparisons and contrasts
- Speculation: "It could be argued that..."
- Awareness of different perspectives

## Structure for Part 3 Answers

1. Give your opinion directly
2. Give a reason
3. Give an example
4. Acknowledge the other side
5. Conclude your position

## Example Answer

Question: "Do you think social media has had a positive or negative effect on society?"

✅ Band 7 answer:
"I think social media has had both positive and negative effects, though on balance I believe the negatives outweigh the positives. On one hand, it connects people across the world and gives everyone a platform to share their views. However, it has also contributed to serious problems like cyberbullying, misinformation, and mental health issues, particularly among young people. So while the technology itself is neutral, I believe we need stronger regulation to prevent its misuse."

## Useful Phrases

"That is an interesting question. I think..."
"From my perspective..."
"It could be argued that..."
"On the other hand..."
"I suppose it depends on..."
"In my experience..."`,
      },
      {
        title: 'Pronunciation: Being Clearly Understood',
        order: 4,
        estimatedMin: 8,
        content: `## Why this matters
You do not need a British or American accent. You need to be understood clearly. Pronunciation is 25% of your Speaking score.

## What Examiners Assess

- Can they understand you without effort?
- Do you use word stress correctly?
- Do you use sentence stress and rhythm?
- Do you use intonation (rising/falling) appropriately?

## Word Stress

- "imPORtant" not "IMportant"
- "enVIronment" not "ENvironment"
- "ecoNOMy" not "ECOnomy"
- "deCISion" not "DEcision"
- "reSEARCH" (verb) vs "REsearch" (noun)

## Common Issues to Work On

- Adding extra vowels at the start: practise starting words directly with the consonant sound
- Final consonants: pronounce the last consonant clearly — "test" not "tes"
- Consistent rhythm: English uses stress-timed rhythm — stressed syllables are longer and louder

## Intonation

Questions usually rise at the end: "Do you enjoy reading?" ↗
Statements usually fall at the end: "I enjoy reading." ↘

## Practice

Record yourself saying these sentences and listen back:
1. "I strongly believe that education is extremely important for economic development."
2. "The government should take immediate action to address climate change."

Listen for: word stress, clear final consonants, rising/falling intonation.`
      },
      {
        title: 'Fluency: How to Keep Talking Smoothly',
        order: 5,
        estimatedMin: 8,
        content: `## Why this matters
Fluency does not mean speaking fast. It means speaking smoothly without long unnatural pauses. Examiners penalise excessive hesitation.

## Natural Fillers — Use These While Thinking

"Well..." / "Let me think about that..." / "That is an interesting point..."
"I suppose..." / "To be honest..." / "As far as I know..."

## Unnatural Fillers — Avoid These

"Eeeh..." / "Uhm uhm uhm..." / "How to say..."

## Strategies to Keep Talking

**Strategy 1 — Buy time naturally:**
"That is a thought-provoking question. I would say..."
"I have not really considered that before, but I think..."

**Strategy 2 — Paraphrase when you forget a word:**
Cannot remember unemployment? Say: "people who do not have jobs"
Cannot remember infrastructure? Say: "roads, bridges, and public systems"

**Strategy 3 — Use examples to extend:**
After every opinion: "For example, in Sri Lanka..."
After every fact: "This is evident in..."

**Strategy 4 — Self-correct naturally:**
"I think... actually, what I mean is..."
This shows language awareness — examiners reward it.

## What Fluency Is NOT

- Speaking fast ❌
- Never pausing ❌
- Using lots of complicated words ❌

## What Fluency IS

- Speaking at a natural pace ✅
- Pausing briefly between ideas ✅
- Connecting ideas smoothly ✅

## Practice

Answer this question out loud for 2 minutes:
"What are the advantages and disadvantages of living in a big city?"

Time yourself. If you stop before 2 minutes, use Strategy 3 — add an example or comparison to keep going.`
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
      },
      {
        title: 'Topic Vocabulary: Environment',
        order: 2,
        estimatedMin: 10,
        content: `## Why this matters
Environment topics appear in almost every IELTS exam — Task 2 essays, Reading passages, Speaking Part 3.

## Problems

- pollution — contamination of air, water, or land
- emissions — gases released into the atmosphere
- deforestation — cutting down forests
- global warming — rising temperatures worldwide
- climate change — long-term shifts in weather patterns
- habitat destruction — damage to natural environments
- overpopulation — too many people in one area

## Solutions

- renewable energy — solar, wind, hydroelectric power
- conservation — protecting natural resources
- sustainable development — growth that does not harm the environment
- carbon footprint — total greenhouse gas emissions caused by a person
- recycling — converting waste into reusable material

## Useful Phrases

"pose a significant threat to biodiversity"
"mitigate the effects of climate change"
"transition to renewable energy sources"
"raise awareness about environmental issues"

## Practice

Fill in the blanks:
1. "Burning fossil fuels produces harmful ___." (emissions/conservation)
2. "Governments must invest in ___ energy to reduce carbon emissions." (renewable/recycling)
3. "___ is destroying the natural habitats of many species." (Deforestation/Pollution)

**Answers:** emissions / renewable / Deforestation`
      },
      {
        title: 'Topic Vocabulary: Education',
        order: 3,
        estimatedMin: 10,
        content: `## Why this matters
Education is one of the most common IELTS topics in both Writing and Speaking.

## Types of Education

- compulsory education — education required by law
- higher education — university level
- vocational training — practical skills for specific jobs
- distance learning — studying remotely or online
- lifelong learning — continuing to learn throughout life

## Issues in Education

- academic pressure — stress from study demands
- tuition fees — money paid for university education
- equal access — everyone having the same opportunities
- literacy rate — percentage of people who can read and write
- dropout rate — percentage of students who leave before completing

## Benefits of Education

- enhances career prospects
- develops critical thinking
- reduces poverty
- promotes social mobility — moving up in society through education

## Useful Phrases

"invest in early childhood education"
"bridge the gap between rich and poor students"
"equip students with the skills needed for the modern workforce"

## Practice

Write two sentences about education using these words:
compulsory / academic pressure / social mobility`
      },
      {
        title: 'Topic Vocabulary: Technology',
        order: 4,
        estimatedMin: 10,
        content: `## Why this matters
Technology appears constantly in IELTS — artificial intelligence, social media, automation.

## Key Terms

- artificial intelligence (AI) — machines that simulate human thinking
- automation — using machines to do tasks previously done by people
- digital literacy — ability to use technology effectively
- social media — online platforms for sharing content
- e-commerce — buying and selling online

## Effects

- revolutionise — to completely change something
- disrupt — to interrupt or change established systems
- enhance — to improve or add to something
- replace — to take the place of something
- accelerate — to speed up a process

## Issues

- cybercrime — illegal activity using computers
- privacy concerns — worries about personal data
- digital divide — gap between those with and without technology access
- screen addiction — excessive use of digital devices
- misinformation — false information spread online

## Useful Phrases

"Technology has revolutionised the way we communicate."
"Automation threatens to displace millions of workers."
"The digital divide widens inequality between nations."

## Practice

Write one sentence using each word:
1. automation
2. digital divide
3. revolutionise`
      },
      {
        title: 'Collocations: Words That Go Together',
        order: 5,
        estimatedMin: 8,
        content: `## Why this matters
Native speakers say "make a mistake" not "do a mistake." These fixed word combinations are called collocations. Getting them right is the difference between Band 5 and Band 7.

## Common IELTS Collocations

**With make:**
make progress, make an effort, make a decision, make a contribution, make a difference

**With do:**
do research, do damage, do harm, do well, do a course

**With take:**
take action, take responsibility, take advantage of, take into account, take measures

**With have:**
have an impact, have access to, have the potential to, have a negative effect, have concerns

**Adjective + noun combinations:**
strong evidence, significant increase, dramatic decline, rapid growth, major challenge, serious problem, widespread concern

## Examples

❌ "We must do action to stop climate change."
✅ "We must take action to stop climate change."

❌ "The company made a damage to the environment."
✅ "The company did damage to the environment."

❌ "There is a strong increase in pollution."
✅ "There is a significant increase in pollution."

## Practice

Choose the correct collocation:
1. "Scientists have ___ extensive research on this topic." (made/done)
2. "The government must ___ measures to reduce crime." (take/make)
3. "Technology has had a ___ impact on communication." (strong/significant)

**Answers:** done / take / significant`
      }
    ]
  },
  {
    title: 'Exam Strategy',
    description: 'Learn how to manage your time, handle pressure, and maximise your score on exam day',
    icon: '🎯',
    color: '#0891B2',
    order: 6,
    lessons: [
      {
        title: 'Time Management: Using Every Minute',
        order: 1,
        estimatedMin: 8,
        content: `## Why this matters
Most students who fail IELTS do not fail because they do not know English. They fail because they run out of time. Managing your time is a skill you can practise.

## The Time Breakdown

**Reading — 60 minutes, 40 questions**
- 20 minutes per passage (3 passages)
- If you spend more than 20 minutes on passage 1, you are in trouble
- Never spend more than 2 minutes on one question — move on and come back

**Writing — 60 minutes**
- Task 1: 20 minutes (150 words minimum)
- Task 2: 40 minutes (250 words minimum)
- Task 2 is worth double the marks — protect those 40 minutes

**Listening — 30 minutes + 10 minutes transfer time**
- You hear the audio ONCE — no replays
- Use the 10 minutes at the end to transfer answers carefully
- Check spelling during transfer time

**Speaking — 11-14 minutes**
- Part 1: 4-5 minutes (short answers)
- Part 2: 3-4 minutes (long turn)
- Part 3: 4-5 minutes (discussion)
- You cannot control the time — the examiner does

## The Golden Rule

Never get stuck on one question. A wrong answer and a blank answer both score zero. If you do not know — guess and move on.

## Practice

Next time you do a practice paper, set a timer. Stop exactly when time is up even if you have not finished. This trains your brain to work at exam speed.`
      },
      {
        title: 'What To Do When You Are Stuck',
        order: 2,
        estimatedMin: 8,
        content: `## Why this matters
Every student gets stuck in the exam. The difference between Band 5 and Band 6 is knowing what to do next instead of panicking.

## Reading — When You Cannot Find the Answer

1. Re-read the question — did you understand it correctly?
2. Look for synonyms — the passage will not use the exact same words as the question
3. Narrow it down to two options — eliminate the obviously wrong ones
4. Make your best guess — never leave a blank (no negative marking in IELTS)

## Writing — When You Do Not Know What to Write

1. For Task 1 — describe what you can see. Start with the most obvious trend.
2. For Task 2 — use the universal structure: position + two reasons + examples + conclusion
3. If you run out of ideas — use a Sri Lanka example. You know your country well.
4. Keep writing — an incomplete essay scores very low. Always write something.

## Listening — When You Miss an Answer

Do not panic and keep thinking about the missed question. Let it go immediately.
Focus on the next question — missing one answer and panicking causes you to miss three more.

## Speaking — When You Do Not Understand the Question

Say: "Could you repeat that please?" or "I am not sure I understand — do you mean...?"
This is completely allowed and shows communication ability — not weakness.

## When You Go Blank in Speaking

Use a filler: "That is an interesting question. Let me think for a moment..."
Then use the AREA formula — Answer, Reason, Example, Alternative.

## The Most Important Rule

Keep moving. Panic wastes more time than the original problem.`
      },
      {
        title: 'How to Check Your Answers',
        order: 3,
        estimatedMin: 8,
        content: `## Why this matters
Students who check their answers properly gain 1-2 marks on average. At Band 5-6 level, that can be the difference between pass and fail.

## Reading — Checking (last 5 minutes)

- Check answers you were unsure about first
- Re-read the question and your answer — does it actually answer what was asked?
- Check spelling on short answer questions — one wrong letter means a wrong answer
- Make sure you have not left any blanks

## Writing — Checking (last 3-4 minutes)

- Count your words approximately — Task 1 needs 150+, Task 2 needs 250+
- Check for subject-verb agreement: "The data show" not "The data shows"
- Check article errors: a/an/the — the most common mistake
- Check tense consistency — if you started in past tense, stay in past tense
- Does your essay have an introduction, body paragraphs, AND a conclusion?

## Listening — During Transfer Time (10 minutes)

- Copy answers exactly — do not change words
- Check spelling carefully
- Check plurals — "cars" not "car" if the audio said "cars"
- Make sure every question has an answer

## Speaking — You Cannot Check, But

Self-correct naturally during your answer: "...what I mean is..."
This scores marks, not loses them.

## What NOT to Do When Checking

Do not change an answer unless you are certain it is wrong. Your first instinct is usually correct.`
      },
      {
        title: 'Exam Day: What To Do and What Not To Do',
        order: 4,
        estimatedMin: 8,
        content: `## Why this matters
Exam day mistakes cost students marks before they even sit down. These are things within your control.

## The Night Before

✅ Prepare your ID (passport or NIC) — you cannot enter without it
✅ Know the exam centre location — do a test journey if possible
✅ Sleep at least 7-8 hours — tired brains perform significantly worse
✅ Set two alarms
❌ Do not study late into the night — it does not help at this point
❌ Do not try new practice papers the night before

## The Morning Of

✅ Eat a proper breakfast — your brain needs fuel for 3+ hours of concentration
✅ Arrive 30 minutes early — late arrival causes panic
✅ Bring water (check if allowed in the room)
✅ Bring extra pens — at least two
❌ Do not discuss the exam with other students outside — it increases anxiety
❌ Do not look at your notes at the last minute — trust your preparation

## In the Exam Room

✅ Read all instructions carefully before starting
✅ Write your candidate number on every answer sheet
✅ If something is wrong (noisy room, broken equipment) — raise your hand immediately
❌ Do not start before the invigilator says to begin
❌ Do not panic if others seem to be writing more than you

## After Each Section

Take one slow breath before starting the next section. This resets your focus.

## The Mindset

You have prepared. Trust your preparation. Anxiety uses the same energy as thinking — redirect it into your answers.`
      },
      {
        title: 'How to Improve Your Band Score Strategically',
        order: 5,
        estimatedMin: 10,
        content: `## Why this matters
Many students study hard but improve slowly because they practise the wrong things. This lesson shows you how to target your weakest areas for maximum improvement.

## Step 1 — Know Your Current Bands

Use your EPIC IELTS placement test results. Look at each skill separately. Be honest about where you are.

## Step 2 — Calculate Your Gap

Target band minus current band = your gap.
If your target is 6.5 and your reading is 5.0, your gap is 1.5 bands.

## Step 3 — What Your Gap Means

- 0.5 bands gap — small technique fixes, focus on exam strategy
- 1.0 band gap — consistent practice + grammar and vocabulary work
- 1.5 bands gap — significant grammar improvement + regular practice needed
- 2.0+ bands gap — foundational English work needed before exam technique

## Step 4 — Prioritise Your Time

**If Reading is your weakest:**
Focus on question types, skimming and scanning, time management per passage

**If Writing is your weakest:**
Focus on Task 2 structure, paraphrasing, linking words, academic vocabulary

**If Listening is your weakest:**
Focus on prediction, note-taking while listening, checking spelling in transfer time

**If Speaking is your weakest:**
Focus on AREA formula for Part 1, extended answers for Part 2, abstract discussion for Part 3

## Step 5 — Track Your Progress

After every practice paper, record your band. Look for patterns:
- Are you improving in some question types but not others?
- Are you running out of time consistently?
- Are you making the same mistakes repeatedly?

## The Most Efficient Study Plan

- 60% of your time on your weakest skill
- 30% on your second weakest
- 10% maintaining your strongest skill

## The Honest Truth

Most students improve 0.5 to 1.0 bands with 4-6 weeks of focused practice. Improving 2.0+ bands takes 3-6 months of serious study. Set realistic expectations and work consistently. Use EPIC Learn lessons before every practice paper.`
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
