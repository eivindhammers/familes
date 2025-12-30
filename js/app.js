// Main Application Component
const { useState, useEffect } = React;

// Destructure from window globals
const { 
  database, 
  auth, 
  APP_CONSTANTS, 
  Icons,
  // Utils
  calculateProgress,
  generateLeagueCode,
  // Firebase services
  saveProfile,
  saveUserToGlobalList,
  saveBooks,
  saveReadingEntry,
  loadUserProfiles,
  loadProfileBooks,
  loadAllUsers,
  loadLeagues,
  createLeague,
  findLeagueByCode,
  leagueCodeExists,
  addMemberToLeague,
  addLeagueToProfile,
  updateLeagueLeaderboard,
  loadLeagueLeaderboard,
  // Google Books API
  searchGoogleBooks,
  // Hooks
  useStreakCalculation,
  // Components
  AuthScreen,
  ProfileSelector,
  ProfileHeader,
  BookForm,
  BookList,
  Leaderboard,
  LeagueManager,
  LevelUpOverlay
} = window;

const { PAGES_PER_LEVEL, DAILY_PAGES_GOAL } = APP_CONSTANTS;
const { BookOpen, Users, Settings } = Icons;

// Level-up display durations (in milliseconds)
const SINGLE_LEVELUP_DURATION = 4000; // 4 seconds for single level-up
const MULTIPLE_LEVELUP_DURATION = 2000; // 2 seconds per level for multiple level-ups

const BookContestApp = () => {
  // Authentication state
  const [authUser, setAuthUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Profile state
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  
  // Books state
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', pages: '', coverUrl: '' });
  const [selectedBook, setSelectedBook] = useState(null);
  const [pageUpdate, setPageUpdate] = useState('');
  
  // Google Books search state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('myBooks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStreakMessage, setShowStreakMessage] = useState(false);
  
  // Level-up state
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const [currentLevelUp, setCurrentLevelUp] = useState(null);
  const [isMultipleLevelUp, setIsMultipleLevelUp] = useState(false);
  
  // Leaderboard state
  const [users, setUsers] = useState({});
  
  // League state
  const [leagues, setLeagues] = useState({});
  const [currentLeagueId, setCurrentLeagueId] = useState(null);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinLeagueCode, setJoinLeagueCode] = useState('');
  const [leagueAction, setLeagueAction] = useState('join');
  const [leagueLeaderboard, setLeagueLeaderboard] = useState({});

  // Google Books search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (newBook.title && newBook.title.length > 2 && showSuggestions) {
        setIsSearching(true);
        const results = await searchGoogleBooks(newBook.title);
        setSuggestions(results);
        setIsSearching(false);
      } else if (!newBook.title) {
        setSuggestions([]);
      }
    }, 500);
  
    return () => clearTimeout(timeoutId);
  }, [newBook.title, showSuggestions]);

  // Handle book selection from Google Books
  const selectBook = (book) => {
    setNewBook({
      title: book.title,
      author: book.author,
      pages: book.pages.toString(),
      coverUrl: book.thumbnail
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Process level-up queue
  useEffect(() => {
    if (levelUpQueue.length > 0 && !currentLevelUp) {
      const nextLevel = levelUpQueue[0];
      const isLastLevel = levelUpQueue.length === 1;
      setCurrentLevelUp(nextLevel);
      setLevelUpQueue(prev => prev.slice(1));
      
      // Display duration: 4s for single level, 2s per level for multiple
      const displayDuration = isMultipleLevelUp ? MULTIPLE_LEVELUP_DURATION : SINGLE_LEVELUP_DURATION;
      
      setTimeout(() => {
        setCurrentLevelUp(null);
        // Reset flag when queue is empty
        if (isLastLevel) {
          setIsMultipleLevelUp(false);
        }
      }, displayDuration);
    }
  }, [levelUpQueue, currentLevelUp, isMultipleLevelUp]);

  // Authentication handlers
  const handleAuth = async () => {
    if (isRegistering) {
      if (!email || !password || !registerName) {
        setError('Vennligst fyll inn alle felt');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Vennligst fyll inn e-post og passord');
        return;
      }
    }

    try {
      if (isRegistering) {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const profileId = `${userCredential.user.uid}_main`;
        const defaultProfile = {
          id: profileId,
          name: registerName.trim(),
          isMainAccount: true,
          totalPages: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: null,
          pagesReadToday: 0,
          createdAt: new Date().toISOString()
        };
        await saveProfile(userCredential.user.uid, profileId, defaultProfile);
        await saveUserToGlobalList(profileId, defaultProfile);
        setError('');
        setRegisterName('');
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        setError('');
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setBooks([]);
    setActiveTab('myBooks');
  };

  // Profile handlers
  const createNewProfile = async () => {
    if (!newProfileName.trim()) {
      setError('Vennligst skriv inn et navn');
      return;
    }

    const profileId = `${authUser.uid}_${Date.now()}`;
    const newProfile = {
      id: profileId,
      name: newProfileName.trim(),
      isMainAccount: false,
      totalPages: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      pagesReadToday: 0,
      createdAt: new Date().toISOString()
    };

    await saveProfile(authUser.uid, profileId, newProfile);
    await saveUserToGlobalList(profileId, newProfile);
    setNewProfileName('');
    setShowProfileManager(false);
    setError('');
  };

  const switchProfile = (profile) => {
    setCurrentProfile(profile);
    setShowProfileManager(false);
    setActiveTab('myBooks');
  };

  // Book handlers
  const addBook = async () => {
    if (!newBook.title || !newBook.author) {
      setError('Skriv inn tittel og forfatter');
      return;
    }
  
    const book = {
      id: Date.now().toString(),
      title: newBook.title,
      author: newBook.author,
      totalPages: parseInt(newBook.pages) || 0,
      coverUrl: newBook.coverUrl || '',
      pagesRead: 0,
      startedAt: new Date().toISOString()
    };
  
    const updatedBooks = [...books, book];
    await saveBooks(currentProfile.id, updatedBooks);
    setNewBook({ title: '', author: '', pages: '', coverUrl: '' }); 
    setError('');
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Er du sikker på at du vil slette denne boken?')) {
      const updatedBooks = books.filter(book => book.id !== bookId);
      await saveBooks(currentProfile.id, updatedBooks);
      setBooks(updatedBooks);
      setError('');
    }
  };

  const updatePages = async (bookId) => {
    const newTotalRead = parseInt(pageUpdate);
    
    if (isNaN(newTotalRead) || newTotalRead < 0) {
      setError('Vennligst skriv inn et gyldig antall leste sider');
      return;
    }
  
    const targetBook = books.find(b => b.id === bookId);
    const difference = newTotalRead - targetBook.pagesRead;
    
    if (difference === 0) {
      setPageUpdate('');
      setSelectedBook(null);
      return;
    }
  
    const updatedBooks = books.map(book => {
      if (book.id === bookId) {
        const total = book.totalPages > 0 ? Math.min(newTotalRead, book.totalPages) : newTotalRead;
        return { ...book, pagesRead: total };
      }
      return book;
    });
  
    const totalPagesAcrossAllBooks = updatedBooks.reduce((sum, book) => sum + book.pagesRead, 0);
    const newLevel = Math.floor(totalPagesAcrossAllBooks / PAGES_PER_LEVEL) + 1;
    const oldLevel = currentProfile.level;
  
    const streakData = useStreakCalculation(currentProfile, difference > 0 ? difference : 0);
    const wasStreakActive = currentProfile.currentStreak > 0;
    
    const updatedProfile = {
      ...currentProfile,
      totalPages: totalPagesAcrossAllBooks,
      level: newLevel,
      ...streakData
    };

    const readingEntry = {
      timestamp: new Date().toISOString(),
      bookTitle: targetBook.title,
      bookAuthor: targetBook.author,
      previousTotal: targetBook.pagesRead,
      newTotal: newTotalRead,
      pagesAdded: difference,
      profileName: currentProfile.name,
      levelAtTime: newLevel
    };
  
    await saveBooks(currentProfile.id, updatedBooks);
    await saveProfile(authUser.uid, currentProfile.id, updatedProfile);
    await saveUserToGlobalList(currentProfile.id, updatedProfile);
    await saveReadingEntry(currentProfile.id, bookId, readingEntry);
    
    // Update league leaderboards for all leagues the profile is in
    if (currentProfile.leagues && currentProfile.leagues.length > 0) {
      for (const leagueId of currentProfile.leagues) {
        await updateLeagueLeaderboard(leagueId, currentProfile.id, updatedProfile);
      }
    }
    
    setCurrentProfile(updatedProfile);
    
    // Check for level-up(s) and add to queue
    if (newLevel > oldLevel) {
      const levelsGained = [];
      for (let level = oldLevel + 1; level <= newLevel; level++) {
        levelsGained.push(level);
      }
      setIsMultipleLevelUp(levelsGained.length > 1);
      setLevelUpQueue(prev => [...prev, ...levelsGained]);
    }
    
    if (!wasStreakActive && streakData.currentStreak > 0) {
      setShowStreakMessage(true);
      setTimeout(() => setShowStreakMessage(false), 3000);
    }
    
    setPageUpdate('');
    setSelectedBook(null);
    setError('');
  };

  // League handlers
  const handleLeagueAction = async (action) => {
    setError('');
    
    if (action === 'create') {
      if (!newLeagueName.trim()) {
        setError('Vennligst skriv inn et liganavn');
        return;
      }
      
      try {
        // Generate unique league code with retry logic
        let code;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          if (attempts >= maxAttempts) {
            throw new Error('Kunne ikke generere unik ligakode');
          }
          code = generateLeagueCode();
          attempts++;
        } while (await leagueCodeExists(code));
        
        const leagueId = await createLeague(newLeagueName.trim(), code, currentProfile.id);
        await addLeagueToProfile(authUser.uid, currentProfile.id, leagueId);
        await updateLeagueLeaderboard(leagueId, currentProfile.id, currentProfile);
        
        // Update local state
        const updatedProfile = {
          ...currentProfile,
          leagues: [...(currentProfile.leagues || []), leagueId]
        };
        setCurrentProfile(updatedProfile);
        setNewLeagueName('');
        setError('');
      } catch (err) {
        setError('Kunne ikke opprette liga: ' + err.message);
      }
    } else if (action === 'join') {
      if (!joinLeagueCode.trim() || joinLeagueCode.length !== 6) {
        setError('Vennligst skriv inn en gyldig 6-tegns ligakode');
        return;
      }
      
      try {
        const league = await findLeagueByCode(joinLeagueCode.trim());
        
        if (!league) {
          setError('Fant ingen liga med denne koden');
          return;
        }
        
        // Check if already a member
        if (currentProfile.leagues && currentProfile.leagues.includes(league.id)) {
          setError('Du er allerede medlem av denne ligaen');
          return;
        }
        
        await addMemberToLeague(league.id, currentProfile.id);
        await addLeagueToProfile(authUser.uid, currentProfile.id, league.id);
        await updateLeagueLeaderboard(league.id, currentProfile.id, currentProfile);
        
        // Update local state
        const updatedProfile = {
          ...currentProfile,
          leagues: [...(currentProfile.leagues || []), league.id]
        };
        setCurrentProfile(updatedProfile);
        setJoinLeagueCode('');
        setError('');
      } catch (err) {
        setError('Kunne ikke bli med i liga: ' + err.message);
      }
    }
  };

  // Authentication listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAuthUser(user);
        loadUserProfiles(user.uid, (data) => {
          if (data) {
            const profilesList = Object.values(data);
            setProfiles(profilesList);
            if (profilesList.length === 1 && !currentProfile) {
              setCurrentProfile(profilesList[0]);
            }
          } else {
            setProfiles([]);
          }
          setLoading(false);
        });
      } else {
        setAuthUser(null);
        setProfiles([]);
        setCurrentProfile(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Load profile data
  useEffect(() => {
    if (currentProfile) {
      loadProfileBooks(currentProfile.id, (data) => {
        setBooks(data ? Object.values(data) : []);
      });
      loadAllUsers((data) => {
        setUsers(data || {});
      });
      loadLeagues((data) => {
        setLeagues(data || {});
      });
    }
  }, [currentProfile]);

  // Reset league selection when profile changes
  useEffect(() => {
    setCurrentLeagueId(null);
  }, [currentProfile?.id]);

  // Load league leaderboard when league is selected
  useEffect(() => {
    if (currentLeagueId) {
      loadLeagueLeaderboard(currentLeagueId, (data) => {
        setLeagueLeaderboard(data || {});
      });
    } else {
      setLeagueLeaderboard({});
    }
  }, [currentLeagueId]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Laster...</div>
      </div>
    );
  }

  // Render auth screen
  if (!authUser) {
    return (
      <AuthScreen
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        registerName={registerName}
        setRegisterName={setRegisterName}
        handleAuth={handleAuth}
        error={error}
      />
    );
  }

  // Render profile selector
  if (!currentProfile) {
    return (
      <ProfileSelector
        profiles={profiles}
        switchProfile={switchProfile}
        handleLogout={handleLogout}
        showProfileManager={showProfileManager}
        setShowProfileManager={setShowProfileManager}
        newProfileName={newProfileName}
        setNewProfileName={setNewProfileName}
        createNewProfile={createNewProfile}
        error={error}
        setError={setError}
      />
    );
  }

  const progress = calculateProgress(currentProfile.totalPages);

  // Render main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentLevelUp && (
        <LevelUpOverlay 
          level={currentLevelUp}
        />
      )}
      
      <div className="max-w-6xl mx-auto p-4">
        <ProfileHeader
          currentProfile={currentProfile}
          setCurrentProfile={setCurrentProfile}
          handleLogout={handleLogout}
          showStreakMessage={showStreakMessage}
          progress={progress}
          PAGES_PER_LEVEL={PAGES_PER_LEVEL}
          DAILY_PAGES_GOAL={DAILY_PAGES_GOAL}
        />

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('myBooks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
              activeTab === 'myBooks'
                ? 'bg-white shadow-md text-indigo-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Mine bøker
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
              activeTab === 'leaderboard'
                ? 'bg-white shadow-md text-indigo-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Users className="w-5 h-5" />
            Ledertavle
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
              activeTab === 'admin'
                ? 'bg-white shadow-md text-indigo-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Settings className="w-5 h-5" />
            Ligaer
          </button>
        </div>

        {activeTab === 'myBooks' ? (
          <div className="space-y-6">
            <BookForm
              newBook={newBook}
              setNewBook={setNewBook}
              addBook={addBook}
              error={error}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              selectBook={selectBook}
            />

            <BookList
              books={books}
              selectedBook={selectedBook}
              setSelectedBook={setSelectedBook}
              pageUpdate={pageUpdate}
              setPageUpdate={setPageUpdate}
              updatePages={updatePages}
              deleteBook={deleteBook}
            />
          </div>
        ) : activeTab === 'leaderboard' ? (
          <Leaderboard 
            users={users} 
            currentProfile={currentProfile}
            leagues={leagues}
            currentLeagueId={currentLeagueId}
            setCurrentLeagueId={setCurrentLeagueId}
            leagueLeaderboard={leagueLeaderboard}
          />
        ) : (
          <LeagueManager
            leagues={leagues}
            currentProfile={currentProfile}
            newLeagueName={newLeagueName}
            setNewLeagueName={setNewLeagueName}
            joinLeagueCode={joinLeagueCode}
            setJoinLeagueCode={setJoinLeagueCode}
            leagueAction={leagueAction}
            setLeagueAction={setLeagueAction}
            handleLeagueAction={handleLeagueAction}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<BookContestApp />, document.getElementById('root'));
