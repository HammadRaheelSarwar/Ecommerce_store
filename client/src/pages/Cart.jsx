import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="cart-page container page-transition">
      <h1 className="title-main">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart glass">
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>Your shopping cart is currently empty.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/shop/Male')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map(item => {
              const itemId = item._id || item.id;
              
              return (
              <div key={itemId} className="cart-item">
                <img src={item.image || (item.images && item.images[0])} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">PKR {item.price}</p>
                </div>
                
                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button onClick={() => decreaseQuantity(itemId)} disabled={item.qty <= 1}>
                      <Minus size={16} />
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => increaseQuantity(itemId)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button className="remove-btn" onClick={() => removeFromCart(itemId)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
          
          <div className="cart-summary glass">
            <h2 className="title-section" style={{ fontSize: '1.5rem' }}>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
              <span>PKR {subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <hr className="summary-divider" />
            
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>PKR {subtotal}</span>
            </div>
            
            <button 
              className="btn btn-primary w-100" 
              style={{ marginTop: '2rem', padding: '1rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
