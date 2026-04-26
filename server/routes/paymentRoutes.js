import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || '';
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

router.post('/create-intent', protect, expressAsyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error('Stripe is not configured on the server');
  }

  const amount = Math.round(Number(req.body.amount || 0) * 100);
  const currency = (process.env.STRIPE_CURRENCY || 'pkr').toLowerCase();
  const checkoutSessionId = String(req.body.checkoutSessionId || '').trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: String(req.user._id),
      email: req.user.email,
    },
  }, checkoutSessionId ? { idempotencyKey: `${req.user._id}:${checkoutSessionId}:${amount}` } : undefined);

  res.json({
    clientSecret: paymentIntent.client_secret,
    amount,
    currency,
  });
}));

export default router;
