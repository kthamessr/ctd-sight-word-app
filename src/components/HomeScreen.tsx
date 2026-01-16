'use client';

import { useEffect, useState } from 'react';

interface HomeScreenProps {
  onStartGame: (level: number) => void;
  participantId: string;
  onStartBaseline: () => void;
  onViewHistory?: () => void;
  levelMastery?: { level1: boolean; level2: boolean; level3: boolean };
}

export default function HomeScreen({ onStartGame, participantId, onStartBaseline, onViewHistory, levelMastery }: HomeScreenProps) {
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
              {/* Level 1 - Always available */}
              <button
                onClick={() => onStartGame(1)}
                className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-8 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-lg">Easy</div>
                <div className="text-sm opacity-90">Level 1</div>
              </button>
              
              {/* Level 2 - Unlocked after Level 1 mastery */}
              <button
                onClick={() => onStartGame(2)}
                disabled={!levelMastery?.level1}
                className={`font-bold py-8 px-6 rounded-xl transition-all transform shadow-lg text-white ${
                  levelMastery?.level1
                    ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{levelMastery?.level1 ? '🌿' : '🔒'}</div>
                <div className="text-lg">Medium</div>
                <div className="text-sm opacity-90">Level 2</div>
                {!levelMastery?.level1 && <div className="text-xs mt-2">Master Level 1 first</div>}
              </button>
              
              {/* Level 3 - Unlocked after Level 2 mastery */}
              <button
                onClick={() => onStartGame(3)}
                disabled={!levelMastery?.level2}
                className={`font-bold py-8 px-6 rounded-xl transition-all transform shadow-lg text-white ${
                  levelMastery?.level2
                    ? 'bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 hover:scale-105 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{levelMastery?.level2 ? '🔥' : '🔒'}</div>
                <div className="text-lg">Hard</div>
                <div className="text-sm opacity-90">Level 3</div>
                {!levelMastery?.level2 && <div className="text-xs mt-2">Master Level 2 first</div>}
              </button>
            </div>

            {/* Bottom Row - Targeted Words (Full Width) */}
            <button
              onClick={() => onStartGame(0)}
              disabled={!hasTargetWords || !levelMastery?.level3}
              className={`w-full font-bold py-8 px-6 rounded-xl transition-all transform shadow-lg text-white ${
                hasTargetWords && levelMastery?.level3
                  ? 'bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 hover:scale-105 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{levelMastery?.level3 ? '🎯' : '🔒'}</div>
              <div className="text-lg">Targeted Words</div>
              <div className="text-sm opacity-90">Custom Words</div>
              {!levelMastery?.level3 && <div className="text-xs mt-2">Master Level 3 to unlock</div>}
              {hasTargetWords && !levelMastery?.level3 && <div className="text-xs">(Master Level 3 first)</div>}
            </button>

            {/* Baseline Mode */}
            <button
              onClick={onStartBaseline}
              disabled={!hasTargetWords}
              className={`w-full font-bold py-6 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-white ${
                hasTargetWords
                  ? 'bg-gradient-to-b from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-3xl mb-1">🧪</div>
              <div className="text-lg">Baseline Mode</div>
              <div className="text-xs opacity-90">No prompts · No timer</div>
            </button>

            {!hasTargetWords && (
              <p className="text-sm text-orange-600 text-center">Set target words in Manage Target Words to enable this mode</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 pt-8 border-t border-gray-200 w-full">
          <h3 className="text-lg font-semibold text-gray-600 mb-6 uppercase text-center">Features</h3>
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-8 text-center max-w-4xl">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📚</span>
                <span className="text-gray-700 font-medium">Learn sight words</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🎯</span>
                <span className="text-gray-700 font-medium">Quiz gameplay</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-gray-700 font-medium">Earn points</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🏆</span>
                <span className="text-gray-700 font-medium">Build streaks</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Score Card Button */}
        {onViewHistory && (
          <div className="mt-8 text-center">
            <button
              onClick={onViewHistory}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              📊 View Score Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
