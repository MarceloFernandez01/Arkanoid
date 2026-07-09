# SPEC 05 — Selección de nivel y progresión (pirámide invertida y calavera)

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02, SPEC 03, SPEC 04
> **Date:** 2026-07-09
> **Objective:** Agregar los niveles 2 (pirámide invertida) y 3 (calavera), seleccionables por teclado desde un menú de selección de nivel, con progresión automática entre niveles que conserva el puntaje y reinicia las vidas.

---

## Scope

**In:**

- Menú inicial reemplaza el texto "Jugar" por 3 opciones seleccionables: "Nivel 1", "Nivel 2", "Nivel 3".
- Selección con flechas arriba/abajo para mover el cursor entre las 3 opciones y Enter/Espacio para confirmar e iniciar el nivel elegido.
- Nivel 1: mismo patrón actual (grilla completa 9x5), sin cambios.
- Nivel 2 ("pirámide invertida"): grilla de 9 columnas x 5 filas con el patrón:
  ```
  XXXXXXXXX
  .XXXXXXX.
  ..XXXXX..
  ...XXX...
  ....X....
  ```
- Nivel 3 ("calavera"): grilla de 9 columnas x 7 filas con el patrón:
  ```
  .XXXXXXX.
  XXXXXXXXX
  XX.XXX.XX
  XX.XXX.XX
  XXXXXXXXX
  .XX.X.XX.
  .XX.X.XX.
  ```
- Mismas reglas de bloque que el nivel 1 en los 3 niveles: 3 golpes de resistencia, mismos 6 colores, misma animación de rotura, mismo sonido, mismo tamaño de bloque (60x30 px) y misma velocidad de bola.
- Al elegir cualquier nivel directamente desde el menú: score se reinicia a 0 y vidas a 3.
- Al completar el Nivel 1 o el Nivel 2 (romper todos los bloques): se muestra la pantalla "¡Nivel X completado!" durante 3 segundos y luego continúa automáticamente al siguiente nivel, conservando el score y reiniciando las vidas a 3.
- Al completar el Nivel 3: se muestra la pantalla de victoria final ("¡Felicitaciones, ganaste!") existente, sin cambios.
- Game Over en cualquier nivel (2 o 3 incluidos) vuelve al menú de selección de nivel, igual que el comportamiento actual.
- Pausa funciona igual en los 3 niveles (sin cambios en `input.js`/lógica de pausa).

**Out of scope (for future specs):**

- Persistencia del nivel actual o progreso entre sesiones (localStorage).
- Selección por mouse/touch.
- Dificultad progresiva (velocidad de bola, resistencia de bloques) — los 3 niveles usan las mismas reglas, solo cambia el patrón de bloques.
- Más de 3 niveles o un sistema genérico de niveles ilimitados.
- Transición animada (fade, slide) entre niveles — la pantalla de transición es estática con temporizador.

---

## Data model

```js
// js/state.js

const LEVELS = [
  {
    id: 1,
    name: 'Nivel 1',
    pattern: [
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
      'XXXXXXXXX',
    ],
  },
  {
    id: 2,
    name: 'Nivel 2',
    pattern: [
      'XXXXXXXXX',
      '.XXXXXXX.',
      '..XXXXX..',
      '...XXX...',
      '....X....',
    ],
  },
  {
    id: 3,
    name: 'Nivel 3',
    pattern: [
      '.XXXXXXX.',
      'XXXXXXXXX',
      'XX.XXX.XX',
      'XX.XXX.XX',
      'XXXXXXXXX',
      '.XX.X.XX.',
      '.XX.X.XX.',
    ],
  },
];

// state (campos nuevos/modificados)
const state = {
  screen: 'menu', // 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameover' | 'win'
  currentLevel: 1,      // 1 | 2 | 3
  menuSelection: 0,      // índice 0-2 resaltado en el menú (Nivel 1/2/3)
  // score, lives, paddle, ball, blocks, blockAnimations: sin cambios de forma
};
```

Conventions:

- `generateBlocks(levelId)` reemplaza a `generateBlocks()`: recorre `LEVELS[levelId - 1].pattern` fila por fila, columna por columna; genera un bloque solo donde el carácter es `X` (`.` = celda vacía, sin bloque ni colisión). Reutiliza `CONFIG.grid.blockW/blockH/gap/marginTop` existentes para calcular `x`/`y`, igual que hoy.
- El ancho de grilla (9 columnas) es igual para los 3 niveles, así que `marginX` se calcula una sola vez con `cols = 9` (ya es el valor actual de `CONFIG.grid.cols`).
- `menuSelection` solo se usa para resaltar visualmente la opción actual en `renderMenu`; no persiste fuera de la sesión de juego.
- No se agrega versionado ni persistencia: `LEVELS`, `currentLevel` y `menuSelection` viven solo en memoria.

---

## Implementation plan

1. En `js/state.js`: definir `LEVELS` con los 3 patrones (ver Data model). Reemplazar `generateBlocks()` por `generateBlocks(levelId)`, que recorre `LEVELS[levelId - 1].pattern` fila por fila y columna por columna, creando un bloque solo donde el carácter es `X`. Agregar `state.currentLevel = 1` y `state.menuSelection = 0`. Actualizar la inicialización de `state.blocks` y `resetGame()` para usar `generateBlocks(state.currentLevel)`. Test manual: el juego sigue funcionando igual que antes (el Nivel 1 se ve idéntico, con los mismos bloques).

2. En `js/render.js`: reemplazar `renderMenu` para mostrar las 3 opciones "Nivel 1" / "Nivel 2" / "Nivel 3", resaltando visualmente la opción en `state.menuSelection` (ej. color distinto o prefijo `>`). Test manual: el menú muestra las 3 opciones; cambiar `menuSelection` manualmente en consola mueve el resaltado.

3. En `js/input.js`: en pantalla `'menu'`, reemplazar el handler de `Space`/click por: flechas arriba/abajo mueven `menuSelection` entre 0-2 (con clamp o wrap), y Enter/Espacio confirma — setea `currentLevel = menuSelection + 1`, `score = 0`, `lives = 3`, regenera `blocks` con `generateBlocks(currentLevel)`, resetea posición de paddle/bola, y pasa `screen` a `'playing'`. Eliminar el listener de click en canvas (fuera de alcance, sin soporte mouse). Test manual: las flechas mueven la selección y Enter/Espacio inicia el nivel elegido con el patrón de bloques correcto.

4. En `js/collisions.js`, dentro de `updateBlocks`: cuando todos los bloques están rotos, diferenciar — si `state.currentLevel < 3`, `screen = 'levelComplete'`; si `state.currentLevel === 3`, `screen = 'win'` (como hoy). Test manual: romper todos los bloques del Nivel 1 muestra `'levelComplete'` en vez de `'win'`; el Nivel 3 sigue mostrando `'win'`.

5. En `js/render.js`: agregar `renderLevelComplete` que muestra `"¡Nivel X completado!"` (usando `state.currentLevel`, el nivel recién terminado) con el mismo estilo que `renderGameOver`/`renderWin`. Conectar el caso `'levelComplete'` en `render()`. Test manual: al completar un nivel se ve el mensaje con el número correcto.

6. En `js/main.js`: agregar un temporizador para `'levelComplete'` (3 segundos, análogo a `END_SCREEN_DELAY` pero separado, ej. `LEVEL_COMPLETE_DELAY = 3`). Al cumplirse: `currentLevel++`, `lives = 3` (conservando `score`), regenerar `blocks` con `generateBlocks(currentLevel)`, resetear posición de paddle/bola, `screen = 'playing'`. Test manual: completar el Nivel 1 espera 3 segundos y continúa automáticamente al Nivel 2, con el score conservado y 3 vidas nuevas.

7. En `js/state.js`, verificar/ajustar `resetGame()` para que también reinicie `currentLevel = 1` y `menuSelection = 0` al volver al menú (Game Over o victoria final). Test manual: perder todas las vidas en el Nivel 2 o 3 vuelve al menú de selección de nivel, listo para elegir cualquier nivel de nuevo.

---

## Acceptance criteria

- [x] El menú inicial muestra 3 opciones: "Nivel 1", "Nivel 2", "Nivel 3".
- [x] Las flechas arriba/abajo mueven visualmente la selección entre las 3 opciones del menú.
- [x] Presionar Enter o Espacio en el menú inicia el nivel resaltado.
- [x] El Nivel 1 se ve y comporta exactamente igual que antes de esta spec (grilla completa 9x5).
- [x] El Nivel 2 muestra el patrón de pirámide invertida (9x5) exacto especificado.
- [x] El Nivel 3 muestra el patrón de calavera (9x7) exacto especificado.
- [x] Las celdas vacías del patrón de los niveles 2 y 3 no generan bloques ni colisionan con la bola.
- [x] Los 3 niveles usan las mismas reglas de bloque: 3 golpes de resistencia, mismos 6 colores, misma animación de rotura y mismo sonido.
- [x] Al elegir cualquier nivel directamente desde el menú, el score arranca en 0 y las vidas en 3.
- [x] Al romper todos los bloques del Nivel 1, se muestra "¡Nivel 1 completado!" durante 3 segundos y luego continúa automáticamente al Nivel 2.
- [x] Al romper todos los bloques del Nivel 2, se muestra "¡Nivel 2 completado!" durante 3 segundos y luego continúa automáticamente al Nivel 3.
- [x] Al pasar de un nivel a otro por progresión (1→2 o 2→3), el score se conserva y las vidas se reinician a 3.
- [x] Al romper todos los bloques del Nivel 3, se muestra la pantalla de victoria final ("¡Felicitaciones, ganaste!"), no la pantalla de "Nivel completado".
- [x] Perder todas las vidas en cualquier nivel (1, 2 o 3) muestra Game Over y luego vuelve al menú de selección de nivel.
- [x] La pausa (tecla P/Escape) sigue funcionando igual en los 3 niveles.
- [x] No se agregó ninguna dependencia externa ni soporte de mouse/touch.
- [x] El juego sigue cargando sin errores en la consola.

---

## Decisions

- **Sí:** menú con 3 opciones seleccionables por teclado (flechas + Enter/Espacio) en vez de un simple "Jugar". Permite acceso directo a cualquier nivel, tal como lo pidió el usuario, sin agregar soporte de mouse.
- **Sí:** los niveles 2 y 3 usan grillas de 9 columnas (igual que el Nivel 1 actual) y mismo tamaño de bloque (60x30px), solo cambiando qué celdas tienen bloque. Mantiene consistencia visual y evita recalcular tamaños de bloque por nivel.
- **Sí:** mismas reglas de dificultad en los 3 niveles (golpes, velocidad, colores). El usuario decidió explícitamente no escalar dificultad todavía; se puede evaluar en una spec futura.
- **Sí:** al elegir un nivel directamente desde el menú, siempre se resetea score a 0 y vidas a 3 — cada elección manual es una "partida nueva" independiente del historial previo.
- **Sí:** al progresar automáticamente entre niveles (no por elección manual), se conserva el score y se reinician las vidas a 3. Refleja la intención del usuario de que la dificultad de vidas no se acumule pero el puntaje sí represente el progreso total.
- **Sí:** transición "Nivel completado" con temporizador fijo de 3 segundos (sin input del jugador para continuar), análogo al patrón ya usado en `main.js` para game over/victoria (`END_SCREEN_DELAY`).
- **No:** persistencia de nivel/progreso vía localStorage. Fuera de alcance explícito, se evaluará en una spec futura.
- **No:** dificultad progresiva (velocidad de bola, resistencia de bloques). El usuario pidió explícitamente que solo cambie la forma.
- **No:** selección por mouse/click. Consistente con la decisión ya tomada en SPEC 01 de no soportar mouse/touch.

---

## Risks

| Riesgo | Mitigación |
|---|---|
| El Nivel 3 tiene 7 filas de bloques (vs. 5 del Nivel 1); con `marginTop: 60` y `blockH: 30`/`gap: 10`, la grilla ocupa hasta y=340, dejando margen suficiente antes de la posición de la bola/paddle (~y=746-800). Igual conviene verificar visualmente que no se vea apretado contra el HUD superior. | Validar manualmente al implementar el paso 1 que ninguna fila se superpone con el HUD (score/vidas dibujados en y=10-30). |
| Si el jugador mantiene presionada una flecha en el menú, `menuSelection` podría cambiar varias veces por frame sin debounce, sintiéndose "acelerado". | Aceptado como riesgo menor: igual que el resto del input del juego (sin debounce en ningún otro lado), es un menú de solo 3 opciones así que el efecto es mínimo. |
| Si el jugador presiona Enter/Espacio muy rápido después de que empieza `'levelComplete'`, no debería poder saltarse la espera de 3 segundos (el temporizador es automático, no depende de input). | El paso 6 no agrega ningún listener de input para `'levelComplete'`; el único disparador de la transición es el `dt` acumulado en `main.js`. |
