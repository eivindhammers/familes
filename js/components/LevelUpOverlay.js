/**
 * LevelUpOverlay Component
 * Displays animated level-up notifications with confetti
 */

window.LevelUpOverlay = ({ level, onClose }) => {
  const { useEffect } = React;

  useEffect(() => {
    // Fire confetti when component mounts
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl animate-bounce max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">
            Gratulerer!
          </h2>
          <p className="text-xl text-gray-700">
            Du har nådd level <span className="font-bold text-indigo-600">{level}</span>!
          </p>
        </div>
      </div>
    </div>
  );
};
