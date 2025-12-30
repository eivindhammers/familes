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
