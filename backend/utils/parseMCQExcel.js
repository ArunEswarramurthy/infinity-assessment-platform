// // // const xlsx = require("xlsx");

// // // const parseMCQExcel = (filePath) => {
// // //   try {
// // //     const workbook = xlsx.readFile(filePath);
// // //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// // //     const data = xlsx.utils.sheet_to_json(sheet);

// // //     return data.map(row => ({
// // //       questionText: row["Question"] || row["question"],
// // //       optionA: row["OptionA"] || row["A"],
// // //       optionB: row["OptionB"] || row["B"],
// // //       optionC: row["OptionC"] || row["C"],
// // //       optionD: row["OptionD"] || row["D"],
// // //       correctOption: row["CorrectAnswer"] || row["Answer"],
// // //       marks: row["Marks"] || row["marks"] || 1
// // //     }));
// // //   } catch (err) {
// // //     console.error("Failed to parse Excel:", err.message);
// // //     return [];
// // //   }
// // // };

// // // module.exports = parseMCQExcel;

// // const xlsx = require("xlsx");

// // const parseMCQExcel = (filePath) => {
// //   try {
// //     const workbook = xlsx.readFile(filePath);
// //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// //     const data = xlsx.utils.sheet_to_json(sheet);

// //     return data.map(row => ({
// //       questionText: row["Question"],
// //       optionA: row["OptionA"],
// //       optionB: row["OptionB"],
// //       optionC: row["OptionC"],
// //       optionD: row["OptionD"],
// //       correctOption: row["CorrectAnswer"],
// //       marks: row["Marks"] || 1
// //     }));
// //   } catch (err) {
// //     console.error("Failed to parse Excel:", err.message);
// //     return [];
// //   }
// // };

// // module.exports = parseMCQExcel;

// const xlsx = require("xlsx");

// const parseMCQExcel = (filePath) => {
//   try {
//     const workbook = xlsx.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     return data.map(row => {
//       // Debugging: log the row to see actual structure
//       console.log("Processing row:", row);
      
//       return {
//         questionText: row["Question"],
//         optionA: row["OptionA"],
//         optionB: row["OptionB"],
//         optionC: row["OptionC"],
//         optionD: row["OptionD"],
//         correctOption: row["CorrectAnswer"],
//         marks: parseInt(row["Marks"]) || 1 // Ensure marks is a number
//       };
//     });
//   } catch (err) {
//     console.error("Failed to parse Excel:", err);
//     throw err; // Re-throw to handle in calling function
//   }
// };

// module.exports = parseMCQExcel;

const xlsx = require("xlsx");
const fs = require("fs");

const parseMCQExcel = (filePath) => {
  try {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found at path: ${filePath}`);
    }

    console.log(`Reading Excel file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel file has no sheets');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`Found ${data.length} rows in Excel file`);

    if (data.length === 0) {
      throw new Error('Excel file is empty or has no data rows');
    }

    const questions = data.map((row, index) => {
      try {
        // Handle different column name formats (case-insensitive)
        const headers = {};
        Object.keys(row).forEach(key => {
          headers[key.toLowerCase().replace(/\s+/g, '')] = key;
        });

        const questionText = row[headers['question']] || row[headers['questiontext']];
        const optionA = row[headers['optiona']] || row[headers['a']];
        const optionB = row[headers['optionb']] || row[headers['b']];
        const optionC = row[headers['optionc']] || row[headers['c']];
        const optionD = row[headers['optiond']] || row[headers['d']];
        const correctAnswer = (row[headers['correctanswer']] || row[headers['answer']] || '').toString().trim().toUpperCase();
        const explanation = row[headers['explanation']] || '';
        const marks = parseInt(row[headers['marks']]) || 1;

        // Validate required fields
        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
          console.warn(`Skipping row ${index + 1} - missing required fields:`, {
            questionText: !!questionText,
            optionA: !!optionA,
            optionB: !!optionB,
            optionC: !!optionC,
            optionD: !!optionD,
            correctAnswer: !!correctAnswer
          });
          return null;
        }

        // Validate correct answer is A, B, C, or D
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          console.warn(`Skipping row ${index + 1} - invalid correct answer: ${correctAnswer}`);
          return null;
        }

        // Convert letter answer to full option text
        let correctOption = '';
        switch (correctAnswer) {
          case 'A': correctOption = optionA; break;
          case 'B': correctOption = optionB; break;
          case 'C': correctOption = optionC; break;
          case 'D': correctOption = optionD; break;
        }

        return {
          questionText: questionText.toString().trim(),
          optionA: optionA.toString().trim(),
          optionB: optionB.toString().trim(),
          optionC: optionC.toString().trim(),
          optionD: optionD.toString().trim(),
          correctOption: correctOption.toString().trim(),
          correctOptionLetter: correctAnswer,
          explanation: explanation.toString().trim(),
          marks
        };
      } catch (rowError) {
        console.error(`Error processing row ${index + 1}:`, rowError);
        return null;
      }
    }).filter(Boolean); // Remove null entries

    console.log(`Successfully parsed ${questions.length} valid questions from Excel`);
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in Excel file. Please check the format.');
    }

    return questions;

  } catch (err) {
    console.error("Excel parsing error:", err);
    throw new Error(`Failed to parse Excel file: ${err.message}`);
  }
};

module.exports = parseMCQExcel;
