const { TestSession, Test, User, LicensedUser } = require('../models');

// Download detailed report by session ID
exports.downloadDetailedReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const testSession = await TestSession.findByPk(sessionId);
    if (!testSession) {
      return res.status(404).json({ success: false, error: 'Test session not found' });
    }

    const test = await Test.findByPk(testSession.testId);
    let student = await User.findByPk(testSession.studentId);
    if (!student) {
      student = await LicensedUser.findByPk(testSession.studentId);
    }

    const percentage = testSession.maxScore > 0 ? 
      Math.round((testSession.totalScore / testSession.maxScore) * 100) : 0;

    const reportText = `DETAILED TEST REPORT
====================

Student: ${student?.name || 'Unknown'}
Test: ${test?.name || 'Unknown Test'}
Score: ${testSession.totalScore || 0}/${testSession.maxScore || 100} (${percentage}%)
Status: ${percentage >= 60 ? 'PASS' : 'FAIL'}

Generated: ${new Date().toLocaleString()}`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="detailed-report-${sessionId}.txt"`);
    res.send(reportText);

  } catch (error) {
    console.error('Error downloading detailed report:', error);
    res.status(500).json({ success: false, error: 'Failed to download detailed report' });
  }
};

// Download assessment report by session ID
exports.downloadAssessmentReportBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const testSession = await TestSession.findByPk(sessionId);
    if (!testSession) {
      return res.status(404).json({ success: false, error: 'Test session not found' });
    }

    const test = await Test.findByPk(testSession.testId);
    let student = await User.findByPk(testSession.studentId);
    if (!student) {
      student = await LicensedUser.findByPk(testSession.studentId);
    }

    const percentage = testSession.maxScore > 0 ? 
      Math.round((testSession.totalScore / testSession.maxScore) * 100) : 0;

    const reportText = `ASSESSMENT REPORT
=================

Student: ${student?.name || 'Unknown'}
Test: ${test?.name || 'Unknown Test'}
Score: ${testSession.totalScore || 0}/${testSession.maxScore || 100} (${percentage}%)
Status: ${percentage >= 60 ? 'PASS' : 'FAIL'}

Generated: ${new Date().toLocaleString()}`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="assessment-report-${sessionId}.txt"`);
    res.send(reportText);

  } catch (error) {
    console.error('Error downloading assessment report:', error);
    res.status(500).json({ success: false, error: 'Failed to download assessment report' });
  }
};