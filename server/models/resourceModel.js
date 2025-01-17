const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Book", "Website", "Video", "Article", "Course", "Podcast"], // Expandable as needed
        required: true,
    },
    url: {
        type: String,
        required: true,
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