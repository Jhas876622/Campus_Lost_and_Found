const User = require('../models/User');
const College = require('../models/College');
const crypto = require('crypto');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../config/email');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department, studentId, collegeId } = req.body;

  // Check if college exists and is active
  const college = await College.findById(collegeId);
  if (!college) {
    throw new AppError('College not found', 404);
  }
  if (!college.isActive || !college.isVerified) {
    throw new AppError('This college is not available for registration', 400);
  }

  // Check email domain restriction
  if (college.settings.requireEmailDomain && college.settings.emailDomains.length > 0) {
    const emailDomain = '@' + email.split('@')[1];
    if (!college.settings.emailDomains.includes(emailDomain)) {
      throw new AppError(`Please use your college email (${college.settings.emailDomains.join(' or ')})`, 400);
    }
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    department,
    studentId,
    college: collegeId,
    isVerified: college.settings.autoApproveUsers,
  });

  // Update college stats
  await College.findByIdAndUpdate(collegeId, {
    $inc: { 'stats.totalUsers': 1 },
  });

  // Send welcome email
  try {
    await sendEmail({
      to: email,
      subject: `Welcome to ${college.name} Lost & Found!`,
      html: emailTemplates.welcome(name, college.name),
    });
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
  }

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    data: {
      user: user.getPublicProfile(),
      college: {
        id: college._id,
        name: college.name,
        shortName: college.shortName,
        logo: college.logo,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user with password
  const user = await User.findOne({ email })
    .select('+password')
    .populate('college', 'name shortName logo isActive isVerified');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }

  // Check if college is still valid (could be deleted)
  if (!user.college) {
    throw new AppError('Your college account no longer exists. Please contact support.', 401);
  }

  // Check if college is active
  if (!user.college.isActive || !user.college.isVerified) {
    throw new AppError('Your college is currently not available', 401);
  }

  // Generate token
  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    data: {
      user: user.getPublicProfile(),
      college: {
        id: user.college._id,
        name: user.college.name,
        shortName: user.college.shortName,
        logo: user.college.logo,
      },
      token,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('college', 'name shortName logo');

  res.status(200).json({
    success: true,
    data: { 
      user: user.getPublicProfile(),
      college: user.college,
    },
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'department', 'studentId', 'notificationPreferences'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).populate('college', 'name shortName logo');

  res.status(200).json({
    success: true,
    data: { 
      user: user.getPublicProfile(),
      college: user.college,
    },
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Logout (client-side)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    throw new AppError('Email could not be sent', 500);
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
});

// @desc    Auth with Google (Login or provide details for Register)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res, next) => {
  const { credential, collegeId, phone, department, studentId } = req.body;

  if (!credential) {
    return next(new AppError('Google credential required', 400));
  }

  // Verify Google Token
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  // Check if user exists
  let user = await User.findOne({ email }).populate('college', 'name shortName logo isActive isVerified');

  if (user) {
    // If user exists, but doesn't have googleId linked, link it
    if (!user.googleId) {
      user.googleId = googleId;
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
      }
      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    if (!user.college || !user.college.isActive || !user.college.isVerified) {
      return next(new AppError('Your college is currently not available', 401));
    }

    // Generate token and login
    const token = user.generateAuthToken();
    return res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        college: {
          id: user.college._id,
          name: user.college.name,
          shortName: user.college.shortName,
          logo: user.college.logo,
        },
        token,
      },
    });
  }

  // User does NOT exist.
  // Check if they provided collegeId (this means they are completing registration)
  if (!collegeId) {
    // Not enough info to create user. We must ask them for college.
    return res.status(202).json({
      success: true,
      action: 'REQUIRE_COLLEGE',
      message: 'Please select your college to complete registration',
      data: { email, name, googleId },
    });
  }

  // They provided college details! Check college.
  const college = await College.findById(collegeId);
  if (!college) {
    throw new AppError('College not found', 404);
  }
  if (!college.isActive || !college.isVerified) {
    throw new AppError('This college is not available for registration', 400);
  }

  // Check email domain restriction
  if (college.settings.requireEmailDomain && college.settings.emailDomains.length > 0) {
    const emailDomain = '@' + email.split('@')[1];
    if (!college.settings.emailDomains.includes(emailDomain)) {
      throw new AppError(`Please use your college email (${college.settings.emailDomains.join(' or ')})`, 400);
    }
  }

  // Create user
  user = await User.create({
    name,
    email,
    googleId,
    authProvider: 'google',
    phone,
    department,
    studentId,
    college: collegeId,
    isVerified: college.settings.autoApproveUsers,
  });

  // Fetch with populated college
  user = await User.findById(user._id).populate('college', 'name shortName logo isActive isVerified');

  // Update college stats
  await College.findByIdAndUpdate(collegeId, {
    $inc: { 'stats.totalUsers': 1 },
  });

  // Generate token and login
  const token = user.generateAuthToken();
  res.status(201).json({
    success: true,
    data: {
      user: user.getPublicProfile(),
      college: {
        id: user.college._id,
        name: user.college.name,
        shortName: user.college.shortName,
        logo: user.college.logo,
      },
      token,
    },
  });
});