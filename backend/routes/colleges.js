const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getColleges,
  getCollege,
  registerCollege,
  updateCollege,
  getCollegeStats,
  getAllCollegesAdmin,
  verifyCollege,
  toggleCollegeStatus,
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('College name is required'),
  body('shortName').trim().notEmpty().withMessage('Short name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('adminName').trim().notEmpty().withMessage('Admin name is required'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required'),
  body('adminPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Public routes
router.get('/', getColleges);
router.get('/:slug', getCollege);
router.post('/register', upload.single('logo'), registerValidation, registerCollege);

// Protected routes
router.put('/:id', protect, authorize('collegeAdmin', 'superAdmin'), upload.single('logo'), updateCollege);
router.get('/:id/stats', protect, authorize('collegeAdmin', 'superAdmin'), getCollegeStats);

// Super Admin routes
router.get('/admin/all', protect, authorize('superAdmin'), getAllCollegesAdmin);
router.put('/:id/verify', protect, authorize('superAdmin'), verifyCollege);
router.put('/:id/toggle-status', protect, authorize('superAdmin'), toggleCollegeStatus);

module.exports = router;
