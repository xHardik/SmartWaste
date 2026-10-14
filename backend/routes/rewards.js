const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/rewards
router.get('/', (req, res) => {
  try {
    const rewards = db.getRewardsData();
    res.json({ success: true, data: rewards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/rewards/redeem
router.post('/redeem', (req, res) => {
  try {
    const { couponId } = req.body;
    if (!couponId) {
      return res.status(400).json({ success: false, error: 'Coupon identifier is required' });
    }
    const result = db.redeemCoupon(couponId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
