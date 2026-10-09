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
  `initSceneN` / `playSceneN` / `resetSceneN` / `stopSceneN`.
- **La única excepción es `comic/assets/lottie-web-5.13.0.min.js`.** Es
  software de terceros y su cabecera es la licencia MIT: no se toca.

## Estructura

```
.
├── index.html              La portada
├── assets/                 Recursos compartidos por todo el sitio
│   ├── css/
│   │   ├── pulp.css        Base visual común: paleta, papel, viñetas
│   │   ├── menu.css        Menú común de las cuatro páginas y bloque "Sigue explorando"
│   │   └── home.css        Solo lo propio de la portada
│   ├── js/
│   │   ├── pulp.js         Revelado al scroll y paralaje del masthead
│   │   ├── personajes.js   Las cinco fichas, compartidas por portada y cómic
│   │   └── home.js         Solo lo propio de la portada
│   └── img/                favicon.svg y las cuatro og-*.jpg (vista previa al compartir)
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
        ├── presentacion-c3/ Presentación animada del capítulo tres
        ├── capitulo-n1/     Escenas 1 a 3, cada una con su img/ y su json/
        ├── capitulo-n2/     Escenas 1 a 4, cada una con su img/ y su json/
        └── capitulo-n3/     Escena 1, con su img/ y su json/
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
<link rel="stylesheet" href="../assets/css/menu.css">
<link rel="stylesheet" href="helikon.css">
```

### El menú común

Las cuatro páginas (portada, cómic, Juanes, Helikón) comparten **la misma barra
de navegación**, definida en `assets/css/menu.css`: `Inicio · El cómic · Juanes
· Helikón`. Reglas:

- **Los cuatro botones están siempre.** La página actual no desaparece: lleva
  `aria-current="page"`, se ve resaltada y su enlace apunta a sí misma (`./`).
- **La barra es fija** (`position: sticky`), así que acompaña al scroll.
- **Cada botón mide al menos 44 px de alto** para que se pueda tocar con el dedo.
- Se escribe a mano en cada HTML (no hay motor de plantillas), con las rutas
  relativas de esa carpeta. Al añadir una página nueva, hay que sumarla a las
  cuatro barras.
- El color sale de variables (`--menu-fondo`, `--menu-texto`, `--menu-linea`,
  `--menu-activo-fondo`…) con valores de papel por defecto, que son los de las
  cuatro páginas. Si una página necesitara otra paleta, las redefine en su CSS.
- `menu.css` también trae el bloque `.sigue` ("Sigue explorando"): tarjetas con
  los destinos que quedan, al final de Juanes.
- Y el **índice de página** (`.indice`: "En esta página" con saltos a cada
  sección), que usan las dos páginas largas, Juanes y Helikón. Cada enlace
  mide 44 px de alto y apunta a un `id` de sección; `menu.css` fija
  `scroll-padding-top` para que la barra fija no tape el título al saltar.
  Si se añade o se cambia el `id` de una sección, hay que tocar su índice.

**Nombres del sitio.** Ya no se usa "Nº 0", "Nº 1", "Edición especial" ni "Bio".
Cada página se llama por lo que es: *El cómic*, *Juanes* y *Helikón (el
estudio)*, y cada título de pestaña es distinto.

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

### `assets/js/personajes.js` — las fichas, en un solo sitio

Define `window.PERSONAJES`: las cinco fichas con su `id`, `color`, `nombre`,
`rol`, la lista de `gestos`, la tabla de `datos` y la `nota`.

Las notas **no adelantan la trama** (son una frase o dos). Para el Ente, el
dato "Aparece" pasó a "Origen: Desconocido".

**Lo carga la portada**, antes de su propio script, para el expediente a
pantalla completa. Vivían dentro de `comic.js` hasta que los personajes salieron
del televisor; el archivo se quedó porque las fichas siguen siendo una sola
fuente y así están listas para la siguiente página que las necesite.

Los gestos **no son los mismos para todos**. El Ente tiene *desagrado* y
*somnoliento* donde los demás tienen *miedo* y *aburrimiento*, así que la lista
se lee de cada ficha y nunca se da por supuesta.

### `assets/js/home.js` — portada

- `playClickSound()` — clic sintetizado con Web Audio. Reutiliza **un único
  `AudioContext`** para toda la página: crear uno por clic deja contextos
  huérfanos y los navegadores limitan cuántos permiten por pestaña. Si el
  navegador no tiene Web Audio, o el audio falla, la navegación sigue
  funcionando.
- Inclinación 3D de los paneles siguiendo el cursor, más una luz radial que
  se mueve con él. El panel bajo el cursor sube a `z-index: 10` para que su
  sombra dura no quede tapada por el vecino.
- `initPortada()` — paralaje de la portada. Cada elemento con clase
  `.capa` se desplaza según su `data-profundidad`: positivo sigue al cursor,
  negativo va al contrario, y así el título, los anillos y Juanes parecen
  estar a distinta distancia. Escribe la propiedad `translate`, se agrupa en un
  cambio por fotograma y no hace nada con movimiento reducido ni en pantallas
  táctiles.

### La portada: un cómic abierto por la primera doble página

`index.html` no es una web con tres botones: es **la portada de un cómic**,
abierto. En escritorio se ven dos hojas enfrentadas; en móvil (≤ 760 px) se
apilan en vertical, como un webtoon.

- **Hoja izquierda, la portada** (`.portada`). Lleva lo que tiene la portada de
  un cómic impreso: caja editorial en la esquina con la cara del niño y el sello
  Helikón, fecha, precio y código de barras. El título es el **logotipo oficial** y los
  anillos rojos vienen de la presentación animada del capítulo uno. Juanes se
  sale del marco por abajo.
- **Hoja derecha, la página 1** (`.pagina`). Un cartucho de narrador y tres
  viñetas de tamaño distinto que llevan a las tres secciones, con personajes
  reales del cómic hablando en globos (`.globo`). La viñeta del cómic es la más
  grande porque es la entrada principal.
- **Debajo**, el reparto con los cinco personajes y la contraportada: "Continuará
  en el capítulo tres", con el rótulo real de *El Desenlace*, y los créditos del
  equipo.
- **Una pista de scroll** (`.baja-pista`): un enlace fijo "Sigue bajando ▼" que
  lleva a `#reparto`. La doble página ocupa casi toda la ventana y no se ve
  que haya más debajo; la pista se oculta sola en cuanto se baja 80 px
  (`initPistaBajar()` en `home.js`). En escritorio se coloca sobre el margen de
  la hoja derecha, para no tapar el código de barras; en celular va centrada. La
  flecha solo se mueve si no hay preferencia de movimiento reducido.

**La portada no cuenta la historia.** Las fichas y las tarjetas del reparto
dicen quién es cada personaje, no qué le pasa: nada de crisis, derrota ni
"punto de cambio". Eso se descubre en el televisor.

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
  a las viñetas (`2.5`, `4`) y a las fichas del equipo (`6`, `4`).

### El expediente de personaje, en la portada

Las cinco tarjetas de *El reparto* son botones. Al pulsar una se abre un
diálogo a pantalla completa —`#expediente`— con la ficha entera: rol, tabla de
datos, la nota manuscrita y las seis expresiones del personaje, que se cambian
sin cerrar.

El marcado del diálogo está vacío en el HTML; lo rellena `home.js` a partir de
`window.PERSONAJES`. El orden de la tira es el del reparto, no el del archivo
de datos: `ORDEN_REPARTO` lo fija.

Lo que hay que respetar si se toca:

- **Es un `role="dialog"` con `aria-modal`.** Se cierra con la ✕, con Escape y
  pulsando el fondo. Las flechas ← y → cambian de personaje.
- **El foco vuelve a la tarjeta que lo abrió.** Se guarda en `devolverFocoA`
  antes de abrir; sin eso, quien navega con teclado se queda al principio de la
  página.
- **El foco queda atrapado dentro** mientras está abierto: el Tab da la vuelta
  entre el primer y el último control.
- **El fondo no se desplaza**: `body.con-expediente` le pone `overflow: hidden`.
- Al cambiar de personaje **se vuelve a la figura completa**, porque no todos
  comparten la misma lista de gestos.

### La página de Helikón: el estudio

Cuenta el origen del estudio que hace el cómic. Se lee de arriba abajo:

1. **Menú común**, con "Helikón" resaltado.
2. **Titular y sello**: la entradilla dice qué es Helikón (el estudio que
   dibuja, anima y programa el cómic) antes de contar su origen. El lema gira
   alrededor de un círculo con `textPath`, estirado con `textLength` para que
   dé la vuelta completa. Debajo, el **índice de la página**.
3. **El origen en cuatro viñetas** (`.vineta-origen`): el Monte Helicón,
   Pegaso golpeando la roca, la fuente Hipocrene con las nueve musas y el
   nombre HELIKÓN. Los dibujos son SVG en línea con trazo de tinta.
4. **Manifiesto** como página de impacto, con la lira.
5. **Quién es quién**: fichas del equipo al estilo del *Who's Who* de los
   cómics.
6. **Detrás de cámaras** (`#detras`), que agrupa dos secciones para curiosos,
   con su propio rótulo y los dos subtítulos más pequeños. **Señas de
   identidad**: la paleta con sus cinco tintes y su uso, las tres
   tipografías con muestra en su propia letra, y la regla de los dos mundos
   —papel fuera de la pantalla, turquesa dentro—.
7. **Tablero de ideas** (también en *Detrás de cámaras*), **sigue explorando**
   (dos tarjetas centradas, hacia Juanes y el cómic) y un cierre con enlace
   para volver al inicio.

Reglas de esta página:

- **Nada inventado sobre personas reales.** Sin retratos, sin frases que no
  dijeron y sin estadísticas de "poderes". Las fichas dicen el oficio y lo que
  cada uno aporta al cómic.
- **La paleta y las tipografías de *Señas de identidad* son las de verdad.**
  Los hexadecimales salen de `pulp.css` y cada muestra se escribe con la fuente
  que anuncia. Si la paleta cambia, esa sección cambia con ella.
- **El dibujo del monte usa `preserveAspectRatio="xMidYMax slice"`** con la
  cima centrada en un lienzo de 1000×260, de la misma proporción que la viñeta.
  Así, en móvil se recortan los lados pero la cima y el templo siempre se ven.
  En móvil, además, el cartucho del monte baja a la base para no taparla.
- **Las fichas del equipo no llevan la animación de asentado** de `pulp.css`:
  van inclinadas con `rotate`, y esa animación también escribe `rotate`.
- **Las sombras del título van en `em`**, no en píxeles. Con desplazamientos
  fijos, a tamaño de móvil las capas de papel y tinta se separaban y dejaban
  franjas claras entre las letras.
- **El sello dice "Estudio"** en la parte baja, en Bangers a 32 px, para que no
  roce el borde del círculo rojo.

### `juanes/juanes.js`

- `updateReadingProgress()` — barra de progreso de lectura (`#inkFill`).
- `animateCount(el)` — las cifras de reconocimientos cuentan hacia arriba la
  primera vez que entran en pantalla. El texto puede traer prefijo y sufijo
  (`+15M`), así que se separa con `/^(\D*)(\d+)(.*)$/` y solo se anima la
  parte numérica; al terminar se restituye el texto original. No se ejecuta
  si el usuario pidió movimiento reducido.
- `initLinea()` — la línea de tiempo interactiva. Ver abajo.

### La página de Juanes: "Basado en hechos reales"

La biografía contada como un cómic: menú común, titular con
el retrato tramado y un sello, **un aviso de que es una página no oficial**
(`.aviso-no-oficial`, justo bajo la entradilla), el índice de la página, el origen, **la línea de tiempo**, su música,
cifras en estallidos, el activismo, el paso al cómic, un bloque **Sigue explorando** y las **fuentes**.

**Esta página habla de una persona real, así que cada dato está contrastado**
y citado en la sección de fuentes al final. Antes de añadir o cambiar un dato,
compruébalo y añade su fuente. Donde las fuentes no coinciden, la página no
elige una: lo dice (el fin de Ekhymosis aparece como "1997–98" y los Latin
Grammy como "+25").

#### La línea de tiempo

La cuerda de guitarra es el eje de años, de 1972 a 2026, y **la púa es el
cursor que se arrastra**. Encima va una tira de viñetas, una por hito, que se
arrastra, se desliza o se recorre con los botones.

Qué se puede hacer:

- **Arrastrar la púa** por la cuerda: la tira salta al hito más cercano a ese
  año y la cuerda vibra.
- **Deslizar la tira** con el dedo o arrastrarla con el ratón; al soltar, se
  centra el hito más cercano.
- **Pulsar una viñeta** para ir a ella.
- **Filtrar** por Música, Premios, Activismo o Vida. Si el hito activo queda
  oculto, salta al visible de año más cercano.
- **Reproducir**: avanza un hito cada 2,8 s. Se pausa con cualquier
  interacción y al cambiar de pestaña.
- **Teclado**: flechas, Inicio y Fin en la tira; en la cuerda, que es un
  `role="slider"`, también arriba y abajo.
- **El marcador** muestra el año, el título, los álbumes y Grammy acumulados
  hasta ese punto, y la posición entre los hitos visibles.

**Para añadir un hito**, basta un `<li class="hito">` más, en su orden
cronológico, dentro de `#lineaTira`:

```html
<li class="hito" data-anio="2027" data-tipo="musica" data-disco>
  <span class="hito-anio">2027</span>
  <span class="hito-tipo">Álbum</span>
  <h3 class="hito-titulo">Título</h3>
  <p class="hito-texto">Una o dos frases, con su fuente comprobada.</p>
  <svg class="hito-icono" aria-hidden="true"><use href="#icono-musica"/></svg>
</li>
```

- `data-tipo`: `musica`, `premio`, `activismo` o `vida`. Decide el color, la
  onomatopeya y el filtro.
- `data-disco` suma al contador de álbumes, y `data-grammy` al de Grammy.
- Si el año pasa de 2026, hay que subir `MAX` en `juanes.js`,
  `aria-valuemax` en la cuerda y recolocar las marcas de década.
- **El orden importa**: los contadores suman todo lo que va antes en la lista.

Dos decisiones técnicas que no conviene deshacer:

- **Mientras la tira va hacia un hito elegido, el detector de scroll no
  interviene** (`navegando`). Si lo hiciera, durante el desplazamiento suave
  marcaría como activo el hito del que se sale, y un segundo clic rápido
  partiría de ahí y perdería un paso.
- **El centrado inicial y el de los filtros se hacen directamente, sin
  `requestAnimationFrame`.** El script va al final del `body` y las medidas ya
  existen; con un fotograma de espera, si la pestaña no dibujaba, el centrado
  quedaba pendiente y devolvía la tira al principio más tarde.

### `comic/comic.js` — el televisor

Máquina de estados con cuatro banderas: `tvOn`, `isAnimating`,
`introPlaying` e `introEnded`. Mientras `isAnimating` está en `true` los
botones de canal quedan deshabilitados.

**El dial.** `TOTAL_CHANNELS = 10` es el **último índice**, no la cantidad: los
canales van de 0 a 10. `showChannel(index)` es el despachador central — marca
la `<section>` activa, arranca lo que corresponda a ese canal, detiene lo de
los demás, adelanta la carga del siguiente y actualiza el pie de foto.

**Ciclo de vida de una escena.** Todas siguen el mismo patrón:

| Paso | Cuándo corre |
|---|---|
| `prefetchSceneN()` | Desde el canal **anterior**, para calentar la caché de red mientras el lector ve el canal previo. Solo hace `fetch`/`new Image`: **no** crea todavía los objetos Lottie. |
| `initSceneN()` | Al sintonizar el canal, ya visible. Crea las animaciones y engancha sus eventos. Es idempotente, gracias a la bandera `ready`. |
| `playSceneN()` / `resetSceneN()` | Arranca o rebobina la escena. |
| `stopSceneN()` | Al salir del canal y al apagar el televisor. Pausa las animaciones y limpia los `setTimeout` pendientes. |

**Escalado.** `scaleStage(stage, container)` encaja el lienzo de diseño fijo
de **1134x658** dentro del hueco de la pantalla usando `Math.max` de las dos
proporciones, es decir en modo *cover*: llena la pantalla y recorta lo que
sobre, sin deformar. Lo usan las ocho escenas y las tres presentaciones, y se
vuelve a llamar en cada `resize`.

**Numeración de escenas en el código.** `SceneN` cuenta las escenas de todo el
cómic, no las de cada capítulo: `Scene1` a `Scene3` son el capítulo uno y
`Scene4` a `Scene7` son las cuatro escenas del capítulo dos y `Scene8` es la
primera del capítulo tres. Las tres últimas (`Scene6`, `Scene7` y `Scene8`)
usan las clases compartidas `.scene-stage` y `.scene-container`; las
anteriores conservan las suyas, idénticas entre sí, y pueden pasarse a las
compartidas cuando convenga.

**Canales 0, 4 y 9 — Presentaciones.** Las tres se comportan igual, así que
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
- El número de imágenes de cada presentación es **explícito** (cinco en el
  nombre del cómic, seis en cada capítulo) porque pedir una que no existe
  dejaría un 404.
- `hintId` es **opcional**. Solo lo llevan las presentaciones que tienen un
  canal siguiente al que avanzar: la del capítulo uno (`pres1Hint`), la del
  dos (`pres2Hint`) y la del tres (`pres3Hint`). El nombre del cómic, que
  encadena con la del capítulo uno, no lleva aviso. Una presentación sin canal
  siguiente no debe llevarlo: diría "presiona el botón derecho" y no pasaría
  nada.
- Cada capítulo reutiliza el nombre de archivo `titulo.json`, que es el que
  espera la fábrica. El de la presentación del capítulo tres llegó de After
  Effects como `tituloTres.json` y se renombró al copiarlo.

**Avisos de interacción.** Toda escena que se maneja con el ratón o el teclado
lleva su aviso, con la clase compartida `.scene-hint`; las escenas que corren
solas no llevan ninguno. Se ocultan con la clase `is-hidden` en cuanto el lector
hace lo que piden, y cada escena los restablece al sintonizarla.

| Canal | Escena | Cómo se maneja | Aviso |
|---|---|---|---|
| 1 | Capítulo uno, escena I | Clic en la puerta | *Toca la puerta en la pantalla* |
| 2 | Capítulo uno, escena II | Automática | — |
| 3 | Capítulo uno, escena III | Clic en el papá | *Toca a papá para continuar* |
| 5 | Capítulo dos, escena I | Automática | — |
| 6 | Capítulo dos, escena II | Clic en Juanes, cuantas veces quiera | *Toca a Juanes* |
| 7 | Capítulo dos, escena III | Dos clics, en orden: el recuadro y luego el fantasma | *Toca el recuadro*, y después *Toca al fantasma* |
| 8 | Capítulo dos, escena IV | Mantener la flecha derecha, o el botón *Correr* | *Mantén la flecha → para correr* (con pantalla táctil: *Mantén pulsado el botón Correr*) |
| 10 | Capítulo tres, escena I | Clic en Juanes, y opcionalmente en la puerta, la cortina y los libros | *Toca a Juanes y explora el cuarto* |

**Canal 7 — Escena III del capítulo dos.** Es una secuencia de dos pasos, que
guarda en `s6.paso` (`recuadro`, `texto`, `fantasma`). El clic en el recuadro
solo cuenta en el primer paso; el del fantasma, solo en el último, y así no se
puede saltar el orden. Los tiempos de la secuencia (0,5 s, 6,5 s, 7 s, 7,5 s y
8 s tras el primer clic) están en `s6Programar()` y son los que dibujó el
equipo de animación: el texto corre 6 s antes de retirarse el primer bloque.

**Canal 8 — Escena IV del capítulo dos.** Juan corre mientras se mantenga la
flecha derecha y se detiene al soltarla (`s7Correr()` y `s7Soltar()`), a
360 px/s hasta `S7_LIMITE`. El movimiento va por `requestAnimationFrame` con el
tiempo real entre cuadros, así que la velocidad no depende del monitor.

El botón **Correr** (`#s7Boton`) hace lo mismo con el ratón o el dedo: al
pulsarlo llama a `s7Correr()` y al soltarlo, a `s7Soltar()`. Usa
`setPointerCapture` para que seguir sosteniéndolo aunque el dedo se salga del
botón no deje a Juan parado. Cuando Juan llega al final, el botón pasa a
decir *Siguiente escena →* y al pulsarlo cambia de canal, así nadie tiene que
buscar la perilla pequeña del televisor. Se restablece al sintonizar el canal.
El aviso de la escena tiene dos textos (`.solo-teclado` y `.solo-tactil`), y
una media query `(hover: none)` elige cuál se ve.

**Canal 10 — Escena I del capítulo tres.** El cuarto de Juanes: un fondo
(`fondo.jpg`, pintado como `background-image` del propio `#scene8Container`) y
cinco animaciones encima. Mamá, asomada, corre en bucle y solo se deja ver
cuando se abre la puerta. La puerta se puede tocar cuantas veces se quiera y
reinicia su animación. La cortina y los libros reaccionan **una sola vez** y
se quedan en su estado final (clase `is-locked`, que también quita el cursor
de mano). Juanes, al tocarlo, sigue escribiendo en bucle y dispara el globo de
texto (`txt.json`, unos 14 s), que se desvanece solo al terminar. El globo
lleva `pointer-events: none`: se superpone a la cortina y a los libros y, aun
invisible, se comería sus clics. El aviso se oculta al tocar a Juanes y se
coloca a la derecha (`#scene8Hint`) para no tapar al personaje.

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

**Teclado.** Flechas izquierda y derecha cambian de canal. **Excepción en el
canal 8:** ahí la flecha derecha hace correr a Juan (`s7ControlaFlecha()`), y
las repeticiones de tecla se ignoran para que mantenerla pulsada no salte de
canal. Cuando Juan ya llegó al final, la siguiente pulsación vuelve a cambiar de
canal. La flecha izquierda siempre cambia de canal. Espacio y Enter
encienden o apagan, **salvo si el foco está dentro del televisor**
(`tv.contains(document.activeElement)`): sin ese guard, pulsar Enter sobre
"canal siguiente" o sobre "Saltar" apagaba el aparato.

**Primer minuto.** Con el televisor apagado, un cartel que ocupa toda la
pantalla (`#tvCartel`, un `<button>`) dice *Toca la pantalla para encender* y
*o pulsa el botón rojo →*. Tocar cualquier punto de la pantalla enciende
(`powerOn()`), igual que el botón rojo. El cartel solo se ve con `.tv.is-off`
y se desvanece al encender. Mientras el televisor está apagado, el botón rojo
tiene un área táctil de al menos 44 px; encendido vuelve a su tamaño, porque en
un celular se solapaba con la perilla de "canal anterior" y un toque de más
podía apagar el aparato.

**Leyenda bajo el televisor.** Ya no dice "Canal 3 / 10": `leyendaCanal()` arma
*Capítulo 2 — Escena I · 6 de 11*, con el nombre de `channelNames` y el
contador calculado desde `TOTAL_CHANNELS`, así que no se desactualiza al añadir
escenas. Hasta que el lector cambia de canal por primera vez (`ayudaVista`), la
leyenda añade cómo hacerlo: *usa ← → o las perillas* con teclado y *desliza o
usa las perillas* con pantalla táctil.

**Celular.** Deslizar el dedo horizontalmente sobre la pantalla cambia de
canal: a la izquierda avanza y a la derecha retrocede
(`SWIPE_MIN_PX` = 60 px, más horizontal que vertical, en menos de 700 ms). Va
con eventos de puntero y solo reacciona a `pointerType === 'touch'`; el botón
*Correr* queda fuera. En vertical y con ancho de hasta 640 px aparece bajo la
leyenda *Mejor en horizontal: gira el teléfono para ver el televisor más
grande*.

**Apagado.** `powerOff()` detiene *todas* las escenas y las tres
presentaciones. Si no, sus animaciones Lottie seguirían consumiendo CPU sin
verse.

**Marco de la página.** La página del cómic comparte el lenguaje del resto del
sitio: fondo de papel con trama de puntos y viñeta (`body`, `body::before` y
`body::after`, copiados de `pulp.css`) y el menú común con su estilo por
defecto. No se enlaza `pulp.css` entera porque redefine `--ink` y `*`, y
`comic.css` usa esos nombres para otra cosa. `.tv-stage` lleva `z-index: 2`
para que la trama de papel quede *debajo* del televisor y no empañe la
pantalla. El interior del televisor conserva su propia paleta turquesa.

### Puntos no obvios del CSS

- **La pantalla va por encima del marco.** En `comic/index.html`, `.tv-screen`
  se declara antes que `.tv-frame`, pero el arte del televisor se dibuja
  encima; los botones son zonas activas alineadas sobre ese arte.
- **El televisor tope a 1566 px** — `width: min(1566px, 99vw, calc((100vh - 112px) * 1.6930))`.
  1566x925 es la resolución nativa de `tv.png`: pasar de ahí solo escala hacia
  arriba y se ve borroso.
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

## Cómo se trabaja

Toda modificación nueva pasa por un plan antes de convertirse en código, y cada
plan lleva su **ficha de activación**: qué plugins, conectores, skills y
herramientas deben estar listos. El método, la plantilla, el catálogo de lo
que hay y las puertas de calidad están en [`METODO.md`](METODO.md).

## Herramientas de trabajo

Estas herramientas **no son dependencias del sitio**: corren en tu máquina para
producir archivos, y lo que llega al repositorio es el resultado ya optimizado.
Esa es la manera de mejorar los recursos sin romper la regla de "sin proceso de
compilación".

**El estado es por máquina, no del proyecto.** Lo que esté instalado en un
equipo no lo está en otro: comprobado el 22 de septiembre de 2026, en esta
máquina hay `git` pero **no hay `ffmpeg`**. Antes de dar por hecho que una
herramienta está, compruébalo con `command -v <herramienta>`.

| Herramienta | Para qué | Estado |
|---|---|---|
| `git` | Control de versiones | Instalado |
| `ffmpeg` | Comprimir `intro.mp4`, convertir renders | Depende de la máquina |
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

## La imagen de vista previa

Cada página tiene la suya (1200x630, entre 110 y 175 KB), que es lo que se ve
al pegar un enlace en WhatsApp, Slack o una red:

| Página | Imagen |
|---|---|
| Portada | `assets/img/og-portada.jpg` |
| El cómic | `assets/img/og-comic.jpg` (el televisor con el título en la pantalla) |
| Juanes | `assets/img/og-juanes.jpg` (el retrato tramado; lleva el crédito de la foto escrito) |
| Helikón | `assets/img/og-helikon.jpg` (el sello del estudio) |

Cada página la declara con `og:image` y su propio `og:image:alt`, más
`twitter:card` en `summary_large_image` para que salga grande y no como
miniatura.

**No son capturas de pantalla**, son composiciones aparte hechas con el mismo
material: la cabecera de papel con "Helikón", el fondo de rayos y puntos de la
trama de cada página, y sus propios recursos (`presentacion-titulo`, `tv.png`,
`juanes-retrato.webp`, el sello SVG de Helikón). Se compusieron en HTML a
1200x630 con Bangers y Special Elite y se exportaron a JPEG con calidad 0,86;
en PNG pesarían varias veces más del techo de 300 KB que fija este README.

**Ninguna lleva "Nº 1" ni "Edición"**: la de la portada se rehízo en la ronda
25 porque todavía decía "Helikón Nº 1".

Si una página cambia de arte, su imagen **no se actualiza sola**: hay que
rehacerla.

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

**Saltar al contenido.** Cada página abre con un enlace `.saltar` ("Saltar al
contenido"), invisible hasta que recibe el foco con Tab. Lleva al `<main id="contenido"
tabindex="-1">`. Su estilo está en `menu.css`, junto con `.visualmente-oculto`,
que ya no se repite en `home.css` ni en `juanes.css`.

**Un `h1` por página.** El cómic tiene el suyo oculto (`.visualmente-oculto`) porque
la pantalla del televisor no lleva títulos de página.

**El teclado en el cómic.** Enter y espacio encienden o apagan el televisor
**solo si el foco no está en un enlace, botón o campo**. Antes lo hacían siempre
y quitaban a Enter su función en el menú.

**Contraste.** Se revisó con axe-core (WCAG 2.2 AA) en las cuatro páginas a 1366 y
360 px, sin avisos, y a mano con un cálculo de contraste de todos los textos. Los
dos casos reales se corrigieron: las tarjetas inactivas de la línea de tiempo de
Juanes (opacidad 0,62 → 0,85) y la cifra de los premios sobre amarillo (ahora tinta
con sombra roja). Quedan fuera de la norma, a propósito, los **rótulos de
letras grandes con contorno de tinta** (el título "Helikón" y las letras del
nombre), que son dibujo y no texto corrido.

**Tamaño táctil.** Los botones de filtro y de control de la línea de tiempo, el
desplegable de fuentes y el enlace "Volver al inicio" miden al menos 44 px. No se
tocaron las flechas del televisor (43 px, van dibujadas en la imagen), el botón
*Saltar introducción* del vídeo ni los enlaces de crédito dentro de una frase.

## Estado del contenido

El cómic tiene el capítulo uno completo (tres escenas), las cuatro escenas del
capítulo dos, la presentación del capítulo tres y la primera escena del
capítulo tres, repartidos en once canales (0 a 10). Al encender, el televisor
reproduce el video de introducción y entrega directo al canal 0.

**El televisor es solo el cómic.** Los personajes se conocen en la portada,
pulsando su tarjeta en *El reparto*. Tampoco hay canales de cierre entre
capítulos: cada capítulo empieza con su presentación y la historia sigue.

| Canal | Contenido | Se arma en |
|---|---|---|
| 0 | Nombre del cómic y presentación del capítulo uno | `presTitulo` + `pres1` |
| 1 | Capítulo uno, escena I — El llamado | `s1` |
| 2 | Capítulo uno, escena II | `s2` |
| 3 | Capítulo uno, escena III | `s3` |
| 4 | Presentación del capítulo dos | `pres2` |
| 5 | Capítulo dos, escena I | `s4` |
| 6 | Capítulo dos, escena II | `s5` |
| 7 | Capítulo dos, escena III | `s6` |
| 8 | Capítulo dos, escena IV | `s7` |
| 9 | Presentación del capítulo tres | `pres3` |
| 10 | Capítulo tres, escena I | `s8` |

Cada capítulo abre con su propia presentación animada, en el canal anterior a
su primera escena. El **canal 0** encadena dos: primero el nombre del cómic,
*Cuerdas del Destino*, y a continuación *Capítulo 1 — El Descubrimiento*. El
**canal 4** presenta *El Mensaje* y el **canal 9**, *El Desenlace*. Se
reproducen al sintonizar el canal y se quedan congeladas en su último
fotograma, que es la portada completa.

La lista completa de pendientes está en la [bitácora](BITACORA.md).
