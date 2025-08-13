const { TestSession, SectionScore, sequelize, Section } = require('../models');
const reportGenerationService = require('../services/reportGenerationService');
const { Op } = require('sequelize');

/**
 * Complete a test and calculate section-wise scores
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.sessionId - Test session ID
 * @param {Array} [req.body.sectionScores] - Array of section scores
 * @param {Object} [req.body.answers] - Student's answers (for future reference)
 */
exports.completeTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { sessionId, sectionScores = [], answers = {} } = req.body;

    if (!sessionId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Get test session with lock to prevent concurrent updates
    const session = await TestSession.findByPk(sessionId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    // Prevent multiple submissions
    if (session.status === 'completed' || session.status === 'submitted') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Test has already been submitted',
        status: session.status
      });
    }

    // Get all sections for this test
    const sections = await Section.findAll({
      where: { testId: session.testId },
      transaction
    });

    let totalScore = 0;
    const sectionResults = [];
    const now = new Date();

    // Update section scores
    for (const section of sections) {
      const sectionScore = sectionScores.find(ss => ss.sectionId === section.id);
      
      if (sectionScore) {
        const marksObtained = parseFloat(sectionScore.marksObtained) || 0;
        totalScore += marksObtained;
        
        await SectionScore.update(
          {
            marksObtained,
            status: 'completed',
            submittedAt: now,
            answers: answers[section.id] || null,
            resultJson: sectionScore.resultJson || null
          },
          {
            where: {
              testSessionId: sessionId,
              sectionId: section.id
            },
            transaction
          }
        );
        
        sectionResults.push({
          sectionId: section.id,
          sectionName: section.name,
          marksObtained,
          maxMarks: section.maxMarks || 0
        });
      }
    }

    // Update test session
    await session.update(
      {
        status: 'completed',
        totalScore,
        completedAt: now
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    console.log(`✅ Test session ${sessionId} completed with score ${totalScore}`);

    // Generate report automatically (async, don't wait for it)
    reportGenerationService.triggerReportGeneration(session.testId, session.studentId).catch(err => {
      console.error('Error generating report:', err);
    });

    res.json({
      success: true,
      message: 'Test submitted successfully',
      sessionId,
      totalScore,
      sectionResults,
      submittedAt: now.toISOString()
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback().catch(rollbackError => {
      console.error('Error rolling back transaction:', rollbackError);
    });
    
    console.error('Error completing test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete test',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Auto-submit test when time expires
 * @param {string} sessionId - Test session ID
 */
exports.autoSubmitTest = async (sessionId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Get test session with lock
    const session = await TestSession.findByPk(sessionId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!session || session.status !== 'in_progress') {
      await transaction.rollback();
      return { success: false, error: 'Invalid session or already submitted' };
    }

    // Get all sections for this test
    const sectionScores = await SectionScore.findAll({
      where: { testSessionId: sessionId },
      transaction
    });

    // Calculate total score from completed sections
    let totalScore = 0;
    for (const score of sectionScores) {
      if (score.status === 'completed') {
        totalScore += parseFloat(score.marksObtained) || 0;
      }
    }

    // Update session
    await session.update(
      {
        status: 'auto-submitted',
        totalScore,
        completedAt: new Date()
      },
      { transaction }
    );

    await transaction.commit();
    console.log(`✅ Auto-submitted test session ${sessionId} with score ${totalScore}`);

    // Generate report automatically (async)
    reportGenerationService.triggerReportGeneration(session.testId, session.studentId).catch(err => {
      console.error('Error generating report after auto-submit:', err);
    });

    return { success: true, totalScore };
  } catch (error) {
    await transaction.rollback().catch(rollbackError => {
      console.error('Error rolling back auto-submit transaction:', rollbackError);
    });
    
    console.error('Error in auto-submit:', error);
    return { success: false, error: error.message };
  }
};