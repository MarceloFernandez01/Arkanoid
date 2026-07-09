import { state, CONFIG, getDifficulty } from './state.js';
import { playSound } from './sound.js';
import { LEVELS } from './levels.js';

const MAX_BOUNCE_ANGLE = 75 * ( Math.PI / 180 );

function checkPaddleCollision( ball, paddle ) {
  if ( ball.vy <= 0 ) return false;

  return (
    ball.x < paddle.x + paddle.w &&
    ball.x + ball.w > paddle.x &&
    ball.y + ball.h >= paddle.y &&
    ball.y + ball.h <= paddle.y + paddle.h
  );
}

function bounceOffPaddle( ball, paddle ) {
  const speed = Math.hypot( ball.vx, ball.vy );
  const ballCenterX = ball.x + ball.w / 2;
  const paddleCenterX = paddle.x + paddle.w / 2;
  const hitPos = ( ballCenterX - paddleCenterX ) / ( paddle.w / 2 );
  const clampedHitPos = Math.max( -1, Math.min( 1, hitPos ) );
  const angle = clampedHitPos * MAX_BOUNCE_ANGLE;

  ball.vx = speed * Math.sin( angle );
  ball.vy = -speed * Math.cos( angle );
  ball.y = paddle.y - ball.h;
}

function checkBlockCollision( ball, block ) {
  return (
    ball.x < block.x + block.w &&
    ball.x + ball.w > block.x &&
    ball.y < block.y + block.h &&
    ball.y + ball.h > block.y
  );
}

function resolveBlockCollision( ball, block ) {
  const overlapX = Math.min( ball.x + ball.w - block.x, block.x + block.w - ball.x );
  const overlapY = Math.min( ball.y + ball.h - block.y, block.y + block.h - ball.y );

  if ( overlapX < overlapY ) {
    ball.vx *= -1;
  } else {
    ball.vy *= -1;
  }
}

function resetRound() {
  const { ball, paddle } = state;

  paddle.x = ( CONFIG.canvas.w - paddle.w ) / 2;

  ball.vx = getDifficulty().ballSpeed;
  ball.vy = -getDifficulty().ballSpeed;
  ball.attached = true;
}

function startBlockAnimation( block, fromFrame, toFrame, removeOnEnd ) {
  state.blockAnimations = state.blockAnimations.filter( ( anim ) => anim.blockRef !== block );

  state.blockAnimations.push( {
    blockRef: block,
    fromFrame,
    toFrame,
    elapsed: 0,
    removeOnEnd,
  } );
}

function updateBlocks( ball ) {
  const { blockHits } = getDifficulty();

  for ( const block of state.blocks ) {
    if ( block.broken ) continue;
    if ( !checkBlockCollision( ball, block ) ) continue;

    resolveBlockCollision( ball, block );

    block.hits++;
    state.score += 10;

    if ( block.hits >= blockHits ) {
      block.broken = true;
      state.score += 100;
      startBlockAnimation( block, blockHits === 1 ? -1 : 4, 10, true );
      playSound( 'break' );

      if ( state.blocks.every( ( b ) => b.broken ) ) {
        state.screen = state.currentLevel < LEVELS.length ? 'levelComplete' : 'win';
      }
    } else if ( block.hits === 1 ) {
      startBlockAnimation( block, -1, 1, false );
      playSound( 'bounce' );
    } else if ( block.hits === 2 ) {
      startBlockAnimation( block, 1, 4, false );
      playSound( 'bounce' );
    }

    break;
  }
}

export function updateBlockAnimations( dt ) {
  state.blockAnimations = state.blockAnimations.filter( ( anim ) => {
    anim.elapsed += dt * 1000;

    const { fromFrame, toFrame, elapsed } = anim;
    const frameIndex = Math.min(
      toFrame,
      fromFrame + Math.floor( ( elapsed / EXPLOSION_DURATION ) * ( toFrame - fromFrame + 1 ) )
    );

    anim.blockRef.crackFrame = frameIndex;

    return elapsed < EXPLOSION_DURATION;
  } );
}

export function updateBall( dt ) {
  if ( state.screen !== 'playing' ) return;

  const { ball, paddle } = state;

  if ( ball.attached ) {
    ball.x = paddle.x + paddle.w / 2 - ball.w / 2;
    ball.y = paddle.y - ball.h;
    return;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if ( ball.x <= 0 ) {
    ball.x = 0;
    ball.vx *= -1;
    playSound( 'bounce' );
  } else if ( ball.x + ball.w >= CONFIG.canvas.w ) {
    ball.x = CONFIG.canvas.w - ball.w;
    ball.vx *= -1;
    playSound( 'bounce' );
  }

  if ( ball.y <= 0 ) {
    ball.y = 0;
    ball.vy *= -1;
    playSound( 'bounce' );
  }

  if ( checkPaddleCollision( ball, paddle ) ) {
    bounceOffPaddle( ball, paddle );
    playSound( 'bounce' );
  }

  updateBlocks( ball );

  if ( ball.y > CONFIG.canvas.h ) {
    state.lives--;

    if ( state.lives <= 0 ) {
      state.screen = 'gameover';
    }

    resetRound();
  }
}
