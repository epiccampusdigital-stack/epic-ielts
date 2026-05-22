const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../services/emailService');
const prisma = new PrismaClient();

// Simple in-memory rate limiter: 5 attempts per IP per 15 minutes
const loginAttempts = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const record = loginAttempts.get(ip);
  if (record) {
    // Purge attempts older than the window
    record.times = record.times.filter(t => now - t < windowMs);
    if (record.times.length >= maxAttempts) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
    }
    record.times.push(now);
  } else {
    loginAttempts.set(ip, { times: [now] });
  }
  next();
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role, name: user.name, email: user.email, batch: user.batch, isPaid: user.isPaid },
  process.env.JWT_SECRET || 'epic-ielts-secret',
  { expiresIn: '12h' }
);

// LOGIN
router.post('/login', rateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const normalizedEmail = email.toLowerCase().trim();

    // Hardcoded admin login — never touches DB
    if (normalizedEmail === ADMIN_EMAIL) {
      const adminPassword = process.env.ADMIN_PASSWORD || '';
      if (!adminPassword || password !== adminPassword)
        return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign(
        { id: 0, role: 'ADMIN', name: 'Admin', email: normalizedEmail, batch: null },
        process.env.JWT_SECRET || 'epic-ielts-secret',
        { expiresIn: '12h' }
      );
      return res.json({
        token,
        user: { id: 0, name: 'Admin', email: normalizedEmail, role: 'ADMIN', batch: null, isPaid: true }
      });
    }

    const user = await prisma.student.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Block any DB user with ADMIN role (security: admin must use env var only)
    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Use admin credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    // Temporarily disabled — email verification not required for login
    // if (!user.emailVerified) {
    //   return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before logging in. Check your inbox for the verification link.' });
    // }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, batch: user.batch,
        city: user.city, expectedBand: user.expectedBand,
        isPaid: user.isPaid
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address, age, city, phone, expectedBand } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const normalizedEmail = email.toLowerCase().trim();

    // Block admin email from being registered
    if (normalizedEmail === ADMIN_EMAIL)
      return res.status(400).json({ error: 'This email cannot be used for registration' });

    const existing = await prisma.student.findUnique({ where: { email: normalizedEmail } });
    if (existing)
      return res.status(400).json({ error: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.student.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
        address: address?.trim() || null,
        age: age ? parseInt(age) : null,
        city: city?.trim() || null,
        phone: phone?.trim() || null,
        expectedBand: expectedBand ? parseFloat(expectedBand) : null,
        role: 'STUDENT',
        batch: 'GENERAL',
        emailVerified: true,
        verificationToken
      }
    });

    // Send welcome email (fire-and-forget — never blocks signup)
    sendWelcomeEmail({ name: user.name, email: user.email });

    res.json({ success: true, message: 'Account created! You can log in now.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// GOOGLE AUTH
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name } = ticket.getPayload();
    const normalizedEmail = email.toLowerCase().trim();

    // Block admin email from Google auth
    if (normalizedEmail === ADMIN_EMAIL)
      return res.status(403).json({ error: 'This email cannot be used for Google login' });

    let user = await prisma.student.findUnique({ where: { email: normalizedEmail } });

    // Block DB admin/teacher users
    if (user && (user.role === 'ADMIN' || user.role === 'TEACHER'))
      return res.status(403).json({ error: 'Access denied.' });

    if (!user) {
      user = await prisma.student.create({
        data: { email: normalizedEmail, name, password: 'GOOGLE_AUTH', role: 'STUDENT', batch: 'GENERAL' }
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, batch: user.batch,
        isPaid: user.isPaid
      }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Invalid verification link' });

    const user = await prisma.student.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' });

    await prisma.student.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });

    res.json({ success: true, message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
