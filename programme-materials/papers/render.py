# Renders the Korea programme English papers to themed A4 PDFs.
# Each lesson -> <Skill>/Day NN - Theme/Student worksheet.pdf and Teacher notes.pdf
import os, sys, html, glob, importlib.util, json, asyncio
from playwright.async_api import async_playwright

S = os.environ.get('EPIC_WORK', '/tmp/epicwork/')
HERE = S + 'papers/'
OUT = HERE + 'out3/EPIC Korea Programme - English papers/By skill/'

def fonts_css():
    rows = []
    for f in sorted(os.listdir(S + 'localfonts2')):
        fam = 'Source Sans Pro'
        w = f.split('-')[-2]; st = 'italic' if 'italic' in f else 'normal'
        rows.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url(file://{S}localfonts2/{f}) format('woff2')}}")
    return '\n'.join(rows)

CSS = fonts_css() + r"""
:root { --navy:#002761; --deep:#001a43; --indigo:#0056d2; --isoft:#e3eeff; --gold:#0056d2; --gsoft:#f0f6ff;
  --ink:#0f1114; --sub:#5b6780; --faint:#5b6780; --rule:#dae1ed; --paper:#f7f9fc; }
@page { size: A4; margin: 14mm 15mm 16mm 15mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 10.2pt; line-height: 1.5; color: var(--ink); }
h1,h2,h3 { font-family: 'Source Sans Pro', Arial, sans-serif; margin:0; }
p { margin: 0 0 1.6mm; }
b { font-weight: 600; }
.head { border-radius: 3mm; padding: 6mm 8mm 5.5mm; color:#fff; position: relative; overflow:hidden; margin-bottom: 5mm;
  background: radial-gradient(80mm 50mm at 4% 0%, rgba(53,135,252,.0), transparent 70%),
              radial-gradient(60mm 40mm at 100% 30%, rgba(53,135,252,.0), transparent 70%),
              linear-gradient(180deg, var(--navy), var(--deep)); }
.head.teacher { background: radial-gradient(80mm 50mm at 4% 0%, rgba(53,135,252,.0), transparent 70%), linear-gradient(180deg, #002761, var(--deep)); }
.head .top { display:flex; justify-content: space-between; font-size: 8pt; letter-spacing: .07em; color:#CBD5E1; font-weight:600; text-transform: uppercase; }
.head .top .gold { color: #3587fc; }
.head h1 { color:#fff; font-size: 21pt; line-height: 1.1; margin-top: 3mm; }
.head .sub { color:#CBD5E1; font-size: 10pt; margin-top: 1.5mm; }
.namebar { display:grid; grid-template-columns: 2fr 1fr; gap: 6mm; margin: -1mm 0 4mm; font-size: 9pt; color: var(--sub); }
.namebar div { border-bottom: .3mm solid var(--sub); padding-bottom: 1mm; }
.block { margin: 0 0 4.5mm; break-inside: avoid; }
.block.flow { break-inside: auto; }
h2 { break-after: avoid; font-size: 13pt; margin-bottom: 1.8mm; display:flex; align-items: baseline; gap: 2.5mm; }
h2 .n { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 8pt; font-weight:700; color: var(--navy); background: linear-gradient(145deg,#3587fc,var(--gold)); border-radius: 50%; width: 5.6mm; height: 5.6mm; display:inline-flex; align-items:center; justify-content:center; flex: none; position: relative; top: -.4mm; }
.instr { color: var(--sub); font-size: 9.4pt; margin-bottom: 2mm; }
.box { border: .3mm solid var(--rule); border-radius: 2.5mm; padding: 3mm 4mm; background: var(--paper); }
.chips { display:flex; flex-wrap: wrap; gap: 1.6mm 2mm; }
.chips span { border: .3mm solid #b9d2f7; background: var(--isoft); color: #002761; border-radius: 5mm; padding: .5mm 2.6mm; font-size: 9.4pt; }
.note { border-left: 1mm solid var(--indigo); background: var(--isoft); border-radius: 0 2.5mm 2.5mm 0; padding: 3mm 4mm; }
.note ul { margin: 0; padding-left: 4.5mm; }
.note li { margin: .6mm 0; }
.passage { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 10.6pt; line-height: 1.7; border-left: 1mm solid var(--gold); background: var(--gsoft); border-radius: 0 2.5mm 2.5mm 0; padding: 3.5mm 5mm; }
.passage p { margin-bottom: 2mm; }
.passage .ttl { font-family: 'Source Sans Pro', Arial, sans-serif; font-weight: 600; font-size: 12pt; margin-bottom: 1.5mm; }
ol.items { margin: 0; padding-left: 6mm; }
ol.items li { margin: 0 0 2.2mm; padding-left: 1mm; }
.line { border-bottom: .3mm solid #94A3B8; height: 7mm; }
.ans { display:inline-block; min-width: 38mm; border-bottom: .3mm solid #94A3B8; height: 4.5mm; vertical-align: bottom; }
.opts { display:flex; flex-wrap: wrap; gap: 1mm 7mm; margin-top: .8mm; color: var(--ink); }
.tf { float: right; font-size: 8.6pt; color: var(--sub); letter-spacing: .04em; }
.tf span { border: .3mm solid #94A3B8; border-radius: 1mm; padding: 0 1.6mm; margin-left: 1.5mm; }
table { width:100%; border-collapse: collapse; font-size: 9.6pt; }
th, td { text-align:left; padding: 1.8mm 2.4mm; border-bottom: .3mm solid var(--rule); vertical-align: top; }
thead th { font-size: 8pt; color: var(--faint); font-weight:600; border-bottom: .5mm solid var(--gold); }
td.blank { height: 8mm; }
.match { display:grid; grid-template-columns: 1fr 1fr; gap: 2mm 10mm; }
.match div { padding: 1mm 0; }
.dialogue { border: .3mm solid var(--rule); border-radius: 2.5mm; padding: 3mm 4.5mm; font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 10.4pt; line-height: 1.75; }
.dialogue .who { font-family: 'Source Sans Pro', Arial, sans-serif; font-weight: 600; font-size: 8.6pt; color: var(--indigo); display:inline-block; min-width: 18mm; }
.cards { display:grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.card { border: .3mm dashed #94A3B8; border-radius: 2.5mm; padding: 3mm 4mm; break-inside: avoid; }
.card .ct { font-weight: 600; font-size: 9pt; color: var(--indigo); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 1mm; }
.card ul { margin: 0; padding-left: 4.5mm; }
.write .line { height: 8.5mm; }
.steps { width: 100%; }
.steps td.t { width: 15mm; font-weight: 600; color: var(--indigo); white-space: nowrap; }
.steps td.s { width: 38mm; font-weight: 600; }
.facts { display:grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; margin-bottom: 4.5mm; }
.fact { border:.3mm solid var(--rule); border-radius: 2mm; padding: 2.2mm 3mm; background: var(--paper); }
.fact .k { font-size: 7.6pt; color: var(--faint); font-weight:600; text-transform: uppercase; letter-spacing: .05em; }
.fact .v { font-size: 9.6pt; font-weight: 600; margin-top: .4mm; line-height: 1.3; }
.key { border: .3mm solid #3587fc; background: var(--gsoft); border-radius: 2.5mm; padding: 3mm 4.5mm; }
.key div { margin: .8mm 0; }
.script { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 10.2pt; line-height: 1.7; border-left: 1mm solid var(--indigo); background: var(--paper); border-radius: 0 2.5mm 2.5mm 0; padding: 3mm 4.5mm; }
.script .who { font-family: 'Source Sans Pro', Arial, sans-serif; font-weight: 600; font-size: 8.4pt; color: var(--indigo); }
ul.plain { margin: 0; padding-left: 5mm; }
ul.plain li { margin: .8mm 0; }
.pb { break-before: page; }
"""

FOOT = """<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#5b6780;padding:0 15mm;display:flex;justify-content:space-between;">
<span>Epic Campus (Pvt) Ltd, Galle &middot; Korea Scholarship Programme 2026</span><span>{label} &middot; page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>"""

e = html.escape

def rich(s):
    """Escape, then allow **bold** and __blank__ markers."""
    s = e(str(s))
    out, bold = '', False
    parts = s.split('**')
    for i, p in enumerate(parts):
        out += (('<b>' if i % 2 else '') + p + ('</b>' if i % 2 else ''))
    return out.replace('___', '<span class="ans"></span>')

def block_html(b, n):
    t = b['t']
    title = b.get('title', '')
    h = f"<h2><span class='n'>{n}</span>{rich(title)}</h2>" if title else ''
    ins = f"<div class='instr'>{rich(b['ins'])}</div>" if b.get('ins') else ''
    body = ''
    if t == 'words':
        body = "<div class='box chips'>" + ''.join(f"<span>{rich(w)}</span>" for w in b['items']) + "</div>"
    elif t == 'note':
        body = "<div class='note'><ul>" + ''.join(f"<li>{rich(x)}</li>" for x in b['items']) + "</ul></div>"
    elif t == 'passage':
        ttl = f"<div class='ttl'>{rich(b['head'])}</div>" if b.get('head') else ''
        body = "<div class='passage'>" + ttl + ''.join(f"<p>{rich(p).replace(chr(10), '<br>')}</p>" for p in b['text'].strip().split('\n\n')) + "</div>"
    elif t == 'gap':   # sentences with ___ or (a / b) choices, answered in place
        body = "<ol class='items'>" + ''.join(f"<li>{rich(x)}</li>" for x in b['items']) + "</ol>"
    elif t == 'lines':  # question + answer line underneath
        body = "<ol class='items'>" + ''.join(f"<li>{rich(x)}<div class='line'></div></li>" for x in b['items']) + "</ol>"
    elif t == 'mcq':
        body = "<ol class='items'>" + ''.join(
            f"<li>{rich(q)}<div class='opts'>" + ''.join(f"<span><b>{'ABCD'[i]}</b> {rich(o)}</span>" for i, o in enumerate(opts)) + "</div></li>"
            for q, opts in b['items']) + "</ol>"
    elif t == 'tf':
        lab = b.get('labels', ['T', 'F'])
        body = "<ol class='items'>" + ''.join(f"<li><span class='tf'>" + ''.join(f"<span>{l}</span>" for l in lab) + f"</span>{rich(x)}</li>" for x in b['items']) + "</ol>"
    elif t == 'match':
        L, R = b['left'], b['right']
        rows = ''
        for i in range(max(len(L), len(R))):
            l = f"{i+1}. {rich(L[i])} <span class='ans' style='min-width:12mm'></span>" if i < len(L) else ''
            r = f"<b>{'ABCDEFGHIJ'[i]}</b> {rich(R[i])}" if i < len(R) else ''
            rows += f"<div>{l}</div><div>{r}</div>"
        body = f"<div class='match'>{rows}</div>"
    elif t == 'table':
        hd = ''.join(f"<th>{rich(x)}</th>" for x in b['head'])
        rows = ''.join("<tr>" + ''.join(f"<td class='{ 'blank' if c == '' else ''}'>{rich(c)}</td>" for c in r) + "</tr>" for r in b['rows'])
        body = f"<table><thead><tr>{hd}</tr></thead><tbody>{rows}</tbody></table>"
    elif t == 'dialogue':
        body = "<div class='dialogue'>" + ''.join(f"<div><span class='who'>{e(w)}</span>{rich(x)}</div>" for w, x in b['lines']) + "</div>"
    elif t == 'cards':
        body = "<div class='cards'>" + ''.join(
            f"<div class='card'><div class='ct'>{rich(c[0])}</div><ul>" + ''.join(f"<li>{rich(x)}</li>" for x in c[1]) + "</ul></div>"
            for c in b['items']) + "</div>"
    elif t == 'write':
        body = "<div class='write'>" + "<div class='line'></div>" * b.get('n', 6) + "</div>"
    elif t == 'list':
        body = "<ul class='plain'>" + ''.join(f"<li>{rich(x)}</li>" for x in b['items']) + "</ul>"
    else:
        raise ValueError('unknown block ' + t)
    cls = 'block flow' if b.get('flow') or t == 'passage' or (t == 'write' and b.get('n', 6) > 12) else 'block'
    return f"<div class='{cls}'>{h}{ins}{body}</div>"

def page(title, body):
    return f"<!doctype html><html lang='en'><head><meta charset='utf-8'><title>{e(title)}</title><style>{CSS}</style></head><body>{body}</body></html>"

def label_of(L):
    return f"Day {L['day']}" if L.get('day') else L.get('label', '')

def student_html(L):
    top = f"<div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>{e(label_of(L))} &middot; {e(L['kind'])}</span></div>"
    head = f"<div class='head'>{top}<h1>{rich(L['title'])}</h1><div class='sub'>{rich(L.get('focus',''))}</div></div>"
    name = "<div class='namebar'><div>Name</div><div>Date</div></div>"
    blocks, n = '', 0
    for b in L['student']:
        if b['t'] == 'pagebreak':
            blocks += "<div class='pb'></div>"; continue
        n += 1 if b.get('title') else 0
        blocks += block_html(b, n)
    return page(L['title'], head + name + blocks)

def teacher_html(L):
    T = L['teacher']
    top = f"<div class='top'><span>Teacher copy &middot; not for students</span><span class='gold'>{e(label_of(L))} &middot; {e(L['kind'])}</span></div>"
    head = f"<div class='head teacher'>{top}<h1>{rich(L['title'])}</h1><div class='sub'>{rich(L.get('focus',''))}</div></div>"
    facts = [('Time', L.get('time', '')), ('Teacher', L.get('who', '')), ('Theme', L.get('theme', '')), ('You need', T.get('need', 'Student worksheet, board'))]
    fx = "<div class='facts'>" + ''.join(f"<div class='fact'><div class='k'>{k}</div><div class='v'>{rich(v)}</div></div>" for k, v in facts) + "</div>"
    out = head + fx
    if T.get('aims'):
        out += "<div class='block'><h2>By the end of the lesson</h2><div class='note'><ul>" + ''.join(f"<li>{rich(a)}</li>" for a in T['aims']) + "</ul></div></div>"
    if T.get('steps'):
        rows = ''.join(f"<tr><td class='t'>{e(str(m))} min</td><td class='s'>{rich(s)}</td><td>{rich(d)}</td></tr>" for m, s, d in T['steps'])
        total = sum(int(m) for m, _, _ in T['steps'])
        out += f"<div class='block flow'><h2>Lesson steps <span style='font-size:8.5pt;color:#5b6780;font-weight:500'>{total} minutes</span></h2><table class='steps'><tbody>{rows}</tbody></table>" + ("<p class='instr' style='margin-top:2mm'>Short of time? Finish the last exercise in the IT lab straight after this lesson, or set it as homework.</p>" if L.get('folder') in ('Reading', 'Listening', 'Speaking') else '') + "</div>"
    if T.get('script'):
        sc = T['script']
        ttl = f"<div style='font-weight:600;margin-bottom:1.5mm'>{rich(sc.get('head',''))}</div>" if sc.get('head') else ''
        lines = ''.join(f"<div><span class='who'>{e(w)}:</span> {rich(x)}</div>" if w else f"<div>{rich(x)}</div>" for w, x in sc['lines'])
        out += f"<div class='block flow'><h2>Listening script <span style='font-size:8.5pt;color:#5b6780;font-weight:500'>read it aloud twice, at a natural but slow pace</span></h2>{ttl}<div class='script'>{lines}</div></div>"
    if T.get('answers'):
        out += "<div class='block'><h2>Answer key</h2><div class='key'>" + ''.join(f"<div>{rich(a)}</div>" for a in T['answers']) + "</div></div>"
    for sec in T.get('extra', []):
        out += f"<div class='block'><h2>{rich(sec[0])}</h2><ul class='plain'>" + ''.join(f"<li>{rich(x)}</li>" for x in sec[1]) + "</ul></div>"
    if T.get('tips'):
        out += "<div class='block'><h2>Tips for this group</h2><ul class='plain'>" + ''.join(f"<li>{rich(x)}</li>" for x in T['tips']) + "</ul></div>"
    if T.get('homework'):
        out += f"<div class='block'><h2>Homework and IT lab</h2><p>{rich(T['homework'])}</p></div>"
    return page(L['title'] + ' (teacher)', out)

def load_all(only=None):
    lessons = []
    for f in sorted(glob.glob(HERE + 'content/*.py')):
        if only and only not in f:
            continue
        spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        lessons += m.LESSONS
    return [post_fix(fit_block(L)) for L in lessons]

POST_FIX = [('Day 19 and Day 19 writing', 'Day 20 writing'), ('mock interview 3 is on Day 27', 'mock interview 3 is on Day 26'), ('Day 20 and Day 20 writing', 'Day 20 writing'), ('the Day 17 lessons', 'the past simple lessons (Days 14 and 18)')]
def post_fix(L):
    import json
    s = json.dumps(L)
    for a, b in POST_FIX:
        s = s.replace(a, b)
    L2 = json.loads(s)
    def tup(T):  # steps / lines were tuples
        if T.get('teacher') and T['teacher'].get('steps'):
            T['teacher']['steps'] = [tuple(x) for x in T['teacher']['steps']]
        return T
    return tup(L2)

# Where each paper sits in the plan (whole-day swap, v3). Old day number -> new English day.
# Morning 8:30-11:30 (Teacher 1, Anna): writing 8:30-10:00, speaking 10:15-11:30.
# Afternoon 1:00-4:30 (Teacher 3): reading 1:00-2:00, listening 2:15-3:15, IT lab 3:30-4:30.
import re
SLOT = {
    'Writing': ('8:30 to 10:00 (English morning)', 'English Teacher 1 (Anna)', 90),
    'Speaking': ('10:15 to 11:30 (English morning)', 'English Teacher 1 (Anna)', 75),
    'Reading': ('1:00 to 2:00 (English afternoon)', 'English Teacher 3', 60),
    'Listening': ('2:15 to 3:15 (English afternoon)', 'English Teacher 3', 60),
}
MAP = {
    'Writing': {7: 8, 9: 10, 11: 12, 13: 14, 17: 18, 19: 20, 21: 22, 23: 24, 27: 26},
    'Speaking': {7: 8, 9: 10, 11: 12, 13: 14, 17: 18, 19: 20, 21: 22, 23: 24, 25: 26},
    'Reading': {8: 8, 10: 10, 14: 12, 16: 14, 18: 18, 20: 20, 22: 22, 26: 24, 28: 26},
    'Listening': {8: 8, 12: 10, 14: 12, 16: 14, 18: 18, 22: 20, 24: 22, 26: 24, 28: 26},
    'Tests': {1: 1, 15: 16, 29: 28},
    'Mock interviews': {10: 12, 20: 20, 27: 26, 30: 28},
}
# "Day N" inside the text of a paper -> the new day of that lesson
OLD2NEW = {}
for f in ('Writing', 'Speaking', 'Reading', 'Listening'):
    for o, n in MAP[f].items():
        OLD2NEW.setdefault(o, n)
OLD2NEW.update({15: 16, 29: 28})
FIXED = {  # special times for tests and mocks
    ('Tests', 1): ('9:00 to 10:45 (parts 1 to 3) and 1:00 to 2:00 (part 4, speaking)', 'English Teacher 1 (Anna) and English Teacher 2'),
    ('Mock interviews', 12): ('1:00 to 4:30, side room, one by one', 'English Teacher 2'),
    ('Mock interviews', 20): ('1:00 to 4:30, side room, one by one', 'English Teacher 2'),
    ('Mock interviews', 26): ('1:00 to 4:30, side room, one by one', 'English Teacher 2'),
    ('Mock interviews', 28): ('2:15 to 4:30 (also the final speaking test)', 'English Teacher 2'),
}
TEXT_FIX = [
    (r'IT lab today: Day \d+ lesson( on epicielts\.live)?( \(General English, Week \d\))?', 'IT lab today (3:30 to 4:30): today\'s lesson on epicielts.live'),
    (r"tomorrow's mid-programme test", 'the mid-programme test (Day 16)'),
    (r"tomorrow's mock interview", 'the next mock interview'),
    (r'mock interview round 3 tomorrow afternoon', 'mock interview round 3 (this afternoon, side room)'),
    (r' ?Debate night at 7:30 pm\.', ''), (r' ?Presentation night at 7:30 pm\.', ''),
]

def remap_text(x):
    if isinstance(x, str):
        for a, b in TEXT_FIX:
            x = re.sub(a, b, x)
        return re.sub(r'\bDay (\d+)\b', lambda m: 'Day %d' % OLD2NEW.get(int(m.group(1)), int(m.group(1))), x)
    if isinstance(x, list):
        return [remap_text(i) for i in x]
    if isinstance(x, tuple):
        return tuple(remap_text(i) for i in x)
    if isinstance(x, dict):
        return {k: (remap_text(v) if k not in ('t',) else v) for k, v in x.items()}
    return x

def fit_block_v3(L):
    f, old = L.get('folder'), L.get('day')
    if f in ('Grammar foundation', 'Evenings'):
        return L
    if f == 'Tests' and old in (15, 29):
        L = dict(L); part_a = 'part A' in L['kind']; d = 16 if old == 15 else 28
        L['day'] = d
        if part_a:
            L['time'], L['who'] = '8:30 to 11:30 (tea break 10:00 to 10:15)', 'English Teacher 1 (Anna)'
        elif d == 16:
            L['time'], L['who'] = 'Listening 1:00 to 2:00, speaking 2:15 to 4:30 (one by one)', 'English Teacher 3'
        else:
            L['time'], L['who'] = 'Listening 1:00 to 2:00. Speaking = the final mock interview (2:15 to 4:30, English Teacher 2)', 'English Teacher 3'
        return remap_text(L)
    newday = MAP.get(f, {}).get(old)
    L = remap_text(dict(L))
    if newday is None:  # not in the new plan: kept as extra practice
        L['folder'], L['kind'], L['day'] = 'Extra practice', 'Extra practice (' + f.lower() + ')', None
        L['label'] = 'Extra practice'
        L['time'], L['who'] = 'Any time: IT lab, evening study or for weaker students', 'Any English teacher'
        return L
    L['day'] = newday
    if (f, newday) in FIXED:
        L['time'], L['who'] = FIXED[(f, newday)]
        return L
    slot = SLOT.get(f)
    if not slot or not L.get('teacher'):
        return L
    time, who, target = slot
    L['time'], L['who'] = time, who
    steps = L['teacher'].get('steps') or []
    total = sum(int(m) for m, _, _ in steps)
    if steps and total != target:
        scaled = [max(5, int(round(int(m) * target / total / 5.0)) * 5) for m, _, _ in steps]
        diff = target - sum(scaled)
        i = scaled.index(max(scaled))
        scaled[i] = max(5, scaled[i] + diff)
        T = dict(L['teacher'])
        T['steps'] = [(n, a, b) for n, (_, a, b) in zip(scaled, steps)]
        L['teacher'] = T
    return L

# ---- Plan v5 (29 Oct): Anna teaches Wed/Thu/Sat 9:00-12:00 ----
V5_AM = {8: 6, 10: 7, 12: 9, 14: 13, 18: 16, 20: 20, 22: 21, 24: 23, 26: 27}
V5_PM = {8: 8, 10: 10, 12: 11, 14: 12, 18: 17, 20: 19, 22: 22, 24: 24, 26: 25}
V5_MOCK = {12: 12, 20: 19, 26: 26, 28: 28}
V5_TEST = {16: 14, 28: 28}
def v5_text(x, f):
    m = V5_AM if f in ('Writing', 'Speaking') else V5_PM
    if isinstance(x, str):
        x = x.replace('9:00 to 10:30', '9:00 to 10:30')
        return re.sub(r'\bDay (\d+)\b', lambda mm: 'Day %d' % {**V5_TEST, **m}.get(int(mm.group(1)), int(mm.group(1))), x)
    if isinstance(x, list): return [v5_text(i, f) for i in x]
    if isinstance(x, tuple): return tuple(v5_text(i, f) for i in x)
    if isinstance(x, dict): return {k: (v5_text(v, f) if k != 't' else v) for k, v in x.items()}
    return x

def fit_block(L):
    f = L.get('folder')
    if f in ('Grammar foundation', 'Evenings') or (f == 'Tests' and L.get('day') == 1):
        return L
    L = fit_block_v3(L)
    d = L.get('day')
    if not d:
        return L
    L = v5_text(dict(L), f)
    if f in ('Writing', 'Speaking'):
        L['day'] = V5_AM[d]
        L['time'] = ('9:00 to 10:30' if f == 'Writing' else '10:45 to 12:00') + ' (English morning, Wed/Thu/Sat)'
        L['who'] = 'English Teacher 1 (Anna)'
    elif f in ('Reading', 'Listening'):
        L['day'] = V5_PM[d]
        L['time'] = ('1:00 to 2:00' if f == 'Reading' else '2:15 to 3:15') + ' (English afternoon)'
    elif f == 'Mock interviews':
        L['day'] = V5_MOCK[d]
    elif f == 'Tests':
        L['day'] = V5_TEST[d]
        if 'part A' in L['kind']:
            L['time'], L['who'] = '9:00 to 12:00 (tea break 10:30 to 10:45)', 'English Teacher 1 (Anna)'
    return L

def folder_of(L):
    name = (f"Day {L['day']:02d} - " if L.get('day') else L['kind'].split('(')[-1].rstrip(')').capitalize() + ' - ') + L['theme']
    return OUT + L['folder'] + '/' + name.replace('/', '-').replace('?', '') + '/'

async def render(lessons):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page()
        for L in lessons:
            d = folder_of(L); os.makedirs(d, exist_ok=True)
            jobs = [('Student worksheet.pdf', student_html(L), 'Student worksheet')]
            if L.get('teacher'):
                jobs.append(('Teacher notes.pdf', teacher_html(L), 'Teacher notes'))
            for fn, doc, lab in jobs:
                tmp = HERE + 'tmp.html'; open(tmp, 'w').write(doc)
                await pg.goto('file://' + tmp); await pg.wait_for_timeout(150)
                await pg.pdf(path=d + fn, format='A4', print_background=True, display_header_footer=True,
                             header_template='<div></div>', footer_template=FOOT.format(label=e(label_of(L) + ' · ' + L['kind'] + ' · ' + lab)),
                             margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            print('ok', L.get('day'), L['folder'], L['theme'])
        await b.close()

if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(render(load_all(only)))
