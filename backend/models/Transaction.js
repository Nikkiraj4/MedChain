const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    batchId: {
      type: String,
      required: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    previousHash: {
      type: String,
      default: null,
    },

    currentHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);