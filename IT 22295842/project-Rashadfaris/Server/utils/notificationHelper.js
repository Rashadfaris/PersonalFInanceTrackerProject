// utils/notificationHelper.js or in a Controller like budgetController.js
import Notification from "../model/notifications.js";  // Adjust the path as necessary
import Budget from "../model/budget.js";

// Function to send a notification when a budget status changes
export async function sendBudgetNotification(userId, budgetId, status, amountSpent, totalAmount) {
  const message = generateNotificationMessage(status, amountSpent, totalAmount);

  const newNotification = new Notification({
    userId,
    message,
    type: "budget",
  });

  try {
    await newNotification.save();
    console.log('Notification sent:', newNotification);

    await Budget.findByIdAndUpdate(budgetId, { notificationSent: true });

  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Generate message based on budget status
function generateNotificationMessage(status, spentAmount, totalAmount) {
  switch (status) {
    case "nearingLimit":
      return `Your budget is nearing its limit. You've spent ${spentAmount} out of ${totalAmount}.`;
    case "exceeded":
      return `You have exceeded your budget. You've spent ${spentAmount} out of ${totalAmount}.`;
    default:
      return `Your budget is on track. You've spent ${spentAmount} out of ${totalAmount}.`;
  }
}
