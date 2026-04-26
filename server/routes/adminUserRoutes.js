import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, admin, expressAsyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
}));

// Block/Unblock user (Admin only)
router.put('/:id/block', protect, admin, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked' });
  } else {
    res.status(404); throw new Error('User not found');
  }
}));

export default router;
