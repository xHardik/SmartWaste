const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const complaintsRouter = require('./routes/complaints');
const pickupsRouter = require('./routes/pickups');
const wasteGuideRouter = require('./routes/wasteGuide');
const eventsRouter = require('./routes/events');
const rewardsRouter = require('./routes/rewards');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Image upload helper endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Extract base64 payload
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a regular URL, return as is
      return res.json({ success: true, url: imageBase64 });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanFileName = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFileName);
    const buffer = Buffer.from(matches[2], 'base64');

    fs.writeFileSync(filePath, buffer);
    res.json({
      success: true,
      url: `/uploads/${cleanFileName}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/pickups', pickupsRouter);
app.use('/api/waste-guide', wasteGuideRouter);
app.use('/api/events', eventsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve Frontend static assets
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// SPA fallback: any other route serves index.html
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` SMART WASTE MANAGEMENT SYSTEM (Citizen & Admin)   `);
  console.log(` Server active on: http://localhost:${PORT}         `);
  console.log(` Frontend serving from: ../frontend                `);
  console.log(` Database stored in:    ../database/data.json       `);
  console.log(`====================================================`);
});
