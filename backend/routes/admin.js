const express = require('express');
const router = express.Router();

const {
  getUsers,
  updateUserRole,
  getReportedItems,
  handleReportedItem,
  getDashboardStats,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('collegeAdmin', 'superAdmin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Content moderation
router.get('/reported-items', getReportedItems);
router.put('/items/:id/handle-report', handleReportedItem);

module.exports = router;
