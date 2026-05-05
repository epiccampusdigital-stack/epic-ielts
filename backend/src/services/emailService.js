const nodemailer = require('nodemailer');

function getMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn('Gmail not configured - emails disabled');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendNewPaperEmail(students, paper) {
  const mailer = getMailer();
  if (!mailer || !students?.length) return;

  const typeEmoji = { READING: '📖', WRITING: '✍️', LISTENING: '🎧', SPEAKING: '🗣️' };
  const emoji = typeEmoji[paper.testType] || '📋';

  for (const student of students) {
    try {
      await mailer.sendMail({
        from: `"EPIC IELTS" <${process.env.GMAIL_USER}>`,
        to: student.email,
        subject: `${emoji} New Test Available: ${paper.testType} ${paper.paperCode} — EPIC IELTS`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #1a1a2e, #1d4ed8); padding: 32px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
              <h1 style="color: #f59e0b; margin: 0 0 8px; font-size: 24px;">EPIC IELTS</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">New Test Available</p>
            </div>
            <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">Hi <strong>${student.name}</strong>,</p>
              <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">A new practice test has been added to your EPIC IELTS dashboard:</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #4f46e5;">
                <div style="font-size: 28px; margin-bottom: 8px;">${emoji}</div>
                <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${paper.testType} ${paper.paperCode}</div>
                <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">${paper.title}</div>
                <div style="font-size: 12px; color: #94a3b8;">⏱ ${paper.timeLimitMin} minutes</div>
              </div>
              <a href="https://epicielts.live/student/dashboard"
                style="display: block; text-align: center; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none;">
                Start Test Now →
              </a>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">
              You are receiving this because you are enrolled in EPIC IELTS.<br>
              Login at <a href="https://epicielts.live" style="color: #4f46e5;">epicielts.live</a>
            </p>
          </div>
        `
      });
      console.log('New paper email sent to:', student.email);
    } catch (err) {
      console.error('Failed to send email to', student.email, ':', err.message);
    }
  }
}

module.exports = { sendNewPaperEmail, getMailer };
