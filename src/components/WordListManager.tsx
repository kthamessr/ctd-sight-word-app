'use client';

import { useState } from 'react';

interface WordListManagerProps {
  onSave: (words: string[]) => void;
  onCancel: () => void;
  currentWords: string[];
}

export default function WordListManager({ onSave, onCancel, currentWords }: WordListManagerProps) {
  const [words, setWords] = useState<string[]>(currentWords);
  const [newWord, setNewWord] = useState('');

  const handleAddWord = () => {
    if (newWord.trim() && !words.includes(newWord.trim().toLowerCase())) {
      setWords([...words, newWord.trim().toLowerCase()]);
      setNewWord('');
    }
  };

  const handleRemoveWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (words.length >= 10) {
      onSave(words);
    } else {
      alert('Please add at least 10 words for the intervention.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">Manage Target Words</h2>
      <p className="text-gray-600 mb-6 text-center">Add sight words for your intervention. Minimum 10 words required.</p>

      {/* Add Word Input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
          placeholder="Type a word and press Enter"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
        <button
          onClick={handleAddWord}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg transition-all"
        >
          Add Word
        </button>
      </div>

      {/* Word Count */}
      <div className="mb-4 text-center">
        <span className={`text-lg font-semibold ${words.length >= 10 ? 'text-green-600' : 'text-orange-600'}`}>
          {words.length} words {words.length < 10 && `(need ${10 - words.length} more)`}
        </span>
      </div>

      {/* Word List */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
        {words.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No words added yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {words.map((word, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
                <span className="font-semibold text-gray-700">{word}</span>
                <button
                  onClick={() => handleRemoveWord(index)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                  title="Remove word"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-2">Common Sight Words:</p>
        <div className="flex flex-wrap gap-2">
          {['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                if (!words.includes(suggestion)) {
                  setWords([...words, suggestion]);
                }
              }}
              disabled={words.includes(suggestion)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                words.includes(suggestion)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={words.length < 10}
          className={`font-bold py-3 px-8 rounded-lg transition-all ${
            words.length >= 10
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Target Words
        </button>
      </div>
    </div>
  );
}
