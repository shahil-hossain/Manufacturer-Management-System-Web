const express = require('express');
const router = express.Router();
const QualityInspection = require('../models/QualityInspection');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, async (req, res) => {
  try {
    const inspection = new QualityInspection(req.body);
    await inspection.save();
    res.status(201).json(inspection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const inspections = await QualityInspection.find().sort({ createdAt: -1 });
  res.json(inspections);
});

router.put('/:id', verifyToken, async (req, res) => {
  const updated = await QualityInspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', verifyToken, async (req, res) => {
  await QualityInspection.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;