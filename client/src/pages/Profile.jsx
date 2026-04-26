import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, Save, Lock } from 'lucide-react';
import { apiUrl } from '../lib/api';

const Profile = () => {
  const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
  const userRole = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).role : 'user';
  
  const { data: profileData, loading, execute: fetchProfile } = useApi(apiUrl('/api/user/profile'));
  const updateApi = useApi(apiUrl('/api/user/profile'), { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }});
  const passwordApi = useApi(apiUrl('/api/user/password'), { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }});

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', profileImage: '' });
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (token) {
        fetchProfile(undefined, { headers: { Authorization: `Bearer ${token}` } }).then(data => {
            if (data) setFormData({ name: data.name, phone: data.phone || '', address: data.address || '', profileImage: data.profileImage || '' });
        });
    }
  }, []);

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormData({ ...formData, profileImage: reader.result });
          reader.readAsDataURL(file);
      }
  };

  const handleProfileSubmit = async (e) => {
      e.preventDefault();
      try {
          await updateApi.execute(undefined, { body: JSON.stringify(formData) });
          toast.success("Profile saved successfully");
          const local = JSON.parse(localStorage.getItem('userInfo'));
          local.name = formData.name;
          localStorage.setItem('userInfo', JSON.stringify(local));
      } catch (e) {
          toast.error("Failed to update profile details");
      }
  };

  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          return toast.error("New passwords do not match!");
      }
      try {
          await passwordApi.execute(undefined, { body: JSON.stringify({ oldPassword: passData.oldPassword, newPassword: passData.newPassword }) });
          toast.success("Password changed securely");
          setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (e) {
          toast.error(e.message || "Failed to change password natively");
      }
  };

  if (loading && !profileData) return <div className="loader container">Synchronizing Profile...</div>;

  return (
    <div className="container page-transition" style={{ marginTop: '2rem', maxWidth: '900px' }}>
      <Toaster position="top-right" />
      <h1 className="title-main">Personal Profile</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Basic Settings Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h2 className="title-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>Public Details</h2>
            
            <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Avatar</div>
                        )}
                        <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', cursor: 'pointer', padding: '0.2rem', textAlign: 'center', color: '#fff' }}>
                            <Camera size={14} />
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{formData.name || 'Anonymous User'}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0' }}>{profileData?.email || 'Synchronizing...'}</p>
                        <span className={`status-badge ${userRole === 'admin' ? 'success' : 'neutral'}`}>{userRole.toUpperCase()}</span>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Display Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Shipping Address</label>
                    <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} placeholder="123 Example Street..." style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', resize: 'none' }} />
                </div>

                <button type="submit" disabled={updateApi.loading} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Save size={18} /> {updateApi.loading ? 'Synchronizing...' : 'Save Changes'}
                </button>
            </form>
        </div>

        {/* Security Password Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px', height: 'fit-content' }}>
            <h2 className="title-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>Security Vault</h2>
            
            <form onSubmit={handlePasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Password</label>
                    <input type="password" value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
                    <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} required minLength={6} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm New Password</label>
                    <input type="password" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} required minLength={6} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <button type="submit" disabled={passwordApi.loading} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#F59E0B', borderColor: '#F59E0B' }}>
                    <Lock size={18} /> {passwordApi.loading ? 'Encrypting...' : 'Update Password'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;
