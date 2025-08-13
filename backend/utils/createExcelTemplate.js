const XLSX = require('xlsx');
const path = require('path');

function createQuestionTemplate() {
  // Sample data for the template
  const templateData = [
    {
      'Question Number': 1,
      'Question': 'What is the capital of France?',
      'Option 1': 'London',
      'Option 2': 'Berlin',
      'Option 3': 'Paris',
      'Option 4': 'Madrid',
      'Correct Answer': 'C',
      'Explanation': 'Paris is the capital and largest city of France.'
    },
    {
      'Question Number': 2,
      'Question': 'Which programming language is known as the "language of the web"?',
      'Option 1': 'Python',
      'Option 2': 'JavaScript',
      'Option 3': 'Java',
      'Option 4': 'C++',
      'Correct Answer': 'B',
      'Explanation': 'JavaScript is widely used for web development and is often called the language of the web.'
    },
    {
      'Question Number': 3,
      'Question': 'What does HTML stand for?',
      'Option 1': 'Hyper Text Markup Language',
      'Option 2': 'High Tech Modern Language',
      'Option 3': 'Home Tool Markup Language',
      'Option 4': 'Hyperlink and Text Markup Language',
      'Correct Answer': 'A',
      'Explanation': 'HTML stands for Hyper Text Markup Language, used to create web pages.'
    }
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  worksheet['!cols'] = [
    { width: 15 }, // Question Number
    { width: 50 }, // Question
    { width: 25 }, // Option 1
    { width: 25 }, // Option 2
    { width: 25 }, // Option 3
    { width: 25 }, // Option 4
    { width: 15 }, // Correct Answer
    { width: 40 }  // Explanation
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

  // Save template
  const templatePath = path.join(__dirname, '../public/question-template.xlsx');
  XLSX.writeFile(workbook, templatePath);
  
  return templatePath;
}

module.exports = { createQuestionTemplate };