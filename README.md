# Juego de Arkanoid

Arkanoid con HTML, CSS y JavaScript, sin dependencias externas.

**Jugar online:** https://marcelofernandez01.github.io/Arkanoid/

MVP jugable implementado según `specs/01-arkanoid-mvp.md`, con animación de destrucción de bloques (`specs/02-block-destruction-animation.md`) y ajuste de frames de daño progresivo (`specs/03-block-damage-frames-adjustment.md`).

## Cómo jugar

El juego usa ES Modules nativos (`<script type="module">`), por lo que los navegadores bloquean su carga si abrís `index.html` directamente con doble clic (protocolo `file://`). Hace falta levantar un servidor estático simple, por ejemplo:

```
python -m http.server 8000
```

y abrir `http://localhost:8000/index.html`.

También funciona con la extensión "Live Server" de VSCode o `npx serve`.

## Controles

- **Flechas izquierda/derecha** o **A/D**: mover el paddle.
- **Espacio** o **clic**: iniciar partida desde el menú.
- **P** o **Escape**: pausar/reanudar.

## Estructura

- `index.html`, `style.css` — canvas del juego y estilos.
- `js/state.js` — estado global y configuración (tamaños, velocidades, grilla de bloques).
- `js/render.js` — dibujo de cada pantalla (menú, juego, game over, victoria, pausa).
- `js/input.js` — teclado y movimiento del paddle.
- `js/collisions.js` — física de la bola, colisiones con paddle/bloques, vidas y condición de victoria.
- `js/main.js` — loop principal (`requestAnimationFrame` con delta-time).
- `assets/` — spritesheet (incluye frames de daño progresivo y explosión de bloques) y sonidos (los sonidos todavía no se usan, quedan para una spec futura).

## Alcance actual

Un solo nivel fijo, 3 vidas, sin power-ups ni sonido. Los bloques muestran daño progresivo y una animación de explosión al destruirse. El detalle completo del alcance y las decisiones de diseño está en `specs/01-arkanoid-mvp.md`, `specs/02-block-destruction-animation.md` y `specs/03-block-damage-frames-adjustment.md`.
