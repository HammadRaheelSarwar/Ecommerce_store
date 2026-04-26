import React, { useEffect, useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { usePurchaseEvents } from '../context/SocketContext';

const DISCOUNT_CODES = ['SAVE10', 'ALLAV15', 'FLASH20'];
const EXIT_SESSION_KEY = 'allavailable_exit_popup_shown';

const ExitIntentPopup = () => {
  const { latestPurchase } = usePurchaseEvents();
  const [visible, setVisible] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discountCode] = useState(() => DISCOUNT_CODES[Math.floor(Math.random() * DISCOUNT_CODES.length)]);

  useEffect(() => {
    if (latestPurchase) {
      setEligible(true);
    }
  }, [latestPurchase]);

  useEffect(() => {
    const handleMouseLeave = (event) => {
      if (sessionStorage.getItem(EXIT_SESSION_KEY) === 'true') return;
      if (!eligible) return;
      if (event.clientY > 0 || event.relatedTarget) return;

      sessionStorage.setItem(EXIT_SESSION_KEY, 'true');
      setVisible(true);
    };

    document.addEventListener('mouseout', handleMouseLeave);
    return () => document.removeEventListener('mouseout', handleMouseLeave);
  }, [eligible]);

  const purchaseLabel = useMemo(() => {
    if (!latestPurchase) return 'someone';
    return latestPurchase.name || 'someone';
  }, [latestPurchase]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="exit-popup-backdrop">
      <div className="exit-popup glass">
        <div className="exit-badge">Limited Offer</div>
        <h3>Wait! {purchaseLabel} just checked out.</h3>
        <p>Use this one-time discount before you leave.</p>
        <div className="exit-code-row">
          <strong>{discountCode}</strong>
          <button type="button" onClick={copyCode} className="exit-copy-btn">
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {latestPurchase && (
          <div className="exit-purchase-meta">
            <span>{latestPurchase.product}</span>
            <span>PKR {Number(latestPurchase.price || 0).toLocaleString()}</span>
          </div>
        )}
      </div>

      <style>{`
        .exit-popup-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 6rem;
          z-index: 1350;
          pointer-events: none;
        }
        .exit-popup {
          pointer-events: auto;
          width: min(92vw, 420px);
          padding: 1.25rem;
          border-radius: 18px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }
        .exit-badge {
          display: inline-block;
          margin-bottom: 0.75rem;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: rgba(0, 229, 255, 0.12);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .exit-popup h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }
        .exit-popup p {
          margin: 0 0 1rem;
          color: var(--text-muted);
        }
        .exit-code-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border: 1px dashed rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          margin-bottom: 0.85rem;
        }
        .exit-code-row strong {
          font-size: 1.1rem;
          letter-spacing: 0.08em;
        }
        .exit-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border: 0;
          border-radius: 999px;
          padding: 0.6rem 0.9rem;
          background: var(--accent);
          color: #000;
          font-weight: 700;
          cursor: pointer;
        }
        .exit-purchase-meta {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          color: var(--text-muted);
          font-size: 0.88rem;
        }
      `}</style>
    </div>
  );
};

export default ExitIntentPopup;
