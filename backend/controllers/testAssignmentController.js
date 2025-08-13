const { Test, TestAssignment, TestSession, User, LicensedUser, Section, sequelize } = require('../models');
const { Op } = require('sequelize');

// Assign test to students with schedule
exports.assignTestToStudents = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { testId } = req.params;
    const { 
      studentIds = [], 
      departments = [], 
      testDate, 
      startTime, 
      windowTime = 180,
      assignToAll = false 
    } = req.body;

    console.log(`📋 Assigning test ${testId} to students/departments`);

    // Validate test exists
    const test = await Test.findByPk(testId);
    if (!test) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Update test with schedule
    await Test.update({
      testDate,
      startTime,
      windowTime,
      status: 'scheduled'
    }, {
      where: { testId },
      transaction
    });

    let assignedCount = 0;
    let assignedStudents = [];

    // Assign to specific students
    if (studentIds.length > 0) {
      const assignments = studentIds.map(studentId => ({
        testId,
        studentId,
        testDate,
        startTime,
        windowTime,
        assignedAt: new Date()
      }));

      await TestAssignment.bulkCreate(assignments, { 
        transaction,
        ignoreDuplicates: true 
      });
      assignedCount += studentIds.length;
      assignedStudents.push(...studentIds);
    }

    // Assign to departments
    if (departments.length > 0) {
      // Get students from departments
      const deptStudents = await LicensedUser.findAll({
        where: { department: departments },
        attributes: ['id']
      });
      
      const deptStudentIds = deptStudents.map(s => s.id);
      
      if (deptStudentIds.length > 0) {
        const deptAssignments = deptStudentIds.map(studentId => ({
          testId,
          studentId,
          testDate,
          startTime,
          windowTime,
          assignedAt: new Date()
        }));

        await TestAssignment.bulkCreate(deptAssignments, { 
          transaction,
          ignoreDuplicates: true 
        });
        assignedCount += deptStudentIds.length;
        assignedStudents.push(...deptStudentIds);
      }
    }

    // Assign to all students
    if (assignToAll) {
      // Get all active students
      const users = await User.findAll({ 
        attributes: ['id']
      });
      const licensedUsers = await LicensedUser.findAll({
        attributes: ['id']
      });

      const allStudentIds = [
        ...users.map(u => u.id),
        ...licensedUsers.map(u => u.id)
      ];

      if (allStudentIds.length > 0) {
        const allAssignments = allStudentIds.map(studentId => ({
          testId,
          studentId,
          testDate,
          startTime,
          windowTime,
          assignedAt: new Date()
        }));

        await TestAssignment.bulkCreate(allAssignments, { 
          transaction,
          ignoreDuplicates: true 
        });
        assignedCount += allStudentIds.length;
        assignedStudents.push(...allStudentIds);
      }
    }

    await transaction.commit();

    console.log(`✅ Test assigned successfully to ${assignedCount} students`);

    res.json({
      success: true,
      message: `Test assigned successfully to ${assignedCount} students`,
      testId,
      assignedCount,
      assignedStudents: [...new Set(assignedStudents)],
      schedule: {
        testDate,
        startTime,
        windowTime
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error assigning test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign test'
    });
  }
};

// Get assigned tests for a student
exports.getAssignedTestsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`📚 Getting assigned tests for student: ${studentId}`);

    // Get student details to check department
    let student = await User.findByPk(studentId);
    if (!student) {
      student = await LicensedUser.findByPk(studentId);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get tests assigned directly to student
    const assignments = await TestAssignment.findAll({
      where: {
        studentId
      },
      include: [{
        model: Test,
        as: 'test',
        include: [{
          model: Section,
          attributes: ['id', 'name', 'duration', 'type']
        }]
      }],
      order: [['testDate', 'ASC'], ['startTime', 'ASC']]
    });

    // Check test eligibility and completion status
    const assignedTests = await Promise.all(
      assignments.map(async (assignment) => {
        const test = assignment.test;
        
        // Check if already completed
        const session = await TestSession.findOne({
          where: {
            testId: test.testId,
            studentId,
            status: ['completed', 'submitted']
          }
        });

        // Check if test is in progress
        const inProgressSession = await TestSession.findOne({
          where: {
            testId: test.testId,
            studentId,
            status: ['in_progress', 'on_break']
          }
        });

        const now = new Date();
        const testDateTime = new Date(`${assignment.testDate}T${assignment.startTime}`);
        const windowEndTime = new Date(testDateTime.getTime() + (assignment.windowTime * 60000));

        let status = 'upcoming';
        let canStart = false;
        let canContinue = false;

        if (session) {
          status = 'completed';
        } else if (inProgressSession) {
          status = 'in_progress';
          canContinue = true;
        } else if (now > windowEndTime) {
          status = 'expired';
        } else if (now >= testDateTime) {
          status = 'available';
          canStart = true;
        }

        return {
          testId: test.testId,
          testName: test.name,
          description: test.description,
          instructions: test.instructions,
          testDate: assignment.testDate,
          startTime: assignment.startTime,
          windowTime: assignment.windowTime,
          status,
          canStart,
          canContinue,
          isCompleted: !!session,
          isInProgress: !!inProgressSession,
          completedAt: session?.completedAt,
          score: session?.totalScore,
          maxScore: session?.maxScore,
          percentage: session && session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0,
          sections: test.Sections.map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration,
            type: s.type
          })),
          totalDuration: test.Sections.reduce((sum, s) => sum + s.duration, 0),
          sectionsCount: test.Sections.length
        };
      })
    );

    // Sort tests by status priority
    const sortedTests = assignedTests.sort((a, b) => {
      const statusPriority = {
        'available': 1,
        'in_progress': 2,
        'upcoming': 3,
        'completed': 4,
        'expired': 5
      };
      return statusPriority[a.status] - statusPriority[b.status];
    });

    res.json({
      success: true,
      assignedTests: sortedTests,
      studentName: student.name,
      department: student.department,
      totalTests: sortedTests.length,
      availableTests: sortedTests.filter(t => t.status === 'available').length,
      completedTests: sortedTests.filter(t => t.status === 'completed').length,
      upcomingTests: sortedTests.filter(t => t.status === 'upcoming').length
    });

  } catch (error) {
    console.error('Error getting assigned tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assigned tests'
    });
  }
};

// Get all test assignments (admin view)
exports.getAllTestAssignments = async (req, res) => {
  try {
    const { testId, status } = req.query;

    let whereClause = {};
    if (testId) whereClause.testId = testId;

    const assignments = await TestAssignment.findAll({
      where: whereClause,
      include: [{
        model: Test,
        as: 'test',
        attributes: ['testId', 'name', 'status', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Group assignments by test
    const groupedAssignments = assignments.reduce((acc, assignment) => {
      const testId = assignment.testId;
      if (!acc[testId]) {
        acc[testId] = {
          test: assignment.test,
          assignments: [],
          totalAssigned: 0,
          completedCount: 0
        };
      }
      acc[testId].assignments.push(assignment);
      acc[testId].totalAssigned++;
      return acc;
    }, {});

    // Get completion statistics
    for (const testId in groupedAssignments) {
      const completedSessions = await TestSession.count({
        where: {
          testId,
          status: ['completed', 'submitted']
        }
      });
      groupedAssignments[testId].completedCount = completedSessions;
    }

    res.json({
      success: true,
      assignments: Object.values(groupedAssignments)
    });

  } catch (error) {
    console.error('Error getting test assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get test assignments'
    });
  }
};

// Auto-generate reports when test window ends
exports.autoGenerateReports = async (req, res) => {
  try {
    console.log('🔄 Running auto-report generation...');

    // Find tests whose window has ended but reports haven't been generated
    const now = new Date();
    const expiredAssignments = await TestAssignment.findAll({
      include: [{
        model: Test,
        as: 'test',
        where: {
          status: 'scheduled'
        }
      }],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('DATE_ADD', 
              sequelize.fn('CONCAT', 
                sequelize.col('testDate'), 
                ' ', 
                sequelize.col('startTime')
              ), 
              sequelize.literal('INTERVAL windowTime MINUTE')
            ),
            Op.lt,
            now
          )
        ]
      }
    });

    let reportsGenerated = 0;

    for (const assignment of expiredAssignments) {
      const testId = assignment.testId;
      
      // Check if test has completed sessions
      const completedSessions = await TestSession.count({
        where: {
          testId,
          status: ['completed', 'submitted']
        }
      });

      if (completedSessions > 0) {
        // Mark test as completed and ready for reports
        await Test.update({
          status: 'completed'
        }, {
          where: { testId }
        });

        reportsGenerated++;
        console.log(`📊 Test ${testId} marked as completed with ${completedSessions} submissions`);
      }
    }

    res.json({
      success: true,
      message: `Auto-report generation completed. ${reportsGenerated} tests processed.`,
      reportsGenerated
    });

  } catch (error) {
    console.error('Error in auto-report generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate auto-reports'
    });
  }
};

// Remove test assignment
exports.removeTestAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const deleted = await TestAssignment.destroy({
      where: { id: assignmentId }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Test assignment removed successfully'
    });

  } catch (error) {
    console.error('Error removing test assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove test assignment'
    });
  }
};