import express from 'express';
import { createBudget, updateBudget, getAllBudgets,addExpenseAndUpdateBudget, getBudgetOverview ,deleteBudget,} from '../controllers/budgetController.js';
import { adminAuth, isAdmin } from '../middleware/auth.js'; // Admin check middleware
import authMiddleware from "../middleware/auth.js";


const router = express.Router();

// Create Budget
router.post('/create', createBudget);

// Update Budget
router.patch('/update/:budgetId',authMiddleware, updateBudget);

// Add Expense and Update Budget
router.post('/add-expense', addExpenseAndUpdateBudget);

// Get User's Budget Overview
router.get('/overview/:userId', getBudgetOverview);

// Admin can get all budgets
router.get('/admin/overview', getAllBudgets);

// Route to get all budgets (for Admin)
router.get('/all',adminAuth,isAdmin, getAllBudgets);


// Delete Budget
router.delete('/delete/:budgetId',authMiddleware, deleteBudget);

// Route to add an expense and update budget status
router.post('/expense', async (req, res) => {
    const { userId, category, amount } = req.body;
  
    try {
      // Add the expense logic here (you may already have this in your controller)
      // e.g., save expense in database (implement logic if needed)
  
      // Call the function to update the budget status based on the new expense
      await updateBudgetStatus(userId, category, amount);
  
      res.status(201).send({ message: "Expense added and budget status updated." });
    } catch (error) {
      res.status(500).send({ message: "Error processing expense and updating budget.", error });
    }
  });

export default router;
