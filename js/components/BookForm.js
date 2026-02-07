/**
 * BookForm Component
 * Form for adding new books with Google Books search integration
 */

window.BookForm = ({
  newBook,
  setNewBook,
  addBook,
  error,
  suggestions,
  isSearching,
  showSuggestions,
  setShowSuggestions,
  selectBook,
  darkMode
}) => {
  const { Plus } = window.Icons;
  const { getInputClassName, getErrorClassName, getCardClassName, getTextClassName } = window;

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 ${getCardClassName(darkMode)}`}>
      <h2 className={`text-xl font-bold mb-4 ${getTextClassName(darkMode, 'heading')}`}>Legg til ny bok</h2>
      {error && (
        <div className={`border px-4 py-3 rounded mb-4 ${getErrorClassName(darkMode)}`}>
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Søk boktittel eller ISBN..."
            value={newBook.title}
            onChange={(e) => {
              setNewBook({ ...newBook, title: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${getInputClassName(darkMode)}`}
          />
          
          {showSuggestions && (suggestions.length > 0 || isSearching) && newBook.title && (
            <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-xl max-h-60 overflow-y-auto ${
              darkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              {isSearching && <div className={`p-2 text-sm ${getTextClassName(darkMode, 'muted')}`}>Søker...</div>}
              {suggestions.map((book) => (
                <div
                  key={book.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectBook(book);
                  }}
                  className={`p-3 cursor-pointer border-b last:border-0 flex items-start gap-2 ${
                    darkMode 
                      ? 'hover:bg-indigo-900 border-gray-600' 
                      : 'hover:bg-indigo-50 border-gray-100'
                  }`}
                >
                  {book.thumbnail && (
                    <img src={book.thumbnail} alt="" className="w-8 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className={`font-semibold text-sm ${getTextClassName(darkMode, 'heading')}`}>{book.title}</div>
                    <div className={`text-xs ${getTextClassName(darkMode, 'muted')}`}>{book.author} • {book.pages} sider</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      
        <input
          type="text"
          placeholder="Forfatter"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${getInputClassName(darkMode)}`}
        />
        <input
          type="number"
          placeholder="Antall sider"
          value={newBook.pages}
          onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${getInputClassName(darkMode)}`}
        />
      </div>
      <button
        onClick={addBook}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Plus className="w-5 h-5" />
        Legg til bok
      </button>
    </div>
  );
};
