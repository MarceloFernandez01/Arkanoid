export const CONFIG = {
  canvas: { w: 1000, h: 800 },
  paddle: { w: 162, h: 14, marginBottom: 40, speed: 500 },
  ball: { w: 24, h: 24, speed: 380 },
  grid: { rows: 5, cols: 9, blockW: 60, blockH: 30, gap: 10, marginTop: 60 },
  colors: [ 'gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ],
};

function generateBlocks() {
  const { rows, cols, blockW, blockH, gap, marginTop } = CONFIG.grid;
  const gridW = cols * blockW + ( cols - 1 ) * gap;
  const marginX = ( CONFIG.canvas.w - gridW ) / 2;
  const blocks = [];

  for ( let row = 0; row < rows; row++ ) {
    for ( let col = 0; col < cols; col++ ) {
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
  screen: 'menu', // 'menu' | 'playing' | 'paused' | 'gameover' | 'win'
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
  },
  blocks: generateBlocks(),
  blockAnimations: [],
};

export function resetGame() {
  state.screen = 'menu';
  state.score = 0;
  state.lives = 3;
  state.paddle.x = ( CONFIG.canvas.w - state.paddle.w ) / 2;
  state.ball.x = CONFIG.canvas.w / 2 - state.ball.w / 2;
  state.ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - state.ball.h;
  state.ball.vx = CONFIG.ball.speed;
  state.ball.vy = -CONFIG.ball.speed;
  state.blocks = generateBlocks();
  state.blockAnimations = [];
}
