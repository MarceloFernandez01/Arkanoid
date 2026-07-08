import { state, CONFIG, resetGame } from './state.js';
import { render } from './render.js';
import { setupInput, updatePaddle } from './input.js';
import { updateBall } from './collisions.js';

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const END_SCREEN_DELAY = 5;

let lastTime = 0;
let endScreenTimer = 0;

function update( dt ) {
  updatePaddle( dt );
  updateBall( dt );

  if ( state.screen === 'gameover' || state.screen === 'win' ) {
    endScreenTimer += dt;

    if ( endScreenTimer >= END_SCREEN_DELAY ) {
      endScreenTimer = 0;
      resetGame();
    }
  } else {
    endScreenTimer = 0;
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
