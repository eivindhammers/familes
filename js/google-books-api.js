/**
 * Google Books API Integration
 * Functions for searching and selecting books from Google Books
 */

/**
 * Search Google Books API for books matching query
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @returns {Promise<Array>} Array of formatted book results
 */
window.searchGoogleBooks = async (query) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
    );
    const data = await response.json();
    
    if (data.items) {
      return data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
        pages: item.volumeInfo.pageCount || '',
        thumbnail: window.getSecureUrl(
          item.volumeInfo.imageLinks?.thumbnail || 
          item.volumeInfo.imageLinks?.smallThumbnail
        )
      }));
    }
    return [];
  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
};
