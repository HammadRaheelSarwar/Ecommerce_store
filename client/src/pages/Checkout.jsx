import React, { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext';
import './Checkout.css';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  import.meta.env.VITE_STRIPE_KEY;

const CARD_OPTIONS = {
  style: {
    base: {
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

const StripeCardSection = forwardRef(({ shippingName, amount, checkoutSessionId }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);

  useImperativeHandle(ref, () => ({
    pay: async () => {
      if (!stripe || !elements) throw new Error('Card payments are not ready yet');

      const numberElement = elements.getElement(CardNumberElement);
      if (!numberElement) throw new Error('Card form is not ready');

      setProcessing(true);
      setCardError('');

      try {
        const paymentIntentRes = await fetch('http://localhost:5000/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || ''}`,
          },
          body: JSON.stringify({ amount, checkoutSessionId }),
        });

        const paymentIntentData = await paymentIntentRes.json();
        if (!paymentIntentRes.ok) {
          throw new Error(paymentIntentData.message || 'Unable to start card payment');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentData.clientSecret, {
          payment_method: {
            card: numberElement,
            billing_details: { name: shippingName || 'Customer' },
          },
        });

        if (error) throw new Error(error.message);
        if (paymentIntent?.status !== 'succeeded') throw new Error('Card payment was not completed');

        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
        };
      } catch (error) {
        setCardError(error.message);
        throw error;
      } finally {
        setProcessing(false);
      }
    },
  }));

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600 }}>Card Details</label>
        <span style={{ fontSize: '0.75rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)', padding: '0.3rem 0.6rem', borderRadius: '999px' }}>
          Secure Payment
        </span>
      </div>

      <div style={{ display: 'grid', gap: '0.85rem' }}>
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(0,0,0,0.22)' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Card Number</label>
          <CardNumberElement options={CARD_OPTIONS} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(0,0,0,0.22)' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</label>
            <CardExpiryElement options={CARD_OPTIONS} />
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(0,0,0,0.22)' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CVV</label>
            <CardCvcElement options={CARD_OPTIONS} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>
        Amount to charge: PKR {amount.toFixed(2)}
      </div>
      {processing && <div style={{ marginTop: '0.75rem', color: '#00E5FF', fontWeight: 600 }}>Processing card payment...</div>}
      {cardError && <div style={{ marginTop: '0.75rem', color: '#ef4444' }}>{cardError}</div>}
    </div>
  );
});

const Checkout = ({ stripeReady = false }) => {
  const { cartItems, subtotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const stripePaymentRef = useRef(null);
  const checkoutSessionId = useRef(`chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  const [shipping, setShipping] = useState({ name: '', address: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const createOrder = async (paymentResult = null) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const normalizedOrderItems = cartItems.map((item) => ({
      ...item,
      product: item._id || item.id || item.product,
    }));

    const missingProductReference = normalizedOrderItems.some((item) => !item.product);
    if (missingProductReference) {
      throw new Error('Some cart items are invalid. Please remove them and add again.');
    }

    const orderData = {
      orderItems: normalizedOrderItems,
      shippingDetails: shipping,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: 0,
      totalPrice: subtotal,
      paymentResult,
      isPaid: Boolean(paymentResult),
      paidAt: paymentResult ? new Date().toISOString() : undefined,
      checkoutSessionId: checkoutSessionId.current,
    };

    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error placing order');
    return data;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Cart is empty.');
      return;
    }

    setLoading(true);
    try {
      let paymentResult = null;

      if (paymentMethod === 'Stripe') {
        if (!stripeReady) throw new Error('Card payments are not configured on this site yet');
        if (!stripePaymentRef.current?.pay) throw new Error('Card payment form is not ready');
        paymentResult = await stripePaymentRef.current.pay();
      }

      const order = await createOrder(paymentResult);
      clearCart();
      navigate('/order-success', {
        state: {
          orderId: order._id,
          paymentStatus: paymentResult ? 'paid' : 'pending',
          totalPaid: order.totalPrice,
        },
      });
    } catch (error) {
      setErrorMsg(error.message || 'Unable to place order');
    } finally {
      setLoading(false);
    }
  };

  const cardSection = useMemo(() => {
    if (paymentMethod !== 'Stripe') return null;
    if (!stripePublishableKey || !stripeReady) {
      return (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Card payments are not configured yet. Add your Stripe publishable and secret keys to enable this method.
        </div>
      );
    }

    return (
        <StripeCardSection
        ref={stripePaymentRef}
        amount={subtotal}
        shippingName={shipping.name}
        checkoutSessionId={checkoutSessionId.current}
      />
    );
  }, [paymentMethod, stripeReady, subtotal, shipping.name]);

  return (
    <div className="checkout-page container page-transition">
      <h1 className="title-main">Checkout</h1>
      <div className="checkout-grid">
        <div className="checkout-form-container glass">
          <h2 className="title-section" style={{ fontSize: '1.5rem' }}>Shipping Details</h2>
          {errorMsg && (
            <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {errorMsg}
            </div>
          )}
          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" required value={shipping.name} onChange={handleChange} className="form-control" autoComplete="name" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" required value={shipping.address} onChange={handleChange} className="form-control" autoComplete="shipping street-address" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" required value={shipping.phone} onChange={handleChange} className="form-control" autoComplete="tel" />
            </div>

            <h2 className="title-section" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>Payment Method</h2>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Cash on Delivery (COD)
              </label>
              <label className={`payment-option ${paymentMethod === 'Stripe' ? 'selected' : ''}`}>
                <input type="radio" name="payment" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Credit/Debit Card
              </label>
            </div>

            {cardSection}

            <button type="submit" disabled={loading} className="btn btn-primary w-100" style={{ marginTop: '2rem' }}>
              {loading ? 'Processing...' : paymentMethod === 'Stripe' ? 'Pay Now' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="checkout-summary glass">
          <h2 className="title-section" style={{ fontSize: '1.5rem' }}>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item._id || item.id} className="summary-item">
                <span>{item.qty} x {item.name}</span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
