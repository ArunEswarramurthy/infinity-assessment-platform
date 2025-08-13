const xlsx = require('xlsx');
const fs = require('fs');

const validateExcelStructure = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'File not found' };
    }

    const workbook = xlsx.readFile(filePath);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { valid: false, error: 'Excel file has no sheets' };
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) {
      return { valid: false, error: 'Excel file must have at least a header row and one data row' };
    }

    // Check if header row contains required columns
    const headerRow = data[0];
    const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
    const headerLower = headerRow.map(h => h.toString().toLowerCase().replace(/\s+/g, ''));
    
    const missingColumns = requiredColumns.filter(col => 
      !headerLower.some(header => header.includes(col))
    );

    if (missingColumns.length > 0) {
      return { 
        valid: false, 
        error: `Missing required columns: ${missingColumns.join(', ')}. Please use the provided template.` 
      };
    }

    return { valid: true, rowCount: data.length - 1 };
  } catch (error) {
    return { valid: false, error: `Excel validation error: ${error.message}` };
  }
};

module.exports = validateExcelStructure;