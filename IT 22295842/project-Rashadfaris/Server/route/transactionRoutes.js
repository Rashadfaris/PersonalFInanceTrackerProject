import express from 'express';
import authMiddleware ,{isAdmin,canAccessTransaction} from '../middleware/auth.js';  // Import the authentication middleware
import { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction,getTransactionsByUserId } from '../controllers/transactioncontroller.js';
import Transaction from '../model/transaction.js';
import convertCurrency from '../services/conversionService.js';


const router = express.Router();

router.post('/', authMiddleware, createTransaction); 
router.get('/', isAdmin,authMiddleware, getTransactions);  
router.get('/:id', authMiddleware, getTransactionById);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.get('/user/:userId', authMiddleware, getTransactionsByUserId);
// 🔹 Admin-only route to manage all transactions
router.get("/admin/transactions", authMiddleware, isAdmin, getTransactions);

// Get transactions with conversion
router.get("/", async (req, res) => {
    try {
       const { userId, currency } = req.query;
 
       if (!userId || !currency) {
          return res.status(400).json({ message: "User ID and currency are required." });
       }
 
       const transactions = await Transaction.find({ userId });
 
       const convertedTransactions = await Promise.all(
          transactions.map(async (txn) => {
             const convertedAmount = await convertCurrency(txn.amount, txn.currency, currency);
             return { ...txn._doc, convertedAmount };
          })
       );
 
       res.json(convertedTransactions);
    } catch (error) {
       res.status(500).json({ message: "Server error", error: error.message });
    }
 });
 


export default router;
