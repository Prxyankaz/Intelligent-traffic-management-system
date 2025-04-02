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
router.post("/report-incident", async (req, res) => {
    try {
        const { location, description } = req.body;

        // Validation
        if (!location || !description) {
            return res.status(400).json({ message: "Location and description are required" });
        }

        // Save Incident
        await Incident.create({ location, description });
        res.json({ message: "Incident reported successfully" });
    } catch (error) {
        console.error("Error reporting incident:", error);
        res.status(500).json({ message: "Error reporting incident" });
    }
});


module.exports = router;
