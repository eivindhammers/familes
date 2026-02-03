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
  currentProfileId
}) => {
  const { Plus, Trash2, Check } = window.Icons;
  const [showManageMode, setShowManageMode] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Velg profil</h2>
          <div className="flex gap-2">
            {profiles.length > 0 && (
              <button
                onClick={() => setShowManageMode(!showManageMode)}
                className={`text-sm px-3 py-1 rounded ${showManageMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {showManageMode ? 'Ferdig' : 'Administrer'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Logg ut
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="relative p-6 border-2 rounded-lg transition text-left border-gray-200 hover:border-indigo-500 hover:bg-indigo-50"
            >
              {currentProfileId === profile.id && (
                <span className="absolute top-2 left-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                  Aktiv
                </span>
              )}
              {profile.isMainAccount && (
                <span className="absolute top-2 right-2 text-xs bg-indigo-500 text-white px-2 py-1 rounded">
                  Hovedprofil
                </span>
              )}
              <button
                onClick={() => !showManageMode && switchProfile(profile)}
                className="w-full text-left"
                disabled={showManageMode}
              >
                <div className="text-xl font-bold text-gray-800 mb-2">{profile.name}</div>
                <div className="text-sm text-gray-600">Level {profile.level}</div>
                <div className="text-sm text-gray-600">{profile.totalPages} sider lest</div>
              </button>
              
              {showManageMode && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  {!profile.isMainAccount && (
                    <button
                      onClick={() => handleSetMainProfile(profile.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                      title="Sett som hovedprofil"
                      aria-label={`Sett ${profile.name} som hovedprofil`}
                    >
                      <Check className="w-4 h-4" />
                      Hovedprofil
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
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

        {/* Delete user account section */}
        {showManageMode && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDeleteUser}
              className="w-full py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
              aria-label="Slett hele brukerkontoen permanent"
            >
              <Trash2 className="w-5 h-5" />
              Slett hele brukerkontoen
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Dette vil slette alle profiler og data permanent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
