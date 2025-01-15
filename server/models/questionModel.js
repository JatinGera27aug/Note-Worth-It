const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questions: {
        type: String,
        required: true,
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notes"
    },
},
    { timestamps: true }
);
const questionModel = mongoose.model("Questions", questionSchema);
module.exports = questionModel;