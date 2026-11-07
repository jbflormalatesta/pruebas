/*
 * CONTRATO DE DIRECCIONES de la cartelería impresa
 * -------------------------------------------------
 * Cada QR impreso apunta a la portada del sitio con un código corto, por ejemplo
 *   https://jbflormalatesta.github.io/?A-71   (etiqueta D1 de la especie A-71)
 *   https://jbflormalatesta.github.io/?A-71&f (ficha A5 D2 de la misma especie)
 *   https://jbflormalatesta.github.io/?S-01   (cartel del sector Talar bonaerense)
 * La portada lee este archivo y reenvía a la página que corresponda HOY.
 *
 * REGLAS
 *   - Los códigos NO se cambian ni se borran: están impresos en chapa.
 *   - Lo que sí se puede cambiar es el «destino» (por ejemplo, cuando exista la página del plano).
 *   - Para una pieza nueva, se agrega un código nuevo al final.
 *   - Los destinos son relativos a la portada (sin barra al principio), así funcionan igual
 *     en GitHub, en la copia de prueba y en el dominio municipal.
 */
window.DIRECCIONES = {

  // Especies de la colección: A-01 … A-76 y H-01 … H-83 (312 piezas D1 y D2).
  // El código y el «&f» de las fichas pasan tal cual a la página de la colección.
  especies: "coleccion/",

  codigos: {
    // A1 · Cartel de acceso (tranquera principal)
    "acceso": { pieza: "A1 · Cartel de acceso", destino: "visita/" },

    // C1 · Carteles de sector (400 × 250 mm). En la etapa 2 pasan al plano del Jardín.
    "S-01": { pieza: "C1 · Sector Talar bonaerense", destino: "visita/#S-01" },
    "S-02": { pieza: "C1 · Sector Vivero de nativas", destino: "visita/#S-02" },
    "S-03": { pieza: "C1 · Sector Huerta agroecológica", destino: "visita/#S-03" },
    "S-04": { pieza: "C1 · Sector Estanque", destino: "visita/#S-04" },
    "S-05": { pieza: "C1 · Sector Aromáticas y medicinales", destino: "visita/#S-05" },
    "S-06": { pieza: "C1 · Sector Compostera", destino: "visita/#S-06" },

    // C2 · Paneles interpretativos (700 × 500 mm)
    "P-01": { pieza: "C2 · Panel Mariposario nativo", destino: "visita/#P-01" },
    "P-02": { pieza: "C2 · Panel Centinelas de Nativas", destino: "./#centinelas" },
  },
};
