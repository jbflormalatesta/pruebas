/*
 * Jardín Botánico Municipal «Florencio Malatesta» · datos generales del sitio
 * --------------------------------------------------------------------------
 * Este es el archivo que se edita para cambiar avisos, horarios, contactos y enlaces.
 * Cambiá solo lo que está entre comillas (o true / false) y no borres las comas del final.
 * Los cambios se ven en el sitio unos minutos después de guardar («Commit changes»).
 */
window.SITIO = {

  // AVISO DE LA PORTADA (también aparece en «Visitá el Jardín»)
  //   mostrar: true para que se vea, false para ocultarlo.
  //   tipo: "info" (verde) o "alerta" (rojo, para cierres por lluvia u otros imprevistos).
  //   hasta: opcional, fecha en formato "AAAA-MM-DD". Después de ese día el aviso se oculta solo.
  aviso: {
    mostrar: false,
    tipo: "info",
    texto: "",
    enlace: "",
    textoEnlace: "",
    hasta: "",
  },

  // HORARIOS (se muestran en la portada y en «Visitá el Jardín»)
  horarios: [
    { dias: "Lunes a viernes", horas: "8:00 a 14:00 h" },
    { dias: "Sábados", horas: "10:00 a 16:00 h" },
    { dias: "Domingos y días de lluvia", horas: "Cerrado" },
  ],

  direccion: "Ruta Provincial 40, km 50 · Espacio Quinta Devoto · Marcos Paz",

  contacto: {
    mail: "ecologiaurbana@marcospaz.gov.ar",
    mailJardin: "jardinbotanicommp@gmail.com",
    instagram: "https://www.instagram.com/jbflormalatesta/",
    facebook: "https://www.facebook.com/jardinbotanicoflorenciomalatesta",
    linktree: "https://linktr.ee/jbflormalatesta",
  },

  // FORMULARIOS Y MAPA (los mismos destinos que los botones del Linktree al 07/11/2026)
  enlaces: {
    reservaVisita: "https://forms.gle/feY9FrmNQF9E4NLZA",   // Solicitud de visita al Jardín
    centinelas: "https://forms.gle/2gSLuj41FpsoQP8s8",      // Inscripción a Centinelas de Nativas
    feriaVerde: "https://forms.gle/Qbt4d7XPgG2Tu3836",      // Inscripción Feria Verde
    mapa: "https://www.google.com/maps/search/?api=1&query=Jard%C3%ADn+Bot%C3%A1nico+Municipal+Florencio+Malatesta+Marcos+Paz",
  },

  feriaVerde: {
    cuando: "Se hace el segundo sábado de cada mes.",
  },

  // AGENDA (página «Agenda» y «Próximas actividades» de la portada)
  //   Las actividades se cargan en el calendario «JB - Público» de Google, no acá.
  //   datos: la dirección de la aplicación web que lee ese calendario (termina en /exec).
  //   Mientras esté vacía, la agenda muestra un mensaje con el enlace a Instagram.
  agenda: {
    datos: "https://script.google.com/macros/s/AKfycbxhEOVtyJM3zJzGGdMlyJdzHRI_4CSHm9MW_aYUBikQ23WytndZnZPUp0m-0KphnCxC/exec",   // aplicación 2026-11_Script_AgendaWebJB (cuenta del Jardín)
  },

  // A dónde lleva el QR impreso en las fichas A5 (D2) de la colección:
  //   "ficha"    = la página de la especie (igual que las etiquetas)
  //   "linktree" = el Linktree del Jardín
  qrFichas: "ficha",
};
