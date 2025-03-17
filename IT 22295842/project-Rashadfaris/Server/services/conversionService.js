
import Currency from "../model/currency.js";
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
   try {
      const fromRate = await Currency.findOne({ currencyCode: fromCurrency });
      const toRate = await Currency.findOne({ currencyCode: toCurrency });

      if (!fromRate || !toRate) {
         throw new Error("Currency rates not found");
      }

      const convertedAmount = (amount / fromRate.exchangeRate) * toRate.exchangeRate;
      return convertedAmount;
   } catch (error) {
      console.error("Currency conversion error:", error.message);
      return null;
   }
};


export default convertCurrency;