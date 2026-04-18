const Item = require('../models/Item');
const College = require('../models/College');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getIO } = require('../config/socket');
const { sendEmail, emailTemplates } = require('../config/email');

// @desc    Get all items (college-specific)
// @route   GET /api/items
// @access  Public
exports.getItems = asyncHandler(async (req, res) => {
  const {
    college, // college slug or id
    type,
    category,
    location,
    status = 'active',
    search,
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = { status };

  // If user is logged in, filter by their college
  if (req.user) {
    query.college = req.user.college;
  } else if (college) {
    // Public view - find college by slug or id
    const collegeQuery = {
      isActive: true,
      isVerified: true,
    };
    // Try to match by ObjectId or slug
    try {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(college)) {
        collegeQuery._id = college;
      } else {
        collegeQuery.slug = college;
      }
    } catch (e) {
      collegeQuery.slug = college;
    }
    const collegeDoc = await College.findOne(collegeQuery);
    if (!collegeDoc) {
      throw new AppError('College not found or not accessible', 404);
    }
    query.college = collegeDoc._id;
  } else {
    throw new AppError('Please select a college or login', 400);
  }

  if (type) query.type = type;
  if (category) query.category = category;
  if (location) query.location = location;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { color: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Item.countDocuments(query);

  const items = await Item.find(query)
    .populate('postedBy', 'name email department')
    .populate('college', 'name shortName')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('postedBy', 'name email department phone')
    .populate('college', 'name shortName logo')
    .populate({
      path: 'claims',
      populate: { path: 'claimant', select: 'name email' },
    });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // BUG-9 & BUG-F FIX: Only increment views for non-owners using atomic $inc
  const viewerId = req.user?._id?.toString();
  const ownerId = item.postedBy?._id?.toString() || item.postedBy?.toString();
  if (viewerId !== ownerId) {
    await Item.findByIdAndUpdate(item._id, { $inc: { views: 1 } });
    item.views += 1; // Update local object for response
  }

  res.status(200).json({
    success: true,
    data: { item },
  });
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  req.body.college = req.user.college;

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const imagePromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'items')
    );
    const images = await Promise.all(imagePromises);
    req.body.images = images;
  }

  const item = await Item.create(req.body);

  // Update college stats
  await College.findByIdAndUpdate(req.user.college, {
    $inc: { 'stats.totalItems': 1 },
  });

  // Find potential matches within same college
  const matches = await Item.findMatches(item);
  if (matches.length > 0) {
    for (const match of matches.slice(0, 5)) {
      // BUG-E FIX: Eliminate N+1 query. match is already an Item document. 
      // Just populate postedBy if missing additional fields instead of fetching the whole item again.
      await match.populate('postedBy');
      
      if (match.postedBy) {
        // Emit real-time notification
        try {
          const io = getIO();
          io.to(match.postedBy._id.toString()).emit('new_notification', {
            type: 'potential_match',
            message: `A potential match was just posted for your item!`,
            itemId: item._id,
            matchId: match._id,
          });
        } catch (err) {
          console.error('Socket emission failed:', err.message);
        }

        if (match.postedBy.email && 
            match.postedBy.notificationPreferences?.emailOnMatch !== false) {
          try {
            await sendEmail({
              to: match.postedBy.email,
              subject: 'Potential Match Found!',
              html: emailTemplates.itemMatch(match.postedBy.name, item, match),
            });
          } catch (emailError) {
            console.error('Failed to send match email:', emailError);
          }
        }
      }
    }
  }

  res.status(201).json({
    success: true,
    data: { item },
  });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Check ownership or admin
  const isOwner = item.postedBy.toString() === req.user.id;
  const isCollegeAdmin = req.user.role === 'collegeAdmin' && 
                         item.college.toString() === req.user.college.toString();
  const isSuperAdmin = req.user.role === 'superAdmin';

  if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
    throw new AppError('Not authorized to update this item', 403);
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const imagePromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'items')
    );
    const newImages = await Promise.all(imagePromises);
    req.body.images = [...(item.images || []), ...newImages];
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: { item },
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Check ownership or admin
  const isOwner = item.postedBy.toString() === req.user.id;
  const isCollegeAdmin = req.user.role === 'collegeAdmin' && 
                         item.college.toString() === req.user.college.toString();
  const isSuperAdmin = req.user.role === 'superAdmin';

  if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
    throw new AppError('Not authorized to delete this item', 403);
  }

  // Delete images from Cloudinary
  if (item.images && item.images.length > 0) {
    const deletePromises = item.images.map((img) =>
      deleteFromCloudinary(img.publicId)
    );
    await Promise.all(deletePromises);
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get user's items
// @route   GET /api/items/user/my-items
// @access  Private
exports.getMyItems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { postedBy: req.user.id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Item.countDocuments(query);

  const items = await Item.find(query)
    .populate({
      path: 'claims',
      populate: { path: 'claimant', select: 'name email' },
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Report item
// @route   POST /api/items/:id/report
// @access  Private
exports.reportItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  const { reason } = req.body;

  if (!reason) {
    throw new AppError('Please provide a reason for reporting', 400);
  }

  const alreadyReported = item.reports?.some(
    (report) => report.reportedBy.toString() === req.user.id
  );

  if (alreadyReported) {
    throw new AppError('You have already reported this item', 400);
  }

  item.reports = item.reports || [];
  item.reports.push({
    reportedBy: req.user.id,
    reason,
    createdAt: new Date(),
  });

  await item.save();

  res.status(200).json({
    success: true,
    message: 'Item reported successfully',
  });
});

// @desc    Get item statistics
// @route   GET /api/items/stats
// @access  Public/Private
exports.getStats = asyncHandler(async (req, res) => {
  let collegeId = req.user?.college || req.query.college;

  if (!collegeId) {
    throw new AppError('College is required', 400);
  }

  // Resolve slug to ObjectId if needed
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    const collegeDoc = await College.findOne({ slug: collegeId, isActive: true });
    if (!collegeDoc) {
      throw new AppError('College not found', 404);
    }
    collegeId = collegeDoc._id;
  } else {
    collegeId = new mongoose.Types.ObjectId(collegeId);
  }

  const stats = await Item.aggregate([
    { $match: { college: collegeId } },
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalLost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
              totalFound: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
              totalClaimed: { $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] } },
              totalReturned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
            },
          },
          {
            $addFields: {
              totalRedeemed: { $add: ['$totalClaimed', '$totalReturned'] },
            },
          },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byLocation: [
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        recentItems: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { title: 1, type: 1, category: 1, createdAt: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { stats: stats[0] },
  });
});

// @desc    Get item statistics
// @route   GET /api/items/stats
// @access  Public/Private
exports.getStatsAdmin = asyncHandler(async (req, res) => {
  const stats = await Item.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalLost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
              totalFound: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
              totalClaimed: { $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] } },
              totalReturned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
            },
          },
          {
            $addFields: {
              totalRedeemed: { $add: ['$totalClaimed', '$totalReturned'] },
            },
          },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byLocation: [
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        recentItems: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { title: 1, type: 1, category: 1, createdAt: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { stats: stats[0] },
  });
});