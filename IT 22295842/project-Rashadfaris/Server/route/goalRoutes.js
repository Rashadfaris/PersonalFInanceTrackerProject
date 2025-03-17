import express from "express";
import Goal from "../model/goal.js"; // Import Goal Model

const router = express.Router();

// 🎯 Create a New Goal
router.post("/create", async (req, res) => {
  try {
    const { userId, goalName, targetAmount, deadline, autoSavePercentage } = req.body;

    if (!userId || !goalName || !targetAmount || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGoal = new Goal({ userId, goalName, targetAmount, deadline, autoSavePercentage });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🎯 Get User's Goals
router.get("/:userId", async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🎯 Add Funds to a Goal
router.put("/add-funds/:goalId", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.currentSavings += amount;
    await goal.save();

    res.status(200).json({ message: "Funds added successfully", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🎯 Auto-Save from Income
router.put("/allocate-income/:userId", async (req, res) => {
  try {
    const { incomeAmount } = req.body;
    if (!incomeAmount || incomeAmount <= 0) {
      return res.status(400).json({ message: "Invalid income amount" });
    }

    const goals = await Goal.find({ userId: req.params.userId });

    let totalAllocated = 0;
    goals.forEach(async (goal) => {
      if (goal.autoSavePercentage > 0) {
        let allocatedAmount = (incomeAmount * goal.autoSavePercentage) / 100;
        goal.currentSavings += allocatedAmount;
        totalAllocated += allocatedAmount;
        await goal.save();
      }
    });

    res.status(200).json({ message: `Auto-saved $${totalAllocated} across goals.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🎯 Update Auto-Save Percentage for All Goals of a User
router.put("/update-auto-save/:userId", async (req, res) => {
  try {
    const { autoSavePercentage } = req.body;

    // Validate the input (should be a valid percentage between 0 and 100)
    if (autoSavePercentage === undefined || autoSavePercentage < 0 || autoSavePercentage > 100) {
      return res.status(400).json({ message: "Invalid auto-save percentage. It should be between 0 and 100." });
    }

    // Find all goals of the user by userId
    const goals = await Goal.find({ userId: req.params.userId });
    if (!goals || goals.length === 0) {
      return res.status(404).json({ message: "No goals found for this user" });
    }

    // Update the auto-save percentage for each goal
    goals.forEach(async (goal) => {
      goal.autoSavePercentage = autoSavePercentage;
      await goal.save();
    });

    res.status(200).json({ message: `Auto-save percentage updated to ${autoSavePercentage}% for all goals.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
