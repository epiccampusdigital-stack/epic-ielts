# Builds the three teacher printouts as A4 PDFs in the shared EPIC theme.
import json, asyncio, datetime as dt, html, os
from playwright.async_api import async_playwright

S = os.environ.get('EPIC_WORK', '/tmp/epicwork/')
OUT = '/home/claude/deliverables/print/'
os.makedirs(OUT, exist_ok=True)
plan = json.load(open(S + 'plan.json'))
E = html.escape

def fonts_css():
    rows = []
    for f in sorted(os.listdir(S + 'localfonts2')):
        fam = 'Source Sans Pro'
        w = f.split('-')[-2]
        st = 'italic' if 'italic' in f else 'normal'
        rows.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url(file://{S}localfonts2/{f}) format('woff2')}}")
    return '\n'.join(rows)

# One theme for the site, the slides, the calendar and these printouts
CSS = fonts_css() + r"""
:root {
  --navy: #002761; --navy-deep: #001a43; --indigo: #0056d2; --indigo-soft: #e3eeff;
  --gold: #0056d2; --gold-soft: #f0f6ff; --korean: #BE185D; --korean-soft: #FCE7F3;
  --ink: #0f1114; --sub: #5b6780; --faint: #5b6780; --rule: #dae1ed; --paper: #f7f9fc;
}
@page { size: A4; margin: 16mm 16mm 18mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 9.6pt; line-height: 1.55; color: var(--ink); }
h1, h2, h3 { font-family: 'Source Sans Pro', Arial, sans-serif; margin: 0; color: var(--ink); text-wrap: balance; }
p { margin: 0; }
b, strong { font-weight: 600; }

/* Cover band: first page only, bleeds to the page edges */
.band { margin: 0 0 6mm; padding: 9mm 12mm 7.5mm; border-radius: 3mm; color: #fff; position: relative; overflow: hidden;
  background:
    radial-gradient(90mm 60mm at 6% 0%, rgba(53,135,252,.0), transparent 70%),
    radial-gradient(70mm 50mm at 100% 40%, rgba(53,135,252,.0), transparent 70%),
    linear-gradient(180deg, var(--navy), var(--navy-deep)); }
.band .org { font-size: 8.5pt; letter-spacing: .06em; color: #CBD5E1; font-weight: 600; }
.band h1 { color: #fff; font-size: 26pt; line-height: 1.08; margin-top: 5mm; max-width: 150mm; }
.band .sub { color: #CBD5E1; font-size: 11pt; margin-top: 3mm; }
.band .rule { width: 14mm; height: 1mm; border-radius: 1mm; background: linear-gradient(90deg, var(--gold), #3587fc); margin-top: 6mm; }

/* Section heading: the same gold mark the website uses */
section { margin-top: 6.5mm; }
table.whole { break-inside: avoid; }
section:first-of-type { margin-top: 0; }
h2 { font-size: 15pt; line-height: 1.2; margin-bottom: 3mm; }
h2::before { content: ''; display: block; width: 10mm; height: .9mm; border-radius: 1mm; background: linear-gradient(90deg, var(--gold), #3587fc); margin-bottom: 2.2mm; }
h3 { font-size: 11pt; margin-bottom: 1.5mm; }
.lead { font-size: 11pt; line-height: 1.6; color: var(--ink); }
.muted { color: var(--sub); }
.small { font-size: 8.4pt; color: var(--sub); }
.keep { break-inside: avoid; }
.pagebreak { break-before: page; }

.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 4mm; }
.fact { border: .3mm solid var(--rule); border-radius: 2mm; padding: 3mm 3.5mm; background: var(--paper); }
.fact .k { font-size: 7.8pt; color: var(--faint); font-weight: 600; }
.fact .v { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 13pt; font-weight: 600; margin-top: .6mm; line-height: 1.2; }

.two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.card { border: .3mm solid var(--rule); border-radius: 2.5mm; padding: 4mm 4.5mm; break-inside: avoid; }
.card.navy { background: linear-gradient(160deg, #003b8f, var(--navy) 70%); color: #dae1ed; border-color: transparent; }
.card.navy h3 { color: #fff; }
.card.gold { background: var(--gold-soft); border-color: #3587fc; }

ul.tick, ul.dot { list-style: none; padding: 0; margin: 1.5mm 0 0; display: grid; gap: 1.6mm; }
ul.tick li { padding-left: 5mm; position: relative; }
ul.tick li::before { content: ''; position: absolute; left: .5mm; top: 1.4mm; width: 2.6mm; height: 1.3mm; border-left: .5mm solid var(--indigo); border-bottom: .5mm solid var(--indigo); transform: rotate(-45deg); }
.card.navy ul.tick li::before { border-color: var(--gold); }
ul.dot li { padding-left: 4mm; position: relative; }
ul.dot li::before { content: ''; position: absolute; left: 0; top: 1.9mm; width: 1.6mm; height: 1.6mm; border-radius: .4mm; background: var(--indigo); }
ol.steps { margin: 1.5mm 0 0; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 2.4mm; }
ol.steps li { counter-increment: s; padding-left: 8mm; position: relative; }
ol.steps li::before { content: counter(s); position: absolute; left: 0; top: -.2mm; width: 5.4mm; height: 5.4mm; border-radius: 50%; background: linear-gradient(145deg, #3587fc, var(--gold)); color: var(--navy); font-weight: 600; font-size: 8pt; display: flex; align-items: center; justify-content: center; }
.checks { list-style: none; padding: 0; margin: 2mm 0 0; display: grid; gap: 2mm; }
.checks li { padding-left: 7mm; position: relative; }
.checks li::before { content: ''; position: absolute; left: 0; top: .5mm; width: 3.6mm; height: 3.6mm; border: .35mm solid var(--ink); border-radius: .6mm; }

table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; vertical-align: top; padding: 1.9mm 2.4mm 1.9mm 0; border-bottom: .25mm solid var(--rule); }
thead th { font-size: 7.8pt; font-weight: 600; color: var(--faint); border-bottom: .5mm solid var(--gold); padding-top: 0; }
tbody th { font-weight: 600; }
td.num, th.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.tag { display: inline-block; font-size: 7.4pt; font-weight: 600; padding: .3mm 1.8mm; border-radius: 5mm; white-space: nowrap; }
.tag.en { background: var(--indigo-soft); color: var(--indigo); }
.tag.kr { background: var(--korean-soft); color: var(--korean); }
.tag.lab { background: #ECFDF5; color: #047857; }
.tag.act { background: var(--gold-soft); color: #92400E; }
.tag.test { background: #F3E8FF; color: #6B21A8; }
tr.en td:first-child { box-shadow: inset .8mm 0 0 var(--indigo); padding-left: 2.4mm; }
tr.kr td:first-child { box-shadow: inset .8mm 0 0 var(--korean); padding-left: 2.4mm; }
tr.br td { color: var(--faint); }
tr.br td:first-child { padding-left: 2.4mm; }

.plan30 { font-size: 7.7pt; line-height: 1.35; }
.plan30 th, .plan30 td { padding: 1.35mm 1.8mm 1.35mm 0; }
.plan30 tbody tr:nth-child(6n) td { border-bottom: .45mm solid var(--navy); }
.plan30 .d { font-weight: 600; }
.plan30 .ev { color: #92400E; font-weight: 600; }

.lesson-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 6mm; padding-bottom: 3mm; border-bottom: .5mm solid var(--gold); margin-bottom: 4mm; }
.lesson-head .skill { font-size: 8.5pt; font-weight: 600; color: var(--indigo); }
.lesson-head h2 { margin-bottom: 0; }
.lesson-head h2::before { display: none; }
.meta { display: flex; gap: 2mm; flex-wrap: wrap; justify-content: flex-end; }
.meta span { font-size: 7.8pt; border: .25mm solid var(--rule); border-radius: 5mm; padding: .4mm 2.2mm; color: var(--sub); white-space: nowrap; }
.script { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 9.6pt; line-height: 1.7; background: var(--paper); border-left: .8mm solid var(--indigo); padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; }
.script p + p { margin-top: 1.6mm; }
.script .who { font-family: 'Source Sans Pro', Arial, sans-serif; font-weight: 600; font-size: 8.4pt; color: var(--indigo); }
.model { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 9.6pt; line-height: 1.7; background: var(--gold-soft); border-left: .8mm solid var(--gold); padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; }
.weak { font-family: 'Source Sans Pro', Arial, sans-serif; font-size: 9.6pt; line-height: 1.7; background: #FEF2F2; border-left: .8mm solid #B42318; padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; }
.answers { font-size: 8.4pt; color: var(--sub); border-top: .25mm dashed var(--rule); padding-top: 2mm; margin-top: 3mm; }
.answers b { color: var(--ink); }
.box { border: .3mm solid var(--rule); border-radius: 2mm; padding: 3mm 4mm; }
.sign { margin-top: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.sign .line { border-top: .3mm solid var(--ink); padding-top: 1.5mm; font-size: 8.4pt; color: var(--sub); margin-top: 12mm; }
"""

FOOT = """<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#5b6780;padding:0 16mm;display:flex;justify-content:space-between;">
<span>Epic Campus (Pvt) Ltd, Korea Scholarship Programme 2026</span><span>{title}, page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>"""

def doc(title, body):
    return f"<!doctype html><html lang='en'><head><meta charset='utf-8'><title>{E(title)}</title><style>{CSS}</style></head><body>{body}</body></html>"

def pdate(s):
    d = dt.date.fromisoformat(s)
    return d.strftime('%a %-d %b')

def t12(t):
    h, m = map(int, t.split(':'))
    return f"{h % 12 or 12}:{m:02d}" + ('' if m else '')

sessions = plan['sessions']
days = plan['days']
def ses(day, start):
    for x in sessions:
        if x['dayNumber'] == day and x['startTime'] == start:
            return x
    return None

# ── Numbers used across the documents (computed, never typed) ──
mins = lambda t: int(t[:2]) * 60 + int(t[3:])
hours = {}
lang = {'EN': 0, 'KR': 0}
for x in sessions:
    d = mins(x['endTime']) - mins(x['startTime'])
    if x.get('teacher'):
        hours[x['teacher']] = hours.get(x['teacher'], 0) + d
    if x.get('language'):
        lang[x['language']] += d
H = lambda k: hours.get(k, 0) / 60
EN_H, KR_H = lang['EN'] / 60, lang['KR'] / 60
t1 = [x for x in sessions if x.get('teacher') == 'EN_MORNING']
assert all(mins(x['endTime']) <= 13 * 60 for x in t1), 'Teacher 1 has an afternoon session'
T1_LAST = max(x['endTime'] for x in t1)
T1_DAYS = sorted({x['dayNumber'] for x in t1})
start, end = days[0]['date'], days[-1]['date']
fmt_long = lambda s: dt.date.fromisoformat(s).strftime('%A %-d %B %Y')

def hfmt(h):
    return f"{h:.1f}".rstrip('0').rstrip('.')

# ═══════════════════════ 1. Proposal ═══════════════════════
EN_DAYS = sorted({x['dayNumber'] for x in sessions if x.get('language') == 'EN' and x['startTime'] < '17:00'})
KR_DAYS = [d for d in range(1, 31) if d not in EN_DAYS]
T2_DAYS = sorted({x['dayNumber'] for x in sessions if x.get('teacher') == 'EN_SPEAKING'})
assert T1_LAST <= '12:00', 'Teacher 1 must finish by 12:00'
ANNA_DOW = {dt.date.fromisoformat(days[d-1]['date']).strftime('%a') for d in T1_DAYS}
assert ANNA_DOW <= {'Wed', 'Thu', 'Sat'}, ANNA_DOW
assert len(T1_DAYS) == 12
KR_ONLY = [d for d in range(1, 31) if not any(x['dayNumber'] == d and x.get('language') == 'EN' and x['startTime'] < '17:00' for x in sessions)]
def daylist(ds):
    return ', '.join(str(d) for d in ds)

def special_mornings():
    out = []
    for d in T1_DAYS:
        xs = [x for x in t1 if x['dayNumber'] == d and x['subject'] in ('ASSESSMENT', 'ACTIVITY', 'ADMIN')]
        if xs:
            ts = []
            for x in xs:
                t = x['title'].split(' (')[0]
                if t not in ts: ts.append(t)
            out.append((d, ', then '.join(ts)))
    return out

spec = special_mornings()
spec_rows = ''.join(f"<tr><td class='num'>Day {d}</td><td class='num'>{pdate(days[d-1]['date'])}</td><td>{E(t)}</td></tr>" for d, t in spec)

proposal = f"""
<div class="band">
  <div class="org">EPIC CAMPUS (PVT) LTD, GALLE</div>
  <h1>An invitation to lead our morning English lessons</h1>
  <p class="sub">Korea Scholarship Programme, {pdate(start)} to {pdate(end)} 2026</p>
  <div class="rule"></div>
</div>

<section>
  <p class="lead">Ten students will live and study at Epic Campus for 30 days before they leave for South Korea on university scholarships. We would like you to teach their English in the mornings. Your experience with TOEFL is exactly what this group needs as they prepare for tests and scholarship interviews.</p>
  <div class="facts">
    <div class="fact"><div class="k">Students</div><div class="v">10, living on campus</div></div>
    <div class="fact"><div class="k">Length</div><div class="v">30 days</div></div>
    <div class="fact"><div class="k">Your hours</div><div class="v">9:00 to 12:00, Wed, Thu and Sat</div></div>
    <div class="fact"><div class="k">Their level</div><div class="v">Basic, aiming for A2</div></div>
  </div>
</section>

<section>
  <h2>Your mornings</h2>
  <p>You teach English from 9:00 to 12:00 on Wednesdays, Thursdays and Saturdays, 12 mornings in all. Korean is taught in the afternoon on those days.</p>
  <div class="two" style="margin-top:4mm">
    <div class="card navy">
      <h3>Wed, Thu and Sat, 9:00 to 12:00</h3>
      <ul class="tick">
        <li><b style="color:#fff">9:00 to 10:30:</b> grammar and writing</li>
        <li><b style="color:#fff">10:30 to 10:45:</b> tea break</li>
        <li><b style="color:#fff">10:45 to 12:00:</b> speaking practice on the same theme</li>
      </ul>
    </div>
    <div class="card">
      <h3>Your days</h3>
      <p class="muted">Days {daylist(T1_DAYS)}. English Teacher 2 teaches the week 1 grammar foundation, and English Teacher 3 teaches reading and listening on the afternoons of the same themes.</p>
      <p class="small" style="margin-top:3mm">In total: about {hfmt(H('EN_MORNING'))} hours over the programme, on {len(T1_DAYS)} days.</p>
    </div>
  </div>
</section>

<section class="keep">
  <h2>Mornings that are different</h2>
  <table class="whole">
    <thead><tr><th style="width:16%">Day</th><th style="width:20%">Date</th><th>Morning session</th></tr></thead>
    <tbody>{spec_rows}</tbody>
  </table>
</section>

<section class="keep">
  <h2>What you get from us</h2>
  <div class="two">
    <ul class="tick">
      <li>A printed lesson pack for every lesson: student worksheet and teacher notes with timings and answers</li>
      <li>A matching student lesson on epicielts.live for the computer lab</li>
      <li>The <b>Course Structure</b> and the <b>English Level Guide</b>, with sample lessons</li>
    </ul>
    <ul class="tick">
      <li>WhatsApp reminders the night before and before each lesson</li>
      <li>Your own login to see your sessions and take attendance</li>
      <li>One coordinator to call for anything during the programme</li>
    </ul>
  </div>
</section>

<section class="keep">
  <h2>What we ask of you</h2>
  <ul class="dot">
    <li>Arrive by 8:20 on your teaching days</li>
    <li>Take attendance at the start of each lesson</li>
    <li>After each lesson, write one or two lines: what you covered and who needs help</li>
    <li>Tell us by 7 PM the day before if you cannot come, so we can cover your lesson</li>
  </ul>
</section>

<section class="keep">
  <h2>Next steps</h2>
  <ul class="checks">
    <li>Reply on WhatsApp to say yes, and send the number you want reminders on</li>
    <li>Tell us any dates you are not available between {pdate(start)} and {pdate(end)}</li>
    <li>Agree your fee and sign the teaching agreement with us</li>
    <li>Join the short teachers’ meeting before Day 1</li>
  </ul>
  <div class="sign">
    <div><div class="line">Ishara Madhusanka, Founder &amp; Managing Director, Epic Campus (Pvt) Ltd</div></div>
    <div><div class="line">Teacher’s name and signature</div></div>
  </div>
  <p class="small" style="margin-top:5mm">WhatsApp: +94 77 764 4946</p>
</section>
"""

# ═══════════════════════ 2. Course structure ═══════════════════════
TAG = {'ENGLISH': ('en', 'English'), 'KOREAN': ('kr', 'Korean'), 'IT_LAB': ('lab', 'IT lab'), 'ACTIVITY': ('act', 'Activity'), 'ASSESSMENT': ('test', 'Test'), 'ADMIN': ('act', 'Admin')}
TEACH = {t['key']: t['name'] for t in plan['teachers']}

day_rows = [
    ('9:00', '12:00', 'Wed, Thu and Sat: English with Anna (grammar and writing, tea break, speaking). Students self-study 8:30 to 9:00', 'English', 'en'),
    ('8:30', '11:30', 'Other days: Korean morning (lesson, tea break 10:00 to 10:15, practice)', 'Korean', 'kr'),
    ('11:30 / 12:00', '1:00', 'Lunch', '', 'br'),
    ('1:00', '4:30', 'Afternoon (3.5 hours): the other language. Lesson, short break, practice, then IT lab 3:30 to 4:30', 'Korean on Anna days, English on the others', 'en'),
    ('6:30', '7:30', 'Once a week: presentation night, debate night or welcome/graduation (run by campus staff)', 'Mostly English', 'act'),
]
def lang_tag(l, cls):
    if not l: return ''
    c = {'English': 'en', 'Korean': 'kr'}.get(l, cls if cls in ('en', 'kr') else 'act')
    return f"<span class='tag {c}'>{l}</span>"
day_html = ''.join(
    f"<tr class='{'en' if c=='en' else 'kr' if c=='kr' else 'br' if c=='br' else ''}'><td class='num'>{a} to {b}</td><td>{E(t)}</td><td>{lang_tag(l, c)}</td></tr>"
    for a, b, t, l, c in day_rows)

team = [
    ('EN_MORNING', 'Anna. English mornings: grammar and writing, speaking. Mid and final tests (Days 14 and 28), final presentations (Day 30)', f'Wed, Thu, Sat: days {daylist(T1_DAYS)}, 9:00 to 11:30'),
    ('EN_SPEAKING', 'Week 1 grammar foundation (Days 1, 4, 5). Mock interviews on Days 12, 19 and 26, final mock interviews on Day 28', f'Days {daylist(T2_DAYS)}'),
    ('EN_LISTENING', 'English afternoons: reading and vocabulary, listening, reviews, IT lab', 'Days not taught by Anna, 1:00 to 4:30'),
    ('EN_SUPPORT', 'Cover teacher: only if someone cannot come', 'When needed'),
    ('KR_1', 'Korean mornings', 'Days not taught by Anna, 8:30 to 11:30'),
    ('KR_2', 'Korean afternoons and Korean IT lab', 'Korean days, 1:00 to 4:30'),
]
team_html = ''.join(
    f"<tr class='{'kr' if k.startswith('KR') else 'en'}'><td><b>{E(TEACH[k])}</b></td><td>{E(what)}</td><td>{E(when)}</td><td class='num'>{hfmt(H(k))} h</td></tr>"
    for k, what, when in team)

# Check the team text against the data so the document can't drift from the plan
def owner(day, start):
    x = ses(day, start); return x and x.get('teacher')
assert all(owner(d, '08:30') == 'KR_1' for d in KR_ONLY)
assert all(owner(d, '13:00') == 'KR_2' for d in KR_ONLY)
assert all(owner(d, '09:00') == 'EN_MORNING' for d in T1_DAYS)
assert all(any(x['teacher'] == 'EN_SPEAKING' for x in sessions if x['dayNumber'] == d and x.get('teacher')) for d in (12, 19, 26, 28))
assert sorted(T2_DAYS) == [1, 4, 5, 12, 19, 26, 28], T2_DAYS

weeks = [
    ('1', 'Days 1–5', 'Grammar foundation: parts of speech, sentence patterns, pronouns, prepositions, tenses, conjunctions (English workbook 1)', 'Hangul 1 to 4 (Korean workbook 1)', 'Placement test (Day 1), presentation night (Day 5), week 1 quiz (Day 5)'),
    ('2', 'Days 6–15', 'Daily life: home, town, food, shopping, now and the past (English workbook 2)', 'Hangul 5 to 12 (Korean workbooks 1 and 2)', 'Anna starts (Day 6), debate night (Day 11), mock interview 1 (Day 12), mid tests (Day 14 English, Day 15 Korean)'),
    ('3', 'Days 16–22', 'Past and future: travel, health, plans, careers, studying in Korea (English workbook 3)', 'Beginner 1, lessons 1 to 6 (Korean workbook 3)', 'Presentation night (Day 17), mock interview 2 (Day 19)'),
    ('4', 'Days 23–30', 'Scholarship ready: emails, goals, the interview (English workbook 4)', 'Beginner 1, lessons 7 to 12 + self-introduction (Korean workbook 4)', 'Debate night (Day 23), mock interview 3 (Day 26), final tests (Day 28 English, Day 29 Korean), graduation (Day 30)'),
]
weeks_html = ''.join(f"<tr><td class='num'><b>Week {w}</b><br><span class='small'>{r}</span></td><td>{E(en)}</td><td>{E(kr)}</td><td>{E(ms)}</td></tr>" for w, r, en, kr, ms in weeks)

def day_cell(n, half):
    lo, hi = ('08:00', '11:31') if half == 'am' else ('12:59', '17:00')
    xs = [x for x in sessions if x['dayNumber'] == n and lo <= x['startTime'] < hi and x['subject'] not in ('BREAK', 'ADMIN') and not x['title'].startswith('Morning study')]
    parts = []
    for x in xs:
        t = x['title'].replace('English: ', '').replace('Korean practice: ', 'Practice: ').replace('Korean: ', '')
        if ' (part 2' in t or t.startswith('Practice: ') or x['subject'] == 'IT_LAB':
            continue
        t = t.replace(' (part 1)', '')
        if x['subject'] == 'ENGLISH' and x.get('description') and not t.startswith('Foundation') and n not in (1, 30):
            t = f"<b>{E(t)}:</b> {E(x['description'].split('. ', 1)[-1])}"
        else:
            t = f"<span class='{'ev' if x['subject'] in ('ASSESSMENT', 'ACTIVITY') else ''}'>{E(t)}</span>"
        parts.append(t)
    who = sorted({TEACH[x['teacher']].replace('English ', '').replace('Korean ', 'KR ') for x in xs if x.get('teacher')})
    return '<br>'.join(parts) + (f"<br><span class='small'>{E(', '.join(who))}</span>" if who else '')

rows = []
for d in days:
    n = d['dayNumber']
    ev = next((x for x in sessions if x['dayNumber'] == n and x['startTime'] == '18:30'), None)
    lg = 'Korean' if n in KR_ONLY else 'English' if not any(x['dayNumber'] == n and x.get('language') == 'KR' for x in sessions) else 'Both'
    rows.append(f"<tr class='{'en' if lg != 'Korean' else 'kr'}'><td class='d num'>{n}</td><td class='num'>{pdate(d['date'])}<br>{lang_tag(lg, '') if lg != 'Both' else lang_tag('English','') + ' ' + lang_tag('Korean','')}</td><td>{day_cell(n, 'am')}</td><td>{day_cell(n, 'pm')}{('<br><span class=ev>Evening: ' + E(ev['title']) + '</span>') if ev else ''}</td></tr>")
plan_head = "<thead><tr><th style='width:4%'>Day</th><th style='width:12%'>Date</th><th style='width:40%'>Morning</th><th style='width:44%'>Afternoon 1:00 to 4:30</th></tr></thead>"

structure = f"""
<div class="band">
  <div class="org">EPIC CAMPUS (PVT) LTD, GALLE</div>
  <h1>Korea Scholarship Programme: course structure</h1>
  <p class="sub">{fmt_long(start)} to {fmt_long(end)}. Updated 29 October 2026: English with Anna on Wed, Thu and Sat mornings.</p>
  <div class="rule"></div>
</div>

<section>
  <div class="facts">
    <div class="fact"><div class="k">Students</div><div class="v">10, live-in</div></div>
    <div class="fact"><div class="k">Days</div><div class="v">30, two sessions a day</div></div>
    <div class="fact"><div class="k">English</div><div class="v">about {hfmt(round(EN_H - 3 * 3.5))} hours</div></div>
    <div class="fact"><div class="k">Korean</div><div class="v">{hfmt(KR_H)} hours</div></div>
  </div>
</section>

<section class="keep">
  <h2>Goals by Day 30</h2>
  <div class="two">
    <div class="card"><h3 style="color:var(--indigo)">English</h3><ul class="tick">
      <li>A solid grammar foundation from week 1: parts of speech, sentence patterns, tenses</li>
      <li>Everyday conversation at A2 level</li>
      <li>Answer scholarship interview questions with a reason and an example</li>
      <li>Write a short email and a 150-word personal statement</li></ul></div>
    <div class="card"><h3 style="color:var(--korean)">Korean</h3><ul class="tick">
      <li>Read and write Hangul with confidence</li>
      <li>Survival conversation: introductions, numbers, food, directions</li>
      <li>A Korean self-introduction for interviews</li>
      <li>Finish the 24 EStudykorea lessons: Hangul and Beginner 1</li></ul></div>
  </div>
</section>

<section class="keep">
  <h2>How we check progress</h2>
  <div class="two">
    <ul class="dot">
      <li><b>Placement test</b> on Day 1, on epicielts.live: four parts, a score out of 100 and a level (Pre-A1 to B2) for each student</li>
      <li><b>Weekly quiz</b> on Days 5, 12, 18 and 26</li>
      <li><b>Mid-programme tests</b> on Day 14 (English) and Day 15 (Korean); <b>final tests</b> on Day 28 (English) and Day 29 (Korean)</li>
    </ul>
    <ul class="dot">
      <li><b>Mock scholarship interviews</b> on Days 12, 19 and 26, final mock interviews on Day 28, all with written feedback</li>
      <li><b>One evening a week:</b> presentation or debate night</li>
      <li><b>Attendance and notes</b> in the tracker after every session</li>
    </ul>
  </div>
</section>

<section class="keep pagebreak">
  <h2>A normal day</h2>
  <p style="margin-bottom:2.5mm">Each day has two sessions, usually one English and one Korean. On Wednesdays, Thursdays and Saturdays English is in the morning with Anna; on other days English is in the afternoon. Days {daylist(KR_ONLY)} are all-Korean days. Days 1, 4, 5, 14 and 28 are all-English (foundation and tests).</p>
  <table><thead><tr><th style="width:18%">Time</th><th>Session</th><th style="width:22%">Language</th></tr></thead><tbody>{day_html}</tbody></table>
</section>

<section class="keep">
  <h2>The weeks</h2>
  <table><thead><tr><th style="width:13%">Week</th><th style="width:30%">English</th><th style="width:22%">Korean (suggested)</th><th>Key days</th></tr></thead><tbody>{weeks_html}</tbody></table>
</section>

<section class="keep pagebreak">
  <h2>Who teaches what</h2>
  <table><thead><tr><th style="width:21%">Teacher</th><th>Sessions</th><th style="width:22%">When</th><th class="num" style="width:9%">Total</th></tr></thead><tbody>{team_html}</tbody></table>
  <p class="small" style="margin-top:2mm">English Teacher 1 (Anna) teaches only Wed, Thu and Sat, 9:00 to 12:00. English Teacher 2 is not available on Saturdays or in the evenings. Teacher 2's mock interviews run in a side room during the afternoon lesson, so those hours overlap with Teacher 3. English Teacher 4 is only needed as cover.</p>
</section>

<section>
  <h2>The 30 days</h2>
  <table class="plan30">{plan_head}<tbody>{''.join(rows)}</tbody></table>
  <p class="small" style="margin-top:3mm">Korean follows the 24 lessons on the EStudykorea site and the four Korean workbooks. Times and days can move during the programme: the tracker on epicielts.live always has the current plan, and every change is sent to the teachers it affects.</p>
</section>
"""

# ═══════════════════════ 4. What changed (handout) ═══════════════════════
changes = f"""<style>.compact .plan30 th, .compact .plan30 td {{ padding: .75mm 1.6mm .75mm 0; }} .compact .plan30 {{ font-size: 7.4pt; line-height: 1.28; }} .compact .band {{ padding-top: 6mm; padding-bottom: 6mm; }} .compact section {{ margin-bottom: 4mm; }}</style>
<div class="compact">
<div class="band">
  <div class="org">EPIC CAMPUS (PVT) LTD, GALLE</div>
  <h1>What changed in the timetable</h1>
  <p class="sub">Update to the course structure, 29 October 2026. Please keep this with your printed pack.</p>
  <div class="rule"></div>
</div>
<section class="keep">
  <div class="two">
    <ul class="dot">
      <li><b>Anna teaches Wed, Thu and Sat, 9:00 to 12:00</b> (12 mornings, from Wed 4 Nov). Korean is in the afternoon on those days.</li>
      <li><b>Other days:</b> Korean 8:30 to 11:30, English 1:00 to 4:30 with Teacher 3.</li>
      <li><b>All-Korean days:</b> {daylist(KR_ONLY)}.</li>
    </ul>
    <ul class="dot">
      <li><b>Week 1 grammar foundation</b> is now Days 1, 4 and 5 with English Teacher 2.</li>
      <li><b>Korean</b> follows the 24 EStudykorea lessons and the four Korean workbooks.</li>
      <li><b>Tests and interviews:</b> English mid test Day 14, final Day 28. Mock interviews Days 12, 19, 26 and the final round on Day 28.</li>
    </ul>
  </div>
</section>
<section>
  <h2>The new timetable</h2>
  <table class="plan30">{plan_head}<tbody>{''.join(rows)}</tbody></table>
  <p class="small" style="margin-top:2mm">Still to confirm: Day 1 afternoon with English Teacher 2 (a Friday). The tracker on epicielts.live always shows the latest version.</p>
</section>
</div>
"""

# ═══════════════════════ 3. English level guide ═══════════════════════
def lesson(skill, title, meta, aim, body):
    m = ''.join(f'<span>{E(x)}</span>' for x in meta)
    return f"""<section class="pagebreak">
  <div class="lesson-head"><div><div class="skill">{skill}</div><h2>{E(title)}</h2></div><div class="meta">{m}</div></div>
  <p class="lead" style="margin-bottom:4mm">{aim}</p>
  {body}
</section>"""

level = f"""
<div class="band">
  <div class="org">EPIC CAMPUS (PVT) LTD, GALLE</div>
  <h1>English level guide for teachers</h1>
  <p class="sub">Where our students start, where they should finish, and four sample lessons at the right level</p>
  <div class="rule"></div>
</div>

<section>
  <p class="lead">Most students arrive with basic English: they know common words and simple sentences but freeze when they have to speak. By Day 30 they should reach a confident <b>A2</b>. Teach to that target: short, clear language, lots of practice, and real situations they will meet in Korea.</p>
</section>

<section class="keep">
  <h2>Start and finish, skill by skill</h2>
  <table>
    <thead><tr><th style="width:14%">Skill</th><th style="width:43%">On Day 1 most students can</th><th>By Day 30 they should be able to</th></tr></thead>
    <tbody>
      <tr class="en"><td><b>Speaking</b></td><td>Say their name, age and home town in short phrases; answer yes/no questions</td><td>Talk for one to two minutes about themselves, their plans and past experiences; answer interview questions with a reason</td></tr>
      <tr class="en"><td><b>Listening</b></td><td>Follow slow, clear speech about familiar things when it is repeated</td><td>Catch names, numbers, times and places in a short conversation at normal classroom speed</td></tr>
      <tr class="en"><td><b>Reading</b></td><td>Read short sentences with familiar words</td><td>Read a 200-word text about everyday life and find specific information</td></tr>
      <tr class="en"><td><b>Writing</b></td><td>Write simple sentences with mistakes in verbs and articles</td><td>Write 80 to 150 words: a short email, a paragraph about their routine, a personal statement</td></tr>
    </tbody>
  </table>
</section>

<section class="keep pagebreak">
  <h2>Teaching at this level</h2>
  <div class="two">
    <ul class="tick">
      <li><b>Short instructions.</b> One step at a time, then show an example before students start.</li>
      <li><b>Check, don’t ask “Do you understand?”</b> Ask a quick question instead: “Do you write or speak first?”</li>
      <li><b>Students talk most.</b> Aim for pairs and small groups for at least half of each lesson.</li>
    </ul>
    <ul class="tick">
      <li><b>Write new words on the board</b> with an example sentence and the word stress marked.</li>
      <li><b>Avoid idioms and slang</b> until the last week; speak slowly but naturally.</li>
      <li><b>Correct gently.</b> Repeat the sentence correctly and let the student say it again.</li>
    </ul>
  </div>
</section>

<section class="keep">
  <h2>Mistakes you will hear often</h2>
  <table>
    <thead><tr><th style="width:30%">What students say</th><th style="width:30%">Correct form</th><th>What to practise</th></tr></thead>
    <tbody>
      <tr><td>She teacher.</td><td>She <b>is</b> a teacher.</td><td>The verb <i>be</i> and articles</td></tr>
      <tr><td>Where you are going?</td><td>Where <b>are you</b> going?</td><td>Question word order</td></tr>
      <tr><td>My brother, she is a doctor.</td><td>My brother, <b>he</b> is a doctor.</td><td>he / she</td></tr>
      <tr><td>Yesterday I go to Galle.</td><td>Yesterday I <b>went</b> to Galle.</td><td>Past simple</td></tr>
      <tr><td>I have two sister.</td><td>I have two sister<b>s</b>.</td><td>Plural -s</td></tr>
      <tr><td>“wery” for very, “vindow” for window</td><td>/v/ and /w/ sounds</td><td>Pronunciation drills with minimal pairs</td></tr>
    </tbody>
  </table>
</section>
""" + lesson('Speaking', 'Talking about my family', ['Sample lesson', '30 minutes', 'Pairs'],
 'Students describe their family in four or five connected sentences, using <i>have / has</i> and <i>my / his / her</i>.',
 """
<div class="two">
 <div>
  <h3>Steps</h3>
  <ol class="steps">
   <li><b>Warm-up (3 min).</b> Draw your own family tree on the board. Students ask: “Who is this?”</li>
   <li><b>Language (7 min).</b> Board: <i>I have…</i> / <i>She has…</i> / <i>His name is…</i> / <i>She works as…</i>. Drill each one.</li>
   <li><b>Model (5 min).</b> Read the model answer twice. Students count how many people are in the family.</li>
   <li><b>Pair task (10 min).</b> Each student draws their family and talks for one minute. The partner asks two questions.</li>
   <li><b>Share (5 min).</b> Three students tell the class one thing about their partner’s family.</li>
  </ol>
 </div>
 <div>
  <h3>Questions for the partner</h3>
  <ul class="dot">
   <li>How many brothers and sisters do you have?</li>
   <li>What does your father / mother do?</li>
   <li>Who are you closest to? Why?</li>
   <li>Does anyone in your family speak English?</li>
  </ul>
  <h3 style="margin-top:4mm">What A2 sounds like</h3>
  <div class="model">There are five people in my family. My father is a farmer and my mother is a teacher. I have one brother and one sister. My brother is older than me; he works in Colombo. I am closest to my sister because we share a room and we talk every night.</div>
 </div>
</div>
<section class="keep" style="margin-top:5mm">
 <h3>Quick check (score 1 to 3 for each)</h3>
 <table><thead><tr><th style="width:22%">Area</th><th>1 needs work</th><th>2 getting there</th><th>3 ready</th></tr></thead><tbody>
  <tr><td><b>Fluency</b></td><td>Single words, long pauses</td><td>Short sentences, some pauses</td><td>Keeps going for a minute</td></tr>
  <tr><td><b>Accuracy</b></td><td><i>be</i> and <i>have</i> often missing</td><td>Some errors with he / she</td><td>Few errors, all clear</td></tr>
  <tr><td><b>Vocabulary</b></td><td>Only mother, father</td><td>Most family words</td><td>Adds jobs and describing words</td></tr>
  <tr><td><b>Pronunciation</b></td><td>Hard to follow</td><td>Clear with effort</td><td>Easy to follow</td></tr>
 </tbody></table>
</section>
""") + lesson('Writing', 'My daily routine', ['Sample lesson', '40 minutes', 'Individual'],
 'Students write a 60 to 80 word paragraph about a normal day, using the present simple, times and two frequency words.',
 """
<div class="two">
 <div>
  <h3>Steps</h3>
  <ol class="steps">
   <li><b>Brainstorm (5 min).</b> Students list six things they do every day, with the time.</li>
   <li><b>Study the model (8 min).</b> Underline the times, circle the frequency words (<i>always, usually, never</i>).</li>
   <li><b>Fix it (7 min).</b> In pairs, find and correct the five mistakes in the weak answer.</li>
   <li><b>Write (15 min).</b> 60 to 80 words. Start with “On a normal day, I…”.</li>
   <li><b>Check (5 min).</b> Swap with a partner and use the checklist.</li>
  </ol>
  <h3 style="margin-top:4mm">Checklist</h3>
  <ul class="tick">
   <li>60 to 80 words</li>
   <li>At least four times (<i>at 6 o’clock</i>)</li>
   <li>Two frequency words in the right place</li>
   <li><i>-s</i> on he / she verbs if they write about family</li>
   <li>A capital letter and a full stop in every sentence</li>
  </ul>
 </div>
 <div>
  <h3>Model answer (A2)</h3>
  <div class="model">On a normal day, I get up at half past five. I have a shower and eat breakfast with my family. At seven o’clock I take the bus to class. I study English one day and Korean the next. I have lunch at half past eleven. In the evening I help my mother cook dinner. I never go to bed late because I always get up early. (67 words)</div>
  <h3 style="margin-top:4mm">Weak answer: find five mistakes</h3>
  <div class="weak">In normal day, I wake up 5.30. I eating breakfast and I go to class by the bus. My sister go to school also. I study always English in morning.</div>
  <div class="answers"><b>Answers:</b> On a normal day; wake up <b>at</b> 5.30; I <b>eat</b>; my sister <b>goes</b>; I <b>always study</b> English in <b>the</b> morning (also: “by bus”, no “the”)</div>
 </div>
</div>
""") + lesson('Listening', 'At the university office', ['Sample lesson', '30 minutes', 'Whole class'],
 'Students catch names, numbers, dates and places in a short conversation, the same skill they will need on arrival in Korea.',
 """
<div class="two">
 <div>
  <h3>Steps</h3>
  <ol class="steps">
   <li><b>Before (5 min).</b> Ask: “What do you need to tell a university office when you arrive?” Write ideas on the board.</li>
   <li><b>Listen for the main idea (5 min).</b> Read the script once at normal speed. Ask: “What does the student want?”</li>
   <li><b>Listen for details (10 min).</b> Students read the form first, then you read the script again. They fill the gaps.</li>
   <li><b>Check (5 min).</b> Students compare in pairs, then you read the script a third time if needed.</li>
   <li><b>Role-play (5 min).</b> Pairs act it out with their own details.</li>
  </ol>
  <h3 style="margin-top:4mm">Student form: fill the gaps</h3>
  <table><tbody>
   <tr><td style="width:45%">Family name</td><td>1 ______________</td></tr>
   <tr><td>Country</td><td>Sri Lanka</td></tr>
   <tr><td>Course</td><td>2 ______________</td></tr>
   <tr><td>Arrival date</td><td>3 ______ March</td></tr>
   <tr><td>Dormitory building</td><td>4 Building ______</td></tr>
   <tr><td>Phone number</td><td>5 010 ______ 2817</td></tr>
  </tbody></table>
 </div>
 <div>
  <h3>Script: read aloud</h3>
  <div class="script">
   <p><span class="who">Officer:</span> Good morning. How can I help you?</p>
   <p><span class="who">Student:</span> Hi. I’m a new student from Sri Lanka. I need to register for my dormitory.</p>
   <p><span class="who">Officer:</span> Of course. What’s your family name?</p>
   <p><span class="who">Student:</span> It’s Perera. P-E-R-E-R-A.</p>
   <p><span class="who">Officer:</span> Thank you. And which course are you on?</p>
   <p><span class="who">Student:</span> The Korean language course. Then Business next year.</p>
   <p><span class="who">Officer:</span> When did you arrive?</p>
   <p><span class="who">Student:</span> On the fourteenth of March.</p>
   <p><span class="who">Officer:</span> OK. Your room is in Building C, on the third floor. Can I have your phone number?</p>
   <p><span class="who">Student:</span> Yes, it’s zero one zero, five five six three, two eight one seven.</p>
   <p><span class="who">Officer:</span> Great. Here is your key. Welcome!</p>
  </div>
  <div class="answers"><b>Answers:</b> 1 Perera; 2 Korean language (course); 3 14; 4 C; 5 5563. <b>Main idea:</b> to register for the dormitory.</div>
 </div>
</div>
""") + lesson('Reading', 'A first week in Korea', ['Sample lesson', '35 minutes', 'Individual, then pairs'],
 'Students read a 190-word text and find specific information, including the difference between False and Not given.',
 """
<div class="two">
 <div>
  <h3>Before reading: teach these words</h3>
  <ul class="dot">
   <li><b>dormitory</b>: a building where students live</li>
   <li><b>homesick</b>: sad because you miss home</li>
   <li><b>transport card</b>: a card you use on buses and trains</li>
   <li><b>classmate</b>: a student in your class</li>
  </ul>
  <h3 style="margin-top:4mm">Text</h3>
  <div class="script">
   <p>Last March, Amaya flew from Colombo to Seoul to start her Korean language course. The flight was long, and she arrived late at night, but a student from the university met her at the airport.</p>
   <p>On her first day, Amaya opened a bank account and bought a transport card. The buses were clean and on time, but she got lost twice because she could not read all the signs. Her dormitory room was small, and she shared it with a student from Vietnam.</p>
   <p>Classes started on Wednesday. There were fifteen students in her class, from eight different countries, and they used Korean and English to talk to each other. By Friday, Amaya felt a little homesick, so she called her family and cooked rice and curry for her new classmates. They loved it, and now they cook together every weekend.</p>
  </div>
 </div>
 <div>
  <h3>Questions</h3>
  <p class="small" style="margin-bottom:2mm">1 to 4: write True, False or Not given.</p>
  <ol class="steps">
   <li>Amaya arrived in Seoul in the morning.</li>
   <li>Someone from the university met her at the airport.</li>
   <li>Amaya’s roommate studies Business.</li>
   <li>There were students from eight countries in her class.</li>
   <li>What two things did Amaya do on her first day?</li>
   <li>What did she do when she felt homesick?</li>
  </ol>
  <h3 style="margin-top:4mm">Teaching tip</h3>
  <p class="muted">Spend time on question 3. <b>False</b> means the text says the opposite. <b>Not given</b> means the text does not say. The text never mentions what the roommate studies, so the answer is Not given.</p>
  <div class="answers"><b>Answers:</b> 1 False (late at night); 2 True; 3 Not given; 4 True; 5 opened a bank account and bought a transport card; 6 called her family and cooked rice and curry for her classmates</div>
 </div>
</div>
""")

DOCS = [
    ('1-Teacher-Proposal', 'Teacher proposal', proposal),
    ('2-Course-Structure', 'Course structure', structure),
    ('3-English-Level-Guide', 'English level guide', level),
    ('4-What-Changed-29-Oct', 'What changed (29 Oct)', changes),
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server', '--allow-file-access-from-files'])
        page = await b.new_page()
        for fname, title, body in DOCS:
            path = S + 'print/' + fname + '.html'
            open(path, 'w').write(doc(title, body))
            await page.goto('file://' + path)
            await page.wait_for_timeout(600)
            await page.evaluate('document.fonts.ready')
            await page.pdf(path=OUT + fname + '.pdf', format='A4', print_background=True, prefer_css_page_size=True,
                           display_header_footer=True, header_template='<span></span>', footer_template=FOOT.format(title=title),
                           margin={'top': '16mm', 'bottom': '18mm', 'left': '16mm', 'right': '16mm'})
            print('built', fname)
        await b.close()

asyncio.run(main())
print('EN', EN_H, 'KR', KR_H, 'T1', H('EN_MORNING'), 'last', T1_LAST, 'days', len(T1_DAYS))
