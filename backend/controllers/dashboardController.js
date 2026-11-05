const Order = require('../models/Order');

// @desc    Get dashboard statistics (counts for all statuses)
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, ordered, cooking, ready, delivered, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'ordered' }),
      Order.countDocuments({ status: 'cooking' }),
      Order.countDocuments({ status: 'ready' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordered,
        cooking,
        ready,
        delivered,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status 'ordered'
// @route   GET /api/orders/status/ordered
// @access  Public
const getOrderedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'ordered' }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status 'cooking'
// @route   GET /api/orders/status/cooking
// @access  Public
const getCookingOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'cooking' }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status 'ready'
// @route   GET /api/orders/status/ready
// @access  Public
const getReadyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'ready' }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status 'delivered'
// @route   GET /api/orders/status/delivered
// @access  Public
const getDeliveredOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'delivered' }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getOrderedOrders,
  getCookingOrders,
  getReadyOrders,
  getDeliveredOrders,
};
