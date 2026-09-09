const crypto = require('crypto');
const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const transferBatch = async (req, res) => {
  try {
    const { batchId, toUserId, quantity } = req.body;

    if (!batchId || !toUserId || !quantity) {
      return res.status(400).json({
        message: 'Batch ID, receiver and quantity are required',
      });
    }

    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({
        message: 'Batch not found',
      });
    }

    // Only the current holder can transfer the batch
    if (batch.currentHolder.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Only the current holder can transfer this batch',
      });
    }

    // Quantity cannot exceed available quantity
    if (quantity > batch.quantity) {
      return res.status(400).json({
        message: 'Transfer quantity exceeds available quantity',
      });
    }

    const receiver = await User.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({
        message: 'Receiver not found',
      });
    }

    // Generate transaction ID
    const transactionId = `TX-${Date.now()}`;

    // Find the previous transaction for this batch
    const previousTransaction = await Transaction.findOne({
      batchId,
    }).sort({ timestamp: -1 });

    const previousHash = previousTransaction
      ? previousTransaction.currentHash
      : null;

    // Data used to generate the transaction hash
    const transactionData = [
      transactionId,
      batchId,
      req.user.userId,
      toUserId,
      quantity,
      previousHash || '',
    ].join('|');

    const currentHash = crypto
      .createHash('sha256')
      .update(transactionData)
      .digest('hex');

    // Record the transaction
    await Transaction.create({
      transactionId,
      batchId,
      from: req.user.userId,
      to: toUserId,
      quantity,
      previousHash,
      currentHash,
    });

    // Update current holder
    batch.currentHolder = toUserId;

    await batch.save();

    res.status(200).json({
      message: 'Batch transferred successfully',
      transaction: {
        transactionId,
        batchId,
        from: req.user.userId,
        to: toUserId,
        quantity,
        previousHash,
        currentHash,
      },
    });
  } catch (error) {
    console.error('Transfer batch error:', error);

    res.status(500).json({
      message: 'Server error while transferring batch',
    });
  }
};

module.exports = {
  transferBatch,
};