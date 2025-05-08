const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const items = await InventoryItem.find({ userId: req.user.id });
  res.json(items);
});

router.post('/', auth, async (req, res) => {
  const { name, quantity, type } = req.body;
  const newItem = new InventoryItem({ name, quantity, type, userId: req.user.id });
  await newItem.save();
  res.status(201).json(newItem);
});

router.put('/:id', auth, async (req, res) => {
  const { name, quantity, type } = req.body;
  const item = await InventoryItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { name, quantity, type },
    { new: true }
  );
  res.json(item);
});

router.delete('/:id', auth, async (req, res) => {
  await InventoryItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Item deleted' });
});

module.exports = router;