import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/api";
import "./auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      alert("Password updated");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit}>
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;