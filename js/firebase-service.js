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
  const { database } = window;
  const leaderboardData = {
    id: profileId,
    name: profile.name,
    totalPages: profile.totalPages,
    level: profile.level,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak
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
