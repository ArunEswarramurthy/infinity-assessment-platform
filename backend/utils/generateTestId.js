const generateTestId = async () => {
  const { sequelize } = require('../models');
  
  try {
    let testId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (!isUnique && attempts < maxAttempts) {
      // Get the highest existing test number
      const [results] = await sequelize.query(
        "SELECT test_id FROM Tests WHERE test_id LIKE 'test%' ORDER BY test_id DESC LIMIT 1"
      );
      
      let nextNumber = 1;
      if (results.length > 0) {
        const lastId = results[0].test_id;
        const lastNumber = parseInt(lastId.replace('test', '')) || 0;
        nextNumber = lastNumber + 1;
      }
      
      testId = `test${nextNumber.toString().padStart(3, '0')}`;
      
      // Check if this ID already exists
      const [existingTest] = await sequelize.query(
        "SELECT test_id FROM Tests WHERE test_id = ?",
        { replacements: [testId] }
      );
      
      if (existingTest.length === 0) {
        isUnique = true;
      } else {
        attempts++;
      }
    }
    
    if (!isUnique) {
      // Fallback to timestamp-based ID
      const timestamp = Date.now().toString().slice(-6);
      testId = `test_${timestamp}`;
    }
    
    return testId;
  } catch (error) {
    console.error('Error generating test ID:', error);
    // Fallback to timestamp-based ID
    const timestamp = Date.now().toString().slice(-6);
    return `test_${timestamp}`;
  }
};

module.exports = generateTestId;
