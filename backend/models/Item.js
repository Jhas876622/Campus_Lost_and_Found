const mongoose = require('mongoose');
const slugify = require('slugify');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Please provide item description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Please specify if item is lost or found'],
    },
    category: {
      type: String,
      enum: [
        'electronics',
        'documents',
        'accessories',
        'clothing',
        'books',
        'keys',
        'wallet',
        'bags',
        'sports',
        'other',
      ],
      required: [true, 'Please select a category'],
    },
    location: {
      type: String,
      enum: [
        'library',
        'canteen',
        'hostel',
        'classroom',
        'lab',
        'sports_complex',
        'parking',
        'auditorium',
        'admin_block',
        'other',
      ],
      required: [true, 'Please select a location'],
    },
    locationDetails: {
      type: String,
      maxlength: [200, 'Location details cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the date'],
      default: Date.now,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    color: {
      type: String,
      maxlength: [50, 'Color cannot exceed 50 characters'],
    },
    brand: {
      type: String,
      maxlength: [50, 'Brand cannot exceed 50 characters'],
    },
    identifyingFeatures: {
      type: String,
      maxlength: [500, 'Identifying features cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'returned', 'expired', 'removed'],
      default: 'active',
    },
    verificationQuestion: {
      type: String,
      maxlength: [200, 'Verification question cannot exceed 200 characters'],
    },
    verificationAnswer: {
      type: String,
      maxlength: [200, 'Verification answer cannot exceed 200 characters'],
      select: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    views: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
itemSchema.index({ college: 1, type: 1, status: 1 });
itemSchema.index({ college: 1, category: 1 });
itemSchema.index({ college: 1, location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

// Create slug from title
itemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Virtual for claims
itemSchema.virtual('claims', {
  ref: 'Claim',
  localField: '_id',
  foreignField: 'item',
});

// Static method to find matching items (within same college)
itemSchema.statics.findMatches = async function (item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  const matches = await this.find({
    _id: { $ne: item._id },
    college: item.college, // Same college only
    type: oppositeType,
    category: item.category,
    status: 'active',
    createdAt: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  })
    .populate('postedBy', 'name email')
    .limit(10);

  return matches;
};

module.exports = mongoose.model('Item', itemSchema);
