# SPEC 03 — Ajuste de frames de daño progresivo en bloques

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-07-09
> **Objective:** Reemplazar los frames de grieta/explosión usados en SPEC 02 por un rango más amplio de columnas del spritesheet (col 1→3 en golpe 1, col 3→6 en golpe 2, col 6→12 en golpe 3), con una animación más lenta (300 ms), para que el daño progresivo se vea más gradual y con más pasos intermedios.

---

## Scope

**In:**

- Ampliar `EXPLOSION_FRAMES` en `assets/spritesheet.js` para los colores `red`, `cyan`, `green`, `magenta`, `yellow`, `hotpink`: de 4 frames (columnas 8-11) a 11 frames (columnas 2 a 12), reutilizando el mismo `sy` por color ya definido.
- Golpe 1: la animación transiciona desde el sprite normal (columna 1, ya existente en `SPRITES.blocks`) hasta la columna 3, quedando asentada ahí.
- Golpe 2: la animación transiciona desde la columna 3 hasta la columna 6, quedando asentada ahí.
- Golpe 3 (rotura): marca el bloque como `broken = true` de inmediato (deja de colisionar) y anima desde la columna 6 hasta la columna 12; al terminar, el bloque deja de dibujarse.
- Aumentar `EXPLOSION_DURATION` de 150 ms a 300 ms (aplica a los 3 golpes por igual).
- Mantener toda la lógica de animación ya existente de SPEC 02 (`blockAnimations`, `startBlockAnimation`, `updateBlockAnimations`, interpolación por tiempo, reemplazo de animación si llega un golpe nuevo antes de que termine la anterior).

**Out of scope (for future specs):**

- El bloque `gray`: sigue reutilizando la fila de `red` tal cual quedó en SPEC 02. Definir si necesita su propio frame o rango de columnas queda pendiente para una spec futura.
- Efectos de sonido.
- Animaciones para el paddle o la bola.
- Cualquier cambio a la lógica de puntaje, vidas o condición de victoria.

---

## Data model

```js
// assets/spritesheet.js

const EXPLOSION_FRAMES = {
  // Cada color pasa de 4 a 11 frames (columnas 2 a 12 del spritesheet).
  // sw/sh se mantienen en 32x16, igual que el resto de columnas.
  red:     [ {sx:64,sy:176,sw:32,sh:16}, {sx:96,sy:176,sw:32,sh:16}, {sx:128,sy:176,sw:32,sh:16}, {sx:160,sy:176,sw:32,sh:16}, {sx:192,sy:176,sw:32,sh:16}, {sx:224,sy:176,sw:32,sh:16}, {sx:256,sy:176,sw:32,sh:16}, {sx:288,sy:176,sw:32,sh:16}, {sx:320,sy:176,sw:32,sh:16}, {sx:352,sy:176,sw:32,sh:16}, {sx:384,sy:176,sw:32,sh:16} ],
  cyan:    [ /* misma progresión de columnas, sy=192 */ ],
  green:   [ /* misma progresión de columnas, sy=208 */ ],
  magenta: [ /* misma progresión de columnas, sy=224 */ ],
  yellow:  [ /* misma progresión de columnas, sy=240 */ ],
  hotpink: [ /* misma progresión de columnas, sy=256 */ ],
  gray:    [ /* sin decisión propia: copia exacta del array de `red` (igual que hoy), para no romper el indexado */ ],
};

const EXPLOSION_DURATION = 300; // antes 150
```

```js
// js/collisions.js — nuevos fromFrame/toFrame en updateBlocks()
// Índice de array: col2=0, col3=1, col4=2, col5=3, col6=4, col7=5, col8=6, col9=7, col10=8, col11=9, col12=10

// Golpe 1: -1 (sprite normal, col1) → 1 (col3)
// Golpe 2:  1 (col3)                → 4 (col6)
// Golpe 3:  4 (col6)                → 10 (col12), removeOnEnd = true
```

Conventions:

- `block.crackFrame` sigue siendo `-1` (sprite normal) o un índice `0-10` en `EXPLOSION_FRAMES[color]` (antes era `0-3`).
- La fórmula de interpolación por tiempo de SPEC 02 no cambia (`frameIndex = fromFrame + Math.floor((elapsed / EXPLOSION_DURATION) * (toFrame - fromFrame + 1))`), solo cambian los valores de `fromFrame`/`toFrame` y la duración.

---

## Implementation plan

1. En `assets/spritesheet.js`, reemplazar `EXPLOSION_FRAMES` (ampliar de 4 a 11 entradas por color, columnas 2 a 12) y actualizar `EXPLOSION_DURATION` de 150 a 300. El bloque `gray` copia exactamente las coordenadas de `red`. Test manual: el juego carga sin errores en consola (el array más grande no rompe nada porque `crackFrame` empieza en -1).
2. En `js/collisions.js`, actualizar los `fromFrame`/`toFrame` pasados a `startBlockAnimation` dentro de `updateBlocks`: golpe 1 `-1→1`, golpe 2 `1→4`, golpe 3 `4→10` (con `removeOnEnd=true`, marcando `block.broken=true` de inmediato como ya hace SPEC 02). Test manual: al golpear un bloque una vez, la animación recorre columnas 1→2→3 y queda asentada en columna 3; el score sigue sumando igual (+10 por golpe, +100 al romperse).
3. Verificación visual completa en el juego: golpear un mismo bloque 3 veces seguidas y confirmar que la progresión coincide con las 3 imágenes de referencia (grieta leve → grieta densa → dispersión total) y que el bloque desaparece al final. Probar también con un bloque `gray` para confirmar que sigue rompiéndose sin errores (aunque visualmente siga usando los frames de `red`).

---

## Acceptance criteria

- [ ] Al recibir el golpe 1, el bloque anima desde el sprite normal (columna 1) hasta la columna 3 del spritesheet, en 300 ms, quedando asentado ahí.
- [ ] Al recibir el golpe 2, el bloque anima desde la columna 3 hasta la columna 6, en 300 ms, quedando asentado ahí.
- [ ] Al recibir el golpe 3, el bloque deja de colisionar inmediatamente (`broken = true`) y anima desde la columna 6 hasta la columna 12, en 300 ms.
- [ ] Al terminar la animación del golpe 3, el bloque deja de dibujarse por completo.
- [ ] La progresión visual coincide con las 3 imágenes de referencia provistas por el usuario (grieta leve, grieta densa, dispersión total).
- [ ] Un bloque `gray` se sigue rompiendo correctamente en 3 golpes sin errores, reutilizando los frames de `red` (sin cambio de comportamiento respecto a SPEC 02).
- [ ] El score sigue sumando exactamente igual que en SPEC 01/02 (+10 por golpe, +100 adicional al romperse).
- [ ] Si un bloque recibe un nuevo golpe mientras su animación anterior aún está en curso, la animación previa se reemplaza por la nueva sin quedar en un estado inconsistente.
- [ ] Varios bloques pueden animarse en simultáneo sin interferir entre sí.
- [ ] No se agregó ninguna dependencia externa.
- [ ] El juego sigue cargando sin errores en la consola.

---

## Decisions

- **Sí:** ampliar `EXPLOSION_FRAMES` de 4 a 11 frames por color (columnas 2 a 12), en vez de mantener el rango acotado de SPEC 02. El usuario identificó que las columnas usadas antes (8-11) ya arrancaban con el bloque muy fragmentado, sin aprovechar las columnas de grieta leve/densa que sí están en el spritesheet.
- **Sí:** modificar `assets/spritesheet.js` en esta spec, revirtiendo la decisión de SPEC 02 de no tocar ese archivo. La ampliación de frames requiere agregar coordenadas nuevas ahí.
- **Sí:** aumentar `EXPLOSION_DURATION` de 150 ms a 300 ms para los 3 golpes por igual. El golpe 3 ahora recorre 6 columnas (antes 2), y el usuario prefirió una transición más lenta y notoria en los tres golpes en vez de solo alargar el golpe 3.
- **No:** resolver el frame propio del bloque `gray` en esta spec. Sigue reutilizando exactamente las coordenadas de `red` (mismo comportamiento que SPEC 02). Queda pendiente para una spec futura decidir si necesita su propia fila de frames.
- **Sí:** mantener sin cambios toda la maquinaria de animación de SPEC 02 (`blockAnimations`, `startBlockAnimation`, `updateBlockAnimations`, la fórmula de interpolación). Solo cambian los valores de `fromFrame`/`toFrame`/duración, no la arquitectura.

---

## Risks

| Riesgo | Mitigación |
|---|---|
| Las coordenadas exactas de columnas 2-12 para los colores `cyan`, `green`, `magenta`, `yellow`, `hotpink` no fueron verificadas visualmente una por una (solo se inspeccionó la fila `red`). Podrían no verse bien en algún color puntual. | Verificar visualmente cada color durante el paso 3 del plan; si algún color se ve mal, se reporta como bug separado sin bloquear el resto. |
| Extender `EXPLOSION_FRAMES` de 4 a 11 entradas por color es un cambio de datos manual y propenso a error de tipeo en coordenadas `sx`. | Los `sx` siguen el patrón `columna * 32`, fácil de verificar por inspección antes de probar en el juego. |
