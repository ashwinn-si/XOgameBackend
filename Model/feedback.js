const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://root:n0SFsK3VoT2p2Box@detailscluster.hu83z.mongodb.net/FeedBack?retryWrites=true&w=majority&appName=DetailsCluster";

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

const model = mongoose.model("XOgame", FeedbackSchema);

module.exports = model;