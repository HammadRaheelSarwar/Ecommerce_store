import React, { useContext, useEffect, useState } from 'react';
import { Users, Package, TrendingUp, DollarSign } from 'lucide-react';
import { SocketContext } from '../../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../../lib/api';

const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card glass" style={{ borderTop: `4px solid ${color}` }}>
    <div className="stat-info">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
    <div className="stat-icon" style={{ color }}>{icon}</div>
  </div>
);

const currency = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const buildChartData = (orders) => {
  const buckets = new Map();

  [...orders]
    .filter(order => order?.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((order) => {
      const label = new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      buckets.set(label, (buckets.get(label) || 0) + Number(order.totalPrice || 0));
    });

  return Array.from(buckets.entries()).slice(-8).map(([time, sales]) => ({ time, sales }));
};

const formatFeedItem = (order) => ({
  id: order._id,
  title: order.orderItems?.[0]?.name || 'Order',
  name: order.shippingDetails?.name || 'Customer',
  totalPrice: Number(order.totalPrice || 0),
  paymentMethod: order.paymentMethod || 'COD',
  createdAt: order.createdAt,
  status: order.status || 'pending',
});

const AdminDashboard = () => {
  const { socket, activeUsers } = useContext(SocketContext);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [chartData, setChartData] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;

    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(apiUrl('/api/orders'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(apiUrl('/api/admin/users'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const users = usersRes.ok ? await usersRes.json() : [];

      const normalizedOrders = Array.isArray(orders) ? orders : [];
      const normalizedUsers = Array.isArray(users) ? users : [];

      setTotalOrders(normalizedOrders.length);
      setTotalRevenue(normalizedOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0));
      setTotalUsers(normalizedUsers.length);
      setLiveFeed(normalizedOrders.slice(0, 10).map(formatFeedItem));
      setChartData(buildChartData(normalizedOrders));
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      const normalized = formatFeedItem(order);

      toast.success(`New order received for ${currency(normalized.totalPrice)}!`, {
        icon: '💰',
        style: {
          borderRadius: '10px',
          background: 'rgba(0, 229, 255, 0.2)',
          color: '#fff',
          border: '1px solid var(--accent)',
          backdropFilter: 'blur(10px)',
        },
      });

      setTotalOrders(prev => prev + 1);
      setTotalRevenue(prev => prev + normalized.totalPrice);
      setLiveFeed(prev => [normalized, ...prev].slice(0, 10));
      setChartData(prev => {
        const next = [...prev];
        const time = new Date(normalized.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const lastValue = next.length ? next[next.length - 1].sales : 0;
        next.push({ time, sales: lastValue + normalized.totalPrice });
        return next.slice(-8);
      });
    };

    socket.on('NEW_ORDER', handleNewOrder);
    socket.on('admin_authenticated', loadDashboard);

    return () => {
      socket.off('NEW_ORDER', handleNewOrder);
      socket.off('admin_authenticated', loadDashboard);
    };
  }, [socket]);

  return (
    <div className="admin-page page-transition">
      <Toaster position="top-right"/>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h1 className="title-section" style={{margin:0}}>System Overview (LIVE)</h1>
        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'#10b981', fontWeight:600}}>
          <span className="live-indicator"></span> Socket Channel Active
        </div>
      </div>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <StatCard title="Active Users" value={activeUsers} icon={<Users size={32}/>} color="#00E5FF" />
        <StatCard title="Total Orders" value={loading ? 'Loading...' : totalOrders} icon={<Package size={32}/>} color="#F59E0B" />
        <StatCard title="Total Revenue" value={loading ? 'Loading...' : currency(totalRevenue)} icon={<DollarSign size={32}/>} color="#10B981" />
        <StatCard title="Registered Users" value={loading ? 'Loading...' : totalUsers} icon={<TrendingUp size={32}/>} color="#8B5CF6" />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'2rem'}}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{marginBottom:'1.5rem'}}>Real-Time Sales Trend</h3>
          {chartData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No completed orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                <XAxis dataKey="time" stroke="var(--text-muted)"/>
                <YAxis stroke="var(--text-muted)"/>
                <Tooltip contentStyle={{background:'rgba(2, 11, 24, 0.9)', border:'1px solid var(--border)', borderRadius:'8px'}}/>
                <Line type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', maxHeight: '400px', overflowY:'auto' }}>
          <h3>Live Tracking Feed</h3>
          <p className="text-muted" style={{fontSize:'0.85rem', marginBottom:'1.5rem'}}>Latest incoming orders via Socket.IO</p>
          {liveFeed.length === 0 ? <p style={{color:'var(--text-muted)'}}>No live orders yet.</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {liveFeed.map((order) => (
                <div key={order.id} style={{padding:'1rem', borderLeft:'3px solid var(--accent)', background:'rgba(0, 229, 255, 0.05)', borderRadius:'8px', animation:'slideUp 0.3s forwards'}}>
                  <strong>{order.name}</strong><br />
                  <span style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{order.title}</span><br />
                  <span style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{currency(order.totalPrice)} • {order.paymentMethod} • {order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`.live-indicator { width:10px; height:10px; background:#10b981; border-radius:50%; box-shadow:0 0 10px #10b981; animation:pulse 1.5s infinite; } @keyframes pulse { 0% { transform:scale(1); opacity:1; } 100% { transform:scale(1.5); opacity:0; } }`}</style>
    </div>
  );
};

export default AdminDashboard;
