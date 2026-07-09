// Cada patrón es una lista de filas: 'X' = bloque, '.' = hueco.
// Para añadir un nivel nuevo, agregar un objeto { id, name, pattern } al final del array.
export const LEVELS = [
  {
    id: 1,
    name: 'Nivel 1',
    pattern: [
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
    ],
  },
  {
    id: 2,
    name: 'Nivel 2',
    pattern: [
      'XXXXXXXXX',
      '.XXXXXXX.',
      '..XXXXX..',
      '...XXX...',
      '....X....',
    ],
  },
  {
    id: 3,
    name: 'Nivel 3',
    pattern: [
      '.XXXXXXX.',
    ],
  },
  {
    id: 4,
    name: 'Nivel 4',
    pattern: [
      '.XXXXXXX.',
      'XXXXXXXXX',
      'XX.XXX.XX',
      'XX.XXX.XX',
      'XXXXXXXXX',
      '.XX.X.XX.',
      '.XX.X.XX.',
    ],
  },
];
