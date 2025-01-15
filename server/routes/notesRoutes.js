const NotesController = require("../controllers/notesController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");


router.get('/get-notes',authMiddleware, NotesController.getAllNotes);
router.post('/create-note', authMiddleware, upload.single('image'),  NotesController.createNotes);
router.get('/question-gen/:notesId', NotesController.NotesToQuestion);
router.get('/summary/:notesId', NotesController.notesSummary);
// router.get('/extract-note', NotesController.TextfromImage);



module.exports = router;