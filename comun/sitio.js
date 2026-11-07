/*
 * Jardín Botánico Municipal «Florencio Malatesta» · comportamientos comunes
 * -------------------------------------------------------------------------
 * Lee datos/sitio.js (window.SITIO) y completa lo que se repite en varias páginas:
 *   - el aviso de la portada y de «Visitá el Jardín»   → <div data-aviso>
 *   - los horarios                                     → <dl data-horarios>
 *   - los enlaces a formularios y redes                → <a data-enlace="reservaVisita">
 *   - textos sueltos (correo, dirección, etc.)          → <span data-dato="contacto.mail">
 * Si este archivo no carga, la página igual se ve: cada elemento trae un texto o enlace de respaldo.
 */
(function () {
  'use strict';
  var S = window.SITIO || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dato(ruta) {
    return ruta.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : undefined; }, S);
  }
  function cada(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // Enlaces: primero se busca en «enlaces», después en «contacto».
  cada('[data-enlace]', function (a) {
    var k = a.getAttribute('data-enlace');
    var u = (S.enlaces && S.enlaces[k]) || (S.contacto && S.contacto[k]);
    if (!u) return;
    a.href = /^mail/.test(k) ? 'mailto:' + u : u;
    if (/^mail/.test(k) && a.hasAttribute('data-mostrar')) a.textContent = u;
  });

  // Textos sueltos
  cada('[data-dato]', function (el) {
    var v = dato(el.getAttribute('data-dato'));
    if (typeof v !== 'string' || !v) return;
    // «Ruta 40 · Espacio Quinta Devoto · Marcos Paz»: cada tramo queda entero en su renglón
    var partes = v.split(' · ');
    el.textContent = '';
    partes.forEach(function (p, i) {
      if (i) el.appendChild(document.createTextNode(' · '));
      if (partes.length < 2) { el.appendChild(document.createTextNode(p)); return; }
      var s = document.createElement('span'); s.className = 'nw'; s.textContent = p; el.appendChild(s);
    });
  });

  // Horarios
  if (S.horarios && S.horarios.length) {
    cada('[data-horarios]', function (dl) {
      dl.innerHTML = S.horarios.map(function (h) {
        var cerrado = /cerrado/i.test(h.horas || '');
        return '<dt>' + esc(h.dias) + '</dt><dd' + (cerrado ? ' class="cerrado"' : '') + '>' + esc(h.horas) + '</dd>';
      }).join('');
    });
  }

  // Aviso (con fecha de vencimiento opcional, en hora de Argentina)
  var av = S.aviso || {};
  var vigente = av.mostrar && av.texto;
  if (vigente && av.hasta) {
    var hoy = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // UTC−3
    if (hoy > av.hasta) vigente = false;
  }
  if (vigente) {
    var icono = av.tipo === 'alerta'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2zm0 6.5c.6 0 1 .4 1 1V14a1 1 0 1 1-2 0V9.5c0-.6.4-1 1-1zm0 9.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM13.2 17h-2.4v-6.2h2.4V17z"/></svg>';
    cada('[data-aviso]', function (el) {
      el.className = 'aviso' + (av.tipo === 'alerta' ? ' alerta' : '');
      el.innerHTML = '<div class="in">' + icono + '<p>' + esc(av.texto) +
        (av.enlace ? ' <a href="' + esc(av.enlace) + '">' + esc(av.textoEnlace || 'Más información') + '</a>' : '') +
        '</p></div>';
      el.hidden = false;
      el.setAttribute('role', 'status');
    });
  }
})();
