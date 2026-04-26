const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role, name: user.name, email: user.email, batch: user.batch },
  process.env.JWT_SECRET || 'epic-ielts-secret',
  { expiresIn: '12h' }
);

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, batch: user.batch,
        city: user.city, expectedBand: user.expectedBand
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

    const existing = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existing)
      return res.status(400).json({ error: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        address: address?.trim() || null,
        age: age ? parseInt(age) : null,
        city: city?.trim() || null,
        phone: phone?.trim() || null,
        expectedBand: expectedBand ? parseFloat(expectedBand) : null,
        role: 'STUDENT',
        batch: 'GENERAL'
      }
    });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, batch: user.batch,
        city: user.city, expectedBand: user.expectedBand
      }
    });
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
    let user = await prisma.student.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.student.create({
        data: { email, name, password: 'GOOGLE_AUTH', role: 'STUDENT', batch: 'GENERAL' }
      });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, batch: user.batch }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

module.exports = router;
