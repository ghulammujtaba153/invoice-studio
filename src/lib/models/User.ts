import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Name is required for all users
    },
    email: {
        type: String,
        required: true, // Email is required for all users
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: function () {
            // Password is required only for email/password users
            return this.provider === "email";
        },
    },
    image: {
        type: String,
        default: "", // Image is optional (Google/Apple provides it, email/password may not)
    },
    provider: {
        type: String,
        required: true,
        enum: ["email", "google", "apple"], // Track the registration provider
        default: "email", // Default to email/password registration
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values for non-Google users
    },
    appleId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values for non-Apple users
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Check if the model already exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;