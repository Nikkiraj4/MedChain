const express = require('express');
const { createUser } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/users',
  protect,
  authorize('ADMIN'),
  createUser
);

module.exports = router;