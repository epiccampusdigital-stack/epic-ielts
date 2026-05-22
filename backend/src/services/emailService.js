const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// FROM address — update to noreply@epicielts.live once domain verified
const FROM = 'EPIC IELTS <onboarding@resend.dev>';

const BASE_URL = process.env.FRONTEND_URL || 'https://epicielts.live';

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — skipping:', subject);
    return;
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    console.log('[Email] Sent:', subject, 'to', to, '→', result.data?.id || result.id);
    return result;
  } catch (err) {
    console.error('[Email] Failed:', subject, 'to', to, '→', err.message);
  }
}

function emailWrapper(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);
                    border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:white;
                      letter-spacing:-0.02em;">EPIC IELTS</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);
                      margin-top:4px;letter-spacing:0.08em;
                      text-transform:uppercase;">by EPIC Campus</div>
        </div>
        
        <!-- Body -->
        <div style="background:white;padding:40px 32px;
                    border-left:1px solid #E2E8F0;
                    border-right:1px solid #E2E8F0;">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background:#F1F5F9;border-radius:0 0 16px 16px;
                    padding:24px 32px;text-align:center;
                    border:1px solid #E2E8F0;border-top:none;">
          <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
            EPIC Campus · 59/2 Sri Dewamitta Road, China Garden, Galle, Sri Lanka
          </p>
          <p style="margin:0;font-size:12px;color:#94A3B8;">
            <a href="https://epicielts.live" 
               style="color:#4F46E5;text-decoration:none;">epicielts.live</a>
            &nbsp;·&nbsp;
            <a href="mailto:info@epiccampus.lk" 
               style="color:#4F46E5;text-decoration:none;">info@epiccampus.lk</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

async function sendWelcomeEmail({ name, email }) {
  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;
               color:#0F172A;">Welcome to EPIC IELTS, ${name}! 🎓</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Your account is ready. Start with your free placement test to see 
      where you stand across all 4 skills.
    </p>
    
    <div style="background:#EEF2FF;border-radius:12px;padding:20px;
                margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;
                color:#4F46E5;text-transform:uppercase;
                letter-spacing:0.08em;">What's free</p>
      <ul style="margin:0;padding-left:20px;color:#475569;
                 font-size:14px;line-height:1.8;">
        <li>1 free exam per skill (Reading, Writing, Listening, Speaking)</li>
        <li>AI examiner feedback on every attempt</li>
        <li>Instant band score estimates</li>
        <li>Free placement test to find your level</li>
      </ul>
    </div>
    
    <a href="${BASE_URL}/placement-test"
       style="display:inline-block;background:#4F46E5;color:white;
              text-decoration:none;padding:14px 28px;border-radius:12px;
              font-size:15px;font-weight:600;">
      Take Your Free Placement Test →
    </a>
    
    <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;">
      Questions? WhatsApp us: 
      <a href="https://wa.me/94766528585" 
         style="color:#4F46E5;">+94 76 652 8585</a>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: 'Welcome to EPIC IELTS 🎓',
    html,
  });
}

async function sendPaymentConfirmationEmail({ name, email, amountLKR, levelNumber }) {
  const isFullAccess = levelNumber === 99;
  const accessText = isFullAccess
    ? 'Full access to all practice papers'
    : `Level ${levelNumber} programme`;

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:16px;">✅</div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;
                 color:#0F172A;">Payment Confirmed</h1>
      <p style="margin:0;font-size:15px;color:#475569;">
        Thank you, ${name}. Your access is now active.
      </p>
    </div>
    
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;
                border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;
                color:#059669;text-transform:uppercase;
                letter-spacing:0.08em;">What you unlocked</p>
      <p style="margin:0;font-size:16px;font-weight:600;
                color:#0F172A;">${accessText}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#475569;">
        LKR ${amountLKR?.toLocaleString() || '—'} · Payment received
      </p>
    </div>
    
    <a href="${BASE_URL}/practice"
       style="display:inline-block;background:#4F46E5;color:white;
              text-decoration:none;padding:14px 28px;border-radius:12px;
              font-size:15px;font-weight:600;">
      Start Practising →
    </a>
    
    <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;">
      Keep this email as your receipt. Questions? 
      <a href="mailto:info@epiccampus.lk" 
         style="color:#4F46E5;">info@epiccampus.lk</a>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: '✅ Payment confirmed — EPIC IELTS',
    html,
  });
}

async function sendAccessGrantedEmail({ name, email }) {
  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;
               color:#0F172A;">Your access has been unlocked 🔓</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Great news, ${name}! EPIC IELTS has granted you full access to 
      all practice papers.
    </p>
    
    <div style="background:#EEF2FF;border-radius:12px;padding:20px;
                margin-bottom:24px;">
      <ul style="margin:0;padding-left:20px;color:#475569;
                 font-size:14px;line-height:1.8;">
        <li>All Reading, Writing, Listening & Speaking papers</li>
        <li>AI examiner feedback on every attempt</li>
        <li>Full progress tracking across all skills</li>
        <li>Level programme tailored to your placement band</li>
      </ul>
    </div>
    
    <a href="${BASE_URL}/practice"
       style="display:inline-block;background:#4F46E5;color:white;
              text-decoration:none;padding:14px 28px;border-radius:12px;
              font-size:15px;font-weight:600;">
      Go to Practice Papers →
    </a>
  `);

  return sendEmail({
    to: email,
    subject: 'Your EPIC IELTS access is unlocked 🔓',
    html,
  });
}

async function sendNewPaperEmail({ name, email, paperTitle, skill }) {
  const skillEmoji = {
    READING: '📖', WRITING: '✍️',
    LISTENING: '🎧', SPEAKING: '🎤',
  }[skill] || '📄';

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;
               color:#0F172A;">New practice paper added ${skillEmoji}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Hi ${name}, a new ${skill.toLowerCase()} paper is now available 
      on EPIC IELTS.
    </p>
    
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;
                border-left:4px solid #4F46E5;border-radius:0 12px 12px 0;
                padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;
                color:#4F46E5;text-transform:uppercase;
                letter-spacing:0.08em;">${skill}</p>
      <p style="margin:0;font-size:16px;font-weight:600;
                color:#0F172A;">${paperTitle}</p>
    </div>
    
    <a href="${BASE_URL}/practice"
       style="display:inline-block;background:#4F46E5;color:white;
              text-decoration:none;padding:14px 28px;border-radius:12px;
              font-size:15px;font-weight:600;">
      Try It Now →
    </a>
  `);

  return sendEmail({
    to: email,
    subject: `New ${skill.toLowerCase()} paper available on EPIC IELTS ${skillEmoji}`,
    html,
  });
}

async function sendAnnouncementEmail({ name, email, subject, message }) {
  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;
               color:#0F172A;">${subject}</h1>
    <div style="font-size:15px;color:#475569;line-height:1.7;
                white-space:pre-wrap;">${message}</div>
    <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0;">
    <p style="margin:0;font-size:13px;color:#94A3B8;">
      You're receiving this because you have an EPIC IELTS account.
    </p>
  `);

  return sendEmail({ to: email, subject, html });
}

module.exports = {
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
  sendAccessGrantedEmail,
  sendNewPaperEmail,
  sendAnnouncementEmail,
};
