const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dashboard/audit-log
router.get('/audit-log', (req, res) => {
  try {
    const logs = db.getAdminAuditLog();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dashboard/reset-demo (reverts to pristine demo state for presentation rehearsals)
router.post('/reset-demo', (req, res) => {
  try {
    const freshData = db.reset();
    res.json({
      success: true,
      message: 'Demo state successfully reset to initial seed values.',
      data: freshData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dashboard/export-csv (Municipal Audit CSV Export)
router.get('/export-csv', (req, res) => {
  try {
    const csvContent = db.exportComplaintsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ward14_cleanliness_complaints.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
