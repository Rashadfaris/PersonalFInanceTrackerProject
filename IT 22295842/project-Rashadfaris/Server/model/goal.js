import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentSavings: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  autoSavePercentage: { type: Number, default: 0 }, // % of income allocated
  createdAt: { type: Date, default: Date.now },
});

const Goal = mongoose.model("Goal", GoalSchema);
export default Goal;
