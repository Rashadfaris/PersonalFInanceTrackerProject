import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalIncome: { type: Number, required: true },
  totalExpenses: { type: Number, required: true },
  dateRange: { type: String, required: true },
  categories: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ]
});


const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
export default Report;
