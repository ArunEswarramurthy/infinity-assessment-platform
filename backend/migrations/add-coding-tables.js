const { sequelize } = require('../models');

async function addCodingTables() {
  try {
    console.log('Creating coding question, submission, and session tables...');
    
    // Sync the new models
    await sequelize.sync({ alter: true });
    
    console.log('✅ All new tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addCodingTables()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCodingTables;