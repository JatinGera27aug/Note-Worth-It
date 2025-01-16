const QuestionController = require("../controllers/questionController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get('/get-questions/:note', authMiddleware, QuestionController.getQuestions);
router.get('/user-questions', authMiddleware, QuestionController.getUserQuestions);

module.exports = router;

