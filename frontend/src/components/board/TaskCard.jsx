import { useState, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const priorityColors = {
  Low: "#4ecca3",
  Medium: "#f7b731",
  High: "#ff6b6b",
  Critical: "#ff4444"
};

const priorityIcons = {
  Low: "🟢",
  Medium: "🟡",
  High: "🟠",
  Critical: "🔴"
};

function TaskCard({ task, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority || "Medium",
    deadline: task.deadline ? task.deadline.split("T")[0] : ""
  });
  const { user } = useContext(AuthContext);

  // only creator can edit everything
  // only creator can edit task details
  const canEdit =
    task.createdBy?._id === user?.id ||
    task.createdBy?._id === user?._id;

  // only assignee can change status
  const canChangeStatus =
  task.assignedTo?._id?.toString() === user?.id?.toString() ||
  task.assignedTo?._id?.toString() === user?._id?.toString();

  console.log("assignedTo._id:", task.assignedTo?._id);
  console.log("user.id:", user?.id);
  console.log("canChangeStatus:", canChangeStatus);

  const isOverdue = task.isOverdue && task.status !== "Done";

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await API.put(`/api/tasks/${task._id}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        deadline: task.deadline,
        version: task.version
      });
      onUpdate();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("⚠️ Conflict! Task was updated by someone else. Refreshing...");
        onUpdate();
      }
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/api/tasks/${task._id}`);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = async () => {
    setUpdating(true);
    try {
      await API.put(`/api/tasks/${task._id}`, {
        ...editForm,
        version: task.version
      });
      setShowEdit(false);
      onUpdate();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("⚠️ Conflict! Task was already updated by someone else.");
        onUpdate();
      }
    }
    setUpdating(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await API.post(`/api/tasks/${task._id}/comments`, {
        text: commentText,
        userName: user?.name
      });
      setCommentText("");
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      ...styles.card,
      border: isOverdue
        ? "1px solid rgba(255,68,68,0.5)"
        : "1px solid rgba(255,255,255,0.1)"
    }}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badges}>
          {task.priority && (
            <span style={{
              ...styles.priorityBadge,
              background: priorityColors[task.priority] + "22",
              color: priorityColors[task.priority]
            }}>
              {priorityIcons[task.priority]} {task.priority}
            </span>
          )}
          {isOverdue && (
            <span style={styles.overdueBadge}>⚠️ Overdue</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {canEdit && (
            <button
              style={styles.editBtn}
              onClick={() => setShowEdit(true)}
            >
              ✏️
            </button>
          )}
          {canEdit && (
            <button style={styles.deleteBtn} onClick={handleDelete}>✕</button>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 style={styles.title}>{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p style={styles.desc}>{task.description}</p>
      )}

      {/* Assigned + Deadline */}
      <div style={styles.metaRow}>
        <span style={styles.assigned}>
          👤 {task.assignedTo?.name || "Unassigned"}
        </span>
        {task.deadline && (
          <span style={{
            ...styles.deadline,
            color: isOverdue ? "#ff4444" : "rgba(255,255,255,0.4)"
          }}>
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Created by */}
      <p style={styles.createdBy}>
        🛠️ Created by {task.createdBy?.name || "Unknown"}
      </p>

      {/* Status selector */}
      <select
        style={{
          ...styles.select,
          opacity: canChangeStatus ? 1 : 0.4,
          cursor: canChangeStatus ? "pointer" : "not-allowed"
        }}
        value={task.status}
        disabled={updating || !canChangeStatus}
        onChange={e => handleStatusChange(e.target.value)}
      >
        <option value="Todo">Todo</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      {/* View only label */}
      {!canChangeStatus && (
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "-6px 0 8px" }}>
          👁️ View only
        </p>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.version}>v{task.version}</span>
        <button
          style={styles.commentToggle}
          onClick={() => setShowComments(!showComments)}
        >
          💬 {task.comments?.length || 0} comments
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={styles.commentsSection}>
          {task.comments?.length === 0 && (
            <p style={styles.noComments}>No comments yet</p>
          )}
          {task.comments?.map((c, i) => (
            <div key={i} style={styles.comment}>
              <span style={styles.commentAuthor}>{c.postedByName}: </span>
              <span style={styles.commentText}>{c.text}</span>
            </div>
          ))}
          <div style={styles.commentInputRow}>
            <input
              style={styles.commentField}
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddComment()}
            />
            <button style={styles.sendBtn} onClick={handleAddComment}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal — only for creator */}
      {showEdit && (
        <div style={editStyles.overlay}>
          <div style={editStyles.modal}>
            <h3 style={{ margin: "0 0 16px", color: "white", fontSize: "16px" }}>
              ✏️ Edit Task
            </h3>

            <label style={editStyles.label}>Title</label>
            <input
              style={editStyles.input}
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            />

            <label style={editStyles.label}>Description</label>
            <textarea
              style={{ ...editStyles.input, height: "80px", resize: "none" }}
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            />

            <label style={editStyles.label}>Priority</label>
            <select
              style={editStyles.input}
              value={editForm.priority}
              onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Critical">🔴 Critical</option>
            </select>

            <label style={editStyles.label}>Deadline</label>
            <input
              style={editStyles.input}
              type="date"
              value={editForm.deadline}
              onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
            />

            <label style={editStyles.label}>Status</label>
            <select
              style={editStyles.input}
              value={editForm.status}
              onChange={e => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                style={editStyles.cancelBtn}
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                style={editStyles.saveBtn}
                onClick={handleEdit}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px",
    transition: "transform 0.2s"
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "10px"
  },
  badges: { display: "flex", gap: "6px", flexWrap: "wrap" },
  priorityBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 700
  },
  overdueBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 700,
    background: "rgba(255,68,68,0.15)", color: "#ff4444"
  },
  editBtn: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "12px"
  },
  deleteBtn: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "12px"
  },
  title: { margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "white" },
  desc: { fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "0 0 6px", lineHeight: 1.5 },
  metaRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "4px"
  },
  assigned: { fontSize: "12px", color: "#4ecca3" },
  deadline: { fontSize: "11px" },
  createdBy: {
    fontSize: "11px", color: "rgba(255,255,255,0.3)",
    margin: "0 0 10px"
  },
  select: {
    width: "100%", padding: "7px 10px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)", color: "white",
    fontSize: "12px", marginBottom: "10px"
  },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  version: { fontSize: "10px", color: "rgba(255,255,255,0.2)" },
  commentToggle: {
    background: "transparent", border: "none",
    color: "#6c63ff", cursor: "pointer", fontSize: "12px", padding: 0
  },
  commentsSection: {
    marginTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "12px"
  },
  noComments: {
    fontSize: "12px", color: "rgba(255,255,255,0.3)",
    textAlign: "center", margin: "0 0 10px"
  },
  comment: {
    marginBottom: "8px", paddingLeft: "8px",
    borderLeft: "2px solid #6c63ff"
  },
  commentAuthor: { fontSize: "11px", fontWeight: 700, color: "white", marginRight: "4px" },
  commentText: { fontSize: "12px", color: "rgba(255,255,255,0.6)" },
  commentInputRow: { display: "flex", gap: "6px", marginTop: "10px" },
  commentField: {
    flex: 1, padding: "7px 10px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)", color: "white",
    fontSize: "12px", outline: "none"
  },
  sendBtn: {
    padding: "7px 14px", borderRadius: "8px", border: "none",
    background: "#6c63ff", color: "white", cursor: "pointer",
    fontSize: "12px", fontWeight: 600
  }
};

const editStyles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 999
  },
  modal: {
    background: "#1a1a2e", borderRadius: "20px",
    padding: "28px", width: "420px",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex", flexDirection: "column", gap: "10px",
    maxHeight: "90vh", overflowY: "auto"
  },
  label: {
    fontSize: "12px", fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase", letterSpacing: "1px"
  },
  input: {
    padding: "11px 14px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)", color: "white",
    fontSize: "14px", outline: "none", width: "100%",
    boxSizing: "border-box", fontFamily: "inherit"
  },
  cancelBtn: {
    flex: 1, padding: "11px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent", color: "white", cursor: "pointer"
  },
  saveBtn: {
    flex: 2, padding: "11px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #6c63ff, #2d6aff)",
    color: "white", fontWeight: 700, cursor: "pointer"
  }
};

export default TaskCard;