const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const paperData = {
  "code": "READING004",
  "title": "IELTS Reading Test — READING004",
  "timeAllowed": 60,
  "passages": [
    {
      "number": 1,
      "title": "The Rise of Remote Work",
      "text": "The widespread adoption of remote work is one of the most significant shifts in working culture of the past century. Although working from home was already growing steadily before 2020, the global pandemic dramatically accelerated the trend, forcing organisations across nearly every industry to adapt almost overnight. What began as a crisis response has, for many companies and employees, evolved into a permanent or semi-permanent way of working that has reshaped expectations on both sides of the employment relationship.\n\nProponents of remote work point to a range of benefits. Studies conducted in the years following the initial shift have consistently found that many employees report higher levels of job satisfaction, reduced commuting stress, and greater ability to balance professional and personal responsibilities. For employers, the potential savings on office space and the ability to recruit from a geographically wider talent pool represent significant competitive advantages. Some research has also suggested that remote workers can be more productive than their office-based counterparts, particularly for tasks requiring sustained concentration.\n\nHowever, remote work also presents genuine challenges that should not be overlooked. Many employees, particularly those in smaller living spaces or shared households, struggle to create effective working environments at home. The boundary between work and personal life can become blurred, leading to longer working hours and increased risk of burnout. Junior employees and those new to an organisation may find it harder to learn from colleagues and build professional networks when working remotely, potentially affecting their long-term career development.\n\nThe social dimension of work is another area of concern. Office environments provide opportunities for informal interaction — the conversations that happen in corridors, kitchens, and meeting rooms — that can be difficult to replicate digitally. Research into organisational behaviour has shown that these spontaneous exchanges often play a crucial role in generating creative ideas, building team cohesion, and transmitting organisational culture. When remote, employees may feel isolated, and teams can lose the sense of shared identity that sustains high performance over time.\n\nIn response to these tensions, many organisations have adopted hybrid working models, in which employees split their time between home and the office. Hybrid arrangements aim to capture the flexibility and autonomy benefits of remote work while preserving the collaborative and social advantages of in-person contact. However, implementing hybrid work effectively requires careful management of scheduling, technology, and workplace design, and the evidence on its long-term impact remains mixed. What is clear is that the era of the five-day office week as the default working arrangement is unlikely to return for many knowledge workers."
    },
    {
      "number": 2,
      "title": "Renewable Energy and the Global Transition",
      "text": "The transition from fossil fuels to renewable sources of energy is widely regarded as one of the most urgent priorities of the twenty-first century. The scientific consensus on climate change is clear: continued reliance on coal, oil, and natural gas will drive global temperatures to levels that pose severe risks to human societies and natural ecosystems. In response, governments, international organisations, and private investors have committed unprecedented resources to the development and deployment of renewable energy technologies, most notably solar and wind power.\n\nThe pace of change in the renewable energy sector has been remarkable. The cost of generating electricity from solar photovoltaic panels has fallen by more than 90 percent over the past decade, making solar one of the cheapest sources of new electricity generation in many parts of the world. Wind energy has followed a similar trajectory. These dramatic cost reductions have been driven by a combination of technological innovation, manufacturing scale, and competitive market dynamics. In several countries, renewable energy sources now account for the majority of new electricity capacity being added to the grid.\n\nDespite this progress, the energy transition faces significant technical and political obstacles. One of the central challenges is the intermittent nature of solar and wind power — these sources generate electricity only when the sun shines or the wind blows, creating mismatches between supply and demand. Addressing this requires substantial investment in energy storage technologies, such as large-scale batteries, and in the modernisation of electricity grids to make them more flexible and interconnected. These infrastructure upgrades are expensive and time-consuming, and the pace of investment has not always matched the rate of renewable deployment.\n\nPolitical resistance also plays a role in slowing the transition. In countries where fossil fuel industries represent a significant source of employment and export revenue, governments face pressure to protect existing economic interests. Workers in coal mining regions, oil-producing states, and gas-dependent communities have legitimate concerns about job losses and regional economic decline. Managing a just transition — one that addresses these social and economic impacts while pursuing climate goals — is a complex policy challenge that no government has yet fully resolved.\n\nLooking ahead, the energy transition will require not only a shift in how electricity is generated but also deep changes in sectors such as transport, heating, and industry, which together account for the majority of global energy demand. Electric vehicles are rapidly expanding their share of the transport market, but the electrification of heavy industry and aviation remains technically difficult and expensive. The coming decades will test whether the combination of policy ambition, technological innovation, and investment can deliver a genuinely low-carbon global economy."
    },
    {
      "number": 3,
      "title": "The History and Science of Sleep",
      "text": "Sleep is a biological necessity shared by virtually all animals, yet for much of human history it was poorly understood and frequently undervalued. Ancient physicians attributed sleep to a cooling of the blood or the withdrawal of vital spirits from the brain. It was not until the twentieth century that scientific tools capable of measuring brain activity during sleep — most notably the electroencephalograph (EEG) — allowed researchers to begin mapping the complex architecture of the sleeping mind. What they discovered transformed our understanding of sleep from a passive state of rest to an active and essential biological process.\n\nModern sleep science recognises two primary states of sleep that alternate in cycles throughout the night. The first is non-rapid eye movement (NREM) sleep, which is subdivided into three stages of increasing depth. During the deepest stage of NREM sleep, the brain produces slow, synchronised electrical waves and the body undergoes physical restoration — repairing tissue, consolidating the immune system, and releasing growth hormones. The second state is rapid eye movement (REM) sleep, during which the brain becomes highly active, the eyes move rapidly beneath closed lids, and most vivid dreaming occurs. REM sleep is thought to be particularly important for emotional processing and memory consolidation.\n\nThe consequences of inadequate sleep are extensive and well documented. Short-term sleep deprivation impairs attention, reaction time, and decision-making to a degree comparable to alcohol intoxication. Chronic sleep insufficiency — defined as regularly obtaining less than the recommended seven to nine hours for adults — has been linked to a significantly elevated risk of cardiovascular disease, type 2 diabetes, obesity, and mental health disorders including depression and anxiety. Despite this, surveys consistently find that large proportions of adults in many countries regularly fail to obtain sufficient sleep.\n\nA variety of factors contribute to poor sleep in modern societies. Artificial light — particularly the blue-spectrum light emitted by smartphones, tablets, and computer screens — suppresses the production of melatonin, the hormone that signals to the body that it is time to sleep. Irregular schedules, shift work, high levels of psychological stress, and the consumption of caffeine and alcohol in the hours before bedtime all interfere with sleep quality and duration. The growing phenomenon of 'social jetlag' — the misalignment between the body's natural sleep timing and the demands of work and social life — has been identified as a significant public health concern.\n\nThere is also a cultural dimension to sleep deprivation. In many professional environments, particularly in finance, law, medicine, and technology, long working hours and minimal sleep have historically been worn as a badge of dedication and ambition. This culture of sleeplessness has begun to attract criticism from both health professionals and business leaders who argue that it is not only unsustainable but counterproductive. A growing body of evidence suggests that well-rested employees are more creative, make fewer errors, and are better able to regulate their emotions — making sleep not merely a health issue but a performance one."
    }
  ],
  "questions": [
    {
      "number": 1,
      "passageNumber": 1,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Remote working was entirely unknown before the global pandemic of 2020.",
      "answer": "FALSE"
    },
    {
      "number": 2,
      "passageNumber": 1,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Some studies suggest that remote workers can be more productive than office-based employees for certain types of tasks.",
      "answer": "TRUE"
    },
    {
      "number": 3,
      "passageNumber": 1,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "All employees find it easy to create effective working environments in their homes.",
      "answer": "FALSE"
    },
    {
      "number": 4,
      "passageNumber": 1,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Informal interactions in the workplace can contribute to the generation of new ideas.",
      "answer": "TRUE"
    },
    {
      "number": 5,
      "passageNumber": 1,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Hybrid working models have been proven to be more effective than fully remote arrangements in all contexts.",
      "answer": "NOT GIVEN"
    },
    {
      "number": 6,
      "passageNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "According to the passage, what was one advantage of remote work for employers?",
      "options": {
        "A": "Employees worked longer hours without additional pay",
        "B": "They could recruit from a wider geographical area",
        "C": "Office costs remained the same as before",
        "D": "Managers found it easier to monitor staff performance"
      },
      "answer": "B"
    },
    {
      "number": 7,
      "passageNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "What problem can arise when the boundary between work and personal life becomes blurred?",
      "options": {
        "A": "Employees lose interest in their professional development",
        "B": "Employers struggle to fill vacancies",
        "C": "Workers may experience burnout from longer working hours",
        "D": "Teams become more competitive with each other"
      },
      "answer": "C"
    },
    {
      "number": 8,
      "passageNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "Why might junior employees be disadvantaged by remote working arrangements?",
      "options": {
        "A": "They are less skilled at using digital communication tools",
        "B": "They are paid less than senior colleagues",
        "C": "They may find it harder to learn from colleagues and build networks",
        "D": "They are more likely to be dismissed during periods of remote work"
      },
      "answer": "C"
    },
    {
      "number": 9,
      "passageNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "What does the passage say about hybrid working models?",
      "options": {
        "A": "They have been rejected by most major organisations",
        "B": "They eliminate all the disadvantages of remote work",
        "C": "The long-term evidence on their effectiveness is still inconclusive",
        "D": "They require employees to work longer hours than before"
      },
      "answer": "C"
    },
    {
      "number": 10,
      "passageNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "What conclusion does the passage draw about the future of the five-day office week?",
      "options": {
        "A": "It will become more common as companies grow",
        "B": "It is unlikely to return as the default arrangement for many knowledge workers",
        "C": "It will be replaced entirely by fully remote working within five years",
        "D": "It remains the preferred option for most employees"
      },
      "answer": "B"
    },
    {
      "number": 11,
      "passageNumber": 2,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "The cost of solar electricity generation has decreased by more than 90 percent over the last ten years.",
      "answer": "TRUE"
    },
    {
      "number": 12,
      "passageNumber": 2,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Wind energy costs have remained stable while solar energy costs have fallen significantly.",
      "answer": "FALSE"
    },
    {
      "number": 13,
      "passageNumber": 2,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "The intermittent nature of solar and wind power is one of the key technical challenges of the energy transition.",
      "answer": "TRUE"
    },
    {
      "number": 14,
      "passageNumber": 2,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "All governments have successfully managed the social and economic impacts of moving away from fossil fuels.",
      "answer": "FALSE"
    },
    {
      "number": 15,
      "passageNumber": 2,
      "type": "TRUE_FALSE_NOT_GIVEN",
      "text": "Electric vehicles are increasingly common in the transport sector.",
      "answer": "TRUE"
    },
    {
      "number": 16,
      "passageNumber": 2,
      "type": "MULTIPLE_CHOICE",
      "text": "What has been the main driver of falling costs in renewable energy?",
      "options": {
        "A": "Government subsidies replacing all private investment",
        "B": "A combination of technological innovation, manufacturing scale, and market competition",
        "C": "The discovery of cheaper raw materials for solar panels",
        "D": "Reduced demand for electricity in developed countries"
      },
      "answer": "B"
    },
    {
      "number": 17,
      "passageNumber": 2,
      "type": "MULTIPLE_CHOICE",
      "text": "What does the passage identify as a major technical challenge for renewable energy?",
      "options": {
        "A": "The high cost of building new wind turbines",
        "B": "The difficulty of training engineers to maintain solar panels",
        "C": "The mismatch between supply and demand caused by the intermittent nature of renewables",
        "D": "The environmental impact of large-scale battery production"
      },
      "answer": "C"
    },
    {
      "number": 18,
      "passageNumber": 2,
      "type": "MULTIPLE_CHOICE",
      "text": "Why do some governments face pressure to slow the energy transition?",
      "options": {
        "A": "Renewable energy is still more expensive than fossil fuels in all markets",
        "B": "Fossil fuel industries provide significant employment and export revenue in some countries",
        "C": "International organisations have opposed rapid decarbonisation",
        "D": "There is no scientific agreement on the causes of climate change"
      },
      "answer": "B"
    },
    {
      "number": 19,
      "passageNumber": 2,
      "type": "MULTIPLE_CHOICE",
      "text": "What does the passage say about the electrification of heavy industry and aviation?",
      "options": {
        "A": "It is already well underway in most developed nations",
        "B": "It is technically straightforward but politically unpopular",
        "C": "It remains technically difficult and costly",
        "D": "It has been abandoned in favour of hydrogen technology"
      },
      "answer": "C"
    },
    {
      "number": 20,
      "passageNumber": 2,
      "type": "MULTIPLE_CHOICE",
      "text": "What is the passage's overall view of the energy transition?",
      "options": {
        "A": "It has already been largely completed in most countries",
        "B": "It is impossible without major reductions in global energy demand",
        "C": "It requires significant changes across multiple sectors and faces ongoing challenges",
        "D": "It depends entirely on the actions of a small number of wealthy nations"
      },
      "answer": "C"
    },
    {
      "number": 21,
      "passageNumber": 2,
      "type": "PARAGRAPH_MATCH",
      "text": "Describes the economic and social concerns of workers affected by the shift away from fossil fuels.",
      "paragraphOptions": ["A", "B", "C", "D", "E"],
      "answer": "D"
    },
    {
      "number": 22,
      "passageNumber": 2,
      "type": "PARAGRAPH_MATCH",
      "text": "Explains why solar and wind power cannot always meet electricity demand consistently.",
      "paragraphOptions": ["A", "B", "C", "D", "E"],
      "answer": "C"
    },
    {
      "number": 23,
      "passageNumber": 2,
      "type": "PARAGRAPH_MATCH",
      "text": "States that solar energy is now among the cheapest forms of new electricity generation.",
      "paragraphOptions": ["A", "B", "C", "D", "E"],
      "answer": "B"
    },
    {
      "number": 24,
      "passageNumber": 2,
      "type": "PARAGRAPH_MATCH",
      "text": "Identifies sectors beyond electricity generation that must also change during the energy transition.",
      "paragraphOptions": ["A", "B", "C", "D", "E"],
      "answer": "E"
    },
    {
      "number": 25,
      "passageNumber": 2,
      "type": "PARAGRAPH_MATCH",
      "text": "Refers to the scientific agreement on the risks of continuing to use fossil fuels.",
      "paragraphOptions": ["A", "B", "C", "D", "E"],
      "answer": "A"
    },
    {
      "number": 26,
      "passageNumber": 2,
      "type": "SHORT_ANSWER",
      "text": "What two renewable energy sources are most prominently mentioned in the passage?",
      "maxWords": 3,
      "answer": "solar and wind"
    },
    {
      "number": 27,
      "passageNumber": 2,
      "type": "SHORT_ANSWER",
      "text": "What type of technology is mentioned as a solution to the intermittent nature of renewables?",
      "maxWords": 3,
      "answer": "large-scale batteries"
    },
    {
      "number": 28,
      "passageNumber": 2,
      "type": "SHORT_ANSWER",
      "text": "What term does the passage use to describe a transition that addresses social and economic impacts fairly?",
      "maxWords": 3,
      "answer": "just transition"
    },
    {
      "number": 29,
      "passageNumber": 2,
      "type": "SHORT_ANSWER",
      "text": "Which transport sector is described as rapidly expanding its market share?",
      "maxWords": 3,
      "answer": "electric vehicles"
    },
    {
      "number": 30,
      "passageNumber": 2,
      "type": "SHORT_ANSWER",
      "text": "What must be modernised to make electricity supply more flexible and interconnected?",
      "maxWords": 3,
      "answer": "electricity grids"
    },
    {
      "number": 31,
      "passageNumber": 3,
      "type": "SUMMARY_COMPLETION",
      "text": "Before modern science, sleep was thought to be a ___ state rather than an active process.",
      "maxWords": 2,
      "answer": "passive"
    },
    {
      "number": 32,
      "passageNumber": 3,
      "type": "SUMMARY_COMPLETION",
      "text": "The tool that allowed scientists to measure brain activity during sleep was the ___.",
      "maxWords": 2,
      "answer": "electroencephalograph"
    },
    {
      "number": 33,
      "passageNumber": 3,
      "type": "SUMMARY_COMPLETION",
      "text": "During the deepest stage of NREM sleep, the brain produces slow, ___ electrical waves.",
      "maxWords": 2,
      "answer": "synchronised"
    },
    {
      "number": 34,
      "passageNumber": 3,
      "type": "SUMMARY_COMPLETION",
      "text": "REM sleep is considered especially important for emotional processing and ___ consolidation.",
      "maxWords": 2,
      "answer": "memory"
    },
    {
      "number": 35,
      "passageNumber": 3,
      "type": "SUMMARY_COMPLETION",
      "text": "The misalignment between natural sleep timing and social demands is known as ___ jetlag.",
      "maxWords": 2,
      "answer": "social"
    },
    {
      "number": 36,
      "passageNumber": 3,
      "type": "MULTIPLE_CHOICE",
      "text": "What does the passage say about the effect of short-term sleep deprivation on the brain?",
      "options": {
        "A": "It permanently reduces the capacity for decision-making",
        "B": "It has effects on attention and reaction time similar to alcohol intoxication",
        "C": "It only affects physical performance and not mental function",
        "D": "It is easily reversed after a single night of good sleep"
      },
      "answer": "B"
    },
    {
      "number": 37,
      "passageNumber": 3,
      "type": "MULTIPLE_CHOICE",
      "text": "Why does blue-spectrum light from screens affect sleep?",
      "options": {
        "A": "It causes eye strain that makes it physically difficult to fall asleep",
        "B": "It suppresses the production of melatonin, the sleep-signalling hormone",
        "C": "It stimulates the production of cortisol, increasing alertness permanently",
        "D": "It disrupts the transition between NREM and REM sleep cycles"
      },
      "answer": "B"
    },
    {
      "number": 38,
      "passageNumber": 3,
      "type": "MULTIPLE_CHOICE",
      "text": "What argument do business leaders make in favour of prioritising sleep?",
      "options": {
        "A": "Well-rested employees are less likely to resign from their positions",
        "B": "Sleep deprivation increases the cost of healthcare for employers",
        "C": "Rested employees are more creative, make fewer errors, and manage emotions better",
        "D": "Employees who sleep well require shorter working hours to achieve the same output"
      },
      "answer": "C"
    },
    {
      "number": 39,
      "passageNumber": 3,
      "type": "SHORT_ANSWER",
      "text": "What health conditions are associated with chronic sleep insufficiency? Name any TWO mentioned in the passage.",
      "maxWords": 3,
      "answer": "cardiovascular disease, type 2 diabetes, obesity, depression, anxiety"
    },
    {
      "number": 40,
      "passageNumber": 3,
      "type": "SHORT_ANSWER",
      "text": "In which professional environments has a culture of minimal sleep historically been considered a sign of dedication?",
      "maxWords": 3,
      "answer": "finance, law, medicine, technology"
    }
  ]
};

async function seed() {
  try {
    // 1. Delete existing if any
    const existing = await prisma.paper.findFirst({
      where: { paperCode: paperData.code, testType: "READING" }
    });

    if (existing) {
      console.log(`Deleting existing paper ${existing.id}`);
      await prisma.answer.deleteMany({ where: { question: { paperId: existing.id } } });
      await prisma.question.deleteMany({ where: { paperId: existing.id } });
      await prisma.passage.deleteMany({ where: { paperId: existing.id } });
      await prisma.writingTask.deleteMany({ where: { paperId: existing.id } });
      await prisma.attempt.deleteMany({ where: { paperId: existing.id } });
      await prisma.paper.delete({ where: { id: existing.id } });
    }

    // 2. Create paper
    const paper = await prisma.paper.create({
      data: {
        paperCode: paperData.code,
        testType: "READING",
        title: paperData.title,
        timeLimitMin: paperData.timeAllowed,
        instructions: "Read the passages carefully and answer all questions.",
        status: "ACTIVE",
        assignedBatches: "ALL"
      }
    });

    console.log(`Paper created: ${paper.id}`);

    // 3. Create passages
    for (const p of paperData.passages) {
      await prisma.passage.create({
        data: {
          paperId: paper.id,
          passageNumber: p.number,
          title: p.title,
          text: p.text
        }
      });
      console.log(`Passage ${p.number} created`);
    }

    // 4. Create questions
    for (const q of paperData.questions) {
      let optionsStr = null;
      if (q.options) {
        optionsStr = JSON.stringify(Object.entries(q.options).map(([key, val]) => `${key}. ${val}`));
      } else if (q.paragraphOptions) {
        optionsStr = JSON.stringify(q.paragraphOptions);
      }

      await prisma.question.create({
        data: {
          paperId: paper.id,
          passageNumber: q.passageNumber,
          questionNumber: q.number,
          questionType: q.type,
          content: q.text,
          options: optionsStr,
          correctAnswer: q.answer,
          explanation: null
        }
      });
      console.log(`Question ${q.number} created`);
    }

    console.log('Seed successful for READING004');
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
