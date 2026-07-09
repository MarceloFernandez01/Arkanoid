import { state } from './state.js';

const SOUNDS = {
  bounce: 'assets/sounds/ball-bounce.mp3',
  break: 'assets/sounds/break-sound.mp3',
};

export function playSound( name ) {
  const audio = new Audio( SOUNDS[ name ] );
  audio.volume = state.volume;
  audio.play();
}
