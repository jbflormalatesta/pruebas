/*
 * PLANO DEL JARDÍN · dónde va cada marca
 * --------------------------------------
 * El dibujo del plano sale del relevamiento a pie de septiembre de 2026: es el perímetro
 * alambrado del Jardín, en una cuadrícula de 56 × 68 (cada cuadrícula mide unos 2 × 2 m).
 * Este archivo solo dice DÓNDE va cada marca.
 *
 * CÓMO UBICAR UN LUGAR
 *   1. Abrí el plano en el sitio y tocá «Ver cuadrícula».
 *   2. Tocá el lugar en el plano: abajo aparece, por ejemplo, «Columna 15 · Fila 45».
 *   3. Escribí esos dos números en «col» y «fila» del lugar, acá abajo, y guardá («Commit changes»).
 *   Columnas de 1 a 56, de izquierda a derecha. Filas de 1 a 68, de abajo hacia arriba
 *   (igual que en el relevamiento). Se pueden usar medios (fila: 44.5 = entre la 44 y la 45).
 *   Fuera del alambrado: columna 0 o negativa = a la izquierda de la columna 1 (calle interna);
 *   fila 69 o más = arriba de la fila 68 (hacia la Ruta 40).
 *   Mientras un lugar tenga col: null, no aparece en el plano.
 *
 * Cambiá solo los números (o null) y los textos entre comillas, y no borres las comas del final.
 * NO se publica la ubicación de especies sensibles a la recolección (por ejemplo, las orquídeas).
 *
 * CARTELERÍA: «pieza» es el tipo de cartel (A1, A2, B1, B2, C1, C2) y «qr» el código que trae su QR
 * (jbflormalatesta.github.io/?plano, ?T-01…). Los carteles de sector (C1) llevan el QR de su sector.
 * Los recorridos sugeridos están en datos/recorridos.js; las especies de cada sector, en datos/mes-a-mes.js.
 */
window.PLANO = {

  lugares: [
    // SECTORES (carteles C1). En el plano llevan el número del código: S-01 → 1.
    { codigo: "S-01", tipo: "sector", nombre: "Talar bonaerense", col: 30, fila: 51 },
    { codigo: "S-02", tipo: "sector", nombre: "Vivero de nativas", col: 31, fila: 11 },   // invernadero grande, en uso
    { codigo: "S-03", tipo: "sector", nombre: "Huerta agroecológica", col: 40, fila: 16 },
    { codigo: "S-04", tipo: "sector", nombre: "Estanque", col: 41, fila: 38 },
    { codigo: "S-05", tipo: "sector", nombre: "Aromáticas y medicinales", col: 21, fila: 52 },
    { codigo: "S-06", tipo: "sector", nombre: "Compostera", col: 50, fila: 6 },

    // DENTRO DEL VIVERO (en el plano, con letra)
    { codigo: "inv-chico", tipo: "referencia", letra: "a", nombre: "Invernadero chico (en mantenimiento)", col: 41, fila: 6 },
    { codigo: "palets", tipo: "referencia", letra: "b", nombre: "Ejemplares grandes sobre palets", col: 31, fila: 6 },

    // PANELES INTERPRETATIVOS (C2): todavía no están instalados. Cuando estén, se cargan col y fila.
    { codigo: "P-01", tipo: "panel", pieza: "C2", qr: "P-01", nombre: "Panel Mariposario nativo", col: null, fila: null },
    { codigo: "P-02", tipo: "panel", pieza: "C2", qr: "P-02", nombre: "Panel Centinelas de Nativas", col: null, fila: null },
    // TÓTEMS DIRECCIONALES (B1): ubicación validada por el Jardín el 09/11/2026. No se dibujan: con su QR,
    // el plano marca «Estás acá». Las lamas B2 no llevan QR: Col 22 · Fila 31 (Estanque), Col 22 · Fila 16
    // (Vivero, huerta y compostera) y en el dorso del T-01 (Baños y salida).
    { codigo: "T-01", tipo: "totem", pieza: "B1", qr: "T-01", nombre: "Tótem de la entrada", col: 6, fila: 23 },
    { codigo: "T-02", tipo: "totem", pieza: "B1", qr: "T-02", nombre: "Tótem de la plazoleta", col: 20, fila: 26 },
    // CARTEL CON EL PLANO (A2), apenas se entra por el portón doble. Tampoco se dibuja: su QR marca «Estás acá».
    { codigo: "cartel-plano", tipo: "totem", pieza: "A2", qr: "plano", nombre: "Cartel con el plano, junto al portón de entrada", col: 3, fila: 21 },
    // CARTEL DE ACCESO (A1), en la tranquera de la Ruta 40. «ruta»: para llegar se sale por la calle interna.
    { codigo: "A1", tipo: "cartel", pieza: "A1", qr: "acceso", nombre: "Cartel de acceso", nota: "En la tranquera de la Ruta 40",
      ruta: "ingreso", col: 1, fila: 68 },
    // LAMAS DIRECCIONALES (B2), sin QR. «en»: va en el mismo lugar que otra pieza.
    { codigo: "L-01", tipo: "lama", pieza: "B2", nombre: "Lamas direccionales hacia el Estanque", col: 22, fila: 31 },
    { codigo: "L-02", tipo: "lama", pieza: "B2", nombre: "Lamas direccionales hacia el Vivero, la Huerta y la Compostera", col: 22, fila: 16 },
    { codigo: "L-03", tipo: "lama", pieza: "B2", nombre: "Lamas direccionales hacia los Baños y la salida", nota: "En el dorso del tótem de la entrada", en: "T-01" },

    // SERVICIOS
    { codigo: "banos", tipo: "servicio", icono: "banos", nombre: "Baños mixtos y accesibles",
      nota: "En el edificio principal, cruzando la calle interna", col: -5, fila: 26 },
    { codigo: "agua-1", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "Frente a la puerta del invernadero grande", col: 24, fila: 11 },
    { codigo: "agua-2", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "Antes de la entrada a la compostera", col: 45, fila: 11 },
    { codigo: "agua-3", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "Del lado de afuera de la huerta", col: 37, fila: 16 },
    { codigo: "agua-4", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "En la zona forestada más joven", col: 46, fila: 26 },
    { codigo: "agua-5", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "Junto a la vieja cancha de pelota paleta", col: 8, fila: 43 },
    { codigo: "agua-6", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "En el borde del cantero", col: 9, fila: 58 },
    { codigo: "agua-7", tipo: "servicio", icono: "agua", nombre: "Agua potable", nota: "En el borde del cantero", col: 20, fila: 57 },

    // ACCESOS
    { codigo: "ingreso", tipo: "acceso", nombre: "Ingreso principal: tranquera sobre la Ruta 40", rotulo: ["Ingreso", "principal"], col: -2, fila: 68 },
    { codigo: "porton-1", tipo: "puerta", nombre: "Portón doble hoja, desde la calle interna", col: 1, fila: 44.5 },
    { codigo: "puerta", tipo: "puerta", nombre: "Puerta, desde la calle interna", col: 1, fila: 33 },
    { codigo: "porton-2", tipo: "puerta", nombre: "Portón doble hoja, desde la calle interna", col: 1, fila: 21.5 },
    { codigo: "bosch", tipo: "acceso", nombre: "Acceso peatonal por la calle Gral. Bosch", col: 56, fila: 13 },

    // TRANSPORTE (afuera del alambrado, hacia la Ruta 40)
    { codigo: "parada", tipo: "parada", nombre: "Parada de colectivos 322 y 136", nota: "Techada, con dos asientos, en la vereda de la Ruta 40", col: 43.5, fila: 73.8 },
    { codigo: "paso-nivel", tipo: "cruce", nombre: "Paso a nivel de Ruta 40 y Gral. Bosch", nota: "Para cruzar las vías y la ruta desde la bicisenda",
      rotulo: "Paso a nivel", rotuloLado: "izq", col: 59.5, fila: 77.7 },
  ],

  // EJEMPLARES DE LA COLECCIÓN EN EL PLANO (para «Dónde está» en la ficha de cada especie)
  //   Árboles: el número de punto del plano. Con «Ver cuadrícula», al tocar un árbol aparece su
  //   número; por ejemplo:   "A-71": ["ar123", "ar245"],
  //   Otras plantas: un lugar; por ejemplo:   "H-12": [{ col: 20, fila: 30 }],
  ejemplares: {
  },
};
