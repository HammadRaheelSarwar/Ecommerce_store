import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Settings, LogOut, ShoppingBag, PlusCircle } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const linkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 500, transition: '0.2s',
    background: isActive(path) ? 'rgba(0,229,255,0.12)' : 'transparent',
    color: isActive(path) ? 'var(--accent)' : 'var(--text-muted)',
    borderLeft: isActive(path) ? '3px solid var(--accent)' : '3px solid transparent',
  });

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar glass">
        <div className="admin-brand">
          <h2>AllAvailable Admin</h2>
        </div>
        <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link to="/admin" style={linkStyle('/admin')} end><LayoutDashboard size={18} /> Dashboard</Link>
          <Link to="/admin/orders" style={linkStyle('/admin/orders')}><ShoppingBag size={18} /> Orders</Link>
          <Link to="/admin/products" style={linkStyle('/admin/products')}><Package size={18} /> Products</Link>
          <Link to="/admin/products/new" style={linkStyle('/admin/products/new')}><PlusCircle size={18} /> Add Product</Link>
          <Link to="/admin/users" style={linkStyle('/admin/users')}><Users size={18} /> Users</Link>
          <Link to="/admin/settings" style={linkStyle('/admin/settings')}><Settings size={18} /> Settings</Link>
        </nav>
        <button onClick={handleLogout} className="admin-logout"><LogOut size={20} /> Exit Admin</button>
      </aside>

      {/* Main Content Pane */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
