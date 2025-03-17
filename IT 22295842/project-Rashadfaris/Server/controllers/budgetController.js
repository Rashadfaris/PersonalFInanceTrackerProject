import Budget from '../model/budget.js';
import Expense from '../model/Expense.js';
import Notification from '../model/notifications.js';
import User from '../model/user_model.js';  
import { sendBudgetNotification } from "../utils/notificationHelper.js";  

// Create Budget (User)
export const createBudget = async (req, res) => {
  const { userId, category, amount, month, year, budgetType } = req.body;

  try {
    const existingBudget = await Budget.findOne({ userId, month, year, category });
    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category already exists for this month.' });
    }

    const newBudget = new Budget({
      userId,
      category,
      amount,
      month,
      year,
      budgetType,
      spentAmount: 0,
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating budget.' });
  }
};

// Update Budget (User can update own budget, Admin can update any budget)
export const updateBudget = async (req, res) => {
  console.log("Request User:", req.user); // Debugging line

  const { budgetId } = req.params;
  const { amountSpent, userId } = req.body;
  const currentUser = req.user; 

  try {
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: No user found in request." });
    }

    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.userId.toString() !== userId.toString() && currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this budget.' });
    }
    

    if (isNaN(amountSpent) || amountSpent <= 0) {
      return res.status(400).json({ message: 'Invalid amountSpent. It should be a positive number.' });
    }

    budget.spentAmount += amountSpent;

    if (budget.spentAmount > budget.amount) {
      budget.status = 'exceeded';
    } else if (budget.spentAmount > budget.amount * 0.9) {
      budget.status = 'nearingLimit';
    } else {
      budget.status = 'onTrack';
    }

    await budget.save();

    if (!budget.notificationSent && (budget.status === 'nearingLimit' || budget.status === 'exceeded')) {
      const user = await User.findById(budget.userId);
      const message = `Your budget for ${budget.category} has ${budget.status}. You have spent ${budget.spentAmount} of your ${budget.amount}.`;
      const notification = new Notification({
        userId: user._id,
        message: message,
        type: "budget"
      });

      await notification.save();

      budget.notificationSent = true;
      await budget.save();
    }

    res.status(200).json(budget);
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ message: 'Error updating budget.' });
  }
};


// Add Expense and Update Budget (User)
export const addExpenseAndUpdateBudget = async (req, res) => {
  const { userId, category, amount, description } = req.body;
  const expenseDate = new Date();

  try {
    const newExpense = new Expense({
      userId,
      category,
      amount,
      date: expenseDate,
      description,
    });

    await newExpense.save();

    const budget = await Budget.findOne({ userId, category, month: expenseDate.getMonth() + 1, year: expenseDate.getFullYear() });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found for this category.' });
    }

    budget.spentAmount += amount;

    // Update budget status based on spending
    if (budget.spentAmount > budget.amount) {
      budget.status = 'exceeded';
    } else if (budget.spentAmount > budget.amount * 0.9) {
      budget.status = 'nearingLimit';
    } else {
      budget.status = 'onTrack';
    }

    await budget.save();

    // Send notification if budget is nearing limit or exceeded
    if (!budget.notificationSent && (budget.status === 'nearingLimit' || budget.status === 'exceeded')) {
      const user = await User.findById(budget.userId);
      const message = `Your budget for ${budget.category} has ${budget.status}. You have spent ${budget.spentAmount} of your ${budget.amount}.`;
      const notification = new Notification({
        userId: user._id,
        message: message,
        type: "budget"
      });

      await notification.save();

      // Update the budget to reflect that a notification has been sent
      budget.notificationSent = true;
      await budget.save();
    }

    res.status(201).json(newExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding expense.' });
  }
};

// Get Budget Overview (User specific overview)
export const getBudgetOverview = async (req, res) => {
  const { userId } = req.params;

  try {
    const budgets = await Budget.find({ userId });
    if (!budgets.length) {
      return res.status(404).json({ message: 'No budgets found for this user.' });
    }

    res.status(200).json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving budget overview.' });
  }
};

// Get All Budgets for Admin (Admin can see all budgets)
export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({});
    if (!budgets.length) {
      return res.status(404).json({ message: 'No budgets found.' });
    }

    res.status(200).json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving budgets.' });
  }
};

// Delete Budget (User can delete their budget, Admin can delete any budget)
export const deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const currentUser = req.user; // Check if req.user is set by auth middleware

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    console.log("Request User:", currentUser); // Debugging

    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).json({ message: "Budget not found." });
    }

    // Ensure the user is authorized to delete the budget
    if (budget.userId.toString() !== currentUser.id.toString() && currentUser.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this budget." });
    }

    await Budget.findByIdAndDelete(budgetId);
    res.status(200).json({ message: "Budget deleted successfully." });

  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ message: "Error deleting budget." });
  }
};

// Function to update the budget status based on the amount spent
export async function updateBudgetStatus(userId, category, amountSpent) {
  try {
    const budget = await Budget.findOne({ userId, category });

    if (budget) {
      // Update the spent amount
      budget.spentAmount += amountSpent;

      // Determine if the status should be updated
      let status = budget.status;
      if (budget.spentAmount >= budget.amount) {
        status = 'exceeded';
      } else if (budget.spentAmount >= budget.amount * 0.9) {
        status = 'nearingLimit';
      } else {
        status = 'onTrack';
      }

      // Update the budget and save it
      budget.status = status;
      await budget.save();

      // If notification hasn't been sent, trigger it
      if (!budget.notificationSent) {
        await sendBudgetNotification(userId, budget._id, status, budget.spentAmount, budget.amount);
      }
    }
  } catch (error) {
    console.error("Error updating budget status:", error);
  }
}
