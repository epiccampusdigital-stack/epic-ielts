# Shared look for the 8 workbooks: fonts, CSS, cover, PDF output.
import os, html, json, asyncio, datetime as dt, subprocess
from playwright.async_api import async_playwright
from pypdf import PdfReader, PdfWriter

S = os.environ.get('EPIC_WORK', '/tmp/epicwork/')
HERE = S + 'books/'
OUT = '/home/claude/deliverables/workbooks/'
os.makedirs(OUT, exist_ok=True)
e = html.escape
START = dt.date(2026, 10, 30)
def ddate(d): return (START + dt.timedelta(days=d - 1)).strftime('%a %-d %b')

SIN = HERE + 'node_modules/@fontsource/noto-sans-sinhala/files/'
FONTS = ''.join(
    f"@font-face{{font-family:'SSP';font-weight:{f.split('-')[-2]};font-style:{'italic' if 'italic' in f else 'normal'};src:url(file://{S}localfonts2/{f})}}"
    for f in os.listdir(S + 'localfonts2')) + ''.join(
    f"@font-face{{font-family:'NSSinhala';font-weight:{w};src:url(file://{SIN}noto-sans-sinhala-sinhala-{w}-normal.woff2)}}" for w in (400, 600, 700))

BASE_CSS = FONTS + """
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: 'SSP', 'Noto Sans CJK KR', 'NSSinhala', sans-serif; color: #0f1114; font-size: 10.4pt; line-height: 1.5; }
p { margin: 0 0 1.6mm; }
b { font-weight: 600; }
.ko { font-family: 'Noto Sans CJK KR', sans-serif; }
.si { font-family: 'NSSinhala', sans-serif; color: #44506a; font-size: 9.6pt; line-height: 1.65; }
.pb { break-before: page; }
.avoid { break-inside: avoid; }
/* lesson opener */
.opener { display: grid; grid-template-columns: 1fr 34mm; gap: 6mm; align-items: center; border-bottom: .5mm solid #dae1ed; padding-bottom: 4mm; margin-bottom: 5mm; break-inside: avoid; }
.opener .tags { display: flex; gap: 2mm; flex-wrap: wrap; margin-bottom: 2.5mm; }
.tag { display: inline-block; border-radius: 10mm; padding: .6mm 3mm; font-size: 7.6pt; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
.tag.en { background: #e8eef7; color: #0056d2; }
.tag.kr { background: #fde8ef; color: #b3194f; }
.tag.grey { background: #f0f2f6; color: #5b6780; }
.opener h1 { margin: 0; font-size: 22pt; line-height: 1.1; color: #002761; font-weight: 700; }
.opener .alt { font-size: 12pt; color: #44506a; margin-top: 1.2mm; }
.opener .focus { color: #5b6780; margin-top: 2mm; font-size: 10.2pt; }
.opener .art { width: 34mm; height: 28mm; border-radius: 4mm; background: #f0f6ff; display: flex; align-items: center; justify-content: center; }
.opener .art svg { width: 28mm; height: 22mm; }
.opener .glyph { width: 34mm; height: 28mm; border-radius: 4mm; background: #002761; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 30pt; font-family: 'Noto Sans CJK KR'; }
/* sections */
h2 { break-after: avoid; font-size: 12.5pt; margin: 0 0 2mm; display: flex; align-items: baseline; gap: 2.5mm; color: #0f1114; }
h2 .n { font-size: 8pt; font-weight: 700; color: #fff; background: #0056d2; border-radius: 50%; width: 5.8mm; height: 5.8mm; display: inline-flex; align-items: center; justify-content: center; flex: none; position: relative; top: -.4mm; }
.kr-book h2 .n { background: #b3194f; }
.block { margin: 0 0 5mm; break-inside: avoid; }
.block.flow { break-inside: auto; }
.instr { color: #5b6780; font-size: 9.4pt; margin-bottom: 2mm; }
.box { border: .3mm solid #dae1ed; border-radius: 2.5mm; padding: 3mm 4mm; background: #f7f9fc; }
.note { border-left: 1mm solid #0056d2; background: #f0f6ff; border-radius: 0 2.5mm 2.5mm 0; padding: 3mm 4mm; }
.kr-book .note { border-color: #b3194f; background: #fff4f7; }
.note ul { margin: 0; padding-left: 4.5mm; } .note li { margin: .6mm 0; }
.lines .line, .line { border-bottom: .3mm solid #94a3b8; height: 8mm; }
.ans { display: inline-block; min-width: 30mm; border-bottom: .3mm solid #94a3b8; height: 4.5mm; vertical-align: bottom; }
.abox { display: inline-block; width: 9mm; height: 7mm; border: .3mm solid #94a3b8; border-radius: 1.5mm; vertical-align: middle; margin-left: 2mm; }
.check { display: flex; gap: 4mm; align-items: center; background: #002761; color: #fff; border-radius: 3mm; padding: 2.6mm 5mm; font-size: 9.5pt; margin: 2mm 0 8mm; break-inside: avoid; }
.check .dots { display: inline-flex; gap: 1.6mm; margin-left: auto; flex: none; }
.check .dots i { width: 4mm; height: 4mm; border: .4mm solid #fff; border-radius: 50%; display: inline-block; }
.pic { border: .3mm solid #dae1ed; border-radius: 3mm; padding: 2.5mm; text-align: center; background: #fff; break-inside: avoid; }
.pic svg { width: 100%; height: 22mm; display: block; }
.pic .cap { font-size: 9.5pt; margin-top: 1.5mm; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3.5mm; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3.5mm; }
.grid6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3mm; }
.chips { display: flex; flex-wrap: wrap; gap: 2mm; }
.chips span { border: .3mm solid #b9d2f7; background: #e8eef7; color: #002761; border-radius: 5mm; padding: .6mm 3mm; font-size: 10pt; }
/* answer section */
.answers-head { background: #002761; color: #fff; border-radius: 4mm; padding: 7mm 8mm; margin-bottom: 6mm; }
.answers-head h1 { margin: 0; font-size: 22pt; }
.answers-head p { margin: 2mm 0 0; color: #c9d6ec; }
.akey { border: .3mm solid #dae1ed; border-radius: 3mm; padding: 3mm 4.5mm; margin-bottom: 3.5mm; break-inside: avoid; }
.akey h3 { margin: 0 0 1.5mm; font-size: 10.5pt; color: #002761; }
.akey h3 small { color: #5b6780; font-weight: 400; margin-left: 2mm; }
.akey div { margin: .6mm 0; font-size: 9.6pt; }
/* contents */
table.toc { width: 100%; border-collapse: collapse; font-size: 9.8pt; }
table.toc th { text-align: left; font-size: 7.8pt; color: #5b6780; text-transform: uppercase; letter-spacing: .05em; border-bottom: .5mm solid #0056d2; padding: 1.6mm 2mm; }
table.toc td { padding: 1.8mm 2mm; border-bottom: .3mm solid #dae1ed; vertical-align: top; }
.howto { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; }
.howto div { border: .3mm solid #dae1ed; border-radius: 3mm; padding: 3mm 4mm; font-size: 9.4pt; }
.howto b { display: block; color: #002761; margin-bottom: 1mm; }
"""

COVER_CSS = FONTS + """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'SSP', 'Noto Sans CJK KR', sans-serif; }
.cover { width: 210mm; height: 297mm; position: relative; overflow: hidden; color: #fff; }
.cover .inner { position: absolute; inset: 0; padding: 22mm 20mm; display: flex; flex-direction: column; }
.org { font-size: 9pt; letter-spacing: .18em; font-weight: 600; opacity: .85; }
.book { margin-top: 10mm; font-size: 11pt; font-weight: 600; letter-spacing: .08em; max-width: 100mm; line-height: 1.4; }
h1 { font-size: 40pt; line-height: 1.02; font-weight: 700; margin-top: 4mm; }
.sub { font-size: 13pt; margin-top: 5mm; opacity: .9; max-width: 125mm; line-height: 1.45; }
.art { margin-top: auto; }
.meta { display: flex; gap: 10mm; font-size: 9pt; border-top: .3mm solid rgba(255,255,255,.35); padding-top: 4mm; margin-top: 8mm; }
.meta b { display: block; font-size: 11pt; }
.namebox { position: absolute; right: 20mm; top: 22mm; background: rgba(255,255,255,.12); border: .3mm solid rgba(255,255,255,.35); border-radius: 3mm; padding: 3mm 5mm; font-size: 8.5pt; width: 62mm; }
.namebox div { border-bottom: .3mm solid rgba(255,255,255,.5); height: 8mm; margin-top: 1mm; }
.logo { position: absolute; right: 20mm; bottom: 20mm; width: 30mm; opacity: .95; }
"""

def cover_html(bg, book_line, title, sub, art, meta):
    m = ''.join(f'<div><b>{a}</b>{b}</div>' for a, b in meta)
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{COVER_CSS}</style></head><body>"
            f"<div class='cover' style='background:{bg}'><div class='inner'><div class='org'>EPIC CAMPUS · KOREA SCHOLARSHIP PROGRAMME 2026</div>"
            f"<div class='book'>{book_line}</div><h1>{title}</h1><div class='sub'>{sub}</div><div class='art'>{art}</div><div class='meta'>{m}</div></div>"
            f"<div class='namebox'>Name<div></div></div></div></body></html>")

FOOT = """<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#5b6780;padding:0 15mm;display:flex;justify-content:space-between;">
<span>Epic Campus (Pvt) Ltd, Galle · {label}</span><span>page <span class="pageNumber"></span></span></div>"""

def page(body, cls, extra_css=''):
    return f"<!doctype html><html lang='en'><head><meta charset='utf-8'><style>{BASE_CSS}{extra_css}</style></head><body class='{cls}'>{body}</body></html>"

async def make_pdf(cover, inner, label, out_name):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server', '--allow-file-access-from-files'])
        pg = await b.new_page()
        for name, doc in (('cover', cover), ('inner', inner)):
            open(HERE + f'tmp_{name}.html', 'w').write(doc)
            await pg.goto('file://' + HERE + f'tmp_{name}.html'); await pg.wait_for_timeout(500)
            await pg.evaluate('document.fonts.ready')
            if name == 'cover':
                await pg.pdf(path=HERE + 'tmp_cover.pdf', width='210mm', height='297mm', print_background=True)
            else:
                await pg.pdf(path=HERE + 'tmp_inner.pdf', format='A4', print_background=True, display_header_footer=True,
                             header_template='<div></div>', footer_template=FOOT.format(label=e(label)),
                             margin={'top': '14mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
        await b.close()
    w = PdfWriter()
    for f in ('tmp_cover.pdf', 'tmp_inner.pdf'):
        for pg_ in PdfReader(HERE + f).pages:
            w.add_page(pg_)
    w.write(OUT + out_name)
    return len(w.pages)

def build(cover, inner, label, out_name):
    n = asyncio.run(make_pdf(cover, inner, label, out_name))
    print(f'{out_name}: {n} pages')
    return n
