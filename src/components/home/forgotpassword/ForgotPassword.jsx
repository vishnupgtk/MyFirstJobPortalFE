import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../../services/authService";
import Toast from "../../shared/Toast/Toast";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(email, newPassword);
      setToast({
        show: true,
        message: "Password updated successfully",
        type: "success"
      });
      setTimeout(() => navigate("/"), 2000);
    } catch {
      setToast({
        show: true,
        message: "Failed to reset password",
        type: "error"
      });
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT BRAND */}
      <div className="brand-section">
        <h1>Reset Your Password</h1>
        <p>
          Enter your registered email address and set a new password to regain
          access to your account.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="form-section">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>

          <input
            className="input"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button className="btn">Update Password</button>

          <div className="links">
            <span onClick={() => navigate("/")}>Back to Login</span>
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

export default ForgotPassword;
