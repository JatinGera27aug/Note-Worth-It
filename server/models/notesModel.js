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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth"
    },
},
    { timestamps: true }
);
const notesModel = mongoose.model("Notes", notesSchema);
module.exports = notesModel;