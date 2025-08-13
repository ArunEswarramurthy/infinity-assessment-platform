const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require('express-session');
const { sequelize } = require("./models");
const initializeDatabase = require('./init-db');
const { 
  generalLimiter, 
  securityHeaders, 
  validateInput, 
  requestLogger 
} = require('./middlewares/securityMiddleware');

// Import all routes at the top to avoid lazy loading
const passcodeRoutes = require("./routes/passcodeRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const challenge = require("./routes/challengeRoutes");
const practice = require("./routes/practiceRoutes");
const answerRoutes = require('./routes/answerRoutes');
const questionRoutes = require('./routes/questionRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');
const aiRoutes = require('./routes/aiRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const codingRoutes = require('./routes/codingRoutes');
const testSessionRoutes = require('./routes/testSessionRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const studentReportsRoutes = require('./routes/studentReportsRoutes');
const testAssignmentRoutes = require('./routes/testAssignmentRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const codeTestRoutes = require('./routes/codeTestRoutes');
const testStartRoutes = require('./routes/testStartRoutes');
const testCompletionRoutes = require('./routes/testCompletionRoutes');
const testTimerRoutes = require('./routes/testTimerRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const autoSaveRoutes = require('./routes/autoSaveRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const studentTestRoutes = require('./routes/studentTestRoutes');
const studentUploadRoutes = require('./routes/studentUploadRoutes');
const testReportRoutes = require('./routes/testReportRoutes');

const app = express();

// Security middleware (apply first)
app.use(securityHeaders);
app.use(requestLogger);
app.use(generalLimiter);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:8080', 
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_PROD
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation middleware
app.use(validateInput);
app.use("/api/passcode", passcodeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/challenges", challenge);
app.use('/api/answers', answerRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/test-session', testSessionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/student', studentReportsRoutes);
app.use('/api/test-assignments', testAssignmentRoutes);
app.use('/api/student-dashboard', studentDashboardRoutes);
app.use('/api/code-test', codeTestRoutes);
app.use('/api/test-start', testStartRoutes);
app.use('/api/test-completion', testCompletionRoutes);
app.use('/api/test-timer', testTimerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/auto-save', autoSaveRoutes);
app.use('/api/admin', adminReportRoutes);
app.use('/api/student/tests', studentTestRoutes);
app.use('/api/admin', studentUploadRoutes);
app.use('/api', testReportRoutes);
app.use("/api/practice", practice);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
  return res.json({ 
    status: "Server is running",
    timestamp: new Date().toISOString(),
    port: 5000
  });
});

// API health check
app.get("/api/health", (req, res) => {
  return res.json({ 
    status: "API is working",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database and models
    await initializeDatabase();
    console.log("✅ Database initialized");

    const server = app.listen(5000, '0.0.0.0', () => {
      console.log("🚀 Server running on http://localhost:5000");
      console.log("🔑 Database-backed passcode system ready");
      console.log("🌐 CORS enabled for frontend connections");
      console.log("✅ All routes registered and ready");
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error('❌ Port 5000 is already in use');
        console.log('💡 Try: netstat -ano | findstr :5000');
        console.log('💡 Or change port in index.js');
      } else {
        console.error('❌ Server error:', error);
      }
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('🔧 Database connection failed. Please check:');
      console.log('- MySQL server is running');
      console.log('- Database "test_platform" exists');
      console.log('- Credentials in .env file are correct');
    }
    
    process.exit(1);
  }
}

startServer();