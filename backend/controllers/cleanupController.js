const { Test, Section, MCQ, TestAssignment, sequelize } = require("../models");

exports.clearAllTestData = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Starting database cleanup...');
    
    // Delete in correct order to avoid foreign key constraints
    await MCQ.destroy({ where: {}, transaction });
    console.log('✅ MCQs cleared');
    
    await Section.destroy({ where: {}, transaction });
    console.log('✅ Sections cleared');
    
    await TestAssignment.destroy({ where: {}, transaction });
    console.log('✅ Test assignments cleared');
    
    await Test.destroy({ where: {}, transaction });
    console.log('✅ Tests cleared');
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'All test data cleared successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
};

exports.getDataStats = async (req, res) => {
  try {
    const stats = {
      tests: await Test.count(),
      sections: await Section.count(),
      mcqs: await MCQ.count(),
      assignments: await TestAssignment.count()
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
};