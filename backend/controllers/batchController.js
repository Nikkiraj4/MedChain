const Batch = require('../models/Batch');

const createBatch = async (req, res) => {
  try {
    const {
      medicineName,
      quantity,
      manufacturingDate,
      expiryDate,
    } = req.body;

    if (
      !medicineName ||
      !quantity ||
      !manufacturingDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        message:
          'Medicine name, quantity, manufacturing date and expiry date are required',
      });
    }

    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      return res.status(400).json({
        message: 'Expiry date must be after manufacturing date',
      });
    }

    const batchId = `BATCH-${Date.now()}`;

    const batch = await Batch.create({
      medicineName,
      batchId,
      quantity,
      manufacturingDate,
      expiryDate,
      manufacturer: req.user.userId,
      currentHolder: req.user.userId,
    });

    res.status(201).json({
      message: 'Batch created successfully',
      batch,
    });
  } catch (error) {
    console.error('Create batch error:', error);

    res.status(500).json({
      message: 'Server error while creating batch',
    });
  }
};

module.exports = {
  createBatch,
};