const { sequelize } = require('./models');
const reportGenerationService = require('./services/reportGenerationService');

async function seedReportsData() {
  try {
    console.log('📊 Starting reports data seeding...');

    // Get all tests with completed sessions
    const { Test, TestSession } = require('./models');
    
    const tests = await Test.findAll({
      include: [{
        model: TestSession,
        where: { 
          status: { 
            [require('sequelize').Op.in]: ['completed', 'auto-submitted'] 
          } 
        },
        required: true
      }]
    });

    console.log(`Found ${tests.length} tests with completed sessions`);

    // Generate reports for each test
    for (const test of tests) {
      try {
        console.log(`Generating reports for test: ${test.name}`);
        
        // Generate both Excel and CSV reports
        await reportGenerationService.generateTestReport(test.testId, 'excel');
        await reportGenerationService.generateTestReport(test.testId, 'csv');
        
        console.log(`✅ Reports generated for test: ${test.name}`);
      } catch (error) {
        console.error(`❌ Error generating reports for test ${test.name}:`, error.message);
      }
    }

    console.log('🎉 Reports data seeding completed successfully!');
    console.log(`📋 Generated reports for ${tests.length} tests`);

  } catch (error) {
    console.error('❌ Error seeding reports data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedReportsData()
    .then(() => {
      console.log('✅ Reports seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Reports seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedReportsData;