const express = require('express');
const router = express.Router();
const { agentChat } = require('../services/agentChat');

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const DAILY_LIMIT = 20;

function checkRateLimit(ip) {
  const now = Date.now();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt });
    return true;
  }
  if (entry.count >= DAILY_LIMIT) return false;
  entry.count += 1;
  return true;
}

// POST /api/agent/chat
router.post('/chat', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Daily limit reached. Please WhatsApp us directly: +94 77 764 4946'
      });
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Validate message shape — role must be 'user' or 'assistant'
    const valid = messages.every(
      m => (m.role === 'user' || m.role === 'assistant') &&
           typeof m.content === 'string' &&
           m.content.trim().length > 0
    );
    if (!valid) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Max 20 messages in history to prevent token abuse
    const trimmed = messages.slice(-20);

    const reply = await agentChat(trimmed);
    res.json({ reply });

  } catch (err) {
    console.error('Agent chat error:', err.message);
    res.status(500).json({
      error: 'Something went wrong. Please try again or WhatsApp us directly.'
    });
  }
});

module.exports = router;
