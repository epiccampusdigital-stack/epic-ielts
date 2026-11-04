// Model answers for the General English writing papers. Shown to the student after they hand in.
// Keyed by paper code, then task number. Simple English, about the minimum number of words.
const MODELS = {
  'GE-PT3': {
    1: 'My name is Nimal Perera. I am 19 years old and I live in Galle, a town in the south of Sri Lanka. There are five people in my family: my parents, my sister, my grandmother and me. On a normal day I get up at six, have breakfast and go to class. In the evening I do my homework. In my free time I like playing cricket with my friends and listening to music.',
    2: 'Dear Ms Silva,\n\nI am writing to tell you my news. I am going to South Korea in November, and I will study at a university there. I want to study computer science because I like computers and I want to make apps. I am a little worried about the cold weather, because I have never lived in a cold country. I will deal with this by buying warm clothes before I go and by asking my classmates for help. Thank you for teaching me English. I will write to you again from Korea.\n\nBest wishes,\nNimal',
  },
  'GE-C1W': {
    1: 'I live in a small house in Galle. It is near the sea. There are four rooms in my house: a living room, a kitchen and two bedrooms. There is a small garden in front of the house. My favourite room is my bedroom. There is a bed next to the window, and there is a desk between the bed and the wardrobe. There are some books on the desk and my bag is under the chair. I like my room because it is quiet.',
    2: 'Hi Kasun,\n\nI am happy that you are coming to my town! From the bus station, go straight along Main Street for ten minutes. Turn left at the post office. My house is next to the big green shop, on the right.\n\nThere are two good places to eat. Sea Breeze Cafe has rice and curry and fresh fish. Green Garden Restaurant has noodles, fried rice and some very good ice cream.\n\nYou should visit the old fort. There are some beautiful views of the sea. I think you will like it because you love taking photos.\n\nSee you soon!\nNimal',
  },
  'GE-C2W': {
    1: 'Last December I went to Kandy with my cousin and two friends. We travelled by train and the journey was beautiful. First, we visited the Temple of the Tooth. Then we walked around the lake and ate lunch in a small cafe. After that, we went to the market and bought some tea. Finally, we took the train home. One problem happened: I lost my phone at the market. I told a shopkeeper and he helped me look for it. We found it under a chair after twenty minutes. At the end of the day I felt tired but very happy.',
    2: 'In my first month in Korea, I am going to study Korean every day and I am going to meet new friends. I am also going to visit the city at the weekend. I think the winter will be difficult because it will be very cold and I have never lived in the snow. I will wear warm clothes and drink hot tea. I promise my family that I will call them every Sunday and I will work hard.',
  },
  'GE-C3W': {
    1: 'Dear Ms Kim,\n\nThank you very much for your welcome email and the information about the university. I am very happy to join the Korean language programme.\n\nI will arrive at the station at 4 p.m. on Saturday. Please tell me if this is a good time.\n\nI have two questions. Is there a kitchen in the dormitory? And what time do the Korean classes start in the morning?\n\nThank you for your help.\n\nKind regards,\nNimal Perera',
    2: 'My name is Nimal Perera and I am from Galle, a town in the south of Sri Lanka. I am 19 years old and I am the oldest child in my family.\n\nI want to study computer science in Korea. I have two reasons. First, Korea is a leader in technology, so I can learn from very good teachers. For example, many famous phones and apps are made there. Second, I want to build useful apps for students in my country.\n\nOne of my strengths is that I never give up. For example, last year I failed my first English test, but I studied every day for three months and I passed the next one.\n\nAfter I graduate, I want to work for a technology company for a few years. Then I want to return to Sri Lanka and start my own company to help young people learn. I will work hard and I will make my family proud.',
  },
};
function modelAnswersFor(paperCode) { return MODELS[paperCode] || null; }
module.exports = { modelAnswersFor };
