// Main Application Component
const { useState, useEffect } = React;

// Destructure from window globals
const { database, auth, APP_CONSTANTS, Icons } = window;
const { PAGES_PER_LEVEL, DAILY_PAGES_GOAL } = APP_CONSTANTS;
const { BookOpen, TrendingUp, Users, Plus, LogOut, LogIn, Flame, Trash2 } = Icons;

const BookContestApp = () => {
  const [authUser, setAuthUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [users, setUsers] = useState({});
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', pages: '', coverUrl: '' });
  const [pageUpdate, setPageUpdate] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('myBooks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStreakMessage, setShowStreakMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Utility Functions
  const getSecureUrl = (url) => {
    if (!url) return '';
    return url.replace('http://', 'https://');
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateProgress = (totalPages) => {
    const currentLevelPages = totalPages % PAGES_PER_LEVEL;
    return (currentLevelPages / PAGES_PER_LEVEL) * 100;
  };

  const getLeaderboard = () => {
    return Object.values(users)
      .sort((a, b) => b.totalPages - a.totalPages)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  };

  // Firebase Operations
  const saveProfile = async (uid, profileId, profileData) => {
    await database.ref(`userProfiles/${uid}/${profileId}`).set(profileData);
  };

  const saveUserToGlobalList = async (profileId, userData) => {
    await database.ref(`users/${profileId}`).set(userData);
  };

  const saveBooks = async (profileId, booksArray) => {
    const booksObj = {};
    booksArray.forEach(book => {
      booksObj[book.id] = book;
    });
    await database.ref(`books/${profileId}`).set(booksObj);
  };

  const saveReadingEntry = async (profileId, bookId, entry) => {
    const entryRef = database.ref(`readingHistory/${profileId}/${bookId}`).push();
    await entryRef.set(entry);
  };

  const loadUserProfiles = async (uid) => {
    const profilesRef = database.ref(`userProfiles/${uid}`);
    profilesRef.on('value', (snapshot) => {
      const data = snapshot.val();
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
  };

  const loadProfileBooks = (profileId) => {
    const booksRef = database.ref(`books/${profileId}`);
    booksRef.on('value', (snapshot) => {
      const data = snapshot.val();
      setBooks(data ? Object.values(data) : []);
    });
  };

  const loadAllUsers = () => {
    const usersRef = database.ref('users');
    usersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      setUsers(data || {});
    });
  };

  // Streak Logic
  const checkAndUpdateStreak = (profile, pagesToday) => {
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

  // Google Books API
  const searchGoogleBooks = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
      );
      const data = await response.json();
      
      if (data.items) {
        setSuggestions(data.items.map(item => ({
          id: item.id,
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          pages: item.volumeInfo.pageCount || '',
          thumbnail: getSecureUrl(item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail)
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching books:", error);
    }
    setIsSearching(false);
  };

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

  // Event Handlers
  const deleteBook = async (bookId) => {
    if (window.confirm('Er du sikker på at du vil slette denne boken?')) {
      const updatedBooks = books.filter(book => book.id !== bookId);
      await saveBooks(currentProfile.id, updatedBooks);
      setBooks(updatedBooks);
      setError('');
    }
  };

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
  
    const streakData = checkAndUpdateStreak(currentProfile, difference > 0 ? difference : 0);
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
    
    setCurrentProfile(updatedProfile);
    
    if (!wasStreakActive && streakData.currentStreak > 0) {
      setShowStreakMessage(true);
      setTimeout(() => setShowStreakMessage(false), 3000);
    }
    
    setPageUpdate('');
    setSelectedBook(null);
    setError('');
  };

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newBook.title && newBook.title.length > 2 && showSuggestions) {
        searchGoogleBooks(newBook.title);
      } else if (!newBook.title) {
        setSuggestions([]);
      }
    }, 500);
  
    return () => clearTimeout(timeoutId);
  }, [newBook.title, showSuggestions]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAuthUser(user);
        await loadUserProfiles(user.uid);
      } else {
        setAuthUser(null);
        setProfiles([]);
        setCurrentProfile(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      loadProfileBooks(currentProfile.id);
      loadAllUsers();
    }
  }, [currentProfile]);

  // Render Logic
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Laster...</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            FamiLes 2026
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {isRegistering ? 'Opprett konto' : 'Logg inn for å fortsette'}
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <input
                type="text"
                placeholder="Ditt navn"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isRegistering ? 'Registrer' : 'Logg inn'}
            </button>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setRegisterName('');
                setError('');
              }}
              className="w-full text-indigo-600 hover:text-indigo-700 text-sm"
            >
              {isRegistering ? 'Har du allerede en konto? Logg inn' : 'Trenger du en konto? Registrer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Velg profil</h2>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Logg ut
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => switchProfile(profile)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="text-xl font-bold text-gray-800 mb-2">{profile.name}</div>
                <div className="text-sm text-gray-600">Level {profile.level}</div>
                <div className="text-sm text-gray-600">{profile.totalPages} sider lest</div>
              </button>
            ))}
          </div>

          {showProfileManager ? (
            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-800 mb-4">Opprett ny profil</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Navn på profil"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewProfile()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={createNewProfile}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Opprett
                </button>
                <button
                  onClick={() => {
                    setShowProfileManager(false);
                    setNewProfileName('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowProfileManager(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Legg til ny profil
            </button>
          )}
        </div>
      </div>
    );
  }

  const progress = calculateProgress(currentProfile.totalPages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{currentProfile.name}</h1>
                <p className="text-sm text-gray-500">FamiLes 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentProfile(null)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Bytt profil
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                <LogOut className="w-5 h-5" />
                Logg ut
              </button>
            </div>
          </div>
          
          {showStreakMessage && (
            <div className="bg-orange-50 border-2 border-orange-300 text-orange-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 animate-pulse">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Startet streak! Fortsett å lese {DAILY_PAGES_GOAL}+ sider daglig!</span>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {currentProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Aktiv profil</div>
                  <div className="text-2xl font-bold text-gray-800">{currentProfile.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Level</div>
                <div className="text-4xl font-bold text-indigo-600">{currentProfile.level}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 text-center">
              {currentProfile.totalPages % PAGES_PER_LEVEL} / {PAGES_PER_LEVEL} sider til Level {currentProfile.level + 1}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className={`w-6 h-6 ${currentProfile.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="text-2xl font-bold text-gray-800">{currentProfile.currentStreak || 0}</span>
              </div>
              <div className="text-sm text-gray-600">Daglig streak</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">{currentProfile.longestStreak || 0}</div>
              <div className="text-sm text-gray-600">Beste streak</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">{currentProfile.pagesReadToday || 0}</div>
              <div className="text-sm text-gray-600">I dag ({DAILY_PAGES_GOAL}+ for streak)</div>
            </div>
          </div>
        </div>

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
        </div>

        {activeTab === 'myBooks' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Legg til ny bok</h2>
              {error && activeTab === 'myBooks' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Søk boktittel eller ISBN..."
                    value={newBook.title}
                    onChange={(e) => {
                      setNewBook({ ...newBook, title: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  
                  {showSuggestions && (suggestions.length > 0 || isSearching) && newBook.title && (
                    <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {isSearching && <div className="p-2 text-gray-500 text-sm">Søker...</div>}
                      {suggestions.map((book) => (
                        <div
                          key={book.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectBook(book);
                          }}
                          className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-2"
                        >
                          {book.thumbnail && (
                            <img src={book.thumbnail} alt="" className="w-8 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{book.title}</div>
                            <div className="text-xs text-gray-500">{book.author} • {book.pages} sider</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              
                <input
                  type="text"
                  placeholder="Forfatter"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Antall sider"
                  value={newBook.pages}
                  onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={addBook}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Legg til bok
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Min leseliste</h2>
              {books.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Ingen bøker ennå. Legg til din første bok ovenfor!</p>
              ) : (
                <div className="space-y-4">
                  {books.map(book => (
                    <div key={book.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                      <div className="flex-shrink-0">
                        {book.coverUrl ? (
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            className="w-16 h-24 object-cover rounded shadow-sm bg-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <BookOpen className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                      </div>
                  
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800 leading-tight">{book.title}</h3>
                            <div className="flex items-center gap-3">
                              <p className="text-gray-600 text-sm">av {book.author}</p>
                              <button 
                                onClick={() => deleteBook(book.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Slett bok"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-2xl font-bold text-indigo-600">{book.pagesRead}</div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {book.totalPages > 0 ? `/ ${book.totalPages} sider` : 'sider'}
                            </div>
                          </div>
                        </div>
                        
                        {book.totalPages > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((book.pagesRead / book.totalPages) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                  
                        {selectedBook === book.id ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="number"
                              placeholder="Totalt lest..."
                              value={pageUpdate}
                              onChange={(e) => setPageUpdate(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                              onFocus={(e) => e.target.select()}
                            />
                            <button
                              onClick={() => updatePages(book.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setSelectedBook(null); setPageUpdate(''); }}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBook(book.id);
                              setPageUpdate(book.pagesRead.toString());
                            }}
                            className="mt-1 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Oppdater leste sider
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">FamiLes ledertavle</h2>
            <div className="space-y-3">
              {getLeaderboard().map(user => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    user.id === currentProfile.id
                      ? 'bg-indigo-50 border-2 border-indigo-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      user.rank === 1 ? 'text-yellow-500' :
                      user.rank === 2 ? 'text-gray-400' :
                      user.rank === 3 ? 'text-amber-600' :
                      'text-gray-400'
                    }`}>
                      #{user.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {user.name}
                        {user.currentStreak > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 text-sm">
                            <Flame className="w-4 h-4" />
                            {user.currentStreak}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Level {user.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{user.totalPages}</div>
                    <div className="text-sm text-gray-500">sider lest</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<BookContestApp />, document.getElementById('root'));
