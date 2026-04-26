import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { SocketContext } from '../../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_COLORS = {
  pending:    '#F59E0B',
  processing: '#3B82F6',
  shipped:    '#8B5CF6',
  delivered:  '#10B981',
  cancelled:  '#EF4444',
};

const AdminOrders = () => {
  const { socket } = useContext(SocketContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_ORDER', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.success('New order arrived!', { icon: '📦' });
    });
    return () => socket.off('NEW_ORDER');
  }, [socket]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        toast.success(`Order status → ${status}`);
      }
    } catch (e) { toast.error('Failed to update status'); }
  };

  return (
    <div className="admin-page page-transition">
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title-section" style={{ margin: 0 }}>Order Management</h1>
        <button className="btn btn-outline" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? <p>Loading orders...</p> : (
        <div className="admin-table-container glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders found.</td></tr>
              )}
              {orders.map(order => (
                <tr key={order._id} style={{ animation: 'slideUp 0.3s ease' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order._id?.substring(0, 12)}...</td>
                  <td>{order.orderItems?.length || 0} items</td>
                  <td><strong>PKR {order.totalPrice?.toLocaleString()}</strong></td>
                  <td>{order.paymentMethod || 'COD'}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[order.status] || '#888'}22`, color: STATUS_COLORS[order.status] || '#888', border: `1px solid ${STATUS_COLORS[order.status] || '#888'}` }}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <select
                        defaultValue={order.status || 'pending'}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        style={{ padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
