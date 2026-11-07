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
    ],
  },

];
