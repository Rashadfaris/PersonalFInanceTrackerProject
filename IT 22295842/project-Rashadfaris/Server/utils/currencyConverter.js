import axios from 'axios';

const API_KEY = '926862ff4a434cd4a718ba4f';
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

// utils/currencyConverter.js

export const convertToUSD = async (amount, currency) => {
  try {
    // If the currency is already USD, no conversion needed
    if (currency === 'USD') return amount;

    // Fetch exchange rates from the API
    const response = await axios.get(`${BASE_URL}${currency}`);
    
    // Extract the conversion rate for USD
    const conversionRate = response.data.rates['USD'];

    // If the currency is unsupported or API fails, return null
    if (!conversionRate) {
      return null;
    }

    // Convert the amount to USD using the real-time exchange rate
    return amount * conversionRate;
  } catch (error) {
    console.error("Error fetching exchange rates", error);
    return null; // Return null if there's an error
  }
};
