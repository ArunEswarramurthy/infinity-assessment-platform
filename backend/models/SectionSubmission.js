module.exports = (sequelize, DataTypes) => {
  const SectionSubmission = sequelize.define("SectionSubmission", {
    testSessionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sectionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mcqAnswers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    codingSubmissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // in seconds
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  return SectionSubmission;
};