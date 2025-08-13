const { Test, User, TestSession, SectionSubmission, LicensedUser, sequelize } = require('../models');
const { Op } = require('sequelize');
const { checkTestDurationAndGenerateReport } = require('../utils/testTimerManager');

// Get overview statistics
exports.getOverviewStats = async (req, res) => {
  try {
    const { period = 'last30days' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last6months':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'lastyear':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total tests created in period
    const totalTests = await Test.count({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    });

    // Get unique students who attempted tests in period
    const activeStudents = await TestSession.count({
      distinct: true,
      col: 'studentId',
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    }) || 0;

    // Get test sessions for completion rate and average score
    const testSessions = await TestSession.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['status', 'totalScore', 'maxScore', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const completedSessions = testSessions.filter(session => session.status === 'completed');
    const completionRate = testSessions.length > 0 ? (completedSessions.length / testSessions.length) * 100 : 0;
    
    const totalScores = completedSessions.reduce((sum, session) => {
      const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
      return sum + percentage;
    }, 0);
    const averageScore = completedSessions.length > 0 ? totalScores / completedSessions.length : 0;

    res.json({
      success: true,
      data: {
        totalTests,
        activeStudents,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        totalAttempts: testSessions.length,
        completedAttempts: completedSessions.length
      }
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
};

// Get student performance report
exports.getStudentPerformance = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get completed test sessions
    const testSessions = await TestSession.findAll({
      where: {
        status: ['completed', 'submitted']
      },
      attributes: ['studentId', 'totalScore', 'maxScore', 'completedAt'],
      order: [['completedAt', 'DESC']]
    });

    if (testSessions.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Group by student and calculate stats
    const studentStats = {};
    
    testSessions.forEach(session => {
      const studentId = session.studentId;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          totalTests: 0,
          totalScore: 0,
          totalMaxScore: 0,
          lastTestDate: null
        };
      }
      
      studentStats[studentId].totalTests += 1;
      studentStats[studentId].totalScore += session.totalScore || 0;
      studentStats[studentId].totalMaxScore += session.maxScore || 100;
      
      if (!studentStats[studentId].lastTestDate || session.completedAt > studentStats[studentId].lastTestDate) {
        studentStats[studentId].lastTestDate = session.completedAt;
      }
    });

    // Get top performers
    const topPerformers = [];
    
    for (const [studentId, stats] of Object.entries(studentStats)) {
      const averageScore = stats.totalMaxScore > 0 ? (stats.totalScore / stats.totalMaxScore) * 100 : 0;
      
      // Try to find student in both tables
      let student = await User.findByPk(studentId, {
        attributes: ['name', 'email']
      });
      
      if (!student) {
        student = await LicensedUser.findByPk(studentId, {
          attributes: ['name', 'email', 'department']
        });
      }
      
      if (student) {
        topPerformers.push({
          name: student.name || 'Unknown Student',
          email: student.email || 'N/A',
          department: student.department || 'N/A',
          totalTests: stats.totalTests,
          averageScore: Math.round(averageScore * 10) / 10,
          lastTestDate: stats.lastTestDate
        });
      }
    }
    
    // Sort by average score and limit
    topPerformers.sort((a, b) => b.averageScore - a.averageScore);
    const limitedPerformers = topPerformers.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedPerformers
    });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student performance data'
    });
  }
};

// Get test analytics
exports.getTestAnalytics = async (req, res) => {
  try {
    // Get test analytics using proper model queries
    const tests = await Test.findAll({
      include: [{
        model: TestSession,
        as: 'sessions',
        attributes: ['id', 'status', 'totalScore', 'maxScore', 'completedAt'],
        required: false
      }],
      attributes: ['testId', 'name', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const testAnalytics = tests.map(test => {
      const sessions = test.sessions || [];
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalAttempts = sessions.length;
      const completedAttempts = completedSessions.length;
      const averageScore = completedSessions.length > 0 ? 
        completedSessions.reduce((sum, s) => {
          const score = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
          return sum + score;
        }, 0) / completedSessions.length : 0;
      const lastAttempt = sessions.length > 0 ? 
        Math.max(...sessions.map(s => new Date(s.completedAt || s.createdAt).getTime())) : null;

      return {
        testId: test.testId,
        name: test.name,
        status: test.status,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
        lastAttempt: lastAttempt ? new Date(lastAttempt) : null,
        createdAt: test.createdAt
      };
    });

    res.json({
      success: true,
      data: testAnalytics
    });
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test analytics'
    });
  }
};

// Get comprehensive test history for admin reports
exports.getTestHistory = async (req, res) => {
  try {
    console.log('📊 Fetching test history for admin reports...');
    
    // Get tests with session data using Sequelize models
    const tests = await Test.findAll({
      include: [{
        model: TestSession,
        as: 'sessions',
        attributes: ['id', 'status', 'totalScore', 'maxScore', 'completedAt'],
        required: false
      }],
      attributes: ['testId', 'name', 'description', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${tests.length} tests`);

    const testHistory = await Promise.all(tests.map(async (test) => {
      const sessions = test.sessions || [];
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalAttempts = sessions.length;
      const completedAttempts = completedSessions.length;
      const averageScore = completedSessions.length > 0 ? 
        completedSessions.reduce((sum, s) => {
          const score = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
          return sum + score;
        }, 0) / completedSessions.length : 0;
      const lastAttempt = sessions.length > 0 ? 
        Math.max(...sessions.map(s => new Date(s.completedAt || s.createdAt).getTime())) : null;

      // Check if test duration is complete for report generation
      const durationCheck = await checkTestDurationAndGenerateReport(test.testId);
      
      return {
        testId: test.testId,
        testName: test.name,
        description: test.description,
        status: test.status,
        createdDate: test.createdAt,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
        lastAttempt: lastAttempt ? new Date(lastAttempt) : null,
        hasResults: completedAttempts > 0,
        testInProgress: durationCheck.testInProgress || false,
        timeRemaining: durationCheck.timeRemaining || 0,
        testEndTime: durationCheck.testEndTime || null,
        countdownMessage: durationCheck.message || null
      };
    }));

    console.log(`✅ Found ${testHistory.length} tests with ${testHistory.filter(t => t.hasResults).length} having results`);

    res.json({
      success: true,
      data: testHistory
    });
  } catch (error) {
    console.error('❌ Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history'
    });
  }
};

// Generate report (placeholder for actual report generation)
exports.generateReport = async (req, res) => {
  try {
    const { reportType, period } = req.body;

    // This is a placeholder - in a real implementation, you would:
    // 1. Generate the actual report based on type and period
    // 2. Create a file (PDF, Excel, etc.)
    // 3. Store it temporarily or send it directly
    // 4. Return download link or file

    const reportId = Date.now().toString();
    const reportName = `${reportType}_${period}_${reportId}`;

    // Simulate report generation
    setTimeout(() => {
      console.log(`Report ${reportName} generated successfully`);
    }, 2000);

    res.json({
      success: true,
      message: 'Report generation started',
      data: {
        reportId,
        reportName,
        status: 'processing',
        estimatedTime: '2-3 minutes'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

// Get recent reports (with real test data)
exports.getRecentReports = async (req, res) => {
  try {
    // Get recent completed test sessions for reports
    const recentSessions = await TestSession.findAll({
      where: {
        status: 'completed',
        completedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: [{
        model: Test,
        as: 'test',
        attributes: ['name', 'testId']
      }],
      order: [['completedAt', 'DESC']],
      limit: 10
    });

    const recentReports = recentSessions.map((session, index) => ({
      id: session.id,
      name: `${session.test?.name || 'Test'} - Session Report`,
      type: "Test Session",
      date: session.completedAt.toISOString().split('T')[0],
      status: "Generated",
      size: "1.2 MB",
      downloadUrl: `/api/reports/download/session-${session.id}`,
      testId: session.testId,
      score: session.totalScore,
      maxScore: session.maxScore
    }));

    res.json({
      success: true,
      data: recentReports
    });
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent reports'
    });
  }
};

// Get tests in date range with session data
exports.getTestsInRange = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      };
    } else if (period === 'last7days') {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (period === 'last30days') {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate + ' 23:59:59')
        }
      };
    }

    const tests = await Test.findAll({
      where: dateFilter,
      attributes: ['testId', 'name', 'status', 'createdAt'],
      include: [{
        model: TestSession,
        as: 'sessions',
        attributes: ['id', 'status', 'totalScore', 'maxScore', 'completedAt'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    // Add session statistics to each test
    const testsWithStats = tests.map(test => {
      const sessions = test.sessions || [];
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const avgScore = completedSessions.length > 0 ? 
        completedSessions.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0), 0) / completedSessions.length : 0;
      
      return {
        testId: test.testId,
        name: test.name,
        status: test.status,
        createdAt: test.createdAt,
        totalAttempts: sessions.length,
        completedAttempts: completedSessions.length,
        averageScore: Math.round(avgScore * 10) / 10
      };
    });

    res.json({
      success: true,
      data: testsWithStats
    });
  } catch (error) {
    console.error('Error fetching tests in range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests in date range'
    });
  }
};

// Generate test report PDF
exports.generateTestReport = async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Get test details with sessions
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: TestSession,
        as: 'sessions',
        where: { status: 'completed' },
        required: false,
        include: [{
          model: SectionSubmission,
          as: 'submissions'
        }]
      }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Get summary statistics
    const totalAttempts = test.sessions?.length || 0;
    const avgScore = totalAttempts > 0 ? 
      test.sessions.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0), 0) / totalAttempts : 0;

    res.json({
      success: true,
      message: `Report for test ${testId} generated successfully`,
      data: {
        testName: test.name,
        totalAttempts,
        averageScore: Math.round(avgScore * 10) / 10,
        sessions: test.sessions?.map(s => ({
          studentId: s.studentId,
          score: s.totalScore,
          maxScore: s.maxScore,
          percentage: s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0,
          completedAt: s.completedAt
        })) || []
      },
      downloadUrl: `/api/reports/download/test-${testId}.pdf`
    });
  } catch (error) {
    console.error('Error generating test report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test report'
    });
  }
};

// Get live test activity for real-time updates
exports.getLiveActivity = async (req, res) => {
  try {
    // Get recent test sessions (last 24 hours)
    const recentSessions = await TestSession.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: [{
        model: Test,
        as: 'test',
        attributes: ['name', 'testId']
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get ongoing sessions
    const ongoingSessions = await TestSession.count({
      where: {
        status: ['in_progress', 'on_break']
      }
    });

    // Get completed sessions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await TestSession.count({
      where: {
        status: 'completed',
        completedAt: {
          [Op.gte]: today
        }
      }
    });

    res.json({
      success: true,
      data: {
        recentSessions: recentSessions.map(session => ({
          id: session.id,
          testName: session.test?.name || 'Unknown Test',
          testId: session.testId,
          studentId: session.studentId,
          status: session.status,
          score: session.totalScore,
          maxScore: session.maxScore,
          createdAt: session.createdAt,
          completedAt: session.completedAt
        })),
        ongoingSessions,
        completedToday,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching live activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live activity'
    });
  }
};

// Get all test results for admin
exports.getAllTestResults = async (req, res) => {
  try {
    const { testId, limit = 50, offset = 0 } = req.query;
    
    console.log(`📊 Fetching all test results - testId: ${testId}, limit: ${limit}, offset: ${offset}`);
    
    // ENHANCED: Use raw query for better performance and reliability
    let whereClause = "WHERE ts.status = 'completed'";
    let replacements = [];
    
    if (testId) {
      whereClause += " AND ts.testId = ?";
      replacements.push(testId);
    }
    
    const [testSessions] = await sequelize.query(`
      SELECT 
        ts.id,
        ts.studentId,
        ts.testId,
        ts.status,
        ts.totalScore,
        ts.maxScore,
        ts.startedAt,
        ts.completedAt,
        ts.createdAt,
        t.name as testName,
        t.description as testDescription,
        COALESCE(lu.name, u.name) as studentName,
        COALESCE(lu.email, u.email) as studentEmail,
        COALESCE(lu.department, u.department) as department,
        u.sinNumber
      FROM test_sessions ts
      LEFT JOIN tests t ON ts.testId = t.testId
      LEFT JOIN licensed_users lu ON ts.studentId = lu.id
      LEFT JOIN users u ON ts.studentId = u.id
      ${whereClause}
      ORDER BY ts.createdAt DESC
      LIMIT ? OFFSET ?
    `, { 
      replacements: [...replacements, parseInt(limit), parseInt(offset)]
    });
    
    console.log(`✅ Found ${testSessions.length} test sessions`);
    
    // Format results directly from the query
    const results = testSessions.map((session) => {
      const percentage = session.maxScore > 0 ? 
        Math.round((session.totalScore / session.maxScore) * 100) : 0;
      const status = percentage >= 60 ? 'Pass' : 'Fail';
      
      return {
        sessionId: session.id,
        studentId: session.studentId,
        studentName: session.studentName || 'Unknown Student',
        studentEmail: session.studentEmail || 'N/A',
        sinNumber: session.sinNumber || 'N/A',
        department: session.department || 'N/A',
        testId: session.testId,
        testName: session.testName || 'Unknown Test',
        score: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        percentage,
        status,
        timeTaken: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0,
        submissionDate: session.completedAt || session.createdAt,
        downloadUrl: `/api/reports/download/session-${session.id}`
      };
    });
    
    // Get total count for pagination
    const totalCount = await TestSession.count({
      where: whereClause
    });
    
    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results'
    });
  }
};

// Get test results by specific test ID with section-wise scores
exports.getTestResultsByTestId = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: Section,
        attributes: ['id', 'name', 'type', 'correctMarks']
      }],
      attributes: ['testId', 'name', 'description']
    });
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    const testSessions = await TestSession.findAll({
      where: {
        testId,
        status: ['completed', 'submitted']
      },
      include: [{
        model: SectionSubmission,
        as: 'submissions',
        include: [{
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'type']
        }]
      }],
      attributes: [
        'id', 'studentId', 'status', 'totalScore', 'maxScore',
        'startedAt', 'completedAt', 'createdAt'
      ],
      order: [['completedAt', 'DESC']]
    });
    
    // Get student details for each session with section-wise scores
    const results = await Promise.all(
      testSessions.map(async (session) => {
        let student = await User.findByPk(session.studentId, {
          attributes: ['id', 'name', 'email', 'sinNumber', 'department']
        });
        
        if (!student) {
          student = await LicensedUser.findByPk(session.studentId, {
            attributes: ['id', 'name', 'email', 'department']
          });
        }
        
        const percentage = session.maxScore > 0 ? 
          Math.round((session.totalScore / session.maxScore) * 100) : 0;
        
        // Get section-wise scores
        const sectionScores = session.submissions.map(sub => ({
          sectionId: sub.sectionId,
          sectionName: sub.section?.name || `Section ${sub.sectionIndex + 1}`,
          sectionType: sub.section?.type || 'MCQ',
          score: sub.score || 0,
          maxScore: sub.maxScore || 0,
          percentage: sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0,
          timeSpent: sub.timeSpent || 0
        }));
        
        return {
          sessionId: session.id,
          studentId: session.studentId,
          studentName: student?.name || 'Unknown Student',
          studentEmail: student?.email || 'N/A',
          sinNumber: student?.sinNumber || 'N/A',
          department: student?.department || 'N/A',
          score: session.totalScore || 0,
          maxScore: session.maxScore || 100,
          percentage,
          status: percentage >= 60 ? 'Pass' : 'Fail',
          timeTaken: session.completedAt && session.startedAt ? 
            Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0,
          submissionDate: session.completedAt,
          sectionScores
        };
      })
    );
    
    // Calculate test statistics
    const totalStudents = results.length;
    const passedStudents = results.filter(r => r.status === 'Pass').length;
    const averageScore = totalStudents > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents) : 0;
    
    // Calculate section-wise statistics
    const sectionStats = test.Sections.map(section => {
      const sectionResults = results.map(r => 
        r.sectionScores.find(s => s.sectionId === section.id)
      ).filter(Boolean);
      
      const avgSectionScore = sectionResults.length > 0 ?
        Math.round(sectionResults.reduce((sum, s) => sum + s.percentage, 0) / sectionResults.length) : 0;
      
      return {
        sectionId: section.id,
        sectionName: section.name,
        sectionType: section.type,
        averageScore: avgSectionScore,
        totalAttempts: sectionResults.length
      };
    });
    
    res.json({
      success: true,
      test: {
        testId: test.testId,
        name: test.name,
        description: test.description,
        sections: test.Sections
      },
      statistics: {
        totalStudents,
        passedStudents,
        failedStudents: totalStudents - passedStudents,
        passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
        averageScore,
        sectionStats
      },
      results
    });
  } catch (error) {
    console.error('Error fetching test results by test ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results'
    });
  }
};

// Download test results in assessment format
exports.downloadAssessmentReport = async (req, res) => {
  try {
    const { testId } = req.params;
    console.log(`📋 Generating assessment report for test: ${testId}`);
    
    // Get test details
    const test = await Test.findOne({
      where: { testId },
      attributes: ['testId', 'name', 'createdAt']
    });
    
    if (!test) {
      console.log(`❌ Test not found: ${testId}`);
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Get all completed test sessions for this test
    const testSessions = await TestSession.findAll({
      where: {
        testId,
        status: 'completed'
      },
      attributes: ['id', 'studentId', 'totalScore', 'maxScore', 'completedAt'],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📊 Found ${testSessions.length} completed sessions for assessment report`);
    
    if (testSessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed test sessions found for this test'
      });
    }
    
    // Get student details and format results
    const results = [];
    let serialNo = 1;
    
    for (const session of testSessions) {
      // Get student details - check both tables
      let student = await LicensedUser.findByPk(session.studentId, {
        attributes: ['name', 'email', 'department']
      });
      
      if (!student) {
        student = await User.findByPk(session.studentId, {
          attributes: ['name', 'sinNumber', 'department']
        });
      }
      
      // For assessment format, split total score equally between sections
      const halfScore = Math.floor((session.totalScore || 0) / 2);
      const remainingScore = (session.totalScore || 0) - halfScore;
      const maxPerSection = Math.floor((session.maxScore || 100) / 2);
      
      const section1Percentage = maxPerSection > 0 ? Math.round((halfScore / maxPerSection) * 100) : 0;
      const section2Percentage = maxPerSection > 0 ? Math.round((remainingScore / maxPerSection) * 100) : 0;
      
      results.push({
        serialNo: serialNo++,
        sinNumber: student?.sinNumber || `SIN${String(serialNo-1).padStart(3, '0')}`,
        studentName: student?.name || `Student ${session.studentId}`,
        department: student?.department || 'N/A',
        section1: `${halfScore}/${maxPerSection} (${section1Percentage}%)`,
        section2: `${remainingScore}/${maxPerSection} (${section2Percentage}%)`
      });
    }
    
    // Generate PDF report
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers for PDF download
    const filename = `${test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add header
    doc.fontSize(18).text('ASSESSMENT REPORT', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12)
       .text(`Assessment Name: ${test.name}`)
       .text(`Date & Time: ${new Date().toLocaleString()}`);
    
    doc.moveDown();
    doc.fontSize(16).text('RESULT', { align: 'center' });
    doc.moveDown();
    
    // Table header
    const startX = 50;
    let currentY = doc.y;
    
    doc.fontSize(10)
       .text('SI.NO', startX, currentY, { width: 40 })
       .text('SIN NUMBER', startX + 45, currentY, { width: 80 })
       .text('STUDENT NAME', startX + 130, currentY, { width: 120 })
       .text('SECTION - I', startX + 255, currentY, { width: 80 })
       .text('SECTION - II', startX + 340, currentY, { width: 80 });
    
    currentY += 20;
    doc.moveTo(startX, currentY).lineTo(startX + 420, currentY).stroke();
    currentY += 10;
    
    // Table rows
    results.forEach(result => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.text(result.serialNo.toString(), startX, currentY, { width: 40 })
         .text(result.sinNumber, startX + 45, currentY, { width: 80 })
         .text(result.studentName.substring(0, 18), startX + 130, currentY, { width: 120 })
         .text(result.section1, startX + 255, currentY, { width: 80 })
         .text(result.section2, startX + 340, currentY, { width: 80 });
      currentY += 25;
    });
    
    // Signature section
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }
    
    doc.moveDown(3);
    currentY = doc.y + 50;
    
    doc.fontSize(12)
       .text('Trainer Signature: ___________________', startX, currentY)
       .text('Staff In-charge: ___________________', startX + 150, currentY)
       .text('Placement Officer: ___________________', startX + 300, currentY);
    
    // Finalize PDF
    doc.end();
    console.log(`✅ Assessment report generated successfully for test ${testId}`);
    
  } catch (error) {
    console.error('❌ Error generating assessment report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment report: ' + error.message
    });
  }
};

// Get test results for admin reports page
exports.getTestResults = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get completed test sessions with test details
    const testSessions = await TestSession.findAll({
      where: {
        status: 'completed'
      },
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name', 'createdAt']
      }],
      attributes: ['id', 'studentId', 'testId', 'totalScore', 'maxScore', 'completedAt', 'createdAt'],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    // Format results for frontend
    const results = testSessions.map(session => ({
      sessionId: session.id,
      studentId: session.studentId,
      testId: session.testId,
      testName: session.test?.name || 'Unknown Test',
      score: session.totalScore || 0,
      maxScore: session.maxScore || 100,
      percentage: session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0,
      submissionDate: session.completedAt || session.createdAt
    }));
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results'
    });
  }
};

// Download comprehensive test report with detailed results
exports.downloadTestReport = async (req, res) => {
  try {
    const { testId } = req.params;
    console.log(`📄 Generating detailed report for test: ${testId}`);
    
    // Get test details
    const test = await Test.findOne({
      where: { testId },
      attributes: ['testId', 'name', 'description', 'createdAt']
    });
    
    if (!test) {
      console.log(`❌ Test not found: ${testId}`);
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Get all completed test sessions for this test
    const testSessions = await TestSession.findAll({
      where: {
        testId,
        status: 'completed'
      },
      attributes: ['id', 'studentId', 'totalScore', 'maxScore', 'startedAt', 'completedAt', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📊 Found ${testSessions.length} completed sessions for test ${testId}`);
    
    if (testSessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed test sessions found for this test'
      });
    }
    
    // Get student details and format results
    const results = [];
    let serialNo = 1;
    
    for (const session of testSessions) {
      // Get student details - check both User and LicensedUser tables
      let student = await LicensedUser.findByPk(session.studentId, {
        attributes: ['id', 'name', 'email', 'department']
      });
      
      if (!student) {
        student = await User.findByPk(session.studentId, {
          attributes: ['id', 'name', 'email', 'sinNumber', 'department']
        });
      }
      
      const percentage = session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0;
      const timeTaken = session.completedAt && session.startedAt ? 
        Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0;
      
      results.push({
        serialNo: serialNo++,
        studentId: session.studentId,
        studentName: student?.name || `Student ${session.studentId}`,
        email: student?.email || 'N/A',
        sinNumber: student?.sinNumber || 'N/A',
        department: student?.department || 'N/A',
        score: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        percentage,
        status: percentage >= 60 ? 'Pass' : 'Fail',
        timeTaken,
        completedAt: session.completedAt
      });
    }
    
    // Calculate statistics
    const totalStudents = results.length;
    const passedStudents = results.filter(r => r.status === 'Pass').length;
    const averageScore = totalStudents > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents) : 0;
    const averageTime = totalStudents > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / totalStudents) : 0;
    
    console.log(`📈 Report stats: ${totalStudents} students, ${passedStudents} passed, ${averageScore}% avg`);
    
    // Generate PDF report
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    // Set headers for PDF download
    const filename = `${test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Detailed_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('TEST ASSESSMENT REPORT', { align: 'center' });
    doc.moveDown();
    
    // Test Information
    doc.fontSize(14).text('Test Information', { underline: true });
    doc.fontSize(12)
       .text(`Test Name: ${test.name}`)
       .text(`Test ID: ${test.testId}`)
       .text(`Description: ${test.description || 'N/A'}`)
       .text(`Report Generated: ${new Date().toLocaleString()}`);
    
    doc.moveDown();
    
    // Statistics
    doc.fontSize(14).text('Test Statistics', { underline: true });
    doc.fontSize(12)
       .text(`Total Students: ${totalStudents}`)
       .text(`Passed Students: ${passedStudents} (${totalStudents > 0 ? Math.round((passedStudents/totalStudents)*100) : 0}%)`)
       .text(`Failed Students: ${totalStudents - passedStudents} (${totalStudents > 0 ? Math.round(((totalStudents-passedStudents)/totalStudents)*100) : 0}%)`)
       .text(`Average Score: ${averageScore}%`)
       .text(`Average Time Taken: ${averageTime} minutes`);
    
    doc.moveDown();
    
    // Results Table
    doc.fontSize(14).text('Detailed Results', { underline: true });
    doc.moveDown(0.5);
    
    // Table headers
    const tableTop = doc.y;
    const cols = {
      sno: 40,
      name: 80,
      email: 200,
      score: 320,
      status: 380,
      time: 430
    };
    
    doc.fontSize(10)
       .text('S.No', cols.sno, tableTop)
       .text('Student Name', cols.name, tableTop)
       .text('Email', cols.email, tableTop)
       .text('Score', cols.score, tableTop)
       .text('Status', cols.status, tableTop)
       .text('Time', cols.time, tableTop);
    
    // Draw line under headers
    doc.moveTo(cols.sno, tableTop + 15)
       .lineTo(cols.time + 50, tableTop + 15)
       .stroke();
    
    let currentY = tableTop + 25;
    
    // Table rows
    results.forEach((result) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.fontSize(9)
         .fillColor('black')
         .text(result.serialNo.toString(), cols.sno, currentY)
         .text(result.studentName.substring(0, 20), cols.name, currentY)
         .text(result.email.substring(0, 15), cols.email, currentY)
         .text(`${result.score}/${result.maxScore} (${result.percentage}%)`, cols.score, currentY)
         .fillColor(result.status === 'Pass' ? 'green' : 'red')
         .text(result.status, cols.status, currentY)
         .fillColor('black')
         .text(`${result.timeTaken}m`, cols.time, currentY);
      
      currentY += 20;
    });
    
    // Summary section
    if (currentY > 650) {
      doc.addPage();
    }
    
    doc.moveDown(2);
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12)
       .text(`This report contains detailed results for ${totalStudents} students who completed the test.`)
       .text(`Pass rate: ${totalStudents > 0 ? Math.round((passedStudents/totalStudents)*100) : 0}%`)
       .text(`Generated on: ${new Date().toLocaleDateString()}`);
    
    // Signature section
    doc.moveDown(3);
    doc.fontSize(12)
       .text('Authorized by: ___________________', 40, doc.y)
       .text('Date: ___________________', 300, doc.y - 15);
    
    // Finalize PDF
    doc.end();
    console.log(`✅ PDF report generated successfully for test ${testId}`);
    
  } catch (error) {
    console.error('❌ Error generating test report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test report: ' + error.message
    });
  }
};

// Download bulk report with all test results
exports.downloadBulkReport = async (req, res) => {
  try {
    const { period = 'all', format = 'pdf' } = req.query;
    console.log(`📦 Generating bulk report for period: ${period}`);
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (period !== 'all') {
      let startDate;
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        dateFilter = {
          createdAt: {
            [Op.gte]: startDate
          }
        };
      }
    }
    
    // Get all completed test sessions in the period
    const testSessions = await TestSession.findAll({
      where: {
        status: 'completed',
        ...dateFilter
      },
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name', 'description']
      }],
      attributes: ['id', 'studentId', 'testId', 'totalScore', 'maxScore', 'startedAt', 'completedAt'],
      order: [['completedAt', 'DESC']]
    });
    
    console.log(`📊 Found ${testSessions.length} test sessions for bulk report`);
    
    if (testSessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No test results found for the selected period'
      });
    }
    
    // Get student details for all sessions
    const results = [];
    let serialNo = 1;
    
    for (const session of testSessions) {
      let student = await LicensedUser.findByPk(session.studentId, {
        attributes: ['id', 'name', 'email', 'department']
      });
      
      if (!student) {
        student = await User.findByPk(session.studentId, {
          attributes: ['id', 'name', 'email', 'sinNumber', 'department']
        });
      }
      
      const percentage = session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0;
      const timeTaken = session.completedAt && session.startedAt ? 
        Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) : 0;
      
      results.push({
        serialNo: serialNo++,
        testName: session.test?.name || 'Unknown Test',
        testId: session.testId,
        studentName: student?.name || `Student ${session.studentId}`,
        email: student?.email || 'N/A',
        department: student?.department || 'N/A',
        score: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        percentage,
        status: percentage >= 60 ? 'Pass' : 'Fail',
        timeTaken,
        completedAt: session.completedAt
      });
    }
    
    // Generate PDF report
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    // Set headers for PDF download
    const filename = `Bulk_Test_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('BULK TEST RESULTS REPORT', { align: 'center' });
    doc.moveDown();
    
    // Report Information
    doc.fontSize(12)
       .text(`Period: ${period === 'all' ? 'All Time' : period.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`)
       .text(`Total Results: ${results.length}`)
       .text(`Generated: ${new Date().toLocaleString()}`);
    
    doc.moveDown();
    
    // Statistics
    const totalStudents = results.length;
    const passedStudents = results.filter(r => r.status === 'Pass').length;
    const averageScore = totalStudents > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents) : 0;
    
    doc.fontSize(14).text('Overall Statistics', { underline: true });
    doc.fontSize(12)
       .text(`Total Test Attempts: ${totalStudents}`)
       .text(`Passed: ${passedStudents} (${totalStudents > 0 ? Math.round((passedStudents/totalStudents)*100) : 0}%)`)
       .text(`Failed: ${totalStudents - passedStudents} (${totalStudents > 0 ? Math.round(((totalStudents-passedStudents)/totalStudents)*100) : 0}%)`)
       .text(`Average Score: ${averageScore}%`);
    
    doc.moveDown();
    
    // Results Table
    doc.fontSize(14).text('Detailed Results', { underline: true });
    doc.moveDown(0.5);
    
    // Table headers
    const tableTop = doc.y;
    const cols = {
      sno: 40,
      test: 80,
      student: 180,
      email: 280,
      score: 380,
      status: 430,
      time: 480
    };
    
    doc.fontSize(9)
       .text('S.No', cols.sno, tableTop)
       .text('Test Name', cols.test, tableTop)
       .text('Student', cols.student, tableTop)
       .text('Email', cols.email, tableTop)
       .text('Score', cols.score, tableTop)
       .text('Status', cols.status, tableTop)
       .text('Time', cols.time, tableTop);
    
    // Draw line under headers
    doc.moveTo(cols.sno, tableTop + 12)
       .lineTo(cols.time + 40, tableTop + 12)
       .stroke();
    
    let currentY = tableTop + 20;
    
    // Table rows
    results.forEach((result) => {
      // Check if we need a new page
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.fontSize(8)
         .fillColor('black')
         .text(result.serialNo.toString(), cols.sno, currentY)
         .text(result.testName.substring(0, 12), cols.test, currentY)
         .text(result.studentName.substring(0, 15), cols.student, currentY)
         .text(result.email.substring(0, 12), cols.email, currentY)
         .text(`${result.percentage}%`, cols.score, currentY)
         .fillColor(result.status === 'Pass' ? 'green' : 'red')
         .text(result.status, cols.status, currentY)
         .fillColor('black')
         .text(`${result.timeTaken}m`, cols.time, currentY);
      
      currentY += 15;
    });
    
    // Finalize PDF
    doc.end();
    console.log(`✅ Bulk report generated successfully for ${results.length} results`);
    
  } catch (error) {
    console.error('❌ Error generating bulk report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk report: ' + error.message
    });
  }
};

// Download report file
exports.downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Generate a simple text report as placeholder
    const reportContent = `Report ID: ${reportId}\nGenerated: ${new Date().toISOString()}\nStatus: Generated\n\nThis is a sample report file.`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.txt"`);
    res.send(reportContent);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report'
    });
  }
};