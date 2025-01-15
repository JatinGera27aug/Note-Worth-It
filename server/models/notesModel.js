const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'current affair',
    },
    category: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Category"
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String, // Path or URL to the uploaded image
        required: false, // Not required, as notes can exist without an image
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth"
    },
    translatedLanguage: {
        type: String,
        default: null
    },
    translatedDescription: {
        type: String,
        default: null
    },
    translationTimestamp: {
        type: Date,
        default: null
    },
},
    { timestamps: true }
);
const notesModel = mongoose.model("Notes", notesSchema);
module.exports = notesModel;