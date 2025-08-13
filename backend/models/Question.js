// models/Question.js
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    questionText: DataTypes.TEXT,
    optionA: DataTypes.STRING,
    optionB: DataTypes.STRING,
    optionC: DataTypes.STRING,
    optionD: DataTypes.STRING,
    correctOption: DataTypes.STRING,
    explanation: DataTypes.TEXT,
    difficultyLevel: DataTypes.STRING,
    sectionId: DataTypes.INTEGER,
    topicId: DataTypes.INTEGER
  }, {
    tableName: "questions",
    underscored: true
  });

  Question.associate = function(models) {
    Question.belongsTo(models.Topic, { foreignKey: "topicId" });
    Question.belongsTo(models.PracticeSection, { foreignKey: "sectionId" });
  };

  return Question;
};
