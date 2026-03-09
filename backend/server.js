const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes.js');
const authRoutes = require("./routes/authRoutes.js");
const cron = require('node-cron');
const Task = require('./models/Task');
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const users = {};
app.set("users", users);
app.set("io", io);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nextask-q6ib.onrender.com",
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api", notificationRoutes);
app.use("/api", adminRoutes);


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ADD THIS
  socket.on("register", (userId) => {
    users[userId.trim()] = socket.id;
    console.log(`User registered: ${userId} → ${socket.id}`);
    console.log("Current users map:", users);
  });

  socket.on('disconnect', () => {
    // ADD THIS — clean up when user disconnects
    for (const [userId, sockId] of Object.entries(users)) {
      if (sockId === socket.id) {
        delete users[userId];
        console.log(`User removed from map: ${userId}`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

cron.schedule('0 * * * *', async () => {
  // mark overdue
  await Task.updateMany(
    { deadline: { $lt: new Date() }, status: { $ne: 'Done' }, isOverdue: false },
    { $set: { isOverdue: true } }
  );
  // reset overdue if deadline was pushed to future
  await Task.updateMany(
    { deadline: { $gt: new Date() }, isOverdue: true },
    { $set: { isOverdue: false } }
  );
});

server.listen(5000, () => {
  console.log(`Server running on port 5000`);
});