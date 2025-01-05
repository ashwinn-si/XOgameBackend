const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const FeedbackModel = require('./Model/feedback');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors())

const getFormattedDateAndTime = () => {
    const now = new Date();

    // Convert the date and time to IST (Indian Standard Time)
    const istDateTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Extract and format date as DD-MM-YYYY
    const [datePart, timePart] = istDateTime.split(', ');
    const [month, day, year] = datePart.split('/');
    const date = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;


    return date;
};

app.get('/', async (req, res) => {
    res.send("ehllo")
})

app.post("/feedback",async (req, res) => {
    const data = req.body;
    const newFeedback = new FeedbackModel({
        Date : getFormattedDateAndTime(),
        Design: data[0].feedback,
        About_Game: data[1].feedback,
        Overall: data[2].feedback,
        ExtraSuggestions: data[3].feedback,
    })
    await newFeedback.save();
    res.sendStatus(200);
})

app.listen(5000,()=>{
    console.log("Server started")
})