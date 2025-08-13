// models/Topic.js
module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define("Topic", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
    },
  });

  Topic.associate = (models) => {
    Topic.belongsTo(models.Subtitle, {
      foreignKey: "subtitleId",
    });
  };

  return Topic;
};
