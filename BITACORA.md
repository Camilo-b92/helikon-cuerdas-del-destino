# Bitácora del proyecto

Este documento complementa el [README](README.md). Allí está **cómo está
armado** el proyecto; aquí está **por qué se tomaron las decisiones** y **en
qué vamos**.

Si retomas el trabajo en otra máquina o después de un tiempo, lee primero el
README y luego esto.

---

## Estado a 6 de octubre de 2026

| | |
|---|---|
| Repositorio | `github.com/Camilo-b92/helikon-cuerdas-del-destino` (público) |
| Rama | `main` |
| Publicado en línea | Todavía no |
| Canales del televisor | 0–10 (once en total), solo cómic |
| Peso total | ~21 MB, casi todo arte del cómic |
| Personajes | En la portada: expediente a pantalla completa desde *El reparto* |
| Presentaciones | Canal 0: nombre del cómic y luego capítulo uno · Canal 4: capítulo dos · Canal 9: capítulo tres |
| Fichas de personaje | `assets/js/personajes.js`, compartidas por portada y cómic |
| Comentarios en el código | Ninguno: la documentación vive aquí y en el README |
| Vista previa al compartir | `assets/img/og-portada.jpg`, `og-comic.jpg`, `og-juanes.jpg` y `og-helikon.jpg`, una por página |

Las cuatro páginas cargan sin errores de consola, sin desborde horizontal en
móvil a 375 px, y respetan `prefers-reduced-motion`.

---

## Decisiones tomadas y por qué

### HTML, CSS y JavaScript sin framework

No es una limitación, es una elección. Son cuatro páginas sin base de datos,
sin usuarios y sin backend, cuyo valor está en una dirección de arte muy
personalizada. Un framework obligaría a instalar Node y un empaquetador para no
ganar nada, y complicaría justo lo que hace especial al proyecto, que es el CSS
escrito a mano.

Si algún día el sitio necesitara decenas de páginas generadas a partir de datos
—por ejemplo, una ficha por personaje— ahí sí valdría la pena reconsiderarlo.

### El código no lleva comentarios

Los archivos propios del proyecto —HTML, CSS y JavaScript— no llevan ni un
comentario. **La documentación es este documento y el README**, y son la única
fuente de verdad.

El riesgo conocido de trabajar así es que el conocimiento se pierda, y ese
riesgo se cubre de una sola manera: **lo que antes iba en un comentario ahora
va a un documento, en el mismo cambio**. El README tiene una sección de *guía
del código* con el mapa de cada archivo y los puntos no obvios del CSS; aquí
abajo está el *por qué* de cada decisión técnica que costó encontrar.

Si haces un cambio que necesite explicación y no la escribes en ninguno de los
dos archivos, esa explicación ya no existe en ninguna parte.

**La excepción es `comic/assets/lottie-web-5.13.0.min.js`**, que es software de
terceros: su cabecera es la licencia MIT y quitarla sería un problema legal, no
de estilo.

### La página del Cómic conserva su propio sistema visual

La portada, Helikón y Juanes comparten la identidad de cómic pulp
(`assets/css/pulp.css`). La página del Cómic **no**, y es a propósito: el
interior del televisor es otro mundo dentro de la misma historia, con su
paleta turquesa y sus tipografías propias.

**Pendiente decidir:** el *marco* de esa página (barra superior, fondo,
pie de foto) sí quedó fuera del sistema. Se podría pasar al lenguaje pulp
manteniendo el interior del televisor intacto. Eso cerraría el círculo visual
sin romper la idea.

### `comic/assets/` no se movió al reorganizar

Al reestructurar el proyecto se movió todo menos esa carpeta. Ahí viven 29
archivos referenciados desde 13 rutas en `comic.css` y 14 en `comic.js`.
Moverlos habría multiplicado el riesgo sin ganar nada. Al dejarlos donde
estaban, ninguno de esos dos archivos necesitó un solo cambio.

### Los personajes salieron del book como SVG, no como imágenes

El *Book de ilustración — Personajes* llegó en PDF, exportado desde
Illustrator. Como el arte de dentro es vectorial, se extrajo **como vector**:
cada personaje es un SVG de entre 17 y 52 KB que escala sin perder nitidez.
Los cinco juntos pesan 216 KB, menos que una sola foto del cómic.

El primer intento fue un conversor propio, escrito sobre
`page.get_drawings()` de PyMuPDF. **No funcionó:** los trazos con varios
subtrazos salían con líneas diagonales fantasma que no existen en el
original. Lo que sí funciona es dejar que PyMuPDF genere el SVG —respeta el
modelo de trazos del PDF— y filtrar después los elementos por posición,
quedándose con los que caen dentro de la región del personaje.

Del book se tomó **solo la figura**: los fondos de color y las manchas
decorativas se descartan por color, y el texto de las fichas por posición.

Un detalle que costó encontrar: PyMuPDF mete en `<defs>` la tipografía de
**toda la página**. Al quedarnos solo con el dibujo no hay ningún `<use>` que
la llame, pero seguía ahí ocupando el **84 %** del archivo. Podando lo que ya
no referencia nadie, los cinco pasaron de 1,2 MB a 216 KB.

El guion de extracción no vive en el repositorio: es de un solo uso y
depende del PDF. Si hay que repetirlo, lo importante es el método —SVG de
PyMuPDF, filtro por región, poda de `<defs>`— y las regiones de recorte,
que están en la ronda 8.

### Las expresiones comparten hueco con la figura, no van aparte

El book trae seis gestos por personaje: treinta caras. Dentro de una pantalla
de televisor no cabe una galería de miniaturas —a ese tamaño una carita no se
distingue de la de al lado—, así que los botones son solo texto y la cara
elegida ocupa el hueco del retrato, en grande. *Figura* vuelve al cuerpo
entero.

Se cargan solo las seis del personaje que se está viendo, y se adelantan al
abrirlo: son 120 KB por personaje, no los 776 KB del conjunto.

### Se retiraron los canales de Historial y Stop motion

Eran marcadores de posición sin contenido a la vista. Dejar canales vacíos en
el dial hace que el televisor se sienta incompleto justo al encenderlo, que es
el primer sitio donde cae el lector. Se retiran hasta que haya algo que poner;
volver a añadirlos es añadir su `<section>` y correr la numeración.

Eso dejó el dial en **nueve canales (0–8)** en vez de once.

### Las presentaciones viven en el dial, no en el encendido

La presentación del capítulo uno era una capa que se veía **una sola vez**,
entre el video de introducción y el menú. Quien llegaba al cómic por segunda
vez no volvía a verla, y quien saltaba la introducción se la encontraba igual,
descolgada de lo que venía después.

Ahora cada capítulo abre con la suya, en el canal anterior a su primera
escena: el **canal 1** presenta *Cuerdas del Destino* y el **canal 6**, *El
Mensaje*. Las dos reemplazaron a las portadas de texto que había en esos
canales, que decían lo mismo con tipografía en vez de con arte.

Se reproducen al sintonizar el canal y se quedan congeladas en el último
fotograma —que es la portada completa, con todas sus capas visibles— así que
funcionan igual de bien como animación y como portada fija. El aviso para
avanzar aparece **al terminar**, para no taparla mientras corre.

### No hay canal de cierre entre capítulos

*Decidido el 6 de octubre de 2026, a petición del equipo.* El canal 4 era una
pantalla de texto —*Fin del capítulo uno · La cuerda sigue sonando*— que cerraba
el capítulo uno. Se retiró, y **los capítulos que faltan tampoco llevarán una**:
la última escena de un capítulo pasa directo a la presentación del siguiente.

El motivo es el mismo que ya había retirado las portadas de texto del dial: era
tipografía diciendo lo que la presentación animada del capítulo siguiente ya
dice con arte, y obligaba al lector a pasar por un canal sin nada que hacer.

Quitar un canal del medio corre la numeración de todos los siguientes. El
cambio va completo: `TOTAL_CHANNELS`, los `data-channel`, los índices de
`showChannel()` y la tabla del README. Se retiraron además `.ch-eyebrow`,
`.ch-title` y `.ch-text`, que solo usaba ese canal, y el centrado en columna de
`.channel`, que ya no usa ninguno.

### Toda escena con interacción lleva su aviso, y las automáticas no

*Decidido el 6 de octubre de 2026, a petición del equipo.* Si una escena espera
un clic o una tecla, dice cuál. Si corre sola, no dice nada. La tabla de qué
canal tiene qué está en el README, en *Avisos de interacción*.

Al revisarlo faltaba el aviso en el **canal 6** (capítulo dos, escena II), donde
el clic sobre Juanes saca el globo de texto y nada lo anunciaba. Los de los
canales 1 y 3 ya existían, con dos clases idénticas (`.scene1-hint` y
`.scene3-hint`); se unificaron en `.scene-hint`.

La **escena IV del capítulo dos no se maneja con clic sino con la flecha
derecha**. No encaja en la regla tal cual, pero el espíritu es el mismo: sin
aviso nadie sabría que Juan corre si se mantiene una tecla. Lleva el suyo.

### La flecha derecha tiene dos dueños en el canal 8

El televisor usa las flechas para cambiar de canal, y la escena IV del capítulo
dos hace correr a Juan con la flecha derecha. Las dos cosas no caben en la misma
tecla sin una regla:

- En el canal 8, la flecha derecha **mueve a Juan** hasta que llega al final.
- Las repeticiones de tecla (mantenerla pulsada) se ignoran en ese canal, para
  que al llegar al final no salte de canal sin querer.
- Con Juan ya al final, la siguiente pulsación **sí** cambia de canal.
- La flecha izquierda y los botones del televisor cambian de canal siempre.

La escena, tal como llegó del equipo de animación, escuchaba el teclado entero
y no sabía nada del televisor.

### El revelado al hacer scroll se activa desde JavaScript

`assets/js/pulp.js` añade la clase `.js-reveal` a `<html>`, y solo entonces el
CSS oculta los elementos con `[data-reveal]`. Si el JavaScript falla o no
carga, el contenido se ve igual en vez de quedarse invisible para siempre.

### No hay fotos del equipo

Las fichas de integrantes en la página de Helikón usan las iniciales y un
icono del oficio, no retratos. No teníamos fotos y no se generaron con IA.

### Se quitó la transición de "pasar la página"

Había una animación que mostraba una hoja de cómic girando antes de navegar.
Se retiró por decisión de diseño: los paneles ahora son enlaces normales que
navegan directo. Quedó eliminada de las tres páginas —marcado, CSS y JS.

### Se quitó la ilustración del emblema

El masthead tenía un SVG de una montaña con una estrella. Se retiró por
decisión de diseño; quedó solo el logotipo de texto "HELIKÓN" con su subtítulo.

### El 3D entra vivo, no como render fijo

*Decidido el 16 de septiembre de 2026.* El sitio va a incorporar 3D
**interactivo**, con dos enfoques que conviven según lo que pida cada sitio:

- **`<model-viewer>`** para piezas acotadas dentro de una viñeta: un modelo
  girable con el mouse, con carga diferida, sin escribir código de render.
  Es el caballo de batalla y debería cubrir la mayoría de los casos.
- **three.js** donde haga falta una escena propia —luces, cámara, materiales,
  interacción a medida—. Cuesta más y pesa más, así que se reserva para el
  momento en que `<model-viewer>` se quede corto, no se usa por defecto.

Esto **revierte** la decisión anterior, que limitaba el 3D a renders PNG. Lo
que no cambia es el motivo por el que existía esa regla: el sitio ya carga
20 MB y una portada que tarde en abrir espanta al lector. Así que la decisión
viene con condiciones, y hay que respetarlas al implementar:

- **Nada de 3D en la ruta crítica.** El modelo se carga en diferido, después de
  que la página sea usable, nunca bloqueando el primer pintado.
- **Presupuesto por modelo.** Los `.glb` pasan por `gltf-transform` (compresión
  Draco o meshopt, texturas reescaladas) antes de entrar al repositorio.
- **Siempre hay plan B.** Un `<img>` o un póster fijo mientras el modelo carga,
  y como reemplazo permanente si el navegador no puede con WebGL o si el
  usuario pidió movimiento reducido. La página tiene que funcionar sin el 3D.
- **Las páginas de papel primero.** Si hay que sacrificar peso en algún sitio,
  se sacrifica dentro del televisor, que ya es la zona pesada y donde el lector
  llega dispuesto a esperar.

*Primer caso real (ronda 26):* el vinilo de Juanes usa three.js, sin modelos
descargados —la geometría es de primitivas y las texturas se dibujan en un
`<canvas>`—, así que el único peso es la librería: 691 KB, 171 KB comprimido,
cargada en diferido. `<model-viewer>` sigue siendo la opción para modelos `.glb`.

### El televisor sigue siendo una imagen, por ahora

*Decidido el 16 de septiembre de 2026.* Se probó convertir `tv.png` en un
televisor con volumen en CSS 3D, dos veces, y **ninguna convenció**. El
televisor se queda como imagen plana porque funciona mejor tal como está. La
decisión es "por el momento": no cierra la puerta, pero cualquier intento nuevo
debería empezar leyendo esto.

Los dos intentos, que se hicieron en páginas de prueba aparte y nunca tocaron
el cómic real:

- **Uno hecho con Claude.** El frente seguía siendo `tv.png` con la pantalla
  viva, y el CSS 3D añadía la carcasa por detrás. Apagado se veía girado con el
  volumen; al encenderlo se giraba de frente para leer.
- **Uno propuesto por Gemini y luego corregido.** Tal como llegó **no se podía
  encender el televisor con el ratón**. Corregido, quedó muy parecido al
  anterior, con las caras de color liso.

Funcionar, funcionaban: se probaron con clics reales, en móvil y en portátil.
Lo que no convenció fue el resultado visual.

**Lo que se aprendió, para no repetirlo.** Todo está medido en el navegador:

1. `filter` y `overflow: hidden` sobre un elemento `preserve-3d` aplanan el 3D.
2. Dentro de un contexto `preserve-3d`, z-index deja de ordenar: el PNG podía
   tapar la pantalla. El frente tiene que ser un contenedor **plano**.
3. **`preserve-3d` en el contenedor del frente rompe los clics.** Con esa sola
   línea, `elementFromPoint` devolvía `#tv` en vez del botón, y el clic real no
   encendía el televisor. Fue el fallo de la versión de Gemini.
4. `perspective` solo afecta a los **hijos directos**. Puesta en un abuelo no
   hace nada: se comprobó midiendo los dos laterales, que salían iguales.
5. Con perspectiva cerrada (~2,6 veces el ancho), los laterales quedan
   escondidos detrás del frente y el televisor parece plano. Con ~6 veces el
   ancho y un giro de −9°/−16° sí se ven.
6. Con `transform-origin` en el borde izquierdo, `rotateY(-90deg)` manda la
   cara **hacia delante**, no hacia atrás. Así las caras asomaban por encima del
   dibujo.
7. Controlar el giro con una variable CSS normal costó **21–36 ms** por cambio
   (recalcula los ~770 nodos del cómic); con `@property` e `inherits: false`,
   **0,07–0,2 ms**. Un fotograma tiene 16,7 ms.
8. La perspectiva ensancha el televisor: al 99vw aparece barra horizontal.
   Hay que medir incluyendo las caras laterales, no solo el frente.
9. Si el televisor sigue al cursor, los botones se mueven justo cuando vas a
   pulsarlos. Y con la pantalla inclinada, los diálogos se leen peor.
10. Las esquinas redondeadas de `tv.png` necesitan varias tiras por esquina;
    con caras rectas, sus picos asoman por detrás de las curvas.

Los archivos de las dos pruebas no están en el repositorio.

### La imagen de vista previa se compone, no se captura

*Decidido el 22 de septiembre de 2026.* Faltaba `og:image`, así que al
compartir un enlace del sitio no se veía nada.

Lo natural habría sido capturar la portada, pero es una **doble página
apaisada** y recortarla a 1200x630 dejaba fuera la mitad. Se compuso una imagen
propia en un `<canvas>` reutilizando el material de la portada —el rojo, los
rayos, el logotipo y la figura de Juanes—, de modo que reconoces el sitio antes
de abrirlo.

Dos cosas aprendidas al hacerla:

- **En PNG pesaba 651 KB**, seis veces el techo de 300 KB por archivo. El mismo
  dibujo en JPEG con calidad 0,88 baja a **109 KB** sin diferencia visible: son
  degradados, no arte de línea, y ahí el JPEG gana.
- **La ruta quedó relativa**, porque el sitio no tiene dominio todavía. Los
  lectores de enlaces suelen resolverla, pero la especificación pide URL
  absoluta: está anotado en los pendientes para el día de la publicación.

### El canal 1 encadena dos presentaciones

*Decidido el 22 de septiembre de 2026.* El canal 1 abre con el **nombre del
cómic** y, sin intervención, sigue con la **presentación del capítulo uno**.

Hasta ahora la carpeta `presentacion-c1/` guardaba el logotipo de *Cuerdas del
Destino*, no el capítulo uno: el nombre mentía. Se renombró a
`presentacion-titulo/` y `presentacion-c1/` pasó a ser lo que dice, la pieza
que llegó de After Effects.

Las dos viven en el mismo canal, apiladas. La fábrica `crearPresentacion`
aceptó un `alTerminar` opcional: cuando la primera acaba, espera
`RELEVO_MS` (900 ms, para que el nombre se lea) y entonces desvanece la primera
y arranca la segunda.

**El relevo no depende de que Lottie emita `complete`.** Si el navegador deja
de emitir fotogramas —pestaña en segundo plano, ahorro de energía— la red de
seguridad de `PRES_SAFETY_MS` dispara `finish()` igual, y el relevo ocurre.
Comprobado con `requestAnimationFrame` muerto: a los 6,5 s el aviso se marca
terminado y a los 7,4 s la segunda presentación ya está en pantalla.

El aviso de "pulsa el botón derecho" pertenece a la **segunda**, no a la
primera, y `abrirCapituloUno()` lo esconde al entrar: sin eso quedaba visible
desde el primer instante al volver al canal.

### Helikón pierde dos secciones y gana la identidad

*Decidido el 22 de septiembre de 2026.* Se retiraron **Extras del taller** y
**Expedientes del estudio**, y el panel bloqueado de *Próximo capítulo* del
final. En su lugar entra **Señas de identidad**.

El motivo de qué poner: las secciones que quedaban ya contaban el origen del
nombre, el manifiesto y quién es quién. Lo que no contaba ninguna era **cómo se
ve Helikón y por qué**, que es justo lo que lo hace reconocible como marca. La
sección muestra la paleta con sus cinco tintes y su uso, las tres tipografías
con una muestra de cada una en su propia letra, y la regla de los dos mundos
—papel fuera de la pantalla, turquesa dentro—.

Con el panel bloqueado fuera, *Nuestro universo* pasa de tres viñetas a dos, y
el hover ya no necesita excluir `.panel-locked`. Se retiraron 213 líneas de CSS
que se quedaron sin uso.

### El televisor es solo el cómic

*Decidido el 22 de septiembre de 2026.* El canal 0 presentaba a los cinco
personajes. Se retiró: **el televisor queda para leer el cómic y nada más**.

El motivo es que dejó de hacer falta ahí. Desde que la portada abre el
expediente a pantalla completa —con la misma ficha, la misma tabla y las mismas
seis expresiones, y además más sitio para leerla— tener lo mismo dentro de una
pantalla de 1134x658 era repetirlo en el peor de los dos formatos.

El dial pasa de nueve canales a **ocho (0–7)**, y el canal 0 es ahora la
presentación. Con eso, encender el televisor lleva directo a la historia: video,
nombre del cómic, capítulo uno y primera escena, sin desvíos.

`assets/js/personajes.js` **se queda**. Ya no lo carga el cómic, solo la
portada, pero sigue siendo la única fuente de las fichas y está listo para la
próxima página que las pida. Se retiraron 130 líneas de JavaScript y 181 de CSS.

### Los gráficos son SVG en línea, no imágenes

El proyecto no tenía archivos de imagen para las tres páginas de papel, así que
las ilustraciones (plumilla, guitarra, televisor, reloj de arena, iconos de
oficio, ecualizador, vinilos) se dibujaron como SVG dentro del HTML. Escalan sin
perder nitidez, no pesan y no dependen de nada externo.

Cuando haya material gráfico propio, puede reemplazarlos o convivir con ellos.

---

## Detalles técnicos que costó encontrar

Cada uno de estos se pagó con tiempo de depuración. Si vas a tocar la zona que
menciona, léelo antes.

### `caja.json` va en el renderizador `canvas`, y las demás no

`caja.json` pesa 2,6 MB. Con el renderizador `svg` de Lottie, que crea un nodo
del DOM por forma, **congelaba el navegador**: son miles de nodos. En `canvas`
va bien. Además lleva `setSubframe(false)`, que en vez de interpolar y
redibujar en cada instante de tiempo solo redibuja en los fotogramas reales del
archivo.

Lo que **no** se puede hacer es pasar todo a `canvas`: `texto.json` tiene una
capa de texto real, y el renderizador `canvas` no maneja bien su color ni su
tipografía —salía en negro—. Por eso `juanesBusca` y `texto` siguen en `svg` y
solo `caja` usa `canvas`.

A la caja se la remide **una sola vez**, cuando su renderizador termina de
construirse (`DOMLoaded`), y no en cada reproducción: remedirla en cada ida y
vuelta al canal era lo que seguía colgando el navegador.

### El prefetch no puede crear los objetos Lottie

Las funciones `prefetchSceneN()` solo hacen `fetch` y `new Image`: calientan
la caché de red, nada más. **No pueden crear todavía las animaciones** porque
el renderizador `canvas` fija su tamaño según el contenedor en el momento en
que se crea, y el canal siguiente sigue oculto (`display: none`, es decir 0x0).
Crearlas de verdad es trabajo de `initSceneN()`, que solo corre cuando el
canal ya es visible.

### El aviso para avanzar se oculta con `visibility`, no con `opacity`

Un desvanecido habría quedado mejor, pero la animación `blinkHint` anima justo
`opacity`, y una animación gana sobre una declaración normal. Con `opacity` el
aviso se habría visto desde el primer fotograma.

### `prefers-reduced-motion` neutraliza la duración, no el retraso

Las escenas usan `animation-delay` para escalonar la entrada de cada capa: el
panel de texto de la escena 2 entra a los 8 s, sincronizado con su Lottie. Con
`animation: none` esas capas se quedaban en su posición inicial, fuera de
cuadro. Poniendo la duración casi en cero y dejando el retraso intacto, saltan
directo a su posición final y llegan a tiempo.

### Las redes de seguridad de `requestAnimationFrame`

Si el navegador deja de emitir frames —pestaña en segundo plano, ahorro de
energía— `requestAnimationFrame` no vuelve a dispararse. Sin protección, el
televisor se quedaba trabado con `isAnimating` en `true` y los botones
apagados. Por eso `runStatic` lleva un `setTimeout` de respaldo
(`duration + 1200`) y las presentaciones otro de 6 s (`PRES_SAFETY_MS`).

### El contador `token` de las presentaciones

Entrar y salir rápido de un canal de presentación dejaba el aviso encendido
sobre otro canal: el arranque anterior seguía en vuelo y terminaba después de
haber cambiado de canal. El contador descarta esos arranques huérfanos. El
mismo patrón está en `playScene2()` con `s2PlayToken`.

### El arranque espera al `DOMLoaded` de Lottie

Pedir `goToAndPlay` antes de que el archivo termine de cargar deja la pantalla
en negro. Si el canal se sintoniza antes de que llegue el JSON, el arranque
queda en espera y lo dispara ese evento.

### El teclado y el foco dentro del televisor

Pulsar Enter con el foco en "canal siguiente" o en "Saltar" **apagaba el
televisor**: el navegador ya dispara el clic del botón enfocado, y encima
corría el atajo de encendido. El guard es
`if (tv.contains(document.activeElement)) return`.

### El fin del video de introducción

Se detecta con la **duración real** del archivo, no con un tope fijo de 55 s
que cortaba los últimos segundos. Y si el autoplay está bloqueado o el archivo
falta, `finishIntro()` corre igual: si no, el lector se quedaba mirando una
pantalla negra sin salida.

### El retrato del canal 0 y el lienzo común

Los cinco SVG comparten un lienzo de **760x1000** con la figura a 960 de alto y
centrada. Antes cada uno traía su recuadro ajustado a su pose, y eso los
dibujaba a tamaños distintos: Juanes, con los brazos abiertos, es mucho más
ancho (proporción 0,756 frente a 0,48–0,62 del resto), se topaba antes con el
borde y salía hasta un 58 % más bajo que los demás.

Se encaja con `object-fit: contain` y no con `max-height: 100%`, porque el alto
en porcentaje no llegaba a resolverse en esa cadena de contenedores y el más
alargado —el Ente— se salía sobre las pestañas. Su columna es del **42 %**
(38 % en móvil): con menos, el ancho manda antes que el alto y los cinco salen
más pequeños de lo que caben.

### El televisor no pasa de 1566 px

`1566x925` es la resolución nativa de `tv.png`. Pasar de ahí solo escala hacia
arriba y se ve borroso, así que el ancho es
`min(1566px, 99vw, calc((100vh - 112px) * 1.6930))`.

### Un solo `AudioContext` en la portada

Se creaba uno nuevo en cada clic, dejando contextos huérfanos; los navegadores
limitan cuántos permiten por pestaña. Ahora hay uno solo, reutilizado, y si el
audio falla la navegación no se rompe.

---

## Trabajo hecho

### Ronda 1 — Diagnóstico
Análisis de las cuatro secciones. Se detectaron errores de ejecución, código
muerto, un bug de teclado en el Cómic, dos lenguajes visuales sin unificar y
CSS duplicado tres veces.

### Ronda 2 — Correcciones y rediseño de Juanes
- `Home/script.js` estaba escrito contra un HTML que ya no existía: lanzaba un
  `TypeError` **en cada movimiento del mouse**.
- Fuga de memoria: se inyectaba un `<style>` nuevo en `<head>` por cada hover.
- Código muerto en Helikón (`.floating-dots`, `.team-card` inexistente).
- En el Cómic, pulsar Enter con el foco en "canal siguiente" o en "Saltar"
  **apagaba el televisor**. El guard solo excluía el botón de encendido.
- Se añadió `prefers-reduced-motion` a todas las páginas.
- Juanes se reescribió por completo en el lenguaje pulp, conservando todo el
  texto palabra por palabra.

### Ronda 3 — Consolidación
- Se creó `pulp.css` con la base visual común. El CSS bajó de 1647 a 1035
  líneas.
- Se retiró la ventana emergente de transición.
- Se retiró la ilustración del emblema.

### Ronda 4 — Gráficos y dinamismo
- `pulp.js` con el revelado al scroll y el paralaje del masthead.
- Ilustraciones SVG en las viñetas y en las secciones de Juanes.
- Cifras que cuentan hacia arriba, ecualizador animado, vinilos que giran,
  inclinación 3D que sigue el cursor.
- **Sección EL EQUIPO** en Helikón. Reemplazó a la sección de CRÉDITOS, que
  repetía exactamente los mismos tres nombres y roles.

### Ronda 5 — Estructura y control de versiones
- Se inicializó Git. El commit `8d65efe` es el estado anterior a la
  reorganización, por si hay que volver.
- La portada pasó de `/Home/index.html` a la raíz, así que ahora sí se puede
  publicar en cualquier hosting estático. URLs limpias: `/helikon/`,
  `/juanes/`, `/comic/`.
- `shared/` pasó a `assets/`, con `css/`, `js/` e `img/`.
- README, favicon, `meta description`, Open Graph, `.editorconfig`,
  `.gitattributes`.
- Se eliminó `MEJORAS_HOME.md`, que documentaba código ya retirado. Sigue
  recuperable desde el commit `8d65efe`.
- Subida a GitHub.

### Ronda 6 — Capítulo dos, escena II (trabajo hecho fuera de Claude Code)

> **Ojo con la numeración:** los canales que se nombran en esta ronda y en la
> siguiente son los de entonces. La ronda 8 renumeró el dial de 0–10 a 0–8. El
> "canal 10" de aquí es hoy el **canal 8**.

- **Canal 10** con la escena II del capítulo dos: Juan tocando en la calle,
  con ocho animaciones Lottie. Los cuatro NPC se repiten solos con pausas
  distintas, el cielo gira para pasar de día a noche, y al hacer clic sobre
  Juan aparece un texto que se oculta al terminar.
- **Presentación del título** entre el video de introducción y el menú, con
  su propia red de seguridad de 4 s. La animación dura 2,24 s, así que el
  tope no la corta.
- **Lottie pasa de la CDN a una copia local** en `comic/assets/`. El cómic
  ya no depende de un tercero ni de la conexión.
- El fin del video de introducción se detecta con la **duración real** del
  archivo, no con un tope fijo de 55 s que cortaba el final.

Ajustes añadidos sobre ese trabajo:

- `runStatic` gana una red de seguridad como la de la presentación. Si el
  navegador deja de emitir frames, `requestAnimationFrame` no vuelve a
  dispararse y el televisor se quedaba trabado con los botones apagados.
- `powerOff` limpia el estado de la presentación y **detiene todas las
  escenas**. Antes solo pausaba el humo de la escena 1, así que apagar el
  televisor en el canal 10 dejaba cuatro animaciones corriendo sin verse.
- Se corrigieron las mayúsculas de las carpetas en Git. Ver abajo.

### El bug de las mayúsculas

Al reorganizar el proyecto (ronda 5) las carpetas se renombraron a minúscula
en el disco, pero Git no registró el cambio: en Windows `core.ignorecase`
está en `true` y trata `Comic/` y `comic/` como la misma ruta. El
repositorio quedó con `Comic/`, `Helikon/` y `Juanes/` mientras los enlaces
del HTML apuntaban a minúsculas.

En Windows no se nota. **En un servidor Linux —GitHub Pages, Netlify,
Vercel— cada enlace entre secciones habría devuelto 404**, y el sitio se
habría roto justo al publicarlo. El error habría sido difícil de encontrar,
porque en local todo funciona.

Corregido en el commit `aaa9b10`, renombrando 55 rutas en el índice de Git
sin tocar el disco. Si vuelve a pasar tras renombrar carpetas, el síntoma es
que `git ls-files` muestra una grafía distinta a la del disco. Se comprueba
así:

```bash
git ls-files | sed 's|/.*||' | sort -u
```

---

### Ronda 7 — Las presentaciones pasan a ser canales

> Los números de canal de esta ronda también son los de entonces: los canales
> 3 y 8 de aquí son hoy el **1** y el **6**.

- La presentación del capítulo uno salió del encendido y **es el canal 3**.
  La introducción ahora entrega directo al menú.
- La presentación del capítulo dos —*El Mensaje*— **es el canal 8**. Llegó
  desde After Effects con la misma estructura que la primera: lienzo de
  1134x658, 25 fps y 56 fotogramas (2,24 s).
- `presentacion/` pasó a `presentacion-c1/`, y la nueva entró como
  `presentacion-c2/`. Las dos traen imágenes con los **mismos nombres**
  (`img_0.png`…), así que tienen que vivir en carpetas separadas; cada una se
  carga con su propio `assetsPath`.
- Las dos se comportan igual, así que comparten una sola fábrica,
  `crearPresentacion()`, en vez de duplicar el código.
- El arranque espera al evento `DOMLoaded` de Lottie. Pedir `goToAndPlay`
  antes de que el archivo termine de cargar deja la pantalla en negro.
- Cada presentación se adelanta desde el canal anterior, igual que las
  escenas. El número de imágenes es explícito en cada una —cinco en la
  primera, seis en la segunda— porque pedir una que no existe dejaría un
  404 en la pestaña de red.
- Un contador de sintonización (`token`) descarta los arranques huérfanos: sin
  él, entrar y salir rápido del canal dejaba el aviso encendido sobre otro
  canal.
- Quedó código muerto que se retiró con ellas: `.ch-cover-title`,
  `.ch-cover-sub` y `.ch-play-hint` en el CSS, y todo el sistema de la capa
  `is-title` en el JS.

**Al probar en local, recarga forzada.** Al renombrar `presentacion/` los
navegadores que tengan el `comic.js` viejo en caché piden la ruta anterior y
devuelven 404. Ctrl+F5 (o Ctrl+Shift+R) lo resuelve.

---

### Ronda 8 — El canal de Personajes

- **Canal 0** con los cinco personajes del book: retrato, rol, cinco datos y
  una nota de su papel en la historia. Se cambia de personaje con las pestañas
  de abajo. La ficha la arma `comic.js` desde `PERSONAJES`, así que añadir uno
  es añadir una entrada, no repetir el marcado.
- **Arte extraído del PDF como SVG** a `comic/assets/personajes/`. Regiones de
  recorte usadas, en coordenadas del PDF:

  | Personaje | Página | Región |
  |---|---|---|
  | juanes | 1 | 620, 3420 → 1340, 4310 |
  | nino | 2 | 100, 2340 → 580, 3110 |
  | ente | 3 | 1250, 75 → 1775, 1015 |
  | padre | 4 | 1095, 100 → 1575, 1010 |
  | madre | 5 | 720, 2240 → 1165, 3180 |

- **Fuera Historial y Stop motion.** El dial pasó de 0–10 a **0–8** y todo se
  renumeró: HTML, `showChannel`, `channelNames`, los selectores
  `[data-channel]` del CSS y los dos adelantos de las presentaciones.
- El retrato se encaja con `object-fit: contain` y no con `max-height: 100%`.
- **Los cinco comparten un lienzo de 760x1000.** El detalle completo está
  arriba, en *Detalles técnicos que costó encontrar*.
- En móvil la pantalla del televisor baja a unos 275x160 px y no cabe todo.
  Ahí se oculta la nota y las pestañas pasan a una fila que se desliza.

### Ronda 9 — Las expresiones

- **Treinta caras** (seis por personaje) en
  `comic/assets/personajes/expresiones/`, con el mismo método vectorial de la
  ronda 8. Pesan 776 KB en total.
- Las posiciones **no se buscaron a ojo**: cada cara está centrada sobre el
  rótulo de su emoción, que sí es texto en el PDF, así que se deducen de ahí.
  El Ente tiene sus propias emociones —*Desagrado* y *Somnoliento*— en vez de
  *Miedo* y *Aburrimiento*.
- Todas se recortan con un **recuadro idéntico de 590x496** respecto a su
  rótulo, así conservan entre sí la escala del book sin normalizar nada. Lo
  marca el Padre, que es el mayor por el sombrero: 515 de ancho y sube 439
  sobre su rótulo.
- El rótulo decorativo **"expresiones"** se monta sobre la fila de Juanes y
  ninguna línea horizontal lo separa del pelo. Se descarta por lo que es:
  relleno negro dentro de su franja. Ojo — esos trazos **no declaran `fill`**,
  y en SVG eso ya significa negro; comprobar sólo los que lo declaran no
  sirve de nada.
- El selector de personaje pasó de `role="tablist"` a botones normales con
  `aria-pressed`. Con el patrón de tablist a medias sólo se llegaba a una de
  las cinco pestañas con el tabulador.

**Sobre los guiones de extracción:** no están en el repositorio. Son de un
solo uso y dependen de la ruta del PDF. Lo que hay que conservar es el
método —SVG de PyMuPDF, filtro por región, poda de `<defs>`— y las
coordenadas, que están aquí y en la ronda 8.

---

### Ronda 10 — Fuera los comentarios, la documentación manda

- **Se retiraron todos los comentarios** de los catorce archivos propios
  (cuatro HTML, cinco CSS, cinco JS) y de los tres archivos de configuración.
  El código bajó de 4672 a 4179 líneas. `comic.js` pasó de 1166 a 1037.
- No se tocó `comic/assets/lottie-web-5.13.0.min.js`: es de terceros y su
  cabecera es la licencia MIT.
- El borrado **no se hizo con un buscar y reemplazar**. Un regex ingenuo se
  come cosas como el literal `/^(\D*)(\d+)(.*)$/` de `juanes.js` o una `url()`
  del CSS, así que se escribió un limpiador con máquinas de estado para
  cadenas, plantillas y literales de expresión regular. Después se comprobó
  que **cada línea del archivo limpio existe, en el mismo orden, en el
  original**: ninguna línea de código se modificó, solo se recortaron 31
  comentarios que iban al final de una línea de código.
- Se verificó en el navegador: las cuatro páginas cargan sin errores de
  consola, y en el cómic se probaron encendido, salto de la introducción,
  canal 0 (personajes), canal 1 (presentación) y canal 2 (escena I).
- **Todo lo que decían los comentarios se trasladó antes de borrarlos**: la
  guía del código al README, y el porqué de cada decisión a la sección
  *Detalles técnicos que costó encontrar* de este documento.
- Se corrigió de paso la numeración de canales que había quedado vieja en los
  comentarios de `comic.js` (hablaban de los canales 3, 5 y 8 tras la
  renumeración de la ronda 8) y en las rondas 6 y 7 de esta bitácora, que
  ahora avisan de que sus números son los de entonces.
- Se retiró un comentario huérfano en `juanes/index.html` que anunciaba la
  transición de "pasar la página", retirada en la ronda 3.

---

### Ronda 11 — Herramientas para el 3D

No se tocó ni una línea del sitio: es preparación.

- **Se descubrió que `git` no estaba instalado en esta máquina.** Por eso la
  carpeta de trabajo era la copia del zip (`helikon-cuerdas-del-destino-main`)
  sin repositorio: todo el ciclo `pull` / `push` que documenta este archivo era
  imposible aquí, y no había forma de deshacer nada. Ya está instalado
  (2.55.0), pero **la carpeta sigue sin ser un repositorio**: falta clonar el
  de GitHub o inicializar uno y conectarlo.
- **`ffmpeg` instalado** (9.0.1), para el pendiente de comprimir `intro.mp4` y
  para convertir lo que salga de Blender.
- **`gltf-transform` no se instala**: se ejecuta con `npx` cuando haga falta,
  así que optimiza los `.glb` sin dejar dependencias en el proyecto ni en la
  máquina.
- **Falta un modelador.** Blender no está instalado y no hay `.glb` todavía;
  sin eso no hay nada que montar. Se instala desde blender.org cuando se
  empiece a modelar.
- Se revisó qué skills y conectores existían para 3D. **No hay ninguna skill de
  3D, WebGL ni Blender**, ni en las del usuario ni en el catálogo. Lo único
  pertinente es el plugin `modern-web-guidance` (buenas prácticas web al día:
  animaciones por scroll, View Transitions, rendimiento) y, para el pendiente
  de publicar, los conectores de Netlify y Vercel.

### Ronda 16 — Juanes, basado en hechos reales, y su línea de tiempo

La página de Juanes pasa a ser una **edición especial "Basado en hechos
reales"**. Su pieza central es una línea de tiempo muy interactiva: **la
cuerda de guitarra es el eje de años y el cursor es una púa que se arrastra**.
El detalle de uso y cómo añadir hitos está en el README.

**Antes de escribir una fecha se contrastó todo**, porque es una persona real.
Fuentes: Wikipedia en español y en inglés, la lista de premios de Wikipedia,
El Colombiano y La República. La página las cita al final.

**La investigación destapó errores en lo que ya había publicado:**

- **Juanes nació en Medellín, no en Carolina del Príncipe.** Las dos
  Wikipedias coinciden; Carolina del Príncipe es donde pasó parte de su
  infancia. Se corrigieron la entradilla y el pie de la estatua, que decía
  "el pueblo que lo vio nacer".
- **"+16M discos" pasa a "+15M"**, que es la cifra de Wikipedia.
- **"Artista latino de la década — Billboard 2009" se retiró.** Solo la
  Wikipedia en español menciona una "Estrella de la Década", sin año, y no se
  encontró otra fuente.
- **"A los quince años fundó Ekhymosis… entre 1988 y 1998"** no cuadraba: en
  1988 tenía 15 o 16, y el final es 1997 según una fuente y 1998 según otra.
  Ahora dice "en 1988" y "a finales de los noventa".
- **Las fichas de álbum afirmaban cosas sin fuente**: que *P.A.R.C.E.* lo
  produjo él solo y que su título era un acrónimo de valores. Las fichas se
  retiraron: la discografía vive ahora en la línea de tiempo, solo con datos
  comprobados.
- **Latin Grammy: 26 o 27** según la página de Wikipedia que se mire. Queda
  "+25".

La cifra de álbumes cuadra por tres vías: la línea de tiempo marca 12 álbumes
(11 de estudio más el *MTV Unplugged*), la cifra de la página dice 12 y La
República llama a *Juanesteban* su duodécimo álbum.

**Qué costó encontrar al probar:**

- **Los clics rápidos perdían pasos.** Durante el desplazamiento suave, el
  detector de scroll volvía a marcar el hito del que se salía, y el segundo
  clic partía de ahí. Ahora, mientras la tira va hacia un destino elegido, el
  detector no interviene.
- **El centrado inicial con `requestAnimationFrame` devolvía la tira al
  principio** a mitad de uso cuando la pestaña no dibujaba fotogramas: la
  llamada quedaba pendiente y se ejecutaba tarde. Se hace directo.
- **`display: flex` en `.hito` anulaba el atributo `hidden`**, así que los
  filtros no ocultaban nada. Hace falta `.hito[hidden]{ display: none }`
  explícito.
- **La reproducción automática "se paraba sola" en el panel de pruebas.** No
  era un fallo: el panel alterna su visibilidad cada ~6 s, y la página pausa la
  reproducción al ocultarse, que es lo correcto. Se confirmó registrando los
  eventos `visibilitychange`.
- **Una medición marcó las 28 viñetas como desbordadas.** Era el icono
  decorativo, que sobresale por la esquina a propósito. Midiendo solo el texto,
  ninguna viñeta corta nada: quedan al menos 89 px libres incluso en móvil.

Verificado en 1366×658 y 375×760: sin desborde horizontal, la viñeta activa
centrada al píxel en móvil, contadores correctos en cada punto (12 álbumes y
4 Grammy al final; 11 en 2024, antes de *Juanesteban*), filtros con el número
exacto de hitos (10 premios, 3 de activismo, 13 de música) y la púa
ajustándose al año exacto al soltarla.

### Ronda 15 — Helikón pasa a ser el Nº 0

La página del estudio era una sucesión de tarjetas bien vestidas. Ahora es un
**número cero**: el especial de origen que publican las editoriales de cómics.
La estructura está en el README, en *La página de Helikón*.

De dónde salieron las decisiones:

- **El mito, contrastado antes de dibujarlo.** El Monte Helicón está en
  Beocia, Grecia, y era el lugar favorito de las musas. Pegaso golpeó una roca
  con el casco y brotó el manantial Hipocrene, cuya agua daba inspiración
  poética. Hesíodo, pastor de ese monte, contó en la *Teogonía* que allí las
  musas le dieron el canto. Fuentes: Britannica, Theoi y Wikipedia (Pegásides).
  Las viñetas cuentan solo eso.
- **El formato de fichas viene del *Who's Who in the DC Universe*** (1985–87),
  el directorio de personajes de DC.
- **Material real del proyecto, no relleno.** La hoja de modelo usa las seis
  expresiones de Juanes que ya existían en el canal 0. Las cifras (2 capítulos,
  9 canales, 5 personajes, 30 expresiones) y el proceso (Illustrator →
  After Effects → Lottie → HTML/CSS/JS) salen de esta bitácora.
- **Los tres "casos" de la bitácora de la página eran títulos sin contenido.**
  Ahora cuentan hechos reales: la decisión de los dos sistemas visuales, el
  arco de los personajes y la conversión del book a vectores.

**Una línea roja: nada inventado sobre personas reales.** Las fichas del
equipo no tienen retratos (no hay fotos y no se generan con IA), ni frases
atribuidas, ni estadísticas de "poderes". Dicen el oficio de cada uno y lo que
aporta al cómic. **Pendiente de confirmar con el equipo:** la descripción de
lo que hace cada uno se dedujo del rol que figura en el README. Si alguno hace
algo distinto o más, hay que corregirlo en su ficha.

**Qué costó encontrar:**

- **Espacio vacío otra vez.** Con el título alineado a la izquierda, la mitad
  derecha del titular quedaba vacía, y lo mismo pasaba en el manifiesto. Es lo
  que se corrigió en la portada, así que aquí se resolvió de entrada: un sello
  de edición junto al título y la lira del mito junto al manifiesto.
- **El dibujo del monte se cortaba por arriba.** Con `slice` sobre un lienzo
  más estrecho que la viñeta, se escalaba al ancho y perdía la cima y el templo.
  Se redibujó a la proporción de la viñeta, con la cima centrada.
- **La animación de asentado de `pulp.css` enderezaba las fichas**, que van
  inclinadas con `rotate`. Tercera vez que aparece este choque entre una
  animación y una propiedad fija; en esas fichas la animación se desactiva.
- **Sombras en píxeles a tamaño de móvil** dejaban franjas claras entre las
  letras del título. Pasaron a `em`.
- **Las imágenes con `loading="lazy"` parecían rotas** al medir con el panel
  del navegador oculto: sin dibujar, el navegador nunca detecta que entran en
  pantalla. Respondían HTTP 200 y cargaban al pedirlas.

Verificado midiendo el DOM en 1366×658 y 375×760: sin desborde horizontal,
ninguna pieza fuera de su viñeta, las cifras caben en sus estallidos y los
textos del proceso no se salen de sus recuadros.

### Ronda 14 — La portada pasa a ser el Nº 1 de un cómic

La portada anterior era una web con tres botones decorados. Ahora es **un cómic
abierto por la primera doble página**: a la izquierda la portada del Nº 1, a la
derecha la página 1 con tres viñetas que llevan a las secciones, y debajo el
reparto y una contraportada. En móvil las hojas se apilan como un webtoon. El
detalle técnico está en el README, en *La portada*.

De dónde salieron las decisiones:

- **Material que ya existía y nadie usaba.** La presentación animada del
  capítulo uno trae el **logotipo oficial** de *Cuerdas del Destino* y los
  anillos rojos del fondo; la del capítulo dos, el rótulo de *El Mensaje*. Los
  cinco personajes en SVG y sus expresiones estaban solo en el canal 0. Ahora la
  portada los usa todos, enlazados sin duplicar archivos.
- **Convenciones reales del cómic impreso**, no adornos genéricos: caja
  editorial en la esquina con una cara, número, fecha, precio y código de
  barras; cartucho de narrador; globos con cola; folio de página; "Continuará…".
- **Principios de maquetación de cómic**, consultados en guías de diseño de
  páginas: el tamaño de la viñeta marca la importancia (la del cómic es la más
  grande porque es la entrada principal), recorrido en Z, pensar las dos hojas
  enfrentadas como una sola composición, y figuras que se salen del marco.

**Idioma: todo en español.** Era un pendiente: la portada mezclaba inglés
(`THE MUSIC COMES ALIVE!`, `OPEN →`, `HEY!`) con español. Ahora está en español,
incluidas las onomatopeyas: `¡CLIC!`, `¡ZAS!`, `¡PUM!`. El cómic y el público
son hispanohablantes. Si se prefiere el inglés en las onomatopeyas por ser
convención del género, solo hay que cambiar esos tres textos.

**Qué costó encontrar:**

- **Bangers no tiene "º".** El "Nº 1" se leía "NO 1". Se compone a mano: una
  "o" pequeña, elevada y subrayada (`.caja-ordinal`).
- **Una animación con relleno `both` anula el paralaje.** Juanes entra con una
  animación de `translate`, y el paralaje también escribe `translate`. Con
  `both`, la animación mantiene su valor final para siempre y gana a lo que
  escribe el JavaScript. Con `backwards` deja de aplicarse al terminar.
- **La tilde de "CÓMIC" tapaba el "1" de "Capítulos 1 y 2".** El título lleva un
  interlineado de 0,82, y las mayúsculas acentuadas de Bangers suben por encima
  de su propia caja. Se separan con margen, no con interlineado.
- **`elementFromPoint` devuelve `null` fuera de pantalla.** Una comprobación de
  solapes dio falsos positivos porque las viñetas estaban por debajo del
  pliegue. Hay que llevar el elemento a la vista antes de medir.

Verificado midiendo el DOM en 375×760, 1366×768, 1440×900 y 1920×1080: sin
desborde horizontal, ninguna pieza fuera de su viñeta, la doble página cabe en
la pantalla del portátil y las trece imágenes cargan.

**Ajuste tras la primera revisión: sobraba espacio.** Mirándolo en un portátil
real (1366×658 útiles dentro de Brave) había dos huecos:

- **Dentro de la página 1**, un margen enorme alrededor de las viñetas. Era un
  error: el relleno de `.pagina` usaba `cqi` sobre la propia hoja, y sin
  contenedor antepasado el navegador lo calculó contra la ventana. Salían
  ~60 px por lado y ~110 abajo en vez de ~20. Es la regla 1 de *La portada* en
  el README, rota por quien la escribió. Ahora el relleno sale de
  `--ancho-hoja`.
- **A los lados del libro**, casi 300 px vacíos por lado: dos hojas verticales
  de proporción 0,66 en una ventana tan apaisada. En esas pantallas las hojas
  pasan al formato álbum europeo (0,8), y el vacío lateral bajó a ~180 px en ese
  portátil y a ~50 px en 1440×900. La portada se mide en una unidad adaptable
  (`--u`) para que al ensancharse no se descomponga.

También se redujo la cara de la caja editorial: el "Nº 1" rozaba el borde y
perdía 5 px.

### Ronda 13 — El sitio empieza a comportarse como un cómic

El diagnóstico: el cómic estaba **encerrado dentro del televisor**. Las tres
páginas de papel hablaban *sobre* un cómic en vez de comportarse como uno. Se
llevaron al sitio tres de las seis propuestas del laboratorio, las que más dan
a cambio de menos:

- **Tinta sobre fotografía** (`.tono` en `pulp.css`). Tres fotos reales entran
  en la página de Juanes tratadas como viñetas: el retrato en el hero, y el
  aldabón y la estatua como par documental en *El origen*. El lector no ve una
  foto pegada en un cómic — ve al cómic dibujando a una persona real.
- **Asentado al leer.** Viñetas y tarjetas se colocan sobre la página al entrar
  en pantalla, con animaciones guiadas por scroll nativas. Cero JavaScript.
- **Onomatopeyas vivas.** El `HEY!`, el `POW!` y el `BOOM!` ya no saltan
  siempre igual: `initOnomatopeyas()` sortea giro y brinco en cada pasada.

El coste total en peso es **365 KB de fotos y 0 KB de código**.

Lo que se dejó fuera a propósito: el televisor en 3D, que sigue esperando un
modelador y pesaría entre 1 y 3 MB.

**El tramado se hace con CSS, y eso no es un detalle estético sino legal.** Dos
de las tres fotos son CC BY-SA, es decir *compartir igual*: una versión
modificada tendría que publicarse bajo la misma licencia. Al aplicar el duotono
y los puntos con `filter` y `mix-blend-mode`, **el archivo que se guarda y se
distribuye es el original sin tocar** — quien lo descargue del repositorio se
lleva la foto tal cual la publicó su autor. No se genera obra derivada alguna.
Si algún día se tramara la imagen en un editor y se guardara así, esa condición
sí se activaría.

**Una trampa que costó encontrar:** la animación de asentado tuvo que hacerse
con las propiedades `translate` y `rotate`, no con `transform`. Los tres
scripts de página escriben `transform` en línea para la inclinación 3D que
sigue al cursor, y **una animación CSS gana sobre una declaración en línea**,
así que animar `transform` habría desactivado esa inclinación sin dar ningún
error. `translate` y `rotate` son propiedades independientes y se componen con
`transform` en vez de pisarlo.

Al verificar apareció otra cosa útil: **el navegador del panel tiene
`prefers-reduced-motion: reduce` activo**, así que ninguna de las animaciones
nuevas se aplicaba ahí. No era un fallo — era la guardia de accesibilidad
funcionando. Conviene recordarlo antes de dar por roto algo que no lo está: se
comprueba con `matchMedia('(prefers-reduced-motion: reduce)').matches`.

### Ronda 12 — La carpeta vuelve al repositorio

Al conectar por fin con GitHub apareció el problema gordo: **el repositorio
estaba tres rondas por detrás del disco**. Su último commit era `440d659`, del
10 de septiembre, es decir el final de la ronda 6. Las rondas **7, 8 y 9** —las
presentaciones como canales, el canal de Personajes y las treinta
expresiones— **nunca se subieron**, y existían solo en esta máquina. Se confirmó
mirando `comic/assets/` en GitHub: seguía teniendo `presentacion/json` con el
nombre viejo, sin `personajes/` ni `presentacion-c2/`.

Es la trampa que este mismo documento advierte —"`pull` al empezar, `push` al
terminar"— pero llevada al extremo: se perdía arte extraído del PDF cuyos
guiones de extracción ya no existen. **La causa de fondo era que `git` no
estaba instalado** (ronda 11), así que no había manera de subir nada.

La reconciliación se hizo **sin destruir nada**, y el orden importa:

```bash
git init -b main
git remote add origin https://github.com/Camilo-b92/helikon-cuerdas-del-destino.git
git fetch origin
git update-ref refs/heads/main origin/main
git reset --mixed
```

La clave es `git update-ref` más `git reset --mixed`: engancha la rama a la
historia remota y pone el índice a la altura de ese commit **sin tocar un solo
archivo del disco**. Un `git checkout` o un `git reset --hard` en su lugar
habría arrasado con las tres rondas de trabajo. Después, `git status` muestra
exactamente lo que falta por subir.

Se verificó que la desaparición de `comic/assets/presentacion/json` es el
renombrado de la ronda 7 y no una pérdida: los seis archivos tienen **el mismo
hash** que los de `presentacion-c1/json`, así que git lo registra como un
movimiento.

**El repositorio ya es público**, aunque el README y la bitácora seguían
diciendo "privado" en cinco sitios. Corregido, y con ello cambia la
recomendación de publicación: GitHub Pages ya sirve gratis.

**Subido en dos commits**, `ab8c37e` (código y arte) y `3223339`
(documentación): 67 archivos, 5906 líneas añadidas. El remoto y el disco
vuelven a tener los mismos 108 archivos.

Sobre la autenticación: se hizo con `gh auth login` desde la terminal, seguido
de `gh auth setup-git`. Ese segundo comando **no es opcional** — sin él git
sigue sin saber que existe la credencial de `gh` e intenta abrir su propia
ventana de inicio de sesión. El token queda en el almacén de credenciales de
Windows; no se escribe en ningún archivo del proyecto y no debe acabar en él.

---

### Ronda 17 — La presentación del capítulo uno, Helikón como marca y el expediente

- **Canal 1**: el nombre del cómic encadena con la presentación del capítulo
  uno, que llegó de After Effects. `presentacion-c1/` pasa a contener lo que su
  nombre dice, y el logotipo se muda a `presentacion-titulo/`.
- **Helikón**: fuera *Extras del taller*, *Expedientes del estudio* y el panel
  de *Próximo capítulo*; dentro *Señas de identidad*.
- **Portada**: las cinco tarjetas del reparto abren un expediente a pantalla
  completa con la ficha entera y las seis expresiones.
- Las fichas salen de `comic.js` a `assets/js/personajes.js`, compartido por
  las dos páginas que las usan.

Los fuentes de After Effects e Illustrator del ZIP (8 MB entre los dos) **no
entran al repositorio**: son material de trabajo, no del sitio.

---

### Ronda 18 — El televisor se queda solo con el cómic

- **La portada volvía a mostrar el logotipo equivocado.** Al renombrar
  `presentacion-c1/` en la ronda 17, las dos imágenes de la portada —el
  logotipo y el anillo— siguieron apuntando a esa ruta, que ya contenía el
  *Capítulo 1*. El título salía estirado desde un original de 262x84 a 870x436.
  Corregido a `presentacion-titulo/`, que es donde vive el logotipo.
- **Fuera el canal de Personajes.** El dial baja a ocho canales (0–7) y el 0 es
  la presentación. El detalle está arriba, en *El televisor es solo el cómic*.
- `comic/index.html` ya no carga `personajes.js`.

---

### Ronda 19 — Capítulo dos completo y presentación del capítulo tres

Tres encargos del equipo, hechos sobre `main` en el commit `c784806`.

- **Escena III del capítulo dos** (canal 7) y **escena IV** (canal 8), más la
  **presentación del capítulo tres** (canal 9). Llegaron como tres carpetas
  sueltas, `Escena 3-C2`, `Escena 4-C2` y `Presentación C3`, cada una con su
  propia página de prueba.
- **Fuera el canal de cierre del capítulo uno.** Detalle en *No hay canal de
  cierre entre capítulos*. La numeración quedó así:

  | Antes | Ahora |
  |---|---|
  | 0 a 3 | 0 a 3, igual |
  | 4 · Fin del capítulo uno | *Retirado* |
  | 5 · Presentación del capítulo dos | 4 |
  | 6 · Capítulo dos, escena I | 5 |
  | 7 · Capítulo dos, escena II | 6 |
  | — | 7 · Capítulo dos, escena III |
  | — | 8 · Capítulo dos, escena IV |
  | — | 9 · Presentación del capítulo tres |

  Los números de canal de rondas anteriores en este documento son los de
  entonces.
- **Avisos de interacción** revisados en todas las escenas. Detalle en *Toda
  escena con interacción lleva su aviso, y las automáticas no*.

Lo que hubo que cambiar al pasar las escenas de su página de prueba al
televisor:

- **El orden lo lleva `setTimeout` y no `transitionend`.** La página de prueba
  encadenaba la secuencia de la escena III al terminar una transición CSS. En el
  televisor la escena se abandona y se vuelve a sintonizar, y un evento de
  transición no se puede cancelar; los temporizadores sí (`s6.timers`), y el
  tiempo total es el mismo.
- **Cada escena se rebobina al sintonizarla**, no al salir, porque al salir el
  canal ya está oculto bajo la estática y al entrar de nuevo se vería el final
  de la visita anterior durante un segundo.
- **Las capas de la escena III arrancan fuera de cuadro** y entran con clases
  `s6-entrar`, con el mismo vocabulario que `s3-entrar`.
- **Las imágenes se bajaron al doble de su tamaño en pantalla**, como en el
  resto del cómic. `fondoCorre.png` venía a 4725x2742 —unos 52 MB una vez
  descomprimida en memoria, para una pantalla de 1134x658— y pasó a 2268x1316.

  | Imagen | Antes | Ahora |
  |---|---|---|
  | `fondoCorre.png` | 4725x2742 | 2268x1316 |
  | `sky.jpg` (escena IV) | 4724x694 | 2266x333 |
  | `fondoDos.jpg` | 2935x1309 | 1400x622 |
  | `fondoTres.jpg` | 2298x1353 | 1102x649 |
  | `fondoTextoOne.jpg` | 2182x1068 | 1040x512 |
  | `fantasmaEsc.png` | 2298x1353 | 1200x707 |

  Las seis, juntas, pasaron de 1,4 MB a 270 KB. Los originales siguen en las
  carpetas de trabajo del equipo y **no entran al repositorio**, igual que los
  fuentes de After Effects e Illustrator.
- **Los archivos de animación conservan los nombres** que les puso el equipo
  (`recuadroUno.json`, `textoFantas.json`, `juanRun.json`…) para que Gabriel los
  reconozca. Solo cambió `tituloTres.json`, que pasó a `titulo.json` porque ese
  es el nombre que espera `crearPresentacion()`.
- **`fantasmaHabla.png` no se copió.** Venía en `Escena 3-C2/img/` pero ninguna
  página lo usa.
- **Se retiró una `@media` vacía** que quedó en `comic.css` al quitar los
  comentarios.

Probado en un navegador con las escenas nuevas: los diez canales en orden, los
dos clics de la escena III en secuencia y fuera de ella, volver a entrar y
encontrar la escena desde el principio, la carrera hasta el final y el paso al
canal siguiente, el tope del dial y el apagado. Sin errores de consola. No se
probó en móvil.

### Ronda 20 — Primera escena del capítulo tres

Un encargo del equipo, hecho desde otra máquina, sobre el repositorio tal como
quedó en `df06066`.

- **Escena I del capítulo tres** (canal 10). Llegó como una carpeta suelta,
  `Escena 1-C3`, con su página de prueba, los fuentes de After Effects
  (`.aep`) y de Illustrator (`.ai`), un fondo y seis animaciones. Al repositorio
  entran solo `fondo.jpg` y los seis `.json`, en
  `comic/assets/capitulo-n3/scene1/`; los fuentes no entran, igual que en las
  rondas anteriores.
- **El dial pasa a 0–10.** `TOTAL_CHANNELS = 10`, y el código la llama
  `Scene8` porque la numeración cuenta las escenas de todo el cómic.
- **La presentación del capítulo tres ya lleva su aviso.** Era el pendiente
  que quedó abierto en la ronda 19: ahora que hay un canal siguiente,
  `pres3Hint` dice *Presiona el botón derecho para continuar*, como las otras
  dos.
- **Aviso de la escena:** *Toca a Juanes y explora el cuarto*. Se oculta al
  tocar a Juanes, que es el paso de la historia; los otros tres objetos son
  extras. Se coloca a la derecha (`#scene8Hint { left: 66% }`) porque en el
  centro, donde van los demás, quedaba sobre el zapato de Juanes.

Lo que hubo que decidir al pasar la escena de su página de prueba al
televisor:

- **El globo de texto no puede recibir clics.** En la página de prueba `#txt`
  ocupa 300x200 px sobre la cortina, los libros y la cabeza de Juanes, y
  cuando no se ve solo está transparente (`opacity: 0`), que no impide que
  siga tapando lo que tiene debajo. Se comprobó: el clic en el centro de la
  cortina y en la cabeza de Juanes caía en `#txt` y no hacía nada. Aquí
  lleva `pointer-events: none`.
- **Qué se repite y qué no.** La puerta reinicia su animación en cada clic
  (`goToAndPlay(0, true)`), porque termina en el mismo estado en que empezó. La
  cortina y los libros cambian la escena —queda abierta la cortina y los libros
  caídos—, así que reaccionan una vez y se quedan así hasta volver a sintonizar
  el canal. En la página de prueba, tocarlos de nuevo no hacía nada, porque
  `play()` no reinicia una animación de Lottie que ya llegó a su último
  cuadro (se comprobó con la cortina: sigue en el cuadro 24). El bloqueo hace
  explícito ese comportamiento y quita el cursor de mano.
- **Todo se rebobina al sintonizar el canal** (`resetScene8()`), con el mismo
  criterio que las escenas 6 y 7: el globo vuelve a quedar oculto, la cortina
  y los libros se desbloquean y el aviso reaparece.
- **Mamá arranca un segundo después de sintonizar**, con la misma espera de
  1000 ms que las demás escenas, y se pausa al salir y al apagar.
- **Las seis animaciones van en el renderizador `svg`.** Traen sus gráficos
  como trazos, sin imágenes incrustadas, así que no hace falta `assetsPath`.
- **No se tocó ningún archivo de animación.** Los nombres son los del equipo
  (`mamaAsomada.json`, `puertaAbriendo.json`, `cortinaAbriendo.json`,
  `libros.json`, `juanesSentado.json`, `txt.json`).

`fondo.jpg` se copió tal cual (92 KB; en disco quedó en 98 KB porque al
entregarla se le añadió un bloque de metadatos de procedencia, sin tocar los
píxeles). `txt.json` es el archivo pesado de la
escena, con casi 900 KB; se carga por adelantado desde el canal de la
presentación del capítulo tres (`prefetchScene8()`).

Probado en un navegador: los once canales en orden, el aviso de la
presentación del capítulo tres, la escena sin clics, cada objeto por separado,
la cortina y los libros bloqueados tras el primer clic, el globo de Juanes
completo y su desvanecimiento, salir y volver encontrando la escena desde el
principio, y el tope del dial en el canal 10. Sin errores de consola. No se
probó en móvil.

### Ronda 21 — Navegación y nombres (fase 1 del plan de UX)

Sale de dos fuentes: la devolución del profesor ("Edición 0", "Edición 1" y
"Nº" confunden; el encabezado debería ser permanente) y una revisión del sitio
como si fuera la primera visita. El plan completo tiene cinco fases; esta
ronda es solo la primera.

- **Una sola barra para las cuatro páginas.** Antes, la portada no tenía
  encabezado; Helikón y Juanes tenían uno de revista que omitía su propio
  botón; y el cómic tenía otra barra distinta, sin Juanes. Ahora todas llevan
  `Inicio · El cómic · Juanes · Helikón`, definidas en `assets/css/menu.css`.
- **La página actual no desaparece.** Se queda en la barra, resaltada y con
  `aria-current="page"`. Su enlace apunta a sí misma (`./`): al pulsarla solo
  recarga, así que nada cambia de sitio.
- **La barra es fija** (`position: sticky`) y cada botón mide 44 px de alto,
  por el dedo. En celular se oculta el nombre "Cuerdas del Destino" y los
  cuatro botones se centran; a 360 px caben sin desbordar.
- **El cómic usa la misma barra que las demás.** Se quitó `.topnav`. (Esta
  ronda la dejó con paleta turquesa; la ronda 22 la pasó al estilo de papel.)
- **Fuera "Nº", "Edición" y "Bio".** Se quitó la cabecera de revista de
  Helikón y de Juanes (HTML y CSS), el "Nº 1" de la caja editorial de la
  portada, el folio "1" de la hoja derecha y las frases "Fin del Nº 0", "Fin
  de la edición especial" y "La historia continúa en el Nº 1". El sello de
  Helikón dice ahora "Estudio" en lugar de "Nº 0", un poco más pequeño (32 px)
  porque la palabra es más larga y el texto está en la parte baja del
  círculo. "Capítulo único · El monte de las musas" pasa a "El monte de las
  musas", porque ya hay tres capítulos en el cómic; y "La carrera, número a
  número" pasa a "año a año".
- **Finales con "a dónde sigo".** Helikón: "Nuestro universo" se llama ahora
  "Sigue explorando", y cierra con "Gracias por visitarnos" y un enlace para
  volver al inicio. Juanes: cierra con "Sigue explorando" y dos tarjetas
  (Helikón e Inicio; el cómic ya tiene su propia viñeta justo encima). Son las
  tarjetas `.sigue` de `menu.css`.
- **Títulos y vistas previas distintos por página.** Antes la portada y el
  cómic se llamaban igual en la pestaña. Ahora: *Cuerdas del Destino —
  Helikón*, *El cómic: Cuerdas del Destino — Helikón*, *Juanes, basado en
  hechos reales — Helikón* y *Helikón, el estudio — Cuerdas del Destino*. Los
  `og:title`, las descripciones y el texto alternativo de la imagen
  ("Portada de Cuerdas del Destino…", sin "Nº 1") se corrigieron igual.

Lo que se dejó para las fases siguientes, a propósito: la contradicción
"¡2 capítulos!" frente a "Continuará… capítulo dos" y el "Capítulos 1 y 2" de
la viñeta del cómic (fase 3, depende de cuántos capítulos haya), el cartel de
encendido del televisor y el contador "Canal" (fase 2), el material interno de
Helikón y el aviso de página no oficial en Juanes (fase 4), y el enlace de
salto al contenido y una imagen de vista previa por página (fase 5).

Lo que ya estaba así y no se tocó: a 768 px de ancho, Juanes y Helikón
desbordan unos píxeles en horizontal (784 y 770 px contra 768); se midió en la
versión anterior y era igual.

Probado en un navegador a 1366x768, 768x900 y 360x740: las cuatro páginas
cargan, la barra aparece en cada una con su botón resaltado y los cuatro
enlaces correctos, queda fija al bajar, los botones miden 44 px y no hay errores
propios en consola (solo falla la descarga de las tipografías de Google, que el
entorno de pruebas bloquea). No se recorrió el cómic completo: la barra no toca
su código.

### Ronda 22 — El primer minuto del cómic (fase 2 del plan de UX)

Segunda fase del plan de navegación. El problema: quien llega al cómic ve un
televisor negro, con un punto rojo de 17 px que es el único modo de encenderlo,
un contador que dice "Canal 0 / 10" y, en un celular, ni una forma de mover a
Juan en la escena IV ni de cambiar de canal con comodidad.

- **Cartel sobre la pantalla apagada.** *Toca la pantalla para encender*, y abajo
  a la derecha, *o pulsa el botón rojo →*. Es un `<button>` que cubre la pantalla,
  así que tocar en cualquier parte enciende. Se desvanece al encender y
  vuelve al apagar. Con movimiento reducido no parpadea.
- **El botón rojo mide 44 px mientras el televisor está apagado.** En un celular
  de 360 px el punto era de 16 px. Se descartó dejar los 44 px también
  encendido: se solapaba con la perilla "anterior" y un toque de más apagaba el
  televisor en plena lectura.
- **La leyenda deja de decir "Canal".** Ahora: *Capítulo 2 — Escena I · 6 de
  11*. El total sale de `TOTAL_CHANNELS`, así que no se desactualiza al sumar
  escenas. Los nombres se unificaron ("Capítulo 1 — Escena I: El llamado", etc.).
  Hasta el primer cambio de canal, la leyenda añade cómo cambiar: *usa ← → o las
  perillas* (teclado) o *desliza o usa las perillas* (táctil).
- **Se puede deslizar el dedo** sobre la pantalla para cambiar de canal. No estaba
  en el plan: lo añadí porque a 360 px las perillas miden unos 40 px y están
  casi pegadas. Hace falta un gesto horizontal de 60 px o más, más horizontal
  que vertical y en menos de 700 ms, así que no interfiere con los toques de las
  escenas.
- **Botón Correr en la escena IV.** Mantenerlo pulsado hace correr a Juan, con
  ratón o con el dedo. Al llegar al final cambia a *Siguiente escena →*. El
  aviso de la escena dice, con pantalla táctil, *Mantén pulsado el botón Correr*.
  Es un cambio de control, no de animación: la velocidad y el límite son los
  mismos. Como esa escena la dibujó el equipo de animación, conviene que la vean.
- **Aviso "Mejor en horizontal"** bajo la leyenda, solo en vertical y con
  ancho de hasta 640 px. Girar el teléfono agranda el televisor en torno a un
  20 %, porque el menú y la leyenda también ocupan alto; por eso es un aviso y
  no un bloqueo.
- **La página del cómic pasa al tema de papel**, a pedido del equipo. Antes tenía
  fondo turquesa claro y una barra propia; ahora lleva el mismo fondo (degradado
  de papel, trama de puntos y viñeta) y el mismo encabezado que portada,
  Juanes y Helikón. El caption y el aviso de girar usan Special Elite, y la
  sombra del televisor pasa de verdosa a marrón. Se añadieron Bangers y
  Special Elite a las tipografías de la página. El interior del televisor no
  cambia. Para que la trama no empañe la pantalla, `.tv-stage` va por encima
  (`z-index: 2`). No se enlazó `pulp.css` completa porque redefine `--ink` y
  `*`, y `comic.css` usa `--ink` con otro valor.
- **El televisor pierde 12 px de alto** (`calc((100vh - 112px) * 1.6930)`)
  para dejar sitio a la barra común, que mide 56 px. La altura de la página a
  1366x768 queda en 782 px, que es lo que tenía (781 antes de la ronda 21).

Pendiente de esta fase, a propósito: las perillas del televisor siguen siendo
pequeñas en un celular (el gesto de deslizar es el camino cómodo). Se podrían
agrandar, pero la imagen del televisor las dibuja de ese tamaño.

Probado en un navegador: escritorio (cartel, encendido por el cartel, leyenda
con y sin ayuda, flecha derecha por todos los canales hasta la escena IV, el
botón Correr con ratón —avanza mientras se pulsa y se detiene al soltar—, la
etiqueta *Siguiente escena →* y el cambio de canal que provoca) y un celular
simulado de 360x740 con pantalla táctil (cartel, toque que enciende, deslizar
a izquierda y derecha, deslizar corto sin efecto, aviso de giro, tamaño del
botón rojo). Sin errores de consola. No se probó en un teléfono real ni se
recorrió cada escena con el nuevo botón.

### Ronda 23 — La portada (fase 3 del plan de UX)

- **El "Continuará" decía capítulo dos y el sello "¡2 capítulos!" ya lo
  contaba como hecho.** Ahora apunta al capítulo tres, con el rótulo de *El
  Desenlace* (`presentacion-c3/json/images/img_1.png`, 745x206). El sello
  "¡2 capítulos!" se queda: es lo que hay en el cómic hoy.
- **Sin spoilers en el reparto.** Las tarjetas decían "El punto de cambio" y
  "Aparece en la crisis"; ahora "Observa antes de intervenir" y "Aparece de
  repente". En `personajes.js`: la nota de Juanes queda en su primera frase;
  la del Ente en "Nadie sabe de dónde viene. Aparece de repente, dice lo justo
  y desaparece." (antes revelaba qué es) y su dato "Aparece" pasó a "Origen:
  Desconocido"; la de la Madre queda en "Observa antes de intervenir." y su rol
  pasa a "Secundaria clave — el hogar". **Decisión del equipo si se quiere
  recuperar algo de esto:** el texto anterior sigue en el historial de git.
- **Pista de scroll** "Sigue bajando ▼", fija, que lleva a `#reparto` y se
  oculta tras 80 px de scroll. Probada a 1366x768, 768x1024 y 360x740: sin
  desbordes ni errores de consola, y el enlace baja hasta el reparto.

### Ronda 24 — Las páginas largas (fase 4 del plan de UX)

- **Índice "En esta página"** en Helikón y en Juanes (`.indice` en
  `menu.css`): saltos a cada sección, enlaces de 44 px. Hicieron falta `id` en
  las secciones que no lo tenían (`quien`, `detras`, `universo`, `musica`,
  `premios`, `mito`). Probado: todos los saltos llegan a su sección a 1366,
  768 y 360 px.
- **Helikón dice qué es.** La entradilla del titular ahora empieza por "Helikón
  es el estudio que dibuja, anima y programa *Cuerdas del Destino*, un cómic
  digital hecho para verse en un televisor retro".
- **"Detrás de cámaras"** agrupa *Señas de identidad* y *Tablero de ideas*.
  **Decisión que quedó a criterio mío, no del equipo:** se agruparon en vez de
  retirarlas, porque el contenido es bueno y es lo que más enseña del oficio;
  si el equipo prefiere quitarlas, basta borrar esa sección.
- **Sigue explorando (Helikón):** tenía una rejilla de tres columnas para dos
  tarjetas y quedaban pegadas a la izquierda; ahora son dos, centradas, igual que su rótulo.
- **Juanes: aviso de página no oficial**, visible bajo la entradilla (borde
  discontinuo, "Página no oficial. La hace el equipo de Helikón, inspirada en la
  historia de Juanes. No tiene relación con él ni con su equipo."). **El equipo
  debe confirmar que ese texto es cierto tal cual** antes de publicar.
- El desborde horizontal a 768 px de Juanes (16 px) y Helikón (2 px) sigue
  igual que antes de estas rondas.

### Ronda 25 — Accesibilidad y cierre (fase 5 del plan de UX)

- **"Saltar al contenido"** en las cuatro páginas (`.saltar` en `menu.css`),
  con `id="contenido"` en el `<main>`. Probado con Tab y Enter en las cuatro.
- **Error real encontrado y corregido:** en el cómic, `Enter` y espacio
  encendían o apagaban el televisor con `preventDefault` aunque el foco
  estuviera en un enlace, así que **Enter no abría los enlaces del menú** con
  teclado. Ahora se ignoran si el foco está en un enlace, botón, campo o
  `summary`. Probado: Tab hasta "Juanes" + Enter navega; con el foco en el
  cuerpo, Enter sigue encendiendo.
- **El cómic no tenía `h1`.** Se añadió uno oculto: "El cómic: Cuerdas del
  Destino".
- **La pista de scroll** de la portada pasó dentro del `<main>` (axe avisaba
  de contenido fuera de un punto de referencia).
- **Contraste:** auditoría con axe-core y cálculo propio de todos los textos.
  Se corrigieron las tarjetas inactivas de la línea de tiempo (0,62 → 0,85 de
  opacidad, de 3,5 a más de 4,5) y la cifra de premios sobre amarillo (de 2,7).
  El título "Helikón" y las letras del nombre, en amarillo con contorno de tinta,
  salen por debajo de 3 en el cálculo, pero son letras de dibujo; no se tocaron.
- **Objetivos táctiles de 44 px:** filtros y controles de la línea de tiempo,
  desplegable de fuentes y "Volver al inicio" (Juanes y Helikón), y el pie sube
  a 0,72 rem. Quedan menores: las flechas del televisor (43 px, van en la
  imagen), el botón de saltar la introducción y los créditos de fotos.
- **Una imagen de vista previa por página** (portada, cómic, Juanes y
  Helikón). **La de la portada se rehízo porque decía "Helikón Nº 1"**, justo
  lo que la fase 1 había retirado. Pesan entre 110 y 175 KB.
- **Desbordes a 768 px resueltos:** el sello "Basado en hechos reales" (Juanes,
  16 px) y el sello del estudio (Helikón, 2 px) ya no sacan la página de ancho.
  Las cuatro páginas dan 0 px de desborde a 1366, 768 y 360.
- Probado en navegador: las cuatro páginas a 1366x768, 768x1024 y 360x740, sin
  errores de consola, y el cómic recorrido con la flecha derecha desde el
  encendido hasta la escena IV del capítulo dos. **No se probó en un teléfono
  real ni con un lector de pantalla.**
- Con esta ronda queda **completo el plan de UX** (fases 1 a 5, rondas 21 a 25).

### Ronda 26 — Scroll y el primer 3D (fase 6)

- **Animaciones ligadas al scroll, sin librerías.** `assets/js/scroll.js` y
  `assets/css/scroll.css`, compartidos. Dos atributos: `data-parallax="k"`
  desplaza el elemento según su distancia al centro de la pantalla (variable
  `--py`, aplicada con la propiedad `translate`, que no choca con los
  `transform` ni con el revelado) y `data-scroll` publica `--p`, el avance de
  0 a 1 de la sección al cruzar la pantalla. Solo se calcula lo que está a la
  vista (IntersectionObserver) y todo va en un único `requestAnimationFrame`.
- **En Juanes:** el retrato y el título se mueven a distinto ritmo; el estallido
  de "Más allá de la música" gira y crece con `--p`; las cifras de premios se
  inclinan y se desplazan en direcciones opuestas.
- **El primer elemento 3D: un vinilo con la etiqueta de Helikón**
  (`assets/js/vinilo.js`, en la sección de música de Juanes). three.js
  r170, **local** en `assets/vendor/three/` (691 KB, 171 KB comprimido), sin
  CDN. Surcos y etiqueta se dibujan en un `<canvas>`, no hay modelos ni
  imágenes que descargar. Gira con el scroll, se inclina hacia el puntero y una
  púa orbita a su alrededor.
- **Cumple las condiciones de *El 3D entra vivo*:** three.js solo se importa
  cuando la sección está a 500 px de la pantalla; el render se pausa fuera de
  vista; si falla el módulo o no hay WebGL se queda un disco dibujado en SVG;
  con movimiento reducido no hay giro continuo ni parallax y la escena se
  repinta solo al hacer scroll.
- **Es un módulo ES (`type="module"`)**, así que, igual que el cómic, hay que
  verlo por HTTP, no abriendo el archivo con doble clic.
- Probado en navegador a 1366, 768 y 360: 0 px de desborde, 0 errores propios en
  consola y axe con 0 violaciones, en tres modos (normal, movimiento reducido y
  sin WebGL). **No se probó en un teléfono real**, y el rendimiento se midió con
  render por software.
- Nota para quien siga: con el 3D en marcha, lo siguiente natural es un
  reproductor propio con el audio y su visualizador; el vinilo ya está
  montado para reaccionar a él.

### Ronda 27 — Publicación (fase 0 del plan definitivo)

- **El plan definitivo quedó aprobado** (documento *Plan definitivo — Helikón*):
  seis fases, una rama cada una, empezando por dejar el sitio publicable. Las
  decisiones que el equipo cerró: la "Página Helikón" del PDF que habla de la
  televisión es el cómic; la persona que camina hacia el televisor es una
  silueta anónima, sin relación con la historia (SVG provisional, la definitiva
  la dibuja Gabriel Torres); en Helikón solo quedan tres secciones; GSAP con
  ScrollTrigger como librería de animación; publicación en GitHub Pages.
- **`main` ya contiene todo.** Se unieron `fase-6-scroll-3d` y
  `docs-metodo-de-trabajo`, y antes se dejó la etiqueta **`v1.0-antes-del-plan`**
  sobre el último commit de la UX anterior: para volver a ese punto,
  `git checkout v1.0-antes-del-plan`.
- **`og:image` y `og:url` absolutos** en las cuatro páginas, con
  `link rel="canonical"` y `twitter:image`, apuntando a
  `https://camilo-b92.github.io/helikon-cuerdas-del-destino/`. Si el sitio
  cambia de dirección, hay que cambiar esas cuatro líneas por página.
- **`intro.mp4` bajó de 7,9 MB a 2,8 MB** (960×540, H.264 a ~340 kbps, audio
  mono a 48 kbps, `faststart`). El original sigue en el historial y en la
  etiqueta anterior. En fotogramas con mucho color se nota algo de compresión,
  que queda dentro del efecto de televisor viejo; si el equipo de animación
  prefiere más calidad, el siguiente punto razonable es 1280×720 a 3,3 MB.
- **Ramas antiguas borradas** (`fase-1-navegacion` a `fase-6-scroll-3d`): todas estaban
  dentro de `main`. El proxy del entorno de Claude bloquea el borrado de ramas
  remotas, así que se hizo desde la página de ramas de GitHub. Los números de
  fase del plan nuevo empiezan de cero sin confundirse con las viejas.
- **`.nojekyll`** en la raíz, para que GitHub Pages sirva los archivos tal cual.
- Probado a 1366, 768 y 360: 0 px de desborde, 0 errores en consola, axe con 0
  violaciones en las cuatro páginas, y el cómic arranca la introducción.
- **GitHub Pages activado** (*Settings → Pages*, `main`, raíz; la API de Pages
  está bloqueada en el entorno de Claude, así que se hizo desde el navegador).
  Sitio en `https://camilo-b92.github.io/helikon-cuerdas-del-destino/`: las
  cuatro páginas, la imagen de vista previa y `intro.mp4` responden 200.

### Ronda 28 — Base común de animación (fase 1 del plan)

- **GSAP 3.15 y ScrollTrigger, locales** en `assets/vendor/gsap/` (73 KB y 45 KB;
  28 KB y 18 KB comprimidos), copiados sin cambios del paquete de npm. El paquete
  no trae archivo de licencia; se dejó `LICENSE.md` con la versión, el origen y el
  enlace a la licencia estándar "sin cargo" de GreenSock. **Ninguna página lo carga
  todavía**: eso empieza en la fase 2.
- **`assets/js/movimiento.js` y `assets/css/movimiento.css`**, en el `<head>` de las
  cuatro páginas. Publican una sola señal, `html[data-movimiento]`, que vale
  `reducido` si el sistema pide menos movimiento **o** si el lector apagó las
  animaciones con el botón nuevo del menú, **Anim. sí/no** (se guarda en
  `localStorage` con `try/catch`; si el sistema ya lo pide, el botón no aparece).
  Se eligió el interruptor manual porque el plan trae mucho más movimiento.
- **Los seis scripts que miraban `prefers-reduced-motion`** (`pulp.js`, `home.js`,
  `scroll.js`, `vinilo.js`, `juanes.js`, `helikon.js`) ahora preguntan a
  `Movimiento.consulta`, y `scroll.js` se detiene y se reanuda al vuelo cuando se
  cambia el interruptor. Si `movimiento.js` no cargara, vuelven a `matchMedia`.
- **Una trampa que se resolvió así:** CSS no puede unir una media query con un
  atributo, así que `movimiento.css` repite lo que hacen los bloques de movimiento
  reducido de cada hoja, colgado de `html[data-movimiento="reducido"]`. Quien cambie
  uno de esos bloques tiene que cambiar su copia (está avisado en el README).
- **Cargador de GSAP con estado seguro.** Una página declara
  `data-gsap="ScrollTrigger"` en la etiqueta de `movimiento.js`; con movimiento
  reducido no se descarga nada, y `html.anim` solo se añade cuando todo cargó. Si
  GSAP falla o no hay JavaScript, la página se ve completa. Las fases siguientes
  deben esconder cosas solo bajo `.anim`.
- **Reparto fijado:** `scroll.js` para efectos simples con variables CSS, GSAP para
  secuencias coreografiadas, y nunca los dos sobre el mismo elemento. Presupuesto:
  120 KB comprimidos de JavaScript nuevo en la ruta inicial, 200 KB por imagen
  nueva, 3D en diferido. Todo está en el README.
- **README:** nueva tabla "Créditos de recursos externos" con autor, licencia,
  enlace y dónde se usa (GSAP, three.js, lottie-web, tipografías y las tres fotos).
  La licencia de lottie-web figura como MIT por su repositorio oficial: el archivo
  copiado no lleva cabecera, así que conviene confirmarlo.
- **El menú ganó un botón** y hubo que apretarlo en pantallas pequeñas: la marca se
  oculta desde 860 px (antes 640) y a 360 px el botón es un cuadrado de 46 px con
  "Anim." sobre el estado. Sin desborde a 1366, 768, 360 ni 320 px.
- **Comprobado:** axe con 0 violaciones en las cuatro páginas con el interruptor en
  sí y en no; sin errores de consola; con el interruptor en no o con el sistema
  pidiendo menos movimiento, cero animaciones largas o infinitas (se midió con
  `document.getAnimations()`); GSAP no se pide en ninguna página, ni se descarga
  con movimiento reducido; sin GSAP no se pone `.anim`; sin JavaScript la portada
  se ve. Comparando con `main` con movimiento reducido, **todo lo que queda bajo el
  menú es idéntico** a 1366 y 360 px, salvo 218 píxeles del vinilo 3D en Juanes
  (WebGL por software, no es determinista).
- **Límites conocidos.** El cómic sigue como estaba: la introducción en vídeo y las
  escenas de lottie no leen el interruptor, igual que no leían la preferencia del
  sistema; solo se apagan sus efectos CSS. Las decisiones que se toman una vez al
  cargar (por ejemplo, los contadores de Juanes) valen desde la siguiente recarga.
  No se probó en teléfono real ni con lector de pantalla.

---

## Pendientes

En orden de lo que más aporta:

1. ~~Publicar el sitio~~ — hecho en la ronda 27, con GitHub Pages. **Netlify** y
   **Vercel** siguen siendo alternativas válidas, y son las únicas si el
   repositorio vuelve a ser privado.

2. **Más 3D.** El primero ya existe: el vinilo de Juanes (ronda 26, three.js
   local). El televisor en CSS 3D se probó y se aparcó (ver *El televisor sigue
   siendo una imagen, por ahora*); mejor otra pieza, porque ahí manda leer el
   cómic. Para un modelo de verdad hace falta un modelador y un `.glb`; las
   condiciones de peso y carga están en *El 3D entra vivo*.

3. ~~Pasar `og:image` a URL absoluta~~ — hecho en la ronda 27.

4. **Historial y Stop motion**, si se quieren recuperar. Se retiraron por
   estar vacíos; el canal de Personajes sirve de molde para cuando haya
   material que poner.

5. ~~Comprimir `intro.mp4`~~ — hecho en la ronda 27 (2,8 MB). Siguen pesados
   `caja.json` (2.6 MB) es pesado, aunque ya está
   mitigado con el renderizador `canvas` y `setSubframe(false)`, y `txt.json`
   de la escena I del capítulo tres (casi 900 KB).

6. **La escena IV del capítulo dos ya tiene un botón "Correr"** para móvil (ronda 22). Queda por decidir con el equipo de animación si prefieren además un gesto de mantener pulsada la pantalla.

7. **Unificar las escenas en `.scene-stage` y `.scene-container`.** Las escenas
   1 a 5 tienen un par de reglas propias, casi idénticas entre sí; las
   escenas 6, 7 y 8 ya usan las compartidas. Solo se ahorra CSS, no cambia nada
   a la vista.

8. **Dos archivos sin usar.** Ninguno lo referencia ningún HTML, CSS ni JS.
   Decidir si se usan o se retiran:
   - `comic/assets/capitulo-n1/scene3/json/fonemas.json` (47 KB)
   - `comic/assets/capitulo-n1/scene3/img/fondoGuitarra.png` (156 KB) — el
     `#s3-fondoGuitarra` del CSS es solo un contenedor con `overflow:hidden`;
     el fondo real lo pinta el Lottie `fondoGuita.json`.

---

## Cómo entregar material gráfico nuevo

- **Dónde**: `assets/img/` si lo usa más de una página; una carpeta `img/`
  dentro de la sección si es exclusivo de ella.
- **Nombres**: minúsculas, sin espacios ni tildes.
- **Formato**: SVG para arte de línea; PNG con transparencia para recortes;
  WebP o JPG para fotos y renders.
- **Peso**: menos de 300 KB por archivo. Comprimir en <https://squoosh.app>.
- **En los SVG**: usar `stroke="currentColor"` en vez de un color fijo, para
  poder teñirlos desde CSS.
- **Al pasarlos**, indicar: en qué página, en qué sección, y si **reemplazan**
  algo existente o **se suman**.

### Sobre elementos 3D

**Decisión cambiada el 16 de septiembre de 2026.** Antes aquí decía que el 3D
debía usarse solo como fuente de imágenes fijas —modelar, renderizar a PNG con
transparencia y subir eso—. La razón era el peso: un GLB más su visor pesa entre
cientos de KB y varios MB, y el cómic ya carga 20 MB.

Se decidió ir por **modelos vivos**, con los dos enfoques conviviendo. El
detalle está arriba, en *El 3D entra vivo*. El argumento de peso sigue siendo
cierto, así que no desaparece: se convierte en presupuesto y en reglas de carga.

### Sobre Juanes

No generar retratos suyos con IA: es una persona real, hay derecho de imagen de
por medio y el resultado se notaría falso. Si se quiere su rostro, usar material
de prensa con licencia y citarlo.

*Aplicado el 16 de septiembre de 2026:* se bajaron tres fotografías de
Wikimedia Commons, todas Creative Commons y todas verificadas una por una
—autor, licencia y enlace— antes de tocarlas. La tabla de atribución está en el
README. Lo que **no** sirve es buscar en un buscador de imágenes y descargar lo
que salga: casi todo el material de prensa de un músico conocido es de agencia
y no se puede usar.

Dos hallazgos que no se buscaban y valen más que el retrato: hay foto del
**aldabón de la casa de sus padres** en Carolina del Príncipe —y la escena I
del cómic es exactamente Juanes llamando a una puerta— y de la **estatua** que
tiene en el pueblo. Material documental del sitio real donde empieza la
historia que el cómic dibuja.

---

## Cómo retomar en otra máquina

```bash
git clone https://github.com/Camilo-b92/helikon-cuerdas-del-destino.git
```

El repositorio es público: clonar no pide credenciales, pero subir sí, como
`Camilo-b92`.

**Las rutas del sitio son todas relativas**, así que funciona igual sin
importar en qué carpeta quede.

Lo que **no** viaja es el historial de las conversaciones con Claude Code, que
se guarda localmente en cada equipo. Por eso existe este documento: al abrir
una sesión nueva, basta con pedir que se lean el README, esta bitácora y `METODO.md`.
