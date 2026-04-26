import React, { useState } from 'react';
import { Save, Globe, CreditCard, Truck, Bell, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Section = ({ icon, title, children }) => (
  <div className="glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--accent)' }}>
      {icon} {title}
    </h2>
    {children}
  </div>
);

const Toggle = ({ label, desc, value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      {desc && <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</p>}
    </div>
    <div
      onClick={onChange}
      style={{ width: '50px', height: '26px', borderRadius: '999px', background: value ? 'var(--accent)' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: '0.3s' }}
    >
      <div style={{ position: 'absolute', top: '3px', left: value ? '26px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: '0.3s' }} />
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', suffix }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</label>
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, padding: '0.7rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none' }}
      />
      {suffix && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{suffix}</span>}
    </div>
  </div>
);

const AdminSettings = () => {
  // General
  const [siteName, setSiteName] = useState('AllAvailable');
  const [themeMode, setThemeMode] = useState('dark');

  // Payment
  const [codEnabled, setCodEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [easypaisaEnabled, setEasypaisaEnabled] = useState(false);
  const [jazzcashEnabled, setJazzcashEnabled] = useState(false);

  // Shipping
  const [deliveryCharge, setDeliveryCharge] = useState('200');
  const [freeThreshold, setFreeThreshold] = useState('3000');
  const [regions, setRegions] = useState('Lahore, Karachi, Islamabad, Rawalpindi');

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);

  // Security
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [minPassLen, setMinPassLen] = useState('8');

  const handleSave = (section) => {
    toast.success(`${section} settings saved!`, { icon: '✅', style: { background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#fff' } });
  };

  return (
    <div className="admin-page page-transition">
      <Toaster position="top-right" />
      <h1 className="title-section" style={{ marginBottom: '2rem' }}>System Settings</h1>

      {/* General */}
      <Section icon={<Globe size={20} />} title="General Settings">
        <Field label="Website / Store Name" value={siteName} onChange={setSiteName} />
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Default Theme</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['dark', 'light'].map(mode => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: themeMode === mode ? 'var(--accent)' : 'transparent', color: themeMode === mode ? '#fff' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600, transition: '0.3s' }}
              >
                {mode} Mode
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleSave('General')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> Save General
        </button>
      </Section>

      {/* Payment */}
      <Section icon={<CreditCard size={20} />} title="Payment Settings">
        <Toggle label="Cash on Delivery (COD)" desc="Allow customers to pay on delivery" value={codEnabled} onChange={() => setCodEnabled(!codEnabled)} />
        <Toggle label="Stripe (Card Payments)" desc="Accept Visa/Mastercard via Stripe gateway" value={stripeEnabled} onChange={() => setStripeEnabled(!stripeEnabled)} />
        <Toggle label="EasyPaisa" desc="Mobile wallet payment via EasyPaisa" value={easypaisaEnabled} onChange={() => setEasypaisaEnabled(!easypaisaEnabled)} />
        <Toggle label="JazzCash" desc="Mobile wallet payment via JazzCash" value={jazzcashEnabled} onChange={() => setJazzcashEnabled(!jazzcashEnabled)} />
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => handleSave('Payment')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Payment
          </button>
        </div>
      </Section>

      {/* Shipping */}
      <Section icon={<Truck size={20} />} title="Shipping Settings">
        <Field label="Standard Delivery Charge (PKR)" value={deliveryCharge} onChange={setDeliveryCharge} type="number" suffix="PKR" />
        <Field label="Free Shipping Threshold (PKR)" value={freeThreshold} onChange={setFreeThreshold} type="number" suffix="PKR" />
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Delivery Regions</label>
          <textarea
            value={regions}
            onChange={e => setRegions(e.target.value)}
            rows={3}
            placeholder="Comma-separated city list..."
            style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', resize: 'vertical' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => handleSave('Shipping')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> Save Shipping
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={20} />} title="Notification Settings">
        <Toggle label="Email Notifications" desc="Send transactional emails to customers" value={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
        <Toggle label="Order Alerts (Admin)" desc="Receive push alerts for new orders in admin panel" value={orderAlerts} onChange={() => setOrderAlerts(!orderAlerts)} />
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => handleSave('Notification')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Notifications
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section icon={<Shield size={20} />} title="Security Settings">
        <Field label="Session Timeout (minutes)" value={sessionTimeout} onChange={setSessionTimeout} type="number" suffix="min" />
        <Field label="Minimum Password Length" value={minPassLen} onChange={setMinPassLen} type="number" suffix="chars" />
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444' }}>
            ⚠️ Admin Key is stored securely in your server <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>.env</code> file as <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ADMIN_KEY</code>. Change it there directly to update.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleSave('Security')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> Save Security
        </button>
      </Section>
    </div>
  );
};

export default AdminSettings;
