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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/auth", authRoutes);

// ✅ Serve Traffic Management System page
app.get("/traffic.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "traffic.html"));
});
app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});


// ✅ WebSocket Handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("emergencyAlert", (data) => {
        console.log("Emergency Alert:", data);
        io.emit("showAlert", { message: "🚨 Emergency Alert! Clear the way for an emergency vehicle." });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
