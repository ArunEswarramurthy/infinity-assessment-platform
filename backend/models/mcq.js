module.exports = (sequelize, DataTypes) => {
  const MCQ = sequelize.define("MCQ", {
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    questionImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    optionA: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    optionAImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    optionB: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    optionBImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    optionC: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    optionCImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    optionD: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    optionDImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    correctOption: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    correctOptionLetter: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['A', 'B', 'C', 'D']]
      }
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return MCQ;
};