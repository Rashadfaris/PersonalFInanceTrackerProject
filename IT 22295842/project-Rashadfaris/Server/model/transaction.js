import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "USD" }, 
  category: { type: String, required: true },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now },
  recurring: { type: Boolean, default: false },
  recurrencePattern: { type: String, enum: ["daily", "weekly", "monthly"], default: null },
  endDate: { type: Date, default: null }

  
},
{ timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;