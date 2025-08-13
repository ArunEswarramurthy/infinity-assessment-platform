const { Test, TestSession, User, LicensedUser, SectionSubmission } = require('../models');
const reportGenerationService = require('../services/reportGenerationService');
const { sanitizeForLog } = require('../utils/security');
const path = require('path');

// Get all tests with report status for admin
exports.getTestReports = async (req, res) => {
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

    const testReports = await Promise.all(tests.map(async (test) => {
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

      // Check if reports exist
      const reportsStatus = await reportGenerationService.checkReportsExist(test.testId);
      
      return {
        testId: test.testId,
        testName: test.name,
        description: test.description,
        totalStudents: sessions.length,
        completedStudents: completedSessions.length,
        createdAt: test.createdAt,
        hasReports: reportsStatus.hasExcel || reportsStatus.hasCsv,
        hasExcelReport: reportsStatus.hasExcel,
        hasCsvReport: reportsStatus.hasCsv,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
        reportFiles: reportsStatus.files
      };
    }));

    res.json({ 
      success: true, 
      tests: testReports,
      summary: {
        totalTests: tests.length,
        testsWithReports: testReports.filter(t => t.hasReports).length,
        totalCompletedStudents: testReports.reduce((sum, test) => sum + test.completedStudents, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching test reports:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to fetch test reports' });
  }
};

// Generate report for a specific test
exports.generateTestReport = async (req, res) => {
  try {
    const { testId } = req.params;
    const { format = 'excel' } = req.query;

    if (!testId) {
      return res.status(400).json({ success: false, error: 'Test ID is required' });
    }

    console.log(`📊 Generating ${format} report for test: ${sanitizeForLog(testId)}`);

    const result = await reportGenerationService.generateTestReport(testId, format);
    
    if (result.success) {
      res.json({
        success: true,
        message: `${format.toUpperCase()} report generated successfully`,
        filename: result.filename,
        recordCount: result.recordCount
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error generating test report:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
};

// Download generated report
exports.downloadTestReport = async (req, res) => {
  try {
    const { testId } = req.params;
    const { format = 'excel' } = req.query;

    const filePath = await reportGenerationService.getReportFilePath(testId, format);
    
    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        error: `${format.toUpperCase()} report not found. Please generate the report first.` 
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
    console.error('Error downloading report:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to download report' });
  }
};

// Get detailed test report data for viewing
exports.getTestReportDetails = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const reportData = await reportGenerationService.getTestReportData(testId);
    
    if (!reportData) {
      return res.status(404).json({ success: false, error: 'Test not found or no completed sessions' });
    }

    // Calculate additional statistics
    const students = reportData.students;
    const scores = students.map(s => parseFloat(s.averageScore.replace('%', '')));
    
    const statistics = {
      totalStudents: students.length,
      averageScore: scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      passCount: scores.filter(score => score >= 60).length,
      failCount: scores.filter(score => score < 60).length
    };
    
    res.json({
      success: true,
      test: reportData.test,
      statistics,
      students: reportData.students
    });
    
  } catch (error) {
    console.error('Error fetching test report details:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to fetch test report details' });
  }
};

// Regenerate all reports for a test
exports.regenerateTestReports = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(`🔄 Regenerating all reports for test: ${sanitizeForLog(testId)}`);

    // Generate both Excel and CSV reports
    const excelResult = await reportGenerationService.generateTestReport(testId, 'excel');
    const csvResult = await reportGenerationService.generateTestReport(testId, 'csv');
    
    res.json({
      success: true,
      message: 'Reports regenerated successfully',
      excel: excelResult,
      csv: csvResult
    });
  } catch (error) {
    console.error('Error regenerating reports:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to regenerate reports' });
  }
};

// Get admin dashboard statistics
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalTests = await Test.count();
    const totalSessions = await TestSession.count();
    const completedSessions = await TestSession.count({
      where: { status: { [require('sequelize').Op.in]: ['completed', 'auto-submitted'] } }
    });
    const inProgressSessions = await TestSession.count({
      where: { status: 'in_progress' }
    });

    // Get recent test completions
    const recentCompletions = await TestSession.findAll({
      where: { status: { [require('sequelize').Op.in]: ['completed', 'auto-submitted'] } },
      include: [
        {
          model: Test,
          as: 'test',
          attributes: ['name']
        }
      ],
      order: [['completedAt', 'DESC']],
      limit: 10
    });

    // Process recent completions with student names
    const recentCompletionsWithNames = await Promise.all(
      recentCompletions.map(async (session) => {
        let student = await User.findByPk(session.studentId, { attributes: ['name'] });
        if (!student) {
          student = await LicensedUser.findByPk(session.studentId, { attributes: ['name'] });
        }
        
        return {
          testName: session.test?.name || 'Unknown Test',
          studentName: student?.name || 'Unknown Student',
          score: session.totalScore || 0,
          maxScore: session.maxScore || 100,
          percentage: session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0,
          completedAt: session.completedAt
        };
      })
    );

    res.json({
      success: true,
      dashboard: {
        totalTests,
        totalSessions,
        completedSessions,
        inProgressSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        recentCompletions: recentCompletionsWithNames
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
};