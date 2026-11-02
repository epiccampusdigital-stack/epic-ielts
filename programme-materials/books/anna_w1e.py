# Anna's week 1 pack: front sheet + teacher notes and student sheet for her three activity mornings.
import sys, asyncio, os, importlib.util
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/books')
import anna_extra as AX
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
OUT = '/home/claude/deliverables/Anna/'
sp = importlib.util.spec_from_file_location('a1', SC + 'papers/pending/a1_anna_week1_easy.py'); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
L = m.LESSONS
front = render.page('Anna: week 1', f"""
<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Week 1</span></div>
<h1>Your first three mornings</h1><div class='sub'>Wednesday, Thursday and Saturday, 9:00 to 1:00. Activities from 9:00 to 12:00, then the computer hour from 12:00 to 1:00 with you. Lunch is 1:00 to 2:30, and Korean is in the afternoon. Activity mornings: about 20 minutes of explaining, the rest is doing.</div></div>
<div class='block'><h2>The three mornings</h2><table class='steps'><tbody>
<tr><td class='t'>Day 6 Wed</td><td class='s'>Meet and greet</td><td>Name games, find someone who, interview a partner, introduce them to the room, two truths and a lie.</td></tr>
<tr><td class='t'>Day 7 Thu</td><td class='s'>My home and my town</td><td>Describe and draw, town map info gap, a campus walk with missions.</td></tr>
<tr><td class='t'>Day 9 Sat</td><td class='s'>Cafe, market and menu</td><td>Food bingo, cafe and market role plays, team menu challenge.</td></tr></tbody></table></div>
<div class='block'><h2>How every morning runs</h2><div class='note'><ul>
<li><b>9:00 to 10:30</b> Say hello, read the sentences, then the main activity.</li>
<li><b>10:30 to 10:45</b> Tea break.</li>
<li><b>10:45 to 12:00</b> More speaking in pairs and groups, then a quick quiz.</li>
<li><b>12:00 to 1:00</b> Computer hour in the IT lab. You stay with the students. Sir is not needed for this part.</li>
<li>The students are about 20 years old. Everything is done seated at the desks, in pairs and small groups. Keep it friendly and fun.</li></ul></div></div>
<div class='block'><h2>Ground rules</h2><div class='note'><ul>
<li>Aim for about 70 percent student talk. No long grammar lectures: the key sentences are on the page as frames.</li>
<li>Do not correct mistakes while students are speaking. Note them and put 3 or 4 on the board at the end.</li>
<li>Sir sits in and helps pairs and groups. He does not teach during your morning. Because the site needs a computer, you run the computer hour yourself.</li>
<li>Sir teaches the grammar on his own days. Your activities only use the sentence frames given on the page.</li>
<li>Each lesson has your plan page, then the student sheet. Print one student sheet per student.</li></ul></div></div>
""")

guide = render.page('Computer hour guide', """
<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Anna</span></div>
<h1>How to run the computer hour</h1><div class='sub'>12:00 to 1:00 on Days 6, 7 and 9, in the IT lab. You run it. Follow these steps every time.</div></div>
<div class='block'><h2>What students do on the computer</h2><table class='steps'><tbody>
<tr><td class='t'>Day 6 Wed</td><td class='s'>Learn lessons</td><td>Learn, then Week 1: Me and my world. Day 1 Hello, Day 2 Personal information, Day 3 Family. About 45 minutes.</td></tr>
<tr><td class='t'>Day 7 Thu</td><td class='s'>Writing paper</td><td>Practice, then Course paper 1 Writing: my home and my town. 40 minutes. Then Learn, Week 1, Day 4 Daily routine.</td></tr>
<tr><td class='t'>Day 9 Sat</td><td class='s'>Reading paper and quiz</td><td>Practice, then Course paper 1 Reading: home, town and food. 30 minutes. Then the Week 1 Quiz: Me and my world. 20 minutes.</td></tr></tbody></table></div>
<div class='block'><h2>Before they start (5 minutes)</h2><div class='note'><ul>
<li>Check every student has a computer and can log in with their own username and password.</li>
<li>Tell them: "Keep your page open. Do not click Back."</li>
<li>Tell them the time: "You have 40 minutes" (or 30). Write the finish time on the board.</li></ul></div></div>
<div class='block'><h2>While they work</h2><div class='note'><ul>
<li>Walk round slowly. Do not give answers. Do not give hints.</li>
<li>If someone cannot log in, tell campus staff. Do not give them another student's login.</li>
<li>If a page freezes, ask the student to refresh once. If it does not work, tell campus staff.</li>
<li>Tell them to click <b>Submit one time only</b>. The writing is marked once by the system.</li></ul></div></div>
<div class='block'><h2>When they finish</h2><div class='note'><ul>
<li>Say: "Click Submit. Wait for the page. Then you can open Results."</li>
<li>Do not tell students their score before the page shows it. Do not mark or correct the writing in class.</li>
<li>Students who finish early: do the next Learn lesson.</li></ul></div></div>
""")
games = render.page('Spare games', """
<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Teacher 1 &middot; Anna</span></div>
<h1>Spare games</h1><div class='sub'>All seated. Use one when a task finishes early. Each takes 5 to 10 minutes.</div></div>
<div class='block'><table class='steps'><tbody>
<tr><td class='s'>1. Hot seat</td><td><b>Say:</b> "One student sits with their back to the board. I write a word. The class describes it without saying it. The student guesses." Words: teacher, cafe, bank, rice, bus.</td></tr>
<tr><td class='s'>2. Word chain</td><td><b>Say:</b> "Say a word that starts with the last letter of the word before. Cat, tea, apple..." No repeats. Go round the table.</td></tr>
<tr><td class='s'>3. Alphabet game</td><td><b>Say:</b> "Pick a topic: food. One student says A, the next says B. Apple, banana, curry..."</td></tr>
<tr><td class='s'>4. Pass the sentence</td><td><b>Say:</b> "I whisper a sentence to the first student. Whisper it to your neighbour. The last student says it out loud." Compare with the first.</td></tr>
<tr><td class='s'>5. Question chain</td><td><b>Say:</b> "Ask the student next to you a question: Where are you from? They answer, then ask the next student a different question."</td></tr>
</tbody></table></div>
""")
async def go():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page()
        parts = []
        docs = [('front', front, 'Anna week 1'), ('guide', guide, 'Computer hour guide')]
        sh = lambda y: render.student_html(y).replace("<div class='namebar'><div>Name</div><div>Date</div></div>", "<div class='namebar'><div>Name</div></div>")
        for x in L:
            d = x["day"]
            docs.append((f'd{d}t', render.teacher_html(AX.teacher_variant(x) if d == 7 else x), f'Day {d} · Teacher notes'))
            if d == 7:
                docs.append(('d7map', AX.answer_map_page(), 'Day 7 · Answer map'))
                docs.append(('d7sA', sh(AX.variant(x, 'A')), 'Day 7 · Student sheet A'))
                docs.append(('d7sB', sh(AX.variant(x, 'B')), 'Day 7 · Student sheet B'))
            else:
                docs.append((f'd{d}s', sh(x), f'Day {d} · Student sheet'))
            if d == 9:
                docs.append(('d9cards', AX.market_cards_page(), 'Day 9 · Market cards'))
        for name, doc, lab in docs:
            tmp = SC + 'books/tmp_anna.html'; open(tmp, 'w').write(doc)
            await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_{name}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>',
                         footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · Anna · ' + lab), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        docs2 = [('games', games, 'Spare games')]
        for name, doc, lab in docs2:
            tmp = SC + 'books/tmp_anna.html'; open(tmp, 'w').write(doc)
            await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_{name}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>', footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · Anna · ' + lab), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
        w = PdfWriter()
        for f in parts:
            for pgx in PdfReader(f).pages: w.add_page(pgx)
        os.makedirs(OUT, exist_ok=True)
        w.write(OUT + 'Anna - Week 1 workbook.pdf')
        print(len(w.pages), 'pages')
asyncio.run(go())
