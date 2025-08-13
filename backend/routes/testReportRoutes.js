const express = require('express');
const router = express.Router();
const { Test, TestSession, User, SectionSubmission } = require('../models');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const reportGenerationService = require('../services/reportGenerationService');
const path = require('path');
// Simple authentication placeholder
const authenticateToken = (req, res, next) => next();

// Apply authentication to all routes (disabled for now)
// router.use(authenticateToken);

// Get all tests with report status
router.get('/admin/test-reports', async (req, res) => {
  try {
    const tests = await Test.findAll({
      attributes: ['testId', 'name', 'createdAt', 'description'],
      include: [{
        model: TestSession,
        as: 'TestSessions',
        attributes: ['studentId', 'status', 'totalScore', 'maxScore', 'completedAt'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    const testReports = tests.map(test => {
      const sessions = test.TestSessions || [];
      const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'auto-submitted');
      
      // Calculate statistics
      let averageScore = 0;
      let highestScore = 0;
      
      if (completedSessions.length > 0) {
        const scores = completedSessions.map(s => {
          const percentage = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
          return percentage;
        });
        
        averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        highestScore = Math.max(...scores);
      }
      
      return {
        testId: test.testId,
        testName: test.name,
        description: test.description,
        totalStudents: sessions.length,
        completedStudents: completedSessions.length,
        createdAt: test.createdAt,
        hasReports: completedSessions.length > 0,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
      };
    });

    res.json({ 
      success: true, 
      tests: testReports,
      summary: {
        totalTests: tests.length,
        testsWithReports: testReports.filter(t => t.hasReports).length,
        totalStudents: testReports.reduce((sum, test) => sum + test.completedStudents, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching test reports:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch test reports' });
  }
});

// Check if auto-generated reports exist
router.get('/admin/test-reports/:testId/auto-reports', async (req, res) => {
  try {
    const { testId } = req.params;
    const reportsStatus = await reportGenerationService.checkReportsExist(testId);
    
    res.json({
      success: true,
      testId,
      hasAutoReports: reportsStatus.hasExcel || reportsStatus.hasCsv,
      reports: {
        excel: reportsStatus.hasExcel,
        csv: reportsStatus.hasCsv
      },
      files: reportsStatus.files
    });
  } catch (error) {
    console.error('Error checking auto-generated reports:', error);
    res.status(500).json({ success: false, error: 'Failed to check reports status' });
  }
});

// Download auto-generated report
router.get('/admin/test-reports/:testId/download-auto', async (req, res) => {
  try {
    const { testId } = req.params;
    const { format = 'excel' } = req.query;
    
    const filePath = await reportGenerationService.getReportFilePath(testId, format);
    
    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        error: `Auto-generated ${format} report not found. Please use manual download.` 
      });
    }
    
    const filename = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      res.setHeader('Content-Type', 'text/csv');
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading auto-generated report:', error);
    res.status(500).json({ success: false, error: 'Failed to download auto-generated report' });
  }
});

// Download test report
router.get('/admin/test-reports/:testId/download', async (req, res) => {
  try {
    const { testId } = req.params;
    const { format = 'excel' } = req.query;

    // Get test with completed sessions
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: TestSession,
        as: 'TestSessions',
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

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found or no completed sessions' });
    }

    // Process data for report with ranking
    const reportData = [];
    let currentRank = 1;
    let previousScore = null;
    
    for (let i = 0; i < test.TestSessions.length; i++) {
      const session = test.TestSessions[i];
      const submissions = session.SectionSubmissions || [];
      
      // Calculate rank
      const currentScore = session.totalScore || 0;
      if (previousScore !== null && currentScore < previousScore) {
        currentRank = i + 1;
      }
      
      // Get student details (try User first, then LicensedUser)
      let student = session.User;
      if (!student) {
        const { LicensedUser } = require('../models');
        student = await LicensedUser.findByPk(session.studentId, {
          attributes: ['name', 'email', 'department']
        });
      }
      
      // Process section results
      const section1 = submissions.find(s => s.sectionIndex === 0);
      const section2 = submissions.find(s => s.sectionIndex === 1);
      const section3 = submissions.find(s => s.sectionIndex === 2);
      
      const totalScore = session.totalScore || 0;
      const maxScore = session.maxScore || 100;
      const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100) : 0;
      
      reportData.push({
        'Rank': currentRank,
        'Student Name': student?.name || 'Unknown Student',
        'Student ID (SIN Number)': session.studentId,
        'Email': student?.email || 'N/A',
        'Department': student?.department || 'N/A',
        'Section 1 Result': section1 ? `${section1.score}/${section1.maxScore}` : 'N/A',
        'Section 2 Result': section2 ? `${section2.score}/${section2.maxScore}` : 'N/A',
        'Section 3 Result': section3 ? `${section3.score}/${section3.maxScore}` : 'N/A',
        'Total Score': `${totalScore}/${maxScore}`,
        'Average Score': `${percentage.toFixed(2)}%`,
        'Time Taken (min)': session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 'N/A',
        'Completed At': session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A',
        'Status': session.status === 'auto-submitted' ? 'Auto-Submitted' : 'Completed'
      });
      
      previousScore = currentScore;
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Test Report');
      
      // Add test information header
      worksheet.addRow(['Test Report']);
      worksheet.addRow(['Test Name:', test.name]);
      worksheet.addRow(['Test ID:', test.testId]);
      worksheet.addRow(['Generated:', new Date().toLocaleString()]);
      worksheet.addRow(['Total Students:', reportData.length]);
      worksheet.addRow([]); // Empty row
      
      // Style the header
      worksheet.getRow(1).font = { bold: true, size: 16 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      
      // Add column headers
      const headers = Object.keys(reportData[0] || {});
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
      reportData.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
      
      // Set response headers
      const filename = `${test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      await workbook.xlsx.write(res);
    } else {
      const parser = new Parser();
      const csv = parser.parse(reportData);
      
      const filename = `${test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

// Get detailed test report data (for viewing in frontend)
router.get('/admin/test-reports/:testId/details', async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: TestSession,
        as: 'TestSessions',
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

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Process detailed report data
    const students = [];
    let totalScore = 0;
    let highestScore = 0;
    let lowestScore = 100;
    
    for (let i = 0; i < test.TestSessions.length; i++) {
      const session = test.TestSessions[i];
      
      let student = session.User;
      if (!student) {
        const { LicensedUser } = require('../models');
        student = await LicensedUser.findByPk(session.studentId, {
          attributes: ['name', 'email', 'department']
        });
      }
      
      const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
      totalScore += percentage;
      highestScore = Math.max(highestScore, percentage);
      lowestScore = Math.min(lowestScore, percentage);
      
      const sectionScores = {};
      (session.SectionSubmissions || []).forEach(sub => {
        sectionScores[`section${sub.sectionIndex + 1}`] = {
          score: sub.score,
          maxScore: sub.maxScore,
          percentage: sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0
        };
      });
      
      students.push({
        rank: i + 1,
        studentId: session.studentId,
        studentName: student?.name || 'Unknown Student',
        email: student?.email || 'N/A',
        department: student?.department || 'N/A',
        totalScore: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        percentage: Math.round(percentage * 100) / 100,
        sectionScores,
        completedAt: session.completedAt,
        status: session.status,
        timeTaken: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0
      });
    }
    
    const averageScore = students.length > 0 ? totalScore / students.length : 0;
    
    res.json({
      success: true,
      test: {
        testId: test.testId,
        name: test.name,
        description: test.description,
        createdAt: test.createdAt
      },
      statistics: {
        totalStudents: students.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        lowestScore: students.length > 0 ? Math.round(lowestScore * 100) / 100 : 0
      },
      students
    });
    
  } catch (error) {
    console.error('Error fetching test report details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch test report details' });
  }
});

module.exports = router;