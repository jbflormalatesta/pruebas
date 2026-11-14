/*
 * EL JARDÍN MES A MES · qué especies ver en cada sector y cuándo florecen o dan frutos
 * ------------------------------------------------------------------------------------
 * SECTORES: qué especies de la colección se pueden ver en cada sector (con su código de ficha).
 *   revisar: true  = selección propuesta, todavía sin validar por el equipo: el plano lo avisa.
 *                    Cuando el equipo la confirme (o la corrija), cambiá a false.
 *   NO SE PUBLICA la ubicación de especies sensibles o amenazadas: la asociación es solo por sector,
 *   y las especies marcadas «No señalizar ubicación» (como las orquídeas) no van en ningún sector.
 *
 * ESPECIES: meses de flor y de frutos (ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic).
 *   Rangos con guion y separados por coma: "sep-nov" o "dic-feb, abr". "" = sin dato.
 *   fuente: "tabla" = Tabla de floración y época de colecta de árboles y arbustos nativos del Jardín;
 *           "ficha" = lo que dice la ficha de la especie en la colección.
 *   En la tabla, «frutos» es la época de colecta (frutos maduros).
 *
 * Cambiá solo los textos entre comillas y los true/false, y no borres las comas del final.
 */
window.MES_A_MES = {

  sectores: {
    "S-01": { revisar: true, fuente: "Propuesta a partir de las fichas y del cartel del sector",
      especies: ["A-71", "A-47", "A-72", "A-30", "A-53", "A-23", "A-68", "A-52"] },   // Tala, Molle incienso, Talilla, Espinillo, Ombú, Chal chal, Saúco, Ñapinday
    "S-02": { revisar: false, fuente: "Planilla de producción del vivero (Inventario Verde, noviembre de 2026)",
      especies: ["A-22", "A-14", "A-26", "A-30", "A-47", "A-53", "A-52", "A-69", "A-71", "A-72", "A-29", "A-75", "A-44", "H-63", "H-72", "H-80"] },   // Ceibo, Cambará, Cina cina, Espinillo, Molle incienso, Ombú, Ñapinday, Sen del campo, Tala, Talilla, Espina del bañado, Timbó, Malvavisco, Portulaca, Tasi, Santa Lucía blanca
    "S-03": { revisar: true, fuente: "Propuesta a partir de las fichas",
      especies: ["H-75", "H-59", "H-73"] },   // Tupinambur, Papa del aire, Tomatillo
    "S-04": { revisar: true, fuente: "Propuesta a partir de las fichas",
      especies: ["H-42", "H-74", "H-64", "H-03", "H-02", "H-24", "A-67", "A-22"] },   // Jacinto de agua, Totora, Redondita de agua, Achira amarilla, Achira, Cola de caballo, Sauce criollo, Ceibo
    "S-05": { revisar: true, fuente: "Propuesta a partir de las fichas",
      especies: ["A-21", "A-12", "A-66", "H-06", "H-20", "H-40", "H-50", "H-49", "H-44", "H-10", "H-13", "H-53", "H-25", "H-70"] },   // Cedrón de monte, Burrito, Salvia morada, Albahaca anís, Carqueja, Hierbabuena, Menta, Melisa, Lavanda, Artemisa, Boldo paraguayo, Milenrama, Consuelda, Santolina
    "S-06": { revisar: false, fuente: "",
      especies: [] },   // 
    "P-01": { revisar: true, fuente: "Propuesta: nativas cuya ficha las presenta como alimento de orugas o de mariposas",
      especies: ["H-60", "H-52", "H-23", "A-21", "A-14", "A-69", "H-17", "H-18"] },   // Pasionaria, Mil hombres, Chilca de olor, Cedrón de monte, Cambará, Sen del campo, Camará morado, Canario rojo
  },

  especies: {
    "A-03": { flor: "sep-nov", fruto: "mar-jul", fuente: "ficha" },   // Aguaribay
    "A-05": { flor: "oct-dic", fruto: "ene-mar", fuente: "tabla" },   // Anacahuita
    "A-06": { flor: "", fruto: "dic-feb", fuente: "ficha" },   // Árbol del cielo
    "A-07": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Arbusto de la banana
    "A-09": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Azarero
    "A-10": { flor: "ene-mar", fruto: "may-jul", fuente: "tabla" },   // Azota caballo
    "A-12": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Burrito
    "A-13": { flor: "ago", fruto: "", fuente: "ficha" },   // Buxus bocha
    "A-15": { flor: "may-sep", fruto: "", fuente: "ficha" },   // Camelia
    "A-16": { flor: "sep-nov", fruto: "dic-feb", fuente: "tabla" },   // Canelón
    "A-21": { flor: "sep-feb", fruto: "", fuente: "ficha" },   // Cedrón de monte
    "A-22": { flor: "sep-dic", fruto: "ene-mar", fuente: "tabla" },   // Ceibo
    "A-23": { flor: "ago-oct", fruto: "nov-dic", fuente: "tabla" },   // Chal chal
    "A-24": { flor: "ene-feb", fruto: "", fuente: "ficha" },   // Chilca
    "A-25": { flor: "feb-may", fruto: "", fuente: "ficha" },   // Chilca amarga
    "A-26": { flor: "nov-ene", fruto: "feb-mar", fuente: "tabla" },   // Cina cina
    "A-28": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Crespón
    "A-29": { flor: "oct-ene", fruto: "feb-may", fuente: "tabla" },   // Espina del bañado
    "A-30": { flor: "ago-oct", fruto: "ene-abr", fuente: "tabla" },   // Espinillo
    "A-31": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Falso alcanforero
    "A-34": { flor: "jun-dic", fruto: "ene-abr", fuente: "tabla" },   // Fumo bravo
    "A-35": { flor: "sep-dic", fruto: "ene-abr", fuente: "tabla" },   // Higuerón
    "A-36": { flor: "ene", fruto: "", fuente: "ficha" },   // Ibirá pitá
    "A-37": { flor: "nov-dic", fruto: "ene-mar", fuente: "tabla" },   // Ingá
    "A-38": { flor: "sep-feb", fruto: "", fuente: "ficha" },   // Jazmín paraguayo
    "A-40": { flor: "ago-sep", fruto: "", fuente: "ficha" },   // Lapacho rosado
    "A-41": { flor: "ago-oct", fruto: "", fuente: "ficha" },   // Laurel
    "A-42": { flor: "dic-feb", fruto: "mar-ago", fuente: "ficha" },   // Ligustro
    "A-43": { flor: "nov-feb", fruto: "", fuente: "ficha" },   // Magnolia
    "A-44": { flor: "ene-dic", fruto: "", fuente: "ficha" },   // Malvavisco
    "A-45": { flor: "ago", fruto: "", fuente: "ficha" },   // Membrillo japonés
    "A-46": { flor: "", fruto: "mar-may", fuente: "ficha" },   // Molle de beber
    "A-47": { flor: "ago-oct", fruto: "nov-ene", fuente: "tabla" },   // Molle incienso
    "A-48": { flor: "", fruto: "nov-dic", fuente: "ficha" },   // Mora
    "A-50": { flor: "sep-nov", fruto: "dic-mar", fuente: "tabla" },   // Murta
    "A-51": { flor: "mar-may", fruto: "sep-nov", fuente: "ficha" },   // Níspero
    "A-52": { flor: "dic-mar", fruto: "", fuente: "ficha" },   // Ñapinday
    "A-53": { flor: "sep-oct", fruto: "nov-mar", fuente: "tabla" },   // Ombú
    "A-56": { flor: "oct-dic", fruto: "ene-abr", fuente: "tabla" },   // Palmera pindó
    "A-57": { flor: "ene-jun", fruto: "", fuente: "ficha" },   // Palo borracho
    "A-60": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Pereskia
    "A-63": { flor: "", fruto: "jun-ago", fuente: "ficha" },   // Plátano
    "A-64": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Retama
    "A-65": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Roble sedoso
    "A-66": { flor: "nov-mar", fruto: "", fuente: "ficha" },   // Salvia morada
    "A-67": { flor: "sep-oct", fruto: "nov-dic", fuente: "tabla" },   // Sauce criollo
    "A-68": { flor: "oct-nov", fruto: "dic-feb", fuente: "tabla" },   // Saúco
    "A-69": { flor: "ene-mar", fruto: "abr-jun", fuente: "tabla" },   // Sen del campo
    "A-71": { flor: "sep-oct", fruto: "nov-mar", fuente: "tabla" },   // Tala
    "A-75": { flor: "oct-dic", fruto: "ene-jun", fuente: "tabla" },   // Timbó
    "H-01": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Acanto
    "H-04": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Achira rosada
    "H-05": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Agapanto
    "H-06": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Albahaca anís
    "H-08": { flor: "feb-mar", fruto: "", fuente: "ficha" },   // Amarilis belladona
    "H-14": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Borreria
    "H-15": { flor: "feb-abr", fruto: "", fuente: "ficha" },   // Brotal
    "H-17": { flor: "", fruto: "mar-may", fuente: "ficha" },   // Camará morado
    "H-18": { flor: "nov-may", fruto: "", fuente: "ficha" },   // Canario rojo
    "H-20": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Carqueja
    "H-21": { flor: "ago", fruto: "", fuente: "ficha" },   // Cebollín
    "H-22": { flor: "sep-feb", fruto: "", fuente: "ficha" },   // Chilca
    "H-26": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Cortadera
    "H-35": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Grindelia
    "H-36": { flor: "dic-abr", fruto: "", fuente: "ficha" },   // Guaco
    "H-39": { flor: "abr-may", fruto: "jun-ago", fuente: "ficha" },   // Hiedra
    "H-40": { flor: "dic-feb", fruto: "", fuente: "ficha" },   // Hierbabuena
    "H-44": { flor: "sep-feb", fruto: "", fuente: "ficha" },   // Lavanda
    "H-46": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Madre de familia
    "H-48": { flor: "jun-jul", fruto: "", fuente: "ficha" },   // Margarita
    "H-65": { flor: "sep-may", fruto: "", fuente: "ficha" },   // Ruellia
    "H-67": { flor: "sep-may", fruto: "", fuente: "ficha" },   // Salvia guaranítica
    "H-68": { flor: "sep-nov", fruto: "", fuente: "ficha" },   // Salvia rastrera
    "H-71": { flor: "jun-ago", fruto: "", fuente: "ficha" },   // Senecio
    "H-75": { flor: "feb-may", fruto: "", fuente: "ficha" },   // Tupinambur
    "H-77": { flor: "dic-may", fruto: "", fuente: "ficha" },   // Vara de oro
  },

  // Especies de la tabla de floración que no están en la colección: para buscar en la región
  region: [
    { nombre: "algarrobo blanco", cientifico: "Neltuma alba", flor: "sep-nov", fruto: "dic-feb" },
    { nombre: "algarrobo dulce", cientifico: "Neltuma flexuosa", flor: "sep-nov", fruto: "dic-feb" },
    { nombre: "algarrobo negro", cientifico: "Neltuma nigra", flor: "nov-ene", fruto: "feb-abr" },
    { nombre: "aliso de río", cientifico: "Tessaria integrifolia", flor: "feb-abr", fruto: "may-jun" },
    { nombre: "azarero del delta", cientifico: "Symplocos uniflora", flor: "sep-oct", fruto: "nov-dic" },
    { nombre: "blanquillo", cientifico: "Sebastiania brasiliensis", flor: "sep-nov", fruto: "dic-feb" },
    { nombre: "bugre", cientifico: "Lonchocarpus nitidus", flor: "dic-ene", fruto: "feb-abr" },
    { nombre: "caldén", cientifico: "Neltuma caldenia", flor: "nov-dic", fruto: "ene-may" },
    { nombre: "ceibillo o acacia mansa", cientifico: "Sesbania punicea", flor: "sep-dic", fruto: "ene-abr" },
    { nombre: "chañar", cientifico: "Geoffroea decorticans", flor: "sep-nov", fruto: "dic-feb" },
    { nombre: "chilca blanca", cientifico: "Baccharis dracunculifolia", flor: "dic-feb", fruto: "mar-abr" },
    { nombre: "chilca del monte", cientifico: "Dodonaea viscosa", flor: "ago-sep", fruto: "oct-dic" },
    { nombre: "coronillo", cientifico: "Scutia buxifolia", flor: "oct-nov", fruto: "dic-feb" },
    { nombre: "curupí", cientifico: "Sapium haematospermum", flor: "oct-dic", fruto: "ene-mar" },
    { nombre: "curupicaí", cientifico: "Sapium glandulosum", flor: "oct-dic", fruto: "ene-mar" },
    { nombre: "envirá o ibirá", cientifico: "Daphnopsis racemosa", flor: "ago-oct", fruto: "nov-dic" },
    { nombre: "espinillo manso", cientifico: "Mimosa pilulifera", flor: "ago-oct", fruto: "nov-feb" },
    { nombre: "flor de seda", cientifico: "Calliandra parviflora", flor: "nov-feb", fruto: "mar-may" },
    { nombre: "guayabo blanco", cientifico: "Eugenia uruguayensis", flor: "nov-ene", fruto: "feb-abr" },
    { nombre: "jazmín del Uruguay", cientifico: "Guettarda uruguensis", flor: "nov-ene", fruto: "feb-may" },
    { nombre: "lapachillo", cientifico: "Poecilanthe parviflora", flor: "nov-mar", fruto: "abr-jun" },
    { nombre: "laurel criollo", cientifico: "Ocotea acutifolia", flor: "sep-nov", fruto: "dic-mar" },
    { nombre: "mataojo", cientifico: "Pouteria salicifolia", flor: "sep-nov", fruto: "dic-feb" },
    { nombre: "moradillo o molle negro", cientifico: "Schinus fasciculatus", flor: "ene-mar", fruto: "abr-jul" },
    { nombre: "ñandubay", cientifico: "Neltuma affinis", flor: "oct-dic", fruto: "ene-mar" },
    { nombre: "palo amarillo", cientifico: "Terminalia australis", flor: "sep-nov", fruto: "dic-mar" },
    { nombre: "palo de leche", cientifico: "Sebastiania commersoniana", flor: "oct-dic", fruto: "ene-mar" },
    { nombre: "quebrachillo", cientifico: "Acanthosyris spinescens", flor: "sep-nov", fruto: "dic-mar" },
    { nombre: "quebracho blanco", cientifico: "Aspidosperma quebracho-blanco", flor: "oct-ene", fruto: "mar-jun" },
    { nombre: "sarandí colorado", cientifico: "Cephalanthus glabratus", flor: "oct-dic", fruto: "ene-mar" },
    { nombre: "sombra de toro", cientifico: "Jodina rhombifolia", flor: "may-jul", fruto: "ago-nov" },
    { nombre: "tembetarí", cientifico: "Zanthoxylum rhoifolium", flor: "sep-nov", fruto: "dic-may" },
    { nombre: "tembetarí colorado", cientifico: "Zanthoxylum fagara", flor: "sep-nov", fruto: "dic-may" },
    { nombre: "timbó blanco", cientifico: "Albizia inundata", flor: "nov-ene", fruto: "feb-may" },
  ],
};
