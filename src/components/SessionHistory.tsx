'use client';

import { SessionData, calculateMastery } from './sessionUtils';

interface SessionHistoryProps {
  sessions: SessionData[];
  onNewSession: () => void;
  onExportData: () => void;
}

export default function SessionHistory({ sessions, onNewSession, onExportData }: SessionHistoryProps) {
  const mastery = calculateMastery(sessions);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prompted Sessions */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-semibold opacity-90">Prompted Sessions (Immediate Prompt)</div>
          <div className="text-4xl font-bold">{mastery.promptedSessions}</div>
          <div className="text-lg mt-2">{mastery.promptedAccuracy.toFixed(1)}% accuracy</div>
        </div>

        {/* Unprompted Sessions */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-semibold opacity-90">Unprompted Sessions (Constant Time Delay)</div>
          <div className="text-4xl font-bold">{mastery.unpromptedSessions}</div>
          <div className="text-lg mt-2">{mastery.unpromptedAccuracy.toFixed(1)}% accuracy</div>
        </div>
      </div>

      {/* Mastery Status */}
      <div className={`bg-gradient-to-br ${mastery.achieved ? 'from-purple-400 to-purple-600' : 'from-orange-400 to-orange-600'} rounded-lg p-6 text-white shadow-lg`}>
        <div className="text-sm font-semibold opacity-90">🎯 Mastery Status (Based on Unprompted Performance)</div>
        <div className="text-2xl font-bold">{mastery.achieved ? '🏆 Achieved' : '📈 In Progress'}</div>
        <div className="text-sm mt-2 opacity-90">
          {mastery.achieved 
            ? '80%+ accuracy achieved across last 3 unprompted sessions'
            : `Current: ${mastery.unpromptedAccuracy.toFixed(1)}% - Target: 80%`
          }
        </div>
      </div>

      {/* Sessions Table */}
      {sessions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Session</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Correct</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Assisted</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">No Answer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Accuracy</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Prompt Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session, index) => {
                  const promptType = session.promptType === 'immediate' ? 'Immediate Prompt' : 'Constant Time Delay';
                  const promptIcon = session.promptType === 'immediate' ? '⚡' : '⏱️';

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-bold text-purple-600">{session.sessionNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(session.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{session.correctAnswers}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">{session.assistedAnswers}</td>
                      <td className="px-4 py-3 font-semibold text-red-700">{session.noAnswers}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            session.accuracy >= 80 ? 'bg-green-100 text-green-800' : session.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {session.accuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {promptIcon} {promptType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No sessions yet. Start your first session!</p>
        </div>
      )}

      {/* Start New Session Button */}
      <div className="flex gap-4">
        <button
          onClick={onNewSession}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg"
        >
          {sessions.length === 0 ? '🎮 Start Session 1' : `🎮 Start Session ${sessions.length + 1}`}
        </button>
        <button
          onClick={onExportData}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg"
        >
          💾 Export Data for Analysis
        </button>
      </div>
    </div>
  );
}
