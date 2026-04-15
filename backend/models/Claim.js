const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      required: [true, 'Please describe why you think this is your item'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    verificationAnswer: {
      type: String,
      maxlength: [200, 'Answer cannot be more than 200 characters'],
    },
    proofImages: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    contactNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      maxlength: [300, 'Review notes cannot be more than 300 characters'],
    },
    meetupLocation: {
      type: String,
    },
    meetupTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate claims from same user for same item
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

// Index for efficient queries
claimSchema.index({ status: 1 });
claimSchema.index({ claimant: 1 });
claimSchema.index({ createdAt: -1 });

// Static method to check if user already claimed an item
claimSchema.statics.hasUserClaimed = async function (itemId, userId) {
  const claim = await this.findOne({ item: itemId, claimant: userId });
  return !!claim;
};

// Virtual for time since claim
claimSchema.virtual('timeSinceClaim').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to approve claim
claimSchema.methods.approve = async function (reviewerId, notes) {
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  await this.save();

  // Update item status
  const Item = mongoose.model('Item');
  await Item.findByIdAndUpdate(this.item, {
    status: 'claimed',
    claimedBy: this.claimant,
    claimedAt: new Date(),
  });

  // Reject all other claims for this item
  await this.constructor.updateMany(
    { item: this.item, _id: { $ne: this._id } },
    { status: 'rejected', reviewedAt: new Date(), reviewNotes: 'Another claim was approved' }
  );
};

// Method to reject claim
claimSchema.methods.reject = async function (reviewerId, notes) {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  await this.save();
};

module.exports = mongoose.model('Claim', claimSchema);
