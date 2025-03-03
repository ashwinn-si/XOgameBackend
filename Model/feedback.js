const mongoose = require('mongoose');
require("dotenv").config();

const mongoURI = process.env.mongoURI;

mongoose.connect(mongoURI).then(() => {
    console.log("Connected to Database");
})

const FeedbackSchema = new mongoose.Schema({
    Date : String,
    Design : Number,
    About_Game : Number,
    Overall : Number,
    ExtraSuggestions : String
})

const model = mongoose.model("Feedback", FeedbackSchema);

module.exports = model;