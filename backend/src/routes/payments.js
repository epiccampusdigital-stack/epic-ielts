const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Initialize Stripe per-request so env vars are always resolved at call time
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('REPLACE_WITH') || key.includes('placeholder')) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return require('stripe')(key);
}

const LEVEL_PRODUCTS = {
  1:  { name: 'Level 1 — Foundation',          amount: 200000,  amountLKR: 2000  },
  2:  { name: 'Level 2 — Elementary',           amount: 200000,  amountLKR: 2000  },
  3:  { name: 'Level 3 — Intermediate',         amount: 200000,  amountLKR: 2000  },
  4:  { name: 'Level 4 — Upper Intermediate',   amount: 200000,  amountLKR: 2000  },
  5:  { name: 'Level 5 — Advanced',             amount: 200000,  amountLKR: 2000  },
  99: { name: 'Full Access — All 5 Levels',     amount: 1000000, amountLKR: 10000 },
};

// ─── EXISTING FULL-ACCESS CHECKOUT (kept for backward compat) ───────────────

// POST /api/payments/create-checkout
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: 'EPIC IELTS — Full Access',
            description: 'Lifetime access to all Reading, Writing, Listening and Speaking practice tests with AI feedback.'
          },
          unit_amount: 1000000
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancelled`,
      metadata: { userId: String(req.user.id) }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Create checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─── NEW LEVEL CHECKOUT ──────────────────────────────────────────────────────

// POST /api/payments/create-level-checkout
router.post('/create-level-checkout', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { levelNumber } = req.body;
    const num = parseInt(levelNumber);

    const product = LEVEL_PRODUCTS[num];
    if (!product) return res.status(400).json({ error: 'Invalid level number' });

    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      select: { id: true, hasFullAccess: true, studentLevels: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Already has full access
    if (student.hasFullAccess || (num !== 99 && student.studentLevels.some(sl => sl.levelNumber === num || sl.levelNumber === 99))) {
      return res.status(400).json({ error: 'Already purchased' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `EPIC IELTS — ${product.name}`,
            description: num === 99
              ? 'Full access to all 5 levels — 15 complete mock tests across all 4 skills'
              : 'Access to 3 complete mock tests (Reading, Writing, Listening & Speaking) at this level',
          },
          unit_amount: product.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?level=${num}`,
      cancel_url: `${frontendUrl}/levels`,
      metadata: {
        studentId: String(student.id),
        levelNumber: String(num),
        type: 'level_purchase',
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create level checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─── STRIPE WEBHOOK ─────────────────────────────────────────────────────────

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // ── New level purchase flow ─────────────────────────────────────────────
    if (session.metadata?.type === 'level_purchase') {
      const studentId = parseInt(session.metadata.studentId);
      const levelNumber = parseInt(session.metadata.levelNumber);
      const amountLKR = Math.round((session.amount_total || 0) / 100);

      try {
        // Idempotent: only create if session not already recorded
        const existing = await prisma.studentLevel.findFirst({
          where: { stripeSessionId: session.id }
        });

        if (!existing) {
          await prisma.studentLevel.create({
            data: { studentId, levelNumber, stripeSessionId: session.id, amountLKR }
          });

          // Mark full access if level 99 (or if all 5 levels now purchased)
          if (levelNumber === 99) {
            await prisma.student.update({
              where: { id: studentId },
              data: { hasFullAccess: true, isPaid: true, paidAt: new Date() }
            });
          } else {
            await prisma.student.update({
              where: { id: studentId },
              data: { isPaid: true }
            });
          }

          console.log(`Level ${levelNumber} purchased by student ${studentId} (LKR ${amountLKR})`);
        }
      } catch (dbErr) {
        console.error('DB error on level purchase webhook:', dbErr);
      }

    // ── Old full-access flow (backward compat) ──────────────────────────────
    } else {
      const userId = parseInt(session.metadata?.userId);
      if (userId) {
        try {
          await prisma.student.update({
            where: { id: userId },
            data: {
              isPaid: true,
              hasFullAccess: true,
              paidAt: new Date(),
              stripeSessionId: session.id
            }
          });
          console.log(`Full access payment confirmed for userId ${userId}`);
        } catch (dbErr) {
          console.error('DB update after payment error:', dbErr);
        }
      }
    }
  }

  res.json({ received: true });
});

// ─── STATUS & VERIFY (existing, unchanged) ──────────────────────────────────

// GET /api/payments/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await prisma.student.findUnique({
      where: { id: req.user.id },
      select: { isPaid: true, paidAt: true, hasFullAccess: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ isPaid: user.isPaid, paidAt: user.paidAt, hasFullAccess: user.hasFullAccess });
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// GET /api/payments/verify?session_id=xxx
router.get('/verify', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      await prisma.student.update({
        where: { id: req.user.id },
        data: { isPaid: true, hasFullAccess: true, paidAt: new Date(), stripeSessionId: session.id }
      });
      return res.json({ success: true, isPaid: true });
    }

    res.json({ success: false, isPaid: false });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ─── MY LEVELS ──────────────────────────────────────────────────────────────

// GET /api/payments/my-levels
router.get('/my-levels', auth, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      include: { studentLevels: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const purchasedLevels = student.studentLevels.map(sl => sl.levelNumber);

    res.json({
      hasFullAccess: student.hasFullAccess || student.isPaid,
      purchasedLevels,
      placementDone: student.placementDone,
      placementBand: student.placementBand,
    });
  } catch (err) {
    console.error('My-levels error:', err);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

module.exports = router;
