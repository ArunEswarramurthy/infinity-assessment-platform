const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadLicensedUsers } = require('../controllers/licensedUserController');

const upload = multer({ dest: 'uploads/' }); // temp folder

router.post('/upload-licensed-users', upload.single('file'), uploadLicensedUsers);

module.exports = router;
