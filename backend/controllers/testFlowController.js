const { Test, TestAssignment, TestSession, SectionSubmission, User, LicensedUser, Section, sequelize } = require('../models');
const { Op } = require('sequelize');

// Complete test assignment with schedule
exports.assignTestWithSchedule = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { testId } = req.params;
    const { 
      studentIds = [], 
      departments = [], 
      testDate, 
      startTime, 
      duration = 180,
      assignToAll = false 
    } = req.body;

    // Validate test exists
    const test = await Test.findByPk(testId);
    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Update test with schedule
    await Test.update({
      testDate,
      startTime,
      duration,
      status: 'scheduled'
    }, { where: { testId }, transaction });

    let assignedStudents = [];

    // Get students to assign
    if (assignToAll) {
      const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
      const licensedUsers = await LicensedUser.findAll({ attributes: ['id', 'name', 'email'] });
      assignedStudents = [...users, ...licensedUsers];
    } else {
      // Specific students
      if (studentIds.length > 0) {
        const users = await User.findAll({ where: { id: studentIds }, attributes: ['id', 'name', 'email'] });
        const licensedUsers = await LicensedUser.findAll({ where: { id: studentIds }, attributes: ['id', 'name', 'email'] });
        assignedStudents.push(...users, ...licensedUsers);
      }
      
      // Department students
      if (departments.length > 0) {
        const deptUsers = await LicensedUser.findAll({ 
          where: { department: departments }, 
          attributes: ['id', 'name', 'email', 'department'] 
        });
        assignedStudents.push(...deptUsers);
      }
    }

    // Create assignments
    const assignments = assignedStudents.map(student => ({
      testId,
      studentId: student.id,
      testDate,
      startTime,
      duration,
      status: 'assigned'
    }));

    await TestAssignment.bulkCreate(assignments, { transaction, ignoreDuplicates: true });

    await transaction.commit();

    res.json({
      success: true,
      message: `Test assigned to ${assignedStudents.length} students`,
      assignedCount: assignedStudents.length,
      schedule: { testDate, startTime, duration }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error assigning test:', error);
    res.status(500).json({ success: false, error: 'Failed to assign test' });
  }
};

// Get student's assigned tests
exports.getStudentAssignedTests = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info
    let student = await User.findByPk(studentId);
    if (!student) {
      student = await LicensedUser.findByPk(studentId);
    }

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Get assigned tests
    const assignments = await TestAssignment.findAll({
      where: { 
        [Op.or]: [
          { studentId },
          { departmentCode: student.department || 'NONE' }
        ]
      },
      include: [{
        model: Test,
        as: 'test',
        include: [{ model: Section, attributes: ['id', 'name', 'duration'] }]
      }],
      order: [['testDate', 'ASC'], ['startTime', 'ASC']]
    });

    // Check completion status
    const testsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const test = assignment.test;
        
        // Check if completed
        const session = await TestSession.findOne({
          where: { testId: test.testId, studentId, status: ['completed', 'submitted'] }
        });

        const now = new Date();
        const testDateTime = new Date(`${assignment.testDate}T${assignment.startTime}`);
        const endTime = new Date(testDateTime.getTime() + (assignment.duration * 60000));

        let status = 'upcoming';
        let canStart = false;

        if (session) {
          status = 'completed';
        } else if (now > endTime) {
          status = 'expired';
        } else if (now >= testDateTime) {
          status = 'available';
          canStart = true;
        }

        return {
          testId: test.testId,
          testName: test.name,
          description: test.description,
          testDate: assignment.testDate,
          startTime: assignment.startTime,
          duration: assignment.duration,
          status,
          canStart,
          isCompleted: !!session,
          score: session?.totalScore,
          maxScore: session?.maxScore,
          completedAt: session?.completedAt,
          sections: test.Sections.length,
          totalDuration: test.Sections.reduce((sum, s) => sum + s.duration, 0)
        };
      })
    );

    res.json({
      success: true,
      assignedTests: testsWithStatus,
      studentName: student.name
    });

  } catch (error) {
    console.error('Error getting assigned tests:', error);
    res.status(500).json({ success: false, error: 'Failed to get assigned tests' });
  }
};

// Auto-generate reports when test ends
exports.autoGenerateReports = async (req, res) => {
  try {
    const now = new Date();
    
    // Find tests that have ended
    const endedTests = await Test.findAll({
      where: {
        status: 'scheduled',
        [Op.and]: [
          sequelize.where(
            sequelize.fn('DATE_ADD',
              sequelize.fn('CONCAT', sequelize.col('testDate'), ' ', sequelize.col('startTime')),
              sequelize.literal('INTERVAL duration MINUTE')
            ),
            Op.lt,
            now
          )
        ]
      }
    });

    let reportsGenerated = 0;

    for (const test of endedTests) {
      // Check if has completed sessions
      const completedCount = await TestSession.count({
        where: { testId: test.testId, status: ['completed', 'submitted'] }
      });

      if (completedCount > 0) {
        // Mark as completed
        await Test.update(
          { status: 'completed' },
          { where: { testId: test.testId } }
        );
        reportsGenerated++;
      }
    }

    res.json({
      success: true,
      message: `${reportsGenerated} tests marked as completed`,
      reportsGenerated
    });

  } catch (error) {
    console.error('Error in auto-report generation:', error);
    res.status(500).json({ success: false, error: 'Failed to generate reports' });
  }
};

// Get comprehensive test results for admin
exports.getTestResultsForAdmin = async (req, res) => {
  try {
    const { testId } = req.params;

    // Get test details
    const test = await Test.findOne({
      where: { testId },
      include: [{ model: Section, attributes: ['id', 'name', 'type'] }]
    });

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Get all completed sessions
    const sessions = await TestSession.findAll({
      where: { testId, status: ['completed', 'submitted'] },
      include: [{
        model: SectionSubmission,
        as: 'submissions',
        include: [{ model: Section, as: 'section', attributes: ['name'] }]
      }],
      order: [['completedAt', 'DESC']]
    });

    // Get student details and format results
    const results = await Promise.all(
      sessions.map(async (session) => {
        let student = await LicensedUser.findByPk(session.studentId);
        if (!student) {
          student = await User.findByPk(session.studentId);
        }

        const percentage = session.maxScore > 0 ? 
          Math.round((session.totalScore / session.maxScore) * 100) : 0;

        // Section-wise scores
        const sectionScores = session.submissions.map(sub => ({
          sectionName: sub.section?.name || `Section ${sub.sectionIndex + 1}`,
          score: sub.score || 0,
          maxScore: sub.maxScore || 0,
          percentage: sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0
        }));

        return {
          sessionId: session.id,
          studentId: session.studentId,
          studentName: student?.name || 'Unknown Student',
          email: student?.email || 'N/A',
          department: student?.department || 'N/A',
          totalScore: session.totalScore || 0,
          maxScore: session.maxScore || 100,
          percentage,
          status: percentage >= 60 ? 'Pass' : 'Fail',
          completedAt: session.completedAt,
          sectionScores
        };
      })
    );

    // Calculate statistics
    const totalStudents = results.length;
    const passedStudents = results.filter(r => r.status === 'Pass').length;
    const averageScore = totalStudents > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents) : 0;

    res.json({
      success: true,
      test: {
        testId: test.testId,
        name: test.name,
        sections: test.Sections
      },
      statistics: {
        totalStudents,
        passedStudents,
        failedStudents: totalStudents - passedStudents,
        passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
        averageScore
      },
      results
    });

  } catch (error) {
    console.error('Error getting test results:', error);
    res.status(500).json({ success: false, error: 'Failed to get test results' });
  }
};