const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await prisma.student.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, batch: user.batch },
      process.env.JWT_SECRET || 'epic-ielts-secret',
      { expiresIn: '12h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, batch: user.batch }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await prisma.student.findUnique({ where: { email } });

    if (!user) {
      // Create a new student if they don't exist
      user = await prisma.student.create({
        data: {
          email,
          name,
          password: 'GOOGLE_AUTH_USER', // Placeholder
          role: 'STUDENT'
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, batch: user.batch },
      process.env.JWT_SECRET || 'epic-ielts-secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, batch: user.batch }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.get('/me', async (req, res) => {
  const auth = require('../middleware/auth');
  res.json({ message: 'Auth route working' });
});

module.exports = router;
