/**
 * AuthScreen Component
 * Handles user authentication (login and registration)
 */

window.AuthScreen = ({
  isRegistering,
  setIsRegistering,
  email,
  setEmail,
  password,
  setPassword,
  registerName,
  setRegisterName,
  handleAuth,
  error
}) => {
  const { BookOpen, LogIn } = window.Icons;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          FamiLes 2026
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isRegistering ? 'Opprett konto' : 'Logg inn for å fortsette'}
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              placeholder="Ditt navn"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleAuth}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {isRegistering ? 'Registrer' : 'Logg inn'}
          </button>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setRegisterName('');
              setError('');
            }}
            className="w-full text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {isRegistering ? 'Har du allerede en konto? Logg inn' : 'Trenger du en konto? Registrer'}
          </button>
        </div>
      </div>
    </div>
  );
};
