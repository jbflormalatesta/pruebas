/*
 * RECORRIDOS SUGERIDOS DEL PLANO
 * ------------------------------
 * Cada recorrido es una lista de paradas, en orden. Las paradas usan los códigos de datos/plano.js:
 *   S-01 a S-06 = sectores · T-01, T-02 = tótems · cartel-plano = cartel con el plano (A2)
 *   P-01 = panel del Mariposario · P-02 = panel de Centinelas · agua-1 a agua-7 = canillas
 *   banos = baños del edificio principal · porton-1, puerta, porton-2 = salidas a la calle interna
 * El plano calcula solo el camino por los senderos, los metros y los minutos a pie.
 * Si una parada todavía no está ubicada en el plano (col: null), aparece en la lista y se saltea en el dibujo.
 * «minutos»: tiempo total sugerido, contando las paradas (no solo lo que se camina).
 * «modo»: "normal" = el camino más corto · "tranquilo" = prefiere senderos anchos y con sombra.
 * Cambiá solo los textos entre comillas y los números, y no borres las comas del final.
 */
window.RECORRIDOS = [
  {
    codigo: "corto", nombre: "Recorrido corto · primera visita", minutos: 20, modo: "normal",
    descripcion: "Para conocer lo principal del Jardín en poco tiempo.",
    paradas: [
      { lugar: "cartel-plano", texto: "Arrancá en el cartel con el plano, junto al portón de entrada." },
      { lugar: "T-02", texto: "La plazoleta, con bancos y el tótem que indica las distancias." },
      { lugar: "S-04", texto: "Plantas de ambientes acuáticos y de borde de agua, y la fauna que las acompaña." },
      { lugar: "S-01", texto: "El bosque nativo de la llanura bonaerense, con el tala como especie emblemática." },
      { lugar: "S-05", texto: "Especies ligadas a la cultura popular y a los saberes tradicionales." },
      { lugar: "porton-1", texto: "Salida por el portón doble que da a la calle interna." },
    ],
  },
  {
    codigo: "nativa", nombre: "Circuito Flora Nativa y Talar", minutos: 40, modo: "normal",
    descripcion: "De las plantas que se producen en el vivero al bosque nativo de la llanura.",
    paradas: [
      { lugar: "cartel-plano", texto: "Entrada, junto al cartel con el plano." },
      { lugar: "S-02", texto: "Acá se producen las plantas nativas que el Jardín destina a reservas, espacios públicos y Centinelas de Nativas." },
      { lugar: "P-01", texto: "Plantas nativas que alimentan a las orugas y a las mariposas de la región." },
      { lugar: "S-04", texto: "Plantas de ambientes acuáticos y de borde de agua." },
      { lugar: "S-01", texto: "El talar: refugio y alimento para aves y mariposas." },
      { lugar: "porton-1", texto: "Salida por el portón doble que da a la calle interna." },
    ],
  },
  {
    codigo: "escuelas", nombre: "Circuito educativo · Escuelas y Centinelas", minutos: 60, modo: "normal",
    descripcion: "Pensado para grupos escolares: del bosque nativo a la producción de plantas, la huerta y el compost.",
    paradas: [
      { lugar: "cartel-plano", texto: "Ingreso: el plano del Jardín y cómo se organiza." },
      { lugar: "S-01", texto: "El bosque nativo de la llanura bonaerense." },
      { lugar: "P-01", texto: "Mariposario nativo: plantas que alimentan a orugas y mariposas." },
      { lugar: "S-02", texto: "Vivero de nativas: de acá salen los ejemplares que reciben las instituciones Centinelas." },
      { lugar: "S-03", texto: "Hortalizas y plantines producidos con prácticas agroecológicas, sin agroquímicos." },
      { lugar: "S-06", texto: "Los restos de poda y de la huerta se transforman en compost que vuelve a la tierra." },
      { lugar: "P-02", texto: "Centinelas de Nativas: instituciones que plantan nativas, las cuidan y registran lo que observan." },
    ],
  },
  {
    codigo: "descanso", nombre: "Recorrido accesible y de descanso", minutos: 30, modo: "tranquilo",
    descripcion: "Por los senderos más anchos y con sombra, con bancos para descansar y cerca de los baños y del agua potable.",
    paradas: [
      { lugar: "cartel-plano", texto: "Arrancá junto al portón de entrada, a unos 15 metros de los baños." },
      { lugar: "T-02", texto: "La plazoleta: bancos para descansar." },
      { lugar: "S-04", texto: "El estanque, con plantas de agua y de borde." },
      { lugar: "agua-4", texto: "Agua potable, en la zona forestada más joven." },
      { lugar: "banos", texto: "Baños mixtos y accesibles, en el edificio principal, cruzando la calle interna." },
    ],
  },
];
