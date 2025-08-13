const XLSX = require('xlsx');
const path = require('path');

const createQuestionTemplate = () => {
  // Create sample data
  const data = [
    ['Question Number', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer', 'Explanation'],
    [1, 'What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', 'Paris is the capital and largest city of France.'],
    [2, 'Which programming language is known as the "language of the web"?', 'Python', 'JavaScript', 'Java', 'C++', 'B', 'JavaScript is widely used for web development.'],
    [3, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'A', 'HTML stands for Hyper Text Markup Language.']
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Question Number
    { wch: 50 }, // Question
    { wch: 25 }, // Option 1
    { wch: 25 }, // Option 2
    { wch: 25 }, // Option 3
    { wch: 25 }, // Option 4
    { wch: 15 }, // Correct Answer
    { wch: 40 }  // Explanation
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  // Write file
  const templatePath = path.join(__dirname, '../public/question-template.xlsx');
  XLSX.writeFile(wb, templatePath);
  
  return templatePath;
};

module.exports = { createQuestionTemplate };