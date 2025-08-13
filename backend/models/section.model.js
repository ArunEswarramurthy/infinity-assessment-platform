module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define("Section", {
    name: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    type: DataTypes.STRING,
    correctMarks: DataTypes.INTEGER,
    instructions: DataTypes.TEXT,
    testId: {
      type: DataTypes.STRING, // 👈 Must match Test.testId type
      allowNull: false,
    },
  });

  return Section;
};
