 const { TestSession, SectionSubmission, SectionScore, Test, Section, MCQ, CodingQuestion, CodeSubmission, User, LicensedUser, sequelize } = require('../models');
const { generateReportOnCompletion } = require('../utils/autoReportGenerator');
const { sanitizeForLog } = require('../utils/security');

// Start a new test session
exports.startTestSession = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { testId, studentId } = req.body;

    if (!testId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing testId or studentId'
      });
    }
    
    console.log(`🚀 Starting test session - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}`);

    // Check if test exists and get sections
    const test = await Test.findOne({
      where: { testId },
      include: [{
        model: Section,
        include: [
          { model: MCQ },
          { model: CodingQuestion, as: 'codingQuestions' }
        ]
      }]
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if test is within 15-minute start window
    if (test.testDate && test.startTime) {
      const testStartDateTime = new Date(`${test.testDate}T${test.startTime}`);
      const currentTime = new Date();
      const timeDiff = (currentTime - testStartDateTime) / (1000 * 60); // minutes
      
      if (timeDiff > 15) {
        await transaction.rollback();
        console.log(`🚫 Test start window expired - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Minutes passed: ${Math.floor(timeDiff)}`);
        return res.status(403).json({
          success: false,
          error: 'Test start window has expired. You can only join within 15 minutes of the start time.',
          windowExpired: true,
          testStartTime: testStartDateTime,
          minutesPassed: Math.floor(timeDiff)
        });
      }
      
      if (timeDiff < 0) {
        await transaction.rollback();
        console.log(`🚫 Test not started yet - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Minutes until start: ${Math.abs(Math.floor(timeDiff))}`);
        return res.status(403).json({
          success: false,
          error: 'Test has not started yet.',
          testNotStarted: true,
          testStartTime: testStartDateTime,
          minutesUntilStart: Math.abs(Math.floor(timeDiff))
        });
      }
      
      console.log(`✅ Test within start window - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Minutes passed: ${Math.floor(timeDiff)}`);
    }

    // Check if this is a licensed user FIRST
    const licensedUser = await LicensedUser.findByPk(studentId);
    const isLicensedUser = !!licensedUser;
    
    console.log(`👤 User type - Student: ${sanitizeForLog(studentId)}, Licensed: ${isLicensedUser}`);

    // Check if session already exists - STRICT ONE-TIME TEST POLICY FOR LICENSED USERS
    let session = await TestSession.findOne({
      where: { testId, studentId }
    });

    // CRITICAL: For licensed users, ANY existing session means they cannot take the test again
    if (isLicensedUser && session) {
      await transaction.rollback();
      console.log(`🚫 LICENSED USER RESTRICTION - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Status: ${session.status}`);
      
      const errorMessage = session.status === 'completed' || session.status === 'submitted' ?
        'Test already completed. Licensed users can only take each test ONCE.' :
        'Test session already exists. Licensed users can only attempt each test ONCE.';
      
      return res.status(403).json({
        success: false,
        error: errorMessage,
        alreadyAttempted: true,
        sessionStatus: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        score: session.totalScore,
        maxScore: session.maxScore,
        isLicensedUser: true,
        oneTimeRestriction: true
      });
    }

    // For regular users, prevent retaking completed tests
    if (!isLicensedUser && session && (session.status === 'completed' || session.status === 'submitted')) {
      await transaction.rollback();
      console.log(`🚫 Test retake attempt blocked - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Status: ${session.status}`);
      return res.status(403).json({
        success: false,
        error: 'Test already completed. You can only take this test once.',
        alreadyCompleted: true,
        completedAt: session.completedAt,
        score: session.totalScore,
        maxScore: session.maxScore,
        isLicensedUser: false
      });
    }

    // For non-licensed users, allow resuming in-progress sessions
    if (!isLicensedUser && session && session.status === 'in_progress') {
      console.log(`⚠️ Resuming existing test session - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Section: ${session.currentSectionIndex}`);
    }

    // Calculate max score
    const maxScore = test.Sections.reduce((total, section) => {
      const mcqScore = section.MCQs.length * (section.correctMarks || 1);
      const codingScore = (section.codingQuestions || []).reduce((sum, q) => sum + q.marks, 0);
      return total + mcqScore + codingScore;
    }, 0);

    if (!session) {
      // Create new session - FIRST TIME ONLY
      console.log(`🆕 Creating new test session - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}`);
      session = await TestSession.create({
        testId,
        studentId,
        currentSectionIndex: 0,
        status: 'in_progress',
        startedAt: new Date(),
        maxScore
      }, { transaction });
    } else {
      // Resume existing session - ONLY if not completed
      if (session.status === 'completed' || session.status === 'submitted') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Test already completed. You can only take this test once.',
          alreadyCompleted: true
        });
      }
      
      console.log(`🔄 Resuming test session - Student: ${sanitizeForLog(studentId)}, Test: ${sanitizeForLog(testId)}, Section: ${session.currentSectionIndex}`);
      session.status = 'in_progress';
      session.startedAt = session.startedAt || new Date();
      await session.save({ transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      session: {
        id: session.id,
        currentSectionIndex: session.currentSectionIndex,
        status: session.status,
        totalSections: test.Sections.length,
        breakEndTime: session.breakEndTime
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Start test session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start test session'
    });
  }
};

// Get current section for student
exports.getCurrentSection = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    const session = await TestSession.findOne({
      where: { testId, studentId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    // Check if on break
    if (session.status === 'on_break') {
      const now = new Date();
      if (session.breakEndTime && now < session.breakEndTime) {
        return res.json({
          success: true,
          onBreak: true,
          breakEndTime: session.breakEndTime,
          remainingBreakTime: Math.ceil((session.breakEndTime - now) / 1000)
        });
      } else {
        // Break is over, move to next section
        session.status = 'in_progress';
        session.breakStartTime = null;
        session.breakEndTime = null;
        await session.save();
      }
    }

    // Get test with sections
    const test = await Test.findByPk(testId, {
      include: [{
        model: Section,
        include: [
          { model: MCQ },
          { model: CodingQuestion, as: 'codingQuestions' }
        ]
      }]
    });

    if (!test || !test.Sections[session.currentSectionIndex]) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const currentSection = test.Sections[session.currentSectionIndex];

    res.json({
      success: true,
      session: {
        id: session.id,
        currentSectionIndex: session.currentSectionIndex,
        totalSections: test.Sections.length,
        status: session.status
      },
      section: {
        id: currentSection.id,
        name: currentSection.name,
        duration: currentSection.duration,
        instructions: currentSection.instructions,
        type: currentSection.type,
        MCQs: currentSection.MCQs,
        codingQuestions: currentSection.codingQuestions || []
      },
      test: {
        name: test.name,
        description: test.description,
        instructions: test.instructions
      }
    });

  } catch (error) {
    console.error('Get current section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current section'
    });
  }
};

// Submit current section
exports.submitSection = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { testId, studentId } = req.params;
    const { mcqAnswers = {}, codingSubmissions = [], timeSpent = 0 } = req.body;

    const session = await TestSession.findOne({
      where: { testId, studentId }
    });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    // Get current section
    const test = await Test.findByPk(testId, {
      include: [{
        model: Section,
        include: [
          { model: MCQ },
          { model: CodingQuestion, as: 'codingQuestions' }
        ]
      }]
    });

    const currentSection = test.Sections[session.currentSectionIndex];
    if (!currentSection) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Current section not found'
      });
    }

    // Calculate section score
    let sectionScore = 0;
    let maxSectionScore = 0;

    // Score MCQ answers
    for (const mcq of currentSection.MCQs) {
      maxSectionScore += currentSection.correctMarks || 1;
      if (mcqAnswers[mcq.id] === mcq.correctOptionLetter) {
        sectionScore += currentSection.correctMarks || 1;
      }
    }

    // Score coding submissions and save them
    const processedCodingSubmissions = [];
    for (const codingQuestion of (currentSection.codingQuestions || [])) {
      maxSectionScore += codingQuestion.marks;
      const submission = codingSubmissions.find(s => s.questionId === codingQuestion.id);
      if (submission) {
        // Get actual submission from CodeSubmission table
        const codeSubmission = await CodeSubmission.findOne({
          where: {
            codingQuestionId: codingQuestion.id,
            testId,
            studentId,
            isDryRun: false
          },
          order: [['createdAt', 'DESC']]
        });
        
        if (codeSubmission) {
          sectionScore += codeSubmission.score;
          processedCodingSubmissions.push({
            questionId: codingQuestion.id,
            submissionId: codeSubmission.id,
            score: codeSubmission.score,
            maxScore: codingQuestion.marks,
            testResults: codeSubmission.testResults || { passed: 0, total: 0, percentage: 0 }
          });
        } else {
          processedCodingSubmissions.push({
            questionId: codingQuestion.id,
            submissionId: null,
            score: 0,
            maxScore: codingQuestion.marks,
            testResults: { passed: 0, total: 0, percentage: 0 }
          });
        }
      }
    }

    // Create section submission
    const sectionSubmission = await SectionSubmission.create({
      testSessionId: session.id,
      sectionId: currentSection.id,
      sectionIndex: session.currentSectionIndex,
      mcqAnswers: JSON.stringify(mcqAnswers),
      codingSubmissions: JSON.stringify(processedCodingSubmissions),
      score: sectionScore,
      maxScore: maxSectionScore,
      timeSpent,
      submittedAt: new Date()
    }, { transaction });
    
    // Update SectionScore for reporting
    await SectionScore.upsert({
      testSessionId: session.id,
      sectionId: currentSection.id,
      marksObtained: sectionScore,
      maxMarks: maxSectionScore,
      status: 'completed',
      submittedAt: new Date(),
      answers: mcqAnswers || {},
      resultJson: processedCodingSubmissions || []
    }, { transaction });
    
    console.log(`✅ Section ${session.currentSectionIndex + 1} submitted - Score: ${sectionScore}/${maxSectionScore}`);

    // Update session
    const isLastSection = session.currentSectionIndex >= test.Sections.length - 1;
    
    if (isLastSection) {
      // Test completed - calculate total score from all section submissions
      const allSubmissions = await SectionSubmission.findAll({
        where: { testSessionId: session.id }
      });
      const calculatedTotalScore = allSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      const calculatedMaxScore = allSubmissions.reduce((sum, sub) => sum + (sub.maxScore || 0), 0);
      
      // CRITICAL: Ensure proper completion status and score saving
      console.log(`🔄 Updating session to completed - ID: ${session.id}`);
      console.log(`📊 Calculated scores - Total: ${calculatedTotalScore}, Max: ${calculatedMaxScore}`);
      
      // Update session with completion data
      await TestSession.update({
        status: 'completed',
        completedAt: new Date(),
        totalScore: calculatedTotalScore,
        maxScore: calculatedMaxScore || session.maxScore
      }, {
        where: { id: session.id },
        transaction
      });
      
      // Reload the session to get updated values
      await session.reload({ transaction });
      
      // CRITICAL: Verify the save was successful
      if (session.status !== 'completed' || session.totalScore !== calculatedTotalScore) {
        console.error('❌ CRITICAL: Session save verification failed!');
        console.error('Expected:', { status: 'completed', totalScore: calculatedTotalScore });
        console.error('Actual:', { status: session.status, totalScore: session.totalScore });
        throw new Error('Session save verification failed');
      }
      
      console.log(`🎉 TEST COMPLETED - Student: ${sanitizeForLog(session.studentId)}, Test: ${sanitizeForLog(session.testId)}`);
      console.log(`📊 Final Score: ${session.totalScore}/${session.maxScore} (${Math.round((session.totalScore/session.maxScore)*100)}%)`);
      
      // Verify the session was saved correctly
      const verifySession = await TestSession.findByPk(session.id);
      console.log(`✅ Verification - Status: ${verifySession.status}, Score: ${verifySession.totalScore}/${verifySession.maxScore}`);
      
      await transaction.commit();
      
      // Auto-generate report after successful completion
      const reportData = await generateReportOnCompletion(session.id);
      console.log(`📋 Auto-report generated: ${!!reportData}`);
      
      return res.json({
        success: true,
        testCompleted: true,
        totalScore: session.totalScore,
        maxScore: session.maxScore,
        sessionId: session.id,
        studentId: session.studentId,
        percentage: Math.round((session.totalScore / session.maxScore) * 100),
        refreshReports: true,
        refreshStudentReports: true,
        reportGenerated: !!reportData,
        message: 'Test completed successfully! Results saved and report generated.',
        verificationData: {
          sessionStatus: verifySession.status,
          sessionScore: verifySession.totalScore,
          sessionMaxScore: verifySession.maxScore,
          completedAt: verifySession.completedAt
        }
      });
    } else {
      // Move to break before next section
      const breakEndTime = new Date(Date.now() + 60000); // 1 minute break
      
      session.status = 'on_break';
      session.currentSectionIndex += 1;
      session.breakStartTime = new Date();
      session.breakEndTime = breakEndTime;
      await session.save({ transaction });
      
      await transaction.commit();
      
      return res.json({
        success: true,
        sectionCompleted: true,
        nextSectionIndex: session.currentSectionIndex,
        breakEndTime,
        breakDuration: 60 // seconds
      });
    }

  } catch (error) {
    await transaction.rollback();
    console.error('Submit section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit section'
    });
  }
};

// Check if student can take a test (hasn't completed it)
exports.checkTestEligibility = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    if (!testId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing testId or studentId'
      });
    }

    // Check if test exists
    const test = await Test.findOne({ where: { testId } });
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if test is within 15-minute start window
    if (test.testDate && test.startTime) {
      const testStartDateTime = new Date(`${test.testDate}T${test.startTime}`);
      const currentTime = new Date();
      const timeDiff = (currentTime - testStartDateTime) / (1000 * 60); // minutes
      
      if (timeDiff > 15) {
        return res.json({
          success: true,
          canTakeTest: false,
          windowExpired: true,
          testStartTime: testStartDateTime,
          minutesPassed: Math.floor(timeDiff),
          message: 'Test start window has expired. You can only join within 15 minutes of the start time.'
        });
      }
      
      if (timeDiff < 0) {
        return res.json({
          success: true,
          canTakeTest: false,
          testNotStarted: true,
          testStartTime: testStartDateTime,
          minutesUntilStart: Math.abs(Math.floor(timeDiff)),
          message: 'Test has not started yet.'
        });
      }
    }

    // Check if this is a licensed user FIRST
    const licensedUser = await LicensedUser.findByPk(studentId);
    const isLicensedUser = !!licensedUser;

    // CRITICAL: For licensed users, check if ANY session exists (STRICT ONE-TIME POLICY)
    if (isLicensedUser) {
      const anySession = await TestSession.findOne({
        where: { testId, studentId }
      });
      
      if (anySession) {
        const message = anySession.status === 'completed' || anySession.status === 'submitted' ?
          'Test already completed. Licensed users can only take each test ONCE.' :
          'Test session already exists. Licensed users can only attempt each test ONCE.';
          
        return res.json({
          success: true,
          canTakeTest: false,
          alreadyAttempted: true,
          sessionStatus: anySession.status,
          startedAt: anySession.startedAt,
          completedAt: anySession.completedAt,
          score: anySession.totalScore,
          maxScore: anySession.maxScore,
          percentage: anySession.maxScore > 0 ? Math.round((anySession.totalScore / anySession.maxScore) * 100) : 0,
          isLicensedUser: true,
          oneTimeRestriction: true,
          message
        });
      }
    }

    // For regular users, check if they have completed the test
    if (!isLicensedUser) {
      const completedSession = await TestSession.findOne({
        where: { 
          testId, 
          studentId,
          status: ['completed', 'submitted']
        }
      });

      if (completedSession) {
        return res.json({
          success: true,
          canTakeTest: false,
          alreadyCompleted: true,
          completedAt: completedSession.completedAt,
          score: completedSession.totalScore,
          maxScore: completedSession.maxScore,
          percentage: Math.round((completedSession.totalScore / completedSession.maxScore) * 100),
          isLicensedUser: false,
          message: 'You have already completed this test. Each test can only be taken once.'
        });
      }
    }

    // Check if there's an in-progress session
    const inProgressSession = await TestSession.findOne({
      where: { 
        testId, 
        studentId,
        status: 'in_progress'
      }
    });

    return res.json({
      success: true,
      canTakeTest: true,
      hasInProgressSession: !!inProgressSession,
      currentSection: inProgressSession?.currentSectionIndex || 0,
      testName: test.name,
      isLicensedUser,
      message: inProgressSession ? 
        'You have an in-progress session. You can resume where you left off.' : 
        (isLicensedUser ? 
          'You are eligible to take this test. Remember, licensed users can only take each test once.' :
          'You are eligible to take this test.')
    });

  } catch (error) {
    console.error('Check test eligibility error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check test eligibility'
    });
  }
};

// Get test results - ENHANCED VERSION
exports.getTestResults = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    console.log(`📊 Getting test results - Student: ${studentId}, Test: ${testId}`);

    const session = await TestSession.findOne({
      where: { testId, studentId },
      include: [{
        model: SectionSubmission,
        as: 'submissions',
        include: [{
          model: Section,
          as: 'section'
        }]
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Test session not found'
      });
    }

    const test = await Test.findByPk(testId, {
      include: [{ model: Section }]
    });

    // Get student details for verification
    let student = await LicensedUser.findByPk(studentId);
    if (!student) {
      student = await User.findByPk(studentId);
    }

    console.log(`✅ Found test results - Status: ${session.status}, Score: ${session.totalScore}/${session.maxScore}`);

    res.json({
      success: true,
      results: {
        testName: test.name,
        totalScore: session.totalScore,
        maxScore: session.maxScore,
        percentage: Math.round((session.totalScore / session.maxScore) * 100),
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || 'N/A',
        sections: session.submissions.map(sub => ({
          sectionIndex: sub.sectionIndex,
          sectionName: sub.section?.name || test.Sections[sub.sectionIndex]?.name,
          score: sub.score,
          maxScore: sub.maxScore,
          timeSpent: sub.timeSpent,
          submittedAt: sub.submittedAt,
          codingSubmissions: sub.codingSubmissions || []
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get test results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get test results'
    });
  }
};