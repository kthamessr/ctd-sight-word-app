'use client';

import { useState, useEffect } from 'react';
import { getPromptConfig, playAudioPrompt } from './sessionUtils';
import { playCorrectChime } from './audioUtils';
import { getRandomWords } from './sightWordsData';

interface GameProps {
  level: number;
  sessionNumber: number;
  targetWords?: string[];
  baselineMode?: boolean;
  onGameComplete: (result: {
    correct: number;
    assisted: number;
    noAnswer: number;
    total: number;
    newStreak: number;
    responsesTimes: number[];
    wordsAsked: string[];
    responseTypes: ('correct' | 'assisted' | 'no-answer')[];
    sessionPoints: number;
  }) => void;
  onCancel: () => void;
}

interface Question {
  word: string;
  options: string[];
  promptedAt?: number;
}

export default function SessionGame({ level, sessionNumber, targetWords, baselineMode = false, onGameComplete, onCancel }: GameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [assisted, setAssisted] = useState(0);
  const [noAnswer, setNoAnswer] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [responsesTimes, setResponsesTimes] = useState<number[]>([]);
  const [responseTypes, setResponseTypes] = useState<('correct' | 'assisted' | 'no-answer')[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [recentGain, setRecentGain] = useState<number | null>(null);
  
  // Get prompt configuration based on session number
  const promptConfig = getPromptConfig(sessionNumber);
  const [promptDelayRemaining, setPromptDelayRemaining] = useState(promptConfig.delay);

  // Initialize questions
  useEffect(() => {
    let words: string[] = [];

    if (targetWords && targetWords.length > 0) {
      const shuffled = [...targetWords].sort(() => Math.random() - 0.5);
      words = shuffled.slice(0, 10);
    } else {
      words = getRandomWords(level === 0 ? 1 : level, 10);
    }

    const questionsData: Question[] = words.map((word: string) => {
      const allOptions = [word, ...getRandomWords(level === 0 ? 1 : level, 3).filter((w: string) => w !== word)].sort(
        () => Math.random() - 0.5
      );
      return { word, options: allOptions };
    });

    Promise.resolve().then(() => setQuestions(questionsData));
  }, [level, targetWords]);

  // Reset per-question timers and start times
  useEffect(() => {
    if (questions.length === 0) return;
    Promise.resolve().then(() => {
      setTimeLeft(10);
      setIsTimerRunning(!baselineMode);
      setShowPrompt(false);
      setPromptDelayRemaining(promptConfig.delay);
    });
  }, [currentQuestion, questions.length, baselineMode, promptConfig.delay]);

  // For sessions 3+: Play audio immediately, then show word after delay as visual prompt
  useEffect(() => {
    if (baselineMode) return;
    if (promptConfig.immediate || answered || questions.length === 0) return;

    // Play audio immediately when question starts
    if (promptDelayRemaining === promptConfig.delay) {
      playAudioPrompt(questions[currentQuestion].word);
    }

    if (promptDelayRemaining > 0) {
      const timer = setTimeout(() => {
        setPromptDelayRemaining((prev) => prev - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // After 3 seconds, show the word as visual prompt
    if (promptDelayRemaining === 0 && !showPrompt && questions.length > 0) {
      Promise.resolve().then(() => setShowPrompt(true));
    }
  }, [promptDelayRemaining, showPrompt, answered, questions, currentQuestion, promptConfig.immediate, baselineMode, promptConfig.delay]);

  // Prompt immediately for sessions 1-2
  useEffect(() => {
    if (baselineMode) return;
    if (!promptConfig.immediate || answered || questions.length === 0) return;

    Promise.resolve().then(() => setShowPrompt(true));
    playAudioPrompt(questions[currentQuestion].word);
  }, [currentQuestion, promptConfig.immediate, answered, questions, baselineMode]);

  // Timer effect
  useEffect(() => {
    if (baselineMode) return;
    if (!isTimerRunning || answered || questions.length === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setAnswered(true);
          setSelectedAnswer(null); // No answer selected
          setIsTimerRunning(false);
          const newResponsesTimes = [...responsesTimes, 10];
          const newResponseTypes = [...responseTypes, 'no-answer'] as ('correct' | 'assisted' | 'no-answer')[];
          const newNoAnswer = noAnswer + 1;
          setResponsesTimes(newResponsesTimes);
          setResponseTypes(newResponseTypes);
          setNoAnswer(newNoAnswer);
          
          // Auto-advance after showing no answer feedback
          setTimeout(() => {
            if (currentQuestion + 1 < questions.length) {
              setCurrentQuestion(currentQuestion + 1);
              setAnswered(false);
              setSelectedAnswer(null);
              setTimeLeft(10);
              setIsTimerRunning(true);
              setShowPrompt(false);
              setPromptDelayRemaining(promptConfig.delay);
            } else {
              const wordsAsked = questions.map((q) => q.word);
              onGameComplete({ correct, assisted, noAnswer, total: questions.length, newStreak: correct === questions.length ? 1 : 0, responsesTimes: newResponsesTimes, wordsAsked, responseTypes, sessionPoints });
            }
          }, 2000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning, answered, questions, responsesTimes, currentQuestion, correct, assisted, promptConfig.delay, onGameComplete, showPrompt, baselineMode, responseTypes, noAnswer, sessionPoints]);

  if (questions.length === 0) {
    return <div className="text-center text-gray-600">Loading questions...</div>;
  }

  const currentWord = questions[currentQuestion].word;
  const allOptions = questions[currentQuestion].options;

  const handleAnswer = (answer: string) => {
    if (answered) return;

    const isCorrectAnswer = answer === currentWord;

    if (isCorrectAnswer) {
      setSelectedAnswer(answer);
      setAnswered(true);
      setIsTimerRunning(false);
      const responseSeconds = baselineMode ? 0 : 10 - timeLeft;
      const newResponsesTimes = [...responsesTimes, responseSeconds];
      setResponsesTimes(newResponsesTimes);
      
      // Determine if correct or assisted based on prompt visibility
      const isAssisted = showPrompt;
      const newResponseType: 'correct' | 'assisted' = isAssisted ? 'assisted' : 'correct';
      const newResponseTypes = [...responseTypes, newResponseType] as ('correct' | 'assisted' | 'no-answer')[];
      setResponseTypes(newResponseTypes);
      
      if (isAssisted) {
        setAssisted(assisted + 1);
      } else {
        setCorrect(correct + 1);
      }

      // Token accumulation: 5 points for assisted, 10 for unprompted
      const gain = isAssisted ? 5 : 10;
      setSessionPoints((prev) => prev + gain);
      setRecentGain(gain);
      setTimeout(() => setRecentGain(null), 1000);
      
      playCorrectChime();

      // Auto-advance after 2 seconds with updated values
      setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(currentQuestion + 1);
          setAnswered(false);
          setSelectedAnswer(null);
          setTimeLeft(10);
          setIsTimerRunning(true);
          setShowPrompt(false);
          setPromptDelayRemaining(promptConfig.delay);
        } else {
          const wordsAsked = questions.map((q) => q.word);
          const totalCorrect = (isAssisted ? correct : correct + 1);
          const totalAssisted = isAssisted ? assisted + 1 : assisted;
          onGameComplete({ correct: totalCorrect, assisted: totalAssisted, noAnswer, total: questions.length, newStreak: totalCorrect === questions.length ? 1 : 0, responsesTimes: newResponsesTimes, wordsAsked, responseTypes: newResponseTypes, sessionPoints });
        }
      }, 2000);
    } else {
      // Wrong answer - show "Try Again"
      setShowTryAgain(true);
      setTimeout(() => setShowTryAgain(false), 1500);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col justify-center items-center">
      {/* Session Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg w-full max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Session {sessionNumber}</p>
          {baselineMode ? (
            <p className="text-xs text-gray-700">Baseline mode: no prompts, no timer</p>
          ) : sessionNumber <= 2 ? (
            <p className="text-xs text-blue-600">⚡ Immediate audible prompt</p>
          ) : (
            <p className="text-xs text-orange-600">⏱️ 3-second delay before prompt</p>
          )}
        </div>
      </div>

      {/* Session Tokens */}
      <div className="mb-4 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3">
          <span className="text-2xl">🪙</span>
          <span className="text-lg font-bold text-yellow-700">Session Coins: {sessionPoints}</span>
          {recentGain !== null && (
            <span className="text-sm font-bold text-green-700 bg-green-100 border border-green-300 rounded-full px-3 py-1 animate-bounce">+{recentGain}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 w-full max-w-2xl">
        <div className="flex justify-center gap-8 text-base font-semibold text-gray-700 mb-3">
          <span>Question {currentQuestion + 1}/{questions.length}</span>
          <span>Accuracy: {correct}/{currentQuestion + (answered ? 1 : 0)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      {!baselineMode && (
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold transition-all ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Prompt Status */}
      {!baselineMode && !promptConfig.immediate && promptDelayRemaining > 0 && (
        <div className="text-center mb-6 p-4 bg-blue-100 rounded-lg max-w-md mx-auto">
          <p className="text-base font-semibold text-blue-700">🔊 Listen carefully! Visual prompt in {(promptDelayRemaining / 1000).toFixed(1)}s</p>
        </div>
      )}

      {!baselineMode && !promptConfig.immediate && showPrompt && (
        <div className="text-center mb-8 p-4 bg-green-100 rounded-lg border-2 border-green-500 max-w-md mx-auto">
          <p className="text-base font-semibold text-green-700">📝 Visual prompt shown</p>
        </div>
      )}

      {/* Question Display */}
      <div className="text-center mb-8 py-6">
        {/* Only show the word/placeholder for sessions 1-2 (immediate), baseline, or after prompt for sessions 3+ */}
        {(promptConfig.immediate || baselineMode || showPrompt) && (
          <>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Select the correct word:</h2>
            <div className="text-7xl font-bold text-purple-600 mb-4 py-4">{currentWord}</div>
          </>
        )}
        {!promptConfig.immediate && !baselineMode && !showPrompt && (
          <div className="text-5xl font-bold text-gray-400 mb-4 py-4">🔊 Listen...</div>
        )}
        <p className="text-gray-600 text-base">
          {baselineMode ? 'Choose the correct spelling.' : 
           !promptConfig.immediate && !showPrompt ? 'Listen carefully to the word.' :
           'Choose the correct spelling.'}
        </p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        {allOptions.map((option, index) => {
          let buttonClass = 'bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-800';

          if (answered) {
            if (option === currentWord) {
              buttonClass = 'bg-green-100 border-2 border-green-500 text-green-800';
            } else if (option === selectedAnswer && option !== currentWord) {
              buttonClass = 'bg-red-100 border-2 border-red-500 text-red-800';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className={`p-8 rounded-xl font-bold text-2xl transition-all transform hover:scale-105 ${buttonClass} ${
                answered ? 'cursor-default' : 'cursor-pointer hover:shadow-xl'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Try Again Message */}
      {showTryAgain && (
        <div className="text-center mb-8 p-4 bg-orange-100 rounded-lg border-2 border-orange-500 max-w-md mx-auto">
          <p className="text-2xl font-bold text-orange-700">🔄 Try Again</p>
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">
            {showPrompt ? '✅ Correct with prompt!' : '✅ Correct!'}
          </div>
          <p className="text-gray-700">
            The correct answer is: <span className="font-bold text-purple-600">{currentWord}</span>
          </p>
          {!baselineMode && !promptConfig.immediate && <p className="text-xs text-gray-500 mt-2">Response time: {(10 - timeLeft).toFixed(1)}s</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
