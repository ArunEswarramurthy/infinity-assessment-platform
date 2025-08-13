// // routes/passcode.routes.js
// const express = require("express");
// const router = express.Router();
// const passcodeController = require("../controllers/passcodeController");

// router.get("/current", passcodeController.getCurrentPasscode);
// router.post("/generate", passcodeController.generatePasscode);
// router.post("/increment", passcodeController.incrementUsage);
// router.post("/validate", passcodeController.validatePasscode);

// module.exports = router;


// routes/passcode.routes.js
const express = require("express");
const router = express.Router();
const passcodeController = require("../controllers/passcodeController");

// Student passcode routes
router.get("/current", passcodeController.getCurrentPasscode);
router.post("/generate", passcodeController.generatePasscode);

// Supervisor passcode routes
router.get("/supervisor", passcodeController.getSupervisorPasscode);
router.post("/supervisor/generate", passcodeController.generateSupervisorPasscode);

// Common routes
router.post("/increment", passcodeController.incrementUsage);
router.post("/validate", passcodeController.validatePasscode);

module.exports = router;