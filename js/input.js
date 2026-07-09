import { state, CONFIG, LEVELS, generateBlocks } from './state.js';

const keys = {};

const MENU_SELECTED_SCALE = 1.18;
const MENU_ZOOM_SPEED = 12;
const MENU_INPUT_LAG = 0.15;

function startLevel( levelId ) {
  state.currentLevel = levelId;
  state.score = 0;
  state.lives = 3;
  state.blocks = generateBlocks( levelId );
  state.blockAnimations = [];
  state.paddle.x = ( CONFIG.canvas.w - state.paddle.w ) / 2;
  state.ball.x = CONFIG.canvas.w / 2 - state.ball.w / 2;
  state.ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - state.ball.h;
  state.ball.vx = CONFIG.ball.speed;
  state.ball.vy = -CONFIG.ball.speed;
  state.ball.attached = true;
  state.screen = 'playing';
}

export function setupInput( canvas ) {
  window.addEventListener( 'keydown', ( e ) => {
    keys[ e.code ] = true;

    if ( state.screen === 'menu' ) {
      if ( ( e.code === 'ArrowUp' || e.code === 'ArrowDown' ) && state.menuInputCooldown <= 0 ) {
        const dir = e.code === 'ArrowUp' ? -1 : 1;

        state.menuSelection = ( state.menuSelection + dir + LEVELS.length ) % LEVELS.length;
        state.menuInputCooldown = MENU_INPUT_LAG;
      } else if ( e.code === 'Space' || e.code === 'Enter' ) {
        startLevel( state.menuSelection + 1 );
      }
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
}

export function updateMenu( dt ) {
  if ( state.screen !== 'menu' ) return;

  if ( state.menuInputCooldown > 0 ) {
    state.menuInputCooldown = Math.max( 0, state.menuInputCooldown - dt );
  }

  LEVELS.forEach( ( level, i ) => {
    const target = i === state.menuSelection ? MENU_SELECTED_SCALE : 1;
    const scale = state.menuScales[ i ];

    state.menuScales[ i ] = scale + ( target - scale ) * Math.min( 1, dt * MENU_ZOOM_SPEED );
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
