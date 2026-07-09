# Juego de Arkanoid

Arkanoid con HTML, CSS y JavaScript, sin dependencias externas.

Juego completo con 4 niveles jugables, menú de navegación por teclado y selección de nivel, efectos de sonido y animaciones de destrucción de bloques. El detalle de cada feature y sus decisiones de diseño está documentado en `specs/`.

## Cómo jugar

**Jugar online:** https://marcelofernandez01.github.io/Arkanoid/

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
- `js/state.js` — estado global, configuración (tamaños, velocidades) y generación de bloques por nivel.
- `js/levels.js` — definición de los 4 niveles (`id`, `name`, `pattern`).
- `js/render.js` — dibujo de cada pantalla (menú con zoom en la selección, juego, game over, victoria, pausa).
- `js/input.js` — teclado, selección de nivel en el menú (zoom + input lag) y movimiento del paddle.
- `js/collisions.js` — física de la bola, colisiones con paddle/bloques, vidas, condición de victoria/avance de nivel y disparo de sonidos.
- `js/sound.js` — reproducción de efectos de sonido de rebote y rotura de bloques.
- `js/main.js` — loop principal (`requestAnimationFrame` con delta-time) y progresión automática entre niveles.
- `assets/` — spritesheet (incluye frames de daño progresivo y explosión de bloques) y sonidos (`ball-bounce.mp3`, `break-sound.mp3`).

## Alcance actual

- 4 niveles jugables en progresión, 3 vidas por nivel, sin power-ups.
- Menú principal ("Jugar"/"Opciones"), selección de nivel, pausa y opciones con navegación por teclado y barra de volumen.
- Bloques con daño progresivo y animación de explosión al destruirse.
- Sonido de rebote de bola y de rotura de bloques.

El detalle completo del alcance y las decisiones de diseño está en las specs de `specs/`:

- `01-arkanoid-mvp.md`
- `02-block-destruction-animation.md`
- `03-block-damage-frames-adjustment.md`
- `04-sound-effects.md`
- `05-level-selection-and-progression.md`
- `06-menu-navigation-and-volume-bar.md`
