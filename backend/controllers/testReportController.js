const { Test, TestSession, SectionScore, User, LicensedUser, sequelize } = require('../models');
const ExcelJS = require('exceljs');

// Get test results with ranking
exports.getTestResultsWithRanking = async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Get test details
    const test = await Test.findOne({
      where: { testId },
      attributes: ['testId', 'name', 'description', 'createdAt']
    });
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Get all completed test sessions with section scores
    const testSessions = await TestSession.findAll({
      where: {
        testId,
        status: 'completed'
      },
      include: [{
        model: sequelize.models.SectionScore,
        as: 'sectionScores',
        required: false
      }],
      order: [['totalScore', 'DESC'], ['completedAt', 'ASC']]
    });
    
    // Get student details and calculate rankings
    const results = [];
    let currentRank = 1;
    let previousScore = null;
    let studentsWithSameScore = 0;
    
    for (let i = 0; i < testSessions.length; i++) {
      const session = testSessions[i];
      
      // Get student details
      let student = await LicensedUser.findByPk(session.studentId, {
        attributes: ['name', 'email', 'department']
      });
      
      if (!student) {
        student = await User.findByPk(session.studentId, {
          attributes: ['name', 'email']
        });
      }
      
      // Calculate rank
      if (previousScore !== null && session.totalScore < previousScore) {
        currentRank = i + 1;
        studentsWithSameScore = 0;
      } else if (previousScore !== null && session.totalScore === previousScore) {
        studentsWithSameScore++;
      }
      
      // Get section scores
      const sectionScores = {};
      session.sectionScores.forEach(score => {
        sectionScores[`section${score.sectionIndex + 1}`] = {
          score: score.score,
          maxScore: score.maxScore,
          percentage: score.percentage
        };
      });
      
      const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
      
      results.push({
        rank: currentRank,
        studentId: session.studentId,
        studentName: student?.name || 'Unknown Student',
        email: student?.email || 'N/A',
        department: student?.department || 'N/A',
        totalScore: session.totalScore,
        maxScore: session.maxScore,
        percentage: Math.round(percentage * 100) / 100,
        averageScore: Math.round(percentage * 100) / 100,
        sectionScores,
        completedAt: session.completedAt,
        timeTaken: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0
      });
      
      previousScore = session.totalScore;
    }
    
    res.json({
      success: true,
      test: {
        testId: test.testId,
        name: test.name,
        description: test.description,
        createdAt: test.createdAt
      },
      totalStudents: results.length,
      results
    });
    
  } catch (error) {
    console.error('Error fetching test results with ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results'
    });
  }
};

// Download Excel report
exports.downloadExcelReport = async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Get test results with ranking
    const testData = await this.getTestResultsData(testId);
    
    if (!testData.success) {
      return res.status(404).json(testData);
    }
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Results');
    
    // Add headers
    const headers = [
      'Rank', 'Student Name', 'Email', 'Department',
      'Total Score', 'Max Score', 'Percentage',
      'Section 1 Score', 'Section 2 Score', 'Section 3 Score',
      'Average Score', 'Time Taken (min)', 'Completed At'
    ];
    
    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    testData.results.forEach(result => {
      const row = [
        result.rank,
        result.studentName,
        result.email,
        result.department,
        result.totalScore,
        result.maxScore,
        `${result.percentage}%`,
        result.sectionScores.section1 ? `${result.sectionScores.section1.score}/${result.sectionScores.section1.maxScore}` : 'N/A',
        result.sectionScores.section2 ? `${result.sectionScores.section2.score}/${result.sectionScores.section2.maxScore}` : 'N/A',
        result.sectionScores.section3 ? `${result.sectionScores.section3.score}/${result.sectionScores.section3.maxScore}` : 'N/A',
        `${result.averageScore}%`,
        result.timeTaken,
        result.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A'
      ];
      worksheet.addRow(row);
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    // Set response headers
    const filename = `${testData.test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Results.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Excel report'
    });
  }
};

// Helper function to get test results data
exports.getTestResultsData = async (testId) => {
  try {
    const test = await Test.findOne({
      where: { testId },
      attributes: ['testId', 'name', 'description', 'createdAt']
    });
    
    if (!test) {
      return {
        success: false,
        message: 'Test not found'
      };
    }
    
    const testSessions = await TestSession.findAll({
      where: {
        testId,
        status: 'completed'
      },
      include: [{
        model: sequelize.models.SectionScore,
        as: 'sectionScores',
        required: false
      }],
      order: [['totalScore', 'DESC'], ['completedAt', 'ASC']]
    });
    
    const results = [];
    let currentRank = 1;
    let previousScore = null;
    
    for (let i = 0; i < testSessions.length; i++) {
      const session = testSessions[i];
      
      let student = await LicensedUser.findByPk(session.studentId, {
        attributes: ['name', 'email', 'department']
      });
      
      if (!student) {
        student = await User.findByPk(session.studentId, {
          attributes: ['name', 'email']
        });
      }
      
      if (previousScore !== null && session.totalScore < previousScore) {
        currentRank = i + 1;
      }
      
      const sectionScores = {};
      session.sectionScores.forEach(score => {
        sectionScores[`section${score.sectionIndex + 1}`] = {
          score: score.score,
          maxScore: score.maxScore,
          percentage: score.percentage
        };
      });
      
      const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
      
      results.push({
        rank: currentRank,
        studentId: session.studentId,
        studentName: student?.name || 'Unknown Student',
        email: student?.email || 'N/A',
        department: student?.department || 'N/A',
        totalScore: session.totalScore,
        maxScore: session.maxScore,
        percentage: Math.round(percentage * 100) / 100,
        averageScore: Math.round(percentage * 100) / 100,
        sectionScores,
        completedAt: session.completedAt,
        timeTaken: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0
      });
      
      previousScore = session.totalScore;
    }
    
    return {
      success: true,
      test,
      totalStudents: results.length,
      results
    };
    
  } catch (error) {
    console.error('Error getting test results data:', error);
    return {
      success: false,
      message: 'Failed to fetch test results'
    };
  }
};