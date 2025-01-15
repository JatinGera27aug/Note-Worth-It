const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
    summary: {
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
const summaryModel = mongoose.model("Summary", summarySchema);
module.exports = summaryModel;