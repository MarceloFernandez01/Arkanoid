# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Este es un juego de Arkanoid con HTML, CSS y JavaScript **sin dependencias externas**. Aún no está implementado: por ahora el repositorio solo contiene los assets del juego (spritesheet, sonidos) y no existe ningún `index.html`, `.js` o `.css` del juego en sí.

Al empezar a trabajar aquí, no asumas que existe una arquitectura previa — revisa primero qué archivos hay antes de proponer cambios.

## Flujo de trabajo: spec-driven

Este repo usa las skills `spec` y `spec-impl` (definidas en `.agents/skills/` y `.claude/skills/`) para diseñar e implementar features:

- `/spec <descripción>` — diseña una spec de forma guiada (preguntas de clarificación, luego secciones del documento una por una) y la guarda en `specs/NN-slug.md` con estado `Draft`.
- `/spec-impl <NN-slug>` — solo implementa specs cuyo estado sea `Approved`/`Aprobado`. Crea una rama `spec-NN-slug`, muestra el resumen de la spec y ejecuta el plan de implementación paso a paso, pausando después de cada paso para revisión.

**Antes de escribir código de features nuevas, revisa si existe una spec aprobada en `specs/`.** Si no existe carpeta `specs/`, todavía no se ha creado ninguna.

## Restricción técnica clave

Cero dependencias: no se debe introducir ningún framework, bundler o librería externa (ni siquiera vía CDN) salvo que el usuario lo pida explícitamente. El juego debe correr abriendo el HTML directamente o con un servidor estático simple.

## Assets existentes

- `assets/spritesheet-breakout.png` — spritesheet con paddle, bola, bloques (por color) y frames de explosión.
- `assets/spritesheet.js` — helper vanilla-JS ya implementado para cargar el spritesheet y dibujar sprites/frames en un `<canvas>` (`loadSpritesheet`, `drawSprite`, `drawFrame`). Cualquier renderizado del juego debería reutilizar estas funciones en vez de duplicar lógica de dibujo.
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — efectos de sonido para rebote de la bola y rotura de bloques.
