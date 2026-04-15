const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'collegeAdmin', 'superAdmin'].includes(role)) {
    return next(new AppError('Invalid role. Must be user, collegeAdmin, or superAdmin', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: { user },
  });
});

// @desc    Get reported items
// @route   GET /api/admin/reported-items
// @access  Private/Admin
const getReportedItems = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const items = await Item.find({ 'reports.0': { $exists: true } })
    .populate('postedBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await Item.countDocuments({ 'reports.0': { $exists: true } });

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// @desc    Handle reported item
// @route   PUT /api/admin/items/:id/handle-report
// @access  Private/Admin
const handleReportedItem = asyncHandler(async (req, res, next) => {
  const { action } = req.body; // 'dismiss' or 'remove'

  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  if (action === 'dismiss') {
    item.isReported = false;
    item.reportReason = null;
    await item.save();
  } else if (action === 'remove') {
    item.status = 'removed';
    item.isReported = false;
    await item.save();
  } else {
    return next(new AppError('Invalid action', 400));
  }

  res.status(200).json({
    success: true,
    message: `Report ${action === 'dismiss' ? 'dismissed' : 'item removed'} successfully`,
  });
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get date range for this week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Aggregate stats
  const [userStats, itemStats, claimStats, recentItems, recentClaims] =
    await Promise.all([
      // User stats
      User.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            thisWeek: [
              { $match: { createdAt: { $gte: weekAgo } } },
              { $count: 'count' },
            ],
            byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          },
        },
      ]),

      // Item stats
      Item.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }],
            thisWeek: [
              { $match: { createdAt: { $gte: weekAgo } } },
              { $count: 'count' },
            ],
            returned: [{ $match: { status: 'returned' } }, { $count: 'count' }],
            reported: [{ $match: { isReported: true } }, { $count: 'count' }],
            byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            dailyTrend: [
              { $match: { createdAt: { $gte: monthAgo } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),

      // Claim stats
      Claim.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
            approved: [{ $match: { status: 'approved' } }, { $count: 'count' }],
            thisWeek: [
              { $match: { createdAt: { $gte: weekAgo } } },
              { $count: 'count' },
            ],
          },
        },
      ]),

      // Recent items
      Item.find()
        .populate('postedBy', 'name')
        .sort('-createdAt')
        .limit(5)
        .select('title type status createdAt'),

      // Recent claims
      Claim.find()
        .populate('claimant', 'name')
        .populate('item', 'title')
        .sort('-createdAt')
        .limit(5)
        .select('status createdAt'),
    ]);

  res.status(200).json({
    success: true,
    data: {
      users: userStats[0],
      items: itemStats[0],
      claims: claimStats[0],
      recentItems,
      recentClaims,
    },
  });
});

// @desc    Delete user and their data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Don't allow deleting self
  if (user._id.toString() === req.user.id) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  // Delete user's items
  await Item.deleteMany({ postedBy: user._id });

  // Delete user's claims
  await Claim.deleteMany({ claimant: user._id });

  // Delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User and associated data deleted successfully',
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  getReportedItems,
  handleReportedItem,
  getDashboardStats,
  deleteUser,
};
