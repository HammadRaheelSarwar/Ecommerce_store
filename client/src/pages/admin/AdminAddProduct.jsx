import React, { useState } from 'react';
import { Plus, Trash2, Image, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    category: 'Male', subcategory: '', brand: '', stock: '',
  });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([{ size: '', color: '', stock: '' }]);
  const [loading, setLoading] = useState(false);

  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error('Unable to load image'));
      image.onload = () => {
        const maxWidth = 1400;
        const quality = 0.78;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to process image'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    try {
      const compressedImages = await Promise.all(files.map((file) => compressImage(file)));
      setImages((prev) => [...prev, ...compressedImages]);
    } catch (error) {
      toast.error(error.message || 'Failed to process image');
    }
    e.target.value = '';
  };

  const addVariant = () => setVariants(prev => [...prev, { size: '', color: '', stock: '' }]);
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice || 0),
        category: form.subcategory || 'General',
        gender: form.category,
        brand: form.brand,
        stock: Number(form.stock),
        variants: variants.map(v => ({
          size: v.size,
          color: v.color,
          stock: Number(v.stock || 0),
        })),
        images,
      };

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Product created successfully!');
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch(err) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="admin-page page-transition">
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title-section" style={{ margin: 0 }}>Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-add-product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column */}
          <div className="glass admin-add-product-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Core Details</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Product Name *</label>
              <input required style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Classic Leather Watch" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Description</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Product details..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Price (PKR) *</label>
                <input required type="number" style={inputStyle} value={form.price} onChange={set('price')} placeholder="0" />
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Discount Price</label>
                <input type="number" style={inputStyle} value={form.discountPrice} onChange={set('discountPrice')} placeholder="Optional" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Gender</label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Subcategory</label>
                <input style={inputStyle} value={form.subcategory} onChange={set('subcategory')} placeholder="Watches, Shoes..." />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Brand</label>
                <input style={inputStyle} value={form.brand} onChange={set('brand')} placeholder="Brand name" />
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>Base Stock</label>
                <input type="number" style={inputStyle} value={form.stock} onChange={set('stock')} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="admin-add-product-side" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Images */}
            <div className="glass admin-image-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Product Images</h3>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <Image size={22} /> Upload Images (multi-select)
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              <div className="admin-image-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent)' }} />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="glass admin-variant-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--accent)' }}>Variants</h3>
                <button type="button" onClick={addVariant} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="admin-variant-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Size (S/M/L/XL)" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                  <input style={inputStyle} placeholder="Color" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                  <input type="number" style={inputStyle} placeholder="Qty" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                  <button type="button" onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-add-product-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem' }}>
            <Save size={18} /> {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>

      <style>{`
        @media (max-width: 1024px) {
          .admin-add-product-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .admin-add-product-panel,
          .admin-image-panel,
          .admin-variant-panel {
            padding: 1.25rem !important;
          }

          .admin-variant-row {
            grid-template-columns: 1fr !important;
          }

          .admin-add-product-actions {
            flex-direction: column;
          }

          .admin-add-product-actions .btn {
            width: 100%;
          }

          .admin-image-grid {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAddProduct;
