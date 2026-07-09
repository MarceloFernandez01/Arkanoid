import { CONFIG, LEVELS } from './state.js';

function renderMenu( ctx, state ) {
  const { w, h } = CONFIG.canvas;
  const items = LEVELS.map( ( level ) => level.name ).concat( 'Opciones' );

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 48px sans-serif';
  ctx.fillText( 'ARKANOID', w / 2, h / 2 - 80 );

  ctx.font = '24px sans-serif';

  items.forEach( ( label, i ) => {
    const y = h / 2 + i * 40;
    const selected = i === state.menuSelection;
    const scale = state.menuScales[ i ];

    ctx.save();
    ctx.translate( w / 2, y );
    ctx.scale( scale, scale );
    ctx.fillStyle = selected ? '#ffde00' : '#fff';
    ctx.fillText( label, 0, 0 );
    ctx.restore();
  } );
}

function renderOptions( ctx, state ) {
  const { w, h } = CONFIG.canvas;
  const volumePercent = Math.round( state.volume * 100 );

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 40px sans-serif';
  ctx.fillText( 'Opciones', w / 2, h / 2 - 80 );

  ctx.font = '24px sans-serif';
  ctx.fillText( `< Volumen: ${ volumePercent }% >`, w / 2, h / 2 );

  ctx.font = '18px sans-serif';
  ctx.fillText( 'Flechas: ajustar   Enter/Esc: volver', w / 2, h / 2 + 60 );
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

function renderLevelComplete( ctx, state ) {
  const { w, h } = CONFIG.canvas;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  ctx.font = 'bold 40px sans-serif';
  ctx.fillText( `¡Nivel ${ state.currentLevel } completado!`, w / 2, h / 2 );
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

  ctx.font = '18px sans-serif';
  ctx.fillText( 'O: Opciones', w / 2, h / 2 + 40 );
}

export function render( ctx, state ) {
  ctx.clearRect( 0, 0, CONFIG.canvas.w, CONFIG.canvas.h );

  if ( state.screen === 'menu' ) {
    renderMenu( ctx, state );
  } else if ( state.screen === 'options' ) {
    renderOptions( ctx, state );
  } else if ( state.screen === 'playing' || state.screen === 'paused' ) {
    renderBlocks( ctx, state );
    renderPaddle( ctx, state );
    renderBall( ctx, state );
    renderHUD( ctx, state );

    if ( state.screen === 'paused' ) {
      renderPauseOverlay( ctx );
    }
  } else if ( state.screen === 'levelComplete' ) {
    renderLevelComplete( ctx, state );
  } else if ( state.screen === 'gameover' ) {
    renderGameOver( ctx );
  } else if ( state.screen === 'win' ) {
    renderWin( ctx );
  }
}
