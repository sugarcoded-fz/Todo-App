import { useState } from "react";
import axios from "../utils/api";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      console.log("SUCCESS:", res.data);

      alert("Reset link sent through email. Please check your inbox.");
     

    } catch (err) {
      console.log("ERROR:", err.response?.data); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        <input
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;