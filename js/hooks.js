/**
 * Custom React Hooks
 * Reusable hooks for complex application logic
 */

/**
 * Hook for streak calculation and update logic
 * Streaks are based on pages read (not XP earned) to encourage actual reading
 * @param {Object} profile - Current profile object
 * @param {number} pagesAdded - Number of pages read today
 * @returns {Object} Updated streak data
 */
window.useStreakCalculation = (profile, pagesAdded) => {
  const { getTodayString, getYesterdayString, hasBrokenStreak } = window;
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
    } else if (lastReadDate === null || hasBrokenStreak(lastReadDate, yesterdayString)) {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else if (hasBrokenStreak(lastReadDate, yesterdayString)) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastReadDate: today,
    pagesReadToday
  };
};
