# Anna's week 1 pack: front sheet + teacher notes and student sheet for her three activity mornings.
import sys, asyncio, os, importlib.util
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
OUT = '/home/claude/deliverables/Anna/'
sp = importlib.util.spec_from_file_location('a1', SC + 'papers/pending/a1_anna_week1_easy.py'); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
L = m.LESSONS
front = render.page('Anna: week 1', f"""
<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Week 1</span></div>
<h1>Your first three mornings</h1><div class='sub'>Wednesday, Thursday and Saturday, 9:00 to 12:00. After your class, 12:00 to 1:00 is study time, lunch is 1:00 to 2:30, and Korean is in the afternoon. Activity mornings: about 20 minutes of explaining, the rest is doing.</div></div>
<div class='block'><h2>The three mornings</h2><table class='steps'><tbody>
<tr><td class='t'>Day 6 Wed</td><td class='s'>Meet and greet</td><td>Name games, find someone who, interview a partner, introduce them to the room, two truths and a lie.</td></tr>
<tr><td class='t'>Day 7 Thu</td><td class='s'>My home and my town</td><td>Describe and draw, town map info gap, a campus walk with missions.</td></tr>
<tr><td class='t'>Day 9 Sat</td><td class='s'>Cafe, market and menu</td><td>Food bingo, cafe and market role plays, team menu challenge.</td></tr></tbody></table></div>
<div class='block'><h2>How every morning runs</h2><div class='note'><ul>
<li><b>9:00 to 10:30</b> Warm-up game, a short mini-lesson with the sentence frames, then the main activity.</li>
<li><b>10:30 to 10:45</b> Tea break.</li>
<li><b>10:45 to 12:00</b> Speaking mission in pairs and teams, then a quick quiz and exit ticket.</li>
<li>The students are about 20 years old. Keep it active: standing, moving, competing, working in pairs and teams.</li></ul></div></div>
<div class='block'><h2>Ground rules</h2><div class='note'><ul>
<li>Aim for about 70 percent student talk. No long grammar lectures: the key sentences are on the page as frames.</li>
<li>Do not correct mistakes while students are speaking. Note them and put 3 or 4 on the board at the end.</li>
<li>Sir sits in and helps pairs and groups. He does not teach during your morning.</li>
<li>Sir teaches the grammar on his own days. Your activities only use the sentence frames given on the page.</li>
<li>Each lesson has your plan page, then the student sheet. Print one student sheet per student.</li></ul></div></div>
""")
async def go():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page()
        parts = []
        docs = []
        for x in L:
            docs.append((f'd{x["day"]}s', render.student_html(x).replace("<div class='namebar'><div>Name</div><div>Date</div></div>", "<div class='namebar'><div>Name</div></div>"), f'Day {x["day"]} · Student sheet'))
        for name, doc, lab in docs:
            tmp = SC + 'books/tmp_anna.html'; open(tmp, 'w').write(doc)
            await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_{name}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>',
                         footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · Student copy · ' + lab), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
        w = PdfWriter()
        for f in parts:
            for pgx in PdfReader(f).pages: w.add_page(pgx)
        os.makedirs(OUT, exist_ok=True)
        w.write(OUT + 'Anna - Week 1 student copy.pdf')
        print(len(w.pages), 'pages')
asyncio.run(go())
