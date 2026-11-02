# Foundation 1 reference: the 8 parts of speech in detail (one section per part). Read at home after Day 4, recapped at the start of Day 8.
F = dict(folder='Grammar foundation', kind='Grammar foundation')
LESSONS = [
dict(F, day=4, theme='Foundation 1 - The 8 parts of speech in detail', time='11:30 (read at home after Day 4, 20-minute recap at the start of Day 8)', who='English Teacher 2 (Sir)',
 title='Foundation 1 notes: the 8 parts of speech in detail',
 focus='One section for each part of speech with the types, the rules and examples. Use it as your reference all month.',
 student=[
  # ---------------- 1 NOUN
  dict(t='note', title='1. Nouns: names of people, places, things and ideas', items=[
   '**Common nouns** are general names: teacher, city, rice, phone. **Proper nouns** are special names and start with a capital letter: Nimal, Galle, Korea, Monday.',
   '**Countable nouns** can be counted: one book, two books. **Uncountable nouns** cannot be counted: water, rice, money, information, advice. We do not say "informations" or "an advice".',
   '**Abstract nouns** are ideas and feelings you cannot touch: happiness, freedom, education, time.',
   'Use **a / an** with one countable noun (a book, an apple). Use **some / much / a lot of** with uncountable nouns (some water, much money).',
   'Nouns can be the **subject** (The teacher speaks.) or the **object** (I like the teacher.) of a sentence.']),
  dict(t='table', title='Countable or uncountable? Write C or U', head=['Word', 'C or U', 'Word', 'C or U'], rows=[
   ['table', '', 'advice', ''], ['water', '', 'student', ''], ['money', '', 'idea', ''], ['rice', '', 'banana', '']]),
  # ---------------- 2 PRONOUN
  dict(t='note', title='2. Pronouns: words that take the place of nouns', items=[
   'We use pronouns so that we do not repeat the noun. "Nimal likes Nimal\'s phone" sounds wrong. "Nimal likes **his** phone" sounds right.',
   '**Subject pronouns** do the action: I, you, he, she, it, we, they. **Object pronouns** receive it: me, you, him, her, it, us, them.',
   '**Possessive** words show who owns something: my, your, his, her, its, our, their (before a noun) and mine, yours, his, hers, ours, theirs (alone).',
   '**Question pronouns:** who, what, which, whose. **This / that** point to one thing; **these / those** point to many.',
   'Full practice is in Foundation 3 (Day 10).']),
  # ---------------- 3 VERB
  dict(t='note', title='3. Verbs: actions and states', items=[
   '**Action verbs** show what someone does: run, eat, study, write. **State verbs** show how something is: be (am, is, are), have, like, know, want.',
   '**Helping (auxiliary) verbs** help the main verb: do, does, did, have, has, will, can, must. Example: She **does** not like tea. I **will** call you.',
   '**Modal verbs** (can, could, may, might, must, should, will, would) are followed by the base verb with no -s and no to: She can swim. (not "She can swims")',
   'Every verb has forms: **base** (go), **-s form** (goes), **past** (went), **-ing form** (going), **past participle** (gone). Tenses use these forms and we will learn them one by one from Day 11.',
   '**Regular verbs** add -ed in the past: work → worked. **Irregular verbs** change: go → went, see → saw, eat → ate.']),
  dict(t='table', title='Fill the verb forms', head=['Base', '-s form', 'Past', '-ing form'], rows=[
   ['work', '', 'worked', ''], ['study', '', '', 'studying'], ['go', '', 'went', ''], ['have', 'has', '', '']]),
  dict(t='pagebreak'),
  # ---------------- 4 ADJECTIVE
  dict(t='note', title='4. Adjectives: words that describe nouns', items=[
   'An adjective tells us **what kind**, **what size**, **what colour**, **how many** or **whose**: a **cold** drink, a **big** house, **three** students, **my** book.',
   'Adjectives come **before the noun** (a red car) or **after the verb be** (The car is red). They never take -s: "two reds cars" is wrong; "two red cars" is right.',
   'Order when you use more than one: opinion → size → age → colour → origin → material → noun. Example: a **beautiful small old red Korean** car. In real life we use two or three, not six.',
   '**Comparing:** short adjectives add **-er / -est** (tall, taller, the tallest). Long adjectives use **more / the most** (more expensive, the most beautiful). Irregular: good, better, the best; bad, worse, the worst.',
   '**-ed and -ing adjectives:** I am **bored** (my feeling). The film is **boring** (the thing). She is **excited**. The trip is **exciting**.']),
  dict(t='mcq', title='Choose', items=[
   ('This book is ___ than that one.', ['more interesting', 'interestinger', 'most interesting']),
   ('I am ___ because the class is long.', ['tired', 'tiring', 'tires']),
   ('She has ___.', ['a long black hair', 'long black hair', 'hair long black'])]),
  # ---------------- 5 ADVERB
  dict(t='note', title='5. Adverbs: words that describe verbs, adjectives and other adverbs', items=[
   '**Manner** (how): slowly, carefully, well, hard. **Time** (when): today, now, yesterday, soon. **Place** (where): here, there, outside. **Frequency** (how often): always, usually, often, sometimes, never. **Degree** (how much): very, quite, too, really.',
   'Many adverbs of manner are an adjective + **-ly**: quick → quickly, careful → carefully. If the adjective ends in consonant + y, change y to i: happy → happily.',
   'Irregular: good → **well**, fast → fast, hard → hard, late → late. Note: **hardly** means "almost not", not "very hard".',
   '**Where to put them:** frequency adverbs go **before the main verb** (I **always** drink tea) but **after be** (She is **always** late). Time words often go at the end (I study **today**).',
   'Adverbs can also describe an adjective: very **happy**, really **cold**, too **expensive**.']),
  dict(t='gap', title='Complete with an adverb', ins='Use the word in brackets to make an adverb.', items=[
   'He drives very ___. (careful)', 'She sings ___. (good)', 'They ___ eat breakfast at seven. (usual)', 'He worked ___ and passed the test. (hard)']),
  # ---------------- 6 PREPOSITION
  dict(t='note', title='6. Prepositions: words that show place, time and direction', items=[
   '**Place:** in (inside), on (touching the top), at (a point), under, next to, between, behind, in front of. Example: The keys are **on** the table **in** the kitchen.',
   '**Time:** **at** + clock time or a point (at 7 o\'clock, at night); **on** + days and dates (on Monday, on 5th May); **in** + months, years, seasons, parts of the day (in March, in 2027, in the morning).',
   '**Direction:** to, from, into, out of, through, across, along. Example: We walked **along** the beach **to** the temple.',
   'A preposition is followed by a **noun or pronoun**, or by the **-ing form** of a verb: He is good **at** swimming. (not "good at swim")',
   'Common pairs to learn together: good at, afraid of, interested in, depend on, listen to, wait for, arrive at / in. Full practice in Foundation 3 (Day 10).']),
  dict(t='gap', title='Choose in, on or at', items=[
   'My class starts ___ 8:30.', 'I was born ___ March.', 'We have a test ___ Wednesday.', 'The phone is ___ the table.', 'He lives ___ Galle.']),
  dict(t='pagebreak'),
  # ---------------- 7 CONJUNCTION
  dict(t='note', title='7. Conjunctions: words that join', items=[
   '**Coordinating conjunctions** join equal parts: **and** (adds), **but** (contrast), **or** (choice), **so** (result). Memory tip: FANBOYS = for, and, nor, but, or, yet, so.',
   '**Subordinating conjunctions** start a dependent clause: **because** (reason), **although** (contrast), **when / while / before / after / until** (time), **if / unless** (condition).',
   'A comma comes after the first clause when it starts with the conjunction: **Because** it was raining, we stayed home. We stayed home **because** it was raining. (no comma)',
   'Each conjunction group has its own lesson in the next weeks: and / but / or / so / because, then time words, then although / though / even though / however, then if / unless.']),
  dict(t='gap', title='Choose the best conjunction', ins='and, but, or, so, because', items=[
   'I was hungry, ___ I ate rice.', 'She likes tea ___ she does not like coffee.', 'We can go by bus ___ by train.', 'He stayed at home ___ he was sick.', 'I bought a pen ___ a notebook.']),
  # ---------------- 8 INTERJECTION
  dict(t='note', title='8. Interjections: words that show a feeling', items=[
   'Interjections stand alone, usually with an exclamation mark: **Wow!** (surprise) **Oops!** (a small mistake) **Ouch!** (pain) **Hurray!** (joy) **Oh no!** (worry) **Yuck!** (dislike) **Hey!** (attract attention) **Phew!** (relief).',
   'They are common in speaking and informal writing. Do **not** use them in formal writing such as a scholarship email or the writing test.']),
  dict(t='write', title='Put it all together', ins='Write 8 sentences about your day in Korea. Use at least one of each: a proper noun, a pronoun, a verb in the past, an adjective, an adverb, a preposition, a conjunction. Add one interjection. Label the parts in the margin.', n=10),
  dict(t='lines', title='Quick check', items=['Give one example of an uncountable noun and one of a modal verb.', 'Where does "always" go in a sentence with "be" and in a sentence with an action verb?', 'Which preposition goes with a clock time?']),
 ],
 teacher=dict(
  need='Student worksheet (reading pages), board, the 8 papers from Foundation 1',
  aims=['Understand the types and rules inside each part of speech', 'Use the pages as a reference during the month'],
  steps=[
   (5, 'Pick-up', 'Students bring the reading pages. Ask them to name the 8 parts and one new thing they learned.'),
   (15, 'Quick quiz', 'Run the three activities (countable, verb forms, in/on/at) as a fast check. Clear any confusion on adjective vs adverb and on frequency adverb position.'),
  ],
  answers=[
   '**Countable or uncountable:** table C, advice U, water U, student C, money U, idea C, rice U, banana C.',
   '**Verb forms:** work: works, worked, working. study: studies, studied, studying. go: goes, went, going. have: has, had, having.',
   '**Choose:** 1 more interesting, 2 tired, 3 long black hair.',
   '**Adverbs:** 1 carefully, 2 well, 3 usually, 4 hard.',
   '**In, on, at:** 1 at, 2 in, 3 on, 4 on, 5 in.',
   '**Conjunctions:** 1 so, 2 but, 3 or, 4 because, 5 and.',
   '**Quick check:** 1 Students\' own answers (e.g. rice; can). 2 After be, before an action verb. 3 at.'],
  tips=['Do not teach this as a lecture. Students read it at home; use the time in class for the quick quiz.', 'Prepositions, conjunctions and pronouns are expanded again on Day 10, Day 11 onwards, so do not go deeper today.'],
  homework='Read the eight sections and write 2 of your own examples under each. Check them with a partner.')),
]
