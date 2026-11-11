W, H = 1000, 720
NAVY = '#0f2a5c'
def bld(x, y, w, h, fill='#e8edf5', stroke='#6b7a99', label=None, sub=None):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
    if label: s += f'<text x="{x + w/2}" y="{y + h/2 + (0 if sub else 6)}" text-anchor="middle" font-size="18" font-weight="700" fill="#33415c">{label}</text>'
    if sub: s += f'<text x="{x + w/2}" y="{y + h/2 + 22}" text-anchor="middle" font-size="14" fill="#5b6780">{sub}</text>'
    return s
def letter(x, y, L):
    return f'<circle cx="{x}" cy="{y}" r="19" fill="{NAVY}" stroke="#fff" stroke-width="3"/><text x="{x}" y="{y + 7}" text-anchor="middle" font-size="21" font-weight="800" fill="#fff">{L}</text>'
def tree(x, y, r=13):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#7fbf7f" stroke="#4f8f4f" stroke-width="1.5"/>'
p = []
p.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')
# campus ground
p.append('<rect x="40" y="40" width="840" height="590" fill="#f3f8ee" stroke="#8a9a7a" stroke-width="3"/>')
# river on the east
p.append('<path d="M905 0 C 930 120, 890 240, 915 360 S 935 600, 905 720 L 975 720 C 1000 600, 960 480, 985 360 S 950 120, 975 0 Z" fill="#bfe0f5" stroke="#7fb3d6" stroke-width="2"/>')
p.append('<text x="945" y="470" text-anchor="middle" font-size="17" font-weight="700" fill="#2b6a94" transform="rotate(90 945 470)">RIVER</text>')
# road at the bottom
p.append('<rect x="0" y="645" width="900" height="55" fill="#d9dce2"/>')
p.append('<line x1="0" y1="672" x2="900" y2="672" stroke="#fff" stroke-width="3" stroke-dasharray="22 16"/>')
p.append('<text x="200" y="690" font-size="16" font-weight="700" fill="#4a5568">STATION ROAD</text>')
# gate gap and main path
p.append('<rect x="430" y="622" width="60" height="16" fill="#f3f8ee"/>')
p.append('<rect x="440" y="370" width="40" height="262" fill="#e6dcc8"/>')
p.append('<text x="460" y="612" text-anchor="middle" font-size="14" font-weight="700" fill="#4a5568">Main gate</text>')
p.append('<path d="M430 630 L430 640 M490 630 L490 640" stroke="#8a9a7a" stroke-width="5"/>')
# fountain square
p.append('<circle cx="460" cy="330" r="62" fill="#e6dcc8"/>')
p.append('<circle cx="460" cy="330" r="34" fill="#bfe0f5" stroke="#7fb3d6" stroke-width="3"/>')
p.append('<text x="460" y="336" text-anchor="middle" font-size="14" font-weight="700" fill="#2b6a94">Fountain</text>')
# teaching building (north of fountain)
p.append(bld(330, 110, 260, 140, label='Teaching building', sub='(medical room inside)'))
p.append('<rect x="445" y="250" width="30" height="20" fill="#e6dcc8"/>')
# library (west of fountain) = B
p.append(bld(250, 285, 125, 95)); p.append(letter(312, 332, 'B'))
# cafeteria (east of fountain) = C
p.append(bld(545, 285, 125, 95)); p.append(letter(607, 332, 'C'))
# dormitories NE = D (two buildings)
p.append(bld(705, 62, 160, 62)); p.append(bld(705, 142, 160, 62)); p.append(letter(785, 133, 'D'))
# bridge = E
p.append('<rect x="885" y="160" width="95" height="22" fill="#b08968" stroke="#7f5539" stroke-width="2"/>')
for i in range(6): p.append(f'<line x1="{893 + i * 15}" y1="160" x2="{893 + i * 15}" y2="182" stroke="#7f5539" stroke-width="2"/>')
p.append(letter(932, 215, 'E'))
# sports centre NW = F
p.append(bld(62, 62, 190, 130)); p.append(letter(157, 127, 'F'))
# garden = G (between sports centre and library)
p.append('<rect x="62" y="212" width="170" height="175" rx="10" fill="#d4ecc5" stroke="#7fae6a" stroke-width="2"/>')
for (x, y) in [(90, 240), (200, 245), (95, 355), (205, 360), (150, 300)]: p.append(tree(x, y, 12))
p.append(letter(147, 252, 'G'))
# car park (left of gate)
p.append('<rect x="230" y="505" width="180" height="110" fill="#e2e5ea" stroke="#9aa3b2" stroke-width="2"/>')
for i in range(7): p.append(f'<line x1="{245 + i * 25}" y1="505" x2="{245 + i * 25}" y2="545" stroke="#fff" stroke-width="3"/>')
p.append('<text x="320" y="590" text-anchor="middle" font-size="16" font-weight="700" fill="#4a5568">Car park</text>')
# empty land beside car park = H
p.append('<rect x="62" y="505" width="150" height="110" rx="6" fill="none" stroke="#9aa3b2" stroke-width="2" stroke-dasharray="8 6"/>')
p.append(letter(137, 560, 'H'))
# south-east lawn = I
p.append('<rect x="545" y="450" width="200" height="150" rx="10" fill="#e3f1d8" stroke="#a3c48e" stroke-width="2"/>')
for (x, y) in [(575, 480), (715, 480), (575, 570), (715, 570)]: p.append(tree(x, y, 11))
p.append(letter(645, 525, 'I'))
# bus stop outside the gate on the right = A
p.append('<rect x="535" y="650" width="70" height="18" rx="3" fill="#ffd166" stroke="#c99a1e" stroke-width="2"/>')
p.append(letter(570, 708 - 30, 'A'))
# trees along the path
for y in [400, 450, 500, 550]: p.append(tree(418, y, 9)); p.append(tree(502, y, 9))
# compass
p.append('<g transform="translate(830 560)"><circle r="30" fill="#fff" stroke="#9aa3b2" stroke-width="2"/><path d="M0 -24 L9 6 L0 0 L-9 6 Z" fill="#0f2a5c"/><text y="-36" text-anchor="middle" font-size="16" font-weight="800" fill="#0f2a5c">N</text></g>')
# title
p.append(f'<text x="60" y="28" font-size="20" font-weight="800" fill="{NAVY}">Greenhill Language College: new campus</text>')
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Arial, Helvetica, sans-serif">{"".join(p)}</svg>'
open('map.svg', 'w').write(svg)
open('map.html', 'w').write(f'<html><body style="margin:0">{svg}</body></html>')
