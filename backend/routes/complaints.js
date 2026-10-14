const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Map human readable names
const issueTypeNames = {
  overflowing_bin: 'Overflowing Public Bin',
  roadside_dumping: 'Roadside Dumping / Illegal Heap',
  food_waste: 'Food-Waste Accumulation',
  mixed_waste: 'Mixed Debris & Garden Waste',
  biohazard_sewage: 'Open Sewage & Biohazard',
  other: 'Other Sanitation Issue'
};

// GET /api/complaints (with optional filter query params)
router.get('/', (req, res) => {
  try {
    const { status, issueType, severity } = req.query;
    const complaints = db.getAllComplaints({ status, issueType, severity });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', (req, res) => {
  try {
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/complaints
router.post('/', (req, res) => {
  try {
    const { issueType, issueTypeName, severity, address, landmark, latitude, longitude, description, photoUrl } = req.body;

    // Validation as required by PRD Section 7.2
    if (!issueType || !issueType.trim()) {
      return res.status(400).json({ success: false, error: 'Please select an issue type.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a location or street address.' });
    }

    const newComplaint = db.createComplaint({
      issueType,
      issueTypeName: (issueTypeName && issueTypeName.trim()) ? issueTypeName.trim() : (issueTypeNames[issueType] || 'Public Cleanliness Issue'),
      severity: severity || 'medium',
      address: address.trim(),
      landmark: landmark ? landmark.trim() : '',
      latitude,
      longitude,
      description: description ? description.trim() : '',
      photoUrl: photoUrl || null
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: newComplaint
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/complaints/:id/status (Demo Admin update action)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, resolutionNote, afterPhotoUrl, assignedWorkerGroup, actorLabel } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Target status is required.' });
    }

    const updated = db.updateComplaintStatus(req.params.id, {
      status,
      resolutionNote,
      afterPhotoUrl,
      assignedWorkerGroup,
      actorLabel
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/complaints/:id/reopen (Resident Reopen / Still Unclean Action)
router.post('/:id/reopen', (req, res) => {
  try {
    const { reason } = req.body;
    const reopened = db.reopenComplaint(req.params.id, reason);
    if (!reopened) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }
    res.json({
      success: true,
      message: 'Complaint reopened for municipal re-inspection.',
      data: reopened
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/complaints/:id/feedback (Resident Cleanliness Rating & Cooperation feedback)
router.post('/:id/feedback', (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updated = db.submitComplaintFeedback(req.params.id, rating, comment);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }
    res.json({
      success: true,
      message: 'Thank you! Your feedback helps uphold sanitation service quality (+15 Eco-Points).',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
