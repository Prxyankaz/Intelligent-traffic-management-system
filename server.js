const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require("firebase-admin");



// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        token_uri: process.env.FIREBASE_TOKEN_URI,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// ✅ Enable CORS
app.use(cors());

// ✅ Serve static files correctly
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ WebSocket Handling
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

// ✅ Use dynamic PORT for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { admin, db };

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

