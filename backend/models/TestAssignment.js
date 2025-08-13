module.exports = (sequelize, DataTypes) => {
  const TestAssignment = sequelize.define('TestAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    testId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'test_id'
    },
    departmentCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'department_code'
    },
    testDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'test_date'
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time'
    },
    windowTime: {
      type: DataTypes.INTEGER,
      defaultValue: 180,
      field: 'window_time'
    }
  }, {
    tableName: 'test_assignments',
    timestamps: true
  });

  return TestAssignment;
};