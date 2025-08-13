const { Test, TestAssignment, TestSession, User, LicensedUser, Section, SectionScore, sequelize } = require('../models');
const { Op } = require('sequelize');
const testTimeoutService = require('../services/testTimeoutService');

// Start a test with all restrictions enforced
exports.startTest = async (req, res) => {
  try {
    const { testId, studentId } = req.body;

    if (!testId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Test ID and Student ID are required'
      });
    }

    // Get student details - check both tables
    let student = await User.findByPk(studentId);
    let isLicensedUser = false;
    
    if (!student) {
      student = await LicensedUser.findByPk(studentId);
      isLicensedUser = true;
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get test assignment
    const assignment = await TestAssignment.findOne({
      where: {
        [Op.and]: [
          { testId },
          {
            [Op.or]: [
              { departmentCode: student.department },
              { departmentCode: 'ALL' }
            ]
          }
        ]
      },
      include: [{
        model: Test,
        as: 'test'
      }]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Test not assigned to your department'
      });
    }

    // CRITICAL: Check one-time restriction for licensed users
    if (isLicensedUser) {
      const existingSession = await TestSession.findOne({
        where: { testId, studentId }
      });

      if (existingSession) {
        return res.status(403).json({
          success: false,
          error: 'Licensed users can only take each test once. You already have a session for this test.',
          restrictionType: 'ONE_TIME_ONLY',
          isLicensedUser: true,
          sessionStatus: existingSession.status,
          sessionCreated: existingSession.createdAt
        });
      }
    }

    // Check time restrictions
    const now = new Date();
    const testDateTime = new Date(`${assignment.testDate}T${assignment.startTime}`);
    const startWindowEnd = new Date(testDateTime.getTime() + (15 * 60000)); // 15-minute window
    const windowEndTime = new Date(testDateTime.getTime() + (assignment.windowTime * 60000));

    // Check if test hasn't started yet
    if (now < testDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Test has not started yet',
        testStartTime: testDateTime.toISOString(),
        timeUntilStart: Math.ceil((testDateTime - now) / 60000)
      });
    }

    // Check if 15-minute start window has expired
    if (now > startWindowEnd) {
      return res.status(400).json({
        success: false,
        error: 'Start window expired. You can only start the test within 15 minutes of the start time.',
        restrictionType: 'START_WINDOW_EXPIRED',
        testStartTime: testDateTime.toISOString(),
        startWindowEnd: startWindowEnd.toISOString(),
        minutesLate: Math.ceil((now - startWindowEnd) / 60000)
      });
    }

    // Check if overall test window has expired
    if (now > windowEndTime) {
      return res.status(400).json({
        success: false,
        error: 'Test window has expired',
        restrictionType: 'TEST_EXPIRED',
        windowEndTime: windowEndTime.toISOString()
      });
    }

    // Check for existing sessions (for regular users)
    if (!isLicensedUser) {
      const existingSession = await TestSession.findOne({
        where: { testId, studentId }
      });

      if (existingSession) {
        if (existingSession.status === 'completed') {
          return res.status(400).json({
            success: false,
            error: 'Test already completed',
            sessionStatus: existingSession.status
          });
        } else if (existingSession.status === 'in_progress') {
          return res.json({
            success: true,
            message: 'Resuming existing test session',
            sessionId: existingSession.id,
            isResuming: true
          });
        }
      }
    }

    // Use transaction to ensure all operations complete successfully
    const transaction = await sequelize.transaction();
    
    try {
      // Create new test session
      const testSession = await TestSession.create({
        testId,
        studentId,
        status: 'in_progress',
        startedAt: now,
        maxScore: 0, // Will be calculated from sections
        totalScore: 0
      }, { transaction });

      console.log(`✅ Test session created: ${testSession.id} for ${isLicensedUser ? 'licensed' : 'regular'} user ${studentId}`);

      // Get all sections for this test (order by id for deterministic order)
      const sections = await Section.findAll({
      where: { testId },
      order: [['id', 'ASC']],
      transaction
      });
      
      // Initialize section scores with accurate maxMarks
      let totalMaxScore = 0;
      const sectionScores = [];
      
      for (const section of sections) {
      // MCQ part: number of MCQs * correctMarks for the section
      const mcqCount = await sequelize.models.MCQ.count({
      where: { sectionId: section.id },
      transaction
      });
      const mcqMax = mcqCount * (parseFloat(section.correctMarks) || 1);
      
      // Coding part: sum of CodingQuestion.marks
      const codingQs = await sequelize.models.CodingQuestion.findAll({
      where: { sectionId: section.id },
      attributes: ['marks'],
      transaction
      });
      const codingMax = codingQs.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
      
      const maxMarks = mcqMax + codingMax;
      totalMaxScore += maxMarks;
      
      sectionScores.push({
      testSessionId: testSession.id,
      sectionId: section.id,
      maxMarks,
      marksObtained: 0,
      status: 'not_started',
      startedAt: null,
      submittedAt: null
      });
      }
      
      await SectionScore.bulkCreate(sectionScores, { transaction });
      
      // Update test session with calculated max score
      testSession.maxScore = totalMaxScore;
      await testSession.save({ transaction });

      // Commit the transaction
      await transaction.commit();

      console.log(`✅ Initialized ${sectionScores.length} section scores for test session ${testSession.id}`);
      
      // Schedule auto-submit timeout
      try {
        // Reload session with associated test and its sections for timeout computation
        const sessionWithTest = await TestSession.findByPk(testSession.id, {
          include: [
            {
              model: sequelize.models.Test,
              as: 'test',
              include: [
                { model: Section, attributes: ['id', 'duration'] }
              ]
            }
          ]
        });

        if (sessionWithTest) {
          await testTimeoutService.scheduleSessionTimeout(sessionWithTest);
          console.log(`✅ Scheduled timeout for test session ${testSession.id}`);
        }
      } catch (error) {
        console.error('Error scheduling test timeout:', error);
        // Don't fail the request, just log the error
      }

      res.json({
        success: true,
        message: 'Test started successfully',
        sessionId: testSession.id,
        testName: assignment.test.name,
        isLicensedUser,
        startedAt: testSession.startedAt,
        timeRemaining: Math.ceil((windowEndTime - now) / 1000), // Return in seconds
        maxScore: totalMaxScore,
        sectionCount: sectionScores.length
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error; // Let the outer catch handle it
    }

  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start test'
    });
  }
};