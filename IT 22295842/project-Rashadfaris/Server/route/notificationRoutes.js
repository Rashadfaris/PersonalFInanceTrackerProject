import express from 'express';
import Notification from "../model/notifications.js";  // Adjust path if necessary

const router = express.Router();

// Route to fetch unread notifications for the user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId, read: false });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
});


// Route to mark a notification as read
router.put('/notifications/:notificationId', async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.notificationId,
        { read: true },
        { new: true }
      );
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Error marking notification as read', error });
    }
  });
  

  
export default router;
