import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: String,
  date: String,
  stime: String,
  etime: String,
  isCompleted: Boolean
});

export default mongoose.model("Todo", todoSchema);