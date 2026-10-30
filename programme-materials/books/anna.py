# Anna's pack: 1 fee breakdown, 2 her schedule, 3 course structure, 4 everything she teaches in one PDF.
import sys, shutil, asyncio, json
sys.path.insert(0, '/tmp/epicwork/papers')
import render
from common import *

OUTA = '/home/claude/deliverables/Anna/'
os.makedirs(OUTA, exist_ok=True)
plan = json.load(open(S + 'plan.json'))
SES = plan['sessions']
DAYS = sorted({x['dayNumber'] for x in SES if x.get('teacher') == 'EN_MORNING'})
assert len(DAYS) == 12
RATE, HOURS, TRANSPORT = 1800, 3, 2600
fee = len(DAYS) * HOURS * RATE
trans = len(DAYS) * TRANSPORT
assert fee == 64800 and trans == 31200
def lkr(n): return f"LKR {n:,}"
def dlong(d): return (START + dt.timedelta(days=d - 1)).strftime('%A %-d %B')

ACSS = """
.band { background: #002761; color: #fff; border-radius: 4mm; padding: 8mm 9mm; margin-bottom: 6mm; }
.band .org { font-size: 8.5pt; letter-spacing: .16em; font-weight: 600; color: #c9d6ec; }
.band h1 { margin: 2mm 0 0; font-size: 24pt; line-height: 1.1; }
.band p { margin: 2mm 0 0; color: #c9d6ec; }
table.t { width: 100%; border-collapse: collapse; font-size: 10pt; }
table.t th { text-align: left; font-size: 7.8pt; color: #5b6780; text-transform: uppercase; letter-spacing: .05em; border-bottom: .5mm solid #0056d2; padding: 1.8mm 2mm; }
table.t td { padding: 1.6mm 2mm; border-bottom: .3mm solid #dae1ed; vertical-align: top; }
table.t td.num { text-align: right; white-space: nowrap; }
table.t tr.total td { font-weight: 700; font-size: 11.5pt; border-top: .5mm solid #002761; border-bottom: none; }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-bottom: 6mm; }
.fact { border: .3mm solid #dae1ed; border-radius: 2.5mm; padding: 2.5mm 3.5mm; background: #f7f9fc; }
.fact .k { font-size: 7.6pt; color: #5b6780; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.fact .v { font-size: 12pt; font-weight: 700; color: #002761; }
h2.s { font-size: 13pt; color: #002761; margin: 6mm 0 2.5mm; display: block; }
.sign { display: grid; grid-template-columns: 1fr 1fr; gap: 14mm; margin-top: 12mm; }
.sign div { border-top: .3mm solid #0f1114; padding-top: 1.5mm; font-size: 8.6pt; color: #5b6780; }
.small { font-size: 9pt; color: #5b6780; }
.pill { display: inline-block; border-radius: 6mm; padding: .3mm 2.5mm; font-size: 8pt; font-weight: 700; background: #e8eef7; color: #0056d2; }
.pill.t { background: #fde8ef; color: #b3194f; }
"""
HEAD = lambda title, sub: f"<div class='band'><div class='org'>EPIC CAMPUS (PVT) LTD, GALLE · KOREA SCHOLARSHIP PROGRAMME 2026</div><h1>{title}</h1><p>{sub}</p></div>"

def session_text(d):
    xs = [x for x in SES if x['dayNumber'] == d and x.get('teacher') == 'EN_MORNING']
    out = []
    for x in xs:
        t = x['title'].replace('English: ', '')
        desc = (x.get('description') or '')
        desc = desc.split(' English workbook')[0]
        out.append(f"<b>{x['startTime'][1:] if x['startTime'][0] == '0' else x['startTime']} {e(t)}</b>{(': ' + e(desc)) if desc and 'workbook' not in desc else ''}")
    return '<br>'.join(out)

def book_for(d): return 2 if d <= 13 else 3 if d <= 22 else 4

async def html_pdf(doc, path, label):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server', '--allow-file-access-from-files'])
        pg = await b.new_page()
        open(HERE + 'tmp_anna.html', 'w').write(doc)
        await pg.goto('file://' + HERE + 'tmp_anna.html'); await pg.wait_for_timeout(400); await pg.evaluate('document.fonts.ready')
        await pg.pdf(path=path, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>',
                     footer_template=FOOT.format(label=e(label)), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
        await b.close()

# ---------- 1. Fee breakdown ----------
rows = ''.join(f"<tr><td>{i+1}</td><td>Day {d}</td><td>{dlong(d)}</td><td>9:00 to 12:00</td><td class='num'>{HOURS}</td><td class='num'>{lkr(HOURS*RATE)}</td><td class='num'>{lkr(TRANSPORT)}</td><td class='num'>{lkr(HOURS*RATE+TRANSPORT)}</td></tr>" for i, d in enumerate(DAYS))
fee_doc = page("<style>.band{padding:6mm 8mm;margin-bottom:4mm} .facts{margin-bottom:3mm} table.t td{padding:1.15mm 2mm} h2.s{margin:3mm 0 2mm}</style>" + HEAD('Teaching fee: English Teacher 1', 'For Anna · English mornings, Wednesday, Thursday and Saturday, 4 to 28 November 2026') + f"""
<div class='facts'><div class='fact'><div class='k'>Sessions</div><div class='v'>{len(DAYS)} mornings</div></div>
<div class='fact'><div class='k'>Hours</div><div class='v'>{len(DAYS)*HOURS} hours</div></div>
<div class='fact'><div class='k'>Rate</div><div class='v'>{lkr(RATE)} / hour</div></div>
<div class='fact'><div class='k'>Total</div><div class='v'>{lkr(fee+trans)}</div></div></div>
<h2 class='s'>Summary</h2>
<table class='t'><thead><tr><th>Item</th><th>Calculation</th><th style='text-align:right'>Amount</th></tr></thead><tbody>
<tr><td>Teaching fee</td><td>{len(DAYS)} sessions × {HOURS} hours × {lkr(RATE)} an hour ({lkr(HOURS*RATE)} a session)</td><td class='num'>{lkr(fee)}</td></tr>
<tr><td>Transport</td><td>{len(DAYS)} days × {lkr(TRANSPORT)} a day</td><td class='num'>{lkr(trans)}</td></tr>
<tr class='total'><td>Total</td><td></td><td class='num'>{lkr(fee+trans)}</td></tr></tbody></table>
<h2 class='s' style='margin-top:4mm'>Session by session</h2>
<table class='t'><thead><tr><th>#</th><th>Day</th><th>Date</th><th>Time</th><th style='text-align:right'>Hours</th><th style='text-align:right'>Fee</th><th style='text-align:right'>Transport</th><th style='text-align:right'>Total</th></tr></thead><tbody>{rows}
<tr class='total'><td colspan='4'>Total</td><td class='num'>{len(DAYS)*HOURS}</td><td class='num'>{lkr(fee)}</td><td class='num'>{lkr(trans)}</td><td class='num'>{lkr(fee+trans)}</td></tr></tbody></table>
<p class='small' style='margin-top:4mm'>Payment method and dates: ____________________________________________</p>
<div class='sign'><div>Ishara Madhusanka, Founder &amp; Managing Director, Epic Campus (Pvt) Ltd</div><div>Anna · signature and date</div></div>""", 'en-book', ACSS)

# ---------- 2. Her schedule ----------
srows = ''
for d in DAYS:
    srows += (f"<tr><td><b>Day {d}</b></td><td>{dlong(d)}</td><td>{session_text(d)}</td>"
              f"<td>{'English workbook ' + str(book_for(d)) if not any(k in session_text(d) for k in ('test', 'presentations')) else ('Test papers (given on the day)' if 'test' in session_text(d) else 'Presentation rubric (teaching pack)')}</td></tr>")
sched_doc = page(HEAD("Anna's teaching schedule", 'English Teacher 1 · Korea Scholarship Programme, 4 to 28 November 2026') + f"""
<div class='facts'><div class='fact'><div class='k'>Days</div><div class='v'>Wed, Thu, Sat</div></div>
<div class='fact'><div class='k'>Time</div><div class='v'>9:00 to 12:00</div></div>
<div class='fact'><div class='k'>First day</div><div class='v'>Wed 4 Nov</div></div>
<div class='fact'><div class='k'>Last day</div><div class='v'>Sat 28 Nov</div></div></div>
<h2 class='s'>Every morning</h2>
<table class='t'><tbody><tr><td style='width:30mm'><b>8:50</b></td><td>Arrive, sign in, take attendance in the tracker (on your phone or the office PC)</td></tr>
<tr><td><b>9:00 to 10:30</b></td><td>Grammar and writing</td></tr><tr><td><b>10:30 to 10:45</b></td><td>Tea break</td></tr>
<tr><td><b>10:45 to 12:00</b></td><td>Speaking practice on the same theme</td></tr>
<tr><td><b>12:00</b></td><td>Finish. Write one or two lines in the tracker: what you covered and who needs help.</td></tr></tbody></table>
<h2 class='s'>Your 12 mornings</h2>
<table class='t'><thead><tr><th style='width:14mm'>Day</th><th style='width:38mm'>Date</th><th>What you teach</th><th style='width:36mm'>Materials</th></tr></thead><tbody>{srows}</tbody></table>
<p class='small' style='margin-top:4mm'>The same themes are taught in the afternoon by English Teacher 3 (reading and listening), usually the next English afternoon, so students meet each theme twice. Teacher notes and student worksheets for every morning are in your teaching pack. You receive a WhatsApp reminder the evening before and 30 minutes before each session. Contact: WhatsApp +94 77 764 4946.</p>""", 'en-book', ACSS)

# ---------- 4. Teaching pack ----------
lessons = render.load_all()
mine = []
for L in lessons:
    if not L.get('day') or L['day'] not in DAYS:
        continue
    if L['folder'] in ('Writing', 'Speaking') or (L['folder'] == 'Tests' and 'part A' in L['kind']):
        mine.append(L)
mine.sort(key=lambda L: (L['day'], 0 if L['folder'] in ('Writing', 'Tests') else 1))
crow = ''.join(f"<tr><td><b>Day {L['day']}</b></td><td>{(START + dt.timedelta(days=L['day']-1)).strftime('%a %-d %b')}</td><td>{e(L['time'].split(' (')[0])}</td><td>{render.rich(L['title'])}</td><td>{e(L['kind'])}</td></tr>" for L in mine)
crow += f"<tr><td><b>Day 30</b></td><td>Sat 28 Nov</td><td>9:00 to 12:00</td><td>Final English presentations</td><td>Plan + rubric (last page)</td></tr>"
pack_front = page(HEAD("Anna's teaching pack", 'Everything you teach, in order: teacher notes, then the student worksheet, for each lesson') + f"""
<table class='t'><thead><tr><th>Day</th><th>Date</th><th>Time</th><th>Lesson</th><th>Type</th></tr></thead><tbody>{crow}</tbody></table>
<p class='small' style='margin-top:4mm'>Students have the same worksheets in their English workbooks, so you do not need to print copies for them. Answers are in your teacher notes.</p>""", 'en-book', ACSS)
grad = page(HEAD('Day 30 · Final English presentations', 'Saturday 28 November · 9:00 to 12:00 · graduation day') + """
<h2 class='s'>Plan</h2><table class='t'><tbody>
<tr><td style='width:30mm'><b>9:00 to 9:20</b></td><td>Warm-up: students practise their talk in pairs, once each.</td></tr>
<tr><td><b>9:20 to 10:30</b></td><td>Presentations, part 1: each student gives a 2 to 3 minute talk, "My plan for Korea", then answers one question from the class.</td></tr>
<tr><td><b>10:30 to 10:45</b></td><td>Tea break</td></tr>
<tr><td><b>10:45 to 11:30</b></td><td>Presentations, part 2</td></tr>
<tr><td><b>11:30 to 12:00</b></td><td>Programme review: what was hardest, what helped most. Hand back feedback slips.</td></tr></tbody></table>
<h2 class='s'>Rubric (score each student 1 to 5)</h2>
<table class='t'><thead><tr><th>Student</th><th>Clear structure</th><th>Grammar</th><th>Vocabulary</th><th>Fluency and confidence</th><th>Answer to question</th><th>Total /25</th></tr></thead><tbody>""" + "<tr>" + "<td style='height:9mm'></td>" * 7 + "</tr>" * 11 + "</tbody></table>", 'en-book', ACSS)

async def build_all():
    await html_pdf(fee_doc, OUTA + 'Anna 1 - Fee breakdown.pdf', 'Anna · fee breakdown')
    await html_pdf(sched_doc, OUTA + 'Anna 2 - Teaching schedule.pdf', 'Anna · teaching schedule')
    await html_pdf(pack_front, HERE + 'tmp_pack_front.pdf', 'Anna · teaching pack')
    await html_pdf(grad, HERE + 'tmp_pack_grad.pdf', 'Anna · teaching pack')
asyncio.run(build_all())
shutil.copy('/home/claude/deliverables/print/2-Course-Structure.pdf', OUTA + 'Anna 3 - Course structure.pdf')

w = PdfWriter()
for pg_ in PdfReader(HERE + 'tmp_pack_front.pdf').pages: w.add_page(pg_)
for L in mine:
    d = render.folder_of(L)
    for fn in ('Teacher notes.pdf', 'Student worksheet.pdf'):
        for pg_ in PdfReader(d + fn).pages: w.add_page(pg_)
for pg_ in PdfReader(HERE + 'tmp_pack_grad.pdf').pages: w.add_page(pg_)
w.write(OUTA + 'Anna 4 - Teaching pack (all her lessons).pdf')
for f in sorted(os.listdir(OUTA)):
    print(f, len(PdfReader(OUTA + f).pages))
print(len(mine), 'lessons')
