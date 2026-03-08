import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import TaskCard from "../components/board/TaskCard";

// ====== COLUMN ======
function Column({ title, tasks, onUpdate }) {
  const colors = {
    "Todo": "#6c63ff",
    "In Progress": "#f7b731",
    "Done": "#4ecca3"
  };

  return (
    <div style={colStyles.column}>
      <div style={{ ...colStyles.header, borderBottom: `2px solid ${colors[title]}` }}>
        <span>{title}</span>
        <span style={{ ...colStyles.count, background: colors[title] }}>
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 && (
        <p style={colStyles.empty}>No tasks</p>
      )}
      {tasks.map(task => (
        <TaskCard key={task._id} task={task} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

// ====== CREATE TASK MODAL ======
function CreateTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToName: "",
    priority: "Medium",
    deadline: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.assignedToName) {
      setError("Title and assigned user are required");
      return;
    }
    setLoading(true);
    try {
      await API.post("/api/tasks", form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
    setLoading(false);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>✨ Create New Task</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Task Title *</label>
          <input
            style={modalStyles.input}
            placeholder="e.g. Build login page"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Description</label>
          <textarea
            style={{ ...modalStyles.input, height: "80px", resize: "none" }}
            placeholder="What needs to be done?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Assign To *</label>
          <input
            style={modalStyles.input}
            placeholder="Enter exact name"
            value={form.assignedToName}
            onChange={e => setForm({ ...form, assignedToName: e.target.value })}
          />
        </div>

        <div style={modalStyles.row}>
          <div style={{ flex: 1 }}>
            <label style={modalStyles.label}>Priority</label>
            <select
              style={modalStyles.input}
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Critical">🔴 Critical</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={modalStyles.label}>Deadline</label>
            <input
              style={modalStyles.input}
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>

        {error && <div style={modalStyles.error}>⚠️ {error}</div>}

        <div style={modalStyles.btnRow}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={modalStyles.createBtn}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Task →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====== NOTIFICATION BELL ======
function NotificationBell({ onNewNotification }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/api/notifications");
      setNotifications(res.data);
      setUnread(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (onNewNotification) onNewNotification(fetchNotifications);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unread > 0) {
      try {
        await API.put("/api/notifications/read");
        setUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const typeIcon = (type) => {
    switch (type) {
      case "taskCreated": return "📋";
      case "taskUpdated": return "✏️";
      case "taskDeleted": return "🗑️";
      case "newComment": return "💬";
      default: return "🔔";
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button style={bellStyles.bell} onClick={handleOpen}>
        🔔
        {unread > 0 && (
          <span style={bellStyles.badge}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      {open && (
        <div style={bellStyles.dropdown}>
          <div style={bellStyles.dropdownHeader}>
            <span style={bellStyles.dropdownTitle}>Notifications</span>
            <span style={bellStyles.dropdownCount}>
              {notifications.length} total
            </span>
          </div>
          <div style={bellStyles.list}>
            {notifications.length === 0 && (
              <p style={bellStyles.empty}>No notifications yet</p>
            )}
            {notifications.map((n, i) => (
              <div key={i} style={{
                ...bellStyles.item,
                background: n.read ? "transparent" : "rgba(108,99,255,0.12)",
                borderLeft: n.read ? "3px solid transparent" : "3px solid #6c63ff"
              }}>
                <span style={bellStyles.itemIcon}>{typeIcon(n.type)}</span>
                <div style={bellStyles.itemBody}>
                  <p style={bellStyles.itemMsg}>{n.message}</p>
                  <span style={bellStyles.itemTime}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====== MAIN DASHBOARD ======
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const refreshBellRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchTasks();
    socket.connect();

    socket.on("connect", () => {
      socket.emit("register", user.id);
    });

    socket.on("taskCreated", (data) => {
      setTasks(prev => [data.task, ...prev]);
      addToast(`📋 New task: ${data.task.title}`);
      refreshBellRef.current?.();
    });

    socket.on("taskUpdated", (data) => {
      setTasks(prev =>
        prev.map(t => t._id === data.task._id ? data.task : t)
      );
      addToast(`✏️ Task updated: ${data.task.title}`);
      refreshBellRef.current?.();
    });

    socket.on("taskDeleted", (data) => {
      setTasks(prev => prev.filter(t => t._id !== data.taskId));
      addToast(`🗑️ A task was deleted`);
      refreshBellRef.current?.();
    });

    socket.on("onlineUsers", (users) => {
      setOnlineCount(users.length);
    });

    socket.on("newComment", (data) => {
      setTasks(prev => prev.map(t => {
        if (t._id === data.taskId) {
          return { ...t, comments: [...(t.comments || []), data.comment] };
        }
        return t;
      }));
      addToast(`💬 New comment on a task`);
      refreshBellRef.current?.();
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("onlineUsers");
      socket.off("newComment");
      socket.disconnect();
    };
  }, []);

  return (
    <div style={dashStyles.wrapper}>

      {/* Navbar */}
      <div style={dashStyles.navbar}>
        <span style={dashStyles.logo}>⚡ NexTask</span>
        <div style={dashStyles.navRight}>
          <span style={dashStyles.online}>🟢 {onlineCount} online</span>
          {user?.role === "ADMIN" && (
            <a href="/admin" style={dashStyles.adminLink}>
              🛡️ Admin
            </a>
          )}
          <NotificationBell onNewNotification={(fn) => { refreshBellRef.current = fn; }} />
          <span style={dashStyles.username}>👤 {user?.name}</span>
          <button style={dashStyles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Toast notifications */}
      <div style={dashStyles.toastWrapper}>
        {toasts.map(n => (
          <div key={n.id} style={dashStyles.toast}>{n.msg}</div>
        ))}
      </div>

      {/* Header */}
      <div style={dashStyles.header}>
        <h2 style={{ margin: 0, color: "white" }}>My Workspace</h2>
        {user?.role !== "MEMBER" && (
          <button style={dashStyles.createBtn} onClick={() => setShowModal(true)}>
            + Create Task
          </button>
        )}
      </div>

      {/* Board */}
      <div style={dashStyles.board}>
        {["Todo", "In Progress", "Done"].map(col => (
          <Column
            key={col}
            title={col}
            tasks={tasks.filter(t => t.status === col)}
            onUpdate={fetchTasks}
          />
        ))}
      </div>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}

// ====== STYLES ======
const dashStyles = {
  wrapper: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" },
  logo: { fontSize: "22px", fontWeight: 800, color: "white" },
  navRight: { display: "flex", alignItems: "center", gap: "20px" },
  online: { fontSize: "13px", color: "#4ecca3" },
  username: { fontSize: "14px", color: "rgba(255,255,255,0.7)" },
  adminLink: { fontSize: "13px", color: "#f7b731", textDecoration: "none", fontWeight: 700, padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(247,183,49,0.3)" },
  logoutBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer" },
  toastWrapper: { position: "fixed", top: "80px", right: "20px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 1000 },
  toast: { background: "#6c63ff", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", color: "white", boxShadow: "0 4px 20px rgba(108,99,255,0.4)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px" },
  createBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#6c63ff", color: "white", fontWeight: 700, cursor: "pointer" },
  board: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", padding: "0 32px 32px" }
};

const colStyles = {
  column: { background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", color: "white", fontWeight: 700 },
  count: { borderRadius: "20px", padding: "2px 10px", fontSize: "12px", color: "white" },
  empty: { color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "20px 0" }
};

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#1a1a2e", borderRadius: "20px", padding: "32px", width: "460px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { margin: 0, color: "white", fontSize: "18px", fontWeight: 700 },
  closeBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", gap: "12px" },
  label: { fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" },
  input: { padding: "11px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
  error: { color: "#ff6b6b", fontSize: "13px", padding: "10px 14px", background: "rgba(255,107,107,0.1)", borderRadius: "8px", border: "1px solid rgba(255,107,107,0.2)" },
  btnRow: { display: "flex", gap: "10px", marginTop: "4px" },
  cancelBtn: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer", fontSize: "14px" },
  createBtn: { flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #6c63ff, #2d6aff)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "14px" }
};

const bellStyles = {
  bell: { position: "relative", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", padding: "4px 8px", borderRadius: "8px" },
  badge: { position: "absolute", top: "-4px", right: "-4px", background: "#ff4444", color: "white", fontSize: "10px", fontWeight: 700, borderRadius: "10px", padding: "1px 5px", minWidth: "16px", textAlign: "center" },
  dropdown: { position: "absolute", top: "44px", right: 0, width: "320px", background: "#1a1a2e", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 9999, overflow: "hidden" },
  dropdownHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  dropdownTitle: { color: "white", fontWeight: 700, fontSize: "14px" },
  dropdownCount: { color: "rgba(255,255,255,0.4)", fontSize: "12px" },
  list: { maxHeight: "360px", overflowY: "auto" },
  empty: { color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "30px 0" },
  item: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" },
  itemIcon: { fontSize: "16px", marginTop: "2px" },
  itemBody: { flex: 1 },
  itemMsg: { margin: "0 0 4px", fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 },
  itemTime: { fontSize: "11px", color: "rgba(255,255,255,0.35)" }
};

export default Dashboard;