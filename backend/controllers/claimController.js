const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../config/email');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Create a claim for an item
// @route   POST /api/claims
// @access  Private
const createClaim = asyncHandler(async (req, res, next) => {
  const { itemId, description, verificationAnswer, contactNumber } = req.body;

  // Check if item exists
  const item = await Item.findById(itemId).populate('postedBy');
  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  // Check if item is still active
  if (item.status !== 'active') {
    return next(new AppError('This item is no longer available for claiming', 400));
  }

  // Check if user is trying to claim their own item
  if (item.postedBy._id.toString() === req.user.id) {
    return next(new AppError('You cannot claim your own item', 400));
  }

  // Check if user already has a pending claim for this item
  const existingClaim = await Claim.findOne({
    item: itemId,
    claimant: req.user.id,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingClaim) {
    return next(new AppError('You already have a claim for this item', 400));
  }

  // Process proof images via Cloudinary
  const proofImages = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.buffer, 'claims');
      proofImages.push(uploaded);
    }
  }

  // Create claim
  const claim = await Claim.create({
    item: itemId,
    claimant: req.user.id,
    description,
    verificationAnswer,
    contactNumber,
    proofImages,
  });

  // Populate claim for response
  await claim.populate('claimant', 'name email avatar');

  // Send email notification to item owner
  try {
    if (item.postedBy.notificationPreferences?.emailOnClaim !== false) {
      const claimEmail = emailTemplates.claimRequest(
        item.postedBy.name,
        item,
        req.user
      );
      await sendEmail({
        to: item.postedBy.email,
        subject: claimEmail.subject,
        html: claimEmail.html,
      });
    }
  } catch (error) {
    console.error('Error sending claim notification:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Claim submitted successfully. The item owner will review it.',
    data: {
      claim,
    },
  });
});

// @desc    Get claims for an item (for item owner)
// @route   GET /api/claims/item/:itemId
// @access  Private
const getItemClaims = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.itemId);

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  // Check if user owns the item or is college/super admin
  if (
    item.postedBy.toString() !== req.user.id &&
    req.user.role !== 'collegeAdmin' &&
    req.user.role !== 'superAdmin'
  ) {
    return next(new AppError('Not authorized to view these claims', 403));
  }

  const claims = await Claim.find({ item: req.params.itemId })
    .populate('claimant', 'name email phone avatar department')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      claims,
    },
  });
});

// @desc    Get user's claims
// @route   GET /api/claims/my-claims
// @access  Private
const getMyClaims = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { claimant: req.user.id };
  if (status) query.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const claims = await Claim.find(query)
    .populate({
      path: 'item',
      select: 'title type category location images status postedBy',
      populate: { path: 'postedBy', select: 'name email' },
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await Claim.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      claims,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// @desc    Update claim status (approve/reject)
// @route   PUT /api/claims/:id/status
// @access  Private (item owner or admin)
const updateClaimStatus = asyncHandler(async (req, res, next) => {
  const { status, reviewNotes, meetupLocation, meetupTime } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be approved or rejected.', 400));
  }

  const claim = await Claim.findById(req.params.id)
    .populate('claimant', 'name email')
    .populate('item');

  if (!claim) {
    return next(new AppError('Claim not found', 404));
  }

  const item = await Item.findById(claim.item._id);

  // Check authorization
  if (
    item.postedBy.toString() !== req.user.id &&
    req.user.role !== 'collegeAdmin' &&
    req.user.role !== 'superAdmin'
  ) {
    return next(new AppError('Not authorized to update this claim', 403));
  }

  // Update claim
  if (status === 'approved') {
    await claim.approve(req.user.id, reviewNotes);
    if (meetupLocation) claim.meetupLocation = meetupLocation;
    if (meetupTime) claim.meetupTime = meetupTime;
    await claim.save();
  } else {
    await claim.reject(req.user.id, reviewNotes);
  }

  // Send email notification to claimant
  try {
    const statusEmail = emailTemplates.claimStatusUpdate(
      claim.claimant,
      item,
      status
    );
    await sendEmail({
      to: claim.claimant.email,
      subject: statusEmail.subject,
      html: statusEmail.html,
    });
  } catch (error) {
    console.error('Error sending status notification:', error);
  }

  res.status(200).json({
    success: true,
    message: `Claim ${status} successfully`,
    data: {
      claim,
    },
  });
});

// @desc    Cancel a claim
// @route   PUT /api/claims/:id/cancel
// @access  Private (claimant only)
const cancelClaim = asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(new AppError('Claim not found', 404));
  }

  // Check if user owns the claim
  if (claim.claimant.toString() !== req.user.id) {
    return next(new AppError('Not authorized to cancel this claim', 403));
  }

  // Can only cancel pending claims
  if (claim.status !== 'pending') {
    return next(new AppError('Can only cancel pending claims', 400));
  }

  claim.status = 'cancelled';
  await claim.save();

  res.status(200).json({
    success: true,
    message: 'Claim cancelled successfully',
  });
});

// @desc    Get single claim details
// @route   GET /api/claims/:id
// @access  Private
const getClaim = asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id)
    .populate('claimant', 'name email phone avatar department')
    .populate({
      path: 'item',
      populate: { path: 'postedBy', select: 'name email' },
    })
    .populate('reviewedBy', 'name');

  if (!claim) {
    return next(new AppError('Claim not found', 404));
  }

  // Check authorization - only claimant, item owner, or college/super admin can view
  const itemOwnerId = claim.item.postedBy._id.toString();
  if (
    claim.claimant._id.toString() !== req.user.id &&
    itemOwnerId !== req.user.id &&
    req.user.role !== 'collegeAdmin' &&
    req.user.role !== 'superAdmin'
  ) {
    return next(new AppError('Not authorized to view this claim', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      claim,
    },
  });
});

module.exports = {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus,
  cancelClaim,
  getClaim,
};
