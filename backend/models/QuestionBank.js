module.exports = (sequelize, DataTypes) => {

  const QuestionBank = sequelize.define('QuestionBank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  questionImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  optionA: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionAImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  optionB: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionBImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  optionC: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionCImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  optionD: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionDImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  correctOption: {
    type: DataTypes.STRING(1),
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  }
  }, {
    tableName: 'question_bank',
    timestamps: true
  });

  return QuestionBank;
};