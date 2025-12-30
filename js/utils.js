/**
 * Utility Functions
 * Pure functions for common operations throughout the app
 */

/**
 * Convert HTTP URLs to HTTPS for secure loading
 * @param {string} url - The URL to convert
 * @returns {string} HTTPS version of the URL
 */
window.getSecureUrl = (url) => {
  if (!url) return '';
  return url.replace('http://', 'https://');
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} Today's date as ISO string
 */
window.getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Calculate progress percentage for current level
 * @param {number} totalPages - Total pages read
 * @returns {number} Progress percentage (0-100)
 */
window.calculateProgress = (totalPages) => {
  const { PAGES_PER_LEVEL } = window.APP_CONSTANTS;
  const currentLevelPages = totalPages % PAGES_PER_LEVEL;
  return (currentLevelPages / PAGES_PER_LEVEL) * 100;
};

/**
 * Generate leaderboard with rankings from users object
 * @param {Object} users - Object of user data keyed by profile ID
 * @returns {Array} Sorted array of users with rank property
 */
window.getLeaderboard = (users) => {
  return Object.values(users)
    .sort((a, b) => b.totalPages - a.totalPages)
    .map((user, index) => ({ ...user, rank: index + 1 }));
};
