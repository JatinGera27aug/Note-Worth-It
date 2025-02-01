const ProblemsController = require("../controllers/problemsController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");

router.get('/solve-problem', authMiddleware, upload.single('problemImage'), ProblemsController.solveProblem);
router.get('/retry-solve/:problemId', authMiddleware, ProblemsController.retrySolving);

module.exports = router;