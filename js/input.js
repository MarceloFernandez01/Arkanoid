import { state, CONFIG } from './state.js';

const keys = {};

export function setupInput( canvas ) {
  window.addEventListener( 'keydown', ( e ) => {
    keys[ e.code ] = true;

    if ( e.code === 'Space' && state.screen === 'menu' ) {
      state.screen = 'playing';
    } else if (
      ( e.code === 'Space' || e.code === 'Enter' ) &&
      state.screen === 'playing' &&
      state.ball.attached
    ) {
      state.ball.attached = false;
      state.ball.vx = CONFIG.ball.speed;
      state.ball.vy = -CONFIG.ball.speed;
    }

    if ( e.code === 'KeyP' || e.code === 'Escape' ) {
      if ( state.screen === 'playing' ) {
        state.screen = 'paused';
      } else if ( state.screen === 'paused' ) {
        state.screen = 'playing';
      }
    }
  } );

  window.addEventListener( 'keyup', ( e ) => {
    keys[ e.code ] = false;
  } );

  canvas.addEventListener( 'click', () => {
    if ( state.screen === 'menu' ) {
      state.screen = 'playing';
    }
  } );
}

export function updatePaddle( dt ) {
  if ( state.screen !== 'playing' ) return;

  const { paddle } = state;
  let dx = 0;

  if ( keys[ 'ArrowLeft' ] || keys[ 'KeyA' ] ) dx -= 1;
  if ( keys[ 'ArrowRight' ] || keys[ 'KeyD' ] ) dx += 1;

  paddle.x += dx * paddle.speed * dt;
  paddle.x = Math.max( 0, Math.min( CONFIG.canvas.w - paddle.w, paddle.x ) );
}
