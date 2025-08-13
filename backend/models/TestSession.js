module.exports = (sequelize, DataTypes) => {
  const TestSession = sequelize.define("TestSession", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    testId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currentSectionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'on_break', 'completed', 'submitted', 'auto-submitted'),
      allowNull: false,
      defaultValue: 'not_started'
    },
    sectionSubmissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    breakStartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    breakEndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'test_sessions',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'testId'],
        name: 'unique_student_test_session'
      },
      {
        fields: ['studentId'],
        name: 'idx_test_sessions_student_id'
      },
      {
        fields: ['testId'],
        name: 'idx_test_sessions_test_id'
      },
      {
        fields: ['status'],
        name: 'idx_test_sessions_status'
      }
    ]
  });

  return TestSession;
};