# Builds the 4 Korean workbooks from the EStudykorea lessons (English + Sinhala explanations, answers at the back).
import json, random, sys
from common import *
import icons

D = json.load(open(HERE + 'korean.json'))
HG, B1 = {x['number']: x for x in D['hg']}, {x['number']: x for x in D['b1']}

# The Korean timetable: 15 Korean days, morning (8:30-11:30) and afternoon (1:00-4:30).
KR_PLAN = [
    (2, 'am', 'abc+h1'), (2, 'pm', 'h2'), (3, 'am', 'h3'), (3, 'pm', 'h4'), (6, 'pm', 'h5'), (7, 'pm', 'h6'), (8, 'am', 'review1+write1'),
    (9, 'pm', 'h7'), (10, 'am', 'h8'), (11, 'am', 'h9'), (12, 'am', 'h10'), (13, 'pm', 'h11'), (15, 'am', 'h12'), (15, 'pm', 'midtest'),
    (16, 'pm', 'b1'), (17, 'am', 'b2'), (18, 'am', 'b3'), (19, 'am', 'b4'), (20, 'pm', 'b5'), (21, 'pm', 'b6'), (22, 'am', 'review3'),
    (23, 'pm', 'b7'), (24, 'am', 'b8'), (25, 'am', 'b9'), (26, 'am', 'b10'), (27, 'pm', 'b11'), (29, 'am', 'b12'), (29, 'pm', 'finaltest'), (30, 'pm', 'speech'),
]
SLOT = {'am': 'Morning 8:30 to 11:30', 'pm': 'Afternoon 1:00 to 4:30'}
when = {}
for d, h, k in KR_PLAN:
    for part in k.split('+'):
        when[part] = (d, h)

PRACTICE_FIX = {('hg', 8): ['Build 나, 모, 한 and 물 from their letters, then copy each one in the boxes below.',
                            'අකුරු එකතු කර 나, 모, 한 සහ 물 සාදන්න. ඉන්පසු පහත කොටුවල ලියන්න.']}

def sin(x):
    return f"<div class='si'>{e(x)}</div>"

def opener(key, c, kind):
    d, h = when[key]
    t = c['title']
    return (f"<div class='opener'><div><div class='tags'><span class='tag kr'>{kind} lesson {c['number']:02d}</span>"
            f"<span class='tag grey'>Day {d} · {ddate(d)} · {SLOT[h]}</span></div>"
            f"<h1>{e(t[0])}</h1><div class='alt'><span class='ko'>{e(t[2])}</span> · <span class='si' style='font-size:11pt'>{e(t[1])}</span></div>"
            f"<div class='focus'>{e(c['goal'][0])}</div>{sin(c['goal'][1])}</div><div class='glyph'>{e(c['glyph'])}</div></div>")

def words_table(c):
    rows = ''
    has_pic = any(icons.KO_PIC.get(x['word'].split(' ')[0].rstrip('.')) for x in c['examples'])
    for x in c['examples']:
        pic = icons.KO_PIC.get(x['word'].split(' ')[0].rstrip('.'))
        pic_html = icons.I[pic].replace('<svg ', "<svg style='width:15mm;height:12mm' ") if pic else ''
        rd = f"<div style='color:#8c6e51;font-size:9pt' class='ko'>[{e(x['reading'])}]</div>" if x.get('reading') else ''
        rows += ((f"<tr><td style='width:17mm'>{pic_html}</td>" if has_pic else '<tr>') + f"<td class='ko' style='font-size:15pt;color:#002761;white-space:nowrap'>{e(x['word'])}{rd}</td>"
                 f"<td>{e(x['meaning'][0])}</td><td class='si'>{e(x['meaning'][1]) if x['meaning'][1] != x['meaning'][0] else ''}</td><td style='width:16mm'><span class='abox' style='width:12mm'></span></td></tr>")
    return (f"<table class='words'><thead><tr>{'<th></th>' if has_pic else ''}<th>Korean</th><th>English</th><th>Sinhala</th><th>Say it ✓</th></tr></thead><tbody>{rows}</tbody></table>")

def trace(words, cols=12):
    words = [w for w in words if len(w.replace(' ', '')) <= 3][:5]
    out = "<table class='trace'>"
    for w in words:
        n = len(w.replace(' ', ''))
        reps = max(1, cols // (n + 1))
        cells = f"<td class='h' colspan='{n}'><span class='ko'>{e(w)}</span></td>"
        for i in range(reps - 1):
            cells += ''.join(f"<td class='g'><span class='ko'>{e(ch)}</span></td>" if i < 2 else "<td></td>" for ch in w.replace(' ', ''))
        used = n * reps
        cells += '<td></td>' * (cols - used)
        out += f"<tr>{cells}</tr>"
    return out + "</table>"

def quiz_html(c):
    items = ''
    for i, q in enumerate(c['quiz']):
        ch = ''.join(f"<span><b>{'ABCD'[j]}</b> <span class='ko'>{e(o)}</span></span>" for j, o in enumerate(q['choices']))
        items += (f"<li><div style='display:flex;justify-content:space-between;gap:4mm'><div>{e(q['prompt'][0])}"
                  f"<div class='si' style='font-size:8.8pt'>{e(q['prompt'][1])}</div></div><span class='abox'></span></div><div class='opts'>{ch}</div></li>")
    return f"<ol class='items quiz'>{items}</ol>"

def lesson(kind, key, c, extra=''):
    fix = PRACTICE_FIX.get(('hg' if kind == 'Hangul' else 'b1', c['number']))
    prac = fix or c['practice']
    words = [x['word'] for x in c['examples']]
    if kind == 'Hangul' and c['number'] == 8:
        words = ['나', '모', '한', '물', '과', '글']
    out = opener(key, c, kind)
    out += (f"<div class='block'><h2><span class='n'>1</span>Understand</h2><p>{e(c['explain'][0])}</p>{sin(c['explain'][1])}"
            f"<div class='note' style='margin-top:2.5mm'><b>Tip:</b> {e(c['note'][0])}{sin(c['note'][1])}</div></div>")
    out += f"<div class='block'><h2><span class='n'>2</span>Words and sounds</h2><div class='instr'>Read each word aloud with your teacher. Tick when you can say it without help.</div>{words_table(c)}</div>"
    n = 3
    if c.get('dialogue'):
        lines = ''.join(f"<tr><td class='who'>{'AB'[i % 2]}</td><td class='ko' style='font-size:13pt'>{e(x['word'])}</td><td>{e(x['meaning'][0])}{sin(x['meaning'][1])}</td></tr>" for i, x in enumerate(c['dialogue']))
        out += f"<div class='block'><h2><span class='n'>{n}</span>A short conversation</h2><div class='instr'>Read it in pairs. Then swap roles.</div><table class='dlg'>{lines}</table></div>"
        n += 1
    out += f"<div class='block'><h2><span class='n'>{n}</span>Trace, then write</h2><div class='instr'>Trace the grey letters, then write the word on your own in the empty boxes.</div>{trace(words)}</div>"
    n += 1
    out += extra.replace('{N}', str(n)) if extra else ''
    if extra:
        n += 1
    out += (f"<div class='block'><h2><span class='n'>{n}</span>Your practice task</h2><p>{e(prac[0])}</p>{sin(prac[1])}"
            f"<div class='lines'>{'<div class=line></div>' * 4}</div></div>")
    n += 1
    out += (f"<div class='block flow'><h2><span class='n'>{n}</span>Lesson check</h2><div class='instr'>Try it without looking back. Write the letter in the box. Answers are at the back of the book.</div>{quiz_html(c)}</div>")
    out += f"<div class='check'><b>Can you do it?</b> {e(c['goal'][0])}<span class='dots'><i></i><i></i><i></i></span></div>"
    return "<div class='pb'></div>" + out

def answers(kind, c):
    rows = ''.join(f"<div><b>{i+1}. {'ABCD'[q['answer']]}</b> <span class='ko'>{e(q['choices'][q['answer']])}</span> · {e(q['explanation'][0])} <span class='si' style='display:inline'>{e(q['explanation'][1])}</span></div>" for i, q in enumerate(c['quiz']))
    return f"<div class='akey'><h3>{kind} lesson {c['number']} · {e(c['title'][0])}<small>Lesson check</small></h3>{rows}</div>"

ABC = [('ㅏ', '아', 'a', [[70, 25, 70, 125], [70, 72, 110, 72]]), ('ㅓ', '어', 'eo', [[30, 72, 70, 72], [70, 25, 70, 125]]),
       ('ㅗ', '오', 'o', [[75, 30, 75, 75], [25, 75, 125, 75]]), ('ㅜ', '우', 'u', [[25, 55, 125, 55], [75, 55, 75, 110]]),
       ('ㅡ', '으', 'eu', [[25, 75, 125, 75]]), ('ㅣ', '이', 'i', [[75, 25, 75, 125]])]
def strokes(paths):
    PK, NV = '#d81b60', '#002761'
    out = f'<svg viewBox="0 0 150 150"><defs><marker id="a" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="{PK}"/></marker></defs><rect x="2" y="2" width="146" height="146" rx="12" fill="#fff8fa" stroke="#f3c4d3"/>'
    for i, p in enumerate(paths):
        cx, cy = (p[0] - 16, p[1]) if p[0] == p[2] else (p[0], p[1] - 16)
        out += f'<path d="M{p[0]} {p[1]}L{p[2]} {p[3]}" stroke="{PK}" stroke-width="7" stroke-linecap="round" marker-end="url(#a)"/><circle cx="{cx}" cy="{cy}" r="10" fill="{NV}"/><text x="{cx}" y="{cy+4.5}" font-size="13" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">{i+1}</text>'
    return out + '</svg>'

def alphabet_start():
    d, h = when['abc']
    cards = ''.join(f"<div class='vowel'><div class='big ko'>{b}</div><div class='rom'>{v} · {r}</div>{strokes(p)}</div>" for v, b, r, p in ABC)
    grid = "<table class='trace'>" + ''.join("<tr><td class='h'><span class='ko'>" + b + "</span></td>" + ''.join(f"<td class='g'><span class='ko'>{b}</span></td>" for _ in range(3)) + "<td></td>" * 8 + "</tr>" for _, b, _, _ in ABC) + "</table>"
    return (f"<div class='opener'><div><div class='tags'><span class='tag kr'>Start here · 00</span><span class='tag grey'>Day {d} · {ddate(d)} · {SLOT[h]}</span></div>"
            f"<h1>Your first six letters</h1><div class='alt'><span class='ko'>처음 배우는 모음 6개</span> · <span class='si' style='font-size:11pt'>ඔබේ පළමු අකුරු හය</span></div>"
            f"<div class='focus'>Take one letter at a time. Look, say it, follow the strokes, then write.</div>{sin('එකවර එක අකුරක් පුහුණු වෙන්න. බලන්න, කියන්න, ලියන පිළිවෙළ බලා ලියන්න.')}</div><div class='glyph'>아</div></div>"
            f"<div class='block'><h2><span class='n'>1</span>Look, follow the strokes, say it</h2><div class='instr'>Follow stroke 1, then 2. The arrow shows the direction. The silent ㅇ in front makes a full syllable.</div><div class='grid6'>{cards}</div></div>"
            f"<div class='block'><h2><span class='n'>2</span>Trace, then write</h2>{grid}</div>"
            f"<div class='block'><h2><span class='n'>3</span>Put letters together</h2><p class='ko' style='font-size:20pt;line-height:1.6'>ㄱ + ㅏ → 가 &nbsp;&nbsp; ㄴ + ㅏ → 나</p>"
            f"<p>Now go on to lesson 1. Consonants, more vowels and reading come next.</p>{sin('දැන් පළමු පාඩමට යන්න. ව්‍යංජන, තවත් ස්වර සහ කියවීම ඊළඟට.')}</div>")

def picture_words(pairs, n_label='{N}'):
    bank = sorted(w for w, _ in pairs)
    cells = ''.join(f"<div class='pic'>{icons.I[ic]}<div class='line' style='height:7mm;margin:0 3mm'></div><div class='cap' style='color:#5b6780;font-size:8.5pt'>{m}</div></div>" for w, ic, m in [(w, icons.KO_PIC[w], m) for w, m in pairs])
    chips = ''.join(f"<span class='ko'>{e(w)}</span>" for w in bank)
    return f"<div class='block'><h2><span class='n'>{n_label}</span>Picture words</h2><div class='instr'>Write the Korean word under each picture. Use the words in the box.</div><div class='chips' style='margin-bottom:3mm'>{chips}</div><div class='grid4'>{cells}</div></div>"

def review(title, key, lessons, book_label):
    d, h = when[key]
    ex = [x for c in lessons for x in c['examples'] if len(x['word']) <= 6 and '·' not in x['meaning'][0] and '+' not in x['meaning'][0]]
    rnd = random.Random(key)
    pool = rnd.sample(ex, min(8, len(ex)))
    letters = list('ABCDEFGH')[:len(pool)]
    shuffled = pool[:]; rnd.shuffle(shuffled)
    left = ''.join(f"<div>{i+1}. <span class='ko' style='font-size:14pt'>{e(x['word'])}</span><span class='abox'></span></div>" for i, x in enumerate(pool))
    right = ''.join(f"<div><b>{letters[i]}</b> {e(x['meaning'][0])}</div>" for i, x in enumerate(shuffled))
    key_ans = ', '.join(f"{i+1} {letters[shuffled.index(x)]}" for i, x in enumerate(pool))
    pics = [(x['word'], x['meaning'][0]) for x in ex if icons.KO_PIC.get(x['word'])][:4]
    seen = set(); pics = [p for p in pics if not (p[0] in seen or seen.add(p[0]))]
    body = (f"<div class='pb'></div><div class='opener'><div><div class='tags'><span class='tag kr'>Review</span><span class='tag grey'>Day {d} · {ddate(d)} · {SLOT[h]}</span></div>"
            f"<h1>{e(title)}</h1><div class='focus'>Check what you know from this book before you move on.</div>{sin('ඊළඟ කොටසට යාමට පෙර මෙම පොතේ ඉගෙනගත් දේ පරීක්ෂා කරන්න.')}</div><div class='glyph'>복습</div></div>"
            f"<div class='block'><h2><span class='n'>1</span>Read and match</h2><div class='instr'>Read the Korean word aloud, then write the letter of its meaning.</div><div class='match'><div>{left}</div><div>{right}</div></div></div>")
    ans = f"<div class='akey'><h3>{e(title)}<small>Read and match</small></h3><div>{key_ans}</div>"
    if len(pics) >= 3:
        body += picture_words(pics, '2')
        ans += f"<div><b>Picture words:</b> " + ', '.join(f"{m} = <span class='ko'>{w}</span>" for w, m in pics) + "</div>"
    body += (f"<div class='block'><h2><span class='n'>3</span>My words</h2><div class='instr'>Write 8 Korean words you learned in this book, with the meaning.</div>"
             f"<table class='trace' style='font-size:10pt'>" + ''.join("<tr><td style='width:50%;height:11mm'></td><td style='height:11mm'></td></tr>" for _ in range(4)) + "</table></div>"
             f"<div class='check'><b>{e(book_label)}:</b> I can read every word in this book without help.<span class='dots'><i></i><i></i><i></i></span></div>")
    return body, ans + "</div>"

def writing_practice():
    d, h = when['write1']
    rows = ['가 나 다 라 마', '바 사 아 자 차', '카 타 파 하 까', '아 어 오 우 이', '야 여 요 유 으']
    grid = "<table class='trace'>" + ''.join("<tr>" + ''.join(f"<td class='g'><span class='ko'>{ch}</span></td><td></td>" for ch in r.split()) + "<td></td><td></td></tr>" for r in rows) + "</table>"
    return (f"<div class='pb'></div><div class='opener'><div><div class='tags'><span class='tag kr'>Writing practice</span><span class='tag grey'>Day {d} · {ddate(d)} · {SLOT[h]}</span></div>"
            f"<h1>Hangul writing practice</h1><div class='focus'>Neat, correct strokes now make reading easier later.</div>{sin('දැන් නිවැරදිව ලිවීම පසුව කියවීම පහසු කරයි.')}</div><div class='glyph'>가</div></div>"
            f"<div class='block'><h2><span class='n'>1</span>Trace each block, then copy it in the next box</h2>{grid}</div>"
            f"<div class='block'><h2><span class='n'>2</span>My name in Hangul</h2><div class='instr'>Ask your teacher how to write your name. Write it three times.</div><table class='trace'><tr>{'<td></td>' * 12}</tr><tr>{'<td></td>' * 12}</tr><tr>{'<td></td>' * 12}</tr></table></div>"
            f"<div class='check'><b>Can you do it?</b> I can write all the letters from this book with the right strokes.<span class='dots'><i></i><i></i><i></i></span></div>")

def self_intro():
    d, h = when['speech']
    lines = [('안녕하세요.', 'Hello.', 'ආයුබෝවන්.'), ('저는 ______입니다.', 'I am ______. (your name)', 'මම ______. (ඔබේ නම)'),
             ('저는 스리랑카 사람입니다.', 'I am Sri Lankan.', 'මම ශ්‍රී ලාංකිකයෙක්.'), ('저는 학생이에요.', 'I am a student.', 'මම ශිෂ්‍යයෙක්.'),
             ('저는 한국어를 공부해요.', 'I study Korean.', 'මම කොරියානු ඉගෙනගන්නවා.'), ('한국에 가고 싶어요.', 'I want to go to Korea.', 'මට කොරියාවට යන්න ඕනේ.'),
             ('만나서 반갑습니다.', 'Nice to meet you.', 'හමුවීම සතුටක්.'), ('감사합니다.', 'Thank you.', 'ස්තූතියි.')]
    rows = ''.join(f"<tr><td class='ko' style='font-size:13pt'>{e(k)}</td><td>{e(en)}<div class='si'>{e(si)}</div></td></tr>" for k, en, si in lines)
    return (f"<div class='pb'></div><div class='opener'><div><div class='tags'><span class='tag kr'>Speaking</span><span class='tag grey'>Day {d} · {ddate(d)} · {SLOT[h]}</span></div>"
            f"<h1>My Korean self-introduction</h1><div class='alt'><span class='ko'>자기소개</span></div><div class='focus'>Put the whole course together in one short talk for your interview and graduation.</div>"
            f"{sin('සම්මුඛ පරීක්ෂණයට සහ උපාධි දිනයට කෙටි කතාවක් සූදානම් කරන්න.')}</div><div class='glyph'>소개</div></div>"
            f"<div class='block'><h2><span class='n'>1</span>The model</h2><table class='dlg'>{rows}</table></div>"
            f"<div class='block'><h2><span class='n'>2</span>Write your own</h2><div class='instr'>Change the words to make it true for you. Add one sentence about your family or what you like.</div><div class='lines'>{'<div class=line></div>' * 8}</div></div>"
            f"<div class='block'><h2><span class='n'>3</span>Practise</h2><div class='instr'>Say it to a partner three times. Tick each time you do it without reading.</div>"
            f"<p>1st time <span class='abox'></span> &nbsp; 2nd time <span class='abox'></span> &nbsp; 3rd time <span class='abox'></span></p></div>"
            f"<div class='check'><b>Can you do it?</b> I can introduce myself in Korean for one minute.<span class='dots'><i></i><i></i><i></i></span></div>")

KCSS = """
table.words { width: 100%; border-collapse: collapse; }
table.words th { text-align: left; font-size: 7.8pt; color: #5b6780; text-transform: uppercase; letter-spacing: .05em; border-bottom: .5mm solid #b3194f; padding: 1.4mm 2mm; }
table.words td { padding: .9mm 2mm; border-bottom: .3mm solid #f0e1e7; vertical-align: middle; }
table.dlg { width: 100%; border-collapse: collapse; } table.dlg td { padding: 1.6mm 2mm; border-bottom: .3mm solid #f0e1e7; vertical-align: top; }
table.dlg td.who { width: 7mm; font-weight: 700; color: #b3194f; }
table.trace { width: 100%; border-collapse: collapse; table-layout: fixed; }
table.trace td { border: .3mm solid #dae1ed; height: 11.5mm; text-align: center; font-size: 21pt; position: relative; }
table.trace td.g { color: #d8dee8; }
table.trace td.h { color: #002761; background: #fff4f7; font-size: 19pt; }
table.trace td span { position: relative; z-index: 1; }
ol.items { margin: 0; padding-left: 6mm; } ol.items li { margin: 0 0 2.2mm; padding-left: 1mm; break-inside: avoid; }
.opts { display: flex; flex-wrap: wrap; gap: 1mm 8mm; margin-top: 1mm; font-size: 11pt; }
.vowel { border: .3mm solid #f3c4d3; border-radius: 3mm; padding: 2.5mm 2mm 2mm; text-align: center; }
.vowel .big { font-size: 28pt; line-height: 1.1; color: #002761; } .vowel .rom { font-size: 9pt; color: #5b6780; }
.vowel svg { width: 22mm; height: 22mm; display: block; margin: 1mm auto 0; }
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10mm; } .match > div > div { padding: 1.6mm 0; border-bottom: .3mm solid #f0e1e7; }
.opener .glyph { background: linear-gradient(160deg, #002761, #6b0f3d); }
"""

BOOKS = [
    (1, 'Hangul foundations', 'Hangul 1 to 6', 'Your first Korean letters: the six main vowels, the y-vowels and the 19 consonants, with stroke order and writing practice.',
     ['abc', ('hg', 1), ('hg', 2), ('hg', 3), ('hg', 4), ('hg', 5), ('hg', 6), 'review1', 'write1'], ['아', '어', '오', '우', '이', '가', '나', '다', '한', '글']),
    (2, 'Reading Hangul', 'Hangul 7 to 12', 'More vowels, building blocks, final consonants (batchim) and how sounds change, ending with your first Korean sentences.',
     [('hg', 7), ('hg', 8), ('hg', 9), ('hg', 10), ('hg', 11), ('hg', 12), 'review2'], ['와', '위', '의', '물', '옷', '밖', '값', '읽', '학', '교']),
    (3, 'First conversations', 'Beginner 1 · lessons 1 to 6', 'Greetings, introducing yourself, naming things, saying where things are, daily actions, places and prices.',
     [('b1', 1), ('b1', 2), ('b1', 3), ('b1', 4), ('b1', 5), ('b1', 6), 'review3'], ['안', '녕', '책', '위', '해', '요', '학', '교', '원', '네']),
    (4, 'Everyday Korean', 'Beginner 1 · lessons 7 to 12', 'Shopping and counting, time, saying no, the past, what you want to do, and your Korean self-introduction.',
     [('b1', 7), ('b1', 8), ('b1', 9), ('b1', 10), ('b1', 11), ('b1', 12), 'review4', 'speech'], ['개', '시', '분', '어', '제', '싶', '어', '요', '한', '국']),
]
when['review2'] = when['h12']
when['review4'] = when['b12']

def cover_art(letters):
    out = '<svg viewBox="0 0 520 250" style="width:100%">'
    for i, l in enumerate(letters):
        x, y = 8 + (i % 5) * 103, 8 + (i // 5) * 120
        fill = '#d81b60' if i in (8, 9) else 'rgba(255,255,255,.08)'
        out += f'<rect x="{x}" y="{y}" width="94" height="110" rx="12" fill="{fill}" stroke="rgba(255,255,255,.25)"/><text x="{x+47}" y="{y+76}" font-size="58" fill="#fff" text-anchor="middle" font-family="Noto Sans CJK KR">{l}</text>'
    return out + '</svg>'

def contents(items, num):
    rows = ''
    for it in items:
        if isinstance(it, tuple):
            c = (HG if it[0] == 'hg' else B1)[it[1]]
            key = ('h' if it[0] == 'hg' else 'b') + str(it[1])
            name = f"{'Hangul' if it[0] == 'hg' else 'Beginner 1'} lesson {it[1]}: {c['title'][0]} <span class='ko' style='color:#5b6780'>· {e(c['title'][2])}</span>"
        else:
            key = it
            name = {'abc': 'Start here: your first six letters', 'review1': 'Review: Hangul 1 to 6', 'write1': 'Hangul writing practice', 'review2': 'Review: Hangul 7 to 12 (homework)',
                    'review3': 'Review: Beginner 1 lessons 1 to 6', 'review4': 'Review: Beginner 1 lessons 7 to 12 (homework)', 'speech': 'My Korean self-introduction'}[it]
        d, h = when[key]
        rows += f"<tr><td>Day {d}</td><td>{ddate(d)}</td><td>{'Morning' if h == 'am' else 'Afternoon'}</td><td>{name}</td></tr>"
    tests = {2: "Day 15 afternoon: mid-programme Korean check on the Hangul from Books 1 and 2, given by your teacher.", 4: "Day 29 afternoon: final Korean test, given by your teacher."}.get(num, '')
    return (f"<h1 style='color:#002761;font-size:22pt;margin:0 0 2mm'>What's in this book</h1><p style='color:#5b6780'>Each lesson matches the same lesson on the EStudykorea site, so you can practise it again in the IT lab.</p>"
            f"<table class='toc'><thead><tr><th>Day</th><th>Date</th><th>Session</th><th>Lesson</th></tr></thead><tbody>{rows}</tbody></table>"
            + (f"<p style='margin-top:3mm;color:#5b6780'>{tests}</p>" if tests else '') +
            "<div class='howto'><div><b>1 · Learn</b>Read the explanation in English and Sinhala, then say the words with your teacher.</div>"
            "<div><b>2 · Write</b>Trace the grey letters, then write on your own. Neat strokes now make reading easier later.</div>"
            "<div><b>3 · Check</b>Do the lesson check without looking back, then mark it with the answers at the back.</div></div>")

def build_book(num, title, sub_line, sub, items, letters):
    body, keys = contents(items, num), ''
    for it in items:
        if isinstance(it, tuple):
            kind = 'Hangul' if it[0] == 'hg' else 'Beginner 1'
            c = (HG if it[0] == 'hg' else B1)[it[1]]
            key = ('h' if it[0] == 'hg' else 'b') + str(it[1])
            extra = ''
            if it == ('hg', 2):
                extra = picture_words([('아이', 'child'), ('오이', 'cucumber'), ('이', 'tooth'), ('오', 'five')])
                keys_extra = "<div><b>Picture words:</b> child = <span class='ko'>아이</span>, cucumber = <span class='ko'>오이</span>, tooth = <span class='ko'>이</span>, five = <span class='ko'>오</span></div>"
            body += lesson(kind, key, c, extra)
            k = answers(kind, c)
            if extra:
                k = k.replace('</div></div>', '</div>' + keys_extra + '</div>', 1) if False else k[:-6] + keys_extra + '</div>'
            keys += k
        elif it == 'abc':
            body += "<div class='pb'></div>" + alphabet_start()
        elif it.startswith('review'):
            src = {'review1': [HG[i] for i in range(1, 7)], 'review2': [HG[i] for i in range(7, 13)], 'review3': [B1[i] for i in range(1, 7)], 'review4': [B1[i] for i in range(7, 13)]}[it]
            t = {'review1': 'Review: Hangul 1 to 6', 'review2': 'Review: Hangul 7 to 12', 'review3': 'Review: Beginner 1, lessons 1 to 6', 'review4': 'Review: Beginner 1, lessons 7 to 12'}[it]
            b, k = review(t, it, src, f'Korean workbook {num}')
            body += b; keys += k
        elif it == 'write1':
            body += writing_practice()
        elif it == 'speech':
            body += self_intro()
    body += f"<div class='pb'></div><div class='answers-head'><h1>Answers</h1><p>Do the exercise first, then check here. If you got it wrong, read the explanation and try the lesson again on the EStudykorea site.</p></div>{keys}"
    days = sorted({when[('h' if isinstance(i, tuple) and i[0] == 'hg' else 'b') + str(i[1])][0] if isinstance(i, tuple) else when[i][0] for i in items})
    cover = cover_html('linear-gradient(160deg,#002761 55%,#3a0a2a)', f"KOREAN WORKBOOK {num} · WEEK {num} · <span class='ko'>{sub_line}</span>" if False else f"KOREAN WORKBOOK {num} · WEEK {num} · {sub_line.upper()}",
                       title, sub, cover_art(letters),
                       [(f"Korean days {', '.join(map(str, days))}", f"{ddate(days[0])} to {ddate(days[-1])} 2026"), (f"{sum(isinstance(i, tuple) for i in items)} lessons", 'English and Sinhala explanations'), ('Matches', 'EStudykorea lessons')])
    name = f"Korean Workbook {num} - Week {num} - {title}.pdf"
    return build(cover, page(body, 'kr-book', KCSS), f'Korean workbook {num} · {title}', name)

if __name__ == '__main__':
    only = int(sys.argv[1]) if len(sys.argv) > 1 else None
    for bk in BOOKS:
        if only and bk[0] != only:
            continue
        build_book(*bk)
