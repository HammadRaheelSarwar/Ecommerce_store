import React, { useContext, useState } from 'react';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';
import './QuickViewModal.css';

const stableHash = (value) => {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const stableMetric = (seed, min, max, decimals = 0) => {
  const hash = stableHash(seed);
  const value = min + (hash % ((max - min) * (decimals ? 10 ** decimals : 1) + 1)) / (decimals ? 10 ** decimals : 1);
  return decimals ? Number(value.toFixed(decimals)) : Math.round(value);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showQV, setShowQV] = useState(false);

  const image = product.images?.[0] || product.image || 'https://placehold.co/400x400/0A1F44/00E5FF?text=No+Image';
  const seed = product._id || product.name || product.image || 'product';
  const rating = Number(product.rating || product.ratings || stableMetric(`${seed}-rating`, 3.8, 4.9, 1));
  const reviews = product.numReviews || stableMetric(`${seed}-reviews`, 40, 420);
  const sold = product.sold || stableMetric(`${seed}-sold`, 80, 780);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const discount = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleAddToCart = () => {
    setAdding(true);
    addToCart(product);
    // Track recently viewed
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(p => p._id !== product._id);
    localStorage.setItem('recentlyViewed', JSON.stringify([product, ...filtered].slice(0, 8)));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { background: 'rgba(2,11,24,0.95)', color: '#fff', border: '1px solid var(--accent)' },
      duration: 2000,
    });
    setTimeout(() => setAdding(false), 800);
  };

  const displayPrice = product.discountPrice || product.price;

  return (
    <>
      <div className="product-card glass">
        {/* Image Container */}
        <div className="product-image-container" onClick={() => setShowQV(true)} style={{ cursor: 'pointer' }}>
          <img src={image} alt={product.name} className="product-image" loading="lazy" />

          {/* Badges */}
          <div className="product-badges">
            {discount && <span className="badge badge-discount">-{discount}%</span>}
            {isNew && !discount && <span className="badge badge-new">NEW</span>}
            {lowStock && <span className="badge badge-stock">Only {product.stock} left!</span>}
          </div>

          {/* Wishlist Button */}
          <button
            className={`wishlist-btn ${wished ? 'wished' : ''}`}
            onClick={() => { setWished(!wished); toast(wished ? 'Removed from wishlist' : '❤️ Added to wishlist!', { duration: 1500 }); }}
          >
            <Heart size={18} fill={wished ? '#ef4444' : 'none'} color={wished ? '#ef4444' : '#fff'} />
          </button>

          {/* Hover Overlay */}
          <div className="product-hover-overlay">
            <button
              className="quick-view-btn-overlay"
              onClick={(e) => { e.stopPropagation(); setShowQV(true); }}
            >
              <Eye size={16} /> Quick View
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          {product.brand && <p className="product-brand">{product.brand}</p>}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          <div className="product-rating">
            <div className="stars">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={13} fill={s <= Math.round(rating) ? '#F59E0B' : 'none'} color='#F59E0B' />
              ))}
            </div>
            <span className="rating-val">{Number(rating).toFixed(1)}</span>
            <span className="rating-count">({reviews})</span>
          </div>

          {/* Social Proof */}
          <p className="product-social"><Zap size={12} /> {sold}+ people bought this</p>

          {/* Price */}
          <div className="product-price-row">
            <span className="product-price">PKR {displayPrice.toLocaleString()}</span>
            {discount && (
              <span className="product-price-original">PKR {product.price.toLocaleString()}</span>
            )}
          </div>

          <button
            className={`btn btn-primary add-to-cart-btn ${adding ? 'btn-adding' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={18} />
            {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {showQV && <QuickViewModal product={product} onClose={() => setShowQV(false)} />}
    </>
  );
};

export default ProductCard;
