const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/events
router.get('/', (req, res) => {
  try {
    const events = db.getCommunityEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', (req, res) => {
  try {
    const updatedEvent = db.registerForEvent(req.params.id);
    if (!updatedEvent) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    res.json({
      success: true,
      message: 'Demo registration confirmed! 50-100 Eco-Points added to your balance.',
      data: updatedEvent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
