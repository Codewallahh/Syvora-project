// routes/itemRoutes.js
const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controller/itemController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(protect , createItem);

router.route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;