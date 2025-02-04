const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        // enum: ["Book", "Blog Post", "Article", "Video", "Website", "Course", "Educational Platform", "Online Learning", "Report", "Podcast", "Website/Social Media","Educational Platform", "Other", "Book Chapter", "Video", "Course Material", "Unknown"], // Expandable as needed
        // required: true,
        default: "Other",
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
    includeInsights: { type: Boolean, default: false }, // Flag for insights
}, { timestamps: true });

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;