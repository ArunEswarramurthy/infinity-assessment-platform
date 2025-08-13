// // // const multer = require('multer');
// // // const xlsx = require('xlsx');

// // // const storage = multer.memoryStorage();
// // // const upload = multer({ storage: storage });

// // // const parseExcel = (buffer) => {
// // //   try {
// // //     const workbook = xlsx.read(buffer, { type: 'buffer' });
// // //     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// // //     const data = xlsx.utils.sheet_to_json(worksheet);
    
// // //     return data.map(row => {
// // //       // Convert correct answer letter (A/B/C/D) to full option text
// // //       const correctOptionLetter = (row.CorrectAnswer || '').toUpperCase().trim();
// // //       let correctOptionText = '';
      
// // //       if (correctOptionLetter === 'A') correctOptionText = row.OptionA;
// // //       else if (correctOptionLetter === 'B') correctOptionText = row.OptionB;
// // //       else if (correctOptionLetter === 'C') correctOptionText = row.OptionC;
// // //       else if (correctOptionLetter === 'D') correctOptionText = row.OptionD;

// // //       // Validate required fields
// // //       if (!row.Question || !row.OptionA || !row.OptionB || !row.OptionC || !row.OptionD || !correctOptionLetter) {
// // //         throw new Error('Missing required fields in Excel row');
// // //       }

// // //       return {
// // //         questionText: row.Question,
// // //         optionA: row.OptionA,
// // //         optionB: row.OptionB,
// // //         optionC: row.OptionC,
// // //         optionD: row.OptionD,
// // //         correctOption: correctOptionText,
// // //         correctOptionLetter: correctOptionLetter,
// // //         marks: parseInt(row.Marks) || 1
// // //       };
// // //     });
// // //   } catch (err) {
// // //     console.error("Error parsing Excel:", err);
// // //     throw err;
// // //   }
// // // };

// // // exports.uploadExcel = upload.single('excelFile');
// // // exports.parseExcel = parseExcel;



// // const xlsx = require('xlsx');

// // const parseExcel = (filePath) => {
// //   try {
// //     const workbook = xlsx.readFile(filePath);
// //     const sheetName = workbook.SheetNames[0];
// //     const worksheet = workbook.Sheets[sheetName];
    
// //     // Convert to JSON with header row
// //     const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    
// //     console.log("Raw Excel Data:", data); // Debug log

// //     return data.map(row => {
// //       // Handle different column name formats
// //       const questionText = row['Question'] || row['question'] || row['QUESTION'];
// //       const optionA = row['OptionA'] || row['A'] || row['optionA'];
// //       const optionB = row['OptionB'] || row['B'] || row['optionB'];
// //       const optionC = row['OptionC'] || row['C'] || row['optionC'];
// //       const optionD = row['OptionD'] || row['D'] || row['optionD'];
// //       const correctAnswer = row['CorrectAnswer'] || row['Answer'] || row['correctAnswer'];

// //       if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
// //         console.warn("Skipping invalid row:", row);
// //         return null;
// //       }

// //       return {
// //         questionText,
// //         optionA,
// //         optionB,
// //         optionC,
// //         optionD,
// //         correctOption: correctAnswer,
// //       };
// //     }).filter(question => question !== null); // Remove any null entries
// //   } catch (err) {
// //     console.error("Error parsing Excel:", err);
// //     throw err;
// //   }
// // };

// // module.exports = parseExcel;


// const xlsx = require('xlsx');

// const parseExcel = (filePath) => {
//   try {
//     // 1. Read the file
//     const workbook = xlsx.readFile(filePath);
    
//     // 2. Get the first sheet
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
    
//     // 3. Convert to JSON using explicit header mapping
//     const data = xlsx.utils.sheet_to_json(worksheet, {
//       header: ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer'],
//       range: 1 // Skip header row since we're providing our own headers
//     });
    
//     // 4. Process each row
//     return data.map(row => {
//       // Convert CorrectAnswer (A/B/C/D) to full answer text
//       const correctLetter = (row.CorrectAnswer || '').toString().trim().toUpperCase();
//       let correctOption = '';
      
//       if (correctLetter === 'A') correctOption = row.OptionA;
//       else if (correctLetter === 'B') correctOption = row.OptionB;
//       else if (correctLetter === 'C') correctOption = row.OptionC;
//       else if (correctLetter === 'D') correctOption = row.OptionD;
      
//       return {
//         questionText: row.Question,
//         optionA: row.OptionA,
//         optionB: row.OptionB,
//         optionC: row.OptionC,
//         optionD: row.OptionD,
//         correctOption: correctOption,
//         correctOptionLetter: correctLetter,
//         marks: 1 // Default value
//       };
//     }).filter(q => q.questionText); // Remove empty rows

//   } catch (err) {
//     console.error("Excel parsing error:", err);
//     throw new Error("Failed to parse Excel file");
//   }
// };

// module.exports = parseExcel;


const xlsx = require('xlsx');

const parseExcel = (filePath) => {
  try {
    // Debug: Verify file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // 1. Read the file
    const workbook = xlsx.readFile(filePath);
    console.log('Workbook SheetNames:', workbook.SheetNames);
    
    // 2. Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Debug: Log worksheet range
    console.log('Worksheet range:', worksheet['!ref']);
    
    // 3. Convert to JSON - let xlsx auto-detect headers
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log('Raw parsed data (first 2 rows):', data.slice(0, 2));
    
    // 4. Process each row with case-insensitive header matching
    const questions = data.map(row => {
      // Normalize headers
      const headers = {};
      Object.keys(row).forEach(key => {
        headers[key.toLowerCase()] = key;
      });

      // Get values with case-insensitive matching
      const questionText = row[headers['question']];
      const optionA = row[headers['optiona']];
      const optionB = row[headers['optionb']];
      const optionC = row[headers['optionc']];
      const optionD = row[headers['optiond']];
      const correctAnswer = (row[headers['correctanswer']] || '').toString().trim().toUpperCase();
      const explanation = row[headers['explanation']] || '';

      if (!questionText) {
        console.warn('Skipping row - missing question:', row);
        return null;
      }

      // Convert letter answer to full text
      let correctOption = '';
      if (correctAnswer === 'A') correctOption = optionA;
      else if (correctAnswer === 'B') correctOption = optionB;
      else if (correctAnswer === 'C') correctOption = optionC;
      else if (correctAnswer === 'D') correctOption = optionD;

      return {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        correctOptionLetter: correctAnswer,
        explanation
      };
    }).filter(Boolean); // Remove null entries

    console.log(`Parsed ${questions.length} valid questions`);
    return questions;

  } catch (err) {
    console.error("Excel parsing error:", err);
    throw new Error(`Failed to parse Excel file: ${err.message}`);
  }
};

module.exports = parseExcel;