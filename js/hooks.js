/**
 * Custom React Hooks
 * Reusable hooks for complex application logic
 */

/**
 * Hook for streak calculation and update logic
 * @param {Object} profile - Current profile object
 * @param {number} pagesToday - Number of pages read today
 * @returns {Object} Updated streak data
 */
window.useStreakCalculation = (profile, pagesToday) => {
  const { getTodayString } = window;
  const { DAILY_PAGES_GOAL } = window.APP_CONSTANTS;
  
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  let currentStreak = profile.currentStreak || 0;
  let longestStreak = profile.longestStreak || 0;
  let lastReadDate = profile.lastReadDate || null;
  let pagesReadToday = profile.pagesReadToday || 0;

  if (lastReadDate === today) {
    pagesReadToday += pagesToday;
  } else {
    pagesReadToday = pagesToday;
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
