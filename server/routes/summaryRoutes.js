const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const SummaryController = require("../controllers/summaryController");

router.get("/get", authMiddleware, SummaryController.getUserSummaries);
router.get("/note-summary/:noteId", authMiddleware, SummaryController.getNoteSummary);

module.exports = router;