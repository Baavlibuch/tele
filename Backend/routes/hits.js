const express = require('express');
const router = express.Router();
const HitCounter = require('../models/hitCounter');

// Get hit count
router.get('/', async (req, res) => {
  try {
    let counter = await HitCounter.findOne();
    if (!counter) {
      counter = new HitCounter();
      await counter.save();
    }
    res.json({ hits: counter.count });
  } catch (err) {
    console.error('Error getting hit count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Increment hit count
router.post('/', async (req, res) => {
  try {
    let counter = await HitCounter.findOne();
    if (!counter) {
      counter = new HitCounter();
    }
    counter.count += 1;
    await counter.save();
    res.json({ hits: counter.count });
  } catch (err) {
    console.error('Error updating hit count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
