# Builds the 4 English workbooks from the lesson papers (student pages + answers at the back).
import sys, glob, importlib.util, os, re
sys.path.insert(0, '/tmp/epicwork/papers')
import render
from common import *
import icons

def load():
    out = []
    for f in sorted(glob.glob(render.HERE + 'content/*.py')):
        spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        for L in m.LESSONS:
            orig = L.get('day')
            L2 = render.post_fix(render.fit_block(L))
            L2['orig_day'] = orig
            out.append(L2)
    return out

SKILL_ORDER = {'Grammar foundation': 0, 'Writing': 1, 'Speaking': 2, 'Reading': 3, 'Listening': 4}
KEEP = set(SKILL_ORDER) | {'Extra practice'}
TAG = {'Grammar foundation': 'Grammar', 'Writing': 'Grammar & writing', 'Speaking': 'Speaking', 'Reading': 'Reading & vocabulary', 'Listening': 'Listening', 'Extra practice': 'Extra practice'}

def tmin(t):
    h, m = map(int, re.search(r'(\d+):(\d\d)', t).groups())
    return (h + 12 if h < 8 else h) * 60 + m

def book_of(day):
    return 1 if day <= 5 else 2 if day <= 13 else 3 if day <= 22 else 4

def book_of_extra(orig):
    return 1 if orig <= 7 else 2 if orig <= 14 else 3 if orig <= 21 else 4

def cat_scene(kind):
    s = open(HERE + 'sample.py').read()  # reuse the drawing helpers from the sample
    ns = {}
    exec(s[s.index('NAVY, BLUE'):s.index('def child')], ns)
    return ns['scene'](kind)

SCENES = {'t': 'scenes', 'title': 'Where is the cat?', 'ins': 'Look at each picture and write the preposition.'}

def block(b, n):
    if b['t'] == 'scenes':
        cells = ''.join(f"<div class='pic'>{cat_scene(k)}<div class='cap'>The cat is <span class='ans' style='min-width:20mm'></span> {o}.</div></div>"
                        for k, o in [('on', 'the box'), ('in', 'the box'), ('under', 'the table'), ('next', 'the box'), ('between', 'the boxes'), ('behind', 'the box')])
        return f"<div class='block'><h2><span class='n'>{n}</span>{b['title']}</h2><div class='instr'>{b['ins']}</div><div class='grid3'>{cells}</div></div>"
    return render.block_html(b, n)

def lesson(L):
    d = L.get('day')
    when = (f"Day {d} · {ddate(d)} · {L['time'].split(' (')[0]}" if d else 'Extra practice · any time')
    t = L['theme'].split(' - ', 1)[-1] if L['folder'] == 'Grammar foundation' else L['theme']
    out = (f"<div class='pb'></div><div class='opener'><div><div class='tags'><span class='tag en'>{TAG[L['folder']] if L['folder'] != 'Extra practice' else L['kind']}</span>"
           f"<span class='tag grey'>{e(when)}</span></div><h1>{render.rich(L['title'])}</h1><div class='alt'>{e(t)}</div>"
           f"<div class='focus'>{render.rich(L.get('focus', ''))}</div></div><div class='art'>{icons.en_icon(L)}</div></div>")
    if L['folder'] == 'Listening' or 'listening' in L.get('kind', '').lower():
        out += "<div class='note' style='margin-bottom:5mm'>Your teacher reads the recording aloud twice. Read the questions first so you know what to listen for.</div>"
    student = list(L['student'])
    if L['title'].startswith('Foundation 3'):
        i = next(i for i, b in enumerate(student) if b.get('title') == 'Look at the shelf')
        student.insert(i, SCENES)
    n = 0
    for b in student:
        if b['t'] == 'pagebreak':
            continue
        n += 1 if b.get('title') else 0
        out += block(b, n)
    out += f"<div class='check'><b>Can you do it?</b> {render.rich(L.get('focus', '').split('.')[0])}.<span class='dots'><i></i><i></i><i></i></span></div>"
    return out

def answer_key(L):
    T = L.get('teacher') or {}
    ans = list(T.get('answers') or [])
    if L['title'].startswith('Foundation 3'):
        ans.insert(2, '**Where is the cat?** 1 on, 2 in, 3 under, 4 next to, 5 between, 6 behind.')
    if not ans:
        ans = ['Answers will vary. Your teacher checks this one.']
    d = L.get('day')
    return (f"<div class='akey'><h3>{render.rich(L['title'])}<small>{('Day ' + str(d)) if d else 'Extra practice'} · {TAG[L['folder']] if L['folder'] != 'Extra practice' else L['kind']}</small></h3>"
            + ''.join(f"<div>{render.rich(a)}</div>" for a in ans) + "</div>")

def cover_art(words):
    out = '<svg viewBox="0 0 520 250" style="width:100%">'
    for i, (w, sub) in enumerate(words):
        x = 8 + i * 172
        hi = i == 1
        y = 10 if hi else 50
        out += (f'<rect x="{x}" y="{y}" width="160" height="190" rx="14" fill="{"#0056d2" if hi else "rgba(255,255,255,.08)"}" stroke="rgba(255,255,255,.25)"/>'
                f'<text x="{x+80}" y="{y+90}" font-size="{40 if len(w) < 8 else 30}" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">{w}</text>'
                f'<text x="{x+80}" y="{y+128}" font-size="19" fill="{"#e8eef7" if hi else "#b0e5fb"}" text-anchor="middle" font-family="SSP">{sub}</text>')
    return out + '</svg>'

BOOKS = {
    1: ('Grammar foundation', 'Parts of speech, sentence patterns, pronouns, prepositions, tenses and joining words: the base for everything after.', [('noun', 'book · Galle'), ('verb', 'study · go'), ('and · but', 'so · because')]),
    2: ('Daily life', 'Home and town, food and shopping, what is happening now, last weekend, yesterday and school.', [('there is', 'a bank'), ('some', 'any · much'), ('was', 'went · saw')]),
    3: ('Past and future', 'Travel stories, health, plans and careers. Telling a story in order and talking about the future.', [('first', 'then · finally'), ('going to', 'will'), ('doctor', 'nurse · pilot')]),
    4: ('Scholarship ready', 'Studying in Korea, emails, goals and the scholarship interview: point, reason, example.', [('better', 'the best'), ('Dear Sir', 'Kind regards'), ('because', 'for example')]),
}

ECSS = render.CSS.replace('@page { size: A4; margin: 14mm 15mm 16mm 15mm; }', '') + """
.opener .art svg { width: 28mm; height: 22mm; }
h2 .n { background: #0056d2 !important; color: #fff !important; }
"""

def build_book(num, lessons):
    title, sub, art = BOOKS[num]
    main = sorted([L for L in lessons if L.get('day') and book_of(L['day']) == num and L['folder'] in SKILL_ORDER],
                  key=lambda L: (L['day'], tmin(L['time']), SKILL_ORDER[L['folder']]))
    extra = sorted([L for L in lessons if L['folder'] == 'Extra practice' and book_of_extra(L['orig_day']) == num], key=lambda L: L['orig_day'])
    rows = ''.join(f"<tr><td>Day {L['day']}</td><td>{ddate(L['day'])}</td><td>{e(L['time'].split(' (')[0])}</td><td>{TAG[L['folder']]}</td><td>{render.rich(L['title'])}</td></tr>" for L in main)
    rows += ''.join(f"<tr><td colspan='3' style='color:#5b6780'>Extra practice</td><td>{e(L['kind'].split('(')[-1].rstrip(')').capitalize())}</td><td>{render.rich(L['title'])}</td></tr>" for L in extra)
    tests = {1: 'Day 1 is the placement test (on the computer). Days 2 and 3 are Korean days.',
             2: 'Day 12 has mock interview round 1, in a side room during the afternoon lesson. Day 14 is the mid-programme English test: your teacher gives you that paper separately.',
             3: 'Day 18 afternoon is a review with the extra practice pages. Day 19 has mock interview round 2.',
             4: 'Day 26 has mock interview round 3. Day 28 is the final English test and the final mock interviews, and Day 30 is graduation.'}.get(num, '')
    body = (f"<h1 style='color:#002761;font-size:22pt;margin:0 0 2mm'>What's in this book</h1><p style='color:#5b6780'>Every lesson in this book is a lesson in class. Bring the book every English day.</p>"
            f"<table class='toc'><thead><tr><th>Day</th><th>Date</th><th>Time</th><th>Skill</th><th>Lesson</th></tr></thead><tbody>{rows}</tbody></table>"
            + (f"<p style='margin-top:3mm;color:#5b6780'>{tests}</p>" if tests else '') +
            "<div class='howto'><div><b>1 · In class</b>Work through the lesson with your teacher. Write straight into the book.</div>"
            "<div><b>2 · IT lab</b>Do the same day's lesson on epicielts.live to practise again.</div>"
            "<div><b>3 · Check</b>Mark your work with the answers at the back. Ask your teacher about anything you got wrong.</div></div>")
    body += ''.join(lesson(L) for L in main)
    if extra:
        body += ("<div class='pb'></div><div class='answers-head' style='background:#0056d2'><h1>Extra practice</h1><p>More practice at the same level. "
                 "Use it in the IT lab, in the evening, or when your teacher gives it to you.</p></div>")
        body += ''.join(lesson(L) for L in extra).replace("<div class='pb'></div>", "<div class='pb'></div>", )
    body += "<div class='pb'></div><div class='answers-head'><h1>Answers</h1><p>Do the exercise first, then check here. For writing and speaking tasks there is no single right answer: your teacher checks those.</p></div>"
    body += ''.join(answer_key(L) for L in main + extra)
    days = sorted({L['day'] for L in main})
    cover = cover_html('#002761', f"ENGLISH WORKBOOK {num} · WEEK {num}", title, sub, cover_art(art),
                       [(f"English days {', '.join(map(str, days))}", f"{ddate(days[0])} to {ddate(days[-1])} 2026"), (f"{len(main)} lessons", f"+ {len(extra)} extra practice" if extra else 'with answers'), ('Level', 'Pre-A1 to A2')])
    return build(cover, page(body, 'en-book', ECSS), f'English workbook {num} · {title}', f"English Workbook {num} - Week {num} - {title}.pdf")

if __name__ == '__main__':
    lessons = load()
    only = int(sys.argv[1]) if len(sys.argv) > 1 else None
    for n in (1, 2, 3, 4):
        if not only or n == only:
            build_book(n, lessons)
