import { state, CONFIG, resetGame, generateBlocks } from './state.js';
import { render } from './render.js';
import { setupInput, updatePaddle } from './input.js';
import { updateBall, updateBlockAnimations } from './collisions.js';

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const END_SCREEN_DELAY = 5;
const LEVEL_COMPLETE_DELAY = 3;

let lastTime = 0;
let endScreenTimer = 0;
let levelCompleteTimer = 0;

function goToNextLevel() {
  state.currentLevel++;
  state.lives = 3;
  state.blocks = generateBlocks( state.currentLevel );
  state.blockAnimations = [];
  state.paddle.x = ( CONFIG.canvas.w - state.paddle.w ) / 2;
  state.ball.x = CONFIG.canvas.w / 2 - state.ball.w / 2;
  state.ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - state.ball.h;
  state.ball.vx = CONFIG.ball.speed;
  state.ball.vy = -CONFIG.ball.speed;
  state.ball.attached = true;
  state.screen = 'playing';
}

function update( dt ) {
  updatePaddle( dt );
  updateBall( dt );
  updateBlockAnimations( dt );

  if ( state.screen === 'gameover' || state.screen === 'win' ) {
    endScreenTimer += dt;

    if ( endScreenTimer >= END_SCREEN_DELAY ) {
      endScreenTimer = 0;
      resetGame();
    }
  } else {
    endScreenTimer = 0;
  }

  if ( state.screen === 'levelComplete' ) {
    levelCompleteTimer += dt;

    if ( levelCompleteTimer >= LEVEL_COMPLETE_DELAY ) {
      levelCompleteTimer = 0;
      goToNextLevel();
    }
  } else {
    levelCompleteTimer = 0;
  }
}

function draw() {
  render( ctx, state );
}

function loop( timestamp ) {
  const dt = ( timestamp - lastTime ) / 1000;
  lastTime = timestamp;

  update( dt );
  draw();

  requestAnimationFrame( loop );
}

setupInput( canvas );

loadSpritesheet( () => {
  requestAnimationFrame( ( timestamp ) => {
    lastTime = timestamp;
    requestAnimationFrame( loop );
  } );
} );
