import React, { useContext, useEffect, useState } from 'react';
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, Share2, Heart, Zap, Box } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import Model3DViewerModal from './Model3DViewerModal';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [currentImg, setCurrentImg] = useState(0);
  const [wished, setWished] = useState(false);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [show3D, setShow3D] = useState(false);

  const images = product.images?.length > 0 ? product.images : [product.image || 'https://placehold.co/600x600/0A1F44/00E5FF?text=Product'];
  const rating = product.rating || 4.3;
  const reviews = product.numReviews || 87;

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = () => {
    setAdding(true);
    addToCart({ ...product, qty: 1 }, qty);
    toast.success(`${product.name} added!`, { icon: '🛒', style: { background: 'rgba(2,11,24,0.95)', color: '#fff', border: '1px solid var(--accent)' } });
    setTimeout(() => { setAdding(false); onClose(); }, 800);
  };

  return (
    <div className="qv-backdrop" onClick={onClose}>
      <div className="qv-modal glass" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="qv-close" onClick={onClose}><X size={20} /></button>

        {/* Image Slider */}
        <div className="qv-images">
          <div className="qv-main-img-wrap">
            {product.model3d && (
              <button className="qv-3d-badge" onClick={() => setShow3D(true)}>
                <Box size={16} color="var(--accent)" /> View in 3D
              </button>
            )}
            <img src={images[currentImg]} alt={product.name} className="qv-main-img" />
            {images.length > 1 && (
              <>
                <button className="qv-arrow qv-prev" onClick={() => setCurrentImg(p => (p - 1 + images.length) % images.length)}>
                  <ChevronLeft size={18} />
                </button>
                <button className="qv-arrow qv-next" onClick={() => setCurrentImg(p => (p + 1) % images.length)}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="qv-thumbs">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className={`qv-thumb ${i === currentImg ? 'active' : ''}`} onClick={() => setCurrentImg(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="qv-info">
          {product.brand && <p className="qv-brand">{product.brand}</p>}
          <h2 className="qv-name">{product.name}</h2>

          <div className="qv-rating">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={15} fill={s <= Math.round(rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
            ))}
            <span>{rating}</span>
            <span className="qv-rev-count">({reviews} reviews)</span>
          </div>

          <div className="qv-price-row">
            <span className="qv-price">PKR {(product.discountPrice || product.price)?.toLocaleString()}</span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="qv-original">PKR {product.price?.toLocaleString()}</span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="qv-stock-warn">⚡ Only {product.stock} left in stock!</p>
          )}
          {product.stock === 0 && (
            <p className="qv-out-of-stock">❌ Out of Stock</p>
          )}

          {product.description && <p className="qv-desc">{product.description}</p>}

          {/* Qty + Add */}
          <div className="qv-actions">
            <div className="qv-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className={`btn btn-primary qv-cart-btn ${adding ? 'btn-adding' : ''}`}
              onClick={handleAdd}
              disabled={product.stock === 0 || adding}
            >
              <ShoppingCart size={17} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          <div className="qv-footer">
            <button className="qv-wish-btn" onClick={() => { setWished(!wished); toast(wished ? 'Removed from wishlist' : '❤️ Saved!', { duration: 1500 }); }}>
              <Heart size={16} fill={wished ? '#ef4444' : 'none'} color={wished ? '#ef4444' : 'var(--text-muted)'} />
              {wished ? 'Saved' : 'Save'}
            </button>
            <button className="qv-wish-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Link copied!', { duration: 1500 }); }}>
              <Share2 size={16} /> Share
            </button>
            <div className="qv-social"><Zap size={13} /> {product.sold || 142}+ sold this week</div>
          </div>
        </div>
      </div>

      {show3D && (
        <Model3DViewerModal 
          modelUrl={product.model3d} 
          onClose={() => setShow3D(false)} 
        />
      )}
    </div>
  );
};

export default QuickViewModal;
