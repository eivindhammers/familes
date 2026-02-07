/**
 * ProfileSelector Component
 * Displays profile selection grid and profile creation form
 */

window.ProfileSelector = ({
  profiles,
  switchProfile,
  handleLogout,
  showProfileManager,
  setShowProfileManager,
  newProfileName,
  setNewProfileName,
  createNewProfile,
  handleDeleteProfile,
  handleSetMainProfile,
  handleDeleteUser,
  error,
  setError,
  currentProfileId,
  darkMode
}) => {
  const { Plus, Trash2, Check } = window.Icons;
  const { getInputClassName, getErrorClassName } = window;
  const [showManageMode, setShowManageMode] = React.useState(false);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Velg profil</h2>
          <div className="flex gap-2">
            {profiles.length > 0 && (
              <button
                onClick={() => setShowManageMode(!showManageMode)}
                className={`text-sm px-3 py-1 rounded ${
                  showManageMode
                    ? darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                    : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {showManageMode ? 'Ferdig' : 'Administrer'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Logg ut
            </button>
          </div>
        </div>

        {error && (
          <div className={`border px-4 py-3 rounded mb-4 ${getErrorClassName(darkMode)}`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className={`relative p-4 sm:p-6 border-2 rounded-lg transition text-left ${
                darkMode
                  ? 'border-gray-600 hover:border-indigo-500 hover:bg-indigo-900/30'
                  : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
              }`}
            >
              {currentProfileId === profile.id && (
                <span className="absolute bottom-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                  Aktiv
                </span>
              )}
              {profile.isMainAccount && (
                <span className="absolute top-2 right-2 text-xs bg-indigo-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                  Hoved
                </span>
              )}
              <button
                onClick={() => !showManageMode && switchProfile(profile)}
                className="w-full text-left"
                disabled={showManageMode}
              >
                <div className={`text-lg sm:text-xl font-bold mb-2 pr-14 sm:pr-20 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{profile.name}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {profile.level}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.totalPages} sider</div>
              </button>

              {showManageMode && (
                <div className={`mt-4 pt-4 border-t flex gap-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  {!profile.isMainAccount && (
                    <button
                      onClick={() => handleSetMainProfile(profile.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm ${
                        darkMode ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                      title="Sett som hovedprofil"
                      aria-label={`Sett ${profile.name} som hovedprofil`}
                    >
                      <Check className="w-4 h-4" />
                      Hovedprofil
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm ${
                      darkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Slett profil"
                    aria-label={`Slett profilen ${profile.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Slett
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showProfileManager ? (
          <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : ''}`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Opprett ny profil</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Navn på profil"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewProfile()}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${getInputClassName(darkMode)}`}
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
                className={`px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowProfileManager(true)}
            className={`w-full py-3 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2 ${
              darkMode
                ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400'
                : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            Legg til ny profil
          </button>
        )}

        {/* Delete user account section */}
        {showManageMode && (
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={handleDeleteUser}
              className={`w-full py-3 border rounded-lg transition flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-red-900/30 border-red-800 text-red-300 hover:bg-red-900/50'
                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
              aria-label="Slett hele brukerkontoen permanent"
            >
              <Trash2 className="w-5 h-5" />
              Slett hele brukerkontoen
            </button>
            <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Dette vil slette alle profiler og data permanent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
