const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },  // 🔹 Don't return password by default
    role: { type: String, required: true, enum: ["user", "emergency_vehicle"] },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
});

// Enable geospatial queries
userSchema.index({ location: "2dsphere" });

// 🔹 Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔹 Method to compare hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
