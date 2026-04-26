require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const paper = await prisma.paper.findFirst({
    where: { paperCode: '003', testType: 'READING' }
  });

  if (!paper) {
    console.error('READING 003 not found');
    return;
  }

  console.log('Found paper:', paper.id);

  const passages = [
    {
      passageNumber: 1,
      title: 'The Anthropocene: A New Geological Epoch',
      text: `The term 'Anthropocene' — derived from the Greek 'anthropos' (human) and 'kainos' (new) — was popularised by atmospheric chemist Paul Crutzen in the early 2000s to describe a proposed geological epoch in which human activity has become the dominant force shaping Earth's systems. Although the concept has gained considerable traction in scientific and public discourse, it has not yet been formally ratified by the International Commission on Stratigraphy, the body responsible for defining and naming geological time units. The debate over whether — and when — to designate the Anthropocene as an official epoch continues among geologists and earth scientists worldwide.

Central to the Anthropocene concept is the idea that human-driven changes to the planet are now of sufficient scale and permanence to leave a distinctive stratigraphic signal in the geological record. Candidate markers include the global dispersal of synthetic materials such as plastics and aluminium, the worldwide fallout of radionuclides from nuclear weapons testing beginning in the 1950s, changes in carbon and nitrogen isotope ratios, and the rapid extinction of species at rates far exceeding natural background levels. Proponents of the Anthropocene concept argue that the mid-twentieth century 'Great Acceleration' — a period of exponential growth in industrial output, population, and resource consumption — represents the most plausible starting point for this new epoch.
Not all scientists are persuaded, however. Critics argue that the Anthropocene lacks the geological permanence required of a formal stratigraphic unit, noting that human civilisation has existed for only a fraction of geological time and that the current period of disruption may ultimately prove transient relative to deep geological processes. Others contend that designating a new epoch risks normalising environmental destruction by framing it as a natural progression of Earth history, rather than as a crisis demanding urgent remediation. The political dimensions of the term — and the values embedded in its application — have made it as much a cultural concept as a scientific one.
Despite this controversy, the Anthropocene framework has proved enormously generative for interdisciplinary research. Ecologists, climatologists, archaeologists, and social scientists have all adopted the term as a way of foregrounding the entanglement of human and natural systems. Studies conducted under the Anthropocene umbrella have drawn attention to tipping points in the Earth system — thresholds beyond which change becomes self-reinforcing and potentially irreversible. These include the destabilisation of polar ice sheets, the dieback of the Amazon rainforest, and the disruption of monsoon patterns across Asia.
Some scholars have proposed alternative framings. The 'Capitalocene', for instance, attributes planetary disruption not to humanity as a whole but specifically to the logic of capital accumulation and the fossil fuel economy. The 'Plantationocene' draws attention to the role of colonial plantation agriculture in reshaping ecosystems and labour systems on a global scale. These critiques reflect a broader concern that the universalising language of the Anthropocene obscures deep inequalities in who has caused environmental change and who bears its consequences.
Whatever its ultimate scientific status, the Anthropocene has fundamentally altered how we think about the relationship between human societies and the natural world. It challenges the long-held assumption that geological change operates on timescales entirely beyond human influence, and it insists that the decisions made by contemporary societies carry consequences that will persist in the rock record for millions of years to come.`

},
{
  passageNumber: 2,
  title: 'Behavioural Economics and the Architecture of Choice',
  text: `Classical economic theory rests on the assumption that individuals are rational actors who consistently make decisions that maximise their own utility. This model — known as Homo economicus — predicts that people will gather all available information, weigh costs and benefits objectively, and choose the option that best serves their interests. For decades, this framework underpinned economic policy, financial regulation, and institutional design. However, from the 1970s onwards, a growing body of empirical research began to expose systematic and predictable patterns of irrationality in human decision-making, giving rise to the field now known as behavioural economics.

The pioneering work of psychologists Daniel Kahneman and Amos Tversky was instrumental in this shift. Their prospect theory, developed in 1979, demonstrated that people evaluate outcomes not in absolute terms but relative to a reference point, and that losses are psychologically more painful than equivalent gains — a phenomenon called loss aversion. In a series of elegant experiments, Kahneman and Tversky showed that individuals routinely violate the axioms of rational choice, being swayed by the framing of options, the order in which choices are presented, and the influence of emotionally salient examples over statistical data.
Building on this foundation, economists Richard Thaler and Cass Sunstein developed the concept of 'nudge theory', which they articulated in their influential 2008 book. A nudge is any aspect of the choice architecture — the way in which options are presented — that predictably alters behaviour without restricting freedom of choice or significantly changing financial incentives. Classic examples include automatically enrolling employees in pension schemes (with the option to opt out), placing healthier food options at eye level in cafeterias, and redesigning tax reminder letters to include information about how many neighbours have already paid. In each case, the default option or contextual cue does most of the behavioural work.
Nudge theory has been enthusiastically adopted by governments worldwide. The United Kingdom established a Behavioural Insights Team — informally known as the 'Nudge Unit' — in 2010, which has since produced hundreds of randomised controlled trials demonstrating measurable improvements in public health, tax compliance, and energy conservation. Similar units now operate in the United States, Australia, Singapore, and across the European Union. Proponents argue that nudges offer a low-cost, non-coercive alternative to legislation and financial incentives, achieving behavioural change without restricting individual freedom.
Critics, however, have raised substantive objections. Some argue that nudges are inherently paternalistic, as they involve policymakers making judgements about what constitutes good behaviour and then engineering environments to produce it — all without the explicit consent of those being nudged. Others question whether changes in behaviour produced by nudges are genuinely internalised or merely superficial, reverting once the nudge is removed. There is also the concern that nudge interventions, by focusing on individual behaviour, may distract attention from the structural and systemic causes of social problems, such as poverty, inequality, and corporate influence over consumption patterns.
Perhaps the most searching critique comes from within behavioural science itself. Replication studies have cast doubt on the robustness of several foundational findings, including ego depletion — the idea that willpower is a finite resource that diminishes with use — and some of the classic priming effects that were thought to influence behaviour through subtle environmental cues. This replication crisis has prompted calls for greater rigour in experimental design and a more cautious approach to translating laboratory findings into large-scale policy interventions.`

},
{
  passageNumber: 3,
  title: 'The Ethics and Governance of Artificial Intelligence',
  text: `Artificial intelligence (AI) has moved with remarkable speed from the periphery of computing research to the centre of global economic and political debate. Systems capable of recognising images, translating languages, generating text, and making diagnostic or predictive judgements are now embedded in critical infrastructure, healthcare, criminal justice, financial markets, and media ecosystems. This rapid diffusion has outpaced the development of regulatory frameworks, leaving a widening gap between what AI systems can do and society's capacity to govern what they should do.

At the heart of AI ethics lies a cluster of interrelated concerns. Fairness and non-discrimination require that AI systems do not reproduce or amplify existing social inequalities — a challenge that has proved more difficult than anticipated. Because machine learning models are trained on historical data, they inevitably absorb the biases embedded in those datasets. High-profile cases have documented AI systems that assigned lower credit scores to women, recommended longer prison sentences to Black defendants, and misidentified the faces of people with darker skin tones at significantly higher error rates than those with lighter skin. These failures are not mere technical glitches; they reflect and reinforce structural inequalities in the societies that produce them.
Transparency and explainability present a further dimension of the problem. Many of the most powerful AI systems — particularly large neural networks — are essentially opaque, arriving at outputs through processes that even their creators cannot fully interpret. This 'black box' quality poses acute challenges in high-stakes domains. When an algorithm denies someone a loan, recommends against parole, or flags a medical image as abnormal, the affected individual has a reasonable interest in understanding the basis for that decision. The European Union's General Data Protection Regulation (GDPR) includes a 'right to explanation' for automated decisions, but legal scholars debate whether current technical methods are capable of delivering meaningful explanations that go beyond post-hoc rationalisations.
The question of accountability is closely bound up with these transparency concerns. When an AI system causes harm, the diffuse nature of modern AI development — involving data collectors, model trainers, platform deployers, and end users across multiple jurisdictions — makes it extraordinarily difficult to assign legal or moral responsibility. This 'accountability gap' is compounded by the speed at which AI systems are updated and the opacity of proprietary algorithms. Existing liability frameworks, designed for a world of discrete human agents and identifiable causes, are poorly adapted to the distributed, probabilistic nature of AI-driven harm.
Autonomous weapons systems represent perhaps the sharpest ethical frontier. Military AI capable of selecting and engaging targets without meaningful human intervention raises profound questions about the laws of armed conflict, the principle of distinction between combatants and civilians, and the moral permissibility of delegating lethal decisions to machines. Campaigns for an international treaty banning fully autonomous weapons — often called 'killer robots' — have gained support from a broad coalition of scientists, ethicists, and former military commanders, though major powers including the United States, Russia, and China have resisted binding commitments.
Governance responses have proliferated but remain fragmented. The EU AI Act, provisionally agreed in 2023, establishes a risk-based regulatory framework that imposes stricter requirements on high-risk applications such as biometric surveillance, credit scoring, and recruitment. The United States has favoured a more sector-specific, voluntary approach, relying on agency guidance and executive orders rather than comprehensive legislation. China has introduced regulations targeting specific AI applications, particularly generative AI, while simultaneously investing heavily in AI development as a national strategic priority. Critics argue that this patchwork of national regulations, developed in a spirit of competitive advantage rather than cooperative governance, is inadequate for technologies whose impacts transcend borders.`

}
];

  for (const passage of passages) {
    // Note: paperId_passageNumber is a unique constraint we should have, 
    // but if not, we can just find and update.
    const existingPassage = await prisma.passage.findFirst({
      where: {
        paperId: paper.id,
        passageNumber: passage.passageNumber
      }
    });

    if (existingPassage) {
      await prisma.passage.update({
        where: { id: existingPassage.id },
        data: { title: passage.title, text: passage.text }
      });
    } else {
      await prisma.passage.create({
        data: {
          paperId: paper.id,
          passageNumber: passage.passageNumber,
          title: passage.title,
          text: passage.text
        }
      });
    }
    console.log('Passage', passage.passageNumber, 'saved:', passage.title);
  }

  console.log('All passages saved for READING 003');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
