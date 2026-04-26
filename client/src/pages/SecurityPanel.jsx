import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import { apiUrl } from '../lib/api';

const SecurityPanel = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
  const generateApi = useApi(apiUrl('/api/users/generate-2fa'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const enableApi = useApi(apiUrl('/api/users/enable-2fa'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(apiUrl('/api/users/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setProfile(data);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleGenerate = async () => {
    try {
      const res = await generateApi.execute();
      if(res) {
        setQrCodeUrl(res.qrCode);
        setSetupSecret(res.secret);
        setStatusMsg('');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    try {
      const res = await enableApi.execute(undefined, {
         body: JSON.stringify({ token: verificationCode }),
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if(res) {
         setStatusMsg('Two-Factor Authentication is officially locked! Your account is now highly secure.');
         setQrCodeUrl('');
      }
    } catch(err) {
       alert(err.message || 'Verification failed. Try again.');
    }
  };

  return (
    <div className="container page-transition" style={{ marginTop: '2rem', maxWidth: '600px' }}>
      <h1 className="title-section">Security Protocols</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>Account</p>
              <strong style={{ display: 'block', marginTop: '0.35rem' }}>{profileLoading ? 'Loading...' : (profile?.role || 'user')}</strong>
            </div>
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>2FA</p>
              <strong style={{ display: 'block', marginTop: '0.35rem', color: profile?.isTwoFactorEnabled ? '#10b981' : '#f59e0b' }}>
                {profileLoading ? 'Loading...' : (profile?.isTwoFactorEnabled ? 'Enabled' : 'Disabled')}
              </strong>
            </div>
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Login</p>
              <strong style={{ display: 'block', marginTop: '0.35rem' }}>
                {profileLoading ? 'Loading...' : (profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Unknown')}
              </strong>
            </div>
         </div>

         <h2 style={{color: '#8B5CF6'}}>Two-Factor Authentication (2FA)</h2>
         <p className="text-muted" style={{marginTop: '0.5rem', marginBottom: '2rem'}}>
           Protect your AllAvailable account by mandating a physical Authenticator Code upon sign-in.
         </p>
         
          {statusMsg ? (
             <div style={{padding:'1rem', background:'rgba(16, 185, 129, 0.1)', color:'#10b981', borderRadius:'8px', fontWeight:600}}>{statusMsg}</div>
          ) : profile?.isTwoFactorEnabled ? (
             <div style={{padding:'1rem', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'8px', color:'#10b981', fontWeight:600}}>
               Two-Factor Authentication is already enabled on this account.
             </div>
          ) : !qrCodeUrl ? (
             <button className="btn btn-primary" onClick={handleGenerate} disabled={generateApi.loading} style={{background: '#8B5CF6', border: 'none'}}>
                {generateApi.loading ? 'Generating Hash...' : 'Setup Authenticator App'}
             </button>
         ) : (
            <div className="qr-container" style={{display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(0,0,0,0.2)', padding:'2rem', borderRadius:'8px'}}>
               <p style={{marginBottom:'1rem', textAlign:'center'}}>Scan this QR Code in Google Authenticator or Authy</p>
               <img src={qrCodeUrl} alt="2FA QR Code" style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }} />
               <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'2rem'}}>Fallback Secret: <br/> <strong style={{color:'var(--text)', letterSpacing:'2px'}}>{setupSecret}</strong></p>
               
               <form onSubmit={handleEnable} style={{width:'100%', display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <input 
                     type="text" 
                     placeholder="000000"
                     value={verificationCode}
                     onChange={e => setVerificationCode(e.target.value)}
                     maxLength={6}
                     required
                     style={{padding:'1rem', background:'rgba(0,0,0,0.5)', border:'1px solid var(--border)', color:'white', textAlign:'center', fontSize:'1.5rem', letterSpacing:'0.5rem', borderRadius:'8px'}}
                  />
                  <button type="submit" disabled={enableApi.loading} className="btn btn-primary" style={{width:'100%'}}>
                    {enableApi.loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
};

export default SecurityPanel;
