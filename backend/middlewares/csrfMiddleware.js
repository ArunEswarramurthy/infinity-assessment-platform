const crypto = require('crypto');

// Simple CSRF token generation and validation
const csrfTokens = new Map();

const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    // Generate and send CSRF token for GET requests
    const token = generateCSRFToken();
    const userId = req.user?.id || req.ip;
    csrfTokens.set(userId, token);
    res.locals.csrfToken = token;
    return next();
  }

  // Validate CSRF token for state-changing requests
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const userId = req.user?.id || req.ip;
  
  if (!token || !csrfTokens.has(userId) || csrfTokens.get(userId) !== token) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Remove used token
  csrfTokens.delete(userId);
  next();
};

module.exports = { csrfProtection, generateCSRFToken };