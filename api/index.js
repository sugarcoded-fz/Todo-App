import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "./utils/mailer.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { generateAccessToken, generateRefreshToken } from "./utils/tokens.js";


dotenv.config();

import Todo from "./models/Todo.js";
import User from "./models/User.js";

const app = express();

let isConnected = false;

// ✅ Connect DB once (Vercel-safe)
const connectDB = async () => {
  if(isConnected){
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // more relaxed
});
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/todos", apiLimiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

// always connect before request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});


// ========================
// 🔐 AUTH MIDDLEWARE
// ========================
const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: "todo-app",
      audience: "user",
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    return res.status(401).json({ msg: "Invalid token" });
  }
};


// ========================
// 🧑 AUTH ROUTES
// ========================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      email,
      password: hashed,
      verificationToken,
      isVerified: false
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    // 📧 SEND EMAIL
    await transporter.sendMail({
      to: email,
      subject: "Verify your account",
      html: `
        <h3>Verify your email</h3>
        <a href="${verifyLink}">${verifyLink}</a>
      `
    });

    res.json({ message: "Verification email sent" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

//verify-email
app.get("/api/auth/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // store refresh token in DB
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedToken;


    await user.save();

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,                       // false in localhost, true in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000       // 7 days
    });

    res.json({ accessToken });

  } catch (err) {
    console.log("ERROR:", err)
    res.status(500).json({ error: err.message });
  }
});

//Refresh-token
app.post("/api/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      issuer: "todo-app",
      audience: "user",
    });

    const user = await User.findById(decoded.sub);
    if (!user || !user.refreshToken) {
      return res.sendStatus(403);
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const hashed = await bcrypt.hash(newRefreshToken, 10);
    user.refreshToken = hashed;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });

  } catch {
    // res.status(403).json({ msg: "Invalid or expired refresh token" });
    res.sendStatus(403);
  }
});


//Forgot-pasword
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If email exists, reset link sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // 📧 SEND EMAIL
    await transporter.sendMail({
      to: email,
      subject: "Reset Password",
      html: `
        <h3>Password Reset</h3>
        <a href="${link}">${link}</a>
        <p>This link expires in 15 minutes</p>
      `
    });

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Reset-password
app.post("/api/auth/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 chars" });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//LOGOUT
app.post("/api/auth/logout", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    refreshToken: null
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });

  res.json({ message: "Logged out successfully" });
});



// ========================
// 👤 GET PROFILE 
// ========================
app.get("/api/auth/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "Invalid credentials" });
    }

    const totalTodos = await Todo.countDocuments({ user: req.user.id });
    const completedTodos = await Todo.countDocuments({
      user: req.user.id,
      isCompleted: true,
    });

    const pendingTodos = totalTodos - completedTodos;

    res.json({
      user,
      stats: {
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
      },
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ========================
// 📝 TODOS (PROTECTED)
// ========================

// GET todos
app.get("/api/todos", auth, async (req, res) => {
  try {
    const { date } = req.query;

    let todos;

    if (date) {
      todos = await Todo.find({ date, user: req.user.id });
    } else {
      todos = await Todo.find({ user: req.user.id });
    }

    res.json(todos);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// CREATE todo
app.post("/api/todos", auth, async (req, res) => {
  try {
    const { date, stime, etime, title } = req.body;

    const existing = await Todo.find({ date, user: req.user.id });

    const conflict = existing.find(t => {
      return (stime < t.etime && etime > t.stime);
    });

    if (conflict) {
      return res.status(400).json({
        message: `Overlaps with "${conflict.title}" (${conflict.stime} - ${conflict.etime})`
      });
    }

    // 3. Check duplicate title(optional)
    const isDuplicate = existing.some(t => t.title === title);
    if (isDuplicate) {
      return res.status(400).json({
        message: "Task already exists for this day"
      });
    }

    const todo = new Todo({
      ...req.body,
      user: req.user.id
    });

    const saved = await todo.save();
    res.json(saved);

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});



// DELETE
app.delete("/api/todos/:id", auth, async (req, res) => {
  try {
    await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    res.json({ message: "deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// UPDATE
app.put("/api/todos/:id", auth, async (req, res) => {
  try {
    const { date, stime, etime, title } = req.body;
    const existing = await Todo.find({
      date,
      user: req.user.id,
      _id: { $ne: req.params.id } // exclude current todo
    });
    const conflict = existing.find(t => {
      return (stime < t.etime && etime > t.stime);
    });

    if (conflict) {
      return res.status(400).json({
        message: `Overlaps with "${conflict.title}" (${conflict.stime} - ${conflict.etime})`
      });
    }

    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { returnDocument: "after" }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE COMPLETE
app.patch("/api/todos/:id", auth, async (req, res) => {
  try {
    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isCompleted: req.body.isCompleted },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



const startServer = async () => {
  try {
    await connectDB(); // ✅ connect once

    app.listen(5000, () => {
      console.log("Server running on 5000 ");
    });

  } catch (err) {
    console.error("Failed to start server", err);
  }
};


// ========================
// 🚀 DEV ONLY SERVER
// ========================
if (process.env.NODE_ENV !== "production") {
  startServer();
}


export default app;