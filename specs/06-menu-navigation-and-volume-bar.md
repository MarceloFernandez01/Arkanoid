# SPEC 06 — Navegación de menús y barra de volumen

> **Status:** Implementado
> **Depends on:** SPEC 04, SPEC 05
> **Date:** 2026-07-09
> **Objective:** Reestructurar la navegación en menú principal (Jugar/Opciones) + pantalla de selección de nivel, convertir la pantalla de Opciones y el menú de pausa en listas navegables con flechas/Enter, y mostrar el volumen como una barra continua que se llena y se vacía.

---

## Scope

**In:**

- **Menú principal (`menu`)**: reemplaza la lista de niveles por 2 ítems seleccionables: **"Jugar"** y **"Opciones"**. Flechas arriba/abajo mueven el cursor, Enter/Espacio confirma. Conserva la animación de zoom y el input lag existentes.
  - "Jugar" → pantalla de selección de nivel (`levelSelect`).
  - "Opciones" → pantalla de opciones (`options`), con retorno al menú principal.
- **Selección de nivel (`levelSelect`, pantalla nueva)**: lista con "Nivel 1", "Nivel 2", "Nivel 3" y un ítem **"Volver"** al final. Flechas + Enter. Niveles 1-3 inician la partida (misma lógica que hoy: score 0, vidas 3). "Volver" (o Escape) regresa al menú principal. Misma animación de zoom/input lag.
- **Opciones (`options`) como lista navegable**: 2 ítems — **"Volumen"** y **"Volver"**. Flechas arriba/abajo mueven entre ítems; con "Volumen" resaltado, flechas izquierda/derecha ajustan el volumen (paso 0.1, clamp 0-1). Enter/Escape sobre "Volver" regresa a `optionsReturnScreen`. El volumen se muestra como **barra continua** cuyo relleno crece/decrece proporcional a `state.volume`.
- **Pausa (`paused`) como menú navegable**: 3 ítems — **"Continuar"**, **"Opciones"**, **"Salir"** — dibujados sobre el overlay actual. Flechas + Enter:
  - "Continuar" → vuelve a `playing`.
  - "Opciones" → `options` con retorno a `paused`.
  - "Salir" → abandona la partida y vuelve al menú principal (`resetGame()`).
  - P/Escape siguen funcionando como atajo directo para reanudar.
- La barra de volumen usa relleno continuo tanto en la pantalla de Opciones invocada desde el menú principal como desde pausa (misma pantalla `options`).

**Out of scope:**

- Persistencia de volumen o de la última pantalla entre sesiones (localStorage).
- Selección por mouse/touch.
- Nuevos controles configurables además del volumen (sensibilidad, teclas, etc.).
- Transiciones animadas (fade/slide) entre pantallas de menú.
- Cambios en la jugabilidad, física, niveles o progresión de SPEC 05.

---

## Data model

```js
// js/state.js — campos de estado (modificados/nuevos)
const state = {
  screen: 'menu', // 'menu' | 'levelSelect' | 'options' | 'playing' | 'paused' | 'levelComplete' | 'gameover' | 'win'
  menuSelection: 0,     // cursor del menú activo; se resetea al entrar a cada pantalla de menú
  menuScales: [1, 1],   // escalas de zoom por ítem del menú activo; se redimensiona por pantalla
  menuInputCooldown: 0, // sin cambios (input lag de flechas)
  optionsReturnScreen: 'menu', // 'menu' | 'paused' (sin cambios de forma)
  volume: 1,            // sin cambios
  // ... resto sin cambios
};
```

Conventions:

- `menuSelection` / `menuScales` son **compartidos** por todas las pantallas tipo menú (`menu`, `levelSelect`, `options`, `paused`). Al entrar a cualquiera de ellas se llama un helper `resetMenu(count)` que setea `menuSelection = 0`, `menuScales` a un array de `count` unos y `menuInputCooldown = 0`.
- La cantidad de ítems por pantalla se define en un helper `menuItemCount(screen)`:
  - `menu` → 2 (`Jugar`, `Opciones`)
  - `levelSelect` → `LEVELS.length + 1` (niveles + `Volver`)
  - `options` → 2 (`Volumen`, `Volver`)
  - `paused` → 3 (`Continuar`, `Opciones`, `Salir`)
- No se agrega persistencia ni versionado: todo vive en memoria, igual que SPEC 05.

---

## Implementation plan

1. **`js/state.js`** — cambiar `screen` inicial/comentario para incluir `'levelSelect'`. Inicializar `menuScales` a `[1, 1]` (menú principal de 2 ítems). Agregar helper `resetMenu(count)` (setea `menuSelection`, `menuScales`, `menuInputCooldown`) y `menuItemCount(screen)`. Ajustar `resetGame()` para dejar el menú principal listo (`screen='menu'`, `resetMenu(2)`). Test: el juego arranca en el menú principal sin errores.

2. **`js/render.js`** — dividir el render de menús:
   - `renderMenu`: dibuja "Jugar" y "Opciones" con el resaltado/zoom actual.
   - `renderLevelSelect` (nuevo): dibuja "Nivel 1/2/3" + "Volver" (la lógica de zoom actual de `renderMenu`).
   - `renderOptions`: título + ítems "Volumen" y "Volver" resaltables; bajo "Volumen", una **barra continua** (rect de borde + rect de relleno con ancho `volume * barWidth`); pista de controles.
   - `renderPauseOverlay`: mantiene el overlay y agrega la lista navegable "Continuar / Opciones / Salir" con resaltado/zoom.
   - Conectar `'levelSelect'` en `render()`.
   Test: cada pantalla se ve correcta moviendo `menuSelection`/`volume` desde consola.

3. **`js/input.js`** — reescribir el manejo de teclado por pantalla:
   - `menu`: flechas mueven (2 ítems), Enter → `levelSelect` (con `resetMenu`) u `options` (`optionsReturnScreen='menu'`, `resetMenu`).
   - `levelSelect`: flechas (4 ítems); Enter en 0-2 → `startLevel`; Enter en "Volver" o Escape → `menu` (`resetMenu(2)`).
   - `options`: flechas arriba/abajo (2 ítems); con índice "Volumen", izquierda/derecha ajustan `volume`; Enter en "Volver"/Escape → `optionsReturnScreen` (con `resetMenu` a la pantalla destino).
   - `paused`: flechas (3 ítems); Enter → Continuar (`playing`) / Opciones (`options`, retorno `paused`) / Salir (`resetGame`); P/Escape → `playing`.
   - `updateMenu` generaliza a cualquier pantalla de menú usando `menuItemCount(state.screen)`.
   Test: navegación completa entre todas las pantallas con flechas + Enter; el volumen sube/baja con izq/der.

4. **Verificación integral** — servir el proyecto (`python -m http.server`) y recorrer: menú principal → Jugar → elegir nivel y jugar; menú principal → Opciones → subir/bajar barra → Volver; pausa dentro de partida → Opciones → Volver → Continuar → Salir. Confirmar que no hay errores en consola y que el sonido respeta el volumen ajustado.

---

## Acceptance criteria

- [x] El menú principal muestra exactamente 2 ítems: "Jugar" y "Opciones", navegables con flechas y confirmables con Enter/Espacio.
- [x] "Jugar" abre una pantalla de selección con "Nivel 1", "Nivel 2", "Nivel 3" y "Volver".
- [x] Elegir un nivel inicia la partida con score 0 y 3 vidas (igual que SPEC 05).
- [x] "Volver" en selección de nivel (o Escape) regresa al menú principal.
- [x] "Opciones" (desde menú principal o pausa) abre una lista navegable con "Volumen" y "Volver".
- [x] Con "Volumen" resaltado, las flechas izquierda/derecha suben/bajan el volumen entre 0 y 100% en pasos de 10%.
- [x] El volumen se dibuja como una barra continua cuyo relleno refleja proporcionalmente el nivel actual.
- [x] "Volver" en Opciones regresa a la pantalla desde donde se abrió (menú principal o pausa).
- [x] El menú de pausa muestra "Continuar", "Opciones" y "Salir", navegables con flechas + Enter.
- [x] "Continuar" reanuda la partida; "Salir" vuelve al menú principal reseteando la partida.
- [x] P/Escape en pausa siguen reanudando directamente.
- [x] Los efectos de sonido respetan el volumen ajustado en la barra.
- [x] Se conserva la animación de zoom y el input lag en todas las pantallas de menú.
- [x] No se agregan dependencias externas ni soporte de mouse/touch; el juego carga sin errores en consola.

---

## Decisions

- **Sí:** navegación en dos niveles (menú principal Jugar/Opciones → selección de nivel) en vez de listar niveles en el menú raíz, para separar "empezar a jugar" de "configurar".
- **Sí:** "Volver" como ítem explícito en selección de nivel (además de Escape), por pedido del usuario, para descubribilidad sin depender de conocer la tecla.
- **Sí:** Opciones como lista navegable (Volumen + Volver) aunque hoy solo tenga un control, para que escale a futuras opciones sin rediseñar la pantalla.
- **Sí:** barra de volumen continua (relleno proporcional) en vez de segmentada, por preferencia del usuario.
- **Sí:** pausa con "Continuar / Opciones / Salir" navegable; se elimina la invocación por tecla `O`. Se mantienen P/Escape como atajo de reanudar por conveniencia.
- **Sí:** `menuSelection`/`menuScales` compartidos entre pantallas de menú, reseteados en cada transición, para no multiplicar campos de estado.
- **No:** persistencia de volumen entre sesiones (fuera de alcance, posible spec futura).
- **No:** selección por mouse/touch (consistente con SPEC 01/05).

---

## Risks

| Riesgo | Mitigación |
|---|---|
| Compartir `menuSelection`/`menuScales` entre pantallas puede dejar un cursor "heredado" si alguna transición no llama `resetMenu`. | Centralizar toda transición a pantalla de menú a través de `resetMenu(count)` y verificar cada rama de `input.js` en el test del paso 3. |
| El overlay de pausa navegable podría tapar la partida de fondo de forma confusa. | Mantener el overlay semitransparente actual y solo superponer la lista; validar legibilidad en el paso 2. |
| Con "Volumen" no resaltado, izquierda/derecha no deben hacer nada (evitar ajustar volumen desde otro ítem). | El handler de `options` solo ajusta volumen cuando `menuSelection` apunta a "Volumen". |
