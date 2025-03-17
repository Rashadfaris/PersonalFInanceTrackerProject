// models/Expense.js
import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Expense = mongoose.model("Expense", ExpenseSchema);

export default Expense;
