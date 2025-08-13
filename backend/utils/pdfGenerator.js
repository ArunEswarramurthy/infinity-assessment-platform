const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF report for a test
 * @param {Object} reportData - Test report data
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePDFReport = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      
      // Collect PDF data
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add header
      addHeader(doc, reportData.test);
      
      // Add test info
      addTestInfo(doc, reportData.test);
      
      // Add statistics
      addStatistics(doc, reportData.statistics);
      
      // Add student results
      addStudentResults(doc, reportData.students, reportData.sections);
      
      // Add footer
      addFooter(doc);
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      console.error('Error in PDF generation:', error);
      reject(error);
    }
  });
};

/**
 * Add header to the PDF
 * @param {PDFDocument} doc - PDF document instance
 * @param {Object} test - Test information
 */
function addHeader(doc, test) {
  // Logo (if available)
  const logoPath = path.join(__dirname, '../../public/logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 });
  }
  
  // Title
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Test Report', 110, 50, { align: 'center' });
  
  // Test name
  doc
    .fontSize(14)
    .font('Helvetica')
    .text(test.name, 50, 100, { align: 'left' });
  
  // Date and time
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  
  doc
    .fontSize(10)
    .text(`Generated on: ${date} at ${time}`, 50, 120, { align: 'left' });
    
  // Add a line
  doc.moveTo(50, 140).lineTo(550, 140).stroke();
}

/**
 * Add test information to the PDF
 * @param {PDFDocument} doc - PDF document instance
 * @param {Object} test - Test information
 */
function addTestInfo(doc, test) {
  doc.moveDown(2);
  
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Test Information', 50, doc.y);
    
  doc.moveDown(0.5);
  
  // Test details in a table format
  const testDetails = [
    { label: 'Test ID', value: test.id },
    { label: 'Description', value: test.description || 'N/A' },
    { label: 'Test Date', value: test.testDate || 'N/A' },
    { label: 'Start Time', value: test.startTime || 'N/A' },
    { label: 'Total Students', value: test.totalStudents.toString() }
  ];
  
  // Draw test details
  const startY = doc.y;
  const col1 = 60;
  const col2 = 200;
  
  testDetails.forEach((detail, index) => {
    const y = startY + (index * 20);
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`${detail.label}:`, col1, y);
      
    doc
      .font('Helvetica')
      .text(detail.value, col2, y);
  });
  
  doc.moveDown(2);
}

/**
 * Add statistics to the PDF
 * @param {PDFDocument} doc - PDF document instance
 * @param {Object} stats - Statistics data
 */
function addStatistics(doc, stats) {
  doc.addPage();
  
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Overall Statistics', 50, 50);
    
  doc.moveDown(0.5);
  
  // Overall statistics
  const overallStats = [
    { label: 'Total Students', value: stats.totalStudents },
    { label: 'Average Score', value: stats.averageScore.toFixed(2) },
    { label: 'Highest Score', value: stats.highestScore },
    { label: 'Lowest Score', value: stats.lowestScore }
  ];
  
  // Draw overall statistics
  const startY = doc.y;
  const col1 = 60;
  const col2 = 200;
  
  overallStats.forEach((stat, index) => {
    const y = startY + (index * 20);
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`${stat.label}:`, col1, y);
      
    doc
      .font('Helvetica')
      .text(stat.value.toString(), col2, y);
  });
  
  doc.moveDown(2);
  
  // Add a line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  
  // Section statistics
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Section-wise Statistics');
    
  doc.moveDown(0.5);
  
  // Draw section statistics table header
  const sectionHeaderY = doc.y;
  
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Section', 60, sectionHeaderY)
    .text('Avg. Score', 300, sectionHeaderY, { width: 100, align: 'center' })
    .text('Highest', 400, sectionHeaderY, { width: 100, align: 'center' })
    .text('Lowest', 500, sectionHeaderY, { width: 100, align: 'center' });
    
  // Draw section statistics rows
  let currentY = sectionHeaderY + 20;
  
  Object.entries(stats.sectionStats).forEach(([sectionId, section]) => {
    doc
      .font('Helvetica')
      .text(`Section ${sectionId}`, 60, currentY)
      .text(section.average.toFixed(2), 300, currentY, { width: 100, align: 'center' })
      .text(section.highest.toString(), 400, currentY, { width: 100, align: 'center' })
      .text(section.lowest.toString(), 500, currentY, { width: 100, align: 'center' });
      
    currentY += 20;
  });
  
  doc.moveDown(2);
}

/**
 * Add student results to the PDF
 * @param {PDFDocument} doc - PDF document instance
 * @param {Array} students - Array of student data
 * @param {Array} sections - Array of section data
 */
function addStudentResults(doc, students, sections) {
  // Add a new page for student results
  doc.addPage();
  
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Student Results', 50, 50);
    
  doc.moveDown(0.5);
  
  // Process students in chunks to handle pagination
  const studentsPerPage = 10;
  let currentPage = 0;
  
  for (let i = 0; i < students.length; i += studentsPerPage) {
    if (i > 0) {
      // Add a new page for each chunk of students
      doc.addPage();
      doc.y = 50;
    }
    
    const chunk = students.slice(i, i + studentsPerPage);
    
    // Draw student results table
    drawStudentResultsTable(doc, chunk, sections, i + 1);
    
    // Add page number
    currentPage++;
    doc
      .fontSize(8)
      .text(`Page ${currentPage}`, 50, 750, { align: 'left' });
  }
}

/**
 * Draw student results table
 * @param {PDFDocument} doc - PDF document instance
 * @param {Array} students - Array of student data for current page
 * @param {Array} sections - Array of section data
 * @param {number} startIndex - Starting index for student numbering
 */
function drawStudentResultsTable(doc, students, sections, startIndex) {
  // Table header
  const headerY = doc.y;
  const colWidths = [40, 150, 80]; // Student number, name, total score
  const sectionWidth = 50; // Width for each section column
  
  // Draw table header background
  doc
    .rect(50, headerY, 520, 20)
    .fillAndStroke('#f0f0f0', '#000000');
    
  // Draw header cells
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('#', 55, headerY + 5, { width: colWidths[0] - 10, align: 'left' })
    .text('Student Name', 55 + colWidths[0], headerY + 5, { width: colWidths[1] - 10, align: 'left' });
    
  // Draw section headers
  sections.forEach((section, index) => {
    const x = 55 + colWidths[0] + colWidths[1] + (index * sectionWidth);
    doc.text(section.name.substring(0, 4), x, headerY + 5, { 
      width: sectionWidth - 5, 
      align: 'center' 
    });
  });
  
  // Draw total header
  doc.text('Total', 55 + colWidths[0] + colWidths[1] + (sections.length * sectionWidth), headerY + 5, {
    width: colWidths[2] - 5,
    align: 'center'
  });
  
  // Draw student rows
  let currentY = headerY + 20;
  
  students.forEach((student, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc
        .rect(50, currentY, 520, 20)
        .fillAndStroke('#f9f9f9', '#e0e0e0');
    }
    
    // Student number
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text(
        (startIndex + index).toString(), 
        55, 
        currentY + 5, 
        { width: colWidths[0] - 10, align: 'left' }
      );
      
    // Student name (truncate if too long)
    const studentName = student.name.length > 20 
      ? student.name.substring(0, 17) + '...' 
      : student.name;
      
    doc.text(
      studentName,
      55 + colWidths[0],
      currentY + 5,
      { width: colWidths[1] - 10, align: 'left' }
    );
    
    // Section scores
    sections.forEach((section, secIndex) => {
      const x = 55 + colWidths[0] + colWidths[1] + (secIndex * sectionWidth);
      const score = student.sectionScores[section.id] || { marksObtained: 0 };
      
      doc.text(
        score.marksObtained.toString(),
        x,
        currentY + 5,
        { width: sectionWidth - 5, align: 'center' }
      );
    });
    
    // Total score
    doc.text(
      student.totalScore.toString(),
      55 + colWidths[0] + colWidths[1] + (sections.length * sectionWidth),
      currentY + 5,
      { width: colWidths[2] - 5, align: 'center' }
    );
    
    currentY += 20;
  });
  
  doc.y = currentY + 10;
}

/**
 * Add footer to the PDF
 * @param {PDFDocument} doc - PDF document instance
 */
function addFooter(doc) {
  const footerY = 780;
  
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#666666')
    .text(
      'Generated by Test Platform',
      50,
      footerY,
      { align: 'left' }
    )
    .text(
      `Page ${doc.bufferedPageRange().count} of ${doc.bufferedPageRange().count}`,
      0,
      footerY,
      { align: 'center' }
    )
    .text(
      new Date().toLocaleDateString(),
      -50,
      footerY,
      { align: 'right' }
    );
}

module.exports = {
  generatePDFReport
};
