import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  budgetType: { type: String, enum: ['monthly', 'category'], required: true },
  spentAmount: { type: Number, default: 0 },  // Tracks the amount spent
  status: { type: String, enum: ['onTrack', 'nearingLimit', 'exceeded'], default: 'onTrack' },
  notificationSent: { type: Boolean, default: false }  // Tracks if notification has been sent
});

// budget.js
const Budget = mongoose.model("Budget", BudgetSchema);
export default Budget;
