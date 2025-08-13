// models/PracticeTopic.js
module.exports = (sequelize, DataTypes) => {
  const PracticeTopic = sequelize.define("PracticeTopic", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Topic name cannot be empty"
        }
      }
    },
    questionType: {
      type: DataTypes.ENUM('MCQ', 'Coding'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['MCQ', 'Coding']],
          msg: "Question type must be either MCQ or Coding"
        }
      }
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   isUrl: {
      //     msg: "File path must be a valid URL"
      //   }
      // }
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'practice_topics',
    timestamps: true,
    paranoid: true // Enable soft deletion
  });

  PracticeTopic.associate = function(models) {
    PracticeTopic.belongsTo(models.PracticeSection, {
      foreignKey: 'sectionId',
      as: 'section',
      onDelete: 'CASCADE'
    });
  };

  return PracticeTopic;
};