const QRCode = require('qrcode');
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

    // Generate QR code containing the Batch ID
    const qrData = await QRCode.toDataURL(batchId);

    batch.qrData = qrData;
    await batch.save();

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

const getBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findOne({ batchId })
      .populate('manufacturer', 'name email role')
      .populate('currentHolder', 'name email role');

    if (!batch) {
      return res.status(404).json({
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      message: 'Batch retrieved successfully',
      batch,
    });
  } catch (error) {
    console.error('Get batch error:', error);

    res.status(500).json({
      message: 'Server error while retrieving batch',
    });
  }
};

const getMyBatches = async (req, res) => {
  try {
    const batches = await Batch.find({
      currentHolder: req.user.userId,
    })
      .populate('manufacturer', 'name email role')
      .populate('currentHolder', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      batches,
    });
  } catch (error) {
    console.error('Get my batches error:', error);

    res.status(500).json({
      message: 'Server error while retrieving batches',
    });
  }
};

module.exports = {
  createBatch,
  getBatch,
  getMyBatches,
};