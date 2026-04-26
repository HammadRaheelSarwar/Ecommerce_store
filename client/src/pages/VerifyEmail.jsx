import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const RESEND_COOLDOWN_SECONDS = 60;
const STORAGE_EMAIL_KEY = 'pendingVerificationEmail';
const STORAGE_COOLDOWN_KEY = 'verificationCooldownUntil';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem(STORAGE_EMAIL_KEY) || '');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(Number(localStorage.getItem(STORAGE_COOLDOWN_KEY) || 0));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingSeconds = useMemo(() => {
    return Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  }, [cooldownUntil, now]);

  const persistCooldown = (expiresAt) => {
    setCooldownUntil(expiresAt);
    localStorage.setItem(STORAGE_COOLDOWN_KEY, String(expiresAt));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otpCode) {
      toast.error('Enter your email and verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      localStorage.removeItem(STORAGE_EMAIL_KEY);
      localStorage.removeItem(STORAGE_COOLDOWN_KEY);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Email verified successfully');
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first');
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not resend code');

      const expiresAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      persistCooldown(expiresAt);
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      toast.success('Verification code resent');
    } catch (error) {
      toast.error(error.message || 'Could not resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container page-transition">
      <Toaster position="top-right" />
      <div className="auth-card glass">
        <div className="auth-header">
          <h2 className="title-main">Verify Your Email</h2>
          <p className="text-muted">Enter the OTP sent to your inbox to activate your account.</p>
        </div>

        <form onSubmit={handleVerify} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3rem', fontWeight: 700 }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || remainingSeconds > 0}
            className="btn btn-outline auth-submit"
            style={{ width: '100%', marginTop: '0.85rem', padding: '1rem' }}
          >
            {resendLoading ? 'Sending...' : remainingSeconds > 0 ? `Resend in ${remainingSeconds}s` : 'Resend Code'}
          </button>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }} onClick={() => navigate('/login')}>
              Back to login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
