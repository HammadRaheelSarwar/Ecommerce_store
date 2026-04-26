import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, TrendingUp, ShieldCheck, ArrowRight,
  ShoppingBag, Watch, Shirt, Package, Gem, Zap, Smartphone, Heart,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useApi from '../hooks/useApi';
import './Shop.css';

const MALE_CATEGORIES   = ['All', 'Watches', 'Clothes', 'Shirts', 'Pants', 'Tech', 'Mobiles', 'Headphones', 'Other'];
const FEMALE_CATEGORIES = ['All', 'Bags', 'Watches', 'Clothes', 'Dresses', 'Shoes', 'Jewelry', 'Accessories', 'Beauty', 'Other'];

const MALE_SPOTLIGHT = [
  { name: 'Watches',    emoji: '⌚', note: 'Luxury wristwear' },
  { name: 'Tech',       emoji: '📱', note: 'Smart gadgets' },
  { name: 'Headphones', emoji: '🎧', note: 'Premium audio' },
];

const FEMALE_SPOTLIGHT = [
  { name: 'Bags',        emoji: '👜', note: 'Everyday carry' },
  { name: 'Watches',     emoji: '⌚', note: 'Elegant timepieces' },
  { name: 'Jewelry',     emoji: '💎', note: 'Statement pieces' },
  { name: 'Accessories', emoji: '✨', note: 'Finishing touches' },
  { name: 'Shoes',       emoji: '👠', note: 'Heels & flats' },
];

const HERO_CONFIG = {
  Female: {
    bg: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&auto=format&fit=crop&q=80',
    label: 'FEMME EDIT',
    title: 'Female Collection',
    sub: 'Shop bags, watches, clothes, jewelry, shoes, and accessories in a premium glossy dashboard.',
    icon1: '👜', icon2: '💍', icon3: '👠',
    sale: 'Luxury Bags',
    accentClass: 'female',
    otherGender: 'Male',
    otherLabel: 'Switch to Male ⌚',
  },
  Male: {
    bg: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=1200&auto=format&fit=crop&q=80',
    label: 'MENS EDIT',
    title: 'Male Collection',
    sub: 'Shop watches, clothing, sneakers, tech, and everyday essentials in a premium dark storefront.',
    icon1: '⌚', icon2: '🎧', icon3: '🎮',
    sale: 'Smart Gadgets',
    accentClass: 'male',
    otherGender: 'Female',
    otherLabel: 'Switch to Female 👜',
  },
};

const Shop = () => {
  const { gender } = useParams();
  const navigate   = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [recommendations, setRecommendations] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, loading, error, execute } = useApi('http://localhost:5000/api/products');
  const recoApi = useApi('http://localhost:5000/api/recommendations/12345');

  const cfg        = HERO_CONFIG[gender] || HERO_CONFIG.Male;
  const categories = gender === 'Female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;
  const spotlight  = gender === 'Female' ? FEMALE_SPOTLIGHT  : MALE_SPOTLIGHT;

  useEffect(() => {
    setActiveCategory('All');
  }, [gender]);

  useEffect(() => {
    const query = activeCategory !== 'All'
      ? `?gender=${gender}&category=${activeCategory}`
      : `?gender=${gender}`;
    execute(`http://localhost:5000/api/products${query}`);

    recoApi.execute().then(d => {
      if (Array.isArray(d)) setRecommendations(d);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, activeCategory]);

  const handleSearch = () => {
    navigate(`/shop/${gender}?search=${encodeURIComponent(searchQuery || '')}`);
  };

  return (
    <div className={`shop-shell page-transition ${gender === 'Female' ? 'female' : ''}`}>

      {/* ── SIDEBAR ── */}
      <aside className="shop-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-mark">AV</div>
          <div>
            <h2>AllAvailable</h2>
            <p>{gender} Storefront</p>
          </div>
        </div>

        {/* Switch Gender */}
        <button
          className="btn btn-outline"
          style={{ justifyContent: 'center', fontSize: '0.8rem', borderRadius: '12px', padding: '0.65rem' }}
          onClick={() => navigate(`/shop/${cfg.otherGender}`)}
        >
          {cfg.otherLabel}
        </button>

        <div className="sidebar-group">
          <p className="sidebar-label">Categories</p>
          <div className="sidebar-links">
            {categories.map(cat => (
              <button
                key={cat}
                className={`sidebar-link ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span>{cat}</span>
                {activeCategory === cat && <span className="sidebar-dot" />}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-group">
          <p className="sidebar-label">Continue Shopping</p>
          <div className="sidebar-spotlight">
            {spotlight.map(item => (
              <button
                key={item.name}
                className="spotlight-card"
                onClick={() => navigate(`/shop/${gender}?category=${item.name}`)}
              >
                <span className="spotlight-emoji">{item.emoji}</span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-promo">
          <span className="promo-kicker"><Sparkles size={13} /> Flash Sale</span>
          <strong>{gender === 'Female' ? 'Style' : 'Tech'} 50% OFF</strong>
          <p>{gender === 'Female' ? 'Luxury bags, watches, and dresses.' : 'Smart gadgets and essentials.'}</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="shop-main">

        {/* TOPBAR */}
        <div className="shop-topbar">
          <div className="shop-breadcrumb">
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
            <ArrowRight size={13} />
            <span>{gender} Collection</span>
          </div>
          <div className="shop-stats">
            <div className="shop-stat"><strong>12k+</strong><span>Orders</span></div>
            <div className="shop-stat"><strong>350+</strong><span>Products</span></div>
            <div className="shop-stat"><strong>4.9/5</strong><span>Rating</span></div>
          </div>
        </div>

        {/* HERO BANNER */}
        <section className="shop-hero">
          <div className="shop-hero-copy">
            <span className="hero-kicker">{cfg.label}</span>
            <h1>{cfg.title}</h1>
            <p>{cfg.sub}</p>
            <div className="shop-hero-actions">
              <button className="btn btn-primary" onClick={() => setActiveCategory('All')}>
                <ShoppingBag size={15} /> Shop Now
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/cart')}>
                View Cart
              </button>
            </div>
          </div>

          <div
            className="shop-hero-visual"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${cfg.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          >
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-card">
              <span>Super Sale</span>
              <strong>50% OFF</strong>
              <p>{cfg.sale}</p>
            </div>
            <div className="hero-floating hero-watch">{cfg.icon1}</div>
            <div className="hero-floating hero-headphones">{cfg.icon2}</div>
            <div className="hero-floating hero-controller">{cfg.icon3}</div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="shop-search">
          <Search size={18} className="shop-search-icon" />
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="shop-search-btn" onClick={handleSearch}>Search</button>

          {searchOpen && searchQuery && (
            <div className="shop-search-menu">
              <div className="search-hint"><TrendingUp size={13} /> Trending</div>
              {categories
                .filter(c => c !== 'All' && c.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map(item => (
                  <button
                    key={item}
                    className="search-row"
                    onMouseDown={() => navigate(`/shop/${gender}?category=${item}`)}
                  >
                    <Search size={13} /> {item}
                  </button>
                ))}
            </div>
          )}
        </section>

        {/* CATEGORY TABS */}
        <section className="category-nav">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* GENDER SWITCH BANNER */}
        <div className="gender-banner">
          <div
            className="gender-card gender-card-male"
            onClick={() => navigate('/shop/Male')}
          >
            <span className="gender-card-emoji">⌚</span>
            <div>
              <p className="gender-card-label">Male Collection</p>
              <h4>Shop Men's</h4>
              <p>Watches, tech & essentials</p>
            </div>
          </div>
          <div
            className="gender-card gender-card-female"
            onClick={() => navigate('/shop/Female')}
          >
            <span className="gender-card-emoji">👜</span>
            <div>
              <p className="gender-card-label" style={{ color: '#FF6B9D' }}>Female Collection</p>
              <h4>Shop Women's</h4>
              <p>Bags, jewelry & fashion</p>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        {error ? (
          <div className="shop-empty" style={{ color: '#ef4444' }}>
            <p>Failed to load products. {error}</p>
          </div>
        ) : loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton" style={{ height: '240px', borderRadius: '16px 16px 0 0' }} />
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div className="skeleton" style={{ height: '11px', width: '50%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '36px', marginTop: '0.25rem' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="product-section">
            <div className="section-head">
              <div>
                <h2 className="section-title">Popular Picks</h2>
                <p className="section-sub">
                  {gender === 'Female'
                    ? 'Bags, watches, clothes, jewelry, shoes, and accessories.'
                    : 'Watches, clothing, tech, and everyday essentials.'}
                </p>
              </div>
              <span className="section-pill"><ShieldCheck size={13} /> Secure shopping</span>
            </div>

            <div className="product-grid">
              {products && products.length > 0 ? (
                products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <p className="no-products">No products found in this category.</p>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {recommendations.length > 0 && !loading && !error && (
          <div className="recommendation-section">
            <div className="section-head">
              <div>
                <h2 className="section-title">Recommended for You</h2>
                <p className="section-sub">Curated picks based on your browsing.</p>
              </div>
            </div>
            <div className="product-grid">
              {recommendations.map(product => (
                <ProductCard key={`reco-${product._id}`} product={product} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Shop;
