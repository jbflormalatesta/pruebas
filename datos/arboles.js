/*
 * ÁRBOLES DEL JARDÍN CON MEDIDAS · para el modelo 3D del plano
 * ------------------------------------------------------------
 * El modelo 3D dibuja cada árbol con su altura y su copa reales cuando están cargadas acá.
 * Los que todavía no están usan un porte representativo.
 *
 * CÓMO SE COMPLETA (no hace falta escribir nada a mano)
 *   1. En el plano: «Capas» → «Cuadrícula técnica» → «Modo relevamiento de árboles».
 *   2. Con los árboles ya medidos, tocar «Exportar para el sitio»: descarga un archivo «arboles.js».
 *   3. Subir ese archivo a esta carpeta (datos/) en GitHub: reemplaza a este.
 *
 * Solo lleva, por árbol: altura (m), copa (diámetro, en m) y porte ("árbol", "arbusto", "palmera" o "conífera").
 * NO lleva la especie, las observaciones ni los datos del Banco de Semillas: así no se publica
 * dónde está cada ejemplar de las especies sensibles o amenazadas.
 */
window.ARBOLES = {
  actualizado: "",
  arboles: {
  },
};
