# SPEC 04 — Efectos de sonido (rebote y rotura de bloques)

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-07-09
> **Objective:** Integrar `ball-bounce.mp3` en cada rebote de la bola contra paredes/paddle/bloques (golpes 1 y 2) y `break-sound.mp3` al romperse un bloque, mediante un nuevo módulo `js/sound.js`.

---

## Scope

**In:**

- Nuevo módulo `js/sound.js` que expone `playSound(name)`, encapsulando la creación y reproducción de los `Audio` de `assets/sounds/`.
- `ball-bounce.mp3` suena cada vez que la bola rebota contra: pared izquierda, pared derecha, pared superior, el paddle, y un bloque en golpe 1 o golpe 2 (sin romperlo).
- `break-sound.mp3` suena únicamente cuando un bloque se rompe por completo (tercer golpe, `block.broken = true`), reemplazando a `ball-bounce.mp3` en ese golpe puntual.
- Los sonidos pueden solaparse libremente: cada llamado a `playSound` crea/reproduce su propia instancia de `Audio`, sin cortar sonidos anteriores.
- Volumen por defecto (1.0), sin control ni mute.

**Out of scope (for future specs):**

- Control de volumen, mute, o UI relacionada con audio.
- Música de fondo.
- Sonidos para Game Over, victoria, pausa o menú.
- Manejo explícito de desbloqueo de audio por políticas de autoplay del navegador (se asume que el primer `keydown` del menú ya alcanza).

---

## Data model

```js
// assets/sounds/ (ya existentes, sin cambios)
// - ball-bounce.mp3
// - break-sound.mp3

// js/sound.js (nuevo)

const SOUNDS = {
  bounce: 'assets/sounds/ball-bounce.mp3',
  break: 'assets/sounds/break-sound.mp3',
};

export function playSound( name ) {
  const audio = new Audio( SOUNDS[ name ] );
  audio.play();
}
```

Conventions:

- Cada llamado a `playSound` instancia un `Audio` nuevo (no se reutiliza ni se cachea), lo que permite solapamiento natural sin gestionar estado.
- No se agrega ningún campo nuevo a `state` — el sonido es un efecto lateral disparado desde `js/collisions.js`, no forma parte del estado del juego.

---

## Implementation plan

1. Crear `js/sound.js` con el diccionario `SOUNDS` y la función `playSound(name)` (ver Data model). Test manual: el archivo no rompe nada al no estar importado todavía.
2. En `js/collisions.js`, importar `playSound` desde `./sound.js`. Invocar `playSound('bounce')` en `updateBall`: en el rebote contra pared izquierda, pared derecha, pared superior (líneas 124-135), y en el rebote contra el paddle (dentro del `if (checkPaddleCollision(...))`, línea 137-139). Test manual: se escucha el sonido de rebote contra las tres paredes y el paddle; no hay errores en consola.
3. En `js/collisions.js`, dentro de `updateBlocks`: invocar `playSound('bounce')` en las ramas de golpe 1 y golpe 2 (`block.hits === 1` y `block.hits === 2`, líneas 90-94), e invocar `playSound('break')` en la rama `block.hits >= 3` (líneas 82-89), en vez del sonido de rebote. Test manual: golpear un bloque una o dos veces sin romperlo suena igual que un rebote de pared; el tercer golpe (rotura) suena distinto (`break-sound.mp3`); el score y las animaciones siguen funcionando igual.

---

## Acceptance criteria

- [x] La bola reproduce `ball-bounce.mp3` al rebotar contra la pared izquierda.
- [x] La bola reproduce `ball-bounce.mp3` al rebotar contra la pared derecha.
- [x] La bola reproduce `ball-bounce.mp3` al rebotar contra la pared superior.
- [x] La bola reproduce `ball-bounce.mp3` al rebotar contra el paddle.
- [x] Un bloque reproduce `ball-bounce.mp3` al recibir su primer golpe (sin romperse).
- [x] Un bloque reproduce `ball-bounce.mp3` al recibir su segundo golpe (sin romperse).
- [x] Un bloque reproduce `break-sound.mp3` (y no `ball-bounce.mp3`) al recibir su tercer golpe (rotura completa).
- [x] Si ocurren varios eventos sonoros casi simultáneos (ej: dos bloques golpeados en frames cercanos, o rebote de pared + golpe a un bloque), los sonidos se solapan sin cortarse entre sí.
- [x] El score, las animaciones de bloques y el resto de la física del juego siguen funcionando exactamente igual que antes de esta spec.
- [x] No se agregó ninguna dependencia externa.
- [x] El juego sigue cargando sin errores en la consola.

---

## Decisions

- **Sí:** crear un módulo dedicado `js/sound.js` en vez de manejar `Audio` directamente en `collisions.js`. Sigue el mismo patrón de encapsulación que `assets/spritesheet.js` para el dibujo.
- **Sí:** instanciar un `Audio` nuevo en cada `playSound()` en vez de reutilizar/cachear una sola instancia por sonido. Permite solapamiento natural (varios bloques sonando a la vez) sin gestionar un pool o cortar reproducciones en curso.
- **Sí:** `ball-bounce.mp3` también suena en los golpes 1 y 2 de un bloque (no solo en paredes/paddle). El usuario lo definió explícitamente para que golpear un bloque sin romperlo se sienta como un rebote más.
- **Sí:** `break-sound.mp3` reemplaza a `ball-bounce.mp3` únicamente en el golpe que rompe el bloque (golpe 3), no se reproducen ambos sonidos en simultáneo para ese evento.
- **No:** control de volumen, mute o UI de audio. Fuera de alcance, se puede pedir en una spec futura.
- **No:** manejo explícito de desbloqueo de audio por autoplay policies. Se asume que el `keydown` para iniciar desde el menú (SPEC 01) ya cuenta como interacción de usuario válida para los navegadores modernos.
- **No:** música de fondo ni sonidos para game over/victoria/pausa/menú. Fuera de alcance de esta spec.

---

## Risks

| Riesgo | Mitigación |
|---|---|
| Si el navegador no considera que el `keydown` del menú (SPEC 01) es suficiente interacción para desbloquear audio, los sonidos podrían no reproducirse en algunos navegadores/configuraciones. | Aceptado como riesgo conocido (Decisions): no se agrega manejo explícito en esta spec. Si ocurre, se reporta como bug separado para una spec futura. |
| Crear un `Audio` nuevo en cada golpe/rebote (sin límite) podría acumular instancias si el usuario genera muchos eventos en poco tiempo (ej. bola rebotando muy rápido entre bloques). | Aceptado como riesgo menor: los `Audio` no reproducidos se liberan por el recolector de basura del navegador al terminar o no tener referencias; no se espera impacto perceptible en una partida normal. |
