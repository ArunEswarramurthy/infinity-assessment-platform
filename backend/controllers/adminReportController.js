const { Test, TestSession, Section, SectionScore, User, Department, sequelize } = require('../models');
const { Op } = require('sequelize');
const { generatePDFReport } = require('../utils/pdfGenerator');
 const XLSX = require('xlsx');

/**
 * Get test report data
 * @param {Object} req - Express request object
 * @param {string} req.params.testId - Test ID
 */
const getTestReport = async (req, res) => {
  const { testId } = req.params;
  
  // Input validation
  if (!testId || typeof testId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid test ID provided'
    });
  }
  
  try {
    // Get test details
    const test = await Test.findByPk(testId, {
      attributes: ['testId', 'name', 'description', 'testDate', 'startTime', 'windowTime']
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Get all test sessions for this test with student and department info
    const testSessions = await TestSession.findAll({
      where: { 
        testId: testId,
        status: { [Op.in]: ['completed', 'auto-submitted'] }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: SectionScore,
          as: 'sectionScores',
          include: [
            {
              model: Section,
              as: 'section',
              attributes: ['id', 'name', 'type']
            }
          ]
        }
      ],
      order: [
        [{ model: User, as: 'student' }, 'name', 'ASC']
      ]
    });

    // Format the response
    const reportData = {
      test: {
        id: test.testId,
        name: test.name,
        description: test.description,
        testDate: test.testDate,
        startTime: test.startTime,
        totalStudents: testSessions.length
      },
      sections: [],
      students: []
    };

    // Get unique sections
    const sections = [];
    testSessions.forEach(session => {
      session.sectionScores.forEach(score => {
        if (!sections.some(s => s.id === score.section.id)) {
          sections.push({
            id: score.section.id,
            name: score.section.name,
            type: score.section.type
          });
        }
      });
    });

    reportData.sections = sections;

    // Process student data
    reportData.students = testSessions.map(session => {
      const studentData = {
        id: session.student.id,
        name: session.student.name,
        email: session.student.email,
        department: session.student.department || 'N/A',
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalScore: session.totalScore || 0,
        maxScore: session.maxScore || 0,
        averageScore: session.maxScore > 0 ? Math.round(((session.totalScore || 0) / session.maxScore) * 1000) / 10 : 0,
        sectionScores: {}
      };

      // Add section scores
      session.sectionScores.forEach(score => {
        studentData.sectionScores[score.section.id] = {
          marksObtained: score.marksObtained || 0,
          maxMarks: score.maxMarks || 0,
          status: score.status || 'not_attempted'
        };
      });

      return studentData;
    });

    // Compute ranks with tie handling (competition ranking: 1,2,2,4)
    const sortedByScore = [...reportData.students].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    let lastScore = null;
    let lastRank = 0;
    sortedByScore.forEach((s, idx) => {
      if (lastScore === null || s.totalScore !== lastScore) {
        lastRank = idx + 1;
        lastScore = s.totalScore;
      }
      s.rank = lastRank;
    });
    // Map ranks back to original students by email/id
    const rankMap = new Map(sortedByScore.map(s => [s.id, s.rank]));
    reportData.students = reportData.students.map(s => ({ ...s, rank: rankMap.get(s.id) }));

    // Calculate statistics
    const stats = {
      totalStudents: reportData.students.length,
      averageScore: 0,
      highestScore: 0,
      lowestScore: reportData.students[0]?.totalScore || 0,
      sectionStats: {}
    };

    let totalScoreSum = 0;
    
    reportData.students.forEach(student => {
      totalScoreSum += student.totalScore || 0;
      
      if (student.totalScore > stats.highestScore) {
        stats.highestScore = student.totalScore;
      }
      
      if (student.totalScore < stats.lowestScore) {
        stats.lowestScore = student.totalScore;
      }

      // Calculate section statistics
      Object.entries(student.sectionScores).forEach(([sectionId, score]) => {
        if (!stats.sectionStats[sectionId]) {
          stats.sectionStats[sectionId] = {
            totalMarks: 0,
            count: 0,
            highest: 0,
            lowest: score.marksObtained || 0
          };
        }

        const sectionStat = stats.sectionStats[sectionId];
        sectionStat.totalMarks += score.marksObtained || 0;
        sectionStat.count += 1;
        
        if ((score.marksObtained || 0) > sectionStat.highest) {
          sectionStat.highest = score.marksObtained || 0;
        }
        
        if ((score.marksObtained || 0) < sectionStat.lowest) {
          sectionStat.lowest = score.marksObtained || 0;
        }
      });
    });

    // Calculate averages
    if (reportData.students.length > 0) {
      stats.averageScore = totalScoreSum / reportData.students.length;
      
      // Calculate section averages
      Object.values(stats.sectionStats).forEach(stat => {
        stat.average = stat.count > 0 ? stat.totalMarks / stat.count : 0;
      });
    }

    reportData.statistics = stats;

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating test report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate and download PDF report
 * @param {Object} req - Express request object
 * @param {string} req.params.testId - Test ID
 */
const downloadPDFReport = async (req, res) => {
  const { testId } = req.params;
  
  // Input validation
  if (!testId || typeof testId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid test ID provided'
    });
  }
  
  try {
    // Get report data
    const reportData = await getTestReportData(testId);
    
    if (!reportData) {
      return res.status(404).json({
        success: false,
        error: 'Test report data not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDFReport(reportData);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=test-report-${testId}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get report generation status
 * @param {Object} req - Express request object
 * @param {string} req.params.testId - Test ID
 */
const getReportStatus = async (req, res) => {
  const { testId } = req.params;
  
  // Input validation
  if (!testId || typeof testId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid test ID provided'
    });
  }
  
  try {
    // Check if test exists
    const test = await Test.findByPk(testId, {
      attributes: ['testId']
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if any test sessions exist
    const sessionCount = await TestSession.count({
      where: { 
        testId,
        status: { [Op.in]: ['completed', 'auto-submitted'] }
      }
    });

    // In a real implementation, you might have a more sophisticated way to determine
    // if the report is ready (e.g., background job status)
    const reportReady = sessionCount > 0;
    
    // Calculate next generation time (for demo purposes, just return now + 5 minutes)
    const nextGenerationTime = new Date();
    nextGenerationTime.setMinutes(nextGenerationTime.getMinutes() + 5);

    res.json({
      success: true,
      data: {
        reportReady,
        nextGenerationTime: reportReady ? null : nextGenerationTime.toISOString(),
        testId,
        sessionsProcessed: sessionCount
      }
    });
    
  } catch (error) {
    console.error('Error getting report status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get report status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to get test report data (used by both JSON and PDF endpoints)
 * @param {string} testId - Test ID
 * @returns {Promise<Object>} Report data
 */
async function getTestReportData(testId) {
  // Input validation
  if (!testId || typeof testId !== 'string') {
    throw new Error('Invalid test ID provided');
  }
  
  try {
    const test = await Test.findByPk(testId, {
      attributes: ['testId', 'name', 'description', 'testDate', 'startTime', 'windowTime']
    });

  if (!test) return null;

  const testSessions = await TestSession.findAll({
    where: { 
      testId,
      status: { [Op.in]: ['completed', 'auto-submitted'] }
    },
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'email', 'department']
      },
      {
        model: SectionScore,
        as: 'sectionScores',
        include: [
          {
            model: Section,
            as: 'section',
            attributes: ['id', 'name', 'type']
          }
        ]
      }
    ],
    order: [
      [{ model: User, as: 'student' }, 'name', 'ASC']
    ]
  });

  // Format the data (similar to getTestReport)
  const reportData = {
    test: {
      id: test.testId,
      name: test.name,
      description: test.description,
      testDate: test.testDate,
      startTime: test.startTime,
      totalStudents: testSessions.length
    },
    sections: [],
    students: []
  };

    // Process sections and students (similar to getTestReport)
    const sections = [];
    testSessions.forEach(session => {
      session.sectionScores.forEach(score => {
        if (!sections.some(s => s.id === score.section.id)) {
          sections.push({
            id: score.section.id,
            name: score.section.name,
            type: score.section.type
          });
        }
      });
    });

    reportData.sections = sections;
    reportData.students = testSessions.map(session => ({
      id: session.student.id,
      name: session.student.name,
      email: session.student.email,
      department: session.student.department || 'N/A',
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      totalScore: session.totalScore || 0,
      maxScore: session.maxScore || 0,
      sectionScores: session.sectionScores.reduce((acc, score) => {
        acc[score.section.id] = {
          marksObtained: score.marksObtained || 0,
          maxMarks: score.maxMarks || 0,
          status: score.status || 'not_attempted'
        };
        return acc;
      }, {})
    }));

    return reportData;
  } catch (error) {
    console.error('Error in getTestReportData:', error);
    throw error;
  }
}

// Download Excel report
const downloadXlsxReport = async (req, res) => {
  const { testId } = req.params;
  try {
    const data = await getTestReportData(testId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Test report data not found' });
    }

    // Compute ranks and averages (if not present)
    const students = data.students.map(s => ({
      ...s,
      averageScore: s.maxScore > 0 ? Math.round(((s.totalScore || 0) / s.maxScore) * 1000) / 10 : 0
    }));
    const sorted = [...students].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    let last = null, lastRank = 0;
    sorted.forEach((s, i) => {
      if (last === null || s.totalScore !== last) {
        lastRank = i + 1;
        last = s.totalScore;
      }
      s.rank = lastRank;
    });
    const rankMap = new Map(sorted.map(s => [s.id, s.rank]));

    // Build worksheet rows
    // Dynamic section columns ordered by data.sections
    const sectionIds = data.sections.map(s => s.id);
    const sectionHeaders = data.sections.map((s, idx) => `Section ${idx + 1} Score`);

    const rows = students.map(st => {
      const row = {
        'Student Name': st.name,
        'Total Score': st.totalScore || 0,
        'Average Score (%)': st.averageScore || 0,
        'Rank': rankMap.get(st.id) || ''
      };
      sectionIds.forEach((sid, idx) => {
        const score = st.sectionScores[sid]?.marksObtained || 0;
        row[sectionHeaders[idx]] = score;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${data.test.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report.xlsx"`);
    return res.send(buf);
  } catch (err) {
    console.error('Error generating XLSX report:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate Excel report' });
  }
};

module.exports = {
  getTestReport,
  downloadPDFReport,
  getReportStatus,
  downloadXlsxReport
};
