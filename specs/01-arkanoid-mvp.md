# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Implementado
> **Depends on:** Ninguna
> **Date:** 2026-07-08
> **Objective:** Construir un MVP jugable de Arkanoid con un solo nivel, controlado por teclado, usando los assets existentes del spritesheet.

---

## Scope

**In:**

- Un único nivel fijo de 1000x800 px, con 5 filas x 8 columnas de bloques (40 bloques totales), usando los 7 colores disponibles en el spritesheet (gray, red, yellow, cyan, magenta, hotpink, green).
- Movimiento del paddle con teclado (flechas izquierda/derecha o A/D).
- Física de rebote de la bola en paredes y paddle, con cambio de ángulo según el punto de impacto en el paddle.
- Sistema de bloques con 3 golpes de resistencia por bloque, sin bloques indestructibles.
- Sistema de puntaje: +10 puntos por cada golpe a un bloque, +100 puntos adicionales cuando el bloque se rompe al tercer golpe.
- Sistema de 3 vidas: se pierde una vida cuando la bola cae por debajo del paddle; el juego termina en Game Over al perder la última vida.
- Pantalla de menú de inicio con botón "Jugar".
- Pantalla de Game Over (al perder todas las vidas) con mensaje correspondiente.
- Pantalla de victoria (al romper todos los bloques) con mensaje felicitando al jugador.
- Pausa simple con una tecla: detiene el movimiento de la bola y bloquea el movimiento del paddle mientras está activa.
- Reutilización de `loadSpritesheet`, `drawSprite` y `drawFrame` de `assets/spritesheet.js` para todo el renderizado.
- Código organizado en módulos ES nativos (`js/state.js`, `js/render.js`, `js/input.js`, `js/collisions.js`, `js/main.js`).

**Out of scope (for future specs):**

- Múltiples niveles o progresión de niveles.
- Power-ups.
- Persistencia de puntajes altos (high scores) entre sesiones.
- Soporte de controles táctiles/mouse.
- Efectos de sonido (`ball-bounce.mp3`, `break-sound.mp3`).
- Animación de explosión al romper bloques.
- Ajustes de volumen configurables por el jugador.

---

## Data model

```js
// Estado global del juego
const state = {
  screen: 'menu',       // 'menu' | 'playing' | 'paused' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14, speed: 300 },   // px/segundo
  ball: { x: 400, y: 546, w: 16, h: 16, vx: 200, vy: -200 }, // px/segundo
  blocks: [/* { row, col, x, y, w, h, color, hits, broken } */],
};

// Bloque individual
// color ∈ 'gray' | 'red' | 'yellow' | 'cyan' | 'magenta' | 'hotpink' | 'green'
// hits: 0 a 3 (golpes recibidos); broken=true cuando hits llega a 3
```

Conventions:

- Canvas: 1000x800 px. Coordenadas con origen top-left.
- Grid de bloques: 5 filas x 8 columnas, bloque 90x30 px, gap 10 px entre bloques, margen superior 60 px (deja espacio para el HUD de score/vidas), margen horizontal 5 px.
- Paddle: 162x14 px (tamaño nativo del sprite), posicionado a 40 px del borde inferior del canvas.
- Ball: 16x16 px (tamaño nativo del sprite).
- Velocidades en píxeles/segundo. El loop multiplica cada velocidad por el delta-time de cada frame (`requestAnimationFrame`) para un movimiento consistente sin importar el framerate real del navegador.
- Al romperse un bloque (`hits` llega a 3), este simplemente deja de dibujarse y de participar en colisiones — sin animación de explosión en este MVP.

---

## Implementation plan

1. Crear `index.html` con `<canvas id="game" width="1000" height="800">`, enlazando `assets/spritesheet.js` y `js/main.js` (como `<script type="module">`), y `style.css`. Test manual: abrir el HTML y ver un canvas vacío sin errores en consola.
2. Crear `js/state.js` con el objeto `state` y las constantes de configuración (tamaños de canvas, paddle, ball, grid de bloques, velocidades en px/segundo). Crear `js/main.js` con el loop principal (`requestAnimationFrame`) que calcula el delta-time entre frames, importa `state.js` y solo limpia/redibuja el canvas según `state.screen`. Test manual: la consola no muestra errores y el loop corre.
3. Crear `js/render.js` con la función de dibujo de la pantalla de menú (texto "ARKANOID" + "Jugar"). Crear `js/input.js` con el listener de tecla espacio/clic que cambia `state.screen` a `'playing'`. Conectar ambos desde `main.js`. Test manual: se ve el menú y al presionar espacio cambia de pantalla.
4. En `render.js`, agregar dibujo del paddle con `drawSprite`. En `input.js`, agregar movimiento con flechas/A-D limitado a los bordes del canvas, activo solo cuando `state.screen === 'playing'`. Test manual: el paddle se mueve y no sale del canvas.
5. En `render.js`, agregar dibujo de la bola. En `js/collisions.js`, implementar movimiento continuo y rebote en paredes izquierda/derecha/superior. Si cae por debajo del canvas, por ahora reaparece centrada (la lógica de vidas se agrega en el paso 9). Test manual: la bola rebota en las tres paredes.
6. En `state.js`, generar la grilla de 40 bloques (5x8) con posiciones y colores. En `render.js`, dibujarlos con `drawSprite`. Test manual: se ven los 40 bloques distribuidos en el canvas.
7. En `collisions.js`, implementar colisión bola-paddle con cambio de ángulo según el punto de impacto. Test manual: la bola rebota hacia distintos ángulos según dónde golpea el paddle.
8. En `collisions.js`, implementar colisión bola-bloque: al chocar, `hits++`, sumar 10 puntos; si `hits === 3`, marcar `broken = true` y sumar 100 puntos. En `render.js`, dejar de dibujar bloques rotos y mostrar el score en el HUD. Test manual: golpear un bloque 3 veces lo rompe y el score sube correctamente (30 + 100 = 130 por bloque).
9. Implementar sistema de vidas en `collisions.js`/`state.js`: cuando la bola cae por debajo del paddle, `lives--` y se resetean posición de bola y paddle. En `render.js`, mostrar vidas restantes en el HUD y la pantalla de Game Over cuando `lives === 0`. Test manual: perder las 3 vidas muestra la pantalla de Game Over.
10. Implementar condición de victoria: cuando todos los bloques están `broken`, cambiar `state.screen` a `'win'` y mostrar mensaje felicitando al jugador en `render.js`. Test manual: romper todos los bloques dispara la pantalla de victoria.
11. En `input.js`, agregar tecla de pausa (`P` o `Escape`) que alterna `state.screen` entre `'playing'` y `'paused'`. En `collisions.js`/`main.js`, evitar mover la bola y en `input.js` ignorar el movimiento del paddle mientras está en pausa. En `render.js`, mostrar overlay "Pausa". Test manual: pausar detiene todo, reanudar continúa desde donde quedó.

---

## Acceptance criteria

- [x] El juego carga sin errores en la consola al abrir `index.html`.
- [x] La pantalla de menú se muestra al cargar, con el texto "Jugar" visible.
- [x] Presionar espacio (o clic en "Jugar") inicia la partida.
- [x] El paddle se mueve con las flechas izquierda/derecha y con A/D, sin salir de los límites del canvas.
- [x] La bola rebota correctamente en las paredes izquierda, derecha y superior.
- [x] El ángulo de rebote de la bola cambia según el punto de impacto en el paddle.
- [x] Se dibujan 40 bloques (5 filas x 8 columnas) al iniciar la partida.
- [x] Cada golpe a un bloque no roto suma exactamente 10 puntos.
- [x] Un bloque se rompe (deja de dibujarse y de colisionar) exactamente al tercer golpe, sumando 100 puntos adicionales en ese momento.
- [x] El score visible en el HUD se actualiza en tiempo real con cada golpe/rotura de bloque.
- [x] Cuando la bola cae por debajo del paddle, se resta una vida y la bola/paddle se reposicionan.
- [x] Las vidas restantes se muestran en el HUD.
- [x] Al perder la tercera vida, se muestra la pantalla de Game Over.
- [x] Al romper los 40 bloques, se muestra la pantalla de victoria con un mensaje felicitando al jugador.
- [x] Presionar la tecla de pausa detiene el movimiento de la bola y bloquea el movimiento del paddle.
- [x] Presionar la tecla de pausa nuevamente reanuda el juego desde donde quedó.
- [x] El código está organizado en los módulos `js/state.js`, `js/render.js`, `js/input.js`, `js/collisions.js` y `js/main.js`, sin lógica de juego dentro de `index.html`.
- [x] No se agregó ninguna dependencia externa (framework, bundler o librería vía CDN).

---

## Decisions

- **Sí:** un solo nivel fijo para el MVP. Descartamos progresión de niveles porque agrega complejidad de carga/transición que no aporta al objetivo de "jugable".
- **No:** power-ups. Fuera de alcance, se evaluará en una spec futura.
- **Sí:** bloques con 3 golpes de resistencia, sin bloques indestructibles. Mantiene el juego simple y siempre completable.
- **Sí:** ángulo de rebote variable según punto de impacto en el paddle. Es el comportamiento esperado de Arkanoid y no añade complejidad significativa.
- **No:** física con ángulo fijo/reflexión simple. Se sentiría menos responsivo al jugador.
- **No:** audio en este MVP. Se pospone para simplificar el alcance inicial; los assets de sonido ya existen y se integrarán en una spec futura.
- **No:** animación de explosión al romper bloques. El bloque simplemente desaparece; se pospone para no acoplar timing de animación al MVP.
- **Sí:** ES Modules nativos (`<script type="module">`) para separar responsabilidades (`state`, `render`, `input`, `collisions`, `main`). Evita spaghetti code sin violar la restricción de cero dependencias (no requiere bundler).
- **No:** localStorage para high scores. Fuera de alcance del MVP; se evaluará en una spec futura.
- **Sí:** loop basado en `requestAnimationFrame` con cálculo de delta-time (tiempo transcurrido entre frames), y velocidades expresadas en píxeles/segundo. Evita que la velocidad del juego dependa del framerate del dispositivo.
- **No:** loop sin delta-time (píxeles/frame fijo). Introducía deuda técnica evidente: el juego correría distinto en cada dispositivo.

---

## Risks

| Riesgo                                                                 | Mitigación                                                                                     |
| ------------------------------------------------------------------------| ------------------------------------------------------------------------------------------------|
| Tunneling: a velocidades altas la bola podría atravesar el paddle o un bloque sin detectar colisión. | Mantener velocidades de bola bajas (según valores del data model) donde el desplazamiento por frame es menor al tamaño del bloque/paddle. |
| `main.js` podría intentar dibujar antes de que `loadSpritesheet` termine de cargar la imagen. | El loop principal solo arranca el `requestAnimationFrame` dentro del callback de `loadSpritesheet`. |

---

## What is **not** in this spec

- Efectos de sonido (`ball-bounce.mp3`, `break-sound.mp3`).
- Animación de explosión al romper bloques.
- Múltiples niveles o progresión de niveles.
- Power-ups.
- Persistencia de high scores.
- Soporte de controles táctiles/mouse.

Each one of those, if it lands, goes in its own spec.
