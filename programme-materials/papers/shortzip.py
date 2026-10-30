import os, shutil, re, subprocess
SRC = 'out3/EPIC Korea Programme - English papers'
DST = 'short/EPIC English'
shutil.rmtree('short', ignore_errors=True)
SK = {'Grammar foundation': 'Grammar', 'Extra practice': 'Extra'}
FN = {'Student worksheet.pdf': 'Student.pdf', 'Teacher notes.pdf': 'Teacher.pdf'}
def clean(n, k=34):
    n = n.replace('é', 'e').replace('Grammar foundation', 'Grammar')
    n = re.sub(r'^(\d\d\.\d\d) - ', r'\1 ', n)
    n = re.sub(r'[^A-Za-z0-9 .,&+()#-]', '', n)
    return n[:k].rstrip(' -.,')
for root, dirs, files in os.walk(SRC):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), SRC).split(os.sep)
        if rel[0] == 'By day':
            m = re.match(r'(Day \d\d) - (\w\w\w \d\d \w\w\w)', rel[1])
            parts = ['By day', f'{m.group(1)} {m.group(2)}', clean(rel[2])]
        else:
            parts = ['By skill', SK.get(rel[1], rel[1]), clean(rel[2])]
        out = os.path.join(DST, *parts, FN[f])
        assert not os.path.exists(out), out
        os.makedirs(os.path.dirname(out), exist_ok=True); shutil.copy(os.path.join(root, f), out)
z = '/home/claude/deliverables/EPIC English papers.zip'
if os.path.exists(z): os.remove(z)
subprocess.run(['zip', '-qr', z, 'EPIC English'], cwd='short', check=True)
print(max(len(os.path.join(r, f)) for r, _, fs in os.walk('short') for f in fs), sum(len(fs) for _, _, fs in os.walk('short')))
