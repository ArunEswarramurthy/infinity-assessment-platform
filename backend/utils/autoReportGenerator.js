const { Test, TestSession, User, LicensedUser } = require('../models');
const reportGenerationService = require('../services/reportGenerationService');
const { sanitizeForLog } = require('./security');

// Auto-generate report when test is completed
exports.generateReportOnCompletion = async (testSessionId) => {
  try {
    console.log(`📊 Auto-generating report for session: ${sanitizeForLog(testSessionId)}`);

    const session = await TestSession.findByPk(testSessionId, {
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name']
      }]
    });

    if (!session || session.status !== 'completed') {
      console.log('❌ Session not found or not completed');
      return;
    }

    // Get student details
    let student = await User.findByPk(session.studentId);
    if (!student) {
      student = await LicensedUser.findByPk(session.studentId);
    }

    const reportData = {
      sessionId: session.id,
      testId: session.testId,
      testName: session.test?.name || 'Unknown Test',
      studentId: session.studentId,
      studentName: student?.name || 'Unknown Student',
      score: session.totalScore || 0,
      maxScore: session.maxScore || 100,
      percentage: session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0,
      completedAt: session.completedAt,
      generatedAt: new Date()
    };

    console.log(`✅ Report auto-generated for ${sanitizeForLog(reportData.studentName)} - ${sanitizeForLog(reportData.testName)}: ${reportData.percentage}%`);
    
    // Trigger comprehensive report generation for admin
    try {
      await reportGenerationService.triggerReportGeneration(session.testId, session.studentId);
      console.log(`📋 Admin reports generated for test: ${sanitizeForLog(session.testId)}`);
    } catch (reportError) {
      console.error('❌ Error generating admin reports:', sanitizeForLog(reportError.message));
    }
    
    // Trigger student reports refresh
    console.log(`🔄 Triggering student reports refresh for student: ${sanitizeForLog(session.studentId)}`);
    
    return reportData;

  } catch (error) {
    console.error('❌ Error auto-generating report:', error);
    return null;
  }
};