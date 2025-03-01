const mongoose = require("mongoose");

// ✅ Define Schema First
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["normal", "emergency"], default: "normal" } // ✅ Ensure role is included
});

// ✅ Hash password before saving (if modified)
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ Create & Export Model
const User = mongoose.model("User", UserSchema);
module.exports = User;
