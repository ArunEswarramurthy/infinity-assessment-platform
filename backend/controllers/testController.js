const { Test, Section, MCQ, CodingQuestion, TestAssignment, TestSession, sequelize } = require("../models");
const { Op } = require('sequelize');
const generateTestId = require("../utils/generateTestId");
const generateUniqueTestName = require("../utils/generateUniqueTestName");
const parseMCQExcel = require("../utils/parseMCQExcel");
const validateExcelStructure = require("../utils/validateExcel");
const { sanitizeForLog, sanitizeFilePath } = require('../utils/security');
const fs = require("fs");
const path = require("path");

exports.createTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("Creating test:", sanitizeForLog(req.body.name || 'unnamed'));
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Request body:", req.body);
    console.log("Files received:", req.files?.map(f => ({ name: f.fieldname, filename: f.filename })));

    // Validate test name
    if (!req.body.name || !req.body.name.trim()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Validation error",
        message: "Test name is required"
      });
    }

    // Generate unique test name
    const uniqueTestName = await generateUniqueTestName(req.body.name.trim());

    const testId = await generateTestId();
    
    const test = await Test.create({ 
      testId, 
      name: uniqueTestName,
      description: req.body.description || '',
      instructions: req.body.instructions || '',
      status: req.body.status || 'saved'
    }, { transaction });

    // Handle sections if provided
    if (req.body.sections) {
      let sections;
      try {
        sections = typeof req.body.sections === 'string' 
          ? JSON.parse(req.body.sections) 
          : req.body.sections;
      } catch (err) {
        console.error('Error parsing sections:', err);
        sections = [];
      }

      for (const section of sections) {
        const newSection = await Section.create({
          name: section.name || 'Untitled Section',
          duration: section.duration || 30,
          type: section.type || 'MCQ',
          correctMarks: section.correctMarks || 1,
          instructions: section.instructions || '',
          testId: test.testId,
        }, { transaction });

        // Handle Excel file upload for this section
        const sectionFile = req.files?.find(file => file.fieldname === section.name);
        if (sectionFile && section.type === 'MCQ') {
          try {
            console.log(`Processing Excel file for section: ${section.name}`);
            
            // Validate Excel structure first
            const validation = validateExcelStructure(sectionFile.path);
            if (!validation.valid) {
              throw new Error(`Invalid Excel file for section "${section.name}": ${validation.error}`);
            }
            
            console.log(`Excel validation passed. Processing ${validation.rowCount} rows...`);
            const questions = await parseMCQExcel(sectionFile.path);
            
            if (questions && questions.length > 0) {
              const mcqRecords = questions.map(q => ({
                sectionId: newSection.id,
                questionText: q.questionText,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                correctOptionLetter: q.correctOptionLetter,
                explanation: q.explanation || '',
                marks: q.marks || 1
              }));
              
              await MCQ.bulkCreate(mcqRecords, { transaction });
              console.log(`Added ${questions.length} questions from Excel for section: ${section.name}`);
            } else {
              console.warn(`No valid questions found in Excel file for section: ${section.name}`);
            }
            
            // Clean up uploaded file after processing
            try {
              const safePath = sanitizeFilePath(sectionFile.path, path.join(__dirname, '../uploads'));
              if (safePath) {
                fs.unlinkSync(safePath);
                console.log(`Cleaned up file: ${sanitizeForLog(safePath)}`);
              }
            } catch (cleanupError) {
              console.warn(`Failed to cleanup file:`, sanitizeForLog(cleanupError.message));
            }
          } catch (excelError) {
            console.error(`Excel processing error for section ${section.name}:`, excelError);
            // Clean up file even if parsing failed
            try {
              if (sectionFile.path) {
                fs.unlinkSync(sectionFile.path);
              }
            } catch (cleanupError) {
              console.warn(`Failed to cleanup file after error:`, cleanupError.message);
            }
            // Don't throw here - continue with other sections but log the error
            console.warn(`Skipping Excel questions for section "${section.name}" due to error: ${excelError.message}`);
          }
        }

        // Handle manual questions
        if (section.manualQuestions && section.manualQuestions.length > 0) {
          const mcqRecords = section.manualQuestions.map(q => ({
            sectionId: newSection.id,
            questionText: q.questionText,
            questionImage: q.questionImage,
            optionA: q.optionA,
            optionAImage: q.optionAImage,
            optionB: q.optionB,
            optionBImage: q.optionBImage,
            optionC: q.optionC,
            optionCImage: q.optionCImage,
            optionD: q.optionD,
            optionDImage: q.optionDImage,
            correctOption: q.correctAnswer,
            correctOptionLetter: q.correctAnswer,
            explanation: q.explanation || '',
            marks: q.marks || 1
          }));
          
          await MCQ.bulkCreate(mcqRecords, { transaction });
          console.log(`Added ${section.manualQuestions.length} manual questions for section: ${section.name}`);
        }

        // Handle coding questions
        if (section.codingQuestions && section.codingQuestions.length > 0) {
          const codingRecords = section.codingQuestions.map(q => ({
            sectionId: newSection.id,
            problemStatement: q.problemStatement,
            sampleTestCases: q.sampleTestCases || [],
            hiddenTestCases: [], // Admin can add hidden test cases later
            allowedLanguages: q.allowedLanguages || ['Java'],
            constraints: q.constraints || '',
            marks: q.marks || 1,
            timeLimit: 2000, // 2 seconds default
            memoryLimit: 256 // 256 MB default
          }));
          
          await CodingQuestion.bulkCreate(codingRecords, { transaction });
          console.log(`Added ${section.codingQuestions.length} coding questions for section: ${section.name}`);
        }
      }
    }

    await transaction.commit();
    console.log(`Test created successfully with ID: ${sanitizeForLog(testId)}`);

    return res.status(201).json({ 
      success: true,
      message: "Test created successfully", 
      testId,
      finalTestName: uniqueTestName
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Test creation failed:", err);
    console.error("Error stack:", err.stack);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    
    // Provide more specific error messages
    let errorMessage = "Failed to create test";
    if (err.name === 'SequelizeValidationError') {
      errorMessage = "Validation error: " + err.errors.map(e => e.message).join(', ');
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      errorMessage = "Test name already exists. Please choose a different name.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to create test",
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.updateTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: testId } = req.params;
    console.log("Updating test:", sanitizeForLog(testId), "with name:", sanitizeForLog(req.body.name || 'unnamed'));
    console.log("Files received:", req.files?.map(f => ({ name: f.fieldname, filename: f.filename })));

    // Check if test exists
    const existingTest = await Test.findByPk(testId);
    if (!existingTest) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        error: "Test not found",
        message: "Test not found"
      });
    }

    // Validate test name
    if (!req.body.name || !req.body.name.trim()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Validation error",
        message: "Test name is required"
      });
    }

    // Generate unique test name (excluding current test)
    const uniqueTestName = await generateUniqueTestName(req.body.name.trim(), testId);

    // Update test basic info
    await Test.update({ 
      name: uniqueTestName,
      description: req.body.description || '',
      instructions: req.body.instructions || '',
      status: req.body.status || 'saved'
    }, { 
      where: { testId },
      transaction 
    });

    // Delete existing sections and their questions
    const existingSections = await Section.findAll({ where: { testId } });
    const sectionIds = existingSections.map(s => s.id);
    
    if (sectionIds.length > 0) {
      await MCQ.destroy({ where: { sectionId: sectionIds }, transaction });
      await CodingQuestion.destroy({ where: { sectionId: sectionIds }, transaction });
      await Section.destroy({ where: { testId }, transaction });
    }

    // Handle sections if provided (same logic as create)
    if (req.body.sections) {
      let sections;
      try {
        sections = typeof req.body.sections === 'string' 
          ? JSON.parse(req.body.sections) 
          : req.body.sections;
      } catch (err) {
        console.error('Error parsing sections:', err);
        sections = [];
      }

      for (const section of sections) {
        const newSection = await Section.create({
          name: section.name || 'Untitled Section',
          duration: section.duration || 30,
          type: section.type || 'MCQ',
          correctMarks: section.correctMarks || 1,
          instructions: section.instructions || '',
          testId: testId,
        }, { transaction });

        // Handle Excel file upload for this section
        const sectionFile = req.files?.find(file => file.fieldname === section.name);
        if (sectionFile && section.type === 'MCQ') {
          try {
            console.log(`Processing Excel file for section: ${section.name}`);
            
            const validation = validateExcelStructure(sectionFile.path);
            if (!validation.valid) {
              throw new Error(`Invalid Excel file for section "${section.name}": ${validation.error}`);
            }
            
            console.log(`Excel validation passed. Processing ${validation.rowCount} rows...`);
            const questions = await parseMCQExcel(sectionFile.path);
            
            if (questions && questions.length > 0) {
              const mcqRecords = questions.map(q => ({
                sectionId: newSection.id,
                questionText: q.questionText,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                correctOptionLetter: q.correctOptionLetter,
                explanation: q.explanation || '',
                marks: q.marks || 1
              }));
              
              await MCQ.bulkCreate(mcqRecords, { transaction });
              console.log(`Added ${questions.length} questions from Excel for section: ${section.name}`);
            }
            
            try {
              fs.unlinkSync(sectionFile.path);
            } catch (cleanupError) {
              console.warn(`Failed to cleanup file ${sectionFile.path}:`, cleanupError.message);
            }
          } catch (excelError) {
            console.error(`Excel processing error for section ${section.name}:`, excelError);
            try {
              if (sectionFile.path) {
                fs.unlinkSync(sectionFile.path);
              }
            } catch (cleanupError) {
              console.warn(`Failed to cleanup file after error:`, cleanupError.message);
            }
            console.warn(`Skipping Excel questions for section "${section.name}" due to error: ${excelError.message}`);
          }
        }

        // Handle manual questions
        if (section.manualQuestions && section.manualQuestions.length > 0) {
          const mcqRecords = section.manualQuestions.map(q => ({
            sectionId: newSection.id,
            questionText: q.questionText,
            questionImage: q.questionImage,
            optionA: q.optionA,
            optionAImage: q.optionAImage,
            optionB: q.optionB,
            optionBImage: q.optionBImage,
            optionC: q.optionC,
            optionCImage: q.optionCImage,
            optionD: q.optionD,
            optionDImage: q.optionDImage,
            correctOption: q.correctAnswer,
            correctOptionLetter: q.correctAnswer,
            explanation: q.explanation || '',
            marks: q.marks || 1
          }));
          
          await MCQ.bulkCreate(mcqRecords, { transaction });
          console.log(`Added ${section.manualQuestions.length} manual questions for section: ${section.name}`);
        }

        // Handle coding questions
        if (section.codingQuestions && section.codingQuestions.length > 0) {
          const codingRecords = section.codingQuestions.map(q => ({
            sectionId: newSection.id,
            problemStatement: q.problemStatement,
            sampleTestCases: q.sampleTestCases || [],
            hiddenTestCases: [],
            allowedLanguages: q.allowedLanguages || ['Java'],
            constraints: q.constraints || '',
            marks: q.marks || 1,
            timeLimit: 2000,
            memoryLimit: 256
          }));
          
          await CodingQuestion.bulkCreate(codingRecords, { transaction });
          console.log(`Added ${section.codingQuestions.length} coding questions for section: ${section.name}`);
        }
      }
    }

    await transaction.commit();
    console.log(`Test updated successfully with ID: ${sanitizeForLog(testId)}`);

    return res.status(200).json({ 
      success: true,
      message: "Test updated successfully", 
      testId,
      finalTestName: uniqueTestName
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Test update failed:", err);
    
    let errorMessage = "Failed to update test";
    if (err.name === 'SequelizeValidationError') {
      errorMessage = "Validation error: " + err.errors.map(e => e.message).join(', ');
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      errorMessage = "Test name already exists. Please choose a different name.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to update test",
      message: errorMessage
    });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      attributes: ['testId', 'name', 'description', 'status', 'testDate', 'startTime', 'windowTime', 'createdAt']
    });

    // Add empty Sections array to each test to match frontend expectations
    const testsWithSections = tests.map(test => ({
      ...test.toJSON(),
      Sections: []
    }));

    res.json(testsWithSections);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch tests' 
    });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findByPk(id);

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    // Get sections separately
    const sections = await Section.findAll({
      where: { testId: id },
      order: [['createdAt', 'ASC']]
    });

    // Get MCQs and Coding Questions for each section separately
    for (const section of sections) {
      const mcqs = await MCQ.findAll({
        where: { sectionId: section.id },
        order: [['id', 'ASC']],
        limit: 100 // Limit to prevent memory issues
      });
      
      const codingQuestions = await CodingQuestion.findAll({
        where: { sectionId: section.id },
        order: [['id', 'ASC']],
        limit: 50 // Limit coding questions
      });
      
      section.dataValues.MCQs = mcqs;
      section.dataValues.codingQuestions = codingQuestions;
    }

    test.dataValues.Sections = sections;
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch test' 
    });
  }
};

exports.deleteTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    // Delete MCQs and Coding Questions
    const sections = await Section.findAll({ where: { testId: id } });
    const sectionIds = sections.map(s => s.id);
    
    await MCQ.destroy({
      where: { sectionId: sectionIds },
      transaction
    });
    
    await CodingQuestion.destroy({
      where: { sectionId: sectionIds },
      transaction
    });

    await Section.destroy({
      where: { testId: id },
      transaction
    });

    const deletedCount = await Test.destroy({
      where: { testId: id },
      transaction
    });

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    await transaction.commit();
    res.json({ 
      success: true,
      message: 'Test deleted successfully' 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete test' 
    });
  }
};

exports.assignTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: testId } = req.params;
    const { testDate, startTime, windowTime, departments } = req.body;

    const test = await Test.findByPk(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    await Test.update({
      testDate,
      startTime,
      windowTime: windowTime || 180,
      status: 'scheduled'
    }, {
      where: { testId },
      transaction
    });

    const assignments = departments.map(deptCode => ({
      testId,
      departmentCode: deptCode,
      testDate,
      startTime,
      windowTime: windowTime || 180
    }));

    await TestAssignment.bulkCreate(assignments, { transaction });

    await transaction.commit();
    res.json({
      success: true,
      message: 'Test assigned successfully',
      assignedDepartments: departments.length
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

exports.getAssignedTests = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({
        success: false,
        error: 'Department parameter is required'
      });
    }

    const assignedTests = await Test.findAll({
      include: [
        {
          model: TestAssignment,
          as: 'assignments',
          where: {
            departmentCode: {
              [Op.in]: [department, 'ALL']
            }
          },
          required: true
        },
        {
          model: Section,
          include: [MCQ]
        }
      ],
      where: {
        status: 'scheduled'
      },
      order: [['testDate', 'ASC']]
    });

    res.json(assignedTests);
  } catch (error) {
    console.error('Error fetching assigned tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned tests'
    });
  }
};

exports.checkTestEligibility = async (req, res) => {
  try {
    const { testId } = req.params;
    const { studentId } = req.query;
    
    const test = await Test.findByPk(testId, {
      include: [{
        model: Section,
        attributes: ['duration']
      }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if student has already completed this test
    if (studentId) {
      const existingSession = await TestSession.findOne({
        where: { 
          testId, 
          studentId,
          status: ['completed', 'submitted']
        }
      });

      if (existingSession) {
        return res.json({
          success: false,
          canStart: false,
          canBegin: false,
          alreadyCompleted: true,
          message: 'You have already completed this test. Each test can only be taken once.',
          completedAt: existingSession.completedAt,
          score: existingSession.totalScore,
          maxScore: existingSession.maxScore
        });
      }
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const totalTestDuration = test.Sections.reduce((total, section) => total + section.duration, 0);

    if (test.testDate) {
      const testDateObj = new Date(test.testDate + 'T00:00:00');
      const todayObj = new Date();
      todayObj.setHours(0, 0, 0, 0);
      
      const isSameDate = (
        testDateObj.getFullYear() === todayObj.getFullYear() &&
        testDateObj.getMonth() === todayObj.getMonth() &&
        testDateObj.getDate() === todayObj.getDate()
      );
      
      if (!isSameDate) {
        return res.json({
          success: false,
          canStart: false,
          canBegin: false,
          message: `Test is scheduled for ${testDateObj.toLocaleDateString()}, not today (${todayObj.toLocaleDateString()})`,
          testDate: test.testDate,
          currentDate: currentDate
        });
      }
    }

    if (!test.testDate || !test.startTime) {
      return res.json({
        success: true,
        canStart: true,
        canBegin: true,
        message: 'Test available (no timing restrictions)',
        totalDuration: totalTestDuration
      });
    }

    const testStartDateTime = new Date(`${test.testDate}T${test.startTime}`);
    const windowEndDateTime = new Date(testStartDateTime.getTime() + (test.windowTime * 60000));
    
    const timeUntilWindowEnd = (windowEndDateTime - now) / 60000;
    const remainingWindowTime = Math.max(0, timeUntilWindowEnd);

    let canStart = true;
    let canBegin = true;
    let message = 'Test is available. You can start anytime.';

    if (now > windowEndDateTime) {
      canStart = false;
      canBegin = false;
      message = 'Test window has expired.';
    } else if (remainingWindowTime < totalTestDuration) {
      canStart = true;
      canBegin = false;
      message = `Not enough time remaining. Test requires ${totalTestDuration} minutes but only ${Math.floor(remainingWindowTime)} minutes left.`;
    }

    return res.json({
      success: true,
      canStart,
      canBegin,
      message,
      testStartTime: test.startTime,
      testDate: test.testDate,
      windowTime: test.windowTime,
      totalDuration: totalTestDuration,
      remainingWindowTime: Math.floor(remainingWindowTime),
      currentTime: currentTime,
      currentDate: currentDate
    });

  } catch (error) {
    console.error('Error checking test eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check test eligibility'
    });
  }
};