const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrderByToken,
  updateOrderStatus,
  deleteOrder,
  resetDemoOrders,
} = require('../controllers/orderController');
const {
  getOrderedOrders,
  getCookingOrders,
  getReadyOrders,
  getDeliveredOrders,
} = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Reset demo orders route
router.post('/reset-demo', resetDemoOrders);

// Specific status routes must come BEFORE /:id
router.get('/status/ordered', getOrderedOrders);
router.get('/status/cooking', getCookingOrders);
router.get('/status/ready', getReadyOrders);
router.get('/status/delivered', getDeliveredOrders);

// Token lookup route must come BEFORE /:id
router.get('/token/:token', getOrderByToken);

// Base order routes
router.route('/')
  .post(placeOrder)
  .get(getAllOrders);

// Order by ID routes
router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;
