const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notes',
        required: true,
        unique: true, // Ensures one context per note
    },
    keyTopics: {
        type: [String], // Array of key topics extracted from the note
        required: true,
    },
    educationalLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced'],
        required: false,
        default: 'beginner'
    },
    learningGoals: {
        type: [String], // Array of potential learning goals
        required: false,
    },
    skills: {
        type: [String], // Array of complementary skills or knowledge areas
        required: false,
    },
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Context', contextSchema);
