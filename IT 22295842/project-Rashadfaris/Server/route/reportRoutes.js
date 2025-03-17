// routes/reportRoutes.js
import express from 'express';
import { generateReport } from '../controllers/reportController.js';

const router = express.Router();

// Route to fetch the budget report
router.get('/report/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Generate the report (assuming this is a function that fetches the data from the DB)
        const reportData = await generateReport(userId);

        // Now format the report data to be more human-readable (in the console)
        console.log('Budget Report');
        console.log('--------------------------------------------------------');
        reportData.report.forEach(category => {
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

        // Send the formatted data back to the client (if needed for frontend)
        res.json({
            success: true,
            totalSummary: reportData.totalSummary,  // You might include the summary too
            report: reportData.report               // The actual report data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching the report data'
        });
    }
});

export default router;
