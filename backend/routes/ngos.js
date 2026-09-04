const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');

router.get('/', async (req, res) => {
  try {
    const ngos = await NGO.find({ status: { $ne: 'Inactive' } }).sort({ distance: 1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ngo = new NGO(req.body);
    await ngo.save();
    res.status(201).json(ngo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
