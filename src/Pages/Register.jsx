import axios from "../utils/api";
import { useState } from "react";
import "./auth.css"

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("/auth/register", {
        email,
        password,
      });

      console.log("SUCCESS:", res.data);

      alert("Verification email sent. Please check your inbox.");

    } catch (err) {
      alert(err.response?.data.msg)
      console.log("ERROR:", err.response?.data); // 👈 VERY IMPORTANT
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}