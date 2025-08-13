// // models/Answer.js
// module.exports = (sequelize, DataTypes) => {
//   const Answer = sequelize.define('Answer', {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true
//     },
//     studentId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'google_users', // or whatever your User table is named
//         key: 'id'
//       }
//     },
//     questionId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'questions',
//         key: 'id'
//       }
//     },
//     selectedOption: {
//       type: DataTypes.STRING(1), // 'A', 'B', 'C', or 'D'
//       allowNull: false
//     },
//     isCorrect: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false
//     },
//     testSessionId: {
//       type: DataTypes.UUID,
//       allowNull: true
//     }
//   }, {
//     tableName: 'answers',
//     timestamps: true,
//     updatedAt: false,
//     createdAt: 'answeredAt',
//     indexes: [
//       {
//         unique: true,
//         fields: ['studentId', 'questionId', 'testSessionId']
//       }
//     ]
//   });

//   Answer.associate = function(models) {
//     Answer.belongsTo(models.Question, { foreignKey: 'questionId' });
//     Answer.belongsTo(models.User, { foreignKey: 'studentId' });
//   };

//   return Answer;
// };

module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('Answer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'question_id',
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    selectedOption: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: 'selected_option'
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_correct'
    },
    testSessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'test_session_id'
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'answered_at'
    }
  }, {
    tableName: 'answers',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'question_id']
      }
    ]
  });

  Answer.associate = function(models) {
    Answer.belongsTo(models.Question, { foreignKey: 'questionId' });
    Answer.belongsTo(models.User, { foreignKey: 'studentId' });
  };

  return Answer;
};
