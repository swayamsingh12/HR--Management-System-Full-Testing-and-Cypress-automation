import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/database.js";

dotenv.config();

const createAllUsers = async () => {
  try {
    await connectDB();

    const users = [
      {
        email: "admin@hrms.com",
        password: "admin123",
        role: "admin",
      },
      {
        email: "hr@hrms.com",
        password: "123456",
        role: "hr",
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(
          `⚠️  ${userData.role.toUpperCase()} user already exists: ${userData.email}`,
        );
        console.log("🔄 Deleting existing user to recreate...");
        await User.deleteOne({ email: userData.email });
      }

      // Don't hash password manually - let the User model's pre-save hook handle it
      const user = await User.create({
        email: userData.email,
        password: userData.password, // Plain password - will be hashed by pre-save hook
        role: userData.role,
        isActive: true,
      });

      console.log(
        `✅ ${userData.role.toUpperCase()} user created successfully!`,
      );
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🔑 Password: ${userData.password}`);
    }

    console.log("\n✅ All users created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 Admin User:");
    console.log("   Email: admin@hrms.com");
    console.log("   Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 HR User:");
    console.log("   Email: hr@hrms.com");
    console.log("   Password: 123456");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  Please change passwords after first login!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating users:", error.message);
    process.exit(1);
  }
};

createAllUsers();
