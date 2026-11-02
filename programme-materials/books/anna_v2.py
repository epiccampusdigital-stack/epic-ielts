# Anna week 1 v2: workbook (front, how-to, per day teacher + student) and a student copy.
import sys, asyncio, os, importlib.util
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
OUT = '/home/claude/deliverables/Anna/'
sp = importlib.util.spec_from_file_location('a1', SC + 'papers/pending/a1_anna_week1_easy.py'); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
L = m.LESSONS
H = lambda t, s: f"<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Anna</span></div><h1>{t}</h1><div class='sub'>{s}</div></div>"
front = render.page('Anna: week 1', H('Your first three mornings', 'Wednesday, Thursday and Saturday, 9:00 to 1:00. Papers on the computer, then a group activity. Everything is done seated.') + """
<div class='block'><h2>The three mornings</h2><table class='steps'><tbody>
<tr><td class='t'>Day 6 Wed</td><td class='s'>Meet Anna, reading and writing papers</td><td>Say hello. Course paper 1: Reading, then Writing. Group activity: Fix the mistake (parts of speech).</td></tr>
<tr><td class='t'>Day 7 Thu</td><td class='s'>Listening paper</td><td>Listening practice 1. Group activity: Fix the mistake (nouns, pronouns, adverbs). Learn lessons.</td></tr>
<tr><td class='t'>Day 9 Sat</td><td class='s'>Quiz and reading paper</td><td>Week 1 Quiz, Course paper 2: Reading. Group activity: Fix the mistake (sentence patterns).</td></tr></tbody></table></div>
<div class='block'><h2>How every morning runs</h2><div class='note'><ul>
<li><b>9:00 to 10:30</b> Computer papers in the IT lab.</li>
<li><b>10:30 to 10:45</b> Tea break.</li>
<li><b>10:45 to 12:00</b> Group activity: Fix the mistake, then students write their own wrong sentences for another group.</li>
<li><b>12:00 to 1:00</b> Learn lessons on the computer.</li>
<li>Lunch is 1:00 to 2:30. Korean is in the afternoon.</li></ul></div></div>
<div class='block'><h2>Rules for the computer papers</h2><div class='note'><ul>
<li>Check every student can log in with their own username and password. If not, tell campus staff.</li>
<li>Do not give answers or hints. Do not tell students their score. The system marks it.</li>
<li>Tell students: <b>Submit one time only</b>. Do not click Back.</li>
<li>Write the finish time on the board. Walk round and keep the room quiet.</li></ul></div></div>
<div class='block'><h2>Rules for the group activity</h2><div class='note'><ul>
<li>Groups of 4 at one table. Everyone stays seated.</li>
<li>Do not correct while they talk. Read the answers at the end.</li>
<li>Sir teaches the grammar. Your activity only practises it.</li></ul></div></div>
""")
games = render.page('Spare games', H('Spare games', 'All seated. Use one when a task finishes early. Each takes 5 to 10 minutes.') + """
<div class='block'><table class='steps'><tbody>
<tr><td class='s'>1. Hot seat</td><td><b>Say:</b> "One student sits with their back to the board. I write a word. The class describes it without saying it. The student guesses." Words: teacher, cafe, bank, rice, bus.</td></tr>
<tr><td class='s'>2. Word chain</td><td><b>Say:</b> "Say a word that starts with the last letter of the word before. Cat, tea, apple..." No repeats. Go round the table.</td></tr>
<tr><td class='s'>3. Alphabet game</td><td><b>Say:</b> "Pick a topic: food. One student says A, the next says B. Apple, banana, curry..."</td></tr>
<tr><td class='s'>4. Pass the sentence</td><td><b>Say:</b> "I whisper a sentence to the first student. Whisper it to your neighbour. The last student says it out loud." Compare with the first.</td></tr>
<tr><td class='s'>5. Question chain</td><td><b>Say:</b> "Ask the student next to you a question: Where are you from? They answer, then ask the next student a different question."</td></tr></tbody></table></div>
""")
sh = lambda y: render.student_html(y).replace("<div class='namebar'><div>Name</div><div>Date</div></div>", "<div class='namebar'><div>Name</div></div>")
async def build(docs, name, who):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page(); parts = []
        for k, doc, lab in docs:
            tmp = SC + 'books/tmp_anna.html'; open(tmp, 'w').write(doc)
            await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_{k}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>',
                         footer_template=render.FOOT.format(label=f'Epic Campus (Pvt) Ltd, Galle · {who} · ' + lab), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
    w = PdfWriter()
    for f in parts:
        for pgx in PdfReader(f).pages: w.add_page(pgx)
    os.makedirs(OUT, exist_ok=True); w.write(OUT + name); print(name, len(w.pages), 'pages')
async def go():
    wb = [('front', front, 'Anna week 1')]
    for x in L:
        wb.append((f'd{x["day"]}t', render.teacher_html(x), f'Day {x["day"]} · Teacher notes'))
        wb.append((f'd{x["day"]}s', sh(x), f'Day {x["day"]} · Student sheet'))
    wb.append(('games', games, 'Spare games'))
    await build(wb, 'Anna - Week 1 workbook.pdf', 'Anna')
    await build([(f'd{x["day"]}s', sh(x), f'Day {x["day"]} · Student sheet') for x in L], 'Anna - Week 1 student copy.pdf', 'Student copy')
asyncio.run(go())
