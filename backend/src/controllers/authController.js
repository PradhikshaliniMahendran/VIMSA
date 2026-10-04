import crypto from 'crypto';
import admin from '../utils/firebaseAdmin.js';
import emailValidator from 'deep-email-validator';
import { User, PendingUser } from '../models/UserSchema.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateOTP, generateReferralCode } from '../utils/helpers.js';
import { sendEmail, welcomeEmail, otpEmail, passwordResetEmail } from '../utils/emailService.js';

export const validateEmailAddress = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Run deep email validation
    const validateFn = emailValidator.validate || emailValidator;
    const result = await validateFn(email);

    if (result.valid) {
      return res.json({ success: true, valid: true });
    } else {
      let msg = 'Please provide a real, active email address.';
      if (result.validators.disposable && !result.validators.disposable.valid) {
        msg = 'Disposable email addresses are not allowed.';
      }
      return res.status(400).json({ 
        success: false, 
        valid: false, 
        message: msg
      });
    }
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !mobileNumber || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const slMobileRegex = /^(?:\+94|94|0)?7[01245678]\d{7}$/;
    if (!slMobileRegex.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567)' });
    }

    const existing = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email or mobile number already registered' });

    const otp = generateOTP();

    // Delete any existing pending user for this email to prevent duplicates
    await PendingUser.findOneAndDelete({ email });

    await PendingUser.create({
      firstName, lastName, email, mobileNumber, password,
      verificationOTP: otp,
    });

    // Send OTP email
    try {
      await sendEmail(email, 'Welcome to VIMSA – Verify Your Account', welcomeEmail(firstName));
      await sendEmail(email, 'VIMSA – Your OTP Verification Code', otpEmail(firstName, otp));
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      needsVerification: true,
      email,
      message: 'Account created! Please check your email for the OTP verification code.',
    });
  } catch (err) { next(err); }
};

export const registerWithFirebase = async (req, res, next) => {
  try {
    const { idToken, firstName, lastName, email, mobileNumber, password } = req.body;
    
    if (!idToken || !firstName || !lastName || !email || !mobileNumber || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 1. Verify the Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error('Firebase token verification failed:', err);
      return res.status(401).json({ success: false, message: 'Invalid or expired phone verification token.' });
    }

    // 2. Extract phone number from token
    const verifiedPhone = decodedToken.phone_number;
    
    // We should normalize the user's input mobileNumber to E.164 to compare, 
    // or just trust that Firebase verified THIS user's phone. 
    // Firebase phone_number is like "+94771234567"
    if (!verifiedPhone) {
      return res.status(400).json({ success: false, message: 'Phone number not found in verification token.' });
    }

    // Optional: Delete from PendingUser if they had one
    await PendingUser.findOneAndDelete({ email });

    const referralCode = generateReferralCode();

    // 3. Create the verified User
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber, // store their input or verifiedPhone
      password,
      isVerified: true, // Auto-verified!
      referralCode
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);
    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send Welcome Email (optional)
    try {
      await sendEmail(email, 'Welcome to VIMSA Luxury', welcomeEmail(firstName));
    } catch (e) {
      console.log('Welcome email fail', e);
    }

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email or mobile number already registered' });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.lockUntil && user.lockUntil > Date.now())
      return res.status(403).json({ success: false, message: `Account locked. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5)
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const remaining = Math.max(0, 5 - user.failedLoginAttempts);
      return res.status(401).json({ success: false, message: `Invalid credentials.${remaining > 0 ? ` ${remaining} attempts remaining.` : ' Account locked for 30 minutes.'}` });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    // If account not verified, send a fresh OTP
    if (!user.isVerified) {
      const otp = generateOTP();
      user.verificationOTP = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try {
        await sendEmail(user.email, 'VIMSA – OTP Verification', otpEmail(user.firstName, otp));
      } catch (emailErr) {
        console.error('OTP email send failed:', emailErr.message);
      }
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: user.email,
        message: 'Account not verified. A new OTP has been sent to your email.',
      });
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens.shift();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken, refreshToken,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isVerified: user.isVerified },
      },
    });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    // Check if it's a pending user completing registration
    const pendingUser = await PendingUser.findOne({ email });
    
    if (pendingUser) {
      if (pendingUser.verificationOTP !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // OTP is valid. Move user from PendingUser to User
      const referralCode = generateReferralCode();
      const newUser = await User.create({
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        email: pendingUser.email,
        mobileNumber: pendingUser.mobileNumber,
        password: pendingUser.password, // Raw password, will be hashed by UserSchema pre-save
        isVerified: true,
        referralCode,
      });

      // Delete the pending user record
      await PendingUser.findByIdAndDelete(pendingUser._id);

      const accessToken = generateAccessToken({ id: newUser._id, role: newUser.role });
      const refreshToken = generateRefreshToken({ id: newUser._id });
      newUser.refreshTokens.push(refreshToken);
      await newUser.save();

      return res.json({
        success: true,
        message: 'Account verified successfully! Welcome to VIMSA!',
        data: {
          accessToken, refreshToken,
          user: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, role: newUser.role, isVerified: true },
        },
      });
    }

    // If not pending, it might be an existing unverified user trying to verify (legacy flow)
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified' });
    if (user.verificationOTP !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpiry = undefined;

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You are now logged in.',
      data: {
        accessToken, refreshToken,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isVerified: true },
      },
    });
  } catch (err) { next(err); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(email, 'VIMSA – Reset Your Password', passwordResetEmail(user.firstName, resetUrl));
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token))
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens -verificationOTP -resetPasswordToken');
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    let isPending = false;
    
    if (!user) {
      user = await PendingUser.findOne({ email });
      isPending = true;
    }
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!isPending && user.isVerified) return res.status(400).json({ success: false, message: 'Already verified' });

    const otp = generateOTP();
    user.verificationOTP = otp;
    if (!isPending) user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // For PendingUser, it will auto-delete based on the new createdAt or we just save and it'll expire naturally based on the original createdAt.
    // If we want to extend it, we can reset createdAt:
    if (isPending) user.createdAt = Date.now();
    
    await user.save();
    try {
      await sendEmail(email, 'VIMSA – New OTP', otpEmail(user.firstName, otp));
    } catch (emailErr) {
      console.error('Resend OTP email failed:', emailErr.message);
    }
    res.json({ success: true, message: 'New OTP sent to your email' });
  } catch (err) { next(err); }
};
