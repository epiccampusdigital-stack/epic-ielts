# Town map for Activity morning 2. Student A and B each know different buildings.
def svg(known, labels_on=True):
    # buildings: key -> (x, y, w, h, label)
    B = {'bank': (50, 50, 160, 90, 'Bank'), 'post': (260, 50, 160, 90, 'Post office'), 'cafe': (470, 50, 160, 90, 'Cafe'),
         'bus': (50, 250, 160, 60, 'Bus stop'), 'hospital': (470, 250, 160, 90, 'Hospital'), 'school': (470, 370, 160, 80, 'School')}
    out = ['<svg viewBox="0 0 680 480" width="100%" style="max-width:98mm;display:block;margin:2mm auto" font-family="Source Sans Pro, Arial, sans-serif">',
           '<rect width="680" height="480" rx="10" fill="#f7faf4" stroke="#c9d6c0"/>',
           '<rect x="0" y="160" width="680" height="70" fill="#d9dde3"/><line x1="0" y1="195" x2="680" y2="195" stroke="#fff" stroke-width="3" stroke-dasharray="18 14"/>',
           '<text x="340" y="205" text-anchor="middle" font-size="18" fill="#5b6780" font-weight="700" letter-spacing="3">MAIN ROAD</text>',
           '<rect x="260" y="250" width="160" height="90" rx="8" fill="#bfe3b0" stroke="#7fb26b"/><text x="340" y="302" text-anchor="middle" font-size="20" fill="#2f6b2a" font-weight="700">Park</text>',
           '<g fill="#5b6780"><circle cx="640" cy="30" r="16" fill="#fff" stroke="#9aa7bd"/><text x="640" y="36" text-anchor="middle" font-size="16" font-weight="700">N</text></g>']
    for k, (x, y, w, h, lab) in B.items():
        if k in known:
            col = '#bcd7ff' if k not in ('bus',) else '#ffe3a8'
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{col}" stroke="#4a78c2" stroke-width="2"/>'
                       f'<text x="{x + w / 2}" y="{y + h / 2 + 7}" text-anchor="middle" font-size="22" font-weight="700" fill="#002761">{lab}</text>')
        else:
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#fff" stroke="#9aa7bd" stroke-width="2" stroke-dasharray="8 6"/>'
                       f'<text x="{x + w / 2}" y="{y + h / 2 + 8}" text-anchor="middle" font-size="26" fill="#c3ccdb">?</text>')
    out.append('</svg>')
    return ''.join(out)
A_KNOWS = {'bank', 'post', 'bus'}
B_KNOWS = {'cafe', 'hospital', 'school'}
ALL = A_KNOWS | B_KNOWS
