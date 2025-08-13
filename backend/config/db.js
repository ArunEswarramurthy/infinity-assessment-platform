// // // // // const { Sequelize } = require('sequelize');

// // // // // const sequelize = new Sequelize('test_platform', 'root', 'nsg007', {
// // // // //   host: 'localhost',
// // // // //   dialect: 'mysql',
// // // // // });

// // // // // module.exports = sequelize;

// // // // // config/db.js
// // // // const { Sequelize } = require('sequelize');
// // // // require('dotenv').config();

// // // // const sequelize = new Sequelize(
// // // //   process.env.DB_NAME,
// // // //   process.env.DB_USER,
// // // //   process.env.DB_PASSWORD,
// // // //   {
// // // //     host: process.env.DB_HOST,
// // // //     dialect: 'mysql',
// // // //     port: process.env.DB_PORT || 3306,
// // // //     logging: console.log,
// // // //     define: {
// // // //       timestamps: true, // Enable automatic timestamps
// // // //       underscored: true // Use snake_case for column names
// // // //     }
// // // //   }
// // // // );

// // // // module.exports = sequelize;


// // // // config/db.js
// // // require('dotenv').config(); // This must be at the VERY TOP
// // // const { Sequelize } = require('sequelize');

// // // // const sequelize = new Sequelize(
// // // //   process.env.DB_NAME,
// // // //   process.env.DB_USER,
// // // //   process.env.DB_PASSWORD,
// // // //   {
// // // //     host: process.env.DB_HOST,
// // // //     dialect: 'mysql',
// // // //     port: process.env.DB_PORT || 3306,
// // // //     logging: console.log,
// // // //     define: {
// // // //       timestamps: true,
// // // //       underscored: true
// // // //     }
// // // //   }
// // // // );
// // // const sequelize = new Sequelize({
// // //   database: process.env.DB_NAME,
// // //   username: process.env.DB_USER,
// // //   password: process.env.DB_PASSWORD,
// // //   host: process.env.DB_HOST,
// // //   port: process.env.DB_PORT || 3306,
// // //   dialect: 'mysql',
// // //   logging: console.log
// // // });

// // // // Test connection immediately
// // // sequelize.authenticate()
// // //   .then(() => console.log('MySQL connected successfully'))
// // //   .catch(err => {
// // //     console.error('MySQL connection error:', err);
// // //     console.log('Current environment variables:', {
// // //       DB_USER: process.env.DB_USER,
// // //       DB_NAME: process.env.DB_NAME,
// // //       DB_HOST: process.env.DB_HOST
// // //     });
// // //   });

// // // module.exports = sequelize;

// // require('dotenv').config();
// // const { Sequelize } = require('sequelize');

// // const sequelize = new Sequelize({
// //   database: process.env.DB_NAME || 'test_platform',
// //   username: process.env.DB_USER || 'root',
// //   password: process.env.DB_PASSWORD || 'nsg007',
// //   host: process.env.DB_HOST || 'localhost',
// //   port: process.env.DB_PORT || 3306,
// //   dialect: 'mysql',
// //   dialectOptions: {
// //     // Newer way to handle authentication for mysql2
// //     authPlugins: {
// //       mysql_native_password: () => require('mysql2').authPlugins.mysql_native_password()
// //     }
// //   },
// //   logging: console.log,
// //   define: {
// //     timestamps: true,
// //     underscored: true
// //   }
// // });

// // // Test connection
// // sequelize.authenticate()
// //   .then(() => console.log('✅ MySQL connection established successfully'))
// //   .catch(err => {
// //     console.error('❌ MySQL connection failed:', err.message);
// //     console.log('Current connection config:', {
// //       database: sequelize.config.database,
// //       username: sequelize.config.username,
// //       host: sequelize.config.host,
// //       port: sequelize.config.port
// //     });
// //   });

// // module.exports = sequelize;

// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize({
//   database: process.env.DB_NAME || 'test_platform',
//   username: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'nsg007',
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3306,
//   dialect: 'mysql',
//   dialectOptions: {
//     // The correct way to handle authentication in mysql2 v2.3.0+
//     authPlugins: {
//       mysql_native_password: () => ({
//         pluginName: 'mysql_native_password',
//         authenticate: ({ password }) => {
//           return Buffer.from(password + '\0');
//         }
//       })
//     }
//   },
//   logging: console.log,
//   define: {
//     timestamps: true,
//     underscored: true
//   },
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// });

// // Test connection
// sequelize.authenticate()
//   .then(() => console.log('✅ MySQL connection established successfully'))
//   .catch(err => {
//     console.error('❌ MySQL connection failed:', err.message);
//     console.log('Current environment variables:', {
//       DB_USER: process.env.DB_USER,
//       DB_NAME: process.env.DB_NAME,
//       DB_HOST: process.env.DB_HOST,
//       DB_PORT: process.env.DB_PORT
//     });
//   });

// module.exports = sequelize;


require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'test_platform',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 60000
  },
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /SequelizeDatabaseError/
    ],
    max: 3
  }
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ MySQL connection established successfully'))
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.log('Current environment variables:', {
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT
    });
  });

module.exports = sequelize;