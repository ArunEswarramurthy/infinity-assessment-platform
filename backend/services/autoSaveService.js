const { TestSession, SectionScore, sequelize } = require('../models');
const { Op } = require('sequelize');

class AutoSaveService {
  constructor() {
    this.autoSaveIntervals = new Map(); // sessionId -> interval
    this.autoSaveInterval = 30000; // 30 seconds
    this.maxRetryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Start auto-save for a test session
   * @param {string} sessionId - Test session ID
   * @param {Object} initialData - Initial answer data
   */
  startAutoSave(sessionId, initialData = {}) {
    // Clear any existing interval for this session
    this.stopAutoSave(sessionId);

    // Initial save
    this.saveAnswers(sessionId, initialData).catch(console.error);

    // Set up periodic auto-save
    const interval = setInterval(() => {
      this.saveAnswers(sessionId, initialData).catch(console.error);
    }, this.autoSaveInterval);

    this.autoSaveIntervals.set(sessionId, interval);
    console.log(`Started auto-save for session ${sessionId}`);
  }

  /**
   * Stop auto-save for a test session
   * @param {string} sessionId - Test session ID
   */
  stopAutoSave(sessionId) {
    if (this.autoSaveIntervals.has(sessionId)) {
      clearInterval(this.autoSaveIntervals.get(sessionId));
      this.autoSaveIntervals.delete(sessionId);
      console.log(`Stopped auto-save for session ${sessionId}`);
    }
  }

  /**
   * Save answers for a test session with retry logic
   * @param {string} sessionId - Test session ID
   * @param {Object} answerData - Answer data to save
   * @param {number} [attempt=1] - Current attempt number
   */
  async saveAnswers(sessionId, answerData, attempt = 1) {
    if (!sessionId || !answerData) {
      console.error('Session ID and answer data are required');
      return { success: false, error: 'Invalid parameters' };
    }

    const transaction = await sequelize.transaction();
    
    try {
      // Verify session exists and is still in progress
      const session = await TestSession.findByPk(sessionId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!session) {
        await transaction.rollback();
        return { success: false, error: 'Session not found' };
      }

      if (session.status !== 'in_progress') {
        await transaction.rollback();
        return { success: false, error: 'Test is no longer in progress' };
      }

      // Process section answers
      for (const [sectionId, sectionData] of Object.entries(answerData)) {
        if (!sectionData) continue;

        const { answers, status = 'in_progress' } = sectionData;
        
        // Update or create section score
        await SectionScore.upsert(
          {
            testSessionId: sessionId,
            sectionId,
            answers,
            status,
            startedAt: status === 'in_progress' ? new Date() : undefined,
            submittedAt: status === 'completed' ? new Date() : undefined
          },
          {
            transaction,
            conflictFields: ['testSessionId', 'sectionId']
          }
        );
      }

      // Update session's last saved time
      session.lastSavedAt = new Date();
      await session.save({ transaction });
      
      await transaction.commit();
      
      console.log(`✅ Auto-saved answers for session ${sessionId}`);
      return { success: true };
      
    } catch (error) {
      await transaction.rollback().catch(console.error);
      
      // Retry on transient errors
      if (attempt < this.maxRetryAttempts) {
        console.warn(`Auto-save failed (attempt ${attempt}/${this.maxRetryAttempts}), retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.saveAnswers(sessionId, answerData, attempt + 1);
      }
      
      console.error(`Auto-save failed after ${this.maxRetryAttempts} attempts:`, error);
      return { success: false, error: 'Failed to save answers' };
    }
  }

  /**
   * Clean up all intervals
   */
  cleanup() {
    for (const [sessionId, interval] of this.autoSaveIntervals.entries()) {
      clearInterval(interval);
      console.log(`Cleaned up auto-save for session ${sessionId}`);
    }
    this.autoSaveIntervals.clear();
  }
}

// Create and export singleton instance
const autoSaveService = new AutoSaveService();

// Clean up on process exit
process.on('SIGINT', () => {
  autoSaveService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  autoSaveService.cleanup();
  process.exit(0);
});

module.exports = autoSaveService;
