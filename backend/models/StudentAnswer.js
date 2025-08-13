module.exports = (sequelize, DataTypes) => {
  const StudentAnswer = sequelize.define('StudentAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'question_id'
    },
    selectedAnswer: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'selected_answer'
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_correct'
    },
    practiceResultId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'practice_result_id'
    }
  }, {
    tableName: 'student_answers',
    timestamps: true,
    underscored: true
  });

  return StudentAnswer;
};