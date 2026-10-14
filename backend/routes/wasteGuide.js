const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/waste-guide?q=vegetable&category=wet_organic
router.get('/', (req, res) => {
  try {
    const { q, category } = req.query;
    const items = db.getWasteGuide(q, category);
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
