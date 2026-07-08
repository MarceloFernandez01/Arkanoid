import { state, CONFIG } from './state.js';

export function updateBall( dt ) {
  if ( state.screen !== 'playing' ) return;

  const { ball } = state;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if ( ball.x <= 0 ) {
    ball.x = 0;
    ball.vx *= -1;
  } else if ( ball.x + ball.w >= CONFIG.canvas.w ) {
    ball.x = CONFIG.canvas.w - ball.w;
    ball.vx *= -1;
  }

  if ( ball.y <= 0 ) {
    ball.y = 0;
    ball.vy *= -1;
  }

  if ( ball.y > CONFIG.canvas.h ) {
    ball.x = CONFIG.canvas.w / 2 - ball.w / 2;
    ball.y = CONFIG.canvas.h - CONFIG.paddle.marginBottom - ball.h;
    ball.vx = CONFIG.ball.speed;
    ball.vy = -CONFIG.ball.speed;
  }
}
