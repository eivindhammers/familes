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
  setSuggestions,
  isSearching,
  setIsSearching,
  showSuggestions,
  setShowSuggestions,
  selectBook
}) => {
  const { Plus } = window.Icons;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Legg til ny bok</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          {showSuggestions && (suggestions.length > 0 || isSearching) && newBook.title && (
            <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {isSearching && <div className="p-2 text-gray-500 text-sm">Søker...</div>}
              {suggestions.map((book) => (
                <div
                  key={book.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectBook(book);
                  }}
                  className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-2"
                >
                  {book.thumbnail && (
                    <img src={book.thumbnail} alt="" className="w-8 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{book.title}</div>
                    <div className="text-xs text-gray-500">{book.author} • {book.pages} sider</div>
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <input
          type="number"
          placeholder="Antall sider"
          value={newBook.pages}
          onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={addBook}
        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Plus className="w-5 h-5" />
        Legg til bok
      </button>
    </div>
  );
};
