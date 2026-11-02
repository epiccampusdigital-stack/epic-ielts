import sys, asyncio, os
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
from playwright.async_api import async_playwright
OUT = '/home/claude/deliverables/Timetables/'; os.makedirs(OUT, exist_ok=True)
EN, KR, EV = 'en', 'kr', 'ev'
# (day label, date, morning, afternoon, evening); each cell is a list of (time, text, kind, teacher)
S = ('12:00 to 1:00', 'Study time (self-study with campus staff)', 'ev', 'Campus staff')
IT = ('4:30 to 5:30', 'IT lab: Korean practice', KR, 'Korean Teacher 2')
def kr(topic, t='2:30 to 4:30'): return (t, topic, KR, 'Korean Teacher 2')
def sir(topic): return ('9:00 to 12:00', topic, EN, 'Sir')
def anna(topic): return ('9:00 to 12:00', topic, EN, 'Anna (Sir sits in)')
D = [
 ('Mon', '2 Nov', 'Day 4', [('8:30 to 10:15', 'English placement test (IT lab)', EN, 'Sir + campus staff'), ('10:30 to 11:30', 'English: parts of speech (and speaking check, one by one)', EN, 'Sir')],
  [kr('Korean: Hangul 5'), IT], []),
 ('Tue', '3 Nov', 'Day 5', [('9:00 to 1:00', 'Korean: tute lessons and revision', KR, 'Korean Teacher 1')], [kr('Korean: tute lessons and revision'), IT], []),
 ('Wed', '4 Nov', 'Day 6', [anna('English activity morning: meet and greet'), S], [kr('Korean tute exam'), IT], []),
 ('Thu', '5 Nov', 'Day 7', [anna('English activity morning: my home and my town'), S], [kr('Korean: Hangul 6'), IT], []),
 ('Fri', '6 Nov', 'Day 8', [sir('English: sentence patterns'), S], [kr('Korean: review Hangul 1 to 6 and writing'), IT], []),
 ('Sat', '7 Nov', 'Day 9', [anna('English activity morning: cafe, market and menu'), S], [kr('Korean: Hangul 7'), IT], []),
 ('Sun', '8 Nov', 'Day 10', [sir('English: pronouns and prepositions'), S], [kr('Korean: Hangul 8'), IT], []),
]
CSS = render.fonts_css() + """
@page { size: A4 landscape; margin: 10mm; }
* { box-sizing: border-box; } body { font-family: 'Source Sans Pro', SSP, sans-serif; color: #1a2540; margin: 0; font-size: 8.5pt; }
.head { background: #002761; color: #fff; padding: 3.5mm 6mm; border-radius: 3mm; margin-bottom: 3mm; }
.head .top { font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: #9fc2ff; } h1 { margin: 0; font-size: 16pt; } .sub { color: #cfe0ff; font-size: 9.5pt; margin-top: 1mm; }
table { width: 100%; border-collapse: collapse; } th { background: #eef3fb; text-align: left; padding: 2.2mm 2.5mm; font-size: 9pt; color: #0b3a8c; border-bottom: 1.5px solid #0056d2; }
td { padding: 1.2mm 2mm; vertical-align: top; border-bottom: 1px solid #dfe6f2; } td.day { width: 22mm; font-weight: 700; } td.day small { display: block; font-weight: 400; color: #5b6780; }
.c { border-left: 3px solid #0056d2; padding-left: 2mm; margin-bottom: 0.8mm; } .c.kr { border-color: #1e9e5a; } .c.ev { border-color: #b8860b; }
.c b { color: #5b6780; font-weight: 600; font-size: 8.5pt; display: block; } .c.en b { color: #0056d2; } .c.kr b { color: #1e9e5a; } .c i { font-style: normal; font-size: 8pt; color: #5b6780; }
.note { margin-top: 3mm; padding: 3mm 4mm; background: #f4f7fc; border-radius: 2mm; font-size: 9pt; line-height: 1.5; } .legend span { display:inline-block; margin-right: 5mm; } .legend b { padding: 0 2mm; border-radius: 1mm; color:#fff; } 
"""
def cell(items, teacher):
    return ''.join(f"<div class='c {k}'><b>{t}</b>{x}{(' <i>· ' + w + '</i>') if teacher else ''}</div>" for t, x, k, w in items) or '<span style="color:#9aa7bd">No class</span>'
def html(title, sub, teacher):
    rows = ''.join(f"<tr><td class='day'>{d}<small>{dt} · {dn}</small></td><td>{cell(m, teacher)}</td><td>{cell(a, teacher)}</td></tr>" for d, dt, dn, m, a, e in D)
    return f"""<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>
<div class='head'><div class='top'>EPIC Campus · Korea Scholarship Programme</div><h1>{title}</h1><div class='sub'>{sub}</div></div>
<table><thead><tr><th>Day</th><th style='width:44%'>Morning (9:00 to 1:00)</th><th>Afternoon (2:30 to 5:30)</th></tr></thead><tbody>{rows}</tbody></table>
<div class='note'><div class='legend'><span><b style='background:#0056d2'>English</b></span><span><b style='background:#1e9e5a'>Korean</b></span><span><b style='background:#b8860b'>Study time</b></span></div>
Lunch 1:00 to 2:30. Tea breaks are inside each class. No evening classes.
{'Sir sits in on all of Anna\'s mornings and helps. He does not teach during her class.' if teacher else 'This is Week 1 only. Week 2 will be sent when it is confirmed.'}
</div></body></html>"""
async def go():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page()
        for fn, title, sub, teacher in [('Week 1 timetable - Students.pdf', 'Week 1 timetable', 'Monday 2 November to Sunday 8 November 2026 · Days 4 to 10', False),
                                        ('Week 1 timetable - Teachers.pdf', 'Week 1 timetable: teachers', 'Monday 2 November to Sunday 8 November 2026 · Days 4 to 10 · who teaches what', True)]:
            open('/tmp/tt.html', 'w').write(html(title, sub, teacher)); await pg.goto('file:///tmp/tt.html'); await pg.wait_for_timeout(200)
            await pg.pdf(path=OUT + fn, format='A4', landscape=True, scale=0.82, print_background=True, margin={'top': '10mm', 'bottom': '10mm', 'left': '10mm', 'right': '10mm'})
        await b.close()
asyncio.run(go())
