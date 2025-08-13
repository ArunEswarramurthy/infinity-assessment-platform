const { Test, TestSession, User, LicensedUser, SectionSubmission } = require('../models');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const path = require('path');
const fs = require('fs').promises;

class ReportGenerationService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../outputs/reports');
    this.ensureReportsDirectory();
  }

  async ensureReportsDirectory() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating reports directory:', error);
    }
  }

  /**
   * Automatically generate report when a student completes a test
   * @param {string} testId - Test ID
   * @param {string} studentId - Student ID who just completed
   */
  async triggerReportGeneration(testId, studentId) {
    try {
      console.log(`Report generation triggered for test ${testId} by student ${studentId}`);
      
      // Check if test has any completed sessions
      const completedCount = await TestSession.count({
        where: {
          testId,
          status: { [require('sequelize').Op.in]: ['completed', 'auto-submitted'] }
        }
      });

      if (completedCount > 0) {
        // Generate both Excel and CSV reports
        await this.generateTestReport(testId, 'excel');
        await this.generateTestReport(testId, 'csv');
        
        console.log(`Reports generated successfully for test ${testId}`);
        return { success: true, message: 'Reports generated successfully' };
      }

      return { success: false, message: 'No completed sessions found' };
    } catch (error) {
      console.error('Error in triggerReportGeneration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate and save test report to file system
   * @param {string} testId - Test ID
   * @param {string} format - 'excel' or 'csv'
   */
  async generateTestReport(testId, format = 'excel') {
    try {
      const reportData = await this.getTestReportData(testId);
      if (!reportData) {
        throw new Error('Test not found or no completed sessions');
      }

      const filename = `${reportData.test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      const filepath = path.join(this.reportsDir, filename);

      if (format === 'excel') {
        await this.generateExcelReport(reportData, filepath);
      } else {
        await this.generateCSVReport(reportData, filepath);
      }

      return {
        success: true,
        filename,
        filepath,
        recordCount: reportData.students.length
      };
    } catch (error) {
      console.error('Error generating test report:', error);
      throw error;
    }
  }

  /**
   * Get formatted test report data
   * @param {string} testId - Test ID
   */
  async getTestReportData(testId) {
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: TestSession,
        where: { 
          status: { 
            [require('sequelize').Op.in]: ['completed', 'auto-submitted'] 
          } 
        },
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'department'],
            required: false
          },
          {
            model: SectionSubmission,
            attributes: ['sectionIndex', 'score', 'maxScore'],
            required: false
          }
        ],
        order: [['totalScore', 'DESC'], ['completedAt', 'ASC']]
      }]
    });

    if (!test || !test.TestSessions?.length) {
      return null;
    }

    // Process data with ranking
    const students = [];
    let currentRank = 1;
    let previousScore = null;
    
    for (let i = 0; i < test.TestSessions.length; i++) {
      const session = test.TestSessions[i];
      
      // Calculate rank
      const currentScore = session.totalScore || 0;
      if (previousScore !== null && currentScore < previousScore) {
        currentRank = i + 1;
      }
      
      // Get student details
      let student = session.User;
      if (!student) {
        student = await LicensedUser.findByPk(session.studentId, {
          attributes: ['name', 'email', 'department']
        });
      }
      
      // Process section results
      const submissions = session.SectionSubmissions || [];
      const sectionResults = {};
      
      for (let j = 0; j < 3; j++) {
        const section = submissions.find(s => s.sectionIndex === j);
        sectionResults[`section${j + 1}`] = section ? 
          `${section.score}/${section.maxScore}` : 'N/A';
      }
      
      const totalScore = session.totalScore || 0;
      const maxScore = session.maxScore || 100;
      const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100) : 0;
      
      students.push({
        rank: currentRank,
        studentName: student?.name || 'Unknown Student',
        studentId: session.studentId,
        email: student?.email || 'N/A',
        department: student?.department || 'N/A',
        section1Result: sectionResults.section1,
        section2Result: sectionResults.section2,
        section3Result: sectionResults.section3,
        totalScore: `${totalScore}/${maxScore}`,
        averageScore: `${percentage.toFixed(2)}%`,
        timeTaken: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 'N/A',
        completedAt: session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A',
        status: session.status === 'auto-submitted' ? 'Auto-Submitted' : 'Completed'
      });
      
      previousScore = currentScore;
    }

    return {
      test: {
        testId: test.testId,
        name: test.name,
        description: test.description,
        createdAt: test.createdAt
      },
      students
    };
  }

  /**
   * Generate Excel report file
   */
  async generateExcelReport(reportData, filepath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Report');
    
    // Add test information header
    worksheet.addRow(['Test Report']);
    worksheet.addRow(['Test Name:', reportData.test.name]);
    worksheet.addRow(['Test ID:', reportData.test.testId]);
    worksheet.addRow(['Generated:', new Date().toLocaleString()]);
    worksheet.addRow(['Total Students:', reportData.students.length]);
    worksheet.addRow([]); // Empty row
    
    // Style the header
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    
    // Add column headers
    const headers = [
      'Rank', 'Student Name', 'Student ID (SIN Number)', 'Email', 'Department',
      'Section 1 Result', 'Section 2 Result', 'Section 3 Result',
      'Total Score', 'Average Score', 'Time Taken (min)', 'Completed At', 'Status'
    ];
    worksheet.addRow(headers);
    
    // Style column headers
    const headerRow = worksheet.lastRow;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    reportData.students.forEach(student => {
      worksheet.addRow([
        student.rank,
        student.studentName,
        student.studentId,
        student.email,
        student.department,
        student.section1Result,
        student.section2Result,
        student.section3Result,
        student.totalScore,
        student.averageScore,
        student.timeTaken,
        student.completedAt,
        student.status
      ]);
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    await workbook.xlsx.writeFile(filepath);
  }

  /**
   * Generate CSV report file
   */
  async generateCSVReport(reportData, filepath) {
    const csvData = reportData.students.map(student => ({
      'Rank': student.rank,
      'Student Name': student.studentName,
      'Student ID (SIN Number)': student.studentId,
      'Email': student.email,
      'Department': student.department,
      'Section 1 Result': student.section1Result,
      'Section 2 Result': student.section2Result,
      'Section 3 Result': student.section3Result,
      'Total Score': student.totalScore,
      'Average Score': student.averageScore,
      'Time Taken (min)': student.timeTaken,
      'Completed At': student.completedAt,
      'Status': student.status
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    await fs.writeFile(filepath, csv);
  }

  /**
   * Check if reports exist for a test
   * @param {string} testId - Test ID
   */
  async checkReportsExist(testId) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const testFiles = files.filter(file => file.includes(testId));
      
      return {
        hasExcel: testFiles.some(file => file.endsWith('.xlsx')),
        hasCsv: testFiles.some(file => file.endsWith('.csv')),
        files: testFiles
      };
    } catch (error) {
      return { hasExcel: false, hasCsv: false, files: [] };
    }
  }

  /**
   * Get report file path
   * @param {string} testId - Test ID
   * @param {string} format - 'excel' or 'csv'
   */
  async getReportFilePath(testId, format) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const extension = format === 'excel' ? '.xlsx' : '.csv';
      const reportFile = files.find(file => 
        file.includes(testId) && file.endsWith(extension)
      );
      
      return reportFile ? path.join(this.reportsDir, reportFile) : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ReportGenerationService();