const { CodingQuestion, CodeSubmission, Section, sequelize } = require('../models');
const { executeCode, evaluateTestCases, executeWithCustomInput, checkCompilerAvailability } = require('../utils/codeExecutor');

// Dry run code with sample test cases only
exports.dryRunCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: questionId, code, language'
      });
    }

    // Get the coding question
    const question = await CodingQuestion.findByPk(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Coding question not found'
      });
    }

    // Check if language is allowed
    if (!question.allowedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language ${language} is not allowed for this question`
      });
    }

    // Run only sample test cases
    const sampleTestCases = question.sampleTestCases || [];
    
    if (sampleTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No sample test cases available for dry run'
      });
    }

    const evaluation = await evaluateTestCases(code, language, sampleTestCases, question.timeLimit);
    
    // Check if there were compilation or runtime errors
    const hasErrors = evaluation.results.some(result => result.error && result.error.trim());
    
    if (hasErrors) {
      const firstError = evaluation.results.find(result => result.error);
      return res.json({
        success: false,
        error: firstError.error,
        results: evaluation.results,
        summary: {
          passed: evaluation.totalScore,
          total: evaluation.totalTests,
          percentage: evaluation.percentage
        }
      });
    }

    res.json({
      success: true,
      message: 'Dry run completed',
      results: evaluation.results,
      summary: {
        passed: evaluation.totalScore,
        total: evaluation.totalTests,
        percentage: evaluation.percentage
      }
    });

  } catch (error) {
    console.error('Dry run error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute dry run',
      message: error.message
    });
  }
};

// Submit code for evaluation
exports.submitCode = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { questionId, code, language, studentId, testId } = req.body;

    if (!questionId || !code || !language || !studentId || !testId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Get the coding question
    const question = await CodingQuestion.findByPk(questionId);
    if (!question) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Coding question not found'
      });
    }

    // Check if language is allowed
    if (!question.allowedLanguages.includes(language)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Language ${language} is not allowed for this question`
      });
    }

    // Check if student already submitted for this question
    const existingSubmission = await CodeSubmission.findOne({
      where: {
        studentId,
        codingQuestionId: questionId,
        testId,
        isDryRun: false
      }
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code;
      existingSubmission.language = language;
      existingSubmission.status = 'running';
      await existingSubmission.save({ transaction });
    }

    // Combine sample and hidden test cases
    const allTestCases = [
      ...(question.sampleTestCases || []),
      ...(question.hiddenTestCases || [])
    ];

    if (allTestCases.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'No test cases available for evaluation'
      });
    }

    // Evaluate code against all test cases
    const evaluation = await evaluateTestCases(code, language, allTestCases, question.timeLimit);
    
    // Calculate proportional score based on passed test cases
    const finalScore = Math.round((evaluation.totalScore / evaluation.totalTests) * question.marks);
    
    // Determine status
    const status = evaluation.percentage === 100 ? 'passed' : 'failed';

    // Create or update submission
    const submissionData = {
      studentId,
      codingQuestionId: questionId,
      testId,
      code,
      language,
      status,
      testResults: evaluation.results,
      score: finalScore,
      isDryRun: false
    };

    let submission;
    if (existingSubmission) {
      await existingSubmission.update(submissionData, { transaction });
      submission = existingSubmission;
    } else {
      submission = await CodeSubmission.create(submissionData, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Code submitted and evaluated successfully',
      submissionId: submission.id,
      status,
      score: finalScore,
      maxScore: question.marks,
      testResults: {
        passed: evaluation.totalScore,
        total: evaluation.totalTests,
        percentage: Math.round((evaluation.totalScore / evaluation.totalTests) * 100)
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Code submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit and evaluate code',
      message: error.message
    });
  }
};

// Get submission results
exports.getSubmissionResults = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await CodeSubmission.findByPk(submissionId, {
      include: [{
        model: CodingQuestion,
        as: 'codingQuestion',
        attributes: ['problemStatement', 'marks', 'sampleTestCases']
      }]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      submission: {
        id: submission.id,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        score: submission.score,
        testResults: submission.testResults,
        executionTime: submission.executionTime,
        memoryUsed: submission.memoryUsed,
        errorMessage: submission.errorMessage,
        createdAt: submission.createdAt,
        question: submission.codingQuestion
      }
    });

  } catch (error) {
    console.error('Get submission results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get submission results',
      message: error.message
    });
  }
};

// Get student submissions for a test
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    const submissions = await CodeSubmission.findAll({
      where: {
        testId,
        studentId,
        isDryRun: false
      },
      include: [{
        model: CodingQuestion,
        as: 'codingQuestion',
        attributes: ['problemStatement', 'marks']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub.id,
        questionId: sub.codingQuestionId,
        language: sub.language,
        status: sub.status,
        score: sub.score,
        createdAt: sub.createdAt,
        question: sub.codingQuestion
      }))
    });

  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get student submissions',
      message: error.message
    });
  }
};

// Execute code with custom input
exports.executeWithCustomInput = async (req, res) => {
  try {
    const { code, language, customInput } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, language'
      });
    }

    const result = await executeWithCustomInput(code, language, customInput || '', 10000);

    res.json({
      success: true,
      result: {
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        success: result.success,
        compilerError: result.compilerError,
        runtimeError: result.runtimeError,
        compilationError: result.compilationError,
        syntaxError: result.syntaxError
      }
    });

  } catch (error) {
    console.error('Custom execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute code with custom input',
      message: error.message
    });
  }
};

// Check compiler availability
exports.checkCompilers = async (req, res) => {
  try {
    const languages = ['java', 'python3', 'cpp', 'c'];
    const results = {};

    for (const lang of languages) {
      const check = await checkCompilerAvailability(lang);
      results[lang] = check;
    }

    res.json({
      success: true,
      compilers: results
    });

  } catch (error) {
    console.error('Compiler check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check compiler availability',
      message: error.message
    });
  }
};