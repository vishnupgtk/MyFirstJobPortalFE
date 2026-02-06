import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/authService";
import { useAuthActions } from "../../../store/hooks";
import { jwtDecode } from "jwt-decode";
import { ROLES } from "../../../constants/roles.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { loginSuccess } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);
      const token = res.data.token;

      // decode FIRST (synchronous)
      const decoded = jwtDecode(token);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      //  console.log("JOBSEEKER JWT DECODED:", decoded);

      // update Zustand (async, but OK)
      loginSuccess(token);

      // redirect based on decoded role (NOT Zustand)
      if (role === ROLES.ADMIN || role === ROLES.EMPLOYER) {
        navigate("/dashboard", { replace: true });
      } else if (role === ROLES.JOB_SEEKER) {
        navigate("/dashboard", { replace: true }); // YOUR REQUIRED FLOW
      } else {
        setError("Unknown role");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="brand-section">
        <h1> Job Portal</h1>
        <p>A centralized platform  Employers, and Job Seekers.</p>
      </div>

      <div className="form-section">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Sign in to your account</h2>

          {error && <div className="error-text">{error}</div>}

          <input
            className="input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn">Login</button>
          <div className="links">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/forgot")}
            >
              Forgot Password?
            </span>

            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              Create Account
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
