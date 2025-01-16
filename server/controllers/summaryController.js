const Notes = require('../models/notesModel');
const authModel = require("../models/authModel");
const Summary = require('../models/summaryModel.js')
const redisClient = require('../config/redis');

class SummaryController {
    
    static getUserSummaries = async (req,res) => {
        const user = req.user._id;
        // console.log(user);
    try {
        // Step 1: Find all notes belonging to the user
        const userNotes = await Notes.find({ user }).select("_id");
        // console.log(userNotes);

        if (!userNotes.length) {
            return { message: "No notes found for the user", summaries: [] };
        }

        // Extract note IDs
        const noteIds = userNotes.map(note => note._id);
        // console.log(noteIds);
  
        // populate nested fields
        const summaries = await Summary.find({ note: { $in: noteIds } })
            .populate({
                path: "note", // Populate note details
                select: "title category user", // Include title, category, and user
                populate: { path: "user", select: "username email" } // Nested population for user details
            });

        if (!summaries.length) {
            return { message: "No summaries found for the user's notes", summaries: [] };
        }

        return res.json({ message: "Summaries fetched successfully", summaries });
    } catch (error) {
        console.error("Error fetching user summaries:", error);
        throw new Error("Failed to fetch user summaries");
    }
};


    static getNoteSummary = async (req,res) => {
        const noteId = req.params.noteId;
        try {
            const summary = await Summary.findOne({ note: noteId })
                .populate({
                    path: "note",
                    select: "title category description",
                });

            if (!summary) {
                throw new Error("Summary not found for the specified note. would you like to generate it?");
            }

            return res.json({ message: "Summary fetched successfully", summary });
        
    }
    catch(err){
        res.status(500).json({message: "Internal server error", error: err.message})
    }
};


}

module.exports = SummaryController;