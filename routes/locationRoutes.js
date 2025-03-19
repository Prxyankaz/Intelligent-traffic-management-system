const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Update user location
router.post("/update-location", async (req, res) => {
    const { userId, latitude, longitude } = req.body;

    if (!userId || latitude == null || longitude == null) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        await User.findByIdAndUpdate(userId, {
            location: { type: "Point", coordinates: [longitude, latitude] }
        });

        res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error updating location" });
    }
});

module.exports = router;
