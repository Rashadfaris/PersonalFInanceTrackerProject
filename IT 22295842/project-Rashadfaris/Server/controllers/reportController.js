// controllers/budgetReportController.js

import Budget from '../model/budget.js'; // Use import instead of require
import Transaction from '../model/transaction.js'; // Use import instead of require

// Function to generate the budget report
const generateReport = async (userId) => {
    try {
        // Fetch the user's budgets and transactions
        const userBudgets = await Budget.find({ userId: userId });
        const userTransactions = await Transaction.find({ userId: userId });

        console.log("User Budgets:", userBudgets); // Log user budgets
        console.log("User Transactions:", userTransactions); // Log user transactions

        let totalAllocated = 0;
        let totalSpent = 0;
        let totalRemaining = 0;

        const report = [];

        // Loop through the user's budgets and calculate the total spent, remaining budget, and status
        userBudgets.forEach((budget) => {
            let totalSpentInCategory = 0;

            // Calculate total spent in this category
            userTransactions.forEach((transaction) => {
                if (transaction.category.toLowerCase() === budget.category.toLowerCase()) {
                    totalSpentInCategory += transaction.amount;
                }
            });

            let remaining = budget.amount - totalSpentInCategory;
            let status = "On track";

            if (totalSpentInCategory > budget.amount) {
                status = "Exceeded";
            } else if (totalSpentInCategory >= budget.amount * 0.8) {
                status = "Nearing limit";
            }

            totalAllocated += budget.amount || 0; // Add to totalAllocated
            totalSpent += totalSpentInCategory;
            totalRemaining += remaining;

            report.push({
                category: budget.category,
                allocated: budget.amount || 0, // Ensure it's not undefined
                spent: totalSpentInCategory,
                remaining: remaining,
                status: status,
                transactions: userTransactions.filter(t => t.category.toLowerCase() === budget.category.toLowerCase())
            });
        });

        const overallStatus = totalRemaining >= 0 ? "On track" : "Exceeded";

        console.log('Budget Report');
        console.log('--------------------------------------------------------');
        report.forEach(category => {
            console.log(`Category: ${category.category}`);
            console.log(`Allocated Budget: $${category.allocated}`);
            console.log(`Total Spent: $${category.spent}`);
            console.log(`Remaining Budget: $${category.remaining}`);
            console.log(`Status: ${category.status}`);
            console.log('Transactions:');
            category.transactions.forEach(transaction => {
                console.log(` - $${transaction.amount} on ${transaction.date}`);
            });
            console.log('--------------------------------------------------------');
        });

        return {
            success: true,
            totalSummary: {
                totalAllocated,
                totalSpent,
                totalRemaining,
                overallStatus
            },
            report
        };
    } catch (error) {
        console.error("Error generating report:", error);
        return {
            success: false,
            message: "Error generating the budget report"
        };
    }
};

export { generateReport };
