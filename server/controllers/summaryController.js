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
            return res.json({ message: "No notes found for the user", summaries: [] });
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
            return res.json({ message: "No summaries found for the user's notes", summaries: [] });
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
            // Check Redis cache first
            const cachedSummary = await redisClient.get(`Summary:${noteId}`);
            if (cachedSummary) {
                console.log("Cached Summary Retrieved:");
                return res.status(200).json(JSON.parse(cachedSummary));
            }

            const summary = await Summary.findOne({ note: noteId })
                .populate({
                    path: "note",
                    select: "title category description",
                });

            if (!summary) {
                return res.status(404).json({ 
                    message: "Summary not found for the specified note. Would you like to generate it?",
                    canGenerate: true 
                });
            }

             // Cache the summary
             await redisClient.set(
                `Summary:${noteId}`, 
                JSON.stringify(summary), 
                'EX', 
                3600 // 1 hour cache expiration
            );

            return res.json({ message: "Summary fetched successfully", summary });
        
    }
    catch(err){
        console.error('Get Note Summary Error:', err);
            return res.status(500).json({
                message: "Internal server error", 
                error: err.message
            });
    }
};


}

module.exports = SummaryController;