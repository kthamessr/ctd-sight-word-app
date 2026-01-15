'use client';

import { useState, useEffect } from 'react';
import { getPromptConfig, playAudioPrompt } from './sessionUtils';
import { playCorrectChime, playIncorrectSound } from './audioUtils';
import { getRandomWords } from './sightWordsData';

interface GameProps {
  level: number;
  sessionNumber: number;
  targetWords?: string[];
  baselineMode?: boolean;
  onGameComplete: (result: {
    correct: number;
    total: number;
    newStreak: number;
    responsesTimes: number[];
    wordsAsked: string[];
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
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [responsesTimes, setResponsesTimes] = useState<number[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  
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

  // Prompt delay logic for sessions 3+
  useEffect(() => {
    if (baselineMode) return;
    if (promptConfig.immediate || answered || questions.length === 0) return;

    if (promptDelayRemaining > 0) {
      const timer = setTimeout(() => {
        setPromptDelayRemaining((prev) => prev - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (promptDelayRemaining === 0 && !showPrompt && questions.length > 0) {
      Promise.resolve().then(() => setShowPrompt(true));
      playAudioPrompt(questions[currentQuestion].word);
    }
  }, [promptDelayRemaining, showPrompt, answered, questions, currentQuestion, promptConfig.immediate, baselineMode]);

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
          setResponsesTimes(newResponsesTimes);
          
          // Auto-advance after showing incorrect feedback
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
              onGameComplete({ correct, total: questions.length, newStreak: correct === questions.length ? 1 : 0, responsesTimes: newResponsesTimes, wordsAsked });
            }
          }, 2000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning, answered, questions, responsesTimes, currentQuestion, correct, promptConfig.delay, onGameComplete, showPrompt, baselineMode]);

  if (questions.length === 0) {
    return <div className="text-center text-gray-600">Loading questions...</div>;
  }

  const currentWord = questions[currentQuestion].word;
  const allOptions = questions[currentQuestion].options;

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);
    setIsTimerRunning(false);
    const responseSeconds = baselineMode ? 0 : 10 - timeLeft;
    const newResponsesTimes = [...responsesTimes, responseSeconds];
    setResponsesTimes(newResponsesTimes);

    const isCorrectAnswer = answer === currentWord;
    const newCorrect = isCorrectAnswer ? correct + 1 : correct;
    
    if (isCorrectAnswer) {
      setCorrect(newCorrect);
      playCorrectChime();
    } else {
      playIncorrectSound();
    }

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
        onGameComplete({ correct: newCorrect, total: questions.length, newStreak: newCorrect === questions.length ? 1 : 0, responsesTimes: newResponsesTimes, wordsAsked });
      }
    }, 2000);
  };

  const isCorrect = selectedAnswer === currentWord;
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
        <div className="text-center mb-6 p-4 bg-orange-100 rounded-lg max-w-md mx-auto">
          <p className="text-base font-semibold text-orange-700">Waiting for prompt... {(promptDelayRemaining / 1000).toFixed(1)}s</p>
        </div>
      )}

      {!baselineMode && showPrompt && (
        <div className="text-center mb-8 p-4 bg-green-100 rounded-lg border-2 border-green-500 max-w-md mx-auto">
          <p className="text-base font-semibold text-green-700">🔊 Prompt given</p>
        </div>
      )}

      {/* Question Display */}
      <div className="text-center mb-8 py-6">
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Select the correct word:</h2>
        <div className="text-7xl font-bold text-purple-600 mb-4 py-4">{currentWord}</div>
        <p className="text-gray-600 text-base">
          {baselineMode ? 'Choose the correct spelling.' : 'Listen to the prompt and choose the correct spelling.'}
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

      {/* Feedback */}
      {answered && (
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">
            {isCorrect ? '✅ Correct!' : selectedAnswer === null ? '⏱️ Time\'s up!' : '💙 Nice try.'}
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
