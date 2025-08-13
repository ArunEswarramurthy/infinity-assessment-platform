module.exports = (sequelize, DataTypes) => {
  const CodingQuestion = sequelize.define("CodingQuestion", {
    problemStatement: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    sampleTestCases: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    hiddenTestCases: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    allowedLanguages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['Java']
    },
    constraints: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2000 // milliseconds
    },
    memoryLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 256 // MB
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return CodingQuestion;
};