import townmap, render
INS_A = 'You are Student A. Your map shows the bank, the post office and the bus stop. The boxes with a ? are empty. Ask your partner: "Where\'s the hospital?" "Where\'s the cafe?" "Where\'s the school?" Listen to the answer. Write each name in the right empty box. Do not look at your partner\'s map. Then answer your partner\'s questions.'
INS_B = 'You are Student B. Your map shows the cafe, the hospital and the school. The boxes with a ? are empty. Ask your partner: "Where\'s the bank?" "Where\'s the post office?" "Where\'s the bus stop?" Listen to the answer. Write each name in the right empty box. Do not look at your partner\'s map. Then answer your partner\'s questions.'
def variant(x, which):
    """Return a copy of lesson x whose town map block is for student A or B."""
    known = townmap.A_KNOWS if which == 'A' else townmap.B_KNOWS
    y = dict(x); st = []
    for b in x['student']:
        if b.get('html') == '__MAP__':
            b = dict(b, title=f'Task 1: Town map (Student {which})', ins=INS_A if which == 'A' else INS_B, html=townmap.svg(known))
        st.append(b)
    y['student'] = st
    return y
def teacher_variant(x):
    y = dict(x); y['student'] = [dict(b, html=townmap.svg(townmap.ALL), ins='Answer map for the teacher.') if b.get('html') == '__MAP__' else b for b in x['student']]
    return y
def answer_map_page():
    return render.page('Answer map', "<div class='head teacher'><div class='top'><span>Teacher copy &middot; not for students</span><span class='gold'>Day 7 &middot; Answer map</span></div><h1>Town map: answer</h1><div class='sub'>Every building named. Check students maps against this.</div></div><div class='block'>" + townmap.svg(townmap.ALL) + "<div class='note'><ul><li>North side of Main Road, left to right: Bank, Post office, Cafe.</li><li>South side: Bus stop (opposite the bank), Park (opposite the post office), Hospital (opposite the cafe).</li><li>The school is behind the hospital.</li><li>Useful answers: The cafe is next to the post office. The hospital is opposite the cafe. The bus stop is opposite the bank.</li></ul></div></div>")
def market_cards_page():
    card = lambda title, items: f"<div style='border:2px dashed #9aa7bd;border-radius:3mm;padding:4mm;margin:3mm 0'><h2 style='margin:0 0 2mm'>{title}</h2><ul style='margin:0'>" + ''.join(f'<li>{i}</li>' for i in items) + '</ul></div>'
    body = ("<div class='head'><div class='top'><span>EPIC Campus &middot; Korea Scholarship Programme</span><span class='gold'>Day 9 &middot; Market cards</span></div><h1>Market role play: cards</h1><div class='sub'>Cut along the dashed lines. Half the class are shoppers. Half are shopkeepers.</div></div>"
            + "<div class='block'><h2>Shopper card</h2>" + card('Shopper', ['You have <b>Rs. 1,000</b>.', 'You need: rice (1 kilo), eggs (4), tomatoes (1 kilo).', 'Ask: How much is the rice? / How much are the eggs?', 'Say: I will take it, please. Here you are. Thank you.', 'Write what you bought and how much money is left: ______']) + card('Shopper', ['You have <b>Rs. 1,000</b>.', 'You need: rice (1 kilo), eggs (4), tomatoes (1 kilo).', 'Ask: How much is the rice? / How much are the eggs?', 'Say: I will take it, please. Here you are. Thank you.', 'Write what you bought and how much money is left: ______']) + "</div>"
            + "<div class='block'><h2>Shopkeeper card</h2>" + card('Shopkeeper: price list', ['Rice: <b>Rs. 250</b> a kilo', 'Eggs: <b>Rs. 50</b> each', 'Tomatoes: <b>Rs. 120</b> a kilo', 'Say: Hello! Can I help you? It is Rs. ___. Anything else? That is Rs. ___ in total.']) + card('Shopkeeper: price list', ['Rice: <b>Rs. 250</b> a kilo', 'Eggs: <b>Rs. 50</b> each', 'Tomatoes: <b>Rs. 120</b> a kilo', 'Say: Hello! Can I help you? It is Rs. ___. Anything else? That is Rs. ___ in total.']) + "</div>")
    return render.page('Market cards', body)
