import { state, CONFIG, generateBlocks, resetGame, resetMenu, menuItemCount, saveVolume, getDifficulty } from './state.js';
import { LEVELS } from './levels.js';
import { DIFFICULTIES } from './difficulties.js';

const keys = {};

const MENU_SELECTED_SCALE = 1.18;
const MENU_ZOOM_SPEED = 12;
const MENU_INPUT_LAG = 0.15;
const VOLUME_STEP = 0.1;
const MENU_SCREENS = [ 'menu', 'difficultySelect', 'levelSelect', 'options', 'paused' ];

function goToMenu( screen ) {
  state.screen = screen;
  resetMenu( menuItemCount( screen ) );
}

function goToDifficultySelect() {
  goToMenu( 'difficultySelect' );
  state.menuSelection = DIFFICULTIES.findIndex( ( d ) => d.id === state.difficulty );
}

function startLevel( levelId ) {
  state.currentLevel = levelId;
  state.score = 0;
  state.lives = 3;
  state.blocks = generateBlocks( levelId );
  state.blockAnimations = [];
  state.paddle.x = ( CONFIG.canvas.w - state.paddle.w ) / 2;
  state.ball.x = CONFIG.canvas.w / 2 - state.ball.w / 2;
  state.ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - state.ball.h;
  state.ball.vx = getDifficulty().ballSpeed;
  state.ball.vy = -getDifficulty().ballSpeed;
  state.ball.attached = true;
  state.screen = 'playing';
}

export function setupInput( canvas ) {
  window.addEventListener( 'keydown', ( e ) => {
    keys[ e.code ] = true;

    if ( MENU_SCREENS.includes( state.screen ) && ( e.code === 'ArrowUp' || e.code === 'ArrowDown' ) && state.menuInputCooldown <= 0 ) {
      const count = menuItemCount( state.screen );
      const dir = e.code === 'ArrowUp' ? -1 : 1;

      state.menuSelection = ( state.menuSelection + dir + count ) % count;
      state.menuInputCooldown = MENU_INPUT_LAG;
    } else if ( state.screen === 'menu' ) {
      if ( e.code === 'Space' || e.code === 'Enter' ) {
        if ( state.menuSelection === 0 ) {
          goToDifficultySelect();
        } else {
          state.optionsReturnScreen = 'menu';
          goToMenu( 'options' );
        }
      }
    } else if ( state.screen === 'difficultySelect' ) {
      if ( e.code === 'Space' || e.code === 'Enter' ) {
        if ( state.menuSelection < DIFFICULTIES.length ) {
          state.difficulty = DIFFICULTIES[ state.menuSelection ].id;
          goToMenu( 'levelSelect' );
        } else {
          goToMenu( 'menu' );
        }
      } else if ( e.code === 'Escape' ) {
        goToMenu( 'menu' );
      }
    } else if ( state.screen === 'levelSelect' ) {
      if ( e.code === 'Space' || e.code === 'Enter' ) {
        if ( state.menuSelection < LEVELS.length ) {
          startLevel( state.menuSelection + 1 );
        } else {
          goToDifficultySelect();
        }
      } else if ( e.code === 'Escape' ) {
        goToDifficultySelect();
      }
    } else if ( state.screen === 'options' ) {
      if ( ( e.code === 'ArrowLeft' || e.code === 'ArrowRight' ) && state.menuSelection === 0 ) {
        const dir = e.code === 'ArrowLeft' ? -1 : 1;

        state.volume = Math.max( 0, Math.min( 1, state.volume + dir * VOLUME_STEP ) );
        saveVolume( state.volume );
      } else if ( e.code === 'Escape' || ( ( e.code === 'Enter' || e.code === 'Space' ) && state.menuSelection === 1 ) ) {
        goToMenu( state.optionsReturnScreen );
      }
    } else if ( state.screen === 'playing' ) {
      if ( ( e.code === 'Space' || e.code === 'Enter' ) && state.ball.attached ) {
        state.ball.attached = false;
        state.ball.vx = getDifficulty().ballSpeed;
        state.ball.vy = -getDifficulty().ballSpeed;
      } else if ( e.code === 'KeyP' || e.code === 'Escape' ) {
        goToMenu( 'paused' );
      }
    } else if ( state.screen === 'paused' ) {
      if ( e.code === 'Space' || e.code === 'Enter' ) {
        if ( state.menuSelection === 0 ) {
          state.screen = 'playing';
        } else if ( state.menuSelection === 1 ) {
          state.optionsReturnScreen = 'paused';
          goToMenu( 'options' );
        } else {
          resetGame();
        }
      } else if ( e.code === 'KeyP' || e.code === 'Escape' ) {
        state.screen = 'playing';
      }
    }
  } );

  window.addEventListener( 'keyup', ( e ) => {
    keys[ e.code ] = false;
  } );
}

export function updateMenu( dt ) {
  if ( !MENU_SCREENS.includes( state.screen ) ) return;

  if ( state.menuInputCooldown > 0 ) {
    state.menuInputCooldown = Math.max( 0, state.menuInputCooldown - dt );
  }

  const count = menuItemCount( state.screen );

  for ( let i = 0; i < count; i++ ) {
    const target = i === state.menuSelection ? MENU_SELECTED_SCALE : 1;
    const scale = state.menuScales[ i ];

    state.menuScales[ i ] = scale + ( target - scale ) * Math.min( 1, dt * MENU_ZOOM_SPEED );
  }
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
