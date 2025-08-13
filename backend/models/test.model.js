module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define("Test", {
    testId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: DataTypes.TEXT,
    instructions: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      allowNull: false
    },
    testDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    windowTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 180,
    },
  });

  return Test;
};
