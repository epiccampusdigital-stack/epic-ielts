const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

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

router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, type } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true, batch: true }
    });

    const feedback = await prisma.feedback.create({
      data: {
        studentId: req.user.id,
        subject: subject || 'General Feedback',
        message: message.trim(),
        type: type || 'FEEDBACK',
        status: 'OPEN'
      }
    });

    const mailer = getMailer();
    if (mailer) {
      try {
        await mailer.sendMail({
          from: `"EPIC IELTS Platform" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          subject: `[EPIC IELTS] ${type || 'Feedback'}: ${subject || 'New Message'} — ${student?.name}`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
              <div style="background: #1a1a2e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 20px;">EPIC IELTS — New ${type || 'Feedback'}</h1>
              </div>
              <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 8px 0; color: #94a3b8; width: 120px;">From</td><td style="font-weight: 600;">${student?.name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Email</td><td>${student?.email}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Batch</td><td>${student?.batch || 'General'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Type</td><td><span style="background: #eff6ff; color: #1d4ed8; padding: 2px 10px; border-radius: 20px; font-weight: 600;">${type || 'FEEDBACK'}</span></td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Subject</td><td style="font-weight: 600;">${subject || '—'}</td></tr>
                </table>
                <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #4f46e5;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #1e293b;">${message.replace(/\n/g, '<br>')}</p>
                </div>
              </div>
              <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">Reply directly to ${student?.email} to respond to this student.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    res.json({ success: true, id: feedback.id });
  } catch (err) {
    console.error('Feedback submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        student: { select: { name: true, email: true, batch: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const feedback = await prisma.feedback.update({
      where: { id: parseInt(req.params.id) },
      data: { status, adminNote }
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
