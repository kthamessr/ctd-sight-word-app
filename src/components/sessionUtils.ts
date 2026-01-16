'use client';

export interface SessionData {
  sessionNumber: number;
  date: string;
  correctAnswers: number;
  assistedAnswers: number;
  noAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeToRespond: number[];
  wordsAsked: string[];
  responseTypes: ('correct' | 'assisted' | 'no-answer')[]; // Track response type for each question
  phase?: 'baseline' | 'intervention';
  promptType?: 'immediate' | 'delay'; // Track whether immediate prompt or constant time delay
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
  assisted: number,
  noAnswer: number,
  total: number,
  responsesTimes: number[],
  wordsAsked: string[],
  responseTypes: ('correct' | 'assisted' | 'no-answer')[],
  phase: 'baseline' | 'intervention' = 'intervention'
): SessionData {
  const promptConfig = getPromptConfig(sessionNumber);
  return {
    sessionNumber,
    date: new Date().toISOString(),
    correctAnswers: correct,
    assistedAnswers: assisted,
    noAnswers: noAnswer,
    totalQuestions: total,
    accuracy: ((correct + assisted) / total) * 100, // Accuracy includes both correct and assisted
    timeToRespond: responsesTimes,
    wordsAsked,
    responseTypes,
    phase,
    promptType: promptConfig.immediate ? 'immediate' : 'delay',
  };
}

export function calculateMastery(sessions: SessionData[]): { 
  achieved: boolean; 
  accuracy: number;
  promptedAccuracy: number;
  unpromptedAccuracy: number;
  promptedSessions: number;
  unpromptedSessions: number;
} {
  // Separate tracking: Prompted (immediate) vs Unprompted (constant time delay)
  if (sessions.length === 0) {
    return { 
      achieved: false, 
      accuracy: 0,
      promptedAccuracy: 0,
      unpromptedAccuracy: 0,
      promptedSessions: 0,
      unpromptedSessions: 0,
    };
  }

  // Filter sessions by prompt type
  const promptedSessions = sessions.filter(s => s.promptType === 'immediate');
  const unpromptedSessions = sessions.filter(s => s.promptType === 'delay');

  // Calculate accuracies
  const promptedAccuracy = promptedSessions.length > 0 
    ? promptedSessions.reduce((sum, s) => sum + s.accuracy, 0) / promptedSessions.length
    : 0;

  const unpromptedAccuracy = unpromptedSessions.length > 0
    ? unpromptedSessions.slice(-3).reduce((sum, s) => sum + s.accuracy, 0) / Math.min(unpromptedSessions.length, 3)
    : 0;

  // Mastery achieved when unprompted (independent) performance reaches 80% across last 3 sessions
  // or 90% on last unprompted session
  const unpromptedMastery = unpromptedSessions.length > 0 && (
    unpromptedAccuracy >= 80 || 
    unpromptedSessions[unpromptedSessions.length - 1].accuracy >= 90
  );

  return {
    achieved: unpromptedMastery,
    accuracy: sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length,
    promptedAccuracy,
    unpromptedAccuracy,
    promptedSessions: promptedSessions.length,
    unpromptedSessions: unpromptedSessions.length,
  };
}
