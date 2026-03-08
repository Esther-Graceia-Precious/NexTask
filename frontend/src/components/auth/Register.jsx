import { useState } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .reg-wrapper {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #060612;
          overflow: hidden;
        }

        .reg-right {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .reg-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 80px;
          position: relative;
          z-index: 2;
        }

        .reg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          animation: regFloat 6s ease-in-out infinite;
        }

        .reg-orb-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #00d2ff, #004080);
          top: -120px; left: -80px;
          animation-delay: 0s;
        }

        .reg-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ff6b6b, #cc0055);
          bottom: 40px; left: 80px;
          animation-delay: 2s;
        }

        .reg-orb-3 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, #4ecca3, #007755);
          top: 180px; left: 260px;
          animation-delay: 4s;
        }

        @keyframes regFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.04); }
        }

        .reg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .reg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 50px;
          animation: regSlideUp 0.6s ease forwards;
        }

        .reg-brand-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #00d2ff, #0040ff);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        .reg-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .reg-heading {
          font-family: 'Syne', sans-serif;
          font-size: 46px;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 12px;
          animation: regSlideUp 0.6s ease 0.1s both;
        }

        .reg-heading span {
          background: linear-gradient(90deg, #00d2ff, #4ecca3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reg-sub {
          color: rgba(255,255,255,0.4);
          font-size: 15px;
          font-weight: 300;
          margin-bottom: 40px;
          animation: regSlideUp 0.6s ease 0.2s both;
        }

        .reg-form-group {
          margin-bottom: 16px;
          animation: regSlideUp 0.6s ease 0.3s both;
        }

        .reg-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .reg-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }

        .reg-input:focus {
          border-color: #00d2ff;
          background: rgba(0,210,255,0.06);
          box-shadow: 0 0 0 3px rgba(0,210,255,0.12);
        }

        .reg-input::placeholder { color: rgba(255,255,255,0.2); }

        .reg-error {
          color: #ff6b6b;
          font-size: 13px;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: rgba(255,107,107,0.1);
          border-radius: 8px;
          border: 1px solid rgba(255,107,107,0.2);
        }

        .reg-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #00d2ff, #0040ff);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          animation: regSlideUp 0.6s ease 0.4s both;
        }

        .reg-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,210,255,0.35);
        }

        .reg-btn:active { transform: translateY(0); }

        .reg-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .reg-login-link {
          text-align: center;
          margin-top: 24px;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          animation: regSlideUp 0.6s ease 0.5s both;
        }

        .reg-login-link a {
          color: #00d2ff;
          text-decoration: none;
          font-weight: 500;
        }

        .reg-login-link a:hover { text-decoration: underline; }

        /* Floating stats on the right */
        .reg-stat-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 20px 24px;
          position: absolute;
          animation: regCardFloat 4s ease-in-out infinite;
          min-width: 200px;
        }

        .stat-1 { top: 18%; right: 12%; animation-delay: 0s; }
        .stat-2 { top: 45%; right: 25%; animation-delay: 1.5s; }
        .stat-3 { bottom: 20%; right: 10%; animation-delay: 3s; }

        @keyframes regCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-bar {
          height: 3px;
          border-radius: 2px;
          margin-top: 12px;
          width: 100%;
        }

        .bar-blue { background: linear-gradient(90deg, #00d2ff, #0040ff); }
        .bar-green { background: linear-gradient(90deg, #4ecca3, #00b36b); }
        .bar-pink { background: linear-gradient(90deg, #ff6b6b, #cc0055); }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .activity-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        .dot-green { background: #4ecca3; }
        .dot-blue { background: #00d2ff; }
        .dot-pink { background: #ff6b6b; }

        .activity-text {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes regSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="reg-wrapper">

        {/* Right - Visual (shown first visually but second in DOM) */}
        <div className="reg-right">
          <div className="reg-grid" />
          <div className="reg-orb reg-orb-1" />
          <div className="reg-orb reg-orb-2" />
          <div className="reg-orb reg-orb-3" />

          {/* Floating stat cards */}
          <div className="reg-stat-card stat-1">
            <div className="stat-number">12</div>
            <div className="stat-label">Active Tasks</div>
            <div className="stat-bar bar-blue" />
          </div>

          <div className="reg-stat-card stat-2">
            <div className="activity-row">
              <div className="activity-dot dot-green" />
              <div className="activity-text">Ravi completed a task</div>
            </div>
            <div className="activity-row">
              <div className="activity-dot dot-blue" />
              <div className="activity-text">Priya assigned new task</div>
            </div>
            <div className="activity-row">
              <div className="activity-dot dot-pink" />
              <div className="activity-text">Conflict resolved</div>
            </div>
          </div>

          <div className="reg-stat-card stat-3">
            <div className="stat-number">3</div>
            <div className="stat-label">Online Now</div>
            <div className="stat-bar bar-green" />
          </div>
        </div>

        {/* Left - Form */}
        <div className="reg-left">
          <div className="reg-brand">
            <div className="reg-brand-icon">⚡</div>
            <span className="reg-brand-name">TaskFlow</span>
          </div>

          <h1 className="reg-heading">
            Create your<br />
            <span>account.</span>
          </h1>
          <p className="reg-sub">Join your team's real-time workspace</p>

          <div className="reg-form-group">
            <label className="reg-label">Full Name</label>
            <input
              className="reg-input"
              type="text"
              placeholder="Ravi Kumar"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="reg-form-group">
            <label className="reg-label">Email</label>
            <input
              className="reg-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="reg-form-group">
            <label className="reg-label">Password</label>
            <input
              className="reg-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <div className="reg-error">⚠️ {error}</div>}

          <button
            className="reg-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <div className="reg-login-link">
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </div>

      </div>
    </>
  );
}

export default Register;