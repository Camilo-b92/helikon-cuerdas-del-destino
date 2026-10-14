# Entrada animada con Remotion

Herramienta de autoría y revisión de la entrada del cómic (Fase 4). No se publica con el sitio: el sitio solo usa `comic/entrada.js`, `comic/entrada-caminante.js` y los archivos de `comic/assets/entrada/`.

## Qué hace

La composición `Escena` dibuja la entrada completa: el paisaje de montaña (seis SVG de `comic/assets/entrada/`), el tocón, el televisor y la caminante. Es el mismo arte y el mismo movimiento que la página.

El movimiento (ciclo de paso, parada, sorpresa, acercamiento y brazo que presiona el botón con cinemática inversa) vive en un único módulo, `comic/entrada-caminante.js`. Remotion y el sitio importan ese mismo archivo, así que lo que se revisa aquí es lo que ocurre en la página.

## Uso

```console
npm install
npm run dev
npx remotion still Escena salida.png --frame=150
npx remotion render Escena salida.mp4 --codec=h264
```

En contenedores sin Chrome completo se debe pasar `--browser-executable` apuntando a un `headless_shell` de Chromium.

Remotion es gratuito para equipos de hasta 3 personas.

## Regenerar el arte

El arte se genera con código y se puede rehacer:

```console
node personaje/construir.js
node fondo/construir.js
```

- `personaje/construir.js` lee `personaje/esqueleto.json` (las 27 piezas con sus ids, padres, matrices y anclas) y escribe `comic/assets/entrada/caminante.json` con el diseño de la caminante: pelo, trenza, ruana, pantalón y botas. Para cambiar un color o un detalle se edita ese archivo y se vuelve a ejecutar.
- `fondo/construir.js` escribe los seis SVG del paisaje (`cielo`, `nubes`, `lejos`, `medio`, `plato`, `frente`) con una semilla fija: siempre salen iguales.

## Cómo se obtuvo el esqueleto

1. Se cargó una animación Lottie del cómic con lottie-web en modo SVG y se volcó el SVG de un fotograma de reposo.
2. Cada capa quedó como un `<g transform="matrix(...)">`; los padres del JSON de Lottie dan la jerarquía (torso, pelvis, muslo, pierna, zapato, brazo, antebrazo, mano, cuello, cabeza y cara).
3. La matriz local de cada capa es `inv(M padre) · M`, y cada articulación gira alrededor de su ancla.
4. Sobre ese esqueleto se redibujó el personaje (ronda 36) para que no sea ninguno de los que aparecen en los capítulos.
