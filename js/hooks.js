/**
 * Custom React Hooks
 * Reusable hooks for complex application logic
 */

/**
 * Check and update streak status based on last read date
 * This function is called when a profile is loaded to ensure streaks are current
 * @param {Object} profile - Current profile object
 * @returns {Object|null} Updated streak data if changes needed, null otherwise
 */
window.checkAndResetStreak = (profile) => {
  const { getTodayString, getYesterdayString } = window;
  
  const today = getTodayString();
  const yesterdayString = getYesterdayString();
  
  const lastReadDate = profile.lastReadDate || null;
  const currentStreak = profile.currentStreak || 0;
  const pagesReadToday = profile.pagesReadToday || 0;
  
  // Note: lastReadDate is stored in ISO date string format (YYYY-MM-DD)
  // String comparison works correctly for dates in this format
  
  // Check if streak should be reset (user missed yesterday)
  // Streak is lost if lastReadDate is before yesterday
  if (lastReadDate && lastReadDate < yesterdayString && currentStreak > 0) {
    return {
      currentStreak: 0,
      pagesReadToday: 0
    };
  }
  // Reset pagesReadToday if it's a new day (but keep streak intact if it was yesterday)
  else if (lastReadDate && lastReadDate !== today && pagesReadToday > 0) {
    return {
      pagesReadToday: 0
    };
  }
  
  return null;
};

/**
 * Hook for streak calculation and update logic
 * Streaks are based on pages read (not XP earned) to encourage actual reading
 * @param {Object} profile - Current profile object
 * @param {number} pagesAdded - Number of pages read today
 * @returns {Object} Updated streak data
 */
window.useStreakCalculation = (profile, pagesAdded) => {
  const { getTodayString, getYesterdayString } = window;
  const { DAILY_PAGES_GOAL } = window.APP_CONSTANTS;
  
  const today = getTodayString();
  const yesterdayString = getYesterdayString();

  let currentStreak = profile.currentStreak || 0;
  let longestStreak = profile.longestStreak || 0;
  let lastReadDate = profile.lastReadDate || null;
  let pagesReadToday = profile.pagesReadToday || 0;

  if (lastReadDate === today) {
    pagesReadToday += pagesAdded;
  } else {
    pagesReadToday = pagesAdded;
  }

  if (pagesReadToday >= DAILY_PAGES_GOAL) {
    if (lastReadDate === yesterdayString || lastReadDate === today) {
      if (lastReadDate === yesterdayString) {
        currentStreak += 1;
      }
    } else if (lastReadDate === null || lastReadDate < yesterdayString) {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else if (lastReadDate && lastReadDate < yesterdayString) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastReadDate: today,
    pagesReadToday
  };
};
