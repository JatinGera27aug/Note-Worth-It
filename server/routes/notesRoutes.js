const NotesController = require("../controllers/notesController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");


router.get('/get-notes',authMiddleware, NotesController.getAllNotes);
router.get('/get-note/:notesId', authMiddleware, NotesController.ViewSingleNote);
router.post('/create-note', authMiddleware, upload.single('image'),  NotesController.createNotes);
router.patch('/update-note/:notesId', authMiddleware, NotesController.updateNotes);
router.get('/question-gen/:notesId', NotesController.NotesToQuestion);
router.post('/summary/:notesId', NotesController.notesSummary);
// router.get('/extract-note', NotesController.TextfromImage);
router.post('/translate/:notesId', authMiddleware, NotesController.translateNote);
// router.delete('/delete-note/:notesId', authMiddleware, NotesController.deleteNote);
// router.post('/update-note/:notesId', authMiddleware, NotesController.updateNote);
router.post('/rewrite/:notesId', authMiddleware, NotesController.rewriteNote);
router.patch('/undo-rewrite/:notesId', authMiddleware, NotesController.undoRewrite);

router.post('/improve-grammar/:notesId', authMiddleware, NotesController.ImproveGrammar);

// context related routes
router.post('/get-context/:notesId', authMiddleware, NotesController.getOrCreateContext);
router.post('/suggest-resources/:notesId', authMiddleware, NotesController.suggestResources);
router.post('/resources/:notesId', authMiddleware, NotesController.suggestResourcesSerper);

// story/poem related routes
router.get('/continue-story/:notesId', authMiddleware, NotesController.ContinueStoryText);

// current affairs notes gen routes
router.post('/current-affairs-notes', authMiddleware, NotesController.CurrentAffairsNotes);
router.get('/current-affairs-notes', authMiddleware, NotesController.getCurrentAffairsNotes);



module.exports = router;