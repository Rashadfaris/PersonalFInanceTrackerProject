const express = require("express");
const Currency = require("../model/currency");

const router = express.Router();

// Get all supported currencies
router.get("/", async (req, res) => {
   try {
      const currencies = await Currency.find();
      res.json(currencies);
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
});

module.exports = router;
