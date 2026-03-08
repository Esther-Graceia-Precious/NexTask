import { useState, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #060612;
          overflow: hidden;
          position: relative;
        }

        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 80px;
          position: relative;
          z-index: 2;
        }

        .login-right {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #7b2ff7, #2d0066);
          top: -100px; right: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #00d2ff, #0040ff);
          bottom: 50px; right: 100px;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, #ff6b6b, #ff0080);
          top: 200px; right: 300px;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
          animation: slideUp 0.6s ease forwards;
        }

        .brand-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #7b2ff7, #00d2ff);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .login-heading {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 12px;
          animation: slideUp 0.6s ease 0.1s both;
        }

        .login-heading span {
          background: linear-gradient(90deg, #7b2ff7, #00d2ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-sub {
          color: rgba(255,255,255,0.4);
          font-size: 15px;
          font-weight: 300;
          margin-bottom: 48px;
          animation: slideUp 0.6s ease 0.2s both;
        }

        .form-group {
          margin-bottom: 16px;
          animation: slideUp 0.6s ease 0.3s both;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .form-input {
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

        .form-input:focus {
          border-color: #7b2ff7;
          background: rgba(123,47,247,0.08);
          box-shadow: 0 0 0 3px rgba(123,47,247,0.15);
        }

        .form-input::placeholder { color: rgba(255,255,255,0.2); }

        .error-msg {
          color: #ff6b6b;
          font-size: 13px;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: rgba(255,107,107,0.1);
          border-radius: 8px;
          border: 1px solid rgba(255,107,107,0.2);
          animation: slideUp 0.3s ease;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #7b2ff7, #2d6aff);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          animation: slideUp 0.6s ease 0.4s both;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(123,47,247,0.4);
        }

        .login-btn:active { transform: translateY(0); }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .register-link {
          text-align: center;
          margin-top: 24px;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          animation: slideUp 0.6s ease 0.5s both;
        }

        .register-link a {
          color: #7b2ff7;
          text-decoration: none;
          font-weight: 500;
        }

        .register-link a:hover { text-decoration: underline; }

        .floating-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 24px;
          width: 280px;
          position: absolute;
          animation: cardFloat 4s ease-in-out infinite;
        }

        .card-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .card-2 { bottom: 25%; right: 8%; animation-delay: 2s; }
        .card-3 { top: 55%; left: 20%; animation-delay: 1s; width: 220px; }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .card-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .tag-todo { background: rgba(108,99,255,0.2); color: #6c63ff; }
        .tag-progress { background: rgba(247,183,49,0.2); color: #f7b731; }
        .tag-done { background: rgba(78,204,163,0.2); color: #4ecca3; }

        .card-title {
          color: white;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .card-user {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
        }

        .pulse-dot {
          display: inline-block;
          width: 8px; height: 8px;
          background: #4ecca3;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-wrapper">
        {/* Left - Form */}
        <div className="login-left">
          <div className="brand">
            <div className="brand-icon">⚡</div>
            <span className="brand-name">TaskFlow</span>
          </div>

          <h1 className="login-heading">
            Welcome<br />
            <span>back.</span>
          </h1>
          <p className="login-sub">Sign in to your collaborative workspace</p>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="register-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>

        {/* Right - Visual */}
        <div className="login-right">
          <div className="grid-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          {/* Floating task cards */}
          <div className="floating-card card-1">
            <span className="card-tag tag-progress">In Progress</span>
            <div className="card-title">Build Authentication System</div>
            <div className="card-user">👤 Assigned to Ravi</div>
          </div>

          <div className="floating-card card-2">
            <span className="card-tag tag-done">Done</span>
            <div className="card-title">Setup MongoDB Schema</div>
            <div className="card-user">
              <span className="pulse-dot"></span>Just updated
            </div>
          </div>

          <div className="floating-card card-3">
            <span className="card-tag tag-todo">Todo</span>
            <div className="card-title">Deploy to AWS</div>
            <div className="card-user">👤 Unassigned</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;