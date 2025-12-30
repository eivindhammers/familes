/**
 * Leaderboard Component
 * Displays ranked list of all users by total pages read
 */

window.Leaderboard = ({ users, currentProfile }) => {
  const { Flame } = window.Icons;
  const { getLeaderboard } = window;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">FamiLes ledertavle</h2>
      <div className="space-y-3">
        {getLeaderboard(users).map(user => (
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
        ))}
      </div>
    </div>
  );
};
