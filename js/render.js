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

function renderBlocks( ctx, state ) {
  for ( const block of state.blocks ) {
    const hasActiveAnimation = state.blockAnimations.some( ( anim ) => anim.blockRef === block );

    if ( block.broken && !hasActiveAnimation ) continue;

    if ( block.crackFrame >= 0 ) {
      drawFrame( ctx, EXPLOSION_FRAMES[ block.color ][ block.crackFrame ], block.x, block.y, block.w, block.h );
    } else {
      drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
    }
  }
}

const LIFE_ICON_SIZE = 20;
const LIFE_ICON_GAP = 8;

function renderHUD( ctx, state ) {
  const { w } = CONFIG.canvas;

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText( `Score: ${ state.score }`, 10, 30 );

  for ( let i = 0; i < state.lives; i++ ) {
    const x = w - 10 - ( i + 1 ) * LIFE_ICON_SIZE - i * LIFE_ICON_GAP;
    drawSprite( ctx, 'ball', x, 10, LIFE_ICON_SIZE, LIFE_ICON_SIZE );
  }
}

function renderGameOver( ctx ) {
  const { w, h } = CONFIG.canvas;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 48px sans-serif';
  ctx.fillText( 'GAME OVER', w / 2, h / 2 );
}

function renderWin( ctx ) {
  const { w, h } = CONFIG.canvas;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 40px sans-serif';
  ctx.fillText( '¡Felicitaciones, ganaste!', w / 2, h / 2 );
}

function renderPauseOverlay( ctx ) {
  const { w, h } = CONFIG.canvas;

  ctx.fillStyle = 'rgba(2, 6, 63, 0.6)';
  ctx.fillRect( 0, 0, w, h );

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText( 'Pausa', w / 2, h / 2 );
}

export function render( ctx, state ) {
  ctx.clearRect( 0, 0, CONFIG.canvas.w, CONFIG.canvas.h );

  if ( state.screen === 'menu' ) {
    renderMenu( ctx );
  } else if ( state.screen === 'playing' || state.screen === 'paused' ) {
    renderBlocks( ctx, state );
    renderPaddle( ctx, state );
    renderBall( ctx, state );
    renderHUD( ctx, state );

    if ( state.screen === 'paused' ) {
      renderPauseOverlay( ctx );
    }
  } else if ( state.screen === 'gameover' ) {
    renderGameOver( ctx );
  } else if ( state.screen === 'win' ) {
    renderWin( ctx );
  }
}
