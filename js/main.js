import { state, CONFIG } from './state.js';
import { render } from './render.js';
import { setupInput, updatePaddle } from './input.js';
import { updateBall } from './collisions.js';

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

let lastTime = 0;

function update( dt ) {
  updatePaddle( dt );
  updateBall( dt );
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
