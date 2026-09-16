# Bitácora del proyecto

Este documento complementa el [README](README.md). Allí está **cómo está
armado** el proyecto; aquí está **por qué se tomaron las decisiones** y **en
qué vamos**.

Si retomas el trabajo en otra máquina o después de un tiempo, lee primero el
README y luego esto.

---

## Estado a 16 de septiembre de 2026

| | |
|---|---|
| Repositorio | `github.com/Camilo-b92/helikon-cuerdas-del-destino` (público) |
| Rama | `main`, al día con el remoto |
| Publicado en línea | Todavía no |
| Canales del televisor | 0–8 (nueve en total) |
| Peso total | ~17 MB, casi todo arte del cómic |
| Personajes | Canal 0: cinco figuras y treinta expresiones |
| Presentaciones | Canal 1 (capítulo uno) y canal 6 (capítulo dos) |
| Comentarios en el código | Ninguno: la documentación vive aquí y en el README |

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
17 MB y una portada que tarde en abrir espanta al lector. Así que la decisión
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

Cuando el primer modelo esté montado, aquí va lo que se aprendió: pesos reales,
qué renderizador se usó y qué falló.

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

Las funciones `prefetchEscenaN()` solo hacen `fetch` y `new Image`: calientan
la caché de red, nada más. **No pueden crear todavía las animaciones** porque
el renderizador `canvas` fija su tamaño según el contenedor en el momento en
que se crea, y el canal siguiente sigue oculto (`display: none`, es decir 0x0).
Crearlas de verdad es trabajo de `initEscenaN()`, que solo corre cuando el
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
`min(1566px, 99vw, calc((100vh - 100px) * 1.6930))`.

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

## Pendientes

En orden de lo que más aporta:

1. **Publicar el sitio.** Ahora que el repositorio es público, **GitHub Pages**
   sirve sin plan de pago: se activa en *Settings → Pages*, desde `main` y
   carpeta raíz. **Netlify** y **Vercel** siguen siendo alternativas válidas, y
   son las únicas si el repositorio vuelve a ser privado.

2. **El primer elemento 3D.** El televisor en CSS 3D se probó y se aparcó (ver
   *El televisor sigue siendo una imagen, por ahora*). Si se retoma el 3D,
   mejor por otra pieza que no sea el televisor, porque ahí manda leer el
   cómic. Hace falta un modelador instalado y un `.glb` con el que empezar; las
   condiciones de peso y carga están en *El 3D entra vivo*.

3. **Falta `og:image`.** Las cuatro páginas tienen Open Graph, pero ninguna
   declara imagen de vista previa. Hace falta una de **1200x630** con la
   portada definitiva; hasta entonces, compartir el enlace no muestra nada.

4. **Historial y Stop motion**, si se quieren recuperar. Se retiraron por
   estar vacíos; el canal de Personajes sirve de molde para cuando haya
   material que poner.

5. **Unificar el marco de la página del Cómic** con el lenguaje pulp,
   conservando el interior del televisor como está.

6. **Comprimir `comic/assets/intro.mp4`** (7.6 MB). Ya hay `ffmpeg` instalado
   para hacerlo. También `caja.json` (2.6 MB) es pesado, aunque ya está
   mitigado con el renderizador `canvas` y `setSubframe(false)`.

7. **Dos archivos sin usar.** Ninguno lo referencia ningún HTML, CSS ni JS.
   Decidir si se usan o se retiran:
   - `comic/assets/capitulo-n1/scene3/json/fonemas.json` (47 KB)
   - `comic/assets/capitulo-n1/scene3/img/fondoGuitarra.png` (156 KB) — el
     `#s3-fondoGuitarra` del CSS es solo un contenedor con `overflow:hidden`;
     el fondo real lo pinta el Lottie `fondoGuita.json`.

8. **Definir el idioma del Home.** Mezcla inglés (`THE MUSIC COMES ALIVE!`,
   `OPEN →`) con español en un documento marcado `lang="es"`. Puede ser
   intencional, porque las onomatopeyas en inglés son convención del cómic,
   pero conviene que sea una decisión y no inercia.

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
cientos de KB y varios MB, y el cómic ya carga 17 MB.

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
una sesión nueva, basta con pedir que se lean el README y esta bitácora.
