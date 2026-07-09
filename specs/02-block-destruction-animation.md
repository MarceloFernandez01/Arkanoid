# SPEC 02 — Animación de destrucción de bloques

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-07-08
> **Objective:** Animar los bloques con sus frames de grieta progresivos en cada golpe y una animación de explosión final al romperse, reutilizando `EXPLOSION_FRAMES` de `assets/spritesheet.js`.

---

## Scope

**In:**

- En el golpe 1 a un bloque, animar la transición desde el sprite normal hasta `EXPLOSION_FRAMES[color][0]`, en 150 ms, quedando asentado en ese frame.
- En el golpe 2, animar la transición desde `EXPLOSION_FRAMES[color][0]` hasta `EXPLOSION_FRAMES[color][1]`, en 150 ms, quedando asentado en ese frame.
- En el golpe 3 (rotura), marcar el bloque como `broken = true` de inmediato (deja de colisionar), y animar la transición desde `EXPLOSION_FRAMES[color][1]` hasta `EXPLOSION_FRAMES[color][3]` (pasando por el frame 2), en 150 ms. Al terminar, el bloque deja de dibujarse.
- Soporte para múltiples animaciones activas en simultáneo (varios bloques animándose a la vez).
- Reutilización de `EXPLOSION_FRAMES`, `EXPLOSION_DURATION` y `drawFrame` ya definidos en `assets/spritesheet.js`, sin modificar ese archivo.

**Out of scope (for future specs):**

- Efectos de sonido (`break-sound.mp3`, `ball-bounce.mp3`).
- Cualquier otro tipo de feedback visual no basado en los frames de grieta existentes (shake, partículas custom, etc.).
- Animaciones para el paddle o la bola.

---

## Data model

```js
// Bloque individual (extiende el modelo de SPEC 01)
// { row, col, x, y, w, h, color, hits, broken }
// Se agrega:
// crackFrame: number  — índice de frame de grieta actualmente asentado (-1 = sprite normal, 0-3 = EXPLOSION_FRAMES[color][i])

// Animación activa de un bloque
// { blockRef, fromFrame, toFrame, elapsed, removeOnEnd }
// blockRef: referencia directa al objeto block en state.blocks
// fromFrame/toFrame: -1 (sprite normal) o 0-3 (índice en EXPLOSION_FRAMES[color])
// elapsed: ms transcurridos desde que empezó la animación
// removeOnEnd: true solo en la animación del golpe 3 (deja de dibujarse al terminar)

const state = {
  // ...
  blockAnimations: [], // array de animaciones activas, una por bloque en transición
};
```

Conventions:

- Duración fija de cada animación: 150 ms (constante `EXPLOSION_DURATION` ya existente en `assets/spritesheet.js`).
- El frame mostrado durante la animación se interpola por tiempo: `frameIndex = fromFrame + Math.floor((elapsed / EXPLOSION_DURATION) * (toFrame - fromFrame + 1))`, clamped a `toFrame`.
- Cuando `elapsed >= EXPLOSION_DURATION`, la animación se remueve de `blockAnimations` y `block.crackFrame` queda fijo en `toFrame` (salvo `removeOnEnd`, donde el bloque ya no se dibuja por estar `broken`).
- Un bloque solo puede tener una animación activa a la vez (si el golpe siguiente llega antes de que termine la anterior, se reemplaza — ver Decisions).

---

## Implementation plan

1. En `js/state.js`, agregar `crackFrame: -1` a cada bloque en `generateBlocks()` y el array `blockAnimations: []` al `state` (reseteado también en `resetGame()`). Test manual: el juego corre igual que antes, sin cambios visibles.
2. En `js/collisions.js`, crear `startBlockAnimation(block, fromFrame, toFrame, removeOnEnd)` que agrega una animación a `state.blockAnimations` (reemplazando cualquier animación previa del mismo bloque). Modificar `updateBlocks` para invocarla en cada golpe con los `fromFrame`/`toFrame` correspondientes (golpe 1: `-1→0`; golpe 2: `0→1`; golpe 3: `1→3` con `removeOnEnd=true`, marcando `block.broken=true` de inmediato). Test manual: sin errores en consola; el score sigue sumando igual que antes (30+100 por bloque).
3. En `js/collisions.js`, agregar `updateBlockAnimations(dt)` que avanza `elapsed` en cada animación activa, actualiza `block.crackFrame` por interpolación, y remueve la animación del array al llegar a `EXPLOSION_DURATION`. Exportarla e invocarla desde `js/main.js` en cada frame del loop. Test manual: sin cambios visuales todavía, sin errores en consola.
4. En `js/render.js`, modificar el dibujo de bloques: si `block.broken` y sin animación activa, no dibujar nada; si tiene animación activa, dibujar con `drawFrame` el frame interpolado de `EXPLOSION_FRAMES[block.color]`; si `block.crackFrame >= 0` sin animación activa, dibujar ese frame estático; si no, dibujar el sprite normal con `drawSprite`. Test manual: el primer golpe anima hasta el frame de grieta 0 y queda asentado ahí, el segundo hasta el frame 1, el tercero anima hasta el frame 3 y el bloque desaparece.

---

## Acceptance criteria

- [x] Al recibir el primer golpe, un bloque anima desde el sprite normal hasta `EXPLOSION_FRAMES[color][0]` en 150 ms y queda asentado en ese frame.
- [x] Al recibir el segundo golpe, el bloque anima desde `EXPLOSION_FRAMES[color][0]` hasta `EXPLOSION_FRAMES[color][1]` en 150 ms y queda asentado en ese frame.
- [x] Al recibir el tercer golpe, el bloque deja de colisionar inmediatamente (`broken = true`) y anima desde `EXPLOSION_FRAMES[color][1]` hasta `EXPLOSION_FRAMES[color][3]` (pasando por el frame 2) en 150 ms.
- [x] Al terminar la animación del tercer golpe, el bloque deja de dibujarse por completo.
- [ ] Un bloque de color `gray` se rompe correctamente con su animación de grieta y explosión, igual que el resto de los colores.
- [x] El score sigue sumando exactamente igual que en el MVP (+10 por golpe, +100 adicional al romperse).
- [x] Si un bloque recibe un nuevo golpe mientras su animación anterior aún está en curso, la animación previa se reemplaza por la nueva sin quedar en un estado inconsistente.
- [x] Varios bloques pueden animarse en simultáneo sin interferir entre sí.
- [x] No se agregó ninguna dependencia externa ni se modificó `assets/spritesheet.js`.
- [x] El juego sigue cargando sin errores en la consola.

---

## Decisions

- **Sí:** reutilizar `EXPLOSION_FRAMES` como frames de grieta progresiva por golpe (no solo como animación de explosión final). El spritesheet ya trae la progresión visual de daño, evita crear assets nuevos.
- **No:** sprites/efectos custom de daño (flash, shake, partículas). El spritesheet ya resuelve el feedback visual con sus propios frames.
- **Sí:** cada animación arranca desde el frame en que quedó el golpe anterior (`fromFrame` = último `crackFrame` asentado), nunca desde cero. Se siente continuo y evita saltos visuales.
- **Sí:** duración fija de 150 ms por animación (golpe 1, golpe 2, y explosión final), reutilizando la constante `EXPLOSION_DURATION` ya definida en el spritesheet.
- **Sí:** el bloque deja de colisionar (`broken = true`) apenas ocurre el tercer golpe, no al terminar la animación. Mantiene la física simple y consistente con el MVP (SPEC 01).
- **Sí:** una sola animación activa por bloque; un nuevo golpe reemplaza la animación en curso. Evita tener que encolar animaciones y simplifica el estado.
- **No:** sonido de rotura (`break-sound.mp3`). Queda para una spec futura de audio.
- **No:** animaciones para paddle o bola. Fuera de alcance de esta spec.

---

## Risks

| Riesgo                                                                                          | Mitigación                                                                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------|
| `EXPLOSION_FRAMES.gray` reutiliza las coordenadas de `red` en `assets/spritesheet.js` (posible placeholder). El bloque gris podría mostrar grietas del color rojo. | Verificar visualmente durante el paso 4 del plan (criterio de aceptación dedicado al bloque gris). Si el frame es incorrecto, se reporta como bug separado — no se debe modificar `assets/spritesheet.js` en esta spec. |
| Golpear un bloque muy rápido (varios golpes en frames consecutivos) podría reemplazar animaciones antes de que se vean. | Aceptado como comportamiento válido (Decisions): la última animación siempre gana y refleja el estado real de `hits`. |

---

## What is **not** in this spec

- Efectos de sonido (`break-sound.mp3`, `ball-bounce.mp3`).
- Feedback visual no basado en los frames de grieta existentes (shake, partículas custom).
- Animaciones para el paddle o la bola.
- Múltiples niveles, power-ups, high scores, controles táctiles/mouse (ya fuera de alcance en SPEC 01).

Each one of those, if it lands, goes in its own spec.
