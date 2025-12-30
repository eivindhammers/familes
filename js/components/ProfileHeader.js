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
  PAGES_PER_LEVEL,
  DAILY_PAGES_GOAL
}) => {
  const { BookOpen, LogOut, Flame } = window.Icons;

  return (
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
  );
};
