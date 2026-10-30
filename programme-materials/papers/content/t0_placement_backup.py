# Paper copy of the Day 1 placement test, built from the same content as the website version
import json, os
P = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'placement.json')))
pt1, pt2, pt3, pt4 = P

def qblocks(groups, start):
    blocks, n, keys = [], start, []
    for g in groups:
        qs = g['questions']
        if g['type'] == 'MULTIPLE_CHOICE':
            blocks.append(dict(t='mcq', title='', ins=g.get('instruction', ''), items=[(q['content'].replace('________', '___').replace('___', '______'), q['options']) for q in qs]))
            keys += [f"{n + i}: {q['answer']}" for i, q in enumerate(qs)]
        elif g['type'] == 'TRUE_FALSE_NOT_GIVEN':
            blocks.append(dict(t='tf', title='', ins=g.get('instruction', ''), labels=['TRUE', 'FALSE', 'NOT GIVEN'], items=[q['content'] for q in qs]))
            keys += [f"{n + i}: {q['answer']}" for i, q in enumerate(qs)]
        else:
            blocks.append(dict(t='gap', title='', ins=g.get('instruction', ''), items=[q['content'].replace('________', '___') for q in qs]))
            keys += [f"{n + i}: {q['answer'].replace('|', ' / ')}" for i, q in enumerate(qs)]
        n += len(qs)
    return blocks, n, keys

student, keys, n = [dict(t='note', title='Instructions', items=[
    'Use this paper only if the computers or the internet are not working. Otherwise students take the test on epicielts.live.',
    'Part 1: 45 minutes. Part 2: 20 minutes. Part 3: 40 minutes. Part 4: speaking, one by one with the teacher.',
    'Circle or write your answers on this paper.'])], [], 1
for i, ps in enumerate(pt1['passages']):
    if i:
        student.append(dict(t='pagebreak'))
    student.append(dict(t='passage', title=f"Part 1{'abc'[i]}: {ps['title'].split(': ', 1)[-1]}", text=ps['text']))
    b, n, k = qblocks(ps['groups'], n)
    student += b; keys.append(f"**{ps['title']}:** " + ', '.join(k))
student.append(dict(t='pagebreak'))
student.append(dict(t='note', title='Part 2: Listening', items=['Your teacher will read two short recordings. You will hear each one twice.']))
lkeys = []
for s in pt2['sections']:
    b, n, k = qblocks(s['groups'], n)
    student += b; lkeys += k
keys.append('**Listening:** ' + ', '.join(lkeys))
student.append(dict(t='pagebreak'))
for t in pt3['tasks']:
    student.append(dict(t='write', title=f"Part 3: Writing, task {t['taskNumber']} ({t['minWords']}+ words, about {t['timeMinutes']} minutes)", ins=t['prompt'], n=9 if t['taskNumber'] == 1 else 13))

script_lines = []
for num in sorted(json.loads(pt2['audioScript']).keys()):
    script_lines.append(('', f'— Recording {num} —'))
    for line in json.loads(pt2['audioScript'])[num].split('\n'):
        if ':' in line:
            w, x = line.split(':', 1); script_lines.append((w.strip(), x.strip()))
        elif line.strip():
            script_lines.append(('', line.strip()))

LESSONS = [dict(folder='Tests', kind='Placement test (paper backup)', day=1, theme='Placement test - paper backup', time='9:00 to 10:45 (parts 1 to 3) and 1:00 to 2:00 (part 4)', who='Campus staff (parts 1 to 3) and English Teacher 2 (part 4)',
    title='Placement test: paper version', focus='The same four-part test as on the website, for use if the computers are not available.',
    student=student,
    teacher=dict(need='Student papers, a clock, this script for Part 2, a quiet room for Part 4',
        aims=['Give every student a score out of 100 and a level on Day 1, even without computers'],
        steps=[(45, 'Part 1', 'Grammar, vocabulary and reading.'), (20, 'Part 2', 'Read each recording twice at a slow, natural pace.'), (40, 'Part 3', 'Writing, two tasks.'), (60, 'Part 4 (1:00 to 2:00)', 'Speaking, one by one with English Teacher 2, about 5 minutes each, while the others start the Foundation 1 worksheet.')],
        script=dict(head='Part 2 recordings', lines=script_lines),
        answers=keys + ['**Scoring:** each part is a score out of 100. Part 1 = correct answers out of 40 x 2.5. Part 2 = correct answers x 10. Part 3 and Part 4: use the writing and speaking rubrics in the mid-programme test (score out of 20 x 5).',
                        'Overall = average of the four parts. Levels: 90+ B2, 75 to 89 B1, 50 to 74 A2, 25 to 49 A1, 0 to 24 Pre-A1. Add the scores to the tracker so groups can be made.'],
        extra=[('Part 4: speaking questions', [f"**Part {s['number']} ({s['description']}):** " + ' / '.join(s['questions']) for s in pt4['sections']])]))]
