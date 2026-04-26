import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import { getIO, broadcastNewPurchase } from '../socket.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/mail.js';

const router = express.Router();

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[ch]));

router.post('/', protect, expressAsyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingDetails,
    paymentMethod,
    itemsPrice,
    shippingPrice = 0,
    totalPrice,
    paymentResult,
    isPaid = false,
    paidAt,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400); throw new Error('No order items');
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingDetails,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentResult,
    isPaid,
    paidAt,
    status: 'pending',
  });

  const createdOrder = await order.save();

  // Emit to admin room (private)
  try {
    const io = getIO();
    io.to('admin_room').emit('NEW_ORDER', createdOrder);
  } catch(e) {
    console.error('Socket Emission Failed', e);
  }

  // Broadcast to all clients for live popup (public)
  try {
    const purchaseData = {
      id: createdOrder._id,
      name: shippingDetails?.name || 'Customer',
      product: orderItems[0]?.name || 'Item',
      price: Number(totalPrice) || 0,
      timestamp: new Date(),
      city: shippingDetails?.address?.split(',')[0] || 'Pakistan',
    };
    broadcastNewPurchase(purchaseData);
  } catch(e) {
    console.error('Purchase Broadcast Failed', e);
  }

  try {
    const adminEmail = 'hammadraheel.cs@gmail.com';
    const subject = `New Order Placed - ${createdOrder._id}`;
    const customerName = escapeHtml(shippingDetails?.name || 'Customer');
    const customerEmail = escapeHtml(req.user?.email || 'N/A');
    const itemsSummary = (orderItems || []).map((item) => `<li>${escapeHtml(item.qty)} × ${escapeHtml(item.name)}</li>`).join('');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>New order placed</h2>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Total:</strong> PKR ${Number(totalPrice || 0).toLocaleString()}</p>
        <p><strong>Payment:</strong> ${paymentMethod || 'COD'}</p>
        <p><strong>Shipping:</strong> ${shippingDetails?.address || 'N/A'}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemsSummary}</ul>
        <p style="color:#666;font-size:12px">Order ID: ${createdOrder._id}</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Admin notification email failed', error);
  }

  res.status(201).json(createdOrder);
}));

// Fetch all orders (Admin Only)
router.get('/', protect, admin, expressAsyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
}));

// Update order status (Admin Only)
router.put('/:id/status', protect, admin, expressAsyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404); throw new Error('Order not found');
  }
}));

export default router;
