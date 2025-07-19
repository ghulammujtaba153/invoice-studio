import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import connectDB from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return NextResponse.json({ success: true, message: "Login successful", token }, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, message: "Server error. Please try again later." }, { status: 500 });
    }
}
