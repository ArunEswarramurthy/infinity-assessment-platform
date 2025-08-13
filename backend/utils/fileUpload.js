const multer = require('multer');
const xlsx = require('xlsx');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter to only accept Excel files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Parse Excel from buffer
const parseExcel = (buffer) => {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    return data.map(row => ({
      questionText: row.Question || row.question,
      optionA: row.OptionA || row.A,
      optionB: row.OptionB || row.B,
      optionC: row.OptionC || row.C,
      optionD: row.OptionD || row.D,
      correctOption: row.CorrectAnswer || row.Answer,
      marks: parseInt(row.Marks) || 1
    }));
  } catch (err) {
    console.error('Excel parse error:', err);
    throw new Error('Failed to parse Excel file');
  }
};

module.exports = {
  uploadExcel: upload.single('excelFile'),
  uploadMultipleExcel: upload.array('excelFiles'),
  parseExcel
};