const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// GET all food entries
router.get('/', async (req, res) => {
  try {
    const { status, mess } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (mess) filter.mess = mess;
    const foods = await Food.find(filter).populate('ngo').sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new food entry
router.post('/', async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a food entry
router.delete('/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
