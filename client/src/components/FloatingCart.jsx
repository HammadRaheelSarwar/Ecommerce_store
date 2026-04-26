import React, { useContext, useState } from 'react';
import { X, ShoppingCart, ChevronRight, Minus, Plus, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FloatingCart = () => {
  const { cartItems, subtotal, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((a, i) => a + i.qty, 0);

  return (
    <>
      {/* Floating Button */}
      <button
        className="float-cart-btn"
        onClick={() => setOpen(!open)}
        title="Cart"
        style={{ animation: totalItems > 0 ? 'cartBounce 0.4s ease' : 'none' }}
      >
        <ShoppingCart size={22} />
        {totalItems > 0 && <span className="float-badge">{totalItems}</span>}
      </button>

      {/* Cart Panel */}
      {open && (
        <>
          <div className="float-backdrop" onClick={() => setOpen(false)} />
          <div className="float-panel glass">
            <div className="float-header">
              <h3>My Cart <span className="float-count">({totalItems} items)</span></h3>
              <button className="float-close" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>

            <div className="float-items">
              {cartItems.length === 0 ? (
                <div className="float-empty">
                  <ShoppingCart size={40} style={{ opacity: 0.25, margin: '0 auto 1rem', display: 'block' }} />
                  <p>Your cart is empty</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem', fontSize: '0.85rem' }} onClick={() => { navigate('/shop/Male'); setOpen(false); }}>
                    Start Shopping
                  </button>
                </div>
              ) : cartItems.map(item => {
                const itemId = item._id || item.id;
                const img = item.images?.[0] || item.image;
                return (
                  <div key={itemId} className="float-item">
                    {img && <img src={img} alt={item.name} className="float-item-img" />}
                    <div className="float-item-info">
                      <p className="float-item-name">{item.name}</p>
                      <p className="float-item-price">PKR {(item.price * item.qty).toLocaleString()}</p>
                      <div className="float-qty">
                        <button onClick={() => decreaseQuantity(itemId)}><Minus size={12} /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => increaseQuantity(itemId)}><Plus size={12} /></button>
                      </div>
                    </div>
                    <button className="float-remove" onClick={() => removeFromCart(itemId)}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>

            {cartItems.length > 0 && (
              <div className="float-footer">
                <div className="float-total">
                  <span>Total</span>
                  <strong>PKR {subtotal.toLocaleString()}</strong>
                </div>
                <button className="btn btn-primary float-checkout" onClick={() => { navigate('/checkout'); setOpen(false); }}>
                  Checkout <ChevronRight size={16} />
                </button>
                <button className="float-view-cart" onClick={() => { navigate('/cart'); setOpen(false); }}>
                  View Full Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .float-cart-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1500;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--accent);
          color: #020B18;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(0,229,255,0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .float-cart-btn:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(0,229,255,0.6); }

        .float-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #020B18;
        }

        @keyframes cartBounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }

        .float-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1400;
          background: transparent;
        }

        .float-panel {
          position: fixed;
          bottom: 5.5rem;
          right: 2rem;
          z-index: 1500;
          width: 360px;
          max-height: 500px;
          display: flex;
          flex-direction: column;
          border-radius: 18px;
          overflow: hidden;
          animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .float-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .float-header h3 { font-size: 1rem; font-weight: 700; }
        .float-count { color: var(--text-muted); font-size: 0.85rem; font-weight: 400; }
        .float-close { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 6px; transition: 0.2s; }
        .float-close:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        .float-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .float-empty { text-align: center; padding: 2rem 0; color: var(--text-muted); }

        .float-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .float-item-img { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
        .float-item-info { flex: 1; }
        .float-item-name { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.2rem; }
        .float-item-price { font-size: 0.875rem; color: var(--accent); font-weight: 700; margin-bottom: 0.4rem; }
        .float-qty { display: flex; align-items: center; gap: 0.4rem; background: rgba(0,0,0,0.2); border-radius: 6px; width: fit-content; padding: 0.15rem; }
        .float-qty button { background: none; border: none; color: var(--text); cursor: pointer; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .float-qty button:hover { background: rgba(0,229,255,0.1); color: var(--accent); }
        .float-qty span { font-size: 0.82rem; font-weight: 700; min-width: 20px; text-align: center; }
        .float-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: color 0.2s; }
        .float-remove:hover { color: #ef4444; }

        .float-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border); }
        .float-total { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .float-checkout { width: 100%; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .float-view-cart { width: 100%; background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 0.5rem; border-radius: 10px; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: 0.2s; }
        .float-view-cart:hover { border-color: var(--accent); color: var(--accent); }

        @media (max-width: 480px) {
          .float-cart-btn { bottom: 1rem; right: 1rem; }
          .float-panel { right: 0.5rem; width: calc(100vw - 1rem); }
        }
      `}</style>
    </>
  );
};

export default FloatingCart;
