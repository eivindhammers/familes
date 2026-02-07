/**
 * BookList Component
 * Displays list of books with progress tracking and update functionality
 */

window.BookList = ({
  books,
  selectedBook,
  setSelectedBook,
  pageUpdate,
  setPageUpdate,
  updatePages,
  deleteBook,
  darkMode
}) => {
  const { BookOpen, TrendingUp, Trash2 } = window.Icons;
  const { getCardClassName, getTextClassName, getInputClassName } = window;

  // Sort books: newly added (unread) at top by startedAt desc, then by lastReadAt desc
  const sortedBooks = [...books].sort((a, b) => {
    const aIsUnread = !a.pagesRead || a.pagesRead === 0;
    const bIsUnread = !b.pagesRead || b.pagesRead === 0;

    // Unread books come first
    if (aIsUnread && !bIsUnread) return -1;
    if (!aIsUnread && bIsUnread) return 1;

    // Both unread: sort by startedAt desc (newest first)
    if (aIsUnread && bIsUnread) {
      return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
    }

    // Both have pages read: sort by lastReadAt desc (most recently read first)
    return new Date(b.lastReadAt || b.startedAt || 0) - new Date(a.lastReadAt || a.startedAt || 0);
  });

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 ${getCardClassName(darkMode)}`}>
      <h2 className={`text-xl font-bold mb-4 ${getTextClassName(darkMode, 'heading')}`}>Min leseliste</h2>
      {books.length > 0 && (
        <div className={`rounded-lg p-4 mb-4 flex items-center justify-between ${
          darkMode 
            ? 'bg-indigo-900 bg-opacity-50' 
            : 'bg-indigo-50'
        }`}>
          <span className={`font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Totalt leste sider:</span>
          <span className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {books.reduce((total, book) => total + (book.pagesRead || 0), 0)}
          </span>
        </div>
      )}
      {books.length === 0 ? (
        <p className={`text-center py-8 ${getTextClassName(darkMode, 'muted')}`}>Ingen bøker ennå. Legg til din første bok ovenfor!</p>
      ) : (
        <div className="space-y-4">
          {sortedBooks.map(book => (
            <div key={book.id} className={`border rounded-lg p-4 flex gap-4 ${
              darkMode 
                ? 'border-gray-700 bg-gray-700' 
                : 'border-gray-200'
            }`}>
              <div className="flex-shrink-0">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-16 h-24 object-cover rounded shadow-sm bg-gray-100"
                  />
                ) : (
                  <div className={`w-16 h-24 rounded flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-600 text-gray-500' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <BookOpen className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
          
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg leading-tight truncate ${getTextClassName(darkMode, 'heading')}`}>{book.title}</h3>
                    <div className="flex items-center gap-3">
                      <p className={`text-sm truncate ${getTextClassName(darkMode, 'body')}`}>av {book.author}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{book.pagesRead}</div>
                    <div className={`text-sm whitespace-nowrap ${getTextClassName(darkMode, 'muted')}`}>
                      {book.totalPages > 0 ? `/ ${book.totalPages} sider` : 'sider'}
                    </div>
                  </div>
                </div>
                
                {book.totalPages > 0 && (
                  <div className={`w-full rounded-full h-2 mb-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((book.pagesRead / book.totalPages) * 100, 100)}%` }}
                    />
                  </div>
                )}
          
                {selectedBook === book.id ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="Totalt lest..."
                      value={pageUpdate}
                      onChange={(e) => setPageUpdate(e.target.value)}
                      className={`w-28 sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border rounded text-sm ${getInputClassName(darkMode)}`}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => updatePages(book.id)}
                      className="px-4 py-2 sm:px-3 sm:py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setSelectedBook(null); setPageUpdate(''); }}
                      className={`px-4 py-2 sm:px-3 sm:py-1 rounded text-sm ${
                        darkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      onClick={() => {
                        setSelectedBook(book.id);
                        setPageUpdate(book.pagesRead.toString());
                      }}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        darkMode 
                          ? 'text-indigo-400 hover:text-indigo-300' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Legg til sider
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        darkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Slett bok</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
