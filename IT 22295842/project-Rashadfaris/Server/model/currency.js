import mongoose from "mongoose";

const CurrencySchema = new mongoose.Schema({
  currencyCode: { type: String, required: true, unique: true },
  exchangeRate: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});


const Currency = mongoose.model("Currency", CurrencySchema);
export default Currency;
