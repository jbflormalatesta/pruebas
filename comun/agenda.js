/*
 * Jardín Botánico Municipal «Florencio Malatesta» · agenda de actividades abiertas al público
 * ------------------------------------------------------------------------------------------
 * Las actividades salen del calendario «JB - Público» de Google, a través de la aplicación web
 * cuya dirección está en datos/sitio.js → agenda.datos (ver 2026-11_Script_AgendaWebJB).
 * Completa:
 *   - <div data-agenda="completa">          en agenda/: todas las próximas actividades, por mes;
 *   - <div data-agenda="breve" data-max="3"> en la portada: las próximas tres. Si no hay ninguna,
 *     o si la agenda no carga, la sección de la portada sigue oculta.
 * Este archivo no se edita para cargar actividades: se cargan en el calendario.
 */
(function () {
  'use strict';
  var cajas = document.querySelectorAll('[data-agenda]');
  if (!cajas.length) return;
  var S = window.SITIO || {};
  var URL_DATOS = (S.agenda && S.agenda.datos) || '';
  var INSTAGRAM = (S.contacto && S.contacto.instagram) || 'https://www.instagram.com/jbflormalatesta/';
  var TZ = 'America/Argentina/Buenos_Aires';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Enlaces sueltos dentro del texto «Web:» (solo http y https)
  function conEnlaces(s) {
    return esc(s).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)»]/g, function (u) {
      return '<a href="' + u + '" rel="noopener">' + u.replace(/^https?:\/\//, '') + '</a>';
    });
  }

  // Fecha y hora en Argentina, sin depender del huso del teléfono
  var fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function partes(d) {
    var o = {};
    fmt.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return { dia: o.year + '-' + o.month + '-' + o.day, hora: o.hour + ':' + o.minute };
  }
  function diaSemana(ymd) { return DIAS[new Date(ymd + 'T12:00:00Z').getUTCDay()]; }
  function diaMes(ymd) { return +ymd.slice(8, 10); }
  function mes(ymd) { return MESES[+ymd.slice(5, 7) - 1]; }
  function sumarDias(ymd, n) {
    var d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  var HOY = partes(new Date()).dia;

  // Normaliza cada actividad: días (AAAA-MM-DD) y horas en Argentina
  function normalizar(a) {
    if (!a || !a.titulo || !a.inicio) return null;
    var n = { titulo: String(a.titulo), lugar: a.lugar || '', texto: a.texto || '', todoElDia: !!a.todoElDia };
    if (n.todoElDia) {
      n.d1 = String(a.inicio).slice(0, 10); n.d2 = String(a.fin || a.inicio).slice(0, 10);
      if (n.d2 < n.d1) n.d2 = n.d1;
      n.terminada = n.d2 < HOY;
    } else {
      var i = new Date(a.inicio), f = new Date(a.fin || a.inicio);
      if (isNaN(i)) return null;
      if (isNaN(f) || f < i) f = i;
      var pi = partes(i), pf = partes(f);
      n.ini = i; n.fin = f; n.d1 = pi.dia; n.d2 = pf.dia; n.h1 = pi.hora; n.h2 = pf.hora;
      n.terminada = f.getTime() < Date.now();
    }
    return n;
  }

  function relativo(ymd) { return ymd === HOY ? 'Hoy' : ymd === sumarDias(HOY, 1) ? 'Mañana' : ''; }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fechaLarga(ymd) { return diaSemana(ymd) + ' ' + diaMes(ymd) + ' de ' + mes(ymd); }

  function cuando(n) {
    var dia = capital(fechaLarga(n.d1));
    if (n.todoElDia) {
      if (n.d1 === n.d2) return dia + ' · todo el día';
      if (n.d1.slice(0, 7) === n.d2.slice(0, 7))
        return 'Del ' + diaSemana(n.d1) + ' ' + diaMes(n.d1) + ' al ' + diaSemana(n.d2) + ' ' + diaMes(n.d2) + ' de ' + mes(n.d2);
      return 'Del ' + fechaLarga(n.d1) + ' al ' + fechaLarga(n.d2);
    }
    if (n.d1 === n.d2) return dia + ' · ' + (n.h1 === n.h2 ? n.h1 + ' h' : n.h1 + ' a ' + n.h2 + ' h');
    return dia + ', ' + n.h1 + ' h, al ' + fechaLarga(n.d2) + ', ' + n.h2 + ' h';
  }

  // «Agendar»: abre Google Calendar con la actividad cargada en el calendario de quien la ve
  function agendar(n, pagina) {
    function utc(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var fechas = n.todoElDia ? n.d1.replace(/-/g, '') + '/' + sumarDias(n.d2, 1).replace(/-/g, '') : utc(n.ini) + '/' + utc(n.fin);
    var det = (n.texto ? n.texto + '\n\n' : '') + 'Jardín Botánico Municipal «Florencio Malatesta» · ' + pagina;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(n.titulo) +
      '&dates=' + fechas + '&details=' + encodeURIComponent(det) + (n.lugar ? '&location=' + encodeURIComponent(n.lugar) : '');
  }

  var ICO_LUGAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>';

  function tarjeta(n, completa, pagina) {
    var r = relativo(n.d1) || (n.todoElDia && n.d1 <= HOY && HOY <= n.d2 ? 'En curso' : '');
    return '<article class="actividad' + (completa ? '' : ' breve') + '">' +
      '<p class="fecha" aria-hidden="true"><span class="dia">' + diaMes(n.d1) + '</span><span class="mes">' + mes(n.d1).slice(0, 3) + '</span></p>' +
      '<div class="detalle">' +
        '<p class="cuando">' + esc(cuando(n)) + (r ? ' <span class="marca-dia">' + r + '</span>' : '') + '</p>' +
        '<h3>' + esc(n.titulo) + '</h3>' +
        (n.lugar ? '<p class="lugar">' + ICO_LUGAR + '<span>' + esc(n.lugar) + '</span></p>' : '') +
        (completa && n.texto ? '<p class="texto">' + conEnlaces(n.texto) + '</p>' : '') +
        (completa ? '<p class="acciones"><a href="' + esc(agendar(n, pagina)) + '" rel="noopener" target="_blank">Agendar en mi calendario</a></p>' : '') +
      '</div></article>';
  }

  function mensaje(caja, html) {
    caja.innerHTML = '<div class="agenda-estado"><p>' + html + '</p>' +
      '<div class="botones"><a class="boton sec" href="' + esc(INSTAGRAM) + '" rel="noopener">Novedades en Instagram</a></div></div>';
  }

  function pintar(datos) {
    var lista = [];
    if (datos && !datos.error && datos.actividades && datos.actividades.length !== undefined) {
      lista = datos.actividades.map(normalizar).filter(function (n) { return n && !n.terminada; });
      lista.sort(function (a, b) { return (a.d1 + (a.h1 || '')) < (b.d1 + (b.h1 || '')) ? -1 : 1; });
    }
    var ok = !!(datos && !datos.error && datos.actividades);
    Array.prototype.forEach.call(cajas, function (caja) {
      var completa = caja.getAttribute('data-agenda') === 'completa';
      var pagina = new URL(caja.getAttribute('data-pagina') || './', location.href).href.split('#')[0];
      if (!completa) {
        var max = +caja.getAttribute('data-max') || 3, sec = caja.closest('[data-agenda-seccion]');
        if (!ok || !lista.length) { if (sec) sec.hidden = true; return; }
        caja.innerHTML = '<div class="agenda-lista">' + lista.slice(0, max).map(function (n) { return tarjeta(n, false, pagina); }).join('') + '</div>';
        if (sec) sec.hidden = false;
        return;
      }
      if (!URL_DATOS) { mensaje(caja, 'Muy pronto vas a ver acá las actividades abiertas del Jardín. Mientras tanto, las anunciamos en Instagram.'); return; }
      if (!ok) { mensaje(caja, 'No pudimos cargar la agenda en este momento. Probá de nuevo en un rato, o mirá las novedades en Instagram.'); return; }
      if (!lista.length) { mensaje(caja, 'Por ahora no hay actividades abiertas programadas. Apenas haya, aparecen acá y en Instagram.'); return; }
      var html = '', mesActual = '';
      lista.forEach(function (n) {
        var m = n.d1.slice(0, 7);
        if (m !== mesActual) {
          if (mesActual) html += '</div>';
          html += '<h3 class="agenda-mes">' + capital(mes(n.d1)) + ' ' + n.d1.slice(0, 4) + '</h3><div class="agenda-lista">';
          mesActual = m;
        }
        html += tarjeta(n, true, pagina);
      });
      caja.innerHTML = html + '</div><p class="nota">Las actividades salen del calendario del Jardín y se actualizan solas.</p>';
    });
  }

  if (!URL_DATOS) { pintar(null); return; }

  // Primero se pide con fetch; si el navegador no lo permite, se prueba con JSONP. Máximo 12 s.
  var listo = false;
  function fin(datos) { if (listo) return; listo = true; pintar(datos); }
  var corte = setTimeout(function () { fin(null); }, 12000);
  function jsonp() {
    var nombre = 'jbAgenda_' + Date.now();
    var s = document.createElement('script');
    window[nombre] = function (d) { clearTimeout(corte); fin(d); try { delete window[nombre]; } catch (e) { window[nombre] = undefined; } };
    s.onerror = function () { clearTimeout(corte); fin(null); };
    s.src = URL_DATOS + (URL_DATOS.indexOf('?') < 0 ? '?' : '&') + 'callback=' + nombre;
    document.head.appendChild(s);
  }
  if (window.fetch) {
    fetch(URL_DATOS, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { clearTimeout(corte); fin(d); })
      .catch(jsonp);
  } else jsonp();
})();
