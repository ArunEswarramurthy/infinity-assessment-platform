const { TestSession, Section, SectionScore, sequelize } = require('../models');
const { Op } = require('sequelize');
const { generateReportOnCompletion } = require('../utils/autoReportGenerator');
const { autoSubmitTest } = require('../controllers/testCompletionController');

class TestTimeoutService {
  constructor() {
    this.timeouts = new Map(); // sessionId -> timeout
    this.isInitialized = false;
  }

  /**
   * Initialize the service by loading all in-progress tests
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Find all in-progress test sessions
      const inProgressSessions = await TestSession.findAll({
        where: {
          status: 'in_progress',
          startedAt: { [Op.ne]: null }
        },
        include: [
          {
            model: sequelize.models.Test,
            as: 'test',
            include: [
              {
                model: Section,
                attributes: ['id', 'duration']
              }
            ]
          }
        ]
      });

      console.log(`Found ${inProgressSessions.length} in-progress test sessions`);

      // Schedule timeouts for each session
      for (const session of inProgressSessions) {
        await this.scheduleSessionTimeout(session);
      }

      this.isInitialized = true;
      console.log('Test timeout service initialized');
    } catch (error) {
      console.error('Error initializing test timeout service:', error);
      // Retry after delay
      setTimeout(() => this.initialize(), 10000);
    }
  }

  /**
   * Schedule a timeout for a test session
   * @param {Object} session - TestSession instance
   */
  async scheduleSessionTimeout(session) {
    try {
      const now = new Date();
      const sessionStartTime = new Date(session.startedAt);
      
      // Get test duration from sections (sum of all section durations)
      const sections = session.test?.Sections || [];
      const totalDuration = sections.reduce(
        (total, section) => total + (parseInt(section.duration) || 0), 0
      );
      
      const endTime = new Date(sessionStartTime.getTime() + totalDuration * 60 * 1000);
      const timeRemaining = Math.max(0, endTime - now);
      
      // Clear any existing timeout for this session
      this.clearSessionTimeout(session.id);

      if (timeRemaining <= 0) {
        // Test has already expired, submit it
        console.log(`Test session ${session.id} has already expired, auto-submitting...`);
        await this.handleTestTimeout(session.id);
      } else {
        // Schedule timeout
        console.log(`Scheduling timeout for session ${session.id} in ${Math.ceil(timeRemaining / 1000)} seconds`);
        
        const timeout = setTimeout(
          () => this.handleTestTimeout(session.id),
          timeRemaining
        );
        
        this.timeouts.set(session.id, timeout);
      }
    } catch (error) {
      console.error(`Error scheduling timeout for session ${session.id}:`, error);
    }
  }

  /**
   * Handle test timeout
   * @param {string} sessionId - Test session ID
   */
  async handleTestTimeout(sessionId) {
    try {
      console.log(`Handling timeout for test session ${sessionId}`);
      
      // Auto-submit the test
      const result = await autoSubmitTest(sessionId);
      
      if (result.success) {
        console.log(`Successfully auto-submitted test session ${sessionId}`);
      } else {
        console.error(`Failed to auto-submit test session ${sessionId}:`, result.error);
      }
      
      // Clean up
      this.timeouts.delete(sessionId);
    } catch (error) {
      console.error(`Error in handleTestTimeout for session ${sessionId}:`, error);
    }
  }

  /**
   * Clear timeout for a session
   * @param {string} sessionId - Test session ID
   */
  clearSessionTimeout(sessionId) {
    if (this.timeouts.has(sessionId)) {
      clearTimeout(this.timeouts.get(sessionId));
      this.timeouts.delete(sessionId);
    }
  }

  /**
   * Stop all timeouts
   */
  stop() {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();
    this.isInitialized = false;
  }
}

// Create and export singleton instance
const testTimeoutService = new TestTimeoutService();

// Initialize on startup
if (process.env.NODE_ENV !== 'test') {
  testTimeoutService.initialize().catch(console.error);
}

module.exports = testTimeoutService;
