
require('dotenv').config();

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { isKeyObject } = require('util/types');


//Inititalize the Express App
const app = express();

//Create an HTTP server
const server = http.createServer(app);

//Initialize the Socket.io seerver

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

//Middleware to serve static files

app.use(express.static('public'))

//Endpoint for basic health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
})

//Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
   
    // Join Room (for Chat rooms)
    socket.on('joinRoom', ({ room }) => {
        if (typeof room === 'string' && room.trim() !== '') {
            socket.join(room);
            console.log(`Client ${socket.id} joined room: ${room}`);
        }
    });

    //Handle incoming chat messages
    socket.on('chatMessage', ({ room, message, username }) => {
        //Perform basic validation 
        if (typeof message !== 'string' || message.trim() === '' || typeof username !== 'string' || username.trim() === '') {
            return;
        }

        const msgData = {
            message,
            username,
            timestamp: new Date().toISOString()
        };

        //Broadcast the message to the specific room or to all
        if (typeof room === 'string' && room.trim() !== '') {
            io.to(room).emit('chatMessage', msgData);
        }
        else {
            io.emit('chatMessage', msgData)
        }
    });

    //Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

});

//Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

