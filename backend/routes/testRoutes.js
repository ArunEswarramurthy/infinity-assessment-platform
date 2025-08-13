// // const express = require("express");
// // const multer = require("multer");
// // const path = require("path");
// // const testController = require("../controllers/testController");
// // const questionController = require("../controllers/questionController");

// // const router = express.Router();

// // // File storage for multer
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, "uploads/"),
// //   filename: (req, file, cb) =>
// //     cb(null, `${Date.now()}_${file.originalname}`),
// // });
// // const upload = multer({ storage });
// // const uploadMemory = multer(); // for buffer upload (in-memory)

// // router.post("/createTest", upload.any(), testController.createTest);
// // router.post("/uploadMCQ/:sectionId", uploadMemory.single("file"), questionController.uploadMCQQuestions);

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const testController = require('../controllers/testController');
// const { uploadMultipleExcel } = require('../utils/fileUpload');

// router.post(
//   '/',
//   uploadMultipleExcel,
//   testController.createTest
// );

// module.exports = router;


const express = require("express");
const multer = require("multer");
const path = require("path");
const testController = require("../controllers/testController");
// const { authenticateToken } = require('../middlewares/authMiddleware');
const authenticateToken = (req, res, next) => next();
const { generateCSRFToken, validateCSRFToken } = require('../utils/security');

const router = express.Router();

// Simple middleware placeholder
const csrfProtection = (req, res, next) => {
  next();
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to only accept Excel files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
      file.mimetype === "application/vnd.ms-excel") {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Updated route to handle multiple files with dynamic field names
router.post(
  "/create",
  authenticateToken,
  csrfProtection,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error('File upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large',
            message: 'Excel files must be smaller than 5MB'
          });
        }
        if (err.message === 'Only Excel files are allowed!') {
          return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            message: 'Only Excel files (.xlsx, .xls) are allowed'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          message: err.message
        });
      }
      next();
    });
  },
  testController.createTest
);

// Template download route
router.get('/template/download', (req, res) => {
  const xlsx = require('xlsx');
  
  // Create sample data
  const sampleData = [
    {
      Question: 'What is 2+2?',
      OptionA: '2',
      OptionB: '3', 
      OptionC: '4',
      OptionD: '5',
      CorrectAnswer: 'C',
      Explanation: 'Addition of two numbers: 2+2 equals 4'
    },
    {
      Question: 'Which is the capital of France?',
      OptionA: 'London',
      OptionB: 'Paris',
      OptionC: 'Berlin', 
      OptionD: 'Madrid',
      CorrectAnswer: 'B',
      Explanation: 'Paris is the capital and largest city of France'
    }
  ];
  
  // Create workbook and worksheet
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(sampleData);
  
  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(wb, ws, 'Questions');
  
  // Generate buffer
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  // Set headers and send file
  res.setHeader('Content-Disposition', 'attachment; filename=question-template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Add these new routes to your existing file
router.get('/', authenticateToken, testController.getAllTests);
router.get('/assigned', authenticateToken, testController.getAssignedTests);
router.get('/:id', authenticateToken, testController.getTestById);
router.get('/:testId/eligibility', authenticateToken, testController.checkTestEligibility);
router.put('/:id/assign', authenticateToken, csrfProtection, testController.assignTest);
router.put(
  '/:id/update',
  authenticateToken,
  csrfProtection,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error('File upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large',
            message: 'Excel files must be smaller than 5MB'
          });
        }
        if (err.message === 'Only Excel files are allowed!') {
          return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            message: 'Only Excel files (.xlsx, .xls) are allowed'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          message: err.message
        });
      }
      next();
    });
  },
  testController.updateTest
);
router.delete('/:id', authenticateToken, csrfProtection, testController.deleteTest);
module.exports = router;
