const { io } = require("socket.io-client");
const readline = require("readline");

// Create CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for user ID
rl.question("Enter User ID: ", (userId) => {

  // Connect to backend socket
  const socket = io("http://localhost:5000", {
    transports: ["websocket"], // force websocket (avoid polling issues)
  });

  // When connected
  socket.on("connect", () => {
    console.log("✅ Connected to server");
    console.log("🔌 Socket ID:", socket.id);

    // Register user with server
    socket.emit("register", userId);
    console.log("📌 Registered user:", userId);
  });

  // Listen for task created
  socket.on("taskCreated", (data) => {
    console.log("\n🔥 Task Created Event Received:");
    console.log(JSON.stringify(data, null, 2));
  });

  // Listen for task updated
  socket.on("taskUpdated", (data) => {
    console.log("\n✏️ Task Updated Event Received:");
    console.log(JSON.stringify(data, null, 2));
  });

  // Listen for task deleted
  socket.on("taskDeleted", (data) => {
    console.log("\n❌ Task Deleted Event Received:");
    console.log(JSON.stringify(data, null, 2));
  });

  // Error handling
  socket.on("connect_error", (err) => {
    console.log("❌ Connection Error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Disconnected from server");
  });

});