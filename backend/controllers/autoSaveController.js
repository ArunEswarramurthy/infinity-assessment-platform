const autoSaveService = require('../services/autoSaveService');
const { TestSession, SectionScore } = require('../models');
const { Op } = require('sequelize');

// Save test answers
async function saveAnswers(req, res) {
  try {
    const { sessionId, answers = {}, currentSectionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = await TestSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Cannot save answers for a completed test'
      });
    }

    const saveData = { ...answers };
    if (currentSectionId) {
      saveData[currentSectionId] = {
        ...(saveData[currentSectionId] || {}),
        status: 'in_progress',
        lastActivity: new Date()
      };
    }

    const result = await autoSaveService.saveAnswers(sessionId, saveData);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to save answers'
      });
    }

    res.json({
      success: true,
      message: 'Answers saved successfully',
      savedAt: new Date()
    });
  } catch (error) {
    console.error('Error in saveAnswers:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while saving answers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Start auto-save for a test session
function startAutoSave(req, res) {
  try {
    const { sessionId, initialData = {} } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    autoSaveService.startAutoSave(sessionId, initialData);
    
    res.json({
      success: true,
      message: 'Auto-save started',
      interval: autoSaveService.autoSaveInterval
    });
  } catch (error) {
    console.error('Error in startAutoSave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start auto-save'
    });
  }
}

// Stop auto-save for a test session
function stopAutoSave(req, res) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    autoSaveService.stopAutoSave(sessionId);
    
    res.json({
      success: true,
      message: 'Auto-save stopped'
    });
  } catch (error) {
    console.error('Error in stopAutoSave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop auto-save'
    });
  }
}

// Get the last saved state for a test session
async function getLastSavedState(req, res) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = await TestSession.findByPk(sessionId, {
      include: [
        {
          model: SectionScore,
          as: 'sectionScores',
          attributes: ['sectionId', 'answers', 'status', 'startedAt', 'submittedAt']
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    const response = {
      sessionId: session.id,
      status: session.status,
      lastSavedAt: session.lastSavedAt,
      answers: {},
      sectionStatus: {}
    };

    for (const score of session.sectionScores || []) {
      response.answers[score.sectionId] = score.answers || {};
      response.sectionStatus[score.sectionId] = {
        status: score.status || 'not_started',
        startedAt: score.startedAt,
        submittedAt: score.submittedAt
      };
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in getLastSavedState:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve saved state',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export the controller functions
module.exports = {
  saveAnswers,
  startAutoSave,
  stopAutoSave,
  getLastSavedState
};
