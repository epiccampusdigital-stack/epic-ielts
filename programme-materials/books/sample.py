# Sample pages for the EPIC Korea Programme workbooks (English Week 1, Korean Book 1)
import os, asyncio
from playwright.async_api import async_playwright

S = os.environ.get('EPIC_WORK', '/tmp/epicwork/')
OUT = '/home/claude/deliverables/workbooks/'
os.makedirs(OUT, exist_ok=True)

fonts = ''.join(
    f"@font-face{{font-family:'SSP';font-weight:{f.split('-')[-2]};font-style:{'italic' if 'italic' in f else 'normal'};src:url(file://{S}localfonts2/{f})}}"
    for f in os.listdir(S + 'localfonts2'))

CSS = fonts + """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'SSP', 'Noto Sans CJK KR', sans-serif; color: #0f1114; font-size: 10.5pt; line-height: 1.5; }
.ko { font-family: 'Noto Sans CJK KR', sans-serif; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; padding: 16mm 16mm 18mm; }
.foot { position: absolute; left: 16mm; right: 16mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #5b6780; }
/* covers */
.cover { padding: 0; color: #fff; }
.cover .bg { position: absolute; inset: 0; }
.cover .inner { position: absolute; inset: 0; padding: 22mm 20mm; display: flex; flex-direction: column; }
.cover .org { font-size: 9pt; letter-spacing: .18em; font-weight: 600; opacity: .85; }
.cover .book { margin-top: 10mm; font-size: 11pt; font-weight: 600; letter-spacing: .08em; }
.cover h1 { font-size: 40pt; line-height: 1.02; font-weight: 700; margin-top: 4mm; letter-spacing: -.01em; }
.cover .sub { font-size: 13pt; margin-top: 5mm; opacity: .9; max-width: 120mm; }
.cover .art { margin-top: auto; }
.cover .meta { display: flex; gap: 10mm; font-size: 9pt; border-top: .3mm solid rgba(255,255,255,.35); padding-top: 4mm; margin-top: 8mm; }
.cover .meta b { display: block; font-size: 11pt; }
.namebox { position: absolute; right: 20mm; top: 22mm; background: rgba(255,255,255,.12); border: .3mm solid rgba(255,255,255,.35); border-radius: 3mm; padding: 3mm 5mm; font-size: 8.5pt; width: 62mm; }
.namebox div { border-bottom: .3mm solid rgba(255,255,255,.5); height: 8mm; margin-top: 1mm; }
/* inside */
.top { display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: #5b6780; letter-spacing: .06em; font-weight: 600; text-transform: uppercase; margin-bottom: 5mm; }
.tag { display: inline-block; border-radius: 10mm; padding: .6mm 3mm; font-size: 7.6pt; font-weight: 700; letter-spacing: .05em; }
.tag.en { background: #e8eef7; color: #0056d2; }
.tag.kr { background: #fde8ef; color: #b3194f; }
h2 { font-size: 21pt; line-height: 1.1; font-weight: 700; color: #002761; }
.lead { color: #5b6780; font-size: 10.5pt; margin: 2mm 0 6mm; }
h3 { font-size: 12pt; font-weight: 700; margin: 0 0 2.5mm; display: flex; align-items: center; gap: 2.5mm; }
h3 .n { width: 6mm; height: 6mm; border-radius: 50%; background: #0056d2; color: #fff; font-size: 8pt; display: inline-flex; align-items: center; justify-content: center; }
.kr-page h3 .n { background: #b3194f; }
.block { margin-bottom: 6mm; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.grid6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3mm; }
.pic { border: .3mm solid #dae1ed; border-radius: 3mm; padding: 3mm; text-align: center; background: #fff; }
.pic svg { width: 100%; height: 26mm; display: block; }
.pic .cap { font-size: 10pt; margin-top: 1.5mm; }
.pic .line { border-bottom: .3mm solid #94a3b8; height: 7mm; margin: 0 3mm; }
.note { background: #f0f6ff; border-left: 1mm solid #0056d2; border-radius: 0 2.5mm 2.5mm 0; padding: 3mm 4mm; font-size: 10pt; }
.kr-page .note { background: #fff4f7; border-color: #b3194f; }
.chips { display: flex; flex-wrap: wrap; gap: 2mm; }
.chips span { border: .3mm solid #b9d2f7; background: #e8eef7; color: #002761; border-radius: 5mm; padding: .6mm 3mm; font-size: 10pt; }
ol.items { padding-left: 6mm; } ol.items li { margin-bottom: 2.2mm; }
.ans { display: inline-block; min-width: 30mm; border-bottom: .3mm solid #94a3b8; height: 4.5mm; vertical-align: bottom; }
.vowel { border: .3mm solid #f3c4d3; border-radius: 3mm; padding: 2.5mm 2mm 2mm; text-align: center; background: #fff; }
.vowel .big { font-size: 30pt; line-height: 1.1; color: #002761; }
.vowel .rom { font-size: 9pt; color: #5b6780; }
.vowel svg { width: 22mm; height: 22mm; display: block; margin: 1mm auto 0; }
table.trace { width: 100%; border-collapse: collapse; }
table.trace td { border: .3mm solid #dae1ed; height: 15mm; width: 15mm; text-align: center; font-size: 26pt; position: relative; }
table.trace td.g { color: #e3e8f0; }
table.trace td.h { color: #002761; background: #fff4f7; font-size: 24pt; }
table.trace td::before, table.trace td::after { content: ''; position: absolute; background: #eef2f8; }
table.trace td::before { left: 50%; top: 0; bottom: 0; width: .2mm; }
table.trace td::after { top: 50%; left: 0; right: 0; height: .2mm; }
table.trace td span { position: relative; z-index: 1; }
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 8mm; }
.mrow { display: flex; align-items: center; gap: 3mm; border: .3mm solid #dae1ed; border-radius: 3mm; padding: 2mm 3mm; }
.mrow svg { width: 22mm; height: 18mm; flex: none; }
.mrow .w { font-size: 18pt; }
.mrow .box { margin-left: auto; width: 18mm; height: 10mm; border: .3mm dashed #94a3b8; border-radius: 2mm; }
.check { display: flex; gap: 4mm; align-items: center; background: #002761; color: #fff; border-radius: 3mm; padding: 3mm 5mm; font-size: 9.5pt; }
.check b { font-size: 10pt; }
.dots { display: inline-flex; gap: 1.6mm; margin-left: auto; }
.dots i { width: 4mm; height: 4mm; border: .4mm solid #fff; border-radius: 50%; display: inline-block; }
"""

# ---- simple flat illustrations (drawn for these books, no outside images) ----
NAVY, BLUE, PINK, SKIN, SOFT = '#002761', '#0056d2', '#d81b60', '#f2c9a0', '#e8eef7'

def cat(x, y, s=1):
    return f"""<g transform="translate({x},{y}) scale({s})">
<ellipse cx="0" cy="12" rx="16" ry="11" fill="{NAVY}"/><circle cx="12" cy="-2" r="10" fill="{NAVY}"/>
<path d="M4 -9 L6 -20 L12 -11 Z M14 -11 L20 -20 L21 -8 Z" fill="{NAVY}"/>
<circle cx="9" cy="-3" r="1.6" fill="#fff"/><circle cx="16" cy="-3" r="1.6" fill="#fff"/>
<path d="M-16 10 C-30 6 -28 -8 -20 -10" stroke="{NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/></g>"""

def box(x, y):
    return f"""<g transform="translate({x},{y})"><rect x="-26" y="-18" width="52" height="36" rx="3" fill="#f6b26b"/>
<rect x="-26" y="-18" width="52" height="8" fill="#e69138"/><line x1="0" y1="-18" x2="0" y2="18" stroke="#e69138" stroke-width="2"/></g>"""

def scene(kind):
    ground = f'<line x1="5" y1="92" x2="155" y2="92" stroke="#dae1ed" stroke-width="2"/>'
    if kind == 'on':      body = box(80, 72) + cat(76, 37)
    elif kind == 'in':    body = cat(78, 64, .8) + f'<g transform="translate(80,72)"><rect x="-26" y="-6" width="52" height="26" rx="3" fill="#f6b26b"/><rect x="-26" y="-6" width="52" height="7" fill="#e69138"/></g>'
    elif kind == 'under': body = f'<rect x="40" y="38" width="80" height="6" rx="2" fill="{BLUE}"/><rect x="46" y="44" width="5" height="48" fill="{BLUE}"/><rect x="109" y="44" width="5" height="48" fill="{BLUE}"/>' + cat(78, 75, .75)
    elif kind == 'next':  body = box(55, 72) + cat(118, 72, .85)
    elif kind == 'between': body = box(35, 72).replace('#f6b26b', '#9fc5f8').replace('#e69138', '#6fa8dc') + box(125, 72) + cat(80, 72, .7)
    elif kind == 'behind': body = cat(98, 55, .9) + box(70, 72)
    return f'<svg viewBox="0 0 160 100">{ground}{body}</svg>'

def child():
    return f"""<svg viewBox="0 0 80 64"><circle cx="40" cy="22" r="13" fill="{SKIN}"/><path d="M27 20 C27 6 53 6 53 20 C49 13 31 13 27 20Z" fill="#3b2a20"/>
<circle cx="35" cy="22" r="1.6" fill="#0f1114"/><circle cx="45" cy="22" r="1.6" fill="#0f1114"/><path d="M36 28 Q40 31 44 28" stroke="#0f1114" stroke-width="1.4" fill="none"/>
<path d="M24 64 C24 44 56 44 56 64Z" fill="{PINK}"/></svg>"""
def cucumber():
    return f"""<svg viewBox="0 0 80 64"><g transform="rotate(-25 40 32)"><rect x="10" y="22" width="60" height="20" rx="10" fill="#4f9a3a"/>
<circle cx="24" cy="30" r="1.5" fill="#a8d08d"/><circle cx="38" cy="35" r="1.5" fill="#a8d08d"/><circle cx="52" cy="29" r="1.5" fill="#a8d08d"/><rect x="66" y="29" width="7" height="5" rx="2" fill="#2f6b22"/></g></svg>"""
def tooth():
    return f"""<svg viewBox="0 0 80 64"><path d="M26 10 C32 6 36 10 40 10 C44 10 48 6 54 10 C62 15 58 30 55 38 C53 46 52 58 47 58 C43 58 43 44 40 44 C37 44 37 58 33 58 C28 58 27 46 25 38 C22 30 18 15 26 10Z" fill="#fff" stroke="{NAVY}" stroke-width="2.4"/>
<path d="M31 18 Q34 15 37 17" stroke="{BLUE}" stroke-width="2" fill="none"/></svg>"""
def five():
    return f"""<svg viewBox="0 0 80 64">""" + ''.join(f'<path d="M{12+i*13} 46 l0 -18 m0 0 l-3 -6 m6 0 l-3 6" stroke="{SKIN}" stroke-width="0"/>' for i in range(0)) + \
        f"""<path d="M18 58 C14 40 18 30 26 30 L26 14 C26 10 31 10 31 14 L31 28 L31 10 C31 6 37 6 37 10 L37 28 L37 8 C37 4 43 4 43 8 L43 28 L43 12 C43 8 49 8 49 12 L49 36 L54 28 C57 24 62 27 59 31 L50 50 C47 56 42 58 36 58Z" fill="{SKIN}" stroke="#b07a52" stroke-width="1.3"/>
<text x="66" y="22" font-size="16" font-weight="700" fill="{PINK}" font-family="SSP">5</text></svg>"""

# stroke-order diagrams from the EStudykorea alphabet data (same strokes as the site)
ABC = [('ㅏ', '아', 'a', [[70, 25, 70, 125], [70, 72, 110, 72]]), ('ㅓ', '어', 'eo', [[30, 72, 70, 72], [70, 25, 70, 125]]),
       ('ㅗ', '오', 'o', [[75, 30, 75, 75], [25, 75, 125, 75]]), ('ㅜ', '우', 'u', [[25, 55, 125, 55], [75, 55, 75, 110]]),
       ('ㅡ', '으', 'eu', [[25, 75, 125, 75]]), ('ㅣ', '이', 'i', [[75, 25, 75, 125]])]
def strokes(paths):
    out = f'<svg viewBox="0 0 150 150"><defs><marker id="a" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="{PINK}"/></marker></defs><rect x="2" y="2" width="146" height="146" rx="12" fill="#fff8fa" stroke="#f3c4d3"/>'
    for i, p in enumerate(paths):
        out += f'<path d="M{p[0]} {p[1]}L{p[2]} {p[3]}" stroke="{PINK}" stroke-width="7" stroke-linecap="round" marker-end="url(#a)"/><circle cx="{p[0]-16 if p[0]==p[2] else p[0]}" cy="{p[1] if p[0]==p[2] else p[1]-16}" r="10" fill="{NAVY}"/><text x="{p[0]-16 if p[0]==p[2] else p[0]}" y="{(p[1] if p[0]==p[2] else p[1]-16)+4.5}" font-size="13" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">{i+1}</text>'
    return out + '</svg>'

def cover_art_en():
    return f"""<svg viewBox="0 0 520 250" style="width:100%">
<rect x="0" y="40" width="150" height="190" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.25)"/>
<text x="75" y="120" font-size="46" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">noun</text><text x="75" y="160" font-size="20" fill="#b0e5fb" text-anchor="middle" font-family="SSP">book · Galle</text>
<rect x="170" y="10" width="150" height="190" rx="14" fill="{BLUE}"/>
<text x="245" y="92" font-size="46" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">verb</text><text x="245" y="132" font-size="20" fill="#e8eef7" text-anchor="middle" font-family="SSP">study · go</text>
<rect x="340" y="60" width="170" height="170" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.25)"/>
<text x="425" y="140" font-size="40" fill="#fff" text-anchor="middle" font-family="SSP" font-weight="700">and · but</text><text x="425" y="178" font-size="20" fill="#b0e5fb" text-anchor="middle" font-family="SSP">so · because</text></svg>"""

def cover_art_kr():
    letters = ['아', '어', '오', '우', '으', '이', '가', '나', '한', '글']
    out = '<svg viewBox="0 0 520 250" style="width:100%">'
    for i, l in enumerate(letters):
        x, y = 8 + (i % 5) * 103, 8 + (i // 5) * 120
        fill = PINK if l in ('한', '글') else 'rgba(255,255,255,.08)'
        out += f'<rect x="{x}" y="{y}" width="94" height="110" rx="12" fill="{fill}" stroke="rgba(255,255,255,.25)"/><text x="{x+47}" y="{y+76}" font-size="58" fill="#fff" text-anchor="middle" font-family="Noto Sans CJK KR">{l}</text>'
    return out + '</svg>'

LOGO = 'file:///home/claude/epic-ielts/frontend/public/logo.png'

en_cover = f"""<div class="page cover"><div class="bg" style="background:{NAVY}"></div>
<div class="inner"><div class="org">EPIC CAMPUS · KOREA SCHOLARSHIP PROGRAMME</div>
<div class="book">ENGLISH WORKBOOK 1 · WEEK 1</div><h1>Grammar<br>foundation</h1>
<div class="sub">Parts of speech, sentence patterns, pronouns, prepositions, tenses and joining words.</div>
<div class="art">{cover_art_en()}</div>
<div class="meta"><div><b>Days 1, 4, 6</b>30 Oct to 4 Nov 2026</div><div><b>5 lessons</b>+ week 1 quiz</div><div><b>Level</b>Pre-A1 to A2</div></div></div>
<div class="namebox">Name<div></div></div></div>"""

en_page = f"""<div class="page"><div class="top"><span>English workbook 1 · Week 1</span><span class="tag en">DAY 4 · FOUNDATION 3</span></div>
<h2>Where is the cat?</h2><p class="lead">Prepositions of place tell us where something is. Look at each picture, then write the preposition.</p>
<div class="block"><div class="chips"><span>on</span><span>in</span><span>under</span><span>next to</span><span>between</span><span>behind</span></div></div>
<div class="block"><h3><span class="n">1</span>Look and write</h3><div class="grid3">
{''.join(f'<div class="pic">{scene(k)}<div class="cap">The cat is <span class="ans" style="min-width:22mm"></span> {obj}.</div></div>' for k, obj in [('on','the box'),('in','the box'),('under','the table'),('next to'.replace(' ','') if False else 'next','the box'),('between','the boxes'),('behind','the box')])}
</div></div>
<div class="block"><h3><span class="n">2</span>Draw it</h3><div class="grid3">
{''.join(f'<div class="pic"><svg viewBox="0 0 160 100"><rect x="1" y="1" width="158" height="98" rx="6" fill="#f7f9fc" stroke="#dae1ed" stroke-dasharray="4 3"/></svg><div class="cap">{t}</div></div>' for t in ['The phone is on the bed.', 'The bag is under the chair.', 'The pen is between the books.'])}
</div></div>
<div class="block"><div class="note"><b>Remember:</b> the preposition comes <b>before</b> the place: on the table (not "the table on"). In Sinhala the small word comes after the place, so check your order.</div></div>
<div class="check"><b>Can you do it?</b> I can say where things are with 6 prepositions.<span class="dots"><i></i><i></i><i></i></span></div>
<div class="foot"><span>EPIC Campus, Galle · English workbook 1</span><span>page 14</span></div></div>"""

kr_cover = f"""<div class="page cover"><div class="bg" style="background:linear-gradient(160deg,{NAVY} 55%,#3a0a2a)"></div>
<div class="inner"><div class="org">EPIC CAMPUS · KOREA SCHOLARSHIP PROGRAMME</div>
<div class="book">KOREAN WORKBOOK 1 · WEEK 1 · <span class="ko">한글 1</span></div><h1>Hangul<br>foundations</h1>
<div class="sub">Read and write your first Korean letters: vowels, consonants and syllable blocks.</div>
<div class="art">{cover_art_kr()}</div>
<div class="meta"><div><b>Korean days 2, 3, 5, 7</b>31 Oct to 5 Nov 2026</div><div><b>6 lessons</b>Hangul 1 to 6</div><div><b>Matches</b>EStudykorea lessons</div></div></div>
<div class="namebox">Name<div></div></div></div>"""

kr_page = f"""<div class="page kr-page"><div class="top"><span>Korean workbook 1 · Week 1</span><span class="tag kr">HANGUL LESSON 2 · <span class="ko">아 어 오 우 으 이</span></span></div>
<h2>Six starting vowels</h2><p class="lead">Put a silent <span class="ko">ㅇ</span> in front of a vowel to make a full block. Vertical vowels sit to the right of <span class="ko">ㅇ</span>; flat vowels sit under it.</p>
<div class="block"><h3><span class="n">1</span>Look, follow the strokes, say it</h3><div class="grid6">
{''.join(f'<div class="vowel"><div class="big ko">{b}</div><div class="rom">{v} · {r}</div>{strokes(p)}</div>' for v, b, r, p in ABC)}
</div></div>
<div class="block"><h3><span class="n">2</span>Trace, then write</h3><table class="trace">
{''.join('<tr><td class="h"><span class="ko">' + b + '</span></td>' + ''.join(f'<td class="g"><span class="ko">{b}</span></td>' for _ in range(3)) + '<td></td>' * 7 + '</tr>' for _, b, _, _ in ABC[:4])}
</table></div>
<div class="block"><h3><span class="n">3</span>Write the Korean word under the picture</h3>
<div class="chips" style="margin-bottom:3mm"><span class="ko">오</span><span class="ko">이</span><span class="ko">아이</span><span class="ko">오이</span></div>
<div class="grid4">
{''.join(f'<div class="pic">{svg}<div class="line"></div><div class="cap" style="font-size:8.5pt;color:#5b6780">{m}</div></div>' for svg, m in [(child(), 'child'), (cucumber(), 'cucumber'), (tooth(), 'tooth'), (five(), 'five')])}
</div></div>
<div class="check"><b>Can you do it?</b> I can read <span class="ko">아 어 오 우 으 이</span> in any order.<span class="dots"><i></i><i></i><i></i></span></div>
<div class="foot"><span>EPIC Campus, Galle · Korean workbook 1 · same lesson as EStudykorea Hangul 2</span><span>page 9</span></div></div>"""

doc = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{en_cover}{en_page}{kr_cover}{kr_page}</body></html>"
open(S + 'books/sample.html', 'w').write(doc)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-proxy-server', '--allow-file-access-from-files'])
        pg = await b.new_page()
        await pg.goto('file://' + S + 'books/sample.html'); await pg.wait_for_timeout(800)
        await pg.pdf(path=OUT + 'Workbook sample - English W1 and Korean Book 1.pdf', width='210mm', height='297mm', print_background=True)
        await b.close()
asyncio.run(main())
print('ok')
