// Site-wide design tokens. One typeface, one action blue, a navy for callout panels,
// and a five-step grey ladder. Cards use a 1px hairline instead of shadows.
export const T = {
  font: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif",
  primary: '#0056d2',
  primaryPressed: '#0048b0',
  primarySoft: '#e3eeff',
  primaryXSoft: '#f0f6ff',
  navy: '#002761',
  navyMid: '#003b8f',
  navyText: '#c9d6ec',
  ink: '#0f1114',
  inkSoft: '#1e2229',
  muted: '#5b6780',
  mid: '#8495b0',
  hairline: '#dae1ed',
  tint: '#e8eef7',
  canvas: '#ffffff',
  success: '#276a1a',
  successSoft: '#e9f5e6',
  warning: '#a32e00',
  warningSoft: '#fff4e8',
  error: '#d30a28',
  errorSoft: '#fdecee',
  r: { xs: 2, sm: 4, md: 8, lg: 16, xl: 24, full: 50 },
};

export const btn = {
  primary: {
    height: 40, padding: '0 16px', borderRadius: 8, border: 0, background: T.primary, color: '#fff',
    fontFamily: T.font, fontSize: 14, fontWeight: 600, letterSpacing: '0.14px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', whiteSpace: 'nowrap',
  },
  secondary: {
    height: 40, padding: '0 16px', borderRadius: 8, border: `1px solid ${T.ink}`, background: '#fff', color: T.ink,
    fontFamily: T.font, fontSize: 14, fontWeight: 600, letterSpacing: '0.14px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', whiteSpace: 'nowrap',
  },
};

export const card = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16 };
