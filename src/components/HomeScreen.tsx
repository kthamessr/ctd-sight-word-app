'use client';

import { useEffect, useState } from 'react';

interface HomeScreenProps {
  onStartGame: (level: number) => void;
  participantId: string;
}

export default function HomeScreen({ onStartGame, participantId }: HomeScreenProps) {
  const [hasTargetWords, setHasTargetWords] = useState(false);

  useEffect(() => {
    const storageKey = `${participantId}::targetWords`;
    const savedWords = localStorage.getItem(storageKey);
    setHasTargetWords(!!savedWords && JSON.parse(savedWords).length > 0);
  }, [participantId]);

  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[500px]">
      <div className="mb-8">
        <p className="text-lg text-gray-600 mb-6">
          Master sight words through interactive games and challenges!
        </p>
      </div>

      <div className="space-y-4 w-full max-w-3xl px-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-6 uppercase text-center">Select Game Mode</h3>
          <div className="space-y-32 max-w-4xl mx-auto">
            {/* Top Row - Levels 1, 2, 3 */}
            <div className="grid grid-cols-3 gap-10">
              <button
                onClick={() => onStartGame(1)}
                className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-8 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-lg">Easy</div>
                <div className="text-sm opacity-90">Level 1</div>
              </button>
              <button
                onClick={() => onStartGame(2)}
                className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-8 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">🌿</div>
                <div className="text-lg">Medium</div>
                <div className="text-sm opacity-90">Level 2</div>
              </button>
              <button
                onClick={() => onStartGame(3)}
                className="bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-8 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-lg">Hard</div>
                <div className="text-sm opacity-90">Level 3</div>
              </button>
            </div>

            {/* Bottom Row - Targeted Words (Full Width) */}
            <button
              onClick={() => onStartGame(0)}
              disabled={!hasTargetWords}
              className={`w-full font-bold py-8 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-white ${
                hasTargetWords
                  ? 'bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-lg">Targeted Words</div>
              <div className="text-sm opacity-90">Custom Words</div>
            </button>

            {!hasTargetWords && (
              <p className="text-sm text-orange-600 text-center">Set target words in Manage Target Words to enable this mode</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 pt-8 border-t border-gray-200 w-full flex justify-center">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-600 mb-6 uppercase text-center">Features</h3>
            <div className="grid grid-cols-2 gap-6 text-center justify-items-center max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">📚</span>
              <span className="text-gray-700 font-medium">Learn sight words</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">🎯</span>
              <span className="text-gray-700 font-medium">Quiz gameplay</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">⭐</span>
              <span className="text-gray-700 font-medium">Earn points</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">🏆</span>
              <span className="text-gray-700 font-medium">Build streaks</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
