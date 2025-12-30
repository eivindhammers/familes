/**
 * Footer Component
 * Displays GitHub link, developer info, and license information
 */

window.Footer = () => {
  const { GitHub } = window.Icons;

  return (
    <footer className="mt-8 py-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/eivindhammers/familes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-indigo-600 transition"
            >
              <GitHub className="w-5 h-5" />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              Utviklet av{' '}
              <a
                href="mailto:eivindhammers@gmail.com"
                className="text-indigo-600 hover:text-indigo-800 transition"
              >
                Eivind Moe Hammersmark
              </a>
            </span>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className="text-gray-500">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
