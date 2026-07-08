# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Este es un juego de Arkanoid con HTML, CSS y JavaScript **sin dependencias externas**. El MVP (`specs/01-arkanoid-mvp.md`, estado `Implementado`) ya está implementado: un solo nivel jugable con menú, HUD de score/vidas, Game Over, victoria y pausa.

Estructura actual:

- `index.html`, `style.css` — canvas 800x600 y estilos.
- `js/state.js` — estado global (`state`) y constantes de configuración (`CONFIG`).
- `js/render.js` — dibujo de cada pantalla según `state.screen`.
- `js/input.js` — teclado (movimiento del paddle, pausa, iniciar partida).
- `js/collisions.js` — física de la bola, colisiones con paddle/bloques, vidas y condición de victoria.
- `js/main.js` — loop principal (`requestAnimationFrame` con delta-time).

Al empezar a trabajar aquí, no asumas que esta estructura sigue vigente tal cual — revisa primero qué archivos hay antes de proponer cambios, sobre todo si se agregaron specs nuevas (power-ups, niveles, sonido, etc. quedaron fuera de alcance del MVP y podrían implementarse en specs futuras).

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
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — efectos de sonido para rebote de la bola y rotura de bloques.
