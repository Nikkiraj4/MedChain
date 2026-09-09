const express = require('express');
const { createBatch } = require('../controllers/batchController');
const { transferBatch } = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('MANUFACTURER'),
  createBatch
);

router.post(
  '/transfer',
  protect,
  authorize('MANUFACTURER', 'DISTRIBUTOR'),
  transferBatch
);

module.exports = router;