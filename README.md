# Jardín Botánico Municipal «Florencio Malatesta» · sitio oficial

Sitio del Jardín Botánico Municipal «Florencio Malatesta» (Dirección de Biodiversidad y Ecología
Urbana · Subsecretaría de Ambiente · Municipalidad de Marcos Paz). Es un sitio estático: páginas HTML,
una hoja de estilos y un poco de JavaScript, sin base de datos ni compilación. Lo que está en este
repositorio es exactamente lo que se publica.

> **No cambies el nombre de la cuenta ni el del repositorio.** Los QR de la cartelería impresa
> apuntan a `https://jbflormalatesta.github.io/`: si la dirección cambia, dejan de funcionar.

## Qué se edita y dónde

| Quiero… | Archivo | Qué tocar |
|---|---|---|
| Publicar un aviso (cierre por lluvia, Feria este sábado) | `datos/sitio.js` | `aviso`: `mostrar: true`, `tipo`, `texto` y, si querés, `hasta` |
| Cambiar los horarios | `datos/sitio.js` | `horarios` |
| Cambiar un formulario (visitas, Centinelas, Feria Verde) | `datos/sitio.js` | `enlaces` |
| Cambiar correo o redes | `datos/sitio.js` | `contacto` (y el pie de cada página, que lo repite) |
| Corregir el texto de una especie | `datos/especies.js` | buscar el código, por ejemplo `"A-71"` |
| Decidir adónde lleva el QR de las fichas A5 | `datos/sitio.js` | `qrFichas`: `"ficha"` o `"linktree"` |
| Ubicar un sector, un servicio o un ejemplar en el plano | `datos/plano.js` | `col` y `fila` (las instrucciones están al principio del archivo) |
| Que una actividad aparezca en la **Agenda** | calendario «JB - Público» de Google (no se toca el sitio) | título, día, hora y lugar. De la descripción solo se publican los renglones que empiezan con «Web:» |
| Cambiar la dirección de la aplicación que lee el calendario | `datos/sitio.js` | `agenda.datos` |
| Sumar un material para descargar en **Recursos** | `recursos/archivos/` y `datos/recursos.js` | subir el archivo y copiar un bloque (instrucciones al principio de `datos/recursos.js`) |
| Subir fotos del sitio | `fotos/sitio/` | ver el README de esa carpeta |
| Subir fotos de especies | `fotos/especies/` | `A-71-primavera.jpg`, etc. |

Para editar un archivo: abrirlo en GitHub → lápiz (**Edit this file**) → cambiar → **Commit changes**.
Los cambios se ven en el sitio en uno a diez minutos.

**No se tocan:** `datos/direcciones.js` (el contrato de los QR impresos: solo se agregan códigos),
`comun/`, `coleccion/coleccion.js` ni las páginas `index.html`, salvo para cambiar textos.

## Estructura

```
index.html            Portada (y enrutador de los QR impresos)
visita/               Visitá el Jardín: horarios, cómo llegar, servicios, pautas, visitas guiadas
plano/                Plano del Jardín: relevamiento de 2026, sectores, servicios y entradas (plano.js, plano.css)
coleccion/            La colección: listado y fichas (coleccion.js, coleccion.css)
agenda/               Agenda: actividades abiertas, del calendario «JB - Público» (comun/agenda.js)
centinelas/           Programa Centinelas de Nativas
recursos/             Recursos para descargar (recursos.js); los archivos van en recursos/archivos/
el-jardin/            El Jardín: historia, misión, institucional, contacto
comun/                sitio.css (estilos y paleta), sitio.js (aviso, horarios, enlaces) y agenda.js
datos/                sitio.js, especies.js, direcciones.js, plano.js y recursos.js
img/                  logos, íconos e imagen para compartir
fotos/sitio/          fotos de las páginas
fotos/especies/       fotos de las cuatro estaciones
404.html              lleva …/A-71 (sin «?») a la ficha; cualquier otra dirección, a la portada
MIGRACION.md          guía para el área de Sistemas
```

Cada página tiene escrita su cabecera y su pie. Si se agrega una sección, se suma el enlace en la
navegación de **todas** las páginas.

## Contrato de direcciones (QR impresos)

| Código | Pieza | Adónde lleva hoy |
|---|---|---|
| `?A-01` … `?A-76`, `?H-01` … `?H-83` | Etiquetas D1 de especie | Ficha de la especie |
| `?A-01&f` … `?H-83&f` | Fichas A5 D2 | Ficha de la especie (o Linktree, según `qrFichas`) |
| `?acceso` | A1 · Cartel de acceso | Visitá el Jardín |
| `?S-01` … `?S-06` | C1 · Carteles de sector | El sector, en el plano |
| `?P-01` | C2 · Panel Mariposario nativo | El panel, en el plano |
| `?P-02` | C2 · Panel Centinelas de Nativas | La página de Centinelas |
| `?T-01`, `?T-02` | B1 · Tótems direccionales | El plano, con «Estás acá» cuando el tótem está ubicado |

Sectores: S-01 Talar bonaerense · S-02 Vivero de nativas · S-03 Huerta agroecológica · S-04 Estanque ·
S-05 Aromáticas y medicinales · S-06 Compostera.

## Copia de prueba

Los cambios grandes se prueban primero en el repositorio `pruebas` (se ve en
`https://jbflormalatesta.github.io/pruebas/`). Sus páginas llevan una línea `noindex` para que los
buscadores no la muestren; al pasar a este repositorio, esa línea se quita.
