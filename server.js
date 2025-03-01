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

// ✅ Authentication Routes
app.use("/auth", authRoutes);

// ✅ Serve Static Pages with Role-Based Redirection
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html"))); // Normal User
app.get("/traffic", (req, res) => res.sendFile(path.join(__dirname, "public", "traffic.html"))); // Emergency Vehicle Driver
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html"))); // Admin Page

// ✅ Secure API Key Endpoint
app.get("/api/maps-key", (req, res) => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ message: "Google Maps API key not set" });
    }
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// ✅ WebSocket Handling for Emergency Alerts
const usersByPage = { dashboard: [], traffic: [], admin: [] };

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // 📌 Handle page selection by user
    socket.on("joinPage", (page) => {
        console.log(`👤 User ${socket.id} joined ${page} page`);

        // Remove from any previous page list
        Object.keys(usersByPage).forEach((key) => {
            usersByPage[key] = usersByPage[key].filter((id) => id !== socket.id);
        });

        // Add to the correct page
        if (usersByPage[page]) {
            usersByPage[page].push(socket.id);
        }
    });

    // 📌 Handle Emergency Alerts
    socket.on("emergencyAlert", (data) => {
        console.log("🚨 Emergency alert received:", data);

        // Send alert ONLY to users on dashboard and admin pages
        [...usersByPage.dashboard, ...usersByPage.admin].forEach((id) => {
            io.to(id).emit("showAlert", { message: "🚨 Emergency Alert! Clear the way for an emergency vehicle." });
        });
    });

    // 📌 Handle Disconnection
    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);

        // Remove from all page lists
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
