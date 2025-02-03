const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Book", "Website", "Video", "Article", "Course", "Podcast", "Website/Social Media", "Blog", "Educational Platform", "Online Learning", "Other", "Report"], // Expandable as needed
        required: true,
    },
    url: {
        type: String,
        required: false,
    },
    description: {
        type: String,
    },
    relevanceScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    contextId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Context",
        required: true,
    },
}, { timestamps: true });

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;