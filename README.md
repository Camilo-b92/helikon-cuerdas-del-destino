# Helikón — Cuerdas del Destino

Sitio web de **Helikón**, el estudio detrás de *Cuerdas del Destino*: un cómic
digital interactivo inspirado en la historia de Juanes, que se lee dentro de un
televisor retro cambiando de canal.

> **¿Retomando el proyecto?** Lee este archivo para saber **cómo está armado**,
> y la [**BITÁCORA**](BITACORA.md) para saber **por qué se decidió así** y
> **qué quedó pendiente**.

**Repositorio:** `github.com/Camilo-b92/helikon-cuerdas-del-destino` (público)

## El equipo

| Integrante | Rol |
|---|---|
| Gabriel Torres | Dibujante y Animador |
| Camilo Betancourt | Programador |
| Brayhan Mosquera | Dibujante |

## Qué tecnologías usa y por qué

HTML, CSS y JavaScript sin frameworks ni proceso de compilación. **Es una
decisión deliberada, no una limitación:** son cuatro páginas sin base de datos,
sin usuarios y sin backend, cuyo valor está en una dirección de arte muy
personalizada. Un framework obligaría a instalar Node y un empaquetador para no
ganar nada, y complicaría justo lo que hace especial al proyecto, que es el CSS
escrito a mano.

La única biblioteca de terceros es **Lottie**, que reproduce las animaciones
vectoriales que exporta el equipo de dibujo desde After Effects. Se guarda
como copia local en `comic/assets/lottie-web-5.13.0.min.js`, así que el cómic
no depende de ninguna CDN ni de la conexión.

Las tipografías (**Bangers**, **Special Elite** e **Inter**) se cargan desde
Google Fonts.

## El código no lleva comentarios

**Ningún archivo propio del proyecto —HTML, CSS ni JavaScript— lleva
comentarios.** La documentación vive en este README y en la
[bitácora](BITACORA.md), y esos dos archivos son la única fuente de verdad.

Lo que eso implica al trabajar:

- Si algo necesita explicación, **va a un documento**, no a un comentario. La
  [guía del código](#guía-del-código) de más abajo es el sitio para el *qué
  hace*; la bitácora, para el *por qué se hizo así*.
- Los nombres cargan con el trabajo que antes hacía el comentario. Las
  funciones del cómic siguen un patrón fijo y legible por sí solo:
  `initEscenaN` / `playEscenaN` / `resetEscenaN` / `stopEscenaN`.
- **La única excepción es `comic/assets/lottie-web-5.13.0.min.js`.** Es
  software de terceros y su cabecera es la licencia MIT: no se toca.

## Estructura

```
.
├── index.html              La portada
├── assets/                 Recursos compartidos por todo el sitio
│   ├── css/
│   │   ├── pulp.css        Base visual común: paleta, papel, viñetas
│   │   └── home.css        Solo lo propio de la portada
│   ├── js/
│   │   ├── pulp.js         Revelado al scroll y paralaje del masthead
│   │   └── home.js         Solo lo propio de la portada
│   └── img/                Imágenes compartidas (favicon, etc.)
│
├── helikon/                El estudio: origen, equipo, bitácora
│   ├── index.html
│   ├── helikon.css
│   └── helikon.js
│
├── juanes/                 El artista que inspira el cómic
│   ├── index.html
│   ├── juanes.css
│   └── juanes.js
│
└── comic/                  El cómic dentro del televisor
    ├── index.html
    ├── comic.css
    ├── comic.js
    └── assets/             Arte, video y animaciones Lottie
        ├── intro.mp4
        ├── tv.png
        ├── personajes/      Los cinco personajes, en SVG
        │   └── expresiones/ Seis gestos por personaje
        ├── presentacion-c1/ Presentación animada del capítulo uno
        ├── presentacion-c2/ Presentación animada del capítulo dos
        ├── capitulo-n1/
        └── capitulo-n2/
```

Cada sección es autocontenida: su HTML, su CSS y su JS viven juntos. Lo que
comparten las tres páginas de papel está en `assets/`.

**Todas las rutas del sitio son relativas**, así que el proyecto funciona igual
sin importar en qué carpeta o en qué máquina esté.

### El sistema visual

`assets/css/pulp.css` define la identidad de cómic pulp de los años 30 —
paleta, textura de papel, masthead, hero y el componente de viñeta `.panel` —
y la usan la portada, Helikón y Juanes. Cada página lo enlaza **antes** del
suyo y solo redefine lo que le es propio:

```html
<link rel="stylesheet" href="../assets/css/pulp.css">
<link rel="stylesheet" href="helikon.css">
```

Lo mismo con el JavaScript:

```html
<script src="../assets/js/pulp.js"></script>
<script src="helikon.js"></script>
```

`pulp.js` va dentro de una IIFE para no dejar variables globales que choquen
con el script de cada página. Por eso cada página puede declarar su propio
`const reduceMotion` en el ámbito global sin conflicto.

La página del cómic mantiene a propósito su propio sistema de color y
tipografía: el interior del televisor es otro mundo dentro de la misma
historia.

### Paleta

| Variable | Color | Uso |
|---|---|---|
| `--paper` | `#e8dfc9` | Fondo, papel envejecido |
| `--ink` | `#17130e` | Tinta, bordes, sombras duras |
| `--red` | `#a92820` | Acento de Juanes |
| `--blue` | `#254f68` | Acento del Cómic |
| `--yellow` | `#c79b27` | Acento de Helikón |

## Guía del código

Esta sección reemplaza a los comentarios. Es el mapa para orientarse dentro de
cada archivo.

### `assets/js/pulp.js` — compartido por las tres páginas de papel

| Función | Qué hace |
|---|---|
| `initReveal()` | Revela las secciones `[data-reveal]` al entrar en pantalla con un `IntersectionObserver`. Añade la clase `.js-reveal` a `<html>`, **y solo entonces** el CSS oculta el contenido: si el JS no corre, la página se ve igual en vez de quedarse en blanco. Sin `IntersectionObserver`, marca todo como visible y sale. |
| `initParallax()` | Paralaje del masthead siguiendo el cursor. El valor se acumula y se aplica **una vez por frame** con `requestAnimationFrame`, porque `mousemove` dispara muchas más veces de las que el navegador alcanza a pintar. |
| `initOnomatopeyas()` | Sortea `--giro` y `--brinco` en cada pasada del cursor por una viñeta, para que el `HEY!` o el `POW!` no salte nunca dos veces igual. El CSS es quien anima; esto solo cambia las variables. No hace nada si el usuario pidió movimiento reducido. |

### El componente `.tono` — tinta sobre fotografía

Convierte una foto en una viñeta: escala de grises forzada, duotono sobre un
color de la paleta y una retícula de puntos encima. Va en `pulp.css`, así que
las tres páginas de papel pueden usarlo.

```html
<figure class="foto">
  <div class="tono tono--azul">
    <img src="img/loquesea.webp" width="1200" height="900" loading="lazy" alt="...">
  </div>
  <figcaption>Pie de foto.
    <span class="credito">Foto: Autor — Fuente, Licencia</span>
  </figcaption>
</figure>
```

Modificadores: `.tono` (rojo, por defecto), `.tono--azul`, `.tono--amarillo`.
La imagen conserva su proporción salvo que le des `aspect-ratio` al `.tono`, y
entonces hay que añadir `height: 100%` y `object-fit: cover` a su `img`.

**Es todo CSS, y eso tiene una consecuencia legal favorable:** el archivo que
se guarda y se distribuye es el original sin tocar — el tramado lo aplica el
navegador al pintar. Ver la nota sobre CC BY-SA en
[créditos de imágenes](#créditos-de-imágenes).

### `assets/js/home.js` — portada

- `playClickSound()` — clic sintetizado con Web Audio. Reutiliza **un único
  `AudioContext`** para toda la página: crear uno por clic deja contextos
  huérfanos y los navegadores limitan cuántos permiten por pestaña. Si el
  navegador no tiene Web Audio, o el audio falla, la navegación sigue
  funcionando.
- Inclinación 3D de los paneles siguiendo el cursor, más una luz radial que
  se mueve con él. El panel bajo el cursor sube a `z-index: 10` para que su
  sombra dura no quede tapada por el vecino.
- `initPortada()` — paralaje de la portada del Nº 1. Cada elemento con clase
  `.capa` se desplaza según su `data-profundidad`: positivo sigue al cursor,
  negativo va al contrario, y así el título, los anillos y Juanes parecen
  estar a distinta distancia. Escribe la propiedad `translate`, se agrupa en un
  cambio por fotograma y no hace nada con movimiento reducido ni en pantallas
  táctiles.

### La portada: un cómic abierto por la primera doble página

`index.html` no es una web con tres botones: es el **Nº 1 de un cómic**,
abierto. En escritorio se ven dos hojas enfrentadas; en móvil (≤ 760 px) se
apilan en vertical, como un webtoon.

- **Hoja izquierda, la portada** (`.portada`). Lleva lo que tiene la portada de
  un cómic impreso: caja editorial en la esquina con la cara del niño, número,
  fecha, precio y código de barras. El título es el **logotipo oficial** y los
  anillos rojos vienen de la presentación animada del capítulo uno. Juanes se
  sale del marco por abajo.
- **Hoja derecha, la página 1** (`.pagina`). Un cartucho de narrador y tres
  viñetas de tamaño distinto que llevan a las tres secciones, con personajes
  reales del cómic hablando en globos (`.globo`). La viñeta del cómic es la más
  grande porque es la entrada principal.
- **Debajo**, el reparto con los cinco personajes y la contraportada: "Continuará
  en *El Mensaje*", con su rótulo real, y los créditos del equipo.

No se duplicó ningún archivo gráfico: todo se enlaza desde `comic/assets/` y
`juanes/img/`.

**Cada hoja es un contenedor de tamaño** (`container-type: size`), y todo lo de
dentro se mide en `cqi` y `cqh`, es decir en porcentaje de la hoja. Por eso la
página escala entera como una página impresa, sin reajustar cada pieza en cada
tamaño de pantalla. Tres reglas que hay que respetar al tocarla:

1. **Una hoja no puede usar `cqi` en sus propios estilos**, solo sus hijos: las
   unidades de contenedor se resuelven contra el contenedor *antepasado*, no
   contra el propio elemento. Si no hay antepasado, el navegador las calcula
   contra la ventana, **sin dar error**. Por eso el relleno de `.pagina` se
   calcula con `--ancho-hoja` y no con `cqi`.
2. **En móvil, `.pagina` pasa a `container-type: inline-size`** y altura
   automática, así que dentro de `.pagina` solo se usa `cqi`, nunca `cqh`.
3. **Dos formatos de hoja.** En pantallas apaisadas (proporción de 3:2 o más y
   más de 760 px de ancho) las hojas usan el **formato álbum europeo**, 0,8. En
   el resto, el del cómic americano, 0,66. Lo controla `--proporcion` en
   `.doble-pagina`, y de ahí salen `--alto` y `--ancho-hoja`. La altura es
   `min(1040px, calc(100svh - 32px), …)`: la doble página cabe en la pantalla y
   nunca desborda a lo ancho.
4. **La portada se mide en `--u`**, no en `cqi`: `--u` es `min(1cqi, 0.66cqh)`.
   En formato americano equivale exactamente a `1cqi`; en formato álbum se queda
   corta a propósito, para que al ensanchar la hoja la composición vertical no
   cambie (el título no tapa a Juanes y la caja editorial no se recorta). Por la
   misma razón, el título, los anillos y Juanes se centran con `left: 50%` y
   margen negativo: la propiedad `translate` la ocupa el paralaje.

Las viñetas de la página 1 van ligeramente giradas con la propiedad `rotate` y
no llevan la animación de asentado: esa animación también escribe `rotate` y
dejaría las viñetas rectas.

### `helikon/helikon.js`

- `bindTilt(selector, strength, lift)` — la misma inclinación, parametrizada
  en grados de giro y en cuánto se levanta la tarjeta. Se aplica dos veces:
  a las viñetas (`2.5`, `4`) y a las fichas del equipo (`6`, `4`). El
  selector excluye `.panel-locked`, que es la viñeta de "Próximo capítulo",
  bloqueada a propósito.

### La página de Helikón: el Nº 0

Si la portada es el Nº 1, Helikón es el **Nº 0**: el número especial que las
editoriales de cómics publican para contar el origen de una serie. Se lee de
arriba abajo:

1. **Cabecera de edición especial**, con caja "Nº 0" que vuelve a la portada.
2. **Titular y sello** de edición: el lema gira alrededor de un círculo con
   `textPath`, estirado con `textLength` para que dé la vuelta completa.
3. **El origen en cuatro viñetas** (`.vineta-origen`): el Monte Helicón,
   Pegaso golpeando la roca, la fuente Hipocrene con las nueve musas y el
   nombre HELIKÓN. Los dibujos son SVG en línea con trazo de tinta.
4. **Manifiesto** como página de impacto, con la lira.
5. **Quién es quién**: fichas del equipo al estilo del *Who's Who* de los
   cómics.
6. **Extras del taller**: la hoja de modelo real con las seis expresiones de
   Juanes, el proceso de producción en cuatro pasos y el cómic en cifras.
7. **Expedientes**, **tablero de ideas**, **nuestro universo** y cierre
   "Fin del Nº 0".

Reglas de esta página:

- **Nada inventado sobre personas reales.** Sin retratos, sin frases que no
  dijeron y sin estadísticas de "poderes". Las fichas dicen el oficio y lo que
  cada uno aporta al cómic; el proceso y las cifras salen de este README y de
  la bitácora.
- **El dibujo del monte usa `preserveAspectRatio="xMidYMax slice"`** con la
  cima centrada en un lienzo de 1000×260, de la misma proporción que la viñeta.
  Así, en móvil se recortan los lados pero la cima y el templo siempre se ven.
  En móvil, además, el cartucho del monte baja a la base para no taparla.
- **Las fichas del equipo no llevan la animación de asentado** de `pulp.css`:
  van inclinadas con `rotate`, y esa animación también escribe `rotate`.
- **Las sombras del título van en `em`**, no en píxeles. Con desplazamientos
  fijos, a tamaño de móvil las capas de papel y tinta se separaban y dejaban
  franjas claras entre las letras.
- **Bangers no tiene "º"**, también dentro del SVG: el "Nº 0" del sello lleva la
  "o" en un `<tspan>` pequeño, elevado y subrayado.

### `juanes/juanes.js`

- `updateReadingProgress()` — barra de progreso de lectura (`#inkFill`).
- `animateCount(el)` — las cifras de reconocimientos cuentan hacia arriba la
  primera vez que entran en pantalla. El texto puede traer prefijo y sufijo
  (`+16M`), así que se separa con `/^(\D*)(\d+)(.*)$/` y solo se anima la
  parte numérica; al terminar se restituye el texto original. No se ejecuta
  si el usuario pidió movimiento reducido.

### `comic/comic.js` — el televisor

Máquina de estados con cuatro banderas: `tvOn`, `isAnimating`,
`introPlaying` e `introEnded`. Mientras `isAnimating` está en `true` los
botones de canal quedan deshabilitados.

**El dial.** `TOTAL_CHANNELS = 8` es el **último índice**, no la cantidad: los
canales van de 0 a 8. `showChannel(index)` es el despachador central — marca
la `<section>` activa, arranca lo que corresponda a ese canal, detiene lo de
los demás, adelanta la carga del siguiente y actualiza el pie de foto.

**Ciclo de vida de una escena.** Todas siguen el mismo patrón:

| Paso | Cuándo corre |
|---|---|
| `prefetchEscenaN()` | Desde el canal **anterior**, para calentar la caché de red mientras el lector ve el canal previo. Solo hace `fetch`/`new Image`: **no** crea todavía los objetos Lottie. |
| `initEscenaN()` | Al sintonizar el canal, ya visible. Crea las animaciones y engancha sus eventos. Es idempotente, gracias a la bandera `ready`. |
| `playEscenaN()` / `resetEscenaN()` | Arranca o rebobina la escena. |
| `stopEscenaN()` | Al salir del canal y al apagar el televisor. Pausa las animaciones y limpia los `setTimeout` pendientes. |

**Escalado.** `scaleStage(stage, container)` encaja el lienzo de diseño fijo
de **1134x658** dentro del hueco de la pantalla usando `Math.max` de las dos
proporciones, es decir en modo *cover*: llena la pantalla y recorta lo que
sobre, sin deformar. Lo usan las cinco escenas y las dos presentaciones, y se
vuelve a llamar en cada `resize`.

**Canal 0 — Personajes.** La ficha no está en el HTML: la arma `pintarPersonaje()`
a partir del array `PERSONAJES`, así que **añadir un personaje es añadir una
entrada**, no repetir marcado. `rutaArte()` decide si toca la figura entera o
una de las seis expresiones. Al abrir un personaje se precargan sus seis caras
(120 KB) y, al montar el canal, los otros cuatro retratos. El cambio de
personaje pasa por un desvanecido de 180 ms que pinta con el contenido ya
oculto, para que el retrato no se vea a medias.

**Canales 1 y 6 — Presentaciones.** Las dos se comportan igual, así que
comparten la fábrica `crearPresentacion()`. Cosas que hay que respetar al
tocarlas:

- El arranque espera al evento `DOMLoaded` de Lottie. Pedir `goToAndPlay`
  antes de que el archivo termine de cargar deja la pantalla en negro; si el
  canal se sintoniza antes, el arranque queda en `pendiente`.
- `PRES_DELAY_MS` (450 ms) deja que termine la estática del cambio de canal.
- `PRES_SAFETY_MS` (6000 ms) es la red de seguridad por si Lottie nunca emite
  `complete`: sin ella, el aviso para avanzar no aparecería nunca.
- El contador `token` descarta los arranques huérfanos. Sin él, entrar y salir
  rápido del canal dejaba el aviso encendido sobre otro canal.
- El número de imágenes de cada presentación es **explícito** (cinco en la
  primera, seis en la segunda) porque pedir una que no existe dejaría un 404.

**Estática del cambio de canal.** `runStatic(duration, onMid, done)` dibuja
ruido en un buffer **seis veces más pequeño** y lo escala hacia arriba sin
suavizado: mismo efecto, una fracción del costo. El cambio de canal se aplica
en `onMid`, al **45 %** de la animación, para que ocurra tapado por el ruido.
Lleva un `safetyTimer` de `duration + 1200`: si el navegador deja de emitir
frames (pestaña en segundo plano, ahorro de energía), `requestAnimationFrame`
no vuelve a dispararse y el televisor se quedaría trabado con los botones
apagados.

**Video de introducción.** Se reproduce una vez por encendido y entrega
directo al canal 0. El fin se detecta por el evento `ended`, con un respaldo
por `timeupdate` que compara contra la **duración real del archivo**. Si el
autoplay está bloqueado o el archivo falta, `finishIntro()` corre igual para
no dejar al lector atascado. El botón de saltar aparece al primer segundo
(`SKIP_DELAY_MS`).

**Teclado.** Flechas izquierda y derecha cambian de canal. Espacio y Enter
encienden o apagan, **salvo si el foco está dentro del televisor**
(`tv.contains(document.activeElement)`): sin ese guard, pulsar Enter sobre
"canal siguiente" o sobre "Saltar" apagaba el aparato.

**Apagado.** `powerOff()` detiene *todas* las escenas y las dos
presentaciones. Si no, sus animaciones Lottie seguirían consumiendo CPU sin
verse.

### Puntos no obvios del CSS

- **La pantalla va por encima del marco.** En `comic/index.html`, `.tv-screen`
  se declara antes que `.tv-frame`, pero el arte del televisor se dibuja
  encima; los botones son zonas activas alineadas sobre ese arte.
- **El televisor tope a 1566 px** — `width: min(1566px, 99vw, calc((100vh - 100px) * 1.6930))`.
  1566x925 es la resolución nativa de `tv.png`: pasar de ahí solo escala hacia
  arriba y se ve borroso.
- **El retrato del canal 0 usa `object-fit: contain`**, no `max-height: 100%`.
  Los cinco SVG tienen proporciones distintas y el más alargado se salía sobre
  las pestañas, porque el alto en porcentaje no llegaba a resolverse en esa
  cadena de contenedores. Su columna es del **42 %** (38 % en móvil): lo justo
  para que el lienzo común de 760x1000 quepa a plena altura.
- **`prefers-reduced-motion` neutraliza la _duración_, no el retraso.** Las
  escenas usan `animation-delay` para escalonar la entrada de cada capa —el
  panel de texto de la escena 2 entra a los 8 s, sincronizado con su Lottie—.
  Con `animation: none` esas capas se quedaban fuera de cuadro; así saltan
  directo a su posición final a tiempo.
- **El asentado al leer usa `translate` y `rotate`, no `transform`.** Las
  viñetas y las tarjetas se colocan sobre la página al entrar en pantalla, con
  `animation-timeline: view()` — sin JavaScript. Tenía que animar propiedades
  **independientes**: `home.js`, `helikon.js` y `juanes.js` escriben
  `transform` en línea para la inclinación 3D, y una animación CSS gana sobre
  una declaración en línea, así que animar `transform` habría matado el efecto
  de inclinación. `translate` y `rotate` son propiedades aparte y se componen
  con él en vez de pisarlo.
  La animación **parte de un estado visible** y solo se asienta: nada queda en
  `opacity: 0` esperando al scroll, así que un navegador sin soporte muestra la
  página igual. Va dentro de `@media (prefers-reduced-motion: no-preference)`.
- **Los avisos de "pasa de canal" se ocultan con `visibility`, no con
  `opacity`.** La animación `blinkHint` anima justo `opacity`, y una animación
  gana sobre una declaración normal: con `opacity` el aviso se vería desde el
  primer fotograma.

## Cómo verlo en local

El sitio necesita servirse por HTTP, no abrirse con doble clic: abrir el
archivo directamente rompe la carga de las animaciones Lottie del cómic.

**Con VS Code** — instala la extensión *Live Server*, clic derecho sobre
`index.html` → *Open with Live Server*.

**Con Node**, desde la raíz del proyecto:

```bash
npx --yes serve -l 5500
```

**Con Python**, si lo tienes instalado:

```bash
python -m http.server 5500
```

Y abre <http://localhost:5500>.

## Herramientas de trabajo

Estas herramientas **no son dependencias del sitio**: corren en tu máquina para
producir archivos, y lo que llega al repositorio es el resultado ya optimizado.
Esa es la manera de mejorar los recursos sin romper la regla de "sin proceso de
compilación".

| Herramienta | Para qué | Estado |
|---|---|---|
| `git` | Control de versiones | Instalado (2.55.0) |
| `ffmpeg` | Comprimir `intro.mp4`, convertir renders | Instalado (9.0.1) |
| `npx @gltf-transform/cli` | Optimizar modelos `.glb` antes de subirlos | Se ejecuta con `npx`, no se instala |
| Blender | Modelar y renderizar el 3D | **Falta**, desde <https://blender.org> |

Para el 3D en el navegador se usarán **`<model-viewer>`** en las piezas
acotadas y **three.js** donde haga falta una escena propia. Las condiciones de
peso y de carga que hay que respetar están en la
[bitácora](BITACORA.md), en *El 3D entra vivo*.

**El televisor del cómic sigue siendo la imagen `tv.png`, a propósito.** Se
probó darle volumen en CSS 3D dos veces y no convenció. Antes de volver a
intentarlo, lee en la bitácora *El televisor sigue siendo una imagen, por
ahora*: ahí están los diez problemas que ya se encontraron y cómo se midieron.

## Trabajar desde otra máquina

```bash
git clone https://github.com/Camilo-b92/helikon-cuerdas-del-destino.git
```

El repositorio es público, así que clonarlo no pide credenciales; **subir sí**,
y para eso hay que iniciar sesión como `Camilo-b92`. Después, identifícate para
que tus commits queden a tu nombre:

```bash
git config --global user.name "Camilo Betancourt"
```

```bash
git config --global user.email "camilobetancourt02@gmail.com"
```

### El ciclo de trabajo

Siempre igual, y en este orden:

```bash
git pull
```

```bash
git add -A && git commit -m "qué hiciste" && git push
```

**La trampa a evitar:** si haces cambios en una máquina sin subirlos y al día
siguiente trabajas en la otra, las dos versiones se separan y hay que
reconciliarlas a mano. **`pull` al empezar, `push` al terminar.**

## Cómo publicarlo

Es un sitio estático: no hay comando de compilación y el directorio de
publicación es la raíz.

- **GitHub Pages** — la opción recomendada ahora que el repositorio es
  público: no hace falta cuenta de pago ni ningún servicio más. Se activa en
  *Settings → Pages*, publicando desde la rama `main`, carpeta raíz.
- **Netlify** o **Vercel** — alternativas igual de válidas, con vistas previas
  por rama y despliegue automático en cada `push`. Hacen falta si el
  repositorio vuelve a ser privado, porque las dos publican gratis desde
  repositorios privados y GitHub Pages no.

## Cómo agregar imágenes y gráficos

- **Dónde**: en `assets/img/` si la usa más de una página; en una carpeta
  `img/` dentro de la sección si es exclusiva de ella.
- **Nombres**: minúsculas, sin espacios ni tildes — `guitarra-juanes.svg`,
  no `Guitarra Juanes.svg`.
- **Formato**: SVG para arte de línea e iconos; PNG con transparencia para
  recortes; WebP o JPG para fotos y renders.
- **Peso**: menos de 300 KB por archivo. Comprime en <https://squoosh.app>
  antes de subir.
- **En los SVG**: usa `stroke="currentColor"` en vez de un color fijo. Así el
  gráfico se tiñe desde CSS y se adapta solo a la viñeta donde esté.

Hay más detalle sobre esto —incluido qué hacer con elementos 3D— en la
[bitácora](BITACORA.md).

## Créditos de imágenes

`juanes/img/` contiene fotografías **de terceros con licencia Creative
Commons**. No son del equipo y no son de libre uso sin condiciones: la licencia
obliga a **citar autor y licencia allí donde se publiquen**, y el repositorio
las distribuye, así que la atribución vive aquí y debe aparecer también en la
página donde se usen.

| Archivo | Autor | Licencia | Origen |
|---|---|---|---|
| `juanes-retrato.webp` | RGB Productions | **CC BY 3.0** | [Commons](https://commons.wikimedia.org/wiki/File:Juanes_2022.png) |
| `aldabon-casa-familiar.webp` | laloking97 | **CC BY-SA 2.0** | [Commons](https://commons.wikimedia.org/wiki/File:Aldab%C3%B3n-casa_de_los_pap%C3%A1s_de_Juanes.jpg) |
| `estatua-carolina-del-principe.webp` | XalD | **CC BY-SA 4.0** | [Commons](https://commons.wikimedia.org/wiki/File:Estatua_de_Juanes_en_Carolina_del_Pr%C3%ADncipe,_2023.jpg) |

Las tres se redujeron y se convirtieron a WebP con `ffmpeg` para cumplir el
límite de 300 KB por archivo; los originales no están en el repositorio.

**Cuidado con la diferencia entre las dos licencias.** Las dos **CC BY-SA**
son *compartir igual*: cualquier versión modificada —una foto tramada como
viñeta, por ejemplo— debe publicarse bajo esa misma licencia. La **CC BY 3.0**
del retrato solo pide atribución, así que es la indicada para las piezas que
vayan a llevar mucho retoque.

Cualquier imagen nueva de una persona real entra por esta puerta: con licencia
verificable y su fila en esta tabla. Nada de descargas sueltas ni de retratos
generados con IA — el porqué está en la [bitácora](BITACORA.md).

## Accesibilidad

Todas las animaciones respetan `prefers-reduced-motion`. El revelado al hacer
scroll solo oculta el contenido si el JavaScript llegó a ejecutarse (marca
`.js-reveal` en `<html>`), para que un fallo de script no deje la página en
blanco.

## Estado del contenido

El cómic tiene el capítulo uno completo (tres escenas) y las dos primeras
escenas del capítulo dos, repartidas en nueve canales (0 a 8). Al encender, el
televisor reproduce el video de introducción y entrega directo al canal 0.

| Canal | Contenido | Se arma en |
|---|---|---|
| 0 | **Personajes** | `PERSONAJES` + `initCast()` |
| 1 | Presentación del capítulo uno | `pres1` |
| 2 | Escena I — El llamado | `s1` |
| 3 | Escena II | `s2` |
| 4 | Escena III | `s3` |
| 5 | Fin del capítulo uno | HTML fijo |
| 6 | Presentación del capítulo dos | `pres2` |
| 7 | Capítulo dos, escena I | `s4` |
| 8 | Capítulo dos, escena II | `s5` |

El **canal 0** presenta a los cinco personajes —Juanes, Juanes niño, el Ente,
el Padre y la Madre— con su retrato y su ficha. Se cambia de personaje con las
pestañas de abajo, dentro de la pantalla.

Cada uno trae además sus **seis expresiones** del book de ilustración. Los
botones bajo la ficha las muestran en grande en el hueco del retrato, y
*Figura* devuelve al cuerpo entero.

Cada capítulo abre con su propia presentación animada, en el canal anterior a
su primera escena: el **canal 1** presenta *Cuerdas del Destino* y el **canal
6**, *El Mensaje*. Las dos se reproducen al sintonizar el canal y se quedan
congeladas en su último fotograma, que es la portada completa.

La lista completa de pendientes está en la [bitácora](BITACORA.md).
