/*
 * PLANO DEL JARDÍN · dónde va cada marca
 * --------------------------------------
 * El dibujo del plano sale del relevamiento a pie de septiembre de 2026 (cuadrícula de 56 × 68;
 * cada cuadrícula mide unos 2 × 2 m). Este archivo solo dice DÓNDE va cada marca.
 *
 * CÓMO UBICAR UN LUGAR
 *   1. Abrí el plano en el sitio y tocá «Ver cuadrícula».
 *   2. Tocá el lugar en el plano: abajo aparece, por ejemplo, «Columna 15 · Fila 45».
 *   3. Escribí esos dos números en «col» y «fila» del lugar, acá abajo, y guardá («Commit changes»).
 *   Columnas de 1 a 56, de izquierda a derecha. Filas de 1 a 68, de abajo hacia arriba
 *   (igual que en el relevamiento). Mientras un lugar tenga col: null, no aparece en el plano.
 *
 * Cambiá solo los números (o null) y no borres las comas del final.
 * NO se publica la ubicación de especies sensibles a la recolección (por ejemplo, las orquídeas).
 */
window.PLANO = {

  lugares: [
    // SECTORES (carteles C1). En el plano llevan el número del código: S-01 → 1.
    { codigo: "S-01", tipo: "sector", nombre: "Talar bonaerense", col: null, fila: null },
    { codigo: "S-02", tipo: "sector", nombre: "Vivero de nativas", col: 31, fila: 11 },   // provisorio: invernadero grande
    { codigo: "S-03", tipo: "sector", nombre: "Huerta agroecológica", col: null, fila: null },
    { codigo: "S-04", tipo: "sector", nombre: "Estanque", col: null, fila: null },
    { codigo: "S-05", tipo: "sector", nombre: "Aromáticas y medicinales", col: null, fila: null },
    { codigo: "S-06", tipo: "sector", nombre: "Compostera", col: 50, fila: 6 },           // provisorio: composteras

    // PANELES INTERPRETATIVOS (C2)
    { codigo: "P-01", tipo: "panel", nombre: "Panel Mariposario nativo", col: null, fila: null },
    { codigo: "P-02", tipo: "panel", nombre: "Panel Centinelas de Nativas", col: null, fila: null },

    // TÓTEMS DIRECCIONALES (B1): no se dibujan; si alguien escanea su QR, el plano marca «Estás acá».
    { codigo: "T-01", tipo: "totem", nombre: "Tótem direccional 1", col: null, fila: null },
    { codigo: "T-02", tipo: "totem", nombre: "Tótem direccional 2", col: null, fila: null },

    // SERVICIOS
    { codigo: "banos", tipo: "servicio", nombre: "Baños (uno accesible)", col: null, fila: null },
    { codigo: "agua", tipo: "servicio", nombre: "Agua potable", col: null, fila: null },

    // ACCESOS
    { codigo: "ingreso", tipo: "acceso", nombre: "Ingreso principal (Ruta 40)", col: null, fila: null },
    { codigo: "bosch", tipo: "acceso", nombre: "Acceso peatonal (Gral. Bosch)", col: null, fila: null },
  ],

  // EJEMPLARES DE LA COLECCIÓN EN EL PLANO (para «Dónde está» en la ficha de cada especie)
  //   Árboles: el número de punto del plano. Con «Ver cuadrícula», al tocar un árbol aparece su
  //   número; por ejemplo:   "A-71": ["ar123", "ar245"],
  //   Otras plantas: un lugar; por ejemplo:   "H-12": [{ col: 20, fila: 30 }],
  ejemplares: {
  },
};
