const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/Users");

async function createAdmin() {
  console.log("Connecting to:", process.env.MONGO_URI ? "URI found ✅" : "URI missing ❌");
  
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: "john@gmail.com" });
  if (existing) {
    console.log("Admin already exists — updating role to ADMIN");
    existing.role = "ADMIN";
    await existing.save();
    console.log("✅ Role updated to ADMIN");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("123456", 10);
  
  await User.create({
    name: "John Doe",
    email: "john@gmail.com",
    password: hashedPassword,
    role: "ADMIN"
  });

  console.log("✅ Admin user created successfully");
  console.log("Email: john@gmail.com");
  console.log("Password: 123456");
  process.exit(0);
}

createAdmin().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});