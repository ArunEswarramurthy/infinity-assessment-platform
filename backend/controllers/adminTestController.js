const { Test, TestAssignment, TestSession, SectionSubmission, User, LicensedUser, Section, MCQ, CodingQuestion, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create test with sections and assign to students
exports.createAndAssignTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      testName,
      description,
      instructions,
      sections = [],
      schedule: {
        testDate,
        startTime,
        duration = 180
      },
      assignment: {
        studentIds = [],
        departments = [],
        assignToAll = false
      }
    } = req.body;

    console.log(`🎯 Creating and assigning test: ${testName}`);

    // Generate unique test ID
    const testId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create test
    const test = await Test.create({
      testId,
      name: testName,
      description,
      instructions,
      testDate,
      startTime,
      windowTime: duration,
      status: 'scheduled'
    }, { transaction });

    console.log(`✅ Test created with ID: ${testId}`);

    // Create sections if provided
    let totalMaxScore = 0;
    for (let i = 0; i < sections.length; i++) {
      const sectionData = sections[i];
      const section = await Section.create({
        testId,
        name: sectionData.name || `Section ${i + 1}`,
        type: sectionData.type || 'MCQ',
        duration: sectionData.duration || 60,
        instructions: sectionData.instructions,
        correctMarks: sectionData.correctMarks || 1,
        wrongMarks: sectionData.wrongMarks || 0
      }, { transaction });

      // Add questions to section (if provided)
      if (sectionData.questions && sectionData.questions.length > 0) {
        for (const questionData of sectionData.questions) {
          if (sectionData.type === 'MCQ') {
            await MCQ.create({
              sectionId: section.id,
              question: questionData.question,
              optionA: questionData.optionA,
              optionB: questionData.optionB,
              optionC: questionData.optionC,
              optionD: questionData.optionD,
              correctOptionLetter: questionData.correctAnswer,
              explanation: questionData.explanation
            }, { transaction });
            totalMaxScore += section.correctMarks;
          } else if (sectionData.type === 'CODING') {
            await CodingQuestion.create({
              sectionId: section.id,
              title: questionData.title,
              description: questionData.description,
              inputFormat: questionData.inputFormat,
              outputFormat: questionData.outputFormat,
              constraints: questionData.constraints,
              sampleInput: questionData.sampleInput,
              sampleOutput: questionData.sampleOutput,
              marks: questionData.marks || 10,
              timeLimit: questionData.timeLimit || 2000,
              memoryLimit: questionData.memoryLimit || 256
            }, { transaction });
            totalMaxScore += questionData.marks || 10;
          }
        }
      }
    }

    // Assign test to students
    let assignedCount = 0;
    const assignedStudents = [];

    // Assign to specific students
    if (studentIds.length > 0) {
      for (const studentId of studentIds) {
        await TestAssignment.create({
          testId,
          studentId,
          testDate,
          startTime,
          windowTime: duration,
          assignedAt: new Date()
        }, { transaction });
        assignedStudents.push(studentId);
      }
      assignedCount += studentIds.length;
    }

    // Assign to departments
    if (departments.length > 0) {
      const deptStudents = await LicensedUser.findAll({
        where: { department: departments },
        attributes: ['id']
      });
      
      for (const student of deptStudents) {
        await TestAssignment.create({
          testId,
          studentId: student.id,
          testDate,
          startTime,
          windowTime: duration,
          assignedAt: new Date()
        }, { transaction });
        assignedStudents.push(student.id);
      }
      assignedCount += deptStudents.length;
    }

    // Assign to all students
    if (assignToAll) {
      const allUsers = await User.findAll({ attributes: ['id'] });
      const allLicensedUsers = await LicensedUser.findAll({ attributes: ['id'] });
      
      const allStudentIds = [
        ...allUsers.map(u => u.id),
        ...allLicensedUsers.map(u => u.id)
      ];

      for (const studentId of allStudentIds) {
        if (!assignedStudents.includes(studentId)) {
          await TestAssignment.create({
            testId,
            studentId,
            testDate,
            startTime,
            windowTime: duration,
            assignedAt: new Date()
          }, { transaction });
          assignedStudents.push(studentId);
        }
      }
      assignedCount = assignedStudents.length;
    }

    await transaction.commit();

    console.log(`🎉 Test created and assigned successfully to ${assignedCount} students`);

    res.json({
      success: true,
      message: `Test "${testName}" created and assigned to ${assignedCount} students`,
      test: {
        testId,
        name: testName,
        sectionsCount: sections.length,
        totalMaxScore,
        assignedCount,
        schedule: {
          testDate,
          startTime,
          duration
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating and assigning test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create and assign test',
      details: error.message
    });
  }
};

// Get test overview for admin
exports.getTestOverview = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({
      where: { testId },
      include: [
        {
          model: Section,
          include: [
            { model: MCQ },
            { model: CodingQuestion, as: 'codingQuestions' }
          ]
        }
      ]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Get assignment statistics
    const totalAssigned = await TestAssignment.count({
      where: { testId }
    });

    const completedSessions = await TestSession.count({
      where: { 
        testId,
        status: 'completed'
      }
    });

    const inProgressSessions = await TestSession.count({
      where: { 
        testId,
        status: ['in_progress', 'on_break']
      }
    });

    // Get average score
    const sessions = await TestSession.findAll({
      where: { 
        testId,
        status: 'completed'
      },
      attributes: ['totalScore', 'maxScore']
    });

    const averageScore = sessions.length > 0 ? 
      Math.round(sessions.reduce((sum, s) => sum + (s.totalScore / s.maxScore * 100), 0) / sessions.length) : 0;

    res.json({
      success: true,
      test: {
        testId: test.testId,
        name: test.name,
        description: test.description,
        status: test.status,
        createdAt: test.createdAt,
        schedule: {
          testDate: test.testDate,
          startTime: test.startTime,
          windowTime: test.windowTime
        },
        sections: test.Sections.map(section => ({
          id: section.id,
          name: section.name,
          type: section.type,
          duration: section.duration,
          questionsCount: section.MCQs.length + (section.codingQuestions || []).length
        })),
        statistics: {
          totalAssigned,
          completedSessions,
          inProgressSessions,
          pendingSessions: totalAssigned - completedSessions - inProgressSessions,
          completionRate: totalAssigned > 0 ? Math.round((completedSessions / totalAssigned) * 100) : 0,
          averageScore
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting test overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get test overview'
    });
  }
};

// Auto-generate reports when test ends
exports.autoGenerateReports = async (req, res) => {
  try {
    console.log('🔄 Running auto-report generation...');

    const now = new Date();
    
    // Find tests that have ended but are still marked as scheduled
    const endedTests = await Test.findAll({
      where: {
        status: 'scheduled',
        [Op.and]: [
          sequelize.where(
            sequelize.fn('ADDTIME',
              sequelize.fn('CONCAT', 
                sequelize.col('testDate'), 
                ' ', 
                sequelize.col('startTime')
              ),
              sequelize.fn('SEC_TO_TIME', 
                sequelize.literal('windowTime * 60')
              )
            ),
            Op.lt,
            now
          )
        ]
      }
    });

    let processedTests = 0;

    for (const test of endedTests) {
      // Check if test has any completed sessions
      const completedCount = await TestSession.count({
        where: {
          testId: test.testId,
          status: 'completed'
        }
      });

      if (completedCount > 0) {
        // Mark test as completed
        await Test.update({
          status: 'completed'
        }, {
          where: { testId: test.testId }
        });

        console.log(`📊 Test ${test.testId} marked as completed with ${completedCount} submissions`);
        processedTests++;
      }
    }

    res.json({
      success: true,
      message: `Auto-report generation completed. ${processedTests} tests processed.`,
      processedTests
    });

  } catch (error) {
    console.error('❌ Error in auto-report generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate auto-reports'
    });
  }
};

// Get live test monitoring data
exports.getLiveTestMonitoring = async (req, res) => {
  try {
    // Get active test sessions
    const activeSessions = await TestSession.findAll({
      where: {
        status: ['in_progress', 'on_break']
      },
      include: [
        {
          model: Test,
          as: 'test',
          attributes: ['testId', 'name']
        }
      ],
      order: [['startedAt', 'DESC']]
    });

    // Get recently completed sessions (last 2 hours)
    const recentlyCompleted = await TestSession.findAll({
      where: {
        status: 'completed',
        completedAt: {
          [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      },
      include: [
        {
          model: Test,
          as: 'test',
          attributes: ['testId', 'name']
        }
      ],
      order: [['completedAt', 'DESC']],
      limit: 20
    });

    // Get student details for active sessions
    const activeSessionsWithStudents = await Promise.all(
      activeSessions.map(async (session) => {
        let student = await LicensedUser.findByPk(session.studentId, {
          attributes: ['name', 'email', 'department']
        });
        
        if (!student) {
          student = await User.findByPk(session.studentId, {
            attributes: ['name', 'email', 'department']
          });
        }

        return {
          sessionId: session.id,
          testId: session.testId,
          testName: session.test?.name || 'Unknown Test',
          studentId: session.studentId,
          studentName: student?.name || 'Unknown Student',
          studentEmail: student?.email || 'N/A',
          department: student?.department || 'N/A',
          status: session.status,
          currentSection: session.currentSectionIndex + 1,
          startedAt: session.startedAt,
          breakEndTime: session.breakEndTime
        };
      })
    );

    res.json({
      success: true,
      data: {
        activeSessions: activeSessionsWithStudents,
        recentlyCompleted: recentlyCompleted.map(session => ({
          sessionId: session.id,
          testId: session.testId,
          testName: session.test?.name || 'Unknown Test',
          studentId: session.studentId,
          score: session.totalScore,
          maxScore: session.maxScore,
          percentage: Math.round((session.totalScore / session.maxScore) * 100),
          completedAt: session.completedAt
        })),
        summary: {
          activeCount: activeSessions.length,
          inProgressCount: activeSessions.filter(s => s.status === 'in_progress').length,
          onBreakCount: activeSessions.filter(s => s.status === 'on_break').length,
          recentlyCompletedCount: recentlyCompleted.length
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting live test monitoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get live test monitoring data'
    });
  }
};

module.exports = exports;