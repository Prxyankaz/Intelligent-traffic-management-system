// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./authRoutes");
const http = require("http");
const socketIo = require("socket.io");
const geolib = require("geolib"); // For calculating distances

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "TrafficDB"
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Authentication Routes
app.use("/auth", authRoutes);
app.use(express.static(path.join(__dirname, 'public')));
// ✅ Store Connected Users with Location
let users = {};

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("updateLocation", (location) => {
        users[socket.id] = location;
        console.log(`📍 User ${socket.id} updated location:`, location);
    });

    socket.on("emergencyAlert", (data) => {
        console.log("🚨 Emergency alert received:", data);

        Object.keys(users).forEach((userId) => {
            if (geolib.getDistance(users[userId], data.location) <= 5000) {
                io.to(userId).emit("showAlert", { message: "🚨 Emergency Vehicle Nearby!" });
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
        delete users[socket.id];
    });
});

// ✅ Incident Reporting Route
const Incident = mongoose.model("Incident", new mongoose.Schema({
    type: String,
    description: String,
    location: { lat: Number, lng: Number },
    timestamp: { type: Date, default: Date.now }
}));

app.post("/reportIncident", async (req, res) => {
    try {
        const { type, description, location } = req.body;
        const newIncident = new Incident({ type, description, location });
        await newIncident.save();

        io.emit("newIncident", newIncident);
        res.status(201).json({ message: "Incident reported successfully" });
    } catch (error) {
        console.error("❌ Error reporting incident:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
