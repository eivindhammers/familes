/**
 * Leaderboard Component
 * Displays ranked list of all users by total XP or monthly XP
 * Supports filtering by league
 */

window.Leaderboard = ({ 
  users, 
  currentProfile,
  leagues,
  currentLeagueId,
  setCurrentLeagueId,
  leagueLeaderboard,
  darkMode
}) => {
  const { Flame } = window.Icons;
  const { getLeaderboard, getMonthlyLeaderboard, getUserXP, getCardClassName, getTextClassName } = window;
  const { useEffect, useState } = React;
  
  // State for leaderboard type (total or monthly)
  const [leaderboardType, setLeaderboardType] = useState('total');
  
  // Get leagues that current profile is a member of
  const userLeagues = leagues && currentProfile.leagues 
    ? Object.values(leagues).filter(league => currentProfile.leagues.includes(league.id))
    : [];
  
  // Auto-select first league if user has leagues but none selected
  useEffect(() => {
    if (userLeagues.length > 0 && !currentLeagueId) {
      setCurrentLeagueId(userLeagues[0].id);
    }
  }, [userLeagues.length, currentLeagueId, setCurrentLeagueId]);
  
  // Determine which leaderboard to show
  const leaderboardData = currentLeagueId && leagueLeaderboard
    ? (leaderboardType === 'monthly' 
        ? getMonthlyLeaderboard(leagueLeaderboard)
        : getLeaderboard(null, currentLeagueId, leagueLeaderboard))
    : [];

  return (
    <div className={`rounded-lg shadow-md p-6 ${getCardClassName(darkMode)}`}>
      <div className="mb-4">
        <h2 className={`text-xl font-bold mb-4 ${getTextClassName(darkMode, 'heading')}`}>
          {currentLeagueId ? 'Liga ledertavle' : 'FamiLes ledertavle'}
        </h2>
        
        {/* League Selector */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${getTextClassName(darkMode, 'body')}`}>
            Velg liga
          </label>
          <select
            value={currentLeagueId || ''}
            onChange={(e) => setCurrentLeagueId(e.target.value || null)}
            disabled={userLeagues.length === 0}
            className={`max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              userLeagues.length === 0 
                ? darkMode 
                  ? 'bg-gray-900 text-gray-500 cursor-not-allowed border-gray-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'border-gray-300'
            }`}
          >
            {userLeagues.length === 0 ? (
              <option value="">Ingen ligaer</option>
            ) : (
              userLeagues.map(league => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Leaderboard Type Toggle */}
        {currentLeagueId && userLeagues.length > 0 && (
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${getTextClassName(darkMode, 'body')}`}>
              Velg rangering
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLeaderboardType('total')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  leaderboardType === 'total'
                    ? darkMode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Totalt XP
              </button>
              <button
                onClick={() => setLeaderboardType('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  leaderboardType === 'monthly'
                    ? darkMode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Månedens XP
              </button>
            </div>
          </div>
        )}
        
        {/* Message if not in any leagues */}
        {userLeagues.length === 0 && (
          <div className={`mb-4 p-3 border rounded-lg text-sm ${
            darkMode 
              ? 'bg-blue-900 bg-opacity-30 border-blue-700 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            Bli med i eller opprett en liga i "Ligaer"-fanen for å se ligaledertavler!
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {leaderboardData.length > 0 ? (
          leaderboardData.map(user => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                user.id === currentProfile.id
                  ? darkMode 
                    ? 'bg-indigo-900 bg-opacity-50 border-2 border-indigo-500' 
                    : 'bg-indigo-50 border-2 border-indigo-300'
                  : darkMode 
                    ? 'bg-gray-700' 
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
                  <div className={`font-semibold flex items-center gap-2 ${getTextClassName(darkMode, 'heading')}`}>
                    {user.name}
                    {user.currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500 text-sm">
                        <Flame className="w-4 h-4" />
                        {user.currentStreak}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${getTextClassName(darkMode, 'muted')}`}>Level {user.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {leaderboardType === 'monthly' ? (user.monthlyXP || 0) : getUserXP(user)}
                </div>
                <div className={`text-sm ${getTextClassName(darkMode, 'muted')}`}>XP</div>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};
