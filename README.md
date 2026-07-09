# Juego de Arkanoid

Arkanoid con HTML, CSS y JavaScript, sin dependencias externas.

**Jugar online:** https://marcelofernandez01.github.io/Arkanoid/

MVP jugable implementado según `specs/01-arkanoid-mvp.md`, con animación de destrucción de bloques (`specs/02-block-destruction-animation.md`), ajuste de frames de daño progresivo (`specs/03-block-damage-frames-adjustment.md`), efectos de sonido (`specs/04-sound-effects.md`) y selección/progresión de 3 niveles (`specs/05-level-selection-and-progression.md`).

## Cómo jugar

El juego usa ES Modules nativos (`<script type="module">`), por lo que los navegadores bloquean su carga si abrís `index.html` directamente con doble clic (protocolo `file://`). Hace falta levantar un servidor estático simple, por ejemplo:

```
python -m http.server 8000
```

y abrir `http://localhost:8000/index.html`.

También funciona con la extensión "Live Server" de VSCode o `npx serve`.

## Controles

- **Flechas arriba/abajo**: en el menú, elegir nivel (con un pequeño zoom animado en la opción resaltada).
- **Flechas izquierda/derecha** o **A/D**: mover el paddle.
- **Espacio** o **Enter**: confirmar nivel en el menú / lanzar la bola.
- **P** o **Escape**: pausar/reanudar.

## Estructura

- `index.html`, `style.css` — canvas del juego y estilos.
- `js/state.js` — estado global, configuración (tamaños, velocidades), definición de los 3 niveles y generación de bloques por nivel.
- `js/render.js` — dibujo de cada pantalla (menú con zoom en la selección, juego, game over, victoria, pausa).
- `js/input.js` — teclado, selección de nivel en el menú (zoom + input lag) y movimiento del paddle.
- `js/collisions.js` — física de la bola, colisiones con paddle/bloques, vidas, condición de victoria/avance de nivel y disparo de sonidos.
- `js/sound.js` — reproducción de efectos de sonido de rebote y rotura de bloques.
- `js/main.js` — loop principal (`requestAnimationFrame` con delta-time) y progresión automática entre niveles.
- `assets/` — spritesheet (incluye frames de daño progresivo y explosión de bloques) y sonidos (`ball-bounce.mp3`, `break-sound.mp3`).

## Alcance actual

3 niveles jugables en progresión (pirámide normal, pirámide invertida y calavera), 3 vidas por nivel, con sonido de rebote/rotura y sin power-ups. Los bloques muestran daño progresivo y una animación de explosión al destruirse. El detalle completo del alcance y las decisiones de diseño está en `specs/01-arkanoid-mvp.md`, `specs/02-block-destruction-animation.md`, `specs/03-block-damage-frames-adjustment.md`, `specs/04-sound-effects.md` y `specs/05-level-selection-and-progression.md`.
