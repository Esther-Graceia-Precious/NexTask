import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tasksRes, eventsRes] = await Promise.all([
        API.get("/api/admin/stats"),
        API.get("/api/admin/users"),
        API.get("/api/admin/tasks"),
        API.get("/api/admin/events")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/api/admin/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const priorityColors = {
    Low: "#4ecca3", Medium: "#f7b731",
    High: "#ff6b6b", Critical: "#ff4444"
  };

  const statusColors = {
    "Todo": "#6c63ff",
    "In Progress": "#f7b731",
    "Done": "#4ecca3"
  };

  const roleColors = {
    ADMIN: "#ff4444",
    MANAGER: "#f7b731",
    MEMBER: "#4ecca3"
  };

  return (
    <div style={styles.wrapper}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>⚡ NexTask</div>
        <p style={styles.sidebarSub}>Admin Panel</p>

        <nav style={styles.nav}>
          {[
            { id: "overview", icon: "📊", label: "Overview" },
            { id: "tasks", icon: "📋", label: "All Tasks" },
            { id: "users", icon: "👥", label: "Users" },
            { id: "activity", icon: "🔴", label: "Activity Log" }
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.navBtn,
                background: activeTab === tab.id
                  ? "rgba(108,99,255,0.3)"
                  : "transparent",
                color: activeTab === tab.id
                  ? "white"
                  : "rgba(255,255,255,0.5)",
                borderLeft: activeTab === tab.id
                  ? "3px solid #6c63ff"
                  : "3px solid transparent"
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <p style={styles.adminName}>🛡️ {user?.name}</p>
          <button style={styles.backBtn} onClick={() => window.location.href = "/dashboard"}>
            ← Back to App
          </button>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === "overview" && "📊 Overview"}
            {activeTab === "tasks" && "📋 All Tasks"}
            {activeTab === "users" && "👥 User Management"}
            {activeTab === "activity" && "🔴 Activity Log"}
          </h1>
          <button style={styles.refreshBtn} onClick={fetchAll}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && stats && (
              <div>
                <div style={styles.statsGrid}>
                  {[
                    { label: "Total Users", value: stats.totalUsers, color: "#6c63ff", icon: "👥" },
                    { label: "Total Tasks", value: stats.totalTasks, color: "#4ecca3", icon: "📋" },
                    { label: "Completed", value: stats.completedTasks, color: "#4ecca3", icon: "✅" },
                    { label: "In Progress", value: stats.inProgressTasks, color: "#f7b731", icon: "⚡" },
                    { label: "Todo", value: stats.todoTasks, color: "#6c63ff", icon: "📌" },
                    { label: "Overdue", value: stats.overdueTasks, color: "#ff4444", icon: "⚠️" }
                  ].map((stat, i) => (
                    <div key={i} style={{
                      ...styles.statCard,
                      borderTop: `3px solid ${stat.color}`
                    }}>
                      <span style={styles.statIcon}>{stat.icon}</span>
                      <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
                      <p style={styles.statLabel}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <h3 style={styles.sectionTitle}>Recent Activity</h3>
                <div style={styles.activityList}>
                  {events.slice(0, 8).map((e, i) => (
                    <div key={i} style={styles.activityItem}>
                      <span style={styles.activityDot} />
                      <p style={styles.activityText}>{e.details}</p>
                      <span style={styles.activityTime}>{timeAgo(e.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div>
                <p style={styles.tableCount}>{tasks.length} total tasks</p>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["Title", "Assigned To", "Created By", "Priority", "Status", "Deadline", "Action"].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, i) => (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={styles.taskTitle}>{task.title}</span>
                            {task.isOverdue && task.status !== "Done" && (
                              <span style={styles.overdueTag}>⚠️ Overdue</span>
                            )}
                          </td>
                          <td style={styles.td}>{task.assignedTo?.name || "—"}</td>
                          <td style={styles.td}>{task.createdBy?.name || "—"}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.tag,
                              background: (priorityColors[task.priority] || "#666") + "22",
                              color: priorityColors[task.priority] || "#666"
                            }}>
                              {task.priority}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.tag,
                              background: (statusColors[task.status] || "#666") + "22",
                              color: statusColors[task.status] || "#666"
                            }}>
                              {task.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString()
                              : "—"}
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.deleteBtn}
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div>
                <p style={styles.tableCount}>{users.length} total users</p>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["Name", "Email", "Role", "Joined", "Change Role"].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={styles.userName}>👤 {u.name}</span>
                          </td>
                          <td style={styles.td}>{u.email}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.tag,
                              background: (roleColors[u.role] || "#666") + "22",
                              color: roleColors[u.role] || "#666"
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>
                            <select
                              style={styles.roleSelect}
                              value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === user?.id}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="MEMBER">MEMBER</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === "activity" && (
              <div>
                <p style={styles.tableCount}>{events.length} recent events</p>
                <div style={styles.activityFeed}>
                  {events.map((e, i) => (
                    <div key={i} style={styles.feedItem}>
                      <div style={{
                        ...styles.feedDot,
                        background: e.action === "CREATE" ? "#4ecca3"
                          : e.action === "DELETE" ? "#ff4444"
                          : e.action === "COMMENT" ? "#6c63ff"
                          : "#f7b731"
                      }} />
                      <div style={styles.feedBody}>
                        <p style={styles.feedText}>{e.details}</p>
                        <div style={styles.feedMeta}>
                          <span style={{
                            ...styles.actionTag,
                            background: e.action === "CREATE" ? "rgba(78,204,163,0.15)"
                              : e.action === "DELETE" ? "rgba(255,68,68,0.15)"
                              : e.action === "COMMENT" ? "rgba(108,99,255,0.15)"
                              : "rgba(247,183,49,0.15)",
                            color: e.action === "CREATE" ? "#4ecca3"
                              : e.action === "DELETE" ? "#ff4444"
                              : e.action === "COMMENT" ? "#6c63ff"
                              : "#f7b731"
                          }}>
                            {e.action}
                          </span>
                          <span style={styles.feedTime}>{timeAgo(e.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ====== STYLES ======
const styles = {
  wrapper: { display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: "240px", minHeight: "100vh", background: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", padding: "24px 0" },
  sidebarLogo: { fontSize: "20px", fontWeight: 800, color: "white", padding: "0 24px", marginBottom: "4px" },
  sidebarSub: { fontSize: "11px", color: "rgba(255,255,255,0.3)", padding: "0 24px", marginBottom: "32px", textTransform: "uppercase", letterSpacing: "2px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navBtn: { padding: "12px 24px", border: "none", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" },
  sidebarFooter: { padding: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" },
  adminName: { fontSize: "13px", color: "#f7b731", fontWeight: 700, margin: "0 0 8px" },
  backBtn: { padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer", fontSize: "12px" },
  logoutBtn: { padding: "8px 12px", borderRadius: "8px", border: "none", background: "rgba(255,68,68,0.2)", color: "#ff6b6b", cursor: "pointer", fontSize: "12px" },
  main: { flex: 1, padding: "32px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  headerTitle: { margin: 0, color: "white", fontSize: "24px", fontWeight: 800 },
  refreshBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer", fontSize: "13px" },
  loading: { color: "rgba(255,255,255,0.5)", textAlign: "center", paddingTop: "60px", fontSize: "16px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" },
  statIcon: { fontSize: "24px" },
  statValue: { fontSize: "32px", fontWeight: 800, margin: "8px 0 4px" },
  statLabel: { fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0 },
  sectionTitle: { color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "16px" },
  activityList: { display: "flex", flexDirection: "column", gap: "10px" },
  activityItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px" },
  activityDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#6c63ff", flexShrink: 0 },
  activityText: { flex: 1, margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.8)" },
  activityTime: { fontSize: "11px", color: "rgba(255,255,255,0.3)", flexShrink: 0 },
  tableCount: { color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "16px" },
  tableWrapper: { overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 16px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", textAlign: "left" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "14px 16px", color: "rgba(255,255,255,0.8)", fontSize: "13px" },
  taskTitle: { fontWeight: 600, color: "white", display: "block" },
  overdueTag: { fontSize: "10px", color: "#ff4444", display: "block", marginTop: "2px" },
  tag: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  deleteBtn: { padding: "6px 12px", borderRadius: "8px", border: "none", background: "rgba(255,68,68,0.2)", color: "#ff6b6b", cursor: "pointer", fontSize: "12px" },
  userName: { fontWeight: 600, color: "white" },
  roleSelect: { padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "12px", cursor: "pointer" },
  activityFeed: { display: "flex", flexDirection: "column", gap: "8px" },
  feedItem: { display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" },
  feedDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, marginTop: "4px" },
  feedBody: { flex: 1 },
  feedText: { margin: "0 0 6px", fontSize: "13px", color: "rgba(255,255,255,0.85)" },
  feedMeta: { display: "flex", gap: "10px", alignItems: "center" },
  actionTag: { padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 },
  feedTime: { fontSize: "11px", color: "rgba(255,255,255,0.3)" }
};

export default AdminDashboard;