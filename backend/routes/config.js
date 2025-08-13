require('dotenv').config();

module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: '30d',
  },
};