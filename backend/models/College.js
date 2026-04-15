const mongoose = require('mongoose');
const slugify = require('slugify');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide college name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    shortName: {
      type: String,
      required: [true, 'Please provide short name/code'],
      unique: true,
      uppercase: true,
      maxlength: [10, 'Short name cannot exceed 10 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide college email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
      country: { type: String, default: 'India' },
    },
    logo: {
      url: String,
      publicId: String,
    },
    website: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    settings: {
      allowPublicView: { type: Boolean, default: true },
      requireEmailDomain: { type: Boolean, default: false },
      emailDomains: [String], // e.g., ['@iitd.ac.in', '@students.iitd.ac.in']
      autoApproveUsers: { type: Boolean, default: true },
    },
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalItems: { type: Number, default: 0 },
      totalReturned: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name
collegeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for college's items
collegeSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'college',
});

// Virtual for college's users
collegeSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'college',
});

module.exports = mongoose.model('College', collegeSchema);

// collegeSchema.virtual('items', {
//   ref: 'Item',
//   localField: '_id',
//   foreignField: 'college',
// });
