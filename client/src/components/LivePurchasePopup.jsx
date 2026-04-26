import React, { useEffect, useState } from 'react';
import { usePurchaseEvents } from '../context/SocketContext';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad'];
const NAMES = ['Ahmed', 'Sara', 'Bilal', 'Zara', 'Hassan', 'Fatima', 'Usman', 'Ayesha'];

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AP';
};

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(timestamp)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const LivePurchasePopup = () => {
  const { latestPurchase } = usePurchaseEvents();
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [purchaseQueue, setPurchaseQueue] = useState([]);

  useEffect(() => {
    if (!latestPurchase) return;
    setPurchaseQueue(prev => [...prev, latestPurchase]);
  }, [latestPurchase]);

  useEffect(() => {
    if (purchaseQueue.length === 0) return;

    // Show current popup
    const currentPurchase = purchaseQueue[0];
    setPopup(currentPurchase);
    setVisible(true);

    // Hide after 4.5 seconds and move to next
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setPurchaseQueue(prev => prev.slice(1));
      }, 300);
    }, 4500);

    return () => clearTimeout(timer);
  }, [purchaseQueue]);

  if (!popup) return null;

  const initials = getInitials(popup.name);
  const displayName = popup.name || NAMES[Math.floor(Math.random() * NAMES.length)];
  const displayCity = popup.city || CITIES[Math.floor(Math.random() * CITIES.length)];

  return (
    <div className={`live-popup-wrap ${visible ? 'live-visible' : ''}`}>
      <div className="live-popup glass">
        <div className="live-avatar">{initials}</div>
        <div className="live-text">
          <strong>{displayName} from {displayCity}</strong>
          <p>just bought <em>{popup.product}</em></p>
          <span>{getTimeAgo(popup.timestamp)}</span>
        </div>
        <div className="live-pulse" />
      </div>

      <style>{`
        .live-popup-wrap {
          position: fixed;
          bottom: 6.5rem;
          left: 2rem;
          z-index: 1300;
          transform: translateX(-120%);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .live-popup-wrap.live-visible { transform: translateX(0); }

        .live-popup {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.85rem 1.1rem;
          border-radius: 14px;
          min-width: 280px;
          max-width: 320px;
          position: relative;
          overflow: hidden;
        }
        .live-popup::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,229,255,0.04), transparent);
        }
        .live-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,229,255,0.1);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent);
        }
        .live-text strong { font-size: 0.82rem; display: block; margin-bottom: 0.15rem; }
        .live-text p { font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.35; }
        .live-text em { color: var(--accent); font-style: normal; font-weight: 600; }
        .live-text span { font-size: 0.7rem; color: var(--text-muted); }
        .live-pulse {
          position: absolute;
          top: 0.7rem;
          right: 0.7rem;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16,185,129,0.5);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @media (max-width: 480px) {
          .live-popup-wrap { left: 1rem; }
          .live-popup { min-width: auto; max-width: calc(100vw - 2rem); }
        }
      `}</style>
    </div>
  );
};

export default LivePurchasePopup;
