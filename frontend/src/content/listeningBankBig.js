// The big word bank for Listening practice: 16 topics x 40 words.
// Each line: word | meaning | Sinhala | spelling tip (optional). Words are spoken by the browser, so spell them exactly.
const S = (id, title, lines) => ({
  id, title, note: 'Big word bank: new words, shuffled.',
  words: lines.trim().split('\n').map(l => l.split('|').map(x => x.trim())).map(([w, m, si, tip = '']) => [w, m, si, tip]),
});

export const BIG_SETS = [
  S('b-home', 'Home and family', `
bedroom|a room for sleeping|නිදන කාමරය|bed + room
kitchen|a room for cooking|කුස්සිය|silent T sound: KIT-chen
bathroom|a room with a shower and toilet|නාන කාමරය|bath + room
furniture|tables, chairs and beds|ගෘහ භාණ්ඩ|ends in -ture
cupboard|a small cabinet with doors|අල්මාරිය|silent P: CUB-bard
pillow|a soft thing for your head in bed|කොට්ටය|double L
blanket|a warm cover for a bed|බ්ලැන්කට්ටුව|
curtain|cloth that covers a window|තිරරෙද්ද|ends in -ain
ceiling|the top of a room|සිවිලිම|E before I after C
staircase|a set of steps inside a house|පඩිපෙළ|stair + case
neighbour|a person who lives next to you|අසල්වැසියා|British: -our
relative|a person in your family|ඥාතියා|
cousin|your aunt's or uncle's child|ඥාති සහෝදරයා|cou-SIN
nephew|your brother's or sister's son|බෑණා|PH sounds like F
niece|your brother's or sister's daughter|ලේලි|I before E
grandparents|your parents' parents|සීයා සහ ආච්චි|grand + parents
husband|a married man|සැමියා|
daughter|a female child|දියණිය|silent GH
parents|mother and father|දෙමාපියන්|
childhood|the time when you were a child|ළමා කාලය|child + hood
wedding|a marriage ceremony|විවාහ මංගල්‍යය|double D
birthday|the day you were born|උපන්දිනය|birth + day
guest|a visitor to your home|අමුත්තා|silent U
housework|cleaning and cooking at home|ගෙදර වැඩ|house + work
laundry|washing clothes|රෙදි සේදීම|
garden|land with plants next to a house|ගෙවත්ත|
garage|a building for a car|ගරාජය|ga-RAGE
rent|money you pay to live in a house|කුලිය|
landlord|the owner of a rented house|ගෙහිමියා|land + lord
electricity bill|money you pay for power|විදුලි බිල|
comfortable|nice and relaxing|සුවපහසු|COMF-ta-ble
tidy|clean and in order|පිළිවෙළ|
messy|not tidy|අවුල්|double S
quiet|with no noise|නිස්කලංක|qui-ET (not quite)
spacious|with a lot of space|ඉඩකඩ සහිත|ends in -cious
upstairs|on a higher floor|උඩ තට්ටුවේ|up + stairs
downstairs|on a lower floor|පහළ තට්ටුවේ|down + stairs
balcony|a small area outside an upstairs window|බැල්කනිය|
roof|the top of a building|වහලය|double O
apartment block|a building with many flats|මහල් නිවාස ගොඩනැගිල්ල|
`),
  S('b-food', 'Food and cooking', `
breakfast|the morning meal|උදෑසන ආහාරය|break + fast
lunch|the midday meal|දිවා ආහාරය|
dinner|the evening meal|රාත්‍රී ආහාරය|double N
recipe|instructions for cooking|වට්ටෝරුව|re-ci-PE (three sounds)
ingredient|one thing you use in a recipe|අමුද්‍රව්‍යය|in-GRE-di-ent
vegetable|a plant you eat, like a carrot|එළවළුව|VEG-ta-ble
cabbage|a big round green vegetable|ගෝවා|double B
potato|a vegetable that grows under the ground|අර්තාපල්|plural: potatoes
tomato|a red fruit used in salads|තක්කාලි|plural: tomatoes
onion|a vegetable that makes you cry|ළූණු|
garlic|a strong-smelling small vegetable|සුදු ළූණු|
pepper|a hot spice|ගම්මිරිස්|double P
chilli|a very hot pepper|මිරිස්|double L
coconut|a big brown nut from a palm tree|පොල්|
pineapple|a sweet yellow tropical fruit|අන්නාසි|pine + apple
banana|a long yellow fruit|කෙසෙල්|
mango|a sweet orange fruit|අඹ|
noodles|long thin strips of food|නූඩ්ල්ස්|double O
seafood|fish and other food from the sea|මුහුදු ආහාර|sea + food
chicken|meat from a farm bird|කුකුළු මස්|
beef|meat from a cow|හරක් මස්|
sugar|it makes food sweet|සීනි|
flour|powder for making bread|පිටි|flour (food) / flower (plant)
butter|yellow fat made from milk|බටර්|double T
cheese|food made from milk|චීස්|double E
yoghurt|thick sour milk|යෝගට්|silent H
bread|food made from flour and baked|පාන්|
bowl|a deep round dish|බඳුන|
spoon|you eat soup with it|හැන්ද|double O
knife|you cut food with it|පිහිය|silent K
fork|you eat with it; it has points|ගෑරුප්පුව|
frying pan|a flat pan for cooking|තැටිය|
boil|to cook in very hot water|තම්බනවා|
fry|to cook in hot oil|බදිනවා|
bake|to cook in an oven|පුළුස්සනවා|
delicious|tastes very good|රසවත්|ends in -cious
spicy|hot with spices|සැර|
bitter|a strong, not sweet taste|තිත්ත|double T
salty|tasting of salt|ලුණු රස|
menu|a list of food in a restaurant|ආහාර ලැයිස්තුව|
`),
  S('b-weather', 'Weather and seasons', `
weather|rain, sun, wind today|කාලගුණය|weather (rain) / whether (if)
season|spring, summer, autumn or winter|ඍතුව|
spring|the season after winter|වසන්තය|
summer|the hottest season|ගිම්හානය|double M
autumn|the season after summer|සරත් ඍතුව|silent N
winter|the coldest season|ශීත ඍතුව|
monsoon|the season of heavy rain|මෝසම|double O
thunder|the loud noise in a storm|ගිගුරුම|
lightning|the flash of light in a storm|අකුණු|no E: light-ning
storm|very bad weather with wind and rain|කුණාටුව|
cloudy|with a lot of clouds|වලාකුළු සහිත|
foggy|with thick cloud near the ground|මීදුම සහිත|double G
humid|hot and wet air|තෙතමනය සහිත|
freezing|very, very cold|අධික සීතල|
snow|white frozen rain|හිම|
ice|frozen water|අයිස්|
temperature|how hot or cold it is|උෂ්ණත්වය|tem-PER-a-ture
degrees|units for temperature|අංශක|double E
forecast|what the weather will be|කාලගුණ අනාවැකිය|fore + cast
sunshine|light from the sun|හිරු එළිය|sun + shine
rainbow|colours in the sky after rain|දේදුන්න|rain + bow
breeze|a light wind|සුළඟ|double E
windy|with a lot of wind|සුළං සහිත|
shower|a short time of rain|වැසි පොදක්|
heavy rain|a lot of rain|තද වැසි|
drought|a long time with no rain|නියඟය|ends in -ought
heatwave|a time of very hot weather|තාප රැල්ල|heat + wave
umbrella|it keeps the rain off you|කුඩය|double L
raincoat|a coat for the rain|වැසි කබාය|rain + coat
gloves|you wear them on your hands|අත්වැසුම්|
scarf|cloth you wear round your neck|ස්කාෆ්|
sunglasses|dark glasses for the sun|අව්කණ්ණාඩි|sun + glasses
climate|the usual weather of a place|දේගුණය|
tropical|hot and wet, near the equator|නිවර්තන|
mild|not too hot or too cold|මෘදු|
chilly|a little cold|සීතල|double L
pleasant|nice|ප්‍රසන්න|pleas-ANT
dry|with no water|වියළි|
wet|with water on it|තෙත්|
sunrise|when the sun comes up|හිරු උදාව|sun + rise
`),
  S('b-jobs', 'Jobs and the workplace', `
engineer|designs machines, roads or buildings|ඉංජිනේරුවා|double E
accountant|works with money and numbers|ගණකාධිකාරී|double C
architect|designs buildings|ගෘහ නිර්මාණ ශිල්පියා|CH sounds like K
electrician|fixes electric wires|විදුලි කාර්මිකයා|ends in -cian
plumber|fixes water pipes|ජලනල කාර්මිකයා|silent B
mechanic|fixes cars|යාන්ත්‍රිකයා|CH sounds like K
receptionist|works at the front desk|පිළිගැනීමේ නිලධාරී|
secretary|helps a manager with office work|ලේකම්|SEC-re-ta-ry
pharmacist|prepares medicine|ඖෂධවේදියා|PH sounds like F
surgeon|a doctor who operates|ශල්‍ය වෛද්‍යවරයා|SUR-geon
dentist|a doctor for teeth|දන්ත වෛද්‍යවරයා|
lawyer|helps people with the law|නීතිඥයා|
police officer|keeps people safe|පොලිස් නිලධාරියා|
firefighter|stops fires|ගිනි නිවන භටයා|fire + fighter
farmer|grows crops or keeps animals|ගොවියා|
fisherman|catches fish|ධීවරයා|fish + er + man
chef|the main cook in a restaurant|අරක්කැමියා|CH sounds like SH
waiter|brings food in a restaurant|වේටර්|
cashier|takes money in a shop|මුදල් අයකැමි|
driver|drives a vehicle|රියදුරා|
builder|builds houses|ගොඩනැගිලි කම්කරුවා|
cleaner|cleans buildings|පිරිසිදු කරන්නා|
caregiver|looks after old or sick people|රැකබලා ගන්නා|care + giver
office|a room where people work|කාර්යාලය|double F
meeting|when people come together to talk|රැස්වීම|double E
deadline|the last day to finish|අවසාන දිනය|dead + line
shift|a period of work time|වැඩ මුරය|
uniform|special clothes for work|නිල ඇඳුම|
boss|the person in charge|ලොක්කා|double S
staff|all the workers|කාර්ය මණ්ඩලය|double F
apply|to ask for a job|අයදුම් කරනවා|double P
applicant|a person who asks for a job|අයදුම්කරු|double P
training|learning to do a job|පුහුණුව|
experience|what you have done before|අත්දැකීම|ends in -ence
wage|money paid per hour or day|දෛනික වැටුප|
bonus|extra money for good work|ප්‍රසාද දීමනාව|
holiday|time off work|නිවාඩුව|
resign|to leave your job|ඉල්ලා අස්වෙනවා|silent G
hire|to give someone a job|රැකියාවට ගන්නවා|
teamwork|working well together|කණ්ඩායම් වැඩ|team + work
`),
  S('b-body', 'Body and feelings', `
shoulder|where your arm joins your body|උරහිස|
elbow|the middle of your arm|වැලමිට|
finger|one of five on your hand|ඇඟිල්ල|
thumb|your short, thick finger|මාපටැඟිල්ල|silent B
knee|the middle of your leg|දණහිස|silent K
ankle|between your foot and leg|වළලුකර|
forehead|above your eyes|නළල|fore + head
eyebrow|hair above your eye|ඇහිබැම|eye + brow
tongue|in your mouth, for tasting|දිව|silent -ue
throat|the inside of your neck|උගුර|
chest|the front of your body|පපුව|
lungs|you breathe with them|පෙනහළු|
brain|you think with it|මොළය|
skin|the outside of your body|සම|
bone|hard parts inside the body|ඇටය|
tooth|one of the white things in your mouth|දත|plural: teeth
happy|feeling good|සතුටු|double P
angry|feeling mad|කෝපයට පත්|
nervous|a little afraid|නොසන්සුන්|ends in -ous
excited|very happy about something soon|උද්යෝගිමත්|
bored|not interested|කම්මැලි|
lonely|sad because you are alone|තනිකම දැනෙන|
proud|happy about what you did|ආඩම්බර|
jealous|wanting what another person has|ඊර්ෂ්‍යා සහිත|ends in -ous
worried|thinking about problems|කනස්සලු|double R
surprised|feeling something unexpected|පුදුමයට පත්|
confused|not understanding|ව්‍යාකූල|
relaxed|calm and not worried|සැහැල්ලු|
grateful|feeling thankful|කෘතඥ|grate + ful (one L)
homesick|missing your home|ගෙදර මතක් වෙන|home + sick
tired|wanting to sleep|මහන්සි|
exhausted|very, very tired|දැඩි ලෙස වෙහෙසට පත්|silent H
embarrassed|feeling shy and silly|ලැජ්ජාවට පත්|double R, double S
confident|sure about yourself|ආත්ම විශ්වාසය ඇති|
patient|able to wait calmly|ඉවසිලිවන්ත|TI sounds like SH
cheerful|happy and bright|ප්‍රීතිමත්|one L at the end
anxious|very worried|කාංසාවෙන් පසුවන|
calm|quiet and relaxed|සන්සුන්|silent L
upset|unhappy and worried|කලබලයට පත්|
emotion|a feeling|හැඟීම|
`),
  S('b-sport', 'Sports and free time', `
football|a game with a ball and two goals|පාපන්දු|foot + ball
cricket|a bat and ball game|ක්‍රිකට්|
volleyball|a game over a high net|වොලිබෝල්|double L
badminton|a game with rackets and a shuttle|බැඩ්මින්ටන්|
swimming|moving through water|පිහිනීම|double M
cycling|riding a bicycle|බයිසිකල් පැදීම|
running|moving fast on your feet|දිවීම|double N
hiking|walking in the mountains|කඳු නැගීම|
fishing|catching fish|මාළු ඇල්ලීම|
camping|sleeping in a tent|කඳවුරු බැඳීම|
photography|taking photos|ඡායාරූප ශිල්පය|PH sounds like F
painting|making pictures with colour|චිත්‍ර ඇඳීම|
gardening|looking after plants|වගා කිරීම|
reading|looking at books|කියවීම|
dancing|moving to music|නැටීම|
singing|making music with your voice|ගායනය|
guitar|a musical instrument with strings|ගිටාරය|silent U
drum|a musical instrument you hit|බෙරය|
chess|a board game with kings and queens|චෙස්|double S
puzzle|a game to think about|ප්‍රහේලිකාව|double Z
team|a group of players|කණ්ඩායම|
player|a person in a game|ක්‍රීඩකයා|
coach|a person who trains players|පුහුණුකරු|
referee|the judge in a football match|විනිසුරු|double E at the end
match|a game between two teams|තරගය|
score|the number of points|ලකුණු|
winner|the person who wins|ජයග්‍රාහකයා|double N
competition|an event to find the best|තරඟාවලිය|compe-TI-tion
championship|a competition for the top prize|ශූරතාව|
stadium|a big place for sports|ක්‍රීඩාංගණය|
gym|a place to exercise|ව්‍යායාම ශාලාව|
racket|you hit the ball with it in tennis|රැකට්ටුව|
helmet|a hard hat for safety|හිස් ආවරණය|
practise|to do again and again (verb)|පුහුණු වෙනවා|British: practise (verb), practice (noun)
hobby|something you do for fun|විනෝදාංශය|double B
leisure|free time|විවේකය|LE-zhure
concert|a music show|ප්‍රසංගය|
museum|a building with old things to see|කෞතුකාගාරය|mu-SE-um
festival|a big celebration|උත්සවය|
holiday|time away from work or school|නිවාඩුව|
`),
  S('b-transport', 'Transport and directions', `
vehicle|a car, bus or lorry|වාහනය|silent H
motorbike|a bike with an engine|යතුරුපැදිය|motor + bike
lorry|a big truck|ලොරිය|double R
ferry|a boat that carries people and cars|පාරුව|double R
helicopter|an aircraft with turning blades|හෙලිකොප්ටරය|
journey|a trip from one place to another|ගමන|jour-NEY
route|the way you go|මාර්ගය|ROOT
traffic jam|cars that cannot move|රථවාහන තදබදය|
roundabout|a round road junction|වටරවුම|round + about
crossing|a place to walk across the road|පදික මාරුව|
bridge|it goes over a river|පාලම|
tunnel|a road under a mountain|උමග|double N
motorway|a big fast road|අධිවේගී මාර්ගය|motor + way
petrol|fuel for cars|පෙට්‍රල්|
fare|money for a bus or train ticket|ගාස්තුව|fare (ticket) / fair (honest)
return ticket|a ticket there and back|ආපසු ටිකට්පත|
single ticket|a ticket one way|එක් පැත්තක ටිකට්පත|
departure|leaving|පිටත්වීම|
arrival|coming in|පැමිණීම|
delay|when something is late|ප්‍රමාදය|
cancel|to stop a plan|අවලංගු කරනවා|one L
boarding pass|a ticket to get on a plane|ගුවන් යානයට ඇතුළුවීමේ පත්‍රය|
seatbelt|a belt that keeps you safe in a car|ආසන පටිය|seat + belt
straight on|go forward, do not turn|කෙළින්ම ඉදිරියට|
turn left|go to the left|වමට හැරෙන්න|
turn right|go to the right|දකුණට හැරෙන්න|
corner|where two roads meet|මුල්ල|
opposite|on the other side|ඉදිරිපිට|double P
next to|beside|අසලම|
behind|at the back of|පිටුපස|
in front of|before, facing|ඉදිරියෙන්|
north|the direction to the top of a map|උතුර|
south|the direction to the bottom of a map|දකුණ|
east|where the sun comes up|නැගෙනහිර|
west|where the sun goes down|බටහිර|
distance|how far it is|දුර|
kilometre|1,000 metres|කිලෝමීටරය|British: -tre
nearby|close|ළඟපාත|near + by
pedestrian|a person walking|පදිකයා|
passenger|a person on a bus or plane|මගියා|double S
`),
  S('b-nature', 'Nature and animals', `
mountain|a very high hill|කන්ද|ends in -ain
valley|low land between hills|නිම්නය|double L
waterfall|water falling from a high place|දිය ඇල්ල|water + fall
river|a long line of water|ගඟ|
lake|water with land all around|වැව|
beach|sand next to the sea|වෙරළ|
jungle|a thick tropical forest|කැලය|
field|open land for crops|කෙත|I before E
soil|the earth that plants grow in|පස|
leaf|the green part of a plant|කොළය|plural: leaves
branch|a part of a tree|අත්ත|
root|the part of a plant under the ground|මුල|
seed|a new plant grows from it|බීජය|double E
elephant|a very big grey animal|අලියා|PH sounds like F
leopard|a big wild cat with spots|කොටියා|silent O: LEP-ard
monkey|an animal that climbs trees|වඳුරා|
peacock|a bird with a beautiful tail|මොනරා|pea + cock
butterfly|an insect with colourful wings|සමනලයා|butter + fly
mosquito|a small insect that bites|මදුරුවා|plural: mosquitoes
snake|a long animal with no legs|නයා|
turtle|a sea animal with a shell|කැස්බෑවා|
whale|a very big sea animal|තල්මසා|silent H
dolphin|a clever sea animal|ඩොල්ෆින්|PH sounds like F
crocodile|a big reptile with long teeth|කිඹුලා|
eagle|a big bird that hunts|රාජාලියා|
parrot|a colourful bird that can talk|ගිරවා|double R
insect|a small animal with six legs|කෘමියා|
wildlife|animals living free|වනජීවීන්|wild + life
habitat|the natural home of an animal|වාසස්ථානය|
endangered|may soon die out|වඳවීමේ තර්ජනයට ලක්|
extinct|no longer alive anywhere|වඳ වී ගිය|
protect|to keep safe|ආරක්ෂා කරනවා|
national park|protected land for wildlife|ජාතික වනෝද්‍යානය|
coral|a sea animal that builds reefs|කොරල්|
island|land with sea all around|දූපත|silent S
desert|a hot, dry, sandy place|කාන්තාරය|one S
pollution|dirty air, water or land|දූෂණය|double L
recycle|to use again|ප්‍රතිචක්‍රීකරණය|re + cycle
environment|the natural world|පරිසරය|enviRONment
earth|our planet|පෘථිවිය|
`),
  S('b-health2', 'Health and medicine', `
clinic|a small place to see a doctor|සායනය|
ward|a room in a hospital|වාට්ටුව|
operation|when a surgeon cuts to fix the body|සැත්කම|
injection|medicine given with a needle|එන්නත|in-JEC-tion
tablet|a small hard medicine|පෙත්ත|
bandage|cloth around a wound|වෙළුම් පටිය|
wound|a cut on the body|තුවාලය|WOOND
infection|a disease from germs|ආසාදනය|
virus|a very small germ|වෛරසය|
vaccine|it stops you getting a disease|එන්නත|double C
diabetes|an illness with blood sugar|දියවැඩියාව|dia-BE-tes
pressure|force; blood pressure|පීඩනය|double S
pain|hurt|වේදනාව|
sore|painful|රිදෙන|
sneeze|air comes from your nose quickly|කිවිසුම|double E
rash|red spots on the skin|කුෂ්ඨ|
dizzy|feeling the room is turning|කරකැවිල්ල|double Z
vomit|to be sick from the stomach|වමනය|
x-ray|a picture of your bones|එක්ස් කිරණ|
check-up|a visit to see if you are healthy|වෛද්‍ය පරීක්ෂණය|
healthy|well and strong|සෞඛ්‍ය සම්පන්න|
unhealthy|not good for your body|අසෞඛ්‍ය|
nutrition|good food for the body|පෝෂණය|
fitness|being strong and healthy|යෝග්‍යතාව|double S
weight|how heavy you are|බර|silent GH
overweight|too heavy|අධික බර|
habit|something you do often|පුරුද්ද|
smoking|using cigarettes|දුම් පානය|
alcohol|beer, wine and strong drinks|මත්පැන්|silent H
hygiene|keeping clean to stay healthy|සනීපාරක්ෂාව|hy-GIENE
germs|tiny living things that cause illness|විෂබීජ|
cure|to make someone well|සුව කරනවා|
treatment|what a doctor does to help|ප්‍රතිකාරය|
disease|an illness|රෝගය|
mental health|health of the mind|මානසික සෞඛ්‍යය|
insurance|it pays when you are ill|රක්ෂණය|
emergency|a sudden danger|හදිසි අවස්ථාව|
first aid|quick help for an injury|ප්‍රථමාධාර|
blood test|a check of your blood|රුධිර පරීක්ෂණය|
sleep|rest at night|නින්ද|
`),
  S('b-society', 'Society and government', `
government|the people who run a country|රජය|govern + ment
parliament|where laws are made|පාර්ලිමේන්තුව|parli-A-ment
election|when people vote|මැතිවරණය|
vote|to choose in an election|ඡන්දය|
citizen|a member of a country|පුරවැසියා|
law|a rule of a country|නීතිය|
crime|something against the law|අපරාධය|
court|where judges decide cases|උසාවිය|
judge|a person who decides in court|විනිසුරු|silent D: JUJ
prison|a place for criminals|සිරගෙදර|
tax|money people pay to the government|බද්ද|
budget|a plan for spending money|අයවැය|
poverty|being poor|දරිද්‍රතාව|
unemployment|having no job|විරැකියාව|
population|the number of people|ජනගහනය|
community|people living in one area|ප්‍රජාව|double M
volunteer|a person who works for free|ස්වේච්ඡා සේවකයා|double E
charity|a group that helps people|පුණ්‍ය ආයතනය|
equality|being equal|සමානාත්මතාව|
rights|what people are allowed to have|අයිතිවාසිකම්|silent GH
freedom|being free|නිදහස|free + dom
culture|the way of life of a people|සංස්කෘතිය|
tradition|an old custom|සම්ප්‍රදාය|
religion|belief in God or gods|ආගම|
generation|people born at about the same time|පරම්පරාව|
elderly|old people|වැඩිහිටියන්|
youth|young people|තරුණයින්|
immigrant|a person who moves to a new country|සංක්‍රමණිකයා|double M
migrant worker|a person who works abroad|විදෙස් ශ්‍රමිකයා|
embassy|an office of a foreign country|තානාපති කාර්යාලය|double S
public transport|buses and trains for all|පොදු ප්‍රවාහනය|
infrastructure|roads, power and water systems|යටිතල පහසුකම්|infra + structure
policy|a plan from a government|ප්‍රතිපත්තිය|
minister|a leader in the government|ඇමති|
president|the leader of a country|ජනාධිපති|
mayor|the leader of a city|නගරාධිපති|
protest|to show you disagree in public|විරෝධතාව|
safety|being safe|ආරක්ෂාව|
security|protection from danger|ආරක්ෂාව|
development|growth and progress|සංවර්ධනය|no E after P
`),
  S('b-media', 'Media and the arts', `
newspaper|daily printed news|පුවත්පත|news + paper
magazine|a weekly or monthly paper with pictures|සඟරාව|
article|a piece of writing in a paper|ලිපිය|
headline|the title of a news story|සිරස්තලය|head + line
journalist|a person who writes news|මාධ්‍යවේදියා|
interview|a meeting with questions|සම්මුඛ සාකච්ඡාව|inter + view
documentary|a factual film|වාර්තා චිත්‍රපටය|
series|a set of TV programmes|කතා මාලාව|ends in -ies
channel|a TV station|නාලිකාව|double N
audience|the people watching|ප්‍රේක්ෂකයින්|AU at the start
advertisement|a picture or video that sells|දැන්වීම|ad-VER-tise-ment
celebrity|a famous person|ප්‍රසිද්ධ පුද්ගලයා|
influencer|a person famous on social media|බලපෑම් කරන්නා|
podcast|a recorded talk on the internet|පොඩ්කාස්ට්|
subtitles|words at the bottom of a film|උපසිරැසි|sub + titles
novel|a long story book|නවකතාව|
poem|a short piece of writing with rhythm|කවිය|
author|a person who writes books|කතුවරයා|AU at the start
poet|a person who writes poems|කවියා|
artist|a person who paints or draws|කලාකරුවා|
sculpture|art made from stone or wood|මූර්තිය|SCULP-ture
exhibition|a show of art|ප්‍රදර්ශනය|silent H
gallery|a building for art|කලාගාරය|double L
theatre|a building for plays|රඟහල|British: -tre
actor|a person in a film or play|නළුවා|
director|the person in charge of a film|අධ්‍යක්ෂ|
musician|a person who plays music|සංගීතඥයා|ends in -cian
orchestra|a big group of musicians|වාද්‍ය වෘන්දය|CH sounds like K
lyrics|the words of a song|ගී පද|Y in the middle
melody|the tune of a song|තනුව|
rhythm|the beat of music|රිද්මය|no vowels except Y
traditional|old and from a culture|සාම්ප්‍රදායික|
modern|new, of today|නූතන|
creative|good at making new things|නිර්මාණශීලී|
talent|a natural skill|දක්ෂතාව|
review|an opinion about a film or book|විචාරය|
popular|liked by many people|ජනප්‍රිය|
entertainment|films, music and games|විනෝදාස්වාදය|enter-TAIN-ment
broadcast|to send out on TV or radio|විකාශනය|broad + cast
social media|Facebook, TikTok, Instagram|සමාජ මාධ්‍ය|
`),
  S('b-time', 'Time and how often', `
always|every time|සැමවිටම|one L
usually|most of the time|සාමාන්‍යයෙන්|double L
often|many times|නිතර|
sometimes|not always|සමහර විට|some + times
rarely|not often|කලාතුරකින්|
never|not at any time|කවදාවත් නැහැ|
occasionally|sometimes, not often|ඉඳහිට|double C, double L
daily|every day|දිනපතා|
weekly|every week|සතිපතා|
monthly|every month|මාසිකව|
yearly|every year|වාර්ෂිකව|
fortnight|two weeks|සති දෙකක්|silent GH
decade|ten years|දශකය|
century|one hundred years|සියවස|
midnight|twelve o'clock at night|මධ්‍යම රාත්‍රිය|silent GH
noon|twelve o'clock in the day|මධ්‍යාහ්නය|double O
dawn|very early morning|අලුයම|
dusk|early evening|සැන්දෑව|
weekend|Saturday and Sunday|සති අන්තය|week + end
tomorrow|the day after today|හෙට|one M, double R
yesterday|the day before today|ඊයේ|
tonight|this night|අද රාත්‍රිය|
recently|not long ago|මෑතකදී|
nowadays|these days|වර්තමානයේ|now + a + days
immediately|now, at once|වහාම|double M
eventually|in the end|අවසානයේදී|double L
already|before now|දැනටමත්|one L
still|continuing|තවමත්|double L
soon|in a short time|ඉක්මනින්|double O
early|before the usual time|කලින්|
late|after the usual time|ප්‍රමාද|
on time|not late|නියමිත වේලාවට|
appointment|a time to meet|හමුවීමේ වේලාව|double P
calendar|it shows days and months|දින දර්ශනය|ends in -ar
schedule|a plan of times|කාලසටහන|SCH
quarter past|fifteen minutes after|පසු වී විනාඩි පහළොවයි|
half past|thirty minutes after|පසු වී විනාඩි තිහයි|
quarter to|fifteen minutes before|විනාඩි පහළොවකට පෙර|
period|a length of time|කාල සීමාව|
moment|a very short time|මොහොත|
`),
  S('b-verbs', 'Everyday verbs', `
borrow|to take for a short time|ණයට ගන්නවා|double R
lend|to give for a short time|ණයට දෙනවා|
explain|to make something clear|පැහැදිලි කරනවා|ends in -ain
describe|to say what something is like|විස්තර කරනවා|
discuss|to talk about something|සාකච්ඡා කරනවා|double S
decide|to choose|තීරණය කරනවා|
prefer|to like better|වඩා කැමති වෙනවා|preferred: double R
suggest|to give an idea|යෝජනා කරනවා|double G
remember|to keep in your mind|මතක තබා ගන්නවා|
forget|to not remember|අමතක වෙනවා|forgotten: double T
arrive|to come to a place|පැමිණෙනවා|double R
leave|to go away|පිටත් වෙනවා|
return|to come back|ආපසු එනවා|
deliver|to bring to a place|බෙදා හරිනවා|
receive|to get|ලැබෙනවා|E before I after C
include|to have as part|ඇතුළත් කරනවා|
increase|to go up|වැඩි වෙනවා|
reduce|to make smaller|අඩු කරනවා|
improve|to get better|දියුණු කරනවා|
compare|to see what is different|සසඳනවා|
prepare|to get ready|සූදානම් කරනවා|
organise|to plan and arrange|සංවිධානය කරනවා|British: -ise
complain|to say you are not happy|පැමිණිලි කරනවා|
apologise|to say sorry|සමාව ඉල්ලනවා|British: -ise
recommend|to say something is good|නිර්දේශ කරනවා|one C, double M
believe|to think it is true|විශ්වාස කරනවා|I before E
agree|to have the same opinion|එකඟ වෙනවා|double E
disagree|to have a different opinion|එකඟ නොවෙනවා|dis + agree
understand|to know the meaning|තේරුම් ගන්නවා|
achieve|to do what you wanted|සාක්ෂාත් කරනවා|I before E
encourage|to give support|දිරිමත් කරනවා|
protect|to keep safe|ආරක්ෂා කරනවා|
destroy|to break completely|විනාශ කරනවා|
develop|to grow|වර්ධනය කරනවා|no E at the end
manage|to control or deal with|කළමනාකරණය කරනවා|
afford|to have enough money for|දැරිය හැකි වෙනවා|double F
spend|to use money or time|වියදම් කරනවා|
save|to keep money for later|ඉතුරු කරනවා|
earn|to get money for work|උපයනවා|
celebrate|to have a party for something|සමරනවා|
`),
  S('b-adjectives', 'Describing words', `
beautiful|very nice to look at|ලස්සන|B-E-A-U
ugly|not nice to look at|කැත|
expensive|costs a lot|මිල අධික|
cheap|costs little|ලාභ|
crowded|full of people|සෙනඟ පිරුණු|
empty|with nothing inside|හිස්|
dangerous|not safe|භයානක|ends in -ous
safe|not dangerous|ආරක්ෂිත|
famous|known by many people|ප්‍රසිද්ධ|ends in -ous
ordinary|normal|සාමාන්‍ය|
modern|new, of today|නූතන|
ancient|very old|පුරාණ|CI sounds like SH
huge|very big|දැවැන්ත|
tiny|very small|ඉතා කුඩා|
narrow|not wide|පටු|double R
wide|big from side to side|පළල්|
deep|going a long way down|ගැඹුරු|double E
shallow|not deep|නොගැඹුරු|double L
heavy|weighs a lot|බර|
light|not heavy|සැහැල්ලු|silent GH
strong|powerful|ශක්තිමත්|
weak|not strong|දුර්වල|
polite|having good manners|ආචාරශීලී|
rude|not polite|අශිෂ්ට|
honest|tells the truth|අවංක|silent H
lazy|does not like to work|කම්මැලි|
helpful|ready to help|උදව් කරන|one L at the end
friendly|kind and nice to people|මිත්‍රශීලී|I before E
generous|happy to give|ත්‍යාගශීලී|ends in -ous
serious|not joking|බැරෑරුම්|ends in -ious
careful|not making mistakes|පරිස්සම්|one L at the end
careless|making mistakes|නොසැලකිලිමත්|double S
noisy|loud|ඝෝෂාකාරී|
peaceful|calm and quiet|සාමකාමී|one L at the end
fresh|new and clean|නැවුම්|
convenient|easy and useful|පහසු|con-VEN-ient
necessary|needed|අවශ්‍ය|one C, double S
possible|can happen|හැකි|double S
impossible|cannot happen|නොහැකි|im + possible
different|not the same|වෙනස්|double F
`),
  S('b-academic2', 'IELTS words (set 2)', `
advantage|a good point|වාසිය|ends in -age
disadvantage|a bad point|අවාසිය|dis + advantage
benefit|something good you get|ප්‍රතිලාභය|
drawback|a problem with something|අඩුපාඩුව|draw + back
solution|an answer to a problem|විසඳුම|
cause|what makes something happen|හේතුව|
effect|a result|බලපෑම|effect (noun) / affect (verb)
impact|a strong effect|බලපෑම|
trend|the general direction of change|ප්‍රවණතාව|
statistics|numbers that show facts|සංඛ්‍යාලේඛන|
survey|questions asked to many people|සමීක්ෂණය|
proportion|a part of the whole|අනුපාතය|
majority|most of a group|බහුතරය|
minority|a small part of a group|සුළුතරය|
average|the normal amount|සාමාන්‍යය|
approximately|about|දළ වශයෙන්|double P
significant|big or important|සැලකිය යුතු|
gradual|slow, step by step|ක්‍රමික|
dramatic|sudden and big|නාටකාකාර|
steady|not changing quickly|ස්ථාවර|
fluctuate|to go up and down|උච්චාවචනය වෙනවා|
decline|to go down|අඩු වෙනවා|
rise|to go up|ඉහළ යනවා|
peak|the highest point|උපරිමය|E-A, like eat
opinion|what you think|මතය|
argument|a reason for or against|තර්කය|no E after U
evidence|facts that prove something|සාක්ෂි|
example|a thing that shows what you mean|උදාහරණය|
furthermore|also, and more|තවද|
however|but|කෙසේ වෙතත්|
therefore|so|එබැවින්|
although|even if|වුවද|
whereas|but on the other hand|එනමුත්|
consequently|as a result|එහි ප්‍රතිඵලයක් ලෙස|
in conclusion|to finish|අවසාන වශයෙන්|
moreover|also|ඊට අමතරව|
nevertheless|but still|එසේ වුවද|never + the + less
issue|a problem or topic|ගැටලුව|double S
crucial|very important|ඉතා වැදගත්|CI sounds like SH
essential|needed|අත්‍යවශ්‍ය|double S
`),
  S('b-korea', 'Life in Korea', `
dormitory|a building where students live|නේවාසිකාගාරය|
convenience store|a small shop open late|පහසු වෙළඳසැල|
subway|trains under the city|භූගත දුම්රිය|sub + way
transportation card|a card for buses and trains|ප්‍රවාහන කාඩ්පත|
bank account|where your money is kept|බැංකු ගිණුම|double C
residence card|ID card for foreign residents|පදිංචි කාඩ්පත|
immigration office|government office for visas|ආගමන කාර්යාලය|double M
phone contract|an agreement for a phone|දුරකථන ගිවිසුම|
deposit|money you pay first|තැන්පතුව|
landlady|a woman who owns a rented house|ගෙහිමිකාරිය|land + lady
recycling bin|a bin for things to use again|ප්‍රතිචක්‍රීකරණ බඳුන|
rubbish bag|a bag for waste|කසළ බෑගය|double B
heating|it makes a room warm|උණුසුම් කිරීම|
air conditioner|it makes a room cool|වායු සමීකරණය|
neighbourhood|the area where you live|අසල්වැසි ප්‍රදේශය|British: -our-
delivery|bringing things to your door|බෙදාහැරීම|
online shopping|buying on the internet|මාර්ගගත සාප්පු සවාරි|
chopsticks|two sticks for eating|චොප්ස්ටික්|chop + sticks
kimchi|spicy Korean vegetables|කිම්චි|
rice cake|a soft food made from rice|බත් කේක්|
pharmacy|a shop that sells medicine|ෆාමසිය|PH sounds like F
hospital card|a card for hospital visits|රෝහල් කාඩ්පත|
part-time job|a job for some hours a week|අර්ධකාලීන රැකියාව|
manager|the person in charge|කළමනාකරු|
colleague|a person you work with|සගයා|silent -ue
respect|to treat someone well|ගෞරවය|
bow|to bend your body to greet|හිස නමනවා|
polite language|formal words|ආචාරශීලී භාෂාව|
classmate|a student in your class|පන්ති මිතුරා|class + mate
semester|half of a study year|අධ්‍යයන වාරය|
library card|a card to borrow books|පුස්තකාල කාඩ්පත|
cafeteria|a restaurant in a school or office|ආපනශාලාව|
snow|white frozen rain|හිම|
coat|a warm jacket|කබාය|
temperature|how hot or cold|උෂ්ණත්වය|tem-PER-a-ture
homesick|missing home|ගෙදර මතක් වෙන|
culture shock|feeling lost in a new culture|සංස්කෘතික කම්පනය|
adapt|to change to fit|අනුවර්තනය වෙනවා|
opportunity|a good chance|අවස්ථාව|double P
future|the time after now|අනාගතය|
`),
];
