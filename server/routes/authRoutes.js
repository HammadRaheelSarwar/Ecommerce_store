import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import { getIO } from '../socket.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/mail.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const otpExpiryMinutes = Number(process.env.EMAIL_OTP_EXPIRY_MINUTES || 10);
const resendCooldownMs = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_MS || 60000);
const maxResends = Number(process.env.EMAIL_OTP_MAX_RESENDS || 5);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[ch]));

const buildOtpEmail = (name, otpCode) => ({
  subject: 'Verify Your Account',
  text: `Your verification code is: ${otpCode}. This code expires in ${otpExpiryMinutes} minutes.`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Verify Your Account</h2>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Your verification code is:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px;padding:12px 16px;background:#f3f4f6;border-radius:12px;display:inline-block">${otpCode}</div>
      <p>This code expires in ${otpExpiryMinutes} minutes.</p>
    </div>
  `,
});

router.get('/me', protect, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) { res.json(user); } else {
    res.status(404); throw new Error('User not found');
  }
}));

// 1. STANDARD LOGIN
router.post('/login', expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: normalizeEmail(email) });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isBlocked) { res.status(403); throw new Error('Account blocked by admin'); }
    if (user.isVerified === false) {
      res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
      return;
    }
    
    if (user.isTwoFactorEnabled) {
       return res.json({ requires2FA: true, userId: user._id });
    }

    user.lastLogin = new Date();
    await user.save();
    try { getIO().to('admin_room').emit('userLoggedIn', user); } catch(e){}

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified !== false, token: generateToken(user._id) });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
}));

// 2. 2FA VERIFICATION (For Login Intercept)
router.post('/verify-2fa', expressAsyncHandler(async (req, res) => {
  const { userId, token } = req.body;
  const user = await User.findById(userId);

  if (!user) { res.status(404); throw new Error('User not found'); }
  if (!user.isTwoFactorEnabled) { res.status(400); throw new Error('2FA not enabled on this account'); }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2 // allow 60 second drift natively to combat latency
  });

  if (isValid) {
    user.lastLogin = new Date();
    await user.save();
    try { getIO().to('admin_room').emit('userLoggedIn', user); } catch(e){}
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified !== false, token: generateToken(user._id) });
  } else {
    res.status(401); throw new Error('Invalid authentication code');
  }
}));

// 3. GENERATE 2FA QR (Protected)
router.post('/generate-2fa', protect, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const secret = speakeasy.generateSecret({ name: `AllAvailable (${user.email})` });
  
  user.twoFactorSecret = secret.base32;
  await user.save();

  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if(err) { res.status(500); throw new Error('QR Code Generation Failed'); }
    res.json({ secret: secret.base32, qrCode: data_url });
  });
}));

// 4. ENABLE 2FA CONFIRMATION (Protected)
router.post('/enable-2fa', protect, expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id);

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 1
  });

  if (isValid) {
    user.isTwoFactorEnabled = true;
    await user.save();
    res.json({ message: 'Two-Factor Authentication successfully enabled!' });
  } else {
    res.status(400); throw new Error('Invalid token. 2FA not enabled.');
  }
}));

// 5. REGISTRATION
router.post('/register', expressAsyncHandler(async (req, res) => {
  const { name, email, password, role, adminKey } = req.body;
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || '').trim();

  if (!cleanName || !cleanEmail || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }
  if (String(password).length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }
  
  let assignedRole = 'user';
  
  if (role === 'admin') {
     const verifiedAdminToken = process.env.ADMIN_KEY || 'kaka';
     if (adminKey !== verifiedAdminToken) {
         res.status(401); 
         throw new Error('Invalid Admin Key Authorization');
     }
     assignedRole = 'admin';
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const otpCode = generateOtp();
  const otpHash = await bcrypt.hash(otpCode, salt);

  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    password: hashedPassword,
    role: assignedRole,
    isVerified: false,
    otpCode: otpHash,
    otpExpiry: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
    otpResendCount: 0,
    otpLastSentAt: new Date(),
  });
  
  if (user) {
    try {
      await sendEmail({
        to: user.email,
        ...buildOtpEmail(user.name, otpCode),
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      res.status(500);
      throw new Error(error.message || 'Failed to send verification email');
    }

    res.status(201).json({
      message: 'Verification code sent to your email',
      email: user.email,
      requiresVerification: true,
    });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
}));

router.post('/verify-email', expressAsyncHandler(async (req, res) => {
  const { email, otpCode } = req.body;
  const cleanEmail = normalizeEmail(email);
  const code = String(otpCode || '').trim();

  if (!cleanEmail || !code) {
    res.status(400);
    throw new Error('Email and verification code are required');
  }

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  if (user.isVerified) {
    return res.json({
      message: 'Email already verified',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: true,
      token: generateToken(user._id),
    });
  }

  if (!user.otpCode || !user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
    res.status(400);
    throw new Error('Verification code expired');
  }

  const isValid = await bcrypt.compare(code, user.otpCode);
  if (!isValid) {
    res.status(400);
    throw new Error('Invalid verification code');
  }

  user.isVerified = true;
  user.otpCode = '';
  user.otpExpiry = undefined;
  user.otpResendCount = 0;
  user.otpLastSentAt = undefined;
  user.lastLogin = new Date();
  await user.save();

  try { getIO().to('admin_room').emit('newUserRegistered', user); } catch (e) {}

  res.json({
    message: 'Email verified successfully',
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    token: generateToken(user._id),
  });
}));

router.post('/resend-otp', expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Account is already verified');
  }

  if (user.otpLastSentAt && (Date.now() - new Date(user.otpLastSentAt).getTime()) < resendCooldownMs) {
    res.status(429);
    throw new Error('Please wait before requesting another code');
  }

  if ((user.otpResendCount || 0) >= maxResends) {
    res.status(429);
    throw new Error('Verification code resend limit reached');
  }

  const salt = await bcrypt.genSalt(10);
  const otpCode = generateOtp();
  user.otpCode = await bcrypt.hash(otpCode, salt);
  user.otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
  user.otpLastSentAt = new Date();
  user.otpResendCount = (user.otpResendCount || 0) + 1;
  await user.save();

  await sendEmail({
    to: user.email,
    ...buildOtpEmail(user.name, otpCode),
  });

  res.json({ message: 'Verification code resent successfully' });
}));

export default router;
