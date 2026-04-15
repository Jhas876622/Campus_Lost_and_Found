const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  reportItem,
  getStats,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Validation middleware
const createItemValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['lost', 'found'])
    .withMessage('Type must be either lost or found'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
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
    ])
    .withMessage('Invalid category'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isIn([
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
    ])
    .withMessage('Invalid location'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
];

// Validation error handler
const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// Public routes (optionalAuth populates req.user if token present)
router.get('/stats', optionalAuth, getStats);
router.get('/', optionalAuth, getItems);
router.get('/user/my-items', protect, getMyItems);
router.get('/:id', optionalAuth, getItem);

// Protected routes
router.use(protect);

router.post(
  '/',
  upload.array('images', 5),
  createItemValidation,
  validate,
  createItem
);
router.put('/:id', upload.array('images', 5), updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/report', reportItem);

module.exports = router;
