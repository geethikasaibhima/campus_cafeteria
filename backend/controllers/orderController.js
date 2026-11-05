const mongoose = require('mongoose');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const TokenCounter = require('../models/TokenCounter');

// Helper to determine counter if not specified
const determineCounter = (items) => {
  const isSouthIndian = items.some((i) =>
    (i.category || '').toLowerCase().includes('south indian') ||
    (i.name || '').toLowerCase().includes('dosa') ||
    (i.name || '').toLowerCase().includes('idli')
  );
  if (isSouthIndian) return 'Counter C (South Indian)';

  const isBeverage = items.some((i) =>
    (i.category || '').toLowerCase().includes('beverage') ||
    (i.name || '').toLowerCase().includes('brew') ||
    (i.name || '').toLowerCase().includes('cooler') ||
    (i.name || '').toLowerCase().includes('coffee')
  );
  if (isBeverage) return 'Counter B (Beverages & Bakery)';

  return 'Counter A (Hot Grills)';
};

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public
const placeOrder = async (req, res, next) => {
  try {
    const { studentName, orderType, type, tableNumber, counter, items, specialNotes } = req.body;

    // Validate student name
    const finalStudentName = (studentName || '').trim() || 'Student Guest';

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one menu item. Cart cannot be empty.',
      });
    }

    // Verify items against Menu database and calculate total securely on backend
    const sanitizedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));

      let dbMenuItem = null;
      if (item.menuItemId && mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        dbMenuItem = await Menu.findById(item.menuItemId);
      } else if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
        dbMenuItem = await Menu.findById(item.id);
      } else if (item.name) {
        dbMenuItem = await Menu.findOne({ name: new RegExp(`^${item.name.trim()}$`, 'i') });
      }

      const itemPrice = dbMenuItem ? dbMenuItem.price : Number(item.price);
      if (isNaN(itemPrice) || itemPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for item: ${item.name || 'Unknown item'}`,
        });
      }

      const itemName = dbMenuItem ? dbMenuItem.name : item.name;
      const category = dbMenuItem ? dbMenuItem.category : item.category;

      sanitizedItems.push({
        menuItemId: dbMenuItem ? dbMenuItem._id : undefined,
        name: itemName,
        price: itemPrice,
        quantity,
        category,
      });

      calculatedTotal += itemPrice * quantity;
    }

    // Determine order type
    const resolvedOrderType = (orderType || type || 'dine-in').toLowerCase();
    const finalOrderType = resolvedOrderType === 'dine-out' ? 'dine-out' : 'dine-in';

    const finalTableNumber =
      finalOrderType === 'dine-in'
        ? (tableNumber || 'Table 1').trim()
        : 'Takeaway Pack';

    const finalCounter = counter || determineCounter(sanitizedItems);

    // Atomically generate unique sequential token number
    const nextTokenNumber = await TokenCounter.getNextToken('orderToken');
    const orderId = `ord-${Date.now()}-${nextTokenNumber}`;

    const newOrder = await Order.create({
      orderId,
      tokenNumber: nextTokenNumber,
      studentName: finalStudentName,
      orderType: finalOrderType,
      tableNumber: finalTableNumber,
      counter: finalCounter,
      items: sanitizedItems.map(({ menuItemId, name, price, quantity }) => ({
        menuItemId,
        name,
        price,
        quantity,
      })),
      totalAmount: calculatedTotal,
      specialNotes: (specialNotes || '').trim(),
      status: 'ordered',
    });

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('order:created', newOrder.toJSON());
      io.emit('dashboard:updated');
    }

    res.status(201).json({
      success: true,
      message: `Order #${nextTokenNumber} placed successfully`,
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (with optional status filter)
// @route   GET /api/orders
// @access  Public
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    let query = Order.find(filter).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const orders = await query.exec();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderId
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let order;

    if (mongoose.Types.ObjectId.isValid(idParam)) {
      order = await Order.findById(idParam);
    }
    if (!order) {
      order = await Order.findOne({ orderId: idParam });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order using token number
// @route   GET /api/orders/token/:token
// @access  Public
const getOrderByToken = async (req, res, next) => {
  try {
    const token = parseInt(req.params.token, 10);
    if (isNaN(token)) {
      return res.status(400).json({ success: false, message: 'Token must be a valid integer' });
    }

    const order = await Order.findOne({ tokenNumber: token });
    if (!order) {
      return res.status(404).json({ success: false, message: `No order found with token #${token}` });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public (or role-protected)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ordered', 'cooking', 'ready', 'delivered'];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const targetStatus = status.toLowerCase();
    const idParam = req.params.id;

    let order;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      order = await Order.findById(idParam);
    }
    if (!order) {
      order = await Order.findOne({ orderId: idParam });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = targetStatus;
    const updatedOrder = await order.save();

    const io = req.app.get('io');
    if (io) {
      const orderPayload = updatedOrder.toJSON();
      io.emit('order:updated', orderPayload);
      io.emit('order:statusChanged', {
        orderId: updatedOrder.orderId,
        id: updatedOrder._id,
        token: updatedOrder.tokenNumber,
        status: targetStatus,
        previousStatus,
      });

      // Special notification when order becomes ready
      if (targetStatus === 'ready' && previousStatus !== 'ready') {
        const recipient =
          updatedOrder.orderType === 'dine-in'
            ? updatedOrder.tableNumber
            : 'Dine-Out Pickup';
        io.emit('order:ready', {
          token: updatedOrder.tokenNumber,
          studentName: updatedOrder.studentName,
          recipient,
          tableNumber: updatedOrder.tableNumber,
          type: updatedOrder.orderType,
        });
      }

      io.emit('dashboard:updated');
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to '${targetStatus}'`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Public (or role-protected)
const deleteOrder = async (req, res, next) => {
  try {
    const idParam = req.params.id;

    let order;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      order = await Order.findById(idParam);
    }
    if (!order) {
      order = await Order.findOne({ orderId: idParam });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const removedId = order.orderId;
    const removedMongoId = order._id.toString();
    await order.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('order:deleted', { orderId: removedId, id: removedMongoId });
      io.emit('dashboard:updated');
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: { orderId: removedId, id: removedMongoId },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset orders to initial demo state
// @route   POST /api/orders/reset-demo
// @access  Public
const resetDemoOrders = async (req, res, next) => {
  try {
    const INITIAL_ORDERS_SEED = [
      {
        orderId: 'ord-101',
        tokenNumber: 101,
        studentName: 'Aarav Patel',
        orderType: 'dine-in',
        tableNumber: 'Table 4',
        counter: 'Counter A (Hot Grills)',
        status: 'ready',
        items: [
          { name: 'Paneer Tikka Kathi Roll', quantity: 1, price: 90 },
          { name: 'Iced Hazelnut Cold Brew', quantity: 1, price: 75 },
        ],
        totalAmount: 165,
        specialNotes: 'Extra spicy roll please',
      },
      {
        orderId: 'ord-102',
        tokenNumber: 102,
        studentName: 'Ananya Sharma',
        orderType: 'dine-out',
        tableNumber: 'Takeaway Pack',
        counter: 'Counter B (Beverages & Bakery)',
        status: 'ready',
        items: [
          { name: 'Iced Hazelnut Cold Brew', quantity: 2, price: 75 },
        ],
        totalAmount: 150,
        specialNotes: 'Less ice',
      },
      {
        orderId: 'ord-103',
        tokenNumber: 103,
        studentName: 'Rohan Mehta',
        orderType: 'dine-in',
        tableNumber: 'Table 9',
        counter: 'Counter A (Hot Grills)',
        status: 'cooking',
        items: [
          { name: 'Hakka Chilli Garlic Noodles', quantity: 1, price: 110 },
        ],
        totalAmount: 110,
        specialNotes: 'No onions',
      },
      {
        orderId: 'ord-104',
        tokenNumber: 104,
        studentName: 'Priya Iyer',
        orderType: 'dine-in',
        tableNumber: 'Table 2',
        counter: 'Counter C (South Indian)',
        status: 'cooking',
        items: [
          { name: 'Mysore Masala Dosa', quantity: 2, price: 95 },
        ],
        totalAmount: 190,
        specialNotes: 'Crispy ghee roast',
      },
      {
        orderId: 'ord-105',
        tokenNumber: 105,
        studentName: 'Kabir Verma',
        orderType: 'dine-out',
        tableNumber: 'Takeaway Pack',
        counter: 'Counter B (Beverages & Bakery)',
        status: 'ordered',
        items: [
          { name: 'Crispy Veg Masala Burger', quantity: 1, price: 80 },
          { name: 'Golden Salted French Fries', quantity: 1, price: 60 },
        ],
        totalAmount: 140,
        specialNotes: '',
      },
      {
        orderId: 'ord-106',
        tokenNumber: 106,
        studentName: 'Tanvi Nair',
        orderType: 'dine-in',
        tableNumber: 'Table 12',
        counter: 'Counter C (South Indian)',
        status: 'ordered',
        items: [
          { name: 'Steamed Idli Sambar Platter', quantity: 1, price: 65 },
        ],
        totalAmount: 65,
        specialNotes: 'Warm sambar in separate bowl',
      },
    ];

    await Order.deleteMany({});
    const inserted = await Order.insertMany(INITIAL_ORDERS_SEED);
    await TokenCounter.findOneAndUpdate(
      { _id: 'orderToken' },
      { seq: 106 },
      { upsert: true, new: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('orders:reset', inserted.map(o => o.toJSON()));
      io.emit('dashboard:updated');
    }

    res.status(200).json({
      success: true,
      message: 'Demo orders reset successfully in MongoDB',
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrderByToken,
  updateOrderStatus,
  deleteOrder,
  resetDemoOrders,
};

