// Very small markdown renderer for AI answers: headings, bold, lists, tables and paragraphs.
// Everything is rendered as React text (no HTML injection).
function inline(text, keyBase) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(p)) return <code key={`${keyBase}-${i}`} style={{ background: '#eef3fb', padding: '0 5px', borderRadius: 4 }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

export default function MiniMarkdown({ text }) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const out = [];
  let list = null; let table = null;
  const flushList = () => { if (list) { const L = list.ordered ? 'ol' : 'ul'; out.push(<L key={`l${out.length}`} style={{ margin: '4px 0 10px', paddingLeft: 22 }}>{list.items.map((it, i) => <li key={i} style={{ margin: '3px 0' }}>{inline(it, `li${out.length}${i}`)}</li>)}</L>); list = null; } };
  const flushTable = () => {
    if (table) {
      const rows = table.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r)).map(r => r.replace(/^\s*\||\|\s*$/g, '').split('|').map(c => c.trim()));
      out.push(
        <div key={`t${out.length}`} style={{ overflowX: 'auto', margin: '6px 0 12px' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => {
              const Cell = i === 0 ? 'th' : 'td';
              return <Cell key={j} style={{ border: '1px solid #dae1ed', padding: '5px 9px', background: i === 0 ? '#f0f6ff' : '#fff', textAlign: 'left' }}>{inline(c, `c${i}${j}`)}</Cell>;
            })}</tr>)}</tbody>
          </table>
        </div>,
      );
      table = null;
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(line)) { flushList(); (table = table || []).push(line); return; }
    flushTable();
    const ul = line.match(/^\s*[-*•]\s+(.*)$/); const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((ul || ol)[1]);
      return;
    }
    flushList();
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) { out.push(<div key={`h${idx}`} style={{ fontWeight: 700, fontSize: 16, margin: '12px 0 4px', color: '#002761' }}>{inline(h[1], `h${idx}`)}</div>); return; }
    if (!line.trim()) return;
    out.push(<p key={`p${idx}`} style={{ margin: '0 0 9px', lineHeight: 1.6 }}>{inline(line, `p${idx}`)}</p>);
  });
  flushList(); flushTable();
  return <>{out}</>;
}
