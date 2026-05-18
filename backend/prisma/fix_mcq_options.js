const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixes = [

  // ── PAPER 001 – Urban Farming (Q6–10) ──────────────────────────────
  { ids: [6, 433], options: [
    'A. Growing awareness of environmental sustainability and food security',
    'B. The demand for fresh, locally sourced food has increased',
    'C. Government subsidies for urban agricultural businesses',
    'D. A decline in rural farming productivity'
  ]},
  { ids: [7, 434], options: [
    'A. It increases the use of organic pesticides in cities',
    'B. It reduces the need for refrigerated storage of food',
    'C. It reduces carbon emissions from food transportation',
    'D. It replaces traditional agricultural land entirely'
  ]},
  { ids: [8, 435], options: [
    'A. Digging underground farms beneath city streets',
    'B. Using vertical farming and hydroponics in small areas',
    'C. Relocating farms to suburban areas outside cities',
    'D. Replacing parks and green spaces with farmland'
  ]},
  { ids: [9, 436], options: [
    'A. Urban farms attract too many insects and pests',
    'B. Water usage in cities is already at full capacity',
    'C. Soil contamination in urban environments poses health risks',
    'D. Urban farming produces lower quality food than rural farming'
  ]},
  { ids: [10, 437], options: [
    'A. Urban farming is always cheaper than traditional farming',
    'B. The cost of urban farming equipment has recently fallen',
    'C. Urban farming may not be cost-effective due to higher land and labour costs',
    'D. Governments fully fund the cost of urban farming projects'
  ]},

  // ── PAPER 001 – Decision Making (Q16–20) ───────────────────────────
  { ids: [16, 443], options: [
    'A. The tendency to make decisions based on emotions alone',
    'B. The ability to analyse large amounts of information quickly',
    'C. The tendency to seek information that supports existing beliefs',
    'D. A method of using data to improve decision-making accuracy'
  ]},
  { ids: [17, 444], options: [
    'A. Because group decisions are always more accurate than individual ones',
    'B. Because people are naturally competitive and want to stand out',
    'C. Because of fear of rejection or desire for acceptance within a group',
    'D. Because individuals lack sufficient information to decide alone'
  ]},
  { ids: [18, 445], options: [
    'A. It always leads to better and more creative decisions',
    'B. It slows down the decision-making process significantly',
    'C. It may encourage risk-taking and override logical reasoning',
    'D. It has no measurable effect on how people decide'
  ]},
  { ids: [19, 446], options: [
    'A. Choosing between two equally attractive options',
    'B. The way choices are presented which influences decision outcomes',
    'C. Listing all possible outcomes before making a decision',
    'D. Avoiding emotional responses when evaluating options'
  ]},
  { ids: [20, 447], options: [
    'A. People can avoid making any mistakes in important decisions',
    'B. Individuals can learn to ignore all emotional influences',
    'C. People can improve the quality of their choices',
    'D. Decision-making becomes fully automatic with practice'
  ]},

  // ── PAPER 002 – Ocean Carbon (Q6–10) ───────────────────────────────
  { ids: [46], options: [
    'A. To generate energy from ocean currents and tidal movement',
    'B. To transport carbon from the ocean surface to the deep sea',
    'C. To regulate the salt content of ocean water',
    'D. To distribute heat evenly across ocean basins'
  ]},
  { ids: [47], options: [
    'A. Rising sea temperatures melting polar ice caps rapidly',
    'B. Increased evaporation reducing the pH of surface water',
    'C. The absorption of excess carbon dioxide by seawater',
    'D. Overfishing disrupting the natural balance of marine ecosystems'
  ]},
  { ids: [48], options: [
    'A. Faster growth rates in deep-water coral species',
    'B. Difficulty for marine organisms to build calcium carbonate shells',
    'C. An increase in the diversity of ocean plant species',
    'D. Greater absorption of sunlight by ocean surface waters'
  ]},
  { ids: [49], options: [
    'A. They are too expensive to implement on a large scale',
    'B. They require international cooperation that is difficult to achieve',
    'C. They may cause unintended damage to marine ecosystems',
    'D. They have already been proven ineffective in trials'
  ]},
  { ids: [50], options: [
    'A. It has already stopped functioning due to climate change',
    'B. It operates independently of surface ocean temperatures',
    'C. It could be disrupted by changes in temperature and salinity',
    'D. It is the least important factor in global climate regulation'
  ]},

  // ── PAPER 002 – Memory and Brain (Q16–20) ──────────────────────────
  { ids: [56], options: [
    'A. The ability to generate new neurons throughout adulthood',
    'B. The strengthening or weakening of connections between neurons',
    'C. The process by which short-term memories become permanent',
    'D. The transfer of memories from the hippocampus to the cortex'
  ]},
  { ids: [57], options: [
    'A. Because motor skills are stored in the hippocampus separately',
    'B. Because procedural memory relies on different brain structures',
    'C. Because motor skills do not require any form of memory storage',
    'D. Because the cerebral cortex compensates for hippocampal damage'
  ]},
  { ids: [58], options: [
    'A. It occurs only during periods of deep dreamless sleep',
    'B. It is completed within the first hour after an experience',
    'C. It is a gradual process that continues long after learning',
    'D. It depends entirely on the emotional significance of the memory'
  ]},
  { ids: [59], options: [
    'A. It proves that all memories can be permanently erased if needed',
    'B. It could allow targeted therapies for conditions like PTSD',
    'C. It means patients can recover lost memories through therapy',
    'D. It shows that memory is too unstable to be used in treatment'
  ]},
  { ids: [60], options: [
    'A. The prefrontal cortex and the amygdala',
    'B. The hippocampus and the temporal lobe',
    'C. The cerebellum and the basal ganglia',
    'D. The thalamus and the occipital lobe'
  ]},

  // ── PAPER 003 – Anthropocene (Q7–10) ───────────────────────────────
  { ids: [87], options: [
    'A. The invention of the steam engine in the eighteenth century',
    'B. The global spread of plastics and nuclear fallout from weapons testing',
    'C. The domestication of animals during the Neolithic period',
    'D. A significant rise in sea levels caused by glacial retreat'
  ]},
  { ids: [88], options: [
    'A. That the term has already been overused in popular media',
    'B. That it risks normalising environmental destruction as natural progression',
    'C. That the geological evidence is not yet strong enough',
    'D. That it places too much blame on developing nations'
  ]},
  { ids: [89], options: [
    'A. They are predictable events that scientists can plan around',
    'B. They are thresholds beyond which change becomes self-reinforcing and irreversible',
    'C. They only affect regional rather than global climate patterns',
    'D. They have been largely overstated in recent scientific literature'
  ]},
  { ids: [90], options: [
    'A. To provide a more precise geological definition of the epoch',
    'B. To attribute disruption to capital accumulation rather than humanity as a whole',
    'C. To replace the Anthropocene in formal scientific classification',
    'D. To argue that climate change is a natural rather than human process'
  ]},

  // ── PAPER 003 – Behavioural Economics (Q20–23) ─────────────────────
  { ids: [100], options: [
    'A. The preference for larger rewards even when delayed',
    'B. Losses are psychologically more painful than equivalent gains',
    'C. The habit of overestimating the probability of positive events',
    'D. The ability to remain neutral when evaluating financial risk'
  ]},
  { ids: [101], options: [
    'A. It uses financial penalties to force behaviour change',
    'B. It relies on removing all existing choices from individuals',
    'C. It alters behaviour without restricting freedom of choice',
    'D. It requires government legislation to be effective'
  ]},
  { ids: [102], options: [
    'A. That nudges are too expensive for governments to implement',
    'B. That nudges manipulate people without their full awareness',
    'C. That nudges have been proven ineffective in scientific studies',
    'D. That nudges only work for highly educated populations'
  ]},
  { ids: [103], options: [
    'A. That behavioural economics should be abandoned as a discipline',
    'B. That some foundational findings in behavioural economics may not be reliable',
    'C. That all nudge-based interventions must be retested immediately',
    'D. That laboratory experiments are always superior to field studies'
  ]},

  // ── PAPER 003 – AI and Inequality (Q36–38) ─────────────────────────
  { ids: [116], options: [
    'A. AI systems are deliberately programmed to disadvantage minorities',
    'B. AI systems trained on biased historical data replicate existing inequalities',
    'C. AI replaces too many jobs in low-income communities specifically',
    'D. AI development is funded primarily by socially irresponsible firms'
  ]},
  { ids: [117], options: [
    'A. Existing liability frameworks were designed for discrete human agents not AI',
    'B. Most countries have agreed on a shared AI liability standard',
    'C. Liability frameworks focus only on physical harm caused by AI',
    'D. Current legal systems have successfully adapted to AI-driven harm'
  ]},
  { ids: [118], options: [
    'A. It moves too slowly to keep pace with technological development',
    'B. It is dominated by countries with the least AI expertise',
    'C. It reflects competitive national interests rather than global cooperation',
    'D. It focuses too much on military rather than civilian applications'
  ]},

  // ── PAPER 004 – Remote Work (Q6–10) ────────────────────────────────
  { ids: [166], options: [
    'A. Employers could reduce the size of their management teams',
    'B. Savings on office space and access to a wider talent pool',
    'C. Employers gained access to a larger pool of local candidates',
    'D. Employers found it easier to monitor employee performance'
  ]},
  { ids: [167], options: [
    'A. Employees begin to socialise less with their colleagues',
    'B. Employees lose access to important professional training',
    'C. Longer working hours and increased risk of burnout',
    'D. Employees become less motivated to complete their tasks'
  ]},
  { ids: [168], options: [
    'A. Junior employees have less reliable internet connections at home',
    'B. Junior employees are given more difficult tasks when working remotely',
    'C. They find it harder to learn from colleagues and build professional networks',
    'D. Junior employees are more likely to be made redundant during remote work'
  ]},
  { ids: [169], options: [
    'A. Hybrid models have been rejected by most large organisations',
    'B. Hybrid models always lead to conflict between remote and office staff',
    'C. They aim to balance flexibility with collaborative advantages of in-person work',
    'D. Hybrid models are only practical for technology-based industries'
  ]},
  { ids: [170], options: [
    'A. The five-day office week will return completely within five years',
    'B. The five-day office week is unlikely to return for most knowledge workers',
    'C. The five-day office week is still preferred by the majority of employees',
    'D. The five-day office week has already been abolished in most countries'
  ]},

  // ── PAPER 004 – Renewable Energy (Q16–20) ──────────────────────────
  { ids: [176], options: [
    'A. Increased government subsidies for renewable energy companies',
    'B. Technological innovation, manufacturing scale, and competitive market dynamics',
    'C. A significant reduction in global energy demand overall',
    'D. The discovery of new sources of solar and wind energy'
  ]},
  { ids: [177], options: [
    'A. The high cost of building new wind and solar installations',
    'B. The lack of public support for renewable energy expansion',
    'C. The intermittent nature of solar and wind power generation',
    'D. The difficulty of training engineers to work in renewable sectors'
  ]},
  { ids: [178], options: [
    'A. Because renewable energy is still more expensive than fossil fuels',
    'B. Because fossil fuel industries represent significant employment and export revenue',
    'C. Because renewable infrastructure requires too much land',
    'D. Because consumers are resistant to changes in energy pricing'
  ]},
  { ids: [179], options: [
    'A. Both sectors have already completed their transition to renewables',
    'B. Both sectors are leading the way in developing clean technology',
    'C. Both sectors remain technically difficult and expensive to electrify',
    'D. Both sectors have been exempted from international climate agreements'
  ]},
  { ids: [180], options: [
    'A. The transition is moving too slowly to have any real impact',
    'B. The transition is nearly complete and ahead of most projections',
    'C. The transition is necessary but faces significant ongoing challenges',
    'D. The transition will ultimately be driven by consumer choice alone'
  ]},

  // ── PAPER 004 – Sleep Science (Q36–38) ─────────────────────────────
  { ids: [196], options: [
    'A. It permanently reduces the brain\'s capacity for learning',
    'B. It impairs attention, reaction time and decision-making comparable to alcohol intoxication',
    'C. It increases activity in the amygdala beyond normal levels permanently',
    'D. It causes the brain to enter a state similar to deep meditation'
  ]},
  { ids: [197], options: [
    'A. It raises body temperature making it harder to fall asleep',
    'B. It suppresses melatonin production signalling the body it is still daytime',
    'C. It overstimulates the visual cortex preventing relaxation',
    'D. It disrupts the body\'s natural circadian rhythm permanently'
  ]},
  { ids: [198], options: [
    'A. Well-rested employees are less likely to leave their jobs',
    'B. Sleep reduces the need for expensive workplace wellness programmes',
    'C. Better sleep leads to improved creativity and decision-making at work',
    'D. Sleep deprivation is the leading cause of workplace accidents globally'
  ]},

  // ── PAPER 005 – Antibiotics and AMR (Q6–10) ────────────────────────
  { ids: [353], options: [
    'A. It was the first medicine ever to be produced in a laboratory setting',
    'B. Its mass production during World War Two began the antibiotic era',
    'C. It was effective against a wider range of bacteria than expected',
    'D. It was discovered accidentally which made it particularly celebrated'
  ]},
  { ids: [354], options: [
    'A. Bacteria naturally evolve resistance regardless of antibiotic use',
    'B. Patients frequently fail to complete their full antibiotic course',
    'C. Inappropriate use allows resistant strains to accumulate and spread',
    'D. Hospitals do not follow sufficient hygiene protocols'
  ]},
  { ids: [355], options: [
    'A. Regulatory approval processes have become less strict over time',
    'B. Funding for infectious disease research has increased significantly',
    'C. Existing antibiotics are still considered effective enough by investors',
    'D. Antibiotics offer poor financial returns compared to drugs for chronic conditions'
  ]},
  { ids: [356], options: [
    'A. They have already eliminated the overuse of antibiotics in hospitals',
    'B. They allow more targeted prescribing and reduce broad-spectrum drug use',
    'C. They are too expensive to be used in low-income countries',
    'D. They have replaced the need for new antibiotic development'
  ]},
  { ids: [357], options: [
    'A. Resistant strains can spread rapidly across international borders via travel and trade',
    'B. Global trade has made antibiotics more widely available worldwide',
    'C. Developing nations now produce the majority of global antibiotics',
    'D. International travel has reduced the diversity of bacterial strains'
  ]},

  // ── PAPER 005 – Urban Trees (Q20–23) ───────────────────────────────
  { ids: [367], options: [
    'A. The cooling effect created by large parks and green spaces in cities',
    'B. Cities being significantly warmer than surrounding rural areas due to built surfaces',
    'C. The increase in rainfall recorded in densely populated urban centres',
    'D. The way in which tall buildings trap and redirect wind in city streets'
  ]},
  { ids: [368], options: [
    'A. Trees increase property values making buildings more profitable to sell',
    'B. Trees attract wildlife which reduces the need for pest control services',
    'C. Buildings shaded by trees require less air conditioning reducing costs and emissions',
    'D. Trees absorb noise pollution improving the working environment inside'
  ]},
  { ids: [369], options: [
    'A. Rising temperatures and altered precipitation patterns threaten established species',
    'B. Rising sea levels are causing urban soil to become too waterlogged',
    'C. Increased rainfall is leading to widespread root rot in city trees',
    'D. New fungal diseases are spreading faster due to warmer winters'
  ]},
  { ids: [370], options: [
    'A. They have already successfully eliminated tree inequity in major cities',
    'B. They are too costly for most city governments to implement effectively',
    'C. They focus exclusively on planting trees in the wealthiest districts',
    'D. Policies to ensure benefits of urban greenery are distributed fairly across communities'
  ]},

  // ── PAPER 005 – Emotional Intelligence (Q33–36) ────────────────────
  { ids: [380], options: [
    'A. It was immediately rejected by the academic psychology community',
    'B. It transformed a specialised academic proposal into a cultural movement',
    'C. It provided the first scientifically rigorous definition of EI',
    'D. It argued that EI was more important than IQ in all situations'
  ]},
  { ids: [381], options: [
    'A. EI tests are too long and expensive for routine workplace use',
    'B. EI scores vary too much depending on the time of day tested',
    'C. Different EI models assess different constructs and do not predict the same outcomes',
    'D. EI measurement relies too heavily on self-reported data from managers'
  ]},
  { ids: [382], options: [
    'A. There is limited evidence training produces lasting improvements or better outcomes',
    'B. EI training has no measurable effect on employee productivity at all',
    'C. EI training improves wellbeing but rarely affects job performance',
    'D. EI training is only effective when delivered over a long period'
  ]},
  { ids: [383], options: [
    'A. It proves that personality is more important than cognitive ability',
    'B. It demonstrates that all emotions are equally valuable in the workplace',
    'C. It shows that emotional regulation can be taught through simple exercises',
    'D. The emphasis on emotions as information that can be reasoned about adaptively'
  ]},

  // ── PAPER 006 – Coffee History (Q7–10) ─────────────────────────────
  { ids: [653], options: [
    'A. A young goat herder named Kaldi who discovered the berries',
    'B. A local monk who used the berries to make a drink to stay awake',
    'C. European merchants who imported beans from East Africa',
    'D. Arab traders who first roasted and brewed coffee beans'
  ]},
  { ids: [654], options: [
    'A. They provided a quiet space for religious reflection and study',
    'B. They were the only places where women could meet publicly',
    'C. They were centres of conversation, music, and learning',
    'D. They served as unofficial government offices for local administrators'
  ]},
  { ids: [655], options: [
    'A. It derives from the Arabic word for a type of dark roasted bean',
    'B. It comes from the Indonesian island of Java which became a major coffee producer',
    'C. It was invented by American sailors who traded in the Pacific',
    'D. It refers to a method of brewing coffee popular in South America'
  ]},
  { ids: [656], options: [
    'A. Coffee production is now dominated by a small number of corporations',
    'B. Despite many changes coffee remains a drink that brings people together',
    'C. The quality of coffee has declined due to industrial farming methods',
    'D. Coffee consumption is falling as younger generations prefer other drinks'
  ]},

  // ── PAPER 006 – Remote Work (Q33–36) ───────────────────────────────
  { ids: [679], options: [
    'A. That employees would use company equipment for personal tasks',
    'B. That productivity would fall without direct supervision',
    'C. That employees would share confidential information with competitors',
    'D. That remote workers would demand higher salaries over time'
  ]},
  { ids: [680], options: [
    'A. They are more likely to be distracted by family responsibilities at home',
    'B. They learn less when not surrounded by experienced colleagues',
    'C. They are given fewer responsibilities when working from home',
    'D. They find it harder to use the digital tools required for remote work'
  ]},
  { ids: [681], options: [
    'A. Between employees who prefer morning versus evening working hours',
    'B. Between companies that adopted remote work early and those that did not',
    'C. Between those whose jobs can be done remotely and those whose cannot',
    'D. Between employees in large cities and those in rural areas'
  ]},
  { ids: [682], options: [
    'A. Remote work will eventually replace all forms of office-based employment',
    'B. The most successful companies will return fully to office working',
    'C. The question has shifted to justifying coming into the office not working from home',
    'D. Employees should be given complete freedom to choose where they work'
  ]},

];

async function main() {
  console.log(`Fixing MCQ options for ${fixes.length} question groups...`);
  let updated = 0;

  for (const fix of fixes) {
    await prisma.question.updateMany({
      where: { id: { in: fix.ids } },
      data: { options: fix.options }
    });
    updated += fix.ids.length;
    console.log(`✅ Updated ids: ${fix.ids.join(', ')}`);
  }

  const framing = await prisma.question.updateMany({
    where: { id: 446 },
    data: { correctAnswer: 'B' }
  });
  if (framing.count > 0) {
    console.log(`✅ Set correctAnswer=B for question id 446 (framing duplicate)`);
  }

  console.log(`\n✅ Done. Updated ${updated} option rows.`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
