const express = require('express');
const router = express.Router();
const db = require('../../database/db');

const wasteTypeLabels = {
  e_waste: 'Electronic & Electrical Waste (E-Waste)',
  bulky_furniture: 'Bulky Household Furniture',
  renovation_scrap: 'Renovation Scrap & Inert Metal',
  garden_green: 'Green Garden & Pruning Debris'
};

// GET /api/pickups
router.get('/', (req, res) => {
  try {
    const pickups = db.getAllPickups();
    res.json({ success: true, data: pickups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pickups
router.post('/', (req, res) => {
  try {
    const { wasteType, description, quantityDescription, address, preferredSlot } = req.body;

    if (!wasteType) {
      return res.status(400).json({ success: false, error: 'Please choose a supported special waste type.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a brief description of the items.' });
    }
    if (!quantityDescription || !quantityDescription.trim()) {
      return res.status(400).json({ success: false, error: 'Please specify the approximate quantity or weight.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide the residential pickup address.' });
    }
    if (!preferredSlot || !preferredSlot.trim()) {
      return res.status(400).json({ success: false, error: 'Please select a preferred collection time window.' });
    }

    const newPickup = db.createPickup({
      wasteType,
      wasteTypeName: wasteTypeLabels[wasteType] || 'Special Waste Collection',
      description: description.trim(),
      quantityDescription: quantityDescription.trim(),
      address: address.trim(),
      preferredSlot: preferredSlot.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Special collection request submitted successfully.',
      data: newPickup
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
