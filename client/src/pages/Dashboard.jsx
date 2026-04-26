import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Watch, Shirt, Package, Gem, Sparkles, Zap, Smartphone,
  Heart, ShieldCheck, Truck, RefreshCw, Star,
  ChevronRight, ChevronLeft, ArrowRight, Crown, Flame, ShoppingCart,
} from 'lucide-react';
import useApi from '../hooks/useApi';
import './Dashboard.css';

const CATEGORIES = [
  { name: 'Bags',        icon: <ShoppingBag size={17} />, href: '/shop/Female?category=Bags' },
  { name: 'Watches',     icon: <Watch size={17} />,       href: '/shop/Female?category=Watches' },
  { name: 'Clothes',     icon: <Shirt size={17} />,       href: '/shop/Female?category=Clothes' },
  { name: 'Shoes',       icon: <Package size={17} />,     href: '/shop/Female?category=Shoes' },
  { name: 'Jewelry',     icon: <Gem size={17} />,         href: '/shop/Female?category=Jewelry' },
  { name: 'Accessories', icon: <Sparkles size={17} />,    href: '/shop/Female?category=Accessories' },
  { name: 'Perfumes',    icon: <Zap size={17} />,         href: '/shop/Female?category=Perfumes' },
  { name: 'Electronics', icon: <Smartphone size={17} />,  href: '/shop/Male?category=Electronics' },
];

const HERO_SLIDES = [
  {
    tag: 'NEW ARRIVALS',
    h1: '50% OFF',
    h2: 'Luxury Collection',
    sub: 'Premium quality. Timeless style. Made for you.',
    cta: 'Shop Now',
    link: '/shop/Female',
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
  },
  {
    tag: 'TRENDING NOW',
    h1: 'Up to 40% OFF',
    h2: 'Male Collection',
    sub: 'Sharp. Clean. Confident. Premium menswear awaits.',
    cta: 'Shop Male',
    link: '/shop/Male',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
];

const TRUST_ITEMS = [
  { icon: <Truck size={19} />,       title: 'Free Shipping',   sub: 'On all orders over PKR 5,000' },
  { icon: <RefreshCw size={19} />,   title: 'Easy Returns',    sub: '7-day money back guarantee' },
  { icon: <ShieldCheck size={19} />, title: 'Secure Payment',  sub: '100% protected checkout' },
  { icon: <Star size={19} />,        title: '4.8/5 Rating',    sub: 'From 10,000+ customers' },
];

const QUICK_STATS = [
  { value: '12K+',    label: 'Orders' },
  { value: '350+',    label: 'Products' },
  { value: '4.8★',   label: 'Rating' },
  { value: 'Premium', label: 'Vibe' },
];

const FEATURED_PRODUCT = {
  name: 'Premium Watch',
  subtitle: 'Black Edition',
  rating: 4.8,
  price: 'PKR 8,999',
  original: 'PKR 17,999',
  discount: '-50%',
  img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
};

const DISCOUNTS = ['-30%', '-20%', '-25%', '-15%'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Bags');
  const [countdown, setCountdown] = useState({ h: 5, m: 30, s: 45 });
  const [liked, setLiked] = useState(new Set());

  const { data: products, loading, execute } = useApi('http://localhost:5000/api/products');

  useEffect(() => { execute(); }, [execute]);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 5, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const hero = HERO_SLIDES[slide];
  const pad = n => String(n).padStart(2, '0');

  const trending = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 4);
  }, [products]);

  const toggleLike = id => {
    setLiked(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div className="db-shell page-transition">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <div className="db-brand-mark">AV</div>
          <div>
            <h2>AllAvailable</h2>
            <p>Premium Dashboard</p>
          </div>
        </div>

        <div className="db-section">
          <p className="db-label">Shop by Category</p>
          <nav className="db-nav">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className={`db-nav-item ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => { setActiveCategory(cat.name); navigate(cat.href); }}
              >
                <span className="db-nav-icon">{cat.icon}</span>
                <span>{cat.name}</span>
                <ChevronRight size={13} className="db-nav-arrow" />
              </button>
            ))}
          </nav>
        </div>

        <div className="db-section">
          <p className="db-label">Quick Stats</p>
          <div className="db-stats">
            {QUICK_STATS.map(s => (
              <div key={s.label} className="db-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-member-card" onClick={() => navigate('/shop/Female')}>
          <Crown size={18} className="db-crown" />
          <div>
            <strong>Premium Member</strong>
            <p>Exclusive deals &amp; benefits</p>
          </div>
          <ArrowRight size={15} />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="db-main">

        {/* HERO */}
        <section className="db-hero">
          <div className="db-hero-content">
            <span className="db-hero-tag">{hero.tag}</span>
            <h1 className="db-hero-h1">{hero.h1}</h1>
            <h2 className="db-hero-h2">{hero.h2}</h2>
            <p className="db-hero-sub">{hero.sub}</p>
            <div className="db-hero-badges">
              <span><Truck size={12} /> Free Delivery</span>
              <span><RefreshCw size={12} /> 7-Day Returns</span>
              <span><ShieldCheck size={12} /> Secure Checkout</span>
            </div>
            <div className="db-hero-actions">
              <Link to={hero.link} className="db-hero-cta">
                {hero.cta} <ArrowRight size={15} />
              </Link>
              <button className="db-hero-secondary" onClick={() => navigate('/shop/Female')}>
                View Deals
              </button>
            </div>
          </div>
          <div className="db-hero-img-wrap">
            <img src={hero.img} alt="Hero product" className="db-hero-img" />
          </div>
          <div className="db-hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`db-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
            ))}
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="db-trust-bar">
          {TRUST_ITEMS.map(t => (
            <div key={t.title} className="db-trust-item">
              <span className="db-trust-icon">{t.icon}</span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORY GRID */}
        <section className="db-cat-section">
          <div className="db-section-head">
            <h3>Shop by Category</h3>
            <button className="db-view-all" onClick={() => navigate('/shop/Female')}>View All</button>
          </div>
          <div className="db-cat-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.name} className="db-cat-chip" onClick={() => navigate(cat.href)}>
                <span className="db-cat-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* TRENDING PRODUCTS */}
        <section className="db-trending">
          <div className="db-section-head">
            <h3>Trending Now</h3>
            <div className="db-section-right">
              <button className="db-view-all" onClick={() => navigate('/shop/Female')}>View All</button>
              <button className="db-nav-btn"><ChevronLeft size={15} /></button>
              <button className="db-nav-btn"><ChevronRight size={15} /></button>
            </div>
          </div>

          <div className="db-product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="db-skeleton" />)
              : trending.map((product, i) => (
                <div key={product._id} className="db-product-card">
                  <div className="db-product-img-wrap">
                    <span className="db-discount-badge">{DISCOUNTS[i % DISCOUNTS.length]}</span>
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="db-product-img"
                    />
                    <button
                      className={`db-wish-btn ${liked.has(product._id) ? 'liked' : ''}`}
                      onClick={() => toggleLike(product._id)}
                    >
                      <Heart size={14} fill={liked.has(product._id) ? '#ef4444' : 'none'} />
                    </button>
                  </div>
                  <div className="db-product-info">
                    <p className="db-product-name">{product.name}</p>
                    <div className="db-product-rating">
                      {[1,2,3,4,5].map(j => (
                        <span key={j} className={j <= Math.round(product.rating || 4.5) ? 'filled' : ''}>★</span>
                      ))}
                      <span className="db-rating-val">{product.rating || '4.8'}</span>
                    </div>
                    <div className="db-product-price">
                      <strong>PKR {product.price?.toLocaleString()}</strong>
                      {product.originalPrice && <s>PKR {product.originalPrice?.toLocaleString()}</s>}
                    </div>
                    <button className="db-add-cart" onClick={() => navigate(`/product/${product._id}`)}>
                      <ShoppingCart size={13} /> Add to Cart
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* BOTTOM TRUST */}
        <div className="db-bottom-trust">
          {[
            { icon: <Star size={19} />,        title: 'Premium Quality',  sub: 'Handpicked & quality checked' },
            { icon: <Zap size={19} />,          title: 'Exclusive Deals',  sub: 'Special prices for members' },
            { icon: <Truck size={19} />,        title: 'Fast Delivery',    sub: 'Same day dispatch' },
            { icon: <ShieldCheck size={19} />,  title: '24/7 Support',     sub: "We're here to help" },
          ].map(t => (
            <div key={t.title} className="db-bottom-trust-item">
              <span className="db-trust-icon">{t.icon}</span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="db-right">

        {/* FLASH SALE */}
        <div className="db-flash-card">
          <div className="db-flash-header">
            <Flame size={13} className="db-flame" /> FLASH SALE
          </div>
          <h4>Limited Time Deals</h4>
          <p className="db-flash-sub">Grab before it's gone!</p>

          <div className="db-countdown">
            <div className="db-count-block">{pad(countdown.h)}<span>HRS</span></div>
            <span className="db-count-sep">:</span>
            <div className="db-count-block">{pad(countdown.m)}<span>MIN</span></div>
            <span className="db-count-sep">:</span>
            <div className="db-count-block">{pad(countdown.s)}<span>SEC</span></div>
          </div>

          <div className="db-flash-product">
            <img src={FEATURED_PRODUCT.img} alt={FEATURED_PRODUCT.name} />
            <div className="db-flash-info">
              <strong>{FEATURED_PRODUCT.name}</strong>
              <p>{FEATURED_PRODUCT.subtitle}</p>
              <div className="db-flash-rating">★★★★★ {FEATURED_PRODUCT.rating}</div>
              <div className="db-flash-price">
                <strong>{FEATURED_PRODUCT.price}</strong>
                <s>{FEATURED_PRODUCT.original}</s>
                <span className="db-flash-disc">{FEATURED_PRODUCT.discount}</span>
              </div>
            </div>
          </div>

          <button className="db-flash-cta" onClick={() => navigate('/shop/Female?category=Watches')}>
            Shop Flash Sale
          </button>
          <p className="db-stock-warn"><Flame size={11} /> Only 2 left in stock!</p>
        </div>

        {/* SUMMER SALE */}
        <div className="db-summer-card">
          <div>
            <p className="db-summer-label">Summer Sale</p>
            <h4>Up to 60% OFF</h4>
            <p className="db-summer-sub">On selected items</p>
            <button className="db-summer-cta" onClick={() => navigate('/shop/Female')}>
              Explore Now <ArrowRight size={13} />
            </button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&auto=format&fit=crop&q=80"
            alt="Summer sale"
            className="db-summer-img"
          />
        </div>

        {/* TESTIMONIAL */}
        <div className="db-review-card">
          <h5>What Our Customers Say</h5>
          <div className="db-review-body">
            <div className="db-reviewer-avatar">AK</div>
            <div>
              <strong>Ayesha Khan <span className="db-verified">✓</span></strong>
              <div className="db-review-stars">★★★★★</div>
              <p>Amazing quality and fast delivery! This is my go-to store for luxury.</p>
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Dashboard;
