const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadStudentExcel, getStudents, activateStudent } = require('../controllers/studentUploadController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-students', upload.single('file'), uploadStudentExcel);
router.get('/students', getStudents);
router.put('/students/:studentId/activate', activateStudent);

module.exports = router;