const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { sanitizeForLog } = require('../utils/security');

// Rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`Rate limit exceeded for IP: ${sanitizeForLog(req.ip)}`);
      res.status(429).json({ success: false, error: message });
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP');

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts');

// File upload rate limiter
const uploadLimiter = createRateLimiter(60 * 1000, 10, 'Too many file uploads');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize common injection patterns
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    }
    return value;
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
    } else {
      obj = sanitizeValue(obj);
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        });
      }

      // Check file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Only Excel and CSV files are allowed.'
        });
      }

      // Sanitize filename
      file.originalname = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 100);
    }
  }
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: sanitizeForLog(req.url),
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: sanitizeForLog(req.ip),
      userAgent: sanitizeForLog(req.get('User-Agent') || 'Unknown')
    };
    
    console.log(`${logData.method} ${logData.url} ${logData.status} ${logData.duration} - ${logData.ip}`);
  });
  
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  validateInput,
  fileUploadSecurity,
  requestLogger
};