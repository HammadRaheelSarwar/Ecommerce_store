import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'vendor'], default: 'user', required: true },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    otpCode: { type: String, default: '' },
    otpExpiry: { type: Date },
    otpResendCount: { type: Number, default: 0 },
    otpLastSentAt: { type: Date }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
