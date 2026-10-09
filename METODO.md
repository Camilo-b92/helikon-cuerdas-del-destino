# Método de trabajo — de la idea al código

*Acordado el 9 de octubre de 2026 entre Camilo y Claude.* Se acabó modificar
"a lo loco": primero se piensa y se escribe el plan, y solo después se toca el
código. Este documento fija cómo se trabaja, qué herramientas hay para cada
tipo de trabajo y qué debe estar **activado antes de empezar**, para que
ninguno de los dos tenga que acordarse de memoria.

**Quien abra una sesión nueva debe leer, en este orden:** `README.md`,
`BITACORA.md` y este archivo.

---

## 1. El flujo, en seis pasos

| # | Paso | Quién | Qué sale de ahí |
|---|---|---|---|
| 1 | **Idea** | Camilo | Qué quiere, cómo lo imagina y cómo quiere que se ejecute. Sin formato obligatorio. |
| 2 | **Revisión de viabilidad** | Claude | Veredicto por idea: *Sí*, *Sí con condiciones* o *No (y la alternativa)*. Con el porqué. |
| 3 | **Plan detallado** | Claude | El plan completo (plantilla en el punto 2) y su **ficha de activación**. |
| 4 | **Aprobación** | Camilo | "Aprobado", o cambios. **No se escribe código sin esto.** |
| 5 | **Ejecución por fases** | Claude | Una rama por fase, con las puertas de calidad del punto 6. |
| 6 | **Cierre** | Los dos | Bitácora y README al día, rama subida; `main` solo cuando Camilo lo pida. |

Dos reglas que protegen el plan:

- **Si en mitad de la ejecución aparece algo que el plan no previó**, se para,
  se explica y se actualiza el plan. No se improvisa.
- **Una idea nueva no se cuela dentro de una fase en marcha.** Entra al
  siguiente plan.

---

## 2. Plantilla del plan

Cada plan tiene **todas** estas secciones. Si una no aplica, se escribe
"No aplica" y por qué; no se omite.

1. **Objetivo** — qué cambia para el lector, en una o dos frases.
2. **Alcance y fuera de alcance** — lo que sí y lo que expresamente no.
3. **Viabilidad** — veredicto, riesgos y lo que hay que decidir antes.
4. **Decisiones abiertas** — preguntas para Camilo, cada una con una
   recomendación. El plan no se aprueba con decisiones sin contestar.
5. **Archivos y zonas afectadas** — cuáles se crean, cuáles se tocan, cuáles
   **no** se tocan.
6. **Pasos**, numerados y ordenados, cada uno con su resultado esperable.
7. **Dependencias** — qué debe existir antes (un archivo, una cuenta, una
   foto con licencia, una herramienta).
8. **Peso y rendimiento** — qué añade en KB y dónde carga (ver regla 3D).
9. **Accesibilidad** — teclado, lector de pantalla, movimiento reducido.
10. **Criterios de aceptación** — frases comprobables ("a 360 px no hay
    desborde"), no deseos ("que se vea bien").
11. **Pruebas** — exactamente qué se corre y con qué.
12. **Cómo deshacerlo** — la rama sin fusionar es la red de seguridad; si hay
    datos externos, cómo se limpian.
13. **Documentación a actualizar** — qué apartado del README y qué ronda de la
    bitácora.
14. **Ficha de activación** — ver punto 3.

---

## 3. La ficha de activación

Va al final de cada plan. Es lo que se revisa **antes de decir "adelante"**.

```
FICHA DE ACTIVACIÓN — <nombre de la fase o elemento>

Alcance:            elemento | fase | área

Plugins activos:    <los que se necesitan> | ninguno extra
Conectores:         <conectados que se usan> | por autorizar: <cuáles>
Skills:             <las que se cargan al empezar>
Herramientas:       <git, Playwright, axe, ffmpeg, Blender…>
Cuentas/permisos:   <GitHub Pages, Supabase, dominio…> | ninguno
Lo debe hacer Camilo: <activar un plugin, autorizar un conector, aportar material>
Lo hace Claude:     <el resto>
Rama:               fase-N-nombre
Puertas de calidad: <las del punto 6 que apliquen>
```

**Alcance "elemento"**: un componente suelto (un botón, una sección, un
efecto). Lleva ficha corta: solo lo que cambie respecto del mínimo.
**Alcance "fase"**: un bloque de trabajo con varias piezas relacionadas.
**Alcance "área"**: una parte entera del sitio o una capacidad nueva (el
backend, el audio, la publicación). Lleva ficha completa y suele partirse en
varias fases.

---

## 4. Qué hay hoy (comprobado el 9 de octubre de 2026)

### Conectores

| Conector | Estado | Para qué en Helikón |
|---|---|---|
| Vercel | Conectado | Publicar, ver despliegues y logs, variables de entorno |
| Netlify | Conectado | Alternativa de publicación |
| Figma | Conectado | Del diseño al código y al revés |
| Canva | Conectado | Piezas gráficas, redes, pósters |
| Adobe for creativity | Conectado | Fuentes, retoque de imagen, PDF, vídeo |
| Google Drive | Conectado | Material que el equipo comparta |
| **Supabase** | **Sin autorizar** | Base de datos, cuentas y archivos: el candidato para el backend |
| **Sentry** | **Sin autorizar** | Errores reales de los lectores, una vez publicado |
| **Cloudflare** | **Sin autorizar** | Alojamiento y funciones, alternativa a Vercel |

### Plugins

| Plugin | Estado | Qué aporta |
|---|---|---|
| Audiorective | **Activo** | Skills para Web Audio: reproductor, visualizador, sintetizador, audio posicional |
| parallax-threejs | **Activo** | Depuración de escenas three.js y pruebas visuales; agentes `visual-debugger` y `shader-reviewer` |
| AudioPod | **Activo** | Transcribir, separar pistas (stems), limpiar ruido, pasar a MIDI |
| frontend-design | Por activar | Diseño de interfaz con carácter propio |
| Design | Por activar | Crítica de diseño, sistema de diseño, textos de interfaz, accesibilidad |
| Backend Design | Por activar | Modelado de datos, autenticación, migraciones, seguridad |
| Security Guidance | Por activar | Revisión de seguridad de cada cambio |
| context7 | Por activar | Documentación actual de cada librería |
| playwright | Por activar | Pruebas de extremo a extremo con un navegador gestionado |
| Axe Accessibility | Por activar | Escaneo y corrección de accesibilidad |

Activar o desactivar plugins y autorizar conectores **lo hace Camilo desde
claude.ai**; Claude no puede. Por eso existe la ficha de activación.

### Skills disponibles en la sesión

`frontend-design`, `dataviz`, `artifact-design`, `docs`, `docx`, `pdf`,
`pptx`, `xlsx`, `deep-research`, `built-in-browser`, `chrome-browser`,
`computer-use`, y las de los plugins activos (por ejemplo `audiorective`,
`audiopod-stems`, `parallax-threejs:checkpoint`).

### Herramientas del entorno de trabajo de Claude

| Herramienta | Estado | Uso |
|---|---|---|
| `git`, `gh` | Instaladas | Ramas, commits, subida a GitHub |
| Node 22 y `npm` | Instalados | Traer librerías para copiarlas a `assets/vendor/` |
| Playwright + Chromium | Instalados | Pruebas a 1366, 768 y 360 px; capturas |
| `axe-core` | En carpeta de trabajo | Auditoría de accesibilidad |
| `ffmpeg`, ImageMagick | Instalados | Comprimir vídeo, convertir y recortar imágenes |
| `python3 -m http.server` | Instalado | Servir el sitio para probarlo |
| Blender | **No está** | Hace falta solo si se quiere modelar `.glb` |

El entorno de Claude **no es** el ordenador de Camilo: lo que esté instalado
en uno no lo está en el otro. Los archivos llegan a su PC por la sincronización
con Git.

---

## 5. Qué activar según el área

"Siempre" significa que forma parte de **cualquier** trabajo. Las demás
columnas se activan solo cuando el plan toca esa área.

**Siempre:** `git`, Playwright + Chromium, axe-core, y las reglas del punto 7.

| Área | Plugins a activar | Conectores | Skills | Herramientas extra | Verificación específica |
|---|---|---|---|---|---|
| **Interfaz y estilo** (portada, páginas de papel, menú) | frontend-design, Design | Figma o Canva si hay diseño de partida | `frontend-design` | — | Capturas a 3 anchos; contraste; sin desborde |
| **Animación por scroll** | frontend-design | — | `frontend-design` | — | Movimiento reducido apagado; sin salto de maquetación |
| **3D** (three.js) | parallax-threejs | — | `parallax-threejs:*` | `gltf-transform` si hay `.glb`; Blender si se modela | Presupuesto de peso; plan B sin WebGL; liberar geometrías (`memcheck`) |
| **Audio y música** | Audiorective, AudioPod | — | `audiorective`, `audiopod-*` | `ffmpeg` | El audio no arranca solo; control de volumen; teclado |
| **Cómic** (el televisor) | — | — | — | `ffmpeg` para vídeo | Recorrido completo con teclado; peso de los Lottie |
| **Contenido sobre Juanes** | — | Google Drive si el equipo aporta material | `deep-research` | — | **Cada dato con fuente** (regla 5, punto 7) |
| **Backend y datos** | Backend Design, Security Guidance, context7 | **Supabase** (por autorizar), Vercel | — | — | Ver el punto 8: es un área que necesita sus propias decisiones |
| **Publicación** | — | Vercel o Netlify; GitHub Pages sin conector | — | `gh` | `og:image` absoluta; revisión de enlaces rotos |
| **Monitorización** | — | **Sentry** (por autorizar) | — | — | Solo después de publicar |
| **Calidad y accesibilidad** | Axe Accessibility, playwright, Security Guidance | — | — | — | axe a 0; teclado; lector de pantalla (lo prueba Camilo) |
| **Documentos del equipo** (informes, presentaciones) | — | Google Drive | `docs`, `docx`, `pdf`, `pptx` | — | Se abre y se revisa antes de entregarlo |

### Por tipo de alcance

- **Un elemento:** la fila de su área, y nada más. Si el elemento cabe en
  "Interfaz y estilo", solo eso.
- **Una fase:** las filas de todas las áreas que toque, sin añadir las demás.
- **Un área nueva (backend, audio, publicación):** la fila completa más una
  sesión previa de decisiones, porque suele cambiar la manera de trabajar del
  proyecto (ver punto 8).

---

## 6. Puertas de calidad

Una fase no se da por terminada hasta pasar las que le apliquen. Se registran
en la bitácora con lo que se midió, no con "se ve bien".

1. **Consola limpia** en las páginas tocadas, sin errores propios.
2. **Sin desborde horizontal** a 1366, 768 y 360 px.
3. **axe con 0 violaciones**, tras recorrer la página para que se muestren los
   elementos revelados.
4. **Teclado:** se puede llegar a todo con Tab y activar con Enter o espacio.
5. **Movimiento reducido:** nada gira, se desplaza ni se anima en bucle.
6. **Sin la capacidad opcional:** la página sigue sirviendo sin JavaScript
   complementario, sin WebGL, sin audio o sin red.
7. **Peso:** lo que se añade queda anotado en KB, y nada nuevo entra en la ruta
   crítica de la portada.
8. **Seguridad**, si hay formularios, datos o terceros: sin claves en el
   repositorio, entradas validadas, y `Security Guidance` revisando.
9. **Documentación al día** antes de subir.

**Lo que Claude no puede comprobar y por tanto declara siempre:** el
comportamiento en un teléfono real, con lector de pantalla y con tarjeta
gráfica. Esas pruebas las hace Camilo, o quedan anotadas como no hechas.

---

## 7. Reglas fijas del proyecto

1. **Sin comentarios en el código.** La explicación va en README y bitácora.
2. **Sin proceso de compilación.** El sitio es HTML, CSS y JS que se abre tal
   cual. Las librerías se copian a `assets/vendor/`, no se instalan al
   desplegar. *Cualquier plan que rompa esto lo dice en "Viabilidad" y pide
   aprobación expresa.*
3. **3D:** en diferido, con plan B, y las páginas de papel primero (ver
   *El 3D entra vivo* en la bitácora).
4. **Rutas relativas** y finales de línea LF.
5. **Nada inventado sobre personas reales.** Cada dato sobre Juanes, con
   fuente; sin retratos generados con IA; sin letras de canciones copiadas.
   La página es **no oficial** y lo dice.
6. **Una rama por fase**, con el nombre `fase-N-descripción`; siempre se sube
   la rama. **`main` solo cuando Camilo diga "súbelo".**
7. **Commits** firmados con el nombre de Camilo y con la línea de coautoría.
8. **Español** en las respuestas, los textos del sitio y los documentos.
9. **Un cambio, un motivo:** el commit y la bitácora dicen *por qué*, no solo
   *qué*.

---

## 8. Decisiones que condicionan casi todo lo que viene

Esto no es un plan; son las preguntas que hay que contestar **antes** de
planificar las áreas grandes.

**Backend y datos.** Hoy el sitio es estático y no tiene servidor. Un backend
fiable significa añadir uno, y eso choca con la regla 2. Los caminos son:

| Camino | Qué implica | Encaja con |
|---|---|---|
| **A. Seguir estático** | GitHub Pages; formularios y contadores con servicios externos | Contenido, sin cuentas ni escritura |
| **B. Estático + Supabase** | El sitio sigue sin compilar; el navegador habla con Supabase (datos, cuentas, archivos) | Comentarios, favoritos, panel de contenido |
| **C. Con funciones en Vercel o Netlify** | Pequeñas funciones de servidor además del sitio | Lógica que no puede vivir en el navegador (pagos, correos) |

Lo que decide el camino es **qué quiere hacer el lector**: si solo lee, A; si
deja algo (un comentario, una reacción), B; si hay dinero o correos, C. Por eso
el plan de backend **no se escribe hasta tener la lista de funciones**.

**Audio.** Audiorective trae módulos ES con dos dependencias (`alien-signals`
e `immer`), pensados para un proyecto con empaquetador. Habría que copiarlos
a `assets/vendor/` ya empaquetados, o usar Web Audio directamente. Es una
decisión del plan de audio, no se toma de antemano.

**Publicación.** Pendiente desde hace varias rondas. Conviene decidirla
**antes** del backend, porque casi todo lo demás (datos, correos, monitor de
errores) necesita una dirección real.

**El propósito de la página de Juanes.** Lo que se pueda hacer con la música
de un artista real tiene límites claros: reproductor oficial incrustado sí;
copiar letras, reproducir sus pistas desde nuestros servidores o decir cosas
no verificadas, no. Los planes que toquen este tema empiezan por ahí.

---

## 9. Cómo presentar una idea

No hace falta formato. Pero si ayuda, esto es lo que Claude siempre va a
preguntar, así que contestarlo de entrada acelera:

1. ¿Qué quieres que pase, y para quién (el lector, el equipo, el profe)?
2. ¿Cómo lo imaginas? (una frase, un dibujo, una referencia, un enlace)
3. ¿Es indispensable o es un "sería bonito"?
4. ¿Hay material que ya exista (imágenes, audio, textos) o hay que crearlo?
5. ¿Tiene fecha, o depende de algo del SENA?

Claude responde con la revisión de viabilidad (paso 2), las preguntas que
queden abiertas y, cuando todo esté contestado, el plan completo con su ficha
de activación.
