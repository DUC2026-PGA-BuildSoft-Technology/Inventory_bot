const axios = require('axios');

/**
 * Fetch USD -> KHR exchange rate from a public API.
 * Returns an object: { success: true, rate: number } or { success: false, message }
 */
const getExchangeRate = async () => {
  try {
    // Use exchangerate-api's free endpoint which does not require an access key
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', {
      timeout: 5000,
    });

    if (res && res.data && res.data.result === 'success' && res.data.rates && typeof res.data.rates.KHR === 'number') {
      return { success: true, rate: res.data.rates.KHR };
    }

    return { success: false, message: 'Unable to retrieve exchange rate. Please try again later.' };
  } catch (err) {
    return { success: false, message: 'Unable to retrieve exchange rate. Please try again later.' };
  }
};

module.exports = { getExchangeRate };
