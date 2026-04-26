import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['product_view', 'add_to_cart', 'purchase'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
