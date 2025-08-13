const { checkTestDurationAndGenerateReport, getTestCountdown } = require('../utils/testTimerManager');

// Get test countdown timer
exports.getCountdown = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const countdown = await getTestCountdown(testId);
    
    if (countdown.error) {
      return res.status(404).json({
        success: false,
        error: countdown.error
      });
    }

    res.json({
      success: true,
      countdown
    });

  } catch (error) {
    console.error('Error getting countdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get countdown'
    });
  }
};

// Check if reports can be generated
exports.checkReportAvailability = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const result = await checkTestDurationAndGenerateReport(testId);
    
    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error checking report availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check report availability'
    });
  }
};