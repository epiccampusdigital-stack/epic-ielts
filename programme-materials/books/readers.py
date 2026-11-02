import sys, json, asyncio, os, html
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
import render
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
P = json.load(open(SC + 'readers.json'))
e = html.escape
def paper_html(p, key=False):
    out = f"<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>{'Answer key' if key else 'Reading paper'}</span></div><h1>{e(p['title'].replace('·', ':'))}</h1><div class='sub'>{p['timeLimitMin']} minutes. {e(p['instructions'])}</div></div>"
    if not key: out += "<div class='namebar'><div>Name</div></div>"
    n = 0
    for ps in p['passages']:
        if not key:
            out += f"<div class='block'><h2>{e(ps['title'])}</h2><div class='note' style='white-space:pre-wrap'>{e(ps['text'])}</div></div>"
        for g in ps['groups']:
            out += f"<div class='block'><h2>{e(g['instruction'])}</h2>"
            if key: out += "<table class='steps'><tbody>"
            for q in g['questions']:
                n += 1
                if key:
                    ans = q['answer'].replace('|', ' / ')
                    out += f"<tr><td class='t'>{n}</td><td class='s'>{e(ans)}</td><td>{e(q.get('explanation',''))}</td></tr>"
                    continue
                opts = ''
                if q['type'] == 'MULTIPLE_CHOICE':
                    opts = '<div style="margin:1mm 0 2mm 6mm">' + ''.join(f"<div>{'ABCD'[i]}. {e(o)}</div>" for i, o in enumerate(q['options'])) + '</div>'
                    out += f"<p style='margin:2mm 0 0'><b>{n}.</b> {e(q['content'])}</p>{opts}"
                elif q['type'] == 'TRUE_FALSE_NOT_GIVEN':
                    out += f"<p style='margin:2mm 0'><b>{n}.</b> {e(q['content'])} &nbsp;&nbsp; <i>TRUE &nbsp; FALSE &nbsp; NOT GIVEN</i> &nbsp; Answer: ________</p>"
                else:
                    out += f"<p style='margin:2mm 0'><b>{n}.</b> {e(q['content'])}</p>"
            if key: out += "</tbody></table>"
            out += "</div>"
    return render.page(p['title'], out)
async def go():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page(); parts = []
        for i, (p, key) in enumerate([(P[0], False), (P[1], False), (P[0], True), (P[1], True)]):
            tmp = SC + 'books/tmp_r.html'; open(tmp, 'w').write(paper_html(p, key)); await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_r{i}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>', footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · ' + p['code'] + (' · Answer key' if key else '')), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
    w = PdfWriter()
    for f in parts:
        for x in PdfReader(f).pages: w.add_page(x)
    os.makedirs('/home/claude/deliverables/Papers/', exist_ok=True); w.write('/home/claude/deliverables/Papers/Reading papers 1 and 2 (from the system).pdf'); print(len(w.pages), 'pages')
asyncio.run(go())
