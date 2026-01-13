/**
 * ProfileHeader Component
 * Displays user profile information, stats, level progress, and streak
 */

window.ProfileHeader = ({
  currentProfile,
  setCurrentProfile,
  handleLogout,
  showStreakMessage,
  progress,
  xpProgress,
  DAILY_PAGES_GOAL,
  friendships,
  users,
  onAcceptRequest,
  onDeclineRequest,
  onDismissAcceptedNotification,
  friendSuccess,
  darkMode,
  toggleDarkMode
}) => {
  const { useState, useRef, useEffect } = React;
  const { BookOpen, LogOut, Flame, Bell, Check, X, Moon, Sun } = window.Icons;
  const { getCardClassName, getTextClassName, UserAvatar, getValidatedStreak } = window;
  
  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  // Calculate pending friend requests
  const incomingRequests = friendships?.requests?.incoming || {};
  const pendingCount = Object.keys(incomingRequests).length;
  
  // Calculate accepted notifications (when someone accepts your friend request)
  const acceptedNotifications = friendships?.notifications?.accepted || {};
  const acceptedCount = Object.keys(acceptedNotifications).length;
  
  // Total notification count
  const totalNotifications = pendingCount + acceptedCount;
  
  // Get user data for a profile ID
  const getUserData = (profileId) => users?.[profileId] || null;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-colors ${getCardClassName(darkMode)}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <BookOpen className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div>
            <h1 className={`text-xl sm:text-3xl font-bold ${getTextClassName(darkMode, 'heading')}`}>{currentProfile.name}</h1>
            <p className={`text-xs sm:text-sm ${getTextClassName(darkMode, 'muted')}`}>FamiLes 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition flex items-center gap-1 ${
              darkMode 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={darkMode ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          
          {/* Notification Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition flex items-center gap-1 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalNotifications}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className={`absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${getTextClassName(darkMode, 'heading')}`}>Varsler</h3>
                </div>
                {/* Success message */}
                {friendSuccess && (
                  <div className="m-2 p-2 bg-green-100 border border-green-300 text-green-700 text-sm rounded-lg">
                    {friendSuccess}
                  </div>
                )}
                <div className="max-h-80 overflow-y-auto">
                  {totalNotifications === 0 && !friendSuccess ? (
                    <div className={`p-4 text-center ${getTextClassName(darkMode, 'muted')}`}>
                      Ingen varsler
                    </div>
                  ) : totalNotifications === 0 ? null : (
                    <div className="p-2 space-y-2">
                      {/* Accepted friend requests notifications */}
                      {Object.keys(acceptedNotifications).map(accepterId => {
                        const accepter = getUserData(accepterId);
                        if (!accepter) return null;
                        
                        return (
                          <div key={`accepted-${accepterId}`} className={`flex items-center gap-3 p-2 rounded-lg ${
                            darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-50'
                          }`}>
                            <UserAvatar name={accepter.name} size="sm" bgColor="green" />
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${getTextClassName(darkMode, 'heading')}`}>{accepter.name}</div>
                              <div className="text-xs text-green-600">Godtok venneforespørselen din</div>
                            </div>
                            <button
                              onClick={() => onDismissAcceptedNotification(accepterId)}
                              className={`p-1 transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                              title="Fjern varsel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      
                      {/* Incoming friend requests */}
                      {Object.keys(incomingRequests).map(fromId => {
                        const requester = getUserData(fromId);
                        if (!requester) return null;
                        
                        return (
                          <div key={`request-${fromId}`} className={`flex items-center gap-3 p-2 rounded-lg ${
                            darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'
                          }`}>
                            <UserAvatar name={requester.name} size="sm" />
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${getTextClassName(darkMode, 'heading')}`}>{requester.name}</div>
                              <div className={`text-xs ${getTextClassName(darkMode, 'muted')}`}>Vil bli din venn</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => onAcceptRequest(fromId)}
                                className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                title="Godta"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeclineRequest(fromId)}
                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                title="Avslå"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCurrentProfile(null)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bytt profil
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition ${
              darkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            Logg ut
          </button>
        </div>
      </div>
      
      {showStreakMessage && (
        <div className={`border-2 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 animate-pulse ${
          darkMode 
            ? 'bg-orange-900 bg-opacity-30 border-orange-600 text-orange-300' 
            : 'bg-orange-50 border-orange-300 text-orange-800'
        }`}>
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">Startet streak! Fortsett å lese {DAILY_PAGES_GOAL}+ sider daglig!</span>
        </div>
      )}
      
      <div className={`rounded-lg p-6 mb-4 ${
        darkMode 
          ? 'bg-gradient-to-r from-indigo-900 to-purple-900' 
          : 'bg-gradient-to-r from-indigo-50 to-purple-50'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar name={currentProfile.name} size="lg" />
            <div>
              <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>Aktiv profil</div>
              <div className={`text-2xl font-bold ${getTextClassName(darkMode, 'heading')}`}>{currentProfile.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>Level</div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{currentProfile.level}</div>
          </div>
        </div>
        <div className={`w-full rounded-full h-4 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`text-sm text-center ${getTextClassName(darkMode, 'body')}`}>
          {xpProgress.currentXP} / {xpProgress.neededXP} XP til Level {currentProfile.level + 1}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-lg p-4 text-center ${
          darkMode 
            ? 'bg-gradient-to-br from-orange-900 to-red-900' 
            : 'bg-gradient-to-br from-orange-50 to-red-50'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className={`w-6 h-6 ${getValidatedStreak(currentProfile) > 0 ? (darkMode ? 'text-orange-400' : 'text-orange-500') : darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className={`text-2xl font-bold ${getTextClassName(darkMode, 'heading')}`}>{getValidatedStreak(currentProfile)}</span>
          </div>
          <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>Daglig streak</div>
        </div>
        
        <div className={`rounded-lg p-4 text-center ${
          darkMode 
            ? 'bg-gradient-to-br from-yellow-900 to-orange-900' 
            : 'bg-gradient-to-br from-yellow-50 to-orange-50'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${getTextClassName(darkMode, 'heading')}`}>{currentProfile.longestStreak || 0}</div>
          <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>Beste streak</div>
        </div>
        
        <div className={`rounded-lg p-4 text-center ${
          darkMode 
            ? 'bg-gradient-to-br from-green-900 to-emerald-900' 
            : 'bg-gradient-to-br from-green-50 to-emerald-50'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${getTextClassName(darkMode, 'heading')}`}>{currentProfile.pagesReadToday || 0}</div>
          <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>Sider i dag ({DAILY_PAGES_GOAL}+ for streak)</div>
        </div>
      </div>
    </div>
  );
};
