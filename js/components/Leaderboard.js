/**
 * Leaderboard Component
 * Displays ranked list of users by total XP or monthly XP
 * Supports filtering by league and viewing historical months
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
  const {
    getLeaderboard,
    getUserXP,
    getUserMonthlyXP,
    getMonthlyLeaderboard,
    getCardClassName,
    getTextClassName,
    getValidatedStreak,
    getCurrentMonth,
    getAvailableCompetitionMonths,
    getMonthLabel,
    loadHistoricalMonthlyLeaderboard
  } = window;
  const { useState, useEffect } = React;

  // View mode: 'total' for all-time XP, 'monthly' for monthly competition
  const [viewMode, setViewMode] = useState('total');

  // Selected month for monthly view (defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Historical leaderboard data (for past months)
  const [historicalData, setHistoricalData] = useState(null);

  // Loading state for historical calculations
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // Get available months for the dropdown
  const availableMonths = getAvailableCompetitionMonths();
  const currentMonth = getCurrentMonth();
  const isCurrentMonth = selectedMonth === currentMonth;

  // Load historical data when viewing past months in monthly mode
  useEffect(() => {
    if (viewMode === 'monthly' && !isCurrentMonth && currentLeagueId && leagues) {
      const league = leagues[currentLeagueId];
      if (league?.members) {
        setLoadingHistory(true);
        setHistoricalData(null);
        loadHistoricalMonthlyLeaderboard(currentLeagueId, selectedMonth, league.members)
          .then(data => {
            setHistoricalData(data);
            setLoadingHistory(false);
          })
          .catch(err => {
            console.error('Error loading historical leaderboard:', err);
            setLoadingHistory(false);
          });
      }
    } else {
      setHistoricalData(null);
    }
  }, [viewMode, selectedMonth, currentLeagueId, leagues, isCurrentMonth]);

  // Determine which leaderboard data to show
  const getLeaderboardData = () => {
    if (!currentLeagueId || !leagueLeaderboard) {
      return [];
    }

    if (viewMode === 'total') {
      // All-time view: sort by total XP
      return getLeaderboard(null, currentLeagueId, leagueLeaderboard);
    }

    // Monthly view
    if (isCurrentMonth) {
      // Current month: use live data from leagueLeaderboard
      return getMonthlyLeaderboard(leagueLeaderboard);
    }

    // Past month: use historical data calculated from reading history
    return historicalData || [];
  };

  const leaderboardData = getLeaderboardData();

  // Get XP value to display based on view mode
  const getDisplayXP = (user) => {
    if (viewMode === 'total') {
      return getUserXP(user);
    }

    if (isCurrentMonth) {
      return getUserMonthlyXP(user);
    }

    // For historical months, XP is already in the historical data
    return user.monthlyXP ?? 0;
  };

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 ${getCardClassName(darkMode)}`}>
      <div className="mb-3 sm:mb-4">
        <h2 className={`text-xl font-bold mb-3 ${getTextClassName(darkMode, 'heading')}`}>
          {currentLeagueId ? 'Liga ledertavle' : 'FamiLes ledertavle'}
        </h2>

        {/* League selector + View mode toggle in a compact row on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-3">
          <div className="flex-1">
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${getTextClassName(darkMode, 'body')}`}>
              Liga
            </label>
            <select
              value={currentLeagueId || ''}
              onChange={(e) => setCurrentLeagueId(e.target.value || null)}
              disabled={userLeagues.length === 0}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                userLeagues.length === 0
                  ? darkMode
                    ? 'bg-gray-900 text-gray-500 cursor-not-allowed border-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                  : darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
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

          {/* View Mode Toggle */}
          {currentLeagueId && (
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setViewMode('total')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'total'
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Totalt
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Måned
              </button>
            </div>
          )}
        </div>

        {/* Month Selector (only in monthly view) */}
        {viewMode === 'monthly' && currentLeagueId && (
          <div className="mb-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full sm:max-w-md px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}{month === currentMonth ? ' (nå)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message if not in any leagues */}
        {userLeagues.length === 0 && (
          <div className={`p-3 border rounded-lg text-sm ${
            darkMode
              ? 'bg-blue-900 bg-opacity-30 border-blue-700 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            Bli med i eller opprett en liga i "Ligaer"-fanen for å se ligaledertavler!
          </div>
        )}
      </div>

      {/* Loading indicator for historical data */}
      {loadingHistory && (
        <div className={`flex items-center justify-center py-8 ${getTextClassName(darkMode, 'muted')}`}>
          <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Beregner historiske data...
        </div>
      )}

      {/* Leaderboard list */}
      {!loadingHistory && (
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
                      {viewMode === 'total' && getValidatedStreak(user) > 0 && (
                        <span className="flex items-center gap-1 text-orange-500 text-sm">
                          <Flame className="w-4 h-4" />
                          {getValidatedStreak(user)}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${getTextClassName(darkMode, 'muted')}`}>Level {user.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {getDisplayXP(user)}
                  </div>
                  <div className={`text-sm ${getTextClassName(darkMode, 'muted')}`}>XP</div>
                </div>
              </div>
            ))
          ) : currentLeagueId ? (
            <div className={`text-center py-8 ${getTextClassName(darkMode, 'muted')}`}>
              {viewMode === 'monthly'
                ? 'Ingen lesing registrert denne måneden ennå.'
                : 'Ingen aktivitet i ligaen ennå.'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
