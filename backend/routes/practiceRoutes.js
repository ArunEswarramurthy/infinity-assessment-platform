const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const practiceResultController = require("../controllers/practiceResultController");
const { csrfProtection } = require('../middlewares/csrfMiddleware');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, "uploads/");
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/sections", practiceController.getAllSections);
router.post("/section", csrfProtection, upload.array("files"), practiceController.createSection);
router.delete("/section/:id", csrfProtection, practiceController.deleteSection);
router.get("/download", practiceController.downloadFile);
router.get("/questions/:topicId", practiceController.getTopicQuestions);
router.get("/topic/:topicId", practiceController.getTopicData);
router.post("/result", csrfProtection, practiceResultController.savePracticeResult);
router.get("/dashboard/:studentId", practiceController.getStudentDashboard);

module.exports = router;
