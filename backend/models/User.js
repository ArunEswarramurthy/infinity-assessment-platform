// // const { DataTypes } = require('sequelize');
// // const sequelize = require('./index'); // Adjust path as needed

// // const User = sequelize.define('User', {
// //   id: {
// //     type: DataTypes.UUID,
// //     defaultValue: DataTypes.UUIDV4,
// //     primaryKey: true,
// //   },
// //   googleId: {
// //     type: DataTypes.STRING,
// //     unique: true,
// //   },
// //   email: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //     unique: true,
// //     validate: {
// //       isEmail: true,
// //     },
// //   },
// //   name: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   },
// //   profilePicture: {
// //     type: DataTypes.STRING,
// //   },
// //   role: {
// //     type: DataTypes.ENUM('user', 'admin'),
// //     defaultValue: 'user',
// //   },
// // }, {
// //   timestamps: true,
// // });

// // module.exports = User;

// // models/User.js
// // const { DataTypes } = require('sequelize');
// // const sequelize = require('../config/db'); // Path to your Sequelize instance

// // const User = sequelize.define('User', {
// //   id: {
// //     type: DataTypes.UUID,
// //     defaultValue: DataTypes.UUIDV4,
// //     primaryKey: true,
// //   },
// //   googleId: {
// //     type: DataTypes.STRING,
// //     unique: true,
// //   },
// //   email: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //     unique: true,
// //     validate: {
// //       isEmail: true,
// //     },
// //   },
// //   name: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   },
// //   profilePicture: {
// //     type: DataTypes.STRING,
// //   },
// //   role: {
// //     type: DataTypes.ENUM('user', 'admin'),
// //     defaultValue: 'user',
// //   },
// // }, {
// //   timestamps: true,
// // });

// // module.exports = User;

// // models/User.js
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     googleId: {
//       type: DataTypes.STRING(255),
//       unique: true,
//       allowNull: true
//     },
//     email: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true
//       }
//     },
//     name: {
//       type: DataTypes.STRING(255),
//       allowNull: false
//     },
//     profilePicture: {
//       type: DataTypes.STRING(512),
//       allowNull: true
//     },
//     role: {
//       type: DataTypes.ENUM('user', 'admin'),
//       defaultValue: 'user'
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: sequelize.literal('CURRENT_TIMESTAMP') // Changed to lowercase sequelize
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') // Changed to lowercase
//     }
//   }, {
//     tableName: 'users',
//     timestamps: true,
//     underscored: true
//   });

//   return User;
// };

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    department: {
      // No physical column in DB; expose as virtual to avoid SELECT failures
      type: DataTypes.VIRTUAL,
      get() {
        return null;
      },
      set(_value) {
        // ignore writes; virtual field
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
        name: 'email'
      }
    ]
  });

  return User;
};