const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/Users");

async function createAdmin() {
  console.log("Connecting to MongoDB...");
  console.log("URI found:", process.env.MONGO_URI ? "✅" : "❌");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected ");

  const name = process.env.ADMIN_NAME || "John Doe";
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "changeme123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("User already exists — updating role to ADMIN");
    existing.role = "ADMIN";
    await existing.save();
    console.log("Role updated to ADMIN for:", email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "ADMIN"
  });

  console.log("Admin user created successfully");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Role: ADMIN");

  process.exit(0);
}

createAdmin().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
