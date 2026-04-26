import React, { useEffect, useState } from 'react';
import useApi from '../../hooks/useApi';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../lib/api';

const AdminProducts = () => {
  const { data: products, loading, error, execute } = useApi(apiUrl('/api/products'));
  const [productList, setProductList] = useState([]);
  const [activeTab, setActiveTab] = useState('Male');
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;

  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await execute();
        if(res && Array.isArray(res)) setProductList(res);
      } catch(e) { console.error(e) }
    };
    fetchProds();
  }, [execute]);

  return (
    <div className="admin-page page-transition">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
        <h1 className="title-section" style={{margin:0}}>Product Inventory</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18}/> New Product</button>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('Male')} 
          style={{ padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', background: activeTab === 'Male' ? 'var(--accent)' : 'rgba(0,0,0,0.2)', color: activeTab === 'Male' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: '0.3s' }}
        >
          Male Section
        </button>
        <button 
          onClick={() => setActiveTab('Female')} 
          style={{ padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', background: activeTab === 'Female' ? 'var(--accent)' : 'rgba(0,0,0,0.2)', color: activeTab === 'Female' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: '0.3s' }}
        >
          Female Section
        </button>
      </div>

      {loading ? <p>Loading directory...</p> : error ? <p style={{color: '#ef4444'}}>Failed to load products: {error}</p> : (
        <div className="admin-table-container glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Variants</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productList.filter(p => p.gender === activeTab).map(p => (
                <tr key={p._id}>
                  <td>{p._id.substring(0, 8)}...</td>
                  <td>
                    <img
                      src={p.images?.[0] || p.image || 'https://placehold.co/64x64/0A1F44/00E5FF?text=No+Img'}
                      alt={p.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>PKR {p.price}</td>
                  <td>{p.variants?.length || 0}</td>
                  <td>
                    <span className={`status-badge ${p.stock > 0 ? 'success' : 'danger'}`}>
                      {p.stock > 0 ? p.stock : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'1rem'}}>
                      <button className="btn btn-outline" style={{padding:'0.4rem', border:'none'}}><Edit2 size={16} color="var(--accent)"/></button>
                      <button className="btn btn-outline" onClick={async () => {
                        if(window.confirm('Delete this product permanently?')) {
                          await fetch(apiUrl(`/api/products/${p._id}`), { method: 'DELETE', headers: {Authorization: `Bearer ${token}`} });
                          setProductList(prev => prev.filter(x => x._id !== p._id));
                        }
                      }} style={{padding:'0.4rem', border:'none'}}><Trash2 size={16} color="#ef4444"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {productList.filter(p => p.gender === activeTab).length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No {activeTab} inventory located in the database schema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
