import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  date: String,
  stime: String,
  etime: String,
  title: String,
  isCompleted: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Todo", todoSchema);