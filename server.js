require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./authRoutes");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Connect to MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "TrafficDB"
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Models
const Incident = mongoose.model("Incident", new mongoose.Schema({
    description: String,
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
}));

// ✅ Authentication Routes
app.use("/auth", authRoutes);

// ✅ Serve Static Pages with Role-Based Redirection
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/traffic", (req, res) => res.sendFile(path.join(__dirname, "public", "traffic.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// ✅ Secure API Key Endpoint
app.get("/api/maps-key", (req, res) => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ message: "Google Maps API key not set" });
    }
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// ✅ Incident Reporting
app.post("/api/incidents", async (req, res) => {
    try {
        const { description, latitude, longitude } = req.body;
        if (!description || !latitude || !longitude) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const incident = new Incident({ description, latitude, longitude });
        await incident.save();
        res.status(201).json({ message: "Incident reported successfully" });
    } catch (error) {
        console.error("❌ Error reporting incident:", error);
        res.status(500).json({ message: "Failed to report incident" });
    }
});

app.get("/api/incidents", async (req, res) => {
    try {
        const incidents = await Incident.find();
        res.status(200).json(incidents);
    } catch (error) {
        console.error("❌ Error fetching incidents:", error);
        res.status(500).json({ message: "Failed to retrieve incidents" });
    }
});

// ✅ WebSocket Handling for Emergency Alerts
const usersByPage = { dashboard: [], traffic: [], admin: [] };

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("joinPage", (page) => {
        console.log(`👤 User ${socket.id} joined ${page} page`);
        Object.keys(usersByPage).forEach((key) => {
            usersByPage[key] = usersByPage[key].filter((id) => id !== socket.id);
        });
        if (usersByPage[page]) {
            usersByPage[page].push(socket.id);
        }
    });

    socket.on("emergencyAlert", (data) => {
        console.log("🚨 Emergency alert received:", data);
        [...usersByPage.dashboard, ...usersByPage.admin].forEach((id) => {
            io.to(id).emit("showAlert", { message: "🚨 Emergency Alert! Clear the way for an emergency vehicle." });
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
        Object.keys(usersByPage).forEach((key) => {
            usersByPage[key] = usersByPage[key].filter((id) => id !== socket.id);
        });
    });
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});



// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
