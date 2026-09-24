const express = require('express');

const {
  createBatch,
  getBatch,
  getMyBatches,
} = require('../controllers/batchController');

const {
  transferBatch,
  verifyBatch,
} = require('../controllers/transactionController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Create a new batch - Manufacturer only
router.post(
  '/',
  protect,
  authorize('MANUFACTURER'),
  createBatch
);

// Get batches currently held by logged-in user
router.get(
  '/my-batches',
  protect,
  authorize('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY'),
  getMyBatches
);

// Get batch details - authenticated users
router.get(
  '/:batchId',
  protect,
  authorize('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY'),
  getBatch
);

// Transfer batch - Manufacturer or Distributor
router.post(
  '/transfer',
  protect,
  authorize('MANUFACTURER', 'DISTRIBUTOR'),
  transferBatch
);

// Verify batch integrity - Pharmacy only
router.get(
  '/:batchId/verify',
  protect,
  authorize('PHARMACY'),
  verifyBatch
);

module.exports = router;