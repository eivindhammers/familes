/**
 * Firebase Service
 * All Firebase database operations
 */

/**
 * Save profile data to user profiles node
 * @param {string} uid - Firebase auth user ID
 * @param {string} profileId - Profile identifier
 * @param {Object} profileData - Profile data to save
 */
window.saveProfile = async (uid, profileId, profileData) => {
  const { database } = window;
  await database.ref(`userProfiles/${uid}/${profileId}`).set(profileData);
};

/**
 * Save user data to global users list
 * @param {string} profileId - Profile identifier
 * @param {Object} userData - User data to save
 */
window.saveUserToGlobalList = async (profileId, userData) => {
  const { database } = window;
  await database.ref(`users/${profileId}`).set(userData);
};

/**
 * Save books array to Firebase
 * @param {string} profileId - Profile identifier
 * @param {Array} booksArray - Array of book objects
 */
window.saveBooks = async (profileId, booksArray) => {
  const { database } = window;
  const booksObj = {};
  booksArray.forEach(book => {
    booksObj[book.id] = book;
  });
  await database.ref(`books/${profileId}`).set(booksObj);
};

/**
 * Save reading history entry
 * @param {string} profileId - Profile identifier
 * @param {string} bookId - Book identifier
 * @param {Object} entry - Reading entry data
 */
window.saveReadingEntry = async (profileId, bookId, entry) => {
  const { database } = window;
  const entryRef = database.ref(`readingHistory/${profileId}/${bookId}`).push();
  await entryRef.set(entry);
};

/**
 * Load user profiles and set up real-time listener
 * @param {string} uid - Firebase auth user ID
 * @param {Function} callback - Callback to receive profiles data
 */
window.loadUserProfiles = (uid, callback) => {
  const { database } = window;
  const profilesRef = database.ref(`userProfiles/${uid}`);
  profilesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

/**
 * Load books for a profile and set up real-time listener
 * @param {string} profileId - Profile identifier
 * @param {Function} callback - Callback to receive books data
 */
window.loadProfileBooks = (profileId, callback) => {
  const { database } = window;
  const booksRef = database.ref(`books/${profileId}`);
  booksRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

/**
 * Load all users and set up real-time listener
 * @param {Function} callback - Callback to receive users data
 */
window.loadAllUsers = (callback) => {
  const { database } = window;
  const usersRef = database.ref('users');
  usersRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

/**
 * Load all leagues and set up real-time listener
 * @param {Function} callback - Callback to receive leagues data
 */
window.loadLeagues = (callback) => {
  const { database } = window;
  const leaguesRef = database.ref('leagues');
  leaguesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

/**
 * Create a new league
 * @param {string} leagueName - Name of the league
 * @param {string} leagueCode - Unique league code
 * @param {string} createdBy - Profile ID of creator
 * @returns {Promise<string>} League ID
 */
window.createLeague = async (leagueName, leagueCode, createdBy) => {
  const { database } = window;
  const leagueId = database.ref('leagues').push().key;
  const leagueData = {
    id: leagueId,
    name: leagueName,
    code: leagueCode,
    createdBy: createdBy,
    createdAt: new Date().toISOString(),
    members: { [createdBy]: true }
  };
  
  await database.ref(`leagues/${leagueId}`).set(leagueData);
  return leagueId;
};

/**
 * Find league by code
 * @param {string} code - League code to search for
 * @returns {Promise<Object|null>} League object or null
 */
window.findLeagueByCode = async (code) => {
  const { database } = window;
  const snapshot = await database.ref('leagues')
    .orderByChild('code')
    .equalTo(code.toUpperCase())
    .once('value');
  
  const leagues = snapshot.val();
  if (leagues) {
    const leagueId = Object.keys(leagues)[0];
    return leagues[leagueId];
  }
  return null;
};

/**
 * Check if a league code already exists
 * @param {string} code - League code to check
 * @returns {Promise<boolean>} True if code exists, false otherwise
 */
window.leagueCodeExists = async (code) => {
  const league = await window.findLeagueByCode(code);
  return league !== null;
};

/**
 * Add profile to league members
 * @param {string} leagueId - League ID
 * @param {string} profileId - Profile ID to add
 */
window.addMemberToLeague = async (leagueId, profileId) => {
  const { database } = window;
  await database.ref(`leagues/${leagueId}/members/${profileId}`).set(true);
};

/**
 * Add league to profile's leagues array
 * @param {string} uid - Firebase auth user ID
 * @param {string} profileId - Profile ID
 * @param {string} leagueId - League ID to add
 */
window.addLeagueToProfile = async (uid, profileId, leagueId) => {
  const { database } = window;
  const profileRef = database.ref(`userProfiles/${uid}/${profileId}/leagues`);
  
  return new Promise((resolve, reject) => {
    profileRef.transaction((currentLeagues) => {
      // Initialize as empty array if leagues doesn't exist
      if (currentLeagues === null) {
        return [leagueId];
      }
      
      // Ensure we're working with an array
      const leagues = Array.isArray(currentLeagues) ? currentLeagues : [];
      
      // Add league if not already present
      if (!leagues.includes(leagueId)) {
        leagues.push(leagueId);
      }
      
      return leagues;
    }, (error, committed, snapshot) => {
      if (error) {
        reject(error);
      } else if (committed) {
        resolve(snapshot.val());
      } else {
        reject(new Error('Failed to update profile leagues - transaction aborted due to concurrent modifications'));
      }
    });
  });
};

/**
 * Update league leaderboard for a profile
 * @param {string} leagueId - League ID
 * @param {string} profileId - Profile ID
 * @param {Object} profile - Profile data
 */
window.updateLeagueLeaderboard = async (leagueId, profileId, profile) => {
  const { database, getUserXP, getUserMonthlyXP } = window;
  const leaderboardData = {
    id: profileId,
    name: profile.name,
    totalPages: profile.totalPages,
    totalXP: getUserXP(profile),
    level: profile.level,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastReadDate: profile.lastReadDate || null,
    // Monthly competition fields
    monthlyXP: getUserMonthlyXP(profile),
    currentMonth: profile.currentMonth || null
  };

  await database.ref(`leagueLeaderboards/${leagueId}/${profileId}`).set(leaderboardData);
};

/**
 * Load league leaderboard and set up real-time listener
 * @param {string} leagueId - League ID
 * @param {Function} callback - Callback to receive leaderboard data
 */
window.loadLeagueLeaderboard = (leagueId, callback) => {
  const { database } = window;
  const leaderboardRef = database.ref(`leagueLeaderboards/${leagueId}`);
  leaderboardRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// ============ Friend System Functions ============

/**
 * Send a friend request from one profile to another
 * @param {string} fromProfileId - Profile ID of the sender
 * @param {string} toProfileId - Profile ID of the recipient
 */
window.sendFriendRequest = async (fromProfileId, toProfileId) => {
  const { database } = window;
  const timestamp = new Date().toISOString();
  
  const updates = {};
  updates[`friendships/${fromProfileId}/requests/outgoing/${toProfileId}`] = { timestamp };
  updates[`friendships/${toProfileId}/requests/incoming/${fromProfileId}`] = { timestamp };
  
  await database.ref().update(updates);
};

/**
 * Accept a friend request
 * @param {string} myProfileId - Profile ID of the accepter
 * @param {string} fromProfileId - Profile ID of the requester
 */
window.acceptFriendRequest = async (myProfileId, fromProfileId) => {
  const { database } = window;
  const timestamp = new Date().toISOString();
  
  const updates = {};
  // Add to friends lists for both profiles
  updates[`friendships/${myProfileId}/friends/${fromProfileId}`] = { since: timestamp };
  updates[`friendships/${fromProfileId}/friends/${myProfileId}`] = { since: timestamp };
  // Remove the request from both sides
  updates[`friendships/${myProfileId}/requests/incoming/${fromProfileId}`] = null;
  updates[`friendships/${fromProfileId}/requests/outgoing/${myProfileId}`] = null;
  // Add notification for the original requester that their request was accepted
  updates[`friendships/${fromProfileId}/notifications/accepted/${myProfileId}`] = { timestamp };
  
  await database.ref().update(updates);
};

/**
 * Dismiss an accepted friend notification
 * @param {string} myProfileId - Profile ID of the user dismissing the notification
 * @param {string} accepterProfileId - Profile ID of the user who accepted the request
 * @returns {Promise<void>}
 */
window.dismissAcceptedNotification = async (myProfileId, accepterProfileId) => {
  const { database } = window;
  await database.ref(`friendships/${myProfileId}/notifications/accepted/${accepterProfileId}`).remove();
};

/**
 * Decline a friend request
 * @param {string} myProfileId - Profile ID of the decliner
 * @param {string} fromProfileId - Profile ID of the requester
 */
window.declineFriendRequest = async (myProfileId, fromProfileId) => {
  const { database } = window;
  
  const updates = {};
  updates[`friendships/${myProfileId}/requests/incoming/${fromProfileId}`] = null;
  updates[`friendships/${fromProfileId}/requests/outgoing/${myProfileId}`] = null;
  
  await database.ref().update(updates);
};

/**
 * Cancel an outgoing friend request
 * @param {string} myProfileId - Profile ID of the canceller
 * @param {string} toProfileId - Profile ID of the recipient
 */
window.cancelFriendRequest = async (myProfileId, toProfileId) => {
  const { database } = window;
  
  const updates = {};
  updates[`friendships/${myProfileId}/requests/outgoing/${toProfileId}`] = null;
  updates[`friendships/${toProfileId}/requests/incoming/${myProfileId}`] = null;
  
  await database.ref().update(updates);
};

/**
 * Remove a friend from both profiles
 * @param {string} myProfileId - Profile ID of the remover
 * @param {string} friendProfileId - Profile ID of the friend to remove
 */
window.removeFriend = async (myProfileId, friendProfileId) => {
  const { database } = window;
  
  const updates = {};
  updates[`friendships/${myProfileId}/friends/${friendProfileId}`] = null;
  updates[`friendships/${friendProfileId}/friends/${myProfileId}`] = null;
  
  await database.ref().update(updates);
};

/**
 * Load friendships for a profile and set up real-time listener
 * @param {string} profileId - Profile identifier
 * @param {Function} callback - Callback to receive friendships data
 * @returns {Function} Unsubscribe function to clean up the listener
 */
window.loadFriendships = (profileId, callback) => {
  const { database } = window;
  const friendshipsRef = database.ref(`friendships/${profileId}`);
  friendshipsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  // Return unsubscribe function
  return () => friendshipsRef.off('value');
};

/**
 * Search users by name (case-insensitive partial match)
 * @param {string} searchTerm - Search term to match against user names
 * @param {Object} users - Object of all users keyed by profile ID
 * @returns {Array} Array of matching users
 */
window.searchUsersByName = (searchTerm, users) => {
  if (!searchTerm || !users) return [];
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return Object.values(users).filter(user => 
    user.name && user.name.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Load books for a specific profile (one-time fetch)
 * @param {string} profileId - Profile identifier
 * @returns {Promise<Array>} Array of books
 */
window.loadProfileBooksOnce = async (profileId) => {
  const { database } = window;
  const snapshot = await database.ref(`books/${profileId}`).once('value');
  const data = snapshot.val();
  return data ? Object.values(data) : [];
};

// ============ Profile Management Functions ============

/**
 * Delete a profile and all associated data
 * @param {string} uid - Firebase auth user ID
 * @param {string} profileId - Profile ID to delete
 */
window.deleteProfile = async (uid, profileId) => {
  const { database } = window;
  
  const updates = {};
  // Delete from user profiles
  updates[`userProfiles/${uid}/${profileId}`] = null;
  // Delete from global users list
  updates[`users/${profileId}`] = null;
  // Delete books
  updates[`books/${profileId}`] = null;
  // Delete reading history
  updates[`readingHistory/${profileId}`] = null;
  // Delete friendships
  updates[`friendships/${profileId}`] = null;
  
  await database.ref().update(updates);
};

/**
 * Set a profile as the main account and unset others
 * @param {string} uid - Firebase auth user ID
 * @param {string} profileId - Profile ID to set as main
 * @param {Array} allProfiles - Array of all user's profiles
 */
window.setMainProfile = async (uid, profileId, allProfiles) => {
  const { database } = window;
  
  const updates = {};
  // Update all profiles
  for (const profile of allProfiles) {
    const isMain = profile.id === profileId;
    updates[`userProfiles/${uid}/${profile.id}/isMainAccount`] = isMain;
    updates[`users/${profile.id}/isMainAccount`] = isMain;
  }
  
  await database.ref().update(updates);
};

/**
 * Delete all profiles for a user
 * @param {string} uid - Firebase auth user ID
 * @param {Array} profiles - Array of all user's profiles to delete
 */
window.deleteAllProfiles = async (uid, profiles) => {
  const { database } = window;

  const updates = {};
  for (const profile of profiles) {
    // Delete from user profiles
    updates[`userProfiles/${uid}/${profile.id}`] = null;
    // Delete from global users list
    updates[`users/${profile.id}`] = null;
    // Delete books
    updates[`books/${profile.id}`] = null;
    // Delete reading history
    updates[`readingHistory/${profile.id}`] = null;
    // Delete friendships
    updates[`friendships/${profile.id}`] = null;
  }

  await database.ref().update(updates);
};

// ============ Monthly Competition Functions ============

/**
 * Calculate monthly XP from reading history for a specific month
 * @param {string} profileId - Profile identifier
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<number>} Total XP for that month
 */
window.calculateMonthlyXPFromHistory = async (profileId, month) => {
  const { database } = window;

  try {
    const snapshot = await database.ref(`readingHistory/${profileId}`).once('value');
    const allHistory = snapshot.val();

    if (!allHistory) return 0;

    // Calculate month boundaries
    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    let totalXP = 0;

    // Iterate through all books
    Object.values(allHistory).forEach(bookHistory => {
      if (!bookHistory) return;

      // Iterate through all entries for each book
      Object.values(bookHistory).forEach(entry => {
        if (!entry || !entry.timestamp) return;

        const entryDate = new Date(entry.timestamp);

        // Check if entry falls within the month
        if (entryDate >= startOfMonth && entryDate <= endOfMonth) {
          const xp = entry.xpEarned ?? entry.pagesAdded ?? 0;
          if (xp > 0) {
            totalXP += xp;
          }
        }
      });
    });

    return totalXP;
  } catch (error) {
    console.error('Error calculating monthly XP from history:', error);
    return 0;
  }
};

/**
 * Backfill current month's XP from reading history
 * Used for mid-month deployment handling
 * @param {string} profileId - Profile identifier
 * @returns {Promise<number>} Total XP for current month from history
 */
window.backfillCurrentMonthXP = async (profileId) => {
  const { getCurrentMonth, calculateMonthlyXPFromHistory } = window;
  const currentMonth = getCurrentMonth();
  return await calculateMonthlyXPFromHistory(profileId, currentMonth);
};

// Cache for historical leaderboard calculations
const historicalLeaderboardCache = new Map();

/**
 * Load historical monthly leaderboard for a league
 * Calculates XP from reading history for past months
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} members - League members object (profileId: true)
 * @returns {Promise<Array>} Sorted leaderboard with ranks
 */
window.loadHistoricalMonthlyLeaderboard = async (leagueId, month, members) => {
  const { database, calculateMonthlyXPFromHistory } = window;

  if (!members) return [];

  // Check cache
  const cacheKey = `${leagueId}-${month}`;
  if (historicalLeaderboardCache.has(cacheKey)) {
    return historicalLeaderboardCache.get(cacheKey);
  }

  const memberIds = Object.keys(members);

  // Fetch XP for each member in parallel
  const results = await Promise.all(
    memberIds.map(async (profileId) => {
      // Load basic profile info from global users
      const snapshot = await database.ref(`users/${profileId}`).once('value');
      const userData = snapshot.val();

      if (!userData) {
        return null;
      }

      // Calculate monthly XP from reading history
      const monthlyXP = await calculateMonthlyXPFromHistory(profileId, month);

      return {
        id: profileId,
        name: userData.name,
        level: userData.level,
        monthlyXP: monthlyXP
      };
    })
  );

  // Filter out null results and sort by monthly XP
  const leaderboard = results
    .filter(result => result !== null)
    .sort((a, b) => b.monthlyXP - a.monthlyXP)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  // Cache the result (cache expires after 5 minutes)
  historicalLeaderboardCache.set(cacheKey, leaderboard);
  setTimeout(() => historicalLeaderboardCache.delete(cacheKey), 5 * 60 * 1000);

  return leaderboard;
};

/**
 * Get the monthly winner for a league
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} members - League members object
 * @returns {Promise<Object|null>} Winner object or null if no activity
 */
window.getMonthlyWinner = async (leagueId, month, members) => {
  const { loadHistoricalMonthlyLeaderboard } = window;

  const leaderboard = await loadHistoricalMonthlyLeaderboard(leagueId, month, members);

  if (leaderboard.length === 0) return null;

  const winner = leaderboard[0];

  // Only return winner if they actually earned XP
  if (winner.monthlyXP <= 0) return null;

  return winner;
};

/**
 * Award XP bonus to a winner
 * Bonus goes to totalXP only, NOT to monthlyXP
 * @param {string} uid - Firebase auth user ID
 * @param {string} profileId - Profile ID
 * @param {Object} profile - Current profile data
 * @param {number} bonusXP - Amount of XP to award
 * @returns {Promise<Object>} Updated profile
 */
window.awardWinnerBonus = async (uid, profileId, profile, bonusXP) => {
  const { saveProfile, saveUserToGlobalList, getLevelFromXP, getUserXP } = window;

  const currentTotalXP = getUserXP(profile);
  const newTotalXP = currentTotalXP + bonusXP;
  const newLevel = getLevelFromXP(newTotalXP);

  const updatedProfile = {
    ...profile,
    totalXP: newTotalXP,
    level: newLevel
    // Note: monthlyXP is NOT updated - bonus doesn't count toward monthly competition
  };

  await saveProfile(uid, profileId, updatedProfile);
  await saveUserToGlobalList(profileId, updatedProfile);

  return updatedProfile;
};

/**
 * Save monthly winner record
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format
 * @param {string} winnerId - Profile ID of winner
 * @param {number} bonusXP - Amount of XP awarded
 */
window.saveMonthlyWinner = async (leagueId, month, winnerId, bonusXP) => {
  const { database } = window;

  const winnerData = {
    profileId: winnerId,
    month: month,
    bonusXP: bonusXP,
    awardedAt: new Date().toISOString()
  };

  await database.ref(`leagueWinners/${leagueId}/${month}`).set(winnerData);
};

/**
 * Load all winners for a league
 * @param {string} leagueId - League ID
 * @returns {Promise<Object>} Object of winners keyed by month
 */
window.loadLeagueWinners = async (leagueId) => {
  const { database } = window;
  const snapshot = await database.ref(`leagueWinners/${leagueId}`).once('value');
  return snapshot.val() || {};
};

/**
 * Check if a winner has already been awarded for a month
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<boolean>} True if already awarded
 */
window.isWinnerAwarded = async (leagueId, month) => {
  const { database } = window;
  const snapshot = await database.ref(`leagueWinners/${leagueId}/${month}`).once('value');
  return snapshot.exists();
};

/**
 * Process and award the monthly winner for a league
 * This is a foundation function - not yet integrated with UI
 * Call this to determine winner and award bonus XP
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format (must be a past month)
 * @param {string} uid - Firebase auth user ID (for saving profile updates)
 * @returns {Promise<Object>} Result with winner info or error
 */
window.processMonthlyWinner = async (leagueId, month, uid) => {
  const {
    database,
    isWinnerAwarded,
    getMonthlyWinner,
    awardWinnerBonus,
    saveMonthlyWinner,
    getCurrentMonth
  } = window;
  const { MONTHLY_WINNER_BONUS_XP } = window.APP_CONSTANTS;

  // Prevent processing current month (competition still ongoing)
  if (month === getCurrentMonth()) {
    return { error: 'Cannot process winner for current month - competition still ongoing' };
  }

  // Check if already awarded
  const alreadyAwarded = await isWinnerAwarded(leagueId, month);
  if (alreadyAwarded) {
    const winners = await window.loadLeagueWinners(leagueId);
    return { alreadyAwarded: true, winner: winners[month] };
  }

  // Get league data
  const leagueSnapshot = await database.ref(`leagues/${leagueId}`).once('value');
  const league = leagueSnapshot.val();

  if (!league || !league.members) {
    return { error: 'League not found or has no members' };
  }

  // Determine winner
  const winner = await getMonthlyWinner(leagueId, month, league.members);

  if (!winner) {
    return { noWinner: true, message: 'No activity in league for this month' };
  }

  // Load winner's full profile
  const profileSnapshot = await database.ref(`users/${winner.id}`).once('value');
  const profile = profileSnapshot.val();

  if (!profile) {
    return { error: 'Winner profile not found' };
  }

  // Award bonus XP (adds to totalXP, not monthlyXP)
  await awardWinnerBonus(uid, winner.id, profile, MONTHLY_WINNER_BONUS_XP);

  // Record the winner
  await saveMonthlyWinner(leagueId, month, winner.id, MONTHLY_WINNER_BONUS_XP);

  return {
    success: true,
    winner: {
      id: winner.id,
      name: winner.name,
      monthlyXP: winner.monthlyXP,
      bonusXP: MONTHLY_WINNER_BONUS_XP
    },
    month: month
  };
};
