export const CONFIG = {
  canvas: { w: 800, h: 600 },
  paddle: { w: 162, h: 14, marginBottom: 40, speed: 300 },
  ball: { w: 16, h: 16, speed: 200 },
  grid: { rows: 5, cols: 8, blockW: 90, blockH: 30, gap: 10, marginTop: 60, marginX: 5 },
  colors: [ 'gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ],
};

function generateBlocks() {
  const { rows, cols, blockW, blockH, gap, marginTop, marginX } = CONFIG.grid;
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
};
