import { useState } from "react";
import API from "../../services/api";

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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>✨ Create New Task</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Task Title *</label>
          <input
            style={styles.input}
            placeholder="e.g. Build login page"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, height: "80px", resize: "none" }}
            placeholder="What needs to be done?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Assign To *</label>
          <input
            style={styles.input}
            placeholder="Enter exact name e.g. Ravi"
            value={form.assignedToName}
            onChange={e => setForm({ ...form, assignedToName: e.target.value })}
          />
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Priority</label>
            <select
              style={styles.input}
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
            <label style={styles.label}>Deadline</label>
            <input
              style={styles.input}
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={styles.createBtn}
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

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 999
  },
  modal: {
    background: "#1a1a2e",
    borderRadius: "20px",
    padding: "32px",
    width: "460px",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTitle: {
    margin: 0,
    color: "white",
    fontSize: "18px",
    fontWeight: 700
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontSize: "16px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  row: {
    display: "flex",
    gap: "12px"
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  input: {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
    padding: "10px 14px",
    background: "rgba(255,107,107,0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(255,107,107,0.2)"
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "4px"
  },
  cancelBtn: {
    flex: 1, padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "14px"
  },
  createBtn: {
    flex: 2, padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #2d6aff)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px"
  }
};

export default CreateTaskModal;