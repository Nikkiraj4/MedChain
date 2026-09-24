const express = require('express');

const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getBatches,
  getTransactions,
} = require('../controllers/adminController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// User management
router.get(
  '/users',
  protect,
  authorize('ADMIN'),
  getUsers
);

router.post(
  '/users',
  protect,
  authorize('ADMIN'),
  createUser
);

router.put(
  '/users/:id',
  protect,
  authorize('ADMIN'),
  updateUser
);

router.delete(
  '/users/:id',
  protect,
  authorize('ADMIN'),
  deleteUser
);

// Batch monitoring
router.get(
  '/batches',
  protect,
  authorize('ADMIN'),
  getBatches
);

// Transaction monitoring
router.get(
  '/transactions',
  protect,
  authorize('ADMIN'),
  getTransactions
);

module.exports = router;