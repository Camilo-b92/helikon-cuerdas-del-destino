# Bitácora del proyecto

Este documento complementa el [README](README.md). Allí está **cómo está
armado** el proyecto; aquí está **por qué se tomaron las decisiones** y **en
qué vamos**.

Si retomas el trabajo en otra máquina o después de un tiempo, lee primero el
README y luego esto.

---

## Estado a 10 de septiembre de 2026

| | |
|---|---|
| Repositorio | `github.com/Camilo-b92/helikon-cuerdas-del-destino` (privado) |
| Rama | `main` |
| Publicado en línea | Todavía no |
| Canales del televisor | 0–10 (once en total) |
| Peso total | ~17 MB, casi todo arte del cómic |

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

### Los gráficos son SVG en línea, no imágenes

El proyecto no tenía archivos de imagen para las tres páginas de papel, así que
las ilustraciones (plumilla, guitarra, televisor, reloj de arena, iconos de
oficio, ecualizador, vinilos) se dibujaron como SVG dentro del HTML. Escalan sin
perder nitidez, no pesan y no dependen de nada externo.

Cuando haya material gráfico propio, puede reemplazarlos o convivir con ellos.

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

## Pendientes

En orden de lo que más aporta:

1. **Publicar el sitio.** El repositorio es privado, así que GitHub Pages no
   sirve sin plan de pago. **Netlify** y **Vercel** publican gratis desde
   repositorios privados y no piden tarjeta.

2. **Los tres canales del menú.** **Personajes**, **Historial** y **Stop
   motion** siguen siendo marcadores de posición. El capítulo dos ya avanzó a
   dos escenas, así que esos tres canales son lo que queda por llenar.

3. **Unificar el marco de la página del Cómic** con el lenguaje pulp,
   conservando el interior del televisor como está.

4. **Comprimir `comic/assets/intro.mp4`** (7.6 MB). También `caja.json`
   (2.6 MB) es pesado, aunque ya está mitigado: se dibuja con el renderizador
   `canvas` de Lottie y con `setSubframe(false)`, porque en SVG congelaba el
   navegador.

5. **`comic/assets/capitulo-n1/scene3/json/fonemas.json`** (47 KB) está en el
   repositorio pero no lo usa ninguna escena. Decidir si se usa o se retira.

6. **Definir el idioma del Home.** Mezcla inglés (`THE MUSIC COMES ALIVE!`,
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

Conviene usarlos como **fuente de imágenes fijas** —modelar, renderizar a PNG
con transparencia y subir eso— en vez de incrustar modelos vivos. Un GLB más su
visor pesa entre cientos de KB y varios MB, y el cómic ya carga 17 MB.

### Sobre Juanes

No generar retratos suyos con IA: es una persona real, hay derecho de imagen de
por medio y el resultado se notaría falso. Si se quiere su rostro, usar material
de prensa con licencia y citarlo.

---

## Cómo retomar en otra máquina

```bash
git clone https://github.com/Camilo-b92/helikon-cuerdas-del-destino.git
```

El repositorio es privado: hay que iniciar sesión como `Camilo-b92`.

**Las rutas del sitio son todas relativas**, así que funciona igual sin
importar en qué carpeta quede.

Lo que **no** viaja es el historial de las conversaciones con Claude Code, que
se guarda localmente en cada equipo. Por eso existe este documento: al abrir
una sesión nueva, basta con pedir que se lean el README y esta bitácora.
