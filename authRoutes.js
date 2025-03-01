const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const router = express.Router();
require("dotenv").config(); // Ensure environment variables are loaded

// ✅ User Registration
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log("🔹 Received Registration Data:", { username, email, role });

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log("❌ User already exists:", email);
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with role
        user = new User({ username, email, password: hashedPassword, role });
        await user.save();
        console.log("✅ User registered successfully:", user);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Validate role (prevent users from switching roles manually)
        if (user.role !== role) {
            return res.status(403).json({ message: `Access denied for role: ${role}` });
        }

        // Generate JWT token including role
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// ✅ Fetch Current User Role (For Frontend)
router.get("/user", async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ username: user.username, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
