const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add unique constraint to prevent duplicate test sessions
      await queryInterface.addConstraint('test_sessions', {
        fields: ['student_id', 'test_id'],
        type: 'unique',
        name: 'unique_student_test_session'
      });
      
      console.log('✅ Added unique constraint for student-test sessions');
    } catch (error) {
      console.log('⚠️ Constraint may already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('test_sessions', 'unique_student_test_session');
      console.log('✅ Removed unique constraint for student-test sessions');
    } catch (error) {
      console.log('⚠️ Error removing constraint:', error.message);
    }
  }
};