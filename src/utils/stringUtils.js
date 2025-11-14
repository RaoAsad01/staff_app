/**
 * Truncates a string to a maximum length, adding ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length (default: 10)
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 10) => {
  if (!str || typeof str !== 'string') return str;

  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength) + '...';
};

/**
 * Truncates city name to maximum 10 characters
 * @param {string} cityName - The city name to truncate
 * @returns {string} - Truncated city name
 * 
 * Examples:
 * truncateCityName('Accra') -> 'Accra'
 * truncateCityName('New York City') -> 'New York C...'
 * truncateCityName('San Francisco') -> 'San Franci...'
 */
export const truncateCityName = (cityName) => {
  return truncateString(cityName, 5);
};

export const truncateEventName = (cityName) => {
  return truncateString(cityName, 10);
};

export const truncateStaffName = (cityName) => {
  return truncateString(cityName, 10);
};
