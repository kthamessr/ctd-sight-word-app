'use client';

export interface SessionData {
  sessionNumber: number;
  date: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeToRespond: number[];
  wordsAsked: string[];
}

interface AudioPromptConfig {
  immediate: boolean; // Sessions 1-2
  delay: number; // Sessions 3+: 3000ms delay
}

export function getPromptConfig(sessionNumber: number): AudioPromptConfig {
  if (sessionNumber <= 2) {
    return { immediate: true, delay: 0 };
  }
  return { immediate: false, delay: 3000 }; // 3 second delay
}

export function playAudioPrompt(word: string) {
  // Use Web Speech API for text-to-speech
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.cancel(); // Cancel any pending speech
    window.speechSynthesis.speak(utterance);
  }
}

export function createSessionData(
  sessionNumber: number,
  correct: number,
  total: number,
  responsesTimes: number[],
  wordsAsked: string[]
): SessionData {
  return {
    sessionNumber,
    date: new Date().toISOString(),
    correctAnswers: correct,
    totalQuestions: total,
    accuracy: (correct / total) * 100,
    timeToRespond: responsesTimes,
    wordsAsked,
  };
}

export function calculateMastery(sessions: SessionData[]): { achieved: boolean; accuracy: number } {
  // ABA mastery criteria: 80% accuracy across last 3 sessions or 90% on current session
  if (sessions.length === 0) return { achieved: false, accuracy: 0 };

  const recentSessions = sessions.slice(-3);
  const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;

  return {
    achieved: avgAccuracy >= 80 || sessions[sessions.length - 1].accuracy >= 90,
    accuracy: avgAccuracy,
  };
}
