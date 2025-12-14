const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authGuard = require('../middleware/authGuard');

// Standalone File Upload Endpoint
// Usage: POST /api/upload (Body: form-data, Key: 'image', Value: File)
router.post('/', authGuard, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }
        // Respond with the file path
        res.json({ 
            message: "File uploaded successfully", 
            filePath: `/uploads/${req.file.filename}` 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;