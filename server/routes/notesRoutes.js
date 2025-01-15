const NotesController = require("../controllers/notesController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


router.get('/get-notes',authMiddleware, NotesController.getAllNotes);
router.post('/create-note', authMiddleware, NotesController.createNotes);
router.get('/question-gen/:notesId', NotesController.NotesToQuestion);
router.get('/summary/:notesId', NotesController.notesSummary);



module.exports = router;