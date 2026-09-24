const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('../models/Transaction');

const BATCH_ID = 'BATCH-1790260278128';

const KEEP_TRANSACTION_IDS = [
  'TX-1790269033609',
  'TX-1790269154049',
];

const recalculateHash = (transaction, previousHash) => {
  const transactionData = [
    transaction.transactionId,
    transaction.batchId,
    transaction.from.toString(),
    transaction.to.toString(),
    transaction.quantity,
    previousHash || '',
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(transactionData)
    .digest('hex');
};

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    // Delete only the old duplicate transaction
    await Transaction.deleteOne({
      transactionId: 'TX-1790260324179',
      batchId: BATCH_ID,
    });

    // Get the two transactions we want to keep
    const transactions = await Transaction.find({
      batchId: BATCH_ID,
      transactionId: { $in: KEEP_TRANSACTION_IDS },
    }).sort({ transactionId: 1 });

    if (transactions.length !== 2) {
      throw new Error(
        `Expected 2 transactions, found ${transactions.length}`
      );
    }

    const firstTransaction = transactions.find(
      (tx) => tx.transactionId === 'TX-1790269033609'
    );

    const secondTransaction = transactions.find(
      (tx) => tx.transactionId === 'TX-1790269154049'
    );

    // First transaction starts the chain
    const firstHash = recalculateHash(firstTransaction, null);

    firstTransaction.previousHash = null;
    firstTransaction.currentHash = firstHash;

    await firstTransaction.save();

    // Second transaction points to the new first hash
    const secondHash = recalculateHash(
      secondTransaction,
      firstHash
    );

    secondTransaction.previousHash = firstHash;
    secondTransaction.currentHash = secondHash;

    await secondTransaction.save();

    console.log('\nCleanup completed successfully.');

    console.log('\nFirst transaction:');
    console.log(firstTransaction.transactionId);
    console.log('Previous Hash:', firstTransaction.previousHash);
    console.log('Current Hash:', firstTransaction.currentHash);

    console.log('\nSecond transaction:');
    console.log(secondTransaction.transactionId);
    console.log('Previous Hash:', secondTransaction.previousHash);
    console.log('Current Hash:', secondTransaction.currentHash);

    console.log('\nFinal transaction count: 2');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Cleanup failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

cleanup();