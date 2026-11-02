import sys, json, re, html
P = json.load(open('/tmp/claude-0/-home-claude/0a8bee2c-181d-5490-895e-7d68bcfbbf12/scratchpad/readers.json'))
STOP = set('the a an of to in on at is are was were it he she they his her their and or but for with from by as that this be has have had not do does did what where when how which who why your you i we my our us'.split())
def words(s): return {w for w in re.findall(r"[a-z0-9']+", s.lower()) if w not in STOP}
def segs(text):
    # split into sentences / lines, keeping offsets
    out = []; pos = 0
    for m in re.finditer(r'[^.\n]*[.\n]+|[^.\n]+$', text):
        t = m.group(0)
        if t.strip(): out.append((m.start(), m.end()))
    return out
def locate(passage, q, opt_text):
    text = passage['text']
    ans = q['answer']
    if 'NOT GIVEN' in ans: return []
    quotes = re.findall(r'"([^"]+)"', q.get('explanation', ''))
    spans = []
    for qt in quotes:
        qt = qt.strip().rstrip('.').strip()
        i = text.lower().find(qt.lower())
        if i >= 0: spans.append((i, i + len(qt)))
    if spans: return spans
    ex = q.get('explanation', '') + ' ' + opt_text + ' ' + (q['answer'] if q['type'] == 'SENTENCE_COMPLETION' else '') + ' ' + q['content']
    ew = words(ex)
    best = None
    for (a, b) in segs(text):
        sc = len(words(text[a:b]) & ew)
        if best is None or sc > best[0]: best = (sc, a, b)
    return [(best[1], best[2])] if best and best[0] > 0 else []
def mapping():
    res = []
    for p in P:
        n = 0; items = []
        for ps in p['passages']:
            hits = []
            for g in ps['groups']:
                for q in g['questions']:
                    n += 1
                    opt = ''
                    if q['type'] == 'MULTIPLE_CHOICE':
                        opt = q['options']['ABCD'.index(q['answer'])]
                    sp = locate(ps, q, opt)
                    hits.append((n, q, sp))
            items.append((ps, hits))
        res.append((p, items))
    return res
if __name__ == '__main__':
    for p, items in mapping():
        print('=====', p['code'])
        for ps, hits in items:
            for n, q, sp in hits:
                print(n, q['answer'][:20], '|', q['content'][:50], '=>', [ps['text'][a:b].strip()[:80] for a, b in sp])
