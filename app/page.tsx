'use client';

import { useState, useEffect, useCallback } from 'react';
import SessionGame from '@/components/SessionGame';
import HomeScreen from '@/components/HomeScreen';
import SessionHistory from '@/components/SessionHistory';
import ProgressTracker from '@/components/ProgressTracker';
import WordListManager from '@/components/WordListManager';
import SocialValiditySurvey, { SurveyResponses } from '@/components/SocialValiditySurvey';
import DataExport from '@/components/DataExport';
import Logo from '@/components/Logo';
import { createSessionData, SessionData } from '@/components/sessionUtils';

export default function Page() {
  const [participantId, setParticipantId] = useState('P1');
  const [participantInput, setParticipantInput] = useState('P1');
  const [gameState, setGameState] = useState<'home' | 'playing' | 'history' | 'wordManager' | 'survey' | 'export'>('home');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [level, setLevel] = useState(1);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalWordsLearned, setTotalWordsLearned] = useState(0);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponses[]>([]);
  const [baselineSessions, setBaselineSessions] = useState<SessionData[]>([]);
  const [baselineMode, setBaselineMode] = useState(false);

  const storageKey = useCallback((name: string) => `${participantId || 'default'}::${name}`,[participantId]);

  // Load participant-specific data
  useEffect(() => {
    const savedSessions = localStorage.getItem(storageKey('sightWordsSessions'));
    const savedBaseline = localStorage.getItem(storageKey('baselineSessions'));
    const savedWords = localStorage.getItem(storageKey('targetWords'));
    const savedSurveys = localStorage.getItem(storageKey('socialValiditySurveys'));
    
    let loadedSessions: SessionData[] = [];
    let loadedSessionNumber = 1;
    let loadedTotalScore = 0;
    let loadedTotalWordsLearned = 0;

    if (savedSessions) {
      try {
        loadedSessions = JSON.parse(savedSessions);
        loadedSessionNumber = loadedSessions.length + 1;
        loadedTotalScore = loadedSessions.reduce((sum: number, s: SessionData) => sum + s.correctAnswers * 10, 0);
        loadedTotalWordsLearned = loadedSessions.reduce((sum: number, s: SessionData) => sum + s.totalQuestions, 0);
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }

    let loadedWords: string[] = [];
    if (savedWords) {
      try {
        loadedWords = JSON.parse(savedWords);
      } catch (e) {
        console.error('Failed to load target words:', e);
      }
    }

    let loadedBaseline: SessionData[] = [];
    if (savedBaseline) {
      try {
        loadedBaseline = JSON.parse(savedBaseline);
      } catch (e) {
        console.error('Failed to load baseline sessions:', e);
      }
    }

    let loadedSurveys: SurveyResponses[] = [];
    if (savedSurveys) {
      try {
        loadedSurveys = JSON.parse(savedSurveys);
      } catch (e) {
        console.error('Failed to load surveys:', e);
      }
    }

    Promise.resolve().then(() => {
      setSessions(loadedSessions);
      setSessionNumber(loadedSessionNumber);
      setTotalScore(loadedTotalScore);
      setTotalWordsLearned(loadedTotalWordsLearned);
      setTargetWords(loadedWords);
      setBaselineSessions(loadedBaseline);
      setSurveyResponses(loadedSurveys);
    });
  }, [storageKey]);

  const handleStartGame = (selectedLevel: number) => {
    setBaselineMode(false);
    if (selectedLevel === 0 && targetWords.length < 10) {
      alert('Please set up at least 10 target words first!');
      setGameState('wordManager');
      return;
    }
    setLevel(selectedLevel);
    // Intervention sessions always start at the current intervention count (baseline does not advance it)
    setSessionNumber(sessions.length + 1 || 1);
    setGameState('playing');
  };

  const handleStartBaseline = () => {
    if (targetWords.length < 10) {
      alert('Please set up at least 10 target words first!');
      setGameState('wordManager');
      return;
    }
    setBaselineMode(true);
    setLevel(0);
    // Baseline session numbering is tracked separately
    setSessionNumber((baselineSessions.length || 0) + 1);
    setGameState('playing');
  };

  const handleGameComplete = (result: {
    correct: number;
    total: number;
    newStreak: number;
    responsesTimes: number[];
    wordsAsked: string[];
  }) => {
    // Baseline runs are recorded separately and do not advance intervention session count
    if (baselineMode) {
      const baselineEntry = createSessionData(sessionNumber, result.correct, result.total, result.responsesTimes, result.wordsAsked, 'baseline');
      const updatedBaseline = [...baselineSessions, baselineEntry];
      localStorage.setItem(storageKey('baselineSessions'), JSON.stringify(updatedBaseline));
      setBaselineSessions(updatedBaseline);
      setBaselineMode(false);
      setGameState('history');
      return;
    }

    const newSession = createSessionData(sessionNumber, result.correct, result.total, result.responsesTimes, result.wordsAsked);
    const updatedSessions = [...sessions, newSession];

    // Save to localStorage
    localStorage.setItem(storageKey('sightWordsSessions'), JSON.stringify(updatedSessions));

    setSessions(updatedSessions);
    setSessionNumber(sessionNumber + 1);
    setTotalScore(totalScore + result.correct * 10);
    setTotalWordsLearned(totalWordsLearned + result.total);
    setGameState('history');
  };

  const handlePlayAgain = () => {
    setBaselineMode(false);
    setGameState('home');
  };

  const handleSaveWords = (words: string[]) => {
    localStorage.setItem(storageKey('targetWords'), JSON.stringify(words));
    setTargetWords(words);
    setGameState('home');
  };

  const handleSurveyComplete = (responses: SurveyResponses) => {
    const updatedSurveys = [...surveyResponses, responses];
    localStorage.setItem(storageKey('socialValiditySurveys'), JSON.stringify(updatedSurveys));
    setSurveyResponses(updatedSurveys);
    alert('Thank you! Your survey responses have been saved.');
    setGameState('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Logo size={80} className="drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              Ausome Academic Activities
            </h1>
          </div>
          <p className="text-xl text-white drop-shadow-md">When instruction is engineered, failure becomes unnecessary.</p>
        </div>

        {/* Participant Switcher */}
        <div className="bg-white/80 rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="text-sm font-semibold text-gray-700">Current Participant: <span className="text-purple-700">{participantId}</span></div>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <input
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value.trim())}
              placeholder="Enter participant ID"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-48"
            />
            <button
              onClick={() => setParticipantId(participantInput || 'default')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <ProgressTracker score={totalScore} level={level} streak={sessions.length} wordsLearned={totalWordsLearned} />

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {gameState === 'home' && <HomeScreen onStartGame={handleStartGame} onStartBaseline={handleStartBaseline} participantId={participantId} />}
          {gameState === 'playing' && (
            <SessionGame
              level={level}
              sessionNumber={sessionNumber}
              onGameComplete={handleGameComplete}
              onCancel={() => setGameState('history')}
              targetWords={level === 0 ? targetWords : undefined}
              baselineMode={baselineMode}
            />
          )}
          {gameState === 'history' && <SessionHistory sessions={sessions} onNewSession={handlePlayAgain} onExportData={() => setGameState('export')} />}
          {gameState === 'wordManager' && <WordListManager currentWords={targetWords} onSave={handleSaveWords} onCancel={() => setGameState('home')} />}
          {gameState === 'survey' && <SocialValiditySurvey onComplete={handleSurveyComplete} />}
          {gameState === 'export' && <DataExport onBack={() => setGameState('home')} participantId={participantId} />}
        </div>

        {/* Quick Action Buttons */}
        {gameState === 'home' && (
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <button
              onClick={() => setGameState('wordManager')}
              className="bg-white hover:bg-gray-50 text-purple-600 font-bold py-3 px-6 rounded-lg shadow-lg transition-all border-2 border-purple-300"
            >
              📝 Manage Target Words {targetWords.length > 0 && `(${targetWords.length})`}
            </button>
            <button
              onClick={() => setGameState('survey')}
              className="bg-white hover:bg-gray-50 text-pink-600 font-bold py-3 px-6 rounded-lg shadow-lg transition-all border-2 border-pink-300"
            >
              📊 Social Validity Survey
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-white text-sm mt-8 opacity-90">
          <p>PhD Dissertation - ABA-Based Sight Word Intervention for Adolescents with Autism</p>
          <p className="text-xs mt-2">Sessions 1-2: Immediate audible prompt | Sessions 3+: 3-second constant time delay</p>
        </div>
      </div>
    </div>
  );
}