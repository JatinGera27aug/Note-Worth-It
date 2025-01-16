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
    paraphrased_text: {  // frontend pr user ctrl z kr skta, but ek baar save krne ke baad, need to show inplace of description
        // and still can undo this to description, need to null this also, as warna pta kaise chlega kisko permanent rkhna hain for other features
        type: String,
        default: null
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