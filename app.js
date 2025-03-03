const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const gameDetailsModel = require('./Model/GameDetails');
const cors = require('cors');
const FeedbackModel = require('./Model/feedback');

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const GameDetailsModel = require("./Model/GameDetails");

const io = new Server(server, {
    cors: {
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Helper function to get the formatted date
const getFormattedDateAndTime = () => {
    const now = new Date();

    // Convert the date and time to IST (Indian Standard Time)
    const istDateTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Extract and format date as DD-MM-YYYY
    const [datePart] = istDateTime.split(', ');
    const [month, day, year] = datePart.split('/');
    const date = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;

    return date;
};

// Routes
app.get('/', async (req, res) => {
    res.send("Hello, world!");
});

app.post("/feedback", async (req, res) => {
    try {
        const data = req.body;

        const newFeedback = new FeedbackModel({
            Date: getFormattedDateAndTime(),
            Design: data[0].feedback,
            About_Game: data[1].feedback,
            Overall: data[2].feedback,
            ExtraSuggestions: data[3].feedback,
        });

        await newFeedback.save();
        res.status(200).send({ message: "Feedback saved successfully!" });
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).send({ error: "An error occurred while saving feedback." });
    }
});

// Online Mode Socket

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("player1joined",async (data) => {
        const gameDetails = new GameDetailsModel({
            player1Name: data.player1Name,
            roomID: parseInt(data.roomID),
            player1Symbol: data.player1Symbol,
        })
        await gameDetails.save();
        let roomID = parseInt(data.roomID);
        socket.join(roomID);
        socket.send("room created");
    })

    socket.on("getPlayer1Name",async (data) => {
        const roomID = parseInt(data.roomID)
        const gameDetails  = await gameDetailsModel.findOne({
            roomID : roomID
        })
        socket.emit("player1NameGetter",{player1Name : gameDetails.player1Name});
    })


    socket.on("findRoom",async (data) => {
        const roomID = parseInt(data.roomID)
        const player2Name = data.player2Name
        const gameData = await gameDetailsModel.find({
            roomID: roomID,
        })
        if(gameData.length > 0){
            socket.join(roomID);
            await gameDetailsModel.findOneAndUpdate({
                roomID : roomID
            }, {
                player2Name : player2Name
            })
            socket.emit("message", { message: "room found", player1Symbol: gameData[0].player1Symbol });
        }else{
            socket.send("room not found")
        }
    })

    socket.on("getPlayer2Name",async (data) => {
        const roomID = parseInt(data.roomID)
        const gameDetails  = await gameDetailsModel.findOne({
            roomID : roomID
        })
        socket.emit("player2NameGetter",{player1Name : gameDetails.player1Name, player2Name : gameDetails.player2Name});
        socket.to(roomID).emit("player2Joined",{player2Name : gameDetails.player2Name})
    })

    socket.on("startGame",(data)=>{
        const roomID = parseInt(data.roomID)
        socket.to(roomID).emit("player1GameStarted")
    })

    //game arena socket
    socket.on("getPlayer1Player2Symbol",async (data) =>{
        const roomID = parseInt(data.roomID)
        const gameDetails  = await gameDetailsModel.findOne({
            roomID : roomID
        })

        socket.to(roomID).emit("player1player2Symbol",{player1Symbol : gameDetails.player1Symbol})
    })

    socket.on("player1MoveSend",(data)=>{
        const roomID = parseInt(data.roomID)
        socket.to(roomID).emit("player1MoveRecieve",{move : data.move})
    })
    socket.on("player2MoveSend",(data)=>{
        const roomID = parseInt(data.roomID)
        socket.to(roomID).emit("player2MoveRecieve",{move : data.move})
    })

    socket.on("getPlayer1Name",async (data1)=>{
        const roomID = parseInt(data1.roomID)
        const data = await GameDetailsModel.findOne({roomID : roomID});
        const name = data.player1Name;
        socket.to(roomID).emit("sendPlayerName",{name})
    })

    socket.on("getPlayer2Name",async (data1)=>{
        const roomID = parseInt(data1.roomID)
        const data = await GameDetailsModel.findOne({roomID : roomID});
        const name = data.player2Name;
        await GameDetailsModel.findOneAndUpdate({roomID : roomID},{
            roomID : 0,
            winner : name
        })
        socket.to(roomID).emit("sendPlayerName",{name})
    })
});

// Start the server
server.listen(5000, () => {
    console.log("Server started on port 5000");
});
