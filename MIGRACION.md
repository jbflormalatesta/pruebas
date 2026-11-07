# Guía de migración para el área de Sistemas

Sitio oficial del Jardín Botánico Municipal «Florencio Malatesta» (Dirección de Biodiversidad y
Ecología Urbana · Subsecretaría de Ambiente · Municipalidad de Marcos Paz). Hoy se publica en
`https://jbflormalatesta.github.io/` (GitHub Pages, cuenta del Jardín). Está pensado para mudarse al
dominio municipal **https://www.marcospazdigital.gob.ar** sin rehacer nada.

Contacto: ecologiaurbana@marcospaz.gov.ar · jardinbotanicommp@gmail.com

## 1. Qué es

- **Sitio estático:** HTML, CSS y JavaScript sin compilación, sin base de datos y sin código de
  servidor. Migrar es copiar la carpeta.
- **Enlaces relativos en todo el sitio:** funciona igual en la raíz de un dominio, en un subdominio
  o dentro de una carpeta.
- **Peso:** unos 500 KB sin fotos. La página más pesada es la colección (unos 200 KB de datos).
- **Dependencias externas:** Google Fonts (Chelsea Market y Nunito Sans; si se prefiere, se pueden
  alojar en el servidor) y enlaces a Google Forms (los formularios no se alojan en el sitio).
- **Datos personales:** el sitio no recibe ni guarda datos de nadie. No usa cookies ni analítica.

## 2. Requisitos del servidor

1. Servir archivos estáticos por HTTPS.
2. Que `/carpeta/` sirva `/carpeta/index.html`, como hace cualquier servidor por defecto.
3. Opcional, recomendado: usar `404.html` como página de error, para que `…/A-71` (sin «?») lleve a la ficha.
   - Apache: `ErrorDocument 404 /jardinbotanico/404.html`
   - Nginx: `error_page 404 /jardinbotanico/404.html;`

Ubicaciones posibles (a definir por Sistemas):

- `https://www.marcospazdigital.gob.ar/jardinbotanico/` (carpeta), o
- `https://jardinbotanico.marcospazdigital.gob.ar/` (subdominio).

El sitio no comparte estilos ni scripts con el resto del portal: cada página carga solo los suyos, así
que puede convivir con el portal sin conflictos.

## 3. Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Portada. En `<head>` lleva el enrutador de los QR (ver 4). |
| `visita/`, `coleccion/`, `el-jardin/` | Secciones (cada una con su `index.html`). |
| `comun/sitio.css`, `comun/sitio.js` | Estilos (paleta institucional) y comportamientos comunes. |
| `datos/sitio.js` | Aviso, horarios, contactos y enlaces a formularios (lo edita el Jardín). |
| `datos/especies.js` | Fichas de las 156 especies de la colección. |
| `datos/direcciones.js` | Contrato de direcciones de los QR impresos. |
| `coleccion/coleccion.js`, `.css` | Listado y fichas de la colección. |
| `img/`, `fotos/` | Logos, íconos y fotografías. |
| `404.html` | Redirección de direcciones sin «?» y de páginas inexistentes. |

## 4. Contrato de direcciones: los QR impresos

La cartelería impresa (312 piezas de la colección, más el cartel de acceso, los 6 carteles de sector y
los 2 tótems direccionales y los 2 paneles) lleva QR que apuntan a **la portada con un código corto**:

```
https://jbflormalatesta.github.io/?A-71      etiqueta de especie (D1)
https://jbflormalatesta.github.io/?A-71&f    ficha A5 de especie (D2)
https://jbflormalatesta.github.io/?acceso    cartel de acceso
https://jbflormalatesta.github.io/?S-01      cartel de sector (S-01 a S-06)
https://jbflormalatesta.github.io/?P-01      panel interpretativo (P-01 y P-02)
https://jbflormalatesta.github.io/?T-01      tótem direccional (T-01 y T-02)
```

La portada lee `datos/direcciones.js` y reenvía cada código a la página que corresponde hoy. Los
códigos no se cambian nunca (están impresos); los destinos sí.

**Esas direcciones van a seguir impresas después de la migración.** Por eso, una vez que el sitio esté
en el dominio municipal, el repositorio de GitHub **no se borra**: se reemplaza su contenido por un
redireccionador que manda cada visita a la misma ruta en el dominio nuevo, conservando el código.

### Redireccionador para dejar en GitHub después de la migración

Reemplazar todo el contenido del repositorio `jbflormalatesta.github.io` por estos dos archivos,
ajustando `NUEVO`:

`index.html`

```html
<!doctype html>
<meta charset="utf-8">
<title>Jardín Botánico Municipal «Florencio Malatesta»</title>
<script>
  var NUEVO = 'https://www.marcospazdigital.gob.ar/jardinbotanico/';
  location.replace(NUEVO + location.search + location.hash);
</script>
<p>El sitio se mudó a <a href="https://www.marcospazdigital.gob.ar/jardinbotanico/">marcospazdigital.gob.ar/jardinbotanico</a>.</p>
```

`404.html`

```html
<!doctype html>
<meta charset="utf-8">
<title>Jardín Botánico Municipal «Florencio Malatesta»</title>
<script>
  var NUEVO = 'https://www.marcospazdigital.gob.ar/jardinbotanico/';
  location.replace(NUEVO + location.pathname.replace(/^\//, '') + location.search + location.hash);
</script>
```

Así, `https://jbflormalatesta.github.io/?A-71` pasa a `…/jardinbotanico/?A-71`, y el enrutador del
sitio nuevo hace el resto. Conviene probar una muestra de códigos de cada tipo antes de dar de baja
nada.

## 5. Qué edita el Jardín después de la migración

- `datos/sitio.js`: aviso, horarios, contactos y enlaces.
- `datos/especies.js`: textos de las fichas.
- `fotos/`: fotografías.

Todo lo demás es estructura. Si el área de Sistemas prefiere integrar el contenido a su gestor de
contenidos, los textos están en esos archivos de datos y en las páginas, sin dependencias ocultas.

## 6. Accesibilidad y rendimiento

- Contraste de color AA en todo el texto, navegación por teclado, enlace «Saltar al contenido».
- La navegación y los contenidos principales funcionan sin JavaScript. La colección lo necesita para
  mostrar las fichas.
- Si falta alguna foto, la página no se rompe: muestra una lámina con la silueta de un árbol.
