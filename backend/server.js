import express from "express"
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

import Todo from "./models/Todo.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://todo-app-fz.vercel.app/"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// GET todos
app.get("/todos", async (req, res) => {
  try {
    const { date } = req.query;

    let todos;

    if (date) {
      todos = await Todo.find({ date });
    } else {
      todos = await Todo.find();
    }

    res.json(todos);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// CREATE todo
app.post("/todos", async (req, res) => {
  try {
    const { date, stime, etime, title } = req.body;
    // 1. Get todos of same date
    const existing = await Todo.find({ date });
    // 2. Check overlap
    const conflict = existing.find(t => {
      return (stime < t.etime && etime > t.stime);
    });
    if (conflict) {
      return res.status(400).json({
        message: `Overlaps with "${conflict.title}" (${conflict.stime} - ${conflict.etime})`
      });
    }
    // 3. Check duplicate title (optional)
    const isDuplicate = existing.some(t => t.title === title);
    if (isDuplicate) {
      return res.status(400).json({
        message: "Task already exists for this day"
      });
    }
    // 4. Save
    const todo = new Todo(req.body);
    const saved = await todo.save();
    res.json(saved);
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ message: "Error adding todo" });
  }
});

// DELETE todo
app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { date, stime, etime, title } = req.body;
    const existing = await Todo.find({
      date,
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
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// TOGGLE COMPLETE
app.patch("/todos/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { isCompleted: req.body.isCompleted },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("App listening on port 5000"));