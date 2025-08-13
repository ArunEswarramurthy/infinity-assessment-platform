// models/PracticeSection.js
module.exports = (sequelize, DataTypes) => {
  const PracticeSection = sequelize.define("PracticeSection", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PracticeSection.associate = (models) => {
    PracticeSection.hasMany(models.Subtitle, {
      foreignKey: "sectionId",
      as: "subtitles",
      onDelete: "CASCADE",
    });
  };

  return PracticeSection;
};
