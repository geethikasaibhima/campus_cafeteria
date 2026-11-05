const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for backward-compatible frontend access (qty alias for quantity)
orderItemSchema.virtual('qty').get(function () {
  return this.quantity;
});
orderItemSchema.virtual('id').get(function () {
  return this.menuItemId ? this.menuItemId.toString() : undefined;
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['dine-in', 'dine-out'],
      default: 'dine-in',
      required: true,
    },
    tableNumber: {
      type: String,
      default: 'Table 1',
      trim: true,
    },
    counter: {
      type: String,
      default: 'Counter A (Hot Grills)',
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    specialNotes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['ordered', 'cooking', 'ready', 'delivered'],
      default: 'ordered',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderId || ret._id.toString();
        ret.token = ret.tokenNumber;
        ret.type = ret.orderType;
        ret.total = ret.totalAmount;
        if (doc.createdAt) {
          ret.time = new Date(doc.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        // Normalize items for frontend
        if (Array.isArray(ret.items)) {
          ret.items = ret.items.map((item) => ({
            ...item,
            id: item.menuItemId ? item.menuItemId.toString() : item.id,
            qty: item.quantity,
          }));
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderId || ret._id.toString();
        ret.token = ret.tokenNumber;
        ret.type = ret.orderType;
        ret.total = ret.totalAmount;
        if (doc.createdAt) {
          ret.time = new Date(doc.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return ret;
      },
    },
  }
);

// Helpful virtuals
orderSchema.virtual('token').get(function () {
  return this.tokenNumber;
});
orderSchema.virtual('type').get(function () {
  return this.orderType;
});
orderSchema.virtual('total').get(function () {
  return this.totalAmount;
});
orderSchema.virtual('time').get(function () {
  return this.createdAt
    ? new Date(this.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
