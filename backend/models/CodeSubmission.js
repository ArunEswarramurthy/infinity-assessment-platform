module.exports = (sequelize, DataTypes) => {
  const CodeSubmission = sequelize.define("CodeSubmission", {
    studentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codingQuestionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    testId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Java', 'C++', 'C', 'Python']]
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'running', 'passed', 'failed', 'error', 'timeout']]
      }
    },
    testResults: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    executionTime: {
      type: DataTypes.INTEGER,
      allowNull: true // milliseconds
    },
    memoryUsed: {
      type: DataTypes.INTEGER,
      allowNull: true // KB
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isDryRun: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  return CodeSubmission;
};