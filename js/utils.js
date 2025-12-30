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
