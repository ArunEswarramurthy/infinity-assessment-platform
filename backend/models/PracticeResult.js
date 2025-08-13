module.exports = (sequelize, DataTypes) => {
  const PracticeResult = sequelize.define('PracticeResult', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'topic_id'
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_questions'
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'correct_answers'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'time_taken'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'completed_at'
    }
  }, {
    tableName: 'practice_results',
    timestamps: true,
    underscored: true
  });

  return PracticeResult;
};