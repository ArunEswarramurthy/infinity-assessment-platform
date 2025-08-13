const { TestSession, LicensedUser } = require('../models');

/**
 * Middleware to enforce one-time test restriction for licensed users
 * This provides an additional layer of protection beyond controller checks
 * CRITICAL: Licensed users can only take each test ONCE - no exceptions
 */
const enforceOneTimeTestRestriction = async (req, res, next) => {
  try {
    const { testId, studentId } = req.body || req.params;
    
    if (!testId || !studentId) {
      return next(); // Let controller handle missing parameters
    }

    // Check if this is a licensed user
    const licensedUser = await LicensedUser.findByPk(studentId);
    
    if (!licensedUser) {
      console.log(`👤 Regular user ${studentId} accessing test ${testId} - no restrictions`);
      return next(); // Not a licensed user, proceed normally
    }

    // CRITICAL CHECK: Licensed users cannot have ANY existing session
    const existingSession = await TestSession.findOne({
      where: { testId, studentId }
    });

    if (existingSession) {
      const timestamp = new Date().toISOString();
      console.log(`🚫 [${timestamp}] MIDDLEWARE BLOCK - Licensed user ${licensedUser.name} (${studentId}) attempted to access test ${testId}`);
      console.log(`   Existing session: ${existingSession.status} (created: ${existingSession.createdAt})`);
      
      return res.status(403).json({
        success: false,
        error: 'RESTRICTED: Licensed users can only take each test ONCE. You already have a session for this test.',
        restrictionType: 'ONE_TIME_ONLY',
        isLicensedUser: true,
        licensedUserName: licensedUser.name,
        sessionExists: true,
        sessionStatus: existingSession.status,
        sessionCreated: existingSession.createdAt,
        sessionCompleted: existingSession.completedAt,
        middleware: 'oneTimeTestRestriction',
        timestamp
      });
    }

    // Licensed user with no existing session - allow to proceed
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] MIDDLEWARE PASS - Licensed user ${licensedUser.name} (${studentId}) can proceed with test ${testId}`);
    next();

  } catch (error) {
    console.error('One-time test restriction middleware error:', error);
    // Don't block on middleware errors, let controller handle
    next();
  }
};

/**
 * Middleware specifically for test session creation endpoints
 */
const enforceTestSessionRestriction = async (req, res, next) => {
  try {
    const { testId, studentId } = req.body;
    
    if (!testId || !studentId) {
      return next();
    }

    // Check if licensed user
    const licensedUser = await LicensedUser.findByPk(studentId);
    
    if (licensedUser) {
      // Double-check for any existing session
      const sessionCount = await TestSession.count({
        where: { testId, studentId }
      });

      if (sessionCount > 0) {
        console.log(`🚫 SESSION CREATION BLOCKED - Licensed user ${studentId} already has session for test ${testId}`);
        
        return res.status(403).json({
          success: false,
          error: 'Session creation denied. Licensed users can only create one session per test.',
          restrictionType: 'SESSION_CREATION_DENIED',
          isLicensedUser: true,
          existingSessionCount: sessionCount
        });
      }
    }

    next();
  } catch (error) {
    console.error('Test session restriction middleware error:', error);
    next();
  }
};

module.exports = {
  enforceOneTimeTestRestriction,
  enforceTestSessionRestriction
};