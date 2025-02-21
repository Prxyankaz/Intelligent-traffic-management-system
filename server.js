const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require("firebase-admin");
const bodyParser = require('body-parser');



// Initialize Firebase Admin SDK
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

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" } // Allow all origins (change for security)
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Signup route
app.post('/signup', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const userRecord = await admin.auth().createUser({ email, password });
        await db.collection("users").doc(userRecord.uid).set({ email, role });
        res.status(201).json({ message: "User created successfully", userId: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email } = req.body;
    try {
        const userSnapshot = await db.collection("users").where("email", "==", email).get();
        if (userSnapshot.empty) return res.status(404).json({ error: "User not found" });
        const userData = userSnapshot.docs[0].data();
        res.status(200).json({ role: userData.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

// Function to load environment variables (if using dotenv)
