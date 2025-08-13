const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model functions
const testModel = require("./test.model");
const sectionModel = require("./section.model");
const mcqModel = require("./mcq");
const userModel = require("./User");
const passcodeModel = require("./Passcode");
const licenseModel = require("./License");
const licensedUserModel = require("./LicensedUser");
const practiceSectionModel = require("./PracticeSection");
const subtitleModel = require("./Subtitle");
const topicModel = require("./Topic");
const answerModel = require("./Answer");
const questionModel = require("./Question");
const departmentModel = require("./Department");
const classModel = require("./Class");
const testAssignmentModel = require("./TestAssignment");
const practiceResultModel = require("./PracticeResult");
const studentAnswerModel = require("./StudentAnswer");
const questionBankModel = require("./QuestionBank");
const codingQuestionModel = require("./CodingQuestion");
const codeSubmissionModel = require("./CodeSubmission");
const testSessionModel = require("./TestSession");
const sectionSubmissionModel = require("./SectionSubmission");
const sectionScoreModel = require("./SectionScore");

// Initialize Sequelize models
const db = {
  sequelize,
  Sequelize,
  Test: testModel(sequelize, DataTypes),
  Section: sectionModel(sequelize, DataTypes),
  MCQ: mcqModel(sequelize, DataTypes),
  User: userModel(sequelize, DataTypes),
  Passcode: passcodeModel(sequelize, DataTypes),
  License: licenseModel(sequelize, DataTypes),
  LicensedUser: licensedUserModel(sequelize, DataTypes),
  PracticeSection: practiceSectionModel(sequelize, DataTypes),
  Subtitle: subtitleModel(sequelize, DataTypes),
  Topic: topicModel(sequelize, DataTypes),
  Answer: answerModel(sequelize, DataTypes),
  Question: questionModel(sequelize, DataTypes),
  Department: departmentModel(sequelize, DataTypes),
  Class: classModel(sequelize, DataTypes),
  TestAssignment: testAssignmentModel(sequelize, DataTypes),
  PracticeResult: practiceResultModel(sequelize, DataTypes),
  StudentAnswer: studentAnswerModel(sequelize, DataTypes),
  QuestionBank: questionBankModel(sequelize, DataTypes),
  CodingQuestion: codingQuestionModel(sequelize, DataTypes),
  CodeSubmission: codeSubmissionModel(sequelize, DataTypes),
  TestSession: testSessionModel(sequelize, DataTypes),
  SectionSubmission: sectionSubmissionModel(sequelize, DataTypes),
  SectionScore: sectionScoreModel(sequelize, DataTypes)
};

// Test -> Section -> MCQ
db.Test.hasMany(db.Section, { foreignKey: "testId" });
db.Section.belongsTo(db.Test, { foreignKey: "testId" });

db.Section.hasMany(db.MCQ, { foreignKey: "sectionId" });
db.MCQ.belongsTo(db.Section, { foreignKey: "sectionId" });

// License -> LicensedUser
db.License.hasMany(db.LicensedUser, {
  foreignKey: "license_id",
  as: "users",
});
db.LicensedUser.belongsTo(db.License, {
  foreignKey: "license_id",
  as: "license",
});

// PracticeSection -> Subtitle -> Topic
db.PracticeSection.hasMany(db.Subtitle, {
  foreignKey: "sectionId",
  as: "subtitles",
  onDelete: "CASCADE",
});
db.Subtitle.belongsTo(db.PracticeSection, {
  foreignKey: "sectionId",
});

db.Subtitle.hasMany(db.Topic, {
  foreignKey: "subtitleId",
  as: "topics",
  onDelete: "CASCADE",
});
db.Topic.belongsTo(db.Subtitle, {
  foreignKey: "subtitleId",
});

// Topic -> Question
db.Topic.hasMany(db.Question, {
  foreignKey: "topicId",
  as: "questions",
  onDelete: "CASCADE",
});
db.Question.belongsTo(db.Topic, {
  foreignKey: "topicId",
});

// User -> Answer
db.User.hasMany(db.Answer, {
  foreignKey: "studentId",
  as: "answers",
});
db.Answer.belongsTo(db.User, {
  foreignKey: "studentId",
  as: "student",
});

// Question -> Answer
db.Question.hasMany(db.Answer, {
  foreignKey: "questionId",
  as: "answers",
});
db.Answer.belongsTo(db.Question, {
  foreignKey: "questionId",
  as: "question",
});

// Department -> Class
db.Department.hasMany(db.Class, {
  foreignKey: "departmentId",
  as: "classes"
});
db.Class.belongsTo(db.Department, {
  foreignKey: "departmentId",
  as: "department"
});

// Test -> TestAssignment
db.Test.hasMany(db.TestAssignment, {
  foreignKey: "testId",
  as: "assignments",
  onDelete: "CASCADE"
});
db.TestAssignment.belongsTo(db.Test, {
  foreignKey: "testId",
  as: "test",
  onDelete: "CASCADE"
});

// Topic -> PracticeResult
db.Topic.hasMany(db.PracticeResult, {
  foreignKey: "topic_id",
  as: "results",
  onDelete: "CASCADE"
});
db.PracticeResult.belongsTo(db.Topic, {
  foreignKey: "topic_id",
  as: "topic"
});

// Question -> StudentAnswer
db.Question.hasMany(db.StudentAnswer, {
  foreignKey: "question_id",
  as: "studentAnswers",
  onDelete: "CASCADE"
});
db.StudentAnswer.belongsTo(db.Question, {
  foreignKey: "question_id",
  as: "question"
});

// Section -> CodingQuestion
db.Section.hasMany(db.CodingQuestion, {
  foreignKey: "sectionId",
  as: "codingQuestions",
  onDelete: "CASCADE"
});
db.CodingQuestion.belongsTo(db.Section, {
  foreignKey: "sectionId",
  as: "section"
});

// CodingQuestion -> CodeSubmission
db.CodingQuestion.hasMany(db.CodeSubmission, {
  foreignKey: "codingQuestionId",
  as: "submissions",
  onDelete: "CASCADE"
});
db.CodeSubmission.belongsTo(db.CodingQuestion, {
  foreignKey: "codingQuestionId",
  as: "codingQuestion"
});

// TestSession associations
db.Test.hasMany(db.TestSession, {
  foreignKey: "testId",
  as: "sessions",
  onDelete: "CASCADE"
});
db.TestSession.belongsTo(db.Test, {
  foreignKey: "testId",
  as: "test"
});

// User -> TestSession associations (CRITICAL FIX)
// TestSession -> SectionScore
db.TestSession.hasMany(db.SectionScore, {
  foreignKey: 'testSessionId',
  as: 'sectionScores',
  onDelete: 'CASCADE'
});
db.SectionScore.belongsTo(db.TestSession, {
  foreignKey: 'testSessionId',
  as: 'testSession'
});

// Section -> SectionScore
db.Section.hasMany(db.SectionScore, {
  foreignKey: 'sectionId',
  as: 'sectionScores',
  onDelete: 'CASCADE'
});
db.SectionScore.belongsTo(db.Section, {
  foreignKey: 'sectionId',
  as: 'section'
});

db.User.hasMany(db.TestSession, {
  foreignKey: "studentId",
  as: "testSessions",
  onDelete: "CASCADE"
});
db.TestSession.belongsTo(db.User, {
  foreignKey: "studentId",
  as: "student"
});

// LicensedUser -> TestSession associations (CRITICAL FIX)
db.LicensedUser.hasMany(db.TestSession, {
  foreignKey: "studentId",
  as: "testSessions",
  onDelete: "CASCADE"
});
db.TestSession.belongsTo(db.LicensedUser, {
  foreignKey: "studentId",
  as: "licensedStudent"
});

db.TestSession.hasMany(db.SectionSubmission, {
  foreignKey: "testSessionId",
  as: "submissions",
  onDelete: "CASCADE"
});
db.SectionSubmission.belongsTo(db.TestSession, {
  foreignKey: "testSessionId",
  as: "session"
});

db.Section.hasMany(db.SectionSubmission, {
  foreignKey: "sectionId",
  as: "submissions",
  onDelete: "CASCADE"
});
db.SectionSubmission.belongsTo(db.Section, {
  foreignKey: "sectionId",
  as: "section"
});



module.exports = db;