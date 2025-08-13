// // controllers/passcode.controller.js
// const Passcode = require("../models/Passcode");

// // Get latest passcode
// exports.getCurrentPasscode = async (req, res) => {
//   try {
//     const passcode = await Passcode.findOne({
//       order: [["lastUpdated", "DESC"]],
//     });
//     res.json(passcode);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch passcode." });
//   }
// };

// // Generate new passcode
// exports.generatePasscode = async (req, res) => {
//   try {
//     const newCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const newPasscode = await Passcode.create({
//       code: newCode,
//       lastUpdated: new Date(),
//       studentsUsed: 0,
//     });
//     res.json({ message: "New passcode generated", passcode: newPasscode });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to generate passcode." });
//   }
// };

// // Increment student usage count
// exports.incrementUsage = async (req, res) => {
//   try {
//     const passcode = await Passcode.findOne({ order: [["lastUpdated", "DESC"]] });
//     if (!passcode) return res.status(404).json({ error: "No passcode found." });

//     passcode.studentsUsed += 1;
//     await passcode.save();
//     res.json({ message: "Student usage incremented." });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update usage count." });
//   }
// };

// // Validate passcode during login
// exports.validatePasscode = async (req, res) => {
//   const { code } = req.body;
//   try {
//     const passcode = await Passcode.findOne({ order: [["lastUpdated", "DESC"]] });
//     if (!passcode) return res.status(404).json({ valid: false, message: "No active passcode." });

//     const now = new Date();
//     const diff = now - new Date(passcode.lastUpdated);

//     // Validate 24 hours
//     if (diff > 24 * 60 * 60 * 1000) {
//       return res.status(403).json({ valid: false, message: "Passcode expired." });
//     }

//     if (passcode.code === code) {
//       return res.json({ valid: true, message: "Passcode is valid." });
//     } else {
//       return res.status(401).json({ valid: false, message: "Invalid passcode." });
//     }
//   } catch (err) {
//     res.status(500).json({ error: "Validation failed." });
//   }
// };



// controllers/passcode.controller.js
const { Passcode } = require("../models");

// Helper function to get current IST time (UTC+5:30)
function getCurrentIST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  return new Date(utc + istOffset);
}

// Check if passcode needs refresh (at 00:00 UTC which is 05:30 IST)
function needsRefresh(lastUpdated) {
  if (!lastUpdated) return true;
  
  const now = getCurrentIST();
  const updatedTime = new Date(lastUpdated);
  
  // Check if we've crossed 5:30 AM IST since last update
  return (
    now.getDate() !== updatedTime.getDate() || 
    (now.getHours() >= 5 && now.getMinutes() >= 30 && updatedTime.getHours() < 5)
  );
}

// Generate a new passcode of specified type
async function generateNewPasscode(type) {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  return await Passcode.create({
    code: newCode,
    lastUpdated: new Date(),
    studentsUsed: 0,
    type: type
  });
}

// Get latest passcode by type with auto-refresh
async function getCurrentPasscodeByType(type) {
  let passcode = await Passcode.findOne({
    where: { type },
    order: [["lastUpdated", "DESC"]],
  });

  if (!passcode || needsRefresh(passcode.lastUpdated)) {
    passcode = await generateNewPasscode(type);
  }

  return passcode;
}

// Get current student passcode
exports.getCurrentPasscode = async (req, res) => {
  try {
    const passcode = await getCurrentPasscodeByType('student');
    res.json(passcode);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch passcode." });
  }
};

// Get current supervisor passcode
exports.getSupervisorPasscode = async (req, res) => {
  try {
    const passcode = await getCurrentPasscodeByType('supervisor');
    res.json(passcode);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch supervisor passcode." });
  }
};

// Manually generate new student passcode
exports.generatePasscode = async (req, res) => {
  try {
    const newPasscode = await generateNewPasscode('student');
    res.json({ 
      message: "New student passcode generated", 
      passcode: newPasscode 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate passcode." });
  }
};

// Manually generate new supervisor passcode
exports.generateSupervisorPasscode = async (req, res) => {
  try {
    const newPasscode = await generateNewPasscode('supervisor');
    res.json({ 
      message: "New supervisor passcode generated", 
      passcode: newPasscode 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate supervisor passcode." });
  }
};

// Increment usage count for student passcode
exports.incrementUsage = async (req, res) => {
  try {
    const passcode = await Passcode.findOne({
      where: { type: 'student' },
      order: [["lastUpdated", "DESC"]],
    });
    
    if (!passcode) {
      return res.status(404).json({ error: "No student passcode found." });
    }

    passcode.studentsUsed += 1;
    await passcode.save();
    res.json({ message: "Student usage incremented." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update usage count." });
  }
};

// Validate passcode (works for both types)
exports.validatePasscode = async (req, res) => {
  const { code, type = 'student' } = req.body;
  
  try {
    const passcode = await Passcode.findOne({
      where: { type },
      order: [["lastUpdated", "DESC"]],
    });

    if (!passcode) {
      return res.status(404).json({ 
        valid: false, 
        message: `No active ${type} passcode found.` 
      });
    }

    const now = new Date();
    const diff = now - new Date(passcode.lastUpdated);

    // Validate 24 hours
    if (diff > 24 * 60 * 60 * 1000) {
      return res.status(403).json({ 
        valid: false, 
        message: `${type} passcode expired.` 
      });
    }

    if (passcode.code === code) {
      return res.json({ 
        valid: true, 
        message: `${type} passcode is valid.` 
      });
    } else {
      return res.status(401).json({ 
        valid: false, 
        message: `Invalid ${type} passcode.` 
      });
    }
  } catch (err) {
    res.status(500).json({ 
      error: `${type} passcode validation failed.` 
    });
  }
};