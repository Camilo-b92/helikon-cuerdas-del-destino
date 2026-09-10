# Helikón — Cuerdas del Destino

Sitio web de **Helikón**, el estudio detrás de *Cuerdas del Destino*: un cómic
digital interactivo inspirado en la historia de Juanes, que se lee dentro de un
televisor retro cambiando de canal.

> **¿Retomando el proyecto?** Lee este archivo para saber **cómo está armado**,
> y la [**BITÁCORA**](BITACORA.md) para saber **por qué se decidió así** y
> **qué quedó pendiente**.

**Repositorio:** `github.com/Camilo-b92/helikon-cuerdas-del-destino` (privado)

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
con el script de cada página.

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

## Cómo verlo en local

El sitio necesita servirse por HTTP, no abrirse con doble clic: abrir el
archivo directamente rompe la carga de las animaciones Lottie del cómic.

**Con VS Code** — instala la extensión *Live Server*, clic derecho sobre
`index.html` → *Open with Live Server*.

**Con Python**, desde la raíz del proyecto:

```bash
python -m http.server 5500
```

Y abre <http://localhost:5500>.

## Trabajar desde otra máquina

```bash
git clone https://github.com/Camilo-b92/helikon-cuerdas-del-destino.git
```

El repositorio es privado, así que pedirá iniciar sesión como `Camilo-b92`.
Después, identifícate para que tus commits queden a tu nombre:

```bash
git config --global user.name "Camilo Betancourt"
git config --global user.email "camilobetancourt02@gmail.com"
```

### El ciclo de trabajo

Siempre igual, y en este orden:

```bash
git pull                      # al empezar, para traer lo último
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

- **Netlify** o **Vercel** — publican gratis **desde repositorios privados**.
  Es la opción recomendada mientras este repositorio siga siendo privado.
- **GitHub Pages** — solo funciona en repositorios públicos con cuenta
  gratuita. Si el repositorio se hace público, se activa en
  *Settings → Pages*, publicando desde la rama `main`, carpeta raíz.

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

## Accesibilidad

Todas las animaciones respetan `prefers-reduced-motion`. El revelado al hacer
scroll solo oculta el contenido si el JavaScript llegó a ejecutarse (marca
`.js-reveal` en `<html>`), para que un fallo de script no deje la página en
blanco.

## Estado del contenido

El cómic tiene el capítulo uno completo (tres escenas) y las dos primeras
escenas del capítulo dos, repartidas en once canales (0 a 10). Al encender, el
televisor reproduce el video de introducción y luego la presentación del
título antes de llegar al menú.

En ese menú, los canales **Personajes**, **Historial** y **Stop motion** son
marcadores de posición a la espera de su contenido.

La lista completa de pendientes está en la [bitácora](BITACORA.md).
