'use client';

import { useState } from 'react';

export interface ParticipantInfo {
  gradeLevel: number;
  readingLevel: number;
}

interface ParticipantConfigProps {
  participantId: string;
  onSave: (info: ParticipantInfo) => void;
  currentInfo?: ParticipantInfo;
}

export default function ParticipantConfig({ participantId, onSave, currentInfo }: ParticipantConfigProps) {
  const [gradeLevel, setGradeLevel] = useState(currentInfo?.gradeLevel || 5);
  const [readingLevel, setReadingLevel] = useState(currentInfo?.readingLevel || 5);

  const handleSave = () => {
    if (readingLevel >= gradeLevel) {
      alert('Reading level should be below grade level to show disparity. Please adjust.');
      return;
    }
    onSave({ gradeLevel, readingLevel });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">Participant Configuration</h2>
      <p className="text-gray-600 mb-8 text-center">
        Set the grade level and reading level for {participantId}
      </p>

      <div className="space-y-8">
        {/* Grade Level Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            Current Grade Level
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[5, 6, 7, 8].map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeLevel(grade)}
                className={`py-4 px-6 rounded-lg font-bold text-xl transition-all transform hover:scale-105 ${
                  gradeLevel === grade
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-200'
                }`}
              >
                Grade {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Level Selection */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            Reading Level
          </label>
          <div className="grid grid-cols-4 gap-3 mb-2">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setReadingLevel(level)}
                className={`py-4 px-6 rounded-lg font-bold text-xl transition-all transform hover:scale-105 ${
                  readingLevel === level
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-green-200'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[5, 6, 7, 8].map((level) => (
              <button
                key={level}
                onClick={() => setReadingLevel(level)}
                className={`py-4 px-6 rounded-lg font-bold text-xl transition-all transform hover:scale-105 ${
                  readingLevel === level
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-green-200'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
          <h3 className="font-bold text-lg text-purple-700 mb-3">Word List Configuration:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="font-semibold text-green-600">Level 1 (Easy):</span>
              <span>Grade {readingLevel} words (at reading level)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold text-yellow-600">Level 2 (Medium):</span>
              <span>Grade {Math.floor((readingLevel + gradeLevel) / 2)} words (halfway)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold text-red-600">Level 3 (Hard):</span>
              <span>Grade {gradeLevel} words (at grade level)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold text-purple-600">Targeted Words:</span>
              <span>Custom intervention words</span>
            </li>
          </ul>
          {readingLevel >= gradeLevel && (
            <p className="text-orange-600 font-semibold mt-4 text-sm">
              ⚠️ Reading level should be below grade level to demonstrate disparity
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
