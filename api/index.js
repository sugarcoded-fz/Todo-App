import express from "express"
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

import Todo from "./models/Todo.js";

const app = express();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

app.use(cors());

app.use(async (req, res, next) => {
  await connectDB();
  next();
});
app.use(express.json());



// GET todos
app.get("/api/todos", async (req, res) => {
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
app.post("/api/todos", async (req, res) => {
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
app.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE todo
app.put("/api/todos/:id", async (req, res) => {
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
      { returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// TOGGLE COMPLETE
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { isCompleted: req.body.isCompleted },
      { returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;