// models/Subtitle.js
module.exports = (sequelize, DataTypes) => {
  const Subtitle = sequelize.define("Subtitle", {
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Subtitle.associate = (models) => {
    Subtitle.belongsTo(models.PracticeSection, {
      foreignKey: "sectionId",
    });

    Subtitle.hasMany(models.Topic, {
      foreignKey: "subtitleId",
      as: "topics",
      onDelete: "CASCADE",
    });
  };

  return Subtitle;
};
