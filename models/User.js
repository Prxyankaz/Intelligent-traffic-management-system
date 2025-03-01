const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ✅ Define Schema First
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ["normal", "emergency", "admin"], // ✅ Added "admin" role
        default: "normal" 
    }
});

// ✅ Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ Create & Export Model
const User = mongoose.model("User", userSchema);
module.exports = User;
