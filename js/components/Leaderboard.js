/**
 * Leaderboard Component
 * Displays ranked list of all users by total pages read
 * Supports filtering by league
 */

window.Leaderboard = ({ 
  users, 
  currentProfile,
  leagues,
  currentLeagueId,
  setCurrentLeagueId,
  leagueLeaderboard
}) => {
  const { Flame } = window.Icons;
  const { getLeaderboard } = window;
  
  // Get leagues that current profile is a member of
  const userLeagues = leagues && currentProfile.leagues 
    ? Object.values(leagues).filter(league => currentProfile.leagues.includes(league.id))
    : [];
  
  // Determine which leaderboard to show
  // If user has no leagues, show empty array
  // If user has leagues but none selected, select the first one
  const leaderboardData = userLeagues.length === 0
    ? []
    : currentLeagueId && leagueLeaderboard
      ? getLeaderboard(null, currentLeagueId, leagueLeaderboard)
      : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {currentLeagueId ? 'Liga ledertavle' : 'FamiLes ledertavle'}
        </h2>
        
        {/* League Selector */}
        {userLeagues.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velg liga
            </label>
            <select
              value={currentLeagueId || ''}
              onChange={(e) => setCurrentLeagueId(e.target.value || null)}
              className="max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Velg en liga...</option>
              {userLeagues.map(league => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Message if not in any leagues */}
        {userLeagues.length === 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
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
          ))
        ) : (
          userLeagues.length > 0 && !currentLeagueId && (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
              Velg en liga fra nedtrekksmenyen over for å se ledertavlen.
            </div>
          )
        )}
      </div>
    </div>
  );
};
