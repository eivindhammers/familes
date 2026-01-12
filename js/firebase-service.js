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
  const { database, getUserXP } = window;
  const leaderboardData = {
    id: profileId,
    name: profile.name,
    totalPages: profile.totalPages,
    totalXP: getUserXP(profile),
    monthlyXP: profile.monthlyXP || 0,
    currentMonth: profile.currentMonth || window.getCurrentMonth(),
    level: profile.level,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak
  };
  
  await database.ref(`leagueLeaderboards/${leagueId}/${profileId}`).set(leaderboardData);
};

/**
 * Helper function to get last month in YYYY-MM format
 * @returns {string} Last month as YYYY-MM string
 */
window.getLastMonth = () => {
  const today = new Date();
  // Get year and month, then subtract 1 from month
  let year = today.getFullYear();
  let month = today.getMonth(); // 0-11
  
  // If January, go to December of previous year
  if (month === 0) {
    year -= 1;
    month = 11;
  } else {
    month -= 1;
  }
  
  // Format as YYYY-MM
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

/**
 * Get and update monthly winner for a league
 * @param {string} leagueId - League ID
 * @param {Object} leagueLeaderboard - Current league leaderboard data
 * @returns {Promise<Object>} Object with winner info and whether it's newly determined
 */
window.determineMonthlyWinner = async (leagueId, leagueLeaderboard) => {
  const { database, getCurrentMonth, getMonthlyLeaderboard, getLastMonth } = window;
  
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();
  
  // Get stored monthly winner data
  const winnerSnapshot = await database.ref(`leagues/${leagueId}/monthlyWinners/${lastMonth}`).once('value');
  const existingWinner = winnerSnapshot.val();
  
  // If we already have a winner for last month, return it
  if (existingWinner) {
    return { winner: existingWinner, isNew: false };
  }
  
  // Otherwise, determine the winner from leaderboard data
  // Find users who have the correct month and get the top one
  const usersLastMonth = Object.values(leagueLeaderboard || {})
    .filter(user => user.currentMonth === lastMonth)
    .sort((a, b) => (b.monthlyXP || 0) - (a.monthlyXP || 0));
  
  if (usersLastMonth.length === 0 || (usersLastMonth[0].monthlyXP || 0) === 0) {
    return { winner: null, isNew: false };
  }
  
  const winner = {
    profileId: usersLastMonth[0].id,
    name: usersLastMonth[0].name,
    monthlyXP: usersLastMonth[0].monthlyXP,
    month: lastMonth,
    rewardClaimed: false
  };
  
  // Store the winner
  await database.ref(`leagues/${leagueId}/monthlyWinners/${lastMonth}`).set(winner);
  
  return { winner, isNew: true };
};

/**
 * Claim monthly winner reward
 * @param {string} leagueId - League ID
 * @param {string} month - Month in YYYY-MM format
 * @param {string} profileId - Winner's profile ID
 * @param {number} rewardXP - Amount of XP to award
 * @returns {Promise<boolean>} True if reward was claimed successfully
 */
window.claimMonthlyReward = async (leagueId, month, profileId, rewardXP) => {
  const { database } = window;
  
  // Check if reward was already claimed
  const winnerSnapshot = await database.ref(`leagues/${leagueId}/monthlyWinners/${month}`).once('value');
  const winner = winnerSnapshot.val();
  
  if (!winner || winner.profileId !== profileId || winner.rewardClaimed) {
    return false;
  }
  
  // Mark reward as claimed
  await database.ref(`leagues/${leagueId}/monthlyWinners/${month}/rewardClaimed`).set(true);
  
  return true;
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

/**
 * Calculate monthly XP from reading history for a specific month
 * @param {string} profileId - Profile ID
 * @param {string} targetMonth - Month in YYYY-MM format (e.g., "2026-01")
 * @returns {Promise<number>} Total XP earned in that month
 */
window.calculateMonthlyXPFromHistory = async (profileId, targetMonth) => {
  const { database } = window;
  
  // Load all reading history for this profile
  const snapshot = await database.ref(`readingHistory/${profileId}`).once('value');
  const historyData = snapshot.val();
  
  if (!historyData) {
    return 0;
  }
  
  let totalMonthlyXP = 0;
  
  // Iterate through all books and their reading entries
  Object.values(historyData).forEach(bookEntries => {
    // Ensure bookEntries is an object before trying to iterate
    if (bookEntries && typeof bookEntries === 'object') {
      Object.values(bookEntries).forEach(entry => {
        // Check if entry is an object with the required fields
        if (entry && typeof entry === 'object' && entry.timestamp && entry.xpEarned) {
          const entryMonth = entry.timestamp.substring(0, 7); // Extract YYYY-MM
          if (entryMonth === targetMonth) {
            totalMonthlyXP += entry.xpEarned;
          }
        }
      });
    }
  });
  
  return totalMonthlyXP;
};
