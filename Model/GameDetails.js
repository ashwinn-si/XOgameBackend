const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    roomID : Number,
    player1Name : String,
    player2Name : String,
    winner : {
        type : String,
        default : "Not Winner Till Now",
    },
    player1Symbol : String,
})

const GameDetailsModel = mongoose.model('GameDetails', Schema);

module.exports =  GameDetailsModel