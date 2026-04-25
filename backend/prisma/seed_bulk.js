const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const paper1 = {
  paperCode: 'R-MIX-001',
  title: 'Mixed Academic Reading Test',
  testType: 'READING',
  timeLimitMin: 60,
  status: 'PUBLISHED',
  assignedBatches: 'ALL',
  instructions: `PASSAGE 1: The Rise of Urban Farming
Urban farming has emerged as a significant trend in cities around the world. As populations continue to grow and urban areas expand, the demand for fresh, locally sourced food has increased. Urban farming, which involves cultivating, processing, and distributing food within city environments, offers a practical solution to this challenge.
One of the key drivers behind urban farming is the growing awareness of environmental sustainability. Traditional agriculture often requires large amounts of land, water, and transportation, which contribute to environmental degradation and carbon emissions. In contrast, urban farming reduces the distance food travels from farm to consumer, thereby decreasing transportation-related pollution. Additionally, many urban farms adopt eco-friendly practices such as composting, rainwater harvesting, and organic cultivation methods.
Another important factor is food security. In many urban areas, especially in developing countries, access to affordable and nutritious food can be limited. Urban farming helps address this issue by enabling communities to produce their own food. Community gardens, rooftop farms, and vertical farming systems allow residents to grow fruits and vegetables even in densely populated areas.
However, urban farming is not without its challenges. Limited space is a major constraint, particularly in heavily built-up cities. Innovative solutions such as vertical farming and hydroponics have been developed to maximize productivity in small areas. Furthermore, there are concerns about soil contamination in urban environments, which can pose risks to human health if not properly managed.
Economic considerations also play a role. While urban farming can create job opportunities and support local economies, it may not always be as cost-effective as traditional farming due to higher land and labor costs in cities.

PASSAGE 2: The Psychology of Decision-Making
Human decision-making is a complex process influenced by a variety of psychological, social, and environmental factors. While people often believe that their choices are based on rational thinking, research has shown that emotions and cognitive biases play a significant role in shaping decisions.
One of the most well-known cognitive biases is confirmation bias, which refers to the tendency to seek out information that supports one's existing beliefs while ignoring contradictory evidence. This can lead individuals to make decisions that are not objectively optimal, as they may overlook important data.
Another factor affecting decision-making is the influence of social pressure. Individuals may change their choices to align with group expectations, even when they privately disagree. This phenomenon is particularly evident in situations where individuals fear rejection or desire acceptance within a group.
Emotions also play a crucial role. For example, fear can lead to risk-averse behavior, while excitement may encourage risk-taking. These emotional responses can sometimes override logical reasoning, leading to impulsive or irrational decisions.
Additionally, the way choices are presented — known as framing — can significantly influence outcomes. For instance, people are more likely to choose an option described in terms of gains rather than losses, even if the actual outcome is the same.
Understanding these psychological influences can help individuals make more informed and rational decisions. By recognizing biases and considering alternative perspectives, people can improve the quality of their choices.

PASSAGE 3: The Origins of Writing
Writing is one of the most significant developments in human history. It allowed societies to record information, communicate across distances, and preserve knowledge for future generations. Early forms of writing are believed to have emerged over 5,000 years ago in ancient civilizations such as Mesopotamia.
Initially, writing systems were based on pictorial symbols representing objects or ideas. These early systems gradually evolved into more abstract forms. For example, cuneiform writing, developed by the Sumerians, used wedge-shaped marks pressed into clay tablets. These symbols eventually came to represent sounds and words rather than just objects.
Scholars debate how writing first developed. Some believe it evolved from visual art, while others argue it arose independently in different regions, including Egypt, China, and Central America. Despite these differing theories, most agree that writing emerged as a practical tool for administration, trade, and record-keeping.
Over time, writing systems became more complex and efficient. Alphabets replaced earlier symbol-based systems, allowing for greater flexibility and expression. This transformation made it possible to represent spoken language more accurately and contributed to the spread of literacy.
Today, writing continues to evolve with technology. Digital communication has transformed how people write and share information. However, the fundamental purpose of writing — to record and communicate ideas — remains unchanged.`,
  questions: [
    { questionNumber: 1, passageNumber: 1, questionType: 'TFNG', content: 'Urban farming completely eliminates the need for transporting food over long distances.', correctAnswer: 'FALSE' },
    { questionNumber: 2, passageNumber: 1, questionType: 'TFNG', content: 'Traditional agriculture contributes to environmental problems.', correctAnswer: 'TRUE' },
    { questionNumber: 3, passageNumber: 1, questionType: 'TFNG', content: 'Urban farming is mainly practiced in rural areas.', correctAnswer: 'FALSE' },
    { questionNumber: 4, passageNumber: 1, questionType: 'TFNG', content: 'Some urban farms use environmentally friendly methods.', correctAnswer: 'TRUE' },
    { questionNumber: 5, passageNumber: 1, questionType: 'TFNG', content: 'Urban farming has no economic disadvantages.', correctAnswer: 'FALSE' },
    { questionNumber: 6, passageNumber: 1, questionType: 'MC', content: 'What is one main reason for the increase in urban farming?', options: JSON.stringify(['A. Decrease in city populations', 'B. Demand for fresh local food', 'C. Lack of farming technology', 'D. Government restrictions']), correctAnswer: 'B' },
    { questionNumber: 7, passageNumber: 1, questionType: 'MC', content: 'What environmental benefit does urban farming provide?', options: JSON.stringify(['A. Increased land usage', 'B. Higher water consumption', 'C. Reduced transportation pollution', 'D. More chemical fertilizers']), correctAnswer: 'C' },
    { questionNumber: 8, passageNumber: 1, questionType: 'MC', content: 'What is one method used to overcome space limitations?', options: JSON.stringify(['A. Expanding rural farms', 'B. Using vertical farming', 'C. Importing more food', 'D. Reducing crop variety']), correctAnswer: 'B' },
    { questionNumber: 9, passageNumber: 1, questionType: 'MC', content: 'What concern is mentioned regarding urban farming?', options: JSON.stringify(['A. Lack of interest from communities', 'B. Poor weather conditions', 'C. Soil contamination', 'D. Excessive rainfall']), correctAnswer: 'C' },
    { questionNumber: 10, passageNumber: 1, questionType: 'MC', content: 'What is said about the cost of urban farming?', options: JSON.stringify(['A. It is always cheaper than traditional farming', 'B. It has no financial challenges', 'C. It can be more expensive due to city costs', 'D. It requires no investment']), correctAnswer: 'C' },
    { questionNumber: 11, passageNumber: 2, questionType: 'TFNG', content: 'People always make decisions based purely on logic.', correctAnswer: 'FALSE' },
    { questionNumber: 12, passageNumber: 2, questionType: 'TFNG', content: 'Confirmation bias involves ignoring information that contradicts beliefs.', correctAnswer: 'TRUE' },
    { questionNumber: 13, passageNumber: 2, questionType: 'TFNG', content: 'Social pressure can influence individual decisions.', correctAnswer: 'TRUE' },
    { questionNumber: 14, passageNumber: 2, questionType: 'TFNG', content: 'Fear always leads to poor decision-making.', correctAnswer: 'NOT GIVEN' },
    { questionNumber: 15, passageNumber: 2, questionType: 'TFNG', content: 'The presentation of choices can affect decisions.', correctAnswer: 'TRUE' },
    { questionNumber: 16, passageNumber: 2, questionType: 'MC', content: 'What is confirmation bias?', options: JSON.stringify(['A. Making decisions based only on emotions', 'B. Ignoring all information', 'C. Seeking information that supports existing beliefs', 'D. Changing opinions frequently']), correctAnswer: 'C' },
    { questionNumber: 17, passageNumber: 2, questionType: 'MC', content: 'Why do people follow group decisions?', options: JSON.stringify(['A. They always agree with others', 'B. They want to avoid responsibility', 'C. They fear rejection or want acceptance', 'D. They lack knowledge']), correctAnswer: 'C' },
    { questionNumber: 18, passageNumber: 2, questionType: 'MC', content: 'What effect can excitement have on decision-making?', options: JSON.stringify(['A. It reduces all risks', 'B. It prevents decisions', 'C. It encourages risk-taking', 'D. It improves logic']), correctAnswer: 'C' },
    { questionNumber: 19, passageNumber: 2, questionType: 'MC', content: 'What is meant by framing?', options: JSON.stringify(['A. Ignoring all choices', 'B. The way information is presented', 'C. Making decisions quickly', 'D. Avoiding decisions']), correctAnswer: 'B' },
    { questionNumber: 20, passageNumber: 2, questionType: 'MC', content: 'What is one benefit of understanding decision-making psychology?', options: JSON.stringify(['A. Making faster decisions only', 'B. Avoiding all emotions', 'C. Improving the quality of decisions', 'D. Following others more easily']), correctAnswer: 'C' },
    { questionNumber: 21, passageNumber: 2, questionType: 'MATCHING', content: 'Mentions that emotions can override logical thinking.', correctAnswer: 'D' },
    { questionNumber: 22, passageNumber: 2, questionType: 'MATCHING', content: 'Explains a bias related to selective information.', correctAnswer: 'B' },
    { questionNumber: 23, passageNumber: 2, questionType: 'MATCHING', content: 'Refers to the influence of other people.', correctAnswer: 'C' },
    { questionNumber: 24, passageNumber: 2, questionType: 'MATCHING', content: 'Describes how choices are presented.', correctAnswer: 'E' },
    { questionNumber: 25, passageNumber: 2, questionType: 'MATCHING', content: 'Introduces the idea that decision-making is complex.', correctAnswer: 'A' },
    { questionNumber: 26, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What type of bias involves favouring supporting information?', correctAnswer: 'confirmation bias' },
    { questionNumber: 27, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What can fear influence in decision-making?', correctAnswer: 'risk-averse behavior' },
    { questionNumber: 28, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What do people seek when they follow group opinions?', correctAnswer: 'acceptance' },
    { questionNumber: 29, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What term describes how choices are presented?', correctAnswer: 'framing' },
    { questionNumber: 30, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What can improve decision-making quality?', correctAnswer: 'recognizing biases' },
    { questionNumber: 31, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Writing began as a way to record ___.', correctAnswer: 'information' },
    { questionNumber: 32, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Early systems used ___ symbols.', correctAnswer: 'pictorial' },
    { questionNumber: 33, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Over time writing became more ___.', correctAnswer: 'complex and efficient' },
    { questionNumber: 34, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Writing began to represent ___.', correctAnswer: 'sounds and words' },
    { questionNumber: 35, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Different regions may have developed writing ___.', correctAnswer: 'independently' },
    { questionNumber: 36, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What was cuneiform written on?', correctAnswer: 'clay tablets' },
    { questionNumber: 37, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What did early symbols represent?', correctAnswer: 'objects or ideas' },
    { questionNumber: 38, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What was a key use of writing in early societies?', correctAnswer: 'record-keeping' },
    { questionNumber: 39, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What replaced symbol-based systems?', correctAnswer: 'alphabets' },
    { questionNumber: 40, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What has changed writing in modern times?', correctAnswer: 'digital communication' }
  ]
};

const paper2 = {
  paperCode: 'R-ADV-002',
  title: 'Advanced Academic Reading Test',
  testType: 'READING',
  timeLimitMin: 60,
  status: 'PUBLISHED',
  assignedBatches: 'ALL',
  instructions: `PASSAGE 1: The Ocean's Carbon Cycle
The world's oceans play a critical yet often underappreciated role in regulating Earth's climate. Through a series of complex biological and chemical processes, the oceans absorb vast quantities of carbon dioxide from the atmosphere, acting as one of the planet's largest carbon sinks. Scientists estimate that the oceans have absorbed approximately 30 percent of all human-generated CO2 emissions since the Industrial Revolution, significantly moderating the pace of global warming.
At the heart of this process is the biological pump, a mechanism by which marine organisms — particularly phytoplankton — convert CO2 into organic matter through photosynthesis. When these organisms die, their carbon-rich remains sink to the ocean floor, effectively transferring carbon from the surface to the deep sea, where it can remain stored for centuries or even millennia.
However, the efficiency of this biological pump is being threatened by rising ocean temperatures and increasing acidification. As CO2 dissolves into seawater, it forms carbonic acid, lowering the ocean's pH. This process, known as ocean acidification, has profound consequences for marine ecosystems. Shell-forming organisms such as corals, oysters, and certain plankton species struggle to build and maintain their calcium carbonate structures in more acidic conditions, disrupting food webs and reducing the ocean's capacity to sequester carbon.
The physical circulation of the ocean also contributes significantly to carbon storage. The thermohaline circulation, often called the global ocean conveyor belt, transports carbon-rich deep water around the planet. Cold, dense water at the poles sinks and carries dissolved carbon to the deep ocean, while warmer surface water moves to replace it. Disruptions to this circulation — caused by the melting of polar ice and the influx of freshwater — could dramatically alter the ocean's role as a carbon regulator.
Scientists are now exploring a range of ocean-based strategies to enhance carbon sequestration, including iron fertilisation, which stimulates phytoplankton growth, and the cultivation of macroalgae as a means of capturing atmospheric carbon. While these approaches hold potential, they also raise significant concerns about unintended ecological consequences and the long-term stability of the stored carbon.

PASSAGE 2: The Neuroscience of Memory
Memory is not a single unified system but rather a collection of distinct processes that involve different regions of the brain. Neuroscientists have identified several types of memory, each serving a unique function and relying on specific neural pathways.
One of the most fundamental distinctions is between short-term and long-term memory. Short-term memory, sometimes referred to as working memory, holds a limited amount of information for a brief period. It is thought to depend heavily on the prefrontal cortex and is highly susceptible to interference from competing stimuli. Long-term memory can store vast amounts of information over an indefinite period and involves structural changes in synaptic connections, a process known as synaptic plasticity.
The hippocampus plays a central role in the formation of new long-term memories, particularly those related to facts and events — a category known as declarative or explicit memory. Damage to the hippocampus, such as that caused by Alzheimer's disease or traumatic brain injury, typically results in an inability to form new memories, though older memories stored elsewhere in the cortex may remain largely intact.
In contrast, procedural memory — the memory of how to perform skills and habits — does not depend on the hippocampus. Instead it relies on the basal ganglia and cerebellum. This distinction explains why patients with severe hippocampal damage can still learn new motor skills such as playing a musical instrument even though they have no conscious recollection of having practised.
Recent research has challenged the long-held view that memories are fixed once consolidated. Studies suggest that each time a memory is recalled it re-enters a labile state and must be reconsolidated. This process of reconsolidation opens a window during which the memory can be modified or even erased. The therapeutic implications are significant: by targeting reconsolidation, clinicians may one day be able to weaken traumatic memories in patients with post-traumatic stress disorder.
Despite these advances many fundamental questions about memory remain unanswered. How exactly does the brain encode abstract concepts or emotional associations? What determines why some experiences are remembered vividly while others fade rapidly?

PASSAGE 3: The Industrialisation of Food
The transformation of food production over the past two centuries represents one of the most far-reaching changes in human civilisation. The shift from subsistence farming and local markets to a globally integrated food industry has enabled unprecedented population growth, but it has also generated profound environmental, social, and public health consequences.
The industrialisation of agriculture began in earnest during the nineteenth century with the mechanisation of farming. The invention of the steel plough, the mechanical reaper, and later the internal combustion engine dramatically increased the scale at which land could be cultivated. By the mid-twentieth century the so-called Green Revolution introduced high-yielding crop varieties, synthetic fertilisers, and pesticides, resulting in dramatic increases in agricultural output.
However, this system has come at considerable cost. Industrial agriculture is a leading contributor to greenhouse gas emissions, accounting for approximately one quarter of global emissions. The widespread use of nitrogen-based fertilisers has resulted in the contamination of waterways through a process called nutrient runoff, leading to the formation of oxygen-depleted dead zones in coastal areas. Monoculture farming has also dramatically reduced biodiversity.
The social dimensions of food industrialisation are equally complex. While the global food system has made calories more affordable and accessible, it has simultaneously enabled the rise of ultra-processed foods engineered for palatability and shelf life rather than nutritional value. Epidemiologists have linked the proliferation of these products to rising rates of obesity, type 2 diabetes, and cardiovascular disease.
In response to these challenges, alternative food movements have gained momentum. Organic farming, agroecology, and regenerative agriculture seek to produce food in ways that restore rather than deplete natural systems. Meanwhile technological innovation is driving the development of plant-based proteins, cultured meat, and precision fermentation.
The future of food is deeply contested. Whether the dominant model will shift towards sustainability and equity or whether industrial consolidation will continue remains to be seen.`,
  questions: [
    { questionNumber: 1, passageNumber: 1, questionType: 'TFNG', content: 'The oceans have absorbed roughly one third of CO2 produced by human activity since the Industrial Revolution.', correctAnswer: 'TRUE' },
    { questionNumber: 2, passageNumber: 1, questionType: 'TFNG', content: 'Phytoplankton produce energy through a process that consumes carbon dioxide.', correctAnswer: 'TRUE' },
    { questionNumber: 3, passageNumber: 1, questionType: 'TFNG', content: 'Ocean acidification has no measurable effect on marine organisms that build shells.', correctAnswer: 'FALSE' },
    { questionNumber: 4, passageNumber: 1, questionType: 'TFNG', content: 'The thermohaline circulation plays a role in transporting carbon to deep ocean regions.', correctAnswer: 'TRUE' },
    { questionNumber: 5, passageNumber: 1, questionType: 'TFNG', content: 'Iron fertilisation has been widely adopted as an officially approved climate policy.', correctAnswer: 'NOT GIVEN' },
    { questionNumber: 6, passageNumber: 1, questionType: 'MC', content: 'What is the primary function of the biological pump?', options: JSON.stringify(['A. To regulate ocean temperature', 'B. To transfer carbon from the surface to the deep sea', 'C. To increase the pH of seawater', 'D. To produce freshwater at the poles']), correctAnswer: 'B' },
    { questionNumber: 7, passageNumber: 1, questionType: 'MC', content: 'What causes ocean acidification?', options: JSON.stringify(['A. Melting of polar ice caps', 'B. Disruption of the thermohaline circulation', 'C. CO2 dissolving in seawater to form carbonic acid', 'D. Overgrowth of macroalgae']), correctAnswer: 'C' },
    { questionNumber: 8, passageNumber: 1, questionType: 'MC', content: 'Which is described as a consequence of ocean acidification?', options: JSON.stringify(['A. Increased phytoplankton productivity', 'B. Disrupted food webs and reduced carbon sequestration', 'C. Faster thermohaline circulation', 'D. Higher levels of atmospheric oxygen']), correctAnswer: 'B' },
    { questionNumber: 9, passageNumber: 1, questionType: 'MC', content: 'What concern is raised about ocean-based carbon sequestration strategies?', options: JSON.stringify(['A. They are too expensive to implement', 'B. They rely on outdated scientific methods', 'C. They may cause unintended ecological damage', 'D. They have already been proven ineffective']), correctAnswer: 'C' },
    { questionNumber: 10, passageNumber: 1, questionType: 'MC', content: 'What does the passage suggest about the thermohaline circulation?', options: JSON.stringify(['A. It is unaffected by climate change', 'B. It only operates in tropical regions', 'C. It could be disrupted by freshwater influx from melting ice', 'D. It produces carbon dioxide at the ocean floor']), correctAnswer: 'C' },
    { questionNumber: 11, passageNumber: 2, questionType: 'TFNG', content: 'Working memory can retain information for an unlimited duration.', correctAnswer: 'FALSE' },
    { questionNumber: 12, passageNumber: 2, questionType: 'TFNG', content: 'The hippocampus is essential for forming new declarative memories.', correctAnswer: 'TRUE' },
    { questionNumber: 13, passageNumber: 2, questionType: 'TFNG', content: 'Patients with hippocampal damage are completely unable to learn any new skills.', correctAnswer: 'FALSE' },
    { questionNumber: 14, passageNumber: 2, questionType: 'TFNG', content: 'Memory reconsolidation suggests that recalled memories can be altered.', correctAnswer: 'TRUE' },
    { questionNumber: 15, passageNumber: 2, questionType: 'TFNG', content: 'Scientists have fully explained why certain experiences are remembered more clearly than others.', correctAnswer: 'FALSE' },
    { questionNumber: 16, passageNumber: 2, questionType: 'MC', content: 'What does synaptic plasticity refer to?', options: JSON.stringify(['A. The temporary storage of information in the prefrontal cortex', 'B. Structural changes in synaptic connections associated with long-term memory', 'C. The role of the hippocampus in short-term recall', 'D. A type of memory loss caused by brain injury']), correctAnswer: 'B' },
    { questionNumber: 17, passageNumber: 2, questionType: 'MC', content: 'Why can patients with hippocampal damage still learn motor skills?', options: JSON.stringify(['A. The hippocampus recovers quickly from minor damage', 'B. Motor skill memory relies on different brain regions', 'C. Motor skills are stored in short-term memory only', 'D. The prefrontal cortex compensates for hippocampal loss']), correctAnswer: 'B' },
    { questionNumber: 18, passageNumber: 2, questionType: 'MC', content: 'What is suggested about memory consolidation?', options: JSON.stringify(['A. It occurs instantly when a memory is first formed', 'B. It only applies to procedural memories', 'C. It involves moving memory traces from the hippocampus to the neocortex', 'D. It is irreversible once completed']), correctAnswer: 'C' },
    { questionNumber: 19, passageNumber: 2, questionType: 'MC', content: 'What is the significance of reconsolidation for medical treatment?', options: JSON.stringify(['A. It could help patients recover erased memories', 'B. It may allow traumatic memories to be weakened or modified', 'C. It enables the transfer of long-term memory to working memory', 'D. It offers a cure for all forms of amnesia']), correctAnswer: 'B' },
    { questionNumber: 20, passageNumber: 2, questionType: 'MC', content: 'Which brain structures are associated with procedural memory?', options: JSON.stringify(['A. Hippocampus and prefrontal cortex', 'B. Neocortex and hypothalamus', 'C. Basal ganglia and cerebellum', 'D. Amygdala and temporal lobe']), correctAnswer: 'C' },
    { questionNumber: 21, passageNumber: 2, questionType: 'MATCHING', content: 'Describes a type of memory that does not rely on the hippocampus.', correctAnswer: 'D' },
    { questionNumber: 22, passageNumber: 2, questionType: 'MATCHING', content: 'Introduces the idea that memory is not a single unified system.', correctAnswer: 'A' },
    { questionNumber: 23, passageNumber: 2, questionType: 'MATCHING', content: 'Discusses a process that may allow memories to be therapeutically altered.', correctAnswer: 'E' },
    { questionNumber: 24, passageNumber: 2, questionType: 'MATCHING', content: 'Explains the difference between short-term and long-term memory.', correctAnswer: 'B' },
    { questionNumber: 25, passageNumber: 2, questionType: 'MATCHING', content: 'Refers to questions in memory research that remain unresolved.', correctAnswer: 'F' },
    { questionNumber: 26, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What term is used for memory related to facts and events?', correctAnswer: 'declarative memory' },
    { questionNumber: 27, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'Which part of the brain is most associated with forming new long-term memories?', correctAnswer: 'hippocampus' },
    { questionNumber: 28, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What process makes newly acquired information stable over time?', correctAnswer: 'memory consolidation' },
    { questionNumber: 29, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What condition involves damage to the hippocampus and impairs memory formation?', correctAnswer: "Alzheimer's disease" },
    { questionNumber: 30, passageNumber: 2, questionType: 'SHORT_ANSWER', content: 'What type of memory involves the learning of skills and habits?', correctAnswer: 'procedural memory' },
    { questionNumber: 31, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'The industrialisation of farming began with the ___ of agriculture in the nineteenth century.', correctAnswer: 'mechanisation' },
    { questionNumber: 32, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'The Green Revolution introduced ___ crop varieties and synthetic fertilisers.', correctAnswer: 'high-yielding' },
    { questionNumber: 33, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'The contamination of waterways by fertilisers is caused by ___.', correctAnswer: 'nutrient runoff' },
    { questionNumber: 34, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: 'Ultra-processed foods have been connected to rising rates of obesity and ___.', correctAnswer: 'type 2 diabetes' },
    { questionNumber: 35, passageNumber: 3, questionType: 'SUMMARY_COMPLETION', content: '___ agriculture aims to restore rather than deplete natural systems.', correctAnswer: 'regenerative' },
    { questionNumber: 36, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What term describes the farming of a single crop species across large areas?', correctAnswer: 'monoculture farming' },
    { questionNumber: 37, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'Approximately what fraction of global emissions does industrial agriculture account for?', correctAnswer: 'one quarter' },
    { questionNumber: 38, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What type of zones form in coastal areas due to nutrient runoff?', correctAnswer: 'dead zones' },
    { questionNumber: 39, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'Name one technological innovation mentioned as an alternative to conventional livestock farming.', correctAnswer: 'cultured meat' },
    { questionNumber: 40, passageNumber: 3, questionType: 'SHORT_ANSWER', content: 'What does the passage suggest remains uncertain about the future of food?', correctAnswer: 'dominant model' }
  ]
};

async function main() {
  const papersToImport = [paper1, paper2];

  for (const paperData of papersToImport) {
    const { questions, ...paperFields } = paperData;
    
    // Check if exists
    let existingPaper = await prisma.paper.findUnique({
      where: { paperCode: paperFields.paperCode }
    });

    if (existingPaper) {
      console.log(`Paper ${paperFields.paperCode} already exists. Skipping.`);
      continue;
    }

    const createdPaper = await prisma.paper.create({
      data: {
        ...paperFields,
        questions: {
          create: questions
        }
      }
    });

    console.log(`Paper ${createdPaper.paperCode} added with ${questions.length} questions.`);
  }

  console.log('Bulk import complete!');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
