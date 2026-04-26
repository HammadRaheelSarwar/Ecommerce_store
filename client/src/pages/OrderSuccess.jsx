import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const { state } = useLocation();
  const orderId = state?.orderId || 'N/A';
  const paymentStatus = state?.paymentStatus || 'pending';
  const totalPaid = state?.totalPaid ?? 0;

  return (
    <div className="container page-transition" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center'}}>
      <CheckCircle size={80} color="#10b981" style={{marginBottom: '2rem'}} />
      <h1 className="title-main">Order Successfully Placed!</h1>
      <p className="text-muted" style={{maxWidth: '500px', marginBottom: '2rem'}}>
        Thank you for shopping with AllAvailable. Your order has been received and is currently being processed. You will receive an SMS confirmation shortly.
      </p>
      <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', minWidth: '280px' }}>
        <p style={{ margin: 0, fontWeight: 700 }}>Order ID</p>
        <p style={{ margin: '0.2rem 0 0.8rem', color: 'var(--text-muted)' }}>{orderId}</p>
        <p style={{ margin: 0, fontWeight: 700 }}>Payment Status</p>
        <p style={{ margin: '0.2rem 0 0.8rem', color: paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>{paymentStatus}</p>
        <p style={{ margin: 0, fontWeight: 700 }}>Total Paid</p>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--accent)' }}>PKR {Number(totalPaid).toLocaleString()}</p>
      </div>
      <Link to="/" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );
};
export default OrderSuccess;
