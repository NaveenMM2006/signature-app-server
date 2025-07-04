const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Document = require('../models/Document');

// Store files in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Upload route
router.post('/upload', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    const doc = await Document.create({
      userId: req.user.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get all docs for current user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.userId });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load documents' });
  }
});

module.exports = router;