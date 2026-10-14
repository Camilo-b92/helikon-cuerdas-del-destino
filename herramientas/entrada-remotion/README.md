# Entrada animada con Remotion

Herramienta de autoría y revisión de la entrada del cómic (Fase 4). No se publica con el sitio: el sitio solo usa `comic/entrada.js`, `comic/entrada-juan.js` y los archivos de `comic/assets/entrada/`.

## Qué hace

La composición `Escena` dibuja la entrada completa con el fondo real del cómic (`comic/assets/capitulo-n1/scene1/img/`), el tocón, el televisor y a Juan, el personaje real del cómic. Juan no se redibuja: sus piezas se extrajeron de la animación Lottie del cómic y se guardaron en `comic/assets/entrada/juan.json` (44 KB).

El movimiento de Juan (ciclo de paso, parada, sorpresa, acercamiento y brazo que presiona el botón con cinemática inversa) vive en un único módulo, `comic/entrada-juan.js`. Remotion y el sitio importan ese mismo archivo, así que lo que se revisa aquí es lo que ocurre en la página.

## Uso

```console
npm install
npm run dev
npx remotion still Escena salida.png --frame=150
npx remotion render Escena salida.mp4 --codec=h264
```

En contenedores sin Chrome completo se debe pasar `--browser-executable` apuntando a un `headless_shell` de Chromium.

Remotion es gratuito para equipos de hasta 3 personas.

## Cómo se extrajo a Juan

1. Se cargó la animación Lottie del cómic con lottie-web en modo SVG y se volcó el SVG de un fotograma de reposo.
2. Cada capa quedó como un `<g transform="matrix(...)">`; los padres del JSON de Lottie dan la jerarquía (torso, pelvis, muslo, pierna, zapato, brazo, antebrazo, mano, cuello, cabeza y cara).
3. La matriz local de cada capa es `inv(M padre) · M`, y cada articulación gira alrededor de su ancla.
4. Las expresiones de la cara se tomaron de otros fotogramas; la boca de sorpresa se dibujó aparte.
