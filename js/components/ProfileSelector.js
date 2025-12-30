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
  error,
  setError
}) => {
  const { Plus } = window.Icons;

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
};
