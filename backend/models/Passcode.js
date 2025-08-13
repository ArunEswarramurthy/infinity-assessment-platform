// // models/passcode.model.js
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Passcode = sequelize.define("Passcode", {
//   code: {
//     type: DataTypes.STRING(6),
//     allowNull: false,
//   },
//   lastUpdated: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
//   studentsUsed: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
// }, {
//   tableName: "passcodes",
//   timestamps: false,
// });

// module.exports = Passcode;


module.exports = (sequelize, DataTypes) => {
  const Passcode = sequelize.define("Passcode", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: [6, 6]
      }
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    studentsUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('student', 'supervisor'),
      defaultValue: 'student',
      allowNull: false,
      validate: {
        isIn: [['student', 'supervisor']]
      }
    }
  }, {
    tableName: "passcodes",
    timestamps: false
  });

  return Passcode;
};