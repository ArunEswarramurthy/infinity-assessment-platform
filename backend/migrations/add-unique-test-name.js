const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, remove any duplicate test names by appending a number
      const [duplicates] = await queryInterface.sequelize.query(`
        SELECT name, COUNT(*) as count 
        FROM Tests 
        GROUP BY name 
        HAVING COUNT(*) > 1
      `);

      for (const duplicate of duplicates) {
        const [tests] = await queryInterface.sequelize.query(`
          SELECT testId, name 
          FROM Tests 
          WHERE name = :name 
          ORDER BY createdAt ASC
        `, {
          replacements: { name: duplicate.name }
        });

        // Keep the first one, rename the others
        for (let i = 1; i < tests.length; i++) {
          const newName = `${tests[i].name} (${i + 1})`;
          await queryInterface.sequelize.query(`
            UPDATE Tests 
            SET name = :newName 
            WHERE testId = :testId
          `, {
            replacements: { 
              newName: newName,
              testId: tests[i].testId 
            }
          });
        }
      }

      // Now add the unique constraint
      await queryInterface.addConstraint('Tests', {
        fields: ['name'],
        type: 'unique',
        name: 'unique_test_name'
      });

      // Also make name NOT NULL if it isn't already
      await queryInterface.changeColumn('Tests', 'name', {
        type: DataTypes.STRING,
        allowNull: false
      });

      console.log('✅ Added unique constraint to test names');
    } catch (error) {
      console.error('❌ Error adding unique constraint:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('Tests', 'unique_test_name');
      console.log('✅ Removed unique constraint from test names');
    } catch (error) {
      console.error('❌ Error removing unique constraint:', error);
      throw error;
    }
  }
};