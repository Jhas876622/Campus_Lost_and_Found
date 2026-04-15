const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    studentId: {
      type: String,
      maxlength: [20, 'Student ID cannot exceed 20 characters'],
    },
    department: {
      type: String,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Please select your college'],
    },
    role: {
      type: String,
      enum: ['user', 'collegeAdmin', 'superAdmin'],
      default: 'user',
    },
    notificationPreferences: {
      emailOnMatch: { type: Boolean, default: true },
      emailOnClaim: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
userSchema.index({ college: 1, email: 1 });

// Virtual for user's items
userSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'postedBy',
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, college: this.college },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    department: this.department,
    college: this.college,
    role: this.role,
    notificationPreferences: this.notificationPreferences,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

// userSchema.virtual('items', {
//   ref: 'Item',
//   localField: '_id',
//   foreignField: 'postedBy',
// });
