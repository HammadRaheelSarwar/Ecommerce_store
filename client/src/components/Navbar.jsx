import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Menu, X,
  User, Shield, LayoutDashboard, LogOut,
  Search, ChevronDown
} from 'lucide-react';
import { CartContext } from '../context/CartContext';

import './Navbar.css';

const CATEGORIES = ['All', 'Watches', 'Clothes', 'Shirts', 'Pants', 'Tech', 'Mobiles', 'Headphones'];

const Navbar = () => {
  const { cartItems } = useContext(CartContext);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const catRef = useRef(null);

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop/Male?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isOnShop = location.pathname.startsWith('/shop');
  const gender = location.pathname.includes('Female') ? 'Female' : 'Male';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled glass' : ''}`}>
      <div className="nav-inner">
        {/* ─── LEFT: Logo + Categories ─── */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-all">All</span><span className="logo-av">Available</span>
          </Link>

          {/* Categories Dropdown */}
          <div className="nav-categories" ref={catRef}>
            <button className="cat-trigger" onClick={() => setCatOpen(!catOpen)}>
              Categories <ChevronDown size={14} className={catOpen ? 'cat-arrow open' : 'cat-arrow'} />
            </button>
            {catOpen && (
              <div className="cat-dropdown glass">
                <div className="cat-section">
                  <p className="cat-label">👔 Men's Shop</p>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={`m-${cat}`}
                      to={`/shop/Male${cat !== 'All' ? `?category=${cat}` : ''}`}
                      className="cat-item"
                      onClick={() => setCatOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
                <div className="cat-divider" />
                <div className="cat-section">
                  <p className="cat-label">👗 Women's Shop</p>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={`f-${cat}`}
                      to={`/shop/Female${cat !== 'All' ? `?category=${cat}` : ''}`}
                      className="cat-item"
                      onClick={() => setCatOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Nav Links */}
          <ul className={`nav-links ${mobileMenu ? 'active glass' : ''}`}>
            <li>
              <Link to="/shop/Male" className={`nav-link ${location.pathname === '/shop/Male' ? 'active-link' : ''}`} onClick={() => setMobileMenu(false)}>
                Male
              </Link>
            </li>
            <li>
              <Link to="/shop/Female" className={`nav-link ${location.pathname === '/shop/Female' ? 'active-link' : ''}`} onClick={() => setMobileMenu(false)}>
                Female
              </Link>
            </li>
          </ul>
        </div>

        {/* ─── CENTER: Search Bar ─── */}
        <div className="nav-search-wrapper" ref={searchRef}>
          <form className={`nav-search ${searchOpen ? 'search-active' : ''}`} onSubmit={handleSearch}>
            <Search size={16} className="search-i" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="nav-search-input"
            />
            {searchVal && (
              <button type="button" onClick={() => setSearchVal('')} className="search-x">
                <X size={14} />
              </button>
            )}
          </form>

          {/* Live suggestion hints */}
          {searchOpen && searchVal.length > 0 && (
            <div className="search-suggestions glass">
              {CATEGORIES.filter(c => c !== 'All' && c.toLowerCase().includes(searchVal.toLowerCase())).map(s => (
                <div key={s} className="search-sug-item" onClick={() => {
                  navigate(`/shop/Male?category=${s}`);
                  setSearchOpen(false); setSearchVal('');
                }}>
                  <Search size={13} /> {s} in Male &amp; Female
                </div>
              ))}
              <div className="search-sug-item" onClick={handleSearch}>
                <Search size={13} /> Search for "{searchVal}"
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Icons ─── */}
        <div className="nav-right">


          {userInfo && (
            <>
              {userInfo.role === 'admin' && (
                <Link to="/admin" className="nav-icon-btn" title="Admin Panel">
                  <LayoutDashboard size={19} />
                </Link>
              )}
              <Link to="/profile" className="nav-icon-btn" title="My Profile">
                <User size={19} />
              </Link>
              <Link to="/security" className="nav-icon-btn" title="Security">
                <Shield size={19} />
              </Link>
              <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={19} />
              </button>
            </>
          )}

          <Link to="/cart" className="nav-cart-btn">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
