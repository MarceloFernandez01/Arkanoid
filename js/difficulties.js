export const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Fácil',
    blockHits: 1,
    ballSpeed: 285, // 380 * 0.75
    resetLivesOnProgress: true,
  },
  {
    id: 'normal',
    name: 'Normal',
    blockHits: 3,
    ballSpeed: 380,
    resetLivesOnProgress: true,
  },
  {
    id: 'hard',
    name: 'Difícil',
    blockHits: 3,
    ballSpeed: 475, // 380 * 1.25
    resetLivesOnProgress: false,
  },
];
