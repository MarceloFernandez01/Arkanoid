import { CONFIG } from './state.js';

function renderMenu( ctx ) {
  const { w, h } = CONFIG.canvas;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 48px sans-serif';
  ctx.fillText( 'ARKANOID', w / 2, h / 2 - 40 );

  ctx.font = '24px sans-serif';
  ctx.fillText( 'Jugar', w / 2, h / 2 + 20 );
}

function renderPaddle( ctx, state ) {
  const { paddle } = state;
  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );
}

function renderBall( ctx, state ) {
  const { ball } = state;
  drawSprite( ctx, 'ball', ball.x, ball.y, ball.w, ball.h );
}

export function render( ctx, state ) {
  ctx.clearRect( 0, 0, CONFIG.canvas.w, CONFIG.canvas.h );

  if ( state.screen === 'menu' ) {
    renderMenu( ctx );
  } else if ( state.screen === 'playing' ) {
    renderPaddle( ctx, state );
    renderBall( ctx, state );
  }
}
