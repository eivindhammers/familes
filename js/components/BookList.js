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
  deleteBook
}) => {
  const { BookOpen, TrendingUp, Trash2 } = window.Icons;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Min leseliste</h2>
      {books.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Ingen bøker ennå. Legg til din første bok ovenfor!</p>
      ) : (
        <div className="space-y-4">
          {books.map(book => (
            <div key={book.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
              <div className="flex-shrink-0">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-16 h-24 object-cover rounded shadow-sm bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    <BookOpen className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
          
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-800 leading-tight truncate">{book.title}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-600 text-sm truncate">av {book.author}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-lg font-bold text-indigo-600">{book.pagesRead}</div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {book.totalPages > 0 ? `/ ${book.totalPages} sider` : 'sider'}
                    </div>
                  </div>
                </div>
                
                {book.totalPages > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
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
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => updatePages(book.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setSelectedBook(null); setPageUpdate(''); }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
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
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Legg til sider
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium"
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
