/*
 * RECURSOS PARA DESCARGAR · lista de la página «Recursos»
 * ------------------------------------------------------
 * CÓMO SUMAR UN MATERIAL
 *   1. Subí el archivo a la carpeta recursos/archivos/ del repositorio («Add file» → «Upload files»).
 *      Preferentemente PDF y de menos de 10 MB. Nombre sin espacios, por ejemplo
 *      2026-11_Folleto_Compost.pdf
 *   2. Acá abajo, copiá un bloque { … } completo, pegalo dentro del grupo que corresponda (o armá un
 *      grupo nuevo) y cambiá los textos entre comillas:
 *        archivo: "archivos/NOMBRE-DEL-ARCHIVO.pdf"  (o una dirección completa https://… si el
 *                 material está en otro sitio; en ese caso el botón dice «Abrir»)
 *        peso:    lo que pesa el archivo, por ejemplo "1,2 MB" (opcional)
 *        fuente:  quién lo hizo, si no es del Jardín (opcional)
 *   3. Guardá («Commit changes»). Se ve en el sitio unos minutos después.
 * Para sacar un material, borrá su bloque (el archivo puede quedar en la carpeta).
 *
 * NO SE PUBLICAN: archivos con datos personales (DNI, teléfonos, listas de participantes), fotos de
 * chicas o chicos reconocibles, ni materiales de otros sin su permiso (en ese caso, mejor poner la
 * dirección de su sitio). No borres las comas del final de cada renglón.
 */
window.RECURSOS = [

  {
    grupo: "Para visitar el Jardín",
    items: [
      {
        titulo: "Plano del Jardín",
        descripcion: "Sectores, servicios, entradas y árboles, sobre el relevamiento que hizo el equipo recorriendo el Jardín a pie. Una hoja A4 para imprimir.",
        archivo: "archivos/2026-11_Plano_JardinBotanico.pdf",
        formato: "PDF",
        peso: "0,7 MB",
        fecha: "Noviembre de 2026",
      },
      {
        titulo: "Tríptico del Jardín",
        descripcion: "Qué es el Jardín, horarios, cómo llegar, los seis sectores, Centinelas de Nativas y la Feria Verde. Una hoja A4 para imprimir de los dos lados y plegar en tres.",
        archivo: "archivos/2026-11_Triptico_JardinBotanico.pdf",
        formato: "PDF",
        peso: "0,9 MB",
        fecha: "Noviembre de 2026",
      },
    ],
  },

  {
    grupo: "Plantas nativas",
    items: [
      {
        titulo: "Gacetillas botánicas del vivero: 25 especies nativas",
        descripcion: "Fichas de 25 plantas nativas que se producen en el vivero del Jardín, para conocerlas y reconocerlas.",
        archivo: "archivos/2026-06_Gacetillas_25EspeciesNativas.pdf",
        formato: "PDF",
        peso: "0,7 MB",
        fecha: "Junio de 2026",
      },
      {
        titulo: "Árboles y arbustos nativos: flor y época de colecta",
        descripcion: "Cuándo florecen y cuándo maduran los frutos de 54 árboles y arbustos nativos de la región, para saber en qué época colectar semillas. Una hoja A4.",
        archivo: "archivos/2026-11_Tabla_ArboreasFlorYColecta.pdf",
        formato: "PDF",
        peso: "0,2 MB",
        fecha: "Noviembre de 2026",
      },
    ],
  },

  {
    grupo: "Centinelas de Nativas",
    items: [
      {
        titulo: "Bitácora de observación",
        descripcion: "Para las instituciones del programa: ficha del ejemplar, registro quincenal para fotocopiar, resumen del año y guía para observar y cuidar. Cuatro hojas A4.",
        archivo: "archivos/2026-11_Bitacora_CentinelasNativas.pdf",
        formato: "PDF",
        peso: "0,5 MB",
        fecha: "Noviembre de 2026",
      },
    ],
  },

  {
    grupo: "Para hacer en casa",
    items: [
      {
        titulo: "Compostá en casa",
        descripcion: "Qué va y qué no va a la compostera, el paso a paso y cómo resolver los problemas más comunes. Una hoja A4 para imprimir de los dos lados y plegar en tres.",
        archivo: "archivos/2026-11_Folleto_Compost.pdf",
        formato: "PDF",
        peso: "0,3 MB",
        fecha: "Noviembre de 2026",
      },
    ],
  },

  {
    grupo: "Guías de otras instituciones",
    items: [
      {
        titulo: "Guía completa de propagación de especies nativas",
        descripcion: "Cómo multiplicar plantas nativas por semilla y por gajo, especie por especie.",
        archivo: "https://www.ambiente.gba.gob.ar/pdfs/008_gu%C3%ADa%20completa_propagaci%C3%B3n_especies_nativas_ene25.pdf",
        formato: "PDF",
        peso: "10 MB",
        fecha: "Enero de 2025",
        fuente: "Ministerio de Ambiente de la Provincia de Buenos Aires",
      },
      {
        titulo: "Guía para la gestión integral de viveros de flora nativa rioplatense",
        descripcion: "Para viveros de la Cuenca Matanza Riachuelo, que incluye a Marcos Paz en la cuenca alta, con foco en el talar y el pastizal.",
        archivo: "https://centrodocumental.acumar.gob.ar/items/show/9274",
        formato: "Página del Centro Documental",
        fuente: "ACUMAR",
      },
    ],
  },

];
