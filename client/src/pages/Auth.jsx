import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', adminKey: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin && !formData.name) {
      return setErrorMsg('Name is required for registration.');
    }
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.requiresVerification) {
          localStorage.setItem('pendingVerificationEmail', data.email || formData.email);
          navigate('/verify-email');
          return;
        }
        throw new Error(data.message || 'Authentication Failed');
      }

      if (data.requiresVerification) {
        localStorage.setItem('pendingVerificationEmail', data.email || formData.email);
        navigate('/verify-email');
        return;
      }
      
      if (data.requires2FA) {
         setRequires2FA(true);
         setPendingUserId(data.userId);
         return;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/users/verify-2fa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUserId, token: twoFactorCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid Authentication Code');
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch(err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <div className="auth-container page-transition">
        <div className="auth-card glass">
          <div className="auth-header">
            <h2 className="title-main" style={{color: '#8B5CF6'}}>2-Step Verification</h2>
            <p className="text-muted">Enter the 6-digit code from your Authenticator App.</p>
          </div>
          {errorMsg && <div className="auth-error glass">{errorMsg}</div>}
          <form onSubmit={handleVerify2FA} className="auth-form" autoComplete="off">
            <div className="form-group" style={{ textAlign: 'center' }}>
              <input 
                type="text" 
                required 
                autoComplete="one-time-code"
                value={twoFactorCode} 
                onChange={e => setTwoFactorCode(e.target.value)} 
                placeholder="000000" 
                maxLength={6} 
                style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '0.4rem', fontWeight: 700 }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary auth-submit" style={{width: '100%', marginTop: '1rem', padding: '1rem', background: '#8B5CF6', border: 'none'}}>
              {loading ? 'Verifying...' : 'Authenticate securely'}
            </button>
            <div style={{marginTop:'1.5rem', textAlign:'center'}}>
               <p onClick={() => setRequires2FA(false)} style={{color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem'}}>Return to Login</p>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container page-transition">
      <div className="auth-card glass">
        <div className="auth-header">
          <h2 className="title-main">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-muted">Authenticate to access AllAvailable.</p>
        </div>

        {errorMsg && <div className="auth-error glass">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {!isLogin && (
            <>
              <div className="role-selector" style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', padding:'0.5rem', background:'rgba(0,0,0,0.2)', borderRadius:'8px'}}>
                <button type="button" onClick={() => setFormData({...formData, role: 'user', adminKey: ''})} style={{flex: 1, padding:'0.5rem', borderRadius:'6px', background: formData.role === 'user' ? 'var(--accent)' : 'transparent', color: formData.role === 'user' ? '#fff' : 'var(--text)', border:'none', cursor:'pointer', fontWeight: 600, transition:'0.3s'}}>
                  Customer
                </button>
                <button type="button" onClick={() => setFormData({...formData, role: 'admin'})} style={{flex: 1, padding:'0.5rem', borderRadius:'6px', background: formData.role === 'admin' ? 'var(--accent)' : 'transparent', color: formData.role === 'admin' ? '#fff' : 'var(--text)', border:'none', cursor:'pointer', fontWeight: 600, transition:'0.3s'}}>
                  Admin
                </button>
              </div>

              {formData.role === 'admin' && (
                <div className="form-group" style={{ animation: 'slideUp 0.3s ease-out' }}>
                  <label>Admin Access Key</label>
                  <input type="password" required value={formData.adminKey} onChange={e => setFormData({...formData, adminKey: e.target.value})} placeholder="Master Authorization Code" style={{ border: '1px solid #8B5CF6' }}/>
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" autoComplete="off" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required autoComplete="off" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required autoComplete={isLogin ? 'current-password' : 'new-password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" minLength={isLogin ? 6 : 8} />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary auth-submit" style={{width: '100%', marginTop: '1rem', padding: '1rem'}}>
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center'}}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={handleToggle} className="auth-toggle-btn" style={{color: 'var(--accent)', cursor: 'pointer', fontWeight: 600}}>
              {isLogin ? ' Sign Up' : ' Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Auth;
