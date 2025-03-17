import mongoose from "mongoose";
import Transaction from "../model/transaction.js";
import Budget from "../model/budget.js";
import { sendEmailNotification } from "../utils/notifications.js";
import { convertToUSD } from "../utils/currencyConverter.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Received Data:", req.body);
    console.log("User ID from token:", req.user.id);

    const { type, amount, category, tags, recurring, recurrencePattern, endDate, currency } = req.body;

    // Validate currency and ensure it's present
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'LKR']; 
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Invalid currency" });
    }

    if (recurring && !recurrencePattern) {
      return res.status(400).json({ error: "Recurrence pattern is required for recurring transactions" });
    }

    let parsedEndDate = endDate ? new Date(endDate) : null;
    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid end date" });
    }

    // Convert amount to USD if it's not in USD
    let convertedAmount = amount;
    if (currency !== 'USD') {
      convertedAmount = await convertToUSD(amount, currency);
      if (convertedAmount === null) {
        return res.status(400).json({ error: "Currency conversion failed" });
      }
    }

    const newTransaction = new Transaction({
      userId: req.user.id,
      type,
      amount: convertedAmount,  // Store the converted amount in USD
      category,
      tags,
      recurring,
      recurrencePattern: recurring ? recurrencePattern : null,
      endDate: parsedEndDate,
      currency, // Store the original currency
    });

    console.log("Transaction object before saving:", newTransaction);

    await newTransaction.save({ session });

    const transactionDate = newTransaction.createdAt ? newTransaction.createdAt : new Date();
    console.log("Transaction Date:", transactionDate);

    if (!transactionDate || !(transactionDate instanceof Date)) {
      throw new Error("Invalid transaction date");
    }

    // Update Budget in USD
    const currentBudget = await Budget.findOne(
      {
        userId: req.user.id,
        category,
        month: transactionDate.getMonth() + 1,
        year: transactionDate.getFullYear()
      },
      null,
      { session }
    );

    if (currentBudget) {
      // Add the converted amount (in USD) to the budget
      currentBudget.spentAmount += convertedAmount; 

      if (currentBudget.spentAmount > currentBudget.amount) {
        currentBudget.status = "exceeded";
      } else if (currentBudget.spentAmount >= currentBudget.amount * 0.9) {
        currentBudget.status = "nearingLimit";
      } else {
        currentBudget.status = "onTrack";
      }

      await currentBudget.save({ session });

      // Send email notification if budget is exceeded or nearing limit
      if (currentBudget.status === "exceeded") {
        sendEmailNotification(req.user.email, "Budget Exceeded", `You have exceeded your budget for ${category} this month.`);
      } else if (currentBudget.status === "nearingLimit") {
        sendEmailNotification(req.user.email, "Budget Alert", `You are nearing your budget limit for ${category} this month.`);
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Transaction created successfully", data: newTransaction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating transaction:", error);
    res.status(500).json({ error: true, message: error.message || "Error creating transaction", success: false });
  }
};



// Get all transactions for a user or all transactions if admin
export const getTransactions = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const transactions = await Transaction.find();
      return res.status(200).json({ transactions });
    } else {
      const transactions = await Transaction.find({ userId: req.user.id });
      return res.status(200).json({ transactions });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, tags, recurring, recurrencePattern, endDate, currency } = req.body;

    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'LKR']; 
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Invalid currency" });
    }

    let convertedAmount = amount;
    if (currency !== 'USD') {
      convertedAmount = await convertToUSD(amount, currency);
      if (convertedAmount === null) {
        return res.status(400).json({ error: "Currency conversion failed" });
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, amount: convertedAmount, category, tags, recurring, recurrencePattern, endDate, currency },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const month = updatedTransaction.createdAt ? updatedTransaction.createdAt.getMonth() + 1 : new Date().getMonth() + 1;
    const year = updatedTransaction.createdAt ? updatedTransaction.createdAt.getFullYear() : new Date().getFullYear();

    const currentBudget = await Budget.findOne({ userId: req.user.id, category, month, year });

    if (currentBudget) {
      currentBudget.spentAmount += convertedAmount;

      if (currentBudget.spentAmount > currentBudget.amount) {
        currentBudget.status = 'exceeded';
      } else if (currentBudget.spentAmount >= currentBudget.amount * 0.9) {
        currentBudget.status = 'nearingLimit';
      } else {
        currentBudget.status = 'onTrack';
      }

      await currentBudget.save();
    }

    res.status(200).json({ message: "Transaction updated successfully", data: updatedTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!deletedTransaction.date) {
      return res.status(400).json({ message: "Transaction date is missing" });
    }

    const currentBudget = await Budget.findOne({
      userId: req.user.id,
      category: deletedTransaction.category,
      month: new Date(deletedTransaction.date).getMonth() + 1,
      year: new Date(deletedTransaction.date).getFullYear()
    });

    if (currentBudget) {
      currentBudget.spentAmount -= deletedTransaction.amount;

      if (currentBudget.spentAmount > currentBudget.amount) {
        currentBudget.status = 'exceeded';
      } else if (currentBudget.spentAmount >= currentBudget.amount * 0.9) {
        currentBudget.status = 'nearingLimit';
      } else {
        currentBudget.status = 'onTrack';
      }

      await currentBudget.save();
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions for a specific user by user ID
export const getTransactionsByUserId = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId });
    if (!transactions) {
      return res.status(404).json({ message: "Transactions not found for this user" });
    }
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
