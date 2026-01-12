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
 * Get current month in YYYY-MM format
 * @returns {string} Current month as YYYY-MM string
 */
window.getCurrentMonth = () => {
  const today = new Date();
  return today.toISOString().substring(0, 7); // YYYY-MM
};

/**
 * Calculate cumulative XP needed to reach a specific level
 * Uses non-linear formula: each level requires XP_BASE * (XP_MULTIPLIER ^ (level-2))
 * @param {number} level - Target level (minimum 1)
 * @returns {number} Total XP needed to reach that level
 */
window.getCumulativeXPForLevel = (level) => {
  if (level <= 1) return 0;
  const { XP_BASE, XP_MULTIPLIER } = window.APP_CONSTANTS;
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, i - 2));
  }
  return totalXP;
};

/**
 * Calculate XP needed just for the next level (not cumulative)
 * @param {number} currentLevel - Current level
 * @returns {number} XP needed to reach next level from current level
 */
window.getXPForNextLevel = (currentLevel) => {
  const { XP_BASE, XP_MULTIPLIER } = window.APP_CONSTANTS;
  return Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, currentLevel - 1));
};

/**
 * Calculate level from total XP
 * @param {number} totalXP - Total XP accumulated
 * @returns {number} Current level (minimum 1)
 */
window.getLevelFromXP = (totalXP) => {
  if (totalXP <= 0) return 1;
  let level = 1;
  let cumulativeXP = 0;
  const { XP_BASE, XP_MULTIPLIER } = window.APP_CONSTANTS;
  const MAX_LEVEL = 1000; // Safety limit to prevent infinite loops
  
  while (level < MAX_LEVEL) {
    const xpForNextLevel = Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
    if (xpForNextLevel <= 0 || cumulativeXP + xpForNextLevel > totalXP) {
      break;
    }
    cumulativeXP += xpForNextLevel;
    level++;
  }
  return level;
};

/**
 * Calculate progress percentage towards next level
 * @param {number} totalXP - Total XP accumulated
 * @returns {number} Progress percentage (0-100)
 */
window.calculateProgress = (totalXP) => {
  const currentLevel = window.getLevelFromXP(totalXP);
  const xpAtCurrentLevel = window.getCumulativeXPForLevel(currentLevel);
  const xpForNextLevel = window.getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - xpAtCurrentLevel;
  return (xpInCurrentLevel / xpForNextLevel) * 100;
};

/**
 * Get XP progress within current level (current/needed)
 * @param {number} totalXP - Total XP accumulated
 * @returns {Object} Object with currentXP (XP in current level) and neededXP (XP for next level)
 */
window.getXPProgress = (totalXP) => {
  const currentLevel = window.getLevelFromXP(totalXP);
  const xpAtCurrentLevel = window.getCumulativeXPForLevel(currentLevel);
  const xpForNextLevel = window.getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - xpAtCurrentLevel;
  return {
    currentXP: xpInCurrentLevel,
    neededXP: xpForNextLevel
  };
};

/**
 * Generate leaderboard with rankings from users object
 * Rankings are based on totalXP (for leveling) with fallback to totalPages
 * @param {Object} users - Object of user data keyed by profile ID
 * @param {string|null} leagueId - Optional league ID to filter by
 * @param {Object} leagueLeaderboard - Optional league leaderboard data
 * @returns {Array} Sorted array of users with rank property
 */
window.getLeaderboard = (users, leagueId = null, leagueLeaderboard = null) => {
  const { getUserXP } = window;
  
  // If league filtering is requested, use league leaderboard data
  if (leagueId && leagueLeaderboard) {
    return Object.values(leagueLeaderboard)
      .sort((a, b) => getUserXP(b) - getUserXP(a))
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }
  
  // Otherwise return global leaderboard
  return Object.values(users)
    .sort((a, b) => getUserXP(b) - getUserXP(a))
    .map((user, index) => ({ ...user, rank: index + 1 }));
};

/**
 * Generate monthly leaderboard with rankings
 * Rankings are based on monthlyXP for the current month
 * @param {Object} leagueLeaderboard - League leaderboard data
 * @returns {Array} Sorted array of users with rank property
 */
window.getMonthlyLeaderboard = (leagueLeaderboard) => {
  const currentMonth = window.getCurrentMonth();
  
  return Object.values(leagueLeaderboard)
    .map(user => ({
      ...user,
      // Reset monthly XP if user's month doesn't match current month
      monthlyXP: user.currentMonth === currentMonth ? (user.monthlyXP || 0) : 0
    }))
    .sort((a, b) => (b.monthlyXP || 0) - (a.monthlyXP || 0))
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

/**
 * Get user XP with fallback to totalPages for backward compatibility
 * @param {Object} user - User or profile object
 * @returns {number} XP value
 */
window.getUserXP = (user) => {
  return user?.totalXP ?? user?.totalPages ?? 0;
};

/**
 * Get dark mode aware input class names for form inputs
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @returns {string} Tailwind class names
 */
window.getInputClassName = (darkMode) => {
  return darkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'border-gray-300 text-gray-900';
};

/**
 * Get dark mode aware error message styling
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @returns {string} Tailwind class names
 */
window.getErrorClassName = (darkMode) => {
  return darkMode 
    ? 'bg-red-900 bg-opacity-30 border-red-700 text-red-300' 
    : 'bg-red-50 border-red-200 text-red-700';
};

/**
 * Get dark mode aware success message styling
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @returns {string} Tailwind class names
 */
window.getSuccessClassName = (darkMode) => {
  return darkMode 
    ? 'bg-green-900 bg-opacity-30 border-green-700 text-green-300' 
    : 'bg-green-50 border-green-200 text-green-700';
};

/**
 * Get dark mode aware card/panel styling
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @returns {string} Tailwind class names
 */
window.getCardClassName = (darkMode) => {
  return darkMode ? 'bg-gray-800' : 'bg-white';
};

/**
 * Get dark mode aware text styling
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {string} type - Type of text: 'heading', 'body', 'muted'
 * @returns {string} Tailwind class names
 */
window.getTextClassName = (darkMode, type = 'body') => {
  const styles = {
    heading: darkMode ? 'text-white' : 'text-gray-800',
    body: darkMode ? 'text-gray-300' : 'text-gray-600',
    muted: darkMode ? 'text-gray-400' : 'text-gray-500'
  };
  return styles[type] || styles.body;
};
