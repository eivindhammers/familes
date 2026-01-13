/**
 * FriendsManager Component
 * Manages friend system - view friends, handle requests, search for new friends
 */

window.FriendsManager = ({ 
  friendships,
  currentProfile,
  users,
  leagues,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onRemoveFriend,
  error,
  success,
  darkMode
}) => {
  const { useState, useEffect } = React;
  const { Flame, Plus, Trash2 } = window.Icons;
  const { loadProfileBooksOnce, searchUsersByName, getUserXP, getInputClassName, getErrorClassName, getSuccessClassName, getCardClassName, getTextClassName, UserAvatar, getValidatedStreak } = window;
  
  // Tab state: 'friends', 'requests', 'find'
  const [activeSubTab, setActiveSubTab] = useState('friends');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Expanded friend books
  const [expandedFriendBooks, setExpandedFriendBooks] = useState({});
  
  // Book counts for friends
  const [friendBookCounts, setFriendBookCounts] = useState({});
  
  // Get friends list
  const friends = friendships?.friends || {};
  const friendIds = Object.keys(friends);
  
  // Get request lists
  const incomingRequests = friendships?.requests?.incoming || {};
  const outgoingRequests = friendships?.requests?.outgoing || {};
  const incomingRequestIds = Object.keys(incomingRequests);
  const outgoingRequestIds = Object.keys(outgoingRequests);
  
  // Get user data for friend/request profiles
  const getFriendData = (profileId) => users?.[profileId] || null;
  
  // Get league names for a user's leagues
  const getLeagueNames = (userLeagues) => {
    if (!userLeagues || !leagues) return [];
    return userLeagues
      .map(leagueId => leagues[leagueId]?.name)
      .filter(name => name);
  };
  
  // Handle search
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = searchUsersByName(searchTerm, users);
      // Filter out self, existing friends, and pending requests
      const filtered = results.filter(user => {
        if (user.id === currentProfile.id) return false;
        if (friendIds.includes(user.id)) return false;
        if (incomingRequestIds.includes(user.id)) return false;
        if (outgoingRequestIds.includes(user.id)) return false;
        return true;
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, users, friendIds, incomingRequestIds, outgoingRequestIds, currentProfile.id]);
  
  // Load book counts for all friends
  useEffect(() => {
    const loadBookCounts = async () => {
      const counts = {};
      for (const friendId of friendIds) {
        const books = await loadProfileBooksOnce(friendId);
        counts[friendId] = books.length;
      }
      setFriendBookCounts(counts);
    };
    
    if (friendIds.length > 0) {
      loadBookCounts();
    }
  }, [friendIds.join(',')]);
  
  // Toggle friend's books view
  const toggleFriendBooks = async (friendId) => {
    if (expandedFriendBooks[friendId]) {
      setExpandedFriendBooks(prev => {
        const next = { ...prev };
        delete next[friendId];
        return next;
      });
    } else {
      const books = await loadProfileBooksOnce(friendId);
      setExpandedFriendBooks(prev => ({
        ...prev,
        [friendId]: books
      }));
    }
  };
  
  // Hide all expanded books
  const hideAllBooks = () => {
    setExpandedFriendBooks({});
  };

  return (
    <div className={`rounded-lg shadow-md p-6 space-y-6 ${getCardClassName(darkMode)}`}>
      <h2 className={`text-xl font-bold ${getTextClassName(darkMode, 'heading')}`}>Venner</h2>
      
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveSubTab('friends')}
          className={`flex-1 px-4 py-2 rounded-lg transition text-sm ${
            activeSubTab === 'friends'
              ? 'bg-indigo-600 text-white'
              : darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Mine venner {friendIds.length > 0 && `(${friendIds.length})`}
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex-1 px-4 py-2 rounded-lg transition text-sm ${
            activeSubTab === 'requests'
              ? 'bg-indigo-600 text-white'
              : darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Forespørsler {incomingRequestIds.length > 0 && `(${incomingRequestIds.length})`}
        </button>
        <button
          onClick={() => setActiveSubTab('find')}
          className={`flex-1 px-4 py-2 rounded-lg transition text-sm ${
            activeSubTab === 'find'
              ? 'bg-indigo-600 text-white'
              : darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Finn venner
        </button>
      </div>
      
      {/* My Friends Tab */}
      {activeSubTab === 'friends' && (
        <div className="space-y-3">
          {friendIds.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Du har ingen venner ennå. Finn venner i "Finn venner"-fanen!
            </div>
          ) : (
            <>
              {/* Show "Skjul alle bøker" button if any books are expanded */}
              {Object.keys(expandedFriendBooks).length > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={hideAllBooks}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Skjul alle bøker
                  </button>
                </div>
              )}
              
              {friendIds.map(friendId => {
                const friend = getFriendData(friendId);
                if (!friend) return null;
                
                const leagueNames = getLeagueNames(friend.leagues);
                const friendBooks = expandedFriendBooks[friendId];
                const isExpanded = !!friendBooks;
                const bookCount = friendBookCounts[friendId] || 0;
                
                return (
                  <div key={friendId} className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={friend.name} size="md" />
                        <div>
                          <div className={`font-semibold flex items-center gap-2 ${getTextClassName(darkMode, 'heading')}`}>
                            {friend.name}
                            {getValidatedStreak(friend) > 0 && (
                              <span className="flex items-center gap-1 text-orange-500 text-sm">
                                <Flame className="w-4 h-4" />
                                {getValidatedStreak(friend)}
                              </span>
                            )}
                          </div>
                          <div className={`text-sm ${getTextClassName(darkMode, 'body')}`}>
                            Level {friend.level || 1} • {getUserXP(friend)} XP • {bookCount} {bookCount === 1 ? 'bok' : 'bøker'}
                          </div>
                          {leagueNames.length > 0 && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              Ligaer: {leagueNames.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFriendBooks(friendId)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            darkMode 
                              ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' 
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {isExpanded ? 'Skjul bøker' : 'Vis bøker'}
                        </button>
                        <button
                          onClick={() => onRemoveFriend(friendId)}
                          className={`px-3 py-1 text-sm rounded transition flex items-center gap-1 ${
                            darkMode 
                              ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Fjern
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded books list */}
                    {isExpanded && (
                      <div className={`mt-4 ml-12 border-t pt-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {friendBooks.length === 0 ? (
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingen bøker registrert</div>
                        ) : (
                          <div className="space-y-2">
                            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {friend.name}s bøker:
                            </div>
                            {friendBooks.map(book => (
                              <div key={book.id} className={`flex items-center gap-3 rounded p-2 ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                {book.coverUrl && (
                                  <img 
                                    src={book.coverUrl.replace('http://', 'https://')} 
                                    alt={book.title}
                                    className="w-10 h-14 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{book.title}</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</div>
                                  <div className={`text-xs ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    {book.pagesRead || 0} / {book.totalPages || '?'} sider
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
      
      {/* Friend Requests Tab */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mottatte forespørsler</h3>
            {incomingRequestIds.length === 0 ? (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingen ventende forespørsler</div>
            ) : (
              <div className="space-y-2">
                {incomingRequestIds.map(fromId => {
                  const requester = getFriendData(fromId);
                  if (!requester) return null;
                  
                  return (
                    <div key={fromId} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={requester.name} size="sm" />
                        <div>
                          <div className={`font-medium ${getTextClassName(darkMode, 'heading')}`}>{requester.name}</div>
                          <div className={`text-xs ${getTextClassName(darkMode, 'muted')}`}>Level {requester.level || 1}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptRequest(fromId)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Godta
                        </button>
                        <button
                          onClick={() => onDeclineRequest(fromId)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            darkMode 
                              ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Avslå
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Outgoing Requests */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sendte forespørsler</h3>
            {outgoingRequestIds.length === 0 ? (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingen sendte forespørsler</div>
            ) : (
              <div className="space-y-2">
                {outgoingRequestIds.map(toId => {
                  const recipient = getFriendData(toId);
                  if (!recipient) return null;
                  
                  return (
                    <div key={toId} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={recipient.name} size="sm" bgColor="gray" />
                        <div>
                          <div className={`font-medium ${getTextClassName(darkMode, 'heading')}`}>{recipient.name}</div>
                          <div className={`text-xs ${getTextClassName(darkMode, 'muted')}`}>Venter på svar...</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onCancelRequest(toId)}
                        className={`px-3 py-1 text-sm rounded transition ${
                          darkMode 
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Avbryt
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Find Friends Tab */}
      {activeSubTab === 'find' && (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Søk etter brukere..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getInputClassName(darkMode)}`}
            />
          </div>
          
          {searchTerm.length < 2 ? (
            <div className={`text-center py-4 ${getTextClassName(darkMode, 'muted')}`}>
              Skriv minst 2 tegn for å søke
            </div>
          ) : searchResults.length === 0 ? (
            <div className={`text-center py-4 ${getTextClassName(darkMode, 'muted')}`}>
              Ingen brukere funnet
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name} size="sm" />
                    <div>
                      <div className={`font-medium flex items-center gap-2 ${getTextClassName(darkMode, 'heading')}`}>
                        {user.name}
                        {getValidatedStreak(user) > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 text-xs">
                            <Flame className="w-3 h-3" />
                            {getValidatedStreak(user)}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${getTextClassName(darkMode, 'muted')}`}>
                        Level {user.level || 1} • {getUserXP(user)} XP
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onSendRequest(user.id)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Legg til
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Success Display */}
      {success && (
        <div className={`border px-4 py-3 rounded-lg ${getSuccessClassName(darkMode)}`}>
          {success}
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className={`border px-4 py-3 rounded-lg ${getErrorClassName(darkMode)}`}>
          {error}
        </div>
      )}
    </div>
  );
};
