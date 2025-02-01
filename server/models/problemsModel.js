const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    problem: {
        type: String,
        required: true,
    },
    solution: {
        type: String,
        default: null
    },
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth"
        },
},
    { timestamps: true }
);
const problemModel = mongoose.model("Problems", problemSchema);
module.exports = problemModel;