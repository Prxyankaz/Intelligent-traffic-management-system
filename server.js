const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());  // Enable CORS for all origins

// ✅ Serve a basic response for the root URL
app.get('/', (req, res) => {
    res.send('🚀 Traffic Management Backend is Running Successfully!');
});

// ✅ Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log(`🔗 User Connected: ${socket.id}`);

    // Listen for emergency alerts from frontend
    socket.on('emergencyAlert', (data) => {
        console.log('🚨 Emergency Alert Received:', data);
        
        // Broadcast alert to all connected users
        io.emit('showAlert', { message: "🚨 Emergency Alert! Clear the way for an emergency vehicle." });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// Start the server on the assigned port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
