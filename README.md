#  NexTask — Real-Time Collaborative Task Manager

A production-ready, full-stack real-time collaborative task management system built for teams. NexTask features live updates, role-based access control, conflict resolution, and a full admin panel.

---

##  Features

### Real-Time Collaboration
- Live task updates across all connected clients via Socket.IO
- Real-time notifications with toast popups
- Online user presence indicator
- Targeted socket emissions (only relevant users receive updates)

### Task Management
- Kanban board with three columns — Todo, In Progress, Done
- Priority levels — Low, Medium, High, Critical
- Deadline tracking with automatic overdue detection (cron job)
- Version-based conflict resolution — prevents simultaneous edit conflicts
- Full comment system with real-time delivery

### Role-Based Access Control (RBAC)
| Feature | Admin | Manager | Member |
|---|---|---|---|
| Create tasks | Yes | Yes | No |
| Edit task details | Yes | Yes (own) | No |
| Change task status | Yes | Yes | Yes (assigned only) |
| Delete tasks | Yes | Yes (own) | No |
| Admin panel | Yes | No | No |
| Manage users | Yes | No | No |

### Admin Panel
- Overview stats — total users, tasks, completed, overdue
- Full task management — view and delete any task
- User management — change roles in real time
- Activity log — full event history with color coded actions

### Notifications
- Persistent notification bell with unread count badge
- Notifications stored in MongoDB — survive page refresh
- Auto mark as read on open
- Time ago timestamps

---

##  Tech Stack

### Backend
- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — Database
- **Socket.IO** — Real-time bidirectional communication
- **JWT** — Authentication with role in payload
- **bcrypt** — Password hashing
- **node-cron** — Scheduled overdue task detection

### Frontend
- **React** + **Vite** — UI
- **Axios** — HTTP client with JWT interceptor
- **Socket.IO Client** — Real-time updates
- **Context API** — Auth state management

---

##  Project Structure
```
nextask/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── notificationsController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Notifications.js
│   │   ├── Task.js
│   │   └── Users.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── taskRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── board/
│   │   │       └── TaskCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── App.jsx
│   └── index.html
└── README.md
```

---

##  Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Esther-Graceia-Precious/NexTask.git
cd NexTask
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
ADMIN_NAME=John Doe
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourpassword
```

### 3. Create the admin user
```bash
node scripts/createAdmin.js
```

### 4. Start the backend
```bash
npm run dev
```

### 5. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

### 6. Open the app
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

##  Authentication

NexTask uses JWT-based authentication. The token is stored in `localStorage` and attached to every API request via an Axios interceptor. The JWT payload includes `userId` and `role` for server-side authorization.

---

## Real-Time Architecture
```
Client A (Manager)          Server              Client B (Member)
     |                         |                       |
     |-- PUT /api/tasks/:id -->|                       |
     |                         |-- taskUpdated ------->|
     |<-- taskUpdated ---------|                       |
     |                         |                       |
```

- Each user registers their `socketId` on connection
- The server maintains a `users` map of `userId → socketId`
- Events are emitted only to the task's creator and assignee
- No broadcast to all clients — targeted delivery only

---

## Conflict Resolution

NexTask uses optimistic concurrency control with a `version` field on every task:

1. Client reads task at `version: 3`
2. Client submits update with `version: 3`
3. Server checks if DB version still equals `3`
4. If yes → update succeeds, version becomes `4`
5. If no → server returns `409 Conflict`
6. Client shows alert and refetches latest data

---

## Default Roles

| Role | Description |
|---|---|
| ADMIN | Full system access + admin panel |
| MANAGER | Create and manage tasks |
| MEMBER | Can only change status of assigned tasks |

To create an admin user:
```bash
cd backend
node scripts/createAdmin.js
```

---

## API Endpoints

### Auth
```
POST   /auth/register        Register new user
POST   /auth/login           Login and get JWT token
```

### Tasks
```
GET    /api/tasks            Get tasks for logged in user
POST   /api/tasks            Create task (Manager/Admin only)
PUT    /api/tasks/:id        Update task
DELETE /api/tasks/:id        Delete task (creator only)
POST   /api/tasks/:id/comments   Add comment
GET    /api/events           Get activity events
```

### Notifications
```
GET    /api/notifications         Get notifications for user
PUT    /api/notifications/read    Mark all as read
```

### Admin
```
GET    /api/admin/stats           System stats
GET    /api/admin/users           All users
PUT    /api/admin/users/:id/role  Update user role
GET    /api/admin/tasks           All tasks
DELETE /api/admin/tasks/:id       Delete any task
GET    /api/admin/events          All events
```

## Author

Built a project demonstrating real-time systems, role-based access control, and full-stack development.

---

## 📄 License

MIT License — feel free to use this project for learning or as a base for your own applications.
