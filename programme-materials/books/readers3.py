import sys, asyncio, os, html, re
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/papers')
sys.path.insert(0, '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/books')
import render
from readers2 import mapping
from playwright.async_api import async_playwright
from pypdf import PdfWriter, PdfReader
SC = '/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/'
e = html.escape
def extend(text, a, b):
    while b > a and text[b-1] in ' \n\t': b -= 1
    while a < b and text[a] in ' \n\t': a += 1
    ls = text.rfind('\n', 0, a) + 1; le = text.find('\n', b); le = len(text) if le < 0 else le
    if '....' in text[ls:le]: return ls, le
    return a, b
def hl_passage(text, hits):
    marks = []
    for n, q, sp in hits:
        for a, b in sp:
            a, b = extend(text, a, b); marks.append((a, b, n, q))
    marks.sort()
    out = ''; pos = 0
    for a, b, n, q in marks:
        ans = q['answer'].split('|')[0]
        if a < pos:
            out += f"<span style='background:#0056d2;color:#fff;border-radius:2mm;padding:0 1.5mm;font-size:7.5pt;font-weight:700;margin:0 1mm'>{n}: {e(ans)}</span>"; continue
        out += e(text[pos:a]) + f"<mark style='background:#ffe45c;padding:0 .5mm;border-bottom:1.5px solid #b8860b'>{e(text[a:b])}</mark><span style='background:#0056d2;color:#fff;border-radius:2mm;padding:0 1.5mm;font-size:7.5pt;font-weight:700;margin:0 1mm'>{n}: {e(ans)}</span>"
        pos = b
    return out + e(text[pos:])
def paper(p, items):
    out = f"<div class='head teacher'><div class='top'><span>Teacher copy &middot; not for students</span><span class='gold'>Answers highlighted</span></div><h1>{e(p['title'].replace(' · ', ': '))}</h1><div class='sub'>{p['timeLimitMin']} minutes. Yellow = where the answer is in the text. The blue tag shows the question number and the answer.</div></div>"
    for ps, hits in items:
        out += f"<div class='block'><h2>{e(ps['title'])}</h2><div class='note' style='white-space:pre-wrap;line-height:1.7'>{hl_passage(ps['text'], hits)}</div></div>"
        for g in ps['groups']:
            out += f"<div class='block'><h2>{e(g['instruction'])}</h2>"
            for q in g['questions']:
                n = [h[0] for h in hits if h[1] is q][0]
                if q['type'] == 'MULTIPLE_CHOICE':
                    opts = ''.join(f"<div style='margin-left:6mm;{'background:#dff5e1;font-weight:700;' if 'ABCD'[i] == q['answer'] else ''}'>{'ABCD'[i]}. {e(o)}</div>" for i, o in enumerate(q['options']))
                    out += f"<p style='margin:2mm 0 0'><b>{n}.</b> {e(q['content'])}</p>{opts}"
                elif q['type'] == 'TRUE_FALSE_NOT_GIVEN':
                    out += f"<p style='margin:2mm 0'><b>{n}.</b> {e(q['content'])} &nbsp; <b style='background:#dff5e1;padding:0 1.5mm'>{e(q['answer'])}</b></p>"
                else:
                    out += f"<p style='margin:2mm 0'><b>{n}.</b> {e(q['content'])} &nbsp; <b style='background:#dff5e1;padding:0 1.5mm'>{e(q['answer'].replace('|', ' / '))}</b></p>"
            out += "</div>"
    return render.page(p['title'], out)
async def go():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server'])
        pg = await b.new_page(); parts = []
        for i, (p, items) in enumerate(mapping()):
            tmp = SC + 'books/tmp_r.html'; open(tmp, 'w').write(paper(p, items)); await pg.goto('file://' + tmp); await pg.wait_for_timeout(200)
            fn = SC + f'books/tmp_t{i}.pdf'
            await pg.pdf(path=fn, format='A4', print_background=True, display_header_footer=True, header_template='<div></div>', footer_template=render.FOOT.format(label='Epic Campus (Pvt) Ltd, Galle · ' + p['code'] + ' · Teacher copy'), margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            parts.append(fn)
        await b.close()
    w = PdfWriter()
    for f in parts:
        for x in PdfReader(f).pages: w.add_page(x)
    out = '/home/claude/deliverables/Papers/Reading papers 1 and 2 - Teacher copy (answers highlighted).pdf'
    w.write(out); print(len(w.pages), 'pages')
asyncio.run(go())
