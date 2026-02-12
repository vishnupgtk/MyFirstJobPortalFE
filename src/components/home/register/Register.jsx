import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../../services/authService";
import Toast from "../../shared/Toast/Toast";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register({ ...form, roleId: Number(form.roleId) });
      setToast({
        show: true,
        message: "Account created successfully",
        type: "success",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setToast({
        show: true,
        message: "Registration failed",
        type: "error",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT BRAND */}
      <div className="brand-section">
        <h1>Create Your Account</h1>
        <p>
          Join our Job Portal platform and start managing your career or hiring
          process efficiently.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="form-section">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <input
              className="input"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
            />

            <input
              className="input"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
            />
          </div>

          <input
            className="input"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <select
            className="input"
            name="roleId"
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="2">Employer</option>
            <option value="3">Job Seeker</option>
          </select>

          <button className="btn">Create Account</button>

          <div className="links">
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              Back to Login
            </span>
          </div>
        </form>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default Register;
