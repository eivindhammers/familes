/**
 * LeagueManager Component
 * Displays and manages user leagues - create new or join existing
 */

window.LeagueManager = ({ 
  leagues, 
  currentProfile,
  newLeagueName,
  setNewLeagueName,
  joinLeagueCode,
  setJoinLeagueCode,
  leagueAction,
  setLeagueAction,
  handleLeagueAction,
  error
}) => {
  const { Plus } = window.Icons;
  
  // Get leagues that current profile is a member of
  const userLeagues = leagues && currentProfile.leagues 
    ? Object.values(leagues).filter(league => currentProfile.leagues.includes(league.id))
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Ligaadministrasjon</h2>
      
      {/* User's Leagues */}
      {userLeagues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Dine ligaer</h3>
          <div className="space-y-2">
            {userLeagues.map(league => (
              <div 
                key={league.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-gray-800">{league.name}</div>
                  <div className="text-sm text-gray-500">Kode: {league.code}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {Object.keys(league.members || {}).length} medlemmer
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle between Join and Create */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Legg til liga</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLeagueAction('join')}
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              leagueAction === 'join'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bli med i liga
          </button>
          <button
            onClick={() => setLeagueAction('create')}
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              leagueAction === 'create'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Opprett ny liga
          </button>
        </div>

        {/* Join League Form */}
        {leagueAction === 'join' && (
          <div className="space-y-3">
            <input
              type="text"
              value={joinLeagueCode}
              onChange={(e) => setJoinLeagueCode(e.target.value.toUpperCase())}
              placeholder="Skriv inn ligakode (6 tegn)"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleLeagueAction('join')}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Bli med
            </button>
          </div>
        )}

        {/* Create League Form */}
        {leagueAction === 'create' && (
          <div className="space-y-3">
            <input
              type="text"
              value={newLeagueName}
              onChange={(e) => setNewLeagueName(e.target.value)}
              placeholder="Liganavn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleLeagueAction('create')}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Opprett liga
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
