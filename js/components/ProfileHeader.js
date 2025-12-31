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
  users
}) => {
  const { useState, useRef, useEffect } = React;
  const { BookOpen, LogOut, Flame, Bell } = window.Icons;
  
  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  // Calculate pending friend requests
  const incomingRequests = friendships?.requests?.incoming || {};
  const pendingCount = Object.keys(incomingRequests).length;
  
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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">{currentProfile.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500">FamiLes 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Notification Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {pendingCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Varsler</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {pendingCount === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Ingen varsler
                    </div>
                  ) : (
                    <div className="p-2">
                      {Object.keys(incomingRequests).map(fromId => {
                        const requester = getUserData(fromId);
                        if (!requester) return null;
                        
                        return (
                          <div key={fromId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {requester.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">{requester.name}</div>
                              <div className="text-xs text-gray-500">Vil bli din venn</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {pendingCount > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <div className="text-xs text-center text-gray-500">
                      Gå til Venner-fanen for å svare
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCurrentProfile(null)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Bytt profil
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
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
          {xpProgress.currentXP} / {xpProgress.neededXP} XP til Level {currentProfile.level + 1}
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
          <div className="text-sm text-gray-600">Sider i dag ({DAILY_PAGES_GOAL}+ for streak)</div>
        </div>
      </div>
    </div>
  );
};
