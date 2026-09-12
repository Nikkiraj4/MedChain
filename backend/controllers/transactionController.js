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

    // Generate SHA-256 hash
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

const verifyBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        message: 'Batch ID is required',
      });
    }

    // Find the batch
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({
        message: 'Batch not found',
      });
    }

    // Get all transactions in chronological order
    const transactions = await Transaction.find({
      batchId,
    }).sort({ timestamp: 1 });

    if (transactions.length === 0) {
      return res.status(400).json({
        message: 'No transaction history found for this batch',
      });
    }

    // Verify every transaction
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      // Check previous hash link
      const expectedPreviousHash =
        i === 0 ? null : transactions[i - 1].currentHash;

      if (transaction.previousHash !== expectedPreviousHash) {
        return res.status(200).json({
          verified: false,
          message: 'Integrity violation detected',
          reason: `Previous hash mismatch in transaction ${transaction.transactionId}`,
        });
      }

      // Recreate the exact data used when the hash was originally generated
      const transactionData = [
        transaction.transactionId,
        transaction.batchId,
        transaction.from.toString(),
        transaction.to.toString(),
        transaction.quantity,
        transaction.previousHash || '',
      ].join('|');

      // Recalculate SHA-256 hash
      const calculatedHash = crypto
        .createHash('sha256')
        .update(transactionData)
        .digest('hex');

      // Compare calculated hash with stored hash
      if (calculatedHash !== transaction.currentHash) {
        return res.status(200).json({
          verified: false,
          message: 'Integrity violation detected',
          reason: `Hash mismatch in transaction ${transaction.transactionId}`,
        });
      }
    }

    // All checks passed
    res.status(200).json({
      verified: true,
      message: 'Supply-chain history verified successfully',
      batchId,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error('Verify batch error:', error);

    res.status(500).json({
      message: 'Server error while verifying batch',
    });
  }
};

module.exports = {
  transferBatch,
  verifyBatch,
};