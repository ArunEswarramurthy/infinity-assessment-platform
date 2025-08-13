const { LicensedUser, TestSession, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get dynamic leaderboard for licensed users only
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    console.log('📊 Fetching dynamic leaderboard for licensed users...');

    // Get all licensed users first
    const licensedUsers = await LicensedUser.findAll({
      attributes: ['id', 'name', 'email', 'department', 'sin_number', 'created_at'],
      limit: parseInt(limit)
    });

    console.log(`✅ Found ${licensedUsers.length} licensed users`);

    // Get test sessions for each user
    const leaderboardData = await Promise.all(
      licensedUsers.map(async (user) => {
        const completedSessions = await TestSession.findAll({
          where: {
            studentId: user.id,
            status: 'completed'
          },
          attributes: ['totalScore', 'maxScore', 'completedAt']
        });

        const testCount = completedSessions.length;
        let averageScore = 0;
        let bestScore = 0;
        let totalPoints = 0;

        if (testCount > 0) {
          const scores = completedSessions.map(s => 
            s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0
          );
          averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          bestScore = Math.max(...scores);
          totalPoints = completedSessions.reduce((sum, s) => sum + s.totalScore, 0);
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
          sin_number: user.sin_number,
          created_at: user.created_at,
          testCount,
          averageScore: Math.round(averageScore * 10) / 10,
          bestScore: Math.round(bestScore * 10) / 10,
          totalPoints,
          lastTestDate: testCount > 0 ? 
            Math.max(...completedSessions.map(s => new Date(s.completedAt).getTime())) : null
        };
      })
    );

    // Sort by average score, then test count, then total points
    const sortedData = leaderboardData.sort((a, b) => {
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      if (b.testCount !== a.testCount) return b.testCount - a.testCount;
      return b.totalPoints - a.totalPoints;
    });

    console.log(`✅ Processed ${sortedData.length} licensed users`);

    // Format leaderboard data
    const leaderboard = sortedData.map((user, index) => {
      // Determine year based on creation date (simple logic)
      const joinYear = new Date(user.created_at).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - joinYear;
      const academicYear = yearDiff <= 0 ? '1st' : 
                          yearDiff === 1 ? '2nd' : 
                          yearDiff === 2 ? '3rd' : '4th';

      return {
        rank: index + 1,
        studentId: user.id,
        studentName: user.name,
        email: user.email,
        department: user.department || 'N/A',
        year: academicYear,
        sinNumber: user.sin_number,
        testCount: user.testCount || 0,
        averageScore: user.averageScore ? Math.round(user.averageScore * 10) / 10 : 0,
        bestScore: user.bestScore ? Math.round(user.bestScore * 10) / 10 : 0,
        totalPoints: user.totalPoints || 0,
        lastTestDate: user.lastTestDate,
        joinDate: user.created_at,
        isLicensedUser: true
      };
    });

    // Calculate additional stats
    const totalLicensedUsers = await LicensedUser.count();
    const activeLicensedUsers = leaderboard.length;
    const averageTestsPerUser = leaderboard.length > 0 ? 
      Math.round(leaderboard.reduce((sum, user) => sum + user.testCount, 0) / leaderboard.length) : 0;
    const overallAverageScore = leaderboard.length > 0 ?
      Math.round(leaderboard.reduce((sum, user) => sum + user.averageScore, 0) / leaderboard.length) : 0;

    res.json({
      success: true,
      leaderboard,
      stats: {
        totalLicensedUsers,
        activeLicensedUsers,
        averageTestsPerUser,
        overallAverageScore,
        topPerformer: leaderboard[0] || null,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};

// Get leaderboard by department
exports.getLeaderboardByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const { limit = 20 } = req.query;

    console.log(`📊 Fetching leaderboard for department: ${department}`);

    const [leaderboardData] = await sequelize.query(`
      SELECT 
        lu.id,
        lu.name,
        lu.email,
        lu.department,
        lu.sin_number,
        lu.created_at,
        COUNT(ts.id) as testCount,
        AVG(CASE WHEN ts.status = 'completed' AND ts.max_score > 0 
            THEN CAST(ts.total_score AS FLOAT) / CAST(ts.max_score AS FLOAT) * 100 
            ELSE NULL END) as averageScore,
        MAX(CASE WHEN ts.status = 'completed' AND ts.max_score > 0 
            THEN CAST(ts.total_score AS FLOAT) / CAST(ts.max_score AS FLOAT) * 100 
            ELSE 0 END) as bestScore,
        SUM(ts.total_score) as totalPoints
      FROM license_user lu
      LEFT JOIN test_sessions ts ON lu.id = ts.student_id AND ts.status = 'completed'
      WHERE lu.department = ?
      GROUP BY lu.id, lu.name, lu.email, lu.department, lu.sin_number, lu.created_at
      ORDER BY averageScore DESC, testCount DESC
      LIMIT ?
    `, { replacements: [department, parseInt(limit)] });

    const leaderboard = leaderboardData.map((user, index) => ({
      rank: index + 1,
      studentId: user.id,
      studentName: user.name,
      department: user.department,
      testCount: user.testCount || 0,
      averageScore: user.averageScore ? Math.round(user.averageScore * 10) / 10 : 0,
      bestScore: user.bestScore ? Math.round(user.bestScore * 10) / 10 : 0,
      totalPoints: user.totalPoints || 0
    }));

    res.json({
      success: true,
      department,
      leaderboard,
      count: leaderboard.length
    });

  } catch (error) {
    console.error('❌ Error fetching department leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department leaderboard'
    });
  }
};