const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get(
  '/admin-only',
  protect,
  authorize('ADMIN'),
  (req, res) => {
    res.status(200).json({
      message: 'Admin-only route accessed successfully',
      user: req.user,
    });
  }
);

module.exports = router;