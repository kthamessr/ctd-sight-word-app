'use client';

export interface SessionData {
  sessionNumber: number;
  level: number; // Which level (1, 2, 3, or 0 for target words)
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

let ttsPrimed = false;

export function primeAudioOnUserGesture() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;

  // Kick voice loading early
  synth.getVoices();

  // Silent utterance to "unlock" on iOS (must be called inside a tap/click)
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    synth.speak(u);
    ttsPrimed = true;
  } catch {
    // ignore
  }
}

function ensureVoicesReady(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices && voices.length) return resolve();

    const handler = () => {
      const v = synth.getVoices();
      if (v && v.length) {
        synth.removeEventListener("voiceschanged", handler);
        resolve();
      }
    };

    synth.addEventListener("voiceschanged", handler);

    // Fallback: don't hang forever
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", handler);
      resolve();
    }, 800);
  });
}

export async function playAudioPrompt(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // If you never primed on a tap/click, iOS may block speech when called from timers.
  // Still try, but priming is the real fix.
  await ensureVoicesReady();

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = "en-US";

  utterance.onerror = (e) => {
    console.warn("TTS error:", (e as any)?.error, "primed:", ttsPrimed);
  };

  synth.speak(utterance);
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
  phase: 'baseline' | 'intervention' = 'intervention',
  level: number = 1
): SessionData {
  const promptConfig = getPromptConfig(sessionNumber);
  // After session 2, count prompted responses as 5% of full value (0.05 weight)
  const assistedWeight = sessionNumber <= 2 ? 1.0 : 0.05;
  const weightedScore = correct + (assisted * assistedWeight);
  return {
    sessionNumber,
    level,
    date: new Date().toISOString(),
    correctAnswers: correct,
    assistedAnswers: assisted,
    noAnswers: noAnswer,
    totalQuestions: total,
    accuracy: (weightedScore / total) * 100, // After session 2, prompted responses count as 5%
    timeToRespond: responsesTimes,
    wordsAsked,
    responseTypes,
    phase,
    promptType: promptConfig.immediate ? 'immediate' : 'delay',
  };
}

export function calculateMasteryPerLevel(sessions: SessionData[], level: number): boolean {
  const levelSessions = sessions.filter(s => s.level === level);
  
  if (levelSessions.length === 0) return false;
  
  // Filter unprompted sessions (constant time delay) for this level
  const unpromptedSessions = levelSessions.filter(s => s.promptType === 'delay');
  
  // Mastery criteria:
  // - Two consecutive unprompted sessions >= 90%
  // - OR average >= 80% over the last three consecutive unprompted sessions
  if (unpromptedSessions.length < 2) return false;

  const lastIdx = unpromptedSessions.length - 1;
  const lastTwo90 = unpromptedSessions.length >= 2 &&
    unpromptedSessions[lastIdx].accuracy >= 90 &&
    unpromptedSessions[lastIdx - 1].accuracy >= 90;

  const lastThreeAvg80 = unpromptedSessions.length >= 3 && (
    unpromptedSessions.slice(-3).reduce((sum, s) => sum + s.accuracy, 0) / 3
  ) >= 80;

  return lastTwo90 || lastThreeAvg80;
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

  // Mastery achieved when:
  // - Two consecutive unprompted sessions >= 90%
  // - OR average >= 80% over the last three consecutive unprompted sessions
  const lastIdx = unpromptedSessions.length - 1;
  const lastTwo90 = unpromptedSessions.length >= 2 &&
    unpromptedSessions[lastIdx].accuracy >= 90 &&
    unpromptedSessions[lastIdx - 1].accuracy >= 90;

  const lastThreeAvg80 = unpromptedSessions.length >= 3 && (
    unpromptedSessions.slice(-3).reduce((sum, s) => sum + s.accuracy, 0) / 3
  ) >= 80;

  const unpromptedMastery = lastTwo90 || lastThreeAvg80;

  return {
    achieved: unpromptedMastery,
    accuracy: sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length,
    promptedAccuracy,
    unpromptedAccuracy,
    promptedSessions: promptedSessions.length,
    unpromptedSessions: unpromptedSessions.length,
  };
}
