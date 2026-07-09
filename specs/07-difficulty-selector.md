# SPEC 07 — Selector de dificultad

> **Status:** Aprobado
> **Depends on:** SPEC 05, SPEC 06
> **Date:** 2026-07-09
> **Objective:** Agregar una pantalla de selección de dificultad (Fácil/Normal/Difícil) entre el menú principal y la selección de nivel, que ajusta la resistencia de los bloques, la velocidad de la bola y si las vidas se reinician al progresar de nivel.

---

## Scope

**In:**

- Pantalla nueva **`difficultySelect`**, insertada en el flujo entre el menú principal y la selección de nivel: `menu` → (elegir "Jugar") → `difficultySelect` → (elegir dificultad) → `levelSelect` → `playing`.
- `difficultySelect` muestra 4 ítems navegables con flechas + Enter: **"Fácil"**, **"Normal"**, **"Difícil"**, **"Volver"**. Misma animación de zoom e input lag que el resto de pantallas de menú.
- "Volver" (o Escape) en `difficultySelect` regresa a `menu`. "Volver" (o Escape) en `levelSelect` regresa a `difficultySelect` (en vez de a `menu` como hoy).
- La dificultad elegida se guarda en `state.difficulty` en memoria (no persiste entre sesiones) y se recuerda durante la sesión: al reabrir `difficultySelect`, el cursor arranca resaltando la última dificultad elegida (por defecto "Normal" al cargar la página).
- Elegir una dificultad no inicia la partida — solo fija `state.difficulty` y avanza a `levelSelect`, igual que hoy se elige el nivel ahí.
- **Fácil:** los bloques se rompen con 1 golpe (en vez de 3) y la bola va un 25% más lenta (285 px/s en vez de 380 px/s).
- **Normal:** sin cambios respecto al comportamiento actual — bloques de 3 golpes, bola a 380 px/s, vidas se reinician a 3 en cada progresión de nivel (1→2→3).
- **Difícil:** los bloques mantienen 3 golpes, la bola va un 25% más rápido (475 px/s), y las vidas **no** se reinician al progresar de nivel (1→2→3) — solo se resetean a 3 al elegir un nivel manualmente desde `levelSelect` (nueva partida) o tras un Game Over.
- La animación de rotura de bloques en Fácil reproduce la secuencia completa de frames existente (-1→1→4→10) en rápida sucesión al recibir el único golpe, reutilizando la lógica de animación actual sin crear una nueva.
- La dificultad activa (`state.difficulty`) se usa tanto para partidas iniciadas manualmente como para toda la progresión subsiguiente de esa partida (no cambia a mitad de partida).

**Out of scope (para specs futuras):**

- Persistencia de la dificultad elegida entre sesiones (localStorage).
- Cambiar la dificultad desde Opciones o en caliente durante una partida en curso/pausada.
- Indicador visual de la dificultad activa durante el HUD de juego (`playing`).
- Ajustar el patrón de bloques, cantidad de vidas iniciales, o puntaje otorgado por dificultad — solo cambian resistencia de bloques, velocidad de bola y reinicio de vidas entre niveles.
- Selección por mouse/touch (consistente con specs anteriores).

---

## Data model

```js
// js/state.js

export const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Fácil',
    blockHits: 1,
    ballSpeed: 285, // 380 * 0.75
    resetLivesOnProgress: true,
  },
  {
    id: 'normal',
    name: 'Normal',
    blockHits: 3,
    ballSpeed: 380,
    resetLivesOnProgress: true,
  },
  {
    id: 'hard',
    name: 'Difícil',
    blockHits: 3,
    ballSpeed: 475, // 380 * 1.25
    resetLivesOnProgress: false,
  },
];

// state (campos nuevos)
const state = {
  screen: 'menu', // 'menu' | 'difficultySelect' | 'levelSelect' | 'playing' | 'paused' | 'options' | 'levelComplete' | 'gameover' | 'win'
  difficulty: 'normal', // 'easy' | 'normal' | 'hard' — vive en memoria, no persiste
  // currentLevel, menuSelection, score, lives, paddle, ball, blocks, blockAnimations: sin cambios de forma
};
```

Conventions:

- `DIFFICULTIES` sigue el mismo patrón que `LEVELS` en `js/levels.js` (arreglo de objetos con `id`/`name` + parámetros). Se define en un archivo nuevo `js/difficulties.js`, análogo a `js/levels.js`.
- `CONFIG.ball.speed` (en `state.js`) deja de ser el único valor de velocidad; en su lugar, `updateBall`/`resetRound`/`resetGame` leen la velocidad desde `DIFFICULTIES.find(d => d.id === state.difficulty).ballSpeed`.
- El umbral de golpes para romper un bloque (hoy hardcodeado en `3` dentro de `updateBlocks`) pasa a leerse de `DIFFICULTIES.find(d => d.id === state.difficulty).blockHits`.
- `menuItemCount('difficultySelect')` → 4 (Fácil, Normal, Difícil, Volver).
- No se agrega versionado ni persistencia: `state.difficulty` vive solo en memoria, igual que `currentLevel`.

---

## Implementation plan

1. **`js/difficulties.js` (nuevo)** — definir y exportar `DIFFICULTIES` con los 3 objetos (`easy`, `normal`, `hard`) según el Data model. Test: el archivo se importa sin errores (no cambia comportamiento todavía).

2. **`js/state.js`** — importar `DIFFICULTIES`. Agregar `state.difficulty = 'normal'`. Agregar `'difficultySelect'` a `menuItemCount` (→ 4) y al comentario del tipo de `screen`. Reemplazar los usos de `CONFIG.ball.speed` en la inicialización de `state.ball` por la velocidad de la dificultad activa (`DIFFICULTIES.find(d => d.id === state.difficulty).ballSpeed`), con un helper `getDifficulty()` que retorna el objeto de dificultad activa. Test: el juego arranca igual que antes (dificultad por defecto `normal` = mismo comportamiento).

3. **`js/render.js`** — agregar `renderDifficultySelect` (mismo patrón visual/zoom que `renderLevelSelect`) que dibuja "Fácil", "Normal", "Difícil", "Volver", resaltando `state.difficulty` al entrar. Conectar `'difficultySelect'` en `render()`. Test: la pantalla se ve y el resaltado sigue `menuSelection` moviéndolo desde consola.

4. **`js/input.js`** — reescribir la navegación:
   - `menu`: "Jugar" ahora lleva a `difficultySelect` (con `resetMenu(4)`, cursor inicial en el índice de `state.difficulty` actual) en vez de a `levelSelect` directamente.
   - `difficultySelect` (nuevo): flechas + Enter sobre 4 ítems; Enter en Fácil/Normal/Difícil setea `state.difficulty` y pasa a `levelSelect` (`resetMenu` con el tamaño de `levelSelect`); Enter en "Volver" o Escape regresa a `menu` (`resetMenu(2)`).
   - `levelSelect`: "Volver"/Escape ahora regresan a `difficultySelect` (`resetMenu(4)`) en vez de a `menu`.
   Test: recorrer manualmente menu → Jugar → difficultySelect → elegir Difícil → levelSelect → Volver (vuelve a difficultySelect, no a menu) → Volver (vuelve a menu).

5. **`js/collisions.js`** — en `updateBlocks`, reemplazar el `3` hardcodeado en `block.hits >= 3` por `getDifficulty().blockHits`. Ajustar la rama de animación: si `blockHits === 1`, el primer (y único) golpe dispara directamente la secuencia completa `-1 → 10` (reutilizando `startBlockAnimation` con `fromFrame: -1, toFrame: 10`) y rompe el bloque; si `blockHits === 3`, mantiene la lógica actual de 3 tramos. Test: en Fácil, un bloque se rompe con el primer golpe mostrando la animación completa; en Normal/Difícil, sigue rompiéndose al 3er golpe como hoy.

6. **`js/collisions.js`** — en `updateBall`, cuando `ball.y > CONFIG.canvas.h` (vida perdida) y en cualquier punto donde se reinicia la velocidad de la bola (`resetRound`, inicio de nivel), usar `getDifficulty().ballSpeed` en vez de `CONFIG.ball.speed`. Test: en Fácil la bola se mueve visiblemente más lento (285px/s), en Difícil más rápido (475px/s), en Normal igual que antes.

7. **`js/main.js`** — en la transición automática de `levelComplete` a siguiente nivel, reemplazar `state.lives = 3` incondicional por: `if (getDifficulty().resetLivesOnProgress) state.lives = 3;`. Test: completar un nivel en Difícil conserva las vidas actuales al pasar al siguiente nivel; en Fácil/Normal se siguen reiniciando a 3.

8. **`js/state.js`** — en `resetGame()`, mantener el reinicio de `lives = 3` sin condicionar por dificultad (elegir nivel manualmente desde `levelSelect` siempre arranca partida nueva con 3 vidas, sin importar la dificultad). No resetear `state.difficulty` en `resetGame()` (debe sobrevivir a Game Over/Salir dentro de la misma sesión). Test: perder todas las vidas en Difícil vuelve a `levelSelect` con 3 vidas disponibles para la siguiente partida, conservando la dificultad elegida.

9. **Verificación integral** — servir el proyecto y recorrer: menú → Jugar → difficultySelect → Fácil → romper un bloque con un solo golpe y confirmar velocidad de bola reducida → completar nivel (vidas se reinician) → Salir → Jugar → difficultySelect (cursor en Fácil) → Difícil → jugar, perder una vida, completar nivel y confirmar que las vidas NO se reinician → Game Over → confirma que vuelve a levelSelect con 3 vidas disponibles. Confirmar sin errores en consola.

---

## Acceptance criteria

- [ ] Al elegir "Jugar" desde el menú principal, se muestra la pantalla `difficultySelect` con "Fácil", "Normal", "Difícil" y "Volver".
- [ ] Elegir una dificultad (Enter) avanza a `levelSelect` sin iniciar la partida todavía.
- [ ] "Volver" (o Escape) en `difficultySelect` regresa al menú principal.
- [ ] "Volver" (o Escape) en `levelSelect` regresa a `difficultySelect`, no directo al menú principal.
- [ ] Al reabrir `difficultySelect` en la misma sesión, el cursor resalta la última dificultad elegida.
- [ ] En Fácil, cada bloque se rompe con un solo golpe, mostrando la animación completa de rotura.
- [ ] En Fácil, la bola se mueve a 285 px/s (25% más lenta que Normal).
- [ ] En Normal, el comportamiento es idéntico al actual: bloques de 3 golpes, bola a 380 px/s, vidas reiniciadas a 3 en cada progresión de nivel.
- [ ] En Difícil, los bloques siguen requiriendo 3 golpes.
- [ ] En Difícil, la bola se mueve a 475 px/s (25% más rápida que Normal).
- [ ] En Difícil, al progresar automáticamente de un nivel a otro (1→2→3), las vidas NO se reinician a 3 — se conservan las vidas actuales.
- [ ] En cualquier dificultad, elegir un nivel manualmente desde `levelSelect` siempre arranca con 3 vidas y score 0.
- [ ] En cualquier dificultad, un Game Over vuelve a `levelSelect` y deja la dificultad elegida sin cambios para la siguiente partida.
- [ ] No se agrega persistencia de dificultad entre sesiones ni soporte de mouse/touch.
- [ ] El juego carga y se navega sin errores en la consola.

---

## Decisions

- **Sí:** pantalla nueva `difficultySelect` insertada entre `menu` y `levelSelect`, en vez de un ítem más dentro de Opciones. Mantiene la dificultad como parte del flujo de "iniciar partida" (se elige junto con el nivel), no como una preferencia persistente de configuración.
- **Sí:** "Volver" en `levelSelect` pasa a regresar a `difficultySelect` en vez de a `menu`, para mantener la simetría de "un Volver por pantalla" ya usada en SPEC 06.
- **Sí:** `state.difficulty` vive en memoria y se recuerda durante la sesión (no se resetea en `resetGame()`), igual que `currentLevel`, para no obligar al jugador a re-elegir dificultad tras cada partida.
- **Sí:** velocidad de bola ±25% (Fácil 285px/s, Difícil 475px/s) sobre la base de 380px/s, por decisión explícita del usuario.
- **Sí:** en Fácil, un bloque roto con 1 golpe reproduce la secuencia completa de animación existente (-1→1→4→10) en vez de una animación nueva simplificada, para no duplicar lógica de animación.
- **Sí:** en Difícil, las vidas no se reinician solo en la progresión automática entre niveles (1→2→3); elegir un nivel manualmente desde `levelSelect` siempre resetea a 3 vidas, porque cada elección manual ya se trata como "partida nueva" según SPEC 05.
- **No:** persistencia de la dificultad entre sesiones (localStorage). Descartado explícitamente por el usuario.
- **No:** cambiar la dificultad desde Opciones o en caliente durante una partida en curso. Descartado explícitamente por el usuario — la dificultad solo se fija al iniciar partida desde `difficultySelect`.
- **No:** indicador visual de dificultad activa en el HUD durante `playing`. Fuera de alcance, se puede evaluar en una spec futura.
- **No:** ajustar puntaje, vidas iniciales o patrones de bloques por dificultad — solo golpes de bloque, velocidad de bola y reinicio de vidas entre niveles, según lo pedido.

---

## Risks

| Riesgo | Mitigación |
|---|---|
| Cambiar el umbral de golpes (`blockHits`) dinámicamente podría romper la lógica de animación existente si algún bloque queda con `hits` entre 1 y 2 al cambiar de dificultad a mitad de partida. | No aplica en la práctica: `state.difficulty` solo se lee al iniciar/regenerar bloques (paso 5 y 6 del plan) y no cambia durante una partida en curso (fuera de alcance de esta spec), así que todos los bloques de una partida usan el mismo `blockHits`. |
| Olvidar reemplazar algún uso residual de `CONFIG.ball.speed` (por ejemplo en `resetRound` o al reanudar tras perder una vida) dejaría la bola siempre a velocidad Normal en Fácil/Difícil. | El paso 6 del plan lista explícitamente todos los puntos donde se asigna velocidad a la bola (`resetRound`, inicio de nivel) para revisarlos todos en la misma pasada. |
| Con `resetLivesOnProgress: false` en Difícil, si el jugador llega a 0 o negativo justo al completar el último bloque de un nivel (antes de la pantalla `levelComplete`), podría generarse una secuencia confusa de Game Over vs. avance de nivel. | No es un caso nuevo: hoy ya se resuelve por orden de evaluación en `updateBlocks`/`updateBall` (perder la vida ocurre en la caída de la bola, romper el último bloque dispara `levelComplete` antes de que la bola pueda caer); no se modifica ese orden en esta spec. |
