import render, os, shutil, datetime as dt, json, subprocess, re
plan = json.loads(subprocess.check_output(['node', '-e', "const p=require('/home/claude/epic-ielts/backend/src/data/program/koreaBatch1');console.log(JSON.stringify(p.buildDays()))"]))
theme = {d['dayNumber']: d['theme'].replace(':', ' -')[:60] for d in plan}
ROOT = render.HERE + 'out3/EPIC Korea Programme - English papers/'
BD = ROOT + 'By day/'
shutil.rmtree(BD, ignore_errors=True)
def mins(t):
    m = re.search(r'(\d+):(\d\d)', t); h, mm = int(m.group(1)), int(m.group(2))
    if h < 8: h += 12
    if 'PM' in t and h < 12: h += 12
    return h * 60 + mm
for L in render.load_all():
    if not L.get('day'): continue
    d = L['day']; date = dt.date(2026, 10, 30) + dt.timedelta(days=d - 1)
    day_dir = BD + f"Day {d:02d} - {date.strftime('%a %d %b')} - {theme[d].replace('/', '-')}/"
    t = mins(L['time'])
    sub = f"{t // 60:02d}.{t % 60:02d} - {L['folder']} - {L['title'].replace('/', '-').replace(':', ' -').replace('?', '')}"
    src = render.folder_of(L)
    shutil.copytree(src, day_dir + sub)
print(len(os.listdir(BD)))
for x in sorted(os.listdir(BD)): print(x, sorted(os.listdir(BD + x)))
