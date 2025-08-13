const { Test, TestAssignment, TestSession, User, LicensedUser, Section } = require('../models');
const { Op } = require('sequelize');

// Get dashboard data for a student
exports.getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`📚 Getting dashboard data for student: ${studentId}`);

    // Get student details - check both User and LicensedUser tables
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

    // Get tests assigned to student's department or ALL departments
    const assignments = await TestAssignment.findAll({
      where: {
        [Op.or]: [
          { departmentCode: student.department },
          { departmentCode: 'ALL' }
        ]
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

    // Check test status and completion for each assignment
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
        const startWindowEnd = new Date(testDateTime.getTime() + (15 * 60000)); // 15-minute start window
        const windowEndTime = new Date(testDateTime.getTime() + (assignment.windowTime * 60000));

        let status = 'upcoming';
        let canStart = false;
        let canContinue = false;
        let restrictionMessage = null;

        // For licensed users, check one-time restriction
        if (isLicensedUser && (session || inProgressSession)) {
          restrictionMessage = 'Licensed users can only take each test once';
        }

        if (session) {
          status = 'completed';
        } else if (inProgressSession) {
          status = 'in_progress';
          canContinue = !isLicensedUser || !restrictionMessage; // Licensed users can't continue if restricted
        } else if (now > windowEndTime) {
          status = 'expired';
        } else if (now > startWindowEnd) {
          status = 'start_window_expired';
          restrictionMessage = 'Start window expired (15 minutes after test start time)';
        } else if (now >= testDateTime) {
          status = 'available';
          canStart = !restrictionMessage; // Can start only if no restrictions
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
          sections: test.Sections?.map(s => ({
            id: s.id,
            name: s.name,
            duration: s.duration,
            type: s.type
          })) || [],
          totalDuration: test.Sections?.reduce((sum, s) => sum + s.duration, 0) || 0,
          sectionsCount: test.Sections?.length || 0,
          restrictionMessage,
          isLicensedUser,
          startWindowEnd: startWindowEnd.toISOString(),
          timeUntilStart: testDateTime > now ? Math.ceil((testDateTime - now) / 60000) : 0,
          timeUntilStartWindowExpires: startWindowEnd > now ? Math.ceil((startWindowEnd - now) / 60000) : 0
        };
      })
    );

    // Sort tests by status priority
    const sortedTests = assignedTests.sort((a, b) => {
      const statusPriority = {
        'available': 1,
        'in_progress': 2,
        'upcoming': 3,
        'start_window_expired': 4,
        'completed': 5,
        'expired': 6
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
      upcomingTests: sortedTests.filter(t => t.status === 'upcoming').length,
      inProgressTests: sortedTests.filter(t => t.status === 'in_progress').length
    });

  } catch (error) {
    console.error('Error getting student dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
};