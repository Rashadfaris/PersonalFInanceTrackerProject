import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["budget", "transaction", "goal"], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;