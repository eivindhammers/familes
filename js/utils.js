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
 * @param {string|null} leagueId - Optional league ID to filter by
 * @param {Object} leagueLeaderboard - Optional league leaderboard data
 * @returns {Array} Sorted array of users with rank property
 */
window.getLeaderboard = (users, leagueId = null, leagueLeaderboard = null) => {
  // If league filtering is requested, use league leaderboard data
  if (leagueId && leagueLeaderboard) {
    return Object.values(leagueLeaderboard)
      .sort((a, b) => b.totalPages - a.totalPages)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }
  
  // Otherwise return global leaderboard
  return Object.values(users)
    .sort((a, b) => b.totalPages - a.totalPages)
    .map((user, index) => ({ ...user, rank: index + 1 }));
};

/**
 * Generate a random 6-character league code
 * Uses alphanumeric characters excluding confusable ones (I, O, 0, 1)
 * to reduce user errors when entering codes
 * @returns {string} Random league code
 */
window.generateLeagueCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
