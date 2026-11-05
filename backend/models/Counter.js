const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    counterName: {
      type: String,
      required: [true, 'Counter name is required'],
      unique: true,
      trim: true,
    },
    supportedCategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
