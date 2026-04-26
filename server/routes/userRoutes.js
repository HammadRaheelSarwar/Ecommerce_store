import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { getIO } from '../socket.js';

const router = express.Router();

// 1. GET USER PROFILE
router.get('/profile', protect, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) { res.json(user); } else {
    res.status(404); throw new Error('User not found');
  }
}));

// 2. UPDATE PROFILE (Data + Image)
router.put('/profile', protect, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    if (req.body.profileImage) user.profileImage = req.body.profileImage;

    const updatedUser = await user.save();

    // Trigger Admin Live Sync Array
    try { getIO().to('admin_room').emit('userUpdated', updatedUser); } catch(err){}

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profileImage: updatedUser.profileImage
    });
  } else {
    res.status(404); throw new Error('User not found');
  }
}));

// 3. CHANGE PASSWORD
router.put('/password', protect, expressAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user && (await bcrypt.compare(oldPassword, user.password))) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password securely updated!' });
  } else {
    res.status(401); throw new Error('Invalid old password');
  }
}));

export default router;
