const sightWordsData = {
  1: [
    'the', 'and', 'a', 'to', 'of', 'in', 'is', 'you', 'that', 'it',
    'he', 'was', 'for', 'on', 'are', 'with', 'as', 'I', 'his', 'they'
  ],
  2: [
    'be', 'at', 'this', 'have', 'from', 'or', 'had', 'by', 'hot', 'has',
    'her', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about'
  ],
  3: [
    'who', 'oil', 'use', 'two', 'how', 'its', 'said', 'each', 'which', 'she',
    'do', 'an', 'all', 'into', 'could', 'year', 'your', 'work', 'first', 'made'
  ]
};

export function getRandomWords(level: number, count: number = 5) {
  const words = sightWordsData[level as keyof typeof sightWordsData] || sightWordsData[1];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getSightWords(level: number) {
  return sightWordsData[level as keyof typeof sightWordsData] || sightWordsData[1];
}
