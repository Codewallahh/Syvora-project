// controllers/itemController.js
const Item = require('../models/item');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getItems = asyncHandler(async (req, res, next) => {
  const items = await Item.find().populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('user', 'name email');

  if (!item) {
    return next(new ErrorHandler(`Item not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    item
  });
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  console.log("Creating item for user:", req.user.id);
  req.body.user = req.user.id;

  const item = await Item.create(req.body);

  res.status(201).json({
    success: true,
    item
  });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorHandler(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner or admin
  if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to update this item', 403));
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    item
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorHandler(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner or admin
  if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to delete this item', 403));
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Item deleted successfully'
  });
});