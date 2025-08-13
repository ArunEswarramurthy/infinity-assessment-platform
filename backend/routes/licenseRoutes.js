const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadLicenseCSV, activateLicense } = require('../controllers/licenseController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('csvFile'), uploadLicenseCSV);
router.post('/activate', activateLicense);

module.exports = router;