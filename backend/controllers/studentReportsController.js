const { Test, TestSession, LicensedUser, User, SectionSubmission, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get comprehensive student reports data
exports.getStudentReports = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`📊 Fetching comprehensive reports for student: ${studentId}`);

    // Check both user types - prioritize LicensedUser for email logins
    let student = await LicensedUser.findByPk(studentId);
    let isLicensedUser = !!student;
    
    if (!student) {
      student = await User.findByPk(studentId);
    }
    
    // Also try to find by email if studentId looks like an email
    if (!student && studentId.includes('@')) {
      student = await LicensedUser.findOne({ where: { email: studentId } });
      isLicensedUser = !!student;
      if (!student) {
        student = await User.findOne({ where: { email: studentId } });
      }
    }
    
    if (!student) {
      console.log(`❌ Student not found: ${studentId}`);
      return res.json({
        success: true,
        testsTaken: 0,
        averageScore: 0,
        completionRate: 100,
        bestScore: 0,
        worstScore: 0,
        recentTests: [],
        performanceTrend: [],
        subjectPerformance: [],
        timeAnalytics: {},
        insights: {
          strengths: 'Complete your first test to see your strengths',
          improvements: 'Complete your first test to see areas for improvement',
          progress: 'Complete your first test to track your progress',
          recommendation: 'Start taking tests to get personalized recommendations'
        },
        isLicensedUser: false
      });
    }

    const testSessions = await TestSession.findAll({
      where: { 
        studentId: String(studentId),
        status: ['completed', 'submitted']
      },
      attributes: [
        'id', 'testId', 'status', 'totalScore', 'maxScore', 
        'startedAt', 'completedAt', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${testSessions.length} completed sessions for student ${studentId}`);

    // Get test details separately to avoid association issues
    const testIds = [...new Set(testSessions.map(session => session.testId))];
    const tests = await Test.findAll({
      where: { testId: testIds },
      attributes: ['testId', 'name', 'description']
    });
    const testMap = tests.reduce((map, test) => {
      map[test.testId] = test;
      return map;
    }, {});

    // console.log(`Found ${testSessions.length} completed test sessions for student ${studentId}`);

    // Calculate enhanced statistics
    const testsTaken = testSessions.length;
    const scores = testSessions.map(session => 
      Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100)
    );
    
    const totalScore = testSessions.reduce((sum, session) => sum + (session.totalScore || 0), 0);
    const totalMaxScore = testSessions.reduce((sum, session) => sum + (session.maxScore || 100), 0);
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
    const completionRate = 100; // All fetched sessions are completed
    
    // Calculate performance trend (last 10 tests)
    const performanceTrend = testSessions.slice(0, 10).reverse().map((session, index) => ({
      testNumber: index + 1,
      score: Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100),
      date: session.createdAt.toISOString().split('T')[0],
      testName: testMap[session.testId]?.name || `Test ${session.testId}`
    }));
    
    // Calculate time analytics
    const timeAnalytics = calculateTimeAnalytics(testSessions);
    
    // Calculate subject performance (group by test name patterns)
    const subjectPerformance = calculateSubjectPerformance(testSessions, testMap);
    
    // Calculate enhanced insights
    const insights = calculateEnhancedInsights(testSessions, averageScore, bestScore, worstScore, performanceTrend, isLicensedUser);

    // Format recent tests
    const recentTests = testSessions.map(session => {
      const test = testMap[session.testId];
      return {
        testId: session.id,
        testName: test?.name || `Test ${session.testId}`,
        date: session.createdAt.toISOString().split('T')[0],
        score: Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100),
        rawScore: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        downloadUrl: `/api/student/download-report/${session.id}`,
        duration: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) + ' min' : 
          'N/A',
        status: session.status
      };
    });

    res.json({
      success: true,
      testsTaken,
      averageScore,
      completionRate,
      bestScore,
      worstScore,
      recentTests,
      performanceTrend,
      subjectPerformance,
      timeAnalytics,
      insights,
      isLicensedUser,
      studentInfo: {
        name: student.name,
        email: student.email,
        department: student.department,
        joinDate: student.created_at || student.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student reports'
    });
  }
};

// Helper function to calculate performance insights
function calculateInsights(testSessions, averageScore, bestScore) {
  if (testSessions.length === 0) {
    return {
      strengths: 'Complete your first test to see your strengths',
      improvements: 'Complete your first test to see areas for improvement',
      progress: 'Complete your first test to track your progress'
    };
  }

  const scores = testSessions.map(session => 
    Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100)
  );
  
  const recentScores = scores.slice(0, 3); // Last 3 tests
  const olderScores = scores.slice(3); // Older tests
  
  // Calculate strengths
  let strengths = '';
  if (averageScore >= 90) {
    strengths = 'Excellent performance! You consistently score above 90%';
  } else if (averageScore >= 80) {
    strengths = 'Strong performance with an average score above 80%';
  } else if (averageScore >= 70) {
    strengths = 'Good performance with room for improvement';
  } else {
    strengths = 'Keep practicing to improve your performance';
  }

  // Calculate improvements
  let improvements = '';
  if (averageScore < 60) {
    improvements = 'Focus on fundamental concepts to improve your overall performance';
  } else if (averageScore < 80) {
    improvements = 'Review challenging topics and practice more to reach 80%+';
  } else {
    improvements = 'Maintain consistency and aim for perfect scores';
  }

  // Calculate progress
  let progress = '';
  if (recentScores.length >= 2 && olderScores.length >= 1) {
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const improvement = Math.round(recentAvg - olderAvg);
    
    if (improvement > 5) {
      progress = `Great progress! Your scores have improved by ${improvement}% recently`;
    } else if (improvement > 0) {
      progress = `Steady improvement with a ${improvement}% increase in recent tests`;
    } else if (improvement === 0) {
      progress = 'Consistent performance across all tests';
    } else {
      progress = `Focus on consistency - recent scores dropped by ${Math.abs(improvement)}%`;
    }
  } else {
    progress = `You've completed ${testSessions.length} test${testSessions.length > 1 ? 's' : ''} with an average of ${averageScore}%`;
  }

  return { strengths, improvements, progress };
}

// Calculate time analytics
function calculateTimeAnalytics(testSessions) {
  if (testSessions.length === 0) return {};
  
  const durations = testSessions
    .filter(session => session.startedAt && session.completedAt)
    .map(session => {
      const duration = (new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60);
      return Math.round(duration);
    });
  
  if (durations.length === 0) return {};
  
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  return {
    averageTestTime: avgDuration,
    fastestTest: minDuration,
    slowestTest: maxDuration,
    totalTestTime: durations.reduce((a, b) => a + b, 0)
  };
}

// Calculate subject performance
function calculateSubjectPerformance(testSessions, testMap) {
  if (testSessions.length === 0) return [];
  
  const subjectScores = {};
  
  testSessions.forEach(session => {
    const test = testMap[session.testId];
    const testName = test?.name || 'Unknown';
    
    // Extract subject from test name
    let subject = 'General';
    if (testName.toLowerCase().includes('javascript')) subject = 'JavaScript';
    else if (testName.toLowerCase().includes('react')) subject = 'React';
    else if (testName.toLowerCase().includes('python')) subject = 'Python';
    else if (testName.toLowerCase().includes('java')) subject = 'Java';
    else if (testName.toLowerCase().includes('css')) subject = 'CSS';
    else if (testName.toLowerCase().includes('html')) subject = 'HTML';
    else if (testName.toLowerCase().includes('database') || testName.toLowerCase().includes('sql')) subject = 'Database';
    
    if (!subjectScores[subject]) {
      subjectScores[subject] = { scores: [], tests: 0 };
    }
    
    const score = Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100);
    subjectScores[subject].scores.push(score);
    subjectScores[subject].tests++;
  });
  
  return Object.entries(subjectScores).map(([subject, data]) => ({
    subject,
    averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    testsCount: data.tests,
    bestScore: Math.max(...data.scores),
    worstScore: Math.min(...data.scores)
  })).sort((a, b) => b.averageScore - a.averageScore);
}

// Enhanced insights calculation
function calculateEnhancedInsights(testSessions, averageScore, bestScore, worstScore, performanceTrend, isLicensedUser) {
  if (testSessions.length === 0) {
    return {
      strengths: 'Complete your first test to see your strengths',
      improvements: 'Complete your first test to see areas for improvement',
      progress: 'Complete your first test to track your progress',
      recommendation: 'Start taking tests to get personalized recommendations'
    };
  }

  const scores = testSessions.map(session => 
    Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100)
  );
  
  const consistency = scores.length > 1 ? 
    Math.round(100 - (Math.max(...scores) - Math.min(...scores))) : 100;
  
  // Enhanced strengths analysis
  let strengths = '';
  if (averageScore >= 95) {
    strengths = `Outstanding performance! You're in the top tier with ${averageScore}% average`;
  } else if (averageScore >= 85) {
    strengths = `Excellent work! Strong ${averageScore}% average with ${consistency}% consistency`;
  } else if (averageScore >= 75) {
    strengths = `Good performance with ${averageScore}% average. ${bestScore >= 90 ? 'You\'ve shown you can achieve 90%+' : 'Room for improvement'}`;
  } else if (averageScore >= 60) {
    strengths = `Passing performance at ${averageScore}%. Focus on consistency to improve further`;
  } else {
    strengths = `Current average is ${averageScore}%. Significant improvement needed to reach passing grade`;
  }

  // Enhanced improvements analysis
  let improvements = '';
  const scoreGap = bestScore - worstScore;
  if (scoreGap > 30) {
    improvements = `High score variation (${scoreGap}% gap). Focus on consistent preparation and time management`;
  } else if (averageScore < 80) {
    improvements = `Target 80%+ average. Review weak areas and practice regularly. Current gap to 80%: ${80 - averageScore}%`;
  } else if (consistency < 80) {
    improvements = `Good average but inconsistent performance. Work on maintaining steady preparation routine`;
  } else {
    improvements = `Strong performance! Fine-tune advanced topics and aim for perfect scores`;
  }

  // Enhanced progress analysis
  let progress = '';
  if (performanceTrend.length >= 3) {
    const recent3 = performanceTrend.slice(-3).map(t => t.score);
    const older3 = performanceTrend.slice(0, 3).map(t => t.score);
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
    const olderAvg = older3.reduce((a, b) => a + b, 0) / older3.length;
    const trend = Math.round(recentAvg - olderAvg);
    
    if (trend > 10) {
      progress = `Excellent upward trend! +${trend}% improvement in recent tests`;
    } else if (trend > 5) {
      progress = `Positive trend with +${trend}% improvement. Keep up the momentum!`;
    } else if (trend > -5) {
      progress = `Stable performance around ${averageScore}%. ${testSessions.length} tests completed`;
    } else {
      progress = `Recent decline of ${Math.abs(trend)}%. Review study methods and focus areas`;
    }
  } else {
    progress = `${testSessions.length} test${testSessions.length > 1 ? 's' : ''} completed. Build more data for trend analysis`;
  }

  // Personalized recommendations
  let recommendation = '';
  if (isLicensedUser && averageScore < 70) {
    recommendation = 'As a licensed user, focus on fundamentals. Consider retaking practice tests before attempting new ones';
  } else if (averageScore >= 90) {
    recommendation = 'Excellent performance! Challenge yourself with advanced topics and help others';
  } else if (averageScore >= 80) {
    recommendation = 'Strong foundation. Focus on consistency and advanced problem-solving techniques';
  } else if (averageScore >= 70) {
    recommendation = 'Good progress. Identify weak areas and practice targeted questions daily';
  } else {
    recommendation = 'Focus on core concepts. Take practice tests and review fundamentals thoroughly';
  }

  return { strengths, improvements, progress, recommendation };
}

// Get student test history (legacy endpoint)
exports.getStudentTestHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    // console.log('Fetching test history for student ID:', studentId);

    // Check both user types
    let student = await LicensedUser.findByPk(studentId);
    if (!student) {
      student = await User.findByPk(studentId);
    }
    
    if (!student) {
      // console.log('Student not found:', studentId);
      return res.json({
        success: true,
        data: []
      });
    }

    const testSessions = await TestSession.findAll({
      where: { 
        studentId: String(studentId)
      },
      attributes: [
        'id', 'testId', 'status', 'totalScore', 'maxScore', 
        'startedAt', 'completedAt', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get test details separately
    const testIds = [...new Set(testSessions.map(session => session.testId))];
    const tests = await Test.findAll({
      where: { testId: testIds },
      attributes: ['testId', 'name', 'description']
    });
    const testMap = tests.reduce((map, test) => {
      map[test.testId] = test;
      return map;
    }, {});

    // console.log(`Found ${testSessions.length} test sessions for student ${studentId}`);

    const formattedHistory = testSessions.map(session => {
      const test = testMap[session.testId];
      return {
        id: session.id,
        sessionId: session.id,
        testId: session.testId,
        testName: test?.name || `Test ${session.testId}`,
        status: session.status,
        totalScore: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        date: session.createdAt,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
        duration: session.completedAt && session.startedAt ? 
          Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / (1000 * 60)) + ' min' : 
          'N/A'
      };
    });

    res.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('Error fetching student test history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history'
    });
  }
};

// Generate and download individual test report as PDF
exports.downloadTestReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const PDFDocument = require('pdfkit');

    // Get test session without associations
    const testSession = await TestSession.findByPk(sessionId, {
      attributes: ['id', 'studentId', 'testId', 'status', 'totalScore', 'maxScore', 'startedAt', 'completedAt']
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    // Get test details separately
    const test = await Test.findByPk(testSession.testId, {
      attributes: ['testId', 'name', 'description']
    });

    // Get student details from both user types
    let student = await User.findByPk(testSession.studentId, {
      attributes: ['name', 'email', 'sinNumber', 'department']
    });
    if (!student) {
      student = await LicensedUser.findByPk(testSession.studentId, {
        attributes: ['name', 'email', 'department']
      });
    }

    const percentage = testSession.maxScore > 0 ? 
      Math.round((testSession.totalScore / testSession.maxScore) * 100) : 0;

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="test-report-${sessionId}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('TEST REPORT', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text('Student Information:', { underline: true });
    doc.fontSize(12)
       .text(`Name: ${student?.name || 'Unknown Student'}`)
       .text(`Email: ${student?.email || 'N/A'}`)
       .text(`SIN Number: ${student?.sinNumber || 'N/A'}`)
       .text(`Department: ${student?.department || 'N/A'}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Test Information:', { underline: true });
    doc.fontSize(12)
       .text(`Test Name: ${test?.name || 'Unknown Test'}`)
       .text(`Test ID: ${test?.testId || testSession.testId}`)
       .text(`Description: ${test?.description || 'N/A'}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Results:', { underline: true });
    doc.fontSize(12)
       .text(`Score: ${testSession.totalScore || 0}/${testSession.maxScore || 100}`)
       .text(`Percentage: ${percentage}%`)
       .text(`Status: ${percentage >= 60 ? 'PASS' : 'FAIL'}`, { 
         color: percentage >= 60 ? 'green' : 'red' 
       });
    
    doc.moveDown();
    doc.fontSize(14).text('Test Duration:', { underline: true });
    doc.fontSize(12)
       .text(`Started: ${testSession.startedAt ? new Date(testSession.startedAt).toLocaleString() : 'N/A'}`)
       .text(`Completed: ${testSession.completedAt ? new Date(testSession.completedAt).toLocaleString() : 'N/A'}`);
    
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    
    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating test report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test report'
    });
  }
};

// Generate overall performance report
exports.downloadOverallReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student details from both user types
    let student = await LicensedUser.findByPk(studentId, {
      attributes: ['name', 'email', 'created_at']
    });
    if (!student) {
      student = await User.findByPk(studentId, {
        attributes: ['name', 'email', 'createdAt']
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all completed test sessions
    const testSessions = await TestSession.findAll({
      where: { 
        studentId: String(studentId),
        status: ['completed', 'submitted']
      },
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name']
      }],
      attributes: [
        'id', 'testId', 'totalScore', 'maxScore', 
        'startedAt', 'completedAt', 'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate overall statistics
    const totalTests = testSessions.length;
    const totalScore = testSessions.reduce((sum, session) => sum + (session.totalScore || 0), 0);
    const totalMaxScore = testSessions.reduce((sum, session) => sum + (session.maxScore || 100), 0);
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    const bestScore = testSessions.length > 0 ? 
      Math.max(...testSessions.map(session => 
        Math.round(((session.totalScore || 0) / (session.maxScore || 100)) * 100)
      )) : 0;

    const reportData = {
      student: {
        name: student.name,
        email: student.email,
        joinDate: student.created_at || student.createdAt
      },
      summary: {
        totalTests,
        averageScore,
        bestScore,
        completionRate: 100
      },
      testHistory: testSessions.map(session => ({
        testName: session.test?.name || 'Unknown Test',
        testId: session.test?.testId || session.testId,
        date: session.createdAt,
        score: session.totalScore || 0,
        maxScore: session.maxScore || 100,
        percentage: session.maxScore > 0 ? 
          Math.round((session.totalScore / session.maxScore) * 100) : 0
      }))
    };

    // Generate overall report file
    const reportText = `
OVERALL PERFORMANCE REPORT
=========================

Student: ${reportData.student.name}
Email: ${reportData.student.email}
Join Date: ${reportData.student.joinDate}

Summary:
--------
Total Tests: ${reportData.summary.totalTests}
Average Score: ${reportData.summary.averageScore}%
Best Score: ${reportData.summary.bestScore}%
Completion Rate: ${reportData.summary.completionRate}%

Test History:
-------------
${reportData.testHistory.map(test => 
  `${test.testName} (${test.testId}) - ${test.percentage}% (${test.date.toISOString().split('T')[0]})`
).join('\n')}

Generated: ${new Date().toISOString()}
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="overall-report-${studentId}.txt"`);
    res.send(reportText);

  } catch (error) {
    console.error('Error generating overall report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overall report'
    });
  }
};