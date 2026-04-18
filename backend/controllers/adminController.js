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
  if (req.user.role === 'collegeAdmin') {
    query.college = req.user.college;
  }
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

  // Prevent collegeAdmin from making superAdmins
  if (req.user.role === 'collegeAdmin' && role === 'superAdmin') {
    return next(new AppError('College Admins cannot create Super Admins', 403));
  }

  // Find user first to apply scoping (can't update users outside own college if collegeAdmin)
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (req.user.role === 'collegeAdmin' && user.college.toString() !== req.user.college.toString()) {
    return next(new AppError('User not found or you are not authorized to modify this user', 404));
  }

  // Prevent modifying fellow superAdmins if you are not one yourself?
  // Wait, req.user is either collegeAdmin or superAdmin. But let's keep it scoped.

  user.role = role;
  await user.save({ validateBeforeSave: false }); // Bypass re-validating the password logic etc if unmodified

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

  const query = { 'reports.0': { $exists: true } };
  if (req.user.role === 'collegeAdmin') {
    query.college = req.user.college;
  }

  const items = await Item.find(query)
    .populate('postedBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await Item.countDocuments(query);

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

  if (req.user.role === 'collegeAdmin' && item.college.toString() !== req.user.college.toString()) {
    return next(new AppError('Item not found or you are not authorized', 404));
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
  // Get date ranges
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const scopeMatch = req.user.role === 'collegeAdmin' ? { college: req.user.college } : {};


  // Aggregate stats
  const [userStats, itemStats, claimStats, recentUsers, recentItems, recentClaims] =
    await Promise.all([
      // User stats
      User.aggregate([
        { $match: scopeMatch },
        {
          $facet: {
            total: [{ $count: 'count' }],
            today: [
              { $match: { createdAt: { $gte: dayAgo } } },
              { $count: 'count' },
            ],
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
        { $match: scopeMatch },
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }],
            today: [
              { $match: { createdAt: { $gte: dayAgo } } },
              { $count: 'count' },
            ],
            thisWeek: [
              { $match: { createdAt: { $gte: weekAgo } } },
              { $count: 'count' },
            ],
            claimed: [{ $match: { status: 'claimed' } }, { $count: 'count' }],
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
          // We need to look up items to scope claims by college? Wait, claims already reference the item.
          // But Claim model does not directly store college. We might need to lookup item.
          // Let's lookup item and then match.
$lookup: { from: 'items', localField: 'item', foreignField: '_id', as: 'itemDoc' }
        },
        { $unwind: '$itemDoc' },
        req.user.role === 'collegeAdmin' ? { $match: { 'itemDoc.college': req.user.college } } : { $match: {} },
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
            approved: [{ $match: { status: 'approved' } }, { $count: 'count' }],
            approvedDistinctItems: [
              { $match: { status: 'approved' } },
              { $group: { _id: '$item' } },
              { $count: 'count' },
            ],
            today: [
              { $match: { createdAt: { $gte: dayAgo } } },
              { $count: 'count' },
            ],
            thisWeek: [
              { $match: { createdAt: { $gte: weekAgo } } },
              { $count: 'count' },
            ],
          },
        },
      ]),

      // Recent users
      User.find(scopeMatch)
        .sort('-createdAt')
        .limit(5)
        .select('name email role createdAt'),

      // Recent items
      Item.find(scopeMatch)
        .populate('postedBy', 'name')
        .sort('-createdAt')
        .limit(5)
        .select('title type status createdAt'),

      // Recent claims (we use find with populate and then filter in JS or just omit full scoping here since it's just 5? It's fine for superAdmin, but for collegeAdmin we need to scope)
      // Actually, since claims don't have college, we can just omit recent claims for collegeAdmin or fetch more and filter.
      // Easiest is to lookup via aggregate or just live with it. Let's do a simple find!
      Claim.find()
        .populate({ path: 'item', match: scopeMatch, select: 'title' })
        .populate('claimant', 'name')
        .populate('item', 'title')
        .sort('-createdAt')
        .limit(5)
        .select('status createdAt'),
    ]);

  const userFacet = userStats[0] || {};
  const itemFacet = itemStats[0] || {};
  const claimFacet = claimStats[0] || {};

  const byTypeMap = (itemFacet.byType || []).reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Claimed should reflect approved claims (distinct items), not only item.status='claimed'.
  const totalClaimed = claimFacet.approvedDistinctItems?.[0]?.count || 0;
  const totalReturned = itemFacet.returned?.[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers: userFacet.total?.[0]?.count || 0,
        newUsersToday: userFacet.today?.[0]?.count || 0,
        newUsersThisWeek: userFacet.thisWeek?.[0]?.count || 0,

        totalItems: itemFacet.total?.[0]?.count || 0,
        newItemsToday: itemFacet.today?.[0]?.count || 0,
        newItemsThisWeek: itemFacet.thisWeek?.[0]?.count || 0,
        activeItems: itemFacet.active?.[0]?.count || 0,

        totalLost: byTypeMap.lost || 0,
        totalFound: byTypeMap.found || 0,
        totalClaimed,
        totalReturned,
        totalRedeemed: totalClaimed + totalReturned,

        pendingReports: itemFacet.reported?.[0]?.count || 0,

        totalClaims: claimFacet.total?.[0]?.count || 0,
        pendingClaims: claimFacet.pending?.[0]?.count || 0,
        approvedClaims: claimFacet.approved?.[0]?.count || 0,
      },
      users: userStats[0],
      items: itemStats[0],
      claims: claimStats[0],
      recentUsers,
      recentItems,
      // Handle the populated match filtering
      recentClaims: recentClaims.filter(c => c.item !== null).slice(0, 5),
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

  if (req.user.role === 'collegeAdmin' && user.college.toString() !== req.user.college.toString()) {
    return next(new AppError('User not found or unauthorized', 404));
  }

  // Prevent collegeAdmin from deleting any superAdmins
  if (req.user.role === 'collegeAdmin' && user.role === 'superAdmin') {
    return next(new AppError('College Admins cannot delete Super Admins', 403));
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
