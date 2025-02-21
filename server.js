const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();//Creates a web server.
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" } // Allow all origins (change for production)
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('emergencyAlert', (data) => {
        console.log('Emergency Alert:', data);
        io.emit('showAlert', { message: "🚨 Emergency Alert! Clear the way for an emergency vehicle." });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
