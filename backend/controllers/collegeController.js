const College = require('../models/College');
const User = require('../models/User');
const Item = require('../models/Item');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all colleges (public)
// @route   GET /api/colleges
// @access  Public
exports.getColleges = asyncHandler(async (req, res) => {
  const { search, city, state, page = 1, limit = 20 } = req.query;

  const query = { isActive: true, isVerified: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortName: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
    ];
  }

  if (city) query['address.city'] = { $regex: city, $options: 'i' };
  if (state) query['address.state'] = { $regex: state, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await College.countDocuments(query);

  const colleges = await College.find(query)
    .select('name shortName logo address.city address.state stats')
    .sort('name')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      colleges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get single college
// @route   GET /api/colleges/:slug
// @access  Public
exports.getCollege = asyncHandler(async (req, res) => {
  const college = await College.findOne({ 
    slug: req.params.slug,
    isActive: true 
  });

  if (!college) {
    throw new AppError('College not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { college },
  });
});

// @desc    Register new college
// @route   POST /api/colleges/register
// @access  Public
exports.registerCollege = asyncHandler(async (req, res) => {
  const { name, shortName, email, phone, website, adminName, adminEmail, adminPassword } = req.body;

  let address = req.body.address;
  if (!address) {
    if (req.body['address[city]'] || req.body['address[state]']) {
      address = {
        street: req.body['address[street]'],
        city: req.body['address[city]'],
        state: req.body['address[state]'],
        pincode: req.body['address[pincode]'],
      };
    }
  }

  // Check if college already exists
  const existingCollege = await College.findOne({
    $or: [{ name }, { shortName }, { email }],
  });

  if (existingCollege) {
    throw new AppError('College with this name, short name, or email already exists', 400);
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    throw new AppError('A user with this admin email already exists. Please use a different email for the admin account.', 400);
  }

  // Handle logo upload
  let logo = {};
  if (req.file) {
    logo = await uploadToCloudinary(req.file.buffer, 'colleges');
  }

  // Create college
  const college = await College.create({
    name,
    shortName: shortName.toUpperCase(),
    email,
    phone,
    address,
    website,
    logo,
    isVerified: true,
  });

  // Create college admin user
  const adminUser = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    college: college._id,
    role: 'collegeAdmin',
    isVerified: true,
  });

  college.createdBy = adminUser._id;
  await college.save();

  // Generate token for auto-login
  const token = adminUser.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'College registered successfully.',
    data: {
      college,
      user: adminUser.getPublicProfile(),
      token,
    },
  });
});

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private (College Admin)
exports.updateCollege = asyncHandler(async (req, res) => {
  let college = await College.findById(req.params.id);

  if (!college) {
    throw new AppError('College not found', 404);
  }

  // Check authorization
  if (req.user.role !== 'superAdmin' && 
      (req.user.role !== 'collegeAdmin' || req.user.college.toString() !== college._id.toString())) {
    throw new AppError('Not authorized to update this college', 403);
  }

  // Handle logo upload
  if (req.file) {
    // Delete old logo
    if (college.logo && college.logo.publicId) {
      await deleteFromCloudinary(college.logo.publicId);
    }
    req.body.logo = await uploadToCloudinary(req.file.buffer, 'colleges');
  }

  college = await College.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: { college },
  });
});

// @desc    Get college stats
// @route   GET /api/colleges/:id/stats
// @access  Private (College Admin)
exports.getCollegeStats = asyncHandler(async (req, res) => {
  const collegeId = req.params.id || req.user.college;

  const [userStats, itemStats] = await Promise.all([
    User.aggregate([
      { $match: { college: collegeId } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newUsersThisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(new Date().setDate(1))] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Item.aggregate([
      { $match: { college: collegeId } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lostItems: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
          foundItems: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
          returnedItems: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
          activeItems: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: userStats[0] || { totalUsers: 0, newUsersThisMonth: 0 },
      items: itemStats[0] || { totalItems: 0, lostItems: 0, foundItems: 0, returnedItems: 0, activeItems: 0 },
    },
  });
});

// @desc    Get all colleges (Super Admin)
// @route   GET /api/colleges/admin/all
// @access  Private (Super Admin)
exports.getAllCollegesAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status === 'pending') query.isVerified = false;
  if (status === 'verified') query.isVerified = true;
  if (status === 'inactive') query.isActive = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await College.countDocuments(query);

  const colleges = await College.find(query)
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      colleges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Verify college (Super Admin)
// @route   PUT /api/colleges/:id/verify
// @access  Private (Super Admin)
exports.verifyCollege = asyncHandler(async (req, res) => {
  const college = await College.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  );

  if (!college) {
    throw new AppError('College not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'College verified successfully',
    data: { college },
  });
});

// @desc    Toggle college status (Super Admin)
// @route   PUT /api/colleges/:id/toggle-status
// @access  Private (Super Admin)
exports.toggleCollegeStatus = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    throw new AppError('College not found', 404);
  }

  college.isActive = !college.isActive;
  await college.save();

  res.status(200).json({
    success: true,
    message: `College ${college.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { college },
  });
});

// @desc    Delete college (Super Admin)
// @route   DELETE /api/colleges/:id
// @access  Private (Super Admin)
exports.deleteCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    throw new AppError('College not found', 404);
  }

  // Delete college logo
  if (college.logo && college.logo.publicId) {
    await deleteFromCloudinary(college.logo.publicId);
  }

  await College.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'College deleted successfully',
  });
});