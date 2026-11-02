# Anna's week 1 pack: front sheet + teacher notes and student sheet for her three activity mornings.
import sys, asyncio, os, importlib.util
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
OUT = '/home/claude/deliverables/Anna/'
sp = importlib.util.spec_from_file_location('a1', SC + 'papers/pending/a2_anna_weeks2to4.py'); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
L = m.LESSONS
front = render.page('Anna: weeks 2 to 4', """
<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Weeks 2 to 4 (draft)</span></div>
<h1>Your remaining nine mornings</h1><div class='sub'>Draft until the week 2 to 4 timetable is confirmed. Same style as week 1: about 20 minutes of explaining, the rest is doing.</div></div>
<div class='block'><h2>The nine mornings</h2><table class='steps'><tbody>
<tr><td class='t'>Day 13</td><td class='s'>What do you do, what are you doing?</td><td>Mime, routine survey, market spot the difference.</td></tr>
<tr><td class='t'>Day 14</td><td class='s'>Quiz battle</td><td>After the mid test: team quiz, six-word stories, reflection.</td></tr>
<tr><td class='t'>Day 16</td><td class='s'>Free time and invitations</td><td>How often, invitation role plays, find a time, weekend plan.</td></tr>
<tr><td class='t'>Day 20</td><td class='s'>Last weekend and the alibi game</td><td>Past simple interviews, suspects and detectives.</td></tr>
<tr><td class='t'>Day 21</td><td class='s'>Plans and dreams</td><td>Fortune teller, plan a Korea trip, 60-second pitch.</td></tr>
<tr><td class='t'>Day 23</td><td class='s'>Compare, call and decide</td><td>Galle vs Seoul, phone call to the university, line-up debate.</td></tr>
<tr><td class='t'>Day 27</td><td class='s'>Emails and goals</td><td>Formal email, polite or rude, personal statement.</td></tr>
<tr><td class='t'>Day 28</td><td class='s'>Speed interviews</td><td>Point, reason, example; speed interviews; final English test; mock interviews.</td></tr>
<tr><td class='t'>Day 30</td><td class='s'>Final presentations</td><td>Three-minute presentations, feedback, looking back.</td></tr></tbody></table></div>
<div class='block'><h2>Ground rules (same as week 1)</h2><div class='note'><ul>
<li>9:00 to 12:00 with a tea break. About 70 percent student talk.</li>
<li>Do not correct while students speak. Put 3 or 4 common mistakes on the board at the end.</li>
<li>Sir sits in and helps. Days 14 and 28 include a test; Sir invigilates.</li>
<li>Day numbers may move once the next weeks are agreed.</li></ul></div></div>
""")
async def go():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page()
        parts = []
        docs = [('front', front, 'Anna week 1')]
        for x in L:
            docs.append((f'd{x["day"]}t', render.teacher_html(x), f'Day {x["day"]} · Teacher notes'))
            docs.append((f'd{x["day"]}s', render.student_html(x).replace("<div class='namebar'><div>Name</div><div>Date</div></div>", "<div class='namebar'><div>Name</div></div>"), f'Day {x["day"]} · Student sheet'))
        for name, doc, lab in docs:
            tmp = SC + 'books/tmp_anna.html'; open(tmp, 'w').write(doc)
            await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_{name}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>',
                         footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · Anna · ' + lab), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
        w = PdfWriter()
        for f in parts:
            for pgx in PdfReader(f).pages: w.add_page(pgx)
        os.makedirs(OUT, exist_ok=True)
        w.write(OUT + 'Anna 6 - Weeks 2 to 4 activity mornings.pdf')
        print(len(w.pages), 'pages')
asyncio.run(go())
