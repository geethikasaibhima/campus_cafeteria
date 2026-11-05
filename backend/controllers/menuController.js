const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (available !== undefined) {
      filter.available = available === 'true';
    }

    const items = await Menu.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new menu item
// @route   POST /api/menu
// @access  Private/Admin/Kitchen
const createMenuItem = async (req, res, next) => {
  try {
    const { name, price, category, preparationTime, description, available } = req.body;

    if (!name || price === undefined || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, category, and description',
      });
    }

    const newItem = await Menu.create({
      name,
      price: Number(price),
      category,
      preparationTime: preparationTime || '3-5m',
      description,
      available: available !== undefined ? Boolean(available) : true,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('menu:created', newItem);
    }

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin/Kitchen
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const { name, price, category, preparationTime, description, available } = req.body;
    if (name) item.name = name;
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category;
    if (preparationTime) item.preparationTime = preparationTime;
    if (description) item.description = description;
    if (available !== undefined) item.available = Boolean(available);

    const updatedItem = await item.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu:updated', updatedItem);
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await item.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu:deleted', req.params.id);
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update availability of menu item
// @route   PATCH /api/menu/:id/availability
// @access  Private/Admin/Kitchen
const updateAvailability = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const { available } = req.body;
    if (available === undefined) {
      item.available = !item.available; // Toggle if not specified
    } else {
      item.available = Boolean(available);
    }

    const updatedItem = await item.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu:updated', updatedItem);
    }

    res.status(200).json({
      success: true,
      message: `Menu item availability updated to ${updatedItem.available}`,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
};
