const questionModel = require('../models/questionModel');
const Notes = require('../models/notesModel');
const redisClient = require('../config/redis');
class QuestionController {


    static getUserQuestions = async (req, res) => {
        const user = req.user._id;
        try {
            const userNotes = await Notes.find({ user }).select("_id");

            if (!userNotes.length) {
                return { message: "No notes found for the user", questions: [] };
            }

            // Extract note IDs
            const noteIds = userNotes.map(note => note._id);

            // populate nested fields
            const questions = await questionModel.find({ note: { $in: noteIds } })
                .populate({
                    path: "note", // Populate note details
                    select: "title category user", // Include title, category, and user
                    populate: { path: "user", select: "username email" } // Nested population for user details
                });

            if (!questions.length) {
                return res.json({ message: "No questions found for the user's notes", questions: [] });
            }

            return res.json({ message: "Questions fetched successfully", questions });
        } catch (error) {
            console.error("Error fetching user questions:", error);
            return res.status(500).json({ message: "Failed to fetch User Questions" });
        }
    };

    static getQuestions = async (req, res) => {  // of particular note
        const { note } = req.params;
        try {

            const isNote = await Notes.findById(note);
            if (!isNote) {
                return res.status(404).json({ message: "Note not found" });
            }

            // Check Redis cache first
            const cachedQuestions = await redisClient.get(`Questions:${note}`);
            if (cachedQuestions) {
                console.log("Cached Questions Retrieved:");
                return res.status(200).json(JSON.parse(cachedQuestions));
            }

            const questions = await questionModel.find({ note })
                .populate({
                    path: "note",
                    select: "title category description",
                });

            // Handle no questions scenario
            if (questions.length === 0) {
                // Cache the empty result to prevent repeated database calls
                // await redisClient.set(
                //     `Questions:${note}`, 
                //     JSON.stringify([]), 
                //     'EX', 
                //     1800 // 30 minutes cache for empty result
                // );
                return res.status(404).json({ message: "No questions found for the specified note" });
            }

            // Cache the questions
            await redisClient.set(
                `Questions:${note}`, 
                JSON.stringify(questions), 
                'EX', 
                3600 // 1 hour cache expiration
            );

            return res.json({ message: "Questions fetched successfully", questions });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };


}

module.exports = QuestionController;