const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
} = require('../controllers/menuController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMenuItems)
  .post(optionalAuth, createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(optionalAuth, updateMenuItem)
  .delete(optionalAuth, deleteMenuItem);

router.patch('/:id/availability', optionalAuth, updateAvailability);

module.exports = router;
