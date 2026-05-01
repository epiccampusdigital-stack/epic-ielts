const router = require('express').Router();
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-checkout
// Creates a Stripe Checkout session for full access upgrade
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'EPIC IELTS — Full Access',
              description: 'Lifetime access to all Reading, Writing, Listening and Speaking practice tests with AI feedback.'
            },
            unit_amount: 1000000 // 10,000 LKR in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancelled`,
      metadata: {
        userId: String(userId)
      }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Create checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/webhook
// Stripe webhook — must be registered BEFORE express.json() in index.js (raw body)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata?.userId);
    if (userId) {
      try {
        await prisma.student.update({
          where: { id: userId },
          data: {
            isPaid: true,
            paidAt: new Date(),
            stripeSessionId: session.id
          }
        });
        console.log(`Payment confirmed for userId ${userId}, session ${session.id}`);
      } catch (dbErr) {
        console.error('DB update after payment error:', dbErr);
      }
    }
  }

  res.json({ received: true });
});

// GET /api/payments/status
// Returns payment status for the authenticated user
router.get('/status', auth, async (req, res) => {
  try {
    const user = await prisma.student.findUnique({
      where: { id: req.user.id },
      select: { isPaid: true, paidAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ isPaid: user.isPaid, paidAt: user.paidAt });
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// GET /api/payments/verify?session_id=xxx
// Verifies a Stripe session and updates DB if paid
router.get('/verify', auth, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      await prisma.student.update({
        where: { id: req.user.id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          stripeSessionId: session.id
        }
      });
      return res.json({ success: true, isPaid: true });
    }

    res.json({ success: false, isPaid: false });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;
