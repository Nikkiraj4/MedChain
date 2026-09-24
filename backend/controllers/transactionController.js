const crypto = require('crypto');

const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const transferBatch = async (req, res) => {
  try {
    const { batchId, toUserId, quantity } = req.body;

    // Basic validation
    if (!batchId || !toUserId || quantity === undefined) {
      return res.status(400).json({
        message: 'Batch ID, receiver and quantity are required',
      });
    }

    const transferQuantity = Number(quantity);

    // Quantity must be a positive whole number
    if (
      !Number.isInteger(transferQuantity) ||
      transferQuantity <= 0
    ) {
      return res.status(400).json({
        message: 'Quantity must be a positive whole number',
      });
    }

    // Find batch
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({
        message: 'Batch not found',
      });
    }

    // Only current holder can transfer
    if (batch.currentHolder.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Only the current holder can transfer this batch',
      });
    }

    // For this MVP, the complete batch must be transferred
    if (transferQuantity !== batch.quantity) {
      return res.status(400).json({
        message:
          `For this MVP, the complete batch quantity (${batch.quantity}) must be transferred`,
      });
    }

    // Find receiver
    const receiver = await User.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({
        message: 'Receiver not found',
      });
    }

    // Manufacturer can transfer only to Distributor
    if (
      req.user.role === 'MANUFACTURER' &&
      receiver.role !== 'DISTRIBUTOR'
    ) {
      return res.status(400).json({
        message: 'Manufacturer can only transfer batches to a distributor',
      });
    }

    // Distributor can transfer only to Pharmacy
    if (
      req.user.role === 'DISTRIBUTOR' &&
      receiver.role !== 'PHARMACY'
    ) {
      return res.status(400).json({
        message: 'Distributor can only transfer batches to a pharmacy',
      });
    }

    // Generate transaction ID
    const transactionId = `TX-${Date.now()}`;

    // Find latest transaction for this batch
    const previousTransaction = await Transaction.findOne({
      batchId,
    }).sort({ createdAt: -1 });

    const previousHash = previousTransaction
      ? previousTransaction.currentHash
      : null;

    // Data used to generate SHA-256 hash
    const transactionData = [
      transactionId,
      batchId,
      req.user.userId,
      toUserId,
      transferQuantity,
      previousHash || '',
    ].join('|');

    const currentHash = crypto
      .createHash('sha256')
      .update(transactionData)
      .digest('hex');

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId,
      batchId,
      from: req.user.userId,
      to: toUserId,
      quantity: transferQuantity,
      previousHash,
      currentHash,
    });

    // Transfer ownership of the batch
    batch.currentHolder = toUserId;

    await batch.save();

    res.status(200).json({
      message: 'Batch transferred successfully',
      transaction: {
        transactionId: transaction.transactionId,
        batchId: transaction.batchId,
        from: req.user.userId,
        to: toUserId,
        quantity: transaction.quantity,
        previousHash: transaction.previousHash,
        currentHash: transaction.currentHash,
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

    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({
        message: 'Batch not found',
      });
    }

    const transactions = await Transaction.find({
      batchId,
    }).sort({ createdAt: 1 });

    if (transactions.length === 0) {
      return res.status(400).json({
        message: 'No transaction history found for this batch',
      });
    }

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      // First transaction must have no previous hash
      const expectedPreviousHash =
        i === 0 ? null : transactions[i - 1].currentHash;

      if (transaction.previousHash !== expectedPreviousHash) {
        return res.status(200).json({
          verified: false,
          message: 'Integrity violation detected',
          reason: `Previous hash mismatch in transaction ${transaction.transactionId}`,
        });
      }

      // Recreate transaction data
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