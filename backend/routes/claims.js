const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus,
  cancelClaim,
  getClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Validation middleware
const createClaimValidation = [
  body('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('contactNumber')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
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

// All routes require authentication
router.use(protect);

// Routes
router.post(
  '/',
  upload.array('proofImages', 3),
  createClaimValidation,
  validate,
  createClaim
);
router.get('/my-claims', getMyClaims);
router.get('/item/:itemId', getItemClaims);
router.get('/:id', getClaim);
router.put('/:id/status', updateStatusValidation, validate, updateClaimStatus);
router.put('/:id/cancel', cancelClaim);

module.exports = router;
