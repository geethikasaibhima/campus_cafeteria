const mongoose = require('mongoose');

const tokenCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: 'orderToken',
    },
    seq: {
      type: Number,
      default: 100,
    },
  },
  {
    versionKey: false,
  }
);

/**
 * Atomically increments and returns the next sequential token number.
 * Guarantees uniqueness even under concurrent requests.
 */
tokenCounterSchema.statics.getNextToken = async function (counterName = 'orderToken') {
  const counter = await this.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return counter.seq;
};

const TokenCounter = mongoose.model('TokenCounter', tokenCounterSchema);

module.exports = TokenCounter;
