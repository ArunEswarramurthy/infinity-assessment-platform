// Security utility functions

/**
 * Sanitize input for logging to prevent log injection
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeForLog(input) {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove or encode dangerous characters that could break log integrity
  return input
    .replace(/[\r\n]/g, '') // Remove newlines
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 100); // Limit length
}

/**
 * Validate and sanitize file paths to prevent path traversal
 * @param {string} filePath - File path to validate
 * @param {string} allowedDir - Allowed base directory
 * @returns {string|null} - Sanitized path or null if invalid
 */
function sanitizeFilePath(filePath, allowedDir) {
  const path = require('path');
  
  if (!filePath || typeof filePath !== 'string') {
    return null;
  }
  
  // Normalize the path to resolve any .. or . segments
  const normalizedPath = path.normalize(filePath);
  
  // Resolve to absolute path
  const resolvedPath = path.resolve(allowedDir, normalizedPath);
  const resolvedAllowedDir = path.resolve(allowedDir);
  
  // Check if the resolved path is within the allowed directory
  if (!resolvedPath.startsWith(resolvedAllowedDir)) {
    return null;
  }
  
  return resolvedPath;
}

/**
 * Sanitize SQL input to prevent injection
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeSQLInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove dangerous SQL characters and keywords
  return input
    .replace(/[';\\-]/g, '') // Remove SQL comment and statement terminators
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '') // Remove dangerous keywords
    .trim();
}

/**
 * Generate CSRF token
 * @returns {string} - CSRF token
 */
function generateCSRFToken() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @param {string} sessionToken - Session token
 * @returns {boolean} - Whether token is valid
 */
function validateCSRFToken(token, sessionToken) {
  return token && sessionToken && token === sessionToken;
}

module.exports = {
  sanitizeForLog,
  sanitizeFilePath,
  sanitizeSQLInput,
  generateCSRFToken,
  validateCSRFToken
};