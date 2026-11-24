// Shared engine for the Class drill pages: each page sets SECS and PAGE_KEY, then loads this file.
const $ = (s, el = document) => el.querySelector(s);
// ---- progress: a finished drill shows ✓ on its tab, and the Class page shows how many are done ----
const PKEY = 'class-progress', PAGE = location.pathname.split('/').pop() || 'page';
function progGet() { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch { return {}; } }
function progSave(id, got, of, total) { try { const all = progGet(); all[PAGE] = all[PAGE] || {}; all[PAGE][id] = [got, of]; all[PAGE]._total = total; localStorage.setItem(PKEY, JSON.stringify(all)); } catch { /* blocked */ } }
function tabDone(id, got, of) { const b = document.querySelector(`nav button[data-id="${id}"]`); if (!b) return; b.classList.add('done'); const sc = b.querySelector('.sc'); if (sc) sc.textContent = of ? `✓ ${got}/${of}` : '✓'; }

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9:./%]/g, '');
const store = { get(k) { try { return JSON.parse(localStorage.getItem(PAGE_KEY + k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(PAGE_KEY + k, JSON.stringify(v)); } catch { /* blocked */ } } };
let voice = null;
function pickVoice() { const v = speechSynthesis.getVoices(); voice = v.find(x => x.lang === 'en-GB' && /google|natural/i.test(x.name)) || v.find(x => x.lang === 'en-GB') || v.find(x => /^en/.test(x.lang)) || null; }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
const L = 'ABCDEFGHIJ';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let html = '';
for (const S of SECS) {
  let qs = '';
  S.items.forEach((it, i) => {
    let body = '';
    if (S.type === 'text') body = `${esc(it[0])}: <input type="text" data-i="${i}" aria-label="${esc(it[0])}">`;
    if (S.type === 'listenmc') body = `<button class="play" data-s="${S.id}" data-i="${i}">▶ Play (2 left)</button><b>${esc(it[0])}</b><div class="opts" style="display:grid;gap:6px">${it[2].map((o, k) => `<label><input type="radio" name="${S.id}${i}" value="${k}">${L[k]}. ${esc(o)}</label>`).join('')}</div>`;
    if (S.type === 'mcq') body = `<b>${esc(it[0])}</b><div class="opts" style="display:grid;gap:6px">${it[1].map((o, k) => `<label><input type="radio" name="${S.id}${i}" value="${k}">${L[k]}. ${esc(o)}</label>`).join('')}</div>`;
    if (S.type === 'listen') body = `<button class="play" data-s="${S.id}" data-i="${i}">▶ Play (2 left)</button>${esc(it[0])}: <input type="text" data-i="${i}" aria-label="${esc(it[0])}">`;
    if (S.type === 'mc') body = `<b>${esc(it[0])}</b><div class="opts">${S.opts.map((o, k) => `<label><input type="radio" name="${S.id}${i}" value="${k}">${o}</label>`).join('')}</div>`;
    if (S.type === 'mcl') body = `<div class="opts" style="display:grid;gap:6px">${it[0].map((o, k) => `<label><input type="radio" name="${S.id}${i}" value="${k}">${L[k]}. ${esc(o)}</label>`).join('')}</div>`;
    if (S.type === 'select') body = `<b>${esc(it[0])}</b> = <select data-i="${i}"><option value="">Choose…</option>${S.list.map((o, k) => `<option value="${k}">${L[k]}. ${esc(o)}</option>`).join('')}</select>`;
    if (S.type === 'gap') body = esc(it[0]).replace('________', `<select data-i="${i}"><option value="">________</option>${S.words.map((o, k) => `<option value="${k}">${o}</option>`).join('')}</select>`);
    qs += `<div class="q"><div class="qn">${i + 1}</div><div>${body}<div class="fb"></div></div></div>`;
  });
  html += `<section id="${S.id}" data-min="${S.min}"><h2>${S.title}</h2><div class="tip">${S.tip}</div>${(S.type === 'listen' || S.type === 'listenmc') && !('speechSynthesis' in window) ? '<div class="tip" style="border-color:var(--bad)"><b>Sound is not available in this browser.</b> Please use Google Chrome or Microsoft Edge.</div>' : ''}${S.text ? `<div class="text">${S.text}</div>` : ''}<div class="bar"><span class="timer">--:--</span><button class="btn start">Start</button><button class="btn sec check">Check</button><span class="score"></span></div>${S.type === 'select' ? `<div class="tip" style="border-color:var(--accent)"><b>Phrases in the text:</b> ${S.list.map((o, k) => `${L[k]}. ${esc(o)}`).join(' · ')}</div>` : ''}<div class="qs">${qs}</div>${S.fb ? `<div class="fb fbend" style="display:none"><b>Tip:</b> ${S.fb}</div>` : ''}</section>`;
}
$('#secs').innerHTML = html;
const nav = $('#nav');
SECS.forEach((S, i) => { const b = document.createElement('button'); b.dataset.id = S.id; b.innerHTML = `${i + 1}. ${S.name} <span class="sc"></span>`; b.onclick = () => show(S.id); nav.appendChild(b); });
function show(id) { document.querySelectorAll('section').forEach(s => s.classList.toggle('on', s.id === id)); nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id)); store.set('tab', id); }
const plays = {};
document.addEventListener('click', e => {
  const b = e.target.closest('.play'); if (!b) return;
  const S = SECS.find(x => x.id === b.dataset.s), k = b.dataset.s + b.dataset.i; plays[k] = (plays[k] || 0) + 1;
  const u = new SpeechSynthesisUtterance(S.items[b.dataset.i][1]); u.lang = 'en-GB'; u.rate = 0.9; if (voice) u.voice = voice;
  speechSynthesis.cancel(); setTimeout(() => speechSynthesis.speak(u), 120);
  const left = 2 - plays[k]; b.textContent = left > 0 ? `▶ Play (${left} left)` : 'Played twice'; if (left <= 0) b.disabled = true;
});
function mark(S) {
  const sec = $('#' + S.id); let g = 0;
  S.items.forEach((it, i) => {
    const q = sec.querySelectorAll('.q')[i], fbx = q.querySelector('.fb'); let ok = false, right = '', why = '';
    if (S.type === 'listen') { const inp = q.querySelector('input'); ok = it[2].some(a => norm(a) === norm(inp.value)); inp.classList.add(ok ? 'right' : 'wrong'); right = it[2][0].toUpperCase(); why = `Audio: "${it[1]}"`; }
    if (S.type === 'text') { const inp = q.querySelector('input'); ok = it[1].some(a => norm(a) === norm(inp.value)); inp.classList.add(ok ? 'right' : 'wrong'); right = it[1][0].toUpperCase(); why = it[2] || ''; }
    if (S.type === 'listenmc') { const c = q.querySelector('input:checked'); ok = !!c && +c.value === it[3]; q.querySelectorAll('label').forEach((l, k) => { if (k === it[3]) l.classList.add('right'); else if (l.querySelector('input').checked) l.classList.add('wrong'); }); right = `${L[it[3]]}. ${it[2][it[3]]}`; why = `${it[4]} Audio: "${it[1]}"`; }
    if (S.type === 'mcq') { const c = q.querySelector('input:checked'); ok = !!c && +c.value === it[2]; q.querySelectorAll('label').forEach((l, k) => { if (k === it[2]) l.classList.add('right'); else if (l.querySelector('input').checked) l.classList.add('wrong'); }); right = `${L[it[2]]}. ${it[1][it[2]]}`; why = it[3] || ''; }
    if (S.type === 'mc' || S.type === 'mcl') { const c = q.querySelector('input:checked'); ok = !!c && +c.value === it[1]; q.querySelectorAll('label').forEach((l, k) => { if (k === it[1]) l.classList.add('right'); else if (l.querySelector('input').checked) l.classList.add('wrong'); }); right = S.type === 'mc' ? S.opts[it[1]] : `${L[it[1]]}`; why = it[2]; }
    if (S.type === 'select') { const s = q.querySelector('select'); ok = s.value === String(it[1]); s.classList.add(ok ? 'right' : 'wrong'); right = `${L[it[1]]}. ${S.list[it[1]]}`; }
    if (S.type === 'gap') { const s = q.querySelector('select'); ok = s.value === String(it[1]); s.classList.add(ok ? 'right' : 'wrong'); right = S.words[it[1]]; why = it[2]; }
    if (ok) g++;
    fbx.innerHTML = `<b>${esc(right)}</b>${why ? ' · ' + esc(why) : ''}`;
  });
  const end = sec.querySelector('.fbend'); if (end) end.style.display = 'block';
  $(`#${S.id} .score`).textContent = `${g} / ${S.items.length}`; nav.querySelector(`[data-id=${S.id}] .sc`).textContent = `${g}/${S.items.length}`;
  tabDone(S.id, g, S.items.length); progSave(S.id, g, S.items.length, SECS.length);
}
SECS.forEach(S => {
  const sec = $('#' + S.id), t = $('.timer', sec), start = $('.start', sec), check = $('.check', sec);
  let left = S.min * 60, iv = null, done = false;
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  t.textContent = fmt(left);
  const finish = () => { if (done) return; done = true; clearInterval(iv); start.disabled = true; check.disabled = true; t.textContent = "Time's up"; mark(S); sec.querySelectorAll('input,select').forEach(x => { x.disabled = true; }); };
  start.onclick = () => { if (iv || done) return; start.textContent = 'Running…'; start.disabled = true; iv = setInterval(() => { left--; t.textContent = fmt(left); t.classList.toggle('low', left <= 60); if (left <= 0) finish(); }, 1000); };
  check.onclick = finish;
});
{ const mine = progGet()[PAGE] || {}; SECS.forEach(S => { if (mine[S.id]) tabDone(S.id, mine[S.id][0], mine[S.id][1]); }); }
show(store.get('tab') || SECS[0].id);
