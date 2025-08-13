const { Test, TestAssignment, Section } = require('../models');
const { generateReportOnCompletion } = require('./autoReportGenerator');

// Helper to compute total test duration from sections
async function getTotalTestDurationMinutes(testId) {
  const test = await Test.findByPk(testId, {
    include: [{ model: Section, attributes: ['duration'] }]
  });
  if (!test) return null;
  const total = (test.Sections || []).reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
  return total;
}

// Check if test duration is complete and generate report
exports.checkTestDurationAndGenerateReport = async (testId) => {
  try {
    console.log(`⏰ Checking test duration for: ${testId}`);

    // Get test assignment (for date/time window)
    const assignment = await TestAssignment.findOne({
      where: { testId },
      include: [{
        model: Test,
        as: 'test'
      }]
    });

    if (!assignment) {
      console.log('❌ Test assignment not found');
      return { canGenerateReport: false, reason: 'Test assignment not found' };
    }

    // Compute duration from section sum
    const totalDuration = await getTotalTestDurationMinutes(testId);
    if (totalDuration == null) {
      console.log('❌ Test not found when computing duration');
      return { canGenerateReport: false, reason: 'Test not found' };
    }

    const now = new Date();
    const testStartTime = new Date(`${assignment.testDate}T${assignment.startTime}`);
    const testEndTime = new Date(testStartTime.getTime() + (totalDuration * 60000));

    const timeElapsed = Math.floor((now - testStartTime) / 60000); // minutes elapsed
    const timeRemaining = Math.max(0, Math.floor((testEndTime - now) / 60000)); // minutes remaining

    console.log(`📊 Test: ${assignment.test?.name}`);
    console.log(`⏱️  Duration: ${totalDuration} minutes`);
    console.log(`🕐 Started: ${testStartTime.toLocaleString()}`);
    console.log(`🕐 Ends: ${testEndTime.toLocaleString()}`);
    console.log(`⏰ Time elapsed: ${timeElapsed} minutes`);
    console.log(`⏰ Time remaining: ${timeRemaining} minutes`);

    if (now >= testEndTime) {
      console.log('✅ Test duration complete - reports can be generated');
      return {
        canGenerateReport: true,
        testCompleted: true,
        timeElapsed,
        testEndTime,
        message: 'Test duration completed - reports available'
      };
    } else {
      console.log('⏳ Test still in progress - reports not yet available');
      return {
        canGenerateReport: false,
        testInProgress: true,
        timeRemaining,
        testEndTime,
        message: `Test in progress - reports available in ${timeRemaining} minutes`
      };
    }

  } catch (error) {
    console.error('❌ Error checking test duration:', error);
    return { canGenerateReport: false, reason: 'Error checking test duration' };
  }
};

// Get countdown timer for test
exports.getTestCountdown = async (testId) => {
  try {
    const assignment = await TestAssignment.findOne({
      where: { testId },
      include: [{
        model: Test,
        as: 'test'
      }]
    });

    if (!assignment) {
      return { error: 'Test not found' };
    }

    const totalDuration = await getTotalTestDurationMinutes(testId);
    if (totalDuration == null) {
      return { error: 'Test not found' };
    }

    const now = new Date();
    const testStartTime = new Date(`${assignment.testDate}T${assignment.startTime}`);
    const testEndTime = new Date(testStartTime.getTime() + (totalDuration * 60000));

    const timeRemaining = Math.max(0, Math.floor((testEndTime - now) / 1000)); // seconds remaining
    const minutesRemaining = Math.floor(timeRemaining / 60);
    const secondsRemaining = timeRemaining % 60;

    return {
      testName: assignment.test?.name,
      duration: totalDuration,
      testStartTime,
      testEndTime,
      timeRemaining: timeRemaining,
      minutesRemaining,
      secondsRemaining,
      isCompleted: timeRemaining <= 0,
      formattedTime: `${minutesRemaining}:${secondsRemaining.toString().padStart(2, '0')}`
    };

  } catch (error) {
    console.error('❌ Error getting countdown:', error);
    return { error: 'Failed to get countdown' };
  }
};