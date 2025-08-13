const { Test, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a unique test name by appending a number if the name already exists
 * @param {string} baseName - The base name for the test
 * @param {string} excludeTestId - Test ID to exclude from duplicate check (for updates)
 * @returns {Promise<string>} - A unique test name
 */
async function generateUniqueTestName(baseName, excludeTestId = null) {
  if (!baseName || !baseName.trim()) {
    throw new Error('Base name is required');
  }

  const cleanBaseName = baseName.trim();
  let testName = cleanBaseName;
  let counter = 1;
  let isUnique = false;

  while (!isUnique && counter <= 100) { // Limit to prevent infinite loops
    const whereClause = {
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')), 
        sequelize.fn('LOWER', testName)
      )
    };

    // Exclude current test if updating
    if (excludeTestId) {
      whereClause.where = {
        [Op.and]: [
          whereClause.where,
          { testId: { [Op.ne]: excludeTestId } }
        ]
      };
    }

    const existingTest = await Test.findOne(whereClause);
    
    if (!existingTest) {
      isUnique = true;
    } else {
      counter++;
      testName = `${cleanBaseName} (${counter})`;
    }
  }

  if (!isUnique) {
    // Fallback to timestamp-based naming
    const timestamp = Date.now().toString().slice(-6);
    testName = `${cleanBaseName}_${timestamp}`;
  }

  return testName;
}

module.exports = generateUniqueTestName;