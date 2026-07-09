import { LEVELS } from './levels.js';
import { DIFFICULTIES } from './difficulties.js';

export const CONFIG = {
  canvas: { w: 1000, h: 800 },
  paddle: { w: 162, h: 14, marginBottom: 40, speed: 500 },
  ball: { w: 24, h: 24, speed: 380 },
  grid: { rows: 5, cols: 9, blockW: 60, blockH: 30, gap: 10, marginTop: 60 },
  colors: [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ],
};

export function generateBlocks( levelId ) {
  const { cols, blockW, blockH, gap, marginTop } = CONFIG.grid;
  const gridW = cols * blockW + ( cols - 1 ) * gap;
  const marginX = ( CONFIG.canvas.w - gridW ) / 2;
  const pattern = LEVELS[ levelId - 1 ].pattern;
  const blocks = [];

  for ( let row = 0; row < pattern.length; row++ ) {
    for ( let col = 0; col < cols; col++ ) {
      if ( pattern[ row ][ col ] !== 'X' ) continue;

      blocks.push( {
        row,
        col,
        x: marginX + col * ( blockW + gap ),
        y: marginTop + row * ( blockH + gap ),
        w: blockW,
        h: blockH,
        color: CONFIG.colors[ Math.floor( Math.random() * CONFIG.colors.length ) ],
        hits: 0,
        broken: false,
        crackFrame: -1,
      } );
    }
  }

  return blocks;
}

const VOLUME_STORAGE_KEY = 'arkanoid-volume';

function loadVolume() {
  const stored = parseFloat( localStorage.getItem( VOLUME_STORAGE_KEY ) );

  return Number.isFinite( stored ) ? Math.max( 0, Math.min( 1, stored ) ) : 1;
}

export function saveVolume( volume ) {
  localStorage.setItem( VOLUME_STORAGE_KEY, String( volume ) );
}

export const state = {
  screen: 'menu', // 'menu' | 'difficultySelect' | 'levelSelect' | 'playing' | 'paused' | 'options' | 'levelComplete' | 'gameover' | 'win'
  currentLevel: 1,
  difficulty: 'normal', // 'easy' | 'normal' | 'hard' — vive en memoria, no persiste
  menuSelection: 0,
  optionsReturnScreen: 'menu',
  volume: loadVolume(),
  score: 0,
  lives: 3,
  paddle: {
    x: ( CONFIG.canvas.w - CONFIG.paddle.w ) / 2,
    y: CONFIG.canvas.h - CONFIG.paddle.marginBottom,
    w: CONFIG.paddle.w,
    h: CONFIG.paddle.h,
    speed: CONFIG.paddle.speed,
  },
  ball: {
    x: CONFIG.canvas.w / 2 - CONFIG.ball.w / 2,
    y: CONFIG.canvas.h - CONFIG.paddle.marginBottom - CONFIG.ball.h,
    w: CONFIG.ball.w,
    h: CONFIG.ball.h,
    vx: 0,
    vy: 0,
    attached: true,
  },
  blocks: generateBlocks( 1 ),
  blockAnimations: [],
  menuScales: [ 1, 1 ],
  menuInputCooldown: 0,
};

export function getDifficulty() {
  return DIFFICULTIES.find( ( d ) => d.id === state.difficulty );
}

state.ball.vx = getDifficulty().ballSpeed;
state.ball.vy = -getDifficulty().ballSpeed;

export function menuItemCount( screen ) {
  switch ( screen ) {
    case 'menu': return 2; // Jugar, Opciones
    case 'difficultySelect': return 4; // Fácil, Normal, Difícil, Volver
    case 'levelSelect': return LEVELS.length + 1; // niveles + Volver
    case 'options': return 2; // Volumen, Volver
    case 'paused': return 3; // Continuar, Opciones, Salir
    default: return 0;
  }
}

export function resetMenu( count ) {
  state.menuSelection = 0;
  state.menuScales = new Array( count ).fill( 1 );
  state.menuInputCooldown = 0;
}

export function resetGame() {
  state.screen = 'menu';
  state.currentLevel = 1;
  state.score = 0;
  state.lives = 3;
  state.paddle.x = ( CONFIG.canvas.w - state.paddle.w ) / 2;
  state.ball.x = CONFIG.canvas.w / 2 - state.ball.w / 2;
  state.ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - state.ball.h;
  state.ball.vx = getDifficulty().ballSpeed;
  state.ball.vy = -getDifficulty().ballSpeed;
  state.ball.attached = true;
  state.blocks = generateBlocks( state.currentLevel );
  state.blockAnimations = [];
  resetMenu( menuItemCount( 'menu' ) );
}
