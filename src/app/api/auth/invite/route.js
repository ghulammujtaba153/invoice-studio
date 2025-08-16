import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
    try {
        const { name, email, role = "user", password="password" } = await request.json();

        if (!name || !email) {
            return NextResponse.json(
                { success: false, message: "Name and email are required" },
                { status: 400 }
            );
        }

        if (!email.includes('@')) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid email" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Encrypt the default password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with invited status
        const newUser = new User({
            name,
            email,
            role,
            status: "invited",
            provider: "email",
            password: hashedPassword
        });

        await newUser.save();

        // Generate JWT token for invitation (valid for 24 hours)
        const invitationToken = jwt.sign(
            { 
                userId: newUser._id, 
                email: newUser.email, 
                type: "invitation" 
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Create invitation URL
        const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/set-password?token=${invitationToken}`;

        // Gmail SMTP Transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Send invitation email
        await transporter.sendMail({
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'You have been invited to join our platform',
            text: `Hello ${name},\n\nYou have been invited to join our platform. Please click the link below to set your password and complete your registration:\n\n${invitationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to Our Platform!</h2>
                    <p>Hello ${name},</p>
                    <p>You have been invited to join our platform. Please click the button below to set your password and complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">Set Password & Join</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                    <p style="color: #666; font-size: 14px;">If you can't click the button, copy and paste this link into your browser:</p>
                    <p style="color: #666; font-size: 12px; word-break: break-all;">${invitationUrl}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">Best regards,<br>The Team</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: "User invited successfully. Invitation email sent.",
            userId: newUser._id
        }, { status: 201 });

    } catch (error) {
        console.error("Invitation error:", error);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again later." },
            { status: 500 }
        );
    }
}