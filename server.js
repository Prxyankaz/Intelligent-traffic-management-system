const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }  // Allow all origins (change for security)
});

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Your Firebase service key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trafficmanagementsystem-dfb3e.firebaseio.com"
});

const db = admin.firestore();
module.exports = { admin, db };



// Enable CORS
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket handling
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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
