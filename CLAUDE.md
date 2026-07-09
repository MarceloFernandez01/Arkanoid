# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Este es un juego de Arkanoid completo (ya no un MVP) con HTML, CSS y JavaScript **sin dependencias externas**. Specs implementadas hasta el momento:

- `specs/01-arkanoid-mvp.md` (`Implementado`): un solo nivel jugable con menú, HUD de score/vidas, Game Over, victoria y pausa.
- `specs/02-block-destruction-animation.md` (`Implementado`): animación de destrucción de bloques usando los frames de explosión del spritesheet.
- `specs/03-block-damage-frames-adjustment.md` (`Implementado`): ajuste de los frames de daño progresivo en bloques (11 columnas) para una animación más fluida.
- `specs/04-sound-effects.md` (`Implementado`): sonido de rebote y de rotura de bloques vía `js/sound.js`.
- `specs/05-level-selection-and-progression.md` (`Implementado`): niveles 2 y 3, menú de selección por teclado y progresión automática entre niveles conservando el puntaje.
- `specs/06-menu-navigation-and-volume-bar.md` (`Implementado`): menú principal con "Jugar"/"Opciones", pantalla `levelSelect` separada, Opciones y pausa convertidas en listas navegables (flechas + Enter), barra de volumen continua (`resetMenu`/`menuItemCount` en `js/state.js`).

Además, fuera del flujo spec-driven (a pedido puntual) se agregó un cuarto nivel en `js/levels.js`, y sobre el menú de selección de nivel una animación de zoom en el ítem resaltado y un pequeño input lag (~150ms) entre pulsaciones de flecha para evitar saltos de más de un nivel por ráfaga de teclas — ver `MENU_SELECTED_SCALE`, `MENU_ZOOM_SPEED` y `MENU_INPUT_LAG` en `js/input.js`.

Estructura actual:

- `index.html`, `style.css` — canvas 1000x800 y estilos.
- `js/state.js` — estado global (`state`), constantes de configuración (`CONFIG`), generación de bloques por nivel (`generateBlocks`) y helpers de menú compartidos (`resetMenu`, `menuItemCount`).
- `js/levels.js` — definición de los 4 niveles (`LEVELS`: `id`, `name`, `pattern`).
- `js/render.js` — dibujo de cada pantalla según `state.screen` (`menu`, `levelSelect`, `options`, `paused`, etc.), incluida la animación de zoom del menú y la barra continua de volumen.
- `js/input.js` — teclado (movimiento del paddle, navegación por flechas/Enter en todas las pantallas de menú con zoom e input lag, ajuste de volumen, iniciar partida).
- `js/collisions.js` — física de la bola, colisiones con paddle/bloques, vidas, condición de victoria/avance de nivel y disparo de sonidos.
- `js/sound.js` — reproducción de efectos de sonido (`ball-bounce.mp3`, `break-sound.mp3`).
- `js/main.js` — loop principal (`requestAnimationFrame` con delta-time), incluida la progresión automática al siguiente nivel.

Al empezar a trabajar aquí, no asumas que esta estructura sigue vigente tal cual — revisa primero qué archivos hay antes de proponer cambios, sobre todo si se agregaron specs nuevas (power-ups adicionales, etc. quedan fuera de alcance actual y podrían implementarse en specs futuras).

## Flujo de trabajo: spec-driven

Este repo usa las skills `spec` y `spec-impl` (definidas en `.agents/skills/` y `.claude/skills/`) para diseñar e implementar features:

- `/spec <descripción>` — diseña una spec de forma guiada (preguntas de clarificación, luego secciones del documento una por una) y la guarda en `specs/NN-slug.md` con estado `Draft`.
- `/spec-impl <NN-slug>` — solo implementa specs cuyo estado sea `Approved`/`Aprobado`. Crea una rama `spec-NN-slug`, muestra el resumen de la spec y ejecuta el plan de implementación paso a paso, pausando después de cada paso para revisión.

**Antes de escribir código de features nuevas, revisa si existe una spec aprobada en `specs/`.** Si no existe carpeta `specs/`, todavía no se ha creado ninguna.

## Restricción técnica clave

Cero dependencias: no se debe introducir ningún framework, bundler o librería externa (ni siquiera vía CDN) salvo que el usuario lo pida explícitamente. El juego usa ES Modules nativos, por lo que **no se puede abrir `index.html` directamente con `file://`** (los navegadores bloquean `import`/`export` en ese protocolo) — hace falta un servidor estático simple (`python -m http.server`, Live Server de VSCode, `npx serve`, etc.), lo cual no cuenta como dependencia del proyecto.

## Assets existentes

- `assets/spritesheet-breakout.png` — spritesheet con paddle, bola, bloques (por color) y frames de explosión.
- `assets/spritesheet.js` — helper vanilla-JS ya implementado para cargar el spritesheet y dibujar sprites/frames en un `<canvas>` (`loadSpritesheet`, `drawSprite`, `drawFrame`). Cualquier renderizado del juego debería reutilizar estas funciones en vez de duplicar lógica de dibujo.
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — efectos de sonido para rebote de la bola y rotura de bloques, integrados vía `js/sound.js` (`playSound`).
