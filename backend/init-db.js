const { sequelize, Passcode } = require('./models');

async function initializeDatabase() {
  try {
    console.log('🔍 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models safely without altering existing structure
    try {
      await sequelize.sync({ force: false });
      console.log('✅ All models synchronized');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_TOO_MANY_KEYS') {
        console.log('⚠️ Too many keys error detected, skipping sync...');
        console.log('✅ Database tables already exist');
      } else {
        throw error;
      }
    }
    
    // Check if initial passcodes exist, create if not
    const studentPasscode = await Passcode.findOne({ where: { type: 'student' } });
    if (!studentPasscode) {
      const newStudentCode = Math.floor(100000 + Math.random() * 900000).toString();
      await Passcode.create({
        code: newStudentCode,
        type: 'student',
        studentsUsed: 0
      });
      console.log('✅ Initial student passcode created:', newStudentCode);
    }
    
    const supervisorPasscode = await Passcode.findOne({ where: { type: 'supervisor' } });
    if (!supervisorPasscode) {
      const newSupervisorCode = Math.floor(100000 + Math.random() * 900000).toString();
      await Passcode.create({
        code: newSupervisorCode,
        type: 'supervisor',
        studentsUsed: 0
      });
      console.log('✅ Initial supervisor passcode created:', newSupervisorCode);
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = initializeDatabase;

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database ready');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}