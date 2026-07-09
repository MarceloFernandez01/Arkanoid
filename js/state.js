import { LEVELS } from './levels.js';

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

export const state = {
  screen: 'menu', // 'menu' | 'levelSelect' | 'playing' | 'paused' | 'options' | 'levelComplete' | 'gameover' | 'win'
  currentLevel: 1,
  menuSelection: 0,
  optionsReturnScreen: 'menu',
  volume: 1,
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
    vx: CONFIG.ball.speed,
    vy: -CONFIG.ball.speed,
    attached: true,
  },
  blocks: generateBlocks( 1 ),
  blockAnimations: [],
  menuScales: [ 1, 1 ],
  menuInputCooldown: 0,
};

export function menuItemCount( screen ) {
  switch ( screen ) {
    case 'menu': return 2; // Jugar, Opciones
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
  state.ball.vx = CONFIG.ball.speed;
  state.ball.vy = -CONFIG.ball.speed;
  state.ball.attached = true;
  state.blocks = generateBlocks( state.currentLevel );
  state.blockAnimations = [];
  resetMenu( menuItemCount( 'menu' ) );
}
