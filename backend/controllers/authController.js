const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User, LicensedUser } = require("../models");
const config = require("../routes/config");

const client = new OAuth2Client(config.google.clientId);

// Always allowed emails
const ALWAYS_ALLOWED_EMAILS = [
  'e22ec018@shanmugha.edu.in',
  'vinothkumar@shanmugha.edu.in'
];

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: "Token is required" 
      });
    }

    if (!config.google.clientId) {
      return res.status(500).json({ 
        success: false, 
        error: "Google Client ID not configured" 
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    const lcEmail = (email || '').toLowerCase();

    // Check if email is always allowed (case-insensitive)
    if (ALWAYS_ALLOWED_EMAILS.includes(lcEmail)) {
      let user = await User.findOne({ where: { email: lcEmail } });
      
      if (!user) {
        user = await User.create({
          googleId,
          email: lcEmail,
          name,
          profilePicture: picture,
        });
      }
      
      const jwtToken = generateToken(user);
      return res.json({
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role,
        },
      });
    }

    // Check if email exists in license_user table
    const licensedUser = await LicensedUser.findOne({ where: { email: lcEmail } });
    
    if (!licensedUser) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Email not found in licensed users."
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { email: lcEmail } });

    if (!user) {
      user = await User.create({
        googleId,
        email: lcEmail,
        name: licensedUser.name || name,
        profilePicture: picture,
      });
    } else {
      // Keep user record in sync with Google auth
      user.googleId = user.googleId || googleId;
      user.profilePicture = picture;
      user.name = user.name || licensedUser.name || name;
      await user.save();
    }

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
};

// Standard login with email and SIM number
exports.standardLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lcEmail = (email || '').toLowerCase();
    
    if (!lcEmail || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // Check if email is always allowed
    if (ALWAYS_ALLOWED_EMAILS.includes(lcEmail)) {
      let user = await User.findOne({ where: { email: lcEmail } });
      
      if (!user) {
        user = await User.create({ email: lcEmail, name: lcEmail.split('@')[0] });
      }
      
      const jwtToken = generateToken(user);
      return res.json({
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Check licensed user with email and sin_number as password
    const licensedUser = await LicensedUser.findOne({ 
      where: { 
        email: lcEmail, 
        sin_number: password,
        activated: true 
      } 
    });
    
    if (!licensedUser) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or SIM number, or account not activated"
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { email: lcEmail } });
    
    if (!user) {
      user = await User.create({
        email: lcEmail,
        name: licensedUser.name,
      });
    }

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Standard login error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "profilePicture", "role"],
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
};